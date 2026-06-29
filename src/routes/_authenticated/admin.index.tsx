import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  LogIn,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function dayAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview-stats"],
    queryFn: async () => {
      const since7 = dayAgo(7);
      const since30 = dayAgo(30);

      const [
        profiles,
        pageViewsTotal,
        pageViews7,
        pageViews30,
        portalLogins,
        portalLogins7,
        payments,
        paidPayments,
        paidSum,
        bookingsTotal,
        bookingsUpcoming,
        bookingsCompleted,
        theoryRows,
        contactClicks7,
        recentPageViews,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("page_views").select("id", { count: "exact", head: true }),
        supabase
          .from("page_views")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since7),
        supabase
          .from("page_views")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since30),
        supabase
          .from("contact_clicks")
          .select("id", { count: "exact", head: true })
          .eq("channel", "portal_view"),
        supabase
          .from("contact_clicks")
          .select("id", { count: "exact", head: true })
          .eq("channel", "portal_view")
          .gte("created_at", since7),
        supabase.from("payments").select("id", { count: "exact", head: true }),
        supabase
          .from("payments")
          .select("id", { count: "exact", head: true })
          .eq("status", "paid"),
        supabase.from("payments").select("amount_pence,status"),
        supabase.from("lesson_bookings").select("id", { count: "exact", head: true }),
        supabase
          .from("lesson_bookings")
          .select("id", { count: "exact", head: true })
          .gte("scheduled_at", new Date().toISOString()),
        supabase
          .from("lesson_bookings")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed"),
        supabase
          .from("theory_progress")
          .select("questions_answered,questions_correct,best_score_pct,completed_at,user_id"),
        supabase
          .from("contact_clicks")
          .select("channel")
          .gte("created_at", since7),
        supabase
          .from("page_views")
          .select("path,created_at")
          .order("created_at", { ascending: false })
          .limit(500),
      ]);

      const paidPence = (paidSum.data ?? [])
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + (p.amount_pence ?? 0), 0);

      const theory = theoryRows.data ?? [];
      const totalAnswered = theory.reduce((s, r) => s + (r.questions_answered ?? 0), 0);
      const totalCorrect = theory.reduce((s, r) => s + (r.questions_correct ?? 0), 0);
      const topicsPassed = theory.filter((r) => (r.best_score_pct ?? 0) >= 86).length;
      const theoryLearners = new Set(theory.map((r) => r.user_id)).size;

      const clicksByChannel: Record<string, number> = {};
      for (const c of contactClicks7.data ?? []) {
        const ch = c.channel ?? "unknown";
        clicksByChannel[ch] = (clicksByChannel[ch] ?? 0) + 1;
      }

      const topPaths: Record<string, number> = {};
      for (const v of recentPageViews.data ?? []) {
        topPaths[v.path] = (topPaths[v.path] ?? 0) + 1;
      }
      const topPathsSorted = Object.entries(topPaths)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

      return {
        students: profiles.count ?? 0,
        pageViewsTotal: pageViewsTotal.count ?? 0,
        pageViews7: pageViews7.count ?? 0,
        pageViews30: pageViews30.count ?? 0,
        portalLogins: portalLogins.count ?? 0,
        portalLogins7: portalLogins7.count ?? 0,
        payments: payments.count ?? 0,
        paidPayments: paidPayments.count ?? 0,
        paidPounds: paidPence / 100,
        bookingsTotal: bookingsTotal.count ?? 0,
        bookingsUpcoming: bookingsUpcoming.count ?? 0,
        bookingsCompleted: bookingsCompleted.count ?? 0,
        totalAnswered,
        totalCorrect,
        theoryAccuracy: totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
        topicsPassed,
        theoryLearners,
        clicksByChannel,
        topPathsSorted,
      };
    },
    refetchInterval: 60_000,
  });

  const fmt = (n: number | undefined) => (n === undefined ? "—" : n.toLocaleString());

  return (
    <AdminShell eyebrow="Admin" title="Overview">
      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Website traffic
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Eye} label="Total page views" value={fmt(data?.pageViewsTotal)} loading={isLoading} />
          <StatCard icon={TrendingUp} label="Views (last 7 days)" value={fmt(data?.pageViews7)} loading={isLoading} />
          <StatCard icon={TrendingUp} label="Views (last 30 days)" value={fmt(data?.pageViews30)} loading={isLoading} />
          <StatCard icon={LogIn} label="Portal logins (7d / total)" value={`${fmt(data?.portalLogins7)} / ${fmt(data?.portalLogins)}`} loading={isLoading} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Payments
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={CreditCard} label="Total payment records" value={fmt(data?.payments)} loading={isLoading} />
          <StatCard icon={CreditCard} label="Paid" value={fmt(data?.paidPayments)} loading={isLoading} />
          <StatCard
            icon={CreditCard}
            label="Revenue collected"
            value={data ? `£${data.paidPounds.toFixed(2)}` : "—"}
            loading={isLoading}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Driving lessons
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={CalendarCheck} label="Bookings (all time)" value={fmt(data?.bookingsTotal)} loading={isLoading} />
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
            <h3 className="font-display text-lg">Contact clicks (last 7 days)</h3>
            <p className="text-xs text-muted-foreground">WhatsApp, email, phone & portal opens</p>
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
              <p className="text-sm text-muted-foreground">No clicks in the last 7 days.</p>
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

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
          <span>{label}</span>
          {Icon ? <Icon className="h-4 w-4" /> : null}
        </div>
        <div className="mt-2 font-display text-3xl">{loading ? "…" : value}</div>
      </CardContent>
    </Card>
  );
}