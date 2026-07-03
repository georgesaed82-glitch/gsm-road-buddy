/**
 * Bespoke SVG diagrams for UK road markings — rendered in the on-brand
 * palette so they sit consistently alongside the OfficialSignImage tiles.
 *
 * Each component fills a 1:1 wrapper. Colours reference semantic tokens:
 *   - road surface uses --card / --muted
 *   - foreground text/paint uses currentColor
 */
import type { ReactNode } from "react";

const ROAD = "#3f3f46"; // slate/tarmac
const PAINT = "#f8fafc"; // matte white
const YELLOW = "#facc15";
const RED = "#dc2626";
const KERB = "#9ca3af";

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="block h-full w-full"
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
    >
      <rect width="200" height="200" fill={ROAD} />
      {children}
    </svg>
  );
}

// ── ALONG THE ROAD ────────────────────────────────────

export function CentreLine() {
  // Short dashes with long gaps down the centre of the carriageway.
  return (
    <Frame>
      <g>
        {[10, 60, 110, 160].map((y) => (
          <rect key={y} x="94" y={y} width="12" height="20" fill={PAINT} />
        ))}
      </g>
    </Frame>
  );
}

export function HazardWarningLine() {
  // Long dashes with short gaps — hazard ahead.
  return (
    <Frame>
      <g>
        {[0, 55, 110, 165].map((y) => (
          <rect key={y} x="94" y={y} width="12" height="40" fill={PAINT} />
        ))}
      </g>
    </Frame>
  );
}

export function DoubleWhiteNoCross() {
  // Two solid whites — do not cross.
  return (
    <Frame>
      <rect x="86" y="0" width="10" height="200" fill={PAINT} />
      <rect x="104" y="0" width="10" height="200" fill={PAINT} />
    </Frame>
  );
}

export function DoubleWhiteBrokenNear() {
  // Solid on the far side, broken on the near side (learner's side).
  return (
    <Frame>
      <rect x="86" y="0" width="10" height="200" fill={PAINT} />
      {[5, 45, 85, 125, 165].map((y) => (
        <rect key={y} x="104" y={y} width="10" height="26" fill={PAINT} />
      ))}
    </Frame>
  );
}

export function LaneLine() {
  // Short dashes closer together — dividing lanes.
  return (
    <Frame>
      <g>
        {[0, 30, 60, 90, 120, 150, 180].map((y) => (
          <rect key={y} x="94" y={y} width="12" height="16" fill={PAINT} />
        ))}
      </g>
    </Frame>
  );
}

export function EdgeLine() {
  // Solid edge lines on both sides.
  return (
    <Frame>
      <rect x="20" y="0" width="6" height="200" fill={PAINT} />
      <rect x="174" y="0" width="6" height="200" fill={PAINT} />
    </Frame>
  );
}

// ── ACROSS THE ROAD ───────────────────────────────────

export function GiveWayTriangle() {
  // Two dashed lines + big inverted triangle painted on the road.
  return (
    <Frame>
      <g>
        {[10, 40, 70, 100, 130, 160].map((x) => (
          <rect key={x} x={x} y="70" width="18" height="8" fill={PAINT} />
        ))}
        {[10, 40, 70, 100, 130, 160].map((x) => (
          <rect key={x + "b"} x={x} y="86" width="18" height="8" fill={PAINT} />
        ))}
      </g>
      <polygon points="60,120 140,120 100,180" fill={PAINT} />
    </Frame>
  );
}

export function StopLine() {
  return (
    <Frame>
      <rect x="10" y="80" width="180" height="14" fill={PAINT} />
      <text
        x="100"
        y="150"
        textAnchor="middle"
        fill={PAINT}
        style={{ font: "700 30px sans-serif", letterSpacing: 3 }}
      >
        STOP
      </text>
    </Frame>
  );
}

