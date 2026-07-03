import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PortalShell } from "@/components/PortalShell";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Star, Check, Loader2, CloudCheck, CloudOff, History, ArrowUp, ArrowDown, Minus, Filter, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/lessons")({
  head: () => ({ meta: [{ title: "Lessons & progress · GSM" }] }),
  component: LessonsPage,
});

const skillMilestones = [
  { key: "cockpit", name: "Cockpit drill & controls", target: 1 },
  { key: "move_stop", name: "Moving off & stopping", target: 2 },
  { key: "junctions", name: "Junctions (left & right)", target: 4 },
  { key: "roundabouts", name: "Roundabouts", target: 6 },
  { key: "bay_park", name: "Bay parking", target: 8 },
  { key: "parallel", name: "Parallel parking", target: 10 },
  { key: "pull_right", name: "Pull up on the right", target: 11 },
  { key: "forward_bay", name: "Forward bay park", target: 12 },
  { key: "independent", name: "Independent driving", target: 14 },
  { key: "mock_test", name: "Mock test routes", target: 18 },
];

const LOCAL_RATINGS_KEY = "gsm.skillRatings.v1";

function loadLocalRatings(): { skill_key: string; rating: number }[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_RATINGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return [];
    return Object.entries(parsed as Record<string, number>).map(([skill_key, rating]) => ({
      skill_key,
      rating: Math.max(0, Math.min(10, Math.round(Number(rating) || 0))),
    }));
  } catch {
    return [];
  }
}

function saveLocalRating(key: string, rating: number) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LOCAL_RATINGS_KEY);
    const obj = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    obj[key] = rating;
    window.localStorage.setItem(LOCAL_RATINGS_KEY, JSON.stringify(obj));
  } catch {
    /* ignore quota / private mode */
  }
}

