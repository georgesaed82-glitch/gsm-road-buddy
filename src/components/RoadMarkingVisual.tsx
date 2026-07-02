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
  // Zig-zags approaching a zebra crossing.
  const zig = "M10 60 L30 80 L50 60 L70 80 L90 60 L110 80 L130 60 L150 80 L170 60 L190 80";
  return (
    <Frame>
      <path d={zig} fill="none" stroke={PAINT} strokeWidth="6" />
      <g>
        {[10, 40, 70, 100, 130, 160].map((x) => (
          <rect key={x} x={x} y="120" width="24" height="50" fill={PAINT} />
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
  // Aerial plan of a mini-roundabout junction: four approach roads meeting
  // at a circular painted island, with give-way triangles on every approach,
  // lane centre lines, and clockwise arrows sweeping around the island.
  const cx = 100;
  const cy = 100;
  const GRASS = "#3b6b3f";
  const ISLAND_R = 22;

  // Give-way triangle rows (shark's teeth) — one row per approach, pointing
  // toward the driver's direction of travel (i.e. toward the island).
  const TeethRow = ({
    transform,
  }: {
    transform: string;
  }) => (
    <g transform={transform} fill={PAINT}>
      {[-24, -8, 8, 24].map((x) => (
        <polygon key={x} points={`${x - 5},0 ${x + 5},0 ${x},9`} />
      ))}
    </g>
  );

  return (
    <Frame>
      {/* Grass verges in the four corners (everything outside the +-shaped road) */}
      <g fill={GRASS}>
        <rect x="0" y="0" width="60" height="60" />
        <rect x="140" y="0" width="60" height="60" />
        <rect x="0" y="140" width="60" height="60" />
        <rect x="140" y="140" width="60" height="60" />
      </g>
      {/* Soften the corners where verge meets tarmac with quarter-circle fills */}
      <g fill={ROAD}>
        <path d="M 60 0 L 60 60 A 20 20 0 0 0 80 40 L 80 0 Z" />
        <path d="M 140 0 L 140 40 A 20 20 0 0 0 160 60 L 200 60 L 200 0 Z" transform="translate(-60 0)" />
      </g>

      {/* Kerb lines around the +-shaped carriageway */}
      <g stroke={KERB} strokeWidth="2" fill="none">
        <path d="M 0 60 L 60 60 A 14 14 0 0 1 74 74 L 74 126 A 14 14 0 0 1 60 140 L 0 140" />
        <path d="M 200 60 L 140 60 A 14 14 0 0 0 126 74 L 126 126 A 14 14 0 0 0 140 140 L 200 140" />
      </g>

      {/* Broken centre lines down each approach */}
      <g fill={PAINT}>
        {/* North approach */}
        {[6, 26, 46].map((y) => (
          <rect key={`n${y}`} x="98" y={y} width="4" height="10" />
        ))}
        {/* South approach */}
        {[144, 164, 184].map((y) => (
          <rect key={`s${y}`} x="98" y={y} width="4" height="10" />
        ))}
        {/* West approach */}
        {[6, 26, 46].map((x) => (
          <rect key={`w${x}`} x={x} y="98" width="10" height="4" />
        ))}
        {/* East approach */}
        {[144, 164, 184].map((x) => (
          <rect key={`e${x}`} x={x} y="98" width="10" height="4" />
        ))}
      </g>

      {/* Give-way shark's-teeth on every approach, positioned just outside the island */}
      <TeethRow transform={`translate(${cx} 56) rotate(0)`} />
      <TeethRow transform={`translate(144 ${cy}) rotate(90)`} />
      <TeethRow transform={`translate(${cx} 144) rotate(180)`} />
      <TeethRow transform={`translate(56 ${cy}) rotate(270)`} />

      {/* Clockwise directional arrows sweeping around the island */}
      <g fill="none" stroke={PAINT} strokeWidth="4" strokeLinecap="butt">
        <path d="M 100 66 A 34 34 0 0 1 133 98" />
        <path d="M 134 102 A 34 34 0 0 1 102 134" />
        <path d="M 98 134 A 34 34 0 0 1 66 102" />
        <path d="M 66 98 A 34 34 0 0 1 98 66" />
      </g>
      <g fill={PAINT}>
        <polygon points="128,94 140,94 134,106" />
        <polygon points="106,128 106,140 94,134" />
        <polygon points="72,106 60,106 66,94" />
        <polygon points="94,72 94,60 106,66" />
      </g>

      {/* Solid white painted mini-roundabout island with subtle ring */}
      <circle cx={cx} cy={cy} r={ISLAND_R} fill={PAINT} />
      <circle cx={cx} cy={cy} r={ISLAND_R - 4} fill="none" stroke={ROAD} strokeWidth="0.75" opacity="0.4" />
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