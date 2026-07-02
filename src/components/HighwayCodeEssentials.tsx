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

// ── Speed limits for different vehicles (Rule 124) ─────────────────
// Table of UK national speed limits by vehicle class, plus a gallery
// of the round regulatory signs a driver will actually see on the road.
function SpeedSignCircle({
  mph,
  variant = "limit",
  size = 96,
}: {
  mph?: number | string;
  variant?: "limit" | "national" | "minimum" | "endMinimum" | "zone20";
  size?: number;
}) {
  // Authentic UK regulatory sign: white disc with red ring for limits,
  // blue disc for minimum speed, national uses a diagonal black bar
  // on white.
  const r = 46;
  const cx = 50;
  const cy = 50;
  if (variant === "national") {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill="#ffffff" stroke="#0b1220" strokeWidth="3" />
        <line x1="20" y1="20" x2="80" y2="80" stroke="#0b1220" strokeWidth="9" strokeLinecap="round" />
      </svg>
    );
  }
  if (variant === "minimum") {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill="#1d4ed8" stroke="#0b1220" strokeWidth="3" />
        <text x="50" y="63" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="34" fontWeight="900" fill="#ffffff">
          {mph}
        </text>
      </svg>
    );
  }
  if (variant === "endMinimum") {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill="#1d4ed8" stroke="#0b1220" strokeWidth="3" />
        <text x="50" y="63" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="34" fontWeight="900" fill="#ffffff">
          {mph}
        </text>
        <line x1="18" y1="18" x2="82" y2="82" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
      </svg>
    );
  }
  if (variant === "zone20") {
    return (
      <svg viewBox="0 0 100 120" width={size} height={size * 1.2} aria-hidden>
        <rect x="6" y="6" width="88" height="108" rx="4" fill="#ffffff" stroke="#0b1220" strokeWidth="3" />
        <circle cx="50" cy="42" r="26" fill="#ffffff" stroke="#ef4444" strokeWidth="7" />
        <text x="50" y="52" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="900" fill="#0b1220">
          {mph ?? 20}
        </text>
        <text x="50" y="94" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="900" fill="#0b1220">
          ZONE
        </text>
      </svg>
    );
  }
  // Default: mandatory speed limit (red ring, mph inside)
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <circle cx={cx} cy={cy} r={r} fill="#ffffff" stroke="#ef4444" strokeWidth="9" />
      <text x="50" y="63" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="34" fontWeight="900" fill="#0b1220">
        {mph}
      </text>
    </svg>
  );
}

function SignCard({
  children,
  title,
  desc,
}: {
  children: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 border border-border p-3 text-center">
      <div className="flex h-28 items-center justify-center">{children}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">{title}</div>
      <p className="text-xs leading-snug">{desc}</p>
    </div>
  );
}

