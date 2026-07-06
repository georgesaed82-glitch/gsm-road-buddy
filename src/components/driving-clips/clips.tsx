import { CarToken, CLIP_VIEWBOX, segment, easeInOut, type ClipBeat, type ClipExplanation } from "./ClipShell";
import type { ReactNode } from "react";

// UK top-down driving clips. Coordinate rules (screen y grows downward):
//  - Horizontal road, ego heading east (90°): drive in the TOP half.
//  - Horizontal road, oncoming heading west (270°): drive in the BOTTOM half.
//  - Vertical road, ego heading north (0°): drive in the LEFT half.
//  - Vertical road, oncoming heading south (180°): drive in the RIGHT half.
//  - Roundabouts circulate CLOCKWISE (map view).
export type ClipDef = {
  slug: string;
  title: string;
  rule: string;
  summary: string;
  explanation: ClipExplanation;
  beats: ClipBeat[];
  render: (t: number) => ReactNode;
  durationMs?: number;
};

const PAINT = "#f5f5f0";
const GRASS = "#3d6a2f";

function RoadDefs() {
  return (
    <defs>
      <linearGradient id="tarmac-g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a3a3d" />
        <stop offset="0.5" stopColor="#2b2b2e" />
        <stop offset="1" stopColor="#3a3a3d" />
      </linearGradient>
    </defs>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. Turning right at a junction (UK)
// Vertical major road x∈[280,400], centre x=340. Side road east.
// ─────────────────────────────────────────────────────────────
const turningRight: ClipDef = {
  slug: "turning-right",
  title: "Turning right at a junction",
  rule: "Rules 179–181",
  summary: "Approach in the left lane, position just left of centre, wait, then turn into the left-hand lane of the new road.",
  explanation: {
    what: "We are turning right from a major road into a side road while staying on the correct UK side of the road.",
    when: "Use this whenever you need to turn right across oncoming traffic at a junction.",
    why: "Positioning correctly tells other drivers what you intend to do, keeps you out of the oncoming lane, and gives you time to judge a safe gap.",
    steps: [
      "Check interior mirror, right mirror, then signal right in good time.",
      "Move to a safe right-turn position just left of the centre line.",
      "Slow down and give way to oncoming traffic and pedestrians crossing the side road.",
      "Turn only when the gap is safe, without cutting the corner.",
      "Enter the left-hand lane of the new road, straighten, cancel the signal and check mirrors.",
    ],
  },
  beats: [
    { at: 0, label: "Mirror–Signal–Manoeuvre on approach", detail: "Check interior + right-hand mirror. Signal right in good time. Reduce speed." },
    { at: 0.25, label: "Position just left of the centre line", detail: "Rule 179 — position lets traffic behind pass on your left." },
    { at: 0.5, label: "Wait — give way to oncoming traffic", detail: "Only turn when there is a safe gap. Do not creep into the oncoming lane." },
    { at: 0.75, label: "Turn into the left-hand lane of the new road", detail: "Don't cut the corner. Straighten up, cancel the signal, mirror again." },
  ],
  render: (t) => {
    // Approach: heading 0 (north), in LEFT half (x=310) then drift toward centre-position (x=332).
    const approachT = Math.min(1, t / 0.25);
    const y0 = 360;
    const y1 = 220; // pause point near junction (just before the side road)
    const carY_approach = y0 + (y1 - y0) * easeInOut(approachT);
    const carX_approach = 310 + (332 - 310) * easeInOut(approachT);

    // Waiting 0.25..0.5 — static at (332, 220).
    // Turn 0.5..0.85 — arc through 90° right (heading 0 → 90). Pivot near (340, 210).
    const turnT = Math.min(1, Math.max(0, (t - 0.5) / 0.35));
    const angle = 90 * easeInOut(turnT);
    // Arc centre near (355, 200) with radius ~22 so car exits into the top lane of the side road.
    const arcCX = 348;
    const arcCY = 200;
    const arcR = 22;
    const arcTheta = Math.PI + (Math.PI / 2) * easeInOut(turnT); // π (west of arc centre) → 3π/2 (north of arc centre)
    const turningX = arcCX + arcR * Math.cos(arcTheta);
    const turningY = arcCY + arcR * Math.sin(arcTheta);

    // Exit 0.85..1: drive east along top lane of side road (y≈200).
    const exitT = Math.min(1, Math.max(0, (t - 0.85) / 0.15));
    const exitX = arcCX + arcR + (640 - (arcCX + arcR)) * easeInOut(exitT);

    const cx = t < 0.25 ? carX_approach : t < 0.5 ? 332 : t < 0.85 ? turningX : exitX;
    const cy = t < 0.25 ? carY_approach : t < 0.5 ? 220 : t < 0.85 ? turningY : 200;
    const heading = t < 0.5 ? 0 : t < 0.85 ? angle : 90;

    // Oncoming car heading south (180°) in RIGHT half of vertical road (x≈370).
    const oncomingT = Math.min(1, Math.max(0, (t - 0.28) / 0.22));
    const oncomingY = -30 + 430 * oncomingT;

    return (
      <svg viewBox={CLIP_VIEWBOX} className="absolute inset-0 h-full w-full">
        <RoadDefs />
        <rect width="640" height="360" fill={GRASS} />
        {/* Vertical major road */}
        <rect x="280" y="0" width="120" height="360" fill="url(#tarmac-g)" />
        {/* Horizontal side road (destination) — extends east */}
        <rect x="400" y="180" width="240" height="80" fill="url(#tarmac-g)" />
        {/* Centre lines */}
        <line x1="340" y1="0" x2="340" y2="180" stroke={PAINT} strokeWidth="2" strokeDasharray="18 14" />
        <line x1="340" y1="260" x2="340" y2="360" stroke={PAINT} strokeWidth="2" strokeDasharray="18 14" />
        <line x1="400" y1="220" x2="640" y2="220" stroke={PAINT} strokeWidth="2" strokeDasharray="18 14" />
        {/* Give-way markings on side road entry */}
        <path d="M 400 180 L 400 260" stroke={PAINT} strokeWidth="2.5" strokeDasharray="8 6" />
        {/* Oncoming — RIGHT half of vertical road */}
        {t > 0.28 && t < 0.55 && <CarToken x={370} y={oncomingY} heading={180} color="#4a90e2" />}
        {/* Ego */}
        <CarToken
          x={cx}
          y={cy}
          heading={heading}
          color="#e5484d"
          indicator={t < 0.5 ? "right" : null}
        />
      </svg>
    );
  },
  durationMs: 22000,
};

// ─────────────────────────────────────────────────────────────
// 2. Meeting oncoming traffic (parked cars on your side)
// Horizontal road y∈[130,250], centre y=190. Ego east → TOP lane.
// ─────────────────────────────────────────────────────────────
const meetingTraffic: ClipDef = {
  slug: "meeting-traffic",
  title: "Meeting oncoming traffic on a narrow road",
  rule: "Rules 155–156",
  summary: "Parked cars on your side of the road — give way to oncoming traffic before you go through the gap.",
  explanation: {
    what: "We are dealing with parked vehicles that narrow our lane while another vehicle is coming towards us.",
    when: "Use this on narrow streets whenever the obstruction is on your side and there may not be room for both vehicles.",
    why: "If the blockage is on your side, pushing through can force the oncoming driver to brake or swerve. Holding back keeps priority clear and traffic calm.",
    steps: [
      "Stretch your vision and spot the parked vehicles early.",
      "Check mirrors, ease off, and decide whether the gap is wide enough.",
      "If oncoming traffic is close, hold back before the obstruction.",
      "Let the oncoming vehicle pass while keeping the wheels straight.",
      "When the route is clear, check mirrors, move out smoothly, and rejoin your lane.",
    ],
  },
  beats: [
    { at: 0, label: "Scan ahead for oncoming traffic", detail: "Parked cars on your side of the road obstruct your lane." },
    { at: 0.25, label: "Slow and hold back behind a parked car", detail: "Rule 155 — give priority when the obstruction is on your side." },
    { at: 0.55, label: "Oncoming car passes — hold your position", detail: "A brief thank-you nod is polite. Never wave — another driver may not see the pedestrian." },
    { at: 0.75, label: "Move off when the road is clear", detail: "Mirror, signal briefly, check for pedestrians before pulling out." },
  ],
  render: (t) => {
    // Ego east → TOP lane (y=160). Parked cars along TOP kerb (y=145).
    // Oncoming west → BOTTOM lane (y=220).
    const approach = Math.min(1, t / 0.25);
    const exit = Math.min(1, Math.max(0, (t - 0.75) / 0.25));
    const egoX = 40 + 150 * easeInOut(approach) + 450 * easeInOut(exit);
    const oncomingT = Math.min(1, Math.max(0, (t - 0.3) / 0.3));
    const oncomingX = 700 - 750 * oncomingT;

    return (
      <svg viewBox={CLIP_VIEWBOX} className="absolute inset-0 h-full w-full">
        <RoadDefs />
        <rect width="640" height="360" fill={GRASS} />
        <rect x="0" y="130" width="640" height="120" fill="url(#tarmac-g)" />
        <line x1="0" y1="190" x2="640" y2="190" stroke={PAINT} strokeWidth="2" strokeDasharray="16 14" />
        {/* Parked cars along TOP kerb (ego's side) — heading east */}
        {[240, 400, 560].map((x) => (
          <CarToken key={x} x={x} y={148} heading={90} color="#7c7c85" scale={0.9} />
        ))}
        {/* Ego — TOP lane */}
        <CarToken x={egoX} y={172} heading={90} color="#e5484d" indicator={t > 0.7 && t < 0.85 ? "right" : null} />
        {/* Oncoming — BOTTOM lane, heading west */}
        {t > 0.3 && t < 0.62 && <CarToken x={oncomingX} y={215} heading={270} color="#4a90e2" />}
      </svg>
    );
  },
  durationMs: 22000,
};

// ─────────────────────────────────────────────────────────────
// 3. Zebra crossing — ego heading east, TOP lane.
// ─────────────────────────────────────────────────────────────
const zebra: ClipDef = {
  slug: "zebra",
  title: "Zebra crossings",
  rule: "Rules H2, 19, 195",
  summary: "Approach prepared to stop and normally give way to pedestrians waiting to cross.",
  explanation: {
    what: "We are approaching a zebra crossing, reading both pavements, and stopping for pedestrians when needed.",
    when: "Use this every time you see Belisha beacons, zig-zag markings, or people near a zebra crossing.",
    why: "Pedestrians are vulnerable and may step out once they believe you have seen them. Early planning prevents harsh braking and protects the crossing area.",
    steps: [
      "Identify the crossing early from the beacons, zig-zags and road markings.",
      "Check mirrors and ease off so you are prepared to stop.",
      "Scan both pavements and the crossing from left to right.",
      "Stop before the crossing if someone is waiting or already crossing.",
      "Move off only when the crossing is fully clear and your mirrors confirm it is safe.",
    ],
  },
  beats: [
    { at: 0, label: "See the Belisha beacons", detail: "Yellow flashing globes are your first cue a zebra is ahead." },
    { at: 0.25, label: "Scan both pavements — pedestrian waiting", detail: "Rule H2 — approach prepared to stop and normally give way to anyone waiting." },
    { at: 0.5, label: "Stop before the zig-zags", detail: "Never stop on the crossing itself. No overtaking or parking on the zig-zags (Rule 191)." },
    { at: 0.8, label: "Wait until they have finished crossing", detail: "Move off smoothly. Never wave pedestrians across — another driver may not see them." },
  ],
  render: (t) => {
    // Ego in TOP lane at y=160. Approaches, stops before zig-zags, waits, moves off.
    const stopX = 300; // stop line before zebra
    const approach = Math.min(1, t / 0.5);
    const move = Math.min(1, Math.max(0, (t - 0.75) / 0.25));
    const carX = 40 + (stopX - 40) * easeInOut(approach) + (640 - stopX) * easeInOut(move);

    // Pedestrian walks from bottom pavement (y=250) up across the crossing.
    const pedT = Math.min(1, Math.max(0, (t - 0.35) / 0.45));
    const pedY = 250 + (110 - 250) * pedT;
    const flash = Math.sin(t * Math.PI * 40) > 0 ? 1 : 0.4;

    return (
      <svg viewBox={CLIP_VIEWBOX} className="absolute inset-0 h-full w-full">
        <RoadDefs />
        <rect width="640" height="360" fill={GRASS} />
        {/* Pavements */}
        <rect x="0" y="90" width="640" height="30" fill="#a9a4a0" />
        <rect x="0" y="240" width="640" height="30" fill="#a9a4a0" />
        {/* Road */}
        <rect x="0" y="120" width="640" height="120" fill="url(#tarmac-g)" />
        <line x1="0" y1="180" x2="640" y2="180" stroke={PAINT} strokeWidth="1.5" strokeDasharray="14 12" />
        {/* Zig-zags */}
        <path d="M 200 120 L 210 128 L 220 120 L 230 128 L 240 120 L 250 128 L 260 120 L 270 128 L 280 120 L 290 128 L 300 120 L 310 128 L 320 120" stroke={PAINT} strokeWidth="2" fill="none" />
        <path d="M 200 240 L 210 232 L 220 240 L 230 232 L 240 240 L 250 232 L 260 240 L 270 232 L 280 240 L 290 232 L 300 240 L 310 232 L 320 240" stroke={PAINT} strokeWidth="2" fill="none" />
        {/* Zebra stripes */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={330 + i * 18} y={120} width={10} height={120} fill={PAINT} />
        ))}
        {/* Belisha beacons */}
        <line x1="325" y1="110" x2="325" y2="88" stroke="#333" strokeWidth="2" />
        <circle cx="325" cy="82" r="8" fill="#ffb020" opacity={flash} />
        <line x1="425" y1="250" x2="425" y2="272" stroke="#333" strokeWidth="2" />
        <circle cx="425" cy="278" r="8" fill="#ffb020" opacity={flash} />
        {/* Pedestrian */}
        {t > 0.15 && (
          <g transform={`translate(${380} ${pedY})`}>
            <circle cx={0} cy={-6} r={4} fill="#f0d5b0" />
            <rect x={-4} y={-2} width={8} height={12} fill="#2e7cff" />
          </g>
        )}
        {/* Ego — TOP lane */}
        <CarToken x={carX} y={155} heading={90} color="#e5484d" />
      </svg>
    );
  },
  durationMs: 22000,
};

