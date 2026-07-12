import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, RefreshCw, Mail, Search } from "lucide-react";
import {
  listEmailLogs,
  getEmailLogStats,
  listEmailHistoryForMessage,
  type EmailLogRow,
} from "@/lib/email-logs.functions";

export const Route = createFileRoute("/_authenticated/admin/email-logs")({
  component: AdminEmailLogs,
});

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
  { value: "dlq", label: "Dead-lettered" },
  { value: "pending", label: "Pending" },
  { value: "suppressed", label: "Suppressed" },
];

function AdminEmailLogs() {
  const listFn = useServerFn(listEmailLogs);
  const statsFn = useServerFn(getEmailLogStats);
  const historyFn = useServerFn(listEmailHistoryForMessage);

  const [days, setDays] = useState(14);
  const [status, setStatus] = useState("all");
  const [recipient, setRecipient] = useState("");
  const [recipientInput, setRecipientInput] = useState("");
  const [selected, setSelected] = useState<EmailLogRow | null>(null);

  const statsQ = useQuery({
    queryKey: ["email-log-stats", days],
    queryFn: () => statsFn({ data: { days } }),
  });

  const listQ = useQuery({
    queryKey: ["email-logs", days, status, recipient],
    queryFn: () =>
      listFn({
        data: {
          days,
          status: status === "all" ? null : status,
          recipient: recipient || null,
          limit: 200,
        },
      }),
  });

  const historyQ = useQuery({
    queryKey: ["email-log-history", selected?.message_id],
    queryFn: () => historyFn({ data: { message_id: selected?.message_id ?? "" } }),
    enabled: !!selected?.message_id,
  });

  const rows = listQ.data?.rows ?? [];
  const stats = statsQ.data;

  const totals = useMemo(() => {
    const c = stats?.counts ?? {};
    return {
      total: stats?.total ?? 0,
      sent: c.sent ?? 0,
      failed: (c.failed ?? 0) + (c.dlq ?? 0),
      suppressed: c.suppressed ?? 0,
    };
  }, [stats]);

  const applyRecipient = () => setRecipient(recipientInput.trim());

  return (
    <AdminShell eyebrow="Admin" title="Email logs">
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total (unique)" value={totals.total} />
          <StatCard label="Sent" value={totals.sent} tone="success" />
          <StatCard label="Failed / DLQ" value={totals.failed} tone="danger" />
          <StatCard label="Suppressed" value={totals.suppressed} tone="warn" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Range</div>
                <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 24h</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground">Status</div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[220px] flex-1">
                <div className="text-xs uppercase text-muted-foreground">Recipient contains</div>
                <div className="flex gap-2">
                  <Input
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyRecipient()}
                    placeholder="e.g. helenaanfp@gmail.com"
                  />
                  <Button variant="secondary" onClick={applyRecipient}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  listQ.refetch();
                  statsQ.refetch();
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {listQ.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No email events in this range.</p>
            ) : (
              <div className="divide-y divide-border">
                {rows.map((row) => (
                  <button
                    key={row.id}
                    onClick={() => setSelected(row)}
                    className="flex w-full flex-col gap-1 py-3 text-left transition hover:bg-accent/5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <StatusBadge status={row.status} />
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate font-medium">{row.recipient_email}</span>
                        {row.suppression && (
                          <Badge variant="destructive" className="ml-1">
                            Suppressed: {row.suppression.reason}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {row.template_name} · {new Date(row.created_at).toLocaleString()}
                        {row.provider_message_id && (
                          <>
                            {" · "}
                            <span className="font-mono">
                              Provider ID: {row.provider_message_id}
                            </span>
                          </>
                        )}
                      </div>
                      {row.error_message && (
                        <div className="mt-1 flex items-start gap-1 text-xs text-destructive">
                          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                          <span className="break-words">{row.error_message}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {row.provider_status ?? "—"}
                      {row.provider_http_status ? ` (HTTP ${row.provider_http_status})` : ""}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email delivery details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <DetailRow label="Recipient" value={selected.recipient_email} />
              <DetailRow label="Template" value={selected.template_name} />
              <DetailRow label="App message ID" value={selected.message_id ?? "—"} mono />
              <DetailRow
                label="Provider message ID"
                value={selected.provider_message_id ?? "—"}
                mono
              />
              <DetailRow
                label="Workflow ID"
                value={selected.provider_workflow_id ?? "—"}
                mono
              />
              <DetailRow
                label="Provider status"
                value={
                  (selected.provider_status ?? "—") +
                  (selected.provider_http_status
                    ? ` (HTTP ${selected.provider_http_status})`
                    : "")
                }
              />
              <DetailRow label="Final status" value={selected.status} />
              <DetailRow
                label="Created"
                value={new Date(selected.created_at).toLocaleString()}
              />
              {selected.error_message && (
                <DetailRow label="Error" value={selected.error_message} tone="danger" />
              )}
              {selected.suppression && (
                <DetailRow
                  label="Suppression"
                  tone="danger"
                  value={`${selected.suppression.reason}${
                    selected.suppression.provider_event
                      ? " · " + selected.suppression.provider_event
                      : ""
                  } · ${new Date(selected.suppression.created_at).toLocaleString()}`}
                />
              )}
              {selected.provider_response && (
                <div>
                  <div className="mb-1 text-xs uppercase text-muted-foreground">
                    Provider response
                  </div>
                  <pre className="max-h-64 overflow-auto rounded bg-muted p-3 text-xs">
                    {selected.provider_response}
                  </pre>
                </div>
              )}
              {historyQ.data && historyQ.data.rows.length > 1 && (
                <div>
                  <div className="mb-1 text-xs uppercase text-muted-foreground">
                    History for this message
                  </div>
                  <div className="divide-y divide-border rounded border">
                    {historyQ.data.rows.map((h) => (
                      <div key={h.id} className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={h.status} />
                          <span className="text-xs text-muted-foreground">
                            {new Date(h.created_at).toLocaleString()}
                          </span>
                        </div>
                        {h.error_message && (
                          <span className="ml-3 truncate text-xs text-destructive">
                            {h.error_message}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "danger" | "warn";
}) {
  const color =
    tone === "success"
      ? "text-emerald-600"
      : tone === "danger"
        ? "text-destructive"
        : tone === "warn"
          ? "text-amber-600"
          : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase text-muted-foreground">{label}</div>
        <div className={`mt-1 text-2xl font-semibold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function DetailRow({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "danger";
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div
        className={`${mono ? "font-mono text-xs" : "text-sm"} ${
          tone === "danger" ? "text-destructive" : ""
        } break-words`}
      >
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant: "default" | "secondary" | "destructive" | "outline" =
    status === "sent"
      ? "default"
      : status === "failed" || status === "dlq"
        ? "destructive"
        : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}