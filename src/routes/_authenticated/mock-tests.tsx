import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { sampleTheoryQuestions, type TheoryQuestion } from "@/data/theory";
import { CheckCircle2, XCircle, Clock, Trophy, Download, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { addMistakes } from "@/lib/mistakes";
import { saveAttempt } from "@/lib/quizAttempts";
import { DVSADisclaimer } from "@/components/DVSADisclaimer";

const TEST_LENGTH = 50;
const TEST_MINUTES = 60;
const PASS_MARK = 43; // 86% of 50 rounded up

export const Route = createFileRoute("/_authenticated/mock-tests")({
  head: () => ({ meta: [{ title: "Mock tests · GSM" }] }),
  component: MockPage,
});

function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function MockPage() {
  // Straight into the 50-question mock. Restart via the "Retake" button on results.
  const [runId, setRunId] = useState(0);
  return <MockRunner key={runId} onRestart={() => setRunId((n) => n + 1)} />;
}

function MockRunner({ onRestart }: { onRestart: () => void }) {
  const [order] = useState<TheoryQuestion[]>(() =>
    shuffle(sampleTheoryQuestions).slice(0, TEST_LENGTH),
  );
  const [answers, setAnswers] = useState<Record<number, number>>({});
  // Whether the reveal (correct answer + explanation) is showing for the current question.
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [i, setI] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TEST_MINUTES * 60);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done]);

  const correctCount = useMemo(
    () => order.reduce((n, q, idx) => n + (answers[idx] === q.correctIndex ? 1 : 0), 0),
    [order, answers],
  );

  // Push every wrong / unanswered question into the mistakes bank once the
  // test finishes so learners can retry them from /review.
  useEffect(() => {
    if (!done) return;
    const wrongIds = order
      .filter((q, idx) => answers[idx] === undefined || answers[idx] !== q.correctIndex)
      .map((q) => q.id);
    if (wrongIds.length) addMistakes(wrongIds);
  }, [done, order, answers]);

  // Save the full attempt (questions, options, picks, correctness) so the
  // learner can review it later from /my-attempts.
  const [savedAttempt, setSavedAttempt] = useState(false);
  useEffect(() => {
    if (!done || savedAttempt) return;
    saveAttempt({
      kind: "mock",
      label: `${TEST_LENGTH}-question mock`,
      score: correctCount,
      total: TEST_LENGTH,
      items: order.map((q, idx) => {
        const picked = answers[idx] ?? null;
        return {
          prompt: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          pickedIndex: picked,
          correct: picked === q.correctIndex,
          explanation: q.explanation,
          meta: q.category.replaceAll("-", " "),
        };
      }),
    });
    setSavedAttempt(true);
  }, [done, savedAttempt, order, answers, correctCount]);

  if (done) {
    const pass = correctCount >= PASS_MARK;
    const byCategory = new Map<string, { right: number; total: number }>();
    order.forEach((q, idx) => {
      const c = byCategory.get(q.category) ?? { right: 0, total: 0 };
      c.total += 1;
      if (answers[idx] === q.correctIndex) c.right += 1;
      byCategory.set(q.category, c);
    });

    const wrong = order
      .map((q, idx) => ({ q, idx, picked: answers[idx] }))
      .filter(({ q, picked }) => picked === undefined || picked !== q.correctIndex);

    const downloadReview = () => {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const lines: string[] = [];
      lines.push(`GSM Driving School — Mock Test Review`);
      lines.push(`Date: ${new Date().toLocaleString()}`);
      lines.push(
        `Score: ${correctCount} / ${TEST_LENGTH} (${Math.round((correctCount / TEST_LENGTH) * 100)}%)`,
      );
      lines.push(`Pass mark: ${PASS_MARK} / ${TEST_LENGTH} — ${pass ? "PASS" : "FAIL"}`);
      lines.push("");
      lines.push(`Wrong / unanswered questions (${wrong.length}):`);
      lines.push("=".repeat(60));
      wrong.forEach(({ q, idx, picked }, n) => {
        lines.push("");
        lines.push(`${n + 1}. [${q.category}] Question ${idx + 1}`);
        lines.push(`Q: ${q.question}`);
        q.options.forEach((opt, oi) => {
          const marks: string[] = [];
          if (oi === q.correctIndex) marks.push("✓ correct");
          if (picked === oi) marks.push("← your answer");
          lines.push(
            `   ${String.fromCharCode(65 + oi)}. ${opt}${marks.length ? "   (" + marks.join(", ") + ")" : ""}`,
          );
        });
        if (picked === undefined) lines.push(`Your answer: (unanswered)`);
        lines.push(`Correct answer: ${q.options[q.correctIndex]}`);
        lines.push(`Why: ${q.explanation}`);
      });
      const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gsm-mock-review-${stamp}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };

    return (
      <PortalShell eyebrow="Result" title={pass ? "You passed" : "Not quite yet"}>
        <div
          className={cn(
            "flex items-center gap-4 border p-6",
            pass ? "border-emerald-600 bg-emerald-600/10" : "border-destructive bg-destructive/10",
          )}
        >
          <Trophy className="h-10 w-10" />
          <div>
            <div className="font-display text-3xl">
              {correctCount} / {TEST_LENGTH}
            </div>
            <div className="text-sm text-muted-foreground">
              Pass mark {PASS_MARK} · {Math.round((correctCount / TEST_LENGTH) * 100)}%
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button className="rounded-none" onClick={downloadReview} disabled={wrong.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Save wrong answers ({wrong.length})
          </Button>
          {wrong.length > 0 && (
            <Button asChild variant="secondary" className="rounded-none">
              <Link to="/review">
                <RotateCcw className="mr-2 h-4 w-4" /> Review mistakes
              </Link>
            </Button>
          )}
          <Button variant="outline" className="rounded-none" onClick={onRestart}>
            Retake mock
          </Button>
        </div>

        <h3 className="mt-8 font-display text-xl">By category</h3>
        <div className="mt-3 grid gap-2">
          {[...byCategory.entries()].map(([cat, c]) => (
            <div
              key={cat}
              className="flex items-center justify-between border border-border bg-card px-4 py-2 text-sm"
            >
              <span className="capitalize">{cat.replaceAll("-", " ")}</span>
              <span className="text-muted-foreground">
                {c.right} / {c.total}
              </span>
            </div>
          ))}
        </div>

        <h3 className="mt-8 font-display text-xl">Review</h3>
        <div className="mt-3 space-y-3">
          {order.map((q, idx) => {
            const picked = answers[idx];
            const ok = picked === q.correctIndex;
            return (
              <div key={q.id} className="border border-border bg-card p-4 text-sm">
                <div className="flex items-start gap-2">
                  {ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 text-destructive" />
                  )}
                  <div>
                    <div className="font-medium">
                      {idx + 1}. {q.question}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Correct: {q.options[q.correctIndex]}
                    </div>
                    {picked !== undefined && picked !== q.correctIndex && (
                      <div className="text-xs text-muted-foreground">
                        Your answer: {q.options[picked]}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{q.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button className="rounded-none" onClick={downloadReview} disabled={wrong.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Save wrong answers
          </Button>
          <Button variant="outline" className="rounded-none" onClick={onRestart}>
            Retake mock
          </Button>
        </div>
        <div className="mt-8">
          <DVSADisclaimer />
        </div>
      </PortalShell>
    );
  }

  const q = order[i];
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const isRevealed = !!revealed[i];
  const picked = answers[i];
  const gotIt = picked !== undefined && picked === q.correctIndex;

  return (
    <PortalShell eyebrow="Mock test in progress" title={`Question ${i + 1} of ${TEST_LENGTH}`}>
      <div className="flex items-center justify-between border border-border bg-card px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" /> {mm}:{ss} remaining
        </div>
        <div className="text-muted-foreground">
          Answered {Object.keys(answers).length} / {TEST_LENGTH}
        </div>
      </div>
      <Progress className="mt-3" value={((i + 1) / TEST_LENGTH) * 100} />

      <div className="mt-6 border border-border bg-card p-6">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {q.category.replaceAll("-", " ")}
        </div>
        <h2 className="mt-2 font-display text-xl">{q.question}</h2>
        <div className="mt-4 grid gap-2">
          {q.options.map((opt, idx) => {
            const isPicked = picked === idx;
            const isCorrect = idx === q.correctIndex;
            let cls = "border-border bg-background hover:bg-secondary";
            if (isRevealed) {
              if (isCorrect) cls = "border-emerald-600 bg-emerald-600/10";
              else if (isPicked) cls = "border-destructive bg-destructive/10";
              else cls = "border-border bg-background opacity-70";
            } else if (isPicked) {
              cls = "border-primary bg-primary/10";
            }
            return (
              <button
                key={idx}
                disabled={isRevealed}
                onClick={() => {
                  setAnswers({ ...answers, [i]: idx });
                  setRevealed({ ...revealed, [i]: true });
                }}
                className={cn(
                  "border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default",
                  cls,
                )}
              >
                <span className="flex items-start gap-2">
                  <span>{opt}</span>
                  {isRevealed && isCorrect && (
                    <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />
                  )}
                  {isRevealed && isPicked && !isCorrect && (
                    <XCircle className="ml-auto h-4 w-4 shrink-0 text-destructive" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {isRevealed && (
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
              {gotIt ? "Correct" : "Not quite"} — the right answer is{" "}
              <span className="underline">{q.options[q.correctIndex]}</span>
            </div>
            <p className="mt-2 leading-relaxed">
              <span className="font-semibold">Why:</span> {q.explanation}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="rounded-none"
          disabled={i === 0}
          onClick={() => setI(i - 1)}
        >
          ← Previous
        </Button>
        {i < TEST_LENGTH - 1 ? (
          <Button className="rounded-none" disabled={!isRevealed} onClick={() => setI(i + 1)}>
            Next →
          </Button>
        ) : (
          <Button className="rounded-none" onClick={() => setDone(true)}>
            Finish test
          </Button>
        )}
        <Button variant="ghost" className="ml-auto rounded-none" onClick={() => setDone(true)}>
          Finish now
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-10 gap-1">
        {order.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={cn(
              "h-8 border text-xs",
              idx === i && "border-accent",
              answers[idx] !== undefined ? "bg-primary/10 border-primary" : "border-border bg-card",
            )}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </PortalShell>
  );
}
