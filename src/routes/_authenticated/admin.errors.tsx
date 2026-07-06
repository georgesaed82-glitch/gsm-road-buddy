import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { AdminShell } from "@/components/AdminShell";
import { listErrorLogs, getErrorStats, clearResolvedErrors, type ErrorLogRow } from "@/lib/error-logs.functions";
import { AlertTriangle, Trash2, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/errors")({
  component: AdminErrorsPage,
});

function AdminErrorsPage() {
  const fetchLogs = useServerFn(listErrorLogs);
  const fetchStats = useServerFn(getErrorStats);
  const clearOld = useServerFn(clearResolvedErrors);
  const qc = useQueryClient();
  const [days, setDays] = useState<1 | 7 | 30>(7);

  const logs = useQuery({
    queryKey: ["admin", "error-logs", days],
    queryFn: () => fetchLogs({ data: { days, limit: 300 } }),
    refetchInterval: 30_000,
  });
  const stats = useQuery({
    queryKey: ["admin", "error-stats", days],
    queryFn: () => fetchStats({ data: { days } }),
    refetchInterval: 30_000,
  });

  const clearMut = useMutation({
    mutationFn: (olderThanDays: number) =>
      clearOld({ data: { olderThanDays } }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin", "error-logs"] }),
        qc.invalidateQueries({ queryKey: ["admin", "error-stats"] }),
      ]);
      await Promise.all([logs.refetch(), stats.refetch()]);
      setActiveFp(null);
    },
  });

  const handleClear = (olderThanDays: number, confirmMessage?: string) => {
    if (clearMut.isPending) return;
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    clearMut.mutate(olderThanDays);
  };

  const [activeFp, setActiveFp] = useState<string | null>(null);
  const grouped = stats.data?.grouped ?? [];
  const filteredLogs = useMemo(() => {
    const rows = logs.data?.rows ?? [];
    if (!activeFp) return rows;
    return rows.filter((r) => (r.fingerprint ?? r.message) === activeFp);
  }, [logs.data, activeFp]);

  return (
    <AdminShell title="Errors & monitoring" eyebrow="Live production issues">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {[1, 7, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d as 1 | 7 | 30)}
                className={`rounded-md border px-3 py-1.5 text-sm ${days === d ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-secondary"}`}
              >
                {d === 1 ? "24 hours" : `${d} days`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logs.refetch();
                stats.refetch();
              }}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-secondary"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <ClearButton
              onClick={() => handleClear(30)}
              disabled={clearMut.isPending}
              label="Clear > 30d"
            />
            <ClearButton
              onClick={() => handleClear(7)}
              disabled={clearMut.isPending}
              label="Clear > 7d"
            />
            <ClearButton
              onClick={() => handleClear(1)}
              disabled={clearMut.isPending}
              label="Clear > 24h"
            />
            <ClearButton
              onClick={() =>
                handleClear(0, "Are you sure you want to clear all error logs?")
              }
              disabled={clearMut.isPending}
              label="Clear all"
              emphatic
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total events" value={stats.data?.total ?? 0} />
          <StatCard label="Unique errors" value={stats.data?.unique ?? 0} />
          <StatCard label="Alerting email" value="gsmdrivingschool@outlook.com" small />
        </div>

        <section className="border border-border bg-card">
          <header className="border-b border-border px-4 py-3">
            <h2 className="font-display text-lg text-foreground">Top errors</h2>
            <p className="text-xs text-muted-foreground">Click a row to filter the log below.</p>
          </header>
          {grouped.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              <AlertTriangle className="mx-auto mb-2 h-5 w-5 text-emerald-600" />
              No errors captured — nice and quiet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">Message</th>
                  <th className="px-4 py-2 text-left">Route</th>
                  <th className="px-4 py-2 text-right">Count</th>
                  <th className="px-4 py-2 text-right">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map((g) => {
                  const active = activeFp === g.fingerprint;
                  return (
                    <tr
                      key={g.fingerprint}
                      className={`cursor-pointer border-t border-border ${active ? "bg-primary/10" : "hover:bg-secondary/50"}`}
                      onClick={() => setActiveFp(active ? null : g.fingerprint)}
                    >
                      <td className="px-4 py-2 font-mono text-xs">{g.message.slice(0, 90)}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{g.route ?? "—"}</td>
                      <td className="px-4 py-2 text-right font-semibold">{g.count}</td>
                      <td className="px-4 py-2 text-right text-xs text-muted-foreground">{formatDistanceToNow(new Date(g.last), { addSuffix: true })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <section className="border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="font-display text-lg text-foreground">Recent events</h2>
              <p className="text-xs text-muted-foreground">{activeFp ? "Filtered by selected error" : "All errors, newest first"}</p>
            </div>
            {activeFp && (
              <button onClick={() => setActiveFp(null)} className="text-xs text-muted-foreground underline">
                Clear filter
              </button>
            )}
          </header>
          <div className="max-h-[600px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No events in range.</div>
            ) : (
              <ul className="divide-y divide-border">
                {filteredLogs.map((row) => (
                  <ErrorRow key={row.id} row={row} />
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, small }: { label: string; value: string | number; small?: boolean }) {
  return (
    <div className="border border-border bg-card px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className={small ? "mt-1 text-sm text-foreground" : "mt-1 font-display text-2xl text-foreground"}>{value}</div>
    </div>
  );
}

function ClearButton({
  onClick,
  disabled,
  label,
  emphatic,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  emphatic?: boolean;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm disabled:opacity-50";
  const style = emphatic
    ? "border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20"
    : "border-destructive/40 bg-background text-destructive hover:bg-destructive/10";
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${style}`}>
      <Trash2 className="h-4 w-4" /> {label}
    </button>
  );
}

function ErrorRow({ row }: { row: ErrorLogRow }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="px-4 py-3">
      <button onClick={() => setOpen((v) => !v)} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate font-mono text-xs text-foreground">{row.message}</div>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <span>{formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}</span>
              {row.route && <span>· {row.route}</span>}
              {row.mechanism && <span>· {row.mechanism}</span>}
              {row.user_email && <span>· {row.user_email}</span>}
            </div>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase ${row.level === "error" ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground"}`}>{row.level}</span>
        </div>
      </button>
      {open && (
        <div className="mt-3 space-y-2 text-xs">
          {row.stack && (
            <pre className="max-h-64 overflow-auto bg-secondary/50 p-3 font-mono text-[11px] leading-relaxed">{row.stack}</pre>
          )}
          {row.user_agent && <div className="text-muted-foreground">UA: {row.user_agent}</div>}
          {row.url && <div className="break-all text-muted-foreground">URL: {row.url}</div>}
        </div>
      )}
    </li>
  );
}