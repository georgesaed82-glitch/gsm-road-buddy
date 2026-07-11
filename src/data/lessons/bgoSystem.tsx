import type { Lesson } from "@/components/driving-clips/LessonShell";

// ─────────────────────────────────────────────────────────────
// BGO — Blockers · Gap · Opportunity
// Scene: busy road with parked bus and moving cars. Ego judges
//   B (a stopped bus blocking the near lane),
//   G (walk-across test — a real gap in oncoming traffic),
//   O (opportunity to move — no conflict).
// ─────────────────────────────────────────────────────────────

const PAINT = "#f5f5f0";
const ROAD = "#2b2b2e";
const GRASS = "#3d6a2f";
const ACCENT = "#C97845";
const GOOD = "#22c55e";
const HAZARD = "#ef4444";

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function Car({ cx, cy, angle = 0, color = "#2f6bf0", brake }: any) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
      <rect x={-16} y={-8} width={32} height={16} rx={3} fill={color} stroke="#0a0a0a" strokeWidth={0.9} />
      <rect x={-9} y={-7} width={5} height={14} rx={1} fill="#111" opacity={0.7} />
      <rect x={4} y={-7} width={5} height={14} rx={1} fill="#111" opacity={0.55} />
      {brake && (
        <>
          <rect x={-17} y={-6} width={1.4} height={2} fill="#ff2b2b" />
          <rect x={-17} y={4} width={1.4} height={2} fill="#ff2b2b" />
        </>
      )}
    </g>
  );
}

