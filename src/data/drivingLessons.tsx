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
  // UK left-hand traffic — both cars sit in the left (bottom) lane.
  const roadY = 218;
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
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>The speed limit is the <strong>maximum legal speed in ideal conditions</strong> — not a target. Driving to the conditions is what actually keeps you (and everyone around you) safe. Rain, spray, low sun, heavy traffic, roadworks or a queue ahead all shorten the safe speed long before the number on the sign does.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>Every time the road ahead changes: weather, visibility, traffic flow, a hazard you can see coming, or a vehicle in front travelling slower than the limit. If in doubt, the answer is always to ease off first and reassess.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">How we do it — the steps</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Look far ahead — read the road, weather and traffic well before you get there.</li>
        <li>Match your speed to the slowest safe factor (flow, visibility, hazards).</li>
        <li>Keep the two-second gap — bigger in rain, spray or poor light.</li>
        <li>Adjust smoothly on the throttle — brakes are for correction, not planning.</li>
        <li>Only return to the limit once conditions genuinely allow it.</li>
      </ol>
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

// The exported list is declared after both lessons are defined (see end of file).

// ─────────────────────────────────────────────────────────────
// Lesson 2 · The 2-Second Rule
// Horizontal road, ego (blue) follows lead (grey). A live gap
// meter overlay shows the current following time. Halfway through
// the scene rain starts — surface darkens, wipers on the lead car,
// and the safe gap requirement doubles to 4 seconds.
// ─────────────────────────────────────────────────────────────
function TwoSecondRuleScene(t: number) {
  // UK left-hand traffic — cars in the left (bottom) lane.
  const roadY = 218;
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
  indicator,
}: {
  x: number;
  y: number;
  color: string;
  braking?: boolean;
  wipers?: boolean;
  indicator?: "left" | "right" | null;
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
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>The gap in front of you is your <strong>thinking time and braking distance</strong>. Most rear-end shunts happen because the driver behind was simply too close to react. A proper gap also lets you <em>see</em> more — brake lights, hazards and junctions arrive early, so the whole drive gets smoother.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>Every single time you are following another vehicle — town, country or dual carriageway. Two seconds in the dry, four in the wet, more still in ice, spray or behind a large vehicle you can't see past.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">How we do it — the steps</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Pick a fixed point (sign, drain, lamp post) as the car in front passes it.</li>
        <li>Count "only a fool breaks the two-second rule" — you should finish after your car passes it.</li>
        <li>If you finish before, you're too close — ease off, don't brake.</li>
        <li>In rain, spray or low grip, double it: count it twice.</li>
        <li>If a car cuts in, drop back and rebuild the gap — don't fight for it.</li>
      </ol>
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

// ─────────────────────────────────────────────────────────────
// Lesson 3 · Approaching a zebra crossing
// Horizontal road, ego (blue) approaches a zebra crossing on the
// left. A pedestrian walks up to the kerb, waits, then steps onto
// the crossing. The driver must brake progressively and stop
// before the give-way triangles.
// ─────────────────────────────────────────────────────────────
function ZebraCrossingScene(t: number) {
  const roadY = 200;
  const crossingX = 420; // left edge of the zebra stripes
  const crossingW = 80;

  // Ego car: cruise → brake → stop at the give-way line by t≈0.6.
  const stopX = crossingX - 24; // just before the crossing
  const startX = -20;
  let egoX: number;
  if (t < 0.6) {
    egoX = startX + (stopX - startX) * easeInOut(t / 0.6);
  } else {
    egoX = stopX; // held stopped
  }
  // Slight roll-forward release after the pedestrian has cleared (t > 0.9).
  if (t > 0.9) {
    const k = (t - 0.9) / 0.1;
    egoX = stopX + easeInOut(k) * 60;
  }
  const braking = t > 0.2 && t < 0.62;

  // Pedestrian: walks up to kerb, waits, steps onto crossing, crosses over.
  // Kerb is at y=155 (top pavement), opposite kerb at y=245.
  const pedX = crossingX + crossingW / 2;
  let pedY: number;
  if (t < 0.3) {
    // walking along pavement toward the crossing
    pedY = 140;
  } else if (t < 0.5) {
    // waiting at kerb
    pedY = 152;
  } else if (t < 0.9) {
    // crossing over
    const k = (t - 0.5) / 0.4;
    pedY = 152 + easeInOut(k) * (248 - 152);
  } else {
    pedY = 250; // safely across
  }
  const pedWalkPhase = Math.sin(t * 40);

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <defs>
        <linearGradient id="sky-zx" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
      </defs>
      <rect width={640} height={360} fill="url(#sky-zx)" />
      {/* Pavements */}
      <rect x={0} y={130} width={640} height={30} fill="#5b5b60" />
      <rect x={0} y={240} width={640} height={40} fill="#5b5b60" />
      {/* Kerb lines */}
      <line x1={0} y1={160} x2={640} y2={160} stroke="#8a8a90" strokeWidth={1} />
      <line x1={0} y1={240} x2={640} y2={240} stroke="#8a8a90" strokeWidth={1} />
      {/* Road */}
      <rect x={0} y={160} width={640} height={80} fill="#2b2b2e" />
      {/* Centre dashes only where there is no crossing */}
      {Array.from({ length: 16 }).map((_, i) => {
        const x = i * 40 + ((t * 40) % 40) - 40;
        if (x + 20 > crossingX && x < crossingX + crossingW) return null;
        return <rect key={i} x={x} y={198} width={20} height={4} fill={PAINT} />;
      })}
      {/* Zig-zag warning lines on approach (both sides) */}
      <ZigZag y={164} startX={280} endX={crossingX - 4} />
      <ZigZag y={236} startX={280} endX={crossingX - 4} />
      <ZigZag y={164} startX={crossingX + crossingW + 4} endX={620} />
      <ZigZag y={236} startX={crossingX + crossingW + 4} endX={620} />
      {/* Zebra stripes */}
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={crossingX + i * 14} y={161} width={9} height={78} fill={PAINT} />
      ))}
      {/* Give-way triangles (dashed line before the stripes) */}
      <line x1={crossingX - 6} y1={162} x2={crossingX - 6} y2={238} stroke={PAINT} strokeDasharray="4 3" strokeWidth={1.2} />
      {/* Belisha beacons */}
      <Belisha x={crossingX + 4} y={130} on={t % 1 < 0.5} />
      <Belisha x={crossingX + crossingW - 4} y={280} on={t % 1 >= 0.5} />

      {/* Ego car */}
      <Car2 x={egoX} y={roadY} color="#2f6bf0" braking={braking} />

      {/* Pedestrian */}
      <g transform={`translate(${pedX} ${pedY})`}>
        <circle r={3.2} cy={-6} fill="#f5d6a0" stroke="#1a1a1c" strokeWidth={0.4} />
        <rect x={-3} y={-3} width={6} height={9} fill="#c8102e" />
        <line x1={-1.5} y1={6} x2={-1.5 + pedWalkPhase * 1.5} y2={11} stroke="#1a1a1c" strokeWidth={1.2} />
        <line x1={1.5} y1={6} x2={1.5 - pedWalkPhase * 1.5} y2={11} stroke="#1a1a1c" strokeWidth={1.2} />
      </g>

      {/* HUD */}
      <g transform="translate(20 300)">
        <rect width={200} height={44} rx={6} fill="#000" opacity={0.6} />
        <text x={12} y={18} fontSize={10} fill="#9ca3af" fontFamily="sans-serif">
          ZEBRA CROSSING AHEAD
        </text>
        <text x={12} y={38} fontSize={16} fontWeight={700} fontFamily="sans-serif"
          fill={t < 0.3 ? "#f5f5f0" : t < 0.6 ? "#f59e0b" : t < 0.9 ? "#ef4444" : "#22c55e"}
        >
          {t < 0.3 ? "Scan and slow" : t < 0.6 ? "Brake progressively" : t < 0.9 ? "Stopped — give way" : "Clear — move off"}
        </text>
      </g>
    </svg>
  );
}

function ZigZag({ y, startX, endX }: { y: number; startX: number; endX: number }) {
  const step = 8;
  const pts: string[] = [];
  for (let x = startX; x <= endX; x += step) {
    pts.push(`${x},${y}`);
    pts.push(`${x + step / 2},${y + (pts.length % 2 === 0 ? -4 : 4)}`);
  }
  return <polyline points={pts.join(" ")} fill="none" stroke={PAINT} strokeWidth={1.4} />;
}

function Belisha({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-0.8} y={-14} width={1.6} height={28} fill="#e5e5e5" />
      <circle r={4} cy={-16} fill={on ? "#ffb020" : "#5a3a00"} stroke="#1a1a1c" strokeWidth={0.5} />
    </g>
  );
}

const zebraCrossing: Lesson = {
  slug: "zebra-crossing",
  title: "Approaching a zebra crossing",
  category: "Highway Code • Practical Driving Skills",
  rule: "Rules 195, H2",
  objective:
    "Learn how to spot, approach and stop safely at a zebra crossing — and how to read pedestrian intent before you commit.",
  think: [
    "Can I see the crossing early — beacons, zig-zags, stripes?",
    "Is there anyone on or near the kerb?",
    "What is my speed, and can I stop smoothly if needed?",
    "Is the vehicle behind me too close — do I need to warn them with brake lights early?",
    "If I stop, will the crossing be clear before I move off?",
  ],
  ruleHeadline: "You MUST give way to anyone on the crossing — and be ready to stop for anyone waiting to cross.",
  ruleBullets: [
    "Look for the flashing yellow Belisha beacons and zig-zag lines on approach",
    "Slow down and be prepared to stop — every time",
    "Never overtake or park on the zig-zags",
    "Don't wave pedestrians across — another vehicle may not have seen them",
    "Once you've stopped, wait until the crossing is completely clear before moving off",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>A zebra crossing gives pedestrians <strong>priority</strong> — it's the law, not a courtesy. The beacons and zig-zags exist so you have room to <em>see</em>, <em>slow</em> and <em>stop</em> smoothly. Late, heavy braking is how pedestrians get hit and how the driver behind rear-ends you.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>The moment you spot the beacons or the zig-zag lines — day or night, wet or dry. If anyone is on the crossing, or clearly about to step on, you MUST stop.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">How we do it — the steps</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>See the beacons — ease off the accelerator, cover the brake.</li>
        <li>Scan the pavements, not just the stripes — who's walking towards it?</li>
        <li>Slow early and progressively — brake lights warn the driver behind.</li>
        <li>Stop before the give-way line if anyone is on or approaching the crossing.</li>
        <li>Wait until the crossing is completely clear — never wave people across.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "Beacons, zig-zags, stripes — that's your three-part warning. As soon as you see the beacons, take your foot off the accelerator, cover the brake and look for anyone near the kerb. That lady on the pavement is looking straight at the crossing — she's going to cross. Don't wait until she steps out to react. Slow now, stop early, wave nobody across, and only move off when the crossing is completely empty.",
  commonMistakes: [
    "Only looking at the crossing itself — ignoring people on the pavement",
    "Waving pedestrians across (another car may not have seen them)",
    "Overtaking on the approach or parking on the zig-zags",
    "Braking hard at the last moment instead of slowing early",
    "Moving off while the person is still on the last stripe",
  ],
  gsmTips: [
    "See the beacons — ease off the gas",
    "Cover the brake as soon as the zig-zags start",
    "Watch the kerb, not just the crossing",
    "Make eye contact — but don't beckon",
    "Handbrake on if you're stopped for more than a second or two",
  ],
  keyTakeaway:
    "Zebra crossings belong to the pedestrian. Your job is to see them early, stop smoothly and only move off when the crossing is completely clear.",
  durationMs: 15000,
  captions: [
    { at: 0, label: "Beacons and zig-zags visible ahead", detail: "Ease off the accelerator — start scanning the pavement." },
    { at: 0.25, label: "Pedestrian at the kerb", detail: "They're looking at the crossing — assume they will step on." },
    { at: 0.5, label: "Decision point", detail: "What should you do now?" },
    { at: 0.65, label: "Stopped at the give-way line", detail: "Handbrake on, watch the crossing." },
    { at: 0.92, label: "Crossing clear — move off smoothly", detail: "Mirror check, release, gently away." },
  ],
  questions: [
    {
      at: 0.5,
      prompt: "A pedestrian is waiting at the kerb of a zebra crossing, looking at it. What should you do?",
      options: [
        {
          label: "Keep going — they haven't stepped on yet",
          explain:
            "No. Under the updated Highway Code (Rule H2) you should give way to a pedestrian waiting to cross — not just those already on the stripes.",
        },
        {
          label: "Slow down and stop — let them cross",
          correct: true,
          explain:
            "Correct. They're clearly waiting to cross. Slow smoothly, stop before the give-way line and let them cross. Only move off when the crossing is completely clear.",
        },
        {
          label: "Beep to let them know you've seen them, then drive on",
          explain:
            "No. Sounding the horn to hurry or warn pedestrians is aggressive and against the Highway Code. Stop and let them cross.",
        },
      ],
    },
  ],
  render: ZebraCrossingScene,
};

// ─────────────────────────────────────────────────────────────
// Shared helpers for lessons 4+ — a horizontal single-carriageway
// road with animated centre-line dashes and grass verges.
// ─────────────────────────────────────────────────────────────
function HorizontalRoad({ t, roadColor = "#2b2b2e" }: { t: number; roadColor?: string }) {
  return (
    <g>
      <rect x={0} y={130} width={640} height={30} fill={GRASS} />
      <rect x={0} y={240} width={640} height={40} fill={GRASS} />
      <rect x={0} y={160} width={640} height={80} fill={roadColor} />
      <line x1={0} y1={162} x2={640} y2={162} stroke={PAINT} strokeWidth={1.5} />
      <line x1={0} y1={238} x2={640} y2={238} stroke={PAINT} strokeWidth={1.5} />
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={i * 40 + ((t * 40) % 40) - 40} y={198} width={20} height={4} fill={PAINT} />
      ))}
    </g>
  );
}

function Sky({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
      </defs>
      <rect width={640} height={360} fill={`url(#${id})`} />
    </>
  );
}

