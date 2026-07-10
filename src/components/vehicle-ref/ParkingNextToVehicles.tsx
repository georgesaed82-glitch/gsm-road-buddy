import { type ReactNode } from "react";

/**
 * "Parking Next to Vehicles" — professional UK driving-manual style SVG art.
 *
 * Three illustrations sit on a shared 1600×900 stage so they can be zoomed
 * without any pixel loss. Each illustration is an original hand-crafted
 * scene — no traced photos, no third-party marks.
 *
 *  1. <DriverView />   – Driver's-eye POV from a UK right-hand-drive cockpit
 *                        (windscreen, wheel, mirrors, dash), sitting behind
 *                        another parked car with the kerb hugging the left
 *                        side of the road.
 *  2. <TopView />      – Aerial plan showing the learner's car parked
 *                        between two vehicles, correct offset to the UK
 *                        left-hand kerb, with metric callouts.
 *  3. <CombinedView /> – Split composite that ties the driver view's
 *                        reference point to the same real-world position
 *                        on the plan below.
 *
 * Each accepts `showRef` so the yellow reference overlay can be toggled.
 */

// ── Palette ──────────────────────────────────────────────────────────────
const SKY_1 = "#a9c7dc";
const SKY_2 = "#dee7ec";
const TARMAC = "#3a3b3f";
const TARMAC_DK = "#26272a";
const TARMAC_LT = "#4a4b50";
const PAINT = "#eeece1";
const KERB_TOP = "#c9cdd1";
const KERB_FACE = "#8f9399";
const KERB_SHADOW = "#1c1e21";
const PAVEMENT = "#a8a49a";
const PAVEMENT_DK = "#8a8578";
const DASH_LEATHER_1 = "#141821";
const DASH_LEATHER_2 = "#05070c";
const WHEEL_1 = "#181c25";
const WHEEL_2 = "#05070b";
const A_PILLAR = "#0a0d13";
const HEADLINER = "#1a2029";
const GLASS_TINT = "#c8dbe8";
const GOLD = "#E4A93A";
const GOLD_GLOW = "#f7d16b";
const RED = "#c53a34";
const CAR_1 = "#264155"; // dark teal parked in front
const CAR_1_DK = "#152633";
const CAR_2 = "#8a1f26"; // maroon parked behind
const CAR_2_DK = "#4d0f14";
const CAR_OWN = "#0f2135"; // GSM navy for own car (top view)
const CAR_OWN_DK = "#050e19";

// ── Reusable defs (gradients, patterns, filters) ─────────────────────────
function SharedDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={SKY_1} />
        <stop offset="1" stopColor={SKY_2} />
      </linearGradient>
      <linearGradient id={`tarmac-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={TARMAC_LT} />
        <stop offset="0.6" stopColor={TARMAC} />
        <stop offset="1" stopColor={TARMAC_DK} />
      </linearGradient>
      <linearGradient id={`dash-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={DASH_LEATHER_1} />
        <stop offset="1" stopColor={DASH_LEATHER_2} />
      </linearGradient>
      <radialGradient id={`wheel-${id}`} cx="0.5" cy="0.4" r="0.7">
        <stop offset="0" stopColor="#2c323d" />
        <stop offset="1" stopColor={WHEEL_2} />
      </radialGradient>
      <radialGradient id={`bonnet-${id}`} cx="0.5" cy="0" r="1">
        <stop offset="0" stopColor="#1b2532" stopOpacity="0.9" />
        <stop offset="1" stopColor="#050709" />
      </radialGradient>
      <linearGradient id={`glass-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#eaf3fa" stopOpacity="0.9" />
        <stop offset="1" stopColor={GLASS_TINT} stopOpacity="0.35" />
      </linearGradient>
      <linearGradient id={`car1-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#365b74" />
        <stop offset="1" stopColor={CAR_1_DK} />
      </linearGradient>
      <linearGradient id={`car2-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#a53039" />
        <stop offset="1" stopColor={CAR_2_DK} />
      </linearGradient>
      <linearGradient id={`carOwn-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1a3550" />
        <stop offset="1" stopColor={CAR_OWN_DK} />
      </linearGradient>
      <pattern id={`tarmac-tex-${id}`} width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="transparent" />
        <circle cx="1" cy="2" r="0.5" fill="#5a5b60" opacity="0.55" />
        <circle cx="4" cy="4" r="0.4" fill="#2b2c30" opacity="0.6" />
        <circle cx="3" cy="1" r="0.3" fill="#6a6b70" opacity="0.4" />
      </pattern>
      <filter id={`soft-${id}`} x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="0.6" />
      </filter>
      <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
    </defs>
  );
}

// ── Reference overlay primitives ────────────────────────────────────────
function RefBadge({
  x,
  y,
  label,
  align = "center",
}: {
  x: number;
  y: number;
  label: string;
  align?: "left" | "center" | "right";
}) {
  const anchor = align === "left" ? "start" : align === "right" ? "end" : "middle";
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={anchor === "start" ? 0 : anchor === "end" ? -280 : -140}
        y={-18}
        width={280}
        height={26}
        rx={4}
        fill="#000"
        opacity={0.82}
      />
      <text
        x={anchor === "start" ? 12 : anchor === "end" ? -12 : 0}
        y={0}
        textAnchor={anchor}
        fontSize={14}
        fontWeight={800}
        fontFamily="'Inter','Helvetica Neue',Arial,sans-serif"
        fill={GOLD}
        letterSpacing={1.5}
      >
        {label}
      </text>
    </g>
  );
}

