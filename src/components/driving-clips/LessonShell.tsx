import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Lightbulb,
  Target,
  HelpCircle,
  Quote,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Circle,
  StepForward,
  Gauge,
  Camera,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useLessonProgress } from "@/lib/lessonProgress";
import { Zoomable } from "@/components/Zoomable";
import { useCameraView, cameraTransform, type CameraView } from "@/hooks/useCameraView";

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

export type LessonMistake = { wrong: string; why: string; right: string };

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
  mistakes?: LessonMistake[]; // optional richer wrong → why → right
  gsmTips: string[];
  keyTakeaway: string;
  durationMs?: number;
  captions?: LessonCaption[];
  questions?: LessonQuestion[];
  render: (t: number) => ReactNode;
  // ── GSM full teaching template (all optional; older lessons still valid) ──
  syllabusKey?: string;         // links to src/data/syllabus.ts entry
  whereItApplies?: string[];    // Where — road types / scenarios
  referencePoints?: string[];   // Reference Points
  bgo?: { blockers: string[]; gap: string; opportunity: string };
  instructorTips?: string[];    // ADI-level tips (separate from George's tips)
  safetyNotes?: string[];       // Safety Notes
  summary?: string[];           // Short summary bullets
  passCriteria?: string[];      // Pass Criteria bullets
};

