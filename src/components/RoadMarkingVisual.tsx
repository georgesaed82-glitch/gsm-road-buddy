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
  // Two dashed give-way lines + big inverted triangle painted on the road.
  // Along the approach: a solid YELLOW line on the left edge (no-waiting)
  // and a WHITE broken hazard-warning line on the right, both running from
  // the bottom of the frame up to the give-way transverse marking.
  return (
    <Frame>
      {/* Solid yellow line on the left edge, up to the give-way line */}
      <rect x="14" y="94" width="6" height="106" fill={YELLOW} />

      {/* White broken hazard-warning line on the right, up to the give-way line */}
      <g>
        {[94, 116, 138, 160, 182].map((y) => (
          <rect key={y} x="180" y={y} width="6" height="14" fill={PAINT} />
        ))}
      </g>

      {/* Give-way transverse: two rows of dashes */}
      <g>
        {[10, 40, 70, 100, 130, 160].map((x) => (
          <rect key={x} x={x} y="70" width="18" height="8" fill={PAINT} />
        ))}
        {[10, 40, 70, 100, 130, 160].map((x) => (
          <rect key={x + "b"} x={x} y="86" width="18" height="8" fill={PAINT} />
        ))}
      </g>

      {/* Give-way inverted triangle */}
      <polygon points="60,120 140,120 100,180" fill={PAINT} />
    </Frame>
  );
}

export function StopLine() {
  return (
    <Frame>
      {/* Solid yellow line on the left edge, up to the stop line */}
      <rect x="14" y="94" width="6" height="106" fill={YELLOW} />

      {/* White broken hazard-warning line on the right, up to the stop line */}
      <g>
        {[94, 116, 138, 160, 182].map((y) => (
          <rect key={y} x="180" y={y} width="6" height="14" fill={PAINT} />
        ))}
      </g>

      {/* Transverse stop line — single solid white bar */}
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
  // Aerial diagram of a UK mini-roundabout: a solid white painted disc at
  // the centre of a small crossroads, with a give-way ("shark's teeth")
  // triangle row on every approach and a curved arrow following the ring.
  const cx = 100;
  const cy = 100;
  const discR = 22;
  // Give-way "shark's teeth" — a row of solid white triangles pointing back
  // at the approaching driver, drawn once and rotated for each approach.
  function TeethRow() {
    const teeth = [];
    for (let i = -2; i <= 2; i++) {
      const x = i * 12;
      teeth.push(
        <polygon key={i} points={`${x - 4},0 ${x + 4},0 ${x},9`} fill={PAINT} />,
      );
    }
    return <g>{teeth}</g>;
  }
  const armWidth = 46;
  return (
    <Frame>
      {/* Grass corners (four squares) leaving a cross-shaped tarmac road */}
      {[
        { x: 0, y: 0 },
        { x: 200 - 77, y: 0 },
        { x: 0, y: 200 - 77 },
        { x: 200 - 77, y: 200 - 77 },
      ].map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={77} height={77} fill="#3a5a2a" />
      ))}

      {/* Centre-line dashes running out along each of the four arms */}
      {/* N + S */}
      {[6, 26, 46].map((y) => (
        <rect key={`n${y}`} x={cx - 2} y={y} width="4" height="10" fill={PAINT} />
      ))}
      {[148, 168, 188].map((y) => (
        <rect key={`s${y}`} x={cx - 2} y={y} width="4" height="10" fill={PAINT} />
      ))}
      {/* E + W */}
      {[6, 26, 46].map((x) => (
        <rect key={`w${x}`} x={x} y={cy - 2} width="10" height="4" fill={PAINT} />
      ))}
      {[148, 168, 188].map((x) => (
        <rect key={`e${x}`} x={x} y={cy - 2} width="10" height="4" fill={PAINT} />
      ))}

      {/* Give-way triangle rows on each approach, pointing back at the driver */}
      <g transform={`translate(${cx} ${cy - discR - 26})`}>
        <TeethRow />
      </g>
      <g transform={`translate(${cx} ${cy + discR + 17}) rotate(180)`}>
        <TeethRow />
      </g>
      <g transform={`translate(${cx - discR - 26} ${cy}) rotate(-90)`}>
        <TeethRow />
      </g>
      <g transform={`translate(${cx + discR + 17} ${cy}) rotate(90)`}>
        <TeethRow />
      </g>

      {/* Solid white painted disc at the centre */}
      <circle cx={cx} cy={cy} r={discR} fill={PAINT} />

      {/* Curved clockwise direction arrow around the disc */}
      <g fill="none" stroke={ROAD} strokeWidth="3" opacity="0.85">
        <path d={`M ${cx + discR - 2} ${cy - 4} A ${discR - 4} ${discR - 4} 0 1 1 ${cx - 4} ${cy - discR + 2}`} />
      </g>
      <polygon
        points={`${cx - 8},${cy - discR + 2} ${cx - 2},${cy - discR - 4} ${cx + 2},${cy - discR + 4}`}
        fill={ROAD}
      />
      {/* Suppress the unused-armWidth constant (kept for future tuning) */}
      <g style={{ display: "none" }} data-arm-width={armWidth} />
    </Frame>
  );
}

