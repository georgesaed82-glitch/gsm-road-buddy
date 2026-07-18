import type { Lesson } from "@/components/driving-clips/LessonShell";

// ─────────────────────────────────────────────────────────────
// Crossroads — unmarked, marked, and box-marked. Ego turns RIGHT
// at a marked crossroads, meeting an oncoming car also turning
// right. Emphasises: MSPSL, priority (major/minor), and offside-to-
// offside turning where road markings allow.
// ─────────────────────────────────────────────────────────────

const PAINT = "#f5f5f0";
const ROAD = "#2b2b2e";
const GRASS = "#3d6a2f";
const ACCENT = "#C97845";
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

function CrossroadsScene(t: number) {
  // Major road runs east–west; the two minor roads are the north
  // and south arms. Ego (from south) turns RIGHT into the east arm.
  // Oncoming (from north) also turns right into the west arm — so
  // both cross paths at the box. We show OFFSIDE-TO-OFFSIDE turning:
  // each car passes to the RIGHT of the other, then completes the turn.
  const CX = 320;
  const CY = 180;

  // Oncoming (northbound → westbound) — right turn
  let ncx: number, ncy: number, na: number, nInd: "left" | "right" | null = "right";
  if (t < 0.35) {
    const k = t / 0.35;
    ncx = CX + 10;
    ncy = 20 + easeInOut(k) * 130; // 20 → 150 (approach box)
    na = 90;
  } else if (t < 0.55) {
    // hold offside-to-offside opposite ego
    ncx = CX + 10;
    ncy = 150;
    na = 90;
  } else if (t < 0.85) {
    const k = (t - 0.55) / 0.3;
    // arc turn to west
    const ang = 90 + easeInOut(k) * 90; // 90 → 180
    const rad = ((ang - 90) * Math.PI) / 180;
    ncx = CX + 10 - 30 * Math.sin(rad);
    ncy = 150 + 30 * (1 - Math.cos(rad));
    na = ang;
  } else {
    const k = (t - 0.85) / 0.15;
    ncx = CX - 20 - easeInOut(k) * 260;
    ncy = 180;
    na = 180;
    nInd = null;
  }

  // Ego (southbound-to-north travel → eastbound) — right turn
  let ecx: number, ecy: number, ea: number, ebrake = false, eInd: "right" | null = "right";
  if (t < 0.32) {
    const k = t / 0.32;
    ecx = CX - 10;
    ecy = 340 - easeInOut(k) * 130; // 340 → 210 (approach, right-turn position)
    ea = -90;
    ebrake = k > 0.6;
  } else if (t < 0.55) {
    // hold — waiting for oncoming decision / gap
    ecx = CX - 10;
    ecy = 210;
    ea = -90;
    ebrake = true;
  } else if (t < 0.88) {
    const k = (t - 0.55) / 0.33;
    const ang = -90 + easeInOut(k) * 90; // -90 → 0
    const rad = ((ang + 90) * Math.PI) / 180;
    ecx = CX - 10 + 30 * Math.sin(rad);
    ecy = 210 - 30 * (1 - Math.cos(rad));
    ea = ang;
  } else {
    const k = (t - 0.88) / 0.12;
    ecx = CX + 20 + easeInOut(k) * 260;
    ecy = 180;
    ea = 0;
    eInd = null;
  }

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <defs>
        <linearGradient id="sky-cross" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
      </defs>
      <rect width={640} height={360} fill="url(#sky-cross)" />
      <rect width={640} height={360} fill={GRASS} opacity={0.35} />

      {/* Major road (east–west) */}
      <rect x={0} y={CY - 34} width={640} height={68} fill={ROAD} />
      <line x1={0} y1={CY - 34} x2={640} y2={CY - 34} stroke={PAINT} strokeWidth={1.4} />
      <line x1={0} y1={CY + 34} x2={640} y2={CY + 34} stroke={PAINT} strokeWidth={1.4} />
      {/* Centre broken line, interrupted at the junction */}
      {Array.from({ length: 16 }).map((_, i) => {
        const x = i * 40 + 10;
        if (x + 20 > CX - 34 && x < CX + 34) return null;
        return <rect key={i} x={x} y={CY - 1.5} width={20} height={3} fill={PAINT} opacity={0.85} />;
      })}

      {/* Minor road (north–south) */}
      <rect x={CX - 34} y={0} width={68} height={360} fill={ROAD} />
      <line x1={CX - 34} y1={0} x2={CX - 34} y2={CY - 34} stroke={PAINT} strokeWidth={1.4} />
      <line x1={CX + 34} y1={0} x2={CX + 34} y2={CY - 34} stroke={PAINT} strokeWidth={1.4} />
      <line x1={CX - 34} y1={CY + 34} x2={CX - 34} y2={360} stroke={PAINT} strokeWidth={1.4} />
      <line x1={CX + 34} y1={CY + 34} x2={CX + 34} y2={360} stroke={PAINT} strokeWidth={1.4} />

      {/* Give-way dashed lines on north & south arms (minor road) */}
      {[CY - 40, CY + 40].map((y, idx) => (
        <g key={idx}>
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={CX - 32 + i * 8.4} y={y - 2} width={5} height={4} fill={PAINT} />
          ))}
        </g>
      ))}

      {/* Ego's planned path (offside-to-offside right turn) */}
      <path
        d={`M ${CX - 10} 340 L ${CX - 10} 210 Q ${CX + 20} 180 ${CX + 20} 180 L 620 180`}
        stroke={ACCENT}
        strokeWidth={2}
        strokeDasharray="5 4"
        fill="none"
        opacity={0.75}
      />

      {/* Turning marker + label */}
      {t < 0.55 && (
        <g transform={`translate(${CX + 60} ${CY - 100})`}>
          <rect width={190} height={44} rx={6} fill="#000" opacity={0.72} />
          <text x={12} y={16} fontSize={9} fill={ACCENT} fontWeight={800} letterSpacing="1.4" fontFamily="sans-serif">
            OFFSIDE-TO-OFFSIDE
          </text>
          <text x={12} y={34} fontSize={10} fill="#fff" fontWeight={600} fontFamily="sans-serif">
            Pass right-of-right, then turn
          </text>
        </g>
      )}

      {/* Cars */}
      <Car cx={ncx} cy={ncy} angle={na} color="#e05a3a" indicator={nInd} />
      <Car cx={ecx} cy={ecy} angle={ea} color="#234B36" braking={ebrake} indicator={eInd} />

      {/* Banner */}
      <g transform="translate(20 14)">
        <rect width={604} height={44} rx={6} fill="#000" opacity={0.62} />
        <text x={14} y={16} fontSize={9} fill={ACCENT} fontWeight={800} letterSpacing="1.6" fontFamily="sans-serif">
          GSM · CROSSROADS — TURNING RIGHT WITH ONCOMING
        </text>
        <text x={14} y={34} fontSize={12} fill="#fff" fontWeight={600} fontFamily="sans-serif">
          MSPSL · position for right · give priority to oncoming going ahead · offside-to-offside when marked
        </text>
      </g>

      {/* Priority note */}
      {t < 0.55 && (
        <g transform="translate(20 74)">
          <rect width={200} height={40} rx={6} fill="#000" opacity={0.6} />
          <text x={12} y={16} fontSize={9} fontWeight={800} fill={WARN} fontFamily="sans-serif">
            PRIORITY
          </text>
          <text x={12} y={31} fontSize={9} fill="#fff" fontFamily="sans-serif">
            Oncoming going ahead beats a right turn
          </text>
        </g>
      )}
      {t >= 0.85 && (
        <g transform="translate(20 74)">
          <rect width={180} height={30} rx={6} fill="#000" opacity={0.6} />
          <text x={12} y={20} fontSize={10} fontWeight={800} fill={GOOD} fontFamily="sans-serif">
            TURN COMPLETE ✓
          </text>
        </g>
      )}
    </svg>
  );
}

