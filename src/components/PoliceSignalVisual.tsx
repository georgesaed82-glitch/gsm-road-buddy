/**
 * Highway Code arm-signals — realistic SVG illustrations.
 *
 *   • Police / authorised-person signals   (rules 105–108)
 *   • Driver arm signals                    (rule 103)
 *
 * Every figure sits on the same 200×200 viewBox so the tiles line up.
 */

const SKIN = "#eab89a";
const SKIN_SHADE = "#c8926e";
const UNIFORM = "#0b2a5b"; // Metropolitan navy
const UNIFORM_DK = "#061a3d";
const HAT = "#0a0e17";
const HAT_BADGE = "#f4c93c";
const HI_VIS = "#facc15";
const HI_VIS_STRIPE = "#e5e7eb";
const TROUSER = "#12171f";
const BOOT = "#050505";
const BG = "#eef2f6";
const BG_LINE = "#dbe2ea";

type ArmPose = "down" | "up" | "out-side" | "across" | "wave";
type Facing = "front" | "back" | "side-left" | "side-right";

function OfficerBase({
  facing = "front",
  leftArm,
  rightArm,
}: {
  facing?: Facing;
  leftArm: ArmPose;
  rightArm: ArmPose;
}) {
  // Silhouette flips for the "back" view; the pose meanings stay the same.
  const back = facing === "back";
  return (
    <svg
      viewBox="0 0 200 200"
      className="block h-full w-full"
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
    >
      {/* Background with a subtle ground line */}
      <rect width="200" height="200" fill={BG} />
      <line x1="0" y1="184" x2="200" y2="184" stroke={BG_LINE} strokeWidth="2" />

      {/* Legs & boots */}
      <rect x="86" y="146" width="12" height="34" fill={TROUSER} />
      <rect x="102" y="146" width="12" height="34" fill={TROUSER} />
      <ellipse cx="92" cy="184" rx="10" ry="4" fill={BOOT} />
      <ellipse cx="108" cy="184" rx="10" ry="4" fill={BOOT} />

      {/* Torso — tapered, dark uniform */}
      <path
        d="M74 96 Q100 90 126 96 L130 150 Q100 156 70 150 Z"
        fill={UNIFORM}
      />
      {/* Hi-vis tabard */}
      <path
        d="M78 98 Q100 94 122 98 L124 148 Q100 152 76 148 Z"
        fill={HI_VIS}
      />
      {/* Reflective silver bands */}
      <rect x="78" y="118" width="46" height="4" fill={HI_VIS_STRIPE} />
      <rect x="78" y="134" width="46" height="4" fill={HI_VIS_STRIPE} />

      {/* Neck */}
      <path d="M94 82 L106 82 L108 92 L92 92 Z" fill={SKIN} />
      {/* Head */}
      <ellipse cx="100" cy="70" rx="13" ry="15" fill={SKIN} />
      {/* Jawline shading */}
      <path
        d="M89 74 Q100 88 111 74"
        fill="none"
        stroke={SKIN_SHADE}
        strokeWidth="1"
        opacity="0.55"
      />
      {!back && (
        <>
          {/* Eyes */}
          <circle cx="95" cy="70" r="1.4" fill={HAT} />
          <circle cx="105" cy="70" r="1.4" fill={HAT} />
          {/* Nose */}
          <path d="M100 72 L99 77 L101 77 Z" fill={SKIN_SHADE} opacity="0.6" />
          {/* Mouth */}
          <path
            d="M96 80 Q100 82 104 80"
            fill="none"
            stroke={SKIN_SHADE}
            strokeWidth="1"
          />
        </>
      )}

      {/* Peaked police cap */}
      <path
        d="M84 56 Q100 42 116 56 L118 62 L82 62 Z"
        fill={HAT}
      />
      {/* Cap band (Sillitoe tartan feel — simple black band) */}
      <rect x="82" y="62" width="36" height="5" fill={HAT} />
      {/* Peak */}
      <path d="M80 66 Q100 70 120 66 L122 68 L78 68 Z" fill={UNIFORM_DK} />
      {/* Cap badge */}
      <circle cx="100" cy="56" r="2.4" fill={HAT_BADGE} />

      {/* Collar tips */}
      <path d="M92 92 L100 100 L92 100 Z" fill={UNIFORM_DK} />
      <path d="M108 92 L100 100 L108 100 Z" fill={UNIFORM_DK} />

      {/* Arms — drawn AFTER torso so they sit on top */}
      <Arm side="left" pose={leftArm} />
      <Arm side="right" pose={rightArm} />
    </svg>
  );
}