function Bus({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <rect x={-30} y={-11} width={60} height={22} rx={3} fill="#c8102e" stroke="#0a0a0a" strokeWidth={0.9} />
      <rect x={-26} y={-9} width={6} height={18} rx={1} fill="#111" opacity={0.65} />
      <rect x={-18} y={-9} width={6} height={18} rx={1} fill="#111" opacity={0.55} />
      <rect x={-10} y={-9} width={6} height={18} rx={1} fill="#111" opacity={0.55} />
      <rect x={-2} y={-9} width={6} height={18} rx={1} fill="#111" opacity={0.55} />
      {/* Hazard lights blinking */}
      <circle cx={-28} cy={-11} r={1.8} fill="#ffb020">
        <animate attributeName="opacity" values="1;0.15;1" dur="0.6s" repeatCount="indefinite" />
      </circle>
      <circle cx={28} cy={-11} r={1.8} fill="#ffb020">
        <animate attributeName="opacity" values="1;0.15;1" dur="0.6s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

function BgoScene(t: number) {
  // Layout: single carriageway, ego in lower lane heading right.
  // Bus stopped in front of ego (blocker). Oncoming cars top lane.
  // Phase A (0-0.30): approach & spot blocker
  // Phase B (0.30-0.55): identify gap (a truck passes then a gap)
  // Phase C (0.55-0.85): opportunity — commit past bus
  // Phase D (0.85-1): back to left

  const busX = 380;
  const busY = 218;

  // Ego motion
  let egoX: number, egoY: number;
  if (t < 0.3) {
    egoX = 40 + easeInOut(t / 0.3) * 240;
    egoY = 218;
  } else if (t < 0.55) {
    // slow up behind bus while waiting for gap
    const k = (t - 0.3) / 0.25;
    egoX = 280 + easeInOut(k) * 40;
    egoY = 218;
  } else if (t < 0.85) {
    // pull out around bus (into oncoming lane momentarily)
    const k = (t - 0.55) / 0.3;
    egoX = 320 + easeInOut(k) * 160;
    egoY = 218 - easeInOut(k) * 34;
  } else {
    // back to left
    const k = (t - 0.85) / 0.15;
    egoX = 480 + easeInOut(k) * 120;
    egoY = 184 + easeInOut(k) * 34;
  }

  // Oncoming vehicles (top lane, moving right→left)
  // A truck passes early (blocking gap), then a real gap opens
  const truckX = 700 - t * 800;
  const oncomingCarX = 900 - t * 720;

  const gapVisible = t > 0.35 && t < 0.75; // window when we can "walk across"

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <defs>
        <linearGradient id="sky-bgo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
      </defs>
      <rect width={640} height={360} fill="url(#sky-bgo)" />
      <rect x={0} y={130} width={640} height={30} fill={GRASS} />
      <rect x={0} y={240} width={640} height={40} fill={GRASS} />
      <rect x={0} y={160} width={640} height={80} fill={ROAD} />
      <line x1={0} y1={162} x2={640} y2={162} stroke={PAINT} strokeWidth={1.5} />
      <line x1={0} y1={238} x2={640} y2={238} stroke={PAINT} strokeWidth={1.5} />
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={i * 40 + ((t * 40) % 40) - 40} y={198} width={20} height={4} fill={PAINT} />
      ))}

      {/* B — Blocker (bus with hazards) */}
      <Bus cx={busX} cy={busY} />
      {t < 0.35 && (
        <g transform={`translate(${busX} ${busY - 32})`}>
          <rect x={-32} y={-14} width={64} height={20} rx={4} fill={HAZARD} opacity={0.9} />
          <text textAnchor="middle" y={0} fontSize={10} fontWeight={800} fill="#fff" fontFamily="sans-serif">
            B · BLOCKER
          </text>
        </g>
      )}

      {/* Oncoming — truck (blocks gap early) */}
      {truckX > -60 && truckX < 700 && (
        <g transform={`translate(${truckX} 182) rotate(180)`}>
          <rect x={-24} y={-10} width={48} height={20} rx={3} fill="#666" stroke="#0a0a0a" strokeWidth={0.9} />
          <rect x={12} y={-8} width={6} height={16} rx={1} fill="#111" opacity={0.7} />
        </g>
      )}
      {/* Oncoming car — creates gap after truck */}
      {oncomingCarX > -40 && oncomingCarX < 700 && (
        <g transform={`translate(${oncomingCarX} 182) rotate(180)`}>
          <Car cx={0} cy={0} color="#e6b024" />
        </g>
      )}

      {/* G — Gap: "walk across" test */}
      {gapVisible && (
        <g>
          <rect x={335} y={172} width={90} height={20} fill={GOOD} opacity={0.18} />
          <line x1={340} y1={182} x2={420} y2={182} stroke={GOOD} strokeWidth={1.5} strokeDasharray="4 4" />
          <text x={380} y={168} textAnchor="middle" fontSize={10} fill={GOOD} fontWeight={800} fontFamily="sans-serif">
            G · GAP — could I walk across?
          </text>
        </g>
      )}

      {/* O — Opportunity flag */}
      {t > 0.55 && t < 0.9 && (
        <g transform="translate(500 118)">
          <rect x={-40} y={-14} width={80} height={20} rx={4} fill={GOOD} opacity={0.9} />
          <text textAnchor="middle" y={0} fontSize={10} fontWeight={800} fill="#0a0a0a" fontFamily="sans-serif">
            O · OPPORTUNITY
          </text>
        </g>
      )}

      {/* Ego car — steering angle follows path */}
      <Car cx={egoX} cy={egoY} color="#2f6bf0" brake={t > 0.28 && t < 0.55} />

      {/* HUD */}
      <g transform="translate(16 16)">
        <rect width={360} height={44} rx={6} fill="#000" opacity={0.62} />
        <text x={10} y={16} fontSize={9} fill={ACCENT} fontWeight={800} letterSpacing="1.5" fontFamily="sans-serif">
          BGO SYSTEM
        </text>
        <text x={10} y={34} fontSize={11} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
          {t < 0.3 && "B — Blocker spotted: stationary bus, hazards on"}
          {t >= 0.3 && t < 0.55 && "G — Wait for the gap. Truck first, then the real gap opens"}
          {t >= 0.55 && t < 0.85 && "O — Opportunity: no conflict → commit smoothly"}
          {t >= 0.85 && "Back to the left — smoothly, in your lane"}
        </text>
      </g>

      <g transform="translate(470 16)">
        <rect width={154} height={44} rx={6} fill="#000" opacity={0.55} />
        <text x={12} y={16} fontSize={9} fill="#9ca3af" letterSpacing="1.5" fontFamily="sans-serif">
          TEST
        </text>
        <text x={12} y={34} fontSize={11} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
          Walk across? Drive across.
        </text>
      </g>

      {t > 0.95 && (
        <g transform={`translate(${egoX} ${egoY - 24})`}>
          <circle r={12} fill="none" stroke={GOOD} strokeWidth={1.5} />
          <text textAnchor="middle" y={4} fontSize={12} fontWeight={800} fill={GOOD} fontFamily="sans-serif">✓</text>
        </g>
      )}
    </svg>
  );
}

