import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Play, Pause, RotateCcw, CheckCircle2, XCircle, AlertTriangle, Sparkles, Lightbulb, Target, HelpCircle, Quote, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// GSM standard lesson engine.
// Every animated lesson uses this shell so learners see the same
// sequence: Title → Objective → Animated diagram (with auto-pause
// interactive questions) → GSM Formula (THINK) → The Rule → Why →
// George Explains → Common Mistakes → GSM Tips → Key Takeaway.
// Only the animation `render` and the copy change per lesson.
// ─────────────────────────────────────────────────────────────

export type LessonQuestion = {
  at: number; // 0..1 progress at which to auto-pause
  prompt: string;
  options: { label: string; correct?: boolean; explain: string }[];
};

export type LessonCaption = { at: number; label: string; detail?: string };

export type Lesson = {
  slug: string;
  title: string;
  category: string; // e.g. "Highway Code • Practical Driving Skills"
  rule?: string;
  objective: string;
  think: string[]; // 3–5 questions the driver should ask themselves
  ruleHeadline: string;
  ruleBullets: string[];
  why: ReactNode;
  georgeExplains: string;
  commonMistakes: string[];
  gsmTips: string[];
  keyTakeaway: string;
  durationMs?: number;
  captions?: LessonCaption[];
  questions?: LessonQuestion[];
  render: (t: number) => ReactNode;
};

