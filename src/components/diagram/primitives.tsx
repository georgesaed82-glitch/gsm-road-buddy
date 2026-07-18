// ─────────────────────────────────────────────────────────────
// GSM Illustration System — shared diagram primitives.
// Every lesson animation renders through this small set of SVG
// primitives so the whole app looks like a single, professionally
// designed product. Palette, line weights, vehicle proportions,
// arrows, shadows and typography are locked here.
// ─────────────────────────────────────────────────────────────

import type { ReactNode } from "react";

export const COLORS = {
  road: "#2b2b2e",
  paint: "#f5f5f0",
  kerb: "#8b8f95",
  grass: "#3d6a2f",
  centralReservation: "#1e3a2a",
  ego: "#234B36",
  other: "#8a8f95",
  otherAlt: "#6d7a86",
  accent: "#C97845",
  good: "#22c55e",
  warn: "#f59e0b",
  bad: "#ef4444",
  hatch: "#c94a3a",
} as const;

export function NightSky({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
      </defs>
      <rect width={640} height={360} fill={`url(#${id})`} />
    </>
  );
}

export function GrassVerge({
  x = 0,
  y,
  width = 640,
  height = 30,
}: {
  x?: number;
  y: number;
  width?: number;
  height?: number;
}) {
  return <rect x={x} y={y} width={width} height={height} fill={COLORS.grass} opacity={0.7} />;
}

export function Road({
  x = 0,
  y,
  width = 640,
  height,
}: {
  x?: number;
  y: number;
  width?: number;
  height: number;
}) {
  return <rect x={x} y={y} width={width} height={height} fill={COLORS.road} />;
}

export function EdgeLine({
  x1,
  x2,
  y,
  dashed = false,
}: {
  x1: number;
  x2: number;
  y: number;
  dashed?: boolean;
}) {
  return (
    <line
      x1={x1}
      y1={y}
      x2={x2}
      y2={y}
      stroke={COLORS.paint}
      strokeWidth={1.6}
      strokeDasharray={dashed ? "10 8" : undefined}
    />
  );
}

export function CentreDashes({
  x1,
  x2,
  y,
  t = 0,
  dashLen = 20,
  gap = 40,
}: {
  x1: number;
  x2: number;
  y: number;
  t?: number;
  dashLen?: number;
  gap?: number;
}) {
  const n = Math.ceil((x2 - x1) / gap) + 1;
  const offset = (t * gap) % gap;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => (
        <rect
          key={i}
          x={x1 + i * gap - offset}
          y={y - 1.5}
          width={dashLen}
          height={3}
          fill={COLORS.paint}
          opacity={0.85}
        />
      ))}
    </g>
  );
}

export function HatchArea({
  x,
  y,
  width,
  height,
  angle = 45,
  spacing = 8,
  id: idProp,
  label,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
  spacing?: number;
  id?: string;
  label?: string;
}) {
  const id =
    idProp ?? `hatch-${Math.round(x)}-${Math.round(y)}-${Math.round(width)}-${Math.round(height)}`;
  return (
    <g>
      <defs>
        <pattern
          id={id}
          width={spacing}
          height={spacing}
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(${angle})`}
        >
          <rect width={spacing} height={spacing} fill={COLORS.road} />
          <line x1={0} y1={0} x2={0} y2={spacing} stroke={COLORS.paint} strokeWidth={1.4} />
        </pattern>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#${id})`}
        stroke={COLORS.paint}
        strokeWidth={1.4}
      />
      {label && (
        <text
          x={x + width / 2}
          y={y - 5}
          textAnchor="middle"
          fontSize={8}
          fontWeight={800}
          fill={COLORS.paint}
          opacity={0.9}
          fontFamily="sans-serif"
          letterSpacing={1}
        >
          {label}
        </text>
      )}
    </g>
  );
}

