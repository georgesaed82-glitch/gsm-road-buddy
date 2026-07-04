import type { Lesson } from "@/components/driving-clips/LessonShell";

// ─────────────────────────────────────────────────────────────
// GSM lesson library. Each lesson uses the standard LessonShell
// so learners see the same sequence on every topic.
// Add new lessons here — only the render + copy changes.
// ─────────────────────────────────────────────────────────────

const PAINT = "#f5f5f0";
const GRASS = "#3d6a2f";

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// A single-carriageway road, ego heading east in the top lane.
function SpeedAdjustmentScene(t: number) {
  // Ego car speed profile: cruise → close on slow car → drop to match → follow.
  // Slow lead car cruises at ~35mph the whole time.
  const roadY = 200;
  const leadX = 120 + t * 340; // slow car moves steadily right

  // Ego catches up quickly then matches lead speed after t≈0.45.
  let egoX: number;
  if (t < 0.45) {
    // approach faster than lead
    const k = t / 0.45;
    egoX = -20 + (leadX - 90) * easeInOut(k);
  } else {
    // hold gap 60 behind lead
    egoX = leadX - 60;
  }

  // Speed reading (mph) for HUD.
  const egoSpeed = t < 0.45 ? 40 - 5 * easeInOut(t / 0.45) : 35;
  const leadSpeed = 35;

  const brakeLights = t > 0.35 && t < 0.55;

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <defs>
        <linearGradient id="sky-sa" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
      </defs>
      <rect width={640} height={360} fill="url(#sky-sa)" />
      {/* Grass verges */}
      <rect x={0} y={130} width={640} height={30} fill={GRASS} />
      <rect x={0} y={240} width={640} height={40} fill={GRASS} />
      {/* Road */}
      <rect x={0} y={160} width={640} height={80} fill="#2b2b2e" />
      {/* Edge lines */}
      <line x1={0} y1={162} x2={640} y2={162} stroke={PAINT} strokeWidth={1.5} />
      <line x1={0} y1={238} x2={640} y2={238} stroke={PAINT} strokeWidth={1.5} />
      {/* Centre dashes */}
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={i * 40 + ((t * 40) % 40) - 40} y={198} width={20} height={4} fill={PAINT} />
      ))}
      {/* 40 speed limit sign */}
      <g transform="translate(80 90)">
        <circle r={22} fill="#fff" stroke="#c8102e" strokeWidth={5} />
        <text textAnchor="middle" y={7} fontSize={20} fontWeight={800} fill="#111" fontFamily="sans-serif">40</text>
      </g>
      <text x={80} y={132} textAnchor="middle" fontSize={9} fill="#fff" opacity={0.6} fontFamily="sans-serif">SPEED LIMIT</text>

      {/* Lead grey car (top-down) */}
      <Car x={leadX} y={roadY} color="#8a8a8f" braking={false} />
      {/* Ego blue car (learner) */}
      <Car x={egoX} y={roadY} color="#2f6bf0" braking={brakeLights} indicator={null} />

      {/* Speed HUD */}
      <g transform="translate(20 300)">
        <rect width={180} height={44} rx={6} fill="#000" opacity={0.55} />
        <text x={12} y={18} fontSize={10} fill="#9ca3af" fontFamily="sans-serif">YOUR SPEED</text>
        <text x={12} y={38} fontSize={20} fill="#fff" fontWeight={700} fontFamily="sans-serif">
          {Math.round(egoSpeed)} mph
        </text>
        <text x={100} y={18} fontSize={10} fill="#9ca3af" fontFamily="sans-serif">CAR AHEAD</text>
        <text x={100} y={38} fontSize={20} fill="#f5f5f0" fontWeight={700} fontFamily="sans-serif">
          {leadSpeed} mph
        </text>
      </g>
    </svg>
  );
}