function RefDot({ x, y, r = 14 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r + 8} fill={GOLD} opacity={0.18} />
      <circle cx={x} cy={y} r={r} fill="none" stroke={GOLD} strokeWidth={3} />
      <circle cx={x} cy={y} r={4} fill={GOLD} />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 1) DRIVER VIEW — POV inside a UK RHD car, kerb-side, behind a parked car
// ─────────────────────────────────────────────────────────────────────────

function OutsideWorld({ id }: { id: string }) {
  // The world seen through the windscreen. Perspective vanishes near the
  // upper centre. Everything drawn here should live inside the windscreen clip.
  return (
    <g>
      {/* Sky */}
      <rect x="0" y="0" width="1600" height="620" fill={`url(#sky-${id})`} />

      {/* Distant buildings (soft blurred silhouettes) */}
      <g opacity="0.55" filter={`url(#soft-${id})`}>
        <rect x="120" y="360" width="180" height="120" fill="#7b8390" />
        <rect x="300" y="330" width="140" height="150" fill="#8a92a0" />
        <rect x="440" y="370" width="220" height="110" fill="#727a88" />
        <rect x="820" y="345" width="170" height="135" fill="#7d8593" />
        <rect x="990" y="360" width="240" height="120" fill="#858d9c" />
        <rect x="1230" y="335" width="180" height="145" fill="#6d7583" />
      </g>

      {/* Trees */}
      <g opacity="0.75">
        <ellipse cx="90" cy="440" rx="70" ry="55" fill="#3f5a3a" />
        <ellipse cx="1500" cy="450" rx="80" ry="60" fill="#3f5a3a" />
        <ellipse cx="1350" cy="430" rx="55" ry="42" fill="#4a6a44" />
      </g>

      {/* Pavement on the left (with slight perspective) */}
      <polygon points="0,540 640,470 640,620 0,620" fill={PAVEMENT} />
      <polygon points="0,540 640,470 640,478 0,548" fill={PAVEMENT_DK} opacity={0.6} />

      {/* Kerb face (the tall vertical part of the kerb, catching shadow) */}
      <polygon points="0,560 640,478 640,494 0,576" fill={KERB_FACE} />
      {/* Kerb top (thin cream line where it meets the road edge) */}
      <polygon points="0,576 640,494 640,502 0,584" fill={KERB_TOP} />

      {/* Road surface (large trapezoid, textured) */}
      <polygon points="640,494 1050,494 1600,900 0,900 0,584" fill={`url(#tarmac-${id})`} />
      <polygon
        points="640,494 1050,494 1600,900 0,900 0,584"
        fill={`url(#tarmac-tex-${id})`}
        opacity="0.75"
      />

      {/* Kerb cast shadow onto the road */}
      <polygon points="0,584 640,502 640,520 0,606" fill={KERB_SHADOW} opacity={0.55} />

      {/* Centre line — worn white dashes with perspective */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const t = i / 5;
        const y = 500 + t * 380;
        const x = 830 + t * 20;
        const w = 30 + t * 130;
        const h = 12 + t * 22;
        return (
          <rect key={i} x={x - w / 2} y={y} width={w} height={h} fill={PAINT} opacity={0.88 - t * 0.15} rx={2} />
        );
      })}

      {/* Right-hand kerb far away (opposite side of road) */}
      <polygon points="1050,494 1600,494 1600,540 1050,510" fill={PAVEMENT_DK} opacity={0.4} />

      {/* Parked car in front of us (viewed from directly behind) */}
      <g transform="translate(360 380)">
        {/* Shadow on the road */}
        <ellipse cx="180" cy="245" rx="230" ry="18" fill="#000" opacity={0.35} />

        {/* Rear of the car — trapezoidal body with perspective */}
        <path
          d="M 30 60 Q 180 44 330 60 L 340 210 Q 180 224 20 210 Z"
          fill={`url(#car1-${id})`}
          stroke={CAR_1_DK}
          strokeWidth={1.5}
        />
        {/* Roof/curve highlight */}
        <path
          d="M 50 62 Q 180 50 310 62 L 300 78 Q 180 68 60 78 Z"
          fill="#4a7290"
          opacity={0.7}
        />
        {/* Rear window */}
        <path
          d="M 70 62 Q 180 52 290 62 L 275 118 Q 180 108 85 118 Z"
          fill={`url(#glass-${id})`}
          stroke={CAR_1_DK}
          strokeWidth={1}
        />
        {/* Rear window reflection */}
        <path d="M 85 68 L 265 68 L 245 78 L 100 78 Z" fill="#ffffff" opacity={0.35} />

        {/* Boot / tailgate line */}
        <path
          d="M 25 155 Q 180 168 335 155"
          fill="none"
          stroke={CAR_1_DK}
          strokeWidth={1.5}
        />

        {/* Tail lights */}
        <rect x="35" y="150" width="70" height="18" rx="3" fill={RED} />
        <rect x="35" y="150" width="70" height="18" rx="3" fill="url(#tl1)" opacity={0.5} />
        <rect x="255" y="150" width="70" height="18" rx="3" fill={RED} />

        {/* Reversing lights (small clear) */}
        <rect x="105" y="156" width="18" height="10" rx="1" fill="#f3f0e0" opacity={0.9} />
        <rect x="237" y="156" width="18" height="10" rx="1" fill="#f3f0e0" opacity={0.9} />

        {/* Number plate (yellow UK rear plate) */}
        <rect x="140" y="182" width="80" height="20" rx="2" fill="#f4d55a" stroke="#000" strokeWidth={0.8} />
        <text
          x="180"
          y="197"
          textAnchor="middle"
          fontSize="13"
          fontWeight="800"
          fontFamily="'Inter',Arial,sans-serif"
          fill="#000"
          letterSpacing={1}
        >
          GSM 1
        </text>

        {/* Bumper */}
        <path
          d="M 25 205 Q 180 222 335 205 L 340 220 Q 180 236 20 220 Z"
          fill={CAR_1_DK}
        />

        {/* Wheel arches / tyres peeking below */}
        <path d="M 30 215 Q 60 235 90 215" fill="#0a0a0a" />
        <path d="M 270 215 Q 300 235 330 215" fill="#0a0a0a" />
      </g>

      {/* A pedestrian on the pavement in the distance for scale */}
      <g transform="translate(300 500)" opacity={0.85}>
        <ellipse cx="0" cy="34" rx="10" ry="3" fill="#000" opacity={0.3} />
        <rect x="-4" y="-2" width="8" height="24" fill="#3b556e" rx={2} />
        <circle cx="0" cy="-8" r="5" fill="#c99b7a" />
        <rect x="-4" y="22" width="3" height="10" fill="#1c2530" />
        <rect x="1" y="22" width="3" height="10" fill="#1c2530" />
      </g>
    </g>
  );
}

