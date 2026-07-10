import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Target,
  Eye,
  Map as MapIcon,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { Zoomable } from "@/components/Zoomable";
import { useLessonProgress } from "@/lib/lessonProgress";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Vehicle Reference Points — dashboard-style interactive lesson.
// Every diagram uses the same right-hand-drive UK cockpit and the
// same top-view chassis, so only the road, markings and highlighted
// reference point change. Original GSM-Plus artwork (no traced
// photos, no third-party branding).
// ─────────────────────────────────────────────────────────────

// GSM palette
const NAVY = "#0f2135";
const NAVY_DARK = "#081524";
const CREAM = "#F7F3E8";
const GOLD = "#E4A93A";
const GOLD_SOFT = "#f2c96a";
const INK = "#1D2A22";
const ROAD = "#2b2b2e";
const ROAD_DARK = "#1e1e21";
const PAINT = "#f5f5f0";
const KERB = "#8b8f95";
const GRASS = "#3d6a2f";
const CAR_OTHER = "#94a0ac";
const CAR_OTHER_2 = "#6d7a86";
const CAR_OTHER_3 = "#c95a4c";

// ── Reusable Cockpit (right-hand drive UK) ─────────────────────
// viewBox 640×360. Windscreen area is roughly (60..580, 40..220).
// Scene content is rendered inside the windscreen clip mask.
function Cockpit({
  scene,
  refPoint,
  showRef,
  leftMirrorInset,
  rightMirrorInset,
  animT,
}: {
  scene: ReactNode;
  refPoint?: { x: number; y: number; r?: number; label?: string; shape?: "circle" | "line"; x2?: number; y2?: number };
  showRef: boolean;
  leftMirrorInset?: ReactNode;
  rightMirrorInset?: ReactNode;
  animT: number; // 0..1 for pulse phase
}) {
  const pulse = 0.6 + 0.4 * Math.sin(animT * Math.PI * 2);
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      {/* Sky wash inside windscreen */}
      <defs>
        <clipPath id="windscreen-clip">
          <path d="M 60 40 Q 320 22 580 40 L 560 220 L 80 220 Z" />
        </clipPath>
        <linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fb8d8" />
          <stop offset="1" stopColor="#dfe6ea" />
        </linearGradient>
        <linearGradient id="dash-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#181d24" />
          <stop offset="1" stopColor="#050709" />
        </linearGradient>
        <radialGradient id="wheel-grad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2a3040" />
          <stop offset="1" stopColor="#080b12" />
        </radialGradient>
      </defs>

      {/* Windscreen scene */}
      <g clipPath="url(#windscreen-clip)">
        <rect x={0} y={0} width={640} height={240} fill="url(#wsky)" />
        {scene}
      </g>

      {/* Windscreen frame */}
      <path
        d="M 60 40 Q 320 22 580 40 L 560 220 L 80 220 Z"
        fill="none"
        stroke="#0a0a0a"
        strokeWidth={2}
        opacity={0.85}
      />

      {/* Interior rear-view mirror */}
      <g>
        <rect x={296} y={28} width={48} height={16} rx={3} fill="#101418" stroke="#000" />
        <rect x={300} y={31} width={40} height={10} rx={1.5} fill="#4b5560" opacity={0.85} />
      </g>

      {/* A-pillars */}
      <path d="M 0 0 L 84 40 L 80 220 L 0 220 Z" fill={NAVY_DARK} />
      <path d="M 640 0 L 556 40 L 560 220 L 640 220 Z" fill={NAVY_DARK} />
      {/* Roof lip */}
      <path d="M 0 0 L 640 0 L 640 22 Q 320 6 0 22 Z" fill={NAVY_DARK} />

      {/* Left door mirror */}
      <g>
        <rect x={4} y={150} width={62} height={40} rx={5} fill="#0f151d" stroke="#000" />
        <rect x={8} y={154} width={54} height={32} rx={3} fill="#a8bfd2" />
        {leftMirrorInset && (
          <g clipPath="url(#lm-clip)">
            <defs>
              <clipPath id="lm-clip">
                <rect x={8} y={154} width={54} height={32} rx={3} />
              </clipPath>
            </defs>
            <g transform="translate(8 154)">{leftMirrorInset}</g>
          </g>
        )}
        <text x={35} y={202} textAnchor="middle" fontSize={8} fill="#fff" opacity={0.7} fontFamily="sans-serif">
          LEFT MIRROR
        </text>
      </g>

      {/* Right door mirror */}
      <g>
        <rect x={574} y={150} width={62} height={40} rx={5} fill="#0f151d" stroke="#000" />
        <rect x={578} y={154} width={54} height={32} rx={3} fill="#a8bfd2" />
        {rightMirrorInset && (
          <g>
            <defs>
              <clipPath id="rm-clip">
                <rect x={578} y={154} width={54} height={32} rx={3} />
              </clipPath>
            </defs>
            <g clipPath="url(#rm-clip)" transform="translate(578 154)">
              {rightMirrorInset}
            </g>
          </g>
        )}
        <text x={605} y={202} textAnchor="middle" fontSize={8} fill="#fff" opacity={0.7} fontFamily="sans-serif">
          RIGHT MIRROR
        </text>
      </g>

      {/* Dashboard */}
      <path d="M 0 220 L 640 220 L 640 360 L 0 360 Z" fill="url(#dash-grad)" />
      <path d="M 0 220 Q 320 208 640 220" fill="none" stroke={GOLD} strokeWidth={1.2} opacity={0.35} />

      {/* Bonnet edge suggestion */}
      <path d="M 80 220 Q 320 232 560 220" fill="none" stroke="#1f242c" strokeWidth={2} />

      {/* Steering wheel (RIGHT-hand drive) */}
      <g transform="translate(470 300)">
        <circle r={62} fill="url(#wheel-grad)" stroke="#000" strokeWidth={2} />
        <circle r={22} fill="#0a0d13" stroke="#1a2028" strokeWidth={1.5} />
        <rect x={-3} y={-58} width={6} height={30} fill="#1a2028" rx={2} />
        <rect x={-3} y={28} width={6} height={30} fill="#1a2028" rx={2} />
        <rect x={-58} y={-3} width={30} height={6} fill="#1a2028" rx={2} />
        <rect x={28} y={-3} width={30} height={6} fill="#1a2028" rx={2} />
        {/* GSM badge */}
        <text textAnchor="middle" y={4} fontSize={8} fontWeight={800} fill={GOLD} fontFamily="sans-serif" letterSpacing={1}>
          GSM
        </text>
      </g>

      {/* Instrument cluster (small hint) */}
      <g transform="translate(470 258)">
        <rect x={-46} y={-12} width={92} height={24} rx={3} fill="#050709" stroke="#1a2028" />
        <circle cx={-24} cy={0} r={7} fill="none" stroke={GOLD_SOFT} strokeWidth={1} />
        <circle cx={24} cy={0} r={7} fill="none" stroke={GOLD_SOFT} strokeWidth={1} />
      </g>

      {/* Reference point overlay (yellow) — clipped to windscreen area */}
      {showRef && refPoint && (
        <g>
          {refPoint.shape === "line" && refPoint.x2 !== undefined && refPoint.y2 !== undefined ? (
            <>
              <line
                x1={refPoint.x}
                y1={refPoint.y}
                x2={refPoint.x2}
                y2={refPoint.y2}
                stroke={GOLD}
                strokeWidth={3}
                strokeLinecap="round"
                opacity={pulse}
              />
            </>
          ) : (
            <>
              <circle
                cx={refPoint.x}
                cy={refPoint.y}
                r={(refPoint.r ?? 14) + pulse * 6}
                fill="none"
                stroke={GOLD}
                strokeWidth={3}
                opacity={pulse}
              />
              <circle cx={refPoint.x} cy={refPoint.y} r={4} fill={GOLD} />
            </>
          )}
          {refPoint.label && (
            <g transform={`translate(${refPoint.x} ${refPoint.y - (refPoint.r ?? 14) - 14})`}>
              <rect x={-58} y={-10} width={116} height={16} rx={3} fill="#000" opacity={0.75} />
              <text
                textAnchor="middle"
                y={2}
                fontSize={9}
                fontWeight={700}
                fill={GOLD}
                fontFamily="sans-serif"
                letterSpacing={0.5}
              >
                {refPoint.label}
              </text>
            </g>
          )}
        </g>
      )}
    </svg>
  );
}

