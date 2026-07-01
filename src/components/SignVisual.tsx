import type { ReactNode } from "react";

export type SignVariant =
  | { kind: "warning"; symbol: SymbolKey; label?: string }
  | { kind: "giveway" }
  | { kind: "stop" }
  | { kind: "prohibition"; symbol: SymbolKey; slash?: boolean; label?: string }
  | { kind: "no-entry" }
  | { kind: "speed-limit"; text: string }
  | { kind: "national-speed" }
  | { kind: "end-restriction"; symbol: SymbolKey; label?: string }
  | { kind: "mandatory"; symbol: SymbolKey; label?: string }
  | { kind: "info-blue"; symbol?: SymbolKey; label?: string }
  | { kind: "info-green"; label: string }
  | { kind: "info-white"; label: string }
  | { kind: "motorway"; label: string }
  | { kind: "traffic-light"; state: "red" | "amber" | "green" | "red-amber" };

export type SymbolKey =
  | "exclaim"
  | "bend-right"
  | "bend-left"
  | "double-bend"
  | "roundabout"
  | "crossroads"
  | "t-junction"
  | "side-road"
  | "hump"
  | "slippery"
  | "uneven"
  | "steep-down"
  | "steep-up"
  | "road-narrows"
  | "two-way"
  | "school-children"
  | "pedestrians"
  | "pedestrian-crossing"
  | "cyclists"
  | "horse"
  | "wild-animals"
  | "cattle"
  | "elderly"
  | "roadworks"
  | "traffic-signals"
  | "level-crossing"
  | "low-bridge"
  | "tunnel"
  | "quayside"
  | "falling-rocks"
  | "arrow-up"
  | "arrow-left"
  | "arrow-right"
  | "turn-left"
  | "turn-right"
  | "keep-left"
  | "keep-right"
  | "mini-roundabout"
  | "bus"
  | "bike"
  | "car"
  | "truck"
  | "motorbike"
  | "pedestrian-solo"
  | "u-turn"
  | "overtake"
  | "parking"
  | "hospital"
  | "petrol"
  | "info-i"
  | "phone"
  | "food";

const stroke = "#000";

