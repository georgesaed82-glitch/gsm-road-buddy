import { CarToken, CLIP_VIEWBOX, segment, easeInOut, type ClipBeat } from "./ClipShell";
import type { ReactNode } from "react";

// Each clip exports: title, rule (Highway Code reference), beats (caption
// timeline), render(t) -> <svg>, and durationMs.
export type ClipDef = {
  slug: string;
  title: string;
  rule: string;
  summary: string;
  beats: ClipBeat[];
  render: (t: number) => ReactNode;
  durationMs?: number;
};

// Shared shortcuts.
const PAINT = "#f5f5f0";
const TARMAC = "#3a3a3d";
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
// 1. Turning right at a junction
// ─────────────────────────────────────────────────────────────
const turningRight: ClipDef = {
  slug: "turning-right",
  title: "Turning right at a junction",
  rule: "Rules 179–181",
  summary: "Approach, position, wait for a safe gap, turn into the correct lane.",
  beats: [
    { at: 0, label: "Mirror–Signal–Manoeuvre on approach", detail: "Check interior + right-hand mirror. Signal right in good time. Reduce speed." },
    { at: 0.25, label: "Position just left of the centre line", detail: "Rule 179 — position gives space for traffic behind to pass on your left." },
    { at: 0.5, label: "Wait — give way to oncoming traffic", detail: "Only turn when there is a safe gap. Do not creep into oncoming traffic's path." },
    { at: 0.75, label: "Turn into the left-hand lane of the new road", detail: "Don't cut the corner. Straighten up, cancel the signal, mirror again." },
  ],
  render: (t) => {
    // Car approaches from bottom heading up, stops near the junction centre,
    // waits, then turns right (rotates -90°) and drives off to the right.
    const stageApproach = Math.min(1, t / 0.25);
    const y0 = 360;
    const y1 = 210; // where car pauses before turn
    const carY = y0 + (y1 - y0) * easeInOut(stageApproach);

    // Waiting phase 0.25..0.5 — no movement, just an oncoming car passing.
    // Turn phase 0.5..0.85 — arc through 90° right turn
    const turnT = Math.min(1, Math.max(0, (t - 0.5) / 0.35));
    const angle = -90 * easeInOut(turnT); // rotates so heading -90 = east
    // After turn, drive right off screen 0.85..1
    const exitT = Math.min(1, Math.max(0, (t - 0.85) / 0.15));
    const cx = 340 + turnT * 20 + exitT * 260;
    const cy = y1 - turnT * 20;

    // Oncoming car comes down the opposite side during wait
    const oncomingT = Math.min(1, Math.max(0, (t - 0.28) / 0.22));
    const oncomingY = -30 + 430 * oncomingT;

    return (
      <svg viewBox={CLIP_VIEWBOX} className="absolute inset-0 h-full w-full">
        <RoadDefs />
        <rect width="640" height="360" fill={GRASS} />
        {/* Vertical major road */}
        <rect x="280" y="0" width="120" height="360" fill="url(#tarmac-g)" />
        {/* Horizontal minor road (destination) */}
        <rect x="400" y="180" width="240" height="80" fill="url(#tarmac-g)" />
        {/* Centre lines */}
        <line x1="340" y1="0" x2="340" y2="180" stroke={PAINT} strokeWidth="2" strokeDasharray="18 14" />
        <line x1="340" y1="260" x2="340" y2="360" stroke={PAINT} strokeWidth="2" strokeDasharray="18 14" />
        <line x1="400" y1="220" x2="640" y2="220" stroke={PAINT} strokeWidth="2" strokeDasharray="18 14" />
        {/* Give way lines on side road entrance */}
        <path d="M 400 180 L 400 260" stroke={PAINT} strokeWidth="2.5" strokeDasharray="8 6" />
        {/* Oncoming car — going down (heading 180°) */}
        {t > 0.28 && t < 0.55 && <CarToken x={365} y={oncomingY} heading={180} color="#4a90e2" />}
        {/* Ego car */}
        <CarToken
          x={cx < 340 && cy > y1 ? 325 : cx}
          y={cy}
          heading={angle}
          color="#e5484d"
          indicator={t < 0.5 ? "right" : null}
        />
      </svg>
    );
  },
  durationMs: 14000,
};

