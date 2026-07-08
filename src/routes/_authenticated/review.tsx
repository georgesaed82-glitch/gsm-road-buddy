import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { sampleTheoryQuestions, theoryCategories, type TheoryQuestion } from "@/data/theory";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  Sparkles,
  Flame,
  Target,
  TrendingUp,
  Layers,
  ChevronRight,
  X,
  Lightbulb,
  BookOpen,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMistakeIds,
  removeMistake,
  clearMistakes,
  subscribeMistakes,
  recordRetry,
  getRetryStats,
  subscribeRetryStats,
  resetRetryStats,
} from "@/lib/mistakes";

export const Route = createFileRoute("/_authenticated/review")({
  head: () => ({
    meta: [
      { title: "Review mistakes · GSM" },
      {
        name: "description",
        content:
          "Retry every theory question you got wrong. Immediate feedback, and mistakes drop off the list the moment you answer correctly.",
      },
    ],
  }),
  component: ReviewPage,
});

function useMistakes(): TheoryQuestion[] {
  // Simple subscription pattern (avoid double-hook footgun above): re-render on change.
  const [tick, setTick] = useState(0);
  useEffect(() => subscribeMistakes(() => setTick((n) => n + 1)), []);
  return useMemo(() => {
    const ids = new Set(getMistakeIds());
    return sampleTheoryQuestions.filter((q) => ids.has(q.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);
}

function useRetryStats() {
  const [tick, setTick] = useState(0);
  useEffect(() => subscribeRetryStats(() => setTick((n) => n + 1)), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => getRetryStats(), [tick]);
}

function ReviewPage() {
  const mistakes = useMistakes();
  const stats = useRetryStats();
  const [mode, setMode] = useState<"list" | "retry">("list");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Count how many questions in the current mistakes bank fall under each
  // category. Used to enrich the accuracy breakdown.
  const bankByCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const q of mistakes) m.set(q.category, (m.get(q.category) ?? 0) + 1);
    return m;
  }, [mistakes]);

  // Filter the visible mistakes list by the drilled-down category (if any).
  // Falling back to the full bank keeps "Retry all" behaviour intact.
  const filteredMistakes = useMemo(
    () => (selectedCategory ? mistakes.filter((q) => q.category === selectedCategory) : mistakes),
    [mistakes, selectedCategory],
  );

  // If the selected category empties out (user cleared all its questions),
  // drop the filter automatically so the UI doesn't get stuck on empty.
  useEffect(() => {
    if (selectedCategory && !bankByCategory.has(selectedCategory)) {
      setSelectedCategory(null);
    }
  }, [selectedCategory, bankByCategory]);

  // Recommendations: rank categories by how much they need work. We combine
  // three signals — mistakes still in the bank, low retry accuracy (with a
  // minimum sample so a single wrong answer doesn't dominate), and zero
  // practice yet on a topic with mistakes. Only theory-slug categories are
  // recommended (the /theory route can deep-link into them).
  const recommendations = useMemo(
    () => buildRecommendations(stats.byCategory, bankByCategory),
    [stats.byCategory, bankByCategory],
  );

  if (mode === "retry" && filteredMistakes.length > 0) {
    return (
      <PortalShell eyebrow="Review mistakes" title="Retry the ones you missed">
        <RetryRunner queue={filteredMistakes} onExit={() => setMode("list")} />
      </PortalShell>
    );
  }

  return (
    <PortalShell
      eyebrow="Review mistakes"
      title={mistakes.length ? `${mistakes.length} to review` : "You're all caught up"}
    >
      {mistakes.length === 0 ? (
        <>
          <ProgressStats
            stats={stats}
            bankSize={0}
            bankByCategory={bankByCategory}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <div className="mt-6">
            <EmptyState />
          </div>
        </>
      ) : (
        <>
          <ProgressStats
            stats={stats}
            bankSize={mistakes.length}
            bankByCategory={bankByCategory}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          {recommendations.length > 0 && (
            <Recommendations
              recs={recommendations}
              onFocusCategory={(slug) => setSelectedCategory(slug)}
            />
          )}
          <div className="mt-6" />
          <div className="border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Targeted practice
                </div>
                <h2 className="mt-2 font-display text-2xl">
                  {selectedCategory
                    ? `Retry ${formatCategoryLabel(selectedCategory)}`
                    : "Retry your mistakes"}
                </h2>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  {selectedCategory
                    ? `${filteredMistakes.length} question${filteredMistakes.length === 1 ? "" : "s"} in this category. Retry only these, or clear the filter to see everything.`
                    : "Every wrong answer from mock tests and category practice lands here. Get one right and it drops off the list automatically."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="lg" className="rounded-none" onClick={() => setMode("retry")}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {selectedCategory
                    ? `Retry these (${filteredMistakes.length})`
                    : `Retry all (${mistakes.length})`}
                </Button>
                {selectedCategory && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-none"
                    onClick={() => setSelectedCategory(null)}
                  >
                    <X className="mr-2 h-4 w-4" /> Clear filter
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-none"
                  onClick={() => {
                    if (window.confirm("Clear all saved mistakes?")) clearMistakes();
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-xl">
              {selectedCategory
                ? `${formatCategoryLabel(selectedCategory)} · ${filteredMistakes.length}`
                : "What's in your bank"}
            </h3>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Show all categories
              </button>
            )}
          </div>
          <div className="mt-3 space-y-2">
            {filteredMistakes.map((q, n) => (
              <MistakeCard key={q.id} q={q} index={n} expanded={!!selectedCategory} />
            ))}
          </div>
        </>
      )}
    </PortalShell>
  );
}

function MistakeCard({
  q,
  index,
  expanded,
}: {
  q: TheoryQuestion;
  index: number;
  expanded: boolean;
}) {
  // When the user has drilled into a specific category we default to the
  // expanded view (question, all answer options, and explanation) so they can
  // study the exact incorrect items without opening each one.
  const [open, setOpen] = useState(expanded);
  useEffect(() => {
    setOpen(expanded);
  }, [expanded]);

  return (
    <div className="border border-border bg-card text-sm">
      <div className="flex items-start justify-between gap-3 p-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="min-w-0 flex-1 text-left"
          aria-expanded={open}
        >
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {index + 1}. {q.category.replaceAll("-", " ")}
          </div>
          <div className="mt-1 font-medium">{q.question}</div>
          {!open && (
            <div className="mt-1 text-xs text-muted-foreground">
              Correct: {q.options[q.correctIndex]}
            </div>
          )}
        </button>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {open ? "Hide" : "Details"}
          </button>
          <button
            onClick={() => removeMistake(q.id)}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            aria-label={`Remove question ${index + 1} from mistakes`}
          >
            Remove
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background p-4">
          <ul className="grid gap-1.5">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctIndex;
              return (
                <li
                  key={i}
                  className={cn(
                    "flex items-start gap-2 border px-3 py-2 text-sm",
                    isCorrect
                      ? "border-emerald-600 bg-emerald-600/10"
                      : "border-border bg-background text-muted-foreground",
                  )}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <span
                      className="mt-0.5 inline-block h-4 w-4 shrink-0 border border-border"
                      aria-hidden="true"
                    />
                  )}
                  <span>{opt}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 border-l-2 border-accent bg-card p-3 text-sm leading-relaxed">
            <span className="font-semibold">Why:</span> {q.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

// ---- Recommendations engine --------------------------------------------------

type Recommendation = {
  slug: string;
  title: string;
  reason: string;
  accuracyPct: number | null;
  bank: number;
  attempts: number;
  priority: number; // higher = more urgent
};

const THEORY_SLUG_TO_TITLE = new Map(theoryCategories.map((c) => [c.slug, c.title]));

function buildRecommendations(
  byCategory: Stats["byCategory"],
  bankByCategory: Map<string, number>,
): Recommendation[] {
  const catSet = new Set<string>();
  for (const c of byCategory) catSet.add(c.category);
  for (const c of bankByCategory.keys()) catSet.add(c);

  const rows: Recommendation[] = [];
  for (const slug of catSet) {
    // Only recommend real theory categories we can deep-link into.
    if (!THEORY_SLUG_TO_TITLE.has(slug)) continue;
    const row = byCategory.find((r) => r.category === slug);
    const attempts = row?.total ?? 0;
    const correct = row?.correct ?? 0;
    const bank = bankByCategory.get(slug) ?? 0;
    // Accuracy is only meaningful once we have enough retries.
    const hasSignal = attempts >= 3;
    const accuracy = hasSignal ? correct / attempts : null;
    const accuracyPct = accuracy === null ? null : Math.round(accuracy * 100);

    // Skip categories that are cleared and never troubled the user.
    if (bank === 0 && (accuracy === null || accuracy >= 0.9)) continue;

    // Priority weighting:
    //  - Bank size (each unresolved question hurts).
    //  - Low accuracy (below the DVSA 86% pass mark).
    //  - Zero practice on a topic that has mistakes → high urgency.
    let priority = bank * 10;
    if (accuracy !== null && accuracy < 0.86) {
      priority += Math.round((0.86 - accuracy) * 100);
    }
    if (attempts === 0 && bank > 0) priority += 15;

    let reason: string;
    if (attempts === 0) {
      reason = `${bank} unpractised mistake${bank === 1 ? "" : "s"} in this topic — you haven't retried any yet.`;
    } else if (accuracy !== null && accuracy < 0.5) {
      reason = `Only ${accuracyPct}% accuracy across ${attempts} retries. This is your weakest topic.`;
    } else if (accuracy !== null && accuracy < 0.86) {
      reason = `${accuracyPct}% accuracy — below the 86% DVSA pass mark.`;
    } else if (bank > 0) {
      reason = `${bank} question${bank === 1 ? "" : "s"} still in your bank.`;
    } else {
      reason = `Keep this one warm — sharpen it before the test.`;
    }

    rows.push({
      slug,
      title: THEORY_SLUG_TO_TITLE.get(slug) ?? slug,
      reason,
      accuracyPct,
      bank,
      attempts,
      priority,
    });
  }

  rows.sort((a, b) => b.priority - a.priority);
  return rows.slice(0, 3);
}

function Recommendations({
  recs,
  onFocusCategory,
}: {
  recs: Recommendation[];
  onFocusCategory: (slug: string) => void;
}) {
  return (
    <div className="mt-6 border border-border bg-card p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center border border-accent bg-accent/10 text-accent">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Practice plan
          </div>
          <h2 className="mt-1 font-display text-2xl">Your weakest topics</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Based on your retry accuracy and what's still in your bank. Start with the top card — it
            needs you the most.
          </p>
        </div>
      </div>

      <ol className="mt-5 space-y-3">
        {recs.map((r, i) => (
          <li
            key={r.slug}
            className="border border-border bg-background p-4 sm:flex sm:items-start sm:gap-4"
          >
            <div className="flex items-baseline gap-2 sm:min-w-0 sm:flex-1">
              <span className="font-display text-2xl leading-none text-accent">{i + 1}</span>
              <div className="min-w-0">
                <div className="font-medium">{r.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{r.reason}</div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  <span>{r.bank} in bank</span>
                  <span>·</span>
                  <span>
                    {r.accuracyPct === null ? "no retries yet" : `${r.accuracyPct}% accuracy`}
                  </span>
                  {r.attempts > 0 && (
                    <>
                      <span>·</span>
                      <span>{r.attempts} attempts</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 sm:mt-0 sm:shrink-0">
              <Button asChild size="sm" className="rounded-none">
                <Link to="/theory" search={{ category: r.slug }}>
                  <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                  Practice topic
                </Link>
              </Button>
              {r.bank > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-none"
                  onClick={() => onFocusCategory(r.slug)}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Retry mistakes
                </Button>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Ready for a full run? Sit a 50-question mock and any new wrong answers land here
          automatically.
        </p>
        <Button asChild size="sm" variant="secondary" className="rounded-none">
          <Link to="/mock-tests">
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Start mock test
          </Link>
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-border bg-card p-8 text-center">
      <Sparkles className="mx-auto h-8 w-8 text-accent" />
      <h2 className="mt-3 font-display text-2xl">No mistakes saved</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Take a mock test or work through a theory category. Any question you get wrong will show up
        here so you can retry it in seconds.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button asChild className="rounded-none">
          <Link to="/mock-tests">Start a mock test</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-none">
          <Link to="/theory">Practice by topic</Link>
        </Button>
      </div>
    </div>
  );
}

type Stats = ReturnType<typeof getRetryStats>;

function ProgressStats({
  stats,
  bankSize,
  bankByCategory,
  selectedCategory,
  onSelectCategory,
}: {
  stats: Stats;
  bankSize: number;
  bankByCategory: Map<string, number>;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}) {
  const accuracyPct = Math.round(stats.accuracy * 100);
  const maxDay = Math.max(1, ...stats.days.map((d) => d.total));
  const hasHistory = stats.total > 0;

  return (
    <div className="border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Your progress
          </div>
          <h2 className="mt-2 font-display text-2xl">Review stats</h2>
        </div>
        {hasHistory && (
          <button
            onClick={() => {
              if (window.confirm("Reset your retry stats? This won't touch your mistakes bank."))
                resetRetryStats();
            }}
            className="self-start text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground sm:self-auto"
          >
            Reset stats
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={<Target className="h-4 w-4" />}
          label="In your bank"
          value={String(bankSize)}
          hint={bankSize === 0 ? "All caught up" : "questions to retry"}
        />
        <StatTile
          icon={<Flame className="h-4 w-4" />}
          label="Current streak"
          value={String(stats.currentStreak)}
          hint={`best ${stats.bestStreak}`}
        />
        <StatTile
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Accuracy"
          value={hasHistory ? `${accuracyPct}%` : "—"}
          hint={hasHistory ? `${stats.correct}/${stats.total} attempts` : "no attempts yet"}
        />
        <StatTile
          icon={<TrendingUp className="h-4 w-4" />}
          label="Attempts"
          value={String(stats.total)}
          hint="last 500 kept"
        />
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>Accuracy · last 7 days</span>
          <span>{hasHistory ? "correct / total per day" : "start a retry to see trend"}</span>
        </div>
        <div className="flex items-end gap-1.5 sm:gap-2" aria-hidden="true">
          {stats.days.map((d, idx) => {
            const heightPct = d.total ? Math.max(6, (d.total / maxDay) * 100) : 4;
            const acc = Math.round(d.accuracy * 100);
            return (
              <div key={idx} className="flex flex-1 flex-col items-center gap-1">
                <div className="relative flex h-20 w-full items-end overflow-hidden border border-border bg-background">
                  <div
                    className={cn(
                      "w-full",
                      d.total === 0
                        ? "bg-muted"
                        : acc >= 80
                          ? "bg-emerald-600/70"
                          : acc >= 50
                            ? "bg-amber-500/70"
                            : "bg-destructive/70",
                    )}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground">{d.label}</div>
                <div className="text-[10px] font-medium">{d.total ? `${acc}%` : "—"}</div>
              </div>
            );
          })}
        </div>
        <ul className="sr-only">
          {stats.days.map((d, idx) => (
            <li key={idx}>
              {d.label}: {d.correct} correct of {d.total} attempts
            </li>
          ))}
        </ul>
      </div>

      <CategoryBreakdown
        byCategory={stats.byCategory}
        bankByCategory={bankByCategory}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />
    </div>
  );
}

function formatCategoryLabel(slug: string) {
  if (slug === "uncategorised") return "Uncategorised";
  return slug
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function CategoryBreakdown({
  byCategory,
  bankByCategory,
  selectedCategory,
  onSelectCategory,
}: {
  byCategory: Stats["byCategory"];
  bankByCategory: Map<string, number>;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}) {
  // Merge categories from retry history AND the current bank so a category
  // you haven't retried yet still shows up with "0 attempts".
  const rows = useMemo(() => {
    const map = new Map<
      string,
      { category: string; total: number; correct: number; accuracy: number; bank: number }
    >();
    for (const row of byCategory) {
      map.set(row.category, { ...row, bank: bankByCategory.get(row.category) ?? 0 });
    }
    for (const [cat, bank] of bankByCategory) {
      if (!map.has(cat)) {
        map.set(cat, { category: cat, total: 0, correct: 0, accuracy: 0, bank });
      }
    }
    // Rank by attempts, then by remaining bank size, so the most-practised
    // categories float to the top and unpractised weak spots follow.
    return Array.from(map.values()).sort(
      (a, b) => b.total - a.total || b.bank - a.bank || a.category.localeCompare(b.category),
    );
  }, [byCategory, bankByCategory]);

  if (rows.length === 0) {
    return (
      <div className="mt-6 border border-dashed border-border bg-background p-4 text-xs text-muted-foreground">
        Accuracy by category will appear here once you retry a few questions.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          Accuracy by category
        </span>
        <span>
          {selectedCategory ? "tap a row to switch · again to clear" : "tap a row to drill in"}
        </span>
      </div>
      <ul className="divide-y divide-border border border-border bg-background">
        {rows.map((r) => {
          const pct = Math.round(r.accuracy * 100);
          const barColor =
            r.total === 0
              ? "bg-muted"
              : pct >= 80
                ? "bg-emerald-600/70"
                : pct >= 50
                  ? "bg-amber-500/70"
                  : "bg-destructive/70";
          const isSelected = selectedCategory === r.category;
          const disabled = r.bank === 0;
          return (
            <li key={r.category}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelectCategory(isSelected ? null : r.category)}
                aria-pressed={isSelected}
                className={cn(
                  "grid w-full grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-2.5 text-left transition-colors",
                  isSelected && "bg-accent/10",
                  !disabled && "hover:bg-secondary/60",
                  disabled && "cursor-default opacity-60",
                )}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {formatCategoryLabel(r.category)}
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden bg-border">
                    <div
                      className={cn("h-full", barColor)}
                      style={{ width: `${r.total === 0 ? 0 : Math.max(4, pct)}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {r.total === 0
                      ? "No retries yet"
                      : `${pct}% accuracy · ${r.correct}/${r.total} attempts`}
                    {r.bank > 0 && ` · ${r.bank} in bank`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg leading-none">
                    {r.total === 0 ? "—" : `${pct}%`}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {r.bank > 0 ? `${r.bank} to go` : "cleared"}
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    isSelected && "rotate-90 text-foreground",
                    disabled && "opacity-0",
                  )}
                  aria-hidden="true"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1.5 font-display text-2xl leading-none">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function RetryRunner({ queue, onExit }: { queue: TheoryQuestion[]; onExit: () => void }) {
  // Freeze the initial order for this run so items don't jump as they're solved.
  const [order] = useState<TheoryQuestion[]>(() => shuffle(queue));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [solved, setSolved] = useState<Set<string>>(() => new Set());
  const [attempts, setAttempts] = useState(0);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [triedThisQuestion, setTriedThisQuestion] = useState(false);

  const q = order[i];
  const isLast = i >= order.length - 1;
  const revealed = picked !== null;
  const gotIt = revealed && picked === q.correctIndex;

  const onChoose = (idx: number) => {
    if (revealed) return;
    setPicked(idx);
    setAttempts((n) => n + 1);
    if (idx === q.correctIndex) {
      // First-try correct → count it and drop from the bank.
      if (!triedThisQuestion) setCorrectFirstTry((n) => n + 1);
      removeMistake(q.id);
      setSolved((s) => {
        const next = new Set(s);
        next.add(q.id);
        return next;
      });
      recordRetry(true, q.category);
    } else {
      setTriedThisQuestion(true);
      recordRetry(false, q.category);
    }
  };

  const nextQuestion = () => {
    setPicked(null);
    setTriedThisQuestion(false);
    if (isLast) {
      onExit();
      return;
    }
    setI((n) => n + 1);
  };

  const tryAgain = () => {
    setPicked(null);
  };

  return (
    <>
      <div className="flex items-center justify-between border border-border bg-card px-4 py-3 text-sm">
        <div>
          Question <span className="font-semibold">{i + 1}</span> of {order.length}
        </div>
        <div className="text-muted-foreground">
          Solved {solved.size} · Attempts {attempts}
        </div>
      </div>

      <div className="mt-4 border border-border bg-card p-6">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {q.category.replaceAll("-", " ")}
        </div>
        <h2 className="mt-2 font-display text-xl">{q.question}</h2>

        <div className="mt-4 grid gap-2">
          {q.options.map((opt, idx) => {
            const isPicked = picked === idx;
            const isCorrect = idx === q.correctIndex;
            let cls = "border-border bg-background hover:bg-secondary";
            if (revealed) {
              if (isCorrect) cls = "border-emerald-600 bg-emerald-600/10";
              else if (isPicked) cls = "border-destructive bg-destructive/10";
              else cls = "border-border bg-background opacity-70";
            }
            return (
              <button
                key={idx}
                onClick={() => onChoose(idx)}
                disabled={revealed}
                className={cn(
                  "border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default",
                  cls,
                )}
              >
                <span className="flex items-start gap-2">
                  <span>{opt}</span>
                  {revealed && isCorrect && (
                    <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />
                  )}
                  {revealed && isPicked && !isCorrect && (
                    <XCircle className="ml-auto h-4 w-4 shrink-0 text-destructive" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {revealed && (
          <div
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              "mt-4 border p-4 text-sm",
              gotIt
                ? "border-emerald-600 bg-emerald-600/10"
                : "border-destructive bg-destructive/10",
            )}
          >
            <div className="font-medium">
              {gotIt ? "Correct — removed from your bank" : "Not quite"} — the right answer is{" "}
              <span className="underline">{q.options[q.correctIndex]}</span>
            </div>
            <p className="mt-2 leading-relaxed">
              <span className="font-semibold">Why:</span> {q.explanation}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {revealed && !gotIt && (
          <Button className="rounded-none" onClick={tryAgain}>
            Try this one again
          </Button>
        )}
        <Button
          className="rounded-none"
          variant={revealed && !gotIt ? "outline" : "default"}
          disabled={!revealed}
          onClick={nextQuestion}
        >
          {isLast ? "Finish review" : "Next question →"}
        </Button>
        <Button variant="ghost" className="ml-auto rounded-none" onClick={onExit}>
          End review
        </Button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        First-try correct this session: {correctFirstTry} / {i + (revealed ? 1 : 0)}
      </p>
    </>
  );
}
