import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OfficialSignImage } from "@/components/OfficialSignImage";
import { signs, signCategories, signsByCategory, buildSignOptions, type Sign, type SignCategory } from "@/data/signs";
import { CheckCircle2, XCircle, SignpostBig, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/signs")({
  head: () => ({ meta: [{ title: "Road signs quiz · GSM" }] }),
  component: SignsPage,
});

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function SignsPage() {
  const [mode, setMode] = useState<null | { kind: "learn" | "quiz"; category?: SignCategory }>(null);

  if (mode?.kind === "learn") {
    return (
      <PortalShell eyebrow="Highway Code" title={mode.category ? signCategories.find((c) => c.slug === mode.category)!.title : "Learn all UK road signs"}>
        <LearnGallery category={mode.category} onExit={() => setMode(null)} />
      </PortalShell>
    );
  }
  if (mode?.kind === "quiz") {
    return (
      <PortalShell eyebrow="Signs quiz" title={mode.category ? signCategories.find((c) => c.slug === mode.category)!.title : "All-signs quiz"}>
        <SignsQuiz category={mode.category} onExit={() => setMode(null)} />
      </PortalShell>
    );
  }

  return (
    <PortalShell eyebrow="Know your signs" title="UK road signs — learn & quiz">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Every category from the Highway Code, drawn in the correct shape and colour. Learn them, then test yourself. If you get one wrong, we show you the sign with the answer explained.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => setMode({ kind: "quiz" })}
          className="group border border-border bg-primary p-6 text-left text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] opacity-80">
            <Sparkles className="h-3.5 w-3.5" /> Mixed quiz
          </div>
          <h2 className="mt-2 font-display text-2xl">All signs, shuffled</h2>
          <p className="mt-1 text-sm opacity-90">One question at a time. Wrong answers show the sign and the correct meaning.</p>
          <span className="mt-4 inline-block text-sm font-medium underline underline-offset-4">Start quiz →</span>
        </button>
        <button
          onClick={() => setMode({ kind: "learn" })}
          className="group border border-border bg-card p-6 text-left transition-colors hover:bg-secondary"
        >
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <SignpostBig className="h-3.5 w-3.5 text-accent" /> Study
          </div>
          <h2 className="mt-2 font-display text-2xl">Learn every sign</h2>
          <p className="mt-1 text-sm text-muted-foreground">Browse the full library grouped by category with the meaning of each sign.</p>
          <span className="mt-4 inline-block text-sm font-medium text-accent">Open gallery →</span>
        </button>
      </div>

      <h2 className="mt-12 font-display text-2xl">Categories</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Pick a category to focus on. Each one has its own quiz.</p>
      <div className="mt-6 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
        {signCategories.map((c) => {
          const count = signsByCategory(c.slug).length;
          return (
            <div key={c.slug} className="bg-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl text-foreground">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
                </div>
                <Badge variant="outline">{count}</Badge>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" className="rounded-none" onClick={() => setMode({ kind: "quiz", category: c.slug })}>
                  Quiz →
                </Button>
                <Button size="sm" variant="outline" className="rounded-none" onClick={() => setMode({ kind: "learn", category: c.slug })}>
                  Learn
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </PortalShell>
  );
}

function LearnGallery({ category, onExit }: { category?: SignCategory; onExit: () => void }) {
  const groups = category ? [category] : signCategories.map((c) => c.slug);
  return (
    <div>
      <button onClick={onExit} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
      <div className="mt-6 space-y-10">
        {groups.map((g) => {
          const meta = signCategories.find((c) => c.slug === g)!;
          const items = signsByCategory(g);
          return (
            <section key={g}>
              <h3 className="font-display text-2xl">{meta.title}</h3>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{meta.blurb}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((s) => (
                  <div key={s.id} className="flex gap-4 border border-border bg-card p-4">
                    <div className="flex h-[110px] w-[110px] shrink-0 items-center justify-center">
                      <OfficialSignImage sign={s} variant="card" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-base leading-tight">{s.name}</div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.meaning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

type QState =
  | { phase: "answering"; chosen: null }
  | { phase: "revealed"; chosen: number };

function SignsQuiz({ category, onExit }: { category?: SignCategory; onExit: () => void }) {
  const pool = useMemo(() => shuffle(category ? signsByCategory(category) : signs), [category]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState({ answered: 0, correct: 0 });
  const [finished, setFinished] = useState(false);
  const [missed, setMissed] = useState<Sign[]>([]);
  const current: Sign | undefined = pool[idx];
  const opts = useMemo(() => (current ? buildSignOptions(current, category ? signsByCategory(category) : signs) : null), [current, category]);
  const [state, setState] = useState<QState>({ phase: "answering", chosen: null });

  if (!current || finished) {
    const pct = score.answered ? Math.round((score.correct / score.answered) * 100) : 0;
    const passed = pct >= 86;
    return (
      <div className="mx-auto max-w-xl border border-border bg-card p-8 text-center">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Quiz complete</div>
        <h2 className="mt-2 font-display text-3xl">Signs quiz</h2>
        <div className={`mt-6 font-display text-6xl ${passed ? "text-success" : "text-foreground"}`}>{pct}%</div>
        <p className="mt-2 text-sm text-muted-foreground">{score.correct} correct out of {score.answered}.</p>
        {missed.length > 0 && (
          <div className="mt-6 border-t border-border pt-6 text-left">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Review missed signs</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {missed.map((s) => (
                <div key={s.id} className="flex gap-3 border border-border p-3">
                  <OfficialSignImage sign={s} variant="thumb" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{s.name}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{s.meaning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            size="sm"
            className="rounded-none"
            onClick={() => {
              setIdx(0);
              setScore({ answered: 0, correct: 0 });
              setMissed([]);
              setFinished(false);
              setState({ phase: "answering", chosen: null });
            }}
          >
            Retake
          </Button>
          <Button size="sm" variant="outline" className="rounded-none" onClick={onExit}>Back</Button>
        </div>
      </div>
    );
  }

  const choose = (i: number) => {
    if (state.phase === "revealed" || !opts) return;
    const isRight = i === opts.correctIndex;
    setState({ phase: "revealed", chosen: i });
    setScore((s) => ({ answered: s.answered + 1, correct: s.correct + (isRight ? 1 : 0) }));
    if (!isRight) setMissed((m) => [...m, current]);
  };

  const next = () => {
    if (idx + 1 >= pool.length) {
      setFinished(true);
    } else {
      setIdx((i) => i + 1);
      setState({ phase: "answering", chosen: null });
    }
  };

  const answered = state.phase === "revealed";
  const correct = answered && opts && state.chosen === opts.correctIndex;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div className="border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
          <span>Question {idx + 1} of {pool.length}</span>
          <button onClick={onExit} className="hover:text-foreground">Back →</button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex h-[200px] items-center justify-center">
            <OfficialSignImage sign={current} variant="detail" />
          </div>
          <h2 className="text-center font-display text-2xl leading-snug">What does this sign mean?</h2>
        </div>

        <ul className="mt-8 space-y-3">
          {opts?.options.map((opt, i) => {
            const isChosen = state.chosen === i;
            const isCorrect = opts.correctIndex === i;
            const stateClass = !answered
              ? "border-border hover:border-primary"
              : isCorrect
              ? "border-success bg-success/10"
              : isChosen
              ? "border-destructive bg-destructive/10"
              : "border-border opacity-70";
            return (
              <li key={i}>
                <button
                  onClick={() => choose(i)}
                  disabled={answered}
                  className={`flex w-full items-start gap-3 border p-4 text-left transition-colors ${stateClass} ${answered ? "cursor-default" : ""}`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                      answered && isCorrect
                        ? "border-success bg-success text-success-foreground"
                        : answered && isChosen
                        ? "border-destructive bg-destructive text-destructive-foreground"
                        : "border-border"
                    }`}
                  >
                    {answered && isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : answered && isChosen ? <XCircle className="h-3.5 w-3.5" /> : String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm leading-relaxed">{opt}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {answered && (
          <div className={`mt-6 border-l-4 p-4 ${correct ? "border-success bg-success/5" : "border-destructive bg-destructive/5"}`}>
            <div className={`text-sm font-medium ${correct ? "text-success" : "text-destructive"}`}>
              {correct ? "Correct" : "Not quite — here's the sign explained"}
            </div>
            <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row">
              <div className="shrink-0"><OfficialSignImage sign={current} variant="feedback" /></div>
              <div>
                <div className="font-display text-lg">{current.name}</div>
                <p className="mt-1 text-sm text-muted-foreground">{current.meaning}</p>
              </div>
            </div>
            <Button onClick={next} size="sm" className="mt-5 rounded-none">
              {idx + 1 >= pool.length ? "See your score →" : "Next question →"}
            </Button>
          </div>
        )}
      </div>

      <aside className="border border-border bg-card p-5">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">This session</div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Answered</div>
            <div className="font-display text-2xl">{score.answered}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Correct</div>
            <div className="font-display text-2xl text-success">{score.correct}</div>
          </div>
        </div>
        <Progress value={score.answered ? (score.correct / score.answered) * 100 : 0} className="mt-4 h-1.5" />
        <p className="mt-4 text-xs text-muted-foreground">Aim for 86% — that's the DVSA pass mark.</p>
      </aside>
    </div>
  );
}