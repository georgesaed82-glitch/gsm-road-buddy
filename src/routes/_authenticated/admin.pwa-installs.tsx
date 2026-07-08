import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPwaEvents, type PwaFunnel } from "@/lib/admin-stats.functions";
import { AdminShell } from "@/components/AdminShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/pwa-installs")({
  component: PwaInstallsPage,
});

const EVENT_LABEL: Record<string, string> = {
  prompt_available: "Prompt available",
  prompt_shown: "Prompt shown",
  prompt_accepted: "Prompt accepted",
  prompt_dismissed: "Prompt dismissed",
  installed: "Installed",
  displayed_standalone: "Opened as app",
};

const FUNNEL_ORDER = [
  "prompt_available",
  "prompt_shown",
  "prompt_accepted",
  "installed",
  "displayed_standalone",
] as const;

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function PwaInstallsPage() {
  const fetchEvents = useServerFn(getPwaEvents);
  const { data, isLoading } = useQuery({
    queryKey: ["pwa_events"],
    queryFn: async (): Promise<PwaFunnel> => (await fetchEvents({ data: {} })) as PwaFunnel,
    retry: false,
  });

  const totals = data?.totals ?? {};
  const unique = data?.uniqueSessions ?? {};
  const rows = data?.rows ?? [];
  const byPlatform = data?.byPlatform ?? {};
  const top = unique["prompt_available"] ?? 0;

  return (
    <AdminShell eyebrow="Insights" title="PWA installs">
      <p className="mb-6 text-sm text-muted-foreground">
        Tracks the install-app funnel: browser offers the prompt → student is shown it →
        accepts/dismisses → final install. Counts are unique sessions.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Install conversion"
          value={isLoading ? "…" : pct(data?.promptToInstallRate ?? 0)}
          sub="installs ÷ eligible"
        />
        <StatCard
          label="Total installs"
          value={isLoading ? "…" : String(unique["installed"] ?? 0)}
          sub="unique sessions"
        />
        <StatCard
          label="Eligible visitors"
          value={isLoading ? "…" : String(top)}
          sub="prompt available"
        />
        <StatCard
          label="App launches"
          value={isLoading ? "…" : String(unique["displayed_standalone"] ?? 0)}
          sub="opened standalone"
        />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-display text-lg">Funnel</h2>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-3">
              {FUNNEL_ORDER.map((ev) => {
                const count = unique[ev] ?? 0;
                const width = top > 0 ? Math.max(4, (count / top) * 100) : 4;
                return (
                  <div key={ev}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{EVENT_LABEL[ev]}</span>
                      <span className="font-medium">
                        {count}
                        {top > 0 && ev !== "prompt_available" && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {pct(count / top)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-display text-lg">By platform</h2>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : Object.keys(byPlatform).length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2">Platform</th>
                  <th className="py-2">Eligible</th>
                  <th className="py-2">Accepted</th>
                  <th className="py-2">Installed</th>
                  <th className="py-2">Opened</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byPlatform).map(([plat, counts]) => (
                  <tr key={plat} className="border-t border-border">
                    <td className="py-2 capitalize">{plat}</td>
                    <td className="py-2">{counts["prompt_available"] ?? 0}</td>
                    <td className="py-2">{counts["prompt_accepted"] ?? 0}</td>
                    <td className="py-2 font-semibold">{counts["installed"] ?? 0}</td>
                    <td className="py-2">{counts["displayed_standalone"] ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg">Recent events</h2>
        </CardHeader>
        <CardContent>
          {rows.length === 0 && !isLoading ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {rows.slice(0, 50).map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <span className="font-medium">{EVENT_LABEL[r.event] ?? r.event}</span>
                    {r.platform && (
                      <span className="ml-2 rounded bg-secondary px-2 py-0.5 text-xs uppercase tracking-wider">
                        {r.platform}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">
        Note: iOS Safari doesn't fire a browser install prompt, so iPhone installs only show as
        "Opened as app" once a student adds the site to their Home Screen.
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
