import type { Lesson } from "@/components/driving-clips/LessonShell";

// ─────────────────────────────────────────────────────────────
// Unorthodox Roundabouts — Paint follows paint. Stay in your lane pocket.
// UK traffic drives clockwise around a roundabout.
// Scene: 2-lane approach with painted arrows telling us the MIDDLE lane
// leads to the SECOND exit (an unorthodox layout). Ego follows the paint.
// ─────────────────────────────────────────────────────────────

const PAINT = "#f5f5f0";
const ROAD = "#2b2b2e";
const ACCENT = "#C97845";
const GOOD = "#22c55e";
const HAZARD = "#ef4444";

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function Car({
  cx,
  cy,
  angle = 0,
  color = "#2f6bf0",
  indicator,
  brake,
}: {
  cx: number;
  cy: number;
  angle?: number;
  color?: string;
  indicator?: "left" | "right";
  brake?: boolean;
}) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
      <rect x={-14} y={-7} width={28} height={14} rx={3} fill={color} stroke="#0a0a0a" strokeWidth={0.8} />
      <rect x={-8} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.7} />
      <rect x={3} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.55} />
      <rect x={14} y={-5} width={1.4} height={2} fill="#fff8c0" />
      <rect x={14} y={3} width={1.4} height={2} fill="#fff8c0" />
      {brake && (
        <>
          <rect x={-15.5} y={-5} width={1.4} height={2} fill="#ff2b2b" />
          <rect x={-15.5} y={3} width={1.4} height={2} fill="#ff2b2b" />
        </>
      )}
      {indicator === "left" && (
        <circle cx={-14} cy={5} r={1.4} fill="#ffb020">
          <animate attributeName="opacity" values="1;0.15;1" dur="0.5s" repeatCount="indefinite" />
        </circle>
      )}
      {indicator === "right" && (
        <circle cx={-14} cy={-5} r={1.4} fill="#ffb020">
          <animate attributeName="opacity" values="1;0.15;1" dur="0.5s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

// Ego path on unorthodox roundabout using MIDDLE lane to exit second.
// Path in canvas coords (roundabout centre at 320,180, radius ~90).
function egoPos(t: number) {
  const cx = 320;
  const cy = 180;
  const R = 78; // middle-lane radius on roundabout
  if (t < 0.2) {
    // approach on middle lane from bottom
    const k = t / 0.2;
    return { x: 320, y: 340 - easeInOut(k) * 80, a: -90 };
  }
  if (t < 0.35) {
    // roll onto roundabout
    const k = (t - 0.2) / 0.15;
    const ang = 90 - easeInOut(k) * 20; // start at south
    const rad = (ang * Math.PI) / 180;
    return { x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad), a: 180 - ang - 90 };
  }
  if (t < 0.78) {
    // travel clockwise around from ~70° (south-east) to ~-90° (north = 2nd exit at top)
    const k = (t - 0.35) / 0.43;
    const ang = 70 - easeInOut(k) * 160; // 70 → -90
    const rad = (ang * Math.PI) / 180;
    return { x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad), a: 180 - ang - 90 };
  }
  // exit north
  const k = Math.min(1, (t - 0.78) / 0.22);
  return { x: 320, y: 102 - easeInOut(k) * 100, a: -90 };
}