export function ZigZagCrossing() {
  // Zebra crossing: zig-zags on both approaches with alternating black/white
  // stripes in the middle (Highway Code / Traffic Signs Manual style).
  const zigTop = "M10 45 L30 65 L50 45 L70 65 L90 45 L110 65 L130 45 L150 65 L170 45 L190 65";
  const zigBottom = "M10 155 L30 135 L50 155 L70 135 L90 155 L110 135 L130 155 L150 135 L170 155 L190 135";
  return (
    <Frame>
      {/* Zig-zags on the near side */}
      <path d={zigTop} fill="none" stroke={PAINT} strokeWidth="6" />
      {/* Zig-zags on the far side */}
      <path d={zigBottom} fill="none" stroke={PAINT} strokeWidth="6" />
      {/* Alternating black/white zebra stripes */}
      <g>
        {[
          { x: 12, fill: PAINT },
          { x: 32, fill: ROAD },
          { x: 52, fill: PAINT },
          { x: 72, fill: ROAD },
          { x: 92, fill: PAINT },
          { x: 112, fill: ROAD },
          { x: 132, fill: PAINT },
          { x: 152, fill: ROAD },
          { x: 172, fill: PAINT },
        ].map((s, i) => (
          <rect key={i} x={s.x} y="80" width="18" height="52" fill={s.fill} />
        ))}
      </g>
    </Frame>
  );
}

export function YellowBoxJunction() {
  // DVSA yellow box: yellow border with evenly-spaced diagonal cross-hatch
  // painted inside. Rendered with a clip path so nothing bleeds outside the
  // box, and drawn from both diagonals so the pattern reads as an X-hatch
  // (matches Traffic Signs Manual chapter 5 illustrations).
  const x0 = 22;
  const y0 = 22;
  const w = 156;
  const spacing = 18;
  const diagCount = Math.ceil((w * 2) / spacing);
  const forward: number[] = [];
  const backward: number[] = [];
  for (let i = 1; i < diagCount; i++) forward.push(i * spacing);
  for (let i = 1; i < diagCount; i++) backward.push(i * spacing);
  return (
    <Frame>
      <defs>
        <clipPath id="ybj-clip">
          <rect x={x0} y={y0} width={w} height={w} />
        </clipPath>
      </defs>
      <g clipPath="url(#ybj-clip)" stroke={YELLOW} strokeWidth="3" strokeLinecap="square">
        {forward.map((k) => (
          <line key={"f" + k} x1={x0 + k - w} y1={y0} x2={x0 + k} y2={y0 + w} />
        ))}
        {backward.map((k) => (
          <line key={"b" + k} x1={x0 + k} y1={y0} x2={x0 + k - w} y2={y0 + w} />
        ))}
      </g>
      <rect
        x={x0}
        y={y0}
        width={w}
        height={w}
        fill="none"
        stroke={YELLOW}
        strokeWidth="6"
      />
    </Frame>
  );
}

// ── KERB LINES ────────────────────────────────────────

function KerbBase({ children }: { children: ReactNode }) {
  return (
    <Frame>
      <rect x="0" y="0" width="200" height="40" fill={KERB} />
      <rect x="0" y="38" width="200" height="4" fill="#4b5563" />
      {children}
    </Frame>
  );
}

export function SingleYellow() {
  return (
    <KerbBase>
      <rect x="0" y="52" width="200" height="6" fill={YELLOW} />
    </KerbBase>
  );
}

export function DoubleYellow() {
  return (
    <KerbBase>
      <rect x="0" y="50" width="200" height="6" fill={YELLOW} />
      <rect x="0" y="62" width="200" height="6" fill={YELLOW} />
    </KerbBase>
  );
}

export function RedRoute() {
  return (
    <KerbBase>
      <rect x="0" y="50" width="200" height="6" fill={RED} />
      <rect x="0" y="62" width="200" height="6" fill={RED} />
    </KerbBase>
  );
}

