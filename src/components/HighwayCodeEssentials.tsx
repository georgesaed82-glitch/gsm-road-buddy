import { forwardRef, useId, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactElement, type ReactNode, type WheelEvent as ReactWheelEvent } from "react";

// ─────────────────────────────────────────────────────────────
// Highway Code — visual essentials
// Rendered at the top of the Highway Code page.
// Sections: Road studs · Stopping distances · Traffic light types
// ─────────────────────────────────────────────────────────────

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="border border-border bg-card p-5 sm:p-6">
      <div className="text-[11px] uppercase tracking-[0.2em] text-accent">Essentials</div>
      <h3 className="mt-1 font-display text-2xl leading-tight">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

// ── Zoom & pan wrapper ─────────────────────────────────────────────
// Wrap any SVG scene so users can pinch / wheel / button-zoom and drag to pan.
// Works with mouse, trackpad wheel and touch pinch.
function ZoomPan({ children, aspect = "16/9", label }: { children: ReactNode; aspect?: string; label?: string }) {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const dragging = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);

  const clampScale = (s: number) => Math.max(1, Math.min(6, s));
  const zoomTo = (next: number) => {
    const s = clampScale(next);
    setScale(s);
    if (s === 1) {
      setTx(0);
      setTy(0);
    }
  };

  const onWheel = (e: ReactWheelEvent) => {
    if (!e.ctrlKey && Math.abs(e.deltaY) < 8) return;
    e.preventDefault();
    const delta = -e.deltaY * 0.0025;
    zoomTo(scale * (1 + delta));
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale };
      dragging.current = null;
    } else if (scale > 1) {
      dragging.current = { x: e.clientX, y: e.clientY, tx, ty };
    }
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      zoomTo(pinchStart.current.scale * (dist / pinchStart.current.dist));
      return;
    }
    if (dragging.current) {
      setTx(dragging.current.tx + (e.clientX - dragging.current.x));
      setTy(dragging.current.ty + (e.clientY - dragging.current.y));
    }
  };
  const endPointer = (e: ReactPointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) dragging.current = null;
  };

  return (
    <div className="relative overflow-hidden rounded-sm border border-border bg-[#111]">
      <div
        className="relative w-full touch-none select-none"
        style={{ aspectRatio: aspect, cursor: scale > 1 ? "grab" : "zoom-in" }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onDoubleClick={() => zoomTo(scale >= 3 ? 1 : scale * 2)}
        role="group"
        aria-label={label}
      >
        <div
          className="absolute inset-0 origin-center"
          style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transition: dragging.current || pinchStart.current ? "none" : "transform 120ms ease-out" }}
        >
          {children}
        </div>
      </div>
      <div className="pointer-events-none absolute left-2 top-2 rounded-sm bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
        Pinch · scroll · double-tap to zoom
      </div>
      <div className="absolute right-2 top-2 flex gap-1">
        <button type="button" onClick={() => zoomTo(scale + 0.6)} className="h-7 w-7 rounded-sm bg-black/60 text-white text-sm font-bold hover:bg-black/80" aria-label="Zoom in">+</button>
        <button type="button" onClick={() => zoomTo(scale - 0.6)} className="h-7 w-7 rounded-sm bg-black/60 text-white text-sm font-bold hover:bg-black/80" aria-label="Zoom out">−</button>
        <button type="button" onClick={() => zoomTo(1)} className="h-7 rounded-sm bg-black/60 px-2 text-[11px] font-semibold text-white hover:bg-black/80" aria-label="Reset zoom">Reset</button>
      </div>
    </div>
  );
}