// ─────────────────────────────────────────────────────────────
// 4. Spiral roundabout — UK clockwise circulation.
// Approach from south, exit north (straight-on / 2nd exit).
// ─────────────────────────────────────────────────────────────
const spiralRoundabout: ClipDef = {
  slug: "spiral-roundabout",
  title: "Spiral / multi-lane roundabouts",
  rule: "Rules 184–190",
  summary: "Choose the right lane on approach, give way to the right, follow the spiral markings round, signal to exit.",
  explanation: {
    what: "We are using a multi-lane UK roundabout by choosing the correct lane, giving way to the right, and following the marked path.",
    when: "Use this at spiral or multi-lane roundabouts where lane arrows and road markings guide each exit.",
    why: "Roundabouts work when drivers are predictable. Correct lane choice and signalling stop last-second swerves and protect traffic beside you.",
    steps: [
      "Read signs and lane arrows before the roundabout — choose your lane early.",
      "Slow down, check mirrors, and signal if your exit requires it.",
      "Give way to traffic from the right unless signs or lights say otherwise.",
      "Follow the spiral markings; do not cut across lanes.",
      "Signal left after the exit before yours, check mirrors, and leave into the correct lane.",
    ],
  },
  beats: [
    { at: 0, label: "Choose your lane on approach", detail: "Turning right or more than half way? Right-hand lane. Turning left or first exit? Left-hand lane." },
    { at: 0.25, label: "Give way to traffic from the right", detail: "Rule 185 — unless signs or markings say otherwise." },
    { at: 0.5, label: "Follow the spiral markings round", detail: "Lanes drop away in the correct order — do not change lanes across a solid white spiral." },
    { at: 0.8, label: "Signal left as you pass the exit before yours", detail: "Check the mirror on the exit side, straighten up and go." },
  ],
  render: (t) => {
    const cx = 320, cy = 180, r = 88;
    // Approach: heading 0 (north), LEFT half of vertical road (x≈305), from y=345 to y=cy+r+ish.
    let x = 305, y = 345, heading = 0;

    if (t < 0.2) {
      const k = easeInOut(t / 0.2);
      x = 305;
      y = 345 + (cy + r - 345) * k;
      heading = 0;
    } else if (t < 0.85) {
      // On ring, clockwise sweep from south (θ=0) → west (θ=-π/2) → north (θ=-π).
      const k = easeInOut((t - 0.2) / 0.65);
      const theta = -Math.PI * k;
      x = cx + r * Math.sin(theta);
      y = cy + r * Math.cos(theta);
      // Tangent direction (car nose points along direction of travel).
      const dx = r * Math.cos(theta) * -Math.PI; // d/dk of sin(θ) with θ=-πk
      const dy = -r * Math.sin(theta) * -Math.PI;
      heading = (Math.atan2(dx, -dy) * 180) / Math.PI;
    } else {
      // Exit north on LEFT half.
      const k = easeInOut((t - 0.85) / 0.15);
      x = 305;
      y = (cy - r) - (cy - r) * k;
      heading = 0;
    }

    return (
      <svg viewBox={CLIP_VIEWBOX} className="absolute inset-0 h-full w-full">
        <RoadDefs />
        <rect width="640" height="360" fill={GRASS} />
        {/* Four arms */}
        <rect x="270" y="0" width="100" height="360" fill="url(#tarmac-g)" />
        <rect x="0" y="140" width="640" height="80" fill="url(#tarmac-g)" />
        {/* Roundabout ring */}
        <circle cx={cx} cy={cy} r={120} fill="url(#tarmac-g)" />
        <circle cx={cx} cy={cy} r={35} fill={GRASS} stroke={PAINT} strokeWidth="2" />
        {/* Lane division on ring */}
        <circle cx={cx} cy={cy} r={78} fill="none" stroke={PAINT} strokeWidth="1.5" strokeDasharray="10 8" />
        {/* Give-way marks at each entry */}
        <path d="M 285 275 L 355 275" stroke={PAINT} strokeWidth="2" strokeDasharray="6 5" />
        <path d="M 285 85 L 355 85" stroke={PAINT} strokeWidth="2" strokeDasharray="6 5" />
        <path d="M 415 155 L 415 205" stroke={PAINT} strokeWidth="2" strokeDasharray="6 5" />
        <path d="M 225 155 L 225 205" stroke={PAINT} strokeWidth="2" strokeDasharray="6 5" />
        {/* Centre lines on arms */}
        <line x1="320" y1="0" x2="320" y2="60" stroke={PAINT} strokeWidth="2" strokeDasharray="16 12" />
        <line x1="320" y1="300" x2="320" y2="360" stroke={PAINT} strokeWidth="2" strokeDasharray="16 12" />
        <line x1="0" y1="180" x2="200" y2="180" stroke={PAINT} strokeWidth="2" strokeDasharray="16 12" />
        <line x1="440" y1="180" x2="640" y2="180" stroke={PAINT} strokeWidth="2" strokeDasharray="16 12" />
        {/* Ego */}
        <CarToken x={x} y={y} heading={heading} color="#e5484d" indicator={t > 0.62 && t < 0.86 ? "left" : t < 0.2 ? "left" : null} />
      </svg>
    );
  },
  durationMs: 24000,
};

