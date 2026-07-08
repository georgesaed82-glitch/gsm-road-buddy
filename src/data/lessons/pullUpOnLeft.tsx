import type { Lesson } from "@/components/driving-clips/LessonShell";

// ─────────────────────────────────────────────────────────────
// Understanding the Examiner's Instructions — Pull Up on the Left
// Two-phase animation:
//   Phase A (0.00–0.50): "somewhere safe and convenient" — the
//     learner chooses. Bad spots flash red as the car passes them;
//     the safe bay is highlighted green where the car stops.
//   Phase B (0.55–1.00): "next to the driveway" — the examiner
//     picks the spot, and the car stops there. No penalty.
// ─────────────────────────────────────────────────────────────

const PAINT = "#f5f5f0";
const ROAD = "#2b2b2e";
const KERB = "#8b8f95";
const GRASS = "#3d6a2f";
const BAD = "#ef4444";
const GOOD = "#22c55e";
const ACCENT = "#C97845";

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

type Spot = { x: number; w: number; label: string; sub?: string; kind: "bad" | "good" };

// Ordered left-to-right along the kerb. Positions are in SVG px.
const SPOTS: Spot[] = [
  { x: 60, w: 60, label: "Driveway", sub: "Blocks access", kind: "bad" },
  { x: 140, w: 60, label: "Zigzags", sub: "Never stop", kind: "bad" },
  { x: 220, w: 60, label: "School Keep Clear", sub: "Prohibited", kind: "bad" },
  { x: 300, w: 70, label: "Parking bay", sub: "Safe & legal", kind: "good" },
  { x: 390, w: 60, label: "Double yellows", sub: "No stopping", kind: "bad" },
  { x: 470, w: 60, label: "Bus stop", sub: "Restricted", kind: "bad" },
  { x: 550, w: 60, label: "Single yellow", sub: "Check times", kind: "good" },
];

// Choice targets for the two examiner instructions:
const SAFE_TARGET = 335; // parking bay centre
const DRIVEWAY_TARGET = 90; // driveway centre

function CarTop({
  cx,
  cy,
  color,
  indicator,
  braking,
}: {
  cx: number;
  cy: number;
  color: string;
  indicator?: boolean;
  braking?: boolean;
}) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <rect
        x={-18}
        y={-9}
        width={36}
        height={18}
        rx={4}
        fill={color}
        stroke="#0a0a0a"
        strokeWidth={0.8}
      />
      <rect x={-10} y={-7} width={6} height={14} rx={1} fill="#111" opacity={0.75} />
      <rect x={4} y={-7} width={6} height={14} rx={1} fill="#111" opacity={0.55} />
      {/* headlights (front = right) */}
      <rect x={18} y={-7} width={1.6} height={3} fill="#fff8c0" />
      <rect x={18} y={4} width={1.6} height={3} fill="#fff8c0" />
      {/* brake lights (rear) */}
      <rect x={-19.6} y={-7} width={1.6} height={3} fill={braking ? "#ff2a2a" : "#5a1010"} />
      <rect x={-19.6} y={4} width={1.6} height={3} fill={braking ? "#ff2a2a" : "#5a1010"} />
      {/* left indicator (kerb side) */}
      {indicator && (
        <>
          <circle cx={-19} cy={7.5} r={1.8} fill="#ffb020">
            <animate
              attributeName="opacity"
              values="1;0.15;1"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={18} cy={7.5} r={1.8} fill="#ffb020">
            <animate
              attributeName="opacity"
              values="1;0.15;1"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}
    </g>
  );
}