// Diagonal hatched wedge (used for tapers). Points are start-left, start-right, end-right, end-left.
export function HatchPolygon({
  points,
  id: idProp,
  label,
  labelX,
  labelY,
}: {
  points: string;
  id?: string;
  label?: string;
  labelX?: number;
  labelY?: number;
}) {
  const id = idProp ?? `hatchp-${points.replace(/[^0-9]/g, "").slice(0, 8)}`;
  return (
    <g>
      <defs>
        <pattern
          id={id}
          width={8}
          height={8}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width={8} height={8} fill={COLORS.road} />
          <line x1={0} y1={0} x2={0} y2={8} stroke={COLORS.paint} strokeWidth={1.4} />
        </pattern>
      </defs>
      <polygon points={points} fill={`url(#${id})`} stroke={COLORS.paint} strokeWidth={1.4} />
      {label && labelX !== undefined && labelY !== undefined && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          fontSize={8}
          fontWeight={800}
          fill={COLORS.paint}
          opacity={0.9}
          fontFamily="sans-serif"
          letterSpacing={1}
        >
          {label}
        </text>
      )}
    </g>
  );
}

export function CentralReservation({
  x = 0,
  y,
  width = 640,
  height = 18,
}: {
  x?: number;
  y: number;
  width?: number;
  height?: number;
}) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={COLORS.centralReservation} />
      <rect x={x} y={y - 1} width={width} height={1.6} fill={COLORS.paint} />
      <rect x={x} y={y + height - 0.6} width={width} height={1.6} fill={COLORS.paint} />
    </g>
  );
}

export type CarProps = {
  x: number;
  y: number;
  angle?: number;
  color?: string;
  size?: "sm" | "md" | "lg";
  braking?: boolean;
  indicator?: "left" | "right" | null;
  reversed?: boolean;
};

export function Car({
  x,
  y,
  angle = 0,
  color = COLORS.ego,
  size = "md",
  braking,
  indicator,
  reversed,
}: CarProps) {
  const dims =
    size === "sm" ? { w: 28, h: 16 } : size === "lg" ? { w: 44, h: 22 } : { w: 34, h: 18 };
  const w = dims.w;
  const h = dims.h;
  const halfW = w / 2;
  const halfH = h / 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})${reversed ? " scale(-1 1)" : ""}`}>
      <rect x={-halfW + 1} y={-halfH + 2} width={w} height={h} rx={4} fill="#000" opacity={0.35} />
      <rect
        x={-halfW}
        y={-halfH}
        width={w}
        height={h}
        rx={4}
        fill={color}
        stroke="#0a0a0a"
        strokeWidth={0.9}
      />
      <rect
        x={halfW * 0.15}
        y={-halfH + 2}
        width={w * 0.28}
        height={h - 4}
        rx={1.5}
        fill="#0a0a0a"
        opacity={0.55}
      />
      <rect
        x={-halfW + w * 0.15}
        y={-halfH + 2}
        width={w * 0.22}
        height={h - 4}
        rx={1.5}
        fill="#0a0a0a"
        opacity={0.7}
      />
      <rect x={halfW - 1.6} y={-halfH + 2} width={1.8} height={3} fill="#fff8c0" />
      <rect x={halfW - 1.6} y={halfH - 5} width={1.8} height={3} fill="#fff8c0" />
      <rect
        x={-halfW - 0.2}
        y={-halfH + 2}
        width={1.8}
        height={3}
        fill={braking ? "#ff2a2a" : "#5a1010"}
      />
      <rect
        x={-halfW - 0.2}
        y={halfH - 5}
        width={1.8}
        height={3}
        fill={braking ? "#ff2a2a" : "#5a1010"}
      />
      {indicator === "right" && (
        <circle cx={halfW - 3} cy={halfH - 2} r={1.8} fill="#ffb020">
          <animate attributeName="opacity" values="1;0.15;1" dur="0.5s" repeatCount="indefinite" />
        </circle>
      )}
      {indicator === "left" && (
        <circle cx={halfW - 3} cy={-halfH + 2} r={1.8} fill="#ffb020">
          <animate attributeName="opacity" values="1;0.15;1" dur="0.5s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

export function MirrorPulse({
  x,
  y,
  label = "MIRROR",
  color = COLORS.warn,
}: {
  x: number;
  y: number;
  label?: string;
  color?: string;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r={4} fill="none" stroke={color} strokeWidth={1.4}>
        <animate attributeName="r" values="2;7;2" dur="0.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.15;1" dur="0.8s" repeatCount="indefinite" />
      </circle>
      <text
        x={x}
        y={y - 10}
        textAnchor="middle"
        fontSize={8}
        fontWeight={800}
        fill={color}
        fontFamily="sans-serif"
        letterSpacing={1}
      >
        {label}
      </text>
    </g>
  );
}

export function GapMarker({
  x,
  y,
  width,
  height,
  label = "SAFE GAP",
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={COLORS.good}
        opacity={0.18}
        stroke={COLORS.good}
        strokeWidth={1.4}
        strokeDasharray="4 3"
      />
      <text
        x={x + width / 2}
        y={y - 5}
        textAnchor="middle"
        fontSize={8}
        fontWeight={800}
        fill={COLORS.good}
        fontFamily="sans-serif"
        letterSpacing={1}
      >
        {label}
      </text>
    </g>
  );
}

export function PathArrow({
  d,
  color = COLORS.accent,
  dashed = true,
  id: idProp,
}: {
  d: string;
  color?: string;
  dashed?: boolean;
  id?: string;
}) {
  const markerId = idProp ?? `arrow-${color.replace("#", "")}`;
  return (
    <g>
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={color} />
        </marker>
      </defs>
      <path
        d={d}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={dashed ? "6 4" : undefined}
        markerEnd={`url(#${markerId})`}
      />
    </g>
  );
}