export function LessonShell({ lesson, next }: { lesson: Lesson; next?: { slug: string; title: string } | null }) {
  const durationMs = lesson.durationMs ?? 14000;
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0);
  const raf = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef(0);

  const questions = lesson.questions ?? [];
  const [answered, setAnswered] = useState<Record<number, number>>({});
  const [activeQ, setActiveQ] = useState<number | null>(null);

  // Animation loop. Auto-pauses at any un-answered question beat.
  useEffect(() => {
    if (!playing) {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      startRef.current = null;
      baseRef.current = t;
      return;
    }
    const step = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      let next = (baseRef.current + elapsed / durationMs) % 1;

      // Check if we've crossed an un-answered question beat.
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (answered[i] === undefined && t <= q.at && next >= q.at) {
          next = q.at;
          setT(next);
          baseRef.current = next;
          startRef.current = null;
          setPlaying(false);
          setActiveQ(i);
          return;
        }
      }
      setT(next);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, durationMs, answered]);

  const reset = useCallback(() => {
    setT(0);
    baseRef.current = 0;
    startRef.current = null;
    setAnswered({});
    setActiveQ(null);
    setPlaying(true);
  }, []);

  const answer = (qi: number, oi: number) => {
    setAnswered((prev) => ({ ...prev, [qi]: oi }));
  };

  const resume = () => {
    setActiveQ(null);
    setPlaying(true);
  };

  const activeCaption = (lesson.captions ?? []).reduce<LessonCaption | null>(
    (acc, b) => (t >= b.at ? b : acc),
    null,
  );
  const q = activeQ !== null ? questions[activeQ] : null;
  const chosen = activeQ !== null ? answered[activeQ] : undefined;

  return (
    <article className="space-y-6">
      {/* 1. TITLE */}
      <header>
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">{lesson.title}</h1>
        <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {lesson.category}
          {lesson.rule ? <span className="ml-2 text-accent">{lesson.rule}</span> : null}
        </div>
      </header>

      {/* 2. OBJECTIVE */}
      <Section icon={<Target className="h-4 w-4" />} eyebrow="Learning objective" tone="default">
        <p className="text-base leading-relaxed">{lesson.objective}</p>
      </Section>

      {/* 3. ANIMATED DIAGRAM */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          <div className="text-[11px] uppercase tracking-[0.2em] text-accent">Animated diagram</div>
          <div className="flex shrink-0 gap-1">
            <ControlButton onClick={() => setPlaying((v) => !v)} label={playing ? "Pause" : "Play"}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </ControlButton>
            <ControlButton onClick={reset} label="Restart">
              <RotateCcw className="h-4 w-4" />
            </ControlButton>
          </div>
        </div>
        <div className="relative w-full overflow-hidden bg-[#1a1a1c]" style={{ aspectRatio: "16/9" }}>
          {lesson.render(t)}
          {q && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 text-left shadow-lg">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-accent">
                  <HelpCircle className="h-4 w-4" /> Your call
                </div>
                <p className="mt-2 font-display text-lg leading-snug">{q.prompt}</p>
                <div className="mt-4 grid gap-2">
                  {q.options.map((opt, oi) => {
                    const picked = chosen === oi;
                    const showResult = chosen !== undefined;
                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={showResult}
                        onClick={() => answer(activeQ!, oi)}
                        className={cn(
                          "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                          !showResult && "border-border bg-background hover:border-accent",
                          showResult && opt.correct && "border-emerald-500/60 bg-emerald-500/10",
                          showResult && picked && !opt.correct && "border-red-500/60 bg-red-500/10",
                          showResult && !picked && !opt.correct && "border-border/50 opacity-60",
                        )}
                      >
                        {showResult && opt.correct ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        ) : showResult && picked ? (
                          <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                        ) : (
                          <span className="h-4 w-4 shrink-0 rounded-full border border-border" />
                        )}
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                {chosen !== undefined && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {q.options[chosen].explain}
                    </p>
                    <button
                      type="button"
                      onClick={resume}
                      className="w-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Scrub bar */}
        <div className="relative h-1.5 w-full bg-secondary">
          <div className="absolute left-0 top-0 h-full bg-accent" style={{ width: `${t * 100}%` }} />
          {questions.map((qq, i) => (
            <div
              key={i}
              className={cn(
                "absolute top-0 h-full w-0.5",
                answered[i] !== undefined ? "bg-emerald-500" : "bg-yellow-400",
              )}
              style={{ left: `${qq.at * 100}%` }}
              title="Interactive question"
            />
          ))}
        </div>
        {activeCaption && (
          <div className="border-t border-border p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-accent">Now happening</div>
            <div className="mt-1 font-display text-base">{activeCaption.label}</div>
            {activeCaption.detail && (
              <p className="mt-1 text-sm text-muted-foreground">{activeCaption.detail}</p>
            )}
          </div>
        )}
      </div>

      {/* 4. THE GSM FORMULA — THINK */}
      <Section icon={<Sparkles className="h-4 w-4" />} eyebrow="The GSM formula" tone="accent">
        <div className="font-display text-2xl tracking-wide">THINK</div>
        <p className="mt-1 text-sm text-muted-foreground">Before you act — ask yourself:</p>
        <ol className="mt-4 space-y-2">
          {lesson.think.map((q2, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="font-mono text-accent">{String(i + 1).padStart(2, "0")}</span>
              <span>{q2}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* 5. THE RULE */}
      <div className="rounded-xl border-2 border-accent bg-accent/5 p-5 shadow-sm">
        <div className="text-[11px] uppercase tracking-[0.2em] text-accent">The rule</div>
        <p className="mt-2 font-display text-xl leading-snug">{lesson.ruleHeadline}</p>
        <ul className="mt-3 space-y-1.5 text-sm">
          {lesson.ruleBullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 6. WHY */}
      <Section icon={<Lightbulb className="h-4 w-4" />} eyebrow="Why?" tone="default">
        <div className="prose-sm space-y-3 text-sm leading-relaxed">{lesson.why}</div>
      </Section>

      {/* 7. GEORGE EXPLAINS */}
      <div className="rounded-xl border-l-4 border-accent bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-accent">
          <Quote className="h-4 w-4" /> George explains
        </div>
        <p className="mt-2 text-sm italic leading-relaxed">{lesson.georgeExplains}</p>
      </div>

      {/* 8. COMMON MISTAKES */}
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-red-500">
          <AlertTriangle className="h-4 w-4" /> Common mistakes
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {lesson.commonMistakes.map((m, i) => (
            <li key={i} className="flex gap-2 leading-relaxed">
              <span className="text-red-500">✕</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 9. GSM TIPS */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-emerald-600">
          <CheckCircle2 className="h-4 w-4" /> George's Tip
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {lesson.gsmTips.map((tp, i) => (
            <li key={i} className="flex gap-2 leading-relaxed">
              <span className="text-emerald-600">✓</span>
              <span>{tp}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 10. KEY TAKEAWAY */}
      <div className="rounded-xl bg-foreground p-5 text-background shadow-md">
        <div className="text-[11px] uppercase tracking-[0.25em] opacity-70">Key takeaway</div>
        <p className="mt-2 font-display text-lg leading-snug">{lesson.keyTakeaway}</p>
      </div>

      {/* 11. NEXT LESSON */}
      {next && (
        <Link
          to="/driving-clips/$slug"
          params={{ slug: next.slug }}
          className="group flex items-center justify-between gap-4 rounded-xl border border-accent/40 bg-accent/5 p-5 shadow-sm transition-colors hover:border-accent hover:bg-accent/10"
        >
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-accent">Next lesson</div>
            <div className="mt-1 font-display text-lg leading-snug">{next.title}</div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-accent transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </article>
  );
}

function Section({
  eyebrow,
  icon,
  tone,
  children,
}: {
  eyebrow: string;
  icon: ReactNode;
  tone: "default" | "accent";
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border p-5 shadow-sm",
        tone === "accent" ? "border-accent/40 bg-accent/5" : "border-border bg-card",
      )}
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent">
        {icon} {eyebrow}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ControlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-md border border-border bg-background transition-colors hover:bg-secondary"
    >
      {children}
    </button>
  );
}