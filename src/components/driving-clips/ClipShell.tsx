import { useEffect, useRef, useState, type ReactNode } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// Shared infrastructure for the animated driving clips. Each clip is a
// 30-second loop showing a top-down driving scenario. The clip supplies a
// render function that takes a normalised progress value (t in 0..1) and
// returns an SVG scene. Beats give the caption timeline underneath.
export type ClipBeat = { at: number; label: string; detail: string };

export function ClipShell({
  title,
  rule,
  aspect = "16/9",
  beats,
  render,
  durationMs = 12000,
}: {
  title: string;
  rule: string;
  aspect?: string;
  beats: ClipBeat[];
  render: (t: number) => ReactNode;
  durationMs?: number;
}) {
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0);
  const raf = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef(0);

  useEffect(() => {
    if (!playing) {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      startRef.current = null;
      baseRef.current = t;
      return;
    }
    const step = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const next = (baseRef.current + elapsed / durationMs) % 1;
      setT(next);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, durationMs]);

  const reset = () => {
    setT(0);
    baseRef.current = 0;
    startRef.current = null;
  };

  const activeBeat = beats.reduce((acc, b) => (t >= b.at ? b : acc), beats[0]);

  return (
    <div className="border border-border bg-card">
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-accent">Animated clip</div>
          <div className="mt-1 font-display text-lg leading-tight">{title}</div>
          <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{rule}</div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setPlaying((v) => !v)}
            aria-label={playing ? "Pause" : "Play"}
            className="grid h-9 w-9 place-items-center border border-border bg-background hover:bg-secondary"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label="Restart"
            className="grid h-9 w-9 place-items-center border border-border bg-background hover:bg-secondary"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-hidden bg-[#1a1a1c]" style={{ aspectRatio: aspect }}>
        {render(t)}
      </div>

      {/* Scrub bar */}
      <div className="relative h-1.5 w-full bg-secondary">
        <div className="absolute left-0 top-0 h-full bg-accent transition-[width]" style={{ width: `${t * 100}%` }} />
        {beats.map((b) => (
          <div key={b.at} className="absolute top-0 h-full w-0.5 bg-background/60" style={{ left: `${b.at * 100}%` }} />
        ))}
      </div>

      {/* Caption */}
      <div className="p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-accent">Now happening</div>
        <div className="mt-1 font-display text-base">{activeBeat.label}</div>
        <p className="mt-1 text-sm text-muted-foreground">{activeBeat.detail}</p>

        <ol className="mt-3 grid gap-1 border-t border-border pt-3 text-xs">
          {beats.map((b, i) => (
            <li
              key={b.at}
              className={cn(
                "flex gap-2",
                b === activeBeat ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span className="font-mono w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1">{b.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// Small helpers used by clip scenes.
export function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Piecewise linear map: given breakpoints [(t0,v0),(t1,v1),...] return v at t.
export function segment(t: number, points: [number, number][]): number {
  for (let i = 0; i < points.length - 1; i++) {
    const [t0, v0] = points[i];
    const [t1, v1] = points[i + 1];
    if (t >= t0 && t <= t1) {
      const k = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * k;
    }
  }
  return points[points.length - 1][1];
}

// Car token: a coloured rectangle with a windscreen. `heading` in degrees,
// 0 = north (up).
export function CarToken({
  x,
  y,
  heading = 0,
  color = "#e5484d",
  scale = 1,
  indicator,
}: {
  x: number;
  y: number;
  heading?: number;
  color?: string;
  scale?: number;
  indicator?: "left" | "right" | null;
}) {
  const w = 14 * scale;
  const h = 26 * scale;
  return (
    <g transform={`translate(${x} ${y}) rotate(${heading}) scale(${scale})`}>
      <rect x={-7} y={-13} width={14} height={26} rx={2.5} fill={color} stroke="#0a0a0a" strokeWidth={0.6} />
      {/* Windscreen */}
      <rect x={-5.5} y={-9} width={11} height={5} rx={1} fill="#111" opacity={0.7} />
      {/* Rear window */}
      <rect x={-5.5} y={5} width={11} height={4} rx={1} fill="#111" opacity={0.5} />
      {/* Headlights */}
      <rect x={-6} y={-13.4} width={3} height={1.5} fill="#fff8c0" />
      <rect x={3} y={-13.4} width={3} height={1.5} fill="#fff8c0" />
      {/* Indicator */}
      {indicator === "left" && <circle cx={-8} cy={-10} r={1.6} fill="#ffb020"><animate attributeName="opacity" values="1;0.2;1" dur="0.5s" repeatCount="indefinite" /></circle>}
      {indicator === "right" && <circle cx={8} cy={-10} r={1.6} fill="#ffb020"><animate attributeName="opacity" values="1;0.2;1" dur="0.5s" repeatCount="indefinite" /></circle>}
    </g>
  );
}

// Common road textures. Callers put children on top.
export function TarmacBackground({ children }: { children?: ReactNode }) {
  return (
    <svg viewBox="0 0 640 360" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="clip-tarmac" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3a3d" />
          <stop offset="0.5" stopColor="#2b2b2e" />
          <stop offset="1" stopColor="#3a3a3d" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="640" height="360" fill="#3d6a2f" />
      {children}
    </svg>
  );
}