function KerbFeature({ spot, active }: { spot: Spot; active: boolean }) {
  const isBad = spot.kind === "bad";
  const stroke = active ? (isBad ? BAD : GOOD) : "#4a4a4e";
  const fill = active
    ? isBad
      ? "rgba(239,68,68,0.18)"
      : "rgba(34,197,94,0.18)"
    : "rgba(255,255,255,0.04)";
  return (
    <g>
      {/* Kerb section marker */}
      <rect
        x={spot.x}
        y={230}
        width={spot.w}
        height={10}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.2}
      />
      {/* Feature-specific paint */}
      {spot.label === "Driveway" && (
        <rect
          x={spot.x + 8}
          y={244}
          width={spot.w - 16}
          height={30}
          fill="#3a3a3d"
          stroke={PAINT}
          strokeDasharray="3 2"
          strokeWidth={0.8}
        />
      )}
      {spot.label === "Zigzags" && (
        <polyline
          points={Array.from({ length: 10 })
            .map((_, i) => `${spot.x + i * (spot.w / 9)},${228 + (i % 2 === 0 ? -6 : 0)}`)
            .join(" ")}
          fill="none"
          stroke={PAINT}
          strokeWidth={1.4}
        />
      )}
      {spot.label === "School Keep Clear" && (
        <text
          x={spot.x + spot.w / 2}
          y={225}
          textAnchor="middle"
          fontSize={6.5}
          fill="#facc15"
          fontWeight={800}
          fontFamily="sans-serif"
        >
          SCHOOL KEEP CLEAR
        </text>
      )}
      {spot.label === "Double yellows" && (
        <>
          <line
            x1={spot.x}
            y1={224}
            x2={spot.x + spot.w}
            y2={224}
            stroke="#facc15"
            strokeWidth={1.8}
          />
          <line
            x1={spot.x}
            y1={228}
            x2={spot.x + spot.w}
            y2={228}
            stroke="#facc15"
            strokeWidth={1.8}
          />
        </>
      )}
      {spot.label === "Single yellow" && (
        <line
          x1={spot.x}
          y1={226}
          x2={spot.x + spot.w}
          y2={226}
          stroke="#facc15"
          strokeWidth={1.8}
        />
      )}
      {spot.label === "Bus stop" && (
        <>
          <rect
            x={spot.x + spot.w / 2 - 10}
            y={196}
            width={20}
            height={20}
            rx={2}
            fill="#1a3a7a"
            stroke="#fff"
            strokeWidth={0.8}
          />
          <text
            x={spot.x + spot.w / 2}
            y={210}
            textAnchor="middle"
            fontSize={9}
            fontWeight={800}
            fill="#fff"
            fontFamily="sans-serif"
          >
            B
          </text>
        </>
      )}
      {spot.label === "Parking bay" && (
        <>
          <rect
            x={spot.x + 4}
            y={244}
            width={spot.w - 8}
            height={30}
            fill="none"
            stroke={PAINT}
            strokeWidth={1}
            strokeDasharray="4 2"
          />
          <text
            x={spot.x + spot.w / 2}
            y={262}
            textAnchor="middle"
            fontSize={7}
            fill={PAINT}
            opacity={0.85}
            fontFamily="sans-serif"
          >
            P
          </text>
        </>
      )}
      {/* Label */}
      <g transform={`translate(${spot.x + spot.w / 2} 292)`}>
        <text
          textAnchor="middle"
          fontSize={7.5}
          fontWeight={700}
          fill={active ? (isBad ? BAD : GOOD) : "#c9cbd1"}
          fontFamily="sans-serif"
        >
          {spot.label.toUpperCase()}
        </text>
        {spot.sub && (
          <text textAnchor="middle" y={9} fontSize={6.5} fill="#8a8f97" fontFamily="sans-serif">
            {spot.sub}
          </text>
        )}
      </g>
    </g>
  );
}

