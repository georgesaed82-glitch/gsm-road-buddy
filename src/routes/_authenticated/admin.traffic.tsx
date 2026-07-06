import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTrafficStats, getSectionBreakdown, type TrafficStats, type SectionBreakdown } from "@/lib/admin-stats.functions";
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
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const fetchStats = useServerFn(getTrafficStats);
  const { data, isLoading } = useQuery({
    queryKey: ["admin_traffic", rangeDays],
    queryFn: async (): Promise<TrafficStats> =>
      (await fetchStats({ data: { rangeDays } })) as TrafficStats,
    retry: false,
  });
  const fetchSection = useServerFn(getSectionBreakdown);
  const { data: section, isLoading: sectionLoading } = useQuery({
    queryKey: ["admin_traffic_section", rangeDays, selectedPath],
    enabled: !!selectedPath,
    queryFn: async (): Promise<SectionBreakdown> =>
      (await fetchSection({ data: { rangeDays, path: selectedPath! } })) as SectionBreakdown,
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
                  <tr
                    key={p.path}
                    onClick={() => setSelectedPath(p.path)}
                    className={cn(
                      "cursor-pointer border-t border-border transition-colors hover:bg-secondary/40",
                      selectedPath === p.path && "bg-secondary/60",
                    )}
                  >
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
          <p className="mt-3 text-xs text-muted-foreground">Tip: click a section to see its platform and device breakdown for the selected range.</p>
        </CardContent>
      </Card>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg">Where visitors came from</h2>
          </CardHeader>
          <CardContent>
            {(data?.bySource ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {(data?.bySource ?? []).map((s) => {
                  const pct = total ? Math.round((s.views / total) * 100) : 0;
                  return (
                    <li key={s.source} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-muted-foreground">{s.source}</span>
                      <div className="h-2 flex-1 rounded-full bg-secondary">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-20 text-right tabular-nums">{s.views} ({pct}%)</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted-foreground">"Direct" = typed URL, home-screen app, or hidden referrer. "Internal" = navigated between pages on this site.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg">Top referring sites</h2>
          </CardHeader>
          <CardContent>
            {(data?.topReferrers ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No external referrers recorded yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-2">Referrer</th>
                    <th className="py-2">Source</th>
                    <th className="py-2 text-right">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.topReferrers ?? []).map((r) => (
                    <tr key={r.referrer} className="border-t border-border">
                      <td className="py-2 font-medium">{r.referrer}</td>
                      <td className="py-2 text-muted-foreground">{r.source}</td>
                      <td className="py-2 text-right tabular-nums">{r.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedPath && <SectionDrilldown path={selectedPath} label={labelForPath(selectedPath)} rangeDays={rangeDays} data={section} loading={sectionLoading} onClose={() => setSelectedPath(null)} />}

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

function SectionDrilldown({
  path,
  label,
  rangeDays,
  data,
  loading,
  onClose,
}: {
  path: string;
  label: string;
  rangeDays: number;
  data: SectionBreakdown | undefined;
  loading: boolean;
  onClose: () => void;
}) {
  const total = data?.totalViews ?? 0;
  const bySurface = data?.bySurface ?? { app: 0, browser: 0, unknown: 0 };
  const byDevice = data?.byDevice ?? { ios: 0, android: 0, mobile: 0, desktop: 0, unknown: 0 };
  const appPct = total ? Math.round((bySurface.app / total) * 100) : 0;
  const browserPct = total ? Math.round((bySurface.browser / total) * 100) : 0;
  const seriesMax = Math.max(1, ...(data?.series ?? []).map((s) => s.total));

  return (
    <Card className="mb-8 border-primary/40">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Section drilldown · last {rangeDays === 1 ? "24h" : `${rangeDays} days`}</div>
          <h2 className="font-display text-lg">{label}</h2>
          <div className="text-xs text-muted-foreground">{path}</div>
        </div>
        <button onClick={onClose} className="text-sm text-muted-foreground underline hover:text-foreground">Close</button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : total === 0 ? (
          <p className="text-sm text-muted-foreground">No visits recorded for this section in the selected range.</p>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Views" value={String(total)} />
              <StatCard label="Sessions" value={String(data?.uniqueSessions ?? 0)} />
              <StatCard label="From app" value={String(bySurface.app)} sub={`${appPct}%`} />
              <StatCard label="From browser" value={String(bySurface.browser)} sub={`${browserPct}%`} />
            </div>

            <div className="mb-6">
              <div className="mb-2 flex h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-3 bg-primary" style={{ width: `${appPct}%` }} />
                <div className="h-3 bg-accent" style={{ width: `${browserPct}%` }} />
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-primary" />App {bySurface.app} ({appPct}%)</span>
                <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-accent" />Browser {bySurface.browser} ({browserPct}%)</span>
                {bySurface.unknown > 0 && <span>Unknown {bySurface.unknown}</span>}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold">By device</h3>
                <ul className="space-y-2 text-sm">
                  {[
                    ["iPhone / iPad", byDevice.ios],
                    ["Android", byDevice.android],
                    ["Other mobile", byDevice.mobile],
                    ["Desktop", byDevice.desktop],
                    ["Unknown", byDevice.unknown],
                  ].map(([lbl, count]) => {
                    const c = count as number;
                    const pct = total ? Math.round((c / total) * 100) : 0;
                    return (
                      <li key={lbl as string} className="flex items-center gap-3">
                        <span className="w-32 shrink-0 text-muted-foreground">{lbl}</span>
                        <div className="h-2 flex-1 rounded-full bg-secondary">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-16 text-right tabular-nums">{c}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold">By platform</h3>
                {(data?.byPlatform ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data.</p>
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
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold">Entry sources</h3>
                {(data?.bySource ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {(data?.bySource ?? []).map((s) => {
                      const pct = total ? Math.round((s.views / total) * 100) : 0;
                      return (
                        <li key={s.source} className="flex items-center gap-3">
                          <span className="w-28 shrink-0 text-muted-foreground">{s.source}</span>
                          <div className="h-2 flex-1 rounded-full bg-secondary">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-20 text-right tabular-nums">{s.views} ({pct}%)</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Top referrers</h3>
                {(data?.topReferrers ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No external referrers for this section.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="py-2">Referrer</th>
                        <th className="py-2">Source</th>
                        <th className="py-2 text-right">Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.topReferrers ?? []).map((r) => (
                        <tr key={r.referrer} className="border-t border-border">
                          <td className="py-2 font-medium">{r.referrer}</td>
                          <td className="py-2 text-muted-foreground">{r.source}</td>
                          <td className="py-2 text-right tabular-nums">{r.views}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {(data?.series ?? []).length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold">Views over time</h3>
                <div className="flex items-end gap-1 overflow-x-auto pb-2">
                  {(data?.series ?? []).map((s) => {
                    const appH = (s.app / seriesMax) * 100;
                    const browserH = (s.browser / seriesMax) * 100;
                    return (
                      <div key={s.date} className="flex min-w-[28px] flex-col items-center gap-1">
                        <div className="flex h-[100px] w-6 flex-col-reverse overflow-hidden rounded bg-secondary">
                          <div className="w-full bg-primary" style={{ height: `${appH}px` }} title={`App: ${s.app}`} />
                          <div className="w-full bg-accent" style={{ height: `${browserH}px` }} title={`Browser: ${s.browser}`} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{s.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}