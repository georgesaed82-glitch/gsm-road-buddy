import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getAdminOverview } from "@/lib/admin-stats.functions";
import { getAdminPassword } from "@/lib/admin-gate";
import { AdminShell } from "@/components/AdminShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  BarChart3,
  Users,
  Eye,
  CreditCard,
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  LogIn,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

type RangeDays = 7 | 30 | 90;
const RANGE_OPTIONS: { value: RangeDays; label: string }[] = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

function AdminOverview() {
  const navigate = useNavigate();
  const [range, setRange] = useState<RangeDays>(30);
  const fetchOverview = useServerFn(getAdminOverview);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview-stats", range],
    queryFn: () => fetchOverview({ data: { password: getAdminPassword(), rangeDays: range } }),
    refetchInterval: 60_000,
    retry: false,
  });

  useEffect(() => {
    const status = (error as any)?.status ?? (error as any)?.response?.status;
    if (status === 401) {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("admin_unlocked");
        window.sessionStorage.removeItem("admin_password");
      }
      navigate({ to: "/auth", search: { admin: 1 } });
    }
  }, [error, navigate]);

  const fmt = (n: number | undefined) => (n === undefined ? "—" : n.toLocaleString());
  const rangeLabel = `${range} days`;
  const prevLabel = `prev ${range}d`;

  return (
    <AdminShell eyebrow="Admin" title="Overview">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Compare range</span>
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

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Website traffic
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Eye} label="Total page views" value={fmt(data?.pageViewsTotal)} loading={isLoading} />
          <StatCard
            icon={TrendingUp}
            label={`Views (last ${rangeLabel})`}
            value={fmt(data?.pageViewsCurrent)}
            delta={delta(data?.pageViewsCurrent, data?.pageViewsPrevious)}
            deltaSuffix={prevLabel}
            loading={isLoading}
          />
          <StatCard
            icon={LogIn}
            label={`Portal logins (${rangeLabel})`}
            value={fmt(data?.portalLoginsCurrent)}
            delta={delta(data?.portalLoginsCurrent, data?.portalLoginsPrevious)}
            deltaSuffix={prevLabel}
            loading={isLoading}
          />
          <StatCard icon={LogIn} label="Portal logins (all time)" value={fmt(data?.portalLogins)} loading={isLoading} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Payments
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={CreditCard} label="Total payment records" value={fmt(data?.payments)} loading={isLoading} />
          <StatCard icon={CreditCard} label="Paid (all time)" value={fmt(data?.paidPayments)} loading={isLoading} />
          <StatCard
            icon={CreditCard}
            label={`Paid (${rangeLabel})`}
            value={fmt(data?.paidPaymentsCurrent)}
            loading={isLoading}
          />
          <StatCard
            icon={CreditCard}
            label={`Revenue (${rangeLabel})`}
            value={data ? `£${data.paidPoundsCurrent.toFixed(2)}` : "—"}
            loading={isLoading}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Revenue all time: {data ? `£${data.paidPounds.toFixed(2)}` : "—"}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Driving lessons
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={CalendarCheck} label="Bookings (all time)" value={fmt(data?.bookingsTotal)} loading={isLoading} />
          <StatCard
            icon={CalendarCheck}
            label={`New bookings (${rangeLabel})`}
            value={fmt(data?.bookingsCurrent)}
            delta={delta(data?.bookingsCurrent, data?.bookingsPrevious)}
            deltaSuffix={prevLabel}
            loading={isLoading}
          />
          <StatCard icon={CalendarCheck} label="Upcoming" value={fmt(data?.bookingsUpcoming)} loading={isLoading} />
          <StatCard icon={GraduationCap} label="Completed" value={fmt(data?.bookingsCompleted)} loading={isLoading} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Theory progress
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Active learners" value={fmt(data?.theoryLearners)} loading={isLoading} />
          <StatCard icon={GraduationCap} label="Questions answered" value={fmt(data?.totalAnswered)} loading={isLoading} />
          <StatCard
            icon={TrendingUp}
            label="Average accuracy"
            value={data ? `${data.theoryAccuracy}%` : "—"}
            loading={isLoading}
          />
          <StatCard icon={GraduationCap} label="Topics passed (≥86%)" value={fmt(data?.topicsPassed)} loading={isLoading} />
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-display text-lg">Top pages (recent)</h3>
            <p className="text-xs text-muted-foreground">From the last 500 page views</p>
          </CardHeader>
          <CardContent>
            {data?.topPathsSorted.length ? (
              <ul className="space-y-2 text-sm">
                {data.topPathsSorted.map(([path, count]) => (
                  <li key={path} className="flex items-center justify-between gap-3">
                    <span className="truncate text-muted-foreground">{path}</span>
                    <span className="font-medium tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No page views yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-display text-lg">Contact clicks (last {rangeLabel})</h3>
            <p className="text-xs text-muted-foreground">
              WhatsApp, email, phone & portal opens · {fmt(data?.contactClicksCurrentTotal)} this period
              {data && data.contactClicksPreviousTotal !== undefined && (
                <> · {fmt(data.contactClicksPreviousTotal)} prev {range}d</>
              )}
            </p>
          </CardHeader>
          <CardContent>
            {data && Object.keys(data.clicksByChannel).length ? (
              <ul className="space-y-2 text-sm">
                {Object.entries(data.clicksByChannel).map(([ch, n]) => (
                  <li key={ch} className="flex items-center justify-between gap-3">
                    <span className="capitalize text-muted-foreground">{ch.replace("_", " ")}</span>
                    <span className="font-medium tabular-nums">{n}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No clicks in the last {rangeLabel}.</p>
            )}
            <Link
              to="/admin/contact-clicks"
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
            >
              <BarChart3 className="h-4 w-4" /> Full click breakdown
            </Link>
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}

function delta(current?: number, previous?: number): { pct: number; direction: "up" | "down" | "flat" } | undefined {
  if (current === undefined || previous === undefined) return undefined;
  if (previous === 0) return current === 0 ? { pct: 0, direction: "flat" } : { pct: 100, direction: "up" };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { pct: Math.abs(pct), direction: pct > 0 ? "up" : pct < 0 ? "down" : "flat" };
}

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  delta,
  deltaSuffix,
}: {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  loading?: boolean;
  delta?: { pct: number; direction: "up" | "down" | "flat" };
  deltaSuffix?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
          <span>{label}</span>
          {Icon ? <Icon className="h-4 w-4" /> : null}
        </div>
        <div className="mt-2 font-display text-3xl">{loading ? "…" : value}</div>
        {delta && !loading && (
          <div
            className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
              delta.direction === "up"
                ? "text-success"
                : delta.direction === "down"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {delta.direction === "up" && <TrendingUp className="h-3 w-3" />}
            {delta.direction === "down" && <TrendingDown className="h-3 w-3" />}
            {delta.direction === "flat" ? "No change" : `${delta.pct}%`}
            {deltaSuffix && <span className="text-muted-foreground">vs {deltaSuffix}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}