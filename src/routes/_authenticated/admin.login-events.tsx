import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/AdminShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { listLoginEvents } from "@/lib/rbac.functions";

export const Route = createFileRoute("/_authenticated/admin/login-events")({
  component: LoginEventsPage,
});

function LoginEventsPage() {
  const fn = useServerFn(listLoginEvents);
  const { data, isLoading } = useQuery({
    queryKey: ["login-events"],
    queryFn: () => fn({ data: { limit: 300 } }),
  });
  return (
    <AdminShell eyebrow="Security" title="Login history">
      <Card>
        <CardHeader>
          <h2 className="font-display text-lg">Administrator sign-in events</h2>
          <p className="text-xs text-muted-foreground">
            Every successful and failed admin sign-in, with IP address and device.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !data || data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No login events yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-3">When</th>
                    <th className="py-2 pr-3">Event</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">IP</th>
                    <th className="py-2 pr-3">Device</th>
                    <th className="py-2 pr-3">MFA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 pr-3 align-top text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString("en-GB")}
                      </td>
                      <td className="py-2 pr-3 align-top font-medium">{r.event}</td>
                      <td className="py-2 pr-3 align-top text-xs">{r.email ?? "—"}</td>
                      <td className="py-2 pr-3 align-top text-xs text-muted-foreground">
                        {r.ip ?? "—"}
                      </td>
                      <td className="py-2 pr-3 align-top text-[11px] text-muted-foreground max-w-[280px] truncate">
                        {r.user_agent ?? "—"}
                      </td>
                      <td className="py-2 pr-3 align-top text-xs">
                        {r.mfa_used ? "Yes" : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}