// ── Road studs (rule 132) ───────────────────────────────────
// Bird's-eye view of a UK dual carriageway. Two carriageways separated by a
// grass central reservation, with a hard shoulder on the far left and a slip
// road merging in on the near carriageway. Studs sit on real line positions.
function RoadStudsDiagram() {
  const TARMAC = "#3a3a3d";       // fresh asphalt
  const TARMAC_DARK = "#2b2b2e";  // shadow band
  const VERGE = "#4a7c3a";        // grass verge
  const VERGE_DARK = "#365a29";
  const RESERVATION = "#3d6a2f";  // central reservation grass
  const PAINT = "#f5f5f0";        // road paint (slightly warm white)

  // Row of studs at y, from x1..x2, spacing, colour, radius.
  const studs = (
    y: number,
    x1: number,
    x2: number,
    color: string,
    key: string,
    { spacing = 22, r = 2.6 }: { spacing?: number; r?: number } = {},
  ) => {
    const dots: ReactNode[] = [];
    for (let x = x1; x <= x2; x += spacing) {
      dots.push(
        <g key={`${key}-${x}`}>
          {/* subtle drop shadow */}
          <ellipse cx={x} cy={y + 1.4} rx={r + 0.6} ry={r * 0.55} fill="rgba(0,0,0,0.5)" />
          <circle cx={x} cy={y} r={r} fill={color} stroke="#0a0a0a" strokeWidth={0.5} />
          {/* specular highlight */}
          <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill="rgba(255,255,255,0.55)" />
        </g>,
      );
    }
    return dots;
  };

  return (
    <svg
      viewBox="0 0 640 360"
      className="block w-full h-auto"
      role="img"
      aria-label="Bird's-eye view of a UK dual carriageway showing red, white, amber, green and green/yellow road studs"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <linearGradient id="tarmac-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={TARMAC} />
          <stop offset="0.5" stopColor={TARMAC_DARK} />
          <stop offset="1" stopColor={TARMAC} />
        </linearGradient>
        <linearGradient id="verge-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={VERGE_DARK} />
          <stop offset="1" stopColor={VERGE} />
        </linearGradient>
        {/* subtle noise via repeating tiny dots for asphalt texture */}
        <pattern id="asphalt-tex" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="url(#tarmac-grad)" />
          <circle cx="1.3" cy="1.7" r="0.35" fill="rgba(255,255,255,0.04)" />
          <circle cx="4.2" cy="3.1" r="0.3" fill="rgba(0,0,0,0.18)" />
          <circle cx="2.6" cy="4.6" r="0.28" fill="rgba(255,255,255,0.05)" />
        </pattern>
        <pattern id="grass-tex" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="url(#verge-grad)" />
          <path d="M2 8 L2.6 4 M5 9 L4.6 5 M7.5 8 L7.9 4" stroke="rgba(0,0,0,0.18)" strokeWidth="0.5" />
          <path d="M2 7.5 L2.6 3.5 M5 8.5 L4.6 4.5 M7.5 7.5 L7.9 3.5" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* ── LEFT VERGE (grass) ── */}
      <rect x="0" y="0" width="640" height="22" fill="url(#grass-tex)" />

      {/* ── HARD SHOULDER ── */}
      <rect x="0" y="22" width="640" height="36" fill="url(#asphalt-tex)" />
      {/* Solid white edge line separating hard shoulder from lane 1 */}
      <line x1="0" y1="58" x2="640" y2="58" stroke={PAINT} strokeWidth="2.5" />
      {/* RED studs — between carriageway and hard shoulder */}
      {studs(58, 20, 620, "#ef2b2b", "red")}
      <text x="14" y="42" fill={PAINT} fontSize="10.5" fontFamily="Arial, sans-serif" fontWeight="700" letterSpacing="0.5">
        HARD SHOULDER
      </text>

      {/* ── CARRIAGEWAY A (two lanes, driving away from viewer) ── */}
      <rect x="0" y="58" width="640" height="120" fill="url(#asphalt-tex)" />

      {/* Lane divider — long broken white line + WHITE studs */}
      <line
        x1="0" y1="118" x2="640" y2="118"
        stroke={PAINT} strokeWidth="2.5" strokeDasharray="34 22"
      />
      {studs(118, 18, 622, "#ffffff", "white", { spacing: 28 })}

      {/* Slip road merge — a diagonal lane joining from the left */}
      <path
        d="M -20 178 L 200 178 L 320 130 L 320 138 L 210 186 L -20 186 Z"
        fill="url(#asphalt-tex)"
      />
      {/* Chevron / merge line marked with GREEN studs (edge of main carriageway at slip road) */}
      <path
        d="M 320 138 L 210 186"
        stroke={PAINT} strokeWidth="2" strokeDasharray="10 8" fill="none"
      />
      {(() => {
        const dots: ReactNode[] = [];
        for (let t = 0; t <= 1; t += 0.09) {
          const x = 320 + (210 - 320) * t;
          const y = 138 + (186 - 138) * t;
          dots.push(
            <g key={`gm-${t}`}>
              <ellipse cx={x} cy={y + 1.4} rx={3.2} ry={1.4} fill="rgba(0,0,0,0.5)" />
              <circle cx={x} cy={y} r={2.6} fill="#22c55e" stroke="#0a0a0a" strokeWidth={0.5} />
              <circle cx={x - 0.9} cy={y - 0.9} r={0.9} fill="rgba(255,255,255,0.55)" />
            </g>,
          );
        }
        return dots;
      })()}
      {/* Continuation of GREEN studs along the lay-by edge past the merge */}
      {studs(178, 20, 195, "#22c55e", "green-left", { spacing: 22 })}
      {studs(178, 335, 622, "#22c55e", "green-right", { spacing: 22 })}

      {/* Right edge of carriageway A (next to central reservation) — solid white edge line + AMBER studs */}
      <line x1="0" y1="178" x2="640" y2="178" stroke={PAINT} strokeWidth="2.5" />

      {/* ── CENTRAL RESERVATION (grass with crash barriers) ── */}
      <rect x="0" y="178" width="640" height="30" fill="url(#grass-tex)" />
      {/* Armco barriers */}
      <rect x="0" y="182" width="640" height="2.2" fill="#c9c9c9" />
      <rect x="0" y="182" width="640" height="0.6" fill="#ffffff" opacity="0.7" />
      <rect x="0" y="202" width="640" height="2.2" fill="#c9c9c9" />
      <rect x="0" y="202" width="640" height="0.6" fill="#ffffff" opacity="0.7" />
      {/* Barrier posts */}
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={`post-${i}`} x={20 + i * 40} y="180" width="2" height="26" fill="#8a8a8a" />
      ))}
      {/* AMBER studs on both edges of the central reservation */}
      {studs(178, 20, 620, "#f5a300", "amber-top", { spacing: 22 })}
      {studs(208, 20, 620, "#f5a300", "amber-bot", { spacing: 22 })}

      {/* ── CARRIAGEWAY B (two lanes, driving toward viewer) ── */}
      <rect x="0" y="208" width="640" height="120" fill="url(#asphalt-tex)" />
      <line x1="0" y1="208" x2="640" y2="208" stroke={PAINT} strokeWidth="2.5" />

      {/* Lane divider */}
      <line
        x1="0" y1="268" x2="640" y2="268"
        stroke={PAINT} strokeWidth="2.5" strokeDasharray="34 22"
      />
      {studs(268, 18, 622, "#ffffff", "white-b", { spacing: 28 })}

      {/* Left edge of carriageway B (nearest the verge) — solid white + RED studs */}
      <line x1="0" y1="328" x2="640" y2="328" stroke={PAINT} strokeWidth="2.5" />
      {studs(328, 20, 620, "#ef2b2b", "red-b")}

      {/* Temporary layout — cones + GREEN/YELLOW studs on part of the lane */}
      {(() => {
        const cones: ReactNode[] = [];
        for (let x = 380; x <= 600; x += 24) {
          cones.push(
            <g key={`cone-${x}`}>
              <polygon points={`${x - 3},${238} ${x + 3},${238} ${x + 4.5},${248} ${x - 4.5},${248}`} fill="#ff7a1a" />
              <rect x={x - 4.7} y={244} width="9.4" height="1.6" fill="#ffffff" />
              <rect x={x - 4.8} y={248} width="9.6" height="1.6" fill="#111" />
            </g>,
          );
        }
        return cones;
      })()}
      {/* Green/yellow fluorescent studs marking the temporary route */}
      {(() => {
        const dots: ReactNode[] = [];
        for (let x = 380; x <= 600; x += 22) {
          dots.push(
            <g key={`gy-${x}`}>
              <ellipse cx={x} cy={255} rx={3.2} ry={1.4} fill="rgba(0,0,0,0.5)" />
              <circle cx={x} cy={253} r={2.9} fill="#f2ff00" stroke="#0a0a0a" strokeWidth={0.5} />
              <circle cx={x - 1} cy={252} r={1} fill="rgba(255,255,255,0.7)" />
            </g>,
          );
        }
        return dots;
      })()}

      {/* ── RIGHT VERGE ── */}
      <rect x="0" y="328" width="640" height="32" fill="url(#grass-tex)" />

      {/* Faint direction arrows on the tarmac */}
      <g fill={PAINT} opacity="0.35">
        <polygon points="80,90 92,90 92,80 108,100 92,120 92,110 80,110" />
        <polygon points="560,278 548,278 548,268 532,288 548,308 548,298 560,298" transform="scale(1) translate(0,0)" />
      </g>

      {/* Compact legend badges — overlaid on grass strips, unobtrusive */}
      <g fontFamily="Arial, sans-serif" fontSize="9" fontWeight="700" fill={PAINT}>
        <text x="14" y="16" letterSpacing="0.4">LEFT VERGE</text>
        <text x="14" y="200" letterSpacing="0.4">CENTRAL RESERVATION</text>
        <text x="14" y="352" letterSpacing="0.4">VERGE</text>
      </g>
    </svg>
  );
}

