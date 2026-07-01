import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { sampleTheoryQuestions, type TheoryQuestion } from "@/data/theory";
import { CheckCircle2, XCircle, Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [running, setRunning] = useState(false);

  if (running) return <MockRunner onExit={() => setRunning(false)} />;

  return (
    <PortalShell eyebrow="Exam simulation" title="50-question mock test">
      <p className="max-w-2xl text-sm text-muted-foreground">
        A full-length DVSA-style mock: {TEST_LENGTH} questions across all 14 categories,
        {" "}{TEST_MINUTES}-minute timer, {PASS_MARK}/{TEST_LENGTH} to pass (86%). You'll see your
        breakdown by topic at the end.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Questions" value={String(TEST_LENGTH)} />
        <Stat label="Time limit" value={`${TEST_MINUTES} min`} />
        <Stat label="Pass mark" value={`${PASS_MARK} / ${TEST_LENGTH}`} accent />
      </div>

      <div className="mt-8 border border-border bg-card p-6">
        <h3 className="font-display text-xl">How it works</h3>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <li>• Answer at your own pace — you can skip and revisit questions.</li>
          <li>• The timer runs to zero automatically ends the test.</li>
          <li>• At the end you'll see every wrong answer with the correct explanation.</li>
        </ul>
        <Button className="mt-6 rounded-none" size="lg" onClick={() => setRunning(true)}>
          Start mock test →
        </Button>
      </div>
    </PortalShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("border border-border p-5", accent ? "bg-primary text-primary-foreground" : "bg-card")}>
      <div className={cn("text-[11px] uppercase tracking-[0.18em]", accent ? "opacity-80" : "text-muted-foreground")}>{label}</div>
      <div className="mt-2 font-display text-3xl">{value}</div>
    </div>
  );
}

function MockRunner({ onExit }: { onExit: () => void }) {
  const [order] = useState<TheoryQuestion[]>(() => shuffle(sampleTheoryQuestions).slice(0, TEST_LENGTH));
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [i, setI] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TEST_MINUTES * 60);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { setDone(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done]);

  const correctCount = useMemo(
    () => order.reduce((n, q, idx) => n + (answers[idx] === q.correctIndex ? 1 : 0), 0),
    [order, answers],
  );

  if (done) {
    const pass = correctCount >= PASS_MARK;
    const byCategory = new Map<string, { right: number; total: number }>();
    order.forEach((q, idx) => {
      const c = byCategory.get(q.category) ?? { right: 0, total: 0 };
      c.total += 1;
      if (answers[idx] === q.correctIndex) c.right += 1;
      byCategory.set(q.category, c);
    });

    return (
      <PortalShell eyebrow="Result" title={pass ? "You passed" : "Not quite yet"}>
        <div className={cn(
          "flex items-center gap-4 border p-6",
          pass ? "border-emerald-600 bg-emerald-600/10" : "border-destructive bg-destructive/10",
        )}>
          <Trophy className="h-10 w-10" />
          <div>
            <div className="font-display text-3xl">{correctCount} / {TEST_LENGTH}</div>
            <div className="text-sm text-muted-foreground">Pass mark {PASS_MARK} · {Math.round((correctCount / TEST_LENGTH) * 100)}%</div>
          </div>
        </div>

        <h3 className="mt-8 font-display text-xl">By category</h3>
        <div className="mt-3 grid gap-2">
          {[...byCategory.entries()].map(([cat, c]) => (
            <div key={cat} className="flex items-center justify-between border border-border bg-card px-4 py-2 text-sm">
              <span className="capitalize">{cat.replaceAll("-", " ")}</span>
              <span className="text-muted-foreground">{c.right} / {c.total}</span>
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
                  {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> : <XCircle className="mt-0.5 h-4 w-4 text-destructive" />}
                  <div>
                    <div className="font-medium">{idx + 1}. {q.question}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Correct: {q.options[q.correctIndex]}</div>
                    {picked !== undefined && picked !== q.correctIndex && (
                      <div className="text-xs text-muted-foreground">Your answer: {q.options[picked]}</div>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{q.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="rounded-none" onClick={onExit}>Back</Button>
        </div>
      </PortalShell>
    );
  }

  const q = order[i];
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <PortalShell eyebrow="Mock test in progress" title={`Question ${i + 1} of ${TEST_LENGTH}`}>
      <div className="flex items-center justify-between border border-border bg-card px-4 py-3 text-sm">
        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {mm}:{ss} remaining</div>
        <div className="text-muted-foreground">Answered {Object.keys(answers).length} / {TEST_LENGTH}</div>
      </div>
      <Progress className="mt-3" value={((i + 1) / TEST_LENGTH) * 100} />

      <div className="mt-6 border border-border bg-card p-6">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{q.category.replaceAll("-", " ")}</div>
        <h2 className="mt-2 font-display text-xl">{q.question}</h2>
        <div className="mt-4 grid gap-2">
          {q.options.map((opt, idx) => {
            const picked = answers[i] === idx;
            return (
              <button
                key={idx}
                onClick={() => setAnswers({ ...answers, [i]: idx })}
                className={cn(
                  "border px-4 py-3 text-left text-sm transition-colors",
                  picked ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-secondary",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" className="rounded-none" disabled={i === 0} onClick={() => setI(i - 1)}>← Previous</Button>
        {i < TEST_LENGTH - 1 ? (
          <Button className="rounded-none" onClick={() => setI(i + 1)}>Next →</Button>
        ) : (
          <Button className="rounded-none" onClick={() => setDone(true)}>Finish test</Button>
        )}
        <Button variant="ghost" className="ml-auto rounded-none" onClick={onExit}>Exit</Button>
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