/** Draw one arm as a tapered sleeve + skin cuff + gloved hand. */
function Arm({ side, pose }: { side: "left" | "right"; pose: ArmPose }) {
  // Shoulder pivots — inside the torso so the joint reads correctly.
  const sx = side === "left" ? 82 : 118;
  const sy = 100;

  // Hand + elbow endpoints per pose (elbow adds a subtle bend).
  const ends: Record<
    ArmPose,
    { ex: number; ey: number; hx: number; hy: number; palmRot: number }
  > = {
    down: {
      ex: sx + (side === "left" ? -4 : 4),
      ey: sy + 24,
      hx: sx + (side === "left" ? -6 : 6),
      hy: sy + 46,
      palmRot: 0,
    },
    up: {
      ex: sx + (side === "left" ? -6 : 6),
      ey: sy - 24,
      hx: sx + (side === "left" ? -8 : 8),
      hy: sy - 54,
      palmRot: 0, // palm facing outward (toward camera)
    },
    "out-side": {
      ex: side === "left" ? sx - 24 : sx + 24,
      ey: sy,
      hx: side === "left" ? sx - 52 : sx + 52,
      hy: sy,
      palmRot: side === "left" ? -90 : 90,
    },
    across: {
      ex: 100,
      ey: sy - 4,
      hx: side === "left" ? sx + 30 : sx - 30,
      hy: sy - 8,
      palmRot: side === "left" ? 90 : -90,
    },
    wave: {
      ex: side === "left" ? sx - 18 : sx + 18,
      ey: sy - 4,
      hx: side === "left" ? sx - 38 : sx + 38,
      hy: sy - 22,
      palmRot: side === "left" ? -60 : 60,
    },
  };

  const { ex, ey, hx, hy, palmRot } = ends[pose];

  return (
    <g>
      {/* Upper sleeve */}
      <path
        d={`M${sx - 6} ${sy - 4} L${sx + 6} ${sy - 4} L${ex + 4} ${ey} L${ex - 4} ${ey} Z`}
        fill={UNIFORM}
      />
      {/* Forearm sleeve */}
      <path
        d={`M${ex - 4} ${ey} L${ex + 4} ${ey} L${hx + 3} ${hy} L${hx - 3} ${hy} Z`}
        fill={UNIFORM}
      />
      {/* Elbow joint accent */}
      <circle cx={ex} cy={ey} r="4.5" fill={UNIFORM_DK} />
      {/* Cuff */}
      <circle cx={hx} cy={hy} r="4" fill={HI_VIS_STRIPE} />
      {/* Gloved hand — small palm rectangle rotated to face the traffic */}
      <g transform={`translate(${hx} ${hy}) rotate(${palmRot})`}>
        <rect x="-5" y="-2" width="10" height="12" rx="2" fill={HAT} />
        {/* Fingers hint */}
        <line x1="-3" y1="1" x2="-3" y2="9" stroke={HI_VIS_STRIPE} strokeWidth="0.6" />
        <line x1="0" y1="1" x2="0" y2="9" stroke={HI_VIS_STRIPE} strokeWidth="0.6" />
        <line x1="3" y1="1" x2="3" y2="9" stroke={HI_VIS_STRIPE} strokeWidth="0.6" />
      </g>
    </g>
  );
}

// ── Officer poses ────────────────────────────────────

export function StopFromFront() {
  return <OfficerBase facing="front" leftArm="down" rightArm="up" />;
}
export function StopFromBehind() {
  return <OfficerBase facing="back" leftArm="up" rightArm="down" />;
}
export function StopFromBoth() {
  return <OfficerBase facing="front" leftArm="up" rightArm="up" />;
}
export function StopBothArmsOut() {
  return <OfficerBase facing="front" leftArm="out-side" rightArm="out-side" />;
}
export function BeckonFromSide() {
  return <OfficerBase facing="front" leftArm="down" rightArm="wave" />;
}
export function BeckonFromFront() {
  return <OfficerBase facing="front" leftArm="down" rightArm="across" />;
}
export function BeckonFromBehind() {
  return <OfficerBase facing="back" leftArm="wave" rightArm="down" />;
}

// ── Driver arm signals (Highway Code rule 103) ─────────
//
// Rendered as a rear-3/4 view of a car with the driver's right arm
// extended through the open window. UK cars have the driver on the right
// so the arm exits the right-hand window.

type DriverPose = "slow" | "right" | "left";