function UnorthodoxScene(t: number) {
  const { x: ex, y: ey, a: ea } = egoPos(t);

  // Highlight phases
  const showArrows = t < 0.35;
  const showLanePocket = t > 0.15 && t < 0.7;
  const showLeftSignal = t > 0.6 && t < 0.9;
  const showLeftMirror = t > 0.62 && t < 0.78;

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <defs>
        <radialGradient id="sky-rb" cx="0.5" cy="0.4" r="0.9">
          <stop offset="0" stopColor="#22242a" />
          <stop offset="1" stopColor="#0f1013" />
        </radialGradient>
      </defs>
      <rect width={640} height={360} fill="url(#sky-rb)" />

      {/* Roundabout ring */}
      <circle cx={320} cy={180} r={110} fill={ROAD} />
      <circle cx={320} cy={180} r={40} fill="#4a3d2a" stroke={PAINT} strokeWidth={2} />
      <circle cx={320} cy={180} r={110} fill="none" stroke={PAINT} strokeWidth={2} />
      {/* lane divider on ring */}
      <circle cx={320} cy={180} r={78} fill="none" stroke={PAINT} strokeWidth={1} strokeDasharray="6 6" />

      {/* Four spokes — south (approach), east (1st exit), north (2nd exit), west (3rd exit) */}
      {/* South approach: two-lane */}
      <rect x={280} y={290} width={80} height={70} fill={ROAD} />
      <line x1={320} y1={290} x2={320} y2={360} stroke={PAINT} strokeWidth={1} strokeDasharray="6 6" />
      {/* East exit */}
      <rect x={430} y={155} width={210} height={50} fill={ROAD} />
      <line x1={430} y1={180} x2={640} y2={180} stroke={PAINT} strokeWidth={1} strokeDasharray="6 6" />
      {/* North (2nd) exit */}
      <rect x={280} y={0} width={80} height={70} fill={ROAD} />
      <line x1={320} y1={0} x2={320} y2={70} stroke={PAINT} strokeWidth={1} strokeDasharray="6 6" />
      {/* West exit */}
      <rect x={0} y={155} width={210} height={50} fill={ROAD} />
      <line x1={0} y1={180} x2={210} y2={180} stroke={PAINT} strokeWidth={1} strokeDasharray="6 6" />

      {/* Painted lane arrows on APPROACH (south) — showing UNORTHODOX layout */}
      {showArrows && (
        <g opacity={0.95}>
          {/* left approach lane → 1st exit only */}
          <g transform="translate(300 320)">
            <path d="M 0 15 L 0 -5 L -6 -5 L 4 -18 L 14 -5 L 8 -5 L 8 15 Z" fill={ACCENT} transform="rotate(90 4 0)" />
          </g>
          {/* middle approach lane → 2nd exit (ahead) — UNORTHODOX arrow */}
          <g transform="translate(335 320)">
            <path d="M -4 15 L -4 -8 L -10 -8 L 0 -20 L 10 -8 L 4 -8 L 4 15 Z" fill={ACCENT} />
          </g>
          <g transform="translate(305 340)" fill={PAINT} fontFamily="sans-serif" fontSize={8} fontWeight={700}>
            <text>1st</text>
          </g>
          <g transform="translate(325 340)" fill={PAINT} fontFamily="sans-serif" fontSize={8} fontWeight={700}>
            <text>2nd ↑</text>
          </g>
        </g>
      )}

      {/* Exit labels */}
      <g fontFamily="sans-serif" fontSize={9} fill="#e6e6e0" fontWeight={600}>
        <text x={470} y={148} fill={PAINT}>1st exit</text>
        <text x={286} y={92} fill={ACCENT}>2nd exit ← ours</text>
        <text x={16} y={148} fill={PAINT}>3rd exit</text>
      </g>

      {/* Ego car */}
      <Car cx={ex} cy={ey} angle={ea} indicator={showLeftSignal ? "left" : undefined} />

      {/* Lane pocket ghost — dashed circle around ego showing "stay in your lane" */}
      {showLanePocket && (
        <circle cx={ex} cy={ey} r={18} fill="none" stroke={GOOD} strokeWidth={1} strokeDasharray="3 3" opacity={0.85} />
      )}

      {/* Left mirror check indicator */}
      {showLeftMirror && (
        <g transform={`translate(${ex} ${ey})`}>
          <circle r={26} fill="none" stroke={ACCENT} strokeWidth={1.4}>
            <animate attributeName="r" values="20;28;20" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
          </circle>
          <text x={0} y={-32} textAnchor="middle" fontSize={9} fill={ACCENT} fontFamily="sans-serif" fontWeight={700}>
            LEFT MIRROR
          </text>
        </g>
      )}

      {/* HUD */}
      <g transform="translate(16 16)">
        <rect width={360} height={44} rx={6} fill="#000" opacity={0.62} />
        <text x={10} y={16} fontSize={9} fill={ACCENT} fontWeight={800} letterSpacing="1.5" fontFamily="sans-serif">
          UNORTHODOX ROUNDABOUT
        </text>
        <text x={10} y={34} fontSize={11} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
          {t < 0.2 && "Read the paint — middle lane feeds our 2nd exit"}
          {t >= 0.2 && t < 0.6 && "Stay in your lane pocket — follow the paint"}
          {t >= 0.6 && t < 0.85 && "Left mirror → signal left → follow lane out"}
          {t >= 0.85 && "Cleared — smooth exit, straight ahead"}
        </text>
      </g>

      <g transform="translate(470 16)">
        <rect width={154} height={44} rx={6} fill="#000" opacity={0.55} />
        <text x={12} y={16} fontSize={9} fill="#9ca3af" letterSpacing="1.5" fontFamily="sans-serif">
          RULE
        </text>
        <text x={12} y={34} fontSize={11} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
          Paint follows paint
        </text>
      </g>

      {t > 0.95 && (
        <g transform="translate(310 90)">
          <circle r={14} fill="none" stroke={GOOD} strokeWidth={1.5} />
          <text textAnchor="middle" y={4} fontSize={14} fontWeight={800} fill={GOOD} fontFamily="sans-serif">✓</text>
        </g>
      )}
    </svg>
  );
}