function Hud({ label, value, tone = "info" }: { label: string; value: string; tone?: "info" | "good" | "warn" | "bad" }) {
  const color = tone === "good" ? "#22c55e" : tone === "warn" ? "#f59e0b" : tone === "bad" ? "#ef4444" : "#f5f5f0";
  return (
    <g transform="translate(20 300)">
      <rect width={220} height={44} rx={6} fill="#000" opacity={0.6} />
      <text x={12} y={18} fontSize={10} fill="#9ca3af" fontFamily="sans-serif">{label}</text>
      <text x={12} y={38} fontSize={18} fontWeight={700} fill={color} fontFamily="sans-serif">{value}</text>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// Lesson · Going Uphill (side profile)
// ─────────────────────────────────────────────────────────────
function UphillScene(t: number) {
  // Road tilts up-right. Car climbs; speed dips then recovers if you accelerate early.
  const roadPath = "M0 260 L640 140";
  const shoulderPath = "M0 265 L640 145";
  const carT = 0.05 + t * 0.9;
  const cx = 640 * carT;
  const cy = 260 - 120 * carT;
  // Speed: starts 40, sags to 28 by t=0.5 (gravity), recovers to 40 by t=0.95 (accelerate early).
  const speed = t < 0.5 ? 40 - 12 * easeInOut(t / 0.5) : 28 + 12 * easeInOut((t - 0.5) / 0.5);
  const tone = speed < 32 ? "bad" : speed < 38 ? "warn" : "good";
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <Sky id="sky-up" />
      {/* Grass hillside */}
      <path d="M0 360 L0 260 L640 140 L640 360 Z" fill={GRASS} opacity={0.35} />
      {/* Road (thick stroke) */}
      <path d={roadPath} stroke="#2b2b2e" strokeWidth={70} fill="none" />
      <path d={roadPath} stroke={PAINT} strokeWidth={1.5} fill="none" />
      <path d={shoulderPath} stroke={PAINT} strokeWidth={1.5} fill="none" opacity={0.5} />
      {/* Centre dashes */}
      {Array.from({ length: 12 }).map((_, i) => {
        const p = (i + (t * 2)) / 12;
        const x = 640 * p;
        const y = 260 - 120 * p;
        return <rect key={i} x={x - 10} y={y - 2} width={16} height={3} fill={PAINT} transform={`rotate(-10.6 ${x} ${y})`} />;
      })}
      {/* Car (rotated to match incline, angle ~-10.6°) */}
      <g transform={`translate(${cx} ${cy - 8}) rotate(-10.6)`}>
        <rect x={-18} y={-10} width={36} height={20} rx={4} fill="#2f6bf0" stroke="#0a0a0a" strokeWidth={0.6} />
        <rect x={-10} y={-8} width={10} height={5} fill="#111" opacity={0.7} />
        <circle cx={-12} cy={10} r={4} fill="#111" />
        <circle cx={12} cy={10} r={4} fill="#111" />
        <rect x={18} y={-8} width={1.6} height={3} fill="#fff8c0" />
      </g>
      <Hud label="YOUR SPEED (UPHILL)" value={`${Math.round(speed)} mph`} tone={tone} />
    </svg>
  );
}

const goingUphill: Lesson = {
  slug: "going-uphill",
  title: "Going uphill",
  category: "Highway Code • Practical Driving Skills",
  rule: "Rule 160",
  objective: "Learn how to keep the car moving smoothly uphill by accelerating early — before gravity slows you down.",
  think: [
    "How steep is the hill and how heavy is my car with passengers?",
    "Am I in the right gear for the incline?",
    "Is my speed dropping too much — do I need more accelerator now?",
    "Is there anyone behind who might be held up?",
    "Is there a hazard at the crest I can't see yet?",
  ],
  ruleHeadline: "Accelerate early — before gravity has time to slow you down.",
  ruleBullets: [
    "Read the hill before you get to it",
    "Change down a gear if the engine is straining",
    "Feed in the accelerator smoothly and progressively",
    "Never crawl uphill and hold up the traffic behind",
    "Take extra care approaching the crest — you can't see over it",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>Gravity is constantly pulling your speed down on an uphill. If you wait for the speedo to sag you're already playing catch-up — the engine strains, you drop out of the flow, and the driver behind starts to close in.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>Any noticeable incline — motorway climbs, country lane rises, even a gentle town gradient. The steeper the hill, the earlier you plan.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">How we do it — the steps</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Read the hill early — decide the gear before you get to it.</li>
        <li>Feed in more accelerator on the approach, not once the speed has dropped.</li>
        <li>If the engine strains, change down — smooth power, no jerk.</li>
        <li>Keep to the left, keep the gap ahead, don't crawl and hold up traffic.</li>
        <li>Ease off before the crest — the view opens suddenly, and something may be waiting.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "Watch that speedo — the moment it starts to sag, you've reacted too late. Look at the hill before you get to it and give it a bit more accelerator on the approach. If the engine sounds like it's working, change down. Smooth power, no jerk.",
  commonMistakes: [
    "Waiting until the car has slowed to react",
    "Staying in too high a gear and stalling",
    "Crawling uphill and holding up traffic",
    "Cresting the hill at speed with no view of what's beyond",
  ],
  gsmTips: [
    "Read the hill before you climb it",
    "Accelerate early, not late",
    "Change down if the engine strains",
    "Ease off before the crest — the view opens up suddenly",
  ],
  keyTakeaway: "Gravity slows you down uphill — accelerate early, drive smoothly and never crawl.",
  durationMs: 12000,
  captions: [
    { at: 0, label: "Hill ahead — plan the climb", detail: "Look at the incline before you get to it." },
    { at: 0.35, label: "Speed sagging", detail: "Gravity is winning — you needed more accelerator earlier." },
    { at: 0.5, label: "Decision point", detail: "What should you do now?" },
    { at: 0.75, label: "More accelerator, smooth power", detail: "Speed recovers, the car pulls cleanly." },
  ],
  questions: [
    {
      at: 0.5,
      prompt: "You're climbing a hill and the speedo has dropped from 40 to 28 mph. What should you do?",
      options: [
        { label: "Do nothing — the hill will end eventually", explain: "No. You'll hold up traffic and reach the crest at a dangerously low speed." },
        { label: "Accelerate progressively and change down if needed", correct: true, explain: "Correct. Feed in the accelerator smoothly. If the engine is straining, drop a gear so the car has power to climb." },
        { label: "Slam the accelerator to the floor", explain: "No. Sudden acceleration wastes fuel and unsettles the car. Smooth and progressive is the answer." },
      ],
    },
  ],
  render: UphillScene,
};

// ─────────────────────────────────────────────────────────────
// Lesson · Going Downhill
// ─────────────────────────────────────────────────────────────
function DownhillScene(t: number) {
  const carT = 0.05 + t * 0.9;
  const cx = 640 * carT;
  const cy = 140 + 120 * carT;
  // Speed: gravity accelerates from 30 to 48 unless braking. After t=0.5, learner applies foot brake and it settles at 32.
  const speed = t < 0.5 ? 30 + 18 * easeInOut(t / 0.5) : 48 - 16 * easeInOut((t - 0.5) / 0.5);
  const braking = t > 0.5;
  const tone = speed > 42 ? "bad" : speed > 36 ? "warn" : "good";
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <Sky id="sky-down" />
      <path d="M0 360 L0 140 L640 260 L640 360 Z" fill={GRASS} opacity={0.35} />
      <path d="M0 140 L640 260" stroke="#2b2b2e" strokeWidth={70} fill="none" />
      <path d="M0 140 L640 260" stroke={PAINT} strokeWidth={1.5} fill="none" />
      {Array.from({ length: 12 }).map((_, i) => {
        const p = (i + (t * 2)) / 12;
        const x = 640 * p;
        const y = 140 + 120 * p;
        return <rect key={i} x={x - 10} y={y - 2} width={16} height={3} fill={PAINT} transform={`rotate(10.6 ${x} ${y})`} />;
      })}
      <g transform={`translate(${cx} ${cy - 8}) rotate(10.6)`}>
        <rect x={-18} y={-10} width={36} height={20} rx={4} fill="#2f6bf0" stroke="#0a0a0a" strokeWidth={0.6} />
        <rect x={-10} y={-8} width={10} height={5} fill="#111" opacity={0.7} />
        <circle cx={-12} cy={10} r={4} fill="#111" />
        <circle cx={12} cy={10} r={4} fill="#111" />
        <rect x={-19.6} y={-8} width={1.6} height={3} fill={braking ? "#ff2a2a" : "#5a1010"} />
      </g>
      <Hud label="YOUR SPEED (DOWNHILL)" value={`${Math.round(speed)} mph`} tone={tone} />
    </svg>
  );
}

const goingDownhill: Lesson = {
  slug: "going-downhill",
  title: "Going downhill",
  category: "Highway Code • Practical Driving Skills",
  rule: "Rule 160",
  objective: "Learn how to control your speed downhill using engine braking and gentle foot brake — never allow the hill to run away with you.",
  think: [
    "How steep is the descent?",
    "What gear am I in — will engine braking help?",
    "Is the surface slippery — leaves, wet, ice?",
    "Is there a junction, bend or hazard at the bottom?",
    "Am I close to the car in front — will my stopping distance grow?",
  ],
  ruleHeadline: "Don't let the hill dictate your speed.",
  ruleBullets: [
    "Change down before the descent, not during",
    "Use engine braking to hold your speed",
    "Apply gentle, progressive foot brake if needed",
    "Keep a bigger gap — stopping distance is longer downhill",
    "Never coast in neutral to save fuel",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>Gravity <em>accelerates</em> you downhill. If you don't manage speed you arrive at the bottom too fast for the junction, bend or queue that's waiting. Engine braking (lower gear) does the quiet work; the foot brake is only for fine-tuning — not for fighting the whole hill.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>Any descent — steep country lanes, motorway drops, town hills into a junction. The steeper the hill and the closer the hazard at the bottom, the earlier the gear must come down.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">How we do it — the steps</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Change down BEFORE the descent — let the engine hold you back.</li>
        <li>Keep both hands on the wheel — never coast in neutral.</li>
        <li>Use the foot brake gently and progressively to trim speed.</li>
        <li>Leave a bigger gap in front — stopping distances are longer downhill.</li>
        <li>Plan for whatever is at the bottom — junction, bend, queue — before you get there.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "The mistake most learners make? They wait until they're already going too fast and then stamp on the brake. That's late, hot and hard on the pads. Change down before the descent, let the engine hold you back, and use the foot brake gently to trim the speed.",
  commonMistakes: [
    "Coasting in neutral downhill",
    "Holding the foot brake down the whole descent (overheats brakes)",
    "Staying in too high a gear so the engine can't hold you back",
    "Arriving at the bottom too fast for the junction",
  ],
  gsmTips: [
    "Change down BEFORE the hill",
    "Let the engine do the braking",
    "Foot brake = gentle, progressive",
    "Bigger gap downhill",
  ],
  keyTakeaway: "Gravity increases speed downhill — use a lower gear and gentle brake, never allow the hill to control the car.",
  durationMs: 12000,
  captions: [
    { at: 0, label: "Descent begins", detail: "Change down now — before the hill takes over." },
    { at: 0.35, label: "Speed climbing fast", detail: "Gravity is doing the work — you need to intervene." },
    { at: 0.5, label: "Decision point", detail: "What's the safest way to control your speed?" },
    { at: 0.75, label: "Gentle foot brake", detail: "Speed settles. Brake lights on to warn behind." },
  ],
  questions: [
    {
      at: 0.5,
      prompt: "You're descending a steep hill and your speed has climbed to 48 mph in a 40 zone. How should you control the car?",
      options: [
        { label: "Slam the brakes hard", explain: "No. Harsh braking downhill can lock the wheels or trigger ABS. Progressive is safer." },
        { label: "Change down a gear and use gentle foot brake", correct: true, explain: "Correct. A lower gear gives you engine braking. Add gentle foot brake to trim the speed — smooth and controlled." },
        { label: "Slip into neutral to save fuel", explain: "Never coast in neutral. You lose engine braking and control over the car." },
      ],
    },
  ],
  render: DownhillScene,
};

// ─────────────────────────────────────────────────────────────
// Lesson · Meeting Traffic (narrow with parked cars)
// ─────────────────────────────────────────────────────────────
function MeetingTrafficScene(t: number) {
  const roadY = 200;
  // Ego moves right, slows as it meets a narrow gap between parked cars and oncoming vehicle.
  const egoX = -20 + 480 * easeInOut(Math.min(1, t / 0.7));
  const oncomingX = 660 - 400 * easeInOut(Math.min(1, t / 0.7));
  // Meeting point around x=340. Gap between parked car edge (y=175) and centre.
  const meeting = Math.abs(egoX - oncomingX) < 60;
  const speed = 30 - 22 * (1 - Math.min(1, Math.abs(egoX - 340) / 180));
  const braking = t > 0.25 && t < 0.6;
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <Sky id="sky-mt" />
      <HorizontalRoad t={t} />
      {/* Parked cars on the left verge (top pavement) */}
      {[100, 190, 280].map((px) => (
        <g key={px} transform={`translate(${px} 178)`}>
          <rect x={-14} y={-8} width={28} height={16} rx={3} fill="#c8c8cc" stroke="#0a0a0a" strokeWidth={0.5} />
          <rect x={-8} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.7} />
          <rect x={3} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.5} />
        </g>
      ))}
      {/* Gap arrows between parked cars and centre line */}
      <line x1={egoX + 20} y1={186} x2={egoX + 20} y2={198} stroke={meeting ? "#ef4444" : "#f59e0b"} strokeWidth={1.5} strokeDasharray="3 2" />
      {/* Ego */}
      <Car2 x={egoX} y={roadY} color="#2f6bf0" braking={braking} />
      {/* Oncoming (heading west) */}
      <g transform={`translate(${oncomingX} ${roadY + 22}) scale(-1 1)`}>
        <Car2 x={0} y={0} color="#c8102e" braking={t > 0.35 && t < 0.55} />
      </g>
      <Hud
        label="AVAILABLE SPACE"
        value={meeting ? "1/4 metre · 7 mph" : Math.abs(egoX - 340) < 120 ? "1/2 metre · 15 mph" : "1 metre · 30 mph"}
        tone={meeting ? "warn" : "good"}
      />
    </svg>
  );
}