// ─────────────────────────────────────────────────────────────
// 5. Yellow box junction — ego east, TOP lane. Blocker in TOP lane past the box.
// ─────────────────────────────────────────────────────────────
const yellowBox: ClipDef = {
  slug: "yellow-box",
  title: "Yellow box junctions",
  rule: "Rule 174",
  summary: "You must not enter unless your exit is clear — one exception when turning right.",
  explanation: {
    what: "We are approaching a yellow box junction and checking whether our exit is clear before entering.",
    when: "Use this at every yellow box, especially in queues, traffic lights, and busy junctions.",
    why: "Entering without a clear exit blocks cross traffic and can create gridlock. Waiting behind the box keeps the junction working.",
    steps: [
      "Look beyond the yellow box before your front wheels enter it.",
      "Ask: can I drive all the way through without stopping inside the box?",
      "If the exit is blocked, stop before the box even if the light is green.",
      "Move only once the exit space is genuinely available.",
      "Remember the exception: when turning right, you may wait in the box if only oncoming traffic blocks you.",
    ],
  },
  beats: [
    { at: 0, label: "Check the exit before entering", detail: "Rule 174 — do not enter unless your exit is clear." },
    { at: 0.3, label: "Exit is blocked — wait behind the box", detail: "Blocking a yellow box is enforceable (£70+ fine in many areas)." },
    { at: 0.55, label: "Exit clears — now proceed", detail: "Only enter once you can drive right through without stopping in the box." },
    { at: 0.8, label: "Turning right? One exception applies", detail: "You MAY enter and wait in the box if the only thing blocking your exit is oncoming traffic." },
  ],
  render: (t) => {
    // Ego TOP lane y=160. Approach → stop before box (x=260) → proceed once blocker clears.
    const preStopEnd = 0.25;
    const holdEnd = 0.55;
    let egoX: number;
    if (t < preStopEnd) {
      egoX = 40 + (260 - 40) * easeInOut(t / preStopEnd);
    } else if (t < holdEnd) {
      egoX = 260;
    } else {
      egoX = 260 + (640 - 260) * easeInOut((t - holdEnd) / (1 - holdEnd));
    }

    // Blocker in TOP lane past the box (at x=420). Moves east and off screen from 0.45.
    const blockT = Math.min(1, Math.max(0, (t - 0.45) / 0.15));
    const blockerX = 420 + 260 * easeInOut(blockT);

    return (
      <svg viewBox={CLIP_VIEWBOX} className="absolute inset-0 h-full w-full">
        <RoadDefs />
        <rect width="640" height="360" fill={GRASS} />
        <rect x="0" y="130" width="640" height="120" fill="url(#tarmac-g)" />
        <rect x="280" y="0" width="120" height="360" fill="url(#tarmac-g)" />
        {/* Yellow box */}
        <rect x="280" y="130" width="120" height="120" fill="none" stroke="#f5c518" strokeWidth="3" />
        <path d="M 280 130 L 400 250 M 280 250 L 400 130 M 280 190 L 400 190 M 340 130 L 340 250" stroke="#f5c518" strokeWidth="1.5" />
        {/* Lane centre lines */}
        <line x1="0" y1="190" x2="280" y2="190" stroke={PAINT} strokeWidth="2" strokeDasharray="16 14" />
        <line x1="400" y1="190" x2="640" y2="190" stroke={PAINT} strokeWidth="2" strokeDasharray="16 14" />
        <line x1="340" y1="0" x2="340" y2="130" stroke={PAINT} strokeWidth="2" strokeDasharray="16 14" />
        <line x1="340" y1="250" x2="340" y2="360" stroke={PAINT} strokeWidth="2" strokeDasharray="16 14" />
        {/* Blocker — TOP lane */}
        {t < 0.62 && <CarToken x={blockerX} y={160} heading={90} color="#7c7c85" />}
        {/* Ego — TOP lane */}
        <CarToken x={egoX} y={160} heading={90} color="#e5484d" />
      </svg>
    );
  },
  durationMs: 22000,
};