function VehicleSpeedLimits() {
  const rows: {
    vehicle: string;
    builtUp: string;
    single: string;
    dual: string;
    motorway: string;
    note?: string;
  }[] = [
    {
      vehicle: "Cars, motorcycles, car-derived vans & dual-purpose vehicles",
      builtUp: "30",
      single: "60",
      dual: "70",
      motorway: "70",
    },
    {
      vehicle: "Cars towing caravans or trailers",
      builtUp: "30",
      single: "50",
      dual: "60",
      motorway: "60",
      note: "Not permitted in the outside (right-hand) lane of a 3+ lane motorway.",
    },
    {
      vehicle: "Buses, coaches & minibuses (≤ 12 m)",
      builtUp: "30",
      single: "50",
      dual: "60",
      motorway: "70",
    },
    {
      vehicle: "Goods vehicles up to 7.5 tonnes MAM",
      builtUp: "30",
      single: "50",
      dual: "60",
      motorway: "70",
      note: "60 mph on the motorway if articulated or towing a trailer.",
    },
    {
      vehicle: "Goods vehicles over 7.5 tonnes MAM (England & Wales)",
      builtUp: "30",
      single: "50",
      dual: "60",
      motorway: "60",
    },
  ];

  return (
    <Panel
      title="Speed limits for different vehicles"
      subtitle="Rule 124. The national speed limit depends on the vehicle you're driving AND the type of road. A lower limit shown on a sign always overrides these figures."
    >
      {/* Mobile: card per vehicle. Desktop: proper table. */}
      <div className="grid gap-3 sm:hidden">
        {rows.map((r) => (
          <div key={r.vehicle} className="border border-border p-3">
            <div className="text-sm font-medium">{r.vehicle}</div>
            {r.note && <div className="mt-1 text-xs text-muted-foreground">{r.note}</div>}
            <dl className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[
                { k: "Built-up", v: r.builtUp },
                { k: "Single", v: r.single },
                { k: "Dual", v: r.dual },
                { k: "Motorway", v: r.motorway },
              ].map((c) => (
                <div key={c.k} className="border border-border/60 py-2">
                  <dt className="text-[9px] font-semibold uppercase tracking-wider text-accent">{c.k}</dt>
                  <dd className="mt-0.5 font-mono text-base font-bold">{c.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      <div className="hidden sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wider text-accent">Vehicle type</th>
              <th className="py-2 px-2 text-center text-[11px] font-semibold uppercase tracking-wider text-accent">Built-up<br />(mph)</th>
              <th className="py-2 px-2 text-center text-[11px] font-semibold uppercase tracking-wider text-accent">Single<br />c'way</th>
              <th className="py-2 px-2 text-center text-[11px] font-semibold uppercase tracking-wider text-accent">Dual<br />c'way</th>
              <th className="py-2 pl-2 text-center text-[11px] font-semibold uppercase tracking-wider text-accent">Motorway</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.vehicle} className="border-b border-border/60 align-top">
                <td className="py-2 pr-3">
                  <div className="font-medium">{r.vehicle}</div>
                  {r.note && <div className="mt-1 text-xs text-muted-foreground">{r.note}</div>}
                </td>
                <td className="py-2 px-2 text-center font-mono font-bold">{r.builtUp}</td>
                <td className="py-2 px-2 text-center font-mono font-bold">{r.single}</td>
                <td className="py-2 px-2 text-center font-mono font-bold">{r.dual}</td>
                <td className="py-2 pl-2 text-center font-mono font-bold">{r.motorway}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        A <strong>built-up area</strong> is any road with a system of street lighting (lamps not more than 200 yards apart) unless a sign says otherwise — the default is 30 mph. In Scotland the goods-vehicle limits on single and dual carriageways are 40 mph and 50 mph respectively.
      </p>

      <div className="mt-6">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">The signs you'll see</div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <SignCard title="20 mph limit" desc="Mandatory limit — often around schools, hospitals and residential streets.">
            <SpeedSignCircle mph={20} />
          </SignCard>
          <SignCard title="30 mph limit" desc="Default in built-up areas with street lighting, unless a sign says different.">
            <SpeedSignCircle mph={30} />
          </SignCard>
          <SignCard title="40 mph limit" desc="Common on urban dual carriageways and busy A-roads out of town.">
            <SpeedSignCircle mph={40} />
          </SignCard>
          <SignCard title="50 mph limit" desc="Rural single carriageways with hazards, or roadworks on faster roads.">
            <SpeedSignCircle mph={50} />
          </SignCard>
          <SignCard title="60 mph limit" desc="A specific 60 mph limit sign — do not confuse with the national limit disc.">
            <SpeedSignCircle mph={60} />
          </SignCard>
          <SignCard title="70 mph limit" desc="Shown on the approach to motorways and some dual carriageways.">
            <SpeedSignCircle mph={70} />
          </SignCard>
          <SignCard title="National speed limit applies" desc="White disc with a diagonal black bar. Actual mph depends on your vehicle and road type — check the table above.">
            <SpeedSignCircle variant="national" />
          </SignCard>
          <SignCard title="20 mph zone" desc="A whole area at 20 mph — the limit stays until you see an 'End of zone' sign, even without repeaters.">
            <SpeedSignCircle variant="zone20" mph={20} />
          </SignCard>
          <SignCard title="Minimum speed" desc="Blue disc — you must not drive slower than the number shown (e.g. in some tunnels).">
            <SpeedSignCircle variant="minimum" mph={30} />
          </SignCard>
          <SignCard title="End of minimum speed" desc="Blue disc with a red diagonal — the minimum speed requirement no longer applies.">
            <SpeedSignCircle variant="endMinimum" mph={30} />
          </SignCard>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="border border-border p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">How to read the road</div>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
            <li><strong>Street lights + no signs = 30 mph</strong> (20 mph in parts of Wales).</li>
            <li><strong>No street lights = national speed limit</strong> for your vehicle and road.</li>
            <li><strong>Small repeater signs</strong> on lamp posts confirm the current limit.</li>
            <li>A limit applies <strong>from the sign onwards</strong> until a new limit sign changes it.</li>
          </ul>
        </div>
        <div className="border border-border p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">Remember</div>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
            <li>Limits are a <strong>maximum</strong>, not a target — drive to the conditions.</li>
            <li><strong>Towing?</strong> Drop 10 mph on single/dual carriageways and motorways.</li>
            <li><strong>Large goods vehicles</strong> stay at 60 mph on the motorway.</li>
            <li>Newly-qualified drivers must obey <strong>every</strong> limit — penalty points in the first 2 years revoke your licence at 6 points.</li>
          </ul>
        </div>
      </div>
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
      <YellowBoxJunction />
      <NearsideOffsideJunction />
      <MoreRule181Scenarios />
      <SmartMotorway />
      <VehicleSpeedLimits />
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

// Top-down junction: major road (horizontal) meeting a minor road on the
// driver's LEFT. The car approaches from the left in the left-hand lane and
// turns left into the minor road while indicating left. Illustrates Rule H2.
function GiveWayJunctionSvg() {
  const PAINT = "#f6f6f0";
  const PAVEMENT = "#a9a4a0";
  const PAVEMENT_DARK = "#8a857f";

  return (
    <svg
      viewBox="0 0 720 520"
      role="img"
      aria-label="Top-down junction. A red car approaches from the left in the left-hand lane of the major road, indicates left, and turns left into the minor road on the driver's left. A pedestrian is standing on the pavement waiting to cross the mouth of the minor road, so the car must give way under Rule H2."
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
        <marker id="left-turn-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L10,5 L0,10 Z" fill="#f59e0b" />
        </marker>
      </defs>

      {/* Grass */}
      <rect x="0" y="0" width="720" height="520" fill="url(#gw-grass)" />

      {/* Minor road is on the driver's LEFT as the car travels left → right. */}
      <rect x="290" y="0" width="140" height="250" fill="url(#gw-tarmac)" />
      <rect x="286" y="0" width="4" height="250" fill="#000" opacity="0.3" />
      <rect x="430" y="0" width="4" height="250" fill="#000" opacity="0.3" />

      {/* Major road (horizontal). UK left-hand traffic means the car uses the upper lane when travelling left → right. */}
      <rect x="0" y="250" width="720" height="180" fill="url(#gw-tarmac)" />
      <rect x="0" y="250" width="720" height="4" fill="#000" opacity="0.35" />
      <rect x="0" y="426" width="720" height="4" fill="#000" opacity="0.35" />

      {/* Pavement corners between major road and minor road */}
      <path d="M0,210 L250,210 Q290,210 290,250 L0,250 Z" fill={PAVEMENT} />
      <path d="M720,210 L470,210 Q430,210 430,250 L720,250 Z" fill={PAVEMENT} />
      <rect x="0" y="210" width="250" height="6" fill={PAVEMENT_DARK} opacity="0.55" />
      <rect x="470" y="210" width="250" height="6" fill={PAVEMENT_DARK} opacity="0.55" />
      {/* Kerb line highlighting inner curve */}
      <path d="M290,250 Q290,210 250,210" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M430,250 Q430,210 470,210" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" />

      {/* Major-road centre line (broken, UK white dashes) */}
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={20 + i * 52} y="337" width="30" height="5" fill={PAINT} />
      ))}

      {/* Minor-road centre line (broken) */}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x="357" y={22 + i * 32} width="6" height="16" fill={PAINT} />
      ))}

      {/* Give-way markings across the mouth of the minor road.
          Major → minor: the side the car enters (LEFT half) is a SINGLE
          broken line, the opposing side (RIGHT half) is a DOUBLE broken line. */}
      {/* Left half: single broken line (car's side) */}
      {Array.from({ length: 4 }).map((_, i) => (
        <rect key={`gw-l-${i}`} x={296 + i * 17} y="232" width="10" height="7" fill={PAINT} />
      ))}
      {/* Right half: double broken line */}
      {Array.from({ length: 4 }).map((_, i) => (
        <g key={`gw-r-${i}`}>
          <rect x={364 + i * 17} y="228" width="10" height="6" fill={PAINT} />
          <rect x={364 + i * 17} y="238" width="10" height="6" fill={PAINT} />
        </g>
      ))}
      {/* Thin divider between the two halves for clarity */}
      <line x1="360" y1="226" x2="360" y2="248" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1" />

      {/* Left-turn path: from the left-hand lane of the major road into the left-side minor road. */}
      <path
        d="M90 292 C185 292 275 292 315 258 C340 236 338 190 338 130"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd="url(#left-turn-arrow)"
        opacity="0.95"
      />

      {/* Red car: coming FROM THE LEFT, keeping to the LEFT-HAND lane,
          indicating left, and turning LEFT into the side road. */}
      <g transform="translate(312 266) rotate(-58)">
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
        {/* left indicator (flashing amber) — on the car's front-left corner */}
        <circle cx="32" cy="-12" r="3.2" fill="#f59e0b" stroke="#fff7ed" strokeWidth="1" />
        <path d="M34 -18 L46 -28 M37 -12 L53 -12 M34 -6 L46 4" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        {/* wheels */}
        <rect x="-22" y="-19" width="10" height="4" fill="#111" />
        <rect x="14" y="-19" width="10" height="4" fill="#111" />
        <rect x="-22" y="15" width="10" height="4" fill="#111" />
        <rect x="14" y="15" width="10" height="4" fill="#111" />
      </g>

      {/* Pedestrian standing on the pavement (grass-side kerb) WAITING to
          cross the mouth of the minor road. Body drawn top-down, facing
          the road so shoulders align with the kerb. */}
      <g transform="translate(268 196)">
        {/* subtle shadow */}
        <ellipse cx="0" cy="10" rx="12" ry="3" fill="#000" opacity="0.3" />
        {/* head */}
        <circle cx="0" cy="0" r="6.5" fill="#f4c9a0" stroke="#0b1f1c" strokeWidth="1" />
        {/* torso — jacket */}
        <path d="M-7.5,6 L7.5,6 L9.5,24 L-9.5,24 Z" fill="#1d4ed8" stroke="#0b1f1c" strokeWidth="0.8" />
        {/* arms — resting at sides */}
        <rect x="-10" y="7" width="3" height="14" fill="#1d4ed8" />
        <rect x="7" y="7" width="3" height="14" fill="#1d4ed8" />
        {/* legs — standing still, feet together */}
        <rect x="-4" y="24" width="3.5" height="14" fill="#0b1f1c" />
        <rect x="0.5" y="24" width="3.5" height="14" fill="#0b1f1c" />
      </g>

      {/* Car approach arrow — showing it came FROM THE LEFT */}
      <g stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.9">
        <line x1="70" y1="292" x2="236" y2="292" />
        <polygon points="244,292 232,284 232,300" fill="#ffffff" stroke="none" />
      </g>

      {/* STOP-if-safe marker for the car */}
      <g>
        <circle cx="260" cy="268" r="14" fill="#ef4444" stroke="#0b1f1c" strokeWidth="1.5" />
        <text x="260" y="272" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11" fontWeight={700} fill="#fff">STOP</text>
      </g>

      {/* Labels */}
      <g fontFamily="Arial, sans-serif" fontSize="13" fill="#0b1f1c">
        <rect x="18" y="266" width="245" height="22" fill="#ffffff" opacity="0.92" />
        <text x="26" y="282" fontWeight={700}>Major road — left-hand lane</text>

        <rect x="438" y="42" width="128" height="22" fill="#ffffff" opacity="0.92" />
        <text x="446" y="58" fontWeight={700}>Minor road</text>

        <rect x="440" y="222" width="260" height="22" fill="#ffffff" opacity="0.92" />
        <text x="448" y="238">Give-way: single left · double right</text>

        <rect x="180" y="168" width="220" height="22" fill="#ffffff" opacity="0.92" />
        <text x="188" y="184">Pedestrian waiting to cross (Rule H2)</text>

        <rect x="126" y="326" width="235" height="22" fill="#ffffff" opacity="0.92" />
        <text x="134" y="342">Red car indicating and turning left</text>
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

// ── Signalised crossroads (shared base for the two panels below) ──────
// Aerial view of a 4-way traffic-light junction with kerbs, stop lines,
// broken centre lines on each approach, and traffic-light poles at every
// corner. Callers overlay their own markings/vehicles on top of it.
function CrossroadsBase({ children }: { children?: ReactNode }) {
  return (
    <svg
      viewBox="0 0 640 380"
      className="block h-full w-full"
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="xr-tarmac" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3a40" />
          <stop offset="1" stopColor="#2b2b30" />
        </linearGradient>
        <linearGradient id="xr-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f6b3f" />
          <stop offset="1" stopColor="#345a34" />
        </linearGradient>
        <pattern id="xr-asphalt" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="url(#xr-tarmac)" />
          <circle cx="1.5" cy="1.5" r="0.4" fill="#4a4a52" opacity="0.5" />
          <circle cx="4.5" cy="4.5" r="0.4" fill="#242428" opacity="0.6" />
        </pattern>
      </defs>

      {/* Grass in the four corners */}
      <rect x="0" y="0" width="640" height="380" fill="url(#xr-grass)" />

      {/* Horizontal road (full width) */}
      <rect x="0" y="120" width="640" height="140" fill="url(#xr-asphalt)" />
      {/* Vertical road (full height) */}
      <rect x="250" y="0" width="140" height="380" fill="url(#xr-asphalt)" />

      {/* Kerbs (thin white lines along the road edges, broken at the junction) */}
      <g stroke="#e5e7eb" strokeWidth="1.5" fill="none">
        {/* Horizontal kerbs */}
        <line x1="0" y1="120" x2="250" y2="120" />
        <line x1="390" y1="120" x2="640" y2="120" />
        <line x1="0" y1="260" x2="250" y2="260" />
        <line x1="390" y1="260" x2="640" y2="260" />
        {/* Vertical kerbs */}
        <line x1="250" y1="0" x2="250" y2="120" />
        <line x1="250" y1="260" x2="250" y2="380" />
        <line x1="390" y1="0" x2="390" y2="120" />
        <line x1="390" y1="260" x2="390" y2="380" />
      </g>

      {/* Broken white centre lines on each approach (stops at the junction) */}
      <g fill="#f8fafc">
        {/* West approach */}
        {[10, 50, 90, 130, 170, 210].map((x) => (
          <rect key={`w${x}`} x={x} y="188" width="20" height="4" />
        ))}
        {/* East approach */}
        {[420, 460, 500, 540, 580, 610].map((x) => (
          <rect key={`e${x}`} x={x} y="188" width="20" height="4" />
        ))}
        {/* North approach */}
        {[10, 30, 50, 70, 90].map((y) => (
          <rect key={`n${y}`} x="318" y={y} width="4" height="14" />
        ))}
        {/* South approach */}
        {[280, 300, 320, 340, 360].map((y) => (
          <rect key={`s${y}`} x="318" y={y} width="4" height="14" />
        ))}
      </g>

      {/* Stop lines at each approach (thick solid white) */}
      <g fill="#f8fafc">
        <rect x="250" y="252" width="70" height="6" /> {/* south-bound stop (top of junction) — for vehicles from north */}
        <rect x="320" y="122" width="70" height="6" /> {/* north-bound stop (bottom of junction, wait no) */}
        <rect x="252" y="120" width="6" height="70" /> {/* east-bound stop */}
        <rect x="382" y="190" width="6" height="70" /> {/* west-bound stop */}
      </g>

      {/* Traffic-light poles at all four corners */}
      <TrafficLightPole x={232} y={102} />
      <TrafficLightPole x={392} y={102} />
      <TrafficLightPole x={232} y={262} />
      <TrafficLightPole x={392} y={262} />

      {children}
    </svg>
  );
}

function TrafficLightPole({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-2" y="0" width="4" height="18" fill="#2a2a2a" />
      <rect x="-7" y="-24" width="14" height="26" rx="2" fill="#111" stroke="#333" strokeWidth="0.5" />
      <circle cx="0" cy="-19" r="3" fill="#ef4444" />
      <circle cx="0" cy="-12" r="3" fill="#f59e0b" opacity="0.35" />
      <circle cx="0" cy="-5" r="3" fill="#10b981" opacity="0.35" />
    </g>
  );
}

// A simple top-down car with body colour and a small indicator dot.
function Car({
  x,
  y,
  rotate = 0,
  color,
  indicator,
  label,
}: {
  x: number;
  y: number;
  rotate?: number;
  color: string;
  indicator?: "left" | "right" | "none";
  label?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      {/* shadow */}
      <rect x="-14" y="-24" width="28" height="48" rx="6" fill="#000" opacity="0.25" transform="translate(1 2)" />
      {/* body */}
      <rect x="-14" y="-24" width="28" height="48" rx="6" fill={color} stroke="#0b0b0b" strokeWidth="1" />
      {/* windscreen (front) */}
      <rect x="-11" y="-19" width="22" height="10" rx="2" fill="#0f172a" opacity="0.85" />
      {/* rear window */}
      <rect x="-11" y="9" width="22" height="8" rx="2" fill="#0f172a" opacity="0.85" />
      {/* roof line */}
      <rect x="-12" y="-6" width="24" height="10" fill={color} stroke="#0b0b0b" strokeWidth="0.5" opacity="0.5" />
      {/* headlights */}
      <circle cx="-9" cy="-22" r="1.6" fill="#fff8dc" />
      <circle cx="9" cy="-22" r="1.6" fill="#fff8dc" />
      {/* indicators */}
      {indicator === "right" && (
        <circle cx="12" cy="-22" r="2.2" fill="#f59e0b">
          <animate attributeName="opacity" values="1;0.2;1" dur="0.9s" repeatCount="indefinite" />
        </circle>
      )}
      {indicator === "left" && (
        <circle cx="-12" cy="-22" r="2.2" fill="#f59e0b">
          <animate attributeName="opacity" values="1;0.2;1" dur="0.9s" repeatCount="indefinite" />
        </circle>
      )}
      {label && (
        <g transform={`rotate(${-rotate})`}>
          <rect x="-18" y="-8" width="36" height="16" fill="#ffffff" opacity="0.9" rx="2" />
          <text x="0" y="3" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700" fill="#0b1f1c">{label}</text>
        </g>
      )}
    </g>
  );
}

// ── Yellow box junction ──────────────────────────────────────────────
function YellowBoxJunctionSvg() {
  return (
    <CrossroadsBase>
      {/* Yellow box: outer border + diagonal hatching */}
      <g>
        <rect x="252" y="122" width="136" height="136" fill="none" stroke="#facc15" strokeWidth="4" />
        {/* Hatching (two crossed diagonals) */}
        <g stroke="#facc15" strokeWidth="3">
          {[-120, -90, -60, -30, 0, 30, 60, 90, 120].map((d) => (
            <line key={`d1${d}`} x1={252 + d} y1={122} x2={388 + d} y2={258} clipPath="url(#yb-clip)" />
          ))}
          {[-120, -90, -60, -30, 0, 30, 60, 90, 120].map((d) => (
            <line key={`d2${d}`} x1={388 - d} y1={122} x2={252 - d} y2={258} clipPath="url(#yb-clip)" />
          ))}
        </g>
        <defs>
          <clipPath id="yb-clip">
            <rect x="252" y="122" width="136" height="136" />
          </clipPath>
        </defs>
      </g>

      {/* Red car — sitting INSIDE the yellow box, mid right-turn.
          Came from 6 (south) in the LEFT lane (x≈355), now angled toward 3 (east).
          rotate=+50 → front points between 12 and 3 (NE), correct for a clockwise
          6→3 right turn. */}
      <Car x={350} y={200} rotate={50} color="#dc2626" indicator="right" label="You" />

      {/* Blue oncoming vehicle — coming STRAIGHT ahead from 12 (north), still far
          away up the north approach in ITS left lane. rotate=180 → facing 6 (south). */}
      <Car x={300} y={40} rotate={180} color="#1d4ed8" indicator="none" label="Oncoming" />

      {/* Curved dashed arrow — red's intended right-turn path from 6 to 3.
          Starts in the south approach's left lane, sweeps clockwise through
          the box, and exits into the east exit's LEFT lane (y≈150). */}
      <g fill="none" stroke="#facc15" strokeWidth="3" strokeDasharray="7 5" opacity="0.95">
        <path d="M 355 360 C 355 270 360 220 380 200 C 430 170 500 155 600 150" />
      </g>
      <polygon points="600,142 618,150 600,158" fill="#facc15" />

      {/* Legend / labels */}
      <g fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700">
        <rect x="14" y="14" width="230" height="48" fill="#ffffff" opacity="0.94" rx="3" />
        <text x="24" y="32" fill="#dc2626">Red — turning RIGHT</text>
        <text x="24" y="48" fill="#0b1f1c" fontWeight="500">May wait in box if only oncoming blocks you</text>

        <rect x="410" y="14" width="216" height="48" fill="#ffffff" opacity="0.94" rx="3" />
        <text x="420" y="32" fill="#1d4ed8">Blue — STRAIGHT ahead</text>
        <text x="420" y="48" fill="#0b1f1c" fontWeight="500">Still far away — priority through the box</text>
      </g>
    </CrossroadsBase>
  );
}

function YellowBoxJunction() {
  return (
    <Panel
      title="Yellow box junction — turning right"
      subtitle="Rule 174. Do not enter unless your exit is clear — one exception: turning right, blocked only by oncoming traffic."
    >
      <ZoomPan aspect="640/380" label="Aerial view of a yellow box junction. A red car has entered the hatched yellow box, signalling right, and is waiting inside because a blue oncoming vehicle is blocking the exit road. A dashed yellow line shows the intended path to the right.">
        <YellowBoxJunctionSvg />
      </ZoomPan>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="border border-border p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">The rule</div>
          <p className="mt-2 text-sm">
            You <strong>must not enter the yellow box</strong> unless your <strong>exit road or lane is clear</strong>. If you stop inside and block the box, that's an offence.
          </p>
        </div>
        <div className="border border-border p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">The right-turn exception</div>
          <p className="mt-2 text-sm">
            You <strong>may enter and wait inside the box</strong> when you want to <strong>turn right</strong> and the <em>only</em> thing stopping you is <strong>oncoming traffic</strong>, or vehicles already waiting to turn right ahead of you.
          </p>
        </div>
      </div>

      <div className="mt-4 border border-border bg-secondary/40 p-3 text-sm">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">How to do it safely</div>
        <ul className="list-disc space-y-1.5 pl-5 text-sm">
          <li><strong>Check the exit first.</strong> Look past the box to the road you're turning into — if it's queued up, stay behind the box until it clears.</li>
          <li><strong>Signal right</strong>, move to the centre of the box, wheels straight (so a shunt from behind doesn't push you into oncoming).</li>
          <li><strong>Wait for a safe gap</strong>, then complete the turn — don't take an "iffy" gap just because the lights are changing.</li>
          <li>If the lights change to red while you're inside the box, <strong>complete the turn</strong> when it's safe — you're committed.</li>
        </ul>
      </div>
    </Panel>
  );
}

// ── Nearside / offside crossroads ────────────────────────────────────
// Nearside-to-nearside: cars cross IN FRONT of each other, meeting
// passenger-side to passenger-side in the middle of the junction.
function NearsideTurnSvg() {
  return (
    <CrossroadsBase>
      {/* NEARSIDE-to-NEARSIDE (turn IN FRONT of each other, left-to-left).
          UK drive-on-left. In clock terms:
            • RED: from 6 (south) → 3 (east).  Left lane in → left lane out.
            • BLUE: from 12 (north) → 9 (west). Left lane in → left lane out.
          Both take a TIGHT / early line, cutting the corner. They pass with
          LEFT (passenger) sides adjacent, red staying SOUTH of centre, blue
          staying NORTH of centre. Paths cross visibly in the middle. */}

      {/* Red arrow — 6 → 3, cutting inside (stays south of centre) */}
      <g fill="none" stroke="#f472b6" strokeWidth="3" strokeDasharray="5 4">
        <path d="M 355 360 C 355 270 375 230 400 215 C 470 185 550 155 620 150" />
      </g>
      <polygon points="620,142 638,150 620,158" fill="#f472b6" />

      {/* Blue arrow — 12 → 9, cutting inside (stays north of centre) */}
      <g fill="none" stroke="#f472b6" strokeWidth="3" strokeDasharray="5 4">
        <path d="M 285 20 C 285 110 265 150 240 165 C 170 195 90 225 20 230" />
      </g>
      <polygon points="20,222 2,230 20,238" fill="#f472b6" />

      {/* Red car — mid-turn heading toward 3 (east). rotate=+55 → front NE→E.
          Positioned SOUTH of centre so its LEFT (passenger) side faces north. */}
      <Car x={340} y={220} rotate={55} color="#dc2626" indicator="right" label="You" />
      {/* Blue car — mid-turn heading toward 9 (west). rotate=+235 → front SW→W.
          Positioned NORTH of centre so its LEFT (passenger) side faces south. */}
      <Car x={300} y={160} rotate={235} color="#1d4ed8" indicator="right" label="Them" />

      {/* Meeting-point marker (left sides pass here) */}
      <circle cx="320" cy="190" r="7" fill="none" stroke="#f472b6" strokeWidth="2" />

      <g fontFamily="Arial, sans-serif" fontSize="11">
        <rect x="14" y="14" width="290" height="46" fill="#ffffff" opacity="0.94" rx="3" />
        <text x="24" y="32" fill="#0b1f1c" fontWeight="700">Nearside — turn IN FRONT (left-to-left)</text>
        <text x="24" y="48" fill="#0b1f1c">Red 6→3, Blue 12→9. Passenger-side to passenger-side.</text>
      </g>
    </CrossroadsBase>
  );
}

// Offside-to-offside: cars swing BEHIND each other, meeting
// driver-side to driver-side in the middle of the junction.
function OffsideTurnSvg() {
  return (
    <CrossroadsBase>
      {/* OFFSIDE-to-OFFSIDE (swing BEHIND each other, right-to-right, Rule 181's
          "generally safer" method). Same destinations as the nearside diagram:
            • RED: 6 → 3.   • BLUE: 12 → 9.
          Both drive PAST the centre before turning — wide sweep. They pass with
          RIGHT (driver) sides adjacent: red ends up NORTH of centre mid-turn,
          blue SOUTH of centre. Paths do NOT cross. */}

      {/* Red arrow — 6 → 3, wide (swings past centre through NW quadrant) */}
      <g fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="7 5">
        <path d="M 355 360 C 355 230 320 195 300 175 C 350 145 500 148 620 150" />
      </g>
      <polygon points="620,142 638,150 620,158" fill="#22d3ee" />

      {/* Blue arrow — 12 → 9, wide (swings past centre through SE quadrant) */}
      <g fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="7 5">
        <path d="M 285 20 C 285 150 320 185 340 205 C 290 235 140 232 20 230" />
      </g>
      <polygon points="20,222 2,230 20,238" fill="#22d3ee" />

      {/* Red car — mid-turn heading toward 3, NORTH of centre so its RIGHT
          (driver) side faces south. rotate=+55. */}
      <Car x={300} y={160} rotate={55} color="#dc2626" indicator="right" label="You" />
      {/* Blue car — mid-turn heading toward 9, SOUTH of centre so its RIGHT
          (driver) side faces north. rotate=+235. */}
      <Car x={340} y={220} rotate={235} color="#1d4ed8" indicator="right" label="Them" />

      {/* Meeting-point marker (right/driver sides pass here) */}
      <circle cx="320" cy="190" r="7" fill="none" stroke="#22d3ee" strokeWidth="2" />

      <g fontFamily="Arial, sans-serif" fontSize="11">
        <rect x="14" y="14" width="290" height="46" fill="#ffffff" opacity="0.94" rx="3" />
        <text x="24" y="32" fill="#0b1f1c" fontWeight="700">Offside — swing BEHIND (right-to-right)</text>
        <text x="24" y="48" fill="#0b1f1c">Red 6→3, Blue 12→9. Driver-side to driver-side.</text>
      </g>
    </CrossroadsBase>
  );
}

function NearsideOffsideJunction() {
  return (
    <Panel
      title="Turning right at a crossroads — nearside vs offside"
      subtitle="Two vehicles turning right at the same signalised crossroads. Rules 176–181."
    >
      <div className="space-y-4">
        <figure
          role="group"
          aria-labelledby="nearside-heading"
          aria-describedby="nearside-explainer"
        >
          <ZoomPan aspect="640/380" label="Aerial view of a nearside-to-nearside right turn. A red car from the bottom and a blue oncoming car from the top both turn right, crossing in front of each other so their passenger sides meet in the middle of the junction.">
            <NearsideTurnSvg />
          </ZoomPan>
        </figure>
        <figure
          role="group"
          aria-labelledby="offside-heading"
          aria-describedby="offside-explainer"
        >
          <ZoomPan aspect="640/380" label="Aerial view of an offside-to-offside right turn. A red car from the bottom and a blue oncoming car from the top both turn right, swinging wide behind each other so their driver sides pass on the outside.">
            <OffsideTurnSvg />
          </ZoomPan>
        </figure>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2" aria-live="polite">
        <div className="border border-border p-4" id="nearside-explainer">
          <div id="nearside-heading" className="text-[11px] font-semibold uppercase tracking-wider text-accent">Nearside to nearside (left-to-left)</div>
          <p className="mt-2 text-sm">
            <strong>Nearside = passenger side to passenger side.</strong> Both cars turn <strong>in front of</strong> each other, passing left-side to left-side. Rule 181 lists this as the second option.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tighter, quicker turn — but the other car briefly blocks your view of oncoming traffic while you're crossing, so creep and look before committing.
          </p>
        </div>
        <div className="border border-border p-4" id="offside-explainer">
          <div id="offside-heading" className="text-[11px] font-semibold uppercase tracking-wider text-accent">Offside to offside (right-to-right)</div>
          <p className="mt-2 text-sm">
            <strong>Offside = driver's side to driver's side.</strong> Keep the other vehicle on your right and turn <strong>behind</strong> it. Rule 181 calls this <em>generally the safer method</em> because you have a clear view of oncoming traffic as you complete the turn.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Wider swept path. Use this by default unless road markings or the layout of the junction force the nearside method.
          </p>
        </div>
      </div>

      <div className="mt-4 border border-border bg-secondary/40 p-3 text-sm">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Which one do I use?</div>
        <ul className="list-disc space-y-1.5 pl-5 text-sm">
          <li><strong>Follow the road markings first.</strong> If there is a painted guide arrow, dashed turning line or a raised island in the middle of the junction, use the path the markings show — that overrides your preference.</li>
          <li><strong>If there are no markings</strong> (this diagram), you have to <strong>read the other driver</strong>. Watch their line, their wheels and their eyes as they enter the box — commit to whichever side they are giving you.</li>
          <li><strong>Never assume.</strong> A firm, early <strong>right indicator</strong> plus gentle creep tells the other driver you're turning; make eye contact if you can.</li>
          <li><strong>Big vehicles turn wide.</strong> Lorries, buses and vans almost always take the offside line — give them room and expect the swept path.</li>
        </ul>
      </div>
    </Panel>
  );
}

// ── Extra Rule 181 scenarios ─────────────────────────────────────────
// Same clock-based convention as CrossroadsBase:
//   12 = north (top), 3 = east (right), 6 = south (bottom), 9 = west (left)
//   rotate=0 → car faces 12; +90 → 3; ±180 → 6; ±270/−90 → 9.
// UK left-hand traffic — cars always finish in the destination's LEFT lane.

// A staggered crossroads: the north stub is offset WEST, the south stub is
// offset EAST. The offset forces both right-turners onto the offside line —
// nearside would put the two cars nose-to-nose. Great teaching example.
function StaggeredBase({ children }: { children?: ReactNode }) {
  return (
    <svg viewBox="0 0 640 380" className="block h-full w-full" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="stg-tarmac" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3a40" />
          <stop offset="1" stopColor="#2b2b30" />
        </linearGradient>
        <linearGradient id="stg-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f6b3f" />
          <stop offset="1" stopColor="#345a34" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="640" height="380" fill="url(#stg-grass)" />
      {/* Horizontal main road */}
      <rect x="0" y="120" width="640" height="140" fill="url(#stg-tarmac)" />
      {/* North stub (offset WEST, x=170..270) */}
      <rect x="170" y="0" width="100" height="120" fill="url(#stg-tarmac)" />
      {/* South stub (offset EAST, x=370..470) */}
      <rect x="370" y="260" width="100" height="120" fill="url(#stg-tarmac)" />

      {/* Kerbs */}
      <g stroke="#e5e7eb" strokeWidth="1.5" fill="none">
        <line x1="0" y1="120" x2="170" y2="120" />
        <line x1="270" y1="120" x2="370" y2="120" />
        <line x1="470" y1="120" x2="640" y2="120" />
        <line x1="0" y1="260" x2="370" y2="260" />
        <line x1="470" y1="260" x2="640" y2="260" />
        <line x1="170" y1="0" x2="170" y2="120" />
        <line x1="270" y1="0" x2="270" y2="120" />
        <line x1="370" y1="260" x2="370" y2="380" />
        <line x1="470" y1="260" x2="470" y2="380" />
      </g>

      {/* Broken centre lines */}
      <g fill="#f8fafc">
        {[10, 50, 90, 130].map((x) => (<rect key={`hw${x}`} x={x} y="188" width="20" height="4" />))}
        {[490, 530, 570, 610].map((x) => (<rect key={`he${x}`} x={x} y="188" width="20" height="4" />))}
        {[10, 30, 50, 70, 90].map((y) => (<rect key={`nv${y}`} x="218" y={y} width="4" height="14" />))}
        {[280, 300, 320, 340, 360].map((y) => (<rect key={`sv${y}`} x="418" y={y} width="4" height="14" />))}
      </g>

      {/* Stop lines */}
      <g fill="#f8fafc">
        <rect x="220" y="114" width="46" height="6" />
        <rect x="374" y="260" width="46" height="6" />
      </g>
      {children}
    </svg>
  );
}

function StaggeredOffsideSvg() {
  return (
    <StaggeredBase>
      {/* Red arrow — from south stub (left lane x≈425) to east exit (y≈150).
          Wide/offside line: swings past centre through NW quadrant before turning. */}
      <g fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="7 5">
        <path d="M 425 380 C 425 300 380 220 310 195 C 380 155 500 148 620 150" />
      </g>
      <polygon points="620,142 638,150 620,158" fill="#22d3ee" />

      {/* Blue arrow — from north stub (left lane x≈245) to west exit (y≈230). */}
      <g fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="7 5">
        <path d="M 245 0 C 245 90 285 175 335 195 C 260 235 130 232 20 230" />
      </g>
      <polygon points="20,222 2,230 20,238" fill="#22d3ee" />

      {/* Cars mid-turn — offside/behind: red NORTH of centre, blue SOUTH of centre */}
      <Car x={295} y={168} rotate={55} color="#dc2626" indicator="right" label="You" />
      <Car x={345} y={215} rotate={235} color="#1d4ed8" indicator="right" label="Them" />

      <g fontFamily="Arial, sans-serif" fontSize="11">
        <rect x="14" y="14" width="300" height="46" fill="#ffffff" opacity="0.94" rx="3" />
        <text x="24" y="32" fill="#0b1f1c" fontWeight="700">Staggered — OFFSIDE recommended</text>
        <text x="24" y="48" fill="#0b1f1c">Offset approaches force a wide swing behind each other.</text>
      </g>
    </StaggeredBase>
  );
}

function StaggeredNearsideSvg() {
  return (
    <StaggeredBase>
      {/* Nearside/tight lines — clearly awkward on a staggered junction. */}
      <g fill="none" stroke="#f472b6" strokeWidth="3" strokeDasharray="5 4">
        <path d="M 425 380 C 425 300 420 240 400 215 C 480 180 550 155 620 150" />
      </g>
      <polygon points="620,142 638,150 620,158" fill="#f472b6" />
      <g fill="none" stroke="#f472b6" strokeWidth="3" strokeDasharray="5 4">
        <path d="M 245 0 C 245 90 250 140 245 170 C 175 200 90 225 20 230" />
      </g>
      <polygon points="20,222 2,230 20,238" fill="#f472b6" />

      {/* Cars nose-to-nose warning: the tight lines almost collide. */}
      <Car x={365} y={205} rotate={55} color="#dc2626" indicator="right" label="You" />
      <Car x={280} y={175} rotate={235} color="#1d4ed8" indicator="right" label="Them" />

      {/* Conflict marker */}
      <g>
        <circle cx="320" cy="190" r="14" fill="none" stroke="#ef4444" strokeWidth="3" />
        <line x1="308" y1="178" x2="332" y2="202" stroke="#ef4444" strokeWidth="3" />
        <line x1="332" y1="178" x2="308" y2="202" stroke="#ef4444" strokeWidth="3" />
      </g>

      <g fontFamily="Arial, sans-serif" fontSize="11">
        <rect x="14" y="14" width="300" height="46" fill="#ffffff" opacity="0.94" rx="3" />
        <text x="24" y="32" fill="#0b1f1c" fontWeight="700">Staggered — NEARSIDE risky</text>
        <text x="24" y="48" fill="#0b1f1c">Tight lines converge — high conflict at centre.</text>
      </g>
    </StaggeredBase>
  );
}

// A major road (horizontal, wider, priority) meeting a minor road
// (vertical, narrower, give way). Both turners come out of the minor
// road and must give way before turning right onto the major.
function MajorMinorBase({ children }: { children?: ReactNode }) {
  return (
    <svg viewBox="0 0 640 380" className="block h-full w-full" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="mm-tarmac" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3a40" />
          <stop offset="1" stopColor="#2b2b30" />
        </linearGradient>
        <linearGradient id="mm-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f6b3f" />
          <stop offset="1" stopColor="#345a34" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="640" height="380" fill="url(#mm-grass)" />
      {/* Major road (wide, horizontal) */}
      <rect x="0" y="90" width="640" height="200" fill="url(#mm-tarmac)" />
      {/* Minor road (narrow, vertical) */}
      <rect x="280" y="0" width="80" height="380" fill="url(#mm-tarmac)" />

      {/* Kerbs */}
      <g stroke="#e5e7eb" strokeWidth="1.5" fill="none">
        <line x1="0" y1="90" x2="280" y2="90" />
        <line x1="360" y1="90" x2="640" y2="90" />
        <line x1="0" y1="290" x2="280" y2="290" />
        <line x1="360" y1="290" x2="640" y2="290" />
        <line x1="280" y1="0" x2="280" y2="90" />
        <line x1="280" y1="290" x2="280" y2="380" />
        <line x1="360" y1="0" x2="360" y2="90" />
        <line x1="360" y1="290" x2="360" y2="380" />
      </g>

      {/* Major road centre line (broken) */}
      <g fill="#f8fafc">
        {[10, 50, 90, 130, 170, 210].map((x) => (<rect key={`mw${x}`} x={x} y="188" width="20" height="4" />))}
        {[420, 460, 500, 540, 580, 610].map((x) => (<rect key={`me${x}`} x={x} y="188" width="20" height="4" />))}
        {/* Minor road centre line */}
        {[10, 30, 50].map((y) => (<rect key={`mnn${y}`} x="318" y={y} width="4" height="14" />))}
        {[320, 340, 360].map((y) => (<rect key={`mns${y}`} x="318" y={y} width="4" height="14" />))}
      </g>

      {/* Give-way lines (double dashed) on both minor approaches */}
      <g fill="#f8fafc">
        {/* South-side give way (for cars coming from north) */}
        {[284, 300, 316, 332, 348].map((x) => (
          <g key={`gn${x}`}>
            <rect x={x} y="80" width="10" height="4" />
            <rect x={x} y="88" width="10" height="4" />
          </g>
        ))}
        {/* North-side give way (for cars coming from south) */}
        {[284, 300, 316, 332, 348].map((x) => (
          <g key={`gs${x}`}>
            <rect x={x} y="296" width="10" height="4" />
            <rect x={x} y="304" width="10" height="4" />
          </g>
        ))}
      </g>
      {children}
    </svg>
  );
}

function MajorMinorNearsideSvg() {
  return (
    <MajorMinorBase>
      {/* Red arrow — 6 → 3: south minor left lane (x≈335) to east major left lane (y≈140). Tight nearside line. */}
      <g fill="none" stroke="#f472b6" strokeWidth="3" strokeDasharray="5 4">
        <path d="M 335 370 C 335 300 355 240 385 215 C 460 180 550 145 620 140" />
      </g>
      <polygon points="620,132 638,140 620,148" fill="#f472b6" />
      {/* Blue arrow — 12 → 9: north minor left lane (x≈305) to west major left lane (y≈240). */}
      <g fill="none" stroke="#f472b6" strokeWidth="3" strokeDasharray="5 4">
        <path d="M 305 10 C 305 80 285 140 255 165 C 180 200 90 235 20 240" />
      </g>
      <polygon points="20,232 2,240 20,248" fill="#f472b6" />

      <Car x={340} y={225} rotate={55} color="#dc2626" indicator="right" label="You" />
      <Car x={300} y={155} rotate={235} color="#1d4ed8" indicator="right" label="Them" />

      <g fontFamily="Arial, sans-serif" fontSize="11">
        <rect x="14" y="14" width="310" height="46" fill="#ffffff" opacity="0.94" rx="3" />
        <text x="24" y="32" fill="#0b1f1c" fontWeight="700">Major/minor — NEARSIDE</text>
        <text x="24" y="48" fill="#0b1f1c">Both wait at give-way, then cut in front — quick but blind.</text>
      </g>
    </MajorMinorBase>
  );
}

function MajorMinorOffsideSvg() {
  return (
    <MajorMinorBase>
      <g fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="7 5">
        <path d="M 335 370 C 335 250 305 200 285 175 C 340 145 500 138 620 140" />
      </g>
      <polygon points="620,132 638,140 620,148" fill="#22d3ee" />
      <g fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="7 5">
        <path d="M 305 10 C 305 130 335 180 355 205 C 300 235 140 242 20 240" />
      </g>
      <polygon points="20,232 2,240 20,248" fill="#22d3ee" />

      <Car x={295} y={160} rotate={55} color="#dc2626" indicator="right" label="You" />
      <Car x={345} y={220} rotate={235} color="#1d4ed8" indicator="right" label="Them" />

      <g fontFamily="Arial, sans-serif" fontSize="11">
        <rect x="14" y="14" width="310" height="46" fill="#ffffff" opacity="0.94" rx="3" />
        <text x="24" y="32" fill="#0b1f1c" fontWeight="700">Major/minor — OFFSIDE (preferred)</text>
        <text x="24" y="48" fill="#0b1f1c">Wider path but each driver sees oncoming traffic clearly.</text>
      </g>
    </MajorMinorBase>
  );
}

function MoreRule181Scenarios() {
  return (
    <Panel
      title="More Rule 181 scenarios — compare the outcomes"
      subtitle="Same rule, different junctions. Approach angle and road type change which method actually works."
    >
      {/* Scenario A: staggered */}
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent">Scenario A · Staggered crossroads (offset approaches)</div>
      <p className="mb-3 text-sm text-muted-foreground">
        The south arm is offset east of the north arm. Two right-turners meet with their approaches out of line — the nearside path forces them nose-to-nose, so the offside sweep is the only comfortable option.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <figure role="group" aria-label="Staggered crossroads, offside method: red from south-east arm and blue from north-west arm both turn right and swing wide behind each other, ending in their exit road's left lane.">
          <ZoomPan aspect="640/380" label="Staggered crossroads, offside-to-offside method">
            <StaggeredOffsideSvg />
          </ZoomPan>
        </figure>
        <figure role="group" aria-label="Staggered crossroads, nearside method: the tight turn lines converge in the middle of the junction, creating a nose-to-nose conflict marked with a red X.">
          <ZoomPan aspect="640/380" label="Staggered crossroads, nearside method (risky)">
            <StaggeredNearsideSvg />
          </ZoomPan>
        </figure>
      </div>
      <div className="mt-3 border border-border p-4 text-sm">
        <strong>Outcome:</strong> pick <strong>offside</strong>. The offset means a nearside line would put you nose-to-nose with the other driver in the middle of the box. Drive on until you're level with the other car's offside, then turn.
      </div>

      {/* Scenario B: major / minor */}
      <div className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent">Scenario B · Major road meeting minor road (give-way both sides)</div>
      <p className="mb-3 text-sm text-muted-foreground">
        Both turners are emerging from a narrow minor road onto a wider major road, so both must give way to major-road traffic first. Once clear, the method still matters — nearside is fast but blind, offside gives a clear view of any late oncoming vehicle.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <figure role="group" aria-label="Major/minor crossroads, nearside method: after giving way, red and blue turn in front of each other, taking the short tight line.">
          <ZoomPan aspect="640/380" label="Major/minor crossroads, nearside method">
            <MajorMinorNearsideSvg />
          </ZoomPan>
        </figure>
        <figure role="group" aria-label="Major/minor crossroads, offside method: after giving way, red and blue swing wide behind each other, keeping oncoming traffic in view.">
          <ZoomPan aspect="640/380" label="Major/minor crossroads, offside method (preferred)">
            <MajorMinorOffsideSvg />
          </ZoomPan>
        </figure>
      </div>
      <div className="mt-3 border border-border p-4 text-sm">
        <strong>Outcome:</strong> <strong>offside</strong> is safer here too. Because you have to accelerate to clear the major road, you need the clearest possible view of anything approaching along it — the nearside line puts the other right-turner directly in your sight-line.
      </div>

      <div className="mt-5 border border-border bg-secondary/40 p-3 text-sm">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">The pattern to remember</div>
        <ul className="list-disc space-y-1.5 pl-5 text-sm">
          <li><strong>Symmetrical box, no markings</strong> → either method works; agree with the other driver.</li>
          <li><strong>Staggered / offset approaches</strong> → offside (swing wide behind).</li>
          <li><strong>Painted turn arrows or an island</strong> → follow the paint; usually nearside.</li>
          <li><strong>Minor onto major</strong> → offside — you need the sightline for the give-way.</li>
          <li><strong>Whatever you choose</strong> → both cars finish in their exit road's LEFT lane. Always.</li>
        </ul>
      </div>
    </Panel>
  );
}

// ── Smart motorways ──────────────────────────────────────────────────
// Top-down view of a 4-lane all-lane-running smart motorway with an
// overhead gantry. Signs on the gantry set the rules for every lane
// beneath them, from that gantry onwards until the next one cancels
// them.

function SmartMotorwayBase({ children }: { children?: ReactNode }) {
  return (
    <svg viewBox="0 0 640 420" className="block h-full w-full" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sm-tarmac" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3a40" />
          <stop offset="1" stopColor="#2b2b30" />
        </linearGradient>
        <linearGradient id="sm-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f6b3f" />
          <stop offset="1" stopColor="#345a34" />
        </linearGradient>
      </defs>
      {/* Verges */}
      <rect x="0" y="0" width="640" height="420" fill="url(#sm-grass)" />
      {/* Motorway carriageway (40..600), 4 lanes each 140 wide */}
      <rect x="40" y="0" width="560" height="380" fill="url(#sm-tarmac)" />
      {/* Solid white edge lines */}
      <rect x="42" y="0" width="4" height="380" fill="#f8fafc" />
      <rect x="594" y="0" width="4" height="380" fill="#f8fafc" />
      {/* Broken white lane dividers at x=180, 320, 460 */}
      <g fill="#f8fafc">
        {[-10, 30, 70, 110, 150, 190, 230, 270, 310, 350].map((y) => (
          <g key={y}>
            <rect x="178" y={y} width="4" height="22" />
            <rect x="318" y={y} width="4" height="22" />
            <rect x="458" y={y} width="4" height="22" />
          </g>
        ))}
      </g>
      {/* Overhead gantry (upright pillars + horizontal beam) */}
      <rect x="14" y="46" width="10" height="220" fill="#3b3b40" />
      <rect x="616" y="46" width="10" height="220" fill="#3b3b40" />
      <rect x="14" y="46" width="612" height="8" fill="#4b5563" />
      <rect x="14" y="130" width="612" height="6" fill="#4b5563" />
      {/* Cross bracing */}
      <line x1="24" y1="54" x2="616" y2="130" stroke="#4b5563" strokeWidth="1" opacity="0.55" />
      <line x1="616" y1="54" x2="24" y2="130" stroke="#4b5563" strokeWidth="1" opacity="0.55" />
      {/* Lane label strip below the carriageway so labels never sit on tarmac */}
      <rect x="0" y="380" width="640" height="40" fill="#0b1220" />
      {children}
    </svg>
  );
}

function GantrySignPanel({ x, children }: { x: number; children: ReactNode }) {
  // A single sign panel bolted to the gantry, centred on a lane.
  return (
    <g transform={`translate(${x} 62)`}>
      <rect x="-46" y="0" width="92" height="66" rx="4" fill="#0b1220" stroke="#1f2937" strokeWidth="1.5" />
      <rect x="-44" y="2" width="88" height="62" rx="3" fill="none" stroke="#111827" strokeWidth="0.5" />
      {children}
    </g>
  );
}

function LaneClosedSign({ x }: { x: number }) {
  return (
    <GantrySignPanel x={x}>
      {/* Red X for a closed lane (Rule 258 / matrix sign) */}
      <line x1="-26" y1="14" x2="26" y2="52" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
      <line x1="26" y1="14" x2="-26" y2="52" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
    </GantrySignPanel>
  );
}

function VariableSpeedSign({ x, mph }: { x: number; mph: number }) {
  // LED "variable" speed limit: red ring, mph in the middle, mandatory
  // when shown on a gantry (Rule 261).
  return (
    <GantrySignPanel x={x}>
      <circle cx="0" cy="33" r="22" fill="#0b1220" stroke="#ef4444" strokeWidth="5" />
      <text
        x="0"
        y="41"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="22"
        fontWeight="900"
        fill="#f8fafc"
      >
        {mph}
      </text>
    </GantrySignPanel>
  );
}

function NationalLimitSign({ x }: { x: number }) {
  // The "national speed limit applies" pictogram: white circle with a
  // single diagonal white bar from top-left to bottom-right. On a
  // matrix gantry this cancels the previous variable limit.
  return (
    <GantrySignPanel x={x}>
      <circle cx="0" cy="33" r="22" fill="none" stroke="#f8fafc" strokeWidth="4" />
      <line
        x1="-16"
        y1="17"
        x2="16"
        y2="49"
        stroke="#f8fafc"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </GantrySignPanel>
  );
}

// Compact top-down car for the motorway diagrams — same visual style as
// the crossroads Car but smaller so four abreast fit comfortably.
function MotorwayCar({ x, y, color, ghost = false }: { x: number; y: number; color: string; ghost?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={ghost ? 0.35 : 1}>
      <rect x="-11" y="-20" width="22" height="40" rx="5" fill="#000" opacity="0.28" transform="translate(1 2)" />
      <rect x="-11" y="-20" width="22" height="40" rx="5" fill={color} stroke="#0b0b0b" strokeWidth="1" />
      <rect x="-9" y="-16" width="18" height="9" rx="1.5" fill="#0f172a" opacity="0.85" />
      <rect x="-9" y="7" width="18" height="7" rx="1.5" fill="#0f172a" opacity="0.85" />
      <circle cx="-7" cy="-18" r="1.2" fill="#fff8dc" />
      <circle cx="7" cy="-18" r="1.2" fill="#fff8dc" />
    </g>
  );
}

// A bright dashed line right under the gantry that reads across every
// lane, plus a small label pinned to the grass verge. This is the
// "the sign applies FROM HERE" reference students look for.
function AppliesFromHereBand({ label, color = "#facc15" }: { label: string; color?: string }) {
  // A single centred caption pill sits directly on the reference line,
  // reading across every lane. The dashed line continues on both sides
  // so the caption clearly "cuts" the road at the gantry.
  const cx = 320;
  const y = 155;
  const pillW = 320;
  const pillH = 30;
  const pillX = cx - pillW / 2;
  return (
    <g>
      {/* Dashed reference line across the full carriageway */}
      <line x1="40" y1={y} x2={pillX} y2={y} stroke={color} strokeWidth="3" strokeDasharray="8 6" />
      <line x1={pillX + pillW} y1={y} x2="600" y2={y} stroke={color} strokeWidth="3" strokeDasharray="8 6" />
      {/* Centred caption pill */}
      <rect x={pillX} y={y - pillH / 2} width={pillW} height={pillH} rx={pillH / 2} fill={color} stroke="#0b1220" strokeWidth="1.5" />
      <text
        x={cx}
        y={y + 5}
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="15"
        fontWeight="900"
        fill="#0b1f1c"
      >
        {label}
      </text>
    </g>
  );
}

// Small "Lane 1 / 2 / 3 / 4" labels at the very bottom of the diagram
// so students can tell which sign sits above which lane.
function LaneNumbers() {
  return (
    <g fontFamily="Arial, sans-serif" fontSize="14" fontWeight="800" fill="#f8fafc">
      {[
        { x: 110, n: 1 },
        { x: 250, n: 2 },
        { x: 390, n: 3 },
        { x: 530, n: 4 },
      ].map((l) => (
        <text key={l.n} x={l.x} y={406} textAnchor="middle">Lane {l.n}</text>
      ))}
    </g>
  );
}

function SmartMotorwayClosureSvg() {
  return (
    <SmartMotorwayBase>
      {/* Gantry — lane 1 (leftmost) closed by a red X, lanes 2–4 limited to 60 mph */}
      <LaneClosedSign x={110} />
      <VariableSpeedSign x={250} mph={60} />
      <VariableSpeedSign x={390} mph={60} />
      <VariableSpeedSign x={530} mph={60} />

      {/* "60 mph applies FROM HERE" reference line under the gantry */}
      <AppliesFromHereBand label="60 mph applies FROM HERE" />

      {/* Traffic AFTER the gantry (below the reference line) — lane 1 empty */}
      <MotorwayCar x={250} y={220} color="#dc2626" />
      <MotorwayCar x={390} y={240} color="#f59e0b" />
      <MotorwayCar x={530} y={220} color="#1d4ed8" />
      <MotorwayCar x={250} y={310} color="#0ea5e9" />
      <MotorwayCar x={390} y={330} color="#22c55e" />
      <MotorwayCar x={530} y={310} color="#a855f7" />

      {/* Ghost car merging OUT of the closed lane 1 into lane 2 */}
      <MotorwayCar x={110} y={330} color="#94a3b8" ghost />
      <g fill="none" stroke="#facc15" strokeWidth="2.5" strokeDasharray="5 4" opacity="0.95">
        <path d="M 110 320 C 140 290 200 275 240 268" />
      </g>
      <polygon points="234,260 252,268 234,276" fill="#facc15" />

      <LaneNumbers />
    </SmartMotorwayBase>
  );
}

function SmartMotorwayEndSvg() {
  return (
    <SmartMotorwayBase>
      {/* Gantry — restriction cancelled: national speed limit above every lane */}
      <NationalLimitSign x={110} />
      <NationalLimitSign x={250} />
      <NationalLimitSign x={390} />
      <NationalLimitSign x={530} />

      {/* "Back to 70 mph" reference line under the gantry */}
      <AppliesFromHereBand label="70 mph applies FROM HERE" color="#f8fafc" />

      {/* Traffic AFTER the gantry — lane 1 is open again */}
      <MotorwayCar x={110} y={220} color="#dc2626" />
      <MotorwayCar x={250} y={250} color="#f59e0b" />
      <MotorwayCar x={390} y={220} color="#1d4ed8" />
      <MotorwayCar x={530} y={250} color="#22c55e" />
      <MotorwayCar x={110} y={320} color="#0ea5e9" />
      <MotorwayCar x={250} y={330} color="#a855f7" />
      <MotorwayCar x={390} y={320} color="#ec4899" />
      <MotorwayCar x={530} y={330} color="#14b8a6" />

      <LaneNumbers />
    </SmartMotorwayBase>
  );
}

function SmartMotorway() {
  return (
    <Panel
      title="Smart motorway gantry signs"
      subtitle="Rules 258 & 261. The signs above your lane tell you what to do — from that gantry, until the next one cancels them."
    >
      <div className="grid gap-5">
        <figure role="group" aria-label="Smart motorway gantry showing lane 1 closed with a red X, and 60 mph variable speed limit signs above the remaining three lanes. A car is merging out of the closed lane into lane 2.">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent">Diagram 1 · Lane closed + reduced speed</div>
          <ZoomPan aspect="640/420" label="Smart motorway — lane 1 closed by a red X and a 60 mph limit applied to all remaining lanes.">
            <SmartMotorwayClosureSvg />
          </ZoomPan>
          <p className="mt-3 text-sm">
            The <strong>red X</strong> above lane 1 means <strong>that lane is closed</strong> — you must not drive, stop or overtake in it. The <strong>60 mph in a red ring</strong> above every other lane is a <strong>mandatory speed limit</strong> that <strong>applies from this gantry onwards</strong> across the whole carriageway.
          </p>
        </figure>

        <figure role="group" aria-label="Smart motorway gantry showing the national speed limit sign (white circle with a diagonal white bar) above all four lanes, meaning the previous restriction has ended.">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent">Diagram 2 · National speed limit resumes</div>
          <ZoomPan aspect="640/420" label="Smart motorway — national speed limit signs above every lane, cancelling the previous 60 mph restriction.">
            <SmartMotorwayEndSvg />
          </ZoomPan>
          <p className="mt-3 text-sm">
            The <strong>national speed limit</strong> pictogram (white circle with a diagonal white bar) <strong>cancels the previous variable limit</strong>. From this gantry onwards you are back to the motorway's national limit — <strong>70 mph</strong> for cars and light vans. Lane 1 is open again.
          </p>
        </figure>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="border border-border p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">Red X — lane closed</div>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
            <li><strong>Do not drive</strong> in a lane closed by a red X — even if it looks empty.</li>
            <li>Move out <strong>early</strong> and steadily; don't cut across at the last moment.</li>
            <li>The closure lasts <strong>until the next gantry</strong> shows a blank sign or "End" symbol.</li>
          </ul>
        </div>
        <div className="border border-border p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">Variable speed limit</div>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
            <li>Numbers in a <strong>red ring</strong> on a gantry are <strong>mandatory</strong>, not advisory.</li>
            <li>They <strong>apply from this gantry onwards</strong>, across every lane below the sign.</li>
            <li>Only the <strong>national speed limit pictogram</strong> — or a blank gantry — cancels them.</li>
          </ul>
        </div>
      </div>
    </Panel>
  );
}