// ─────────────────────────────────────────────────────────────
// 2. Meeting oncoming traffic on a narrow road
// ─────────────────────────────────────────────────────────────
const meetingTraffic: ClipDef = {
  slug: "meeting-traffic",
  title: "Meeting oncoming traffic on a narrow road",
  rule: "Rules 155–156",
  summary: "Parked cars on your side. Wait in a safe gap and give way to oncoming traffic.",
  beats: [
    { at: 0, label: "Scan ahead for oncoming traffic", detail: "Parked cars on your side of the road obstruct your lane." },
    { at: 0.25, label: "Pull in behind a parked car and wait", detail: "Rule 155 — give priority to oncoming traffic when the obstruction is on your side." },
    { at: 0.55, label: "Oncoming car passes — thank the driver", detail: "A brief acknowledgement is polite, never a wave that lets pedestrians step out." },
    { at: 0.75, label: "Move off when the road is clear", detail: "Mirror, indicate right briefly, look for pedestrians before pulling out." },
  ],
  render: (t) => {
    // Ego car (red) starts from left, pulls into a gap, waits, then moves off.
    const approach = Math.min(1, t / 0.25);
    const wait = Math.min(1, Math.max(0, (t - 0.55) / 0.2));
    const exit = Math.min(1, Math.max(0, (t - 0.75) / 0.25));
    const egoX =
      50 + 180 * easeInOut(approach) + 0 * (1 - wait) + 320 * easeInOut(exit);
    // Oncoming (blue) moves right-to-left across full width
    const oncomingT = Math.min(1, Math.max(0, (t - 0.3) / 0.3));
    const oncomingX = 700 - 750 * oncomingT;

    return (
      <svg viewBox={CLIP_VIEWBOX} className="absolute inset-0 h-full w-full">
        <RoadDefs />
        <rect width="640" height="360" fill={GRASS} />
        <rect x="0" y="130" width="640" height="120" fill="url(#tarmac-g)" />
        <line x1="0" y1="190" x2="640" y2="190" stroke={PAINT} strokeWidth="2" strokeDasharray="16 14" />
        {/* Parked cars on the near side (bottom lane) */}
        {[100, 260, 420].map((x) => (
          <g key={x}>
            <CarToken x={x} y={225} heading={90} color="#7c7c85" scale={0.9} />
          </g>
        ))}
        {/* Ego car */}
        <CarToken x={egoX} y={205} heading={90} color="#e5484d" indicator={t > 0.7 && t < 0.85 ? "right" : null} />
        {/* Oncoming car (top lane) */}
        {t > 0.3 && t < 0.62 && <CarToken x={oncomingX} y={165} heading={270} color="#4a90e2" />}
      </svg>
    );
  },
  durationMs: 14000,
};

// ─────────────────────────────────────────────────────────────
// 3. Zebra crossings
// ─────────────────────────────────────────────────────────────
const zebra: ClipDef = {
  slug: "zebra",
  title: "Zebra crossings",
  rule: "Rules H2, 19, 195",
  summary: "Approach prepared to stop and normally give way to pedestrians waiting to cross.",
  beats: [
    { at: 0, label: "See the Belisha beacons", detail: "Yellow flashing globes are your first cue a zebra is ahead." },
    { at: 0.25, label: "Scan both pavements — pedestrian waiting", detail: "Rule H2 — approach prepared to stop and normally give way to anyone waiting to cross." },
    { at: 0.5, label: "Stop before the zig-zags", detail: "Do not stop on the crossing itself. Never overtake or park on the zig-zag lines (Rule 191)." },
    { at: 0.8, label: "Wait until they have finished crossing", detail: "Then move off smoothly. Never wave pedestrians across — another driver may not see them." },
  ],
  render: (t) => {
    // Car approaches from the left, stops at zebra 0..0.5, then moves off 0.75..1
    const approachEnd = 240;
    const start = 40;
    const approach = Math.min(1, t / 0.5);
    const move = Math.min(1, Math.max(0, (t - 0.75) / 0.25));
    const carX = start + (approachEnd - start) * easeInOut(approach) + (640 - approachEnd) * easeInOut(move);

    // Pedestrian: waits on the pavement then walks across during stop
    const pedT = Math.min(1, Math.max(0, (t - 0.35) / 0.45));
    const pedY = 240 + (120 - 240) * pedT; // from bottom pavement up

    // Belisha beacons flash
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
        {/* Belisha beacon poles */}
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
        {/* Ego car */}
        <CarToken x={carX} y={200} heading={90} color="#e5484d" />
      </svg>
    );
  },
  durationMs: 14000,
};