function CockpitFrame({ id }: { id: string }) {
  return (
    <g>
      {/* Windscreen frame outline (dark rubber trim) */}
      <path
        d="M 140 60 Q 800 30 1460 60 L 1420 620 L 180 620 Z"
        fill="none"
        stroke="#000"
        strokeWidth={3}
        opacity={0.85}
      />

      {/* Interior rear-view mirror (with a hint of the world reflected) */}
      <g transform="translate(720 68)">
        <rect x="0" y="0" width="160" height="46" rx="8" fill={HEADLINER} stroke="#000" strokeWidth={1.4} />
        <rect x="6" y="6" width="148" height="34" rx="4" fill="#5c6b7a" />
        {/* fake reflection */}
        <rect x="8" y="8" width="146" height="16" fill={SKY_2} opacity={0.9} />
        <rect x="8" y="24" width="146" height="16" fill={TARMAC} opacity={0.9} />
        <rect x="8" y="24" width="146" height="3" fill={KERB_TOP} />
      </g>

      {/* Left A-pillar (thick, angled inward at top) */}
      <path d="M 0 0 L 240 60 L 180 620 L 0 620 Z" fill={A_PILLAR} />
      <path d="M 60 40 L 234 82 L 200 620 L 60 620 Z" fill="#0f1420" />
      {/* Left pillar inner trim highlight */}
      <path d="M 220 68 L 226 68 L 190 618 L 184 618 Z" fill="#2a3040" opacity={0.6} />

      {/* Right A-pillar (thicker on driver side for RHD) */}
      <path d="M 1600 0 L 1360 60 L 1420 620 L 1600 620 Z" fill={A_PILLAR} />
      <path d="M 1540 40 L 1370 82 L 1400 620 L 1540 620 Z" fill="#0f1420" />
      <path d="M 1380 68 L 1374 68 L 1410 618 L 1416 618 Z" fill="#2a3040" opacity={0.6} />

      {/* Roof headliner strip */}
      <path d="M 0 0 L 1600 0 L 1600 62 Q 800 34 0 62 Z" fill={HEADLINER} />
      {/* Sun visor hints */}
      <rect x="220" y="20" width="360" height="34" rx="6" fill="#2b3341" opacity={0.9} />
      <rect x="1020" y="20" width="360" height="34" rx="6" fill="#2b3341" opacity={0.9} />

      {/* Left door mirror housing (as seen from inside — sits over the pillar/edge) */}
      <g transform="translate(30 380)">
        <path
          d="M 0 0 L 160 -6 Q 176 12 168 60 Q 90 84 -6 62 Z"
          fill="#0f151d"
          stroke="#000"
          strokeWidth={1.5}
        />
        <path
          d="M 12 8 L 148 4 Q 158 20 152 52 Q 82 70 4 52 Z"
          fill="#9db4c8"
        />
        {/* mirror content: bit of road + kerb + rear of another car */}
        <g clipPath={`url(#lm-clip-${id})`}>
          <rect x="12" y="8" width="146" height="52" fill={SKY_2} />
          <rect x="12" y="30" width="146" height="34" fill={TARMAC} />
          <rect x="12" y="30" width="146" height="4" fill={KERB_TOP} />
          <rect x="12" y="34" width="146" height="3" fill={KERB_FACE} />
          {/* rear of car parked behind us */}
          <path d="M 30 34 Q 90 22 150 34 L 155 60 L 30 60 Z" fill={CAR_2} />
          <rect x="60" y="42" width="60" height="10" fill={CAR_2_DK} />
        </g>
        <text
          x="80"
          y="78"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill="#fff"
          opacity={0.75}
          fontFamily="'Inter',Arial,sans-serif"
          letterSpacing={1.5}
        >
          LEFT MIRROR
        </text>
      </g>

      {/* Right door mirror housing (driver-side, larger and closer) */}
      <g transform="translate(1408 384)">
        <path
          d="M 0 -6 L 160 0 Q 176 30 168 66 Q 90 84 -6 62 Z"
          fill="#0f151d"
          stroke="#000"
          strokeWidth={1.5}
        />
        <path
          d="M 12 4 L 148 8 Q 158 30 152 58 Q 82 70 4 52 Z"
          fill="#9db4c8"
        />
        <g clipPath={`url(#rm-clip-${id})`}>
          <rect x="12" y="4" width="146" height="56" fill={SKY_2} />
          <rect x="12" y="30" width="146" height="34" fill={TARMAC} />
          {/* centre line in far distance */}
          <rect x="70" y="36" width="24" height="4" fill={PAINT} />
          <rect x="70" y="46" width="24" height="4" fill={PAINT} />
        </g>
        <text
          x="80"
          y="80"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill="#fff"
          opacity={0.75}
          fontFamily="'Inter',Arial,sans-serif"
          letterSpacing={1.5}
        >
          RIGHT MIRROR
        </text>
      </g>

      {/* Dashboard — sculpted with a top ridge, hooded cluster, centre stack */}
      <path
        d="M 0 610 L 1600 610 L 1600 900 L 0 900 Z"
        fill={`url(#dash-${id})`}
      />
      {/* Ridge line where dash meets windscreen */}
      <path
        d="M 180 620 Q 800 640 1420 620"
        fill="none"
        stroke="#000"
        strokeWidth={2}
      />
      {/* Bonnet peek — top of car nose visible through lower windscreen */}
      <path
        d="M 180 620 Q 800 700 1420 620 L 1420 640 Q 800 730 180 640 Z"
        fill={`url(#bonnet-${id})`}
      />

      {/* Instrument cluster (behind wheel — RHD side, upper right area) */}
      <g transform="translate(1120 640)">
        {/* Hood over cluster */}
        <path
          d="M -220 0 Q 0 -24 220 0 L 210 20 L -210 20 Z"
          fill={DASH_LEATHER_2}
          stroke="#000"
          strokeWidth={1}
        />
        <rect x="-210" y="20" width="420" height="120" rx="10" fill="#05070c" />
        {/* Two dials */}
        <g transform="translate(-100 80)">
          <circle r="52" fill="#0d1218" stroke="#1a2028" strokeWidth={2} />
          <circle r="52" fill="none" stroke={GOLD_GLOW} strokeWidth={2} opacity={0.35} />
          <text y="6" textAnchor="middle" fontSize="20" fontWeight="700" fill="#fff" fontFamily="'Inter',Arial,sans-serif">
            30
          </text>
          <text y="24" textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="'Inter',Arial,sans-serif" letterSpacing={2}>
            MPH
          </text>
          <line x1="0" y1="0" x2="-30" y2="-20" stroke={GOLD} strokeWidth={2.2} strokeLinecap="round" />
        </g>
        <g transform="translate(100 80)">
          <circle r="52" fill="#0d1218" stroke="#1a2028" strokeWidth={2} />
          <text y="6" textAnchor="middle" fontSize="16" fontWeight="700" fill="#fff" fontFamily="'Inter',Arial,sans-serif">
            1.2
          </text>
          <text y="24" textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="'Inter',Arial,sans-serif" letterSpacing={2}>
            RPM
          </text>
          <line x1="0" y1="0" x2="-24" y2="-16" stroke={GOLD} strokeWidth={2.2} strokeLinecap="round" />
        </g>
      </g>

      {/* Centre stack / infotainment (LHD passenger side visible slightly) */}
      <g transform="translate(720 680)">
        <rect x="-90" y="0" width="180" height="90" rx="8" fill="#0a0d13" stroke="#1a2028" strokeWidth={1.2} />
        <rect x="-82" y="8" width="164" height="60" rx="4" fill="#131a24" />
        <circle cx="-52" cy="38" r="10" fill="#1e2836" />
        <circle cx="-52" cy="38" r="4" fill={GOLD} opacity={0.6} />
        <rect x="-30" y="30" width="90" height="4" rx="2" fill="#2a3648" />
        <rect x="-30" y="42" width="70" height="4" rx="2" fill="#2a3648" />
      </g>

      {/* Steering wheel — RHD, sits on right side */}
      <g transform="translate(1120 830)">
        {/* Column */}
        <rect x="-30" y="-40" width="60" height="80" rx="6" fill="#0b0f16" opacity={0.9} />
        {/* Outer rim (thick, leather-wrapped) */}
        <circle r="140" fill="none" stroke={`url(#wheel-${id})`} strokeWidth={24} />
        <circle r="140" fill="none" stroke="#000" strokeWidth={2} opacity={0.9} />
        <circle r="128" fill="none" stroke="#3a4356" strokeWidth={1.2} opacity={0.5} />
        {/* Stitching hint */}
        <circle r="152" fill="none" stroke={GOLD} strokeWidth={0.5} strokeDasharray="1 6" opacity={0.4} />
        {/* Spokes — 3-spoke classic UK layout */}
        <path d="M -140 0 L -44 -22 L -44 22 Z" fill={WHEEL_1} />
        <path d="M 140 0 L 44 -22 L 44 22 Z" fill={WHEEL_1} />
        <path d="M 0 140 L -22 44 L 22 44 Z" fill={WHEEL_1} />
        {/* Hub */}
        <circle r="46" fill={`url(#wheel-${id})`} stroke="#000" strokeWidth={1.5} />
        <rect x="-30" y="-14" width="60" height="26" rx="4" fill="#050709" />
        <text
          y="4"
          textAnchor="middle"
          fontSize="14"
          fontWeight={900}
          fill={GOLD}
          letterSpacing={2}
          fontFamily="'Inter',Arial,sans-serif"
        >
          GSM
        </text>
        {/* Highlight on top of rim */}
        <path d="M -80 -110 A 140 140 0 0 1 80 -110" stroke="#3f4a5e" strokeWidth={4} fill="none" opacity={0.6} />
      </g>

      {/* Gear selector hint on left of driver */}
      <g transform="translate(870 830)">
        <rect x="-40" y="-30" width="80" height="80" rx="10" fill="#0e131a" stroke="#000" strokeWidth={1} />
        <ellipse cx="0" cy="-4" rx="14" ry="18" fill="#2a3040" />
        <text y="30" textAnchor="middle" fontSize="9" fill="#8ea0b4" letterSpacing={2} fontFamily="'Inter',Arial,sans-serif">
          P R N D
        </text>
      </g>

      {/* Small dashboard air-vents */}
      <g fill="#0a0d13">
        <rect x="380" y="640" width="120" height="26" rx="4" />
        <rect x="1360" y="640" width="120" height="26" rx="4" />
        <g stroke="#2a3040" strokeWidth={1}>
          <line x1="386" y1="646" x2="494" y2="646" />
          <line x1="386" y1="654" x2="494" y2="654" />
          <line x1="386" y1="660" x2="494" y2="660" />
          <line x1="1366" y1="646" x2="1474" y2="646" />
          <line x1="1366" y1="654" x2="1474" y2="654" />
          <line x1="1366" y1="660" x2="1474" y2="660" />
        </g>
      </g>

      {/* Mirror clip defs */}
      <defs>
        <clipPath id={`lm-clip-${id}`}>
          <path d="M 12 8 L 148 4 Q 158 20 152 52 Q 82 70 4 52 Z" />
        </clipPath>
        <clipPath id={`rm-clip-${id}`}>
          <path d="M 12 4 L 148 8 Q 158 30 152 58 Q 82 70 4 52 Z" />
        </clipPath>
      </defs>
    </g>
  );
}