export function Banner({
  x = 20,
  y = 20,
  eyebrow,
  title,
  width = 360,
}: {
  x?: number;
  y?: number;
  eyebrow: string;
  title: string;
  width?: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={width} height={44} rx={6} fill="#000" opacity={0.62} />
      <text
        x={12}
        y={16}
        fontSize={9}
        fill={COLORS.accent}
        fontWeight={800}
        letterSpacing={1.5}
        fontFamily="sans-serif"
      >
        {eyebrow}
      </text>
      <text x={12} y={34} fontSize={12} fill="#fff" fontWeight={600} fontFamily="sans-serif">
        {title}
      </text>
    </g>
  );
}

export function SpeedPanel({
  x = 440,
  y = 20,
  speed,
  target,
  width = 184,
}: {
  x?: number;
  y?: number;
  speed: number;
  target?: number;
  width?: number;
}) {
  const color = speed >= 55 ? COLORS.good : speed >= 30 ? COLORS.warn : COLORS.bad;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={width} height={44} rx={6} fill="#000" opacity={0.62} />
      <text x={12} y={16} fontSize={9} fill="#9ca3af" letterSpacing={1.5} fontFamily="sans-serif">
        YOUR SPEED
      </text>
      <text x={12} y={36} fontSize={18} fill={color} fontWeight={800} fontFamily="sans-serif">
        {Math.round(speed)} mph
      </text>
      {target !== undefined && (
        <>
          <text
            x={100}
            y={16}
            fontSize={9}
            fill="#9ca3af"
            letterSpacing={1.5}
            fontFamily="sans-serif"
          >
            TRAFFIC
          </text>
          <text
            x={100}
            y={36}
            fontSize={16}
            fill="#fff"
            opacity={0.9}
            fontWeight={700}
            fontFamily="sans-serif"
          >
            {target} mph
          </text>
        </>
      )}
    </g>
  );
}

export function Callout({
  x,
  y,
  text,
  tone = "warn",
}: {
  x: number;
  y: number;
  text: string;
  tone?: "warn" | "good" | "bad" | "accent";
}) {
  const color =
    tone === "good"
      ? COLORS.good
      : tone === "bad"
        ? COLORS.bad
        : tone === "accent"
          ? COLORS.accent
          : COLORS.warn;
  const width = text.length * 5.2 + 20;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={-width / 2}
        y={-10}
        width={width}
        height={18}
        rx={4}
        fill="#000"
        opacity={0.75}
        stroke={color}
        strokeWidth={1}
      />
      <text
        x={0}
        y={2}
        textAnchor="middle"
        fontSize={9}
        fontWeight={700}
        fill={color}
        fontFamily="sans-serif"
      >
        {text}
      </text>
    </g>
  );
}