// ─────────────────────────────────────────────────────────────
// 6. Motorway lane change (MSPSL + mirrors)
// Vertical 3-lane motorway, all cars heading north.
// Ego in lane 1 wants to overtake a slower vehicle ahead. Full DVSA
// mirror–signal–manoeuvre sequence: interior mirror → right door mirror →
// wait for a following vehicle to pass → mirrors again → signal → blind-
// spot check → smooth change → cancel signal.
// ─────────────────────────────────────────────────────────────
const smartMotorway: ClipDef = {
  slug: "smart-motorway",
  title: "Motorway lane change — mirrors, signal, manoeuvre",
  rule: "Rules 133, 161, 267",
  summary: "Interior mirror first, then door mirror, wait if unsafe, signal, blind-spot check, then move — one lane at a time.",
  explanation: {
    what: "Changing from lane 1 to lane 2 on a motorway to overtake a slower vehicle.",
    when: "Any time you need to move out on a multi-lane road — motorway, dual carriageway, or wide urban route.",
    why: "Mirrors in the right order let you judge speed and distance of following traffic before you commit. Rushing the sequence is the top DVSA fault on faster roads.",
    steps: [
      "Interior mirror — check overall traffic behind.",
      "Right door mirror — check the lane you are moving into.",
      "If a vehicle is closing fast, wait for it to pass, then re-check.",
      "Signal right in good time so others can react.",
      "Quick blind-spot glance over your right shoulder.",
      "Steer smoothly into lane 2 — one lane, one steady movement.",
      "Cancel the signal and settle centred in the new lane.",
    ],
  },
  beats: [
    { at: 0.00, label: "Plan — slower vehicle ahead", detail: "You are in lane 1 with a slower car ahead. Decide early that you will overtake." },
    { at: 0.10, label: "Interior mirror first", detail: "Check overall traffic behind. This gives the big picture before any specific-lane check." },
    { at: 0.22, label: "Right door mirror", detail: "Judge the speed and distance of anything already in lane 2 behind you." },
    { at: 0.34, label: "Not safe — vehicle closing in lane 2", detail: "A faster car is approaching in the lane you want. Hold your position and let it pass." },
    { at: 0.52, label: "Vehicle has passed — mirrors again", detail: "Re-check interior, then right door mirror. Never rely on your first check." },
    { at: 0.64, label: "Signal right", detail: "Give a full, clear signal in good time so drivers behind can plan around you." },
    { at: 0.72, label: "Blind-spot check", detail: "Quick glance over your right shoulder — mirrors alone cannot see the blind spot." },
    { at: 0.80, label: "Smooth change into lane 2", detail: "One steady steering movement. Keep the same speed or accelerate slightly." },
    { at: 0.92, label: "Cancel signal, settle centred", detail: "Cancel the indicator and centre the car in lane 2." },
  ],
  render: (t) => {
    // Lane geometry.
    //  Hard shoulder x=60..120
    //  Lane 1 (inside)  x=120..200  centre 160
    //  Lane 2 (middle)  x=200..280  centre 240
    //  Lane 3 (outside) x=280..360  centre 320
    const laneEdges = [60, 120, 200, 280, 360];
    const dashOffset = (t * 640 * 0.9) % 40; // faster scroll = motorway speed

    // Ego position — sits mostly fixed in lane 1 (x=160, y=270) then moves
    // to lane 2 (x=240) between t=0.80 and t=0.90.
    const changeT = Math.min(1, Math.max(0, (t - 0.80) / 0.10));
    const egoX = 160 + (240 - 160) * easeInOut(changeT);
    const egoY = 270;

    // Slower silver car ahead in lane 1 (y=140) — stays roughly on screen.
    const silverY = 140 + Math.sin(t * Math.PI * 2) * 3;

    // Following blue car in lane 2. Starts off-screen bottom, closes on ego
    // between 0.15 and 0.34, passes ego on the right 0.34..0.52, then gone.
    const blueY = segment(t, [
      [0.00, 460],
      [0.15, 420],
      [0.34, 320],
      [0.52, -40],
      [1.00, -40],
    ]);
    const blueVisible = t < 0.55;

    // Mirror-check schedule.
    type Mirror = "interior" | "right" | null;
    const activeMirror: Mirror =
      t >= 0.10 && t < 0.22 ? "interior" :
      t >= 0.22 && t < 0.34 ? "right" :
      t >= 0.52 && t < 0.60 ? "interior" :
      t >= 0.60 && t < 0.66 ? "right" :
      null;
    const showBlindSpot = t >= 0.72 && t < 0.80;
    const showSignal = t >= 0.64 && t < 0.92;
    const showWaitBadge = t >= 0.34 && t < 0.50;
    const showSafeBadge = t >= 0.60 && t < 0.66;

    // Approach-distance readout while the blue car is visible in the right mirror.
    const distMetres = Math.max(5, Math.round((blueY - egoY) * 0.6));

    return (
      <svg viewBox={CLIP_VIEWBOX} className="absolute inset-0 h-full w-full">
        <RoadDefs />
        <defs>
          <radialGradient id="cone-int" cx="0.5" cy="1" r="1">
            <stop offset="0" stopColor="#ffd166" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffd166" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cone-right" cx="0" cy="1" r="1.2">
            <stop offset="0" stopColor="#7ad2ff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#7ad2ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="640" height="360" fill={GRASS} />
        {/* Carriageway */}
        <rect x={laneEdges[0]} y="0" width={laneEdges[4] - laneEdges[0]} height="360" fill="url(#tarmac-g)" />
        {/* Hard-shoulder inner solid line */}
        <line x1={laneEdges[1]} y1="0" x2={laneEdges[1]} y2="360" stroke={PAINT} strokeWidth="2" />
        {/* Lane dividers (dashed, scrolling) */}
        <line x1={laneEdges[2]} y1="0" x2={laneEdges[2]} y2="360" stroke={PAINT} strokeWidth="2" strokeDasharray="24 22" strokeDashoffset={-dashOffset} />
        <line x1={laneEdges[3]} y1="0" x2={laneEdges[3]} y2="360" stroke={PAINT} strokeWidth="2" strokeDasharray="24 22" strokeDashoffset={-dashOffset} />
        {/* Outer edges */}
        <line x1={laneEdges[0]} y1="0" x2={laneEdges[0]} y2="360" stroke={PAINT} strokeWidth="2" />
        <line x1={laneEdges[4]} y1="0" x2={laneEdges[4]} y2="360" stroke={PAINT} strokeWidth="2" />

        {/* Lane numbers (subtle) */}
        <text x="160" y="24" textAnchor="middle" fill={PAINT} opacity="0.5" fontSize="10" fontFamily="Arial" fontWeight="700">LANE 1</text>
        <text x="240" y="24" textAnchor="middle" fill={PAINT} opacity="0.5" fontSize="10" fontFamily="Arial" fontWeight="700">LANE 2</text>
        <text x="320" y="24" textAnchor="middle" fill={PAINT} opacity="0.5" fontSize="10" fontFamily="Arial" fontWeight="700">LANE 3</text>

        {/* Silver slower car ahead in lane 1 */}
        <CarToken x={160} y={silverY} heading={0} color="#9aa0a6" />

        {/* Blue following car in lane 2 */}
        {blueVisible && <CarToken x={240} y={blueY} heading={0} color="#4a90e2" />}

        {/* Field-of-vision cone for the currently checked mirror. */}
        {activeMirror === "interior" && (
          <g>
            {/* Wide rear cone from ego */}
            <path
              d={`M ${egoX} ${egoY + 12} L ${egoX - 130} 360 L ${egoX + 130} 360 Z`}
              fill="url(#cone-int)"
            />
            <path
              d={`M ${egoX} ${egoY + 12} L ${egoX - 130} 360 L ${egoX + 130} 360 Z`}
              fill="none"
              stroke="#ffd166"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.6"
            />
          </g>
        )}
        {activeMirror === "right" && (
          <g>
            {/* Narrower cone from ego's right-rear, aimed back-right */}
            <path
              d={`M ${egoX + 6} ${egoY + 8} L ${egoX + 40} 360 L ${egoX + 220} 360 Z`}
              fill="url(#cone-right)"
            />
            <path
              d={`M ${egoX + 6} ${egoY + 8} L ${egoX + 40} 360 L ${egoX + 220} 360 Z`}
              fill="none"
              stroke="#7ad2ff"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.7"
            />
          </g>
        )}

        {/* Blind-spot ring (right side of ego). */}
        {showBlindSpot && (
          <g>
            <circle
              cx={egoX + 22}
              cy={egoY + 4}
              r={18}
              fill="none"
              stroke="#ffd166"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            >
              <animate attributeName="r" values="14;22;14" dur="1s" repeatCount="indefinite" />
            </circle>
            <text x={egoX + 46} y={egoY + 8} fill="#ffd166" fontSize="10" fontWeight="800" fontFamily="Arial">BLIND SPOT</text>
          </g>
        )}

        {/* Distance readout to closing car while it is visible in the right mirror */}
        {activeMirror === "right" && blueVisible && blueY > egoY && (
          <g>
            <line x1={egoX + 40} y1={egoY + 6} x2={240} y2={blueY - 12} stroke="#7ad2ff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.9" />
            <rect x={260} y={(egoY + blueY) / 2 - 10} width={70} height={20} rx={3} fill="#0b1b2b" opacity="0.9" />
            <text x={295} y={(egoY + blueY) / 2 + 4} textAnchor="middle" fill="#7ad2ff" fontSize="11" fontWeight="800" fontFamily="Arial">~{distMetres} m</text>
          </g>
        )}

        {/* Ego */}
        <CarToken x={egoX} y={egoY} heading={0} color="#e5484d" indicator={showSignal ? "right" : null} />

        {/* Mirror HUD — top-right corner */}
        <g transform="translate(470 40)">
          <rect x="0" y="0" width="150" height="70" rx="6" fill="#0a0a0a" opacity="0.85" />
          <text x="75" y="14" textAnchor="middle" fill="#bbb" fontSize="8" fontWeight="800" fontFamily="Arial" letterSpacing="1">MIRROR CHECK</text>
          {/* Interior */}
          <g transform="translate(18 24)">
            <rect width="36" height="20" rx="3"
              fill={activeMirror === "interior" ? "#ffd166" : "#1a1a1a"}
              stroke={activeMirror === "interior" ? "#ffd166" : "#555"} />
            <text x="18" y="14" textAnchor="middle" fontSize="8" fontWeight="800"
              fill={activeMirror === "interior" ? "#0a0a0a" : "#bbb"} fontFamily="Arial">INT</text>
            <text x="18" y="56" textAnchor="middle" fill="#888" fontSize="7" fontFamily="Arial">interior</text>
          </g>
          {/* Left door (never active in this clip — shown for context) */}
          <g transform="translate(58 24)" opacity="0.55">
            <rect width="36" height="20" rx="3" fill="#1a1a1a" stroke="#555" />
            <text x="18" y="14" textAnchor="middle" fontSize="8" fontWeight="800" fill="#bbb" fontFamily="Arial">L</text>
            <text x="18" y="56" textAnchor="middle" fill="#666" fontSize="7" fontFamily="Arial">left</text>
          </g>
          {/* Right door */}
          <g transform="translate(98 24)">
            <rect width="36" height="20" rx="3"
              fill={activeMirror === "right" ? "#7ad2ff" : "#1a1a1a"}
              stroke={activeMirror === "right" ? "#7ad2ff" : "#555"} />
            <text x="18" y="14" textAnchor="middle" fontSize="8" fontWeight="800"
              fill={activeMirror === "right" ? "#0a0a0a" : "#bbb"} fontFamily="Arial">R</text>
            <text x="18" y="56" textAnchor="middle" fill="#888" fontSize="7" fontFamily="Arial">right door</text>
          </g>
        </g>

        {/* Status banner: WAIT vs SAFE */}
        {showWaitBadge && (
          <g>
            <rect x="180" y="300" width="280" height="34" rx="6" fill="#7a1215" />
            <text x="320" y="322" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900" fontFamily="Arial" letterSpacing="1">WAIT — VEHICLE CLOSING</text>
          </g>
        )}
        {showSafeBadge && (
          <g>
            <rect x="200" y="300" width="240" height="34" rx="6" fill="#155e2b" />
            <text x="320" y="322" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900" fontFamily="Arial" letterSpacing="1">SAFE TO MOVE</text>
          </g>
        )}
      </svg>
    );
  },
  durationMs: 30000,
};