export function DriverView({ showRef = true }: { showRef?: boolean }) {
  const id = "dv";
  return (
    <svg viewBox="0 0 1600 900" className="h-full w-full" role="img" aria-label="Driver's view — parking next to vehicles">
      <SharedDefs id={id} />
      <defs>
        <clipPath id={`ws-${id}`}>
          <path d="M 140 60 Q 800 30 1460 60 L 1420 620 L 180 620 Z" />
        </clipPath>
        <linearGradient id="tl1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8a80" />
          <stop offset="1" stopColor={RED} />
        </linearGradient>
      </defs>

      {/* Windscreen scene */}
      <g clipPath={`url(#ws-${id})`}>
        <OutsideWorld id={id} />
      </g>

      {/* Cockpit frame overlays windscreen */}
      <CockpitFrame id={id} />

      {/* Reference overlay: kerb meets a specific point on the dashboard */}
      {showRef && (
        <g>
          {/* Guide line down the kerb into the reference point on the bonnet ridge */}
          <line
            x1={300}
            y1={556}
            x2={620}
            y2={624}
            stroke={GOLD}
            strokeWidth={3}
            strokeDasharray="10 8"
            opacity={0.95}
          />
          <RefDot x={620} y={624} r={16} />
          <RefBadge x={620} y={594} label="KERB LINE ↔ DASH EDGE" />

          {/* Secondary: rear of parked car sits centred in the windscreen */}
          <line
            x1={540}
            y1={430}
            x2={880}
            y2={430}
            stroke={GOLD}
            strokeWidth={2}
            strokeDasharray="4 6"
            opacity={0.7}
          />
          <text
            x={880}
            y={424}
            fontSize={12}
            fontWeight={700}
            fill={GOLD}
            fontFamily="'Inter',Arial,sans-serif"
            letterSpacing={1}
          >
            2 CAR-LENGTHS AHEAD
          </text>

          {/* Left mirror callout */}
          <line
            x1={200}
            y1={430}
            x2={340}
            y2={520}
            stroke={GOLD}
            strokeWidth={2}
            strokeDasharray="4 6"
            opacity={0.7}
          />
          <text
            x={344}
            y={520}
            fontSize={12}
            fontWeight={700}
            fill={GOLD}
            fontFamily="'Inter',Arial,sans-serif"
            letterSpacing={1}
          >
            KERB THROUGH LOWER THIRD
          </text>
        </g>
      )}

      {/* Corner labels */}
      <g fontFamily="'Inter',Arial,sans-serif">
        <rect x="30" y="30" width="240" height="30" rx="4" fill="#000" opacity={0.7} />
        <text x="42" y="52" fontSize={13} fontWeight={800} fill={GOLD} letterSpacing={2}>
          DRIVER VIEW · UK RHD
        </text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 2) TOP VIEW — aerial plan of the same scenario
// ─────────────────────────────────────────────────────────────────────────

function ParkedCarTop({
  x,
  y,
  angle = 0,
  bodyGrad,
  bodyDark,
  plate,
}: {
  x: number;
  y: number;
  angle?: number;
  bodyGrad: string;
  bodyDark: string;
  plate?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {/* Shadow */}
      <rect x={-92} y={-198} width={184} height={396} rx={30} fill="#000" opacity={0.22} transform="translate(6 8)" />
      {/* Body */}
      <rect x={-88} y={-194} width={176} height={388} rx={28} fill={bodyGrad} stroke={bodyDark} strokeWidth={1.5} />
      {/* Bonnet */}
      <rect x={-80} y={-186} width={160} height={80} rx={8} fill={bodyDark} opacity={0.35} />
      {/* Windscreen */}
      <path d="M -70 -100 L 70 -100 L 60 -40 L -60 -40 Z" fill={GLASS_TINT} opacity={0.75} />
      {/* Roof */}
      <rect x={-64} y={-34} width={128} height={78} rx={8} fill={bodyDark} opacity={0.55} />
      {/* Rear window */}
      <path d="M -60 50 L 60 50 L 70 108 L -70 108 Z" fill={GLASS_TINT} opacity={0.6} />
      {/* Boot */}
      <rect x={-80} y={116} width={160} height={70} rx={8} fill={bodyDark} opacity={0.35} />
      {/* Wing mirrors */}
      <rect x={-96} y={-70} width={12} height={18} rx={3} fill={bodyDark} />
      <rect x={84} y={-70} width={12} height={18} rx={3} fill={bodyDark} />
      {/* Wheels visible */}
      <rect x={-92} y={-140} width={8} height={26} fill="#0a0a0a" />
      <rect x={84} y={-140} width={8} height={26} fill="#0a0a0a" />
      <rect x={-92} y={112} width={8} height={26} fill="#0a0a0a" />
      <rect x={84} y={112} width={8} height={26} fill="#0a0a0a" />
      {/* Front bumper hint */}
      <rect x={-70} y={-196} width={140} height={6} rx={2} fill={bodyDark} />
      {plate && (
        <>
          <rect x={-30} y={184} width={60} height={14} rx={2} fill="#f4d55a" stroke="#000" strokeWidth={0.6} />
          <text
            y={195}
            textAnchor="middle"
            fontSize={9}
            fontWeight={700}
            fill="#000"
            fontFamily="'Inter',Arial,sans-serif"
            letterSpacing={0.5}
          >
            {plate}
          </text>
        </>
      )}
    </g>
  );
}

export function TopView({ showRef = true }: { showRef?: boolean }) {
  const id = "tv";
  return (
    <svg viewBox="0 0 1600 900" className="h-full w-full" role="img" aria-label="Top-down plan — parking next to vehicles">
      <SharedDefs id={id} />

      {/* Ground / gardens */}
      <rect x="0" y="0" width="1600" height="900" fill="#c7c1b0" />
      {/* Property wall / hedge along top */}
      <rect x="0" y="0" width="1600" height="60" fill="#4f6a45" />
      <rect x="0" y="60" width="1600" height="8" fill="#3a4f34" />

      {/* Pavement */}
      <rect x="0" y="68" width="1600" height="130" fill={PAVEMENT} />
      {/* Paving tile lines */}
      <g stroke={PAVEMENT_DK} strokeWidth={0.8} opacity={0.6}>
        {Array.from({ length: 22 }).map((_, i) => (
          <line key={i} x1={i * 80} y1="68" x2={i * 80} y2="198" />
        ))}
        <line x1="0" y1="130" x2="1600" y2="130" />
      </g>

      {/* Kerb (viewed from above — thin band with cast shadow) */}
      <rect x="0" y="198" width="1600" height="10" fill={KERB_TOP} />
      <rect x="0" y="208" width="1600" height="4" fill={KERB_FACE} />
      <rect x="0" y="212" width="1600" height="4" fill="#000" opacity={0.25} />

      {/* Road surface */}
      <rect x="0" y="216" width="1600" height="600" fill={`url(#tarmac-${id})`} />
      <rect x="0" y="216" width="1600" height="600" fill={`url(#tarmac-tex-${id})`} opacity={0.85} />

      {/* Far kerb + pavement on opposite side */}
      <rect x="0" y="812" width="1600" height="4" fill="#000" opacity={0.25} />
      <rect x="0" y="816" width="1600" height="4" fill={KERB_FACE} />
      <rect x="0" y="820" width="1600" height="10" fill={KERB_TOP} />
      <rect x="0" y="830" width="1600" height="70" fill={PAVEMENT} />

      {/* Centre dashed line */}
      <g fill={PAINT}>
        {Array.from({ length: 18 }).map((_, i) => (
          <rect key={i} x={40 + i * 90} y={510} width={50} height={8} rx={2} />
        ))}
      </g>

      {/* Parked car IN FRONT of learner (facing left = points to top of image / same direction as travel) */}
      <ParkedCarTop x={520} y={430} angle={0} bodyGrad={`url(#car1-${id})`} bodyDark={CAR_1_DK} plate="GSM 1" />

      {/* Parked car BEHIND learner */}
      <ParkedCarTop x={1140} y={430} angle={0} bodyGrad={`url(#car2-${id})`} bodyDark={CAR_2_DK} plate="LN 22" />

      {/* Learner's own car in between */}
      <ParkedCarTop x={830} y={430} angle={0} bodyGrad={`url(#carOwn-${id})`} bodyDark={CAR_OWN_DK} />
      {/* GSM badge on own car */}
      <g transform="translate(830 430)">
        <rect x={-24} y={-4} width={48} height={22} rx={4} fill={GOLD} />
        <text
          y={12}
          textAnchor="middle"
          fontSize={13}
          fontWeight={900}
          fill={CAR_OWN_DK}
          fontFamily="'Inter',Arial,sans-serif"
          letterSpacing={1.5}
        >
          GSM
        </text>
      </g>

      {/* Reference overlays */}
      {showRef && (
        <g fontFamily="'Inter',Arial,sans-serif">
          {/* Kerb-to-tyre offset callout */}
          <line x1={742} y1={236} x2={742} y2={290} stroke={GOLD} strokeWidth={3} />
          <line x1={735} y1={236} x2={749} y2={236} stroke={GOLD} strokeWidth={3} />
          <line x1={735} y1={290} x2={749} y2={290} stroke={GOLD} strokeWidth={3} />
          <rect x={758} y={248} width={144} height={30} rx={4} fill="#000" opacity={0.82} />
          <text x={766} y={268} fontSize={14} fontWeight={800} fill={GOLD} letterSpacing={1}>
            30–50 cm
          </text>

          {/* 50 cm behind car in front */}
          <line x1={670} y1={430} x2={738} y2={430} stroke={GOLD} strokeWidth={3} />
          <line x1={670} y1={422} x2={670} y2={438} stroke={GOLD} strokeWidth={3} />
          <line x1={738} y1={422} x2={738} y2={438} stroke={GOLD} strokeWidth={3} />
          <rect x={670} y={392} width={90} height={26} rx={4} fill="#000" opacity={0.82} />
          <text x={678} y={410} fontSize={13} fontWeight={800} fill={GOLD} letterSpacing={1}>
            ≈ 0.5 m
          </text>

          {/* 50 cm ahead of car behind */}
          <line x1={922} y1={430} x2={990} y2={430} stroke={GOLD} strokeWidth={3} />
          <line x1={922} y1={422} x2={922} y2={438} stroke={GOLD} strokeWidth={3} />
          <line x1={990} y1={422} x2={990} y2={438} stroke={GOLD} strokeWidth={3} />
          <rect x={922} y={392} width={90} height={26} rx={4} fill="#000" opacity={0.82} />
          <text x={930} y={410} fontSize={13} fontWeight={800} fill={GOLD} letterSpacing={1}>
            ≈ 0.5 m
          </text>

          {/* Parallel-to-kerb indicator (arrow along car body) */}
          <line
            x1={830}
            y1={630}
            x2={830}
            y2={720}
            stroke={GOLD}
            strokeWidth={2}
            strokeDasharray="6 6"
          />
          <rect x={720} y={730} width={220} height={30} rx={4} fill="#000" opacity={0.82} />
          <text x={730} y={750} fontSize={13} fontWeight={800} fill={GOLD} letterSpacing={1}>
            PARALLEL TO KERB
          </text>

          {/* Scale bar */}
          <g transform="translate(60 840)">
            <rect width={200} height={12} fill="#fff" stroke="#000" />
            <rect x={0} width={100} height={12} fill="#000" />
            <text x={0} y={-6} fontSize={11} fontWeight={700} fill="#000">
              0
            </text>
            <text x={100} y={-6} fontSize={11} fontWeight={700} fill="#000" textAnchor="middle">
              1 m
            </text>
            <text x={200} y={-6} fontSize={11} fontWeight={700} fill="#000" textAnchor="end">
              2 m
            </text>
          </g>

          {/* North / driving direction arrow */}
          <g transform="translate(1500 840)">
            <circle r={30} fill="#fff" stroke="#000" strokeWidth={1.5} />
            <path d="M 0 -18 L 8 6 L 0 0 L -8 6 Z" fill={CAR_OWN_DK} />
            <text y={26} textAnchor="middle" fontSize={11} fontWeight={800} fill="#000">
              TRAFFIC ↑
            </text>
          </g>
        </g>
      )}

      {/* Corner label */}
      <g fontFamily="'Inter',Arial,sans-serif">
        <rect x="30" y="30" width="230" height="30" rx="4" fill="#000" opacity={0.75} />
        <text x="42" y="52" fontSize={13} fontWeight={800} fill={GOLD} letterSpacing={2}>
          TOP-DOWN PLAN · UK
        </text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 3) COMBINED — Driver POV + Top-down plan tied together
// ─────────────────────────────────────────────────────────────────────────

export function CombinedView(): ReactNode {
  return (
    <svg viewBox="0 0 1600 1800" className="h-full w-full" role="img" aria-label="Combined view — why the reference works">
      {/* Top half — driver view (scaled) */}
      <g>
        <DriverView showRef={true} />
      </g>
      {/* Divider */}
      <g transform="translate(0 900)">
        <rect x="0" y="0" width="1600" height="24" fill="#0f2135" />
        <text
          x="800"
          y="17"
          textAnchor="middle"
          fontSize={13}
          fontWeight={800}
          fill={GOLD}
          fontFamily="'Inter',Arial,sans-serif"
          letterSpacing={3}
        >
          WHAT YOU SEE  ↕  WHERE YOU ARE
        </text>
      </g>
      {/* Bottom half — top-down plan */}
      <g transform="translate(0 924)">
        <TopView showRef={true} />
      </g>

      {/* Correlation lines linking the reference dot in driver view to
          the same real-world point on the top-down plan */}
      <g stroke={GOLD} strokeWidth={2} fill="none" strokeDasharray="8 6" opacity={0.85}>
        <line x1={620} y1={624} x2={742} y2={924 + 260} />
        <line x1={880} y1={430} x2={670} y2={924 + 430} />
        <line x1={340} y1={520} x2={1140} y2={924 + 430} />
      </g>
    </svg>
  );
}

export const ParkingNextToVehicles = { DriverView, TopView, CombinedView };
