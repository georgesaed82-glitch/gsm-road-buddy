import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { theoryCategories, sampleTheoryQuestions, type TheoryQuestion } from "@/data/theory";
import { CheckCircle2, XCircle, BookOpen, FileText, Lightbulb, Sparkles, Target, Clock, ShieldCheck, Eye as Eye2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/theory")({
  head: () => ({ meta: [{ title: "Theory portal · GSM" }] }),
  component: TheoryPage,
});

function TheoryPage() {
  const [active, setActive] = useState<string | null>(null);

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
        <Stat label="Categories started" value={`${progress.length} / ${theoryCategories.length}`} />
      </div>

      <StudyPack />

      <h2 className="mt-12 font-display text-2xl">All 14 DVSA categories</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Pick a category to revise. Each one has key points to learn first, then DVSA-style questions with explanations. Your progress saves automatically.
      </p>
      <div className="mt-6 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
        {theoryCategories.map((c) => {
          const p = progress.find((x) => x.category_slug === c.slug);
          const answered = p?.questions_answered ?? 0;
          const correct = p?.questions_correct ?? 0;
          const pct = answered ? Math.round((correct / answered) * 100) : 0;
          return (
            <button
              key={c.slug}
              onClick={() => setActive(c.slug)}
              className="group bg-card p-6 text-left transition-colors hover:bg-secondary"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl text-foreground">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                </div>
                <BookOpen className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.topics.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
              </div>
              <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                <span>{answered} / {c.totalQuestions} attempted</span>
                {answered > 0 && <span className="font-medium text-foreground">{pct}% correct</span>}
              </div>
              <Progress value={(answered / c.totalQuestions) * 100} className="mt-2 h-1" />
            </button>
          );
        })}
      </div>
    </PortalShell>
  );
}

function CategoryPractice({ slug, onExit }: { slug: string; onExit: () => void }) {
  const queryClient = useQueryClient();
  const questions = sampleTheoryQuestions.filter((q) => q.category === slug);
  const pool = questions.length > 0 ? questions : sampleTheoryQuestions;
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState({ answered: 0, correct: 0 });

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

  const q: TheoryQuestion = pool[idx % pool.length];
  const answered = chosen !== null;
  const correct = chosen === q.correctIndex;

  const onChoose = (i: number) => {
    if (answered) return;
    setChosen(i);
    const delta = { answered: 1, correct: i === q.correctIndex ? 1 : 0 };
    setScore((s) => ({ answered: s.answered + 1, correct: s.correct + delta.correct }));
    save.mutate(delta);
  };

  const next = () => { setChosen(null); setIdx((i) => i + 1); };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
          <span>Question {idx + 1}</span>
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
            <Button onClick={next} className="mt-4 rounded-none" size="sm">Next question →</Button>
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