export function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function DiagramCanvas({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      {children}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Extended GSM diagram kit — Phase 1 additions.
// These primitives are used by every lesson from Phase 2 onwards
// so junctions, roundabouts, manoeuvres and motorway scenes are
// visually consistent. Everything here is original SVG — no
// traced artwork.
// ─────────────────────────────────────────────────────────────

export function Kerb({
  x = 0,
  y,
  width = 640,
  height = 3,
}: {
  x?: number;
  y: number;
  width?: number;
  height?: number;
}) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="#c8ccd1" />
      <rect x={x} y={y + height} width={width} height={0.8} fill="#5b6068" opacity={0.7} />
    </g>
  );
}

export function GiveWayLine({
  x1,
  x2,
  y,
  triangle = true,
}: {
  x1: number;
  x2: number;
  y: number;
  triangle?: boolean;
}) {
  const n = Math.max(2, Math.floor((x2 - x1) / 6));
  const step = (x2 - x1) / n;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => (
        <rect
          key={`u-${i}`}
          x={x1 + i * step + 0.6}
          y={y - 3}
          width={step - 1.2}
          height={2}
          fill={COLORS.paint}
        />
      ))}
      {Array.from({ length: n }).map((_, i) => (
        <rect
          key={`d-${i}`}
          x={x1 + i * step + 0.6}
          y={y + 1}
          width={step - 1.2}
          height={2}
          fill={COLORS.paint}
        />
      ))}
      {triangle && (
        <polygon
          points={`${(x1 + x2) / 2 - 6},${y + 10} ${(x1 + x2) / 2 + 6},${y + 10} ${(x1 + x2) / 2},${y + 20}`}
          fill={COLORS.paint}
          opacity={0.9}
        />
      )}
    </g>
  );
}

export function StopLine({
  x1,
  x2,
  y,
}: {
  x1: number;
  x2: number;
  y: number;
}) {
  return <rect x={x1} y={y - 2} width={x2 - x1} height={4} fill={COLORS.paint} />;
}

export function ZebraStripes({
  x,
  y,
  width,
  height = 20,
  stripes = 8,
}: {
  x: number;
  y: number;
  width: number;
  height?: number;
  stripes?: number;
}) {
  const sw = width / (stripes * 2 - 1);
  return (
    <g>
      {Array.from({ length: stripes }).map((_, i) => (
        <rect key={i} x={x + i * sw * 2} y={y} width={sw} height={height} fill={COLORS.paint} />
      ))}
    </g>
  );
}

export function PelicanStuds({
  x1,
  x2,
  y,
}: {
  x1: number;
  x2: number;
  y: number;
}) {
  const n = Math.floor((x2 - x1) / 8);
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => (
        <circle key={i} cx={x1 + i * 8 + 4} cy={y} r={1.4} fill={COLORS.paint} />
      ))}
    </g>
  );
}

export function RoundaboutHub({
  cx,
  cy,
  r,
}: {
  cx: number;
  cy: number;
  r: number;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={COLORS.grass} stroke="#1f4520" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="#325d24" opacity={0.6} />
    </g>
  );
}

export function MiniRoundaboutDome({
  cx,
  cy,
  r = 14,
}: {
  cx: number;
  cy: number;
  r?: number;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={COLORS.paint} opacity={0.95} />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="#e1d9c1" />
    </g>
  );
}

export function LaneArrow({
  x,
  y,
  direction = "ahead",
  size = 16,
}: {
  x: number;
  y: number;
  direction?: "ahead" | "left" | "right" | "ahead-left" | "ahead-right";
  size?: number;
}) {
  const s = size;
  const shaft = `M0 ${s} L0 -${s * 0.2}`;
  const head = `M-${s * 0.35} -${s * 0.2} L0 -${s * 0.6} L${s * 0.35} -${s * 0.2} Z`;
  const branchAngle =
    direction === "left" || direction === "ahead-left"
      ? -90
      : direction === "right" || direction === "ahead-right"
        ? 90
        : 0;
  const showAheadOnly = direction === "ahead";
  return (
    <g transform={`translate(${x} ${y})`} stroke={COLORS.paint} fill={COLORS.paint} strokeLinecap="round">
      {(showAheadOnly || direction.startsWith("ahead")) && (
        <g strokeWidth={2}>
          <path d={shaft} />
          <path d={head} />
        </g>
      )}
      {!showAheadOnly && (
        <g transform={`rotate(${branchAngle})`}>
          <path d={shaft} strokeWidth={2} />
          <path d={head} />
        </g>
      )}
    </g>
  );
}