export const bgoSystem: Lesson = {
  slug: "bgo-system",
  title: "BGO — Blockers · Gap · Opportunity",
  category: "Driving Strategies • GSM Method",
  rule: "Rules 160, 163, 167",
  objective:
    "Make consistent, calm decisions at every hazard using GSM's three-step BGO test: identify the Blocker, find a real Gap, and commit only when there is a true Opportunity — no conflict.",
  think: [
    "What is BLOCKING me — a bus, a parked car, a queue, a junction?",
    "Is there a real GAP — could I safely walk across it right now?",
    "Is this a true OPPORTUNITY — or am I hoping?",
    "What direction are their tyres pointed? What are indicators telling me?",
    "If I couldn't walk across, I can't drive across.",
  ],
  ruleHeadline: "Blockers → Gap → Opportunity. If you could walk across, you can drive across.",
  ruleBullets: [
    "B — Blockers: anything stopping or slowing you or others (bus, parked car, queue)",
    "G — Gap: judge SPEED, DISTANCE, TYRE DIRECTION, INDICATORS",
    "O — Opportunity: no conflict → commit smoothly and completely",
    "Walk-across test: if you couldn't safely walk it, you can't safely drive it",
    "Never guess — read the picture, then act",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why BGO works</p>
      <p>
        Every real driving decision is the same shape: something is in your way, you need a gap,
        and you need an opportunity. Naming the three steps out loud slows your brain down just
        enough to notice what you would otherwise miss — the cyclist, the tyre angle, the driver
        who is looking at their phone.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">The walk-across test</p>
      <p>
        The simplest way to judge a gap is to ask: <em>could I safely walk across that gap right
        now?</em> If the answer is no, don't drive across it either. If the answer is yes, the
        gap is real — you have an opportunity.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Judge four things</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Speed of the other vehicle</li>
        <li>Distance to you</li>
        <li>Tyre direction — where is the car actually pointing?</li>
        <li>Indicators — but only trust them when the tyres agree</li>
      </ul>
    </>
  ),
  georgeExplains:
    "Every hazard is the same puzzle. Blockers, Gap, Opportunity. First — what's blocking me? A stopped bus, a queue, a car turning right. Fine. Second — is there a gap? Not just 'is there space' — I mean, could I walk across right now without getting hit? Third — is this a real opportunity, or am I hoping? When BGO gives me three green lights, I go — and I go decisively. If any of the three is a maybe, I wait.",
  commonMistakes: [
    "Naming a Blocker but not waiting for a real Gap",
    "Trusting indicators without checking tyre direction",
    "Confusing 'a gap' with 'a safe gap' — the walk-across test settles it",
    "Committing when only 2 out of 3 (BGO) are true",
    "Hesitating after committing — cross decisively once BGO is green",
  ],
  gsmTips: [
    "Say it out loud on approach: 'Blocker … Gap … Opportunity'",
    "Walk across? Drive across.",
    "Judge speed, distance, tyres and indicators — in that order",
    "Indicator + wrong tyre angle = don't trust the indicator",
    "When all three are green, commit smoothly and completely",
  ],
  keyTakeaway:
    "BGO is the GSM decision test. Name the Blocker, look for a real Gap using the walk-across test, and only move when it is a true Opportunity.",
  durationMs: 18000,
  captions: [
    { at: 0.05, label: "Blocker", detail: "Stationary bus, hazards on — plan the overtake early." },
    { at: 0.4, label: "Gap check", detail: "Truck first — no gap yet. Wait for the real one." },
    { at: 0.62, label: "Opportunity", detail: "Real gap in oncoming traffic. Walk-across test = yes." },
    { at: 0.85, label: "Commit smoothly", detail: "Complete the overtake, return to the left." },
  ],
  questions: [
    {
      at: 0.32,
      prompt: "A bus is stopped ahead with hazards on. You've named it as your Blocker. What is the correct next step in BGO?",
      options: [
        {
          label: "Move out immediately — you have priority.",
          explain: "No. Naming the Blocker is only step 1. Step 2 is finding a real Gap in oncoming traffic.",
        },
        {
          label: "Judge the oncoming Gap — could I safely walk across right now?",
          correct: true,
          explain: "Correct. B → G. Only when the gap is real (walk-across test) do you look for the Opportunity.",
        },
        {
          label: "Sound the horn and pass regardless.",
          explain: "No. BGO exists precisely to stop that kind of gamble.",
        },
      ],
    },
    {
      at: 0.7,
      prompt: "An oncoming car has its left indicator on — appearing to turn off into a side road. What do you trust?",
      options: [
        {
          label: "The indicator alone — that's what it's for.",
          explain: "No. Indicators can be left on by mistake. Trust the indicator only when the TYRE direction agrees.",
        },
        {
          label: "The tyre direction — indicators mean nothing without matching tyre angle.",
          correct: true,
          explain: "Correct. GSM rule: read speed, distance, tyre direction and indicators. Tyres tell you where the car will actually go.",
        },
        {
          label: "Whichever comes first when you look.",
          explain: "No — read both, and only commit when they agree.",
        },
      ],
    },
  ],
  render: BgoScene,
};