// ── Reusable top-view chassis ──────────────────────────────────
function TopView({
  scene,
  car,
  showRef,
  refPath,
}: {
  scene: ReactNode;
  car: { x: number; y: number; angle?: number };
  showRef: boolean;
  refPath?: string;
}) {
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <rect x={0} y={0} width={640} height={360} fill={CREAM} />
      {scene}
      {/* Learner car */}
      <g transform={`translate(${car.x} ${car.y}) rotate(${car.angle ?? 0})`}>
        <rect x={-14} y={-26} width={28} height={52} rx={6} fill={NAVY} stroke="#000" strokeWidth={1.2} />
        <rect x={-10} y={-20} width={20} height={12} rx={2} fill="#a8bfd2" opacity={0.9} />
        <rect x={-10} y={6} width={20} height={12} rx={2} fill="#a8bfd2" opacity={0.7} />
        <rect x={-14} y={-27} width={28} height={2} fill={GOLD} />
        <text y={2} textAnchor="middle" fontSize={7} fontWeight={800} fill={GOLD} fontFamily="sans-serif">
          GSM
        </text>
      </g>
      {showRef && refPath && (
        <g>
          <defs>
            <marker id="tv-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill={GOLD} />
            </marker>
          </defs>
          <path
            d={refPath}
            stroke={GOLD}
            strokeWidth={3}
            fill="none"
            strokeDasharray="6 4"
            strokeLinecap="round"
            markerEnd="url(#tv-arrow)"
          />
        </g>
      )}
    </svg>
  );
}