function PullUpOnLeftScene(t: number) {
  // Two phases, with a brief reset between.
  const phaseA = t < 0.5;
  const phaseB = t >= 0.55;

  let carX = -40;
  let braking = false;
  let indicator = false;
  let target = 0;
  let instruction = "";

  if (phaseA) {
    const k = t / 0.5;
    // Ease from off-screen left to safe target (parking bay).
    carX = -40 + (SAFE_TARGET + 40) * easeInOut(k);
    target = SAFE_TARGET;
    indicator = k > 0.55;
    braking = k > 0.75;
    instruction = "Somewhere safe and convenient";
  } else if (phaseB) {
    const k = Math.min(1, (t - 0.55) / 0.45);
    carX = -40 + (DRIVEWAY_TARGET + 40) * easeInOut(k);
    target = DRIVEWAY_TARGET;
    indicator = k > 0.4;
    braking = k > 0.7;
    instruction = "Next to the driveway";
  } else {
    // brief reset between phases
    carX = -40;
    instruction = "";
  }

  // Which spot is closest to the car right now?
  const nearIdx = SPOTS.reduce((best, s, i) => {
    const dc = Math.abs(s.x + s.w / 2 - carX);
    const db = Math.abs(SPOTS[best].x + SPOTS[best].w / 2 - carX);
    return dc < db ? i : best;
  }, 0);

  // Active spot logic:
  //  - In Phase A: flash any bad spot the car is currently passing, and
  //    keep the parking bay highlighted green as the target.
  //  - In Phase B: highlight only the driveway (green, because examiner
  //    chose it), no other spots go red.
  const activeMap = SPOTS.map((s, i) => {
    if (phaseA) {
      if (s.kind === "good" && s.label === "Parking bay") return true;
      if (i === nearIdx && s.kind === "bad") return true;
      return false;
    }
    if (phaseB) {
      return s.label === "Driveway";
    }
    return false;
  });

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <defs>
        <linearGradient id="sky-pul" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
      </defs>
      <rect width={640} height={360} fill="url(#sky-pul)" />

      {/* Verge on far side */}
      <rect x={0} y={120} width={640} height={22} fill={GRASS} opacity={0.85} />
      {/* Road */}
      <rect x={0} y={142} width={640} height={88} fill={ROAD} />
      {/* Edge lines */}
      <line x1={0} y1={144} x2={640} y2={144} stroke={PAINT} strokeWidth={1.4} />
      <line x1={0} y1={228} x2={640} y2={228} stroke={PAINT} strokeWidth={1.4} />
      {/* Centre dashes */}
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={i * 40} y={183} width={22} height={3} fill={PAINT} opacity={0.55} />
      ))}
      {/* Kerb slab */}
      <rect x={0} y={230} width={640} height={10} fill={KERB} />
      {/* Pavement */}
      <rect x={0} y={240} width={640} height={40} fill="#5a5f66" />
      {/* Grass beyond pavement */}
      <rect x={0} y={280} width={640} height={80} fill={GRASS} opacity={0.7} />

      {/* Kerb features */}
      {SPOTS.map((s, i) => (
        <KerbFeature key={i} spot={s} active={activeMap[i]} />
      ))}

      {/* Target marker (a soft glow at the target when instruction is active) */}
      {(phaseA || phaseB) && (
        <g opacity={0.85}>
          <circle
            cx={target}
            cy={200}
            r={22}
            fill="none"
            stroke={GOOD}
            strokeWidth={1.6}
            strokeDasharray="3 3"
          />
          <text
            x={target}
            y={172}
            textAnchor="middle"
            fontSize={7.5}
            fontWeight={800}
            fill={GOOD}
            fontFamily="sans-serif"
            letterSpacing="1.2"
          >
            STOP HERE
          </text>
        </g>
      )}

      {/* Ego car */}
      {(phaseA || phaseB) && (
        <CarTop cx={carX} cy={210} color="#2f6bf0" indicator={indicator} braking={braking} />
      )}

      {/* Instruction ribbon (examiner speech) */}
      <g transform="translate(20 20)">
        <rect width={360} height={40} rx={6} fill="#000" opacity={0.6} />
        <text
          x={12}
          y={16}
          fontSize={9}
          fill={ACCENT}
          fontWeight={700}
          letterSpacing="1.5"
          fontFamily="sans-serif"
        >
          EXAMINER SAYS
        </text>
        <text x={12} y={32} fontSize={13} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
          “Pull up on the left {instruction ? `— ${instruction}` : "…"}”
        </text>
      </g>

      {/* Phase label */}
      <g transform="translate(500 20)">
        <rect width={124} height={40} rx={6} fill="#000" opacity={0.55} />
        <text x={12} y={16} fontSize={9} fill="#9ca3af" letterSpacing="1.5" fontFamily="sans-serif">
          {phaseA ? "INSTRUCTION 1" : phaseB ? "INSTRUCTION 2" : "…"}
        </text>
        <text x={12} y={32} fontSize={11} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
          {phaseA ? "Learner chooses" : phaseB ? "Examiner chooses" : ""}
        </text>
      </g>
    </svg>
  );
}

