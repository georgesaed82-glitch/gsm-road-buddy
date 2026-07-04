import { createServerFn } from "@tanstack/react-start";
import { verifyAdminPasswordServer } from "./portal-access.functions";

export type CheckResult = {
  name: string;
  category: "Route" | "Database" | "Storage" | "Auth";
  status: "ok" | "warn" | "fail";
  detail: string;
  ms: number;
};

const ROUTES = [
  "/",
  "/about",
  "/services",
  "/pricing",
  "/contact",
  "/reviews",
  "/instructors",
  "/auth",
  "/dashboard",
  "/theory",
  "/hazard-perception",
  "/lessons",
  "/payments",
  "/admin",
  "/sitemap.xml",
];

const TABLES = [
  "profiles",
  "payments",
  "lesson_bookings",
  "theory_progress",
  "contact_clicks",
  "page_views",
  "user_roles",
  "portal_access_codes",
];

async function timed<T>(fn: () => Promise<T>): Promise<{ value: T; ms: number }> {
  const start = Date.now();
  const value = await fn();
  return { value, ms: Date.now() - start };
}

export const runDiagnostics = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    if (data.password === "__probe__") {
      return { results: [] as CheckResult[], ranAt: new Date().toISOString(), origin: "probe" };
    }
    if (!(await verifyAdminPasswordServer(data.password))) {
      throw new Response("Unauthorized", { status: 401 });
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const results: CheckResult[] = [];

    // Origin (for display only; we no longer self-fetch — Cloudflare Workers
    // returning 500 on same-zone subrequest fan-out was the real "fetch failed").
    let origin = "";
    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      origin = new URL(getRequest().url).origin;
    } catch {
      /* noop */
    }

    // Routes: verify each path is registered in the generated route tree
    // instead of self-fetching. This is deterministic, avoids subrequest
    // loops, and catches the actual failure mode (a missing/renamed route).
    try {
      const { routeTree } = await import("@/routeTree.gen");
      const registered = new Set<string>();
      const walk = (node: unknown) => {
        const n = node as { path?: string; fullPath?: string; children?: Record<string, unknown> | unknown[] };
        if (n?.fullPath) registered.add(n.fullPath);
        if (n?.path) registered.add(n.path);
        const kids = n?.children;
        if (Array.isArray(kids)) kids.forEach(walk);
        else if (kids && typeof kids === "object") Object.values(kids).forEach(walk);
      };
      walk(routeTree as unknown);
      for (const path of ROUTES) {
        const ok = registered.has(path);
        results.push({
          name: path,
          category: "Route",
          status: ok ? "ok" : "fail",
          detail: ok ? "registered" : "not found in route tree",
          ms: 0,
        });
      }
    } catch (e) {
      for (const path of ROUTES) {
        results.push({
          name: path,
          category: "Route",
          status: "fail",
          detail: e instanceof Error ? e.message : "route tree unavailable",
          ms: 0,
        });
      }
    }

    // Tables
    for (const table of TABLES) {
      try {
        const client = supabaseAdmin as unknown as {
          from: (t: string) => {
            select: (
              cols: string,
              opts: { count: "exact"; head: true },
            ) => Promise<{ count: number | null; error: { message: string } | null }>;
          };
        };
        const { value, ms } = await timed(() =>
          client.from(table).select("*", { count: "exact", head: true }),
        );
        if (value.error) {
          results.push({
            name: table,
            category: "Database",
            status: "fail",
            detail: value.error.message,
            ms,
          });
        } else {
          results.push({
            name: table,
            category: "Database",
            status: "ok",
            detail: `${value.count ?? 0} rows`,
            ms,
          });
        }
      } catch (e) {
        results.push({
          name: table,
          category: "Database",
          status: "fail",
          detail: e instanceof Error ? e.message : "query failed",
          ms: 0,
        });
      }
    }

    // Storage bucket
    try {
      const { value, ms } = await timed(() => supabaseAdmin.storage.listBuckets());
      const buckets = value.data ?? [];
      const hazard = buckets.find((b) => b.name === "hazard-clips");
      results.push({
        name: "hazard-clips bucket",
        category: "Storage",
        status: hazard ? "ok" : "warn",
        detail: hazard ? "available" : "missing",
        ms,
      });
    } catch (e) {
      results.push({
        name: "hazard-clips bucket",
        category: "Storage",
        status: "fail",
        detail: e instanceof Error ? e.message : "storage error",
        ms: 0,
      });
    }

    // Auth admin reachable
    try {
      const { value, ms } = await timed(() =>
        supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 }),
      );
      if (value.error) {
        results.push({
          name: "auth.admin.listUsers",
          category: "Auth",
          status: "fail",
          detail: value.error.message,
          ms,
        });
      } else {
        results.push({
          name: "auth.admin.listUsers",
          category: "Auth",
          status: "ok",
          detail: `reachable`,
          ms,
        });
      }
    } catch (e) {
      results.push({
        name: "auth.admin.listUsers",
        category: "Auth",
        status: "fail",
        detail: e instanceof Error ? e.message : "auth error",
        ms: 0,
      });
    }

    // Round-trip through JSON to strip anything non-serializable that leaked
    // in from third-party SDK responses (Seroval otherwise fails step 3).
    const safe = JSON.parse(JSON.stringify(results)) as CheckResult[];
    return { results: safe, ranAt: new Date().toISOString(), origin };
  });