// ── Small helpers for road scenery ─────────────────────────────
function DashLine({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const dashes = [];
  for (let x = x1; x < x2; x += 24) dashes.push(x);
  return (
    <g>
      {dashes.map((x) => (
        <rect key={x} x={x} y={y - 1.5} width={12} height={3} fill={PAINT} />
      ))}
    </g>
  );
}

function ParkedCarSide({
  x,
  y,
  w = 60,
  color = CAR_OTHER,
}: {
  x: number;
  y: number;
  w?: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={0} width={w} height={26} rx={4} fill={color} stroke="#000" strokeWidth={0.8} />
      <rect x={w * 0.55} y={4} width={w * 0.35} height={12} rx={1.5} fill="#0a0a0a" opacity={0.75} />
      <circle cx={w * 0.2} cy={26} r={4} fill="#111" />
      <circle cx={w * 0.8} cy={26} r={4} fill="#111" />
    </g>
  );
}

function ParkedCarTop({
  x,
  y,
  color = CAR_OTHER,
}: {
  x: number;
  y: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-13} y={-24} width={26} height={48} rx={5} fill={color} stroke="#000" strokeWidth={0.9} />
      <rect x={-9} y={-18} width={18} height={10} rx={2} fill="#0a0a0a" opacity={0.5} />
      <rect x={-9} y={6} width={18} height={10} rx={2} fill="#0a0a0a" opacity={0.5} />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// Diagram scenes (windscreen scenes + top view scenes) per topic
// ─────────────────────────────────────────────────────────────

// Common horizon + road base for windscreen scenes
function RoadBase({ kerbLeft = 90, kerbRight = 560 }: { kerbLeft?: number; kerbRight?: number }) {
  return (
    <g>
      {/* Ground */}
      <rect x={0} y={130} width={640} height={110} fill={GRASS} />
      {/* Road (perspective trapezoid) */}
      <polygon points={`260,130 380,130 ${kerbRight},220 ${kerbLeft},220`} fill={ROAD} />
      {/* Kerbs */}
      <polygon points={`260,130 ${kerbLeft},220 ${kerbLeft - 14},220 254,130`} fill={KERB} />
      <polygon points={`380,130 ${kerbRight},220 ${kerbRight + 14},220 386,130`} fill={KERB} />
    </g>
  );
}

// 1. Parked Position (parallel to left kerb)
const parkedScene = (
  <g>
    <RoadBase />
    {/* Solid centre line */}
    <line x1={320} y1={132} x2={320} y2={220} stroke={PAINT} strokeWidth={2} strokeDasharray="8 6" />
    {/* Approaching (distant) car */}
    <g transform="translate(310 150)">
      <rect x={-8} y={-6} width={16} height={12} rx={2} fill={CAR_OTHER_2} />
    </g>
  </g>
);
const parkedTop = (
  <g>
    <rect x={0} y={0} width={640} height={360} fill={GRASS} />
    <rect x={80} y={40} width={480} height={280} fill={ROAD} />
    <rect x={80} y={40} width={12} height={280} fill={KERB} />
    <rect x={548} y={40} width={12} height={280} fill={KERB} />
    <line x1={320} y1={40} x2={320} y2={320} stroke={PAINT} strokeWidth={2} strokeDasharray="10 8" />
    <text x={40} y={180} fontSize={11} fill={INK} fontFamily="sans-serif" transform="rotate(-90 40 180)">
      KERB
    </text>
  </g>
);

// 2A. Wide road (normal position)
const wideRoadScene = (
  <g>
    <RoadBase kerbLeft={70} kerbRight={580} />
    <line x1={320} y1={132} x2={320} y2={220} stroke={PAINT} strokeWidth={2} strokeDasharray="12 8" />
  </g>
);
// 2B. Marked traffic lane
const laneScene = (
  <g>
    <RoadBase kerbLeft={60} kerbRight={590} />
    {/* Left edge line */}
    <line x1={200} y1={132} x2={110} y2={220} stroke={PAINT} strokeWidth={2} />
    {/* Centre dashed */}
    <line x1={320} y1={132} x2={320} y2={220} stroke={PAINT} strokeWidth={2} strokeDasharray="12 8" />
    {/* Right edge line */}
    <line x1={440} y1={132} x2={530} y2={220} stroke={PAINT} strokeWidth={2} />
  </g>
);
const wideRoadTop = (
  <g>
    <rect x={0} y={0} width={640} height={360} fill={GRASS} />
    <rect x={60} y={40} width={520} height={280} fill={ROAD} />
    <rect x={60} y={40} width={10} height={280} fill={KERB} />
    <rect x={570} y={40} width={10} height={280} fill={KERB} />
    <line x1={320} y1={40} x2={320} y2={320} stroke={PAINT} strokeWidth={2} strokeDasharray="12 8" />
  </g>
);
const laneTop = (
  <g>
    <rect x={0} y={0} width={640} height={360} fill={GRASS} />
    <rect x={40} y={40} width={560} height={280} fill={ROAD} />
    <rect x={40} y={40} width={8} height={280} fill={KERB} />
    <rect x={592} y={40} width={8} height={280} fill={KERB} />
    <line x1={200} y1={40} x2={200} y2={320} stroke={PAINT} strokeWidth={2} />
    <line x1={320} y1={40} x2={320} y2={320} stroke={PAINT} strokeWidth={2} strokeDasharray="12 8" />
    <line x1={440} y1={40} x2={440} y2={320} stroke={PAINT} strokeWidth={2} />
  </g>
);

// 3. Clearance from parked cars
const clearanceScene = (
  <g>
    <RoadBase kerbLeft={70} kerbRight={580} />
    <line x1={320} y1={132} x2={320} y2={220} stroke={PAINT} strokeWidth={2} strokeDasharray="12 8" />
    {/* Parked cars along left with perspective */}
    <g>
      <rect x={82} y={182} width={56} height={30} rx={4} fill={CAR_OTHER} stroke="#000" strokeWidth={0.6} />
      <rect x={90} y={186} width={22} height={12} rx={2} fill="#0a0a0a" opacity={0.7} />
      <rect x={140} y={170} width={48} height={26} rx={4} fill={CAR_OTHER_2} stroke="#000" strokeWidth={0.6} />
      <rect x={192} y={160} width={40} height={22} rx={4} fill={CAR_OTHER_3} stroke="#000" strokeWidth={0.6} />
      <rect x={236} y={152} width={34} height={18} rx={4} fill={CAR_OTHER} stroke="#000" strokeWidth={0.6} />
    </g>
    {/* 40% windscreen overlay */}
    <rect x={72} y={40} width={192} height={180} fill={GOLD} opacity={0.09} stroke={GOLD} strokeDasharray="4 4" strokeWidth={1.2} />
    <text x={168} y={54} textAnchor="middle" fontSize={9} fontWeight={800} fill={GOLD} fontFamily="sans-serif" letterSpacing={1}>
      ~40% AREA
    </text>
  </g>
);
const clearanceTop = (
  <g>
    <rect x={0} y={0} width={640} height={360} fill={GRASS} />
    <rect x={40} y={40} width={560} height={280} fill={ROAD} />
    <rect x={40} y={40} width={8} height={280} fill={KERB} />
    <rect x={592} y={40} width={8} height={280} fill={KERB} />
    <line x1={320} y1={40} x2={320} y2={320} stroke={PAINT} strokeWidth={2} strokeDasharray="12 8" />
    <ParkedCarTop x={80} y={100} color={CAR_OTHER} />
    <ParkedCarTop x={80} y={170} color={CAR_OTHER_3} />
    <ParkedCarTop x={80} y={240} color={CAR_OTHER_2} />
    {/* 1m clearance guide */}
    <line x1={104} y1={80} x2={144} y2={80} stroke={GOLD} strokeWidth={2} />
    <line x1={104} y1={76} x2={104} y2={84} stroke={GOLD} strokeWidth={2} />
    <line x1={144} y1={76} x2={144} y2={84} stroke={GOLD} strokeWidth={2} />
    <text x={124} y={72} textAnchor="middle" fontSize={11} fontWeight={800} fill={GOLD} fontFamily="sans-serif">
      ≈1 m
    </text>
  </g>
);

// 4. Left turn from major road
const leftTurnScene = (
  <g>
    <RoadBase kerbLeft={70} kerbRight={580} />
    {/* Side road opening on the left */}
    <polygon points="70,220 200,220 210,150 90,140" fill={ROAD} />
    <polygon points="90,140 210,150 200,150 88,140" fill={KERB} opacity={0.5} />
    <polygon points="196,150 210,150 200,220 190,220" fill={KERB} />
    <line x1={320} y1={132} x2={320} y2={220} stroke={PAINT} strokeWidth={2} strokeDasharray="12 8" />
  </g>
);
const leftTurnTop = (
  <g>
    <rect x={0} y={0} width={640} height={360} fill={GRASS} />
    <rect x={60} y={40} width={520} height={140} fill={ROAD} />
    <rect x={60} y={40} width={10} height={140} fill={KERB} />
    <rect x={570} y={40} width={10} height={140} fill={KERB} />
    <line x1={320} y1={40} x2={320} y2={180} stroke={PAINT} strokeWidth={2} strokeDasharray="12 8" />
    {/* Side road going down */}
    <rect x={180} y={180} width={120} height={180} fill={ROAD} />
    <rect x={180} y={180} width={8} height={180} fill={KERB} />
    <rect x={292} y={180} width={8} height={180} fill={KERB} />
    <line x1={240} y1={180} x2={240} y2={360} stroke={PAINT} strokeWidth={2} strokeDasharray="12 8" />
    {/* corner shading */}
    <path d="M 60 180 Q 120 180 180 240 L 60 240 Z" fill={GRASS} />
    <path d="M 300 180 Q 240 180 180 240 L 300 240 Z" fill={GRASS} />
  </g>
);

// 5. Right turn from major road
const rightTurnScene = (
  <g>
    <RoadBase kerbLeft={70} kerbRight={580} />
    {/* Side road opening on the right */}
    <polygon points="580,220 430,220 420,140 560,140" fill={ROAD} />
    <polygon points="416,140 430,220 440,220 428,140" fill={KERB} />
    <line x1={320} y1={132} x2={320} y2={220} stroke={PAINT} strokeWidth={2} />
    {/* Oncoming vehicle */}
    <g transform="translate(340 170)">
      <rect x={-8} y={-6} width={16} height={12} rx={2} fill={CAR_OTHER_2} />
    </g>
  </g>
);
const rightTurnTop = (
  <g>
    <rect x={0} y={0} width={640} height={360} fill={GRASS} />
    <rect x={60} y={110} width={520} height={140} fill={ROAD} />
    <rect x={60} y={110} width={10} height={140} fill={KERB} />
    <rect x={570} y={110} width={10} height={140} fill={KERB} />
    <line x1={70} y1={180} x2={340} y2={180} stroke={PAINT} strokeWidth={2} />
    <line x1={400} y1={180} x2={570} y2={180} stroke={PAINT} strokeWidth={2} />
    {/* Side road going up */}
    <rect x={340} y={0} width={120} height={110} fill={ROAD} />
    <rect x={340} y={0} width={8} height={110} fill={KERB} />
    <rect x={452} y={0} width={8} height={110} fill={KERB} />
    <line x1={400} y1={0} x2={400} y2={110} stroke={PAINT} strokeWidth={2} strokeDasharray="12 8" />
  </g>
);

// 6A. Emerging left — waiting position
const emergeLeftWaitScene = (
  <g>
    {/* looking out of a minor road onto a wider road */}
    <rect x={0} y={130} width={640} height={110} fill={GRASS} />
    {/* Major road running across the view */}
    <polygon points="60,150 580,150 620,190 20,190" fill={ROAD} />
    <polygon points="20,190 620,190 620,196 20,196" fill={PAINT} />
    {/* Kerbs of major road */}
    <polygon points="60,150 580,150 570,148 70,148" fill={KERB} opacity={0.7} />
    {/* Our minor road */}
    <polygon points="240,190 400,190 420,220 220,220" fill={ROAD} />
    {/* GIVE WAY line (double dashed) */}
    <g>
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={230 + i * 20} y={196} width={12} height={5} fill={PAINT} />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i + 100} x={230 + i * 20} y={205} width={12} height={5} fill={PAINT} />
      ))}
    </g>
  </g>
);
// 6B. Emerging left — point of turn
const emergeLeftTurnScene = (
  <g>
    <rect x={0} y={130} width={640} height={110} fill={GRASS} />
    {/* Major road */}
    <polygon points="0,150 640,150 640,220 0,220" fill={ROAD} />
    <line x1={0} y1={185} x2={640} y2={185} stroke={PAINT} strokeWidth={2} strokeDasharray="14 10" />
    {/* Left corner where we'll turn into */}
    <path d="M 60 150 Q 100 150 130 130 L 0 130 L 0 150 Z" fill={GRASS} />
  </g>
);
const emergeLeftTop = (
  <g>
    <rect x={0} y={0} width={640} height={360} fill={GRASS} />
    <rect x={0} y={40} width={640} height={130} fill={ROAD} />
    <rect x={0} y={40} width={640} height={8} fill={KERB} />
    <rect x={0} y={162} width={640} height={8} fill={KERB} />
    <line x1={0} y1={105} x2={640} y2={105} stroke={PAINT} strokeWidth={2} strokeDasharray="12 8" />
    {/* Minor road */}
    <rect x={260} y={170} width={120} height={190} fill={ROAD} />
    <rect x={260} y={170} width={8} height={190} fill={KERB} />
    <rect x={372} y={170} width={8} height={190} fill={KERB} />
    {/* Give way (double dashed) across mouth of minor road */}
    <g>
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={272 + i * 18} y={172} width={12} height={4} fill={PAINT} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i + 20} x={272 + i * 18} y={180} width={12} height={4} fill={PAINT} />
      ))}
    </g>
  </g>
);

