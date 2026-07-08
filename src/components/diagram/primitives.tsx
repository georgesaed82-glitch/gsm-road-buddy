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
