import type { Lesson } from "@/components/driving-clips/LessonShell";

// ─────────────────────────────────────────────────────────────
// Passing Parked Vehicles — 1 m clearance and the seat-belt return rule.
// Scene shows ego passing a row of parked cars with a 1m ghost gap,
// then holding position past the LAST car until its rear aligns with
// the ego driver's seat belt before returning smoothly to the left.
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

function Car({ cx, cy, angle = 0, color = "#2f6bf0" }: any) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
      <rect x={-14} y={-7} width={28} height={14} rx={3} fill={color} stroke="#0a0a0a" strokeWidth={0.8} />
      <rect x={-8} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.7} />
      <rect x={3} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.55} />
    </g>
  );
}

function Parked({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <rect x={-14} y={-7} width={28} height={14} rx={3} fill="#556" stroke="#0a0a0a" strokeWidth={0.8} />
      <rect x={-8} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.7} />
      <rect x={3} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.55} />
    </g>
  );
}

function PassingParkedScene(t: number) {
  const roadY = 218;
  const parkedY = 232;
  const parkedXs = [180, 240, 300, 360, 420];
  const lastParkedX = parkedXs[parkedXs.length - 1];

  // Ego path: approach → move out to ~1m → pass row → hold until seatbelt aligns with last car rear → return.
  let egoX: number, egoY: number;
  if (t < 0.15) {
    const k = t / 0.15;
    egoX = 30 + easeInOut(k) * 100;
    egoY = roadY;
  } else if (t < 0.35) {
    // move out to safe overtake line
    const k = (t - 0.15) / 0.2;
    egoX = 130 + easeInOut(k) * 40;
    egoY = roadY - easeInOut(k) * 20; // move up ~20px = ~1m clearance in this view
  } else if (t < 0.72) {
    // travel past parked row holding position
    const k = (t - 0.35) / 0.37;
    egoX = 170 + easeInOut(k) * 300; // travel to ~470 — past last car
    egoY = 198;
  } else if (t < 0.9) {
    // hold position until seat belt aligns with rear of last parked car
    const k = (t - 0.72) / 0.18;
    egoX = 470 + easeInOut(k) * 40;
    egoY = 198;
  } else {
    // smoothly return to left
    const k = (t - 0.9) / 0.1;
    egoX = 510 + easeInOut(k) * 80;
    egoY = 198 + easeInOut(k) * 20;
  }

  // Seat-belt reference line — from ego driver seat (approx.) forward
  // Aligns with rear of LAST parked car when egoX ~ 510
  const seatBeltX = egoX - 4; // seat position
  const lastRearX = lastParkedX + 14;
  const aligned = Math.abs(seatBeltX - lastRearX) < 6 || seatBeltX > lastRearX;

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <defs>
        <linearGradient id="sky-pp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
      </defs>
      <rect width={640} height={360} fill="url(#sky-pp)" />
      <rect x={0} y={130} width={640} height={30} fill={GRASS} />
      <rect x={0} y={240} width={640} height={40} fill={GRASS} />
      <rect x={0} y={160} width={640} height={80} fill={ROAD} />
      <line x1={0} y1={162} x2={640} y2={162} stroke={PAINT} strokeWidth={1.5} />
      <line x1={0} y1={238} x2={640} y2={238} stroke={PAINT} strokeWidth={1.5} />
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={i * 40 + ((t * 40) % 40) - 40} y={198} width={20} height={4} fill={PAINT} />
      ))}

      {/* Parked row */}
      {parkedXs.map((x, i) => (
        <Parked key={i} cx={x} cy={parkedY} />
      ))}

      {/* 1m clearance ghost between ego and parked row */}
      {t > 0.2 && t < 0.72 && (
        <g>
          <rect x={140} y={212} width={330} height={12} fill={GOOD} opacity={0.15} />
          <text x={280} y={222} fontSize={9} fill={GOOD} fontWeight={800} fontFamily="sans-serif">
            ≈ 1 metre clearance
          </text>
        </g>
      )}

      {/* Seat-belt alignment reference */}
      {t > 0.7 && t < 0.95 && (
        <g>
          <line
            x1={seatBeltX}
            y1={egoY - 2}
            x2={seatBeltX}
            y2={parkedY + 12}
            stroke={aligned ? GOOD : ACCENT}
            strokeWidth={1.4}
            strokeDasharray="3 3"
          />
          <line
            x1={lastRearX}
            y1={parkedY - 10}
            x2={lastRearX}
            y2={parkedY + 14}
            stroke={PAINT}
            strokeWidth={1}
            strokeDasharray="2 2"
          />
          <text
            x={seatBeltX + 6}
            y={egoY - 10}
            fontSize={9}
            fill={aligned ? GOOD : ACCENT}
            fontWeight={800}
            fontFamily="sans-serif"
          >
            Seat belt ↔ rear of last car
          </text>
        </g>
      )}

      {/* Ego */}
      <Car cx={egoX} cy={egoY} color="#2f6bf0" />

      {/* HUD */}
      <g transform="translate(16 16)">
        <rect width={360} height={44} rx={6} fill="#000" opacity={0.62} />
        <text x={10} y={16} fontSize={9} fill={ACCENT} fontWeight={800} letterSpacing="1.5" fontFamily="sans-serif">
          PASSING PARKED VEHICLES
        </text>
        <text x={10} y={34} fontSize={11} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
          {t < 0.15 && "Read the row early — plan a smooth line"}
          {t >= 0.15 && t < 0.35 && "Move out — aim for ~1 metre clearance"}
          {t >= 0.35 && t < 0.72 && "Hold the line — 1 m clearance, steady speed"}
          {t >= 0.72 && t < 0.9 && "Wait for seat belt to align with rear of LAST car"}
          {t >= 0.9 && "Return smoothly — no shaving back early"}
        </text>
      </g>

      <g transform="translate(470 16)">
        <rect width={154} height={44} rx={6} fill="#000" opacity={0.55} />
        <text x={12} y={16} fontSize={9} fill="#9ca3af" letterSpacing="1.5" fontFamily="sans-serif">
          RULE 163
        </text>
        <text x={12} y={34} fontSize={11} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
          Give a door's width
        </text>
      </g>
    </svg>
  );
}

