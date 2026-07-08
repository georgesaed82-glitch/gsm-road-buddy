import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  getAdminOverview,
  listAdminAlertSubscribers,
  subscribeAdminAlert,
  unsubscribeAdminAlert,
  exportAdminCsv,
  type AdminCsvDataset,
} from "@/lib/admin-stats.functions";
import { AdminShell } from "@/components/AdminShell";
import { theoryCategories } from "@/data/theory";
import { formatDistanceToNow } from "date-fns";
import {
  Users,
  CalendarCheck,
  BookOpen,
  Star,
  ShoppingBag,
  Headphones,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Calendar as CalIcon,
  CheckCircle2,
  PlayCircle,
  MessageSquare,
  BarChart3,
  PoundSterling,
  Film,
  ClipboardList,
  AlertTriangle,
  Bell,
  X,
  Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverviewPage,
});

type RangeDays = 7 | 30 | 90;
const RANGE_OPTIONS: { value: RangeDays; label: string }[] = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

const topicTitle = (slug: string) => {
  const t = theoryCategories.find((c) => c.slug === slug);
  if (t) return t.title;
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
};

function AdminOverviewPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState<RangeDays>(30);
  const fetchOverview = useServerFn(getAdminOverview);
  const fetchSubs = useServerFn(listAdminAlertSubscribers);
  const subscribe = useServerFn(subscribeAdminAlert);
  const unsubscribe = useServerFn(unsubscribeAdminAlert);
  const exportCsv = useServerFn(exportAdminCsv);
  const qc = useQueryClient();

  const [exporting, setExporting] = useState<AdminCsvDataset | null>(null);
  const downloadDataset = async (dataset: AdminCsvDataset) => {
    try {
      setExporting(dataset);
      const res = await exportCsv({ data: { dataset, rangeDays: range } });
      triggerCsvDownload(res.filename, res.csv);
    } catch (e) {
      console.error("CSV export failed", e);
    } finally {
      setExporting(null);
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview-stats", range],
    queryFn: () => fetchOverview({ data: { rangeDays: range } }),
    refetchInterval: 60_000,
    retry: false,
  });

  useEffect(() => {
    const status = (error as any)?.status ?? (error as any)?.response?.status;
    if (status === 401) {
      if (typeof window !== "undefined") {
      }
      navigate({ to: "/auth", search: { admin: 1 } });
    }
  }, [error, navigate]);

  const { data: subs } = useQuery({
    queryKey: ["admin-alert-subscribers"],
    queryFn: () => fetchSubs({ data: {} }),
    retry: false,
  });

  const alerts = useMemo(() => computeAlerts(data, !!error), [data, error]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));

  const [email, setEmail] = useState("");
  const [showSubs, setShowSubs] = useState(false);
  const subMut = useMutation({
    mutationFn: (e: string) => subscribe({ data: { email: e } }),
    onSuccess: () => {
      setEmail("");
      qc.invalidateQueries({ queryKey: ["admin-alert-subscribers"] });
    },
  });
  const unsubMut = useMutation({
    mutationFn: (id: string) => unsubscribe({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-alert-subscribers"] }),
  });

  const fmt = (n: number | undefined) => (n === undefined ? "—" : n.toLocaleString());
  const rangeLabel = useMemo(
    () => (range === 7 ? "This week" : range === 30 ? "This month" : "Last 90 days"),
    [range],
  );

  return (
    <AdminShell eyebrow="Admin" title="Welcome back, Admin 👋">
      <p className="-mt-3 mb-6 text-sm text-muted-foreground">
        Here's what's happening with GSM Driving School today.
      </p>

      {visibleAlerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {visibleAlerts.map((a) => (
            <div
              key={a.id}
              className={`flex items-start gap-3 border p-4 ${
                a.severity === "critical"
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-amber-400/50 bg-amber-50 text-amber-900"
              }`}
            >
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-current/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {a.severity === "critical" ? "Critical" : "Alert"}
                  </span>
                  <span className="font-display text-base">{a.title}</span>
                </div>
                <p className="mt-1 text-sm opacity-90">{a.detail}</p>
              </div>
              <button
                onClick={() => setDismissed((p) => new Set(p).add(a.id))}
                className="rounded p-1 hover:bg-black/5"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Email notifications */}
      <div className="mb-8 border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bell className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-base text-foreground">Alert notifications</div>
            <div className="text-xs text-muted-foreground">
              Get an email when enquiries spike or system status turns critical.
              {subs && subs.length > 0 && (
                <>
                  {" "}
                  <button onClick={() => setShowSubs((s) => !s)} className="underline">
                    {subs.length} subscribed
                  </button>
                </>
              )}
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) subMut.mutate(email.trim());
            }}
            className="flex w-full gap-2 sm:w-auto"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="min-w-0 flex-1 border border-border bg-background px-3 py-1.5 text-sm sm:w-64"
            />
            <button
              type="submit"
              disabled={subMut.isPending}
              className="bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
            >
              {subMut.isPending ? "…" : "Subscribe"}
            </button>
          </form>
        </div>
        {showSubs && subs && subs.length > 0 && (
          <ul className="mt-3 divide-y divide-border border-t border-border text-sm">
            {subs.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2">
                <span className="text-foreground">{s.email}</span>
                <button
                  onClick={() => unsubMut.mutate(s.id)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        {subMut.isSuccess && (
          <p className="mt-2 text-xs text-emerald-600">
            Subscribed — you'll be emailed when alerts fire.
          </p>
        )}
        {subMut.isError && (
          <p className="mt-2 text-xs text-destructive">
            Could not subscribe. Check the email and try again.
          </p>
        )}
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Compare</span>
        <div className="inline-flex overflow-hidden rounded-md border border-border">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                range === opt.value
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BigStat
          icon={Users}
          label="Total Learners"
          value={fmt(data?.students)}
          delta={delta(data?.studentsCurrent, data?.studentsPrevious)}
          loading={isLoading}
        />
        <BigStat
          icon={CalendarCheck}
          label="Lessons Booked"
          value={fmt(data?.bookingsTotal)}
          delta={delta(data?.bookingsCurrent, data?.bookingsPrevious)}
          loading={isLoading}
        />
        <BigStat
          icon={BookOpen}
          label="Active Theory Users"
          value={fmt(data?.theoryLearners)}
          delta={delta(data?.theoryLearnersCurrent, data?.theoryLearnersPrevious)}
          loading={isLoading}
        />
        <BigStat
          icon={Star}
          label="Google Reviews"
          value={fmt(data?.reviewsTotal)}
          delta={delta(data?.reviewsCurrent, data?.reviewsPrevious)}
          loading={isLoading}
        />
        <BigStat
          icon={ShoppingBag}
          label="Paid Packages"
          value={fmt(data?.paidPayments)}
          delta={delta(data?.paidPaymentsCurrent, undefined)}
          loading={isLoading}
        />
        <BigStat
          icon={Headphones}
          label="Enquiries"
          value={fmt(data?.contactClicksCurrentTotal)}
          delta={delta(data?.contactClicksCurrentTotal, data?.contactClicksPreviousTotal)}
          loading={isLoading}
        />
      </div>

      {/* Revenue + Traffic strip */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat
          icon={PoundSterling}
          label={`Revenue (${rangeLabel.toLowerCase()})`}
          value={data ? `£${data.paidPoundsCurrent.toFixed(2)}` : "—"}
          loading={isLoading}
        />
        <MiniStat
          icon={PoundSterling}
          label="Revenue (all time)"
          value={data ? `£${data.paidPounds.toFixed(2)}` : "—"}
          loading={isLoading}
        />
        <MiniStat
          icon={BarChart3}
          label="Page views"
          value={fmt(data?.pageViewsCurrent)}
          loading={isLoading}
        />
        <MiniStat
          icon={CalIcon}
          label="Upcoming lessons"
          value={fmt(data?.bookingsUpcoming)}
          loading={isLoading}
        />
      </div>

      {/* Trend charts */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Learner Registrations"
          total={data?.studentsCurrent ?? 0}
          delta={delta(data?.studentsCurrent, data?.studentsPrevious)}
          subtitle={rangeLabel}
          series={data?.registrationsSeries ?? []}
          onExport={() => downloadDataset("registrations")}
          exporting={exporting === "registrations"}
        />
        <ChartCard
          title="Theory Users Overview"
          total={data?.theoryLearnersCurrent ?? 0}
          delta={delta(data?.theoryLearnersCurrent, data?.theoryLearnersPrevious)}
          subtitle={rangeLabel}
          series={data?.theorySeries ?? []}
          onExport={() => downloadDataset("theory-users")}
          exporting={exporting === "theory-users"}
        />
      </section>

      {/* Recent activity */}
      <section className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="font-display text-lg">Recent Activity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => downloadDataset("recent-activity")}
                disabled={exporting === "recent-activity"}
                className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" />{" "}
                {exporting === "recent-activity" ? "Exporting…" : "CSV"}
              </button>
              <Link
                to="/admin/contact-clicks"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
          </div>
          <ul className="divide-y divide-border">
            {(data?.recentActivity ?? []).map((a, i) => (
              <li key={i} className="flex items-center gap-3 px-5 py-3">
                <ActivityIcon type={a.type} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{a.label}</div>
                  <div className="truncate text-xs capitalize text-muted-foreground">{a.sub}</div>
                </div>
                <div className="shrink-0 text-xs text-muted-foreground">
                  {a.at ? formatDistanceToNow(new Date(a.at), { addSuffix: true }) : ""}
                </div>
              </li>
            ))}
            {!isLoading && (data?.recentActivity ?? []).length === 0 && (
              <li className="px-5 py-6 text-sm text-muted-foreground">No activity yet.</li>
            )}
          </ul>
        </div>

        {/* System overview */}
        <div className="lg:col-span-2 border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-display text-lg">System Overview</h3>
          </div>
          <ul className="divide-y divide-border text-sm">
            <StatusRow label="Website Status" status="Online" />
            <StatusRow label="Payments" status="All Good" />
            <StatusRow label="Email Notifications" status="Active" />
            <StatusRow label="Server Status" status="Healthy" />
            <StatusRow label="Hazard Videos" status="Live" />
          </ul>
        </div>
      </section>

      {/* Mock test performance */}
      <section className="mt-8 border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-display text-lg">Mock Test Performance</h3>
          <p className="text-xs text-muted-foreground">
            Average correct answers by topic — lowest first, so you can spot where learners
            struggle.
          </p>
        </div>
        <div className="space-y-4 px-5 py-5">
          {(data?.topicPerformance ?? []).slice(0, 8).map((t) => (
            <div key={t.slug}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-foreground">{topicTitle(t.slug)}</span>
                <span
                  className={`font-display text-base ${
                    t.accuracy < 60
                      ? "text-destructive"
                      : t.accuracy < 80
                        ? "text-amber-600"
                        : "text-emerald-600"
                  }`}
                >
                  {t.accuracy}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${
                    t.accuracy < 60
                      ? "bg-destructive"
                      : t.accuracy < 80
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.max(2, Math.min(100, t.accuracy))}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t.answers.toLocaleString()} answers
              </div>
            </div>
          ))}
          {!isLoading && (data?.topicPerformance ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">
              No mock test data yet — performance will appear here as learners complete quizzes.
            </p>
          )}
        </div>
      </section>

      {/* Quick actions */}
      <section className="mt-8 border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-display text-lg">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
          <QuickAction icon={Film} label="Hazard videos" to="/admin/hazard-videos" />
          <QuickAction icon={BarChart3} label="Contact clicks" to="/admin/contact-clicks" />
          <QuickAction icon={MessageSquare} label="Email settings" to="/admin/email" />
          <QuickAction icon={Users} label="Admin accounts" to="/admin/admins" />
          <QuickAction icon={ClipboardList} label="GSM Plus" to="/dashboard" />
          <QuickAction icon={Star} label="Reviews page" to="/reviews" />
        </div>
      </section>
    </AdminShell>
  );
}

/* ---------------- helpers ---------------- */

function delta(
  current?: number,
  previous?: number,
): { pct: number; direction: "up" | "down" | "flat" } | undefined {
  if (current === undefined || previous === undefined) return undefined;
  if (previous === 0)
    return current === 0 ? { pct: 0, direction: "flat" } : { pct: 100, direction: "up" };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { pct: Math.abs(pct), direction: pct > 0 ? "up" : pct < 0 ? "down" : "flat" };
}

type AdminAlert = { id: string; severity: "warning" | "critical"; title: string; detail: string };

function triggerCsvDownload(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function computeAlerts(data: any, hasError: boolean): AdminAlert[] {
  const out: AdminAlert[] = [];
  if (hasError) {
    out.push({
      id: "system-fetch",
      severity: "critical",
      title: "Backend unreachable",
      detail: "Live admin stats failed to load. Check the database and server function logs.",
    });
  }
  if (data) {
    const cur = data.contactClicksCurrentTotal ?? 0;
    const prev = data.contactClicksPreviousTotal ?? 0;
    if (cur >= 5 && cur >= prev * 2 && prev >= 0) {
      const mult = prev === 0 ? cur : Math.round((cur / prev) * 10) / 10;
      out.push({
        id: "enquiry-spike",
        severity: "warning",
        title: "Enquiry spike detected",
        detail: `${cur} enquiries this period vs ${prev} previously (${prev === 0 ? "new activity" : `${mult}× higher`}). Make sure WhatsApp and email are being answered quickly.`,
      });
    }
    if ((data.pageViewsCurrent ?? 0) === 0 && (data.pageViewsTotal ?? 0) > 0) {
      out.push({
        id: "no-traffic",
        severity: "critical",
        title: "No page views in this range",
        detail:
          "Tracking may be broken or the site is offline. Verify gsmdrivingschool.com is loading.",
      });
    }
    if ((data.bookingsUpcoming ?? 0) === 0 && (data.bookingsTotal ?? 0) > 0) {
      out.push({
        id: "no-upcoming",
        severity: "warning",
        title: "No upcoming lessons scheduled",
        detail: "The calendar is empty going forward — consider reaching out to recent enquiries.",
      });
    }
  }
  return out;
}

function BigStat({
  icon: Icon,
  label,
  value,
  delta,
  loading,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: { pct: number; direction: "up" | "down" | "flat" };
  loading?: boolean;
}) {
  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 font-display text-3xl font-medium leading-none text-foreground">
            {loading ? "…" : value}
          </div>
        </div>
      </div>
      {delta && !loading && (
        <div
          className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${
            delta.direction === "up"
              ? "text-emerald-600"
              : delta.direction === "down"
                ? "text-destructive"
                : "text-muted-foreground"
          }`}
        >
          {delta.direction === "up" && <TrendingUp className="h-3 w-3" />}
          {delta.direction === "down" && <TrendingDown className="h-3 w-3" />}
          {delta.direction === "flat" ? "No change" : `${delta.pct}%`}
          <span className="text-muted-foreground">from last period</span>
        </div>
      )}
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="font-display text-xl text-foreground">{loading ? "…" : value}</div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  total,
  delta,
  series,
  onExport,
  exporting,
}: {
  title: string;
  subtitle: string;
  total: number;
  delta?: { pct: number; direction: "up" | "down" | "flat" };
  series: { date: string; count: number }[];
  onExport?: () => void;
  exporting?: boolean;
}) {
  const fmtDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };
  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg">{title}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="font-display text-2xl text-foreground">{total.toLocaleString()}</span>
            {delta && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                  delta.direction === "up"
                    ? "text-emerald-600"
                    : delta.direction === "down"
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              >
                {delta.direction === "up" && <TrendingUp className="h-3 w-3" />}
                {delta.direction === "down" && <TrendingDown className="h-3 w-3" />}
                {delta.direction === "flat" ? "—" : `${delta.pct}%`}
              </span>
            )}
          </div>
        </div>
        <span className="rounded-md border border-border px-2 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
          {subtitle}
        </span>
      </div>
      {onExport && (
        <button
          onClick={onExport}
          disabled={!series.length || exporting}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          <Download className="h-3 w-3" /> {exporting ? "Exporting…" : "Export CSV"}
        </button>
      )}
      <div className="mt-4 h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis hide />
            <RTooltip
              contentStyle={{ fontSize: 12, borderRadius: 0 }}
              labelFormatter={(v: string) => fmtDate(v)}
              formatter={(value: number) => [value, "Count"]}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill={`url(#grad-${title})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Hover any point to see that day's count.</p>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, LucideIcon> = {
    learner: UserPlus,
    booking: CalIcon,
    mock: CheckCircle2,
    review: Star,
    click: MessageSquare,
    hazard: PlayCircle,
  };
  const Icon = map[type] || UserPlus;
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Icon className="h-4 w-4" />
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: string }) {
  return (
    <li className="flex items-center justify-between px-5 py-4">
      <span className="text-foreground">{label}</span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        {status}
      </span>
    </li>
  );
}

function QuickAction({ icon: Icon, label, to }: { icon: LucideIcon; label: string; to: string }) {
  return (
    <Link
      to={to}
      className="group flex flex-col items-center justify-center gap-2 rounded-md bg-foreground px-3 py-5 text-center text-background transition-transform hover:-translate-y-0.5"
    >
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