function RoadStuds() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const serializeSvg = () => {
    const src = svgRef.current;
    if (!src) return null;
    const clone = src.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    // Ensure the exported file has a solid background
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    const vb = (clone.getAttribute("viewBox") || "0 0 360 640").split(/\s+/).map(Number);
    bg.setAttribute("x", String(vb[0]));
    bg.setAttribute("y", String(vb[1]));
    bg.setAttribute("width", String(vb[2]));
    bg.setAttribute("height", String(vb[3]));
    bg.setAttribute("fill", "#0b1220");
    clone.insertBefore(bg, clone.firstChild);
    return { markup: new XMLSerializer().serializeToString(clone), vb };
  };

  const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportSvg = () => {
    const out = serializeSvg();
    if (!out) return;
    download(new Blob([out.markup], { type: "image/svg+xml;charset=utf-8" }), "gsm-road-studs.svg");
  };

  const exportPng = async (scale = 4) => {
    const out = serializeSvg();
    if (!out) return;
    const [, , vw, vh] = out.vb;
    const img = new Image();
    img.decoding = "async";
    const blob = new Blob([out.markup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("SVG load failed"));
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(vw * scale);
      canvas.height = Math.round(vh * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => {
        if (b) download(b, `gsm-road-studs-${canvas.width}x${canvas.height}.png`);
      }, "image/png");
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Panel
      title="Road stud colours (rule 132)"
      subtitle="Reflective studs mark lane edges — colour tells you what the line means."
    >
      <ZoomPan aspect="3/4" label="UK dual carriageway from above showing road stud colours — pinch or scroll to zoom in">
        <DualCarriagewayStudsSvg ref={svgRef} />
      </ZoomPan>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={exportSvg}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          Export SVG
        </button>
        <button
          type="button"
          onClick={() => exportPng(4)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          Export PNG (high-res)
        </button>
        <button
          type="button"
          onClick={() => exportPng(2)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          Export PNG (standard)
        </button>
      </div>
      <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <li className="flex items-start gap-2">
          <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#ef4444] ring-1 ring-white/40" />
          <span><strong>Red</strong> — between the edge of the carriageway and the hard shoulder.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-white ring-1 ring-white/40" />
          <span><strong>White</strong> — between lanes, and along the centre of the road.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#f59e0b] ring-1 ring-white/40" />
          <span><strong>Amber</strong> — right edge of the carriageway next to the central reservation of a dual carriageway or motorway.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#22c55e] ring-1 ring-white/40" />
          <span><strong>Green</strong> — edge of the main carriageway at lay-bys and slip roads.</span>
        </li>
        <li className="flex items-start gap-2 sm:col-span-2">
          <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#facc15] ring-1 ring-white/40" />
          <span><strong>Green / yellow</strong> — a temporary road layout, for example at contraflows and roadworks.</span>
        </li>
      </ul>
    </Panel>
  );
}

// Top-down, TSRGD-faithful dual carriageway showing the five stud colours.
// Hard shoulder on the LEFT, traffic flowing UP the page.
const DualCarriagewayStudsSvg = forwardRef<SVGSVGElement>((_props, ref) => {
  // Simple, realistic top-down dual carriageway.
  // Hard shoulder on the LEFT running the FULL length. Traffic flows UP.
  // Left → right: grass | hard shoulder | lane 1 | lane 2 | central reservation | opposite carriageway hint | grass.
  const W = 360;
  const H = 640;
  const xGrassL = 30;
  const xHard = 90;   // RED studs live on this line (hard shoulder ↔ lane 1)
  const xMid = 175;   // WHITE studs live on this line (between lanes)
  const xLane2R = 260; // AMBER studs live on this line (lane 2 ↔ central reservation)
  const xCentR = 300;
  const xRoadR = 340;

  // Slip road merging in from the LEFT (bottom-left → up into lane 1).
  // Green studs mark the main carriageway edge along this merge.
  const slipTop = 300; // where the slip road finishes merging (nose)
  const slipBot = 560; // where the slip road enters the frame

  const Stud = ({ x, y, r = 3.4, fill }: { x: number; y: number; r?: number; fill: string }) => (
    <circle cx={x} cy={y} r={r} fill={fill} stroke="#0a0a0a" strokeWidth={0.5} />
  );

  // Evenly spaced studs along a vertical line, skipping any y within a range
  const verticalStuds = (x: number, step: number, fill: string, skip?: [number, number]) => {
    const nodes: ReactElement[] = [];
    for (let y = 20; y <= H - 20; y += step) {
      if (skip && y >= skip[0] && y <= skip[1]) continue;
      nodes.push(<Stud key={`${x}-${y}-${fill}`} x={x} y={y} fill={fill} />);
    }
    return nodes;
  };

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label="Top-down UK dual carriageway with hard shoulder on the left showing red, white and amber road studs">
      <defs>
        <linearGradient id="rs-tarmac2" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#2c3035" />
          <stop offset="0.5" stopColor="#34383d" />
          <stop offset="1" stopColor="#2c3035" />
        </linearGradient>
        <linearGradient id="rs-hs" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#3a3f45" />
          <stop offset="1" stopColor="#31363b" />
        </linearGradient>
        <pattern id="rs-grass2" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#2f6b3a" />
          <circle cx="2" cy="2" r="0.7" fill="#3d8148" />
          <circle cx="6" cy="5" r="0.7" fill="#245a2f" />
        </pattern>
      </defs>

      {/* Grass verges */}
      <rect x="0" y="0" width={xGrassL} height={H} fill="url(#rs-grass2)" />
      <rect x={xRoadR} y="0" width={W - xRoadR} height={H} fill="url(#rs-grass2)" />

      {/* Hard shoulder — full length on the LEFT */}
      <rect x={xGrassL} y="0" width={xHard - xGrassL} height={H} fill="url(#rs-hs)" />

      {/* Slip road tarmac — enters from the bottom-left, tapers up to the hard shoulder */}
      <path
        d={`M -20 ${H}
            L ${xHard} ${slipTop}
            L ${xHard} ${slipBot}
            L -20 ${H + 40} Z`}
        fill="url(#rs-tarmac2)"
      />
      {/* Cover the verge under the slip road so it looks tarmacked all the way to the edge */}
      <path
        d={`M 0 ${slipBot - 10}
            L ${xGrassL} ${slipBot}
            L ${xGrassL} ${H}
            L 0 ${H} Z`}
        fill="url(#rs-tarmac2)"
      />
      {/* White edge markings guiding the slip road into the main carriageway */}
      <line x1={-20} y1={H} x2={xHard} y2={slipTop} stroke="#f4f4f4" strokeWidth="2" opacity="0.85" />

      {/* Two-lane carriageway */}
      <rect x={xHard} y="0" width={xLane2R - xHard} height={H} fill="url(#rs-tarmac2)" />

      {/* Central reservation with steel barrier */}
      <rect x={xLane2R} y="0" width={xCentR - xLane2R} height={H} fill="url(#rs-grass2)" />
      <rect x={(xLane2R + xCentR) / 2 - 1.2} y="0" width="2.4" height={H} fill="#c7cad0" />
      {Array.from({ length: 18 }).map((_, i) => (
        <rect key={i} x={(xLane2R + xCentR) / 2 - 3} y={12 + i * 36} width="6" height="2.5" fill="#8a8f96" />
      ))}

      {/* Opposite carriageway hint */}
      <rect x={xCentR} y="0" width={xRoadR - xCentR} height={H} fill="url(#rs-tarmac2)" opacity="0.9" />

      {/* Solid white edge line: hard shoulder ↔ lane 1 */}
      <line x1={xHard} y1="0" x2={xHard} y2={slipTop} stroke="#f4f4f4" strokeWidth="2.4" />
      {/* Along the merge, the edge line becomes broken (ghost island) */}
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={`gi-${i}`} x={xHard - 1.2} y={slipTop + 6 + i * 22} width="2.4" height="10" fill="#f4f4f4" opacity="0.85" />
      ))}
      <line x1={xHard} y1={slipBot} x2={xHard} y2={H} stroke="#f4f4f4" strokeWidth="2.4" />

      {/* Broken white centre line between the two lanes */}
      {Array.from({ length: 22 }).map((_, i) => (
        <rect key={i} x={xMid - 1.4} y={6 + i * 30} width="2.8" height="16" fill="#f4f4f4" />
      ))}

      {/* Solid white edge line: lane 2 ↔ central reservation */}
      <line x1={xLane2R} y1="0" x2={xLane2R} y2={H} stroke="#f4f4f4" strokeWidth="2.4" />

      {/* RED studs — sit ON the left edge line, but replaced by GREEN across the merge */}
      {verticalStuds(xHard, 26, "#ef4444", [slipTop - 8, slipBot + 8])}

      {/* GREEN studs — main carriageway edge where the slip road joins */}
      {Array.from({ length: 10 }).map((_, i) => (
        <circle
          key={`gs-${i}`}
          cx={xHard}
          cy={slipTop + i * ((slipBot - slipTop) / 9)}
          r={3.6}
          fill="#22c55e"
          stroke="#0a0a0a"
          strokeWidth={0.5}
        />
      ))}

      {/* WHITE studs — aligned with the broken centre line, full length */}
      {verticalStuds(xMid, 30, "#f5f5f5")}

      {/* AMBER studs — sit ON the right edge line, full length */}
      {verticalStuds(xLane2R, 26, "#f59e0b")}

      {/* Direction of travel — subtle arrows in each lane */}
      <g fill="#ffffff" opacity="0.55">
        <polygon points={`${(xHard + xMid) / 2},30 ${(xHard + xMid) / 2 - 8},46 ${(xHard + xMid) / 2 + 8},46`} />
        <rect x={(xHard + xMid) / 2 - 2.5} y="46" width="5" height="20" />
        <polygon points={`${(xMid + xLane2R) / 2},30 ${(xMid + xLane2R) / 2 - 8},46 ${(xMid + xLane2R) / 2 + 8},46`} />
        <rect x={(xMid + xLane2R) / 2 - 2.5} y="46" width="5" height="20" />
      </g>

      {/* In-diagram legend */}
      <g fontFamily="Arial, sans-serif">
        <rect x={xRoadR - 132} y={H - 118} width="128" height="104" rx="6" fill="#0f172a" opacity="0.88" stroke="#1f2937" />
        <text x={xRoadR - 122} y={H - 96} fill="#f8fafc" fontSize="10.5" fontWeight="700" letterSpacing="0.6">STUD COLOURS</text>
        <g fontSize="10" fill="#e5e7eb">
          <circle cx={xRoadR - 116} cy={H - 78} r="4" fill="#ef4444" stroke="#0a0a0a" strokeWidth="0.5" />
          <text x={xRoadR - 106} y={H - 74}>Red · left edge</text>
          <circle cx={xRoadR - 116} cy={H - 62} r="4" fill="#f5f5f5" stroke="#0a0a0a" strokeWidth="0.5" />
          <text x={xRoadR - 106} y={H - 58}>White · between lanes</text>
          <circle cx={xRoadR - 116} cy={H - 46} r="4" fill="#f59e0b" stroke="#0a0a0a" strokeWidth="0.5" />
          <text x={xRoadR - 106} y={H - 42}>Amber · right edge</text>
          <circle cx={xRoadR - 116} cy={H - 30} r="4" fill="#22c55e" stroke="#0a0a0a" strokeWidth="0.5" />
          <text x={xRoadR - 106} y={H - 26}>Green · slip road</text>
        </g>
      </g>

      {/* Slip-road label */}
      <text x={10} y={slipBot + 30} fill="#e5e7eb" fontSize="10" fontFamily="Arial, sans-serif" fontWeight="700" letterSpacing="0.6">
        SLIP ROAD
      </text>
    </svg>
  );
});
DualCarriagewayStudsSvg.displayName = "DualCarriagewayStudsSvg";