// 7A/B. Emerging right — approach + wait scenes reuse left variants (mirrored feel)
const emergeRightApproachScene = (
  <g>
    <RoadBase kerbLeft={100} kerbRight={540} />
    <line x1={320} y1={132} x2={320} y2={220} stroke={PAINT} strokeWidth={2} strokeDasharray="12 8" />
    {/* Give-way ahead */}
    <g>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={200 + i * 30} y={196} width={14} height={5} fill={PAINT} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i + 30} x={200 + i * 30} y={205} width={14} height={5} fill={PAINT} />
      ))}
    </g>
  </g>
);
const emergeRightTop = (
  <g>
    <rect x={0} y={0} width={640} height={360} fill={GRASS} />
    <rect x={0} y={40} width={640} height={130} fill={ROAD} />
    <rect x={0} y={162} width={640} height={8} fill={KERB} />
    <line x1={0} y1={105} x2={640} y2={105} stroke={PAINT} strokeWidth={2} strokeDasharray="12 8" />
    <rect x={260} y={170} width={120} height={190} fill={ROAD} />
    <rect x={260} y={170} width={8} height={190} fill={KERB} />
    <rect x={372} y={170} width={8} height={190} fill={KERB} />
    <line x1={320} y1={170} x2={320} y2={360} stroke={PAINT} strokeWidth={2} strokeDasharray="12 8" />
    {/* Give way at mouth */}
    <g>
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={272 + i * 18} y={172} width={12} height={4} fill={PAINT} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i + 20} x={272 + i * 18} y={180} width={12} height={4} fill={PAINT} />
      ))}
    </g>
  </g>
);