function Car({
  x,
  y,
  color,
  braking,
  indicator,
}: {
  x: number;
  y: number;
  color: string;
  braking?: boolean;
  indicator?: "left" | "right" | null;
}) {
  // Car heading east (right). Draw horizontally.
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-14} y={-8} width={28} height={16} rx={3} fill={color} stroke="#0a0a0a" strokeWidth={0.6} />
      <rect x={-8} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.7} />
      <rect x={3} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.5} />
      {/* headlights (front = right) */}
      <rect x={14} y={-7} width={1.6} height={3} fill="#fff8c0" />
      <rect x={14} y={4} width={1.6} height={3} fill="#fff8c0" />
      {/* brake lights (rear = left) */}
      <rect x={-15.6} y={-7} width={1.6} height={3} fill={braking ? "#ff2a2a" : "#5a1010"} />
      <rect x={-15.6} y={4} width={1.6} height={3} fill={braking ? "#ff2a2a" : "#5a1010"} />
      {indicator === "right" && (
        <circle cx={14} cy={0} r={1.5} fill="#ffb020">
          <animate attributeName="opacity" values="1;0.2;1" dur="0.5s" repeatCount="indefinite" />
        </circle>
      )}
      {indicator === "left" && (
        <circle cx={-14} cy={0} r={1.5} fill="#ffb020">
          <animate attributeName="opacity" values="1;0.2;1" dur="0.5s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

const speedAdjustment: Lesson = {
  slug: "speed-adjustment",
  title: "Speed adjustment",
  category: "Highway Code • Practical Driving Skills",
  rule: "Rules 124–126",
  objective:
    "Learn how to adjust your speed safely using the road, traffic, weather and visibility — not simply the speed limit.",
  think: [
    "What is the speed limit?",
    "Is it safe to drive at that speed?",
    "What are the road conditions like right now?",
    "What is the traffic ahead doing?",
    "Can I stop safely if something changes?",
  ],
  ruleHeadline: "The speed limit is NOT a target.",
  ruleBullets: [
    "Drive to the road conditions",
    "Drive to the traffic flow",
    "Drive to the weather",
    "Drive to the visibility",
    "Drive to the hazards ahead",
  ],
  why: (
    <>
      <p>
        The speed limit is the <strong>maximum legal speed in ideal conditions</strong> — it is not
        the speed you must drive at.
      </p>
      <p>If traffic is travelling slower than the limit… follow the traffic.</p>
      <p>If visibility is poor… reduce your speed.</p>
      <p>If you are approaching a hazard… reduce your speed.</p>
      <p>
        The aim is to always leave yourself enough time to <strong>think</strong>,{" "}
        <strong>react</strong> and <strong>stop</strong> safely.
      </p>
    </>
  ),
  georgeExplains:
    "They're only travelling slightly below the limit. There's no need to overtake — stay behind, keep a safe following distance and continue with the flow of traffic. Remember: the speed limit isn't a target, it's the maximum. Your job is to read what's in front of you and match it.",
  commonMistakes: [
    "Treating the speed limit as a target",
    "Accelerating downhill without checking speed",
    "Driving too slowly uphill and holding up traffic",
    "Overtaking unnecessarily when the gap ahead is safe",
    "Following too closely behind slower vehicles",
  ],
  gsmTips: [
    "Look far ahead — plan, don't react",
    "Read the road early and adjust smoothly",
    "Less space = less speed",
    "Keep the traffic flowing — smooth is safe",
    "Match the speed of the vehicle ahead, keep the gap",
  ],
  keyTakeaway:
    "Always adjust your speed to what you can see, the space available and the developing hazards — not simply the number on the speed limit sign.",
  durationMs: 14000,
  captions: [
    { at: 0, label: "40 mph road ahead", detail: "You're cruising at the limit. Speed limit sign confirmed." },
    { at: 0.25, label: "Grey car ahead is slower", detail: "Reading the road: the vehicle ahead is at ~35 mph." },
    { at: 0.45, label: "Decision point", detail: "The gap is closing — what would you do?" },
    { at: 0.6, label: "Match speed and hold the gap", detail: "Ease off, drop to 35 mph, keep a safe 2-second gap." },
    { at: 0.85, label: "Smooth follow", detail: "Flow with the traffic. Smooth is safe." },
  ],
  questions: [
    {
      at: 0.45,
      prompt: "The car ahead is doing 35 mph in a 40 zone. Should you overtake?",
      options: [
        {
          label: "Yes — the limit is 40, so overtake",
          explain:
            "No. The speed limit is the maximum, not a target. Overtaking to gain 5 mph creates risk with almost no benefit.",
        },
        {
          label: "No — stay behind and match their speed",
          correct: true,
          explain:
            "Correct. They're only slightly below the limit. Stay behind, keep a safe following distance and continue with the flow.",
        },
        {
          label: "Flash your headlights so they speed up",
          explain:
            "No. Flashing headlights to intimidate other drivers is aggressive and against the Highway Code. Be patient.",
        },
      ],
    },
  ],
  render: SpeedAdjustmentScene,
};

export const drivingLessons: Lesson[] = [speedAdjustment];

export function getLesson(slug: string): Lesson | undefined {
  return drivingLessons.find((l) => l.slug === slug);
}