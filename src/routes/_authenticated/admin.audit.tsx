import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/AdminShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { listAuditLog } from "@/lib/rbac.functions";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  component: AuditPage,
});

function AuditPage() {
  const fn = useServerFn(listAuditLog);
  const { data, isLoading } = useQuery({
    queryKey: ["audit-log"],
    queryFn: () => fn({ data: { limit: 300 } }),
  });
  return (
    <AdminShell eyebrow="Security" title="Audit log">
      <Card>
        <CardHeader>
          <h2 className="font-display text-lg">Recent administrator actions</h2>
          <p className="text-xs text-muted-foreground">
            Every change to admin accounts, roles, and permissions is recorded here.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !data || data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-3">When</th>
                    <th className="py-2 pr-3">Action</th>
                    <th className="py-2 pr-3">Entity</th>
                    <th className="py-2 pr-3">IP</th>
                    <th className="py-2 pr-3">Before → After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 pr-3 align-top text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString("en-GB")}
                      </td>
                      <td className="py-2 pr-3 align-top font-medium">{r.action}</td>
                      <td className="py-2 pr-3 align-top text-xs">
                        {r.entity_table ?? "—"}
                        {r.entity_id ? (
                          <span className="block text-[10px] text-muted-foreground">
                            {r.entity_id.slice(0, 8)}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3 align-top text-xs text-muted-foreground">
                        {r.ip ?? "—"}
                      </td>
                      <td className="py-2 pr-3 align-top text-[11px] text-muted-foreground">
                        {r.before_data || r.after_data ? (
                          <pre className="whitespace-pre-wrap break-all">
                            {JSON.stringify(
                              { before: r.before_data, after: r.after_data },
                              null,
                              1,
                            )}
                          </pre>
                        ) : (
                          "—"
                        )}
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