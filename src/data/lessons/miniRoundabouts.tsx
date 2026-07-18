import type { Lesson } from "@/components/driving-clips/LessonShell";

// ─────────────────────────────────────────────────────────────
// Mini Roundabouts — priority, the "blocker" and the painted dome.
// Overhead scene: ego approaches a mini-roundabout from the south,
// gives priority to a car already on the right, then takes the 2nd
// exit (ahead) with a right-mirror check on exit.
// ─────────────────────────────────────────────────────────────

const PAINT = "#f5f5f0";
const ROAD = "#2b2b2e";
const GRASS = "#3d6a2f";
const ACCENT = "#C97845";
const WHITE_DOME = "#e9e6d8";
const GOOD = "#22c55e";
const WARN = "#f59e0b";

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function Car({
  cx,
  cy,
  angle = 0,
  color = "#234B36",
  indicator,
  braking,
}: {
  cx: number;
  cy: number;
  angle?: number;
  color?: string;
  indicator?: "left" | "right" | null;
  braking?: boolean;
}) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
      <rect x={-13} y={-6.5} width={2} height={13} fill="#000" opacity={0.25} />
      <rect x={-14} y={-7} width={28} height={14} rx={3} fill={color} stroke="#0a0a0a" strokeWidth={0.8} />
      <rect x={-8} y={-5.5} width={5} height={11} rx={1} fill="#111" opacity={0.7} />
      <rect x={3} y={-5.5} width={5} height={11} rx={1} fill="#111" opacity={0.55} />
      <rect x={13} y={-6} width={1.6} height={3} fill="#fff8c0" />
      <rect x={13} y={3} width={1.6} height={3} fill="#fff8c0" />
      <rect x={-14.6} y={-6} width={1.6} height={3} fill={braking ? "#ff2a2a" : "#5a1010"} />
      <rect x={-14.6} y={3} width={1.6} height={3} fill={braking ? "#ff2a2a" : "#5a1010"} />
      {indicator === "right" && (
        <circle cx={13} cy={5.5} r={1.8} fill="#ffb020">
          <animate attributeName="opacity" values="1;0.15;1" dur="0.5s" repeatCount="indefinite" />
        </circle>
      )}
      {indicator === "left" && (
        <circle cx={13} cy={-5.5} r={1.8} fill="#ffb020">
          <animate attributeName="opacity" values="1;0.15;1" dur="0.5s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

function MiniRoundaboutScene(t: number) {
  // Layout: crossroads meeting at a painted white dome (mini roundabout).
  // Ego from SOUTH → straight ahead (NORTH, 2nd exit).
  // Priority car from EAST → turning south-to-west (crosses ego's path).
  const CX = 320;
  const CY = 180;
  const R = 22; // dome radius

  // Priority (east) car — enters BEFORE ego, so ego must give way.
  // Path: from x=560 at east arm → around the dome → exits west.
  let pcx: number, pcy: number, pa: number;
  if (t < 0.35) {
    const k = t / 0.35;
    pcx = 560 - easeInOut(k) * 200; // 560 → 360 (approaches dome)
    pcy = CY;
    pa = 180;
  } else if (t < 0.6) {
    const k = (t - 0.35) / 0.25;
    // curve around top of dome (anticlockwise UK)
    const start = 0; // right of centre, going anti-clockwise
    const end = Math.PI; // finishes on the left
    const ang = start + easeInOut(k) * end;
    pcx = CX + (R + 14) * Math.cos(ang);
    pcy = CY - (R + 14) * Math.sin(ang);
    pa = 180 - (ang * 180) / Math.PI;
  } else {
    const k = (t - 0.6) / 0.4;
    pcx = CX - (R + 14) - easeInOut(k) * 260; // exit west
    pcy = CY;
    pa = 180;
  }

  // Ego (south) car — approach, GIVE WAY (wait for priority), then go.
  let ecx: number, ecy: number, ea: number, ebrake = false, eind: "right" | null = null;
  if (t < 0.28) {
    const k = t / 0.28;
    ecx = CX;
    ecy = 340 - easeInOut(k) * 108; // 340 → 232 (stop just short of dome)
    ea = -90;
    ebrake = true;
  } else if (t < 0.55) {
    // held — priority car in the way
    ecx = CX;
    ecy = 232;
    ea = -90;
    ebrake = true;
  } else if (t < 0.85) {
    const k = (t - 0.55) / 0.3;
    // proceed straight over the dome
    ecx = CX;
    ecy = 232 - easeInOut(k) * 130; // 232 → 102
    ea = -90;
  } else {
    const k = (t - 0.85) / 0.15;
    ecx = CX;
    ecy = 102 - easeInOut(k) * 90;
    ea = -90;
    eind = "right"; // right-mirror check emphasised on exit
  }

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <defs>
        <linearGradient id="sky-miniround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
      </defs>
      <rect width={640} height={360} fill="url(#sky-miniround)" />
      <rect width={640} height={360} fill={GRASS} opacity={0.35} />

      {/* Roads (crossroads) */}
      <rect x={0} y={CY - 34} width={640} height={68} fill={ROAD} />
      <rect x={CX - 34} y={0} width={68} height={360} fill={ROAD} />

      {/* Give-Way triangles at each approach (mini roundabout markings) */}
      {[
        { x: CX, y: CY + 40, r: 0 }, // south approach (ego)
        { x: CX, y: CY - 40, r: 180 },
        { x: CX + 40, y: CY, r: -90 },
        { x: CX - 40, y: CY, r: 90 },
      ].map((g, i) => (
        <polygon
          key={i}
          transform={`translate(${g.x} ${g.y}) rotate(${g.r})`}
          points="-10,0 10,0 0,10"
          fill={PAINT}
          opacity={0.9}
        />
      ))}

      {/* Painted dome (mini roundabout) */}
      <circle cx={CX} cy={CY} r={R} fill={WHITE_DOME} stroke={PAINT} strokeWidth={1.5} />
      <circle cx={CX} cy={CY} r={R - 5} fill="none" stroke={PAINT} strokeWidth={0.8} opacity={0.5} />

      {/* Priority label — when the priority car is on the dome */}
      {t > 0.28 && t < 0.6 && (
        <g transform={`translate(${CX + 40} ${CY - 60})`}>
          <rect width={140} height={22} rx={4} fill="#000" opacity={0.75} />
          <text x={70} y={15} textAnchor="middle" fontSize={10} fontWeight={800} fill={WARN} fontFamily="sans-serif">
            GIVE WAY TO THE RIGHT
          </text>
        </g>
      )}

      {/* Ego's path plan */}
      <path
        d={`M ${CX} 340 L ${CX} ${CY + 6} A ${R + 10} ${R + 10} 0 0 1 ${CX} ${CY - 26} L ${CX} 20`}
        stroke={ACCENT}
        strokeWidth={2}
        strokeDasharray="5 4"
        fill="none"
        opacity={0.7}
      />

      {/* Cars */}
      <Car cx={pcx} cy={pcy} angle={pa} color="#e05a3a" />
      <Car cx={ecx} cy={ecy} angle={ea} color="#234B36" braking={ebrake} indicator={eind} />

      {/* Banner */}
      <g transform="translate(20 14)">
        <rect width={604} height={44} rx={6} fill="#000" opacity={0.62} />
        <text x={14} y={16} fontSize={9} fill={ACCENT} fontWeight={800} letterSpacing="1.6" fontFamily="sans-serif">
          GSM · MINI ROUNDABOUTS
        </text>
        <text x={14} y={34} fontSize={12} fill="#fff" fontWeight={600} fontFamily="sans-serif">
          Treat the dome as a full roundabout · Give priority to your right · Signal only if you're turning
        </text>
      </g>

      {/* Speed / exit hints */}
      <g transform="translate(500 68)">
        <rect width={124} height={40} rx={6} fill="#000" opacity={0.6} />
        <text x={62} y={16} textAnchor="middle" fontSize={9} fontWeight={800} fill={GOOD} fontFamily="sans-serif">
          2ND EXIT · AHEAD
        </text>
        <text x={62} y={31} textAnchor="middle" fontSize={9} fill="#fff" fontFamily="sans-serif">
          Approach ~10 mph in 2nd
        </text>
      </g>
    </svg>
  );
}

export const miniRoundabouts: Lesson = {
  slug: "mini-roundabouts",
  title: "Mini roundabouts — priority, the dome & the blocker",
  category: "Roundabouts • GSM Method",
  rule: "Rule 188",
  objective:
    "Approach a mini roundabout in the right gear at the right speed, give priority to the right, keep the painted dome intact where possible, and signal only when your direction genuinely requires it.",
  think: [
    "Is anything already on the roundabout or coming from my right?",
    "Which numbered exit am I taking — and does that need a signal?",
    "Am I slow enough to stop, but ready enough to go?",
    "Is there a ‘blocker’ (large vehicle) that changes the priority picture?",
    "Have I checked my right mirror as I leave?",
  ],
  ruleHeadline: "Treat every mini-roundabout like a full-size one — dome-first, priority to the right.",
  ruleBullets: [
    "Approach in 2nd gear at around 10 mph — slow enough to stop, ready to move",
    "Give priority to traffic already on or approaching from your right",
    "Signal only if your exit needs one (right = right signal; ahead = no signal; left = left signal)",
    "Avoid driving over the painted dome unless the size of your vehicle requires it",
    "Right mirror check as you exit — cyclists and motorcyclists often follow the outside line",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Same rules, tiny footprint</p>
      <p>
        A mini roundabout is a full roundabout — priority still runs anti-clockwise and still belongs to
        traffic on your right. The only real difference is space: with such a small central island,
        drivers arrive at the give-way line almost simultaneously, so you have to read intentions
        <em> as well as</em> positions.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">The "blocker"</p>
      <p>
        When a large vehicle arrives at a mini-roundabout, it often has to swing wide or drive over the
        dome. Treat that vehicle as a temporary <strong>blocker</strong> — hold back, give it room, and
        let it clear the junction before you commit. Trying to squeeze past a lorry on a mini is one of
        the most common causes of a fail on this element.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Signals that make sense</p>
      <p>
        A signal only helps other drivers if it matches your direction. On a four-arm mini-roundabout:
        left arm = left signal, straight ahead = no signal, right arm = right signal until you're past
        the exit before yours, then left. On three-arm and skewed layouts, use the same principle: signal
        the direction the road is actually going.
      </p>
    </>
  ),
  georgeExplains:
    "The mini looks like nothing — that's why people rush it. Come in slowly, treat the dome like it's the size of a real roundabout, and let anything on your right go first. If a lorry is turning across you, wait. You'll never fail a test for being patient at a mini.",
  commonMistakes: [
    "Rolling straight over the dome without giving priority",
    "Signalling the wrong way (or not at all) when turning right",
    "Racing another car to the give-way line",
    "Ignoring a large vehicle that clearly needs the whole junction",
    "No right-mirror check as you exit",
  ],
  mistakes: [
    {
      wrong: "Assuming small = no rules",
      why: "Priority still runs anti-clockwise; the roundabout is real, only the dome is small.",
      right: "Approach ready to stop, give way to the right, then commit.",
    },
    {
      wrong: "Driving straight across the painted dome",
      why: "You should only cross the dome if the size of your vehicle genuinely requires it.",
      right: "Steer around the dome like it were a raised island.",
    },
  ],
  gsmTips: [
    "M-S-P-S-L on the approach — mirrors early, speed down early",
    "Second gear + covering the brake gives you both stop and go",
    "Match your signal to your exit — not to the road's shape",
    "If it's tight, arrive slow enough that a decision can be a look, not a lunge",
  ],
  keyTakeaway:
    "Mini roundabouts are full roundabouts in miniature: slow approach, priority to the right, honest signals, dome intact.",
  durationMs: 14000,
  captions: [
    { at: 0.05, label: "Approach", detail: "2nd gear, ~10 mph, cover the brake" },
    { at: 0.3, label: "Give way", detail: "Priority car on the right — hold" },
    { at: 0.6, label: "Commit", detail: "Junction clear — straight over" },
    { at: 0.9, label: "Right-mirror check on exit" },
  ],
  questions: [
    {
      at: 0.28,
      prompt: "A car is approaching the mini roundabout from your right. What do you do?",
      options: [
        {
          label: "Give way — let them go first",
          correct: true,
          explain:
            "Priority runs anti-clockwise. Traffic on your right, on or approaching the roundabout, goes first.",
        },
        {
          label: "Race to the line to get there first",
          explain: "Rushing a mini is a common serious fault — priority is not a competition.",
        },
        {
          label: "Ignore them because you're going straight",
          explain: "Direction of travel doesn't change priority — the right always has it.",
        },
      ],
    },
    {
      at: 0.78,
      prompt: "You're taking the exit ahead (2nd exit). Which signal do you give?",
      options: [
        {
          label: "No signal on approach; left signal only if it helps as you exit",
          correct: true,
          explain: "Ahead = no signal on approach. A brief left signal after the exit before yours is optional.",
        },
        { label: "Right signal all the way through", explain: "Right signal means you're turning right; misleading here." },
        { label: "Left signal from the moment you approach", explain: "Left signal indicates a left turn, not an ahead exit." },
      ],
    },
  ],
  render: MiniRoundaboutScene,
};