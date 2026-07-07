import type { Lesson } from "@/components/driving-clips/LessonShell";

// ─────────────────────────────────────────────────────────────
// POM — Preparation, Observation, Manoeuvre (2-6-2)
// Phase A (0.00–0.35): Preparation (engine + gear) — the "first 2".
// Phase B (0.35–0.75): Six-point observation sweep — the "6".
//   Sequence: L shoulder → L mirror → ahead → interior mirror
//   → R shoulder → R mirror.
// Phase C (0.75–0.85): Timing — approaching traffic, we wait for
//   vehicle 6 to pass before starting the sweep, then move off as
//   vehicle 7 (the last one) clears.
// Phase D (0.85–1.00): Manoeuvre — smooth move away from kerb.
// ─────────────────────────────────────────────────────────────

const PAINT = "#f5f5f0";
const ROAD = "#2b2b2e";
const KERB = "#8b8f95";
const GRASS = "#3d6a2f";
const ACCENT = "#C97845";
const GOOD = "#22c55e";

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

type CheckPoint = {
  key: string;
  label: string;
  dx: number;
  dy: number;
  angle: number;
};

const CHECKS: CheckPoint[] = [
  { key: "ls", label: "Left shoulder",   dx: -22, dy:  14, angle: 200 },
  { key: "lm", label: "Left mirror",     dx: -16, dy:  10, angle: 170 },
  { key: "ah", label: "Road ahead",      dx:  26, dy:   0, angle:   0 },
  { key: "im", label: "Interior mirror", dx:   0, dy:  -2, angle: 180 },
  { key: "rs", label: "Right shoulder",  dx: -22, dy: -14, angle: 160 },
  { key: "rm", label: "Right mirror",    dx: -16, dy: -10, angle: 190 },
];

function EgoCar({
  cx,
  cy,
  indicator,
  engineOn,
}: {
  cx: number;
  cy: number;
  indicator?: boolean;
  engineOn?: boolean;
}) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <rect x={-22} y={-11} width={44} height={22} rx={5} fill="#2f6bf0" stroke="#0a0a0a" strokeWidth={0.9} />
      <rect x={-12} y={-9} width={7} height={18} rx={1} fill="#111" opacity={0.75} />
      <rect x={5} y={-9} width={7} height={18} rx={1} fill="#111" opacity={0.55} />
      <rect x={22} y={-8} width={1.8} height={3} fill="#fff8c0" />
      <rect x={22} y={5} width={1.8} height={3} fill="#fff8c0" />
      <rect x={-4} y={-13} width={5} height={2} fill="#111" />
      <rect x={-4} y={11} width={5} height={2} fill="#111" />
      {engineOn && (
        <circle cx={-26} cy={0} r={2.2} fill="#cfd3d8" opacity={0.6}>
          <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="r" values="2;3.6;2" dur="1.2s" repeatCount="indefinite" />
        </circle>
      )}
      {indicator && (
        <>
          <circle cx={-24} cy={-9} r={1.8} fill="#ffb020">
            <animate attributeName="opacity" values="1;0.15;1" dur="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={22} cy={-9} r={1.8} fill="#ffb020">
            <animate attributeName="opacity" values="1;0.15;1" dur="0.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </g>
  );
}

function Vehicle({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-14} y={-8} width={28} height={16} rx={3} fill={color} stroke="#0a0a0a" strokeWidth={0.6} />
      <rect x={-8} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.65} />
      <rect x={3} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.45} />
      <rect x={-15.6} y={-7} width={1.4} height={3} fill="#ff2a2a" opacity={0.6} />
      <rect x={-15.6} y={4} width={1.4} height={3} fill="#ff2a2a" opacity={0.6} />
    </g>
  );
}

function CheckWedge({ cx, cy, angleDeg, active }: { cx: number; cy: number; angleDeg: number; active: boolean }) {
  const spread = 55;
  const r = 46;
  const a1 = ((angleDeg - spread / 2) * Math.PI) / 180;
  const a2 = ((angleDeg + spread / 2) * Math.PI) / 180;
  const p1x = cx + Math.cos(a1) * r;
  const p1y = cy + Math.sin(a1) * r;
  const p2x = cx + Math.cos(a2) * r;
  const p2y = cy + Math.sin(a2) * r;
  return (
    <path
      d={`M ${cx} ${cy} L ${p1x} ${p1y} A ${r} ${r} 0 0 1 ${p2x} ${p2y} Z`}
      fill={active ? "rgba(201,120,69,0.35)" : "rgba(201,120,69,0.08)"}
      stroke={active ? ACCENT : "rgba(201,120,69,0.25)"}
      strokeWidth={active ? 1.6 : 0.8}
    />
  );
}