const meetingTraffic: Lesson = {
  slug: "meeting-traffic",
  title: "Meeting traffic on a narrow road",
  category: "Highway Code • Practical Driving Skills",
  rule: "Rules 163, 166",
  objective: "Learn how to judge available space against safe speed when meeting oncoming traffic past parked cars.",
  think: [
    "Whose side is the obstruction on — do I have priority?",
    "How much space is there between me and the parked cars?",
    "How much space between me and the oncoming vehicle?",
    "Do I need to wait, or is there enough room to filter through?",
    "Am I holding up somebody behind me by being over-cautious?",
  ],
  ruleHeadline: "Less space = less speed.",
  ruleBullets: [
    "1 metre of space → 30 mph is fine",
    "½ metre → drop to about 15 mph",
    "¼ metre → about 7 mph",
    "⅛ metre → 4 mph — walking pace",
    "If in doubt, stop and give way",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>The narrower the gap, the less time you have to react to an opening door, a child running out, or a wobble from the oncoming car. Speed is only safe if the gap can absorb a mistake — yours or theirs. <strong>Less space = less speed.</strong></p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>Any time parked cars, skips, works or a narrow lane squeeze the road — especially when another vehicle is coming the other way. If the obstruction is on <em>your</em> side, priority is <em>theirs</em>.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">How we do it — the steps</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Scan the row ahead — find the pinch point early.</li>
        <li>If the obstruction is on your side, be ready to give way.</li>
        <li>Match your speed to the SMALLEST gap you'll pass through.</li>
        <li>Watch the parked cars too — cover the brake for doors and pedestrians.</li>
        <li>Make eye contact with the oncoming driver — read their intent, don't guess.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "When you meet oncoming traffic past parked cars, look at the smallest gap — usually between you and the parked car — and match your speed to it. Big gap, keep flowing. Tiny gap, walking pace. And remember: if the obstruction is on your side, you give way. Simple.",
  commonMistakes: [
    "Squeezing through at full speed",
    "Assuming priority when the obstruction is on your side",
    "Stopping so far back you block the road unnecessarily",
    "Watching the oncoming car and forgetting the parked-car door",
  ],
  gsmTips: [
    "Look at the SMALLEST gap and match your speed",
    "Obstruction on your side → you give way",
    "Be ready for a door to open on the parked car",
    "Eye contact with the oncoming driver — read their intent",
  ],
  keyTakeaway: "Less space, less speed — the gap decides the mph, not the sign at the end of the road.",
  durationMs: 13000,
  captions: [
    { at: 0, label: "Approaching parked cars", detail: "Scan the row ahead — pick your smallest gap." },
    { at: 0.3, label: "Oncoming car approaching", detail: "You'll meet somewhere in the middle." },
    { at: 0.5, label: "Decision point", detail: "What's your safe speed?" },
    { at: 0.75, label: "Walking pace through the pinch", detail: "Space is tight — speed drops to match." },
  ],
  questions: [
    {
      at: 0.5,
      prompt: "You have about ¼ metre of clearance between you and both the parked cars and the oncoming vehicle. What speed is safe?",
      options: [
        { label: "The speed limit — 30 mph", explain: "No. Less space, less speed. 30 mph would leave you no time to react to a door opening." },
        { label: "Around 7 mph — walking pace", correct: true, explain: "Correct. A quarter-metre gap means around 7 mph — walking pace. Enough to react to a door, wobble or pedestrian." },
        { label: "Stop completely and wait", explain: "Not needed here — there IS a gap. Stopping unnecessarily blocks the flow. Filter through slowly." },
      ],
    },
  ],
  render: MeetingTrafficScene,
};

// ─────────────────────────────────────────────────────────────
// Lesson · Dual carriageway lane discipline
// ─────────────────────────────────────────────────────────────
function LaneDisciplineScene(t: number) {
  // Three-lane dual carriageway. Ego overtakes a slow lorry then returns left.
  // Lanes: y = 175 (right/lane 3), 205 (middle), 235 (left/lane 1)
  const laneY = t < 0.25 ? 235 : t < 0.45 ? 205 : t < 0.7 ? 205 : t < 0.9 ? 235 : 235;
  const egoX = -20 + 660 * t;
  const hazardX = 340;
  const hazardActive = t > 0.35 && t < 0.7;
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <Sky id="sky-ld" />
      <rect x={0} y={130} width={640} height={30} fill={GRASS} />
      <rect x={0} y={250} width={640} height={30} fill={GRASS} />
      {/* Road with 3 lanes */}
      <rect x={0} y={160} width={640} height={90} fill="#2b2b2e" />
      {[190, 220].map((y) => (
        <g key={y}>
          {Array.from({ length: 16 }).map((_, i) => (
            <rect key={i} x={i * 40 + ((t * 40) % 40) - 40} y={y - 1} width={20} height={2} fill={PAINT} />
          ))}
        </g>
      ))}
      <line x1={0} y1={160} x2={640} y2={160} stroke={PAINT} strokeWidth={1.5} />
      <line x1={0} y1={250} x2={640} y2={250} stroke={PAINT} strokeWidth={1.5} />
      {/* Slow lorry in left lane */}
      <g transform={`translate(${hazardX - 40 + t * 50} 235)`}>
        <rect x={-24} y={-10} width={48} height={20} rx={2} fill={hazardActive ? "#f59e0b" : "#c8c8cc"} stroke="#0a0a0a" strokeWidth={0.6} />
        <rect x={-24} y={-10} width={12} height={20} fill="#6b6b70" />
        {hazardActive && <circle cx={0} cy={0} r={30} fill="none" stroke="#f59e0b" strokeWidth={1.5} opacity={0.4}>
          <animate attributeName="r" values="24;34;24" dur="1.4s" repeatCount="indefinite" />
        </circle>}
      </g>
      {/* Ego */}
      <Car2 x={egoX} y={laneY} color="#2f6bf0" indicator={t > 0.2 && t < 0.28 ? "right" : t > 0.62 && t < 0.72 ? "left" : null} />
      <Hud label="LANE" value={laneY === 235 ? "Left — normal" : "Middle — overtaking"} tone={laneY === 235 ? "good" : "warn"} />
    </svg>
  );
}

const laneDiscipline: Lesson = {
  slug: "dual-carriageway-lane-discipline",
  title: "Dual carriageway lane discipline",
  category: "Highway Code • Motorways & Dual Carriageways",
  rule: "Rules 137, 264",
  objective: "Learn why the left lane is your normal driving lane — and how to overtake safely then return to it.",
  think: [
    "Which lane should I be in for normal cruising?",
    "Am I overtaking or just sitting in the middle lane out of habit?",
    "Is the lane to my left clear to return to?",
    "Have I signalled and checked my blind spot?",
    "Am I holding faster traffic up behind me?",
  ],
  ruleHeadline: "Keep left unless overtaking.",
  ruleBullets: [
    "The left lane is the normal driving lane — for every speed",
    "Middle and right lanes are for overtaking or avoiding hazards",
    "Return to the left lane as soon as it is safe to do so",
    "Never undertake — if a lane is slow, wait for a gap and change properly",
    "Mirror – Signal – Blind spot – Manoeuvre for every change",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>Middle-lane hogging is one of the biggest causes of frustration and dangerous overtaking on UK dual carriageways. The left lane is <strong>your lane</strong>, whatever your speed — the other lanes exist purely to overtake and return.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>All the time on a dual carriageway or motorway: default to the left. Move out only to overtake something slower, then move back once you've passed and there's a clear gap.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">How we do it — the steps</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Mirrors — check well before you move.</li>
        <li>Signal right in good time — don't drift silently across.</li>
        <li>Move out only when there's a clear, safe gap.</li>
        <li>Overtake decisively — no lingering alongside.</li>
        <li>Once you can see the whole car you've passed in your interior mirror, signal left and return to the left lane.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "See the lorry in the left lane? Mirror, signal, move out to overtake. Once you're clearly past — and only then — mirror, signal, blind spot, and back to the left. Don't camp in the middle. The middle lane belongs to the driver who's overtaking right now, not to you.",
  commonMistakes: [
    "Sitting in the middle lane out of habit",
    "Undertaking a slow middle-lane driver",
    "Returning to the left lane before clearly past",
    "Skipping the blind-spot check",
  ],
  gsmTips: [
    "Left lane is home",
    "Overtake → return → overtake → return",
    "Mirror, Signal, Blind spot, Manoeuvre",
    "Never undertake — change lane properly",
  ],
  keyTakeaway: "The left lane is your normal driving lane on every dual carriageway. Overtake when needed, then get back left.",
  durationMs: 14000,
  captions: [
    { at: 0, label: "Cruising in the left lane", detail: "Correct — your normal driving lane." },
    { at: 0.25, label: "Slow lorry ahead — plan to overtake", detail: "Mirror, signal, move out." },
    { at: 0.5, label: "Decision point", detail: "You're past the lorry — what next?" },
    { at: 0.75, label: "Return to the left lane", detail: "Mirror, signal, blind spot, back to home." },
  ],
  questions: [
    {
      at: 0.5,
      prompt: "You've overtaken a lorry and the left lane is now clear. What should you do?",
      options: [
        { label: "Stay in the middle lane in case of more slow traffic", explain: "No. That's middle-lane hogging — it holds up faster traffic and forces others to undertake." },
        { label: "Mirror, signal, blind spot, return to the left lane", correct: true, explain: "Correct. The left lane is your normal driving lane. Return to it as soon as it is safe." },
        { label: "Move to the right lane just in case", explain: "No — the right lane is for overtaking only. If you're not overtaking, get back left." },
      ],
    },
  ],
  render: LaneDisciplineScene,
};

// ─────────────────────────────────────────────────────────────
// Lesson · Lane merging (lane ends)
// ─────────────────────────────────────────────────────────────
function LaneMergeScene(t: number) {
  // Two lanes tapering to one on the right. Ego in the ending lane (top) merges left.
  const egoX = -20 + 620 * t;
  // Merging curve — after t=0.4 the ego drifts from y=185 (top lane) to y=215 (kept lane).
  const egoY = t < 0.4 ? 185 : t < 0.7 ? 185 + (215 - 185) * easeInOut((t - 0.4) / 0.3) : 215;
  // Other car steady in kept lane.
  const otherX = 40 + 500 * t;
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <Sky id="sky-lm" />
      <rect x={0} y={130} width={640} height={30} fill={GRASS} />
      <rect x={0} y={240} width={640} height={40} fill={GRASS} />
      {/* Kept lane full width */}
      <rect x={0} y={200} width={640} height={40} fill="#2b2b2e" />
      {/* Ending lane tapers to zero by x=500 */}
      <path d="M0 160 L500 200 L500 240 L0 200 Z" fill="#2b2b2e" />
      {/* Merge chevrons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <path key={i} d={`M${360 + i * 22} 178 l10 6 l-10 6`} stroke={PAINT} strokeWidth={1.6} fill="none" />
      ))}
      {/* Lane markings */}
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={i * 45 + ((t * 45) % 45) - 45} y={218} width={20} height={3} fill={PAINT} />
      ))}
      <Car2 x={egoX} y={egoY} color="#2f6bf0" indicator={t > 0.35 && t < 0.7 ? "left" : null} />
      <Car2 x={otherX} y={215} color="#8a8a8f" />
      <Hud label="MERGE PHASE" value={t < 0.35 ? "Mirror + Signal" : t < 0.7 ? "Position + Blind spot" : "Merged smoothly"} tone={t < 0.7 ? "warn" : "good"} />
    </svg>
  );
}

