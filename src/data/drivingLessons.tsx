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

// ─────────────────────────────────────────────────────────────
// Lesson 2 · The 2-Second Rule
// Horizontal road, ego (blue) follows lead (grey). A live gap
// meter overlay shows the current following time. Halfway through
// the scene rain starts — surface darkens, wipers on the lead car,
// and the safe gap requirement doubles to 4 seconds.
// ─────────────────────────────────────────────────────────────
function TwoSecondRuleScene(t: number) {
  const roadY = 200;
  const leadSpeedPxPerT = 340;
  const leadX = 140 + t * leadSpeedPxPerT;

  // Wet phase starts at t=0.55.
  const wet = t > 0.55;
  const wetProgress = Math.max(0, Math.min(1, (t - 0.55) / 0.15));

  // Gap (in seconds) — driver holds 2s in dry, then either stays
  // dangerously close (0..0.5) or extends to 4s (0.7..1) after the
  // question is answered.
  let gapSeconds: number;
  let egoX: number;
  if (t < 0.5) {
    // Ego closes in — gap shrinks from 3s to about 1.2s.
    gapSeconds = 3 - easeInOut(t / 0.5) * 1.8;
    egoX = leadX - (gapSeconds / 2) * 60; // 2s ≈ 60px visual
  } else if (t < 0.7) {
    // Held at close gap during the question.
    gapSeconds = 1.2;
    egoX = leadX - (gapSeconds / 2) * 60;
  } else {
    // Driver extends to 4s in the wet.
    const k = (t - 0.7) / 0.3;
    gapSeconds = 1.2 + easeInOut(k) * (4 - 1.2);
    egoX = leadX - (gapSeconds / 2) * 60;
  }

  const safe = wet ? gapSeconds >= 4 : gapSeconds >= 2;
  const gapColor = safe ? "#22c55e" : gapSeconds >= 1.5 ? "#f59e0b" : "#ef4444";

  const roadColor = wet ? `rgb(${28 - 4 * wetProgress}, ${28 - 4 * wetProgress}, ${34 + 6 * wetProgress})` : "#2b2b2e";

  const brakeLights = t > 0.42 && t < 0.5;

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <defs>
        <linearGradient id="sky-2s" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={wet ? "#20232a" : "#1a1a1c"} />
          <stop offset="1" stopColor={wet ? "#141519" : "#111"} />
        </linearGradient>
        <pattern id="rain" x="0" y="0" width="6" height="12" patternUnits="userSpaceOnUse" patternTransform={`translate(0 ${(t * 400) % 12})`}>
          <line x1="3" y1="0" x2="1" y2="8" stroke="#a8c8ff" strokeWidth="0.6" opacity="0.55" />
        </pattern>
      </defs>
      <rect width={640} height={360} fill="url(#sky-2s)" />
      <rect x={0} y={130} width={640} height={30} fill={GRASS} opacity={wet ? 0.7 : 1} />
      <rect x={0} y={240} width={640} height={40} fill={GRASS} opacity={wet ? 0.7 : 1} />
      {/* Road */}
      <rect x={0} y={160} width={640} height={80} fill={roadColor} />
      {/* Wet sheen */}
      {wet && <rect x={0} y={160} width={640} height={80} fill="#4a6b8a" opacity={0.08 * wetProgress + 0.05} />}
      {/* Edge lines */}
      <line x1={0} y1={162} x2={640} y2={162} stroke={PAINT} strokeWidth={1.5} opacity={wet ? 0.75 : 1} />
      <line x1={0} y1={238} x2={640} y2={238} stroke={PAINT} strokeWidth={1.5} opacity={wet ? 0.75 : 1} />
      {/* Centre dashes */}
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={i * 40 + ((t * 40) % 40) - 40} y={198} width={20} height={4} fill={PAINT} opacity={wet ? 0.7 : 1} />
      ))}
      {/* Rain overlay */}
      {wet && <rect x={0} y={0} width={640} height={360} fill="url(#rain)" opacity={wetProgress} />}

      {/* Gap indicator between the two cars */}
      <g>
        <line x1={egoX + 16} y1={roadY - 26} x2={leadX - 16} y2={roadY - 26} stroke={gapColor} strokeWidth={2} strokeDasharray="4 3" />
        <rect x={(egoX + leadX) / 2 - 28} y={roadY - 42} width={56} height={18} rx={4} fill="#000" opacity={0.7} />
        <text x={(egoX + leadX) / 2} y={roadY - 29} textAnchor="middle" fontSize={11} fontWeight={700} fill={gapColor} fontFamily="sans-serif">
          {gapSeconds.toFixed(1)}s
        </text>
      </g>

      {/* Cars */}
      <Car2 x={leadX} y={roadY} color="#8a8a8f" wipers={wet} />
      <Car2 x={egoX} y={roadY} color="#2f6bf0" braking={brakeLights} wipers={wet} />

      {/* Static roadside "count 1..2" markers illustrating the rule */}
      <g transform="translate(320 305)" opacity={0.9}>
        <rect width={210} height={44} rx={6} fill="#000" opacity={0.6} />
        <text x={12} y={18} fontSize={10} fill="#9ca3af" fontFamily="sans-serif">
          {wet ? "WET · SAFE GAP" : "DRY · SAFE GAP"}
        </text>
        <text x={12} y={38} fontSize={20} fill={safe ? "#22c55e" : "#ef4444"} fontWeight={700} fontFamily="sans-serif">
          {wet ? "4 seconds" : "2 seconds"}
        </text>
      </g>
    </svg>
  );
}

