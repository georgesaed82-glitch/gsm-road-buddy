import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hazardQuestions, type HazardQuestion } from "@/data/hazardQuiz";
import { cn } from "@/lib/utils";

const QUIZ_LENGTH = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSet(): HazardQuestion[] {
  return shuffle(hazardQuestions).slice(0, QUIZ_LENGTH);
}

export function HomeHazardQuiz() {
  // Use a deterministic initial slice so SSR HTML matches the first client
  // render, then shuffle after mount to keep the quiz varied across sessions.
  const [set, setSet] = useState<HazardQuestion[]>(() => hazardQuestions.slice(0, QUIZ_LENGTH));
  useEffect(() => {
    setSet(buildSet());
  }, []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = useMemo(() => set[i], [set, i]);

  const restart = () => {
    setSet(buildSet());
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const pct = Math.round((score / QUIZ_LENGTH) * 100);
    return (
      <div className="border border-border bg-card p-6 sm:p-10">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Result</div>
        <h3 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
          {score} / {QUIZ_LENGTH} <span className="italic text-accent">({pct}%)</span>
        </h3>
        <p className="mt-3 max-w-lg text-muted-foreground">
          {pct >= 80
            ? "Great anticipation — you're reading the road, not just watching it."
            : "Anticipation improves fast with practice. Read each explanation, then try again."}
        </p>
        <Button onClick={restart} className="mt-6 h-11 rounded-none">
          <RotateCcw className="mr-2 h-4 w-4" /> Play again
        </Button>
      </div>
    );
  }

  const revealed = picked !== null;
  const gotIt = picked === q.correctIndex;

  const next = () => {
    if (i + 1 >= set.length) setDone(true);
    else {
      setI(i + 1);
      setPicked(null);
    }
  };

  return (
    <div className="border border-border bg-card p-5 sm:p-8">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <Eye className="h-3 w-3" /> Question {i + 1} of {QUIZ_LENGTH}
        </span>
        <span>Score {score}</span>
      </div>

      <h3 className="mt-5 font-display text-xl leading-snug sm:text-2xl">{q.question}</h3>

      <div className="mt-5 grid gap-2">
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
              disabled={revealed}
              onClick={() => {
                setPicked(idx);
                if (idx === q.correctIndex) setScore((s) => s + 1);
              }}
              className={cn(
                "flex items-start gap-2 border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default",
                cls,
              )}
            >
              <span className="flex-1">{opt}</span>
              {revealed && isCorrect && (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              )}
              {revealed && isPicked && !isCorrect && (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              )}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div
          className={cn(
            "mt-6 border p-4 text-sm sm:p-5",
            gotIt ? "border-emerald-600 bg-emerald-600/10" : "border-destructive bg-destructive/10",
          )}
        >
          <div className="font-medium">
            {gotIt ? "Correct" : "Not quite"} — the answer is{" "}
            <span className="underline">{q.options[q.correctIndex]}</span>.
          </div>
          <p className="mt-2 leading-relaxed">
            <span className="font-semibold">Why:</span> {q.explanation}
          </p>
          <div className="mt-4 flex justify-end">
            <Button onClick={next} className="h-10 rounded-none">
              {i + 1 >= set.length ? "See result" : "Next question"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