const laneMerging: Lesson = {
  slug: "lane-merging",
  title: "Lane merging",
  category: "Highway Code • Practical Driving Skills",
  rule: "Rules 134, 267",
  objective: "Learn how to merge smoothly when a lane ends — using Mirror, Signal, Position, Speed, Merge.",
  think: [
    "How far ahead does my lane end — do I have time?",
    "Who is beside me and behind me?",
    "Is there a gap I can move into safely?",
    "Am I forcing my way in, or being courteous?",
    "Do I need to slow down or speed up to match the gap?",
  ],
  ruleHeadline: "Mirror · Signal · Position · Speed · Merge.",
  ruleBullets: [
    "Start the process early — don't leave it to the last car length",
    "Signal in good time so others can plan around you",
    "Match the speed of the traffic you're merging into",
    "Blind-spot check before you move across",
    "Zip-merge — one from each lane, calmly and in turn",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>Most merge incidents come from one of two drivers: the one who leaves it too late, or the one who refuses to let anyone in. A smooth merge is a <strong>shared act</strong> — signal, match speed, take the gap. It keeps the traffic flowing for everyone behind you.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>Slip-road joins onto dual carriageways or motorways, lanes closing at roadworks, and any "merge in turn" signage. The rule is the same — early planning, matched speed, taking your turn cleanly.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">How we do it — the steps</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Look far ahead — spot the merge early, plan the gap.</li>
        <li>Mirrors — check the lane you're joining well before the point of no return.</li>
        <li>Signal in good time so the other driver can plan too.</li>
        <li>Match the speed of the traffic — do not join slower than the flow.</li>
        <li>Take the gap smoothly, thank the driver, then settle at a proper following distance.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "Watch what your indicator does — it tells everyone else what you're planning. Signal early, ease your speed to match the gap next to you, blind-spot check, and slide across. If the driver next to you is competitive, let them go — there's another gap right behind. Never fight for it.",
  commonMistakes: [
    "Leaving the merge until the last few metres",
    "Not signalling — surprising other drivers",
    "Fighting for a gap with a competitive driver",
    "Skipping the blind-spot check",
  ],
  gsmTips: [
    "Signal EARLY",
    "Match speed to the gap",
    "Zip: one from each lane",
    "Let competitive drivers go — the next gap is yours",
  ],
  keyTakeaway: "Mirror, Signal, Position, Speed, Merge — early, smooth and shared.",
  durationMs: 13000,
  captions: [
    { at: 0, label: "Lane ends ahead", detail: "Read the chevrons — plan the merge now." },
    { at: 0.35, label: "Signal on, matching speed", detail: "Give other drivers time to see and react." },
    { at: 0.5, label: "Decision point", detail: "Someone's beside you — what do you do?" },
    { at: 0.8, label: "Merged and settled", detail: "Signal off. Smooth is safe." },
  ],
  questions: [
    {
      at: 0.5,
      prompt: "As you signal to merge, a driver next to you accelerates to close the gap. What's the safest move?",
      options: [
        { label: "Force your way in — you signalled first", explain: "No. Fighting for the gap risks a side-swipe. Confrontation is never worth it." },
        { label: "Let them past and take the next gap", correct: true, explain: "Correct. Ease off, let the competitive driver go, and move into the gap behind them. Smooth beats stubborn." },
        { label: "Stop in the lane until they yield", explain: "No. Stopping in a live lane is dangerous — the driver behind won't expect it." },
      ],
    },
  ],
  render: LaneMergeScene,
};

// ─────────────────────────────────────────────────────────────
// Lesson · Keeping junctions clear (yellow box)
// ─────────────────────────────────────────────────────────────
function JunctionClearScene(t: number) {
  // Horizontal main road with a side road entering from below.
  // A queue of cars is stopped ahead of ego. Ego either blocks the junction or stops before it.
  const sideRoadX = 380;
  // Queue: three cars stopped just past the junction.
  const queueXs = [440, 490, 540];
  // Ego position depending on phase. Phase A (0..0.5): wrong — ego moves into box and stops there.
  // Phase B (0.5..1): correct — ego stops BEFORE the box after answering.
  let egoX: number;
  if (t < 0.5) {
    egoX = -20 + (395 - (-20)) * easeInOut(t / 0.5); // stops in the box at x=395
  } else {
    egoX = 340; // stopped before the yellow box
  }
  const side1Y = 380 - 260 * easeInOut(Math.min(1, (t - 0.6) / 0.35));
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <Sky id="sky-jc" />
      <HorizontalRoad t={t < 0.5 ? t : 0.5} />
      {/* Side road entering from below */}
      <rect x={sideRoadX - 30} y={240} width={60} height={120} fill="#2b2b2e" />
      <rect x={sideRoadX - 30} y={240} width={60} height={2} fill={PAINT} />
      {/* Yellow box junction */}
      <rect x={sideRoadX - 40} y={162} width={80} height={76} fill="none" stroke="#f5c518" strokeWidth={1.5} />
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1={sideRoadX - 40 + i * 10} y1={162} x2={sideRoadX - 40 + i * 10 + 20} y2={238} stroke="#f5c518" strokeWidth={1} opacity={0.7} />
      ))}
      {/* Queue */}
      {queueXs.map((qx) => <Car2 key={qx} x={qx} y={200} color="#8a8a8f" />)}
      {/* Ego */}
      <Car2 x={egoX} y={200} color="#2f6bf0" braking={t < 0.05 || (t > 0.4 && t < 0.55)} />
      {/* Side-road car */}
      <g transform={`translate(${sideRoadX} ${side1Y}) rotate(-90)`}>
        <Car2 x={0} y={0} color="#c8102e" />
      </g>
      <Hud
        label="JUNCTION"
        value={t < 0.5 ? "Blocked — X" : "Kept clear — ✓"}
        tone={t < 0.5 ? "bad" : "good"}
      />
    </svg>
  );
}

const keepingJunctionsClear: Lesson = {
  slug: "keeping-junctions-clear",
  title: "Keeping junctions clear",
  category: "Highway Code • Practical Driving Skills",
  rule: "Rule 174",
  objective: "Learn why you must never enter a junction — especially a yellow box — unless your exit is clear.",
  think: [
    "Where is my exit — is there room for my car to fully clear the junction?",
    "Is the traffic ahead stationary or still moving?",
    "If I stop in the box, who will I block?",
    "Am I tempted to 'creep' because I feel impatient?",
    "Would I want somebody to do this to me?",
  ],
  ruleHeadline: "Never enter a junction unless your exit is clear.",
  ruleBullets: [
    "Yellow box = only enter if you can clear it without stopping",
    "You may wait in the box only when turning right and blocked by oncoming traffic",
    "Stop BEFORE the junction, not inside it",
    "Keep side roads clear so others can flow",
    "Patience over impatience — every time",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>Blocking a junction seizes the whole road. One car sat in a yellow box can stop dozens of others — including emergency vehicles. What we do for others, they do for us: keeping junctions clear is how UK traffic actually flows.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>Every junction with a queue on the other side — yellow-box junctions, T-junctions, mini-roundabouts, staggered crossroads. If your exit isn't clear, you don't enter.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">How we do it — the steps</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Look at your <em>exit</em>, not just the light or the give-way.</li>
        <li>Ask: "Is there a full car's length of clear road for me on the other side?"</li>
        <li>If not, stop before the junction — even on a green light.</li>
        <li>Wait for the queue to move enough to fit you, then go.</li>
        <li>Never edge in "just to make progress" — you'll strand yourself in the box.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "Look at the space beyond the junction. If your car will fit there without stopping, go. If it won't — you wait. The yellow paint doesn't mean 'try hard' — it means 'don't enter unless you'll clear it'. Simple rule, huge difference to how the road works.",
  commonMistakes: [
    "Creeping into the box hoping traffic will move",
    "Blocking side-road drivers from emerging",
    "Assuming the box only applies at rush hour",
    "Following the car in front blindly into a stationary queue",
  ],
  gsmTips: [
    "See the exit before you enter",
    "Yellow box = clear exit or you wait",
    "Right-turn exception — waiting for oncoming is fine",
    "What we do for others, they do for us",
  ],
  keyTakeaway: "Only enter a junction — especially a yellow box — if your exit is completely clear.",
  durationMs: 14000,
  captions: [
    { at: 0, label: "Traffic queue ahead", detail: "The exit past the junction is blocked." },
    { at: 0.35, label: "Common mistake — moving in anyway", detail: "You've blocked the side road." },
    { at: 0.5, label: "Decision point", detail: "What should you have done?" },
    { at: 0.75, label: "Stopped before the box", detail: "Side-road car can now emerge — everyone flows." },
  ],
  questions: [
    {
      at: 0.5,
      prompt: "The traffic ahead is stationary past a yellow box junction. Should you enter?",
      options: [
        { label: "Yes — inch forward with the queue", explain: "No. If your car will end up stopped in the box, you'll block the side road. Never enter." },
        { label: "No — wait before the box until your exit is clear", correct: true, explain: "Correct. Yellow box means only enter if you can clear it. Waiting before the box keeps the side road open." },
        { label: "Only if you're turning right", explain: "Half right — you may WAIT in the box when turning right against oncoming traffic. But if the exit is blocked, you still stay out." },
      ],
    },
  ],
  render: JunctionClearScene,
};

// ─────────────────────────────────────────────────────────────
// Lesson · Open vs Closed junctions
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// Shared UK T-junction bits used by open + closed junction lessons
// ─────────────────────────────────────────────────────────────
function UkTJunctionBase({ children }: { children?: React.ReactNode }) {
  // Main road horizontal (2-way, drive-on-left), side road coming up from the
  // south (ego arm). Ego sits mid-side-road, looking north.
  return (
    <>
      {/* Verges */}
      <rect x={0} y={0} width={640} height={360} fill={GRASS} />
      {/* Main road */}
      <rect x={0} y={140} width={640} height={80} fill="#2b2b2e" />
      {/* Side road (ego arm) */}
      <rect x={280} y={220} width={80} height={140} fill="#2b2b2e" />
      {/* Main road edge lines */}
      <line x1={0} y1={140} x2={640} y2={140} stroke={PAINT} strokeWidth={1.5} />
      <line x1={0} y1={220} x2={280} y2={220} stroke={PAINT} strokeWidth={1.5} />
      <line x1={360} y1={220} x2={640} y2={220} stroke={PAINT} strokeWidth={1.5} />
      {/* Centre line on main road (broken white) */}
      {Array.from({ length: 20 }).map((_, i) => (
        <rect key={i} x={i * 32 + 4} y={179} width={16} height={3} fill={PAINT} />
      ))}
      {/* Side road centre line */}
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={319} y={230 + i * 22} width={3} height={12} fill={PAINT} />
      ))}
      {/* UK give-way (double-broken) line at mouth of side road */}
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={`gw1-${i}`} x={282 + i * 6.5} y={222} width={4} height={3} fill={PAINT} />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={`gw2-${i}`} x={282 + i * 6.5} y={228} width={4} height={3} fill={PAINT} />
      ))}
      {children}
    </>
  );
}

// UK style hedge — rounded, textured green.
function Hedge({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill="#2f5a26" />
      {Array.from({ length: Math.max(3, Math.floor(w / 10)) }).map((_, i) => (
        <circle key={i} cx={x + 6 + i * 10} cy={y + 4} r={5} fill="#3d6a2f" />
      ))}
      {Array.from({ length: Math.max(3, Math.floor(w / 10)) }).map((_, i) => (
        <circle key={`b${i}`} cx={x + 10 + i * 10} cy={y + h - 4} r={4} fill="#254a1c" opacity={0.7} />
      ))}
    </g>
  );
}

// Small UK terraced-style house block seen top-down.
function House({ x, y, w = 40, h = 44 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#8a5a3b" stroke="#3a2a1a" strokeWidth={0.6} />
      <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} fill="#a86b45" />
      <rect x={x + w / 2 - 4} y={y + h - 12} width={8} height={12} fill="#3a2a1a" />
    </g>
  );
}

// Compact top-down parked car (slightly duller than the ego car).
function ParkedCar({ x, y, color = "#6b6b70" }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-12} y={-7} width={24} height={14} rx={3} fill={color} stroke="#111" strokeWidth={0.5} />
      <rect x={-7} y={-5} width={4} height={10} rx={1} fill="#111" opacity={0.6} />
      <rect x={3} y={-5} width={4} height={10} rx={1} fill="#111" opacity={0.6} />
    </g>
  );
}

// Small tree canopy (top-down)
function Tree({ x, y, r = 12 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#274a1e" />
      <circle cx={x - r / 3} cy={y - r / 3} r={r * 0.55} fill="#3a6a2c" />
    </g>
  );
}

