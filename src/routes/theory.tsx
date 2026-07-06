import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { theoryCategories, sampleTheoryQuestions, type TheoryQuestion } from "@/data/theory";
import { CheckCircle2, XCircle, BookOpen, FileText, Lightbulb, Sparkles, Target, Clock, ShieldCheck, Eye as Eye2, Trophy } from "lucide-react";
import { addMistake, removeMistake } from "@/lib/mistakes";
import { OfflineDownloadButton } from "@/components/OfflineDownloadButton";
import { DVSADisclaimer } from "@/components/DVSADisclaimer";

export const Route = createFileRoute("/theory")({
  head: () => ({ meta: [{ title: "Theory portal · GSM" }] }),
  validateSearch: (search: Record<string, unknown>): { category?: string } => {
    return typeof search.category === "string" ? { category: search.category } : {};
  },
  component: TheoryPage,
});

function TheoryPage() {
  const { category: initialCategory } = Route.useSearch();
  const [active, setActive] = useState<string | null>(
    initialCategory && theoryCategories.some((c) => c.slug === initialCategory)
      ? initialCategory
      : null,
  );
  const [mock, setMock] = useState(false);

  // Deep-links from the review page can change the category param while the
  // component is already mounted — react to it so "Practice this topic" always
  // opens the right revision session.
  useEffect(() => {
    if (
      initialCategory &&
      theoryCategories.some((c) => c.slug === initialCategory) &&
      initialCategory !== active
    ) {
      setActive(initialCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategory]);

  const { data: progress = [] } = useQuery({
    queryKey: ["theory_progress"],
    queryFn: async () => {
      const { data } = await supabase.from("theory_progress").select("*");
      return data ?? [];
    },
  });

  const totalAnswered = progress.reduce((s, p) => s + p.questions_answered, 0);
  const totalCorrect = progress.reduce((s, p) => s + p.questions_correct, 0);
  const accuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const completedCount = progress.filter((p) => p.completed_at).length;

  if (mock) {
    return (
      <PortalShell eyebrow="DVSA mock test" title="Full mock theory test">
        <MockExam onExit={() => setMock(false)} />
      </PortalShell>
    );
  }

  if (active) {
    return (
      <PortalShell eyebrow="Theory revision" title={theoryCategories.find((c) => c.slug === active)?.title ?? "Practice"}>
        <CategoryPractice slug={active} onExit={() => setActive(null)} />
      </PortalShell>
    );
  }

  return (
    <PortalShell eyebrow="DVSA Highway Code" title="Theory portal">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Questions answered" value={String(totalAnswered)} />
        <Stat label="Accuracy" value={`${accuracy}%`} accent />
        <Stat label="Topics completed" value={`${completedCount} / ${theoryCategories.length}`} />
      </div>

      <div className="mt-6">
        <OfflineDownloadButton
          sectionKey="theory"
          label="all 14 theory topics"
          urls={["/theory", "/highway-code", "/road-signs", "/mock-tests", ...theoryCategories.map((c) => `/theory?category=${c.slug}`)]}
        />
      </div>

      <StudyPack />

      <div className="mt-6">
        <DVSADisclaimer />
      </div>

      <div className="mt-10 border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Exam simulation</div>
            <h2 className="mt-2 font-display text-2xl">Full DVSA mock test</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              50 questions mixed across all 14 categories. Same 57-minute timer and 86% pass mark (43/50) as the real DVSA test. Correct answers and explanations are shown the moment you get one wrong.
            </p>
          </div>
          <Button onClick={() => setMock(true)} className="rounded-none" size="lg">Start mock test →</Button>
        </div>
      </div>

      <h2 className="mt-12 font-display text-2xl">All 14 DVSA categories</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Pick a category to revise. Each one has key points to learn first, then practice questions with explanations. Your progress saves automatically.
      </p>
      <div className="mt-6 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
        {theoryCategories.map((c) => {
          const p = progress.find((x) => x.category_slug === c.slug);
          const answered = p?.questions_answered ?? 0;
          const best = p?.best_score_pct ?? 0;
          const last = p?.last_score_pct ?? 0;
          const attempts = p?.attempts ?? 0;
          const completed = !!p?.completed_at;
          return (
            <button
              key={c.slug}
              onClick={() => setActive(c.slug)}
              className="group bg-card p-6 text-left transition-colors hover:bg-secondary"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl text-foreground">{c.title}</h3>
                    {completed && (
                      <span title="Quiz passed" className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-success">
                        <Trophy className="h-3 w-3" /> Passed
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                </div>
                <BookOpen className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.topics.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
              </div>
              <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                <span>{attempts === 0 ? "Not started" : `${attempts} attempt${attempts === 1 ? "" : "s"}`}</span>
                {attempts > 0 && (
                  <span className="font-medium text-foreground">
                    Best {best}% · Last {last}%
                  </span>
                )}
              </div>
              <Progress value={best} className="mt-2 h-1" />
            </button>
          );
        })}
      </div>
    </PortalShell>
  );
}

function CategoryPractice({ slug, onExit }: { slug: string; onExit: () => void }) {
  const queryClient = useQueryClient();
  const category = theoryCategories.find((c) => c.slug === slug);
  const fullPool = sampleTheoryQuestions.filter((q) => q.category === slug);
  const [poolIndices, setPoolIndices] = useState<number[]>(() => fullPool.map((_, i) => i));
  const pool = poolIndices.map((i) => fullPool[i]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState({ answered: 0, correct: 0 });
  const [finished, setFinished] = useState(false);
  const [missed, setMissed] = useState<number[]>([]);
  const [retakeMode, setRetakeMode] = useState(false);

  // DVSA pace: 57 minutes for 50 questions = 68.4s per question.
  const SECONDS_PER_Q = Math.round((57 * 60) / 50);
  const totalSeconds = pool.length * SECONDS_PER_Q;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const timeUpRef = useRef(false);

  useEffect(() => {
    if (finished) return;
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [finished, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0 && !finished && !timeUpRef.current) {
      timeUpRef.current = true;
      saveAttempt.mutate({ answered: score.answered, correct: score.correct });
      setFinished(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, finished]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const lowTime = secondsLeft <= 30;

  const save = useMutation({
    mutationFn: async (delta: { answered: number; correct: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: existing } = await supabase
        .from("theory_progress")
        .select("*").eq("user_id", user.id).eq("category_slug", slug).maybeSingle();
      if (existing) {
        await supabase.from("theory_progress").update({
          questions_answered: existing.questions_answered + delta.answered,
          questions_correct: existing.questions_correct + delta.correct,
          last_studied_at: new Date().toISOString(),
        }).eq("id", existing.id);
      } else {
        await supabase.from("theory_progress").insert({
          user_id: user.id,
          category_slug: slug,
          questions_answered: delta.answered,
          questions_correct: delta.correct,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["theory_progress"] });
    },
  });

  const saveAttempt = useMutation({
    mutationFn: async (attempt: { answered: number; correct: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const pct = attempt.answered ? Math.round((attempt.correct / attempt.answered) * 100) : 0;
      const { data: existing } = await supabase
        .from("theory_progress")
        .select("*").eq("user_id", user.id).eq("category_slug", slug).maybeSingle();
      const completedAt = pct >= 86
        ? (existing?.completed_at ?? new Date().toISOString())
        : (existing?.completed_at ?? null);
      const best = Math.max(existing?.best_score_pct ?? 0, pct);
      if (existing) {
        await supabase.from("theory_progress").update({
          best_score_pct: best,
          last_score_pct: pct,
          attempts: (existing.attempts ?? 0) + 1,
          completed_at: completedAt,
          last_studied_at: new Date().toISOString(),
        }).eq("id", existing.id);
      } else {
        await supabase.from("theory_progress").insert({
          user_id: user.id,
          category_slug: slug,
          best_score_pct: pct,
          last_score_pct: pct,
          attempts: 1,
          completed_at: completedAt,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["theory_progress"] });
    },
  });

  if (pool.length === 0) {
    return (
      <div className="border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">No quiz questions for this topic yet.</p>
        <Button onClick={onExit} className="mt-4 rounded-none" size="sm">← Back to categories</Button>
      </div>
    );
  }

  if (finished) {
    // DVSA: scored out of the full paper, not just answered questions.
    const pct = pool.length ? Math.round((score.correct / pool.length) * 100) : 0;
    const passed = pct >= 86;
    const resetAll = () => {
      setPoolIndices(fullPool.map((_, i) => i));
      setIdx(0); setChosen(null); setScore({ answered: 0, correct: 0 });
      setMissed([]); setRetakeMode(false); setFinished(false);
      setSecondsLeft(fullPool.length * SECONDS_PER_Q);
      timeUpRef.current = false;
    };
    const retakeMissed = () => {
      setPoolIndices(missed);
      setIdx(0); setChosen(null); setScore({ answered: 0, correct: 0 });
      setMissed([]); setRetakeMode(true); setFinished(false);
      setSecondsLeft(missed.length * SECONDS_PER_Q);
      timeUpRef.current = false;
    };
    return (
      <div className="mx-auto max-w-xl border border-border bg-card p-8 text-center">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{retakeMode ? "Retake complete" : "Quiz complete"}</div>
        <h2 className="mt-2 font-display text-3xl">{category?.title}</h2>
        <div className={`mt-6 font-display text-6xl ${passed ? "text-success" : "text-foreground"}`}>{pct}%</div>
        <p className="mt-2 text-sm text-muted-foreground">You got {score.correct} of {pool.length} correct.</p>
        <p className="mt-1 text-xs text-muted-foreground">{passed ? "Above the DVSA pass mark (86%). Strong work." : "Aim for 86% to match the DVSA pass mark."}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {missed.length > 0 && (
            <Button onClick={retakeMissed} className="rounded-none" size="sm">
              Retake missed ({missed.length})
            </Button>
          )}
          <Button onClick={resetAll} variant={missed.length > 0 ? "outline" : "default"} className="rounded-none" size="sm">
            Retake full quiz
          </Button>
          <Button onClick={onExit} variant="outline" className="rounded-none" size="sm">Back to categories</Button>
        </div>
      </div>
    );
  }

  const q: TheoryQuestion = pool[idx];
  const answered = chosen !== null;
  const correct = chosen === q.correctIndex;

  const onChoose = (i: number) => {
    if (answered) return;
    setChosen(i);
    const isCorrect = i === q.correctIndex;
    const delta = { answered: 1, correct: isCorrect ? 1 : 0 };
    setScore((s) => ({ answered: s.answered + 1, correct: s.correct + delta.correct }));
    if (!isCorrect) setMissed((m) => [...m, poolIndices[idx]]);
    if (isCorrect) removeMistake(q.id);
    else addMistake(q.id);
    save.mutate(delta);
  };

  const next = () => {
    if (idx + 1 >= pool.length) {
      saveAttempt.mutate({ answered: pool.length, correct: score.correct });
      setFinished(true);
    } else {
      setChosen(null);
      setIdx((i) => i + 1);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="col-span-full border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${lowTime ? "border-destructive bg-destructive/10" : "border-border bg-secondary/50"}`}>
              <Clock className={`h-5 w-5 ${lowTime ? "text-destructive" : "text-accent"}`} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Time remaining</div>
              <div className={`font-display text-3xl tabular-nums leading-none ${lowTime ? "text-destructive" : "text-foreground"}`}>{mm}:{ss}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-none border border-border px-3 py-1.5">Question {idx + 1} of {pool.length}</span>
            <span className="rounded-none border border-border px-3 py-1.5">{score.answered} answered</span>
            <span className="rounded-none border border-border px-3 py-1.5">Pass at 86%</span>
          </div>
        </div>
        <div className="mt-3">
          <Progress value={score.answered ? (score.correct / score.answered) * 100 : 0} className="h-1.5" />
        </div>
      </div>

      <div className="border border-border bg-card p-6 sm:p-8">
        {category && category.keyPoints.length > 0 && (
          <div className="mb-6 border border-border bg-secondary/40 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5 text-accent" /> Key points to remember
            </div>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground">
              {category.keyPoints.map((kp) => (
                <li key={kp} className="flex gap-2"><span className="text-accent">·</span><span>{kp}</span></li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
          <span>Question {idx + 1} of {pool.length}</span>
          <button onClick={onExit} className="hover:text-foreground">Back to categories →</button>
        </div>
        <h2 className="mt-4 font-display text-2xl leading-snug text-foreground">{q.question}</h2>
        <ul className="mt-6 space-y-3">
          {q.options.map((opt, i) => {
            const isChosen = chosen === i;
            const isCorrect = q.correctIndex === i;
            const state = !answered ? "default" : isCorrect ? "correct" : isChosen ? "wrong" : "default";
            return (
              <li key={i}>
                <button
                  onClick={() => onChoose(i)}
                  disabled={answered}
                  className={`flex w-full items-start gap-3 border p-4 text-left transition-colors ${
                    state === "correct" ? "border-success bg-success/10" :
                    state === "wrong" ? "border-destructive bg-destructive/10" :
                    "border-border hover:border-primary"
                  } ${answered ? "cursor-default" : ""}`}
                >
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                    state === "correct" ? "border-success bg-success text-success-foreground" :
                    state === "wrong" ? "border-destructive bg-destructive text-destructive-foreground" :
                    "border-border"
                  }`}>
                    {state === "correct" ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                     state === "wrong" ? <XCircle className="h-3.5 w-3.5" /> :
                     String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm leading-relaxed">{opt}</span>
                </button>
                {answered && q.optionExplanations?.[i] && (
                  <p className={`mt-2 pl-9 pr-2 text-xs leading-relaxed ${
                    state === "correct" ? "text-success" :
                    state === "wrong" ? "text-destructive" :
                    "text-muted-foreground"
                  }`}>
                    {q.optionExplanations[i]}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        {answered && (
          <div className="mt-6 border-l-4 border-accent bg-accent/5 p-4">
            <div className={`text-sm font-medium ${correct ? "text-success" : "text-destructive"}`}>
              {correct ? "Correct" : "Not quite"}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{q.explanation}</p>
            <Button onClick={next} className="mt-4 rounded-none" size="sm">
              {idx + 1 >= pool.length ? "See your score →" : "Next question →"}
            </Button>
          </div>
        )}
      </div>

      <aside className="border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">This session</div>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">DVSA pace · {SECONDS_PER_Q}s per question.</p>
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
        <p className="mt-4 text-xs text-muted-foreground">
          Aim for 86% on each category. That's the DVSA pass mark.
        </p>
      </aside>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`border border-border p-5 ${accent ? "bg-accent text-accent-foreground" : "bg-card"}`}>
      <div className={`text-[11px] uppercase tracking-[0.18em] ${accent ? "opacity-80" : "text-muted-foreground"}`}>{label}</div>
      <div className="mt-3 font-display text-3xl">{value}</div>
    </div>
  );
}

const MOCK_TOTAL = 50;
const MOCK_SECONDS = 57 * 60;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MockExam({ onExit }: { onExit: () => void }) {
  const [pool, setPool] = useState<TheoryQuestion[]>(() =>
    shuffle(sampleTheoryQuestions).slice(0, Math.min(MOCK_TOTAL, sampleTheoryQuestions.length)),
  );
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(pool.length).fill(null));
  const [finished, setFinished] = useState(false);
  const [deadline] = useState(() => Date.now() + MOCK_SECONDS * 1000);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [finished]);

  const secondsLeft = Math.max(0, Math.round((deadline - now) / 1000));
  useEffect(() => {
    if (secondsLeft === 0 && !finished) setFinished(true);
  }, [secondsLeft, finished]);

  // On finish, sync the mistakes bank: add wrong / unanswered, remove correct.
  useEffect(() => {
    if (!finished) return;
    pool.forEach((qq, i) => {
      const a = answers[i];
      if (a !== null && a === qq.correctIndex) removeMistake(qq.id);
      else addMistake(qq.id);
    });
  }, [finished, pool, answers]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const lowTime = secondsLeft <= 60;

  const q = pool[idx];
  const answered = chosen !== null;
  const correct = chosen === q?.correctIndex;

  const onChoose = (i: number) => {
    if (answered) return;
    setChosen(i);
    setAnswers((a) => {
      const next = a.slice();
      next[idx] = i;
      return next;
    });
  };

  const next = () => {
    if (idx + 1 >= pool.length) {
      setFinished(true);
    } else {
      setChosen(answers[idx + 1] ?? null);
      setIdx((i) => i + 1);
    }
  };

  const prev = () => {
    if (idx === 0) return;
    setChosen(answers[idx - 1] ?? null);
    setIdx((i) => i - 1);
  };

  if (finished) {
    const correctCount = answers.reduce<number>(
      (s, a, i) => s + (a !== null && a === pool[i].correctIndex ? 1 : 0),
      0,
    );
    const pct = pool.length ? Math.round((correctCount / pool.length) * 100) : 0;
    const passed = pct >= 86;
    const byTopic = (() => {
      const map = new Map<string, { total: number; correct: number; answered: number }>();
      pool.forEach((qq, i) => {
        const slug = qq.category;
        const entry = map.get(slug) ?? { total: 0, correct: 0, answered: 0 };
        entry.total += 1;
        const a = answers[i];
        if (a !== null) entry.answered += 1;
        if (a !== null && a === qq.correctIndex) entry.correct += 1;
        map.set(slug, entry);
      });
      return Array.from(map.entries())
        .map(([slug, v]) => ({
          slug,
          title: theoryCategories.find((c) => c.slug === slug)?.title ?? slug,
          ...v,
          pct: v.total ? Math.round((v.correct / v.total) * 100) : 0,
        }))
        .sort((a, b) => a.pct - b.pct);
    })();
    const restart = () => {
      const fresh = shuffle(sampleTheoryQuestions).slice(0, Math.min(MOCK_TOTAL, sampleTheoryQuestions.length));
      setPool(fresh);
      setAnswers(Array(fresh.length).fill(null));
      setIdx(0);
      setChosen(null);
      setFinished(false);
      // deadline is locked via useState init — force remount instead:
      onExit();
    };
    return (
      <div className="mx-auto max-w-2xl border border-border bg-card p-8">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground text-center">Mock test complete</div>
        <div className={`mt-4 text-center font-display text-6xl ${passed ? "text-success" : "text-foreground"}`}>{pct}%</div>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          You got {correctCount} of {pool.length} correct. {passed ? "Above the DVSA pass mark of 86% (43/50)." : "Aim for 86% (≥43/50) to match the DVSA pass mark."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={restart} className="rounded-none" size="sm">Take another mock →</Button>
          <Button onClick={onExit} variant="outline" className="rounded-none" size="sm">Back to theory</Button>
        </div>
        <div className="mt-8 border-t border-border pt-6">
          <h3 className="font-display text-lg">Performance by topic</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Weak topics rank first. Aim for 86%+ on every category.
          </p>
          <ul className="mt-4 space-y-3">
            {byTopic.map((t) => {
              const topicPassed = t.pct >= 86;
              const noQs = t.total === 0;
              return (
                <li key={t.slug} className="border border-border p-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="text-sm font-medium text-foreground">{t.title}</div>
                    <div className={`font-display text-lg tabular-nums ${noQs ? "text-muted-foreground" : topicPassed ? "text-success" : "text-destructive"}`}>
                      {noQs ? "—" : `${t.pct}%`}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{t.correct} / {t.total} correct{t.answered < t.total ? ` · ${t.total - t.answered} unanswered` : ""}</span>
                    <span>{topicPassed ? "Pass" : noQs ? "" : "Below pass mark"}</span>
                  </div>
                  <Progress value={t.pct} className="mt-2 h-1" />
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mt-8 border-t border-border pt-6">
          <h3 className="font-display text-lg">Review every question</h3>
          <ul className="mt-4 space-y-4">
            {pool.map((qq, i) => {
              const a = answers[i];
              const isCorrect = a !== null && a === qq.correctIndex;
              const unanswered = a === null;
              return (
                <li key={i} className="border border-border p-4">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    <span>Q{i + 1}</span>
                    <span className={isCorrect ? "text-success" : "text-destructive"}>
                      {unanswered ? "Unanswered" : isCorrect ? "Correct" : "Wrong"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">{qq.question}</p>
                  <p className="mt-2 text-xs text-success">
                    Correct answer: {String.fromCharCode(65 + qq.correctIndex)}. {qq.options[qq.correctIndex]}
                  </p>
                  {!isCorrect && !unanswered && a !== null && (
                    <p className="mt-1 text-xs text-destructive">
                      Your answer: {String.fromCharCode(65 + a)}. {qq.options[a]}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">{qq.explanation}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="col-span-full border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${lowTime ? "border-destructive bg-destructive/10" : "border-border bg-secondary/50"}`}>
              <Clock className={`h-5 w-5 ${lowTime ? "text-destructive" : "text-accent"}`} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Time remaining</div>
              <div className={`font-display text-3xl tabular-nums leading-none ${lowTime ? "text-destructive" : "text-foreground"}`}>{mm}:{ss}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-none border border-border px-3 py-1.5">Question {idx + 1} of {pool.length}</span>
            <span className="rounded-none border border-border px-3 py-1.5">{answers.filter((a) => a !== null).length} answered</span>
            <span className="rounded-none border border-border px-3 py-1.5">Pass at 86%</span>
          </div>
        </div>
        <div className="mt-3">
          <Progress value={(answers.filter((a) => a !== null).length / pool.length) * 100} className="h-1.5" />
        </div>
      </div>

      <div className="border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
          <span>Question {idx + 1} of {pool.length}</span>
          <button onClick={onExit} className="hover:text-foreground">Exit mock →</button>
        </div>
        <h2 className="mt-4 font-display text-2xl leading-snug text-foreground">{q.question}</h2>
        <ul className="mt-6 space-y-3">
          {q.options.map((opt, i) => {
            const isChosen = chosen === i;
            const isCorrect = q.correctIndex === i;
            const state = !answered ? (isChosen ? "selected" : "default") : isCorrect ? "correct" : isChosen ? "wrong" : "default";
            return (
              <li key={i}>
                <button
                  onClick={() => onChoose(i)}
                  disabled={answered}
                  className={`flex w-full items-start gap-3 border p-4 text-left transition-colors ${
                    state === "correct" ? "border-success bg-success/10" :
                    state === "wrong" ? "border-destructive bg-destructive/10" :
                    state === "selected" ? "border-primary" :
                    "border-border hover:border-primary"
                  } ${answered ? "cursor-default" : ""}`}
                >
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                    state === "correct" ? "border-success bg-success text-success-foreground" :
                    state === "wrong" ? "border-destructive bg-destructive text-destructive-foreground" :
                    "border-border"
                  }`}>
                    {state === "correct" ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                     state === "wrong" ? <XCircle className="h-3.5 w-3.5" /> :
                     String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm leading-relaxed">{opt}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {answered && (
          <div className="mt-6 border-l-4 border-accent bg-accent/5 p-4">
            <div className={`text-sm font-medium ${correct ? "text-success" : "text-destructive"}`}>
              {correct ? "Correct" : `Not quite — the correct answer is ${String.fromCharCode(65 + q.correctIndex)}. ${q.options[q.correctIndex]}`}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{q.explanation}</p>
          </div>
        )}
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button onClick={prev} disabled={idx === 0} variant="outline" className="rounded-none" size="sm">← Previous</Button>
          <div className="flex items-center gap-3">
            {!answered && (
              <button onClick={() => { setAnswers((a) => { const n = a.slice(); n[idx] = null; return n; }); next(); }} className="text-sm text-muted-foreground hover:text-foreground">
                Skip
              </button>
            )}
            <Button onClick={next} className="rounded-none" size="sm">
              {idx + 1 >= pool.length ? "Finish & see score →" : "Next →"}
            </Button>
          </div>
        </div>
      </div>

      <aside className="border border-border bg-card p-5">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">DVSA mock</div>
        <p className="mt-2 text-[11px] text-muted-foreground">57 minutes for {pool.length} questions · pass at 86%.</p>
        <div className="mt-4">
          <div className="text-xs text-muted-foreground">Answered</div>
          <div className="font-display text-2xl">{answers.filter((a) => a !== null).length} / {pool.length}</div>
        </div>
        <Progress value={(answers.filter((a) => a !== null).length / pool.length) * 100} className="mt-3 h-1.5" />
        <Button onClick={() => setFinished(true)} variant="outline" className="mt-5 w-full rounded-none" size="sm">
          Finish test now
        </Button>
      </aside>
    </div>
  );
}

function StudyPack() {
  const facts = [
    { icon: Target, label: "Pass mark", value: "43 / 50 (86%)" },
    { icon: Clock, label: "Time allowed", value: "57 minutes" },
    { icon: Eye2, label: "Hazard clips", value: "14 clips · 75 mark" },
    { icon: ShieldCheck, label: "Certificate valid", value: "2 years" },
  ];
  return (
    <section className="mt-10 border border-border bg-card">
      <header className="flex items-center gap-3 border-b border-border bg-secondary/40 px-6 py-4">
        <FileText className="h-5 w-5 text-accent" />
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">GSM Information pack</div>
          <h2 className="font-display text-xl text-foreground">Preparing for your theory test</h2>
        </div>
      </header>
      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="bg-card p-4">
            <f.icon className="h-4 w-4 text-accent" />
            <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{f.label}</div>
            <div className="mt-1 text-sm font-medium text-foreground">{f.value}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Lightbulb className="h-4 w-4 text-accent" /> How the test works
          </div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>· <span className="text-foreground">Part 1:</span> 50 multiple-choice questions across the 14 topics. You need 43 to pass.</li>
            <li>· <span className="text-foreground">Part 2:</span> 14 hazard-perception clips. One has 2 hazards, the rest have 1. Up to 5 points per hazard.</li>
            <li>· You must pass both parts in the same sitting. Hazard pass mark is 44/75.</li>
            <li>· Bring your provisional licence. No phones in the test room.</li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-accent" /> George's 2-week study plan
          </div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>· <span className="text-foreground">Days 1–4:</span> Read the key points for 3–4 categories per day.</li>
            <li>· <span className="text-foreground">Days 5–9:</span> 50-question mock sessions. Review every wrong answer.</li>
            <li>· <span className="text-foreground">Days 10–12:</span> Hazard clips daily — aim for 4/5 on each.</li>
            <li>· <span className="text-foreground">Days 13–14:</span> Two full mocks. Book the test when you score 47+ twice.</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border bg-secondary/30 px-6 py-4 text-xs text-muted-foreground">
        Stuck on a topic? WhatsApp George on 07961 585231 — happy to walk you through it before your next lesson.
      </div>
    </section>
  );
}
