import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { sampleTheoryQuestions, type TheoryQuestion } from "@/data/theory";
import { CheckCircle2, XCircle, RotateCcw, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMistakeIds,
  removeMistake,
  clearMistakes,
  subscribeMistakes,
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

function useMistakeIds(): string[] {
  return useSyncExternalStore(
    subscribeMistakes,
    () => JSON.stringify(getMistakeIds()),
    () => "[]",
  ).length
    ? JSON.parse(
        useSyncExternalStore(
          subscribeMistakes,
          () => JSON.stringify(getMistakeIds()),
          () => "[]",
        ),
      )
    : [];
}

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

function ReviewPage() {
  const mistakes = useMistakes();
  const [mode, setMode] = useState<"list" | "retry">("list");

  if (mode === "retry" && mistakes.length > 0) {
    return (
      <PortalShell eyebrow="Review mistakes" title="Retry the ones you missed">
        <RetryRunner queue={mistakes} onExit={() => setMode("list")} />
      </PortalShell>
    );
  }

  return (
    <PortalShell
      eyebrow="Review mistakes"
      title={mistakes.length ? `${mistakes.length} to review` : "You're all caught up"}
    >
      {mistakes.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Targeted practice
                </div>
                <h2 className="mt-2 font-display text-2xl">Retry your mistakes</h2>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  Every wrong answer from mock tests and category practice lands here. Get one
                  right and it drops off the list automatically.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="lg" className="rounded-none" onClick={() => setMode("retry")}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Retry all ({mistakes.length})
                </Button>
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

          <h3 className="mt-10 font-display text-xl">What's in your bank</h3>
          <div className="mt-3 space-y-2">
            {mistakes.map((q, n) => (
              <div
                key={q.id}
                className="flex items-start justify-between gap-3 border border-border bg-card p-4 text-sm"
              >
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {n + 1}. {q.category.replaceAll("-", " ")}
                  </div>
                  <div className="mt-1 font-medium">{q.question}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Correct: {q.options[q.correctIndex]}
                  </div>
                </div>
                <button
                  onClick={() => removeMistake(q.id)}
                  className="shrink-0 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  aria-label={`Remove question ${n + 1} from mistakes`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </PortalShell>
  );
}

function EmptyState() {
  return (
    <div className="border border-border bg-card p-8 text-center">
      <Sparkles className="mx-auto h-8 w-8 text-accent" />
      <h2 className="mt-3 font-display text-2xl">No mistakes saved</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Take a mock test or work through a theory category. Any question you get wrong will show
        up here so you can retry it in seconds.
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
    } else {
      setTriedThisQuestion(true);
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