// Visibility cone — a triangle fanning from a point.
// color: red for blocked, green for clear.
function VisibilityCone({
  x,
  y,
  angle,
  spread = 45,
  length = 260,
  color,
  opacity = 0.28,
}: {
  x: number;
  y: number;
  angle: number; // 0 = east, 180 = west (degrees)
  spread?: number;
  length?: number;
  color: string;
  opacity?: number;
}) {
  const a1 = ((angle - spread / 2) * Math.PI) / 180;
  const a2 = ((angle + spread / 2) * Math.PI) / 180;
  const p1 = [x + Math.cos(a1) * length, y + Math.sin(a1) * length];
  const p2 = [x + Math.cos(a2) * length, y + Math.sin(a2) * length];
  return (
    <polygon
      points={`${x},${y} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`}
      fill={color}
      opacity={opacity}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Lesson · Closed junction
// ─────────────────────────────────────────────────────────────
function ClosedJunctionScene(t: number) {
  // Ego creeps up the side road from y=340 toward the give-way line at y=222.
  // Approach → stop at give-way → creep forward → then finally go.
  let egoY: number;
  let braking = false;
  if (t < 0.35) {
    egoY = 340 - (340 - 245) * easeInOut(t / 0.35);
    braking = t > 0.15;
  } else if (t < 0.55) {
    egoY = 245; // fully stopped at give-way
    braking = true;
  } else if (t < 0.82) {
    egoY = 245 - (245 - 215) * easeInOut((t - 0.55) / 0.27); // creep past hedges
    braking = true;
  } else {
    egoY = 215 - (t - 0.82) * 380; // go
  }

  // Sight-lines blocked by the tall hedges — draw red cones that visually
  // clip against the hedge blocks (kept short + narrow so it reads as blocked).
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <UkTJunctionBase />

      {/* Houses set back either side */}
      <House x={20} y={30} w={90} h={70} />
      <House x={140} y={40} w={80} h={60} />
      <House x={420} y={30} w={90} h={70} />
      <House x={540} y={40} w={80} h={60} />

      {/* Tall hedges either side of the side road entrance — the whole point */}
      <Hedge x={200} y={230} w={80} h={26} />
      <Hedge x={360} y={230} w={80} h={26} />
      <Hedge x={210} y={200} w={70} h={26} />
      <Hedge x={360} y={200} w={70} h={26} />

      {/* Trees */}
      <Tree x={240} y={110} />
      <Tree x={400} y={110} />
      <Tree x={140} y={280} r={10} />
      <Tree x={500} y={280} r={10} />

      {/* Parked cars along the main road both sides — killing the view */}
      <ParkedCar x={130} y={155} />
      <ParkedCar x={175} y={155} />
      <ParkedCar x={220} y={155} />
      <ParkedCar x={420} y={155} />
      <ParkedCar x={465} y={155} />
      <ParkedCar x={510} y={155} />
      <ParkedCar x={130} y={205} />
      <ParkedCar x={175} y={205} />
      <ParkedCar x={220} y={205} />
      <ParkedCar x={420} y={205} />
      <ParkedCar x={465} y={205} />
      <ParkedCar x={510} y={205} />

      {/* Fences / walls close to kerb */}
      <rect x={20} y={110} width={100} height={4} fill="#6b4a2a" />
      <rect x={520} y={110} width={100} height={4} fill="#6b4a2a" />

      {/* Red visibility cones — blocked view left + right from ego eye position */}
      <VisibilityCone x={320} y={egoY - 4} angle={180} spread={22} length={90} color="#dc2626" opacity={0.32} />
      <VisibilityCone x={320} y={egoY - 4} angle={0} spread={22} length={90} color="#dc2626" opacity={0.32} />

      {/* Solid red STOP line — a closed junction is a MUST-STOP junction */}
      <rect x={282} y={216} width={76} height={10} fill="#c8102e" opacity={0.95} />
      <text x={320} y={224} textAnchor="middle" fontSize={8} fill="#fff" fontWeight={900} fontFamily="sans-serif" letterSpacing={1.5}>
        STOP
      </text>

      {/* Ego */}
      <g transform={`translate(320 ${egoY}) rotate(-90)`}>
        <Car2 x={0} y={0} color="#2f6bf0" braking={braking} indicator={null} />
      </g>

      {/* Header labels */}
      <g>
        <rect x={12} y={12} width={210} height={54} rx={6} fill="#000" opacity={0.72} />
        <text x={22} y={30} fontSize={11} fill="#fca5a5" fontFamily="sans-serif" fontWeight={800}>CLOSED JUNCTION</text>
        <text x={22} y={46} fontSize={10} fill="#fff" fontFamily="sans-serif">Limited visibility</text>
        <text x={22} y={60} fontSize={10} fill="#fca5a5" fontFamily="sans-serif" fontWeight={800}>YOU MUST STOP</text>
      </g>

      <Hud
        label="PHASE"
        value={t < 0.35 ? "Approach — brake early" : t < 0.55 ? "MUST STOP at give-way" : t < 0.82 ? "Creep — eyes past the hedge" : "GO — safe gap found"}
        tone={t < 0.82 ? "warn" : "good"}
      />
    </svg>
  );
}

const closedJunction: Lesson = {
  slug: "closed-junction",
  title: "Closed junction — you MUST stop",
  category: "Highway Code • Junctions",
  rule: "Rules 170–171",
  objective:
    "Recognise a closed junction — where parked cars, hedges, walls or trees block your view — and understand that at a closed junction you MUST stop before you can decide anything.",
  think: [
    "What is blocking my view — parked cars, hedges, walls, trees?",
    "Can I see left AND right from the give-way line? If no — I must STOP.",
    "Where do my eyes clear the hedge line?",
    "Have I stopped fully — or am I already rolling?",
    "If a car came now, could I still stop?",
  ],
  ruleHeadline: "Closed junction — you MUST stop. No exceptions.",
  ruleBullets: [
    "Parked cars + hedges + fences = view is blocked — the junction is closed",
    "At a closed junction you MUST STOP fully — every time, no rolling",
    "Once stopped, creep forward inch by inch until your eyes clear the obstruction",
    "Look BOTH ways twice — vehicles, cyclists, motorbikes, pedestrians",
    "Only go when you know it is safe — never on hope",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>You cannot borrow the priority of a road you cannot see. The red cones in the diagram show exactly how much of the main road is hidden — cyclists, motorbikes and cars are all in those blind wedges, and they will arrive before you can react. A closed junction is the most common place a new driver has a serious collision, so we remove the guesswork: we stop.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>Every single time the view is blocked — parked cars either side, tall hedges, walls, fences, a bend, poor light, or a "STOP" sign / solid white line at the mouth. If you cannot see cleanly both ways from your seat, treat it as closed and stop.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">How we do it — the steps</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Approach in the correct gear, brakes covered, ready to stop.</li>
        <li>STOP fully at the give-way line — car still, handbrake if needed.</li>
        <li>Creep forward inch by inch until your EYES clear the hedge line.</li>
        <li>Look right — look left — look right again. Cyclists, motorbikes, pedestrians.</li>
        <li>Only when you have a genuine safe gap, ease off the clutch and go.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "Look at all the stuff in your way — parked cars, tall hedges, trees, garden fences right up to the kerb. From behind the give-way line you cannot see left, you cannot see right. That is a closed junction, and at a closed junction there is no maybe — you MUST STOP. Full stop, wheels still. Now, and only now, you creep forward — inch by inch — until your eyes get past the hedge. When you can see, you decide. When it is safe, you go.",
  commonMistakes: [
    "Rolling through the give-way line without a proper stop",
    "Creeping too far too fast — car nose into moving traffic",
    "Only looking one way (usually the way you're turning)",
    "Missing cyclists and motorbikes hidden behind parked cars",
    "Pulling out on hope because 'nothing was coming last time'",
  ],
  mistakes: [
    {
      wrong: "Rolling through the give-way line without a full stop.",
      why: "At a closed junction your eyes can't see past the hedge until the car has stopped — a rolling car commits you before you've seen anything.",
      right: "Come to a complete stop AT the line first, then creep forward slowly to a second stop where your eyes clear the view.",
    },
    {
      wrong: "Creeping out too far, too fast — the bonnet ends up in the main road.",
      why: "A fast creep uses road space you haven't checked yet. If a car is close, you can't retreat and you've forced them to brake.",
      right: "Creep in inches, not feet. Cover the brake. Move only as fast as your view is opening.",
    },
    {
      wrong: "Only looking the way you're turning (usually right).",
      why: "Cars come from BOTH directions on a two-way road. Cyclists and motorbikes on your left are the ones that get hit.",
      right: "Right → Left → Right again, every time. Two clean looks each way before you commit.",
    },
    {
      wrong: "Missing a bike hidden behind a parked car or a van.",
      why: "Bikes are narrow. A single glance past a parked van can hide a whole cyclist. Motorbikes appear from nowhere at 40mph.",
      right: "Move your head, not just your eyes. Look AROUND the blocker before you go — treat every gap as a possible bike.",
    },
    {
      wrong: "Pulling out on hope — 'nothing was coming last time'.",
      why: "Hope isn't observation. If you haven't SEEN the gap, it doesn't exist. Junction collisions come from assumed gaps, not real ones.",
      right: "One clear decision, on a gap you can actually see. If you're not sure — you wait.",
    },
  ],
  gsmTips: [
    "Closed junction = full stop, every time — no exceptions",
    "Your EYES need to see, not the front of your bonnet",
    "Two full looks each way — a cyclist can appear in the gap between them",
    "If in doubt, stay stopped — the queue behind can wait",
    "Roof of the car opposite? Perfect creep marker",
  ],
  keyTakeaway:
    "Closed junction — you MUST stop. Only after a full stop can you creep, look and go.",
  durationMs: 15000,
  captions: [
    { at: 0, label: "Approaching — this is a CLOSED junction", detail: "Parked cars both sides, tall hedges, houses close to the road." },
    { at: 0.35, label: "MUST STOP at the give-way line", detail: "Full stop — wheels still. No rolling into it." },
    { at: 0.55, label: "Creep — inch forward until you can see", detail: "Move only until your eyes get past the hedge line." },
    { at: 0.82, label: "GO — safe gap confirmed", detail: "Only now does the car move properly onto the main road." },
  ],
  questions: [
    {
      at: 0.55,
      prompt: "You've arrived at a closed junction — hedges and parked cars block your view. What must you do?",
      options: [
        { label: "Slow to a crawl and roll straight out", explain: "No. A closed junction means you MUST stop — a rolling entry is guessing with your car." },
        { label: "Come to a full STOP, then creep forward until your eyes clear the hedge, then go when safe", correct: true, explain: "Correct. Closed junction = full stop first. Then you creep, then you look, then you go." },
        { label: "Move over to the wrong side of the road to see better", explain: "Dangerous — you'd be blocking oncoming traffic and still not have priority." },
      ],
    },
  ],
  render: ClosedJunctionScene,
};

// ─────────────────────────────────────────────────────────────
// Lesson · Open junction
// ─────────────────────────────────────────────────────────────
function OpenJunctionScene(t: number) {
  // Ego glides up the side road — no need to stop, only to check + adjust speed.
  const egoY = 340 - easeInOut(Math.min(1, t / 0.8)) * (340 - 200);
  const braking = t < 0.55; // scrubbing speed on approach but not fully stopping
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <UkTJunctionBase />

      {/* Wide-open verges — houses set well back */}
      <House x={30} y={20} w={70} h={40} />
      <House x={540} y={20} w={70} h={40} />

      {/* Only very low hedges, well back from the kerb — clear sightlines */}
      <Hedge x={180} y={244} w={80} h={10} />
      <Hedge x={380} y={244} w={80} h={10} />

      {/* Occasional trees but nowhere near the junction mouth */}
      <Tree x={90} y={90} r={10} />
      <Tree x={560} y={90} r={10} />
      <Tree x={120} y={300} r={8} />
      <Tree x={520} y={300} r={8} />

      {/* Green visibility cones — sweeping unobstructed left + right */}
      <VisibilityCone x={320} y={egoY - 4} angle={180} spread={38} length={300} color="#16a34a" opacity={0.22} />
      <VisibilityCone x={320} y={egoY - 4} angle={0} spread={38} length={300} color="#16a34a" opacity={0.22} />

      {/* Ego */}
      <g transform={`translate(320 ${egoY}) rotate(-90)`}>
        <Car2 x={0} y={0} color="#2f6bf0" braking={braking} indicator={null} />
      </g>

      {/* Header labels */}
      <g>
        <rect x={12} y={12} width={210} height={54} rx={6} fill="#000" opacity={0.72} />
        <text x={22} y={30} fontSize={11} fill="#86efac" fontFamily="sans-serif" fontWeight={800}>OPEN JUNCTION</text>
        <text x={22} y={46} fontSize={10} fill="#fff" fontFamily="sans-serif">Visibility is open</text>
        <text x={22} y={60} fontSize={10} fill="#86efac" fontFamily="sans-serif" fontWeight={800}>Coast through if safe</text>
      </g>

      <Hud
        label="PHASE"
        value={t < 0.5 ? "Approach — look early both ways" : t < 0.85 ? "Visibility open — coast through" : "Emerging smoothly"}
        tone="good"
      />
    </svg>
  );
}

const openJunction: Lesson = {
  slug: "open-junction",
  title: "Open junction — coast through if the view is clear",
  category: "Highway Code • Junctions",
  rule: "Rules 170–171",
  objective:
    "Recognise an open junction — where the view is wide and unobstructed — and, as long as visibility stays open, coast smoothly through instead of stopping unnecessarily.",
  think: [
    "Can I truly see cleanly in BOTH directions well before the give-way line?",
    "Is the main road actually clear right now?",
    "Do I still need to slow down — or just adjust my speed?",
    "Am I still doing full mirror-signal-position checks?",
    "If the view suddenly closes (a van, a bend), am I ready to stop?",
  ],
  ruleHeadline: "Open junction — as long as visibility stays open, you can coast through.",
  ruleBullets: [
    "Open = no parked cars, no tall hedges — visibility is wide",
    "Look left and right well before the give-way line",
    "If the view stays open and the road is clear, coast through — no need to stop",
    "Adjust speed smoothly — don't slam brakes just because it's a junction",
    "Still give way to any traffic that has priority",
    "The moment visibility closes, treat it as a closed junction and stop",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>An open junction gives you back a big chunk of the main road with your eyes. The green cones show it — wide, unblocked, both ways. Stopping here for no reason wastes fuel, brakes and time and, worse, teaches you to freeze at every give-way line. If you can genuinely see, you have already done the work — you can coast through.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>Only when the view is properly open: no parked cars near the mouth, no tall hedges, no walls or bends hiding the main road, no rain or low sun killing your view. The moment any of those change — you're treating it as closed again.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">How we do it — the steps</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Read the junction early — parked cars? hedges? walls? Nothing? Good.</li>
        <li>Mirrors, signal, position — full routine, same as any junction.</li>
        <li>Look RIGHT and LEFT well before the give-way line, then look again.</li>
        <li>If visibility stays open and the road is clear, ease off — do not brake harshly — and coast through in the correct gear.</li>
        <li>If anything closes the view or a vehicle appears, stop at the line and treat it as a closed junction.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "This one's different — the view is wide open. No parked cars near the mouth, no big hedges, houses set well back. So I look early — right, left, right again — long before the line. And because I can genuinely see, and the road is clear, I don't need to stop. I ease off, stay smooth, and coast through in the right gear. The moment that view closes — a van pulls up, a bend hides the road — it stops being an open junction. Then I stop.",
  commonMistakes: [
    "Stopping unnecessarily and holding up traffic behind you",
    "Only looking once, right at the line — too late to coast safely",
    "Assuming 'open' means you don't have to give way",
    "Coasting through when the view has quietly closed (van, bend, rain)",
    "Not scanning far enough down the main road",
  ],
  mistakes: [
    {
      wrong: "Stopping dead at every give-way even when the view is wide open.",
      why: "Unnecessary stops break traffic flow, invite rear-end shunts and teach you to react instead of plan.",
      right: "Look far, look early. If the road is genuinely clear, keep coasting — smooth beats stopped.",
    },
    {
      wrong: "Looking once, right at the line — trying to decide at the last second.",
      why: "By the time you're at the line you've already run out of room to coast. Late looking becomes braking.",
      right: "Start scanning 5–6 car lengths before the give-way. Decide early — the line is where you act, not think.",
    },
    {
      wrong: "Treating 'open junction' as 'main road' and not giving way.",
      why: "Open only means you can SEE — it doesn't remove the priority. Traffic on the main road still comes first.",
      right: "You still give way. Coasting is only allowed when there's genuinely no one to give way to.",
    },
    {
      wrong: "Coasting through when the view has closed — parked van, bend, heavy rain.",
      why: "Conditions change. A junction that was open yesterday can be closed today. Coasting on habit is how it goes wrong.",
      right: "Re-read the view every time. The moment it closes — treat it as a closed junction and stop.",
    },
    {
      wrong: "Only scanning the near lane — missing the fast car in the far lane.",
      why: "A car 100m away at 50mph reaches you in about 4 seconds. If you only scanned 50m, you never saw them.",
      right: "Look as far as your eyes will stretch. If you can see the road bend or vanishing point, use it.",
    },
  ],
  gsmTips: [
    "Open visibility = you can coast through, no need to stop",
    "LOOK first, LINE second — decide early",
    "Two clean looks each way even when it seems clear",
    "Smooth throttle beats braking hard",
    "The moment the view closes — you stop",
  ],
  keyTakeaway:
    "Open junction, open view — coast through. Closed view — stop. The road decides.",
  durationMs: 14000,
  captions: [
    { at: 0, label: "Approaching an OPEN junction", detail: "Wide view, no parked cars, houses set well back." },
    { at: 0.35, label: "Look early — both ways, twice", detail: "Green cones — I can already see both directions." },
    { at: 0.7, label: "Visibility open — coast through", detail: "Main road is clear, adjust speed and continue smoothly." },
  ],
  questions: [
    {
      at: 0.5,
      prompt: "You approach an open junction. The view is genuinely wide and the main road is empty. Should you stop?",
      options: [
        { label: "Yes — every give-way means a full stop", explain: "No. Give-way means give priority, not always stop. With an open view and a clear road you can coast through." },
        { label: "No — as long as visibility stays open and the road is clear, coast through smoothly", correct: true, explain: "Correct. Open junction, open view, clear road = coast through. If the view closes, you stop." },
        { label: "No — accelerate through without looking", explain: "Never. Open doesn't mean skip the look. Look first, then coast." },
      ],
    },
  ],
  render: OpenJunctionScene,
};

// (Removed: replaced by the standalone closed-junction and open-junction lessons above.)

// ─────────────────────────────────────────────────────────────
// Lesson · Overtaking
// ─────────────────────────────────────────────────────────────
function OvertakingScene(t: number) {
  // UK left-hand traffic — ego + lead sit in the left (bottom) lane, overtake
  // moves briefly into the right (top) lane and then returns left.
  const roadY = 218;
  const leadSpeed = t < 0.5 ? 35 : 25;
  const leadX = 100 + t * (t < 0.5 ? 320 : 200);
  const shouldOvertake = t >= 0.5;
  const egoX = shouldOvertake ? leadX - 60 + (t - 0.5) * 400 : leadX - 40;
  const egoY = shouldOvertake && t > 0.65 && t < 0.9 ? 182 : 218;
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <Sky id="sky-ov" />
      <HorizontalRoad t={t} />
      {/* Speed limit sign */}
      <g transform="translate(80 90)">
        <circle r={22} fill="#fff" stroke="#c8102e" strokeWidth={5} />
        <text textAnchor="middle" y={7} fontSize={20} fontWeight={800} fill="#111" fontFamily="sans-serif">40</text>
      </g>
      <Car2 x={leadX} y={roadY} color="#8a8a8f" />
      <Car2 x={egoX} y={egoY} color="#2f6bf0" indicator={shouldOvertake && t > 0.55 && t < 0.7 ? "right" : shouldOvertake && t > 0.85 && t < 0.95 ? "left" : null} />
      <Hud
        label={t < 0.5 ? "LEAD 35 in 40" : "LEAD 25 in 40"}
        value={t < 0.5 ? "Stay behind" : t < 0.65 ? "Overtake if safe" : t < 0.9 ? "Overtaking…" : "Back to left"}
        tone={t < 0.5 ? "good" : "warn"}
      />
    </svg>
  );
}

const overtaking: Lesson = {
  slug: "overtaking",
  title: "Overtaking safely",
  category: "Highway Code • Practical Driving Skills",
  rule: "Rules 162–168",
  objective: "Learn when overtaking is necessary — and when it simply isn't worth the risk.",
  think: [
    "Do I actually NEED to overtake, or am I just impatient?",
    "Can I see far enough ahead to complete the manoeuvre?",
    "Is there a junction, bend, brow of a hill or crossing ahead?",
    "Is anyone about to overtake ME?",
    "Will I gain more than a few seconds?",
  ],
  ruleHeadline: "Overtake only when necessary AND safe.",
  ruleBullets: [
    "Never overtake just to reach the speed limit",
    "Only overtake if you can see the road is clear well ahead",
    "Never overtake near junctions, bends, brows, crossings or solid white lines",
    "Mirror – Signal – Manoeuvre — then a second mirror check before returning",
    "Return to the left as soon as you're clearly past",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>Most overtakes save you less than 30 seconds over an entire journey. The cost of getting one wrong is a head-on collision. Slightly slower traffic is <em>not</em> a reason to overtake — significantly slower traffic on a long, clear, legal stretch is.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>Only when it is necessary, legal and safe: a clearly slower vehicle, a long clear view ahead, no solid white lines, no bends, brows, junctions, crossings or oncoming traffic within the overtake and its recovery.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">How we do it — the steps</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Ask: do I actually NEED to overtake, or am I just impatient?</li>
        <li>Position back a little — improve your view past the vehicle in front.</li>
        <li>Mirrors, signal, look — commit only when the view is <em>fully</em> clear.</li>
        <li>Overtake briskly using the power you have — no lingering alongside.</li>
        <li>See the whole car in your interior mirror, signal left, return smoothly to the left.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "Ask yourself two questions: is it necessary, and is it safe? If either answer is no, stay behind. Someone doing 35 in a 40 — leave them be. Someone doing 25 with a mile of clear straight road ahead? Mirror, signal, blind spot, overtake, and get back left. It's a decision, not a reflex.",
  commonMistakes: [
    "Overtaking just to reach the speed limit",
    "Overtaking near a junction or bend",
    "Not checking the blind spot before pulling out",
    "Returning to the left before clearly past",
  ],
  gsmTips: [
    "Necessary AND safe — both boxes ticked",
    "See the whole overtake before you start it",
    "Mirror → Signal → Blind spot → Overtake → Mirror → Return",
    "Never overtake on a solid white line",
  ],
  keyTakeaway: "Overtake only when it is both necessary and safe — the speed limit is not a reason on its own.",
  durationMs: 14000,
  captions: [
    { at: 0, label: "Lead car doing 35 in a 40", detail: "Slightly under the limit — no reason to overtake." },
    { at: 0.35, label: "Stay behind, keep the gap", detail: "Necessary? No." },
    { at: 0.5, label: "New scenario — lead now doing 25", detail: "Now it may be worth overtaking, IF safe." },
    { at: 0.75, label: "Mirror, signal, blind spot, overtake", detail: "Clear view, clear road — commit." },
    { at: 0.9, label: "Back to the left lane", detail: "Overtake complete, mirror, signal, return." },
  ],
  questions: [
    {
      at: 0.5,
      prompt: "You've been following a car doing 35 mph in a 40 mph zone for a mile. Should you overtake?",
      options: [
        { label: "Yes — the limit is 40 so you're entitled to it", explain: "No. The limit is a maximum, not a target. Overtaking to gain 5 mph rarely justifies the risk." },
        { label: "No — the speed difference is too small", correct: true, explain: "Correct. Overtake only when it is both necessary AND safe. A 5 mph gain isn't necessary." },
        { label: "Yes if the road is clear — always take the chance", explain: "Safe road alone isn't enough. Overtakes must also be necessary — this one isn't." },
      ],
    },
  ],
  render: OvertakingScene,
};

// ─────────────────────────────────────────────────────────────
// Lesson · Blind spots
// ─────────────────────────────────────────────────────────────
function BlindSpotScene(t: number) {
  const roadY = 200;
  const egoX = 320;
  // Other car slides forward through the blind spot region and out.
  const otherX = -20 + 660 * t;
  const inBlindSpot = otherX > 270 && otherX < 370;
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <Sky id="sky-bs" />
      <HorizontalRoad t={t} />
      {/* Blind spot cones on the ego car (top view). Two wedges behind the doors on each side. */}
      <g transform={`translate(${egoX} ${roadY})`}>
        {/* Left blind spot */}
        <path d="M -10 -6 L -60 -22 L -60 4 Z" fill="#ef4444" opacity={0.28} />
        <path d="M -10 6 L -60 22 L -60 -4 Z" fill="#ef4444" opacity={0.28} />
      </g>
      <Car2 x={egoX} y={roadY} color="#2f6bf0" />
      <Car2 x={otherX} y={roadY - 30} color="#c8102e" />
      {/* Highlight blind-spot moment */}
      {inBlindSpot && (
        <circle cx={otherX} cy={roadY - 30} r={22} fill="none" stroke="#ef4444" strokeWidth={2}>
          <animate attributeName="r" values="18;26;18" dur="1s" repeatCount="indefinite" />
        </circle>
      )}
      <Hud
        label="OTHER VEHICLE POSITION"
        value={otherX < 270 ? "Behind — visible in mirror" : inBlindSpot ? "IN BLIND SPOT" : "Ahead — visible"}
        tone={inBlindSpot ? "bad" : "good"}
      />
    </svg>
  );
}

const blindSpots: Lesson = {
  slug: "blind-spots",
  title: "Blind spots",
  category: "Highway Code • Practical Driving Skills",
  rule: "Rule 161",
  objective: "Learn where your blind spots are, why sitting alongside another vehicle is dangerous, and how to move out of them.",
  think: [
    "Where are the vehicles around me right now?",
    "Is one of them just outside my mirror view?",
    "Am I sitting alongside another vehicle unnecessarily?",
    "Would a quick shoulder check confirm what my mirrors can't?",
    "Should I ease forward or drop back to clear their blind spot too?",
  ],
  ruleHeadline: "Never sit alongside — move ahead or drop back.",
  ruleBullets: [
    "Mirrors don't show everything — always shoulder-check before changing lane",
    "Sitting alongside a lorry or bus is especially dangerous — their blind spots are huge",
    "Move ahead or drop back so each vehicle can see the other",
    "Assume you're in someone's blind spot until you know you're not",
    "Clear your blind spot before assuming another driver has cleared theirs",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>Every car has areas the mirrors don't show — behind the door pillars, over the shoulder. A cyclist, motorbike or car sitting there is <strong>invisible</strong> to you. Whoever changes lane first without a shoulder check is the one who causes the collision.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>Before <em>every</em> lane change, pull-away, merge, overtake, and before opening the door when parked. Especially on dual carriageways, at slip-roads and around cyclists.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">How we do it — the steps</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Mirrors first — interior, then the door mirror for the side you're moving.</li>
        <li>Signal in good time to warn others of your intent.</li>
        <li>Quick shoulder check on the moving side — that's your blind-spot look.</li>
        <li>Only when the mirror AND the shoulder check are clean, move smoothly.</li>
        <li>Never rely on the other driver seeing you — always assume you're invisible in theirs too.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "Look at that red circle — that's where your mirrors don't reach. If you have to change lane and there's someone lurking in that zone, mirrors will tell you it's clear when it isn't. That's why you always add a quick shoulder check. And don't camp alongside another vehicle — pick a position where you can see them and they can see you.",
  commonMistakes: [
    "Trusting mirrors alone before a lane change",
    "Sitting in a lorry driver's blind spot next to their cab",
    "Cruising alongside another car for miles",
    "Doing a shoulder check so late you take your eyes off the front",
  ],
  gsmTips: [
    "Mirror + shoulder check — every lane change",
    "Never sit alongside — ahead or behind",
    "Assume you're invisible until proven otherwise",
    "Lorry blind spots are HUGE — stay out of them",
  ],
  keyTakeaway: "Blind spots are where mirrors don't reach — check over your shoulder, never sit alongside.",
  durationMs: 12000,
  captions: [
    { at: 0, label: "Other vehicle behind — visible in mirror", detail: "Everything's fine." },
    { at: 0.4, label: "Vehicle now in your blind spot", detail: "Mirror shows nothing — but they're there." },
    { at: 0.5, label: "Decision point", detail: "You need to change lane. Now what?" },
    { at: 0.8, label: "Cleared — ahead of you", detail: "Now visible again. Shoulder-check before any move." },
  ],
  questions: [
    {
      at: 0.5,
      prompt: "You want to change lane. Your mirrors show the lane beside you is clear. Is it safe to move?",
      options: [
        { label: "Yes — the mirrors are clear", explain: "No. Mirrors have blind spots. A car could be exactly there and you'd never see it." },
        { label: "Only after a quick shoulder check confirms the blind spot", correct: true, explain: "Correct. Mirror + shoulder check. If both are clear, then move." },
        { label: "Move slowly across — they'll get out of the way", explain: "Absolutely not. If they're there and you drift into them, it's your fault and their nightmare." },
      ],
    },
  ],
  render: BlindSpotScene,
};

// ─────────────────────────────────────────────────────────────
// Lesson · Stretch your vision (15-70-15)
// ─────────────────────────────────────────────────────────────
function StretchVisionScene(t: number) {
  // Driver-eye view: dashboard at the bottom, windscreen occupies most of frame.
  // Highlight the three scan zones sequentially: 15% high, 70% middle, 15% low.
  const phase = Math.floor((t * 3) % 3); // 0 = high, 1 = middle, 2 = low
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <defs>
        <linearGradient id="sky-sv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a5a80" />
          <stop offset="1" stopColor="#1a1a1c" />
        </linearGradient>
      </defs>
      <rect width={640} height={360} fill="url(#sky-sv)" />
      {/* Distant road */}
      <polygon points="280,180 360,180 500,300 140,300" fill="#2b2b2e" />
      {/* Centre lane markings receding */}
      {[0, 1, 2, 3].map((i) => {
        const y = 210 + i * 25;
        const w = 4 + i * 3;
        return <rect key={i} x={320 - w / 2} y={y} width={w} height={6} fill={PAINT} />;
      })}
      {/* Traffic light in distance */}
      <rect x={310} y={130} width={16} height={30} fill="#111" />
      <circle cx={318} cy={140} r={3} fill="#ef4444" />
      {/* Distant sign */}
      <rect x={420} y={140} width={30} height={20} fill="#c8102e" />
      <text x={435} y={155} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff" fontFamily="sans-serif">30</text>
      {/* Road markings on tarmac */}
      <text x={320} y={295} textAnchor="middle" fontSize={9} fill={PAINT} fontFamily="sans-serif">SLOW</text>
      {/* Dashboard */}
      <rect x={0} y={300} width={640} height={60} fill="#0a0a0a" />
      <rect x={280} y={310} width={80} height={40} rx={4} fill="#141416" stroke="#3a3a3d" strokeWidth={1} />
      <text x={320} y={335} textAnchor="middle" fontSize={16} fontWeight={700} fill="#f5f5f0" fontFamily="sans-serif">30</text>
      {/* Zone highlights */}
      <rect x={0} y={0} width={640} height={54} fill="#f5c518" opacity={phase === 0 ? 0.18 : 0.03} />
      <rect x={0} y={54} width={640} height={216} fill="#22c55e" opacity={phase === 1 ? 0.14 : 0.03} />
      <rect x={0} y={270} width={640} height={30} fill="#2f6bf0" opacity={phase === 2 ? 0.18 : 0.03} />
      {/* Labels */}
      <text x={20} y={24} fontSize={12} fontWeight={700} fill="#f5c518" fontFamily="sans-serif">15% — HIGH · signs, lights, distant hazards</text>
      <text x={20} y={160} fontSize={12} fontWeight={700} fill="#22c55e" fontFamily="sans-serif">70% — AHEAD · traffic flow & developing hazards</text>
      <text x={20} y={288} fontSize={12} fontWeight={700} fill="#7dbaff" fontFamily="sans-serif">15% — LOW · markings & area near the bonnet</text>
    </svg>
  );
}

const stretchVision: Lesson = {
  slug: "stretch-your-vision",
  title: "Stretch your vision · GSM 15–70–15",
  category: "Highway Code • GSM Driving Method",
  rule: "Rules 146, 154",
  objective: "Learn the GSM 15–70–15 scanning method — how to distribute your attention so you're never surprised.",
  think: [
    "Am I looking as far ahead as I can?",
    "Have I checked high — signs, lights, developing hazards?",
    "Am I tracking the main flow of traffic well ahead?",
    "Have I checked low — markings, kerb, area near my bonnet?",
    "Am I 'chasing the bonnet' or actually reading the road?",
  ],
  ruleHeadline: "Don't chase the bonnet — stretch your vision.",
  ruleBullets: [
    "15% high — signs, traffic lights, brows, developing hazards",
    "70% ahead — traffic flow, gaps, junctions, big picture",
    "15% low — road markings, lane info, area immediately in front",
    "Move your eyes constantly — don't fix on one spot",
    "The further you see, the smoother you drive",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>Drivers who stare just over the bonnet are always <em>reacting</em>. Drivers who stretch their vision are always <em>planning</em>. The eyes lead the car — look further, drive smoother, brake less, save fuel, stay calmer.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>Constantly — town, country and dual carriageway. Especially on approach to junctions, roundabouts, bends, brows and traffic queues. If your eyes are close to the car, your reaction time already is too.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">How we do it — the steps</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Lift your eyes to the furthest point you can see down the road.</li>
        <li>Scan back towards the car in a natural sweep — near, mid, far, mirrors.</li>
        <li>Read brake lights, indicators and body language of drivers well ahead.</li>
        <li>Ask "what's changing?" before it changes — position, gear, gap.</li>
        <li>If you're braking hard, your eyes were too close — stretch them further next time.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "Fifteen percent up top — the traffic lights, the signs, the big picture. Seventy percent right in the middle of the road well ahead — that's where the story is. And fifteen percent low, close to the bonnet — markings, kerb, that stuff. Keep those eyes moving. If you stare at one spot, you'll be surprised. If you scan, you'll be ready.",
  commonMistakes: [
    "Fixating on the car in front (chasing the bonnet)",
    "Missing signs and traffic lights because your gaze is too low",
    "Not scanning low enough to spot cyclists at the kerb",
    "Locking eyes on one hazard and losing the wider picture",
  ],
  mistakes: [
    {
      wrong: "Staring at the bonnet of the car in front — 'chasing the bonnet'.",
      why: "You react to their brake lights instead of the road. You brake late, follow too close and miss everything happening 100m ahead.",
      right: "Look THROUGH and OVER the car in front. Use their windows if you can. Your eyes should live where they'll be in 8 seconds, not now.",
    },
    {
      wrong: "Never lifting your gaze to signs and traffic lights.",
      why: "You get surprised by red lights, missed turns and speed limits. Late information means late braking or a missed exit.",
      right: "15% of your scan goes HIGH. Read every sign and light before you're under it — plan the phase, plan the lane.",
    },
    {
      wrong: "Never dropping your gaze to the kerb and lane markings.",
      why: "Cyclists sit at the kerb. Speed humps, wet paint and drain covers live low. Miss them and you swerve at the last second.",
      right: "15% goes LOW. Sweep the kerb, the give-way lines, the paint. Once per scan, then eyes back up and forward.",
    },
    {
      wrong: "Locking eyes on one hazard — a cyclist, a bus, a pedestrian — until they're gone.",
      why: "Tunnel vision means everything else moves without you seeing it. The next hazard is already forming while you stare at the last one.",
      right: "Note the hazard, keep the eyes moving. Come back to it — don't camp on it.",
    },
  ],
  gsmTips: [
    "15% high, 70% ahead, 15% low",
    "Eyes moving, not staring",
    "Look FAR — plan, don't react",
    "Don't chase the bonnet",
  ],
  keyTakeaway: "Stretch your vision using GSM 15–70–15 — look high, look far, look low, keep moving.",
  durationMs: 12000,
  captions: [
    { at: 0, label: "15% HIGH — signs and lights", detail: "Scan the top of the scene first." },
    { at: 0.33, label: "70% AHEAD — the big picture", detail: "Most of your attention lives here." },
    { at: 0.5, label: "Decision point", detail: "Where should the majority of your attention be?" },
    { at: 0.66, label: "15% LOW — markings and kerb", detail: "Sweep low to complete the pattern." },
  ],
  questions: [
    {
      at: 0.5,
      prompt: "Using the GSM 15–70–15 method, where should the majority of your attention be while driving?",
      options: [
        { label: "Right over the bonnet", explain: "No. That's exactly what 'chasing the bonnet' means — you'll always be reacting late." },
        { label: "Well ahead — around 70% of your scan", correct: true, explain: "Correct. 70% of your attention belongs well ahead, reading traffic flow. 15% high for signs and lights, 15% low for markings and kerb." },
        { label: "Split evenly across the mirrors", explain: "Mirrors matter, but they're not the majority of your scan — the road ahead is." },
      ],
    },
  ],
  render: StretchVisionScene,
};

// ─────────────────────────────────────────────────────────────
// Lesson · Plan to Stop, Look to Go
// ─────────────────────────────────────────────────────────────
function PlanStopLookGoScene(t: number) {
  // Approach to a T-junction. Ego decelerates, observes, decides, proceeds.
  const roadY = 235;
  const junctionY = 160;
  // Ego on vertical side road approaching main road (heading north = up).
  const startY = 340;
  const stopY = 200;
  const egoY = t < 0.6 ? startY - (startY - stopY) * easeInOut(t / 0.6) : t < 0.75 ? stopY : stopY - (t - 0.75) * 400;
  const egoX = t < 0.75 ? 200 : 200 + (t - 0.75) * 500;
  const heading = t < 0.75 ? 0 : 90 * easeInOut((t - 0.75) / 0.25);
  const phase = t < 0.35 ? "SLOW" : t < 0.55 ? "OBSERVE" : t < 0.7 ? "DECIDE" : "PROCEED";
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <Sky id="sky-ps" />
      {/* Grass */}
      <rect x={0} y={0} width={640} height={360} fill={GRASS} />
      {/* Main road horizontal */}
      <rect x={0} y={200} width={640} height={60} fill="#2b2b2e" />
      <line x1={0} y1={202} x2={640} y2={202} stroke={PAINT} strokeWidth={1.4} />
      <line x1={0} y1={258} x2={640} y2={258} stroke={PAINT} strokeWidth={1.4} />
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={i * 40 + ((t * 40) % 40) - 40} y={228} width={20} height={4} fill={PAINT} />
      ))}
      {/* Side road vertical */}
      <rect x={170} y={260} width={60} height={100} fill="#2b2b2e" />
      {/* Give-way triangles */}
      <polygon points="170,262 230,262 200,278" fill={PAINT} />
      {/* Passing traffic on main road */}
      <Car2 x={80 + t * 800} y={roadY} color="#8a8a8f" />
      {/* Ego (rotated to heading) */}
      <g transform={`translate(${egoX} ${egoY}) rotate(${heading - 90})`}>
        <Car2 x={0} y={0} color="#2f6bf0" braking={t < 0.55} />
      </g>
      <Hud
        label="PHASE"
        value={`${phase} — plan to stop, look to go`}
        tone={phase === "PROCEED" ? "good" : "warn"}
      />
    </svg>
  );
}

