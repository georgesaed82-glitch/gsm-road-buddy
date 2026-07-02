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
      <p className="sr-only">
        Text description of the road studs diagram: a top-down view of a UK dual carriageway with the hard shoulder on the left and traffic flowing up the page. From left to right the layout is: grass verge, hard shoulder, lane one, lane two, central reservation, opposite carriageway, and grass verge. Red reflective studs mark the left edge line between the hard shoulder and lane one. White studs mark the broken centre line between the two lanes. Amber studs mark the right edge line next to the central reservation. Green studs mark the main carriageway edge where a slip road joins from the bottom-left. Green and yellow studs mark temporary road layouts such as contraflows and roadworks. Use the zoom in, zoom out and reset buttons to enlarge the diagram.
      </p>
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
  const titleId = useId();
  const descId = useId();
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
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-labelledby={`${titleId} ${descId}`}>
      <title id={titleId}>Top-down UK dual carriageway showing road stud colours</title>
      <desc id={descId}>
        A bird's-eye view of a UK dual carriageway with the hard shoulder on the left and traffic flowing up the page. Red studs mark the left edge line between the hard shoulder and lane one. White studs mark the broken centre line between the two lanes. Amber studs mark the right edge line next to the central reservation. Green studs mark the main carriageway edge where a slip road joins from the bottom-left. Green and yellow studs are used for temporary layouts such as contraflows and roadworks.
      </desc>
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
      {/* Standard sequence — the two clear phases on top, then the two "STOP
          but there's more to know" phases each paired with an explanation
          the same way as the Green Filter Arrow / Flashing Amber below. */}
      <div>
        <div className="text-sm font-semibold">Signal sequence (rule 175)</div>

        {/* Row 1: the simple phases */}
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            <Signal label="RED" red />
            <p className="text-sm text-muted-foreground">
              <strong>STOP.</strong> Wait behind the white line.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Signal label="GREEN" green />
            <p className="text-sm text-muted-foreground">
              <strong>GO</strong> — if the way is clear.
            </p>
          </div>
        </div>

        {/* Row 2: red+amber and solid amber, each with signal + full explanation */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="flex items-center gap-4">
            <Signal label="RED + AMBER" red amber />
            <p className="text-sm text-muted-foreground">
              <strong>Red and amber also means STOP.</strong> Do <strong>not</strong> go until the <strong>green</strong> shows. Stay behind the white line, keep the brake on and be ready to move off smoothly when green appears.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <Signal label="SOLID AMBER" amber />
            <div className="max-w-prose text-sm text-muted-foreground">
              <p>
                <strong>Solid amber means <span className="text-red-600">STOP</span>.</strong> Do <strong>not</strong> go past the amber light unless one of these applies:
              </p>
              <ul className="mt-2 list-disc pl-5">
                <li>You have <strong>already crossed the white line</strong> when the amber shows.</li>
                <li><strong>Stopping might cause an accident</strong> — e.g. the vehicle behind is too close and would run into you if you braked hard.</li>
              </ul>
            </div>
          </div>
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
      <HierarchyOfRoadUsers />
      <StoppingDistances />
      <TrafficLights />
      <ZebraCrossing />
    </div>
  );
}