export const passingParkedVehicles: Lesson = {
  slug: "passing-parked-vehicles",
  title: "Passing parked vehicles — the 1 m rule",
  category: "Driving Strategies • GSM Method",
  rule: "Rules 163, 167",
  objective:
    "Pass a row of parked vehicles with about 1 metre clearance (a door's width), hold that line until the rear of the LAST parked vehicle aligns with your seat belt, then return smoothly to the left — never shaving back early.",
  think: [
    "Have I moved out early enough — before I'm alongside the first car?",
    "Do I have about 1 metre of clearance (a door's width)?",
    "Is my speed matched to the SMALLEST gap I'll pass through?",
    "Am I holding the line — or drifting back too soon?",
    "Has the rear of the LAST parked car lined up with my seat belt yet?",
  ],
  ruleHeadline: "1 metre clearance in. Hold your line. Rear of last car ↔ seat belt = return.",
  ruleBullets: [
    "Give parked vehicles about 1 metre — enough for an opening door",
    "Move out EARLY — before you're alongside the first car",
    "Hold the line all the way past the row — no drifting",
    "Return only when the rear of the LAST car aligns with your seat belt",
    "Never shave back early — cyclists and doors need room right to the end",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why 1 metre</p>
      <p>
        A car door is roughly a metre wide. Anything less and a suddenly-opened door leaves you no
        room to react. 1 metre also gives you space for a cyclist, a wobble from the parked car,
        or a child stepping out from between vehicles.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why the seat-belt reference</p>
      <p>
        Returning to the left is the hardest bit — most learners drift back too soon and end up
        clipping the last parked vehicle or leaving no space for a cyclist alongside them. The
        reference is simple: wait until the REAR of the last parked car lines up with your SEAT
        BELT. Once it does, you're past it — you can steer back to the left smoothly.
      </p>
    </>
  ),
  georgeExplains:
    "1 metre — that's a door width. Move out early, hold that 1 metre all the way past the row, and don't peek back to the left until the rear of the LAST parked car is lined up with your seat belt. That's your cue. Steer back smoothly. Never shave back early — a cyclist could be tucked in alongside you and you'd never see them.",
  commonMistakes: [
    "Moving out too late — squeezing past the first car",
    "Passing too close because the road felt narrow",
    "Shaving back to the left before the last car has fully passed",
    "Clipping the last car's rear because the seat-belt reference wasn't used",
    "Speeding up during the pass — the smallest gap dictates the speed",
  ],
  gsmTips: [
    "1 metre = a door width. Non-negotiable.",
    "Move out EARLY — before you're alongside",
    "Hold the line — steady speed, no drift",
    "Return trigger: rear of LAST car ↔ your seat belt",
    "Never shave back early — leave room for cyclists to the end",
  ],
  keyTakeaway:
    "Pass with about 1 metre clearance. Hold that line all the way past the row. Only return when the rear of the last parked car aligns with your seat belt — never earlier.",
  durationMs: 18000,
  captions: [
    { at: 0.1, label: "Move out early", detail: "Before you're alongside — smooth line change." },
    { at: 0.45, label: "1 metre clearance", detail: "Hold the line all the way past the row." },
    { at: 0.78, label: "Seat-belt reference", detail: "Wait for rear of LAST car to line up with your seat belt." },
    { at: 0.95, label: "Return smoothly", detail: "Back to the left — no shaving back early." },
  ],
  questions: [
    {
      at: 0.4,
      prompt: "How much clearance should you leave when passing a row of parked cars on a normal urban road?",
      options: [
        {
          label: "Whatever fits — the road is narrow.",
          explain: "No. Room for an opening door is non-negotiable. If there isn't 1 m, you must slow right down.",
        },
        {
          label: "About 1 metre — a door's width.",
          correct: true,
          explain: "Correct. A metre gives room for an opening door, a wobble, or a child stepping out.",
        },
        {
          label: "As little as possible so oncoming traffic can pass.",
          explain: "No. Clearance from parked cars comes first — if you can't give room, you slow down or give way.",
        },
      ],
    },
    {
      at: 0.78,
      prompt: "You're past a row of parked cars. When is it safe to steer back towards the left?",
      options: [
        {
          label: "As soon as you're past the middle of the last car.",
          explain: "No — you'll clip the rear or leave no room for a cyclist. Wait for the seat-belt reference.",
        },
        {
          label: "When the rear of the LAST parked car lines up with your seat belt.",
          correct: true,
          explain: "Correct. That's the GSM reference — you're clear of the row and can return smoothly to the left.",
        },
        {
          label: "Whenever it feels right.",
          explain: "No — use the reference. Feel changes; the seat-belt cue doesn't.",
        },
      ],
    },
  ],
  render: PassingParkedScene,
};