// ─────────────────────────────────────────────────────────────
// 4. Spiral (multi-lane) roundabouts
// ─────────────────────────────────────────────────────────────
const spiralRoundabout: ClipDef = {
  slug: "spiral-roundabout",
  title: "Spiral / multi-lane roundabouts",
  rule: "Rules 184–190",
  summary: "Choose the right lane on approach; follow the spiral markings around; signal to exit.",
  beats: [
    { at: 0, label: "Choose your lane on approach", detail: "Turning right or going more than half-way? Right-hand lane. Turning left or first exit? Left-hand lane." },
    { at: 0.25, label: "Give way to traffic from the right", detail: "Rule 185 — unless signs or markings say otherwise." },
    { at: 0.5, label: "Follow the spiral markings round", detail: "Lanes drop away in the correct order — do not change lanes across a solid white spiral." },
    { at: 0.8, label: "Signal left as you pass the exit before yours", detail: "Check the mirror on the exit side, straighten up and go." },
  ],
  render: (t) => {
    // Car travels from south to a north exit via a roundabout.
    // Path: south approach → onto roundabout (right lane) → around → exit north.
    const cx = 320, cy = 180;
    let x = 320, y = 340, heading = 0;
    if (t < 0.2) {
      // approach from south
      y = 340 - (340 - 260) * easeInOut(t / 0.2);
      heading = 0;
    } else if (t < 0.85) {
      // circle around
      const k = (t - 0.2) / 0.65;
      const startAngle = Math.PI; // due south of centre
      const endAngle = Math.PI - Math.PI * 1.5 * easeInOut(k); // sweep 270° clockwise
      const r = 90;
      x = cx + r * Math.sin(endAngle);
      y = cy + r * Math.cos(endAngle);
      heading = ((-endAngle * 180) / Math.PI) + 90;
    } else {
      // exit north
      const k = (t - 0.85) / 0.15;
      x = cx - 90;
      // Exit going west actually — but for simplicity exit north:
      x = cx;
      y = 90 - 90 * k;
      heading = 0;
    }

    return (
      <svg viewBox={CLIP_VIEWBOX} className="absolute inset-0 h-full w-full">
        <RoadDefs />
        <rect width="640" height="360" fill={GRASS} />
        {/* Four road arms */}
        <rect x="270" y="0" width="100" height="360" fill="url(#tarmac-g)" />
        <rect x="0" y="140" width="640" height="80" fill="url(#tarmac-g)" />
        {/* Roundabout ring */}
        <circle cx="320" cy="180" r="120" fill="url(#tarmac-g)" />
        <circle cx="320" cy="180" r="35" fill={GRASS} stroke={PAINT} strokeWidth="2" />
        {/* Lane divisions on ring (dashed) */}
        <circle cx="320" cy="180" r="80" fill="none" stroke={PAINT} strokeWidth="1.5" strokeDasharray="10 8" />
        {/* Give way triangles at each entry */}
        <path d="M 285 275 L 355 275" stroke={PAINT} strokeWidth="2" strokeDasharray="6 5" />
        <path d="M 285 85 L 355 85" stroke={PAINT} strokeWidth="2" strokeDasharray="6 5" />
        <path d="M 415 155 L 415 205" stroke={PAINT} strokeWidth="2" strokeDasharray="6 5" />
        <path d="M 225 155 L 225 205" stroke={PAINT} strokeWidth="2" strokeDasharray="6 5" />
        {/* Ego car */}
        <CarToken x={x} y={y} heading={heading} color="#e5484d" indicator={t > 0.7 && t < 0.9 ? "left" : t < 0.2 ? "right" : null} />
      </svg>
    );
  },
  durationMs: 16000,
};

