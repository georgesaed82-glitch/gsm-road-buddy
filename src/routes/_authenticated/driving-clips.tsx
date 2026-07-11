import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Clock, Search, Sparkles, Target, X } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import {
  lessonGroups,
  totalPlanned,
  totalReady,
  type LessonGroup,
  type PlannedLesson,
} from "@/data/lessonGroups";
import { useLessonProgress } from "@/lib/lessonProgress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/driving-clips")({
  head: () => ({
    meta: [
      { title: "Practical Strategy Videos · GSM" },
      {
        name: "description",
        content:
          "Practical Strategy Videos — real UK driving scenarios turned into interactive animations, organised by topic and tied to the Highway Code so you build a repeatable driving system, not just memorised facts.",
      },
    ],
  }),
  component: DrivingClipsPage,
});

function DrivingClipsPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [query, setQuery] = useState("");
  const [ruleFilter, setRuleFilter] = useState("");
  const { isDone, completed } = useLessonProgress();

  const q = query.trim().toLowerCase();
  const ruleNum = ruleFilter.trim() ? Number(ruleFilter.trim()) : null;

  const filteredGroups = useMemo(() => {
    return lessonGroups
      .map((g) => ({
        ...g,
        lessons: g.lessons.filter((l) => {
          const matchesQuery =
            !q ||
            l.title.toLowerCase().includes(q) ||
            (l.rule?.toLowerCase().includes(q) ?? false) ||
            g.title.toLowerCase().includes(q);
          const matchesRule = ruleNum === null || (l.ruleNumbers ?? []).includes(ruleNum);
          return matchesQuery && matchesRule;
        }),
      }))
      .filter((g) => g.lessons.length > 0);
  }, [q, ruleNum]);

  const isLesson = pathname.startsWith("/driving-clips/") && pathname !== "/driving-clips/";
  if (isLesson) return <Outlet />;

  const totalMatches = filteredGroups.reduce((n, g) => n + g.lessons.length, 0);
  const filtering = q.length > 0 || ruleNum !== null;
  const readyCount = totalReady();
  const plannedCount = totalPlanned();
  const completedInSyllabus = lessonGroups
    .flatMap((g) => g.lessons)
    .filter((l) => l.status === "ready" && completed.has(l.slug)).length;

  return (
    <PortalShell eyebrow="Practical" title="Practical Strategy Videos">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Real UK driving scenarios — turned into short interactive strategy videos. Each lesson is
        tied to the Highway Code and built to help you understand <em>why</em> we drive the way we
        do, not just what to memorise. Work through a category, mark lessons complete as you go, and
        come back to review before your test.
      </p>

      {/* Progress + counts */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Lessons ready" value={`${readyCount}`} />
        <Stat label="Full syllabus" value={`${plannedCount}`} />
        <Stat label="You've completed" value={`${completedInSyllabus} / ${readyCount}`} accent />
      </div>

      {/* Vehicle Reference Points entry */}
      <Link
        to="/vehicle-reference-points"
        className="mt-6 flex items-center gap-4 rounded-2xl border border-accent bg-accent/10 p-4 text-left shadow-sm transition-colors hover:bg-accent/15"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Target className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
            Driving skills
          </div>
          <div className="mt-0.5 font-display text-lg leading-tight">Vehicle Reference Points</div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Seven interactive diagrams — driver's view + top view — for parking, position,
            clearance and every turn.
          </p>
        </div>
        <span className="hidden shrink-0 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground sm:inline-flex">
          Open dashboard →
        </span>
      </Link>

      {/* Pinned Golden Rules card */}
      <GoldenRulesCard />

      {/* Search + rule filter */}
      <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search animations, topics or rule text…"
            className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-9 text-sm outline-none focus:border-accent"
            aria-label="Search driving animations"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
        <label className="relative block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Rule #
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={ruleFilter}
            onChange={(e) => setRuleFilter(e.target.value)}
            placeholder="e.g. 170"
            className="h-11 w-full rounded-lg border border-border bg-card pl-16 pr-3 text-sm outline-none focus:border-accent"
            aria-label="Filter by Highway Code rule number"
          />
        </label>
      </div>

      {filtering && (
        <p className="mt-3 text-xs text-muted-foreground">
          {totalMatches === 0
            ? "No lessons match those filters yet."
            : `${totalMatches} lesson${totalMatches === 1 ? "" : "s"} match.`}
        </p>
      )}

      {/* Accordion */}
      <div className="mt-6 space-y-3">
        {(filtering ? filteredGroups : lessonGroups).map((g) => (
          <GroupAccordion key={g.id} group={g} defaultOpen={filtering} isDone={isDone} />
        ))}
        {filtering && filteredGroups.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Try a broader search term or clear the rule number.
          </div>
        )}
      </div>
    </PortalShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        accent ? "border-accent bg-accent/10" : "border-border bg-card",
      )}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl">{value}</div>
    </div>
  );
}

