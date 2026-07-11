import type { Lesson } from "@/components/driving-clips/LessonShell";

// ─────────────────────────────────────────────────────────────
// Bus Awareness & Bus Lane Signs
// Two-phase scene:
//  A (0–0.55): a bus is stationary on the left with hazards.
//              15-70-15 funnel scan reads a bus-lane sign with
//              operating times.
//  B (0.55–1): plan and execute the overtake using BGO logic.
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

function Car({ cx, cy, angle = 0, color = "#2f6bf0", indicator, brake }: any) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
      <rect x={-14} y={-7} width={28} height={14} rx={3} fill={color} stroke="#0a0a0a" strokeWidth={0.8} />
      <rect x={-8} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.7} />
      <rect x={3} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.55} />
      {brake && (
        <>
          <rect x={-15.5} y={-5} width={1.4} height={2} fill="#ff2b2b" />
          <rect x={-15.5} y={3} width={1.4} height={2} fill="#ff2b2b" />
        </>
      )}
      {indicator === "right" && (
        <circle cx={-14} cy={-5} r={1.4} fill="#ffb020">
          <animate attributeName="opacity" values="1;0.15;1" dur="0.5s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

function BusStationary({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <rect x={-34} y={-12} width={68} height={24} rx={3} fill="#c8102e" stroke="#0a0a0a" strokeWidth={0.9} />
      {[-26, -18, -10, -2, 6, 14, 22].map((x, i) => (
        <rect key={i} x={x} y={-10} width={6} height={20} rx={1} fill="#111" opacity={0.6} />
      ))}
      {/* Hazard lights */}
      <circle cx={-32} cy={-12} r={1.8} fill="#ffb020">
        <animate attributeName="opacity" values="1;0.15;1" dur="0.6s" repeatCount="indefinite" />
      </circle>
      <circle cx={32} cy={-12} r={1.8} fill="#ffb020">
        <animate attributeName="opacity" values="1;0.15;1" dur="0.6s" repeatCount="indefinite" />
      </circle>
      <circle cx={-32} cy={12} r={1.8} fill="#ffb020">
        <animate attributeName="opacity" values="1;0.15;1" dur="0.6s" repeatCount="indefinite" />
      </circle>
      <circle cx={32} cy={12} r={1.8} fill="#ffb020">
        <animate attributeName="opacity" values="1;0.15;1" dur="0.6s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

function BusLaneSign({ cx, cy, highlight }: { cx: number; cy: number; highlight?: boolean }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {/* Main blue bus-lane sign */}
      <rect x={-32} y={-40} width={64} height={44} rx={4} fill="#1e5aa8" stroke="#fff" strokeWidth={1.4} />
      <text x={0} y={-24} textAnchor="middle" fontSize={8} fill="#fff" fontWeight={800} fontFamily="sans-serif">
        BUS LANE
      </text>
      {/* Simple bus icon */}
      <rect x={-14} y={-18} width={28} height={12} rx={2} fill="#fff" />
      <rect x={-11} y={-16} width={5} height={8} rx={1} fill="#1e5aa8" />
      <rect x={-4} y={-16} width={5} height={8} rx={1} fill="#1e5aa8" />
      <rect x={3} y={-16} width={5} height={8} rx={1} fill="#1e5aa8" />
      {/* Supplementary time plate BELOW main sign */}
      <g>
        <rect x={-34} y={6} width={68} height={22} fill="#fff" stroke="#0a0a0a" strokeWidth={1} />
        <text x={0} y={17} textAnchor="middle" fontSize={7} fontWeight={800} fill="#0a0a0a" fontFamily="sans-serif">
          Mon–Fri
        </text>
        <text x={0} y={25} textAnchor="middle" fontSize={8} fontWeight={800} fill="#0a0a0a" fontFamily="sans-serif">
          7–10 am · 4–7 pm
        </text>
      </g>
      {/* Pole */}
      <rect x={-1} y={28} width={2} height={40} fill="#8b8f95" />
      {highlight && (
        <rect x={-38} y={-46} width={76} height={82} fill="none" stroke={ACCENT} strokeWidth={2}>
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
}

function BusAwarenessScene(t: number) {
  // Phase A: approach + scanning (0–0.55)
  // Phase B: overtake (0.55–1)
  const roadY = 218;
  const busX = 410;
  const busY = 218;

  let egoX: number, egoY: number;
  if (t < 0.35) {
    // early approach — plenty of distance
    const k = t / 0.35;
    egoX = 30 + easeInOut(k) * 240;
    egoY = roadY;
  } else if (t < 0.55) {
    // ease speed
    const k = (t - 0.35) / 0.2;
    egoX = 270 + easeInOut(k) * 50;
    egoY = roadY;
  } else if (t < 0.85) {
    // overtake past bus with wide clearance
    const k = (t - 0.55) / 0.3;
    egoX = 320 + easeInOut(k) * 180;
    egoY = roadY - easeInOut(k) * 34;
  } else {
    const k = (t - 0.85) / 0.15;
    egoX = 500 + easeInOut(k) * 100;
    egoY = 184 + easeInOut(k) * 34;
  }

  // 15-70-15 funnel visualisation (shown during phase A)
  const scanning = t > 0.1 && t < 0.55;

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <defs>
        <linearGradient id="sky-ba" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
      </defs>
      <rect width={640} height={360} fill="url(#sky-ba)" />
      <rect x={0} y={130} width={640} height={30} fill={GRASS} />
      <rect x={0} y={240} width={640} height={40} fill={GRASS} />
      <rect x={0} y={160} width={640} height={80} fill={ROAD} />
      <line x1={0} y1={162} x2={640} y2={162} stroke={PAINT} strokeWidth={1.5} />
      <line x1={0} y1={238} x2={640} y2={238} stroke={PAINT} strokeWidth={1.5} />
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={i * 40 + ((t * 40) % 40) - 40} y={198} width={20} height={4} fill={PAINT} />
      ))}

      {/* Bus-lane sign on the verge (with time plate) */}
      <BusLaneSign cx={200} cy={110} highlight={scanning && t < 0.35} />

      {/* Bus stopped on left, hazards on */}
      <BusStationary cx={busX} cy={busY} />
      {t < 0.55 && (
        <g transform={`translate(${busX} ${busY - 38})`}>
          <rect x={-40} y={-14} width={80} height={20} rx={4} fill={HAZARD} opacity={0.9} />
          <text textAnchor="middle" y={0} fontSize={9} fontWeight={800} fill="#fff" fontFamily="sans-serif">
            HAZARDS ON
          </text>
        </g>
      )}

      {/* 15-70-15 funnel scan overlay */}
      {scanning && (
        <g opacity={0.85}>
          {/* Up (15%) */}
          <path d={`M ${egoX} ${egoY - 6} L 200 118 L 260 118 Z`} fill={ACCENT} opacity={0.14} stroke={ACCENT} strokeWidth={1} strokeDasharray="3 3" />
          <text x={180} y={100} fontSize={9} fill={ACCENT} fontWeight={700} fontFamily="sans-serif">
            15% up · scan signs
          </text>
          {/* Ahead (70%) */}
          <path d={`M ${egoX} ${egoY - 6} L ${egoX + 200} ${egoY - 24} L ${egoX + 200} ${egoY + 22} L ${egoX} ${egoY + 6} Z`} fill="#e6e6e0" opacity={0.06} />
          <text x={egoX + 40} y={egoY - 22} fontSize={9} fill="#e6e6e0" fontWeight={700} fontFamily="sans-serif">
            70% ahead
          </text>
          {/* Down (15%) */}
          <text x={egoX + 40} y={egoY + 32} fontSize={9} fill="#9ca3af" fontWeight={700} fontFamily="sans-serif">
            15% down · markings
          </text>
        </g>
      )}

      {/* Ego */}
      <Car cx={egoX} cy={egoY} indicator={t > 0.5 && t < 0.85 ? "right" : undefined} brake={t > 0.35 && t < 0.55} />

      {/* HUD */}
      <g transform="translate(16 16)">
        <rect width={360} height={44} rx={6} fill="#000" opacity={0.62} />
        <text x={10} y={16} fontSize={9} fill={ACCENT} fontWeight={800} letterSpacing="1.5" fontFamily="sans-serif">
          BUS AWARENESS · 15–70–15
        </text>
        <text x={10} y={34} fontSize={11} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
          {t < 0.35 && "Scan up for bus-lane signs — time plate says 7–10 & 4–7"}
          {t >= 0.35 && t < 0.55 && "Bus stopped with hazards — plan overtake early"}
          {t >= 0.55 && t < 0.85 && "Wide clearance, steady speed — no swerve, no rush"}
          {t >= 0.85 && "Clear — smoothly back to the left"}
        </text>
      </g>

      <g transform="translate(470 16)">
        <rect width={154} height={44} rx={6} fill="#000" opacity={0.55} />
        <text x={12} y={16} fontSize={9} fill="#9ca3af" letterSpacing="1.5" fontFamily="sans-serif">
          FUNNEL
        </text>
        <text x={12} y={34} fontSize={11} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
          15 up · 70 ahead · 15 down
        </text>
      </g>
    </svg>
  );
}

export const busAwareness: Lesson = {
  slug: "bus-awareness",
  title: "Bus awareness & bus-lane signs",
  category: "Driving Strategies • GSM Method",
  rule: "Rules 141, 223",
  objective:
    "Read bus-lane signs correctly by scanning upwards for supplementary time plates, judge whether a bus with hazard lights is genuinely stationary, plan overtakes early, and never assume other drivers will give way just because they should.",
  think: [
    "What are the operating times on the supplementary plate under this bus-lane sign?",
    "Is that bus MOVING or STATIONARY (hazards on = usually stopped)?",
    "Is anyone about to get off / cross in front of the bus?",
    "Is that other driver actually GIVING WAY, or just slowing down?",
    "Am I scanning 15% up (signs) / 70% ahead / 15% down (markings)?",
  ],
  ruleHeadline: "Scan up. Plan the overtake early. Only trust give-way when you see it happen.",
  ruleBullets: [
    "Use 15–70–15 funnel vision: 15% up, 70% ahead, 15% down",
    "Bus with hazards on = usually stationary or has a problem — treat as a hazard",
    "Never assume: a slowing car might be giving way, or might just be turning",
    "Read bus-lane time plates BEFORE the lane starts — do NOT drift into a live bus lane",
    "Watch for pedestrians appearing from IN FRONT of the bus",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">15–70–15 funnel vision</p>
      <p>
        On a busy urban road, most learners look straight ahead only. That misses everything
        above (signs, traffic-light heads, low branches, bus-lane time plates) and everything
        below (road markings, arrows, potholes, kerbs). GSM's funnel splits your attention:
        <strong> 15% up, 70% ahead, 15% down.</strong>
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Bus hazard lights</p>
      <p>
        Hazard lights on a bus almost always mean it is stationary or has a mechanical problem.
        Assume you'll be passing it. Plan the overtake early, get behind it in the right position,
        and check for passengers stepping out — especially in front of the bus, where they'll be
        invisible right up to the last moment.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Are they actually giving way?</p>
      <p>
        A slowing car might be giving way — or it might just be turning off. Judge speed, tyre
        angle and indicator direction together. Only commit when you see the vehicle actually
        stop or clearly begin to give way — not just because you think they should.
      </p>
    </>
  ),
  georgeExplains:
    "Two things go together on this one. First, the funnel — 15 up, 70 ahead, 15 down. Sounds obvious, but most learners lock onto the road right in front and miss the bus-lane time plate. Read the plate — 7 to 10, 4 to 7 — that's when the lane is live. Second, buses with hazards on. Nine times out of ten it's stationary. Plan the overtake early, leave space, and watch for someone stepping out from in front. And never — never — assume another driver is giving way. Wait until you SEE them stop.",
  commonMistakes: [
    "Missing the supplementary time plate under a bus-lane sign",
    "Drifting into a bus lane during operating hours",
    "Sitting behind a bus with hazards on, waiting for it to move",
    "Assuming a slowing car is giving way when they're actually turning",
    "Not looking IN FRONT of a stopped bus for pedestrians",
  ],
  gsmTips: [
    "Say to yourself: '15 up, 70 ahead, 15 down' on every approach",
    "Hazard lights = plan overtake, don't queue behind",
    "Read every bus-lane time plate before you commit to the lane",
    "'Are they giving way?' — wait until you SEE it, don't guess",
    "Pedestrians step out from IN FRONT of a bus — never behind it",
  ],
  keyTakeaway:
    "Use 15–70–15 funnel scanning. Treat a bus with hazards on as stationary and plan the overtake early. Never assume another driver is giving way until you see them stop.",
  durationMs: 18000,
  captions: [
    { at: 0.08, label: "15% up", detail: "Scan the bus-lane sign and its time plate: 7–10 & 4–7." },
    { at: 0.35, label: "Hazard lights on the bus", detail: "Assume stationary — plan the overtake." },
    { at: 0.6, label: "Overtake with clearance", detail: "Wide margin, steady speed, indicator on." },
    { at: 0.9, label: "Back to the left", detail: "Return smoothly to your lane." },
  ],
  questions: [
    {
      at: 0.22,
      prompt: "You see a blue BUS LANE sign with a small white plate beneath it showing '7–10am · 4–7pm'. What does the plate tell you?",
      options: [
        {
          label: "The bus lane is only for buses between those times.",
          correct: true,
          explain: "Correct. The supplementary plate gives operating hours. Outside those times you may use the lane normally.",
        },
        {
          label: "Buses only stop there between those times.",
          explain: "No — the plate refers to bus-lane operating times, not bus stop times.",
        },
        {
          label: "The lane is closed to all traffic between those times.",
          explain: "No — the lane is a BUS LANE during those hours (bikes and taxis too if shown). Only general traffic is restricted.",
        },
      ],
    },
    {
      at: 0.5,
      prompt: "There's a bus stopped ahead with hazard lights flashing. An oncoming car appears to be slowing. What's the safest read?",
      options: [
        {
          label: "They're giving way — commit to the overtake now.",
          explain: "No. Slowing could be giving way, or could be turning off. Wait until you actually SEE them give way.",
        },
        {
          label: "Wait until you see them stop, then commit smoothly.",
          correct: true,
          explain: "Correct. Never assume — verify. When the oncoming vehicle has clearly stopped or is far enough away, commit.",
        },
        {
          label: "Beep the horn to confirm.",
          explain: "No — the horn is not a communication tool for priority. Use observation.",
        },
      ],
    },
  ],
  render: BusAwarenessScene,
};