// ── Hierarchy of Road Users (Rules H1–H3, 2022) ────────────────────
// Pyramid of responsibility + a worked "give way to pedestrians at a
// junction" scene showing a driver turning from a major road into a
// minor road with a pedestrian crossing (or waiting to cross).
function HierarchyPyramid() {
  const titleId = useId();
  const descId = useId();
  // Rows from top (most vulnerable, highest priority) to bottom.
  const rows = [
    {
      label: "Pedestrians",
      sub: "Children, older & disabled people first",
      fill: "#0f766e",
      text: "#ffffff",
    },
    {
      label: "Cyclists",
      sub: "Including e-cycles",
      fill: "#0d9488",
      text: "#ffffff",
    },
    {
      label: "Horse riders",
      sub: "& horse-drawn vehicles",
      fill: "#14b8a6",
      text: "#0b1f1c",
    },
    {
      label: "Motorcyclists",
      sub: "Mopeds & motorbikes",
      fill: "#f59e0b",
      text: "#1a1300",
    },
    {
      label: "Cars / Taxis",
      sub: "Private vehicles",
      fill: "#ea7317",
      text: "#ffffff",
    },
    {
      label: "Vans / Minibuses",
      sub: "Light goods vehicles",
      fill: "#c2410c",
      text: "#ffffff",
    },
    {
      label: "HGVs & Large vehicles",
      sub: "Greatest responsibility to reduce danger",
      fill: "#7c2d12",
      text: "#ffffff",
    },
  ];

  // Pyramid geometry — enlarged so every tier label fits comfortably inside
  // its band, including the narrow top "Pedestrians" row.
  const W = 820;
  const H = 780;
  const apexX = W / 2;
  const apexY = 130; // clearance from overlay chrome & room for a wider apex
  const baseY = H - 90;
  const baseHalf = 380; // half-width of the base
  const rowH = (baseY - apexY) / rows.length;
  // Truncate the very tip so the top row is a trapezium wide enough for text.
  const topHalfMin = 110;

  const xAt = (y: number) => {
    // linear from truncated apex (topHalfMin) to base (baseHalf)
    const t = (y - apexY) / (baseY - apexY);
    return topHalfMin + (baseHalf - topHalfMin) * t;
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      className="block h-auto w-full"
    >
      <title id={titleId}>Hierarchy of Road Users</title>
      <desc id={descId}>
        Pyramid diagram from Rule H1 of the UK Highway Code, ordered from the most
        vulnerable road users at the top to those with the greatest responsibility
        to reduce danger at the bottom. Top to bottom: 1. Pedestrians — children,
        older and disabled people have the highest priority. 2. Cyclists —
        including e-cycles. 3. Horse riders and horse-drawn vehicles. 4.
        Motorcyclists — mopeds and motorbikes. 5. Cars and taxis — private vehicles.
        6. Vans and minibuses — light goods vehicles. 7. HGVs and large vehicles —
        greatest responsibility to reduce danger. Road users who can cause the
        greatest harm must take the greatest responsibility to reduce the danger
        they pose to others.
      </desc>
      <defs>
        <linearGradient id="pyr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="url(#pyr-sky)" />

      {/* Rows */}
      {rows.map((r, i) => {
        const yTop = apexY + i * rowH;
        const yBot = yTop + rowH;
        const xTopL = apexX - xAt(yTop);
        const xTopR = apexX + xAt(yTop);
        const xBotL = apexX - xAt(yBot);
        const xBotR = apexX + xAt(yBot);
        const cy = yTop + rowH / 2;
        return (
          <g key={r.label}>
            <polygon
              points={`${xTopL},${yTop} ${xTopR},${yTop} ${xBotR},${yBot} ${xBotL},${yBot}`}
              fill={r.fill}
              stroke="#0b1f1c"
              strokeWidth="1.2"
            />
            <text
              x={apexX}
              y={cy - 4}
              textAnchor="middle"
              fontFamily="Arial, sans-serif"
              fontWeight={700}
              fontSize={20}
              fill={r.text}
            >
              {r.label}
            </text>
            <text
              x={apexX}
              y={cy + 18}
              textAnchor="middle"
              fontFamily="Arial, sans-serif"
              fontSize={13}
              fill={r.text}
              opacity={0.92}
            >
              {r.sub}
            </text>
          </g>
        );
      })}

      {/* Priority arrow (left) */}
      <g fontFamily="Arial, sans-serif" fontSize="12" fill="#0b1f1c">
        <line x1="30" y1={apexY + 10} x2="30" y2={baseY - 10} stroke="#0b1f1c" strokeWidth="1.5" />
        <polygon points={`30,${apexY + 4} 26,${apexY + 14} 34,${apexY + 14}`} fill="#0b1f1c" />
        <text x="42" y={apexY + 22} fontWeight={700}>Highest priority</text>
        <text x="42" y={apexY + 38}>Most vulnerable</text>
        <text x="42" y={baseY - 24} fontWeight={700}>Greatest responsibility</text>
        <text x="42" y={baseY - 8}>to reduce danger</text>
      </g>

      {/* Rule tags (right) */}
      <g fontFamily="Arial, sans-serif" fontSize="12" fill="#0b1f1c">
        <text x={W - 20} y={apexY + 22} textAnchor="end" fontWeight={700}>Rule H1</text>
        <text x={W - 20} y={apexY + 38} textAnchor="end">Hierarchy</text>
        <text x={W - 20} y={apexY + 74} textAnchor="end" fontWeight={700}>Rule H2</text>
        <text x={W - 20} y={apexY + 90} textAnchor="end">Priority for pedestrians</text>
        <text x={W - 20} y={apexY + 126} textAnchor="end" fontWeight={700}>Rule H3</text>
        <text x={W - 20} y={apexY + 142} textAnchor="end">Priority for cyclists</text>
      </g>
    </svg>
  );
}

// Top-down junction: major road (horizontal) meeting a minor road (vertical
// from bottom) with give-way triangle & broken line. A car turns left from
// the major road into the minor road; a pedestrian is crossing the mouth of
// the minor road. Illustrates Rule H2.
function GiveWayJunctionSvg() {
  const TARMAC = "#3a3a3d";
  const TARMAC_DARK = "#2b2b2e";
  const PAINT = "#f6f6f0";
  const PAVEMENT = "#a9a4a0";
  const PAVEMENT_DARK = "#8a857f";
  const VERGE = "#4a7c3a";

  return (
    <svg
      viewBox="0 0 720 520"
      role="img"
      aria-label="Top-down junction. A red car coming from the left along the major road turns left into a minor road. A pedestrian is crossing the mouth of the minor road from left to right. The car must give way under Rule H2. Because the driver is turning from a major road into a minor road, the give-way markings are shown as a single broken line."
      className="block h-auto w-full"
    >
      <defs>
        <linearGradient id="gw-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a8f42" />
          <stop offset="100%" stopColor="#3f6a2b" />
        </linearGradient>
        <linearGradient id="gw-tarmac" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#454549" />
          <stop offset="100%" stopColor="#2f2f32" />
        </linearGradient>
      </defs>

      {/* Grass */}
      <rect x="0" y="0" width="720" height="520" fill="url(#gw-grass)" />

      {/* Major road (horizontal, top half) */}
      <rect x="0" y="80" width="720" height="180" fill="url(#gw-tarmac)" />
      <rect x="0" y="80" width="720" height="4" fill="#000" opacity="0.35" />
      <rect x="0" y="256" width="720" height="4" fill="#000" opacity="0.35" />

      {/* Minor road (vertical, extends downward from major road) */}
      <rect x="290" y="260" width="140" height="260" fill="url(#gw-tarmac)" />
      <rect x="286" y="260" width="4" height="260" fill="#000" opacity="0.3" />
      <rect x="430" y="260" width="4" height="260" fill="#000" opacity="0.3" />

      {/* Pavement corners between major road and minor road */}
      <path d="M0,260 L290,260 Q290,300 250,300 L0,300 Z" fill={PAVEMENT} />
      <path d="M720,260 L430,260 Q430,300 470,300 L720,300 Z" fill={PAVEMENT} />
      <rect x="0" y="300" width="250" height="6" fill={PAVEMENT_DARK} opacity="0.55" />
      <rect x="470" y="300" width="250" height="6" fill={PAVEMENT_DARK} opacity="0.55" />
      {/* Kerb line highlighting inner curve */}
      <path d="M290,260 Q290,300 250,300" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M430,260 Q430,300 470,300" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" />

      {/* Major-road centre line (broken, UK white dashes) */}
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={20 + i * 52} y="167" width="30" height="5" fill={PAINT} />
      ))}

      {/* Minor-road centre line (broken) */}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x="357" y={310 + i * 32} width="6" height="16" fill={PAINT} />
      ))}

      {/* Give-way markings across the mouth of the minor road.
          LEFT half (nearside as the pedestrian steps on) — DOUBLE broken line.
          RIGHT half — SINGLE broken line. */}
      {/* Left half: double broken line */}
      {Array.from({ length: 4 }).map((_, i) => (
        <g key={`gw-l-${i}`}>
          <rect x={296 + i * 17} y="266" width="10" height="6" fill={PAINT} />
          <rect x={296 + i * 17} y="276" width="10" height="6" fill={PAINT} />
        </g>
      ))}
      {/* Right half: single broken line */}
      {Array.from({ length: 4 }).map((_, i) => (
        <rect key={`gw-r-${i}`} x={364 + i * 17} y="270" width="10" height="7" fill={PAINT} />
      ))}
      {/* Thin divider between the two halves for clarity */}
      <line x1="360" y1="264" x2="360" y2="286" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1" />

      {/* Red car coming FROM THE LEFT along the major road and turning LEFT
          into the minor road — shown mid-arc, front pointing down into the
          minor road, left indicator flashing. */}
      <g transform="translate(345 235) rotate(75)">
        {/* shadow */}
        <rect x="-34" y="-14" width="68" height="34" rx="8" fill="#000" opacity="0.25" transform="translate(3 4)" />
        {/* body */}
        <rect x="-34" y="-16" width="68" height="32" rx="8" fill="#dc2626" stroke="#0b1f1c" strokeWidth="1.5" />
        {/* roof */}
        <rect x="-16" y="-13" width="30" height="26" rx="4" fill="#7f1d1d" />
        {/* windscreen (front) */}
        <rect x="12" y="-11" width="6" height="22" rx="1.5" fill="#0f172a" opacity="0.85" />
        {/* rear window */}
        <rect x="-18" y="-11" width="4" height="22" rx="1.5" fill="#0f172a" opacity="0.85" />
        {/* headlights */}
        <rect x="30" y="-13" width="4" height="5" fill="#fde68a" />
        <rect x="30" y="8" width="4" height="5" fill="#fde68a" />
        {/* left indicator (flashing amber) — car turning left */}
        <circle cx="32" cy="12" r="2.6" fill="#f59e0b" />
        {/* wheels */}
        <rect x="-22" y="-19" width="10" height="4" fill="#111" />
        <rect x="14" y="-19" width="10" height="4" fill="#111" />
        <rect x="-22" y="15" width="10" height="4" fill="#111" />
        <rect x="14" y="15" width="10" height="4" fill="#111" />
      </g>

      {/* Pedestrian crossing the mouth of the minor road LEFT → RIGHT.
          Body drawn from above (top-down view) and rotated 90° so shoulders
          face the direction of travel. */}
      <g transform="translate(320 350)">
        {/* subtle shadow */}
        <ellipse cx="0" cy="8" rx="12" ry="3" fill="#000" opacity="0.28" />
        <g transform="rotate(90)">
          {/* head */}
          <circle cx="0" cy="0" r="6.5" fill="#f4c9a0" stroke="#0b1f1c" strokeWidth="1" />
          {/* torso — jacket */}
          <path d="M-7.5,6 L7.5,6 L9.5,24 L-9.5,24 Z" fill="#1d4ed8" stroke="#0b1f1c" strokeWidth="0.8" />
          {/* arms — mid-swing */}
          <rect x="-11" y="7" width="3" height="13" fill="#1d4ed8" transform="rotate(-14 -9.5 13.5)" />
          <rect x="8" y="7" width="3" height="13" fill="#1d4ed8" transform="rotate(14 9.5 13.5)" />
          {/* legs — mid-step */}
          <rect x="-6" y="24" width="4" height="13" fill="#0b1f1c" transform="rotate(-6 -4 30.5)" />
          <rect x="2" y="24" width="4" height="14" fill="#0b1f1c" transform="rotate(8 4 31)" />
        </g>
        {/* Walking direction: LEFT → RIGHT arrow */}
        <g stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.95">
          <line x1="18" y1="-22" x2="86" y2="-22" />
          <polygon points="94,-22 82,-30 82,-14" fill="#ffffff" stroke="none" />
        </g>
      </g>

      {/* Car approach arrow — showing it came FROM THE LEFT */}
      <g stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.9">
        <line x1="70" y1="150" x2="250" y2="150" />
        <polygon points="258,150 246,142 246,158" fill="#ffffff" stroke="none" />
      </g>

      {/* STOP-if-safe marker for the car */}
      <g>
        <circle cx="300" cy="205" r="14" fill="#ef4444" stroke="#0b1f1c" strokeWidth="1.5" />
        <text x="300" y="209" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11" fontWeight={700} fill="#fff">STOP</text>
      </g>

      {/* Labels */}
      <g fontFamily="Arial, sans-serif" fontSize="13" fill="#0b1f1c">
        <rect x="18" y="98" width="200" height="22" fill="#ffffff" opacity="0.92" />
        <text x="26" y="114" fontWeight={700}>Major road (car approaches)</text>

        <rect x="452" y="452" width="128" height="22" fill="#ffffff" opacity="0.92" />
        <text x="460" y="468" fontWeight={700}>Minor road</text>

        <rect x="440" y="258" width="260" height="22" fill="#ffffff" opacity="0.92" />
        <text x="448" y="274">Give-way: double left · single right</text>

        <rect x="440" y="342" width="230" height="22" fill="#ffffff" opacity="0.92" />
        <text x="448" y="358">Pedestrian crossing L → R (Rule H2)</text>

        <rect x="130" y="196" width="170" height="22" fill="#ffffff" opacity="0.92" />
        <text x="138" y="212">Car turning left into minor road</text>
      </g>
    </svg>
  );
}