function GoldenRulesCard() {
  const rules = [
    "Road markings override general rules",
    "Paint follows paint · lane follows lane",
    "Stay in your lane pocket",
    "Stretch your vision — 15% up, 70% ahead, 15% down",
    "Plan to stop, look to go",
    "Can I walk across? Then I can drive across.",
    "Mirror · Signal · Mirror · Move",
  ];
  return (
    <details
      open
      className="group mt-6 rounded-2xl border border-accent/60 bg-gradient-to-br from-accent/10 via-card to-card p-5 shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
            GSM golden rules
          </div>
          <div className="font-display text-lg leading-tight">
            The instructor phrases every learner should know by heart
          </div>
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {rules.map((r) => (
          <li
            key={r}
            className="flex items-start gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm"
          >
            <span
              aria-hidden
              className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
            />
            <span className="leading-snug">{r}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        These phrases run through every GSM lesson — say them out loud on approach.
      </p>
    </details>
  );
}

function GroupAccordion({
  group,
  defaultOpen,
  isDone,
}: {
  group: LessonGroup;
  defaultOpen: boolean;
  isDone: (slug: string) => boolean;
}) {
  const readyInGroup = group.lessons.filter((l) => l.status === "ready").length;
  const doneInGroup = group.lessons.filter((l) => l.status === "ready" && isDone(l.slug)).length;
  const pct = readyInGroup === 0 ? 0 : Math.round((doneInGroup / readyInGroup) * 100);

  return (
    <details
      className="group rounded-xl border border-border bg-card shadow-sm open:border-accent/60"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden sm:p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg leading-tight sm:text-xl">{group.title}</h2>
            <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.lessons.length} lesson{group.lessons.length === 1 ? "" : "s"}
            </span>
            {readyInGroup > 0 && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                {readyInGroup} ready
              </span>
            )}
          </div>
          <p className="mt-1 hidden text-sm text-muted-foreground sm:block">{group.blurb}</p>
          {readyInGroup > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary sm:max-w-[240px]">
                <div
                  className="h-full bg-accent transition-[width] duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {doneInGroup}/{readyInGroup}
              </span>
            </div>
          )}
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-border p-3 sm:p-4">
        <ul className="grid gap-2 sm:grid-cols-2">
          {group.lessons.map((l) => (
            <LessonRow key={l.slug} lesson={l} done={l.status === "ready" && isDone(l.slug)} />
          ))}
        </ul>
      </div>
    </details>
  );
}

function LessonRow({ lesson, done }: { lesson: PlannedLesson; done: boolean }) {
  if (lesson.status === "coming-soon") {
    return (
      <li className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-background/60 p-3 opacity-80">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium leading-snug text-foreground/80 break-words">
            {lesson.title}
          </div>
          <div className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            {lesson.rule ?? "Highway Code"} · Coming soon
          </div>
        </div>
      </li>
    );
  }
  return (
    <li>
      <Link
        to="/driving-clips/$slug"
        params={{ slug: lesson.slug }}
        className="group/row flex items-start gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:border-accent"
      >
        {done ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        ) : (
          <span className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full border border-border" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="text-sm font-semibold leading-snug break-words">{lesson.title}</div>
            <span className="mt-0.5 shrink-0 text-accent transition-transform group-hover/row:translate-x-0.5">
              →
            </span>
          </div>
          {lesson.rule && (
            <div className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              {lesson.rule}
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}
