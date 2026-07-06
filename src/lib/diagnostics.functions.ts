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
  .inputValidator((d: Record<string, never>) => d)
  .handler(async ({ data }) => {
    const results: CheckResult[] = [];
    try {
      if (!(await verifyAdminPasswordServer())) {
        return { results: [], ranAt: new Date().toISOString(), origin: "", error: "Unauthorized" };
      }
    } catch (e) {
      return {
        results: [],
        ranAt: new Date().toISOString(),
        origin: "",
        error: e instanceof Error ? e.message : "password verify failed",
      };
    }

    let supabaseAdmin: typeof import("@/integrations/supabase/client.server")["supabaseAdmin"];
    try {
      ({ supabaseAdmin } = await import("@/integrations/supabase/client.server"));
    } catch (e) {
      return {
        results,
        ranAt: new Date().toISOString(),
        origin: "",
        error: e instanceof Error ? e.message : "admin client unavailable",
      };
    }

    // Origin (for display only; we no longer self-fetch — Cloudflare Workers
    // returning 500 on same-zone subrequest fan-out was the real "fetch failed").
    let origin = "";
    try {
      const { getRequestOrigin } = await import("./auth-guard.server");
      origin = getRequestOrigin();
    } catch {
      /* noop */
    }

    // Routes: verify each path is registered in the generated route tree
    // instead of self-fetching. This is deterministic, avoids subrequest
    // loops, and catches the actual failure mode (a missing/renamed route).
    try {
      const { getRouter } = await import("@/router");
      const router = getRouter() as unknown as {
        routesByPath?: Record<string, { fullPath?: string; path?: string; id?: string }>;
        routesById?: Record<string, { fullPath?: string; path?: string; id?: string }>;
      };
      const registered = new Set<string>();
      const collect = (rec?: Record<string, { fullPath?: string; path?: string; id?: string }>) => {
        if (!rec) return;
        for (const key of Object.keys(rec)) registered.add(key);
        for (const r of Object.values(rec)) {
          if (r.fullPath) registered.add(r.fullPath);
          if (r.path) registered.add(r.path);
          if (r.id) registered.add(r.id);
        }
      };
      collect(router.routesByPath);
      collect(router.routesById);
      // Normalise: treat "/" and "" equivalently; strip trailing slashes.
      const has = (p: string) => {
        if (registered.has(p)) return true;
        const noSlash = p.replace(/\/$/, "");
        return registered.has(noSlash) || registered.has(noSlash + "/");
      };
      for (const path of ROUTES) {
        const ok = has(path);
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

    return { results, ranAt: new Date().toISOString(), origin };
  });