// ─────────────────────────────────────────────────────────────
// 7. Lane discipline on a dual carriageway.
// Two cars driving side-by-side. One correctly centred in lane 1, the other
// straddling the lane divider (bad — marked with a red ✕). The straddling car
// then corrects into the centre of lane 2. Teaches lane POSITIONING, not
// overtaking.
// ─────────────────────────────────────────────────────────────
const laneDiscipline: ClipDef = {
  slug: "lane-discipline",
  title: "Lane discipline & positioning",
  rule: "Rule 264",
  summary: "Sit centred in your lane. Straddling the lane divider is dangerous and a common test fault.",
  explanation: {
    what: "We are keeping the car centred in its lane on a dual carriageway and avoiding lane straddling.",
    when: "Use this on any multi-lane road, especially when traffic is beside you or you are preparing to overtake.",
    why: "A car on the lane line takes space from both lanes. Centred positioning makes your path predictable and gives other drivers safe clearance.",
    steps: [
      "Look far ahead, not down at the lane line beside the car.",
      "Keep equal space either side of the vehicle within your lane.",
      "Hold a steady steering line and avoid drifting onto dashed markings.",
      "If you need to change lane, use mirrors, signal, shoulder check, then move once.",
      "Settle back into the centre of the new lane and keep left unless overtaking.",
    ],
  },
  beats: [
    { at: 0, label: "Two cars driving side-by-side", detail: "Rule 264 — keep to the left-hand lane (lane 1) unless overtaking." },
    { at: 0.22, label: "The right-hand car is STRADDLING the lane line", detail: "Sitting on the divider blocks other traffic and is a common test fault." },
    { at: 0.5, label: "Correct: settle into the centre of your lane", detail: "Aim for the middle of the lane — you should see roughly equal road on either side of the bonnet." },
    { at: 0.78, label: "Both cars now correctly positioned", detail: "Steady speed, centred in each lane, safe side-by-side spacing." },
  ],
  render: (t) => {
    // Road y∈[130,310]. Lane 1 (top) centre y=170. Lane 2 (bottom) centre y=250. Divider y=220.
    const dashOffset = (t * 640 * 0.5) % 44;
    // Both cars scroll together to sell forward motion (about 60 px over the loop).
    const forward = (t * 60) % 60;
    const goodX = 200 + forward;
    const badX = 260 + forward;

    // "Good" car — always centred in lane 1 (y=170).
    const goodY = 170;
    // "Bad" car — straddles the divider (y=220) at first, then corrects to
    // centre of lane 2 (y=250) between t=0.4 and t=0.55.
    const correctT = Math.min(1, Math.max(0, (t - 0.4) / 0.15));
    const badY = 220 + (250 - 220) * easeInOut(correctT);
    const isStraddling = t < 0.55;

    // ✕ marker + label pulse
    const xPulse = 0.85 + 0.15 * Math.sin(t * Math.PI * 8);

    return (
      <svg viewBox={CLIP_VIEWBOX} className="absolute inset-0 h-full w-full">
        <RoadDefs />
        <rect width="640" height="360" fill={GRASS} />
        {/* Central reservation above the carriageway */}
        <rect x="0" y="110" width="640" height="20" fill={GRASS} />
        <rect x="0" y="130" width="640" height="180" fill="url(#tarmac-g)" />
        {/* Lane divider */}
        <line x1="0" y1="220" x2="640" y2="220" stroke={PAINT} strokeWidth="2" strokeDasharray="24 20" strokeDashoffset={-dashOffset} />
        {/* Outer edges */}
        <line x1="0" y1="130" x2="640" y2="130" stroke={PAINT} strokeWidth="2" />
        <line x1="0" y1="310" x2="640" y2="310" stroke={PAINT} strokeWidth="2" />

        {/* Good car (green outline for correct) */}
        <CarToken x={goodX} y={goodY} heading={90} color="#3fa34d" />
        {/* Bad / straddling car */}
        <CarToken x={badX} y={badY} heading={90} color="#e5484d" />

        {/* Straddling marker: red ✕ over the offending car and label */}
        {isStraddling && (
          <g opacity={xPulse}>
            <line x1={badX - 18} y1={220 - 18} x2={badX + 18} y2={220 + 18} stroke="#ff3b30" strokeWidth="4" strokeLinecap="round" />
            <line x1={badX + 18} y1={220 - 18} x2={badX - 18} y2={220 + 18} stroke="#ff3b30" strokeWidth="4" strokeLinecap="round" />
            <rect x={badX + 26} y={205} width={110} height={22} fill="#ff3b30" rx={3} />
            <text x={badX + 81} y={220} textAnchor="middle" fill="#fff" fontFamily="Arial" fontWeight="800" fontSize="12">STRADDLING</text>
          </g>
        )}

        {/* Correct-position tick + label on the good car once we've reached
            the "correct position" beat */}
        {t > 0.45 && (
          <g>
            <circle cx={goodX} cy={goodY - 30} r="10" fill="#3fa34d" />
            <path d={`M ${goodX - 5} ${goodY - 30} L ${goodX - 1} ${goodY - 26} L ${goodX + 6} ${goodY - 34}`} stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <rect x={goodX + 14} y={goodY - 41} width={90} height={20} fill="#3fa34d" rx={3} />
            <text x={goodX + 59} y={goodY - 27} textAnchor="middle" fill="#fff" fontFamily="Arial" fontWeight="800" fontSize="11">CENTRED</text>
          </g>
        )}

        {/* Once corrected, show a matching tick + label on the previously-bad car */}
        {t > 0.6 && (
          <g>
            <circle cx={badX} cy={badY - 30} r="10" fill="#3fa34d" />
            <path d={`M ${badX - 5} ${badY - 30} L ${badX - 1} ${badY - 26} L ${badX + 6} ${badY - 34}`} stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>
    );
  },
  durationMs: 22000,
};

// ─────────────────────────────────────────────────────────────
// 8. Joining a dual carriageway from a slip road.
// Main carriageway horizontal, cars east. Slip road joins from the LEFT (screen top).
// ─────────────────────────────────────────────────────────────
const slipRoadJoin: ClipDef = {
  slug: "slip-road-join",
  title: "Joining a dual carriageway from a slip road",
  rule: "Rule 259",
  summary: "Build up speed on the slip road, match the traffic already in lane 1, and slot into a safe gap — ideally in front of the following car, not braking into it.",
  explanation: {
    what: "We are joining a dual carriageway from a slip road by matching traffic speed and merging into a safe gap.",
    when: "Use this whenever a slip road joins a faster road such as a dual carriageway or motorway.",
    why: "Joining too slowly or forcing a gap makes traffic brake behind you. Matching the flow lets you merge smoothly and safely.",
    steps: [
      "Use the slip road to build speed — do not crawl to the merge point.",
      "Check mirrors and look over the right shoulder for vehicles in lane 1.",
      "Identify a safe gap early using BGL: blockers, gap, look for opportunity.",
      "Signal right when it helps others understand your plan.",
      "Match speed, slot into the gap smoothly, cancel the signal and hold lane 1.",
    ],
  },
  beats: [
    { at: 0, label: "Build up speed on the slip road", detail: "Accelerate along the slip road so you can match the speed of traffic already in lane 1 (Rule 259)." },
    { at: 0.25, label: "Mirror + shoulder check for a gap", detail: "A car is following behind in lane 1 — glance over your right shoulder as well as the mirrors." },
    { at: 0.5, label: "Match speed, signal right, slot in ahead of it", detail: "Aim to slide into the gap in front of the following car — do NOT drift in and force them to brake." },
    { at: 0.8, label: "Cancel signal, settle into lane 1", detail: "You are now safely in lane 1, at traffic speed, with the following car behind you." },
  ],
  render: (t) => {
    // Main carriageway y∈[140,280]. Lane 1 top (centre y=175), lane 2 bottom (centre y=245).
    // Slip road enters from top-left, curving down to merge into lane 1.
    // Ego covers slip road (accelerating) between t=0..0.55, then merges into
    // lane 1 and settles in front of a following (blue) car.
    let x: number, y: number, heading: number;
    const mergeEnd = 0.55;
    if (t < mergeEnd) {
      // Accelerating along the slip road — cubic ease-in so speed BUILDS.
      const k = Math.pow(t / mergeEnd, 1.4);
      const p0 = { x: 40, y: 20 };
      const p1 = { x: 260, y: 40 };
      const p2 = { x: 420, y: 175 };
      x = (1 - k) * (1 - k) * p0.x + 2 * (1 - k) * k * p1.x + k * k * p2.x;
      y = (1 - k) * (1 - k) * p0.y + 2 * (1 - k) * k * p1.y + k * k * p2.y;
      const dx = 2 * (1 - k) * (p1.x - p0.x) + 2 * k * (p2.x - p1.x);
      const dy = 2 * (1 - k) * (p1.y - p0.y) + 2 * k * (p2.y - p1.y);
      heading = (Math.atan2(dx, -dy) * 180) / Math.PI;
    } else {
      const k = easeInOut((t - mergeEnd) / (1 - mergeEnd));
      x = 420 + 220 * k;
      y = 175;
      heading = 90;
    }

    // Following car already in LANE 1 — starts well behind, drives at a steady
    // speed. Ego builds up speed and merges in FRONT of it. By the end of the
    // clip the ego is clearly ahead of this car.
    const followerX = -80 + t * 560;
    // Faster traffic in lane 2 (overtaking lane) passing on the right.
    const fastX = -120 + t * 900;

    return (
      <svg viewBox={CLIP_VIEWBOX} className="absolute inset-0 h-full w-full">
        <RoadDefs />
        <rect width="640" height="360" fill={GRASS} />
        {/* Slip road (top-left, curving down into carriageway) */}
        <path
          d="M 0 0 L 260 0 Q 360 20 420 140 L 420 175 L 0 175 Z"
          fill="url(#tarmac-g)"
        />
        {/* Main carriageway */}
        <rect x="0" y="140" width="640" height="140" fill="url(#tarmac-g)" />
        {/* Slip-road outer edge (solid) */}
        <path d="M 260 0 Q 360 20 420 140" stroke={PAINT} strokeWidth="2" fill="none" />
        {/* Joining markings — short broken white line ("joining studs") on the
            merge between slip road and lane 1 */}
        <line x1="0" y1="140" x2="420" y2="140" stroke={PAINT} strokeWidth="2" strokeDasharray="8 8" />
        {/* Chevron arrows pointing into lane 1 on the merge zone */}
        {[80, 160, 240, 320].map((cx) => (
          <path
            key={cx}
            d={`M ${cx - 12} 118 L ${cx} 130 L ${cx + 12} 118`}
            stroke={PAINT}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {/* Lane divider on main carriageway */}
        <line x1="0" y1="210" x2="640" y2="210" stroke={PAINT} strokeWidth="2" strokeDasharray="20 18" />
        {/* Outer edges */}
        <line x1="420" y1="140" x2="640" y2="140" stroke={PAINT} strokeWidth="2" />
        <line x1="0" y1="280" x2="640" y2="280" stroke={PAINT} strokeWidth="2" />

        {/* Following car ALREADY in lane 1 (behind ego at merge). Ego slots
            in front of it. */}
        <CarToken x={followerX} y={175} heading={90} color="#4a90e2" />
        {/* Faster traffic in lane 2 */}
        <CarToken x={fastX} y={245} heading={90} color="#7c7c85" />

        {/* Ego */}
        <CarToken x={x} y={y} heading={heading} color="#e5484d" indicator={t > 0.4 && t < 0.85 ? "right" : null} />

        {/* Speed cue: "MATCH SPEED" badge during the merge */}
        {t > 0.35 && t < 0.7 && (
          <g>
            <rect x="220" y="300" width="200" height="26" fill="#111" opacity="0.85" rx={4} />
            <text x="320" y="318" textAnchor="middle" fill="#ffb020" fontFamily="Arial" fontWeight="800" fontSize="13">MATCH SPEED · SLOT IN AHEAD</text>
          </g>
        )}
      </svg>
    );
  },
  durationMs: 24000,
};

export const drivingClips: ClipDef[] = [
  turningRight,
  meetingTraffic,
  zebra,
  spiralRoundabout,
  yellowBox,
  smartMotorway,
  laneDiscipline,
  slipRoadJoin,
];