// ─────────────────────────────────────────────────────────────
// 5. Yellow box junctions
// ─────────────────────────────────────────────────────────────
const yellowBox: ClipDef = {
  slug: "yellow-box",
  title: "Yellow box junctions",
  rule: "Rule 174",
  summary: "You must not enter unless your exit is clear — one exception applies when turning right.",
  beats: [
    { at: 0, label: "Check the exit before entering", detail: "Rule 174 — you must not enter the box unless your exit is clear." },
    { at: 0.3, label: "Exit is blocked — wait behind the box", detail: "Blocking the yellow box is an enforceable offence in many places (£70+ fine)." },
    { at: 0.55, label: "Exit clears — now proceed", detail: "Only enter once you can drive right through without stopping in the box." },
    { at: 0.8, label: "Turning right? One exception applies", detail: "You MAY enter and wait in the box if the only thing blocking your exit is oncoming traffic." },
  ],
  render: (t) => {
    // Ego stops before box while another car sits blocking; then blocker leaves,
    // ego proceeds.
    const move = t < 0.25 ? easeInOut(t / 0.25) * 0.6 : t < 0.55 ? 0.6 : 0.6 + easeInOut((t - 0.55) / 0.45) * 1.2;
    const egoX = 40 + move * 320;
    // Blocking car sits in exit until 0.5, then moves out
    const blockT = Math.min(1, Math.max(0, (t - 0.45) / 0.15));
    const blockerX = 400 + 300 * easeInOut(blockT);

    return (
      <svg viewBox={CLIP_VIEWBOX} className="absolute inset-0 h-full w-full">
        <RoadDefs />
        <rect width="640" height="360" fill={GRASS} />
        <rect x="0" y="130" width="640" height="120" fill="url(#tarmac-g)" />
        <rect x="280" y="0" width="120" height="360" fill="url(#tarmac-g)" />
        {/* Yellow box */}
        <rect x="280" y="130" width="120" height="120" fill="none" stroke="#f5c518" strokeWidth="3" />
        <path d="M 280 130 L 400 250 M 280 250 L 400 130 M 280 190 L 400 190 M 340 130 L 340 250" stroke="#f5c518" strokeWidth="1.5" />
        {/* Lane lines */}
        <line x1="0" y1="190" x2="280" y2="190" stroke={PAINT} strokeWidth="2" strokeDasharray="16 14" />
        <line x1="400" y1="190" x2="640" y2="190" stroke={PAINT} strokeWidth="2" strokeDasharray="16 14" />
        {/* Blocker */}
        {t < 0.6 && <CarToken x={blockerX} y={205} heading={90} color="#7c7c85" />}
        {/* Ego */}
        <CarToken x={egoX} y={205} heading={90} color="#e5484d" />
      </svg>
    );
  },
  durationMs: 14000,
};

// ─────────────────────────────────────────────────────────────
// 6. Smart motorways
// ─────────────────────────────────────────────────────────────
const smartMotorway: ClipDef = {
  slug: "smart-motorway",
  title: "Smart motorways (all-lane running)",
  rule: "Rules 258, 269, 274–278",
  summary: "Obey the gantry — variable limits, red X closed lanes, refuge areas for breakdowns.",
  beats: [
    { at: 0, label: "Read the overhead gantry", detail: "Variable speed limits above your lane are mandatory (Rule 258)." },
    { at: 0.3, label: "Red X above a lane — do not drive in it", detail: "The lane is closed. Move out safely." },
    { at: 0.6, label: "50 mph — enforced by ANPR cameras", detail: "Match the displayed limit; do not undershoot dramatically either." },
    { at: 0.85, label: "Break down? Reach a refuge area if possible", detail: "If not, get behind the barrier on the left and call 999 (Rules 274–278)." },
  ],
  render: (t) => {
    // Three-lane motorway. Ego in middle lane; another car in right lane
    // moves out of the closed (red X) lane on the far right.
    const speed = t * 640;
    const dashOffset = (speed * 0.5) % 40;
    // Red X moves gantry to the right-hand lane
    return (
      <svg viewBox={CLIP_VIEWBOX} className="absolute inset-0 h-full w-full">
        <RoadDefs />
        <rect width="640" height="360" fill={GRASS} />
        <rect x="0" y="80" width="640" height="240" fill="url(#tarmac-g)" />
        {/* Lane lines */}
        <line x1="0" y1="160" x2="640" y2="160" stroke={PAINT} strokeWidth="2" strokeDasharray={`20 20`} strokeDashoffset={-dashOffset} />
        <line x1="0" y1="240" x2="640" y2="240" stroke={PAINT} strokeWidth="2" strokeDasharray={`20 20`} strokeDashoffset={-dashOffset} />
        <line x1="0" y1="80" x2="640" y2="80" stroke={PAINT} strokeWidth="2" />
        <line x1="0" y1="320" x2="640" y2="320" stroke={PAINT} strokeWidth="2" />
        {/* Gantry across the top */}
        <rect x="0" y="30" width="640" height="30" fill="#111" />
        <rect x="60" y="35" width="100" height="20" fill="#000" stroke="#333" />
        <text x="110" y="52" textAnchor="middle" fill="#ffb020" fontFamily="monospace" fontWeight="700" fontSize="16">50</text>
        <rect x="270" y="35" width="100" height="20" fill="#000" stroke="#333" />
        <text x="320" y="52" textAnchor="middle" fill="#ffb020" fontFamily="monospace" fontWeight="700" fontSize="16">50</text>
        <rect x="480" y="35" width="100" height="20" fill="#000" stroke="#333" />
        <text x="530" y="52" textAnchor="middle" fill="#e5484d" fontFamily="monospace" fontWeight="900" fontSize="18">✕</text>
        {/* Ego in centre lane */}
        <CarToken x={320} y={200} heading={0} color="#e5484d" />
        {/* Another car moving from right lane (closed) into centre */}
        <CarToken x={segment(t, [[0, 530], [0.3, 530], [0.6, 320], [1, 320]])} y={segment(t, [[0, 280], [0.3, 280], [0.6, 200], [1, 200]])} heading={0} color="#4a90e2" indicator={t < 0.6 ? "left" : null} />
        {/* Refuge area on right */}
        <rect x="580" y="80" width="60" height="80" fill="#f5a300" opacity="0.35" />
        <text x="610" y="130" textAnchor="middle" fill={PAINT} fontFamily="Arial" fontSize="10" fontWeight="700">SOS</text>
      </svg>
    );
  },
  durationMs: 14000,
};

