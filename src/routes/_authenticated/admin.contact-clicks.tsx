import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/contact-clicks")({
  component: ContactClicksPage,
});

type Click = {
  id: string;
  package: string | null;
  channel: "whatsapp" | "email" | "phone" | "portal_view";
  page: string | null;
  created_at: string;
};

function ContactClicksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["contact_clicks"],
    queryFn: async (): Promise<Click[]> => {
      const { data, error } = await supabase
        .from("contact_clicks")
        .select("id,package,channel,page,created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Click[];
    },
  });

  const rows = data ?? [];
  const portalViews = rows.filter((r) => r.channel === "portal_view");
  const contactRows = rows.filter((r) => r.channel !== "portal_view");
  const summary = new Map<string, { whatsapp: number; email: number; phone: number }>();
  for (const r of rows) {
    if (r.channel === "portal_view") continue;
    const key = r.package ?? "(unknown)";
    const s = summary.get(key) ?? { whatsapp: 0, email: 0, phone: 0 };
    if (r.channel === "whatsapp" || r.channel === "email" || r.channel === "phone") {
      s[r.channel] += 1;
    }
    summary.set(key, s);
  }
  const summaryRows = Array.from(summary.entries())
    .map(([pkg, s]) => ({ pkg, ...s, total: s.whatsapp + s.email + s.phone }))
    .sort((a, b) => b.total - a.total);

  const uniquePortalDays = new Set(
    portalViews.map((r) => new Date(r.created_at).toDateString()),
  ).size;

  return (
    <AdminShell eyebrow="Insights" title="Contact clicks">
      <p className="mb-6 text-sm text-muted-foreground">
        Every time a visitor taps WhatsApp, Email or Call on a package — or opens the Learner portal page — it's logged here. Showing the latest 500.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-display text-lg">Learner portal interest</h2>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <div className="text-2xl font-display">{portalViews.length}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Total views</div>
              </div>
              <div>
                <div className="text-2xl font-display">{uniquePortalDays}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Days with views</div>
              </div>
              <div>
                <div className="text-2xl font-display">
                  {portalViews[0]
                    ? formatDistanceToNow(new Date(portalViews[0].created_at), { addSuffix: true })
                    : "—"}
                </div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Last view</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-display text-lg">By package</h2>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : summaryRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No clicks yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2">Package</th>
                  <th className="py-2">WhatsApp</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Call</th>
                  <th className="py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((r) => (
                  <tr key={r.pkg} className="border-t border-border">
                    <td className="py-2">{r.pkg}</td>
                    <td className="py-2">{r.whatsapp}</td>
                    <td className="py-2">{r.email}</td>
                    <td className="py-2">{r.phone}</td>
                    <td className="py-2 font-semibold">{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg">Recent activity</h2>
        </CardHeader>
        <CardContent>
          {rows.length === 0 && !isLoading ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {rows.slice(0, 50).map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <span className="font-medium">
                      {r.channel === "portal_view"
                        ? "Learner portal viewed"
                        : r.package ?? "(unknown)"}
                    </span>
                    <span className="ml-2 rounded bg-secondary px-2 py-0.5 text-xs uppercase tracking-wider">
                      {r.channel}
                    </span>
                    {r.page && <span className="ml-2 text-xs text-muted-foreground">{r.page}</span>}
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
    </AdminShell>
  );
}