export function BusLane() {
  // Red tarmac lane with white boundary lines and painted 'BUS LANE' text,
  // plus a mounted blue time-plate sign showing the operating hours.
  const LANE_LEFT = 8;
  const LANE_RIGHT = 122;
  const RED_TARMAC = "#b91c1c";
  const SIGN_BLUE = "#1d4ed8";
  const signX = 134;
  const signY = 40;
  const signW = 58;
  const signH = 118;
  return (
    <Frame>
      {/* Red painted bus-lane surface */}
      <rect
        x={LANE_LEFT + 6}
        y="0"
        width={LANE_RIGHT - LANE_LEFT - 12}
        height="200"
        fill={RED_TARMAC}
      />
      {/* Solid white boundary lines */}
      <rect x={LANE_LEFT} y="0" width="6" height="200" fill={PAINT} />
      <rect x={LANE_RIGHT - 6} y="0" width="6" height="200" fill={PAINT} />
      {/* 'BUS LANE' text painted on the tarmac */}
      <text
        x={(LANE_LEFT + LANE_RIGHT) / 2}
        y="98"
        textAnchor="middle"
        fill={PAINT}
        style={{ font: '700 18px "Arial Narrow", Arial, sans-serif', letterSpacing: 2 }}
      >
        BUS
      </text>
      <text
        x={(LANE_LEFT + LANE_RIGHT) / 2}
        y="120"
        textAnchor="middle"
        fill={PAINT}
        style={{ font: '700 18px "Arial Narrow", Arial, sans-serif', letterSpacing: 2 }}
      >
        LANE
      </text>

      {/* Blue time-plate sign mounted alongside the lane */}
      <g>
        {/* Sign post */}
        <rect x={signX + signW / 2 - 2} y={signY + signH} width="4" height="46" fill="#4b5563" />
        {/* Sign panel */}
        <rect
          x={signX}
          y={signY}
          width={signW}
          height={signH}
          rx="2"
          fill={SIGN_BLUE}
          stroke={PAINT}
          strokeWidth="2"
        />
        {/* Bus icon */}
        <g transform={`translate(${signX + 12} ${signY + 10})`}>
          <rect x="0" y="4" width="34" height="16" rx="2" fill={PAINT} />
          <rect x="3" y="7" width="9" height="6" fill={SIGN_BLUE} />
          <rect x="14" y="7" width="9" height="6" fill={SIGN_BLUE} />
          <rect x="25" y="7" width="6" height="6" fill={SIGN_BLUE} />
          <circle cx="7" cy="21" r="2.5" fill={SIGN_BLUE} />
          <circle cx="27" cy="21" r="2.5" fill={SIGN_BLUE} />
        </g>
        {/* Divider under bus */}
        <line
          x1={signX + 6}
          y1={signY + 42}
          x2={signX + signW - 6}
          y2={signY + 42}
          stroke={PAINT}
          strokeWidth="1"
          opacity="0.7"
        />
        {/* Hours (stacked, always fits) */}
        <text
          x={signX + signW / 2}
          y={signY + 56}
          textAnchor="middle"
          fill={PAINT}
          style={{ font: '700 9px Arial, sans-serif', letterSpacing: 0.5 }}
        >
          Mon – Sat
        </text>
        <text
          x={signX + signW / 2}
          y={signY + 74}
          textAnchor="middle"
          fill={PAINT}
          style={{ font: '700 11px Arial, sans-serif' }}
        >
          7 am
        </text>
        <text
          x={signX + signW / 2}
          y={signY + 88}
          textAnchor="middle"
          fill={PAINT}
          style={{ font: '700 11px Arial, sans-serif' }}
        >
          –
        </text>
        <text
          x={signX + signW / 2}
          y={signY + 104}
          textAnchor="middle"
          fill={PAINT}
          style={{ font: '700 11px Arial, sans-serif' }}
        >
          4 pm
        </text>
      </g>
    </Frame>
  );
}

// ── WORDS / SPECIAL ──────────────────────────────────