// ─────────────────────────────────────────────────────────────
// 7. Lane discipline on dual carriageways
// ─────────────────────────────────────────────────────────────
const laneDiscipline: ClipDef = {
  slug: "lane-discipline",
  title: "Lane discipline on dual carriageways",
  rule: "Rule 264",
  summary: "Keep to the left-hand lane (lane 1). Only use lane 2 to overtake — then return.",
  beats: [
    { at: 0, label: "Drive in the left-hand lane by default", detail: "Rule 264 — this is lane 1 on any dual carriageway." },
    { at: 0.3, label: "Slower vehicle ahead — mirror–signal–move out", detail: "Only overtake when there is a clear reason and it is safe." },
    { at: 0.6, label: "Overtake and clear the vehicle safely", detail: "Do not linger in lane 2." },
    { at: 0.85, label: "Return to lane 1 as soon as safe", detail: "Middle-lane hogging is a £100 fine and 3 penalty points." },
  ],
  render: (t) => {
    // Two-lane road, ego overtakes a slow lorry.
    const dashOffset = (t * 640 * 0.5) % 40;
    // Ego x moves left-to-right; y switches from lane1 (240) to lane2 (170) then back
    const egoX = 40 + 560 * t;
    let egoY = 240;
    if (t > 0.25 && t < 0.4) egoY = 240 - ((t - 0.25) / 0.15) * 70;
    else if (t >= 0.4 && t < 0.75) egoY = 170;
    else if (t >= 0.75 && t < 0.9) egoY = 170 + ((t - 0.75) / 0.15) * 70;

    // Slow lorry in lane 1
    const lorryX = 260 + t * 60;

    return (
      <svg viewBox={CLIP_VIEWBOX} className="absolute inset-0 h-full w-full">
        <RoadDefs />
        <rect width="640" height="360" fill={GRASS} />
        <rect x="0" y="130" width="640" height="180" fill="url(#tarmac-g)" />
        {/* Central reservation (top edge) */}
        <rect x="0" y="110" width="640" height="20" fill={GRASS} />
        {/* Lane divider */}
        <line x1="0" y1="205" x2="640" y2="205" stroke={PAINT} strokeWidth="2" strokeDasharray={`24 20`} strokeDashoffset={-dashOffset} />
        <line x1="0" y1="130" x2="640" y2="130" stroke={PAINT} strokeWidth="2" />
        <line x1="0" y1="310" x2="640" y2="310" stroke={PAINT} strokeWidth="2" />
        {/* Lorry */}
        <g transform={`translate(${lorryX} 240)`}>
          <rect x="-10" y="-22" width="20" height="44" fill="#c9a84c" stroke="#0a0a0a" strokeWidth={0.6} rx="1" />
          <rect x="-8" y="-22" width="16" height="8" fill="#111" />
        </g>
        {/* Ego */}
        <CarToken x={egoX} y={egoY} heading={90} color="#e5484d" indicator={t > 0.22 && t < 0.4 ? "right" : t > 0.72 && t < 0.9 ? "left" : null} />
      </svg>
    );
  },
  durationMs: 14000,
};