export function LessonShell({
  lesson,
  next,
  prev,
}: {
  lesson: Lesson;
  next?: { slug: string; title: string } | null;
  prev?: { slug: string; title: string } | null;
}) {
  const durationMs = lesson.durationMs ?? 14000;
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const camera = useCameraView("overhead");
  const raf = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef(0);
  const { isDone, toggle } = useLessonProgress();
  const done = isDone(lesson.slug);

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
      let next = baseRef.current + (elapsed / durationMs) * speed;
      // Play the manoeuvre once from start to finish. When it completes,
      // hold on the final frame so the learner sees the outcome and can
      // choose to Restart. Auto-pause at the next un-answered question
      // beat still takes priority below.
      const finished = next >= 1;
      if (finished) next = 1;

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
      if (finished) {
        baseRef.current = 1;
        startRef.current = null;
        setPlaying(false);
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, durationMs, answered, speed]);

  const reset = useCallback(() => {
    setT(0);
    baseRef.current = 0;
    startRef.current = null;
    setAnswered({});
    setActiveQ(null);
    setPlaying(true);
  }, []);

  const stepFrame = useCallback(() => {
    setPlaying(false);
    setT((prev) => {
      const nxt = Math.min(1, prev + 1 / 60);
      baseRef.current = nxt;
      startRef.current = null;
      return nxt;
    });
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeed((s) => (s === 1 ? 0.5 : s === 0.5 ? 0.25 : 1));
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
          <div className="flex shrink-0 flex-wrap gap-1">
            <ControlButton
              onClick={() => {
                if (!playing && t >= 1) {
                  reset();
                } else {
                  setPlaying((v) => !v);
                }
              }}
              label={playing ? "Pause" : t >= 1 ? "Replay" : "Play"}
            >
              {playing ? (
                <Pause className="h-4 w-4" />
              ) : t >= 1 ? (
                <RotateCcw className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </ControlButton>
            <ControlButton onClick={stepFrame} label="Step frame">
              <StepForward className="h-4 w-4" />
            </ControlButton>
            <button
              type="button"
              onClick={cycleSpeed}
              aria-label={`Speed ${speed}×`}
              title={`Playback speed (${speed}×)`}
              className="grid h-9 min-w-[3rem] place-items-center gap-1 rounded-md border border-border bg-background px-2 text-[11px] font-semibold tabular-nums transition-colors hover:bg-secondary"
            >
              <span className="flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5" />
                {speed}×
              </span>
            </button>
            <button
              type="button"
              onClick={camera.cycle}
              aria-label={`Camera: ${camera.label}`}
              title={`Camera view (${camera.label})`}
              className="grid h-9 min-w-[6rem] place-items-center rounded-md border border-border bg-background px-2 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:bg-secondary"
            >
              <span className="flex items-center gap-1">
                <Camera className="h-3.5 w-3.5" />
                {camera.label}
              </span>
            </button>
            <ControlButton onClick={reset} label="Restart">
              <RotateCcw className="h-4 w-4" />
            </ControlButton>
          </div>
        </div>
        <div
          className="relative w-full overflow-hidden bg-[#1a1a1c]"
          style={{ aspectRatio: "16/9" }}
        >
          <Zoomable
            label={`${lesson.title} — animated diagram`}
            aspectRatio="16/9"
            closeOnContentClick={false}
            className="absolute inset-0"
          >
            <div className="relative h-full w-full">
              <div
                className="relative h-full w-full origin-center transition-transform duration-500 ease-out"
                style={{ transform: cameraTransform(camera.view) }}
              >
                {lesson.render(t)}
              </div>
              {/* Consistent GSM brand + UK convention overlay across every clip */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/85">
                  UK · Left-hand traffic
                </div>
                <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-l-md bg-black/55 px-1.5 py-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/85 [writing-mode:vertical-rl] sm:block">
                  GSM
                </div>
                <div className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-accent" />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/85">
                    GSM Driving School
                  </span>
                </div>
              </div>
            </div>
          </Zoomable>
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
          <div
            className="absolute left-0 top-0 h-full bg-accent"
            style={{ width: `${t * 100}%` }}
          />
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
      <Collapse
        icon={<Sparkles className="h-4 w-4" />}
        eyebrow="The GSM formula"
        tone="accent"
        title="THINK — before you act"
      >
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
      </Collapse>

      {/* 5. THE RULE */}
      <Collapse
        icon={<Target className="h-4 w-4" />}
        eyebrow="The rule"
        tone="rule"
        title={lesson.ruleHeadline}
      >
        <ul className="space-y-1.5 text-sm">
          {lesson.ruleBullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </Collapse>

      {/* 6. WHAT / WHEN / WHY / STEPS */}
      <Collapse
        icon={<Lightbulb className="h-4 w-4" />}
        eyebrow="What / when / why / steps"
        tone="default"
        title="What, when and why"
      >
        <div className="prose-sm space-y-3 text-sm leading-relaxed">
          <p className="font-semibold uppercase tracking-wider text-accent text-xs">
            What we're doing
          </p>
          <p>{lesson.objective}</p>
          {lesson.why}
        </div>
      </Collapse>

      {/* 7. GEORGE EXPLAINS */}
      <Collapse
        icon={<Quote className="h-4 w-4" />}
        eyebrow="George explains"
        tone="george"
        title="George explains"
      >
        <p className="text-sm italic leading-relaxed">{lesson.georgeExplains}</p>
      </Collapse>

      {/* 8. COMMON MISTAKES */}
      <Collapse
        icon={<AlertTriangle className="h-4 w-4" />}
        eyebrow="Common mistakes"
        tone="warn"
        title="Common mistakes"
      >
        {lesson.mistakes && lesson.mistakes.length > 0 ? (
          <ol className="space-y-4 text-sm">
            {lesson.mistakes.map((m, i) => (
              <li key={i} className="rounded-lg border border-border/60 bg-background/40 p-3">
                <div className="flex gap-2 leading-relaxed">
                  <span className="mt-0.5 text-red-500">✕</span>
                  <span>
                    <span className="text-[10px] uppercase tracking-wider text-red-500 mr-2">
                      Wrong
                    </span>
                    {m.wrong}
                  </span>
                </div>
                <div className="mt-2 flex gap-2 leading-relaxed text-muted-foreground">
                  <span className="mt-0.5 text-accent">↳</span>
                  <span>
                    <span className="text-[10px] uppercase tracking-wider text-accent mr-2">
                      Why it's wrong
                    </span>
                    {m.why}
                  </span>
                </div>
                <div className="mt-2 flex gap-2 leading-relaxed">
                  <span className="mt-0.5 text-emerald-600">✓</span>
                  <span>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-600 mr-2">
                      Correct
                    </span>
                    {m.right}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <ul className="space-y-2 text-sm">
            {lesson.commonMistakes.map((m, i) => (
              <li key={i} className="flex gap-2 leading-relaxed">
                <span className="text-red-500">✕</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        )}
      </Collapse>

      {/* 9. GSM TIPS */}
      <Collapse
        icon={<CheckCircle2 className="h-4 w-4" />}
        eyebrow="George's Tip"
        tone="tip"
        title="George's tips"
      >
        <ul className="space-y-2 text-sm">
          {lesson.gsmTips.map((tp, i) => (
            <li key={i} className="flex gap-2 leading-relaxed">
              <span className="text-emerald-600">✓</span>
              <span>{tp}</span>
            </li>
          ))}
        </ul>
      </Collapse>

      {/* 10. KEY TAKEAWAY */}
      <div className="rounded-xl bg-foreground p-5 text-background shadow-md">
        <div className="text-[11px] uppercase tracking-[0.25em] opacity-70">Key takeaway</div>
        <p className="mt-2 font-display text-lg leading-snug">{lesson.keyTakeaway}</p>
      </div>

      {/* 10b. GSM full-template extras (rendered only when authored) */}
      {lesson.whereItApplies && lesson.whereItApplies.length > 0 && (
        <Collapse icon={<Target className="h-4 w-4" />} eyebrow="Where" tone="default" title="Where it applies">
          <ul className="space-y-2 text-sm">
            {lesson.whereItApplies.map((w, i) => (
              <li key={i} className="flex gap-2 leading-relaxed"><span className="text-accent">•</span><span>{w}</span></li>
            ))}
          </ul>
        </Collapse>
      )}
      {lesson.referencePoints && lesson.referencePoints.length > 0 && (
        <Collapse icon={<Target className="h-4 w-4" />} eyebrow="Reference points" tone="accent" title="Reference points">
          <ul className="space-y-2 text-sm">
            {lesson.referencePoints.map((r, i) => (
              <li key={i} className="flex gap-2 leading-relaxed"><span className="text-accent">◎</span><span>{r}</span></li>
            ))}
          </ul>
        </Collapse>
      )}
      {lesson.bgo && (
        <Collapse icon={<Sparkles className="h-4 w-4" />} eyebrow="BGO" tone="accent" title="Blockers · Gap · Opportunity">
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-md border border-border/60 bg-background/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-accent">Blockers</div>
              <ul className="mt-2 space-y-1">{lesson.bgo.blockers.map((b, i) => <li key={i}>• {b}</li>)}</ul>
            </div>
            <div className="rounded-md border border-border/60 bg-background/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-accent">Gap</div>
              <p className="mt-2 leading-relaxed">{lesson.bgo.gap}</p>
            </div>
            <div className="rounded-md border border-border/60 bg-background/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-accent">Opportunity</div>
              <p className="mt-2 leading-relaxed">{lesson.bgo.opportunity}</p>
            </div>
          </div>
        </Collapse>
      )}
      {lesson.instructorTips && lesson.instructorTips.length > 0 && (
        <Collapse icon={<Lightbulb className="h-4 w-4" />} eyebrow="Instructor tips" tone="tip" title="ADI-level teaching tips">
          <ul className="space-y-2 text-sm">
            {lesson.instructorTips.map((tp, i) => (
              <li key={i} className="flex gap-2 leading-relaxed"><span className="text-emerald-600">✓</span><span>{tp}</span></li>
            ))}
          </ul>
        </Collapse>
      )}
      {lesson.safetyNotes && lesson.safetyNotes.length > 0 && (
        <Collapse icon={<AlertTriangle className="h-4 w-4" />} eyebrow="Safety" tone="warn" title="Safety notes">
          <ul className="space-y-2 text-sm">
            {lesson.safetyNotes.map((s, i) => (
              <li key={i} className="flex gap-2 leading-relaxed"><span className="text-red-500">⚠</span><span>{s}</span></li>
            ))}
          </ul>
        </Collapse>
      )}
      {lesson.summary && lesson.summary.length > 0 && (
        <Collapse icon={<CheckCircle2 className="h-4 w-4" />} eyebrow="Summary" tone="default" title="Summary">
          <ul className="space-y-2 text-sm">
            {lesson.summary.map((s, i) => (
              <li key={i} className="flex gap-2 leading-relaxed"><span className="text-accent">→</span><span>{s}</span></li>
            ))}
          </ul>
        </Collapse>
      )}
      {lesson.passCriteria && lesson.passCriteria.length > 0 && (
        <Collapse icon={<Target className="h-4 w-4" />} eyebrow="Pass criteria" tone="rule" title="You've mastered this when…">
          <ul className="space-y-2 text-sm">
            {lesson.passCriteria.map((p, i) => (
              <li key={i} className="flex gap-2 leading-relaxed"><span className="text-accent">✓</span><span>{p}</span></li>
            ))}
          </ul>
        </Collapse>
      )}

      {/* 11. NEXT LESSON */}
      {/* 11. MARK COMPLETED + PREV/NEXT */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => toggle(lesson.slug)}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl border p-4 text-sm font-semibold transition-colors",
            done
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15"
              : "border-accent bg-accent text-accent-foreground hover:opacity-90",
          )}
          aria-pressed={done}
        >
          {done ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Lesson completed — tap to unmark
            </>
          ) : (
            <>
              <Circle className="h-5 w-5" />
              Mark as completed
            </>
          )}
        </button>

        <div className="grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link
              to="/driving-clips/$slug"
              params={{ slug: prev.slug }}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-accent"
            >
              <ArrowLeft className="h-5 w-5 shrink-0 text-accent transition-transform group-hover:-translate-x-1" />
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Previous
                </div>
                <div className="mt-1 font-display text-base leading-snug break-words">
                  {prev.title}
                </div>
              </div>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}
          {next && (
            <Link
              to="/driving-clips/$slug"
              params={{ slug: next.slug }}
              className="group flex items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/5 p-4 shadow-sm transition-colors hover:border-accent hover:bg-accent/10 sm:text-right"
            >
              <div className="min-w-0 sm:order-2">
                <div className="text-[11px] uppercase tracking-[0.2em] text-accent">Next</div>
                <div className="mt-1 font-display text-base leading-snug break-words">
                  {next.title}
                </div>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-accent transition-transform group-hover:translate-x-1 sm:order-3" />
            </Link>
          )}
        </div>
      </div>
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

function Collapse({
  eyebrow,
  icon,
  tone,
  title,
  children,
}: {
  eyebrow: string;
  icon: ReactNode;
  tone: "default" | "accent" | "rule" | "george" | "warn" | "tip";
  title: string;
  children: ReactNode;
}) {
  const wrap = cn(
    "group rounded-xl border shadow-sm overflow-hidden",
    tone === "accent" && "border-accent/40 bg-accent/5",
    tone === "rule" && "border-2 border-accent bg-accent/5",
    tone === "george" && "border-l-4 border-accent bg-card",
    tone === "warn" && "border-red-500/30 bg-red-500/5",
    tone === "tip" && "border-emerald-500/30 bg-emerald-500/5",
    tone === "default" && "border-border bg-card",
  );
  const eyebrowTone =
    tone === "warn" ? "text-red-500" : tone === "tip" ? "text-emerald-600" : "text-accent";
  return (
    <details className={wrap}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div
            className={cn(
              "flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]",
              eyebrowTone,
            )}
          >
            {icon} {eyebrow}
          </div>
          <div className="mt-1 font-display text-base leading-snug">{title}</div>
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
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