function LessonsPage() {
  const qc = useQueryClient();
  type Rating = { skill_key: string; rating: number };
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const inFlight = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
      debounceTimers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ["all-bookings"],
    queryFn: async () => {
      const { data } = await supabase.from("lesson_bookings").select("*").order("scheduled_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ["skill-ratings"],
    queryFn: async () => {
      const local = loadLocalRatings();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return local;
      const { data } = await supabase.from("skill_ratings").select("skill_key, rating");
      const server = (data ?? []) as Rating[];
      // Merge: server wins if present, otherwise fall back to whatever the device saved locally.
      const map = new Map(local.map((r) => [r.skill_key, r.rating]));
      for (const r of server) map.set(r.skill_key, r.rating);
      return Array.from(map, ([skill_key, rating]) => ({ skill_key, rating }));
    },
    staleTime: 30_000,
  });

  type HistoryEntry = {
    id: string;
    skill_key: string;
    rating: number;
    previous_rating: number | null;
    changed_at: string;
  };
  const { data: ratingHistory = [] } = useQuery({
    queryKey: ["skill-rating-history"],
    queryFn: async () => {
      const { data } = await supabase
        .from("skill_rating_history")
        .select("id, skill_key, rating, previous_rating, changed_at")
        .order("changed_at", { ascending: false })
        .limit(500);
      return (data ?? []) as HistoryEntry[];
    },
    staleTime: 15_000,
  });
  const historyBySkill = new Map<string, HistoryEntry[]>();
  for (const h of ratingHistory) {
    const list = historyBySkill.get(h.skill_key);
    if (list) list.push(h);
    else historyBySkill.set(h.skill_key, [h]);
  }

  const ratingMap = new Map(ratings.map((r) => [r.skill_key, r.rating]));

  const { data: sessionInfo } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return { email: data.user?.email ?? null, signedIn: !!data.user };
    },
    staleTime: 30_000,
  });

  const persist = async (key: string, rating: number) => {
    // Validate: integer between 0 and 10
    const clean = Math.max(0, Math.min(10, Math.round(rating)));
    inFlight.current.set(key, clean);
    setSaveState("saving");
    // Always save on-device first so the score persists even without an account.
    saveLocalRating(key, clean);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) {
      // Not signed in (access-code learner) — the local save above is our record of truth.
      if (inFlight.current.get(key) === clean) inFlight.current.delete(key);
      return;
    }
    const { error } = await supabase
      .from("skill_ratings")
      .upsert(
        { user_id: uid, skill_key: key, rating: clean },
        { onConflict: "user_id,skill_key" },
      );
    if (error) throw error;
    // If a newer value was queued while we were saving, don't clobber "saved" state prematurely
    if (inFlight.current.get(key) === clean) {
      inFlight.current.delete(key);
    }
  };

  const setRating = (key: string, next: number) => {
    const clean = Math.max(0, Math.min(10, Math.round(next)));
    const prev = ratingMap.get(key) ?? 0;
    if (clean === prev) return;

    // Optimistic cache update — instant UI feedback, survives refresh once persisted
    qc.setQueryData<Rating[]>(["skill-ratings"], (old = []) => {
      const idx = old.findIndex((r) => r.skill_key === key);
      if (idx === -1) return [...old, { skill_key: key, rating: clean }];
      const copy = old.slice();
      copy[idx] = { skill_key: key, rating: clean };
      return copy;
    });

    // Debounce rapid taps on the same skill so we save only the final value
    const existing = debounceTimers.current.get(key);
    if (existing) clearTimeout(existing);
    const t = setTimeout(async () => {
      debounceTimers.current.delete(key);
      try {
        await persist(key, clean);
        if (clean === 10 && prev !== 10) toast.success("Mastered! 🎉");
        setSaveState("saved");
        if (savedTimer.current) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSaveState("idle"), 1500);
        qc.invalidateQueries({ queryKey: ["skill-rating-history"] });
      } catch (e: any) {
        // Roll back optimistic value and surface error
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

  const completed = bookings.filter((b) => b.status === "completed").length;
  const upcoming = bookings.filter((b) => new Date(b.scheduled_at) > new Date() && b.status === "scheduled");
  const history = bookings.filter((b) => b.status === "completed" || new Date(b.scheduled_at) <= new Date());
  const allSkills = new Set<string>(bookings.flatMap((b) => b.skills_covered ?? []));
  const totalRating = skillMilestones.reduce((n, m) => n + (ratingMap.get(m.key) ?? 0), 0);
  const mastered = skillMilestones.filter((m) => (ratingMap.get(m.key) ?? 0) >= 10).length;
  const overallPct = Math.round((totalRating / (skillMilestones.length * 10)) * 100);

  const saveAll = async () => {
    // Flush any pending debounced writes immediately
    debounceTimers.current.forEach((t) => clearTimeout(t));
    debounceTimers.current.clear();
    setSaveState("saving");
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      // Persist every current rating to localStorage AND (if signed in) to the account
      for (const m of skillMilestones) {
        const val = ratingMap.get(m.key) ?? 0;
        saveLocalRating(m.key, val);
        if (uid) {
          const { error } = await supabase
            .from("skill_ratings")
            .upsert({ user_id: uid, skill_key: m.key, rating: val }, { onConflict: "user_id,skill_key" });
          if (error) throw error;
        }
      }
      setSaveState("saved");
      toast.success(uid ? "All scores saved to the student's account." : "All scores saved on this device.");
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaveState("idle"), 1800);
      qc.invalidateQueries({ queryKey: ["skill-rating-history"] });
    } catch (e: any) {
      setSaveState("error");
      toast.error(e?.message || "Could not save. Check your connection and try again.");
    }
  };

  return (
    <PortalShell eyebrow="Your journey" title="Lessons & progress">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section>
          {sessionInfo && !sessionInfo.signedIn && (
            <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
              You're using a shared access code, so scores won't save to your account.
              Log in with your email + the PIN George gave you on the{' '}
              <a href="/auth" className="font-medium underline">login page</a> to track your personal progress.
            </div>
          )}
          {sessionInfo?.signedIn && sessionInfo.email && (
            <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100">
              Signed in as <span className="font-medium">{sessionInfo.email}</span> · progress saves automatically.
            </div>
          )}
          {/* Progress chart */}
          <div className="border border-border bg-card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl">Progress chart</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <SaveIndicator state={saveState} />
                <span>{mastered}/{skillMilestones.length} mastered · {overallPct}%</span>
                <Button
                  size="sm"
                  onClick={saveAll}
                  disabled={saveState === "saving"}
                  className="h-8"
                >
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  {saveState === "saving" ? "Saving…" : "Save & update"}
                </Button>
              </div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Every skill is marked 0 – 10. Tap Save &amp; update after grading to lock the scores into this student's account.
            </p>
            <div className="mt-5 space-y-3">
              {skillMilestones.map((m) => {
                const r = ratingMap.get(m.key) ?? 0;
                const done = r >= 10;
                return (
                  <div key={m.key} className="flex items-center gap-3">
                    <div className="w-40 truncate text-sm font-medium">{m.name}</div>
                    <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all ${done ? "bg-emerald-500" : "bg-primary"}`}
                        style={{ width: `${r * 10}%` }}
                      />
                    </div>
                    <div className={`w-10 text-right text-sm tabular-nums ${done ? "font-semibold text-emerald-600 dark:text-emerald-400" : ""}`}>
                      {r}/10
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl">Skills roadmap</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap 1 – 10 to record your current standard on each skill. Reach 10 and the section turns green.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-[200px] text-sm" aria-label="Filter skill timeline">
                  <SelectValue placeholder="All skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All skills</SelectItem>
                  {skillMilestones.map((m) => (
                    <SelectItem key={m.key} value={m.key}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ol className="mt-6 border border-border bg-card">
            {skillMilestones
              .filter((m) => skillFilter === "all" || m.key === skillFilter)
              .map((m, i) => {
              const r = ratingMap.get(m.key) ?? 0;
              const done = r >= 10;
              const reached = done || allSkills.has(m.name) || completed >= m.target;
              return (
                <li
                  key={m.key}
                  className={`border-b border-border px-5 py-4 last:border-b-0 transition-colors ${
                    done ? "bg-emerald-50 dark:bg-emerald-500/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                        done
                          ? "bg-emerald-500 text-white"
                          : reached
                            ? "bg-primary text-primary-foreground"
                            : "border border-border text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${done ? "text-emerald-800 dark:text-emerald-200" : reached ? "text-foreground" : "text-muted-foreground"}`}>
                        {m.name}
                      </div>
                      <div className="text-xs text-muted-foreground">Typically by lesson {m.target}</div>
                    </div>
                    <div className={`text-sm tabular-nums ${done ? "font-semibold text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                      {r}/10
                    </div>
                    {done && <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">Mastered</Badge>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {Array.from({ length: 10 }).map((_, n) => {
                      const value = n + 1;
                      const active = value <= r;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(m.key, value === r ? value - 1 : value)}
                          className={`h-7 w-7 rounded-md border text-xs font-medium transition-colors ${
                            active
                              ? done
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          }`}
                          title={`Mark standard ${value}/10`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                  <SkillRatingTimeline entries={historyBySkill.get(m.key) ?? []} forceOpen={skillFilter === m.key} />
                </li>
              );
            })}
          </ol>

          <h2 className="mt-12 font-display text-2xl">Lesson history</h2>
          {history.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Your completed lessons will appear here with your instructor's notes.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border border border-border bg-card">
              {history.map((b) => (
                <li key={b.id} className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-foreground">
                        {new Date(b.scheduled_at).toLocaleDateString("en-GB", { dateStyle: "full" })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {b.instructor_name} · {b.duration_minutes} minutes
                      </div>
                    </div>
                    {b.rating && (
                      <div className="flex text-accent">
                        {Array.from({ length: b.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-accent" />)}
                      </div>
                    )}
                  </div>
                  {b.skills_covered && b.skills_covered.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {b.skills_covered.map((s: string) => (
                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  )}
                  {b.instructor_notes && (
                    <p className="mt-3 border-l-2 border-accent pl-3 text-sm italic text-muted-foreground">
                      "{b.instructor_notes}"
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-5">
          <div className="border border-border bg-card p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Snapshot</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat label="Completed" value={String(completed)} />
              <Stat label="Upcoming" value={String(upcoming.length)} />
              <Stat label="Mastered" value={`${mastered}/${skillMilestones.length}`} />
              <Stat label="Overall" value={`${overallPct}%`} />
            </div>
          </div>
          <div className="border border-border bg-primary p-5 text-primary-foreground">
            <div className="text-[11px] uppercase tracking-[0.18em] opacity-70">Next milestone</div>
            <div className="mt-2 font-display text-xl">Mock test ready</div>
            <p className="mt-2 text-sm opacity-80">
              Most learners reach this around 20 hours. Your instructor will book a 90-minute mock when you're close.
            </p>
          </div>
        </aside>
      </div>
    </PortalShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl text-foreground">{value}</div>
    </div>
  );
}

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;
  if (state === "saving")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
      </span>
    );
  if (state === "saved")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
        <CloudCheck className="h-3.5 w-3.5" /> Saved
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-destructive">
      <CloudOff className="h-3.5 w-3.5" /> Retry
    </span>
  );
}

function SkillRatingTimeline({
  entries,
  forceOpen = false,
}: {
  entries: Array<{ id: string; rating: number; previous_rating: number | null; changed_at: string }>;
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(forceOpen);
  useEffect(() => {
    setOpen(forceOpen);
  }, [forceOpen]);
  if (entries.length === 0) return null;
  const latest = entries[0];
  const latestDelta =
    latest.previous_rating == null ? null : latest.rating - latest.previous_rating;
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <History className="h-3.5 w-3.5" />
          <span>
            {entries.length} change{entries.length === 1 ? "" : "s"} · last{" "}
            {relativeTime(latest.changed_at)}
          </span>
          {latestDelta != null && latestDelta !== 0 && (
            <span
              className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 tabular-nums ${
                latestDelta > 0
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
              }`}
            >
              {latestDelta > 0 ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              {Math.abs(latestDelta)}
            </span>
          )}
          <span className="ml-1 text-[10px] uppercase tracking-wider">
            {open ? "Hide" : "Show"}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ol className="mt-3 space-y-2 border-l-2 border-border pl-3">
          {entries.map((e) => {
            const delta = e.previous_rating == null ? null : e.rating - e.previous_rating;
            const isUp = delta != null && delta > 0;
            const isDown = delta != null && delta < 0;
            return (
              <li key={e.id} className="relative flex items-center gap-2 text-xs">
                <span
                  className={`absolute -left-[7px] h-2.5 w-2.5 rounded-full ${
                    e.rating >= 10
                      ? "bg-emerald-500"
                      : isUp
                        ? "bg-primary"
                        : isDown
                          ? "bg-amber-500"
                          : "bg-muted-foreground"
                  }`}
                />
                <span className="tabular-nums font-medium text-foreground">
                  {e.previous_rating == null ? "—" : e.previous_rating}
                  <span className="mx-1 text-muted-foreground">→</span>
                  {e.rating}/10
                </span>
                {delta != null && (
                  <span
                    className={`inline-flex items-center tabular-nums ${
                      isUp
                        ? "text-emerald-600 dark:text-emerald-400"
                        : isDown
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {isUp ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : isDown ? (
                      <ArrowDown className="h-3 w-3" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                    {delta !== 0 && Math.abs(delta)}
                  </span>
                )}
                {e.rating >= 10 && (
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">Mastered</Badge>
                )}
                <span className="ml-auto text-muted-foreground">
                  {new Date(e.changed_at).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </li>
            );
          })}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  );
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { dateStyle: "medium" });
}