// ─────────────────────────────────────────────────────────────
// 8. Dual carriageway slip road joining
// ─────────────────────────────────────────────────────────────
const slipRoadJoin: ClipDef = {
  slug: "slip-road-join",
  title: "Joining a dual carriageway from a slip road",
  rule: "Rule 259",
  summary: "Build up speed to match traffic on the main carriageway, then merge safely into the left-hand lane.",
  beats: [
    { at: 0, label: "Build up speed on the slip road", detail: "Match the speed of traffic already on the main carriageway (Rule 259)." },
    { at: 0.3, label: "Mirror check + shoulder look for a gap", detail: "The mirrors won't cover the blind spot to your right — look over your shoulder." },
    { at: 0.6, label: "Signal right, merge into the left-hand lane", detail: "Merge on a diagonal — do not stop at the end of the slip road unless forced." },
    { at: 0.85, label: "Cancel signal, settle into lane 1", detail: "Give any traffic already there priority — you are joining their road." },
  ],
  render: (t) => {
    // Slip road curves from bottom-right up to merge with main carriageway
    // travelling left-to-right along the top.
    // Ego path: from (60, 340) along slip road up to (400, 210) then along
    // main carriageway (lane 1) to right edge.
    let x, y, heading;
    if (t < 0.6) {
      const k = easeInOut(t / 0.6);
      // Parametric curve along slip road
      const p0 = { x: 60, y: 340 };
      const p1 = { x: 220, y: 320 };
      const p2 = { x: 380, y: 220 };
      // Quadratic bezier
      const bx = (1 - k) * (1 - k) * p0.x + 2 * (1 - k) * k * p1.x + k * k * p2.x;
      const by = (1 - k) * (1 - k) * p0.y + 2 * (1 - k) * k * p1.y + k * k * p2.y;
      x = bx;
      y = by;
      // heading approx: tangent direction
      const dx = 2 * (1 - k) * (p1.x - p0.x) + 2 * k * (p2.x - p1.x);
      const dy = 2 * (1 - k) * (p1.y - p0.y) + 2 * k * (p2.y - p1.y);
      heading = (Math.atan2(dy, dx) * 180) / Math.PI - 90 + 90 + 90;
      // Convert (dx, dy) direction to heading (0 = up)
      heading = (Math.atan2(dx, -dy) * 180) / Math.PI;
    } else {
      const k = easeInOut((t - 0.6) / 0.4);
      x = 380 + 260 * k;
      y = 210;
      heading = 90;
    }

    // Other car already on the main carriageway
    const otherX = -60 + t * 760;

    return (
      <svg viewBox={CLIP_VIEWBOX} className="absolute inset-0 h-full w-full">
        <RoadDefs />
        <rect width="640" height="360" fill={GRASS} />
        {/* Main carriageway (horizontal) */}
        <rect x="0" y="140" width="640" height="140" fill="url(#tarmac-g)" />
        {/* Lane divider */}
        <line x1="0" y1="210" x2="640" y2="210" stroke={PAINT} strokeWidth="2" strokeDasharray="20 18" />
        <line x1="0" y1="140" x2="640" y2="140" stroke={PAINT} strokeWidth="2" />
        <line x1="0" y1="280" x2="640" y2="280" stroke={PAINT} strokeWidth="2" />
        {/* Slip road */}
        <path d="M 20 360 L 200 340 Q 320 300 400 260 L 400 280 Q 320 320 220 350 L 40 360 Z" fill="url(#tarmac-g)" />
        {/* Chevron edge line */}
        <path d="M 200 340 Q 320 300 400 260" stroke={PAINT} strokeWidth="2" strokeDasharray="10 8" fill="none" />
        {/* Other traffic on main carriageway */}
        <CarToken x={otherX} y={245} heading={90} color="#4a90e2" />
        {/* Ego */}
        <CarToken x={x} y={y} heading={heading} color="#e5484d" indicator={t > 0.45 && t < 0.75 ? "right" : null} />
      </svg>
    );
  },
  durationMs: 16000,
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