export const unorthodoxRoundabouts: Lesson = {
  slug: "unorthodox-roundabouts",
  title: "Unorthodox roundabouts — paint follows paint",
  category: "Driving Strategies • GSM Method",
  rule: "Rules 184–187",
  objective:
    "Recognise when a roundabout does NOT follow the standard 'left lane for left/ahead' rule, read the painted arrows and lane markings, choose the correct lane BEFORE the roundabout, and stay in your lane pocket all the way to your exit.",
  think: [
    "What do the painted arrows on the approach tell me?",
    "Which lane feeds MY exit — is it the normal one, or is this layout different?",
    "Am I in the centre of my lane, with equal space either side?",
    "Have I checked my left mirror BEFORE signalling left to exit?",
    "Am I chasing empty road — or following the paint?",
  ],
  ruleHeadline: "Road markings override general rules. Paint follows paint. Lane follows lane.",
  ruleBullets: [
    "Read the road markings EARLY — before the give-way line",
    "Choose the correct lane BEFORE you enter the roundabout",
    "Some second exits use the MIDDLE lane if the paint says so",
    "Never chase empty road — stay in your lane pocket",
    "Sequence: choose lane → pass 1st exit → left mirror → signal left → follow lane → exit",
    "Don't drift or straddle lanes on the roundabout itself",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why unorthodox layouts exist</p>
      <p>
        Councils re-paint roundabouts to smooth heavy traffic flow — often for busy shopping areas,
        A-roads or motorway junctions. The result is that the <em>general</em> rule ("left lane =
        left/ahead, right lane = right") stops applying. What DOES apply is the paint on the ground.
        Road markings override general rules — every time.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">The lane pocket</p>
      <p>
        Imagine your lane is a tunnel. Stay in the centre, with equal space on both sides. Don't
        cut across, don't drift, don't straddle. Your car should exit each lane exactly where the
        paint next tells it to — not a metre earlier and not a metre later.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Sequence to exit</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Choose the correct lane on the approach (read the paint).</li>
        <li>Enter and hold your lane pocket all the way round.</li>
        <li>As you pass the exit BEFORE yours, left mirror.</li>
        <li>Signal left.</li>
        <li>Follow the paint out — check your left mirror again as you steer.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "Most roundabouts you can drive on autopilot — left for left, right for right. Unorthodox ones? You cannot. You have to read the paint. If the middle lane has an ahead-arrow and it goes to the second exit, that IS the correct lane — even though your instinct says use the left. Follow the paint. Stay in your lane pocket. And when you pass the exit BEFORE yours, that's the trigger — left mirror, signal left, and follow the lane straight out. Don't chase empty road.",
  commonMistakes: [
    "Applying 'general' roundabout rules instead of reading the paint",
    "Changing lanes on the roundabout itself",
    "Straddling two lanes because you weren't sure",
    "Missing the left-mirror check before signalling left to exit",
    "Signalling left too early — before the previous exit",
    "Chasing an empty lane instead of following your painted lane",
  ],
  gsmTips: [
    "Paint follows paint — road markings override general rules",
    "Lane pocket: centre of your lane, equal space either side",
    "Trigger word for exiting: 'pass the exit BEFORE mine → left mirror'",
    "One lane in, one lane out — never sideways on the ring",
    "If unsure, don't guess — read the arrow on the approach",
  ],
  keyTakeaway:
    "On an unorthodox roundabout, the painted arrows override every general rule. Choose the right lane before you enter, stay in your lane pocket, and use the exit BEFORE yours as the cue for mirror-signal-out.",
  durationMs: 18000,
  captions: [
    { at: 0.05, label: "Read the paint", detail: "Middle lane feeds our 2nd exit — the arrow says so." },
    { at: 0.3, label: "Lane pocket", detail: "Stay in the centre of your lane — no drifting." },
    { at: 0.6, label: "Pass 1st exit → left mirror", detail: "That's the trigger to prepare to exit." },
    { at: 0.72, label: "Signal left", detail: "Then follow the paint straight out." },
    { at: 0.92, label: "Clean exit", detail: "Lane pocket held all the way through." },
  ],
  questions: [
    {
      at: 0.18,
      prompt: "The painted arrow in the MIDDLE lane on the approach points straight ahead to the 2nd exit. What do you do?",
      options: [
        {
          label: "Use the LEFT lane — that's the standard rule for the 2nd exit.",
          explain: "No. Road markings override the general rule. If the paint sends the middle lane to the 2nd exit, that IS the correct lane.",
        },
        {
          label: "Take the middle lane — paint follows paint.",
          correct: true,
          explain: "Correct. Painted arrows override general rules. Read the paint on the approach and commit to that lane.",
        },
        {
          label: "Take whichever lane has less traffic.",
          explain: "No — never chase empty road. Choose the lane the paint tells you to, even if it's busier.",
        },
      ],
    },
    {
      at: 0.62,
      prompt: "You've just passed the exit before yours on the roundabout. What is your next action?",
      options: [
        {
          label: "Signal left immediately, no mirror check needed.",
          explain: "No. A cyclist or motorcyclist could be alongside your left. Always mirror before you signal.",
        },
        {
          label: "Left mirror → signal left → follow your lane out.",
          correct: true,
          explain: "Correct. Passing the previous exit is your cue: mirror, signal, then let the paint guide you off.",
        },
        {
          label: "Change lanes now to line up with the exit.",
          explain: "No — you should already be in the correct lane. Changing lanes on a roundabout is a serious fault.",
        },
      ],
    },
  ],
  render: UnorthodoxScene,
};