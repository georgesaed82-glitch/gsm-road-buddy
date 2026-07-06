import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Activity } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { runDiagnostics, type CheckResult } from "@/lib/diagnostics.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/diagnostics")({
  component: DiagnosticsPage,
});

function StatusIcon({ status }: { status: CheckResult["status"] }) {
  if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (status === "warn") return <AlertTriangle className="h-4 w-4 text-amber-600" />;
  return <XCircle className="h-4 w-4 text-red-600" />;
}

function DiagnosticsPage() {
  const run = useServerFn(runDiagnostics);
  const mut = useMutation({
    mutationFn: async () => {
if (!password) throw new Error("Admin session not unlocked");
      return run({ data: {} });
    },
  });

  useEffect(() => {
    mut.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = mut.data?.results ?? [];
  const grouped = results.reduce<Record<string, CheckResult[]>>((acc, r) => {
    (acc[r.category] ||= []).push(r);
    return acc;
  }, {});
  const totals = results.reduce(
    (a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }),
    {} as Record<string, number>,
  );

  return (
    <AdminShell eyebrow="System" title="Diagnostics">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {mut.data
            ? `Last run ${new Date(mut.data.ranAt).toLocaleTimeString()} · ${mut.data.origin}`
            : "Verifies key routes, database tables, storage, and auth."}
        </div>
        <button
          onClick={() => mut.mutate()}
          disabled={mut.isPending}
          className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", mut.isPending && "animate-spin")} />
          {mut.isPending ? "Running…" : "Run again"}
        </button>
      </div>

      {mut.error && (
        <div className="mb-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {(mut.error as Error).message}
        </div>
      )}

      {mut.data?.error && (
        <div className="mb-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {mut.data.error}
        </div>
      )}

      {results.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <SummaryCard label="Passing" value={totals.ok || 0} tone="ok" />
          <SummaryCard label="Warnings" value={totals.warn || 0} tone="warn" />
          <SummaryCard label="Failing" value={totals.fail || 0} tone="fail" />
        </div>
      )}

      {mut.isPending && results.length === 0 && (
        <div className="flex items-center gap-2 border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 animate-pulse" /> Running checks…
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([cat, rows]) => (
          <section key={cat} className="border border-border bg-card">
            <header className="border-b border-border px-4 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {cat}
            </header>
            <ul className="divide-y divide-border">
              {rows.map((r) => (
                <li key={cat + r.name} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <StatusIcon status={r.status} />
                    <span className="truncate font-mono text-xs">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="truncate">{r.detail}</span>
                    <span className="tabular-nums">{r.ms}ms</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </AdminShell>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "ok" | "warn" | "fail" }) {
  const toneClass =
    tone === "ok"
      ? "text-emerald-700"
      : tone === "warn"
        ? "text-amber-700"
        : "text-red-700";
  return (
    <div className="border border-border bg-card px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-2xl font-medium tabular-nums", toneClass)}>{value}</div>
    </div>
  );
}