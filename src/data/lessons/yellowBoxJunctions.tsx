import type { Lesson } from "@/components/driving-clips/LessonShell";

// ─────────────────────────────────────────────────────────────
// Yellow Box Junctions — enter only when your exit is clear,
// with the right-turn exception. Door-mirror + centre-line
// alignment used as the turning reference.
// ─────────────────────────────────────────────────────────────

const PAINT = "#f5f5f0";
const ROAD = "#2b2b2e";
const YELLOW = "#e6b024";
const ACCENT = "#C97845";
const GOOD = "#22c55e";
const HAZARD = "#ef4444";

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function Car({ cx, cy, angle = 0, color = "#2f6bf0", indicator }: any) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
      <rect x={-14} y={-7} width={28} height={14} rx={3} fill={color} stroke="#0a0a0a" strokeWidth={0.8} />
      <rect x={-8} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.7} />
      <rect x={3} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.55} />
      {indicator === "right" && (
        <circle cx={-14} cy={-5} r={1.4} fill="#ffb020">
          <animate attributeName="opacity" values="1;0.15;1" dur="0.5s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

function YellowBoxScene(t: number) {
  // Crossroads. Ego coming from south, TURNING RIGHT.
  // Oncoming (from north) blocks the box early. Yellow box lets us
  // enter and wait ONLY because we are turning right.

  // Ego position: approach → enter box → wait → complete turn.
  let egoX: number, egoY: number, egoA: number;
  if (t < 0.2) {
    // approach in right-turn position
    const k = t / 0.2;
    egoX = 300;
    egoY = 340 - easeInOut(k) * 130; // stop at 210
    egoA = -90;
  } else if (t < 0.35) {
    // creep into the box (right-turn exception)
    const k = (t - 0.2) / 0.15;
    egoX = 300 + easeInOut(k) * 12;
    egoY = 210 - easeInOut(k) * 8;
    egoA = -80;
  } else if (t < 0.7) {
    // wait in box while oncoming clears
    egoX = 312;
    egoY = 202;
    egoA = -80;
  } else if (t < 0.95) {
    // complete the right turn to the east
    const k = (t - 0.7) / 0.25;
    const ang = -80 + easeInOut(k) * 80; // rotate to 0 (east)
    egoA = ang;
    // Arc turn
    const cx = 340;
    const cy = 200;
    const R = 28;
    const rad = ((ang + 90) * Math.PI) / 180;
    egoX = cx - R * Math.cos(rad);
    egoY = cy + R * Math.sin(rad);
  } else {
    const k = (t - 0.95) / 0.05;
    egoX = 368 + easeInOut(k) * 80;
    egoY = 200;
    egoA = 0;
  }

  // Oncoming car — clears around t=0.65
  const oncomingX = 320;
  const oncomingY = 50 + t * 220;
  const oncomingVisible = t < 0.65;

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <rect width={640} height={360} fill="#141518" />
      {/* Grass corners */}
      <rect x={0} y={0} width={220} height={140} fill="#2a3d24" />
      <rect x={420} y={0} width={220} height={140} fill="#2a3d24" />
      <rect x={0} y={220} width={220} height={140} fill="#2a3d24" />
      <rect x={420} y={220} width={220} height={140} fill="#2a3d24" />

      {/* Roads */}
      <rect x={220} y={0} width={200} height={360} fill={ROAD} />
      <rect x={0} y={140} width={640} height={80} fill={ROAD} />

      {/* Centre lines (broken) */}
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={"v" + i} x={319} y={i * 40 + 6} width={2} height={20} fill={PAINT} />
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={"h" + i} x={i * 40 + 6} y={179} width={20} height={2} fill={PAINT} />
      ))}

      {/* Yellow box — with cross hatching */}
      <rect x={228} y={148} width={184} height={64} fill="none" stroke={YELLOW} strokeWidth={3} />
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={"d1" + i}
          x1={228 + i * 26}
          y1={148}
          x2={228 + i * 26 + 64}
          y2={212}
          stroke={YELLOW}
          strokeWidth={1.2}
          opacity={0.9}
        />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={"d2" + i}
          x1={228 + i * 26}
          y1={212}
          x2={228 + i * 26 + 64}
          y2={148}
          stroke={YELLOW}
          strokeWidth={1.2}
          opacity={0.9}
        />
      ))}

      {/* Give-way / stop lines */}
      <rect x={228} y={214} width={80} height={3} fill={PAINT} />
      <rect x={332} y={144} width={80} height={3} fill={PAINT} />

      {/* Oncoming vehicle */}
      {oncomingVisible && <Car cx={oncomingX} cy={oncomingY} angle={90} color="#e6b024" />}

      {/* Door-mirror alignment guide (centre line of exit road ↔ ego door mirror) */}
      {t > 0.35 && t < 0.85 && (
        <g>
          <line x1={egoX - 12} y1={egoY - 6} x2={620} y2={180} stroke={ACCENT} strokeWidth={1} strokeDasharray="4 4" opacity={0.8} />
          <text x={470} y={168} fontSize={9} fill={ACCENT} fontWeight={700} fontFamily="sans-serif">
            Centre line ↔ door mirror
          </text>
        </g>
      )}

      {/* Ego */}
      <Car cx={egoX} cy={egoY} angle={egoA} color="#2f6bf0" indicator={t < 0.85 ? "right" : undefined} />

      {/* HUD */}
      <g transform="translate(16 16)">
        <rect width={360} height={44} rx={6} fill="#000" opacity={0.62} />
        <text x={10} y={16} fontSize={9} fill={ACCENT} fontWeight={800} letterSpacing="1.5" fontFamily="sans-serif">
          YELLOW BOX JUNCTION
        </text>
        <text x={10} y={34} fontSize={11} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
          {t < 0.2 && "Approach — turning right, exit is clear beyond the box"}
          {t >= 0.2 && t < 0.35 && "Right-turn exception — you MAY enter the box"}
          {t >= 0.35 && t < 0.7 && "Wait for oncoming — stay on YOUR side of the centre line"}
          {t >= 0.7 && t < 0.95 && "Oncoming clear — complete the turn using the door-mirror ref"}
          {t >= 0.95 && "Exit lane centred — turn complete"}
        </text>
      </g>

      <g transform="translate(470 16)">
        <rect width={154} height={44} rx={6} fill="#000" opacity={0.55} />
        <text x={12} y={16} fontSize={9} fill="#9ca3af" letterSpacing="1.5" fontFamily="sans-serif">
          RULE 174
        </text>
        <text x={12} y={34} fontSize={11} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
          Exit clear → enter
        </text>
      </g>
    </svg>
  );
}