// ── Stopping distances (rule 126) ────────────────────────────
function StoppingDistances() {
  // Distances in metres — official DVSA figures.
  const rows = [
    { mph: 20, thinking: 6, braking: 6, carLengths: 3 },
    { mph: 30, thinking: 9, braking: 14, carLengths: 6 },
    { mph: 40, thinking: 12, braking: 24, carLengths: 9 },
    { mph: 50, thinking: 15, braking: 38, carLengths: 13 },
    { mph: 60, thinking: 18, braking: 55, carLengths: 18 },
    { mph: 70, thinking: 21, braking: 75, carLengths: 24 },
  ];
  const max = 96; // 21+75
  return (
    <Panel
      title="Typical stopping distances (rule 126)"
      subtitle="Total stopping distance = thinking distance + braking distance. In wet weather double it; on ice it can be ten times greater."
    >
      <div className="space-y-3">
        {rows.map((r) => {
          const total = r.thinking + r.braking;
          const tPct = (r.thinking / max) * 100;
          const bPct = (r.braking / max) * 100;
          return (
            <div key={r.mph}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold">{r.mph} mph</span>
                <span className="text-muted-foreground">
                  {total} m · {r.carLengths} car lengths
                </span>
              </div>
              <div className="mt-1 flex h-5 w-full overflow-hidden rounded-sm bg-secondary">
                <div
                  className="flex items-center justify-center text-[10px] font-semibold text-white"
                  style={{ width: `${tPct}%`, backgroundColor: "#0ea5e9" }}
                  title={`Thinking ${r.thinking} m`}
                >
                  {r.thinking}m
                </div>
                <div
                  className="flex items-center justify-center text-[10px] font-semibold text-white"
                  style={{ width: `${bPct}%`, backgroundColor: "#dc2626" }}
                  title={`Braking ${r.braking} m`}
                >
                  {r.braking}m
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ backgroundColor: "#0ea5e9" }} /> Thinking distance</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ backgroundColor: "#dc2626" }} /> Braking distance</span>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Rule of thumb: leave at least a <strong>two-second gap</strong> to the vehicle in front on a dry road, <strong>four seconds</strong> in the wet.
      </p>
    </Panel>
  );
}