export function RoundaboutTriangles() {
  // Highway Code style aerial diagram of a mini-roundabout: a crossroads with
  // green verges, dashed centre lines on every approach, give-way triangles
  // (shark's teeth) on all four entries, and a solid white painted disc with
  // clockwise arrows sweeping around it.
  const cx = 100;
  const cy = 100;
  const GRASS = "#4a7a44";
  const GRASS_DARK = "#3d6538";
  const ISLAND_R = 16;

  // A single give-way triangle pointing "forward" (up). We rotate the group
  // to place a row on each of the four approaches.
  const Teeth = ({ transform }: { transform: string }) => (
    <g transform={transform} fill={PAINT}>
      {[-18, -6, 6, 18].map((x) => (
        <polygon key={x} points={`${x - 4.5},0 ${x + 4.5},0 ${x},8`} />
      ))}
    </g>
  );

  return (
    <Frame>
      {/* Grass verges in the four corners */}
      <g fill={GRASS}>
        <rect x="0" y="0" width="70" height="70" />
        <rect x="130" y="0" width="70" height="70" />
        <rect x="0" y="130" width="70" height="70" />
        <rect x="130" y="130" width="70" height="70" />
      </g>
      {/* Softer grass shading blob for a hand-drawn Highway Code feel */}
      <g fill={GRASS_DARK} opacity="0.55">
        <circle cx="18" cy="20" r="14" />
        <circle cx="182" cy="22" r="12" />
        <circle cx="20" cy="180" r="13" />
        <circle cx="180" cy="182" r="15" />
      </g>

      {/* Round the four inner grass corners so the carriageway curves into the
          junction naturally, like the Highway Code plate */}
      <g fill={ROAD}>
        <path d="M 70 0 L 70 70 A 18 18 0 0 0 88 52 L 88 0 Z" />
        <path d="M 112 0 L 112 52 A 18 18 0 0 0 130 70 L 130 0 Z" />
        <path d="M 70 200 L 70 130 A 18 18 0 0 1 88 148 L 88 200 Z" />
        <path d="M 112 200 L 112 148 A 18 18 0 0 1 130 130 L 130 200 Z" />
      </g>

      {/* Kerb lines around the cross-shaped carriageway */}
      <g stroke={KERB} strokeWidth="1.2" fill="none" opacity="0.55">
        <path d="M 0 70 L 70 70 A 18 18 0 0 1 88 88 L 88 112 A 18 18 0 0 1 70 130 L 0 130" />
        <path d="M 200 70 L 130 70 A 18 18 0 0 0 112 88 L 112 112 A 18 18 0 0 0 130 130 L 200 130" />
        <path d="M 70 0 L 70 70 A 18 18 0 0 0 88 88 L 112 88 A 18 18 0 0 0 130 70 L 130 0" />
        <path d="M 70 200 L 70 130 A 18 18 0 0 1 88 112 L 112 112 A 18 18 0 0 1 130 130 L 130 200" />
      </g>

      {/* Dashed white centre line on each approach */}
      <g fill={PAINT}>
        {[8, 26, 44].map((y) => (
          <rect key={`n${y}`} x="98.5" y={y} width="3" height="9" />
        ))}
        {[148, 166, 184].map((y) => (
          <rect key={`s${y}`} x="98.5" y={y} width="3" height="9" />
        ))}
        {[8, 26, 44].map((x) => (
          <rect key={`w${x}`} x={x} y="98.5" width="9" height="3" />
        ))}
        {[148, 166, 184].map((x) => (
          <rect key={`e${x}`} x={x} y="98.5" width="9" height="3" />
        ))}
      </g>

      {/* Give-way shark's teeth on every approach, pointing toward the island */}
      <Teeth transform={`translate(${cx} 62)`} />
      <Teeth transform={`translate(138 ${cy}) rotate(90)`} />
      <Teeth transform={`translate(${cx} 138) rotate(180)`} />
      <Teeth transform={`translate(62 ${cy}) rotate(270)`} />

      {/* Four clockwise directional arrows sweeping around the island */}
      <g fill="none" stroke={PAINT} strokeWidth="2.6" strokeLinecap="butt">
        <path d="M 100 74 A 26 26 0 0 1 126 100" />
        <path d="M 126 100 A 26 26 0 0 1 100 126" />
        <path d="M 100 126 A 26 26 0 0 1 74 100" />
        <path d="M 74 100 A 26 26 0 0 1 100 74" />
      </g>
      <g fill={PAINT}>
        {/* Arrow heads at the end of each quadrant sweep */}
        <polygon points="122,96 132,100 122,104" />
        <polygon points="104,122 100,132 96,122" />
        <polygon points="78,104 68,100 78,96" />
        <polygon points="96,78 100,68 104,78" />
      </g>

      {/* Solid white painted mini-roundabout disc */}
      <circle cx={cx} cy={cy} r={ISLAND_R + 1} fill="#dfe3e6" />
      <circle cx={cx} cy={cy} r={ISLAND_R} fill={PAINT} />
    </Frame>
  );
}

export function KeepClear() {
  return (
    <Frame>
      <text
        x="100"
        y="90"
        textAnchor="middle"
        fill={PAINT}
        style={{ font: "700 26px sans-serif", letterSpacing: 3 }}
      >
        KEEP
      </text>
      <text
        x="100"
        y="130"
        textAnchor="middle"
        fill={PAINT}
        style={{ font: "700 26px sans-serif", letterSpacing: 3 }}
      >
        CLEAR
      </text>
    </Frame>
  );
}