// ── Mirror inset builders ──────────────────────────────────────
function KerbInMirror() {
  // simple: kerb line crossing lower part of the mirror
  return (
    <g>
      <rect x={0} y={0} width={54} height={20} fill="#c8d8e6" />
      <rect x={0} y={20} width={54} height={12} fill={ROAD} />
      <rect x={0} y={20} width={54} height={2} fill={KERB} />
      <circle cx={16} cy={16} r={5} fill="none" stroke={GOLD} strokeWidth={2} />
    </g>
  );
}
function CentreLineInRightMirror() {
  return (
    <g>
      <rect x={0} y={0} width={54} height={16} fill="#c8d8e6" />
      <rect x={0} y={16} width={54} height={16} fill={ROAD} />
      <line x1={10} y1={20} x2={44} y2={30} stroke={PAINT} strokeWidth={2} strokeDasharray="4 3" />
      <circle cx={26} cy={24} r={5} fill="none" stroke={GOLD} strokeWidth={2} />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// Topic definitions
// ─────────────────────────────────────────────────────────────

type Stage = {
  label?: string;
  scene: ReactNode;
  topScene: ReactNode;
  refPoint?: {
    x: number;
    y: number;
    r?: number;
    label?: string;
    shape?: "circle" | "line";
    x2?: number;
    y2?: number;
  };
  refPath?: string;
  car: { x: number; y: number; angle?: number };
  leftMirrorInset?: ReactNode;
  rightMirrorInset?: ReactNode;
};

type Topic = {
  id: string;
  num: number;
  title: string;
  tagline: string;
  stages: Stage[];
  what: string;
  why: string;
  when: string;
  how: string[];
  mistakes: string[];
  safety: string;
};

const topics: Topic[] = [
  {
    id: "parked-position",
    num: 1,
    title: "Parked Position",
    tagline: "Confirm you are straight and parallel to the left kerb.",
    stages: [
      {
        label: "Kerb meets the dashboard",
        scene: parkedScene,
        topScene: parkedTop,
        refPoint: { x: 118, y: 220, r: 18, label: "KERB ↔ DASHBOARD" },
        car: { x: 116, y: 190 },
        leftMirrorInset: <KerbInMirror />,
        refPath: "M 116 260 L 116 200",
      },
    ],
    what: "When parked correctly, the left kerb appears to meet the lower edge of the dashboard on the driver's view. Cross-check the kerb position in the left door mirror.",
    why: "This confirms the car is straight, parallel to the kerb and at a safe distance from it — not so close that a wheel scrapes, and not so far that the car is out in the traffic lane.",
    when: "After stopping to park, every time — before switching off, and again briefly before moving off.",
    how: [
      "Stop parallel to the kerb.",
      "Sight where the kerb line appears along the dashboard.",
      "Glance in the left door mirror and check the kerb crosses through the lower third.",
      "Adjust with small steering inputs while creeping if needed.",
    ],
    mistakes: [
      "Parking too far from the kerb.",
      "Parking too close to the kerb.",
      "Relying on only one reference point.",
      "Forgetting to check that the car is parallel, not angled.",
    ],
    safety: "Reference points depend on your seat position and vehicle. Calibrate them with your instructor in your usual car.",
  },

  {
    id: "normal-road-position",
    num: 2,
    title: "Normal Road Position",
    tagline: "Stay centred on a wide road and inside a marked lane.",
    stages: [
      {
        label: "Wide residential road",
        scene: wideRoadScene,
        topScene: wideRoadTop,
        refPoint: { x: 140, y: 218, r: 16, label: "LEFT KERB ↔ DASH" },
        car: { x: 200, y: 180 },
        leftMirrorInset: <KerbInMirror />,
      },
      {
        label: "Marked traffic lane",
        scene: laneScene,
        topScene: laneTop,
        refPoint: { x: 155, y: 220, r: 14, label: "LEFT LANE LINE" },
        car: { x: 260, y: 180 },
      },
    ],
    what: "On a wide road, keep the left kerb visible along the lower dashboard. Inside a marked lane, keep the left lane line along the dashboard and the right lane line near the steering wheel area. Both door mirrors should show roughly equal space.",
    why: "This keeps the car in a safe, predictable position — away from the kerb, but not drifting toward oncoming traffic or the centre line.",
    when: "At all times when driving on a normal road or lane, not just when a hazard appears.",
    how: [
      "Look well ahead — not down at the bonnet.",
      "Use the kerb / lane line along the dashboard as your guide.",
      "Cross-check both door mirrors for balanced spacing.",
      "Correct with gentle steering — never sudden movements.",
    ],
    mistakes: [
      "Driving too close to the kerb.",
      "Drifting toward the centre line.",
      "Straddling the lane markings.",
      "Staring at the bonnet instead of looking ahead.",
    ],
    safety: "Adjust your position for cyclists, parked cars and road width. The reference point is a starting guide — not a rigid rule.",
  },

  {
    id: "clearance",
    num: 3,
    title: "Clearance from Parked Cars",
    tagline: "Give roughly 1 metre of clearance where possible.",
    stages: [
      {
        label: "40% windscreen guide",
        scene: clearanceScene,
        topScene: clearanceTop,
        refPoint: { x: 168, y: 130, r: 22, label: "~40% OF WINDSCREEN" },
        car: { x: 240, y: 180 },
        refPath: "M 240 220 Q 200 140 200 40",
      },
    ],
    what: "The outside tyres of the parked vehicles should occupy about 40% of the driver's windscreen. The bottom of their tyres should sit near the lower dashboard area.",
    why: "This normally gives roughly one metre of clearance and protects against opening doors, pedestrians stepping out, cyclists and vehicles moving away unexpectedly.",
    when: "Every time you pass a line of parked vehicles at normal driving speed.",
    how: [
      "Check mirrors before moving out.",
      "Position so parked cars fill about 40% of the windscreen.",
      "Ease off the gas and cover the brake.",
      "Only move back to the left after fully clearing the last parked car.",
    ],
    mistakes: [
      "Driving too close to parked vehicles.",
      "Fixating on the parked car instead of scanning ahead.",
      "Failing to check mirrors before moving out.",
      "Cutting back in too early.",
    ],
    safety: "Reference points are approximate guides. Adjust clearance for road width, speed, vehicle size and surrounding hazards.",
  },

  {
    id: "left-turn",
    num: 4,
    title: "Left Turn from a Major Road",
    tagline: "Steer when the corner meets the left A-pillar.",
    stages: [
      {
        label: "Point of steering",
        scene: leftTurnScene,
        topScene: leftTurnTop,
        refPoint: { x: 88, y: 148, r: 18, label: "CORNER ↔ LEFT PILLAR" },
        car: { x: 320, y: 130 },
        refPath: "M 320 100 Q 320 200 240 300",
      },
    ],
    what: "Begin the steering action when the corner of the new road appears close to the left windscreen A-pillar.",
    why: "This helps the car enter the new road correctly — without mounting the kerb, turning too early, swinging wide or entering the wrong side of the road.",
    when: "On every left turn from a major road into a minor road, after MSPSL is complete.",
    how: [
      "Mirrors, signal, position, speed, look.",
      "Ease off and prepare to steer.",
      "As the new road's corner reaches the left A-pillar, steer smoothly.",
      "Straighten up as the car settles in the new road.",
    ],
    mistakes: [
      "Steering too early — clipping the kerb.",
      "Steering too late — swinging wide.",
      "Watching the bonnet.",
      "Missing pedestrians or cyclists on the corner.",
    ],
    safety: "Sharp corners can hide behind the A-pillar. Keep scanning — do not rely on the reference point alone.",
  },

  {
    id: "right-turn",
    num: 5,
    title: "Right Turn from a Major Road",
    tagline: "Right mirror aligns with the centre of the new road.",
    stages: [
      {
        label: "Waiting + turning references",
        scene: rightTurnScene,
        topScene: rightTurnTop,
        refPoint: {
          x: 605,
          y: 170,
          r: 24,
          label: "RIGHT MIRROR ↔ NEW ROAD CENTRE",
        },
        car: { x: 260, y: 200, angle: 0 },
        refPath: "M 260 200 Q 340 200 400 110",
      },
    ],
    what: "Wait just left of the centre line so oncoming traffic can pass. Cross-reference the right door mirror with the centre of the new side road, then turn into the correct (left) side of it.",
    why: "This keeps you out of oncoming traffic while waiting, and delivers the car into the correct side of the new road without clipping the kerb or cutting the corner.",
    when: "Every right turn from a major road into a minor road, after MSPSL and observations.",
    how: [
      "Position just left of the centre line.",
      "Give way to oncoming traffic.",
      "When clear, align the right mirror with the centre of the new road.",
      "Steer smoothly and enter the left side of the new road.",
    ],
    mistakes: [
      "Sitting over the centre line.",
      "Turning too early — cutting the corner.",
      "Turning too late — swinging wide.",
      "Entering the wrong side of the new road.",
    ],
    safety: "Reference points assume a right-hand-drive UK car. Verify calibration with your instructor.",
  },

  {
    id: "emerging-left",
    num: 6,
    title: "Emerging Left from a Minor Road",
    tagline: "Stop at the give-way line, then steer at the A-pillar.",
    stages: [
      {
        label: "Stage A · Waiting position",
        scene: emergeLeftWaitScene,
        topScene: emergeLeftTop,
        refPoint: { x: 35, y: 178, r: 18, label: "GIVE-WAY ↔ MIRROR" },
        car: { x: 320, y: 220 },
      },
      {
        label: "Stage B · Point of turn",
        scene: emergeLeftTurnScene,
        topScene: emergeLeftTop,
        refPoint: { x: 90, y: 150, r: 18, label: "CORNER ↔ LEFT PILLAR" },
        car: { x: 320, y: 210 },
        refPath: "M 320 210 Q 260 170 160 100",
      },
    ],
    what: "Stop when the give-way line reaches the calibrated door-mirror reference. Then start steering when the corner of the major road appears close to the left A-pillar.",
    why: "The stopping reference keeps you behind the line — never over it. The turning reference puts the car on the correct side of the major road without striking the kerb.",
    when: "Every emergence from a minor road into a major road turning left.",
    how: [
      "Approach with MSPSL, brake progressively.",
      "Stop when the give-way line reaches the mirror reference.",
      "Observe: right, ahead, left, right again.",
      "Move off and steer as the corner reaches the A-pillar.",
    ],
    mistakes: [
      "Crossing the give-way line.",
      "Stopping too far back — you cannot see.",
      "Turning too early.",
      "Reading only the reference marker and missing traffic.",
    ],
    safety: "Effective observation always beats a reference point. Look — do not just measure.",
  },

  {
    id: "emerging-right",
    num: 7,
    title: "Emerging Right from a Minor Road",
    tagline: "Align the centre line with the wheel’s 1 o’clock.",
    stages: [
      {
        label: "Stage A · Approach position",
        scene: emergeRightApproachScene,
        topScene: emergeRightTop,
        refPoint: { x: 320, y: 220, r: 18, label: "CENTRE LINE ↔ 1 O’CLOCK" },
        car: { x: 300, y: 260 },
        rightMirrorInset: <CentreLineInRightMirror />,
      },
      {
        label: "Stage B · Waiting position",
        scene: emergeLeftWaitScene,
        topScene: emergeRightTop,
        refPoint: { x: 35, y: 178, r: 18, label: "GIVE-WAY ↔ MIRROR" },
        car: { x: 305, y: 205 },
      },
    ],
    what: "Position slightly left of the minor road's centre line so the line meets the steering wheel at around one o'clock. Cross-check the centre line in the right door mirror. Stop when the give-way line reaches the calibrated door-mirror reference.",
    why: "This puts the car in the right place to turn right — not over the centre line, not too close to the kerb — and ensures you stop behind the give-way line every time.",
    when: "On every right emergence from a minor road onto a major road.",
    how: [
      "Approach with MSPSL.",
      "Aim the centre line at the wheel's 1 o'clock.",
      "Cross-check the right mirror.",
      "Stop at the give-way reference, observe, then turn.",
    ],
    mistakes: [
      "Sitting over the centre line.",
      "Positioning too close to the left kerb.",
      "Crossing the give-way line.",
      "Turning too sharply into the wrong side.",
    ],
    safety: "Reference points shift with driver height, seat setting and vehicle model. Combine them with observation and appropriate speed.",
  },
];

// ─────────────────────────────────────────────────────────────
// Interactive card + detail view
// ─────────────────────────────────────────────────────────────

function usePulse(active: boolean) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      setT(((now - start) / 1400) % 1);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return t;
}

function TopicDetail({ topic }: { topic: Topic }) {
  const [stageIdx, setStageIdx] = useState(0);
  const [view, setView] = useState<"driver" | "top">("driver");
  const [showRef, setShowRef] = useState(false);
  const stage = topic.stages[stageIdx];
  const pulseT = usePulse(showRef);
  const { isDone, toggle } = useLessonProgress();
  const slug = `vrp-${topic.id}`;
  const done = isDone(slug);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
            Diagram {topic.num}
          </div>
          <h3 className="mt-1 font-display text-xl leading-tight">{topic.title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{topic.tagline}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-background p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setView("driver")}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-1.5 font-medium",
                view === "driver" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <Eye className="h-3.5 w-3.5" /> Driver view
            </button>
            <button
              type="button"
              onClick={() => setView("top")}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-1.5 font-medium",
                view === "top" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <MapIcon className="h-3.5 w-3.5" /> Top view
            </button>
          </div>
        </div>
      </div>

      {topic.stages.length > 1 && (
        <div className="flex flex-wrap gap-2 border-b border-border bg-background/60 p-3">
          {topic.stages.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStageIdx(i)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold",
                stageIdx === i
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-card text-muted-foreground hover:border-accent/60",
              )}
            >
              {s.label ?? `Stage ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="p-4">
        <div
          className={cn("relative w-full overflow-hidden rounded-xl border border-border", view === "driver" ? "bg-[#0a0f16]" : "bg-cream")}
          style={{ aspectRatio: "16/9" }}
        >
          <Zoomable
            label={`${topic.title} — ${view === "driver" ? "driver view" : "top view"}`}
            aspectRatio="16/9"
            closeOnContentClick={false}
            className="absolute inset-0"
          >
            <div className="relative h-full w-full">
              {view === "driver" ? (
                <Cockpit
                  scene={stage.scene}
                  refPoint={stage.refPoint}
                  showRef={showRef}
                  leftMirrorInset={stage.leftMirrorInset}
                  rightMirrorInset={stage.rightMirrorInset}
                  animT={pulseT}
                />
              ) : (
                <TopView scene={stage.topScene} car={stage.car} showRef={showRef} refPath={stage.refPath} />
              )}
              <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/85">
                UK · Right-hand drive
              </div>
              <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/85">
                {view === "driver" ? "Driver view" : "Top view"}
              </div>
            </div>
          </Zoomable>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRef((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider",
              showRef
                ? "bg-accent text-accent-foreground"
                : "border border-accent text-accent hover:bg-accent/10",
            )}
          >
            <Target className="h-3.5 w-3.5" /> {showRef ? "Hide reference point" : "Show reference point"}
          </button>
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={done}
              onChange={() => toggle(slug)}
              className="h-4 w-4 accent-accent"
            />
            Practise this
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoBlock label="What" body={topic.what} />
          <InfoBlock label="Why" body={topic.why} />
          <InfoBlock label="When" body={topic.when} />
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              How
            </div>
            <ol className="mt-2 space-y-1 pl-4 text-sm text-foreground/90 list-decimal">
              {topic.how.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-border bg-background p-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-500">
            <AlertTriangle className="h-3.5 w-3.5" /> Common mistakes
          </div>
          <ul className="mt-2 space-y-1 text-sm">
            {topic.mistakes.map((m, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-red-500">✕</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3 rounded-lg border border-amber-500/50 bg-amber-500/5 p-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-600">
            <ShieldAlert className="h-3.5 w-3.5" /> Safety reminder
          </div>
          <p className="mt-1 text-sm text-foreground/85">{topic.safety}</p>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
        {label}
      </div>
      <p className="mt-1 text-sm text-foreground/90 leading-relaxed">{body}</p>
    </div>
  );
}

// ── Overview thumbnail (mini driver view without cockpit chrome)
function TopicThumb({ topic }: { topic: Topic }) {
  const s = topic.stages[0];
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-[#0a0f16]">
      <svg viewBox="0 0 640 360" className="h-full w-full">
        <rect x={0} y={0} width={640} height={360} fill="#dfe6ea" />
        {s.scene}
        {s.refPoint && (
          <>
            <circle
              cx={s.refPoint.x}
              cy={s.refPoint.y}
              r={(s.refPoint.r ?? 14) + 6}
              fill="none"
              stroke={GOLD}
              strokeWidth={3}
              opacity={0.85}
            />
            <circle cx={s.refPoint.x} cy={s.refPoint.y} r={4} fill={GOLD} />
          </>
        )}
      </svg>
      <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Knowledge check
// ─────────────────────────────────────────────────────────────

type QQ = { q: string; options: string[]; answer: number };
const questions: QQ[] = [
  {
    q: "When parked correctly, which reference confirms you are parallel to the left kerb?",
    options: [
      "The kerb appearing to meet the lower edge of the dashboard, cross-checked in the left mirror.",
      "The bonnet touching the kerb.",
      "The right mirror showing the centre line.",
    ],
    answer: 0,
  },
  {
    q: "On a marked traffic lane, where should the two lane lines appear?",
    options: [
      "Both lines close to the bonnet.",
      "The left line along the dashboard, the right line near the steering wheel.",
      "Both lines outside the windscreen.",
    ],
    answer: 1,
  },
  {
    q: "How much of the driver's windscreen should parked vehicles occupy to give roughly 1 metre clearance?",
    options: ["About 10%", "About 40%", "About 80%"],
    answer: 1,
  },
  {
    q: "When turning left from a major road, when should you begin steering?",
    options: [
      "When the bonnet passes the kerb.",
      "When the corner of the new road reaches the left A-pillar.",
      "When the right mirror shows the corner.",
    ],
    answer: 1,
  },
  {
    q: "When turning right from a major road into a minor road, what should the right door mirror align with?",
    options: [
      "The centre of the new side road.",
      "The far kerb of the major road.",
      "The oncoming traffic.",
    ],
    answer: 0,
  },
  {
    q: "Emerging left, where do you stop at a give-way line?",
    options: [
      "Wherever feels comfortable.",
      "When the line reaches the calibrated door-mirror reference — behind the line.",
      "One car length past the line.",
    ],
    answer: 1,
  },
  {
    q: "Emerging right, where should the minor road's centre line appear on your steering wheel?",
    options: ["Around 12 o'clock", "Around 1 o'clock", "Around 6 o'clock"],
    answer: 1,
  },
];

function KnowledgeCheck() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const score = useMemo(
    () => Object.entries(answers).filter(([i, v]) => questions[+i].answer === v).length,
    [answers],
  );
  const done = Object.keys(answers).length === questions.length;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
        <Sparkles className="h-3.5 w-3.5" /> Knowledge check
      </div>
      <h2 className="mt-1 font-display text-2xl">One question per topic</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Answer all seven to lock in the reference points.
      </p>
      <ol className="mt-5 space-y-5">
        {questions.map((q, qi) => {
          const chosen = answers[qi];
          const showResult = chosen !== undefined;
          return (
            <li key={qi} className="rounded-xl border border-border bg-background p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                Question {qi + 1}
              </div>
              <p className="mt-1 font-display text-base leading-snug">{q.q}</p>
              <div className="mt-3 grid gap-2">
                {q.options.map((opt, oi) => {
                  const picked = chosen === oi;
                  const correct = q.answer === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={showResult}
                      onClick={() => setAnswers((p) => ({ ...p, [qi]: oi }))}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                        !showResult && "border-border hover:border-accent",
                        showResult && correct && "border-emerald-500/60 bg-emerald-500/10",
                        showResult && picked && !correct && "border-red-500/60 bg-red-500/10",
                        showResult && !picked && !correct && "opacity-70",
                      )}
                    >
                      {showResult && correct ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : showResult && picked ? (
                        <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                      ) : (
                        <span className="h-4 w-4 shrink-0 rounded-full border border-border" />
                      )}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
      {done && (
        <div className="mt-5 rounded-xl border border-accent bg-accent/10 p-4 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
            Your score
          </div>
          <div className="mt-1 font-display text-3xl">
            {score} / {questions.length}
          </div>
          <button
            type="button"
            onClick={() => setAnswers({})}
            className="mt-3 rounded-md border border-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent hover:bg-accent/10"
          >
            Retake
          </button>
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Route + page
// ─────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_authenticated/vehicle-reference-points")({
  head: () => ({
    meta: [
      { title: "Vehicle Reference Points · GSM Plus" },
      {
        name: "description",
        content:
          "Interactive GSM Plus reference-point dashboard: parked position, normal road position, clearance, turns and emerging — with driver's-view and top-view diagrams.",
      },
    ],
  }),
  component: VehicleReferencePointsPage,
});

function VehicleReferencePointsPage() {
  const [openId, setOpenId] = useState<string | null>(topics[0].id);
  const { isDone } = useLessonProgress();
  const doneCount = topics.filter((t) => isDone(`vrp-${t.id}`)).length;

  return (
    <PortalShell eyebrow="Driving skills" title="Vehicle Reference Points">
      <Link
        to="/driving-clips"
        className="mb-4 inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Practical strategy videos
      </Link>

      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Reference points show you where the car actually is on the road — from the driver's seat.
        Learn them once, then use them to park straight, stay centred, keep safe clearance, and
        turn precisely at every junction.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Diagrams" value={`${topics.length}`} />
        <Stat label="Practised" value={`${doneCount} / ${topics.length}`} accent />
        <Stat label="Views" value="Driver + top" />
      </div>

      <div className="mt-6 grid gap-4">
        {topics.map((t) => {
          const open = openId === t.id;
          return (
            <div key={t.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : t.id)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left shadow-sm transition-colors",
                  open ? "border-accent" : "border-border hover:border-accent/60",
                )}
              >
                <div className="w-40 shrink-0 sm:w-52">
                  <TopicThumb topic={t} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                    Diagram {t.num}
                  </div>
                  <div className="mt-1 font-display text-lg leading-tight">{t.title}</div>
                  <p className="mt-1 hidden text-sm text-muted-foreground sm:block">{t.tagline}</p>
                </div>
                <div className="hidden shrink-0 items-center gap-2 sm:flex">
                  {isDone(`vrp-${t.id}`) && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-label="Practised" />
                  )}
                  <span className="inline-flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">
                    {open ? "Hide" : "View reference point"}
                    <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")} />
                  </span>
                </div>
              </button>
              {open && (
                <div className="mt-3">
                  <TopicDetail topic={t} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <KnowledgeCheck />
      </div>

      <div className="mt-6 rounded-2xl border border-amber-500/50 bg-amber-500/5 p-5">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-600">
          <ShieldAlert className="h-3.5 w-3.5" /> Final safety note
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">
          Reference points help learners understand the vehicle's position, but they are not
          exact measurements. They may change with seat position, driver height, vehicle model
          and road shape. Always combine reference points with effective observations, an
          appropriate speed, and professional instruction.
        </p>
      </div>
    </PortalShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        accent ? "border-accent bg-accent/10" : "border-border bg-card",
      )}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl">{value}</div>
    </div>
  );
}