const planStopLookGo: Lesson = {
  slug: "plan-to-stop-look-to-go",
  title: "Plan to stop — look to go",
  category: "Highway Code • GSM Driving Method",
  rule: "Rules 170–171",
  objective: "Learn the GSM approach routine at every junction: Slow, Observe, See, Decide, Proceed.",
  think: [
    "Am I slowing early enough to have time to observe?",
    "What do I actually see — traffic, gaps, pedestrians?",
    "Have I made a clear decision, or am I creeping on hope?",
    "If I proceed, is there room to complete the move without stopping again?",
    "Would a passenger describe my approach as calm and smooth?",
  ],
  ruleHeadline: "Approach every junction as if you'll stop — then decide whether to go.",
  ruleBullets: [
    "SLOW — early and progressively, off the accelerator first",
    "OBSERVE — mirrors, both directions, pedestrians, cyclists",
    "SEE — actually process what you're looking at, don't just glance",
    "DECIDE — go or wait, one clear call",
    "PROCEED — smoothly, with the right gear, no hesitation",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>Half of all junction incidents come from a driver who was going too fast to actually observe — or who observed but never decided. <strong>Plan to Stop</strong> buys you the time to see. <strong>Look to Go</strong> turns that seeing into a clean decision.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>Every give-way, T-junction, mini-roundabout, unmarked crossroad and blind emerge. If the view is closed, you stop. If the view is open, you still plan as if you might stop — then let the road decide.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">How we do it — the steps</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li><strong>Plan</strong> — mirrors, signal, position, gear, brakes covered.</li>
        <li><strong>Stop</strong> — arrive slowly enough that stopping is easy, not a rescue.</li>
        <li><strong>Look</strong> — right, left, right again. Blockers, gap, opportunity (BGL).</li>
        <li><strong>Go</strong> — only when the gap is genuine, not on hope.</li>
        <li>If anything changes mid-look — a cyclist, a fast car, a closing van — re-stop and start again.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "You approach every junction ready to stop. That gives you time to observe properly — right, left, right again. You see what's coming. You decide. And then you proceed — smoothly, confidently, in the right gear. Slow, Observe, See, Decide, Proceed. Say it out loud on your next lesson. It becomes second nature.",
  commonMistakes: [
    "Approaching too fast to observe properly",
    "Looking without seeing — a glance is not a check",
    "Creeping out on hope instead of a clear decision",
    "Stopping unnecessarily at open junctions",
  ],
  mistakes: [
    {
      wrong: "Arriving at the junction still doing 25mph.",
      why: "You've given yourself no time to observe. You'll either brake hard at the line or roll out on hope.",
      right: "Off the gas early, let the car slow itself, cover the brake. Arrive slow enough that stopping is easy.",
    },
    {
      wrong: "A quick glance either way — 'looking' without actually seeing.",
      why: "Your eyes moved, but your brain didn't process. That's why drivers say 'I looked but I didn't see them'.",
      right: "Two clean looks each way. Say out loud what you see — 'red car, gap, cyclist'. Naming forces seeing.",
    },
    {
      wrong: "Creeping out because the driver behind is impatient.",
      why: "Their impatience isn't your problem — a collision is. You commit to gaps that don't exist.",
      right: "Ignore the pressure behind. Make one clear decision on the actual road, not the mirror.",
    },
    {
      wrong: "Stopping at an open junction that plainly doesn't need it.",
      why: "Unnecessary stops break flow, confuse other drivers and encourage rear-end shunts.",
      right: "Open view + clear road = coast through. Plan to stop — but only stop if the road tells you to.",
    },
  ],
  gsmTips: [
    "SLOW · OBSERVE · SEE · DECIDE · PROCEED",
    "Plan to stop — then decide whether to go",
    "Right → Left → Right again",
    "One decision, one clean move",
  ],
  keyTakeaway: "Plan to stop, look to go — every junction, every time.",
  durationMs: 15000,
  captions: [
    { at: 0, label: "SLOW — off the accelerator", detail: "Ease your speed on approach." },
    { at: 0.35, label: "OBSERVE — right, left, right", detail: "Actively scan both directions." },
    { at: 0.5, label: "Decision point", detail: "What's the correct order?" },
    { at: 0.65, label: "DECIDE — one clear call", detail: "Go or wait — but decide." },
    { at: 0.85, label: "PROCEED — smoothly", detail: "Move off cleanly in the right gear." },
  ],
  questions: [
    {
      at: 0.5,
      prompt: "In the GSM approach routine, what is the correct order at a junction?",
      options: [
        { label: "See · Slow · Decide · Proceed", explain: "You have to slow first — otherwise you don't have time to see or decide." },
        { label: "Slow · Observe · See · Decide · Proceed", correct: true, explain: "Correct. Slow first, then observe, see what's there, decide, and only then proceed." },
        { label: "Proceed · Observe · Correct", explain: "Definitely not — proceeding before observing is how junction collisions happen." },
      ],
    },
  ],
  render: PlanStopLookGoScene,
};

// ─────────────────────────────────────────────────────────────
// Lesson · Roundabouts (turning right — 3rd exit)
// ─────────────────────────────────────────────────────────────
// PLAN → STOP → LOOK → GO strip shown across the roundabout scene.
function FormulaStrip({ t }: { t: number }) {
  const steps = [
    { key: "PLAN", from: 0.0, to: 0.15 },
    { key: "STOP", from: 0.15, to: 0.32 },
    { key: "LOOK", from: 0.32, to: 0.72 },
    { key: "GO", from: 0.72, to: 1.0 },
  ];
  const activeIdx = steps.findIndex((s) => t >= s.from && t < s.to);
  const w = 118;
  const gap = 10;
  const totalW = steps.length * w + (steps.length - 1) * gap;
  const startX = (640 - totalW) / 2;
  return (
    <g transform="translate(0 8)">
      {steps.map((s, i) => {
        const active = i === activeIdx;
        const x = startX + i * (w + gap);
        return (
          <g key={s.key} transform={`translate(${x} 0)`}>
            <rect
              width={w}
              height={26}
              rx={13}
              fill={active ? "#f59e0b" : "#000"}
              opacity={active ? 0.95 : 0.55}
              stroke={active ? "#fff" : "transparent"}
              strokeWidth={active ? 1 : 0}
            />
            <text
              x={w / 2}
              y={17}
              textAnchor="middle"
              fontSize={12}
              fontWeight={800}
              fill={active ? "#1a1a1c" : "#fff"}
              fontFamily="sans-serif"
              letterSpacing={2}
            >
              {s.key}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// BGL sub-strip active during the LOOK phase — Blockers → Gap → Look for opportunity.
function BGLStrip({ t }: { t: number }) {
  const steps: { letter: string; label: string; from: number; to: number }[] = [
    { letter: "B", label: "Blockers — cyclist · van · bus · bike · horse", from: 0.0, to: 0.4 },
    { letter: "G", label: "Gap — is there a safe gap?", from: 0.4, to: 0.7 },
    { letter: "L", label: "Look — safe? legal? can I go?", from: 0.7, to: 1.0 },
  ];
  const activeIdx = steps.findIndex((s) => t >= s.from && t < s.to);
  const active = steps[Math.max(0, activeIdx)];
  return (
    <g transform="translate(0 322)">
      <rect x={90} y={0} width={460} height={30} rx={15} fill="#000" opacity={0.75} />
      <circle cx={112} cy={15} r={11} fill="#22c55e" />
      <text x={112} y={19} textAnchor="middle" fontSize={13} fontWeight={800} fill="#0a0a0a" fontFamily="sans-serif">
        {active.letter}
      </text>
      <text x={132} y={19} fontSize={11} fill="#fff" fontFamily="sans-serif">
        {active.label}
      </text>
    </g>
  );
}

function RoundaboutScene(t: number) {
  // top-level scene begins
  // Top-down 4-arm roundabout. Ego enters from south (6 o'clock),
  // turning right → exits west (9 o'clock). Signals right on approach,
  // gives way to traffic from the right, joins, signals left before exit.
  const cx = 320;
  const cy = 180;
  const rOuter = 78;
  const rInner = 34;
  const rPath = 56; // radius of ego's driving line around the island

  // Traffic from the right (from east arm) circulating — has priority.
  // It passes across the ego's entry between t=0.15 and t=0.32.
  const otherAngle = -Math.PI * 0.05 + t * Math.PI * 1.8; // sweeps around
  const otherX = cx + Math.cos(otherAngle) * rPath;
  const otherY = cy + Math.sin(otherAngle) * rPath;
  const otherHeading = (otherAngle * 180) / Math.PI + 90;

  // Ego phases:
  //  0.00–0.20  approach south arm, signal right, brake
  //  0.20–0.32  wait at give-way line (traffic from right passing)
  //  0.32–0.75  circulate anticlockwise from 6 o'clock → 9 o'clock (right turn)
  //  0.75–1.00  exit west, cancel signal, accelerate away
  let egoX = cx;
  let egoY = 0;
  let heading = -90; // pointing north on approach
  let braking = false;
  let indicator: "left" | "right" | null = null;

  if (t < 0.2) {
    const k = t / 0.2;
    egoY = 340 - (340 - (cy + rPath + 8)) * easeInOut(k);
    heading = -90;
    braking = true;
    indicator = "right";
  } else if (t < 0.32) {
    egoY = cy + rPath + 8;
    heading = -90;
    braking = true;
    indicator = "right";
  } else if (t < 0.75) {
    // Circulate from angle π/2 (south, 6 o'clock) round to π (west, 9 o'clock)
    // Anticlockwise for a right turn in UK → angle decreases from π/2 through 0, -π/2, to -π? No.
    // UK roundabouts are clockwise (traffic flows clockwise viewed top-down).
    // Entering from south heading north, right-turn exit is west.
    // Clockwise means: south → west → north → east.
    // So angle sweeps from π/2 (bottom) → π (left) via increasing angle? Let's use:
    // start angle a0 = Math.PI/2 (bottom), end angle a1 = Math.PI (left) going clockwise
    // In screen coords y-down, clockwise on-screen = angle increasing.
    const k = (t - 0.32) / 0.43;
    const a = Math.PI / 2 + easeInOut(k) * (Math.PI / 2); // π/2 → π
    egoX = cx + Math.cos(a) * rPath;
    egoY = cy + Math.sin(a) * rPath;
    heading = (a * 180) / Math.PI + 90; // tangent
    indicator = k > 0.55 ? "left" : "right"; // signal left before exit
  } else {
    const k = (t - 0.75) / 0.25;
    egoX = cx - rPath - (rPath + 40) * k;
    egoY = cy;
    heading = 180;
    indicator = null;
  }

  const phase =
    t < 0.2
      ? "APPROACH · signal right"
      : t < 0.32
      ? "GIVE WAY · traffic from right"
      : t < 0.6
      ? "CIRCULATE · stay in lane"
      : t < 0.75
      ? "SIGNAL LEFT before exit"
      : "EXIT · cancel signal";

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <Sky id="sky-rb" />
      <rect x={0} y={0} width={640} height={360} fill={GRASS} />
      {/* Four arms of the roundabout */}
      {/* south arm */}
      <rect x={cx - 40} y={cy + rInner} width={80} height={200} fill="#2b2b2e" />
      {/* north arm */}
      <rect x={cx - 40} y={0} width={80} height={cy - rInner} fill="#2b2b2e" />
      {/* east arm */}
      <rect x={cx + rInner} y={cy - 40} width={640} height={80} fill="#2b2b2e" />
      {/* west arm */}
      <rect x={0} y={cy - 40} width={cx - rInner} height={80} fill="#2b2b2e" />
      {/* Roundabout ring */}
      <circle cx={cx} cy={cy} r={rOuter} fill="#2b2b2e" />
      {/* Central island (grass) */}
      <circle cx={cx} cy={cy} r={rInner} fill={GRASS} stroke={PAINT} strokeWidth={1.2} />
      {/* Lane divider on the ring */}
      <circle cx={cx} cy={cy} r={(rOuter + rInner) / 2} fill="none" stroke={PAINT} strokeWidth={1} strokeDasharray="4 6" opacity={0.6} />
      {/* Give-way dashed lines at each entry */}
      {/* south entry */}
      <line x1={cx - 40} y1={cy + rOuter + 2} x2={cx + 40} y2={cy + rOuter + 2} stroke={PAINT} strokeWidth={2} strokeDasharray="6 4" />
      {/* west entry */}
      <line x1={cx - rOuter - 2} y1={cy - 40} x2={cx - rOuter - 2} y2={cy + 40} stroke={PAINT} strokeWidth={2} strokeDasharray="6 4" />
      {/* east entry */}
      <line x1={cx + rOuter + 2} y1={cy - 40} x2={cx + rOuter + 2} y2={cy + 40} stroke={PAINT} strokeWidth={2} strokeDasharray="6 4" />
      {/* north entry */}
      <line x1={cx - 40} y1={cy - rOuter - 2} x2={cx + 40} y2={cy - rOuter - 2} stroke={PAINT} strokeWidth={2} strokeDasharray="6 4" />
      {/* Centre lines on arms */}
      <line x1={cx} y1={cy + rOuter + 6} x2={cx} y2={360} stroke={PAINT} strokeWidth={1} strokeDasharray="8 8" />
      <line x1={cx} y1={0} x2={cx} y2={cy - rOuter - 6} stroke={PAINT} strokeWidth={1} strokeDasharray="8 8" />
      <line x1={cx + rOuter + 6} y1={cy} x2={640} y2={cy} stroke={PAINT} strokeWidth={1} strokeDasharray="8 8" />
      <line x1={0} y1={cy} x2={cx - rOuter - 6} y2={cy} stroke={PAINT} strokeWidth={1} strokeDasharray="8 8" />

      {/* Direction arrows on the ring (clockwise) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + t * 0.5;
        const ax = cx + Math.cos(a) * ((rOuter + rInner) / 2);
        const ay = cy + Math.sin(a) * ((rOuter + rInner) / 2);
        const rot = (a * 180) / Math.PI + 90;
        return (
          <g key={i} transform={`translate(${ax} ${ay}) rotate(${rot})`} opacity={0.55}>
            <polygon points="0,-4 3,3 -3,3" fill={PAINT} />
          </g>
        );
      })}

      {/* Other car circulating (priority from the right) */}
      <g transform={`translate(${otherX} ${otherY}) rotate(${otherHeading})`}>
        <Car2 x={0} y={0} color="#c8102e" />
      </g>

      {/* Ego car */}
      <g transform={`translate(${egoX} ${egoY}) rotate(${heading + 90})`}>
        <Car2 x={0} y={0} color="#2f6bf0" braking={braking} indicator={indicator} />
      </g>

      {/* Exit labels */}
      <text x={cx} y={30} textAnchor="middle" fontSize={10} fill="#fff" opacity={0.7} fontFamily="sans-serif">2nd exit — straight on</text>
      <text x={20} y={cy - 46} fontSize={10} fill="#fff" opacity={0.85} fontFamily="sans-serif">3rd exit — your exit</text>
      <text x={620} y={cy - 46} textAnchor="end" fontSize={10} fill="#fff" opacity={0.7} fontFamily="sans-serif">1st exit — left</text>

      <Hud label="PHASE" value={phase} tone={t < 0.32 ? "warn" : t > 0.75 ? "good" : "info"} />

      {/* GSM formula strip — PLAN → STOP → LOOK → GO */}
      <FormulaStrip t={t} />

      {/* BGL overlay when LOOK is active */}
      {t >= 0.2 && t < 0.6 && <BGLStrip t={(t - 0.2) / 0.4} />}
    </svg>
  );
}

const roundabouts: Lesson = {
  slug: "roundabouts",
  title: "Roundabouts — look to go",
  category: "Highway Code • Junctions",
  rule: "Rules 184–190",
  objective:
    "Learn the GSM roundabout routine: signal right for a right exit, give way to traffic from the right, circulate in lane, then signal left before your exit.",
  think: [
    "Which exit do I want — and which lane does it need?",
    "What signal do I need on approach, and when do I cancel it?",
    "Is there traffic already on the roundabout from my right?",
    "Am I looking through the roundabout, not just at it?",
    "When will I signal left to tell everyone I'm leaving?",
  ],
  ruleHeadline: "Give way to traffic from your right. Right exit = signal right, then signal left before you leave.",
  ruleBullets: [
    "PLAN — mirrors, signal, correct lane, brake early",
    "STOP — only if you have to; give way to traffic from your right",
    "LOOK — use BGL: Blockers, Gap, Look for opportunity",
    "GO — commit smoothly once safe, legal and clear",
    "Right exit (past 12 o'clock) = signal right, right lane",
    "Signal LEFT as you pass the exit before yours",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>Roundabouts fail for two reasons: drivers don't <strong>signal</strong> their intentions, and they don't look far enough <strong>right</strong> to spot priority traffic. Clear signals + proper right-look = every other driver can plan around you safely.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>Every roundabout — mini, standard, or large multi-lane. The formula never changes: <strong>Plan → Stop → Look → Go</strong>, using <strong>BGL</strong> (Blockers, Gap, Look for opportunity) at the give-way.</p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">How we do it — the steps</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li><strong>Plan</strong> — mirrors, signal (right for right exit, none for straight ahead, left for left), correct lane, correct gear.</li>
        <li><strong>Stop</strong> — arrive slow enough that stopping is easy at the give-way line.</li>
        <li><strong>Look</strong> — hard right. BGL: what's <em>blocking</em> my view, where's the <em>gap</em>, look for <em>opportunity</em>.</li>
        <li><strong>Go</strong> — take a genuine gap; never bully your way in.</li>
        <li>Signal <strong>left</strong> as you pass the exit before yours so the driver waiting can move.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "Right exit — past twelve o'clock — you signal right on approach and stay in the right lane. As you go round, look for the exit before yours. When you pass it, that's your cue — signal left. That left signal tells the driver waiting on the next arm you're coming off. It keeps the whole roundabout flowing. Give way to your right, signal your intentions, and look through the roundabout, not at it.",
  commonMistakes: [
    "No signal on approach — nobody knows what you're doing",
    "Forgetting to signal left before your exit",
    "Stopping at the give-way line when the roundabout is clear",
    "Straight on but sitting in the right lane (or vice versa)",
    "Looking at the roundabout instead of through it to your exit",
  ],
  gsmTips: [
    "PLAN · STOP · LOOK · GO — every roundabout, every time",
    "LOOK = BGL — Blockers, Gap, Look for opportunity",
    "Past 12 o'clock = signal right on approach",
    "Signal left as you pass the exit before yours",
    "Look through the roundabout, not at it",
  ],
  keyTakeaway:
    "Right exit: signal right, give way to the right, signal left before leaving — every roundabout, every time.",
  durationMs: 16000,
  captions: [
    { at: 0, label: "APPROACH — signal right", detail: "Right exit needs a right signal on approach." },
    { at: 0.22, label: "GIVE WAY — traffic from the right", detail: "The red car has priority. Wait for a safe gap." },
    { at: 0.4, label: "CIRCULATE — stay in lane", detail: "Right lane all the way round." },
    { at: 0.5, label: "Decision point", detail: "When exactly do you switch from right to left signal?" },
    { at: 0.62, label: "SIGNAL LEFT before your exit", detail: "As you pass the exit before yours, change to a left signal." },
    { at: 0.8, label: "EXIT — cancel signal", detail: "Smooth exit, mirrors, back up to a safe cruise speed." },
  ],
  questions: [
    {
      at: 0.5,
      prompt: "You're taking the 3rd exit at a 4-arm roundabout (a right turn). When should you switch from a right signal to a left signal?",
      options: [
        {
          label: "Right as you enter the roundabout",
          explain: "Too early — a left signal on entry tells the driver on your right you're taking the first exit. You'll confuse them.",
        },
        {
          label: "As you pass the exit before yours",
          correct: true,
          explain: "Correct. Once you're past the exit before yours, change to a left signal so the driver on the next arm knows you're leaving.",
        },
        {
          label: "Only after you've left the roundabout",
          explain: "Too late — nobody on the roundabout or waiting at your exit knows you're coming off.",
        },
      ],
    },
  ],
  render: RoundaboutScene,
};

export const drivingLessons: Lesson[] = [
  speedAdjustment,
  twoSecondRule,
  zebraCrossing,
  goingUphill,
  goingDownhill,
  meetingTraffic,
  laneDiscipline,
  laneMerging,
  keepingJunctionsClear,
  closedJunction,
  openJunction,
  overtaking,
  blindSpots,
  stretchVision,
  planStopLookGo,
  roundabouts,
];

export function getLesson(slug: string): Lesson | undefined {
  return drivingLessons.find((l) => l.slug === slug);
}