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
    if (!(await verifyAdminPasswordServer(data.password))) {
      throw new Response("Unauthorized", { status: 401 });
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const results: CheckResult[] = [];

    // Origin for route checks
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const origin = new URL(req.url).origin;

    // Routes
    await Promise.all(
      ROUTES.map(async (path) => {
        try {
          const { value: res, ms } = await timed(() =>
            fetch(origin + path, { method: "GET", redirect: "manual" }),
          );
          const ok = res.status >= 200 && res.status < 400;
          results.push({
            name: path,
            category: "Route",
            status: ok ? "ok" : "fail",
            detail: `HTTP ${res.status}`,
            ms,
          });
        } catch (e) {
          results.push({
            name: path,
            category: "Route",
            status: "fail",
            detail: e instanceof Error ? e.message : "fetch failed",
            ms: 0,
          });
        }
      }),
    );

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