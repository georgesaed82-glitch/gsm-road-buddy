import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTrafficStats, type TrafficStats } from "@/lib/admin-stats.functions";
import { getAdminPassword } from "@/lib/admin-gate";
import { AdminShell } from "@/components/AdminShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/traffic")({
  component: TrafficPage,
});

const RANGE_OPTIONS = [
  { days: 1, label: "24h" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
] as const;

const PATH_LABELS: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Learner dashboard",
  "/theory": "Theory portal",
  "/hazard-perception": "Hazard perception",
  "/road-signs": "Road signs",
  "/road-markings": "Road markings",
  "/police-signals": "Police signals",
  "/highway-code": "Highway code",
  "/signs": "Signs quiz",
  "/questions": "Question bank",
  "/review": "Review mistakes",
  "/contact": "Contact",
  "/reviews": "Reviews",
  "/auth": "Sign in",
};

function labelForPath(p: string) {
  return PATH_LABELS[p] ?? p;
}

function TrafficPage() {
  const [rangeDays, setRangeDays] = useState<number>(7);
  const fetchStats = useServerFn(getTrafficStats);
  const { data, isLoading } = useQuery({
    queryKey: ["admin_traffic", rangeDays],
    queryFn: async (): Promise<TrafficStats> =>
      (await fetchStats({ data: { password: getAdminPassword(), rangeDays } })) as TrafficStats,
    retry: false,
  });

  const bySurface = data?.bySurface ?? { app: 0, browser: 0, unknown: 0 };
  const byDevice = data?.byDevice ?? { ios: 0, android: 0, mobile: 0, desktop: 0, unknown: 0 };
  const total = data?.totalViews ?? 0;
  const appPct = total ? Math.round((bySurface.app / total) * 100) : 0;
  const browserPct = total ? Math.round((bySurface.browser / total) * 100) : 0;
  const seriesMax = Math.max(1, ...(data?.series ?? []).map((s) => s.total));

  return (
    <AdminShell eyebrow="Insights" title="Traffic & sections">
      <p className="mb-6 text-sm text-muted-foreground">
        Where visitors come from (app vs browser), what device they use, and which sections they look at most.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.days}
            onClick={() => setRangeDays(opt.days)}
            className={cn(
              "border border-border px-3 py-1.5 text-sm transition-colors",
              rangeDays === opt.days
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total views" value={isLoading ? "…" : String(total)} sub="all visits" />
        <StatCard label="Unique sessions" value={isLoading ? "…" : String(data?.uniqueSessions ?? 0)} sub="distinct devices" />
        <StatCard label="From app" value={isLoading ? "…" : `${bySurface.app}`} sub={`${appPct}% of views`} />
        <StatCard label="From browser" value={isLoading ? "…" : `${bySurface.browser}`} sub={`${browserPct}% of views`} />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-display text-lg">App vs browser</h2>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : total === 0 ? (
            <p className="text-sm text-muted-foreground">No visits yet in this range.</p>
          ) : (
            <>
              <div className="mb-2 flex h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-3 bg-primary" style={{ width: `${appPct}%` }} title={`App ${appPct}%`} />
                <div className="h-3 bg-accent" style={{ width: `${browserPct}%` }} title={`Browser ${browserPct}%`} />
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-primary" />App {bySurface.app} ({appPct}%)</span>
                <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-accent" />Browser {bySurface.browser} ({browserPct}%)</span>
                {bySurface.unknown > 0 && <span>Unknown {bySurface.unknown}</span>}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg">By device</h2>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {[
                ["iPhone / iPad", byDevice.ios],
                ["Android", byDevice.android],
                ["Other mobile", byDevice.mobile],
                ["Desktop", byDevice.desktop],
                ["Unknown", byDevice.unknown],
              ].map(([label, count]) => {
                const c = count as number;
                const pct = total ? Math.round((c / total) * 100) : 0;
                return (
                  <li key={label as string} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-muted-foreground">{label}</span>
                    <div className="h-2 flex-1 rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-16 text-right tabular-nums">{c}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg">By platform</h2>
          </CardHeader>
          <CardContent>
            {(data?.byPlatform ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-2">Platform</th>
                    <th className="py-2 text-right">Views</th>
                    <th className="py-2 text-right">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.byPlatform ?? []).slice(0, 8).map((p) => (
                    <tr key={p.platform} className="border-t border-border">
                      <td className="py-2 capitalize">{p.platform.replace(/-/g, " ")}</td>
                      <td className="py-2 text-right tabular-nums">{p.views}</td>
                      <td className="py-2 text-right tabular-nums">{p.sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-display text-lg">Most-viewed sections</h2>
        </CardHeader>
        <CardContent>
          {(data?.topPathsByPlatform ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No visits yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2">Section</th>
                  <th className="py-2 text-right">App</th>
                  <th className="py-2 text-right">Browser</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(data?.topPathsByPlatform ?? []).map((p) => (
                  <tr key={p.path} className="border-t border-border">
                    <td className="py-2">
                      <div className="font-medium">{labelForPath(p.path)}</div>
                      <div className="text-xs text-muted-foreground">{p.path}</div>
                    </td>
                    <td className="py-2 text-right tabular-nums">{p.app}</td>
                    <td className="py-2 text-right tabular-nums">{p.browser}</td>
                    <td className="py-2 text-right font-semibold tabular-nums">{p.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg">Views over time</h2>
        </CardHeader>
        <CardContent>
          {(data?.series ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="flex items-end gap-1 overflow-x-auto pb-2">
              {(data?.series ?? []).map((s) => {
                const appH = (s.app / seriesMax) * 120;
                const browserH = (s.browser / seriesMax) * 120;
                return (
                  <div key={s.date} className="flex min-w-[28px] flex-col items-center gap-1">
                    <div className="flex h-[120px] w-6 flex-col-reverse overflow-hidden rounded bg-secondary">
                      <div className="w-full bg-primary" style={{ height: `${appH}px` }} title={`App: ${s.app}`} />
                      <div className="w-full bg-accent" style={{ height: `${browserH}px` }} title={`Browser: ${s.browser}`} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{s.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-primary" />App</span>
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-accent" />Browser</span>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">
        "App" = opened from the installed home-screen app (standalone mode). "Browser" = opened in Safari/Chrome/etc. Older visits recorded before app tracking will show as browser.
      </p>
    </AdminShell>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-display">{value}</div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}