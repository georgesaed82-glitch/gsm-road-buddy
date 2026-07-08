import type { Lesson } from "@/components/driving-clips/LessonShell";

// ─────────────────────────────────────────────────────────────
// Meeting in Small Spaces
// A narrow residential street with parked cars on both sides.
// The animation plays end-to-end so the learner sees the ENTIRE
// manoeuvre — approach, decision, half-in/half-out, meeting,
// mirror check, move back out, continue. A single decision-point
// question fires BEFORE the driver commits to the waiting position:
//
//   Phase A (0.00–0.20) — Approach and SCAN. Spot narrowing + oncoming.
//   ▶ Q1 at 0.20 — "Where should you wait?" (decision point)
//   Phase B (0.20–0.42) — Slow, indicate, ease half-in / half-out.
//   Phase C (0.42–0.66) — Hold position. Red car passes through.
//   Phase D (0.66–0.82) — Mirror + shoulder check, ease back into lane.
//   Phase E (0.82–1.00) — Continue with 1 m clearance from parked doors.
// ─────────────────────────────────────────────────────────────

const PAINT = "#f5f5f0";
const ROAD = "#2b2b2e";
const KERB = "#8b8f95";
const GRASS = "#3d6a2f";
const ACCENT = "#C97845";
const GOOD = "#22c55e";
const WARN = "#f59e0b";
const BAD = "#ef4444";

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

type Parked = { x: number; side: "top" | "bottom"; color: string };

// Parked vehicles narrow the road. A deliberate gap on the top side
// at x=270..330 creates the "half in / half out" waiting bay.
const PARKED: Parked[] = [
  { x: 60,  side: "bottom", color: "#7a8896" },
  { x: 130, side: "bottom", color: "#8a8f95" },
  { x: 210, side: "bottom", color: "#6d7a86" },
  { x: 300, side: "bottom", color: "#8a8f95" },
  { x: 400, side: "bottom", color: "#7a8896" },
  { x: 500, side: "bottom", color: "#8a8f95" },
  { x: 585, side: "bottom", color: "#6d7a86" },

  { x: 80,  side: "top",    color: "#8a8f95" },
  { x: 170, side: "top",    color: "#7a8896" },
  // gap at 270 for the ego to wait half in / half out
  { x: 360, side: "top",    color: "#7a8896" },
  { x: 440, side: "top",    color: "#8a8f95" },
  { x: 540, side: "top",    color: "#6d7a86" },
];

function ParkedCar({ x, side, color }: Parked) {
  const y = side === "top" ? 170 : 245;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-24} y={-11} width={48} height={22} rx={4} fill={color} stroke="#0a0a0a" strokeWidth={0.7} />
      <rect x={-14} y={-9} width={8} height={18} rx={1} fill="#111" opacity={0.65} />
      <rect x={6}   y={-9} width={8} height={18} rx={1} fill="#111" opacity={0.5} />
    </g>
  );
}