export function BoxJunction({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const YELLOW = "#f5c518";
  const step = 14;
  const lines: ReactNode[] = [];
  for (let i = -height; i < width; i += step) {
    lines.push(<line key={`a${i}`} x1={x + i} y1={y} x2={x + i + height} y2={y + height} stroke={YELLOW} strokeWidth={1.4} />);
    lines.push(<line key={`b${i}`} x1={x + i + height} y1={y} x2={x + i} y2={y + height} stroke={YELLOW} strokeWidth={1.4} />);
  }
  return (
    <g>
      <clipPath id={`bj-${x}-${y}`}>
        <rect x={x} y={y} width={width} height={height} />
      </clipPath>
      <g clipPath={`url(#bj-${x}-${y})`}>{lines}</g>
      <rect x={x} y={y} width={width} height={height} fill="none" stroke={YELLOW} strokeWidth={2} />
    </g>
  );
}

export function Bus({ x, y, angle = 0, brake }: { x: number; y: number; angle?: number; brake?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect x={-32} y={-11} width={64} height={22} rx={3} fill="#c8102e" stroke="#0a0a0a" strokeWidth={0.9} />
      <rect x={-28} y={-9} width={6} height={18} rx={1} fill="#111" opacity={0.7} />
      <rect x={-18} y={-9} width={6} height={18} rx={1} fill="#111" opacity={0.55} />
      <rect x={-8} y={-9} width={6} height={18} rx={1} fill="#111" opacity={0.55} />
      <rect x={2} y={-9} width={6} height={18} rx={1} fill="#111" opacity={0.55} />
      <rect x={12} y={-9} width={6} height={18} rx={1} fill="#111" opacity={0.55} />
      {brake && <rect x={-33.5} y={-9} width={1.8} height={18} fill="#ff2a2a" />}
    </g>
  );
}

export function HGV({ x, y, angle = 0 }: { x: number; y: number; angle?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect x={-6} y={-11} width={26} height={22} rx={2} fill="#e5e7eb" stroke="#0a0a0a" strokeWidth={0.9} />
      <rect x={-30} y={-10} width={24} height={20} rx={2} fill="#2b5da8" stroke="#0a0a0a" strokeWidth={0.9} />
      <rect x={16} y={-8} width={4} height={16} rx={1} fill="#111" opacity={0.7} />
    </g>
  );
}

export function Cyclist({ x, y, angle = 0 }: { x: number; y: number; angle?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <circle cx={-6} cy={0} r={3.4} fill="none" stroke="#eaeaea" strokeWidth={1.4} />
      <circle cx={6} cy={0} r={3.4} fill="none" stroke="#eaeaea" strokeWidth={1.4} />
      <line x1={-6} y1={0} x2={6} y2={0} stroke="#eaeaea" strokeWidth={1.4} />
      <circle cx={0} cy={-6} r={2.4} fill="#f59e0b" />
      <line x1={0} y1={-4} x2={0} y2={-1} stroke="#f59e0b" strokeWidth={1.4} />
    </g>
  );
}

export function Motorbike({ x, y, angle = 0 }: { x: number; y: number; angle?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <ellipse cx={0} cy={0} rx={9} ry={3.2} fill="#111" stroke="#0a0a0a" />
      <circle cx={0} cy={-5} r={2.4} fill="#c8102e" />
    </g>
  );
}

export function Pedestrian({ x, y, color = "#eaeaea" }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={0} cy={-6} r={2.4} fill={color} />
      <rect x={-2} y={-3.5} width={4} height={7} rx={1.2} fill={color} />
      <line x1={-1.4} y1={3} x2={-2.6} y2={7} stroke={color} strokeWidth={1.2} />
      <line x1={1.4} y1={3} x2={2.6} y2={7} stroke={color} strokeWidth={1.2} />
    </g>
  );
}

