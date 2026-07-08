import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar,
  Clock,
  Award,
  ArrowUpRight,
  CheckCircle2,
  CloudCheck,
  CloudOff,
  Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Overview · GSM Plus" }] }),
  component: DashboardPage,
});

function formatGBP(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}

const skillMilestones = [
  { key: "cockpit", name: "Cockpit drill & controls" },
  { key: "move_stop", name: "Moving off & stopping" },
  { key: "junctions", name: "Junctions (left & right)" },
  { key: "roundabouts", name: "Roundabouts" },
  { key: "bay_park", name: "Bay parking" },
  { key: "parallel", name: "Parallel parking" },
  { key: "pull_right", name: "Pull up on the right" },
  { key: "forward_bay", name: "Forward bay park" },
  { key: "independent", name: "Independent driving" },
  { key: "mock_test", name: "Mock test routes" },
];

const LOCAL_RATINGS_KEY = "gsm.skillRatings.v1";

function loadLocalRatings(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_RATINGS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function saveLocalRating(key: string, rating: number) {
  if (typeof window === "undefined") return;
  try {
    const obj = loadLocalRatings();
    obj[key] = rating;
    window.localStorage.setItem(LOCAL_RATINGS_KEY, JSON.stringify(obj));
  } catch {
    /* ignore */
  }
}

function DashboardPage() {
  const { data: sessionInfo } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return { email: data.user?.email ?? null, id: data.user?.id ?? null, signedIn: !!data.user };
    },
    staleTime: 30_000,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
        supabase
          .from("lesson_bookings")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed"),
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

  const firstName = profile?.full_name?.split(" ")[0];
  const title = firstName ? `Welcome back, ${firstName}` : "Welcome back";
  const hoursRemaining = Math.max(0, (stats?.hoursPurchased ?? 0) - (stats?.completed ?? 0));

  return (
    <PortalShell eyebrow="GSM Plus" title={title} showCopyright>
      <p className="-mt-4 mb-6 max-w-full text-xs text-muted-foreground sm:text-sm">
        {sessionInfo?.email ? (
          <>
            Signed in with PIN as{" "}
            <span className="break-words font-medium text-foreground">{sessionInfo.email}</span>
          </>
        ) : (
          "You're using a shared access code — sign in with your PIN to save progress to your account."
        )}
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Lessons completed"
          value={String(stats?.completed ?? 0)}
          icon={CheckCircle2}
        />
        <StatCard label="Hours remaining" value={hoursRemaining.toFixed(1)} icon={Clock} accent />
        <StatCard label="Theory accuracy" value={`${stats?.theoryAccuracy ?? 0}%`} icon={Award} />
        <StatCard label="Total paid" value={formatGBP(stats?.spent ?? 0)} icon={Calendar} />
      </div>

      <MarkProgressSection signedIn={!!sessionInfo?.signedIn} userId={sessionInfo?.id ?? null} />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-display text-xl">Upcoming lessons</h2>
            <Link
              to="/lessons"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-accent"
            >
              All lessons <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </header>
          {upcoming && upcoming.length > 0 ? (
            <ul className="divide-y divide-border">
              {upcoming.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <div className="font-medium text-foreground">
                      {b.instructor_name} · {b.duration_minutes} min
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      {new Date(b.scheduled_at).toLocaleString("en-GB", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </div>
                    {b.pickup_location && (
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Pickup · {b.pickup_location}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Reschedule
                  </Button>
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
            <QuickAction
              to="/theory"
              label="Revise theory"
              detail="14 categories · ~840 questions"
            />
            <QuickAction
              to="/hazard-perception"
              label="Hazard perception"
              detail="Practice on real West London clips"
            />
            <QuickAction
              to="/payments"
              label="View receipts"
              detail="Download invoices and check balance"
            />
            <QuickAction
              to="/lessons"
              label="Lesson history"
              detail="Instructor notes & skills mastered"
            />
          </ul>
        </section>
      </div>
    </PortalShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <div
      className={`border border-border p-5 ${accent ? "bg-accent text-accent-foreground" : "bg-card"}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] uppercase tracking-[0.18em] ${accent ? "opacity-80" : "text-muted-foreground"}`}
        >
          {label}
        </span>
        <Icon className={`h-4 w-4 ${accent ? "opacity-80" : "text-muted-foreground"}`} />
      </div>
      <div className="mt-4 font-display text-3xl">{value}</div>
    </div>
  );
}

function QuickAction({ to, label, detail }: { to: string; label: string; detail: string }) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-secondary"
      >
        <div>
          <div className="font-medium text-foreground">{label}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{detail}</div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </li>
  );
}

function MarkProgressSection({ signedIn, userId }: { signedIn: boolean; userId: string | null }) {
  const qc = useQueryClient();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
      debounceTimers.current.forEach((t) => clearTimeout(t));
    },
    [],
  );

  type Rating = { skill_key: string; rating: number };
  const { data: ratings = [] } = useQuery({
    queryKey: ["skill-ratings"],
    queryFn: async () => {
      const local = loadLocalRatings();
      const localList: Rating[] = Object.entries(local).map(([k, v]) => ({
        skill_key: k,
        rating: Number(v) || 0,
      }));
      if (!userId) return localList;
      const { data } = await supabase.from("skill_ratings").select("skill_key, rating");
      const map = new Map(localList.map((r) => [r.skill_key, r.rating]));
      for (const r of (data ?? []) as Rating[]) map.set(r.skill_key, r.rating);
      return Array.from(map, ([skill_key, rating]) => ({ skill_key, rating }));
    },
    staleTime: 30_000,
  });

  const ratingMap = new Map(ratings.map((r) => [r.skill_key, r.rating]));
  const totalRating = skillMilestones.reduce((n, m) => n + (ratingMap.get(m.key) ?? 0), 0);
  const mastered = skillMilestones.filter((m) => (ratingMap.get(m.key) ?? 0) >= 10).length;
  const overallPct = Math.round((totalRating / (skillMilestones.length * 10)) * 100);

  const setRating = (key: string, next: number) => {
    const clean = Math.max(0, Math.min(10, Math.round(next)));
    const prev = ratingMap.get(key) ?? 0;
    if (clean === prev) return;

    qc.setQueryData<Rating[]>(["skill-ratings"], (old = []) => {
      const idx = old.findIndex((r) => r.skill_key === key);
      if (idx === -1) return [...old, { skill_key: key, rating: clean }];
      const copy = old.slice();
      copy[idx] = { skill_key: key, rating: clean };
      return copy;
    });

    const existing = debounceTimers.current.get(key);
    if (existing) clearTimeout(existing);
    setSaveState("saving");
    const t = setTimeout(async () => {
      debounceTimers.current.delete(key);
      try {
        saveLocalRating(key, clean);
        if (userId) {
          const { error } = await supabase
            .from("skill_ratings")
            .upsert(
              { user_id: userId, skill_key: key, rating: clean },
              { onConflict: "user_id,skill_key" },
            );
          if (error) throw error;
        }
        if (clean === 10 && prev !== 10) toast.success("Mastered! 🎉");
        setSaveState("saved");
        if (savedTimer.current) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSaveState("idle"), 1500);
        qc.invalidateQueries({ queryKey: ["skill-rating-history"] });
      } catch (e: any) {
        qc.setQueryData<Rating[]>(["skill-ratings"], (old = []) => {
          const idx = old.findIndex((r) => r.skill_key === key);
          if (idx === -1) return old;
          const copy = old.slice();
          copy[idx] = { skill_key: key, rating: prev };
          return copy;
        });
        setSaveState("error");
        toast.error(e?.message || "Could not save — check your connection");
      }
    }, 350);
    debounceTimers.current.set(key, t);
  };

  return (
    <section className="mt-10 border border-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div>
          <h2 className="font-display text-xl">Mark my progress</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tap any number 0 – 10 to update. Saves automatically.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <SaveBadge state={saveState} signedIn={signedIn} />
          <span>
            {mastered}/{skillMilestones.length} mastered · {overallPct}%
          </span>
        </div>
      </header>
      {!signedIn && (
        <div className="border-b border-border bg-amber-50 px-6 py-2 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
          Not signed in with email — scores save on this device only.{" "}
          <Link to="/auth" className="font-medium underline">
            Sign in
          </Link>{" "}
          to sync across devices.
        </div>
      )}
      <ul className="divide-y divide-border">
        {skillMilestones.map((m) => {
          const r = ratingMap.get(m.key) ?? 0;
          const done = r >= 10;
          return (
            <li key={m.key} className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
              <div className="min-w-[9rem] flex-1">
                <div
                  className={`text-sm font-medium ${done ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}
                >
                  {m.name}
                </div>
                <div className="mt-1 h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full transition-all ${done ? "bg-emerald-500" : "bg-primary"}`}
                    style={{ width: `${(r / 10) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(m.key, i)}
                    aria-label={`Set ${m.name} to ${i}`}
                    className={`h-8 w-8 rounded-md border text-xs font-medium transition-colors ${
                      i === r
                        ? done
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-secondary"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-border px-6 py-3 text-right">
        <Link
          to="/lessons"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-accent"
        >
          Full timeline & history <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

function SaveBadge({
  state,
  signedIn,
}: {
  state: "idle" | "saving" | "saved" | "error";
  signedIn: boolean;
}) {
  if (state === "saving")
    return (
      <span className="inline-flex items-center gap-1">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
      </span>
    );
  if (state === "saved")
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600">
        <CloudCheck className="h-3.5 w-3.5" /> Saved
      </span>
    );
  if (state === "error")
    return (
      <span className="inline-flex items-center gap-1 text-destructive">
        <CloudOff className="h-3.5 w-3.5" /> Error
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 opacity-70">
      <CloudCheck className="h-3.5 w-3.5" /> {signedIn ? "Synced" : "On device"}
    </span>
  );
}