function Symbol({ k, color = "#000", size = 60 }: { k: SymbolKey; color?: string; size?: number }) {
  const s = size;
  const common = { width: s, height: s, viewBox: "0 0 100 100", fill: "none", stroke: color, strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (k) {
    case "exclaim":
      return (<svg {...common}><line x1="50" y1="18" x2="50" y2="62"/><circle cx="50" cy="80" r="4" fill={color} stroke="none"/></svg>);
    case "bend-right":
      return (<svg {...common}><path d="M50 90 V60 Q50 40 65 35 Q80 30 80 15"/><path d="M72 22 L80 12 L88 22"/></svg>);
    case "bend-left":
      return (<svg {...common}><path d="M50 90 V60 Q50 40 35 35 Q20 30 20 15"/><path d="M12 22 L20 12 L28 22"/></svg>);
    case "double-bend":
      return (<svg {...common}><path d="M50 90 Q35 70 50 55 Q65 40 50 20"/><path d="M42 26 L50 15 L58 26"/></svg>);
    case "roundabout":
      return (<svg {...common}><circle cx="50" cy="50" r="22"/><path d="M50 20 L50 10 M75 45 L85 40 M50 80 L50 90 M25 55 L15 60"/><path d="M40 15 L50 8 L60 15"/></svg>);
    case "crossroads":
      return (<svg {...common}><path d="M50 15 V85 M15 50 H85"/></svg>);
    case "t-junction":
      return (<svg {...common}><path d="M50 85 V50 M15 50 H85"/></svg>);
    case "side-road":
      return (<svg {...common}><path d="M50 85 V15 M50 55 H85"/></svg>);
    case "hump":
      return (<svg {...common}><path d="M15 70 Q35 70 40 45 Q50 15 60 45 Q65 70 85 70"/></svg>);
    case "slippery":
      return (<svg {...common}><path d="M50 85 V60 Q50 45 30 40"/><path d="M20 25 Q30 30 40 25 M40 40 Q55 45 60 30"/></svg>);
    case "uneven":
      return (<svg {...common}><path d="M15 70 L35 45 L50 65 L65 40 L85 70"/></svg>);
    case "steep-down":
      return (<svg {...common}><path d="M20 30 L80 75 L20 75 Z" fill={color} stroke="none"/><text x="30" y="65" fontSize="18" fill="#fff" fontWeight="700">20%</text></svg>);
    case "steep-up":
      return (<svg {...common}><path d="M80 30 L20 75 L80 75 Z" fill={color} stroke="none"/><text x="40" y="65" fontSize="18" fill="#fff" fontWeight="700">20%</text></svg>);
    case "road-narrows":
      return (<svg {...common}><path d="M25 85 L40 25 M75 85 L60 25"/></svg>);
    case "two-way":
      return (<svg {...common}><path d="M35 20 V80 M65 20 V80"/><path d="M28 30 L35 15 L42 30 M58 70 L65 85 L72 70"/></svg>);
    case "school-children":
      return (<svg {...common}><circle cx="35" cy="25" r="7"/><path d="M35 32 V55 L28 80 M35 55 L42 80 M28 45 L20 55 M42 45 L50 55"/><circle cx="65" cy="30" r="6"/><path d="M65 36 V60 L60 80 M65 60 L70 80"/></svg>);
    case "pedestrians":
    case "pedestrian-solo":
      return (<svg {...common}><circle cx="50" cy="22" r="7"/><path d="M50 29 V55 L42 82 M50 55 L58 82 M40 40 L32 52 M60 40 L68 52"/></svg>);
    case "pedestrian-crossing":
      return (<svg {...common}><circle cx="42" cy="20" r="6"/><path d="M42 26 V50 L35 75 M42 50 L49 75 M33 38 L25 50 M52 38 L60 50"/><path d="M20 88 H85 M20 82 H85 M20 76 H85" strokeWidth="3"/></svg>);
    case "cyclists":
    case "bike":
      return (<svg {...common}><circle cx="25" cy="70" r="12"/><circle cx="75" cy="70" r="12"/><path d="M25 70 L45 40 L65 70 M45 40 L55 40 M55 40 L75 70"/><circle cx="55" cy="30" r="5"/></svg>);
    case "horse":
      return (<svg {...common}><path d="M20 75 Q20 55 40 55 L60 55 Q80 55 80 40 Q80 30 70 30 L60 30 L55 20 L50 30 Q45 30 45 40 L45 55" fill={color} stroke="none"/><circle cx="65" cy="38" r="2" fill="#fff"/></svg>);
    case "wild-animals":
      return (<svg {...common}><path d="M20 80 L30 55 Q30 40 45 40 L60 40 Q75 40 75 25 L80 15 L70 25 L60 25 Q45 25 40 35 L30 55 Z" fill={color} stroke="none"/><path d="M75 20 L80 10 M70 22 L72 12"/></svg>);
    case "cattle":
      return (<svg {...common}><path d="M25 75 Q25 55 45 55 L65 55 Q80 55 80 45 L80 35 Q75 30 68 32 L60 25 L55 32 Q45 32 42 42 L42 55" fill={color} stroke="none"/></svg>);
    case "elderly":
      return (<svg {...common}><circle cx="35" cy="25" r="6"/><path d="M35 31 V60 L28 82 M35 60 L42 82 M32 45 L25 55"/><circle cx="65" cy="28" r="6"/><path d="M65 34 V60 L58 82 M65 60 L72 82"/><path d="M22 60 L18 82" strokeWidth="4"/></svg>);
    case "roadworks":
      return (<svg {...common}><circle cx="50" cy="25" r="6"/><path d="M50 31 V55 L40 82 M50 55 L60 82 M35 50 L30 40 L45 45 M65 40 L75 50 L60 55"/></svg>);
    case "traffic-signals":
      return (<svg {...common}><rect x="35" y="15" width="30" height="70" rx="4" fill={color} stroke="none"/><circle cx="50" cy="30" r="7" fill="#ef4444"/><circle cx="50" cy="50" r="7" fill="#f59e0b"/><circle cx="50" cy="70" r="7" fill="#22c55e"/></svg>);
    case "level-crossing":
      return (<svg {...common}><path d="M20 45 L50 25 L80 45 M25 55 L75 55"/><text x="35" y="80" fontSize="18" fontWeight="700" fill={color} stroke="none">✕</text></svg>);
    case "low-bridge":
      return (<svg {...common}><path d="M15 30 H85 M25 30 V80 M75 30 V80"/><text x="30" y="65" fontSize="16" fontWeight="700" fill={color} stroke="none">14'-6"</text></svg>);
    case "tunnel":
      return (<svg {...common}><path d="M15 80 Q15 25 50 25 Q85 25 85 80"/><path d="M15 80 H85"/></svg>);
    case "quayside":
      return (<svg {...common}><path d="M15 45 L50 25 L85 45 L85 70 L15 70 Z" fill={color} stroke="none"/><path d="M15 78 Q30 72 45 78 T85 78" fill="none" stroke="#fff" strokeWidth="4"/></svg>);
    case "falling-rocks":
      return (<svg {...common}><path d="M20 15 L80 85 M80 15 L20 85" opacity="0.3"/><circle cx="35" cy="40" r="8" fill={color} stroke="none"/><circle cx="55" cy="60" r="10" fill={color} stroke="none"/><circle cx="70" cy="35" r="6" fill={color} stroke="none"/></svg>);
    case "arrow-up":
      return (<svg {...common}><path d="M50 85 V20 M30 40 L50 15 L70 40"/></svg>);
    case "arrow-left":
      return (<svg {...common}><path d="M85 50 H20 M40 30 L15 50 L40 70"/></svg>);
    case "arrow-right":
      return (<svg {...common}><path d="M15 50 H80 M60 30 L85 50 L60 70"/></svg>);
    case "turn-left":
      return (<svg {...common}><path d="M65 85 V45 Q65 30 50 30 H20 M32 20 L15 30 L32 40"/></svg>);
    case "turn-right":
      return (<svg {...common}><path d="M35 85 V45 Q35 30 50 30 H80 M68 20 L85 30 L68 40"/></svg>);
    case "keep-left":
      return (<svg {...common}><path d="M50 15 Q35 50 25 85 M15 75 L25 85 L35 75"/></svg>);
    case "keep-right":
      return (<svg {...common}><path d="M50 15 Q65 50 75 85 M65 75 L75 85 L85 75"/></svg>);
    case "mini-roundabout":
      return (<svg {...common}><circle cx="50" cy="50" r="30"/><path d="M40 30 L50 20 L60 30 M75 40 L85 50 L75 60 M60 70 L50 80 L40 70 M25 60 L15 50 L25 40"/></svg>);
    case "bus":
      return (<svg {...common}><rect x="20" y="25" width="60" height="45" rx="4" fill={color} stroke="none"/><rect x="26" y="32" width="20" height="15" fill="#fff"/><rect x="54" y="32" width="20" height="15" fill="#fff"/><circle cx="32" cy="75" r="6" fill={color} stroke="none"/><circle cx="68" cy="75" r="6" fill={color} stroke="none"/></svg>);
    case "car":
      return (<svg {...common}><path d="M15 65 L25 45 H75 L85 65 V72 H15 Z" fill={color} stroke="none"/><circle cx="30" cy="72" r="6" fill="#fff"/><circle cx="70" cy="72" r="6" fill="#fff"/></svg>);
    case "truck":
      return (<svg {...common}><rect x="10" y="35" width="55" height="30" fill={color} stroke="none"/><path d="M65 45 H85 V65 H65 Z" fill={color} stroke="none"/><circle cx="25" cy="72" r="6" fill="#fff"/><circle cx="75" cy="72" r="6" fill="#fff"/></svg>);
    case "motorbike":
      return (<svg {...common}><circle cx="25" cy="70" r="10"/><circle cx="75" cy="70" r="10"/><path d="M25 70 L50 45 L75 70 M45 45 L60 45"/></svg>);
    case "u-turn":
      return (<svg {...common}><path d="M30 85 V45 Q30 25 50 25 Q70 25 70 45 V60 M55 55 L70 65 L85 55"/></svg>);
    case "overtake":
      return (<svg {...common}><rect x="20" y="20" width="18" height="60" fill={color} stroke="none"/><rect x="62" y="30" width="18" height="60" fill="#dc2626" stroke="none"/></svg>);
    case "parking":
      return (<svg {...common}><text x="50%" y="70%" textAnchor="middle" fontSize="70" fontWeight="900" fill="#fff" stroke="none">P</text></svg>);
    case "hospital":
      return (<svg {...common}><text x="50%" y="70%" textAnchor="middle" fontSize="70" fontWeight="900" fill="#fff" stroke="none">H</text></svg>);
    case "petrol":
      return (<svg {...common}><path d="M25 80 V25 H60 V80 Z M60 40 H70 Q75 40 75 45 V65 Q75 70 70 70" fill="none"/><path d="M32 32 H53 V50 H32 Z" fill="#fff" stroke="none"/></svg>);
    case "info-i":
      return (<svg {...common}><text x="50%" y="72%" textAnchor="middle" fontSize="70" fontWeight="900" fill="#fff" stroke="none">i</text></svg>);
    case "phone":
      return (<svg {...common}><path d="M25 30 Q25 20 35 20 L45 25 L40 40 Q50 60 65 65 L80 60 Q88 68 82 78 Q70 88 45 75 Q22 55 25 30 Z" fill={color} stroke="none"/></svg>);
    case "food":
      return (<svg {...common}><path d="M30 20 V60 M35 20 V45 Q35 55 30 55 M25 20 V45 Q25 55 30 55 M30 55 V80"/><path d="M70 20 Q60 30 60 45 Q60 55 70 55 V80"/></svg>);
    default:
      return null;
  }
}

function ShapeShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={"relative flex items-center justify-center " + (className ?? "")}>{children}</div>;
}

export function SignVisual({ variant, size = 160 }: { variant: SignVariant; size?: number }) {
  const px = size;
  switch (variant.kind) {
    case "warning": {
      const inner = px * 0.42;
      return (
        <ShapeShell>
          <svg width={px} height={px * 0.92} viewBox="0 0 100 92">
            <polygon points="50,4 96,88 4,88" fill="#dc2626"/>
            <polygon points="50,14 88,82 12,82" fill="#fff"/>
          </svg>
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-[15%]">
            <div style={{ width: inner, height: inner }} className="flex items-center justify-center">
              <Symbol k={variant.symbol} color="#000" size={inner} />
            </div>
          </div>
          {variant.label && (
            <div className="pointer-events-none absolute inset-x-0 bottom-1 text-center text-[10px] font-bold">{variant.label}</div>
          )}
        </ShapeShell>
      );
    }
    case "giveway":
      return (
        <ShapeShell>
          <svg width={px} height={px * 0.92} viewBox="0 0 100 92">
            <polygon points="4,4 96,4 50,88" fill="#dc2626"/>
            <polygon points="14,12 86,12 50,78" fill="#fff"/>
          </svg>
          <div className="pointer-events-none absolute inset-x-0 top-[18%] text-center font-black italic" style={{ fontSize: px * 0.16 }}>Give<br/>way</div>
        </ShapeShell>
      );
    case "stop":
      return (
        <ShapeShell>
          <svg width={px} height={px} viewBox="0 0 100 100">
            <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="#dc2626" stroke="#fff" strokeWidth="4"/>
          </svg>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-black text-white" style={{ fontSize: px * 0.28 }}>STOP</div>
        </ShapeShell>
      );
    case "prohibition": {
      const inner = px * 0.5;
      return (
        <ShapeShell>
          <svg width={px} height={px} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#dc2626"/>
            <circle cx="50" cy="50" r="36" fill="#fff"/>
          </svg>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div style={{ width: inner, height: inner }}><Symbol k={variant.symbol} color="#000" size={inner}/></div>
          </div>
          {variant.slash && (
            <svg className="pointer-events-none absolute inset-0" width={px} height={px} viewBox="0 0 100 100"><line x1="18" y1="82" x2="82" y2="18" stroke="#dc2626" strokeWidth="8" strokeLinecap="round"/></svg>
          )}
        </ShapeShell>
      );
    }
    case "no-entry":
      return (
        <ShapeShell>
          <svg width={px} height={px} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#dc2626"/>
            <rect x="18" y="44" width="64" height="12" fill="#fff"/>
          </svg>
        </ShapeShell>
      );
    case "speed-limit":
      return (
        <ShapeShell>
          <svg width={px} height={px} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#dc2626"/>
            <circle cx="50" cy="50" r="36" fill="#fff"/>
          </svg>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-black" style={{ fontSize: px * 0.36 }}>{variant.text}</div>
        </ShapeShell>
      );
    case "national-speed":
      return (
        <ShapeShell>
          <svg width={px} height={px} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#fff" stroke="#000" strokeWidth="4"/>
            <line x1="20" y1="80" x2="80" y2="20" stroke="#000" strokeWidth="8" strokeLinecap="round"/>
          </svg>
        </ShapeShell>
      );
    case "end-restriction": {
      const inner = px * 0.5;
      return (
        <ShapeShell>
          <svg width={px} height={px} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#fff" stroke="#000" strokeWidth="4"/>
            <line x1="20" y1="80" x2="80" y2="20" stroke="#000" strokeWidth="6" strokeLinecap="round" opacity="0.85"/>
          </svg>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-70">
            <div style={{ width: inner, height: inner }}><Symbol k={variant.symbol} color="#000" size={inner}/></div>
          </div>
        </ShapeShell>
      );
    }
    case "mandatory": {
      const inner = px * 0.6;
      return (
        <ShapeShell>
          <svg width={px} height={px} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#1d4ed8"/>
          </svg>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div style={{ width: inner, height: inner }}><Symbol k={variant.symbol} color="#fff" size={inner}/></div>
          </div>
          {variant.label && (
            <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[10px] font-bold text-white">{variant.label}</div>
          )}
        </ShapeShell>
      );
    }
    case "info-blue":
      return (
        <div className="flex items-center justify-center bg-[#1d4ed8] p-3 text-white" style={{ width: px, height: px }}>
          {variant.symbol && <div style={{ width: px * 0.55, height: px * 0.55 }}><Symbol k={variant.symbol} color="#fff" size={px * 0.55}/></div>}
          {variant.label && !variant.symbol && <div className="text-center font-bold" style={{ fontSize: px * 0.18 }}>{variant.label}</div>}
        </div>
      );
    case "info-green":
      return (
        <div className="flex items-center justify-center bg-[#0e7c3a] p-3 text-white border-2 border-white" style={{ width: px * 1.4, height: px * 0.8 }}>
          <div className="text-center font-bold" style={{ fontSize: px * 0.14 }}>{variant.label}</div>
        </div>
      );
    case "info-white":
      return (
        <div className="flex items-center justify-center bg-white p-3 text-black border-4 border-black" style={{ width: px * 1.4, height: px * 0.8 }}>
          <div className="text-center font-bold" style={{ fontSize: px * 0.14 }}>{variant.label}</div>
        </div>
      );
    case "motorway":
      return (
        <div className="flex items-center justify-center bg-[#0033a0] p-3 text-white border-2 border-white" style={{ width: px * 1.4, height: px * 0.8 }}>
          <div className="text-center font-bold" style={{ fontSize: px * 0.14 }}>{variant.label}</div>
        </div>
      );
    case "traffic-light": {
      const on = (c: string) => variant.state === c || (variant.state === "red-amber" && (c === "red" || c === "amber"));
      return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md bg-[#111] p-3" style={{ width: px * 0.55, height: px }}>
          <div className="rounded-full" style={{ width: px * 0.28, height: px * 0.28, background: on("red") ? "#ef4444" : "#3f1a1a", boxShadow: on("red") ? "0 0 20px #ef4444" : "none" }}/>
          <div className="rounded-full" style={{ width: px * 0.28, height: px * 0.28, background: on("amber") ? "#f59e0b" : "#3f2e10", boxShadow: on("amber") ? "0 0 20px #f59e0b" : "none" }}/>
          <div className="rounded-full" style={{ width: px * 0.28, height: px * 0.28, background: on("green") ? "#22c55e" : "#123a1a", boxShadow: on("green") ? "0 0 20px #22c55e" : "none" }}/>
        </div>
      );
    }
  }
}