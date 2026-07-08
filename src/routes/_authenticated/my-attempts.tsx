import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Trash2, ChevronLeft } from "lucide-react";
import {
  listAttempts,
  deleteAttempt,
  clearAttempts,
  kindLabels,
  type QuizAttempt,
} from "@/lib/quizAttempts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/my-attempts")({
  head: () => ({ meta: [{ title: "My attempts · GSM" }] }),
  component: MyAttemptsPage,
});

function useAttempts() {
  const [list, setList] = useState<QuizAttempt[]>([]);
  useEffect(() => {
    const refresh = () => setList(listAttempts());
    refresh();
    const onChange = () => refresh();
    window.addEventListener("gsm.quizAttempts.change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("gsm.quizAttempts.change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return [list, setList] as const;
}

function MyAttemptsPage() {
  const [list] = useAttempts();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(() => list.find((a) => a.id === openId) ?? null, [list, openId]);

  if (open) {
    return (
      <PortalShell eyebrow={kindLabels[open.kind]} title="Attempt review">
        <Button variant="outline" className="rounded-none" onClick={() => setOpenId(null)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to attempts
        </Button>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border border-border bg-card p-4 text-sm">
          <div>
            <div className="font-display text-2xl">
              {open.score} / {open.total}{" "}
              <span className="italic text-accent">
                ({open.total ? Math.round((open.score / open.total) * 100) : 0}%)
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(open.finishedAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {open.items.map((item, idx) => {
            const ok = item.correct;
            const picked = item.pickedIndex;
            return (
              <div key={idx} className="border border-border bg-card p-4 text-sm">
                <div className="flex items-start gap-2">
                  {ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <div className="min-w-0 flex-1">
                    {item.meta && (
                      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {item.meta}
                      </div>
                    )}
                    <div className="font-medium">
                      {idx + 1}. {item.prompt}
                    </div>
                    <div className="mt-2 grid gap-1">
                      {item.options.map((opt, oi) => {
                        const isCorrect = oi === item.correctIndex;
                        const isPicked = picked === oi;
                        return (
                          <div
                            key={oi}
                            className={cn(
                              "border px-3 py-2 text-xs",
                              isCorrect && "border-emerald-600 bg-emerald-600/10",
                              isPicked && !isCorrect && "border-destructive bg-destructive/10",
                              !isCorrect && !isPicked && "border-border bg-background opacity-70",
                            )}
                          >
                            <span>{String.fromCharCode(65 + oi)}. {opt}</span>
                            {isCorrect && <span className="ml-2 text-emerald-700">✓ correct</span>}
                            {isPicked && !isCorrect && <span className="ml-2 text-destructive">← your answer</span>}
                          </div>
                        );
                      })}
                      {picked === null && (
                        <div className="text-[11px] text-muted-foreground">Unanswered.</div>
                      )}
                    </div>
                    {item.explanation && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Why:</span> {item.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell eyebrow="GSM Plus" title="My attempts">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Every quiz you finish on this device is saved here — mock tests, road
        signs, road markings and theory practice. Open one to see the exact
        questions, your answers and where you went wrong.
      </p>

      {list.length === 0 ? (
        <div className="mt-8 border border-dashed border-border p-8 text-sm text-muted-foreground">
          No attempts yet. Finish a quiz and it'll show up here automatically.
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-2">
            {list.map((a) => {
              const pct = a.total ? Math.round((a.score / a.total) * 100) : 0;
              return (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 border border-border bg-card px-4 py-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{kindLabels[a.kind]}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(a.finishedAt).toLocaleString()} · {a.label}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-display text-lg">{a.score}/{a.total}</span>{" "}
                    <span className="text-muted-foreground">({pct}%)</span>
                  </div>
                  <Button size="sm" className="rounded-none" onClick={() => setOpenId(a.id)}>
                    Review
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-none"
                    onClick={() => {
                      if (confirm("Delete this attempt?")) deleteAttempt(a.id);
                    }}
                    aria-label="Delete attempt"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => {
                if (confirm("Clear every saved attempt on this device?")) clearAttempts();
              }}
            >
              Clear all attempts
            </Button>
          </div>
        </>
      )}
    </PortalShell>
  );
}