export const yellowBoxJunctions: Lesson = {
  slug: "yellow-box-junctions",
  title: "Yellow box junctions",
  category: "Driving Strategies • GSM Method",
  rule: "Rule 174",
  objective:
    "Use yellow box junctions correctly: never enter unless your exit is clear, understand the right-turn exception, stay on your side of the centre line, and use the door-mirror ↔ centre-line reference to complete a right turn accurately.",
  think: [
    "Is my EXIT clear — not just the entry?",
    "Am I going straight ahead / left? Then I must NOT enter unless the exit is clear.",
    "Am I turning right? Then I MAY enter and wait, but only for oncoming traffic.",
    "If lights change while I'm waiting to turn right, do I complete the turn?",
    "Am I aligning my door mirror with the centre line of the new road?",
  ],
  ruleHeadline: "Exit clear → you may enter. Right turn is the only exception.",
  ruleBullets: [
    "Never enter unless your exit road / lane is clear",
    "Exception: turning right — you may enter and wait for oncoming to clear",
    "If lights change while waiting to turn right — COMPLETE the turn",
    "Stay on YOUR side of the centre line while waiting",
    "Use the centre line of the NEW road aligned with your door mirror as the turning reference",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why the box exists</p>
      <p>
        Yellow box junctions keep major junctions clear — so traffic in one direction doesn't
        gridlock traffic in the other. Entering when your exit is blocked is a fault because it
        creates that gridlock. Stopping in a yellow box (except turning right) can also be a
        penalty offence.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">The right-turn exception</p>
      <p>
        You are the <em>only</em> vehicle allowed to enter and wait in the box — and only because
        you're waiting for a gap in oncoming traffic. Stay on YOUR side of the centre line. If the
        lights change while you're in the box, complete the turn — do not reverse or hesitate.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">The door-mirror reference</p>
      <p>
        As you wait, look at the centre line of the road you're turning into. Your steering
        starting point is when that centre line is aligned with your door mirror. That gives you
        the right arc — you won't cut the corner and you won't swing wide.
      </p>
    </>
  ),
  georgeExplains:
    "Yellow box, simple rule — is my exit clear? If yes, in you go. If no, wait. The only exception is turning right: you can enter and wait for oncoming, and if the lights change on you, you complete the turn — you don't back out. Stay on your side of the centre line while you wait — don't drift into the oncoming half. And when the gap comes, look at the centre line of the road you're going into. When it lines up with your door mirror, that's when you steer. Perfect arc every time.",
  commonMistakes: [
    "Entering the box because the entry is clear but the exit isn't",
    "Drifting across the centre line while waiting to turn right",
    "Panicking when the lights change mid-turn instead of completing the turn",
    "Cutting the corner — starting the steer too early",
    "Swinging wide — starting the steer too late",
  ],
  gsmTips: [
    "Ask 'is the EXIT clear?' not 'is the entry clear?'",
    "Right turn = the only ticket into the box",
    "Stay on YOUR side of the centre line while waiting",
    "Door mirror lines up with centre line of new road = steer NOW",
    "Lights changed while turning right? Complete the turn.",
  ],
  keyTakeaway:
    "Yellow box = exit must be clear. The only exception is turning right, where you may wait for oncoming. Use the door-mirror ↔ centre-line reference to complete the turn accurately.",
  durationMs: 20000,
  captions: [
    { at: 0.1, label: "Approach", detail: "Turning right — exit lane is clear beyond the box." },
    { at: 0.28, label: "Right-turn exception", detail: "You may enter the box while waiting for oncoming." },
    { at: 0.5, label: "Waiting position", detail: "Stay on YOUR side of the centre line." },
    { at: 0.78, label: "Steering reference", detail: "Centre line of new road ↔ door mirror = steer NOW." },
    { at: 0.95, label: "Exit centred", detail: "Turn complete, back on your side of the road." },
  ],
  questions: [
    {
      at: 0.16,
      prompt: "You want to drive straight through a yellow box. Traffic ahead is stopped and your exit is not clear. What must you do?",
      options: [
        {
          label: "Enter anyway — the light is green.",
          explain: "No. A green light does not override the yellow box rule. Never enter if your exit is blocked.",
        },
        {
          label: "Wait before the box until your exit is clear.",
          correct: true,
          explain: "Correct. Straight-ahead and left-turn traffic must wait outside the box until the exit is clear.",
        },
        {
          label: "Enter and stop in the box until it clears.",
          explain: "No — that's exactly what the yellow box exists to prevent. It causes gridlock.",
        },
      ],
    },
    {
      at: 0.55,
      prompt: "You've entered the box to turn right, waiting for oncoming. The lights change to red for you. What do you do?",
      options: [
        {
          label: "Reverse out of the box.",
          explain: "No — reversing in a junction is dangerous and unnecessary.",
        },
        {
          label: "Complete the right turn as soon as it is safe.",
          correct: true,
          explain: "Correct. When the lights change, oncoming traffic stops — complete your turn safely and clear the box.",
        },
        {
          label: "Stay stopped until the next green cycle.",
          explain: "No — you'd block the junction. Complete the turn once it's safe.",
        },
      ],
    },
  ],
  render: YellowBoxScene,
};