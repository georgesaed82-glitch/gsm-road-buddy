import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  Compass,
  Users,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Telescope,
  ShieldCheck,
  Route as RouteIcon,
  Gauge,
  Sparkles,
  Wind,
  MapPin,
  Play,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Brain,
  Lightbulb,
  Repeat,
  Target,
  Footprints,
  School as SchoolIcon,
  Bike,
  Bus,
  DoorOpen,
  Baby,
  CircleDot,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/gsm-method")({
  head: () => ({
    meta: [
      { title: "The Official GSM Driving Method · GSM Plus+" },
      {
        name: "description",
        content:
          "The complete GSM Driving Method — George's 10 golden rules, the SEE-THINK-PLAN-MOVE system, developing hazards and the GSM mindset. A signature training programme for life.",
      },
    ],
  }),
  component: GSMMethodPage,
});

// ---------- shared UI atoms ----------

type IconType = typeof ArrowUp;

function SectionEyebrow({ icon: Icon, children }: { icon: IconType; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
      <Icon className="h-4 w-4" />
      {children}
    </div>
  );
}

function MediaPlaceholder({ kind, label }: { kind: "animation" | "diagram"; label?: string }) {
  const isAnim = kind === "animation";
  return (
    <div
      className={cn(
        "group relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden border border-dashed",
        isAnim ? "border-accent/40 bg-accent/[0.04]" : "border-primary/30 bg-primary/[0.03]",
      )}
    >
      {/* soft grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative flex flex-col items-center gap-2 text-center">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full border transition-transform group-hover:scale-105",
            isAnim
              ? "border-accent/50 bg-accent/10 text-accent"
              : "border-primary/40 bg-primary/10 text-primary",
          )}
        >
          {isAnim ? <Play className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {isAnim ? "Watch animation" : "Diagram placeholder"}
        </div>
        {label && <div className="max-w-xs px-4 text-xs text-muted-foreground">{label}</div>}
      </div>
    </div>
  );
}

// ---------- Knowledge check ----------

type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
  explain: string;
};

function KnowledgeCheck({ id, questions }: { id: string; questions: QuizQuestion[] }) {
  const [choices, setChoices] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = useMemo(
    () => questions.reduce((n, q, i) => (choices[i] === q.answer ? n + 1 : n), 0),
    [choices, questions],
  );
  const allAnswered = questions.every((_, i) => choices[i] !== undefined);
  return (
    <div className="mt-6 border border-border bg-card p-5 sm:p-6">
      <SectionEyebrow icon={ClipboardList}>Quick knowledge check</SectionEyebrow>
      <h3 className="mt-1 font-display text-lg leading-tight">Three questions · instant feedback</h3>
      <ol className="mt-4 space-y-5">
        {questions.map((q, i) => {
          const chosen = choices[i];
          return (
            <li key={`${id}-${i}`} className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-xs font-semibold text-accent">
                  Q{i + 1}
                </span>
                <p className="text-sm font-medium">{q.q}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => {
                  const isChosen = chosen === oi;
                  const isCorrect = q.answer === oi;
                  const showState = submitted && isChosen;
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={submitted}
                      onClick={() => setChoices((prev) => ({ ...prev, [i]: oi }))}
                      className={cn(
                        "flex items-start gap-2 border px-3 py-2 text-left text-sm transition",
                        "hover:border-accent/60 hover:bg-accent/[0.05]",
                        isChosen && !submitted && "border-accent bg-accent/10",
                        !isChosen && !submitted && "border-border bg-background",
                        showState && isCorrect && "border-emerald-500/60 bg-emerald-500/10",
                        showState && !isCorrect && "border-red-500/60 bg-red-500/10",
                        submitted && !isChosen && isCorrect && "border-emerald-500/40 bg-emerald-500/[0.06]",
                      )}
                    >
                      <Circle
                        className={cn(
                          "mt-0.5 h-3.5 w-3.5 shrink-0",
                          isChosen ? "fill-accent text-accent" : "text-muted-foreground",
                        )}
                      />
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p
                  className={cn(
                    "text-xs leading-relaxed",
                    chosen === q.answer ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400",
                  )}
                >
                  {chosen === q.answer ? "✓ Correct. " : "✗ "}
                  {q.explain}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <button
            type="button"
            disabled={!allAnswered}
            onClick={() => setSubmitted(true)}
            className={cn(
              "inline-flex items-center gap-2 border border-accent bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition",
              !allAnswered && "opacity-50",
            )}
          >
            Check answers
          </button>
        ) : (
          <>
            <div className="text-sm">
              <span className="font-display text-lg text-accent">{score}</span>
              <span className="text-muted-foreground"> / {questions.length} correct</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setChoices({});
                setSubmitted(false);
              }}
              className="inline-flex items-center gap-2 border border-border bg-background px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Repeat className="h-3.5 w-3.5" /> Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ---------- Golden rules data ----------

type GoldenRule = {
  n: number;
  icon: IconType;
  title: string;
  short: string;
  body: ReactNode;
  visual: string;
  animation?: string;
  example: string;
};

const goldenRules: GoldenRule[] = [
  {
    n: 1,
    icon: Telescope,
    title: "Stretch Your Vision",
    short: "Look as far ahead as possible.",
    body: (
      <>
        <p>The earlier you see a hazard, the more time you have to make a safe decision.</p>
        <p className="mt-2 font-medium">Ask yourself:</p>
        <ul className="mt-1 list-disc pl-5">
          <li>Can I keep moving?</li>
          <li>Do I need to slow down?</li>
          <li>What could happen next?</li>
        </ul>
      </>
    ),
    visual: "Road stretching far ahead with developing hazards in the distance.",
    animation: "Driver looking far ahead before reacting.",
    example:
      "Approaching traffic lights 200 m away — spot the queue early, ease off the gas and arrive smoothly in gear.",
  },
  {
    n: 2,
    icon: ShieldCheck,
    title: "Plan to Stop, Look to Go",
    short: "Prepare to stop — continue only when safe.",
    body: (
      <>
        <p>Traffic flows because drivers plan early.</p>
        <p className="mt-2 rounded-none border-l-2 border-accent bg-accent/5 px-3 py-2 text-sm">
          <span className="font-semibold">Important:</span> Only use this method at{" "}
          <em>open junctions</em>, <em>Give Way junctions</em> and <em>roundabouts</em>. Not closed
          junctions.
        </p>
      </>
    ),
    visual: "Open junction vs closed junction side-by-side.",
    animation: "Approach → prepare → observe → continue.",
    example:
      "Rolling up to an open T-junction on a quiet road — cover the brake, keep looking, blend into the flow without a full stop.",
  },
  {
    n: 3,
    icon: Gauge,
    title: "The GSM 15–70–15 Vision System",
    short: "Split your eyes across the whole scene.",
    body: (
      <>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { pct: "15%", label: "Down", items: ["Road markings", "Lane arrows", "Road studs", "Give Way markings", "STOP lines"] },
            { pct: "70%", label: "Ahead", items: ["Road ahead", "Traffic flow", "Hazards", "Escape space", "Traffic movement"] },
            { pct: "15%", label: "Up & Around", items: ["Signs", "Mirrors", "Side roads", "Pedestrians"] },
          ].map((c) => (
            <div key={c.label} className="border border-border bg-background p-3">
              <div className="font-display text-xl text-accent">{c.pct}</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {c.label}
              </div>
              <ul className="mt-2 space-y-1 text-xs">
                {c.items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </>
    ),
    visual: "Dashboard-style diagram showing the 15–70–15 vision split.",
    example:
      "Driving through town at 30 mph — every 2 seconds your eyes flick down, ahead, and up-around.",
  },
  {
    n: 4,
    icon: Wind,
    title: "Funnel Vision — Never Tunnel Vision",
    short: "Scan continuously. Never stare at one object.",
    body: (
      <>
        <p>Keep your eyes moving across the whole scene:</p>
        <ul className="mt-2 grid gap-1 pl-5 text-sm sm:grid-cols-2 list-disc">
          <li>Road ahead</li>
          <li>Mirrors</li>
          <li>Both pavements</li>
          <li>Road markings</li>
          <li>Junctions</li>
          <li>Signs</li>
          <li>Cyclists</li>
        </ul>
      </>
    ),
    visual: "Animated eye-movement funnel spreading outward.",
    animation: "Eyes sweeping left, right, mirrors, ahead.",
    example: "Passing a row of parked cars — scan for brake lights, wheels turning, doors opening.",
  },
  {
    n: 5,
    icon: Footprints,
    title: "Watch Shoulders, Not Feet",
    short: "Shoulders move before feet.",
    body: (
      <>
        <p>Read people's intentions early. Look for:</p>
        <ul className="mt-2 grid gap-1 pl-5 text-sm sm:grid-cols-2 list-disc">
          <li>Pedestrians</li>
          <li>Cyclists</li>
          <li>Children</li>
          <li>Dog walkers</li>
        </ul>
      </>
    ),
    visual: "Pedestrian turning shoulders before stepping into the road.",
    example:
      "Someone waiting at a zebra crossing — the moment their shoulders square to the road, they're about to step off.",
  },
  {
    n: 6,
    icon: MapPin,
    title: "Read the Road Before the Signs",
    short: "The road tells you first.",
    body: (
      <>
        <p>Signs confirm what the road is already telling you. Read:</p>
        <ul className="mt-2 grid gap-1 pl-5 text-sm sm:grid-cols-2 list-disc">
          <li>Road width</li>
          <li>Lane markings</li>
          <li>Road surface</li>
          <li>Kerbs</li>
          <li>Parked vehicles</li>
          <li>Road position</li>
        </ul>
      </>
    ),
    visual: "Narrowing road markings appearing before the speed-limit sign.",
    example:
      "Road narrows, kerbs tighten and parking appears — you're in a residential 20 zone before you see the sign.",
  },
  {
    n: 7,
    icon: RouteIcon,
    title: "Keep Traffic Moving Safely",
    short: "Flow, don't rush. Flow, don't hesitate.",
    body: (
      <>
        <p>The purpose of driving is not to rush — it is to keep traffic flowing safely.</p>
        <p className="mt-2">Never rush. Never hesitate unnecessarily.</p>
      </>
    ),
    visual: "Traffic flowing smoothly around hazards without stopping unnecessarily.",
    example:
      "Mini-roundabout with a clear right — keep rolling in 2nd rather than stopping and blocking the queue behind.",
  },
  {
    n: 8,
    icon: Target,
    title: "Stay in Your Lane",
    short: "Correct lane, position, spacing, timing.",
    body: (
      <>
        <p>Good positioning creates more thinking time.</p>
        <ul className="mt-2 grid gap-1 pl-5 text-sm sm:grid-cols-2 list-disc">
          <li>Correct lane</li>
          <li>Correct position</li>
          <li>Correct spacing</li>
          <li>Correct timing</li>
        </ul>
      </>
    ),
    visual: "Lane positioning examples on a dual carriageway and roundabout.",
    example:
      "Approaching a roundabout to go straight on — stay in the left lane unless markings say otherwise.",
  },
  {
    n: 9,
    icon: AlertTriangle,
    title: "Expect Other People's Mistakes",
    short: "Never assume. Always have a backup plan.",
    body: (
      <>
        <p>Expect:</p>
        <ul className="mt-2 grid gap-1 pl-5 text-sm sm:grid-cols-2 list-disc">
          <li>Late signals</li>
          <li>No signals</li>
          <li>Sudden braking</li>
          <li>Poor observations</li>
          <li>Wrong lane choices</li>
        </ul>
      </>
    ),
    visual: "Several developing hazards highlighted around a single scene.",
    example:
      "Car sat at a side road — assume they'll pull out. Cover the brake, ease off the gas, ready to react.",
  },
  {
    n: 10,
    icon: Sparkles,
    title: "Drive Smoothly",
    short: "Smooth drivers are predictable. Predictable drivers are safe.",
    body: (
      <>
        <ul className="mt-1 grid gap-1 pl-5 text-sm sm:grid-cols-2 list-disc">
          <li>Smooth steering</li>
          <li>Smooth braking</li>
          <li>Smooth acceleration</li>
          <li>Smooth observations</li>
        </ul>
      </>
    ),
    visual: "Driving smoothly through a sweeping bend, weight settled.",
    example: "Country lane bend — brake before, steer through, gently accelerate out.",
  },
];

function GoldenRuleCard({ rule }: { rule: GoldenRule }) {
  const [open, setOpen] = useState(rule.n === 1);
  const Icon = rule.icon;
  return (
    <li className="border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-4 p-4 text-left sm:p-5"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-accent/40 bg-accent/10 font-display text-lg font-semibold text-accent">
          {String(rule.n).padStart(2, "0")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <Icon className="h-3.5 w-3.5 text-accent" />
            Golden Rule
          </div>
          <h3 className="mt-0.5 font-display text-lg leading-tight sm:text-xl">{rule.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{rule.short}</p>
        </div>
        <div className="ml-2 mt-1 shrink-0 text-muted-foreground">
          {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-border bg-background/50 p-4 sm:p-5 animate-fade-in">
          <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
            <div className="text-sm leading-relaxed">
              {rule.body}
              <div className="mt-4 border-l-2 border-accent/60 bg-accent/[0.04] px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                  Real driving example
                </div>
                <p className="mt-1 text-sm">{rule.example}</p>
              </div>
            </div>
            <div className="grid gap-3">
              {rule.animation && <MediaPlaceholder kind="animation" label={rule.animation} />}
              <MediaPlaceholder kind="diagram" label={rule.visual} />
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

// ---------- Thinking system ----------

const thinkingStages = [
  {
    key: "SEE",
    icon: Eye,
    body: ["Stretch your vision.", "Read the road.", "Read people."],
  },
  {
    key: "THINK",
    icon: Brain,
    body: ["What is happening?", "What could happen next?"],
  },
  {
    key: "PLAN",
    icon: Lightbulb,
    body: ["Create a safe plan.", "Choose the safest option."],
  },
  {
    key: "MOVE",
    icon: RouteIcon,
    body: ["Keep traffic flowing safely.", "Remain smooth."],
  },
  {
    key: "REPEAT",
    icon: Repeat,
    body: ["Every second. Every hazard. Every junction."],
  },
] as const;

function ThinkingSystem() {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      {thinkingStages.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={s.key}
            className="relative flex flex-col border border-border bg-card p-4 animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-accent/40 bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-display text-xl tracking-wide">{s.key}</div>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {s.body.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 text-accent md:block">
              {i < thinkingStages.length - 1 && <span aria-hidden>→</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Developing hazards ----------

type Hazard = { icon: IconType; cause: string; effect: string };
const hazards: Hazard[] = [
  { icon: CircleDot, cause: "Ball in road", effect: "Child chasing ball" },
  { icon: Bus, cause: "Bus stopping", effect: "Pedestrian crossing" },
  { icon: Bike, cause: "Cyclist looks over shoulder", effect: "Cyclist moving out" },
  { icon: Users, cause: "Pedestrian turns shoulders", effect: "Pedestrian crossing" },
  { icon: DoorOpen, cause: "Parked vehicle", effect: "Door opening" },
  { icon: SchoolIcon, cause: "School", effect: "Children running" },
  { icon: Baby, cause: "Dog walker with lead", effect: "Dog into road" },
  { icon: AlertTriangle, cause: "Brake lights ahead", effect: "Traffic slowing suddenly" },
];

function HazardCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {hazards.map((h, i) => {
        const Icon = h.icon;
        return (
          <div
            key={h.cause}
            className="group border border-border bg-card p-4 animate-fade-in transition hover:border-accent/50 hover:shadow-sm"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center border border-accent/40 bg-accent/10 text-accent transition-transform group-hover:scale-105">
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                What could happen next?
              </div>
            </div>
            <p className="mt-3 text-sm font-medium">{h.cause}</p>
            <div className="mt-1 flex items-center gap-1 text-accent">
              <ArrowDown className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold uppercase tracking-[0.16em]">Then</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{h.effect}</p>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Observation flow ----------

const observationFlow = [
  { label: "Stretch Vision", icon: Telescope },
  { label: "Read the Traffic", icon: Eye },
  { label: "Identify Hazards", icon: AlertTriangle },
  { label: "Create Space", icon: RouteIcon },
  { label: "Move Safely", icon: ShieldCheck },
] as const;

function ObservationFlow() {
  return (
    <ol className="grid gap-3 sm:grid-cols-5">
      {observationFlow.map((step, i) => {
        const Icon = step.icon;
        return (
          <li
            key={step.label}
            className="relative flex flex-col items-start border border-border bg-card p-4 animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="font-display text-xs font-semibold text-accent">
              STEP {String(i + 1).padStart(2, "0")}
            </span>
            <div className="mt-2 flex h-10 w-10 items-center justify-center border border-accent/40 bg-accent/10 text-accent">
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-3 font-display text-base leading-tight">{step.label}</div>
          </li>
        );
      })}
    </ol>
  );
}

// ---------- Decision process ----------

const decisionCards = [
  { label: "See", icon: Eye, body: "Gather every piece of information." },
  { label: "Think", icon: Brain, body: "Interpret — what does it mean for me?" },
  { label: "Plan", icon: Lightbulb, body: "Decide the safest option." },
  { label: "Act", icon: RouteIcon, body: "Carry it out smoothly." },
  { label: "Review", icon: Repeat, body: "Did it work? Adjust for next time." },
] as const;

// ---------- Mindset ----------

const mindset = [
  "Thinking ahead",
  "Planning early",
  "Creating space",
  "Keeping traffic flowing",
  "Helping other road users",
  "Never assuming",
  "Driving defensively",
  "Being predictable",
  "Learning every day",
];

// ---------- Quizzes ----------

const goldenQuiz: QuizQuestion[] = [
  {
    q: "Which method is NOT appropriate at a closed junction?",
    options: ["Plan to Stop, Look to Go", "Full Stop and Observe", "Creep and Peep", "Cover the brake"],
    answer: 0,
    explain: "Plan to Stop, Look to Go is for open junctions, Give Ways and roundabouts — not closed junctions.",
  },
  {
    q: "In the GSM 15–70–15 system, where do most of your eyes belong?",
    options: ["Down at the road markings", "Ahead — reading the traffic", "Up at the signs", "In the mirrors"],
    answer: 1,
    explain: "70% of your attention stays ahead — reading the road and traffic flow.",
  },
  {
    q: "Why watch shoulders instead of feet?",
    options: [
      "Shoulders move before feet",
      "Feet are hidden by cars",
      "It's easier to see",
      "The Highway Code says so",
    ],
    answer: 0,
    explain: "Shoulders turn towards the road before a pedestrian steps off — earlier warning, more thinking time.",
  },
];

const thinkingQuiz: QuizQuestion[] = [
  {
    q: "What is the correct order of the GSM Thinking System?",
    options: [
      "Move → See → Think → Plan",
      "See → Think → Plan → Move",
      "Plan → See → Move → Think",
      "Think → Move → See → Plan",
    ],
    answer: 1,
    explain: "SEE → THINK → PLAN → MOVE, then repeat continuously.",
  },
  {
    q: "Which stage answers 'What could happen next?'",
    options: ["See", "Think", "Plan", "Move"],
    answer: 1,
    explain: "THINK is where you interpret information and predict the next move.",
  },
  {
    q: "How often should the cycle repeat?",
    options: ["At every junction", "Every 10 seconds", "Continuously", "Only when a hazard appears"],
    answer: 2,
    explain: "The cycle never stops — it runs continuously while driving.",
  },
];

const hazardsQuiz: QuizQuestion[] = [
  {
    q: "A ball rolls into the road. What is the developing hazard?",
    options: ["A pothole", "A child chasing it", "Road works", "A cyclist"],
    answer: 1,
    explain: "Where there is a ball, expect a child.",
  },
  {
    q: "A cyclist glances over their right shoulder. What are they likely to do?",
    options: ["Slow down", "Stop", "Move out into your lane", "Turn left"],
    answer: 2,
    explain: "A shoulder check usually means a cyclist is about to move out.",
  },
  {
    q: "A bus stops at a bus stop on your side. What is the biggest risk?",
    options: ["Bus reversing", "Pedestrian stepping out from in front of it", "Bus stalling", "Roadworks"],
    answer: 1,
    explain: "Pedestrians often step out in front of a stopped bus without checking.",
  },
];

// ---------- Section wrapper ----------

function Section({
  id,
  eyebrow,
  icon,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  icon: IconType;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-14 scroll-mt-24">
      <SectionEyebrow icon={icon}>{eyebrow}</SectionEyebrow>
      <h2 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">{title}</h2>
      {intro && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{intro}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

// ---------- Page ----------

function GSMMethodPage() {
  return (
    <PortalShell eyebrow="The GSM Driving Method" title="The Official GSM Driving Method">
      {/* Hero */}
      <div className="relative overflow-hidden border border-border bg-gradient-to-br from-primary/5 via-card to-accent/5 p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative max-w-3xl">
          <SectionEyebrow icon={Compass}>Learn the system · Think ahead · Drive safely</SectionEyebrow>
          <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
            The complete driving system George teaches on every lesson.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            The GSM Driving Method is designed to help learners pass the driving test while becoming
            safe, confident and independent drivers for life. Every principle below is drawn from how
            George teaches — not generic driving advice.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.2em]">
            {["10 Golden Rules", "Thinking System", "Observation Flow", "GSM Mindset"].map((chip) => (
              <span
                key={chip}
                className="border border-accent/40 bg-accent/10 px-3 py-1 text-accent"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Section 1 — Golden rules */}
      <Section
        id="golden-rules"
        eyebrow="Section 1 · George's 10 Golden Rules"
        icon={CheckCircle2}
        title="Ten rules that shape every decision on the road"
        intro="Tap any card to expand — read the teaching point, see the animation and diagram placeholders, and study George's real driving example."
      >
        <ol className="grid gap-3 md:grid-cols-2">
          {goldenRules.map((r) => (
            <GoldenRuleCard key={r.n} rule={r} />
          ))}
        </ol>
        <KnowledgeCheck id="golden" questions={goldenQuiz} />
      </Section>

      {/* Section 2 — Thinking system */}
      <Section
        id="thinking-system"
        eyebrow="Section 2 · George's Thinking System"
        icon={Brain}
        title="SEE → THINK → PLAN → MOVE → REPEAT"
        intro="The mental loop that runs continuously behind the wheel."
      >
        <ThinkingSystem />
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <MediaPlaceholder kind="animation" label="Circular flow diagram animating through SEE → THINK → PLAN → MOVE → REPEAT." />
          <MediaPlaceholder kind="diagram" label="Driver's-eye view labelled with each thinking stage in real time." />
        </div>
        <KnowledgeCheck id="thinking" questions={thinkingQuiz} />
      </Section>

      {/* Section 3 — Developing hazards */}
      <Section
        id="developing-hazards"
        eyebrow="Section 3 · Developing Hazards"
        icon={AlertTriangle}
        title="Always ask: 'What could happen next?'"
        intro="Every clue on the road has a follow-up. Train yourself to see cause and effect before it happens."
      >
        <HazardCards />
        <div className="mt-6">
          <MediaPlaceholder
            kind="animation"
            label="Hazard reveal — ball rolls in, then a child appears chasing it."
          />
        </div>
        <KnowledgeCheck id="hazards" questions={hazardsQuiz} />
      </Section>

      {/* Section 4 — Observation system */}
      <Section
        id="observation-system"
        eyebrow="Section 4 · George's Observation System"
        icon={Eye}
        title="Five steps that turn looking into seeing"
      >
        <ObservationFlow />
        <div className="mt-6">
          <MediaPlaceholder kind="diagram" label="Vertical flow diagram — Stretch → Read → Identify → Create → Move." />
        </div>
      </Section>

      {/* Section 5 — Decision process */}
      <Section
        id="decision-process"
        eyebrow="Section 5 · George's Decision Process"
        icon={ClipboardList}
        title="Every driving decision follows five stages"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {decisionCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="flex flex-col border border-border bg-card p-4 animate-fade-in"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-accent/40 bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="font-display text-lg">{c.label}</div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{c.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Section 6 — Mindset */}
      <Section
        id="mindset"
        eyebrow="Section 6 · The GSM Mindset"
        icon={Sparkles}
        title="Driving is not just skill — it is a mindset"
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {mindset.map((m, i) => (
            <div
              key={m}
              className="flex items-center gap-3 border border-border bg-card p-3 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-accent/40 bg-accent/10 font-display text-xs font-semibold text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-medium">{m}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 border border-accent/40 bg-accent/[0.06] p-5 sm:p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
            The GSM promise
          </div>
          <p className="mt-2 font-display text-lg leading-tight sm:text-xl">
            Learn the system. Think ahead. Drive safely — for the test, and for life.
          </p>
        </div>
      </Section>
    </PortalShell>
  );
}

const principles = [
  {
    title: "Stretch your vision",
    body: "Always look as far ahead as possible. The earlier you see a hazard, the more time you have to make a safe decision.",
  },
  {
    title: "Plan to stop, look to go",
    body: "Always prepare to stop, but constantly look for a safe opportunity to keep the traffic flowing safely.",
  },
  {
    title: "Keep traffic moving safely",
    body: "The purpose of driving is to keep traffic moving safely and smoothly — not to rush and not to hesitate unnecessarily.",
  },
  {
    title: "Stay in your lane",
    body: "Use the correct lane, avoid straddling lanes and position your vehicle clearly.",
  },
  {
    title: "Drive defensively",
    body: "Never assume another road user will do the right thing. Expect mistakes and always have a backup plan.",
  },
  {
    title: "Look for other people's mistakes",
    body: "Good drivers don't just watch what people are doing — they predict what they might do next.",
  },
];

const vision = [
  {
    pct: "15%",
    label: "UP",
    icon: ArrowUp,
    look: [
      "Road signs",
      "Traffic lights",
      "Speed limits",
      "Junctions",
      "Roundabouts",
      "Pedestrian crossings",
      "Developing hazards",
    ],
    ask: ["What information is coming next?"],
  },
  {
    pct: "70%",
    label: "AHEAD",
    icon: Eye,
    look: [
      "Stretch your vision as far as possible.",
      "Read the traffic flow.",
      "Plan your next move.",
    ],
    ask: ["Can I keep moving?", "Do I need to slow down?", "What could happen next?"],
  },
  {
    pct: "15%",
    label: "DOWN",
    icon: ArrowDown,
    look: [
      "Lane arrows",
      "STOP lines",
      "Give Way markings",
      "Yellow box junctions",
      "Cycle lanes",
      "Bus lanes",
      "Road studs",
      "Road surface",
    ],
    ask: ["The road often tells you what to do before the signs do."],
  },
];

const developingHazards = [
  "Ball in the road",
  "Children near a school",
  "Cyclist looking over their shoulder",
  "Pedestrian turning towards the road",
  "Vehicle about to pull away",
];

const goldenRules = [
  "Stretch your vision.",
  "Plan to stop, look to go.",
  "Use the 15–70–15 Vision Formula.",
  "Use funnel vision, never tunnel vision.",
  "Watch shoulders, not feet.",
  "Read the road before the signs.",
  "Keep traffic moving safely.",
  "Stay in your lane.",
  "Drive defensively.",
  "Expect other people to make mistakes.",
  "Look early.",
  "Think early.",
  "Act smoothly.",
];

function GSMMethodPage() {
  return (
    <PortalShell eyebrow="How George teaches" title="The GSM Driving Method">
      <p className="max-w-2xl text-sm text-muted-foreground">
        The principles, vision system and golden rules George teaches on every lesson. Learn them,
        live them — they pass the test and outlast it.
      </p>

      {/* Principles */}
      <section id="principles" className="mt-10 scroll-mt-24">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent">
          <Compass className="h-4 w-4" />
          George's Driving Principles
        </div>
        <h2 className="mt-1 font-display text-2xl leading-tight">
          Six rules that shape every decision
        </h2>
        <ol className="mt-5 grid gap-3 md:grid-cols-2">
          {principles.map((p, i) => (
            <li key={p.title} className="border border-border bg-card p-4">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-xs font-semibold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-base leading-tight">{p.title}</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Vision Formula */}
      <section id="vision-formula" className="mt-12 scroll-mt-24">
        <div className="text-[11px] uppercase tracking-[0.2em] text-accent">GSM Vision Formula</div>
        <h2 className="mt-1 font-display text-2xl leading-tight">The 15–70–15 scanning method</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Not an exact scientific percentage — a simple observation system to train your eyes.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {vision.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.label} className="border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-border bg-secondary text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-display text-2xl leading-none">{v.pct}</div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {v.label}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Look for
                </div>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {v.look.map((l) => (
                    <li key={l} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 border-t border-border pt-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Ask yourself
                </div>
                <ul className="mt-2 space-y-1.5 text-sm italic text-foreground">
                  {v.ask.map((a) => (
                    <li key={a}>“{a}”</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Funnel + shoulders */}
      <section className="mt-12 grid gap-4 md:grid-cols-2">
        <div id="funnel-vision" className="scroll-mt-24 border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent">
            <Eye className="h-4 w-4" /> Funnel vision
          </div>
          <h3 className="mt-1 font-display text-xl leading-tight">Never get tunnel vision</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Use funnel vision by scanning constantly:
          </p>
          <ul className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
            {[
              "The road ahead",
              "Both pavements",
              "Mirrors",
              "Junctions",
              "Road markings",
              "Signs",
            ].map((x) => (
              <li key={x} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>

        <div id="watch-shoulders" className="scroll-mt-24 border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent">
            <Users className="h-4 w-4" /> Watch shoulders, not feet
          </div>
          <h3 className="mt-1 font-display text-xl leading-tight">Read the person, not the step</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Don't wait for pedestrians' feet to move.{" "}
            <span className="text-foreground font-medium">Watch their shoulders.</span> Shoulders
            usually turn before a person steps into the road — giving you more time to react.
          </p>
        </div>
      </section>

      {/* Developing hazards */}
      <section
        id="developing-hazards"
        className="mt-12 scroll-mt-24 border border-border bg-card p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent">
          <AlertTriangle className="h-4 w-4" /> Developing hazards
        </div>
        <h2 className="mt-1 font-display text-2xl leading-tight">
          Keep asking: “What could happen next?”
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {developingHazards.map((h) => (
            <li
              key={h}
              className="flex items-start gap-2 border border-border bg-background p-3 text-sm"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Golden rules */}
      <section
        id="golden-rules"
        className="mt-12 scroll-mt-24 border border-accent/40 bg-accent/5 p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          <CheckCircle2 className="h-4 w-4" /> George's Golden Rules
        </div>
        <h2 className="mt-1 font-display text-2xl leading-tight">Live by these, drive by these</h2>
        <ol className="mt-5 grid gap-2 sm:grid-cols-2">
          {goldenRules.map((r, i) => (
            <li
              key={r}
              className="flex items-start gap-3 border border-border bg-background p-3 text-sm"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-accent/50 bg-accent/10 font-display text-xs font-semibold text-accent">
                {i + 1}
              </span>
              <span className="leading-relaxed">{r}</span>
            </li>
          ))}
        </ol>
      </section>
    </PortalShell>
  );
}
