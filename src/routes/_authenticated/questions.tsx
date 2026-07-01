import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { type TheoryQuestion } from "@/data/theory";
import {
  questionsByDifficulty,
  difficultyMeta,
  type Difficulty,
} from "@/lib/questionDifficulty";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/questions")({
  head: () => ({ meta: [{ title: "Theory questions · GSM" }] }),
  component: QuestionsPage,
});

function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function QuestionsPage() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  if (difficulty) {
    return (
      <PortalShell eyebrow={`${difficultyMeta[difficulty].label} questions`} title="Practice">
        <Runner difficulty={difficulty} onExit={() => setDifficulty(null)} />
      </PortalShell>
    );
  }

  return (
    <PortalShell eyebrow="Theory practice" title="Questions by difficulty">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Practice DVSA-style theory questions grouped by difficulty. Each question
        shows the correct answer and an explanation the moment you tap.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {(["easy", "medium", "hard"] as const).map((d) => {
          const count = questionsByDifficulty(d).length;
          const meta = difficultyMeta[d];
          return (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className="group border border-border bg-card p-6 text-left transition-colors hover:bg-secondary"
            >
              <span className={cn("inline-block h-1 w-8", meta.color)} />
              <h3 className="mt-3 font-display text-2xl">{meta.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{meta.blurb}</p>
              <div className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {count} questions
              </div>
              <span className="mt-4 inline-block text-sm font-medium text-accent underline underline-offset-4">
                Start →
              </span>
            </button>
          );
        })}
      </div>
    </PortalShell>
  );
}

function Runner({ difficulty, onExit }: { difficulty: Difficulty; onExit: () => void }) {
  const [order] = useState<TheoryQuestion[]>(() => shuffle(questionsByDifficulty(difficulty)));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState(0);

  const q = order[i];

  if (!q) {
    return (
      <div className="border border-border bg-card p-6">
        <h3 className="font-display text-xl">Session complete</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You answered {right} of {order.length} correctly ({order.length ? Math.round((right / order.length) * 100) : 0}%).
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="rounded-none" onClick={onExit}>Back to difficulties</Button>
        </div>
      </div>
    );
  }

  const onPick = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.correctIndex) setRight((n) => n + 1);
    else setWrong((n) => n + 1);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {i + 1} of {order.length}</span>
        <span>Right {right} · Wrong {wrong}</span>
      </div>
      <Progress value={((i + (picked !== null ? 1 : 0)) / order.length) * 100} />

      <div className="mt-6 border border-border bg-card p-6">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{q.category.replaceAll("-", " ")}</div>
        <h2 className="mt-2 font-display text-xl">{q.question}</h2>
        <div className="mt-4 grid gap-2">
          {q.options.map((opt, idx) => {
            const isCorrect = idx === q.correctIndex;
            const isPicked = picked === idx;
            return (
              <button
                key={idx}
                disabled={picked !== null}
                onClick={() => onPick(idx)}
                className={cn(
                  "flex items-center justify-between border px-4 py-3 text-left text-sm transition-colors",
                  picked === null && "border-border bg-background hover:bg-secondary",
                  picked !== null && isCorrect && "border-emerald-600 bg-emerald-600/10",
                  picked !== null && isPicked && !isCorrect && "border-destructive bg-destructive/10",
                  picked !== null && !isCorrect && !isPicked && "border-border opacity-60",
                )}
              >
                <span>{opt}</span>
                {picked !== null && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                {picked !== null && isPicked && !isCorrect && <XCircle className="h-4 w-4 text-destructive" />}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="mt-4 border-l-2 border-accent bg-secondary/50 p-4 text-sm">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              {picked === q.correctIndex ? "Correct" : "Correct answer"}
            </div>
            <p className="mt-2 text-muted-foreground">{q.explanation}</p>
            <p className="mt-2 text-xs text-muted-foreground">{q.optionExplanations[picked]}</p>
            <Button size="sm" className="mt-4 rounded-none" onClick={() => { setI(i + 1); setPicked(null); }}>
              {i + 1 === order.length ? "See results →" : "Next question →"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}