export function KeepClear() {
  return (
    <Frame>
      {/* Solid transverse stop-style lines top and bottom */}
      <rect x="30" y="50" width="140" height="6" fill={PAINT} />
      <rect x="30" y="144" width="140" height="6" fill={PAINT} />
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

// ── LANE ARROWS & SPECIAL AREAS ───────────────────────

function StraightArrow({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  // Long straight-ahead arrow painted on the road (elongated, DVSA style).
  const s = scale;
  const path = `
    M ${x} ${y - 55 * s}
    L ${x - 12 * s} ${y - 35 * s}
    L ${x - 5 * s} ${y - 35 * s}
    L ${x - 5 * s} ${y + 55 * s}
    L ${x + 5 * s} ${y + 55 * s}
    L ${x + 5 * s} ${y - 35 * s}
    L ${x + 12 * s} ${y - 35 * s}
    Z
  `;
  return <path d={path} fill={PAINT} />;
}

function StraightRightArrow({ x, y }: { x: number; y: number }) {
  // Elongated arrow with both straight-ahead head and a right-turn head.
  const path = `
    M ${x} ${y - 55}
    L ${x - 12} ${y - 35}
    L ${x - 5} ${y - 35}
    L ${x - 5} ${y + 55}
    L ${x + 5} ${y + 55}
    L ${x + 5} ${y - 8}
    L ${x + 28} ${y - 8}
    L ${x + 28} ${y - 2}
    L ${x + 48} ${y - 14}
    L ${x + 28} ${y - 26}
    L ${x + 28} ${y - 20}
    L ${x + 5} ${y - 20}
    L ${x + 5} ${y - 35}
    L ${x + 12} ${y - 35}
    Z
  `;
  return <path d={path} fill={PAINT} />;
}

export function StraightAheadTwoLanes() {
  // Two-lane carriageway, both lanes straight ahead. Left = normal driving,
  // right = overtaking (Highway Code rule 137).
  return (
    <Frame>
      {/* Edge lines */}
      <rect x="16" y="0" width="4" height="200" fill={PAINT} />
      <rect x="180" y="0" width="4" height="200" fill={PAINT} />
      {/* Broken lane divider */}
      {[0, 30, 60, 90, 120, 150, 180].map((y) => (
        <rect key={y} x="98" y={y} width="4" height="16" fill={PAINT} />
      ))}
      {/* Straight arrows in each lane */}
      <StraightArrow x={60} y={120} />
      <StraightArrow x={140} y={120} />
    </Frame>
  );
}

export function StraightAndRightLanes() {
  // Two-lane approach: left lane straight ahead, right lane straight or right.
  return (
    <Frame>
      <rect x="16" y="0" width="4" height="200" fill={PAINT} />
      <rect x="180" y="0" width="4" height="200" fill={PAINT} />
      {[0, 30, 60, 90, 120, 150, 180].map((y) => (
        <rect key={y} x="98" y={y} width="4" height="16" fill={PAINT} />
      ))}
      {/* Left lane: straight only */}
      <StraightArrow x={60} y={130} />
      {/* Right lane: right-turn arrow (head to the right) */}
      <g>
        {/* Shaft */}
        <rect x="135" y="95" width="10" height="80" fill={PAINT} />
        {/* Right-turn arm */}
        <rect x="135" y="95" width="30" height="10" fill={PAINT} />
        {/* Arrow head pointing right */}
        <polygon points="160,85 180,100 160,115" fill={PAINT} />
      </g>
    </Frame>
  );
}

export function MergeShortDashes() {
  // Highway Code / DES illustration of a slip road JOINING a main
  // carriageway. Traffic flows UP the page.
  //   • Solid white kerbside line down the left of the slip road, curving
  //     up to become the nearside edge of the main carriageway.
  //   • Solid white line down the right (offside) edge of the main road.
  //   • Long broken lane line (long dash, short gap — diag. 1004/1042)
  //     between the two through lanes of the main carriageway.
  //   • Short broken line (short dash, long gap — diag. 1010) along the
  //     merge, separating the acceleration lane from the through lane
  //     until the slip road fully merges.
  //   • Directional arrows painted in each lane.
  return (
    <Frame>
      {/* Tarmac shading behind the markings for clarity */}
      <rect x="0" y="0" width="200" height="200" fill="#2a2a2a" />

      {/* Grass verge to the left of the slip road (below the curve) */}
      <path
        d="M 0 200 L 0 0 L 78 0 C 40 70 20 130 18 200 Z"
        fill="#3a5a2a"
        opacity="0.55"
      />

      {/* Solid kerbside (left) edge — curves up from bottom-left and
          becomes the nearside edge of the main carriageway at the top */}
      <path
        d="M 20 200 C 22 150 40 90 82 0"
        stroke={PAINT}
        strokeWidth="4"
        fill="none"
        strokeLinecap="butt"
      />

      {/* Solid offside (right) edge of the main carriageway */}
      <path d="M 180 0 L 180 200" stroke={PAINT} strokeWidth="4" fill="none" />

      {/* Long broken lane line between the two through lanes
          (long dash, short gap) */}
      <path
        d="M 140 -8 L 140 210"
        stroke={PAINT}
        strokeWidth="4"
        fill="none"
        strokeDasharray="30 10"
      />

      {/* Merge line — short dashes with long gaps, following the taper
          of the acceleration lane and ending where the slip road fully
          joins the nearside lane */}
      <path
        d="M 92 200 C 70 150 82 100 100 40"
        stroke={PAINT}
        strokeWidth="4"
        fill="none"
        strokeDasharray="10 18"
        strokeLinecap="butt"
      />

      {/* Directional arrow in the through lane */}
      <StraightArrow x={158} y={120} scale={0.7} />

      {/* Directional arrow in the slip road, tilted with the curve */}
      <g transform="translate(70 150) rotate(-22)">
        <StraightArrow x={0} y={0} scale={0.6} />
      </g>
    </Frame>
  );
}

export function HatchedAreaSolid() {
  // Highway Code / DES illustration: a lozenge-shaped hatched island sits
  // between two lanes of traffic. It is bordered by a SOLID white line
  // (MUST NOT enter except in an emergency — rule 130) and filled with
  // chevrons that POINT BACK against the direction of travel.
  return (
    <Frame>
      {/* Road edges */}
      <rect x="16" y="0" width="4" height="200" fill={PAINT} />
      <rect x="180" y="0" width="4" height="200" fill={PAINT} />
      {/* Long-dash lane lines running past the island on both sides */}
      {[0, 40, 80, 120, 160].map((y) => (
        <g key={`ll-${y}`}>
          <rect x="46" y={y} width="3" height="24" fill={PAINT} />
          <rect x="151" y={y} width="3" height="24" fill={PAINT} />
        </g>
      ))}
      {/* Solid border of the hatched island (lozenge) */}
      <path
        d="M 100 20 L 128 55 L 128 145 L 100 180 L 72 145 L 72 55 Z"
        fill="none"
        stroke={PAINT}
        strokeWidth="4"
      />
      {/* Chevrons pointing UP-back against the direction of travel */}
      <g clipPath="url(#hatch-solid-clip)">
        {[30, 50, 70, 90, 110, 130, 150, 170].map((y) => (
          <polyline
            key={y}
            points={`72,${y + 18} 100,${y} 128,${y + 18}`}
            fill="none"
            stroke={PAINT}
            strokeWidth="3"
          />
        ))}
      </g>
      <defs>
        <clipPath id="hatch-solid-clip">
          <path d="M 100 20 L 128 55 L 128 145 L 100 180 L 72 145 L 72 55 Z" />
        </clipPath>
      </defs>
      {/* Direction-of-travel arrows on each side */}
      <StraightArrow x={28} y={90} scale={0.55} />
      <StraightArrow x={158} y={90} scale={0.55} />
    </Frame>
  );
}