function PomScene(t: number) {
  const carCx = 300;
  const carCy = 220;

  const inPrep = t < 0.35;
  const inObs = t >= 0.35 && t < 0.85;
  const inMan = t >= 0.85;

  const obsPhase = Math.max(0, Math.min(1, (t - 0.35) / 0.4));
  const activeIdx = obsPhase < 1 ? Math.min(5, Math.floor(obsPhase * 6)) : 5;

  const traffic = Array.from({ length: 7 }).map((_, i) => {
    const start = 0.05 + i * 0.09;
    const local = Math.max(0, Math.min(1, (t - start) / 0.55));
    const x = 680 - local * 780;
    return { i, x };
  });

  const moveK = inMan ? easeInOut((t - 0.85) / 0.15) : 0;
  const egoX = carCx + moveK * 90;
  const egoY = carCy - moveK * 6;

  const phaseLabel = inPrep
    ? "1 · PREPARATION"
    : inObs && t < 0.75
    ? "2 · SIX-POINT OBSERVATION"
    : inObs
    ? "2b · TIMING — wait for vehicle 7"
    : "3 · MANOEUVRE";

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <defs>
        <linearGradient id="sky-pom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
      </defs>
      <rect width={640} height={360} fill="url(#sky-pom)" />
      <rect x={0} y={120} width={640} height={22} fill={GRASS} opacity={0.85} />
      <rect x={0} y={142} width={640} height={110} fill={ROAD} />
      <line x1={0} y1={144} x2={640} y2={144} stroke={PAINT} strokeWidth={1.4} />
      <line x1={0} y1={250} x2={640} y2={250} stroke={PAINT} strokeWidth={1.4} />
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={i * 40} y={195} width={22} height={3} fill={PAINT} opacity={0.55} />
      ))}
      <rect x={0} y={252} width={640} height={8} fill={KERB} />
      <rect x={0} y={260} width={640} height={40} fill="#5a5f66" />
      <rect x={0} y={300} width={640} height={60} fill={GRASS} opacity={0.7} />

      {traffic.map((v) => (
        <Vehicle key={v.i} x={v.x} y={170} color={v.i === 6 ? "#e05a3a" : "#8a8a8f"} />
      ))}

      {inObs && t < 0.75 && (
        <g>
          {CHECKS.map((c, i) => (
            <CheckWedge
              key={c.key}
              cx={carCx + c.dx}
              cy={carCy + c.dy}
              angleDeg={c.angle}
              active={i === activeIdx}
            />
          ))}
        </g>
      )}

      <EgoCar cx={egoX} cy={egoY} indicator={t > 0.7} engineOn={t > 0.05} />

      {inObs && (
        <g transform="translate(20 132)">
          <rect width={160} height={20} rx={4} fill="#000" opacity={0.55} />
          <text x={10} y={14} fontSize={10} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
            Approaching: 7 vehicles
          </text>
        </g>
      )}

      <g transform="translate(20 20)">
        <rect width={360} height={44} rx={6} fill="#000" opacity={0.6} />
        <text x={12} y={16} fontSize={9} fill={ACCENT} fontWeight={700} letterSpacing="1.5" fontFamily="sans-serif">
          GSM ROUTINE
        </text>
        <text x={12} y={34} fontSize={13} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
          {inPrep && "Preparation — engine on, correct gear"}
          {inObs && t < 0.75 && `Six-point check — ${CHECKS[activeIdx].label}`}
          {inObs && t >= 0.75 && "Watching vehicle 7 — the last one"}
          {inMan && "Manoeuvre — move away smoothly"}
        </text>
      </g>

      <g transform="translate(470 20)">
        <rect width={154} height={44} rx={6} fill="#000" opacity={0.55} />
        <text x={12} y={16} fontSize={9} fill="#9ca3af" letterSpacing="1.5" fontFamily="sans-serif">
          2 - 6 - 2
        </text>
        <text x={12} y={34} fontSize={11} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
          {phaseLabel}
        </text>
      </g>

      {inMan && (
        <g transform="translate(300 100)">
          <circle r={14} fill="none" stroke={GOOD} strokeWidth={1.5} />
          <text textAnchor="middle" y={4} fontSize={14} fontWeight={800} fill={GOOD} fontFamily="sans-serif">
            ✓
          </text>
        </g>
      )}
    </svg>
  );
}

