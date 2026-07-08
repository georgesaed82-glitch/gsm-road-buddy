import { useState } from "react";
import { CheckCircle2, XCircle, ChevronDown, Sparkles } from "lucide-react";
import { topicQuizzes } from "@/data/topicQuizzes";
import { saveAttempt, type QuizAttemptItem } from "@/lib/quizAttempts";
import { cn } from "@/lib/utils";

export function TopicMiniQuiz({ slug, topicTitle }: { slug: string; topicTitle: string }) {
  const questions = topicQuizzes[slug];
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [log, setLog] = useState<QuizAttemptItem[]>([]);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!questions || questions.length === 0) return null;

  const restart = () => {
    setIdx(0);
    setChosen(null);
    setCorrect(0);
    setLog([]);
    setFinished(false);
    setSaved(false);
  };

  const current = questions[idx];

  const pick = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    const isCorrect = i === current.correctIndex;
    if (isCorrect) setCorrect((c) => c + 1);
    setLog((l) => [
      ...l,
      {
        prompt: current.q,
        options: current.options,
        correctIndex: current.correctIndex,
        pickedIndex: i,
        correct: isCorrect,
        explanation: current.explanation,
        meta: topicTitle,
      },
    ]);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      setFinished(true);
      if (!saved) {
        saveAttempt({
          kind: "topic",
          label: `${topicTitle} — mini quiz`,
          score: correct + (chosen === current.correctIndex ? 0 : 0), // correct already updated
          total: questions.length,
          items: log,
        });
        setSaved(true);
      }
    } else {
      setIdx(idx + 1);
      setChosen(null);
    }
  };

  return (
    <div className="mt-5 border-t border-border pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-accent">Test yourself</div>
          <div className="text-sm font-semibold">
            {questions.length} quick questions on this topic
          </div>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="mt-4">
          {finished ? (
            <div className="border border-border bg-secondary/40 p-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Complete
              </div>
              <div className="mt-1 font-display text-xl">
                {correct} / {questions.length} correct
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Saved to <span className="font-medium">My attempts</span>.
              </p>
              <button
                type="button"
                onClick={restart}
                className="mt-3 border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
              >
                Retake
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Question {idx + 1} of {questions.length}
                </span>
                <span>Correct {correct}</span>
              </div>
              <p className="text-sm font-medium">{current.q}</p>
              <div className="mt-3 grid gap-2">
                {current.options.map((opt, i) => {
                  const isCorrect = i === current.correctIndex;
                  const isChosen = chosen === i;
                  const answered = chosen !== null;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => pick(i)}
                      disabled={answered}
                      className={cn(
                        "flex items-start justify-between gap-2 border px-3 py-2 text-left text-sm transition-colors",
                        !answered && "border-border bg-background hover:bg-secondary",
                        answered && isCorrect && "border-emerald-600 bg-emerald-600/10",
                        answered &&
                          isChosen &&
                          !isCorrect &&
                          "border-destructive bg-destructive/10",
                        answered &&
                          !isCorrect &&
                          !isChosen &&
                          "border-border bg-background opacity-60",
                      )}
                    >
                      <span className="flex-1">{opt}</span>
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

              {chosen !== null && (
                <div
                  className={cn(
                    "mt-3 border-l-2 p-3 text-sm",
                    chosen === current.correctIndex
                      ? "border-emerald-600 bg-emerald-600/5"
                      : "border-destructive bg-destructive/5",
                  )}
                >
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    {chosen === current.correctIndex ? "Correct" : "Not quite — here's why"}
                  </div>
                  <p className="mt-1 text-muted-foreground">{current.explanation}</p>
                  <button
                    type="button"
                    onClick={next}
                    className="mt-3 border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                  >
                    {idx + 1 >= questions.length ? "See result" : "Next question →"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
