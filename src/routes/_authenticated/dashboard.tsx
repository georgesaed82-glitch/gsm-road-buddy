import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Award, ArrowUpRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Overview · GSM Learner Portal" }] }),
  component: DashboardPage,
});

function formatGBP(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}

function DashboardPage() {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    },
  });

  const { data: upcoming } = useQuery({
    queryKey: ["upcoming-lessons"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_bookings")
        .select("*")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(3);
      return data ?? [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["portal-stats"],
    queryFn: async () => {
      const [completed, payments, theory] = await Promise.all([
        supabase.from("lesson_bookings").select("id", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("payments").select("hours_purchased,amount_pence,status"),
        supabase.from("theory_progress").select("questions_answered,questions_correct"),
      ]);
      const paid = (payments.data ?? []).filter((p) => p.status === "paid");
      const hoursPurchased = paid.reduce((s, p) => s + Number(p.hours_purchased ?? 0), 0);
      const spent = paid.reduce((s, p) => s + (p.amount_pence ?? 0), 0);
      const theoryRows = theory.data ?? [];
      const answered = theoryRows.reduce((s, t) => s + t.questions_answered, 0);
      const correct = theoryRows.reduce((s, t) => s + t.questions_correct, 0);
      return {
        completed: completed.count ?? 0,
        hoursPurchased,
        spent,
        theoryAnswered: answered,
        theoryAccuracy: answered ? Math.round((correct / answered) * 100) : 0,
      };
    },
  });

  const greeting = profile?.full_name?.split(" ")[0] ?? "there";
  const hoursRemaining = Math.max(0, (stats?.hoursPurchased ?? 0) - (stats?.completed ?? 0));

  return (
    <PortalShell eyebrow="Welcome back" title={`Hello, ${greeting}.`}>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lessons completed" value={String(stats?.completed ?? 0)} icon={CheckCircle2} />
        <StatCard label="Hours remaining" value={hoursRemaining.toFixed(1)} icon={Clock} accent />
        <StatCard label="Theory accuracy" value={`${stats?.theoryAccuracy ?? 0}%`} icon={Award} />
        <StatCard label="Total paid" value={formatGBP(stats?.spent ?? 0)} icon={Calendar} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-display text-xl">Upcoming lessons</h2>
            <Link to="/lessons" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-accent">
              All lessons <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </header>
          {upcoming && upcoming.length > 0 ? (
            <ul className="divide-y divide-border">
              {upcoming.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <div className="font-medium text-foreground">{b.instructor_name} · {b.duration_minutes} min</div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      {new Date(b.scheduled_at).toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}
                    </div>
                    {b.pickup_location && (
                      <div className="mt-0.5 text-xs text-muted-foreground">Pickup · {b.pickup_location}</div>
                    )}
                  </div>
                  <Button variant="outline" size="sm">Reschedule</Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">No upcoming lessons booked.</p>
              <Button asChild className="mt-4" size="sm">
                <a href="tel:+447961585231">Call to book — 07961 585231</a>
              </Button>
            </div>
          )}
        </section>

        <section className="border border-border bg-card">
          <header className="border-b border-border px-6 py-4">
            <h2 className="font-display text-xl">Keep moving</h2>
          </header>
          <ul className="divide-y divide-border">
            <QuickAction to="/theory" label="Revise theory" detail="14 categories · ~840 questions" />
            <QuickAction to="/hazard-perception" label="Hazard perception" detail="Practice on real West London clips" />
            <QuickAction to="/payments" label="View receipts" detail="Download invoices and check balance" />
            <QuickAction to="/lessons" label="Lesson history" detail="Instructor notes & skills mastered" />
          </ul>
        </section>
      </div>
    </PortalShell>
  );
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; accent?: boolean }) {
  return (
    <div className={`border border-border p-5 ${accent ? "bg-accent text-accent-foreground" : "bg-card"}`}>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] uppercase tracking-[0.18em] ${accent ? "opacity-80" : "text-muted-foreground"}`}>{label}</span>
        <Icon className={`h-4 w-4 ${accent ? "opacity-80" : "text-muted-foreground"}`} />
      </div>
      <div className="mt-4 font-display text-3xl">{value}</div>
    </div>
  );
}

function QuickAction({ to, label, detail }: { to: string; label: string; detail: string }) {
  return (
    <li>
      <Link to={to} className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-secondary">
        <div>
          <div className="font-medium text-foreground">{label}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{detail}</div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </li>
  );
}