function DriverBase({ pose }: { pose: DriverPose }) {
  const CAR_BODY = "#1e40af";
  const CAR_DARK = "#0f2454";
  const GLASS = "#93c5fd";
  const WHEEL = "#111827";
  const ARROW = "#dc2626";

  // Right (driver) window arm anchor — top-right of car
  const shoulderX = 148;
  const shoulderY = 96;

  // Pose geometry
  const arm = (() => {
    switch (pose) {
      case "right":
        // Straight out horizontal, palm forward
        return { hx: 190, hy: 96, elbowX: 168, elbowY: 96, palmRot: 90 };
      case "slow":
        // Extended out and downward, palm face-down
        return { hx: 190, hy: 128, elbowX: 168, elbowY: 112, palmRot: 180 };
      case "left":
        // Out then circling anti-clockwise (hand higher, rotating)
        return { hx: 188, hy: 76, elbowX: 168, elbowY: 92, palmRot: 45 };
    }
  })();

  return (
    <svg
      viewBox="0 0 200 200"
      className="block h-full w-full"
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
    >
      <rect width="200" height="200" fill={BG} />
      {/* Road */}
      <rect x="0" y="150" width="200" height="50" fill="#cbd5e1" />
      <line x1="0" y1="170" x2="200" y2="170" stroke={PAINT_STRIPE} strokeWidth="3" strokeDasharray="10 8" />

      {/* Car body — 3/4 rear view */}
      {/* Roof */}
      <path d="M46 68 Q100 46 158 68 L150 92 L54 92 Z" fill={CAR_BODY} />
      {/* Windows */}
      <path d="M58 72 Q100 56 146 72 L140 88 L64 88 Z" fill={GLASS} />
      <line x1="100" y1="60" x2="100" y2="88" stroke={CAR_DARK} strokeWidth="2" />
      {/* Lower body */}
      <path
        d="M32 92 L168 92 L176 138 Q100 152 24 138 Z"
        fill={CAR_BODY}
        stroke={CAR_DARK}
        strokeWidth="2"
      />
      {/* Boot line */}
      <line x1="30" y1="118" x2="170" y2="118" stroke={CAR_DARK} strokeWidth="1.5" />
      {/* Tail lights */}
      <rect x="34" y="102" width="14" height="8" rx="1.5" fill={ARROW} />
      <rect x="152" y="102" width="14" height="8" rx="1.5" fill={ARROW} />
      {/* Number plate */}
      <rect x="80" y="122" width="40" height="10" rx="1" fill="#fde68a" stroke={CAR_DARK} strokeWidth="1" />
      {/* Wheels */}
      <circle cx="52" cy="150" r="12" fill={WHEEL} />
      <circle cx="52" cy="150" r="4" fill="#4b5563" />
      <circle cx="148" cy="150" r="12" fill={WHEEL} />
      <circle cx="148" cy="150" r="4" fill="#4b5563" />

      {/* Driver's arm out the right window */}
      {/* Upper arm */}
      <path
        d={`M${shoulderX - 4} ${shoulderY - 4} L${shoulderX + 4} ${shoulderY - 4} L${arm.elbowX + 3} ${arm.elbowY} L${arm.elbowX - 3} ${arm.elbowY} Z`}
        fill={SKIN}
        stroke={SKIN_SHADE}
        strokeWidth="1"
      />
      {/* Forearm */}
      <path
        d={`M${arm.elbowX - 3} ${arm.elbowY} L${arm.elbowX + 3} ${arm.elbowY} L${arm.hx + 3} ${arm.hy} L${arm.hx - 3} ${arm.hy} Z`}
        fill={SKIN}
        stroke={SKIN_SHADE}
        strokeWidth="1"
      />
      {/* Elbow */}
      <circle cx={arm.elbowX} cy={arm.elbowY} r="3.5" fill={SKIN_SHADE} />
      {/* Hand / palm */}
      <g transform={`translate(${arm.hx} ${arm.hy}) rotate(${arm.palmRot})`}>
        <rect x="-6" y="-3" width="12" height="14" rx="3" fill={SKIN} stroke={SKIN_SHADE} strokeWidth="1" />
        <line x1="-3.5" y1="0" x2="-3.5" y2="10" stroke={SKIN_SHADE} strokeWidth="0.7" />
        <line x1="0" y1="0" x2="0" y2="10" stroke={SKIN_SHADE} strokeWidth="0.7" />
        <line x1="3.5" y1="0" x2="3.5" y2="10" stroke={SKIN_SHADE} strokeWidth="0.7" />
      </g>

      {/* Motion cues */}
      {pose === "slow" && (
        <g stroke={ARROW} strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M182 108 Q186 118 182 128" />
          <path d="M178 100 Q188 118 178 136" opacity="0.55" />
          <polygon points="182,132 178,124 186,124" fill={ARROW} />
        </g>
      )}
      {pose === "right" && (
        <g stroke={ARROW} strokeWidth="2.5" fill="none" strokeLinecap="round">
          <line x1="180" y1="80" x2="196" y2="80" />
          <polygon points="196,80 188,75 188,85" fill={ARROW} />
        </g>
      )}
      {pose === "left" && (
        <g stroke={ARROW} strokeWidth="2.5" fill="none" strokeLinecap="round">
          {/* Anti-clockwise circular arrow */}
          <path d="M194 70 A 12 12 0 1 0 178 60" />
          <polygon points="178,60 186,56 184,66" fill={ARROW} />
        </g>
      )}
    </svg>
  );
}

const PAINT_STRIPE = "#f8fafc";

// ── Driver poses ─────────────────────────────────────

export function DriverSlowingDown() {
  return <DriverBase pose="slow" />;
}
export function DriverTurningRight() {
  return <DriverBase pose="right" />;
}
export function DriverTurningLeft() {
  return <DriverBase pose="left" />;
}