function Car2({
  x,
  y,
  color,
  braking,
  wipers,
}: {
  x: number;
  y: number;
  color: string;
  braking?: boolean;
  wipers?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-14} y={-8} width={28} height={16} rx={3} fill={color} stroke="#0a0a0a" strokeWidth={0.6} />
      <rect x={-8} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.7} />
      <rect x={3} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.5} />
      <rect x={14} y={-7} width={1.6} height={3} fill="#fff8c0" />
      <rect x={14} y={4} width={1.6} height={3} fill="#fff8c0" />
      <rect x={-15.6} y={-7} width={1.6} height={3} fill={braking ? "#ff2a2a" : "#5a1010"} />
      <rect x={-15.6} y={4} width={1.6} height={3} fill={braking ? "#ff2a2a" : "#5a1010"} />
      {wipers && (
        <line x1={7} y1={-6} x2={3} y2={6} stroke="#ddd" strokeWidth={0.8}>
          <animateTransform attributeName="transform" type="rotate" values="-15 5 0;15 5 0;-15 5 0" dur="0.8s" repeatCount="indefinite" />
        </line>
      )}
    </g>
  );
}

const twoSecondRule: Lesson = {
  slug: "two-second-rule",
  title: "The 2-second rule",
  category: "Highway Code • Practical Driving Skills",
  rule: "Rule 126",
  objective:
    "Learn how to measure and maintain a safe following distance in dry and wet conditions using the 2-second rule.",
  think: [
    "How fast am I going and what's the surface like?",
    "Can I see the road well ahead of the car in front?",
    "Is the driver in front braking or hesitant?",
    "If they stopped suddenly, could I stop without hitting them?",
    "Do I need to drop back — is the gap shrinking?",
  ],
  ruleHeadline: "Only a fool breaks the 2-second rule.",
  ruleBullets: [
    "Pick a fixed point ahead — a sign, a bridge, a lamp post",
    "When the car in front passes it, start counting: “only a fool breaks the two-second rule”",
    "If you reach the point before you finish saying it — you're too close",
    "Double the gap to 4 seconds in the wet",
    "Multiply it by 10 in ice or snow",
  ],
  why: (
    <>
      <p>
        Most rear-end collisions happen because the driver behind was too close to stop in time.
        The gap in front of you is <strong>your thinking time and your braking distance</strong>.
      </p>
      <p>
        In the dry, a good driver leaves at least 2 seconds. In the wet, tyres grip less and stopping
        distances double — so the gap must double too.
      </p>
      <p>
        A bigger gap also means you see more of the road ahead. You spot brake lights, hazards and
        junctions earlier — which means smoother, calmer driving.
      </p>
    </>
  ),
  georgeExplains:
    "Watch that little gap counter — the moment it drops under 2 seconds you're not driving your car anymore, you're driving theirs. In the wet, 2 seconds isn't enough. Drop back until it reads 4. You'll feel calmer, you'll see more of the road, and if they slam their brakes on, you'll still be the one in control.",
  commonMistakes: [
    "Tailgating to “push” a slower driver along",
    "Keeping a dry-weather gap when the road is wet",
    "Filling the gap every time another car pulls in — just drop back again",
    "Judging distance in car-lengths instead of seconds — it doesn't scale with speed",
    "Braking hard because you left it too late to see the problem",
  ],
  gsmTips: [
    "Count out loud: “only a fool breaks the two-second rule”",
    "In the wet — count it twice",
    "If a car cuts in, ease off and rebuild the gap",
    "The bigger the vehicle in front, the bigger the gap (you can't see past it)",
    "Smooth throttle keeps the gap steady — no need to brake",
  ],
  keyTakeaway:
    "Two seconds in the dry, four in the wet, ten on ice — the gap in front of you is the time you have to think, react and stop.",
  durationMs: 15000,
  captions: [
    { at: 0, label: "Dry road, following a grey car", detail: "You settle in behind at a comfortable speed." },
    { at: 0.25, label: "The gap is closing", detail: "The counter is dropping below 2 seconds — you're getting too close." },
    { at: 0.5, label: "Decision point — the rain starts", detail: "The surface is turning wet. What's the safe gap now?" },
    { at: 0.7, label: "Ease off and drop back", detail: "Extend the gap to 4 seconds for the wet road." },
    { at: 0.9, label: "Safe following distance restored", detail: "Green counter — you're back in control." },
  ],
  questions: [
    {
      at: 0.5,
      prompt: "It's just started to rain. What following distance should you now leave?",
      options: [
        {
          label: "The same 2 seconds — you're already at the limit",
          explain:
            "No. Wet roads double stopping distances. 2 seconds is only enough in the dry.",
        },
        {
          label: "At least 4 seconds — double the dry gap",
          correct: true,
          explain:
            "Correct. In the wet, tyres grip less and stopping distances roughly double, so the safe gap doubles too — at least 4 seconds.",
        },
        {
          label: "1 car length per 10 mph",
          explain:
            "That's the old-school rule and it doesn't scale properly. Time — not car-lengths — is what matters. Use seconds.",
        },
      ],
    },
  ],
  render: TwoSecondRuleScene,
};

// Re-export the list with the new lesson appended.
drivingLessons.push(twoSecondRule);

export function getLesson(slug: string): Lesson | undefined {
  return drivingLessons.find((l) => l.slug === slug);
}