export const pomRoutine: Lesson = {
  slug: "pom-routine",
  title: "POM — Preparation, Observation, Manoeuvre (2-6-2)",
  category: "Driving Strategies • GSM Method",
  rule: "Rules 159, 161, 179, 202",
  objective:
    "Move off — from the kerb, a junction or any hold — using POM in the correct order, with a full six-point observation and perfect timing so you pull away safely and smoothly every time.",
  think: [
    "Have I prepared the car BEFORE I look? (engine, gear)",
    "Am I doing all six observation points, in order?",
    "If I have to wait, am I redoing the six-point check?",
    "Is my signal still needed — or am I misleading someone?",
    "Am I timing my sweep so the road is clear as I finish?",
  ],
  ruleHeadline: "Preparation first. Observation second. Manoeuvre last. Always in that order.",
  ruleBullets: [
    "2 — Preparation: engine on and correct gear selected",
    "6 — Observation: L shoulder · L mirror · ahead · interior mirror · R shoulder · R mirror",
    "2 — Manoeuvre: signal if needed, then move away smoothly",
    "Waiting? Cancel a misleading signal and repeat the six-point check",
    "Time the sweep so it FINISHES as the last vehicle passes",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why the order matters</p>
      <p>
        If you observe <em>before</em> preparing the car, by the time you have the engine on and the gear selected, the road has changed and your information is out of date. Preparation first means when your observation says "go," you can go — smoothly and immediately.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why six points</p>
      <p>
        Left shoulder, left mirror, ahead, interior mirror, right shoulder, right mirror. This is one complete sweep — pavement to pavement, front to back. It catches pedestrians and cyclists on the pavement, traffic behind, and anything approaching from the opposite direction before you commit.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Timing the sweep</p>
      <p>
        Never start the six-point check the instant a queue arrives — you'll finish it far too early and the picture will change again. If seven vehicles are approaching, keep watching. When vehicle six passes and vehicle seven is the last one, <strong>then</strong> start your sweep. Your check finishes just as the road becomes clear. Smooth, safe, no unnecessary waiting.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">If you signalled</p>
      <p>
        If a signal now suggests you are pulling out into a gap you no longer have, cancel it. Then redo the full six-point check. Never move on old information.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Smart driving</p>
      <p>
        Smart driving applies the same thinking beyond POM. If a traffic light is already red, there is no benefit in accelerating towards it — ease off, brake early and smoothly. Often the lights will change while you are still rolling, and you continue without harsh braking or stopping unnecessarily. The benefits: better planning, smoother driving, less stress, better fuel economy, better vehicle control, safer progress — and a higher standard for the DVSA driving test.
      </p>
    </>
  ),
  georgeExplains:
    "POM is 2-6-2. Two things first — engine on, correct gear. Then six observations, in order — left shoulder, left mirror, ahead, interior mirror, right shoulder, right mirror. Then two more — signal if needed, and move. The clever bit is the timing. If I can see seven cars coming, I don't rush the sweep. I count them down. When number six goes past and number seven is the last one, that's when I start my six-point check. My check finishes just as the road clears — perfect timing, smooth away, no hesitation. Same principle at a red light — approach gently, brake early, and often you'll roll through as it turns green. That's smart driving.",
  commonMistakes: [
    "Observing before the car is prepared, then losing the gap",
    "A rushed 'glance' instead of a full six-point sweep",
    "Skipping the right shoulder (blind spot) check",
    "Leaving a signal on when the meaning has changed",
    "Failing to repeat the six-point check after waiting",
    "Starting the sweep too early and finishing before the road is clear",
    "Accelerating hard towards a red light instead of easing off",
  ],
  gsmTips: [
    "Say it out loud: 'Prep — Obs — Move.'",
    "Count the six checks in your head: 1-2-3-4-5-6",
    "If you have to wait, treat the next move like a brand new POM",
    "Watch the last vehicle. Sweep as it approaches. Move as it passes.",
    "Red light ahead? Ease off early — let the car do the work.",
    "Smart POM = smooth POM. No jerk, no hesitation.",
  ],
  keyTakeaway:
    "POM is 2-6-2. Prepare the car, do a full six-point sweep, then move. Time the sweep so it ends as the road clears.",
  durationMs: 22000,
  captions: [
    { at: 0.05, label: "Preparation", detail: "Engine on. Correct gear. Car ready to go." },
    { at: 0.4,  label: "Six-point check begins", detail: "Left shoulder → left mirror → ahead…" },
    { at: 0.6,  label: "…continues", detail: "…interior mirror → right shoulder → right mirror." },
    { at: 0.78, label: "Timing", detail: "Watch vehicle 7 — the last one. Move as it passes." },
    { at: 0.9,  label: "Manoeuvre", detail: "Signal if needed, then move away smoothly." },
  ],
  questions: [
    {
      at: 0.32,
      prompt: "In the POM routine, why must preparation come BEFORE observation?",
      options: [
        {
          label: "It doesn't matter — you can do them in any order.",
          explain: "No. If you observe first, by the time the car is ready the road has changed and your information is stale.",
        },
        {
          label: "So the car is ready to move the moment your observation says it's safe.",
          correct: true,
          explain: "Exactly. Prep first means when the road is clear, you can go — smoothly and without delay.",
        },
        {
          label: "Because the examiner only marks preparation.",
          explain: "No — the examiner marks the whole routine. Order matters because of timing, not marks.",
        },
      ],
    },
    {
      at: 0.74,
      prompt:
        "There are seven vehicles approaching. When should you start your six-point observation?",
      options: [
        {
          label: "Immediately, then wait for the queue to pass.",
          explain: "No. You'll finish the sweep far too early and the picture will change again.",
        },
        {
          label: "When vehicle six has passed and vehicle seven is the last one.",
          correct: true,
          explain: "Correct. Your sweep finishes just as the road becomes clear — perfect timing.",
        },
        {
          label: "Only after every vehicle has already gone past.",
          explain: "That works, but you'll lose time. Time the sweep so it ends as the road clears.",
        },
      ],
    },
  ],
  render: PomScene,
};