export const pullUpOnLeft: Lesson = {
  slug: "pull-up-on-left",
  title: "Understanding the Examiner’s Instructions — Pull Up on the Left",
  category: "Driving Strategies • Manoeuvres",
  rule: "Rules 238–252",
  objective:
    "Learn to listen carefully to the examiner’s exact wording and know when you must choose a safe, legal place yourself — and when the examiner is choosing it for you.",
  think: [
    "Did the examiner say ‘safe and convenient’ or did they choose the spot?",
    "If it’s my choice, is this spot legal, safe and not blocking anyone?",
    "Are there driveways, zigzags, yellow lines, bus stops or crossings nearby?",
    "Have I done MSPSL — mirrors, signal, position, speed, look?",
    "Would stopping here cause danger or inconvenience to anyone?",
  ],
  ruleHeadline: "Listen to the words. If it’s your choice — choose somewhere legal and safe.",
  ruleBullets: [
    "‘Somewhere safe and convenient’ — the decision is YOURS",
    "A specific instruction (e.g. ‘next to the driveway’) — you FOLLOW it",
    "Never stop on zigzags, School Keep Clear, double yellows, bus stops or near crossings",
    "Avoid driveways, dropped kerbs and anywhere that blocks access",
    "Always use MSPSL before stopping — smooth, controlled and legal",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why it matters</p>
      <p>
        The examiner’s wording tells you who is making the decision. If they say{" "}
        <strong>“somewhere safe and convenient”</strong>, they’re testing your judgement — you’re
        responsible for picking a spot that is legal, safe and doesn’t inconvenience anyone. If they
        give you a <strong>specific</strong> location, they are taking that decision away from you
        and you simply carry it out (unless it would be immediately dangerous).
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When it happens</p>
      <p>
        Somewhere on almost every driving test. It’s one of the earliest ways an examiner checks
        whether you can plan, read the road and follow instructions calmly.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">
        How to do it — MSPSL
      </p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Mirrors — interior, then left.</li>
        <li>Signal left in good time.</li>
        <li>Position close to the kerb.</li>
        <li>Speed — reduce smoothly under control.</li>
        <li>Look — final observation before you stop.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "Two different instructions, two different responsibilities. If I say ‘somewhere safe and convenient,’ that’s your call — pick a quiet spot, a parking bay, or a section of road with no restrictions. If I say ‘next to the driveway,’ that’s my call — just carry it out. You won’t be marked down for stopping next to a driveway when you were told to. Listen to the words, then act.",
  commonMistakes: [
    "Pulling up next to a driveway when the examiner gave a free choice",
    "Stopping on zigzag lines, School Keep Clear or double yellows",
    "Rushing the stop and forgetting mirrors or signal",
    "Refusing to stop at the driveway when the examiner specifically asked",
    "Stopping too far from the kerb or on a slope without steering into it",
  ],
  mistakes: [
    {
      wrong:
        "The examiner says ‘safe and convenient’ and the learner stops right next to a driveway.",
      why: "The decision was theirs, and a driveway blocks access — that’s inconvenient and would attract a fault.",
      right:
        "Choose a quiet stretch of road, a parking bay or a section with no restrictions and good visibility.",
    },
    {
      wrong:
        "The examiner says ‘pull up next to the driveway’ and the learner drives past looking for somewhere else.",
      why: "The examiner has chosen the spot for you. Ignoring a clear instruction is a fault in itself.",
      right:
        "Follow the instruction: MSPSL and stop next to the driveway. You won’t be marked down for the location.",
    },
  ],
  gsmTips: [
    "Listen to the whole sentence before you act",
    "Ask yourself: ‘Am I choosing, or are they choosing?’",
    "If in doubt, ease off and take an extra second to plan",
    "MSPSL every single time — no exceptions",
    "Safe · Legal · Convenient — three boxes to tick when it’s your call",
  ],
  keyTakeaway:
    "The words the examiner uses decide who chooses the spot. ‘Safe and convenient’ = your call. A specific instruction = you follow it.",
  durationMs: 20000,
  captions: [
    {
      at: 0.0,
      label: "Instruction 1 — ‘safe and convenient’",
      detail: "Your choice: legal, safe, no inconvenience.",
    },
    {
      at: 0.15,
      label: "Reading the kerb",
      detail: "Driveway, zigzags, School Keep Clear — all no-go.",
    },
    {
      at: 0.35,
      label: "Parking bay ahead — good spot",
      detail: "Clear of restrictions and hazards. MSPSL to stop.",
    },
    {
      at: 0.55,
      label: "Instruction 2 — ‘next to the driveway’",
      detail: "The examiner has chosen. You just carry it out.",
    },
    {
      at: 0.85,
      label: "Stopping next to the driveway",
      detail: "No fault — the instruction was specific.",
    },
  ],
  questions: [
    {
      at: 0.28,
      prompt:
        "The examiner says: ‘Pull up on the left somewhere safe and convenient.’ Which of these is the best place to stop?",
      options: [
        {
          label: "Next to the driveway just ahead",
          explain:
            "No. When it’s your choice, a driveway is inconvenient — it blocks access and would attract a fault.",
        },
        {
          label: "In the marked parking bay a little further up",
          correct: true,
          explain:
            "Correct. A parking bay is legal, safe and doesn’t inconvenience anyone. That’s exactly what ‘safe and convenient’ means.",
        },
        {
          label: "On the single yellow line right here — it’s only briefly",
          explain:
            "Not the best choice. Single yellows have time restrictions and you don’t know what applies. When the decision is yours, pick somewhere with no doubt.",
        },
      ],
    },
    {
      at: 0.7,
      prompt: "The examiner says: ‘Pull up on the left next to the driveway.’ What should you do?",
      options: [
        {
          label: "Ignore the driveway and find a safer spot instead",
          explain:
            "No — the examiner has given a specific instruction. Ignoring it is a fault in itself.",
        },
        {
          label: "MSPSL and stop next to the driveway as asked",
          correct: true,
          explain:
            "Correct. When the examiner chooses the location you carry it out. You won’t be marked down for stopping there.",
        },
        {
          label: "Ask the examiner if they’re sure",
          explain: "No. The examiner has been clear. Trust the instruction and act on it smoothly.",
        },
      ],
    },
  ],
  render: PullUpOnLeftScene,
};
