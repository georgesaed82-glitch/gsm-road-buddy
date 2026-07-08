import type { Lesson } from "@/components/driving-clips/LessonShell";
import giveWayPhoto from "@/assets/give-way-line-stopping-position.jpeg.asset.json";
import { Zoomable } from "@/components/Zoomable";

// ─────────────────────────────────────────────────────────────
// Give Way Lines · Emerging safely at junctions
// Split-screen animation:
//   LEFT panel  — Open Give Way (good visibility): approach,
//                 observe, keep rolling into a genuine gap.
//   RIGHT panel — Closed Give Way (obstructed): STOP at the
//                 line, creep-and-peep until you can see, then go.
// After the primary sequence, a second beat compares turning-right
// reference points on a wide road (seatbelt) vs a narrow road (feet).
// ─────────────────────────────────────────────────────────────

const PAINT = "#f5f5f0";
const ROAD = "#2b2b2e";
const GRASS = "#3d6a2f";
const ACCENT = "#C97845";
const GOOD = "#22c55e";
const WARN = "#f59e0b";
const BAD = "#ef4444";

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function CarTop({
  cx,
  cy,
  color,
  rotate = 0,
  braking,
}: {
  cx: number;
  cy: number;
  color: string;
  rotate?: number;
  braking?: boolean;
}) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rotate})`}>
      <rect
        x={-14}
        y={-8}
        width={28}
        height={16}
        rx={3}
        fill={color}
        stroke="#0a0a0a"
        strokeWidth={0.6}
      />
      <rect x={-8} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.7} />
      <rect x={3} y={-6} width={5} height={12} rx={1} fill="#111" opacity={0.5} />
      <rect x={14} y={-7} width={1.6} height={3} fill="#fff8c0" />
      <rect x={14} y={4} width={1.6} height={3} fill="#fff8c0" />
      <rect x={-15.6} y={-7} width={1.6} height={3} fill={braking ? "#ff2a2a" : "#5a1010"} />
      <rect x={-15.6} y={4} width={1.6} height={3} fill={braking ? "#ff2a2a" : "#5a1010"} />
    </g>
  );
}

function TJunction({ ox, oy, closed }: { ox: number; oy: number; closed: boolean }) {
  return (
    <g transform={`translate(${ox} ${oy})`}>
      {/* main road (horizontal) */}
      <rect x={0} y={40} width={300} height={70} fill={ROAD} />
      <line x1={0} y1={40} x2={300} y2={40} stroke={PAINT} strokeWidth={1.5} />
      <line x1={0} y1={110} x2={300} y2={110} stroke={PAINT} strokeWidth={1.5} />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={i * 30} y={73} width={16} height={3} fill={PAINT} opacity={0.6} />
      ))}
      {/* side road (vertical, coming up from below) */}
      <rect x={130} y={110} width={40} height={110} fill={ROAD} />
      <line x1={130} y1={110} x2={130} y2={220} stroke={PAINT} strokeWidth={1.5} />
      <line x1={170} y1={110} x2={170} y2={220} stroke={PAINT} strokeWidth={1.5} />
      {/* GIVE WAY dashed line */}
      <g>
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={132 + i * 6.4} y={112} width={4} height={4} fill={PAINT} />
        ))}
      </g>
      <text
        x={150}
        y={132}
        textAnchor="middle"
        fontSize={7}
        fontWeight={700}
        fill={PAINT}
        fontFamily="sans-serif"
        opacity={0.85}
      >
        GIVE WAY
      </text>
      {/* Obstructions on closed side (parked cars + hedge) */}
      {closed && (
        <>
          <rect x={30} y={20} width={70} height={20} fill="#3d5a2f" opacity={0.9} rx={4} />
          <rect x={200} y={20} width={70} height={20} fill="#3d5a2f" opacity={0.9} rx={4} />
          <rect
            x={40}
            y={112}
            width={80}
            height={26}
            fill="#7a8896"
            rx={3}
            stroke="#000"
            strokeWidth={0.5}
          />
          <rect
            x={180}
            y={112}
            width={80}
            height={26}
            fill="#8a8f95"
            rx={3}
            stroke="#000"
            strokeWidth={0.5}
          />
        </>
      )}
    </g>
  );
}

function EmergingScene(t: number) {
  // Phase A (0..0.5): compare open vs closed junction emerging
  // Phase B (0.5..1):   turning-right reference points (wide vs narrow)
  const phaseA = t < 0.5;
  const localA = Math.min(1, t / 0.5);
  const localB = Math.max(0, Math.min(1, (t - 0.5) / 0.5));

  // Open junction — car keeps rolling because it can see early
  const openY = 210 - easeInOut(localA) * 110; // 210 → 100
  const openBraking = false;

  // Closed junction — car reaches the line, stops, creeps, then goes
  let closedY: number;
  let closedBrake = false;
  if (localA < 0.35) {
    closedY = 210 - easeInOut(localA / 0.35) * 60; // approach to line at y≈150
    closedBrake = true;
  } else if (localA < 0.55) {
    closedY = 150; // held at give-way line
    closedBrake = true;
  } else if (localA < 0.8) {
    // creep and peep
    closedY = 150 - easeInOut((localA - 0.55) / 0.25) * 30; // 150 → 120
    closedBrake = false;
  } else {
    closedY = 120 - easeInOut((localA - 0.8) / 0.2) * 30; // 120 → 90 (emerging)
  }

  // Cross traffic on the open side — one car passes on approach
  const openCarX = 200 - easeInOut(localA) * 260;
  // Cross traffic on the closed side — hidden car appears late
  const closedCarX = -20 + easeInOut(Math.max(0, localA - 0.4) / 0.6) * 340;

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <defs>
        <linearGradient id="sky-gwl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
      </defs>
      <rect width={640} height={360} fill="url(#sky-gwl)" />
      {/* grass base */}
      <rect x={0} y={0} width={640} height={360} fill={GRASS} opacity={0.35} />

      {phaseA && (
        <>
          {/* LEFT — Open junction */}
          <g transform="translate(0 60)">
            <TJunction ox={10} oy={20} closed={false} />
            <CarTop cx={160 + 10} cy={openY + 20} color="#8a8f95" rotate={0} braking={false} />
            <CarTop cx={openCarX + 10} cy={40 + 20 + 35} color="#e05a3a" rotate={90} />
            <g transform="translate(20 0)">
              <rect width={140} height={22} rx={4} fill="#000" opacity={0.7} />
              <text
                x={70}
                y={15}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fill={GOOD}
                fontFamily="sans-serif"
              >
                OPEN — good visibility
              </text>
            </g>
          </g>

          {/* RIGHT — Closed junction */}
          <g transform="translate(330 60)">
            <TJunction ox={10} oy={20} closed={true} />
            <CarTop
              cx={160 + 10}
              cy={closedY + 20}
              color="#2f6bf0"
              rotate={0}
              braking={closedBrake}
            />
            <CarTop cx={closedCarX + 10} cy={40 + 20 + 35} color="#e05a3a" rotate={90} />
            <g transform="translate(20 0)">
              <rect width={140} height={22} rx={4} fill="#000" opacity={0.7} />
              <text
                x={70}
                y={15}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fill={BAD}
                fontFamily="sans-serif"
              >
                CLOSED — obstructed
              </text>
            </g>
          </g>

          {/* Banner */}
          <g transform="translate(20 12)">
            <rect width={604} height={36} rx={6} fill="#000" opacity={0.6} />
            <text
              x={14}
              y={14}
              fontSize={9}
              fill={ACCENT}
              fontWeight={700}
              letterSpacing="1.5"
              fontFamily="sans-serif"
            >
              GSM · GIVE WAY — TWO KINDS OF JUNCTION
            </text>
            <text x={14} y={30} fontSize={11} fill="#fff" fontFamily="sans-serif" fontWeight={600}>
              Open: Plan to Stop, Look to Go · Closed: Stop, then Creep &amp; Peep
            </text>
          </g>
        </>
      )}

      {!phaseA && (
        <>
          {/* Phase B — turning right reference points */}
          <g transform="translate(0 40)">
            <TurningRightPanel
              narrow={false}
              progress={localB}
              label="WIDE ROAD · Seatbelt reference"
            />
          </g>
          <g transform="translate(330 40)">
            <TurningRightPanel
              narrow={true}
              progress={localB}
              label="NARROW ROAD · Feet reference"
            />
          </g>
          <g transform="translate(20 12)">
            <rect width={604} height={24} rx={6} fill="#000" opacity={0.6} />
            <text
              x={14}
              y={16}
              fontSize={11}
              fontWeight={700}
              fill={ACCENT}
              letterSpacing="1.5"
              fontFamily="sans-serif"
            >
              TURNING RIGHT — WHERE TO BEGIN STEERING
            </text>
          </g>
        </>
      )}
    </svg>
  );
}

function TurningRightPanel({
  narrow,
  progress,
  label,
}: {
  narrow: boolean;
  progress: number;
  label: string;
}) {
  const laneWidth = narrow ? 46 : 78;
  const cx = 150; // main road centre x within the 300px panel
  const cy = 200;
  // Steering trigger point differs — seatbelt on wide, feet on narrow.
  // The car uses a smooth arc; the reference point is drawn at the
  // driver's chosen trigger.
  const start = { x: cx - laneWidth * 0.6, y: 320 };
  const end = { x: cx + 120, y: cy };
  // steering trigger — where the car should BEGIN turning
  const trigger = narrow
    ? { x: cx - laneWidth * 0.35, y: cy + 60 } // feet reach centre earlier (narrow)
    : { x: cx - laneWidth * 0.15, y: cy + 30 }; // seatbelt reaches centre later (wide)

  // Simple straight-then-arc path
  const p =
    `M ${start.x} ${start.y} L ${trigger.x} ${trigger.y} ` +
    `Q ${trigger.x + 20} ${cy + 8} ${end.x} ${end.y}`;

  // Car position along the path — sample by param
  const pos = sampleAlong(start, trigger, end, easeInOut(progress));
  const angle = pos.angle;

  return (
    <g>
      {/* Panel bg */}
      <rect x={10} y={0} width={300} height={310} rx={8} fill="#0f0f11" opacity={0.55} />
      {/* horizontal main road */}
      <rect x={20} y={cy - 30} width={280} height={60} fill={ROAD} />
      <line x1={20} y1={cy - 30} x2={300} y2={cy - 30} stroke={PAINT} strokeWidth={1.4} />
      <line x1={20} y1={cy + 30} x2={300} y2={cy + 30} stroke={PAINT} strokeWidth={1.4} />
      {Array.from({ length: 9 }).map((_, i) => (
        <rect
          key={i}
          x={30 + i * 30}
          y={cy - 2}
          width={14}
          height={3}
          fill={PAINT}
          opacity={0.55}
        />
      ))}
      {/* side road (car coming from below) */}
      <rect x={cx - laneWidth / 2} y={cy + 30} width={laneWidth} height={130} fill={ROAD} />
      <line
        x1={cx - laneWidth / 2}
        y1={cy + 30}
        x2={cx - laneWidth / 2}
        y2={cy + 160}
        stroke={PAINT}
        strokeWidth={1.4}
      />
      <line
        x1={cx + laneWidth / 2}
        y1={cy + 30}
        x2={cx + laneWidth / 2}
        y2={cy + 160}
        stroke={PAINT}
        strokeWidth={1.4}
      />

      {/* driving path */}
      <path
        d={p}
        stroke={ACCENT}
        strokeWidth={2}
        strokeDasharray="4 3"
        fill="none"
        opacity={0.85}
      />

      {/* trigger point marker */}
      <circle cx={trigger.x} cy={trigger.y} r={5} fill={ACCENT} />
      <text
        x={trigger.x + 8}
        y={trigger.y + 3}
        fontSize={9}
        fontWeight={700}
        fill={ACCENT}
        fontFamily="sans-serif"
      >
        {narrow ? "FEET at centre" : "SEATBELT at centre"}
      </text>

      {/* car */}
      <CarTop cx={pos.x} cy={pos.y} color="#2f6bf0" rotate={angle} />

      {/* label */}
      <g transform="translate(20 8)">
        <rect width={280} height={20} rx={4} fill="#000" opacity={0.65} />
        <text
          x={140}
          y={14}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill="#fff"
          fontFamily="sans-serif"
        >
          {label}
        </text>
      </g>
    </g>
  );
}

function sampleAlong(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
  u: number,
) {
  // Blend straight A→B then curve B→C. Split u 0.55/0.45.
  if (u < 0.55) {
    const k = u / 0.55;
    return {
      x: a.x + (b.x - a.x) * k,
      y: a.y + (b.y - a.y) * k,
      angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
    };
  }
  const k = (u - 0.55) / 0.45;
  // quad bezier approximate
  const p1 = { x: b.x + 20, y: b.y - (b.y - c.y) * 0.4 };
  const x = (1 - k) * (1 - k) * b.x + 2 * (1 - k) * k * p1.x + k * k * c.x;
  const y = (1 - k) * (1 - k) * b.y + 2 * (1 - k) * k * p1.y + k * k * c.y;
  const tx = 2 * (1 - k) * (p1.x - b.x) + 2 * k * (c.x - p1.x);
  const ty = 2 * (1 - k) * (p1.y - b.y) + 2 * k * (c.y - p1.y);
  return { x, y, angle: (Math.atan2(ty, tx) * 180) / Math.PI };
}

export const giveWayLines: Lesson = {
  slug: "give-way-lines",
  title: "Give Way lines — emerging safely",
  category: "Driving Strategies • GSM Method",
  rule: "Rules 170–173, 179–183",
  objective:
    "Emerge safely from every junction by reading whether it's open or closed, using the Give Way line correctly, choosing the right steering reference point, and observing until the vehicle has fully joined the new road.",
  think: [
    "Is this an open junction, or is my view restricted?",
    "Where does the front of my bonnet stop in relation to the Give Way line?",
    "Do I need to Creep and Peep to actually see?",
    "Right, left, right again — and still observing as I emerge?",
    "Is this a wide road (seatbelt reference) or narrow (feet reference)?",
  ],
  ruleHeadline: "Open = look to go. Closed = stop, creep and peep, then go.",
  ruleBullets: [
    "Open junction — good visibility, decisions can be made early",
    "Closed junction — view blocked by parked cars, hedges or walls; stop and Creep and Peep",
    "Bonnet stops just behind the Give Way line — no part of the car crosses it",
    "Observe right, left, right — and keep observing while emerging",
    "Wide road turn right: begin steering when your SEATBELT reaches the centre",
    "Narrow road turn right: begin steering when your FEET reach the centre",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">
        Open vs closed — visibility is the difference
      </p>
      <p>
        The key difference between an open and a closed junction is not shape, it's{" "}
        <strong>visibility</strong>. An open junction lets you see well into the new road on
        approach; a closed junction is blocked by parked cars, hedges, trees, buildings or walls.
        That single fact decides how you approach.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">
        Correct stopping position at the Give Way line
      </p>
      <div className="my-3 overflow-hidden rounded-lg border border-border">
        <Zoomable
          label="Correct stopping position at the Give Way line"
          className="block"
          bare
        >
          <img
            src={giveWayPhoto.url}
            alt="Correct stopping position at the Give Way line — bonnet just behind the line"
            width={1024}
            height={1365}
            loading="lazy"
            className="w-full"
          />
        </Zoomable>
        <div className="border-t border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-semibold text-accent">
            Correct stopping position at the Give Way line
          </span>{" "}
          — bonnet just behind the line, no part of the car crossing it. This is the exact visual
          reference we teach GSM learners.
        </div>
      </div>
      <p>
        Stop with the front of the bonnet just behind the Give Way line. No part of the vehicle
        should cross it. Using the bonnet as a consistent reference stops you guessing where the
        front of the car is. If your view is still restricted, use the{" "}
        <strong>Creep and Peep</strong> technique — move forward slowly, stopping again if
        necessary, until you have a genuine view before emerging.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">
        "Plan to Stop, Look to Go" — where it applies
      </p>
      <p>
        This is an <strong>open-visibility</strong> technique. Use it at open Give Way junctions,
        open crossroads and roundabouts where the view is genuinely clear. Because you can see
        approaching traffic early, you can decide from the approach whether the road already has a
        gap — so you may continue safely without stopping. Good visibility allows early decision
        making while maintaining smooth traffic flow.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">
        Closed T-junctions — do NOT use "Look to Go"
      </p>
      <p>
        At a closed T-junction you cannot assess the main road until you have gained visibility.
        Approach under full control, prepare to stop, stop behind the Give Way line if necessary,
        complete your full observations and — if the view is still restricted — Creep and Peep. Only
        emerge once you have a full and safe view. Teaching "Look to Go" here would encourage
        learners to look for gaps before they can actually see the road, which is exactly how
        junction collisions happen.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">
        Observation never stops
      </p>
      <p>
        Right, left, right again — and keep observing while emerging until the vehicle has
        completely joined the new road. Traffic, cyclists and pedestrians change while you are
        moving; your eyes must not stop until the manoeuvre is finished.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">
        Judging distance — the two-car-lengths guide
      </p>
      <p>
        Each traffic lane is approximately two car lengths wide. That's an easy visual reference
        when you're deciding whether a gap in the main road is genuinely large enough to emerge
        into.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">
        Turning right — where you begin steering matters
      </p>
      <p>
        On a <strong>normal or wide road</strong>, begin steering when the centre of your body
        (roughly the seatbelt) reaches the centre of the new road. This produces a smooth,
        correctly-positioned arc without cutting the corner or steering too late.
      </p>
      <p>
        On a <strong>very narrow road</strong>, begin steering earlier — when your <em>feet</em>{" "}
        (roughly the pedals) reach the centre of the new road. A narrow road needs an earlier
        steering point so the car enters naturally instead of swinging wide and clipping the kerb.
      </p>
    </>
  ),
  georgeExplains:
    "First thing I ask you at any junction is: can I see? If I can see clearly, it's open — I can plan to stop but I may not need to. If I can't see — parked cars, hedges, a wall — it's closed, and I stop. Bonnet just behind the Give Way line, nothing crossing it. If I still can't see, I Creep and Peep — a little forward, look again, stop again if I have to. Right, left, right — and keep looking while I emerge. When I'm turning right into a normal road, I start turning when my seatbelt lines up with the centre of the new road. When it's a narrow road, that's too late — I start turning when my feet line up with the centre. Simple references, same result every time — a smooth turn, correct position, no cutting the corner.",
  commonMistakes: [
    "Using 'Plan to Stop, Look to Go' at a closed T-junction where the view is blocked",
    "Stopping with the bonnet across the Give Way line",
    "Rolling out on hope because the car behind is impatient",
    "A single glance instead of right–left–right and keep observing",
    "Turning right too late on a narrow road and clipping the kerb",
    "Turning right too early on a wide road and cutting the corner",
    "Forgetting to Creep and Peep when the view is still restricted at the line",
  ],
  gsmTips: [
    "Ask 'can I see?' — that answers open vs closed for you",
    "Bonnet just behind the line — no part of the car crosses it",
    "Creep and Peep — a little forward, look again, ready to stop again",
    "Right, left, right — and keep observing as you emerge",
    "Wide road? Seatbelt at centre. Narrow road? Feet at centre.",
    "Two car lengths ≈ one lane — a quick way to judge the gap",
  ],
  keyTakeaway:
    "Open junctions let you look to go. Closed junctions demand STOP, Creep and Peep, then go. Bonnet behind the line, observations that never stop — and the right steering reference for the road you're turning into.",
  durationMs: 26000,
  captions: [
    {
      at: 0.0,
      label: "OPEN vs CLOSED",
      detail: "Visibility decides. Open = flow. Closed = stop and look properly.",
    },
    {
      at: 0.22,
      label: "STOP at the Give Way line",
      detail: "Bonnet just behind — no part of the car crosses the line.",
    },
    {
      at: 0.4,
      label: "CREEP AND PEEP",
      detail: "If the view is still blocked, ease forward, ready to stop again.",
    },
    {
      at: 0.55,
      label: "TURNING RIGHT REFERENCE POINTS",
      detail: "Wide road: seatbelt to the centre. Narrow: feet to the centre.",
    },
    {
      at: 0.9,
      label: "OBSERVE UNTIL COMPLETE",
      detail: "Keep looking until the car has fully joined the new road.",
    },
  ],
  questions: [
    {
      at: 0.28,
      prompt:
        "You're approaching a closed T-junction — the view is blocked by parked cars. Which routine applies?",
      options: [
        {
          label: "Plan to Stop, Look to Go — decide from the approach",
          explain:
            "No — that's an open-visibility technique. At a closed junction you cannot assess traffic until you've gained a view.",
        },
        {
          label: "Stop at the Give Way line, then Creep and Peep until you can see",
          correct: true,
          explain:
            "Correct. Closed view = stop, gain visibility with Creep and Peep, then emerge only when it's genuinely safe.",
        },
        {
          label: "Roll straight out at low speed",
          explain: "No — that's how junction collisions happen. You must have a proper view first.",
        },
      ],
    },
    {
      at: 0.72,
      prompt: "You're turning right into a very narrow side road. Where should you begin steering?",
      options: [
        {
          label: "When your seatbelt lines up with the centre of the new road",
          explain:
            "That's the WIDE-road reference — on a narrow road it's too late and you'll clip the kerb.",
        },
        {
          label: "When your FEET (pedal position) line up with the centre of the new road",
          correct: true,
          explain:
            "Correct. A narrow road needs an earlier steering point so the car enters naturally without swinging wide.",
        },
        {
          label: "Only after your bonnet has passed the centre",
          explain: "Far too late — you'll overshoot and end up on the wrong side of the new road.",
        },
      ],
    },
  ],
  render: EmergingScene,
};