function Ego({ cx, cy, indicator, braking }: { cx: number; cy: number; indicator?: boolean; braking?: boolean }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <rect x={-22} y={-11} width={44} height={22} rx={5} fill="#2f6bf0" stroke="#0a0a0a" strokeWidth={0.9} />
      <rect x={-12} y={-9} width={7} height={18} rx={1} fill="#111" opacity={0.75} />
      <rect x={5}   y={-9} width={7} height={18} rx={1} fill="#111" opacity={0.55} />
      <rect x={22}  y={-8} width={1.8} height={3} fill="#fff8c0" />
      <rect x={22}  y={5}  width={1.8} height={3} fill="#fff8c0" />
      <rect x={-23.4} y={-8} width={1.6} height={3} fill={braking ? "#ff2a2a" : "#5a1010"} />
      <rect x={-23.4} y={5}  width={1.6} height={3} fill={braking ? "#ff2a2a" : "#5a1010"} />
      {indicator && (
        <circle cx={22} cy={-9} r={1.8} fill="#ffb020">
          <animate attributeName="opacity" values="1;0.15;1" dur="0.5s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

function Oncoming({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(-1 1)`}>
      <rect x={-22} y={-11} width={44} height={22} rx={5} fill="#e05a3a" stroke="#0a0a0a" strokeWidth={0.9} />
      <rect x={-12} y={-9} width={7} height={18} rx={1} fill="#111" opacity={0.75} />
      <rect x={5}   y={-9} width={7} height={18} rx={1} fill="#111" opacity={0.55} />
      <rect x={22}  y={-8} width={1.8} height={3} fill="#fff8c0" />
      <rect x={22}  y={5}  width={1.8} height={3} fill="#fff8c0" />
    </g>
  );
}

function MeetingScene(t: number) {
  // Phase progression (single play-through, no loop)
  const phaseA = t < 0.20;                     // approach + scan
  const phaseB = t >= 0.20 && t < 0.42;        // ease into half-in/half-out
  const phaseC = t >= 0.42 && t < 0.66;        // hold; oncoming passes
  const phaseD = t >= 0.66 && t < 0.82;        // mirror check + move out
  const phaseE = t >= 0.82;                    // continue with 1 m clearance

  // Ego position — carries the learner through the whole manoeuvre.
  let egoX = 40;
  let egoY = 218;
  if (phaseA) {
    // Approach the narrowing at a steady speed
    egoX = 40 + easeInOut(t / 0.20) * 190; // 40 → 230
    egoY = 218;
  } else if (phaseB) {
    // Slow down and steer HALF IN / HALF OUT of the parking gap
    const k = easeInOut((t - 0.20) / 0.22);
    egoX = 230 + k * 60;                    // 230 → 290
    egoY = 218 - k * 22;                    // 218 → 196 (half in)
  } else if (phaseC) {
    // Hold position — oncoming vehicle threads through
    egoX = 290;
    egoY = 196;
  } else if (phaseD) {
    // Mirror + shoulder check, ease back into the lane
    const k = easeInOut((t - 0.66) / 0.16);
    egoX = 290 + k * 60;                    // 290 → 350
    egoY = 196 + k * 22;                    // 196 → 218
  } else {
    // Continue with 1 m clearance from parked doors
    const k = easeInOut((t - 0.82) / 0.18);
    egoX = 350 + k * 260;                   // 350 → 610
    egoY = 218;
  }

  // Oncoming red car — visible from the start so the learner sees the
  // hazard, then threads through the narrow point during phase C, then
  // clears the scene.
  let redX = 640;
  if (phaseA) {
    redX = 640 - easeInOut(t / 0.20) * 140;    // 640 → 500 (still ahead)
  } else if (phaseB) {
    redX = 500 - easeInOut((t - 0.20) / 0.22) * 120; // 500 → 380
  } else if (phaseC) {
    redX = 380 - easeInOut((t - 0.42) / 0.24) * 260; // 380 → 120 (passes)
  } else {
    redX = -60; // gone
  }

  // Speed based on effective gap / phase
  const speed =
    phaseA ? 20 :
    phaseB ? 10 :
    phaseC ? 0  :
    phaseD ? 5  :
    15;
  const speedColor = speed >= 25 ? GOOD : speed >= 12 ? WARN : BAD;
  const speedLabel =
    phaseC ? "Waiting" :
    speed >= 25 ? "Plenty of room" :
    speed >= 12 ? "Medium gap" :
    speed >= 6  ? "Small gap" : "Very tight";

  const banner =
    phaseA ? "1 · SCAN — narrowing + oncoming vehicle ahead" :
    phaseB ? "2 · HALF IN / HALF OUT — ease into position" :
    phaseC ? "3 · MEETING — hold. Let the oncoming car through" :
    phaseD ? "4 · MIRROR + SHOULDER — ease back into the lane" :
             "5 · CONTINUE — 1 m clearance from parked doors";

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <defs>
        <linearGradient id="sky-mss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
      </defs>
      <rect width={640} height={360} fill="url(#sky-mss)" />
      {/* pavements */}
      <rect x={0} y={120} width={640} height={30} fill={GRASS} opacity={0.6} />
      <rect x={0} y={150} width={640} height={10} fill={KERB} />
      <rect x={0} y={280} width={640} height={10} fill={KERB} />
      <rect x={0} y={290} width={640} height={70} fill={GRASS} opacity={0.6} />
      {/* road */}
      <rect x={0} y={160} width={640} height={120} fill={ROAD} />
      {/* faint centre line */}
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={i * 40} y={218} width={20} height={3} fill={PAINT} opacity={0.35} />
      ))}

      {/* Parked vehicles */}
      {PARKED.map((p, i) => <ParkedCar key={i} {...p} />)}

      {/* Waiting bay highlight during phases B/C */}
      {(phaseB || phaseC || phaseD) && (
        <g>
          <rect x={260} y={162} width={70} height={30} fill={ACCENT} opacity={0.25} stroke={ACCENT} strokeWidth={1.2} strokeDasharray="4 3" />
          <text x={295} y={144} textAnchor="middle" fontSize={9} fontWeight={700} fill={ACCENT} fontFamily="sans-serif">
            HALF IN / HALF OUT
          </text>
        </g>
      )}

      {/* Mirror check pulse (phase D) */}
      {phaseD && (
        <g>
          <circle cx={egoX - 22} cy={egoY - 12} r={3.5} fill="none" stroke={WARN} strokeWidth={1.4}>
            <animate attributeName="r" values="2;6;2" dur="0.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.2;1" dur="0.7s" repeatCount="indefinite" />
          </circle>
          <text x={egoX - 46} y={egoY - 20} fontSize={8} fontWeight={700} fill={WARN} fontFamily="sans-serif">MIRROR</text>
        </g>
      )}

      {/* 1m clearance markers (phase E) */}
      {phaseE && (
        <g opacity={0.85}>
          <line x1={egoX - 30} y1={egoY - 18} x2={egoX - 30} y2={egoY + 18} stroke={GOOD} strokeWidth={1.4} strokeDasharray="3 2" />
          <line x1={egoX + 30} y1={egoY - 18} x2={egoX + 30} y2={egoY + 18} stroke={GOOD} strokeWidth={1.4} strokeDasharray="3 2" />
          <text x={egoX + 34} y={egoY + 4} fontSize={9} fontWeight={700} fill={GOOD} fontFamily="sans-serif">1 m</text>
        </g>
      )}

      {/* Vehicles */}
      <Oncoming cx={redX} cy={195} />
      <Ego cx={egoX} cy={egoY} indicator={phaseB || phaseD} braking={phaseB || phaseC} />

      {/* Top banner */}
      <g transform="translate(20 20)">
        <rect width={360} height={44} rx={6} fill="#000" opacity={0.6} />
        <text x={12} y={16} fontSize={9} fill={ACCENT} fontWeight={700} letterSpacing="1.5" fontFamily="sans-serif">
          GSM · MEETING SITUATION
        </text>
        <text x={12} y={34} fontSize={12} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
          {banner}
        </text>
      </g>

      {/* Speed panel */}
      <g transform="translate(440 20)">
        <rect width={184} height={44} rx={6} fill="#000" opacity={0.6} />
        <text x={12} y={16} fontSize={9} fill="#9ca3af" letterSpacing="1.5" fontFamily="sans-serif">
          SUGGESTED SPEED
        </text>
        <text x={12} y={36} fontSize={18} fill={speedColor} fontWeight={800} fontFamily="sans-serif">
          {speed} mph
        </text>
        <text x={90} y={36} fontSize={10} fill="#fff" opacity={0.85} fontFamily="sans-serif">
          {speedLabel}
        </text>
      </g>
    </svg>
  );
}

export const meetingInSmallSpaces: Lesson = {
  slug: "meeting-in-small-spaces",
  title: "Meeting in small spaces",
  category: "Driving Strategies • GSM Method",
  rule: "Rules 155, 163, 167",
  objective:
    "Deal safely with oncoming traffic on narrow roads by reading ahead, choosing the right position, judging the space and adjusting speed to keep the traffic flowing smoothly.",
  think: [
    "How far ahead can I see — where does the road narrow?",
    "Is there a gap I can slot into, or do I need to wait?",
    "If I wait, am I making my intentions obvious to the other driver?",
    "How much clearance have I got from the parked doors?",
    "Is my speed matching the space I actually have?",
  ],
  ruleHeadline: "Read early. Position clearly. Match your speed to the space.",
  ruleBullets: [
    "Scan well ahead — parked cars, oncoming traffic, cyclists, pedestrians",
    "Half in / half out of the parking bay when waiting — never fully in",
    "Slot into an existing gap only if it's big enough — decide before you commit",
    "Move slightly towards the centre when parked vehicles narrow your side",
    "Leave about 1 metre from parked doors whenever possible",
    "Speed guide: plenty 30 · medium 15 · small 7 · very tight 4 (mph)",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>
        On narrow residential streets the road belongs to whoever plans best, not whoever pushes hardest. Reading the road early lets you choose a position, a speed and a gap before you need them — so meeting oncoming traffic becomes a smooth exchange, not a stand-off.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Half in / half out — the waiting position</p>
      <p>
        When you need to give way, pull about halfway into the parking space and leave the rest of the car in the road. This tells the other driver plainly: <em>I'm waiting for you</em>. Fully in and you look parked. Fully out and you needlessly block the road. Half in / half out is the clearest possible signal without touching a single control.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Fitting into an existing gap</p>
      <p>
        Sometimes there's enough room to keep flowing and let the oncoming car through the parked vehicles first. Spot the gap early, decide whether it's genuinely big enough, and slot in smoothly — no sudden steering, no last-second brake.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Road position and the 1 m rule</p>
      <p>
        Normally you drive within your lane. When parked cars narrow your side, moving slightly towards the centre gives you a safer clearance from the parked vehicles. Aim for about 1 metre from the doors: it protects you from doors opening, pedestrians stepping out, cyclists appearing and children emerging between cars. That metre is your reaction time.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Speed matches the space</p>
      <p>
        <strong>Less space = less speed.</strong> Roughly: plenty of room 30 mph · medium gap 15 mph · small gap 7 mph · very tight 4 mph. Treat these as guidelines only — always adjust to visibility, weather and hazards.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Hidden hazards</p>
      <p>
        A narrow street with parked cars hides children, pedestrians, cyclists overtaking queues and motorcyclists filtering. Slower speed means more thinking time and a much shorter stopping distance if any of them appears.
      </p>
    </>
  ),
  georgeExplains:
    "On a narrow street it's not a race — it's a conversation. Look well ahead. If there's a gap you can slot into, ease into it and let the other driver come through. If not, don't sit fully into the parking space or you'll look parked; and don't sit fully in the road or you'll block it. Half in, half out — that says 'I'm waiting for you' without a word. Keep about a metre from the parked doors, because doors open, kids step out, and cyclists appear. Less space, less speed. Plenty 30, medium 15, small 7, very tight 4 — those are guides, not targets. Read the road, and the road tells you what to do.",
  commonMistakes: [
    "Driving at 'the speed limit' on a narrow street packed with parked cars",
    "Waiting fully inside a parking bay — other drivers assume you're parked",
    "Waiting fully out in the lane — needlessly narrowing the road for everyone",
    "Committing to a gap without checking it's genuinely big enough",
    "Driving too close to parked doors instead of easing towards the centre",
    "Braking late because the road wasn't scanned early enough",
    "Forgetting cyclists and children who appear from between parked cars",
  ],
  gsmTips: [
    "Look far, plan early — the earlier you see it, the smoother it goes",
    "Half in / half out = 'I'm waiting for you' — no ambiguity",
    "One metre from the doors whenever the space allows",
    "Less space, less speed — every time",
    "If in doubt, don't commit to the gap — wait",
    "Keep the car rolling if it's safe to — flow beats stop-start",
  ],
  keyTakeaway:
    "Meeting in small spaces is about planning, position and space — scan ahead, pick a gap or wait half in / half out, and match your speed to the room you've actually got.",
  durationMs: 28000,
  captions: [
    { at: 0.0,  label: "SCAN — spot the narrowing", detail: "Parked cars both sides. Oncoming vehicle in the distance." },
    { at: 0.22, label: "HALF IN / HALF OUT — ease in", detail: "Slow, indicate, steer halfway into the parking gap." },
    { at: 0.44, label: "MEETING — hold your position", detail: "Wait patiently. Let the oncoming car through the narrow point." },
    { at: 0.68, label: "MIRROR + shoulder check", detail: "Check it's safe, then ease back into the lane." },
    { at: 0.84, label: "CONTINUE with 1 m clearance", detail: "Keep about a metre from the parked doors as you drive on." },
  ],
  questions: [
    {
      // Decision point BEFORE the driver commits. Fires just as they
      // recognise the meeting — then the animation resumes and shows
      // the correct technique carried out from start to finish.
      at: 0.18,
      prompt: "You've spotted an oncoming car and a narrowing ahead. Where should you position your vehicle to wait?",
      options: [
        { label: "Fully into an empty parking bay so you're out of the way", explain: "No — other drivers assume you've parked and will not thank you for waiting. Watch what happens next: the correct position is halfway in." },
        { label: "Half in the parking bay, half in the road", correct: true, explain: "Correct. Half in / half out clearly says 'I'm waiting for you' without any ambiguity. Watch how the car eases into position, holds while the oncoming vehicle passes, then moves back out with 1 m clearance from the parked doors." },
        { label: "Fully in the road so the oncoming car definitely sees you", explain: "No — that needlessly narrows the road and blocks the exchange. The right answer is halfway in — watch it demonstrated now." },
      ],
    },
  ],
  render: MeetingScene,
};
