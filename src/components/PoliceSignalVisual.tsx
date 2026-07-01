/**
 * Simple, on-brand SVG illustrations of the arm signals a police officer
 * (or authorised person) uses to direct traffic — matching Highway Code
 * rules 105–108.
 *
 * All figures are rendered on the same 200×200 viewBox with the same
 * head/torso proportions so the poses read as a single set.
 */

const SKIN = "#f5d0a9";
const UNIFORM = "#1e3a8a"; // police navy
const HAT = "#0f172a";
const HI_VIS = "#facc15";
const BG = "#e2e8f0";

type PoseProps = {
  /** Which arms to draw and how. */
  leftArm: "down" | "up" | "out-front" | "out-side" | "wave-in";
  rightArm: "down" | "up" | "out-front" | "out-side" | "wave-in";
  facing?: "front" | "side";
};

function armPath(side: "left" | "right", pose: PoseProps["leftArm"]): string {
  // Shoulder pivot per side.
  const sx = side === "left" ? 88 : 112;
  const sy = 92;

  // Hand endpoint per pose.
  let hx = sx;
  let hy = 140;
  switch (pose) {
    case "down":
      hx = sx + (side === "left" ? -6 : 6);
      hy = 148;
      break;
    case "up":
      hx = sx + (side === "left" ? -8 : 8);
      hy = 30;
      break;
    case "out-front":
      hx = 100;
      hy = 92; // arm across body
      break;
    case "out-side":
      hx = side === "left" ? 32 : 168;
      hy = 92;
      break;
    case "wave-in":
      hx = side === "left" ? 40 : 160;
      hy = 74; // slight bend upward, mid-wave
      break;
  }
  return `M${sx} ${sy} L${hx} ${hy}`;
}

function Officer({ leftArm, rightArm }: PoseProps) {
  return (
    <svg viewBox="0 0 200 200" className="block h-full w-full" role="img" aria-hidden="true">
      <rect width="200" height="200" fill={BG} />
      {/* Hi-vis vest silhouette */}
      <path d="M76 92 L124 92 L128 150 L72 150 Z" fill={HI_VIS} />
      {/* Torso under vest */}
      <path d="M78 92 L122 92 L124 150 L76 150 Z" fill={UNIFORM} opacity="0.35" />
      {/* Neck */}
      <rect x="95" y="78" width="10" height="14" fill={SKIN} />
      {/* Head */}
      <circle cx="100" cy="68" r="14" fill={SKIN} />
      {/* Hat */}
      <path d="M84 60 Q100 44 116 60 L120 66 L80 66 Z" fill={HAT} />
      <rect x="82" y="64" width="36" height="4" fill={HAT} />
      {/* Legs */}
      <rect x="86" y="150" width="10" height="34" fill={HAT} />
      <rect x="104" y="150" width="10" height="34" fill={HAT} />
      {/* Arms */}
      <path
        d={armPath("left", leftArm)}
        stroke={UNIFORM}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={armPath("right", rightArm)}
        stroke={UNIFORM}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      {/* Gloves — small dots at end of each arm */}
      <ArmHand side="left" pose={leftArm} />
      <ArmHand side="right" pose={rightArm} />
    </svg>
  );
}

function ArmHand({ side, pose }: { side: "left" | "right"; pose: PoseProps["leftArm"] }) {
  const sx = side === "left" ? 88 : 112;
  let hx = sx;
  let hy = 140;
  switch (pose) {
    case "down":
      hx = sx + (side === "left" ? -6 : 6); hy = 148; break;
    case "up":
      hx = sx + (side === "left" ? -8 : 8); hy = 30; break;
    case "out-front":
      hx = 100; hy = 92; break;
    case "out-side":
      hx = side === "left" ? 32 : 168; hy = 92; break;
    case "wave-in":
      hx = side === "left" ? 40 : 160; hy = 74; break;
  }
  return <circle cx={hx} cy={hy} r="7" fill={SKIN} />;
}

// ── Named poses ──────────────────────────────────────

export function StopFromFront() {
  return <Officer facing="front" leftArm="down" rightArm="up" />;
}
export function StopFromBehind() {
  // Same silhouette but arm faces the other way — represented by the left arm up.
  return <Officer facing="front" leftArm="up" rightArm="down" />;
}
export function StopFromBoth() {
  return <Officer facing="front" leftArm="up" rightArm="up" />;
}
export function BeckonFromSide() {
  // Right arm extended out to the side, waving traffic on from the officer's right.
  return <Officer facing="front" leftArm="down" rightArm="wave-in" />;
}
export function BeckonFromFront() {
  // Arm across the body — inviting traffic approaching from the front to come on.
  return <Officer facing="front" leftArm="down" rightArm="out-front" />;
}
export function BeckonFromBehind() {
  return <Officer facing="front" leftArm="wave-in" rightArm="down" />;
}
export function StopBothArmsOut() {
  // Arms straight out to each side — used to hold traffic from both sides.
  return <Officer facing="front" leftArm="out-side" rightArm="out-side" />;
}