import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OfficialSignImage } from "@/components/OfficialSignImage";
import { signGroups, signGroupOf, buildSignOptions, type Sign, type SignGroup } from "@/data/signs";
import { CheckCircle2, XCircle, SignpostBig, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { OfflineDownloadButton } from "@/components/OfflineDownloadButton";
import { useEffect } from "react";
import { saveAttempt, type QuizAttemptItem } from "@/lib/quizAttempts";
import { useSignsCms } from "@/hooks/useSignsCms";
import { DVSADisclaimer } from "@/components/DVSADisclaimer";

export const Route = createFileRoute("/_authenticated/road-signs")({
  head: () => ({ meta: [{ title: "Road signs · GSM" }] }),
  component: RoadSignsPage,
});

function RoadSignsPage() {
  const [group, setGroup] = useState<SignGroup | "all">("all");
  const [mode, setMode] = useState<"learn" | "quiz">("learn");
  const { allSigns, applyText, imageFor } = useSignsCms();

  const pool = useMemo(() => {
    const base = group === "all" ? allSigns : allSigns.filter((s) => signGroupOf(s) === group);
    return applyText("sign", base);
  }, [group, applyText, allSigns]);

  return (
    <PortalShell eyebrow="Highway Code" title="Road signs">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Every UK road sign, grouped by type. Choose a category, learn the shapes and colours, then
        flip to quiz mode to test yourself.
      </p>

      <OfflineDownloadButton
        className="mt-6"
        sectionKey="road-signs"
        label="road signs library"
        urls={["/road-signs", "/signs", "/road-markings", "/police-signals"]}
      />

      <div className="mt-6 flex flex-wrap gap-2">
        <CategoryChip active={group === "all"} onClick={() => setGroup("all")}>
          All ({allSigns.length})
        </CategoryChip>
        {signGroups.map((g) => (
          <CategoryChip key={g.slug} active={group === g.slug} onClick={() => setGroup(g.slug)}>
            {g.title} ({allSigns.filter((s) => signGroupOf(s) === g.slug).length})
          </CategoryChip>
        ))}
      </div>

      <div className="mt-6 flex gap-2 border-b border-border">
        <TabBtn active={mode === "learn"} onClick={() => setMode("learn")}>
          Learn
        </TabBtn>
        <TabBtn active={mode === "quiz"} onClick={() => setMode("quiz")}>
          Quiz
        </TabBtn>
      </div>

      {mode === "learn" ? (
        <LearnGrid pool={pool} overrideFor={imageFor} />
      ) : (
        <QuizRunner pool={pool} key={group} overrideFor={imageFor} />
      )}
      <div className="mt-8">
        <DVSADisclaimer />
      </div>
    </PortalShell>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "border px-3 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 px-4 py-2 text-sm transition-colors",
        active
          ? "border-accent text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function LearnGrid({
  pool,
  overrideFor,
}: {
  pool: Sign[];
  overrideFor: (id: string) => string | null;
}) {
  return (
    <div
      data-testid="road-signs-learn-grid"
      className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {pool.map((s) => (
        <div key={s.id} className="flex gap-4 border border-border bg-card p-4">
          <div className="shrink-0">
            <OfficialSignImage sign={s} variant="card" overrideSrc={overrideFor(s.id)} />
          </div>
          <div className="min-w-0">
            <div className="font-display text-base text-foreground">{s.name}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.meaning}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function QuizRunner({
  pool,
  overrideFor,
}: {
  pool: Sign[];
  overrideFor: (id: string) => string | null;
}) {
  const [order, setOrder] = useState<Sign[]>(() => shuffle(pool));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [missed, setMissed] = useState<Sign[]>([]);
  const [q, setQ] = useState(() => buildSignOptions(order[0], pool));
  const [log, setLog] = useState<QuizAttemptItem[]>([]);
  const [savedAttempt, setSavedAttempt] = useState(false);

  const current = order[i];

  // Persist the attempt once the quiz completes.
  useEffect(() => {
    if (current || savedAttempt || log.length === 0) return;
    saveAttempt({
      kind: "signs",
      label: `${order.length} signs`,
      score: right,
      total: order.length,
      items: log,
    });
    setSavedAttempt(true);
  }, [current, savedAttempt, log, order.length, right]);

  const resetRun = (nextOrder: Sign[]) => {
    setOrder(nextOrder);
    setI(0);
    setPicked(null);
    setRight(0);
    setWrong(0);
    setMissed([]);
    setLog([]);
    setSavedAttempt(false);
    setQ(buildSignOptions(nextOrder[0], pool));
  };

  if (!current) {
    return (
      <div className="mt-8 border border-border bg-card p-6">
        <h3 className="font-display text-xl">Quiz complete</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You scored <b>{right}</b> right and <b>{wrong}</b> wrong out of {order.length}.
        </p>
        {missed.length > 0 && (
          <div className="mt-6 border-t border-border pt-6">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Review missed signs ({missed.length})
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {missed.map((s) => (
                <div key={s.id} className="flex gap-3 border border-border p-3">
                  <div className="shrink-0">
                    <OfficialSignImage sign={s} variant="thumb" overrideSrc={overrideFor(s.id)} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{s.name}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{s.meaning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="rounded-none" onClick={() => resetRun(shuffle(pool))}>
            Start again
          </Button>
          {missed.length > 0 && (
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => resetRun(shuffle(missed))}
            >
              Practice missed ({missed.length}) →
            </Button>
          )}
        </div>
      </div>
    );
  }

  const onPick = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    const isCorrect = idx === q.correctIndex;
    if (isCorrect) setRight((n) => n + 1);
    else {
      setWrong((n) => n + 1);
      setMissed((m) => [...m, current]);
    }
    setLog((l) => [
      ...l,
      {
        prompt: `What does this sign mean? (${current.name})`,
        options: q.options,
        correctIndex: q.correctIndex,
        pickedIndex: idx,
        correct: isCorrect,
        explanation: current.meaning,
        meta: current.category,
      },
    ]);
  };

  const next = () => {
    const nextI = i + 1;
    setI(nextI);
    setPicked(null);
    if (order[nextI]) setQ(buildSignOptions(order[nextI], pool));
  };

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Question {i + 1} of {order.length}
        </span>
        <span>
          Right {right} · Wrong {wrong}
        </span>
      </div>
      <Progress value={((i + (picked !== null ? 1 : 0)) / order.length) * 100} />

      <div className="mt-6 grid gap-6 border border-border bg-card p-6 sm:grid-cols-[auto_1fr]">
        <div className="flex items-start justify-center">
          <OfficialSignImage
            sign={current}
            variant="detail"
            overrideSrc={overrideFor(current.id)}
          />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            What does this sign mean?
          </div>
          <div className="mt-4 grid gap-2">
            {q.options.map((opt, idx) => {
              const isCorrect = idx === q.correctIndex;
              const isPicked = picked === idx;
              return (
                <button
                  key={idx}
                  onClick={() => onPick(idx)}
                  disabled={picked !== null}
                  className={cn(
                    "flex items-center justify-between border px-4 py-3 text-left text-sm transition-colors",
                    picked === null && "border-border bg-background hover:bg-secondary",
                    picked !== null &&
                      isCorrect &&
                      "border-emerald-600 bg-emerald-600/10 text-foreground",
                    picked !== null &&
                      isPicked &&
                      !isCorrect &&
                      "border-destructive bg-destructive/10 text-foreground",
                    picked !== null &&
                      !isCorrect &&
                      !isPicked &&
                      "border-border bg-background opacity-60",
                  )}
                >
                  <span>{opt}</span>
                  {picked !== null && isCorrect && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  {picked !== null && isPicked && !isCorrect && (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
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
              {picked !== q.correctIndex && (
                <div className="mt-3 flex gap-4 border border-destructive/40 bg-background p-3">
                  <div className="shrink-0">
                    <OfficialSignImage
                      sign={current}
                      variant="feedback"
                      overrideSrc={overrideFor(current.id)}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      You picked: <span className="text-foreground">{q.options[picked]}</span>
                    </p>
                    <div className="mt-1 font-medium">The right answer is: {current.name}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{current.meaning}</p>
                  </div>
                </div>
              )}
              {picked === q.correctIndex && (
                <>
                  <div className="mt-2 font-medium">{current.name}</div>
                  <p className="mt-1 text-muted-foreground">{current.meaning}</p>
                </>
              )}
              <Button size="sm" className="mt-4 rounded-none" onClick={next}>
                {i + 1 === order.length ? "See results →" : "Next question →"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <SignpostBig className="h-3.5 w-3.5" /> Wrong answers always show the sign with the correct
        meaning.
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        Sign artwork © Crown copyright, from the UK Department for Transport, reused under the{" "}
        <a
          href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          Open Government Licence v3.0
        </a>
        , via Wikimedia Commons.
      </p>
    </div>
  );
}