function HierarchyOfRoadUsers() {
  return (
    <Panel
      title="Hierarchy of Road Users"
      subtitle="Rules H1, H2 & H3 — introduced in the 2022 Highway Code update"
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <ZoomPan aspect="820/780" label="Hierarchy pyramid — pinch or scroll to zoom">
            <HierarchyPyramid />
          </ZoomPan>
          <p className="sr-only">
            Hierarchy of Road Users pyramid from Rule H1. Read from top to
            bottom, the pyramid shows: 1. Pedestrians — children, older and
            disabled people have the highest priority. 2. Cyclists — including
            e-cycles. 3. Horse riders and horse-drawn vehicles. 4. Motorcyclists
            — mopeds and motorbikes. 5. Cars and taxis — private vehicles. 6.
            Vans and minibuses — light goods vehicles. 7. HGVs and large
            vehicles — these road users can cause the greatest harm and so have
            the greatest responsibility to reduce danger. The hierarchy does not
            remove the need for all road users to behave responsibly.
          </p>
        </div>

        <div className="grid gap-3 text-sm leading-relaxed text-foreground">
          <div className="border border-border bg-secondary/40 p-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rule H1 — The hierarchy</div>
            Those who can do the greatest harm have the greatest responsibility
            to reduce the danger or threat they pose to others. It does <em>not</em>
            remove the need for every road user to behave responsibly.
          </div>
          <div className="border border-border bg-secondary/40 p-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rule H2 — Priority for pedestrians</div>
            At a junction you <strong>should give way to pedestrians crossing or
            waiting to cross</strong> a road into which or from which you are
            turning. Also give way on zebra crossings and to pedestrians and
            cyclists on parallel crossings.
          </div>
          <div className="border border-border bg-secondary/40 p-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rule H3 — Priority for cyclists</div>
            Do not cut across cyclists, horse riders or horse-drawn vehicles
            going ahead when turning into or out of a junction, or when
            changing direction or lane — just as you would not turn across the
            path of another motor vehicle.
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="mb-1 text-base font-semibold text-foreground">Worked example — turning from a major road into a minor road</h4>
        <p className="mb-3 text-sm text-muted-foreground">
          You are driving on the <strong>major road</strong> and turning into a
          <strong> minor road</strong> (the side road with the give-way line).
          A pedestrian is crossing — or waiting to cross — the mouth of that
          minor road.
        </p>

        <ZoomPan aspect="720/520" label="Junction give-way example — pinch or scroll to zoom">
          <GiveWayJunctionSvg />
        </ZoomPan>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="border border-border bg-emerald-50 p-3 text-sm dark:bg-emerald-950/30">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">You should stop</div>
            If a pedestrian is <strong>crossing</strong>, or is clearly
            <strong> waiting to cross</strong>, and stopping is <strong>safe</strong>
            (nothing close behind you, no risk of being rear-ended), you
            <strong> must give way</strong> under Rule H2. Stop <em>before</em> the
            give-way line, make eye contact, and let them finish crossing.
          </div>
          <div className="border border-border bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">You don't have to stop</div>
            If stopping would <strong>cause an accident</strong> — for example a
            vehicle is right behind you and braking hard would cause a
            collision — and the pedestrian <strong>has not yet started</strong>
            to cross, you are not obliged to stop. Safety of everyone comes
            first; judgement, not blind rule-following.
          </div>
        </div>

        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-foreground">
          <li><strong>Mirrors — Signal — Position — Speed — Look (MSPSL)</strong> on approach.</li>
          <li>Scan the pavement on both sides <em>before</em> you commit to the turn.</li>
          <li>If a pedestrian is crossing or waiting, and it is safe, <strong>stop and give way</strong>.</li>
          <li>If stopping would cause a rear-end collision and no one has started crossing, proceed with caution.</li>
          <li>Never wave pedestrians across — let them decide. Other drivers may not see them.</li>
        </ol>
      </div>
    </Panel>
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

      {/* Second diagram — zebra with a central refuge island */}
      <div className="mt-8">
        <div className="text-sm font-semibold">Zebra crossing with a central island (refuge)</div>
        <p className="mt-1 text-sm text-muted-foreground">
          When a zebra has a <strong>central island</strong> in the middle of the
          road, it counts as <strong>two separate zebra crossings</strong> — one
          for each half of the carriageway.
        </p>

        <div className="mt-3">
          <ZoomPan aspect="640/380" label="Zebra crossing with central island — pinch or scroll to zoom">
            <ZebraSceneWithIslandSvg />
          </ZoomPan>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="border border-border bg-secondary/40 p-3 text-sm leading-relaxed">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">If the pedestrian is on the far side</div>
            If the pedestrian is <strong>on the other side of the island</strong>
            from you and clearly hasn't started crossing your half,
            <strong> you can go</strong> — that's a different crossing.
          </div>
          <div className="border border-border bg-secondary/40 p-3 text-sm leading-relaxed">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">If they'll reach your side before you do</div>
            If you judge that they'll be <strong>halfway across (on the island)
            before you reach the crossing</strong>, you <strong>must wait</strong>.
            It's <em>not a competition</em> — never race a pedestrian.
          </div>
        </div>

        <div className="mt-3 border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
          <strong>Funnel vision:</strong> as your speed rises your view narrows to a
          funnel straight ahead. Actively <strong>scan wider</strong> — kerb to
          kerb, both sides of the island — so you see anyone approaching either
          half of the crossing well before they step off.
        </div>
      </div>
    </Panel>
  );
}

