import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { roadMarkings, type RoadMarking } from "@/data/roadMarkings";
import { cn } from "@/lib/utils";
import { saveAttempt, type QuizAttemptItem } from "@/lib/quizAttempts";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildOptions(current: RoadMarking, pool: RoadMarking[]) {
  const distractors = shuffle(pool.filter((m) => m.id !== current.id)).slice(0, 3);
  const options = shuffle([current, ...distractors]);
  return {
    options,
    correctIndex: options.findIndex((m) => m.id === current.id),
  };
}

export function MarkingsQuiz() {
  const [pool] = useState<RoadMarking[]>(() => shuffle(roadMarkings));
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState<RoadMarking[]>([]);
  const [finished, setFinished] = useState(false);
  const [log, setLog] = useState<QuizAttemptItem[]>([]);
  const [savedAttempt, setSavedAttempt] = useState(false);

  const current = pool[idx];
  const q = useMemo(() => (current ? buildOptions(current, roadMarkings) : null), [current]);

  const restart = () => {
    setIdx(0);
    setChosen(null);
    setCorrect(0);
    setMissed([]);
    setFinished(false);
    setLog([]);
    setSavedAttempt(false);
  };

  const practiceMissed = () => {
    // Feed missed items back in — quick focused re-run
    const list = shuffle(missed);
    if (list.length === 0) return;
    // Replace the pool by mutating state
    (pool as RoadMarking[]).length = 0;
    (pool as RoadMarking[]).push(...list);
    setIdx(0);
    setChosen(null);
    setCorrect(0);
    setMissed([]);
    setFinished(false);
    setLog([]);
    setSavedAttempt(false);
  };

  // Save the attempt once the quiz is complete.
  useEffect(() => {
    const answered = correct + missed.length;
    const done = finished || !pool[idx];
    if (!done || savedAttempt || log.length === 0) return;
    saveAttempt({
      kind: "markings",
      label: `${answered} road markings`,
      score: correct,
      total: answered,
      items: log,
    });
    setSavedAttempt(true);
  }, [finished, idx, pool, correct, missed.length, log, savedAttempt]);

  if (finished || !current || !q) {
    const answered = correct + missed.length;
    const pct = answered ? Math.round((correct / answered) * 100) : 0;
    return (
      <div className="mt-6 border border-border bg-card p-6 sm:p-8">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Quiz complete
        </div>
        <h3 className="mt-2 font-display text-3xl">
          {correct} / {answered} <span className="italic text-accent">({pct}%)</span>
        </h3>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          {pct >= 86
            ? "Excellent — that's DVSA pass level on road markings."
            : "Review the ones you missed below, then run the practice set to lock them in."}
        </p>

        {missed.length > 0 && (
          <div className="mt-6 border-t border-border pt-6">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Review missed markings ({missed.length})
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {missed.map((m) => {
                const Visual = m.Visual;
                return (
                  <div key={m.id} className="flex gap-3 border border-border p-3">
                    <div className="h-20 w-20 shrink-0 overflow-hidden border border-border">
                      <Visual />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-sm leading-tight">{m.name}</div>
                      <p className="mt-1 text-xs text-muted-foreground">{m.meaning}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="rounded-none" onClick={restart}>
            Retake full quiz
          </Button>
          {missed.length > 0 && (
            <Button variant="outline" className="rounded-none" onClick={practiceMissed}>
              Practice missed ({missed.length}) →
            </Button>
          )}
        </div>
      </div>
    );
  }

  const answered = chosen !== null;
  const isRight = answered && chosen === q.correctIndex;
  const Visual = current.Visual;

  const pick = (i: number) => {
    if (answered) return;
    setChosen(i);
    const isCorrect = i === q.correctIndex;
    if (isCorrect) setCorrect((c) => c + 1);
    else setMissed((m) => [...m, current]);
    setLog((l) => [
      ...l,
      {
        prompt: `What does this road marking mean? (${current.name})`,
        options: q.options.map((o) => o.name),
        correctIndex: q.correctIndex,
        pickedIndex: i,
        correct: isCorrect,
        explanation: current.meaning,
      },
    ]);
  };

  const next = () => {
    if (idx + 1 >= pool.length) setFinished(true);
    else {
      setIdx(idx + 1);
      setChosen(null);
    }
  };

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Question {idx + 1} of {pool.length}
        </span>
        <span>
          Correct {correct} · Missed {missed.length}
        </span>
      </div>
      <Progress value={((idx + (answered ? 1 : 0)) / pool.length) * 100} />

      <div className="mt-6 grid gap-6 border border-border bg-card p-5 sm:p-8 sm:grid-cols-[auto_1fr]">
        <div className="mx-auto w-48 max-w-full">
          <div className="aspect-square overflow-hidden border border-border">
            <Visual />
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            What does this road marking mean?
          </div>
          <div className="mt-4 grid gap-2">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctIndex;
              const isChosen = chosen === i;
              return (
                <button
                  key={opt.id}
                  onClick={() => pick(i)}
                  disabled={answered}
                  className={cn(
                    "flex items-start justify-between gap-2 border px-4 py-3 text-left text-sm transition-colors",
                    !answered && "border-border bg-background hover:bg-secondary",
                    answered && isCorrect && "border-emerald-600 bg-emerald-600/10",
                    answered && isChosen && !isCorrect && "border-destructive bg-destructive/10",
                    answered && !isCorrect && !isChosen && "border-border bg-background opacity-60",
                  )}
                >
                  <span className="flex-1">{opt.name}</span>
                  {answered && isCorrect && (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  )}
                  {answered && isChosen && !isCorrect && (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  )}
                </button>
              );
            })}
          </div>

          {answered && (
            <div
              className={cn(
                "mt-5 border-l-2 p-4 text-sm",
                isRight
                  ? "border-emerald-600 bg-emerald-600/5"
                  : "border-destructive bg-destructive/5",
              )}
            >
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                {isRight ? "Correct" : "Not quite — here's why"}
              </div>
              <div className="mt-2 font-medium">{current.name}</div>
              <p className="mt-1 text-muted-foreground">{current.meaning}</p>
              <Button size="sm" className="mt-4 rounded-none" onClick={next}>
                {idx + 1 >= pool.length ? "See results →" : "Next question →"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