// ── Traffic lights ───────────────────────────────────────────
function Light({ color, on }: { color: "red" | "amber" | "green"; on: boolean }) {
  const map = { red: "#dc2626", amber: "#f59e0b", green: "#22c55e" } as const;
  const off = { red: "#3b0e0e", amber: "#3a2606", green: "#0e2f18" } as const;
  return (
    <circle
      cx="20"
      cy={color === "red" ? 18 : color === "amber" ? 46 : 74}
      r="10"
      fill={on ? map[color] : off[color]}
      stroke="#000"
      strokeWidth="1"
    />
  );
}

function Signal({
  label,
  red,
  amber,
  green,
  extra,
}: {
  label: string;
  red?: boolean;
  amber?: boolean;
  green?: boolean;
  extra?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 40 92" width="40" height="92" aria-hidden="true">
        <rect x="4" y="2" width="32" height="88" rx="6" fill="#111827" stroke="#000" strokeWidth="1.5" />
        <Light color="red" on={!!red} />
        <Light color="amber" on={!!amber} />
        <Light color="green" on={!!green} />
      </svg>
      {extra}
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function FilterArrow({ direction = "right" }: { direction?: "right" | "left" }) {
  const flip = direction === "left" ? "scale(-1,1) translate(-40,0)" : undefined;
  return (
    <svg viewBox="0 0 40 28" width="40" height="28" aria-hidden="true">
      <rect x="4" y="2" width="32" height="24" rx="4" fill="#111827" stroke="#000" strokeWidth="1.5" />
      <g transform={flip}>
        <path d="M12 14 L24 14 L24 10 L30 15 L24 20 L24 16 L12 16 Z" fill="#22c55e" />
      </g>
    </svg>
  );
}

function CrossingIcon({ kind }: { kind: "pelican" | "puffin" | "toucan" }) {
  // Small badge showing who uses this crossing.
  const bg = kind === "toucan" ? "#0f766e" : "#334155";
  return (
    <div className="flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white" style={{ backgroundColor: bg }}>
      {kind === "pelican" && "🚶"}
      {kind === "puffin" && "🚶"}
      {kind === "toucan" && "🚶 🚲"}
    </div>
  );
}

function TrafficLights() {
  return (
    <Panel
      title="Traffic lights & pedestrian crossings"
      subtitle="The signal sequence, the flashing amber phase, filter arrows, and what Pelican / Puffin / Toucan actually stand for."
    >
      {/* Standard sequence */}
      <div>
        <div className="text-sm font-semibold">Signal sequence (rule 175)</div>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Signal label="STOP — wait behind the line" red />
          <Signal label="STOP — red + amber, get ready" red amber />
          <Signal label="GO — if the way is clear" green />
          <Signal label="STOP — unless you cannot safely" amber />
        </div>
      </div>

      {/* Filter arrow */}
      <div className="mt-8">
        <div className="text-sm font-semibold">Green filter arrow</div>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <svg viewBox="0 0 40 120" width="44" height="132" aria-hidden="true">
              <rect x="4" y="2" width="32" height="88" rx="6" fill="#111827" stroke="#000" strokeWidth="1.5" />
              <Light color="red" on />
              <Light color="amber" on={false} />
              <Light color="green" on={false} />
              <g transform="translate(0,92)">
                <rect x="4" y="0" width="32" height="24" rx="4" fill="#111827" stroke="#000" strokeWidth="1.5" />
                <path d="M12 12 L24 12 L24 8 L30 13 L24 18 L24 14 L12 14 Z" fill="#22c55e" />
              </g>
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">
            A green arrow shown with a red light means you may filter <strong>only in the direction of the arrow</strong>, even though the main light is red. Give way to any pedestrians crossing and other traffic already on the junction.
          </p>
        </div>
      </div>

      {/* Flashing amber */}
      <div className="mt-8">
        <div className="text-sm font-semibold">Flashing amber</div>
        <div className="mt-3 flex items-center gap-4">
          <Signal label="Flashing amber at a Pelican crossing" amber />
          <p className="max-w-prose text-sm text-muted-foreground">
            A flashing amber light follows the red at a <strong>Pelican crossing</strong>. It means: <strong>give way to any pedestrians still on the crossing</strong>. If the crossing is clear you may proceed with caution — do not race the light.
          </p>
        </div>
      </div>

      {/* Pedestrian crossings */}
      <div className="mt-10">
        <div className="text-sm font-semibold">Pedestrian & cycle crossings — what the names mean</div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="font-display text-lg">Pelican</div>
              <CrossingIcon kind="pelican" />
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
              PEdestrian LIght CONtrolled
            </div>
            <p className="mt-2 text-sm">
              Push-button crossing with signals on the <em>far</em> side of the road. Sequence includes a <strong>flashing amber</strong> to drivers and a <strong>flashing green</strong> man to pedestrians — pedestrians already on the crossing have priority.
            </p>
          </div>

          <div className="border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="font-display text-lg">Puffin</div>
              <CrossingIcon kind="puffin" />
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
              Pedestrian User-Friendly INtelligent
            </div>
            <p className="mt-2 text-sm">
              Kerb-side signals with sensors that <strong>detect pedestrians</strong> and hold the red until they've finished crossing. <strong>No flashing amber</strong> phase — the sequence is the same as normal traffic lights.
            </p>
          </div>

          <div className="border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="font-display text-lg">Toucan</div>
              <CrossingIcon kind="toucan" />
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
              "Two-can" cross — pedestrians &amp; cyclists
            </div>
            <p className="mt-2 text-sm">
              A wider crossing shared by <strong>pedestrians and cyclists</strong>, who may ride across. Kerb-side signals like a Puffin — <strong>no flashing amber</strong>.
            </p>
          </div>
        </div>

        <div className="mt-4 border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
          Also worth knowing: <strong>Zebra</strong> — black-and-white stripes with flashing yellow Belisha beacons, no signals; you must give way once anyone has stepped on. <strong>Pegasus (equestrian)</strong> — like a Toucan but with a higher control panel for horse riders.
        </div>
      </div>
    </Panel>
  );
}

export function HighwayCodeEssentials() {
  return (
    <div className="grid gap-6">
      <RoadStuds />
      <StoppingDistances />
      <TrafficLights />
      <ZebraCrossing />
    </div>
  );
}

// ── Zebra crossing ─────────────────────────────────────────────────
// Driver-eye top-down scene: two-lane road with a zebra crossing, Belisha
// beacons on both sides, zig-zag controlled area, a pedestrian stepping on,
// and a car approaching. Explains legal priority + "funnel vision".
function ZebraSceneSvg() {
  const TARMAC = "#3a3a3d";
  const TARMAC_DARK = "#2b2b2e";
  const PAINT = "#f6f6f0";
  const VERGE = "#4a7c3a";
  const VERGE_DARK = "#365a29";
  const PAVEMENT = "#a9a4a0";
  const PAVEMENT_DARK = "#8a857f";
  const AMBER = "#ffb300";
  const AMBER_GLOW = "#ffdd66";

  // Zebra crossing geometry — full width of the carriageway.
  // Highway Code (TSRGD diagram 1055.1): equal-width white stripes on tarmac,
  // sawtooth zig-zag markings on the approach, no stop line, Belisha beacon
  // globes aligned with the outer edges of the stripes.
  const ROAD_TOP = 92;
  const ROAD_BOT = 288;
  const CROSS_X1 = 208;   // left edge of striped area
  const CROSS_X2 = 452;   // right edge of striped area
  const STRIPE_W = 22;    // equal stripes & gaps for correct 1:1 rhythm

  const stripes: ReactNode[] = [];
  for (let sx = CROSS_X1, i = 0; sx + STRIPE_W <= CROSS_X2; sx += STRIPE_W, i++) {
    if (i % 2 === 0) {
      stripes.push(
        <rect key={`stripe-${sx}`} x={sx} y={ROAD_TOP} width={STRIPE_W} height={ROAD_BOT - ROAD_TOP} fill={PAINT} />,
      );
    }
  }

  // Proper sawtooth zig-zag markings (TSRGD 1001.3) — 8 teeth per approach,
  // pointing away from the carriageway on both sides of the crossing.
  const zigzagPath = (xStart: number, xEnd: number, yKerb: number, side: "top" | "bottom") => {
    const teeth = 8;
    const width = (xEnd - xStart) / teeth;
    const amp = 10;
    const dir = side === "top" ? 1 : -1;
    const yBase = yKerb + dir * 2;
    const yPeak = yBase + dir * amp;
    let d = `M ${xStart} ${yBase}`;
    for (let t = 0; t < teeth; t++) {
      const x1 = xStart + width * (t + 0.5);
      const x2 = xStart + width * (t + 1);
      d += ` L ${x1} ${yPeak} L ${x2} ${yBase}`;
    }
    return <path d={d} fill="none" stroke={PAINT} strokeWidth="2.4" strokeLinejoin="miter" strokeLinecap="square" />;
  };

  return (
    <svg
      viewBox="0 0 640 380"
      className="block w-full h-auto"
      role="img"
      aria-label="Top-down view of a UK zebra crossing with Belisha beacons and zig-zag markings"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <linearGradient id="zebra-tarmac" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={TARMAC} />
          <stop offset="0.5" stopColor={TARMAC_DARK} />
          <stop offset="1" stopColor={TARMAC} />
        </linearGradient>
        <pattern id="zebra-asphalt" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="url(#zebra-tarmac)" />
          <circle cx="1.3" cy="1.7" r="0.35" fill="rgba(255,255,255,0.05)" />
          <circle cx="4.2" cy="3.1" r="0.3" fill="rgba(0,0,0,0.18)" />
          <circle cx="2.6" cy="4.6" r="0.28" fill="rgba(255,255,255,0.05)" />
        </pattern>
        <linearGradient id="zebra-verge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={VERGE_DARK} />
          <stop offset="1" stopColor={VERGE} />
        </linearGradient>
        <linearGradient id="zebra-pavement" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PAVEMENT} />
          <stop offset="1" stopColor={PAVEMENT_DARK} />
        </linearGradient>
        <radialGradient id="beacon-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={AMBER_GLOW} stopOpacity="0.9" />
          <stop offset="0.6" stopColor={AMBER} stopOpacity="0.55" />
          <stop offset="1" stopColor={AMBER} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="beacon-body" cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff5cc" />
          <stop offset="0.4" stopColor={AMBER_GLOW} />
          <stop offset="1" stopColor={AMBER} />
        </radialGradient>
      </defs>

      {/* Grass verges outer */}
      <rect x="0" y="0" width="640" height="60" fill="url(#zebra-verge)" />
      <rect x="0" y="320" width="640" height="60" fill="url(#zebra-verge)" />

      {/* Pavements */}
      <rect x="0" y="60" width="640" height="30" fill="url(#zebra-pavement)" />
      <rect x="0" y="290" width="640" height="30" fill="url(#zebra-pavement)" />
      {/* Pavement slabs */}
      {Array.from({ length: 16 }, (_, i) => (
        <line key={`p1-${i}`} x1={i * 40} y1="60" x2={i * 40} y2="90" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" />
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <line key={`p2-${i}`} x1={i * 40} y1="290" x2={i * 40} y2="320" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" />
      ))}
      <line x1="0" y1="60" x2="640" y2="60" stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
      <line x1="0" y1="320" x2="640" y2="320" stroke="rgba(0,0,0,0.35)" strokeWidth="1" />

      {/* Kerbs */}
      <rect x="0" y="88" width="640" height="4" fill="#c9c4bd" />
      <rect x="0" y="288" width="640" height="4" fill="#c9c4bd" />

      {/* Road */}
      <rect x="0" y="92" width="640" height="196" fill="url(#zebra-asphalt)" />

      {/* Central broken lane line — stops at the zebra (no markings inside the crossing) */}
      <line x1="10" y1="190" x2={CROSS_X1 - 6} y2="190" stroke={PAINT} strokeWidth="2.4" strokeDasharray="20 14" />
      <line x1={CROSS_X2 + 6} y1="190" x2="630" y2="190" stroke={PAINT} strokeWidth="2.4" strokeDasharray="20 14" />

      {/* Zig-zag controlled area — both approaches, both kerbs. Zebras have NO stop line. */}
      {zigzagPath(20, CROSS_X1 - 8, ROAD_TOP, "top")}
      {zigzagPath(CROSS_X2 + 8, 620, ROAD_TOP, "top")}
      {zigzagPath(20, CROSS_X1 - 8, ROAD_BOT, "bottom")}
      {zigzagPath(CROSS_X2 + 8, 620, ROAD_BOT, "bottom")}

      {/* Zebra stripes (equal width & gap, full carriageway) */}
      {stripes}

      {/* Reflective road studs flanking the stripes at the kerb edges */}
      {Array.from({ length: 12 }, (_, i) => {
        const x = CROSS_X1 + (i + 0.5) * ((CROSS_X2 - CROSS_X1) / 12);
        return (
          <g key={`stud-${i}`}>
            <circle cx={x} cy={ROAD_TOP + 3} r="1.8" fill="#e8e6dc" stroke="#000" strokeWidth="0.3" />
            <circle cx={x} cy={ROAD_BOT - 3} r="1.8" fill="#e8e6dc" stroke="#000" strokeWidth="0.3" />
          </g>
        );
      })}

      {/* Belisha beacons — one at each corner of the crossing, striped pole + amber globe */}
      {[
        { x: CROSS_X1 - 6, top: true },
        { x: CROSS_X2 + 6, top: true },
        { x: CROSS_X1 - 6, top: false },
        { x: CROSS_X2 + 6, top: false },
      ].map((b, i) => {
        // Pole sits on the pavement, globe above/below aligned with the kerb.
        const poleH = 34;
        const poleY = b.top ? 60 - 4 : 92 - poleH + 30; // top pavement or bottom pavement
        const poleTop = b.top ? 56 : 292;               // where pole begins (on pavement)
        const poleBot = b.top ? 88 : 292 + poleH;
        const globeCy = b.top ? poleTop - 6 : poleBot + 6;
        // 5 equal alternating black/white bands (traditional Belisha pole)
        const bandCount = 5;
        const bandH = (poleBot - poleTop) / bandCount;
        void poleY;
        return (
          <g key={`beacon-${i}`}>
            {/* pole bands */}
            {Array.from({ length: bandCount }, (_, k) => (
              <rect
                key={k}
                x={b.x - 2}
                y={poleTop + k * bandH}
                width="4"
                height={bandH}
                fill={k % 2 === 0 ? "#111" : PAINT}
                stroke="#000"
                strokeWidth="0.3"
              />
            ))}
            {/* flashing halo */}
            <circle cx={b.x} cy={globeCy} r="16" fill="url(#beacon-glow)" />
            {/* amber globe */}
            <circle cx={b.x} cy={globeCy} r="7" fill="url(#beacon-body)" stroke="#7a5300" strokeWidth="0.6" />
            <circle cx={b.x - 2.2} cy={globeCy - 2.2} r="1.6" fill="#fff8d1" opacity="0.9" />
            {/* small mounting cap between pole and globe */}
            <rect x={b.x - 2} y={b.top ? poleTop - 2 : poleBot} width="4" height="2" fill="#222" />
          </g>
        );
      })}

      {/* Pedestrian stepping onto the crossing (top pavement → road) */}
      <g transform="translate(300 110)">
        {/* shadow */}
        <ellipse cx="0" cy="34" rx="10" ry="2.5" fill="rgba(0,0,0,0.35)" />
        {/* legs */}
        <path d="M -3 20 L -6 32 L -3 32 L -1 22 Z" fill="#1f2937" />
        <path d="M 3 20 L 8 30 L 5 32 L 1 22 Z" fill="#1f2937" />
        {/* torso (coat) */}
        <path d="M -6 4 Q -7 14 -5 22 L 5 22 Q 7 14 6 4 Z" fill="#c2410c" />
        {/* arms */}
        <path d="M -6 6 L -10 16 L -8 17 L -4 8 Z" fill="#c2410c" />
        <path d="M 6 6 L 11 15 L 9 17 L 4 8 Z" fill="#c2410c" />
        {/* head */}
        <circle cx="0" cy="-2" r="4.2" fill="#f3d3b0" />
        <path d="M -4 -3 Q 0 -8 4 -3 L 4 -1 L -4 -1 Z" fill="#3f2a1a" />
        {/* bag */}
        <rect x="8" y="10" width="4" height="6" rx="1" fill="#0f172a" />
      </g>

      {/* Approaching car (from right, in bottom lane), slowing down */}
      <g transform="translate(560 232)">
        {/* shadow */}
        <ellipse cx="0" cy="24" rx="34" ry="4" fill="rgba(0,0,0,0.45)" />
        {/* body */}
        <rect x="-30" y="-4" width="60" height="24" rx="6" fill="#1e3a8a" />
        {/* cabin */}
        <path d="M -20 -4 L -12 -16 L 14 -16 L 22 -4 Z" fill="#0b1e4d" />
        {/* windows */}
        <path d="M -18 -5 L -11 -14 L 13 -14 L 20 -5 Z" fill="#7dd3fc" opacity="0.85" />
        <line x1="1" y1="-14" x2="1" y2="-5" stroke="#0b1e4d" strokeWidth="1.2" />
        {/* wheels */}
        <circle cx="-18" cy="20" r="5.5" fill="#111" />
        <circle cx="-18" cy="20" r="2" fill="#666" />
        <circle cx="18" cy="20" r="5.5" fill="#111" />
        <circle cx="18" cy="20" r="2" fill="#666" />
        {/* brake lights on (approaching zebra) */}
        <rect x="26" y="0" width="4" height="4" rx="1" fill="#ef4444" />
        <rect x="26" y="14" width="4" height="4" rx="1" fill="#ef4444" />
        {/* headlights (facing left, direction of travel) */}
        <rect x="-30" y="0" width="3" height="3" rx="1" fill="#fff8b0" />
        <rect x="-30" y="14" width="3" height="3" rx="1" fill="#fff8b0" />
      </g>

      {/* PRIORITY arrow above pedestrian */}
      <g>
        <path d="M 298 44 L 298 62 L 294 62 L 302 72 L 310 62 L 306 62 L 306 44 Z" fill="#ffd54a" stroke="#111" strokeWidth="0.6" />
        <text x="316" y="58" fill="#ffd54a" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700" letterSpacing="0.4">
          PEDESTRIAN HAS PRIORITY
        </text>
      </g>

      {/* Labels */}
      <g fontFamily="Arial, sans-serif" fill={PAINT} fontWeight="700" letterSpacing="0.4">
        <text x="14" y="22" fontSize="10">PAVEMENT</text>
        <text x="14" y="358" fontSize="10">PAVEMENT</text>
        <text x="24" y="130" fontSize="9" opacity="0.9">ZIG-ZAGS · NO OVERTAKING · NO PARKING</text>
        <text x="24" y="262" fontSize="9" opacity="0.9">ZIG-ZAGS · NO OVERTAKING · NO PARKING</text>
      </g>
    </svg>
  );
}

function ZebraCrossing() {
  return (
    <Panel
      title="Zebra crossings — pedestrians have priority"
      subtitle="Black-and-white stripes, flashing amber Belisha beacons, no signals. Rules 19, 195."
    >
      <ZoomPan aspect="640/380" label="Zebra crossing diagram — pinch or scroll to zoom">
        <ZebraSceneSvg />
      </ZoomPan>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="border border-border p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">The law says</div>
          <p className="mt-2 text-sm">
            You <strong>must give way</strong> to anyone who has moved onto the crossing, and — since the 2022 Highway Code update — you <strong>should also give way to anyone waiting to cross</strong> (rule H2 &amp; rule 195).
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>Approach at a speed that lets you stop safely.</li>
            <li><strong>Do not wave or signal</strong> pedestrians across — another driver may not have seen them.</li>
            <li><strong>No overtaking</strong> or parking on the zig-zag lines.</li>
            <li>Be ready for pedestrians to run — treat cyclists on a parallel/tiger crossing the same way.</li>
          </ul>
        </div>

        <div className="border border-border p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">Funnel vision — how to look</div>
          <p className="mt-2 text-sm">
            As you drive, your view naturally narrows to a <strong>funnel</strong> straight ahead. The Highway Code (rules 92, 97, 146, 204) tells drivers to actively counter this by <strong>scanning wider</strong> — kerb to kerb, mirror to mirror — so you spot pedestrians <em>before</em> they step off.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li><strong>Look far</strong> down the road for the flashing Belisha beacons — your first clue a zebra is ahead.</li>
            <li><strong>Scan the pavements</strong> either side, not just the crossing itself.</li>
            <li>Watch for <strong>children, prams, wheelchair &amp; mobility users</strong> — they may be slower or partially hidden.</li>
            <li><strong>Mirror &amp; cover the brake</strong> as you reach the zig-zags.</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
        Also worth knowing: on a <strong>parallel crossing</strong> (zebra with a cycle lane alongside), cyclists have the same priority as pedestrians. A <strong>staggered</strong> crossing with a central island counts as <strong>two separate crossings</strong>.
      </div>
    </Panel>
  );
}