// Zebra crossing with a central refuge island — visually the same style as
// ZebraSceneSvg, but the crossing is split by an island so it becomes two
// independent zebra crossings (one per carriageway half).
function ZebraSceneWithIslandSvg() {
  const TARMAC = "#3a3a3d";
  const TARMAC_DARK = "#2b2b2e";
  const PAINT = "#f6f6f0";
  const AMBER = "#ffb300";
  const AMBER_GLOW = "#ffdd66";

  const ROAD_TOP = 92;
  const ROAD_BOT = 288;
  const CROSS_X1 = 208;
  const CROSS_X2 = 452;
  const STRIPE_W = 22;

  // Central refuge island geometry
  const ISLAND_Y1 = 178;
  const ISLAND_Y2 = 202;
  const ISLAND_PAD = 6; // island slightly narrower than the stripe band

  const topStripes: ReactNode[] = [];
  const botStripes: ReactNode[] = [];
  for (let sx = CROSS_X1, i = 0; sx + STRIPE_W <= CROSS_X2; sx += STRIPE_W, i++) {
    if (i % 2 === 0) {
      topStripes.push(
        <rect key={`ts-${sx}`} x={sx} y={ROAD_TOP} width={STRIPE_W} height={ISLAND_Y1 - ROAD_TOP} fill={PAINT} />,
      );
      botStripes.push(
        <rect key={`bs-${sx}`} x={sx} y={ISLAND_Y2} width={STRIPE_W} height={ROAD_BOT - ISLAND_Y2} fill={PAINT} />,
      );
    }
  }

  const zigzagPath = (xStart: number, xEnd: number, yKerb: number, side: "top" | "bottom", key: string) => {
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
    return <path key={key} d={d} fill="none" stroke={PAINT} strokeWidth="2.4" strokeLinejoin="miter" strokeLinecap="square" />;
  };

  const beacons = [
    { x: CROSS_X1 - 6, top: true },
    { x: CROSS_X2 + 6, top: true },
    { x: CROSS_X1 - 6, top: false },
    { x: CROSS_X2 + 6, top: false },
  ];

  return (
    <svg
      viewBox="0 0 640 380"
      className="block w-full h-auto"
      role="img"
      aria-label="Top-down view of a UK zebra crossing split by a central refuge island, counting as two separate zebra crossings"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <linearGradient id="zebra2-tarmac" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={TARMAC} />
          <stop offset="0.5" stopColor={TARMAC_DARK} />
          <stop offset="1" stopColor={TARMAC} />
        </linearGradient>
        <pattern id="zebra2-asphalt" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="url(#zebra2-tarmac)" />
          <circle cx="1.3" cy="1.7" r="0.35" fill="rgba(255,255,255,0.05)" />
          <circle cx="4.2" cy="3.1" r="0.3" fill="rgba(0,0,0,0.18)" />
          <circle cx="2.6" cy="4.6" r="0.28" fill="rgba(255,255,255,0.05)" />
        </pattern>
        <linearGradient id="zebra2-verge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#365a29" />
          <stop offset="1" stopColor="#4a7c3a" />
        </linearGradient>
        <linearGradient id="zebra2-pavement" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9a4a0" />
          <stop offset="1" stopColor="#8a857f" />
        </linearGradient>
        <radialGradient id="beacon2-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={AMBER_GLOW} stopOpacity="0.9" />
          <stop offset="0.6" stopColor={AMBER} stopOpacity="0.55" />
          <stop offset="1" stopColor={AMBER} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="beacon2-body" cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff5cc" />
          <stop offset="0.4" stopColor={AMBER_GLOW} />
          <stop offset="1" stopColor={AMBER} />
        </radialGradient>
      </defs>

      {/* Verges + pavements */}
      <rect x="0" y="0" width="640" height="60" fill="url(#zebra2-verge)" />
      <rect x="0" y="320" width="640" height="60" fill="url(#zebra2-verge)" />
      <rect x="0" y="60" width="640" height="30" fill="url(#zebra2-pavement)" />
      <rect x="0" y="290" width="640" height="30" fill="url(#zebra2-pavement)" />
      {Array.from({ length: 16 }, (_, i) => (
        <line key={`p1-${i}`} x1={i * 40} y1="60" x2={i * 40} y2="90" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" />
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <line key={`p2-${i}`} x1={i * 40} y1="290" x2={i * 40} y2="320" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" />
      ))}
      <rect x="0" y="88" width="640" height="4" fill="#c9c4bd" />
      <rect x="0" y="288" width="640" height="4" fill="#c9c4bd" />

      {/* Road */}
      <rect x="0" y="92" width="640" height="196" fill="url(#zebra2-asphalt)" />

      {/* Broken lane lines — stop at the crossing */}
      <line x1="10" y1="140" x2={CROSS_X1 - 6} y2="140" stroke={PAINT} strokeWidth="2.4" strokeDasharray="20 14" />
      <line x1={CROSS_X2 + 6} y1="140" x2="630" y2="140" stroke={PAINT} strokeWidth="2.4" strokeDasharray="20 14" />
      <line x1="10" y1="240" x2={CROSS_X1 - 6} y2="240" stroke={PAINT} strokeWidth="2.4" strokeDasharray="20 14" />
      <line x1={CROSS_X2 + 6} y1="240" x2="630" y2="240" stroke={PAINT} strokeWidth="2.4" strokeDasharray="20 14" />

      {/* Zig-zags — approach on both sides, both kerbs */}
      {zigzagPath(20, CROSS_X1 - 8, ROAD_TOP, "top", "zz-tl")}
      {zigzagPath(CROSS_X2 + 8, 620, ROAD_TOP, "top", "zz-tr")}
      {zigzagPath(20, CROSS_X1 - 8, ROAD_BOT, "bottom", "zz-bl")}
      {zigzagPath(CROSS_X2 + 8, 620, ROAD_BOT, "bottom", "zz-br")}

      {/* Two independent stripe fields (split by island) */}
      {topStripes}
      {botStripes}

      {/* Central refuge island — kerbed, with white keep-left arrows painted */}
      <rect
        x={CROSS_X1 + ISLAND_PAD}
        y={ISLAND_Y1}
        width={CROSS_X2 - CROSS_X1 - ISLAND_PAD * 2}
        height={ISLAND_Y2 - ISLAND_Y1}
        rx="4"
        fill="#b8b3ac"
        stroke="#5c574f"
        strokeWidth="1.4"
      />
      {/* Island kerb highlight */}
      <rect
        x={CROSS_X1 + ISLAND_PAD}
        y={ISLAND_Y1}
        width={CROSS_X2 - CROSS_X1 - ISLAND_PAD * 2}
        height={ISLAND_Y2 - ISLAND_Y1}
        rx="4"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="0.8"
      />
      {/* Keep-left chevron blocks each side of the island */}
      <g fill="#ffffff" opacity="0.85">
        <polygon points={`${CROSS_X1 + 12},190 ${CROSS_X1 + 22},184 ${CROSS_X1 + 22},196`} />
        <polygon points={`${CROSS_X2 - 12},190 ${CROSS_X2 - 22},184 ${CROSS_X2 - 22},196`} />
      </g>

      {/* Belisha beacons — outer corners */}
      {beacons.map((b, i) => {
        const poleH = 34;
        const poleTop = b.top ? 56 : 292;
        const poleBot = b.top ? 88 : 292 + poleH;
        const globeCy = b.top ? poleTop - 6 : poleBot + 6;
        const bandCount = 5;
        const bandH = (poleBot - poleTop) / bandCount;
        return (
          <g key={`b-${i}`}>
            {Array.from({ length: bandCount }, (_, k) => (
              <rect key={k} x={b.x - 2} y={poleTop + k * bandH} width="4" height={bandH} fill={k % 2 === 0 ? "#111" : PAINT} stroke="#000" strokeWidth="0.3" />
            ))}
            <circle cx={b.x} cy={globeCy} r="16" fill="url(#beacon2-glow)" />
            <circle cx={b.x} cy={globeCy} r="7" fill="url(#beacon2-body)" stroke="#7a5300" strokeWidth="0.6" />
            <circle cx={b.x - 2.2} cy={globeCy - 2.2} r="1.6" fill="#fff8d1" opacity="0.9" />
            <rect x={b.x - 2} y={b.top ? poleTop - 2 : poleBot} width="4" height="2" fill="#222" />
          </g>
        );
      })}

      {/* Belisha beacons ON the island — one per side */}
      {[CROSS_X1 + 16, CROSS_X2 - 16].map((bx, i) => (
        <g key={`bi-${i}`}>
          {/* short pole embedded in island */}
          {Array.from({ length: 3 }, (_, k) => (
            <rect key={k} x={bx - 2} y={ISLAND_Y1 + 2 + k * 6} width="4" height="6" fill={k % 2 === 0 ? "#111" : PAINT} stroke="#000" strokeWidth="0.3" />
          ))}
          <circle cx={bx} cy={ISLAND_Y1 - 6} r="12" fill="url(#beacon2-glow)" />
          <circle cx={bx} cy={ISLAND_Y1 - 6} r="5.5" fill="url(#beacon2-body)" stroke="#7a5300" strokeWidth="0.5" />
        </g>
      ))}

      {/* Pedestrian standing on the island (halfway across) */}
      <g transform="translate(330 190)">
        <ellipse cx="0" cy="10" rx="8" ry="2" fill="rgba(0,0,0,0.4)" />
        <path d="M -3 0 L -5 10 L -2 10 L -1 2 Z" fill="#1f2937" />
        <path d="M 3 0 L 5 10 L 2 10 L 1 2 Z" fill="#1f2937" />
        <path d="M -5 -10 Q -6 -2 -4 4 L 4 4 Q 6 -2 5 -10 Z" fill="#0f766e" />
        <circle cx="0" cy="-14" r="3.6" fill="#f3d3b0" />
      </g>

      {/* Approaching car on bottom lane — must wait, ped is on island */}
      <g transform="translate(560 250)">
        <ellipse cx="0" cy="24" rx="34" ry="4" fill="rgba(0,0,0,0.45)" />
        <rect x="-30" y="-4" width="60" height="24" rx="6" fill="#1e3a8a" />
        <path d="M -20 -4 L -12 -16 L 14 -16 L 22 -4 Z" fill="#0b1e4d" />
        <path d="M -18 -5 L -11 -14 L 13 -14 L 20 -5 Z" fill="#7dd3fc" opacity="0.85" />
        <circle cx="-18" cy="20" r="5.5" fill="#111" />
        <circle cx="18" cy="20" r="5.5" fill="#111" />
        <rect x="26" y="0" width="4" height="4" rx="1" fill="#ef4444" />
        <rect x="26" y="14" width="4" height="4" rx="1" fill="#ef4444" />
      </g>

      {/* Labels */}
      <g fontFamily="Arial, sans-serif" fill={PAINT} fontWeight="700" letterSpacing="0.4">
        <text x="14" y="22" fontSize="10">PAVEMENT</text>
        <text x="14" y="358" fontSize="10">PAVEMENT</text>
        <text x="24" y="128" fontSize="9" opacity="0.9">CROSSING 1 — TOP HALF</text>
        <text x="24" y="262" fontSize="9" opacity="0.9">CROSSING 2 — BOTTOM HALF</text>
      </g>

      {/* Island callout */}
      <g fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700">
        <rect x="470" y="182" width="150" height="18" fill="#ffffff" opacity="0.92" />
        <text x="478" y="195" fill="#0b1f1c">Central refuge island</text>
      </g>
    </svg>
  );
}