export const crossroads: Lesson = {
  slug: "crossroads",
  title: "Crossroads — priority, position & offside-to-offside",
  category: "Junctions • GSM Method",
  rule: "Rules 170–181",
  objective:
    "Approach every crossroads using MSPSL, read who has priority, position correctly for your exit, and — where markings allow — turn right offside-to-offside so both drivers see each other clearly.",
  think: [
    "Is this a marked (major/minor) or an unmarked crossroads?",
    "Which arm has priority — and where does that leave me?",
    "If I'm turning right, is there oncoming traffic going ahead?",
    "Am I positioned correctly — left for straight/left, right for a right turn?",
    "Can I complete my turn in one movement without blocking anyone?",
  ],
  ruleHeadline:
    "Priority is set by the road markings first, common sense second — never by who arrived first.",
  ruleBullets: [
    "Major road (unbroken/broken white line) has priority over the minor road (give-way dashes)",
    "At an unmarked crossroads, no-one has automatic priority — proceed only when safe",
    "Turning right, give way to oncoming traffic going ahead or turning left",
    "Offside-to-offside is the default where road markings guide it — both drivers see each other clearly",
    "Nearside-to-nearside only where markings, layout, or a police officer requires it",
    "Never sit in the junction if you can't complete the turn safely",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Marked vs unmarked</p>
      <p>
        A <strong>marked crossroads</strong> tells you who has priority through paint alone: the road
        with unbroken/broken white lines is the major road; the road with give-way dashes is the minor.
        You give way emerging from the minor arm. An <strong>unmarked crossroads</strong> has no give-way
        lines on any arm — no driver has automatic right of way. Approach at a speed that lets you stop
        and negotiate visually.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Right-turn priority</p>
      <p>
        Turning right is the manoeuvre most learners get wrong at crossroads. The rule is: <em>oncoming
        traffic going straight ahead or turning left has priority over your right turn</em>. Wait until
        the gap is genuine, not "just about". A rushed right turn is the classic cause of the "failure
        to make progress" trap turning into a serious fault when a car appears from nowhere.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Offside-to-offside</p>
      <p>
        When both cars are turning right, offside-to-offside means you pass with your driver's side to
        their driver's side — you meet, drive past each other, then complete the turn behind them. This
        keeps sight-lines open in both directions. Nearside-to-nearside (turning in front of each other)
        is only used where the junction is skewed, a police officer directs it, or a road marking
        clearly guides it that way — because you lose sight of pedestrians and oncoming traffic during
        the turn.
      </p>
    </>
  ),
  georgeExplains:
    "At a crossroads the paint tells the story. Read the lines before you read the cars. If you're on the give-way arm, act like you're not there — you're the guest. Turning right? Wait for a real gap, not a hopeful one. And when you're both turning right, drive past each other first — you'll see the world properly all the way through.",
  commonMistakes: [
    "Assuming priority because you arrived first at an unmarked junction",
    "Turning right into a small gap and forcing oncoming to brake",
    "Cutting the corner and ending up on the wrong side of the road",
    "Blocking the junction while waiting for a gap",
    "Turning nearside-to-nearside without checking behind for hidden traffic",
  ],
  mistakes: [
    {
      wrong: "Rolling out from the minor arm because ‘they'll see me’",
      why: "The give-way lines mean the burden is on you — priority is theirs until you have a safe gap.",
      right: "Plan to stop, look properly right-left-right, then go on a genuine gap.",
    },
    {
      wrong: "Cutting the corner on a right turn",
      why: "You end up on the wrong side of the road and hidden from anyone turning out.",
      right: "Drive to the box, past the centre-line, then steer — offside-to-offside where marked.",
    },
  ],
  gsmTips: [
    "MSPSL from well before the junction — never leave signals late",
    "Position early: left of the centre for straight/left, close to the centre-line for right",
    "Wait in the box with wheels straight — a shunt won't push you into oncoming",
    "If you can't complete the turn safely, hold the junction — don't half-commit",
    "Right-mirror check as you complete the turn — cyclists and motorbikes come up the inside",
  ],
  keyTakeaway:
    "Crossroads reward patience and paint-reading: honour the markings, position early, and turn right offside-to-offside on a genuine gap.",
  durationMs: 15000,
  captions: [
    { at: 0.05, label: "Approach", detail: "MSPSL · position for right turn" },
    { at: 0.35, label: "Wait for gap", detail: "Oncoming going ahead has priority" },
    { at: 0.6, label: "Offside-to-offside", detail: "Both cars turn behind each other" },
    { at: 0.9, label: "Clear", detail: "Right-mirror check on exit" },
  ],
  questions: [
    {
      at: 0.34,
      prompt:
        "You are turning right at a crossroads. An oncoming car is going straight ahead. What is the correct action?",
      options: [
        {
          label: "Wait — oncoming going ahead has priority",
          correct: true,
          explain:
            "The oncoming car has priority. Hold your position with wheels straight until they clear or a genuine gap appears.",
        },
        {
          label: "Cut across quickly before they arrive",
          explain:
            "Forcing oncoming to brake is a serious fault and dangerous. Wait for a real gap.",
        },
        {
          label: "Flash your headlights and turn",
          explain: "Flashing does not give priority — it just tells the other driver you are there.",
        },
      ],
    },
    {
      at: 0.7,
      prompt: "Both you and an oncoming car are turning right. Which method is normally correct?",
      options: [
        {
          label: "Offside-to-offside — pass driver-side to driver-side, then turn behind",
          correct: true,
          explain:
            "Offside-to-offside keeps sight lines open for both drivers and is the default where markings guide it.",
        },
        {
          label: "Nearside-to-nearside — turn in front of each other",
          explain:
            "Only used where the junction is skewed, a police officer directs it, or road markings guide it that way.",
        },
        {
          label: "Whoever arrives first turns first",
          explain: "Priority isn't decided by arrival order — it's decided by markings and layout.",
        },
      ],
    },
  ],
  render: CrossroadsScene,
};