// Cone-of-vision "eye fan" for showing observation direction.
export function EyeGaze({
  x,
  y,
  angle = 0,
  spread = 60,
  reach = 60,
  color = COLORS.accent,
}: {
  x: number;
  y: number;
  angle?: number;
  spread?: number;
  reach?: number;
  color?: string;
}) {
  const a1 = ((angle - spread / 2) * Math.PI) / 180;
  const a2 = ((angle + spread / 2) * Math.PI) / 180;
  const p1 = `${Math.cos(a1) * reach},${Math.sin(a1) * reach}`;
  const p2 = `${Math.cos(a2) * reach},${Math.sin(a2) * reach}`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon points={`0,0 ${p1} ${p2}`} fill={color} opacity={0.18} stroke={color} strokeOpacity={0.55} strokeWidth={1} />
      <circle r={2.4} fill={color} />
    </g>
  );
}

export function SignalArrow({
  x,
  y,
  direction = "left",
  color = "#ffb020",
}: {
  x: number;
  y: number;
  direction?: "left" | "right";
  color?: string;
}) {
  const flip = direction === "right" ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`}>
      <path d="M0 0 L-8 -4 L-8 -1 L-16 -1 L-16 1 L-8 1 L-8 4 Z" fill={color}>
        <animate attributeName="opacity" values="1;0.15;1" dur="0.5s" repeatCount="indefinite" />
      </path>
    </g>
  );
}

export function HazardBloom({
  x,
  y,
  r = 10,
  color = COLORS.bad,
}: {
  x: number;
  y: number;
  r?: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="none" stroke={color} strokeWidth={1.4}>
        <animate attributeName="r" values={`${r * 0.4};${r * 1.4};${r * 0.4}`} dur="1.1s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.15;1" dur="1.1s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

export function DecisionCard({
  x,
  y,
  label,
  detail,
  tone = "accent",
  width = 150,
}: {
  x: number;
  y: number;
  label: string;
  detail?: string;
  tone?: "accent" | "good" | "warn" | "bad";
  width?: number;
}) {
  const color =
    tone === "good"
      ? COLORS.good
      : tone === "warn"
        ? COLORS.warn
        : tone === "bad"
          ? COLORS.bad
          : COLORS.accent;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={width} height={detail ? 42 : 24} rx={6} fill="#000" opacity={0.72} stroke={color} strokeWidth={1.2} />
      <text x={10} y={15} fontSize={9} fontWeight={800} fill={color} letterSpacing={1.4} fontFamily="sans-serif">
        {label.toUpperCase()}
      </text>
      {detail && (
        <text x={10} y={31} fontSize={9} fill="#fff" opacity={0.9} fontFamily="sans-serif">
          {detail}
        </text>
      )}
    </g>
  );
}

// Slip road taper — used for dual carriageway / motorway joins.
export function SlipRoad({
  x1,
  x2,
  y,
  width = 80,
  taper = 120,
  side = "left",
}: {
  x1: number;
  x2: number;
  y: number;
  width?: number;
  taper?: number;
  side?: "left" | "right";
}) {
  const dir = side === "left" ? -1 : 1;
  const start = `${x1},${y}`;
  const end = `${x2},${y}`;
  const startO = `${x1},${y + dir * width}`;
  const merge = `${x2 - taper},${y + dir * width}`;
  return (
    <polygon
      points={`${start} ${end} ${merge} ${startO}`}
      fill={COLORS.road}
    />
  );
}

export function HardShoulder({
  x = 0,
  y,
  width = 640,
  height = 12,
}: {
  x?: number;
  y: number;
  width?: number;
  height?: number;
}) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="#3a3a3d" />
      <line x1={x} y1={y} x2={x + width} y2={y} stroke={COLORS.paint} strokeWidth={1.4} strokeDasharray="14 6" />
    </g>
  );
}
