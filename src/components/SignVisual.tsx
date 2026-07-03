import type { ReactNode, CSSProperties } from "react";

export type SymbolKey =
  | "exclaim"
  | "bend-right"
  | "bend-left"
  | "double-bend"
  | "roundabout"
  | "crossroads"
  | "staggered-junction"
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

export type SignVariant =
  | { kind: "warning"; symbol: SymbolKey; label?: string }
  | { kind: "giveway" }
  | { kind: "stop" }
  | { kind: "prohibition"; symbol: SymbolKey; slash?: boolean }
  | { kind: "no-entry" }
  | { kind: "speed-limit"; text: string }
  | { kind: "national-speed" }
  | { kind: "end-restriction"; symbol: SymbolKey }
  | { kind: "mandatory"; symbol: SymbolKey; label?: string }
  | { kind: "info-blue"; symbol?: SymbolKey; label?: string }
  | { kind: "info-green"; label: string }
  | { kind: "info-white"; label: string }
  | { kind: "motorway"; label: string }
  | { kind: "traffic-light"; state: "red" | "amber" | "green" | "red-amber" }
  | { kind: "zebra-crossing" }
  | { kind: "signal-crossing"; state: "red-man" | "green-man" }
  | { kind: "countdown-marker"; distance: 300 | 200 | 100; background?: "motorway" | "primary" }
  | {
      kind: "roundabout-ads";
      exits: { angle: "left" | "ahead-left" | "ahead" | "ahead-right" | "right"; label: string; route?: string }[];
      background?: "motorway" | "primary" | "local";
    }
  | {
      kind: "route-lanes";
      background?: "motorway" | "primary" | "local";
      lanes: { arrow: "up" | "up-left" | "up-right"; destination: string; route?: string }[];
    };

/**
 * Highway-Code-style pictogram. Drawn as solid silhouettes so it matches the
 * black-on-white look of DfT road signs (TSRGD). These are original SVGs, not
 * derived from any copyrighted artwork.
 */
function Sym({ k, color = "#000", size = 60 }: { k: SymbolKey; color?: string; size?: number }) {
  const s = size;
  const box = (children: ReactNode) => (
    <svg width={s} height={s} viewBox="0 0 100 100" fill={color} stroke="none">
      {children}
    </svg>
  );
  switch (k) {
    case "exclaim":
      return box(<>
        <path d="M45 12 L55 12 L53 62 L47 62 Z" />
        <circle cx="50" cy="78" r="6" />
      </>);

    case "bend-right":
      return box(
        <path d="M40 94 L40 55 Q40 42 54 40 L68 38 L68 26 L94 42 L68 58 L68 48 L58 49 Q50 50 50 58 L50 94 Z" />
      );
    case "bend-left":
      return box(
        <path d="M60 94 L60 55 Q60 42 46 40 L32 38 L32 26 L6 42 L32 58 L32 48 L42 49 Q50 50 50 58 L50 94 Z" />
      );
    case "double-bend":
      return box(
        <path d="M42 94 L42 66 Q42 58 54 56 Q64 54 64 46 L64 32 L74 32 L60 14 L46 32 L56 32 L56 44 Q56 48 48 49 Q34 52 34 66 L34 94 Z" />
      );

    case "roundabout":
      return box(<>
        <path d="M50 6 A44 44 0 0 1 88 28 L78 34 A32 32 0 0 0 56 16 Z" />
        <path d="M92 40 A44 44 0 0 1 78 84 L70 76 A32 32 0 0 0 82 44 Z" />
        <path d="M68 92 A44 44 0 0 1 10 60 L22 58 A32 32 0 0 0 60 82 Z" />
        <path d="M8 48 A44 44 0 0 1 44 6 L46 18 A32 32 0 0 0 18 48 Z" />
        <path d="M83 22 L96 24 L88 38 Z" />
        <path d="M76 78 L92 78 L82 90 Z" />
        <path d="M20 86 L6 80 L20 68 Z" />
        <path d="M18 22 L4 30 L14 42 Z" />
      </>);
    case "mini-roundabout":
      return box(<>
        <path d="M50 8 A40 40 0 0 1 84 30 L74 36 A28 28 0 0 0 56 20 Z" />
        <path d="M86 44 A40 40 0 0 1 74 82 L64 74 A28 28 0 0 0 78 48 Z" />
        <path d="M62 88 A40 40 0 0 1 14 58 L24 56 A28 28 0 0 0 58 78 Z" />
        <circle cx="50" cy="50" r="10" />
      </>);

    case "crossroads":
      return box(<>
        <rect x="45" y="10" width="10" height="80" />
        <rect x="10" y="45" width="80" height="10" />
      </>);
    case "staggered-junction":
      return box(<>
        <rect x="45" y="10" width="10" height="80" />
        <rect x="10" y="30" width="40" height="8" />
        <rect x="50" y="62" width="40" height="8" />
      </>);
    case "t-junction":
      return box(<>
        <rect x="45" y="45" width="10" height="45" />
        <rect x="10" y="35" width="80" height="10" />
      </>);
    case "side-road":
      return box(<>
        <rect x="45" y="10" width="10" height="80" />
        <rect x="50" y="45" width="42" height="10" />
      </>);

    case "hump":
      return box(<>
        <path d="M8 76 L8 66 Q28 66 38 44 Q50 18 62 44 Q72 66 92 66 L92 76 Z" />
      </>);
    case "slippery":
      return box(<>
        <path d="M52 90 L44 90 L44 58 Q44 50 38 44 L24 32 L30 26 L44 38 Q52 46 54 58 Z" />
        <path d="M20 22 Q28 28 36 24 L40 30 Q30 34 22 30 Z" />
        <path d="M40 42 Q50 48 58 42 L62 48 Q52 54 42 50 Z" />
      </>);
    case "uneven":
      return box(
        <path d="M6 74 L26 42 L44 60 L60 36 L82 66 L92 66 L92 78 L6 78 Z" />
      );
    case "steep-down":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M6 78 L94 30 L94 78 Z" fill={color} />
          <text x="42" y="72" fontSize="14" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">20%</text>
        </svg>
      );
    case "steep-up":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M6 78 L94 78 L6 30 Z" fill={color} />
          <text x="28" y="72" fontSize="14" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">20%</text>
        </svg>
      );
    case "road-narrows":
      return box(<>
        <path d="M16 90 L34 18 L40 18 L26 90 Z" />
        <path d="M84 90 L66 18 L60 18 L74 90 Z" />
      </>);
    case "two-way":
      return box(<>
        <path d="M32 90 L32 30 L22 30 L38 10 L54 30 L44 30 L44 90 Z" />
        <path d="M56 10 L56 70 L46 70 L62 90 L78 70 L68 70 L68 10 Z" />
      </>);

    case "school-children":
      return box(<>
        <circle cx="34" cy="18" r="8" />
        <path d="M24 28 L44 28 L48 56 L42 58 L46 88 L38 88 L34 66 L30 88 L22 88 L26 58 L20 56 Z" />
        <circle cx="64" cy="28" r="7" />
        <path d="M56 37 L72 37 L74 60 L69 61 L72 86 L64 86 L61 66 L58 86 L52 86 L54 60 L50 60 Z" />
        <path d="M46 44 L58 46 L58 42 L46 40 Z" />
      </>);

    case "pedestrians":
    case "pedestrian-solo":
      return box(<>
        <circle cx="52" cy="14" r="9" />
        <path d="M40 26 L62 24 L68 50 L60 54 L66 82 L66 94 L58 94 L54 68 L48 94 L38 94 L46 62 L36 50 L32 32 Z" />
      </>);

    case "pedestrian-crossing":
      return box(<>
        <circle cx="42" cy="10" r="6" />
        <path d="M32 20 L50 18 L54 42 L48 44 L54 66 L46 66 L42 54 L38 66 L30 66 L36 50 L28 42 L26 26 Z" />
        <rect x="10" y="76" width="80" height="4" />
        <rect x="10" y="83" width="80" height="4" />
        <rect x="10" y="90" width="80" height="4" />
      </>);

    case "cyclists":
    case "bike":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="70" r="14" />
          <circle cx="76" cy="70" r="14" />
          <path d="M24 70 L50 42 L76 70 M50 42 L60 30 M40 32 L60 32 M76 70 L60 32" />
        </svg>
      );

    case "horse":
      return box(<>
        <path d="M16 84 L16 60 Q16 50 30 50 L58 50 Q72 50 72 40 L72 30 Q72 24 66 24 L62 24 L58 12 L52 24 L46 24 Q40 24 40 32 L40 50 L28 50 Q16 50 16 60 L16 84 L24 84 L24 62 L30 62 L30 84 L38 84 L38 62 L52 62 L52 84 L60 84 L60 62 L64 62 L64 84 Z" />
        <path d="M74 28 L86 20 L80 34 Z" />
      </>);
    case "wild-animals":
      return box(<>
        <path d="M10 84 L24 56 Q24 44 40 44 L58 44 Q70 44 72 30 L76 10 L82 10 L78 30 Q76 56 58 56 L48 56 L36 84 Z" />
        <path d="M70 20 L74 4 L78 22 Z" />
        <path d="M76 22 L82 6 L82 24 Z" />
      </>);
    case "cattle":
      return box(<>
        <path d="M12 82 L12 60 Q12 50 26 50 L60 50 Q74 50 74 42 L74 32 Q74 26 68 26 L64 24 L60 14 Q56 24 50 26 Q42 26 42 34 L42 50 L26 50 Q12 50 12 60 L12 82 L20 82 L20 62 L26 62 L26 82 L36 82 L36 62 L48 62 L48 82 L56 82 L56 62 L60 62 L60 82 Z" />
        <path d="M58 14 L50 4 M62 14 L70 4" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
      </>);
    case "elderly":
      return box(<>
        <circle cx="34" cy="18" r="7" />
        <path d="M28 26 L42 24 L46 42 Q40 46 38 54 L44 86 L38 86 L34 64 L32 86 L24 86 L26 56 Z" />
        <path d="M26 54 L20 90 L16 90 L22 50 Z" />
        <circle cx="66" cy="22" r="6" />
        <path d="M58 30 L72 30 L74 58 L69 58 L72 86 L64 86 L62 64 L60 86 L54 86 L56 58 L52 58 Z" />
      </>);

    case "roadworks":
      return box(<>
        <circle cx="46" cy="14" r="7" />
        <path d="M36 24 L54 22 L60 46 L52 50 L58 78 L52 78 L48 60 L42 78 L36 78 L40 54 L32 40 Z" />
        <path d="M56 42 L86 68 L82 74 L52 48 Z" />
        <path d="M82 62 L94 74 L86 82 L74 70 Z" />
      </>);

    case "traffic-signals":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <rect x="36" y="6" width="28" height="82" rx="3" fill={color} />
          <rect x="46" y="88" width="8" height="8" fill={color} />
          <circle cx="50" cy="22" r="9" fill="#ef4444" />
          <circle cx="50" cy="47" r="9" fill="#f59e0b" />
          <circle cx="50" cy="72" r="9" fill="#22c55e" />
        </svg>
      );

    case "level-crossing":
      return box(<>
        <path d="M6 74 L94 74 L94 64 L74 64 L74 40 L58 40 L52 24 L28 24 L28 64 L6 64 Z" />
        <rect x="16" y="18" width="10" height="10" />
        <circle cx="22" cy="84" r="7" />
        <circle cx="46" cy="84" r="7" />
        <circle cx="72" cy="84" r="7" />
      </>);
    case "low-bridge":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <rect x="8" y="18" width="84" height="14" fill={color} />
          <rect x="16" y="32" width="10" height="62" fill={color} />
          <rect x="74" y="32" width="10" height="62" fill={color} />
          <path d="M32 50 L40 40 M60 50 L68 40" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
          <text x="32" y="66" fontSize="12" fontWeight="800" fontFamily="Arial, sans-serif" fill={color}>14'-6"</text>
        </svg>
      );
    case "tunnel":
      return box(
        <path d="M8 90 L8 50 Q8 12 50 12 Q92 12 92 50 L92 90 L80 90 L80 50 Q80 24 50 24 Q20 24 20 50 L20 90 Z" />
      );
    case "quayside":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <g transform="rotate(15 50 50)" fill={color}>
            <path d="M10 50 L20 32 Q22 26 30 26 L64 26 Q72 26 74 32 L82 50 L82 60 L74 60 L74 66 L64 66 L64 60 L28 60 L28 66 L18 66 L18 60 L10 60 Z" />
          </g>
          <path d="M4 78 Q18 72 32 78 T60 78 T88 78 T100 78" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
          <path d="M4 90 Q18 84 32 90 T60 90 T88 90 T100 90" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case "falling-rocks":
      return box(<>
        <path d="M8 10 L8 90 L34 90 L46 72 L34 60 L46 44 L28 30 L38 20 L28 10 Z" />
        <path d="M58 44 L70 40 L74 52 L64 58 Z" />
        <path d="M68 62 L82 60 L82 74 L66 76 Z" />
        <circle cx="76" cy="86" r="6" />
      </>);

    case "arrow-up":
      return box(<path d="M40 92 L40 42 L22 42 L50 8 L78 42 L60 42 L60 92 Z" />);
    case "arrow-left":
      return box(<path d="M92 40 L42 40 L42 22 L8 50 L42 78 L42 60 L92 60 Z" />);
    case "arrow-right":
      return box(<path d="M8 40 L58 40 L58 22 L92 50 L58 78 L58 60 L8 60 Z" />);
    case "turn-left":
      return box(<path d="M56 94 L56 46 L34 46 L34 60 L14 40 L34 20 L34 34 L68 34 L68 94 Z" />);
    case "turn-right":
      return box(<path d="M44 94 L44 46 L66 46 L66 60 L86 40 L66 20 L66 34 L32 34 L32 94 Z" />);
    case "keep-left":
      return box(<path d="M62 10 Q34 44 20 88 L34 92 L38 78 L48 82 L38 60 L28 60 Q40 34 68 20 Z" />);
    case "keep-right":
      return box(<path d="M38 10 Q66 44 80 88 L66 92 L62 78 L52 82 L62 60 L72 60 Q60 34 32 20 Z" />);

    case "bus":
      return box(<>
        <rect x="12" y="20" width="76" height="52" rx="5" />
        <rect x="18" y="28" width="26" height="18" fill="#fff" />
        <rect x="56" y="28" width="26" height="18" fill="#fff" />
        <rect x="18" y="52" width="64" height="6" fill="#fff" />
        <circle cx="28" cy="80" r="8" />
        <circle cx="72" cy="80" r="8" />
      </>);
    case "car":
      return box(<>
        <path d="M8 66 L20 42 Q22 34 32 34 L68 34 Q78 34 80 42 L92 66 L92 80 L82 80 L82 86 L70 86 L70 80 L30 80 L30 86 L18 86 L18 80 L8 80 Z" />
        <path d="M26 44 L36 44 L32 58 L18 58 Z" fill="#fff" />
        <path d="M74 44 L64 44 L68 58 L82 58 Z" fill="#fff" />
        <path d="M38 44 L62 44 L60 58 L40 58 Z" fill="#fff" />
      </>);
    case "truck":
      return box(<>
        <rect x="4" y="26" width="58" height="46" />
        <path d="M62 40 L82 40 L94 56 L94 72 L62 72 Z" />
        <rect x="66" y="46" width="22" height="14" fill="#fff" />
        <circle cx="22" cy="82" r="8" />
        <circle cx="42" cy="82" r="8" />
        <circle cx="78" cy="82" r="8" />
      </>);
    case "motorbike":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="22" cy="72" r="12" />
          <circle cx="78" cy="72" r="12" />
          <path d="M22 72 L48 44 L68 50 L78 72 M40 44 L60 44 M54 44 L60 32" />
        </svg>
      );

    case "u-turn":
      return box(
        <path d="M22 94 L22 42 Q22 18 50 18 Q78 18 78 42 L78 62 L88 62 L72 82 L56 62 L66 62 L66 42 Q66 30 50 30 Q34 30 34 42 L34 94 Z" />
      );
    case "overtake":
      return box(<>
        <rect x="16" y="14" width="24" height="70" />
        <rect x="60" y="26" width="24" height="70" fill="#dc2626" />
      </>);

    case "parking":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <text x="50" y="82" textAnchor="middle" fontSize="90" fontWeight="900" fill="#fff" fontFamily="Arial, sans-serif">P</text>
        </svg>
      );
    case "hospital":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <text x="50" y="82" textAnchor="middle" fontSize="90" fontWeight="900" fill="#fff" fontFamily="Arial, sans-serif">H</text>
        </svg>
      );
    case "info-i":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <text x="50" y="82" textAnchor="middle" fontSize="90" fontWeight="900" fill="#fff" fontFamily="Arial, sans-serif" fontStyle="italic">i</text>
        </svg>
      );
    case "petrol":
      return box(<>
        <rect x="18" y="14" width="38" height="72" />
        <rect x="24" y="22" width="26" height="22" fill="#fff" />
        <path d="M56 30 L66 30 L66 60 Q66 68 74 68 Q82 68 82 60 L82 44 L78 44 L78 38 L86 38 L86 62 Q86 76 74 76 Q62 76 62 62 L62 38 L56 38 Z" />
      </>);
    case "phone":
      return box(
        <path d="M18 26 Q18 12 32 12 L48 18 L40 40 Q52 62 68 68 L84 56 Q94 68 84 84 Q66 94 40 74 Q16 52 18 26 Z" />
      );
    case "food":
      return box(<>
        <path d="M22 10 L28 10 L28 40 L32 40 L32 10 L38 10 L38 40 L42 40 L42 10 L48 10 L48 46 Q48 54 40 54 L40 90 L30 90 L30 54 Q22 54 22 46 Z" />
        <path d="M72 10 Q56 20 56 44 Q56 54 68 54 L68 90 L76 90 L76 10 Z" />
      </>);

    default:
      return null;
  }
}

function Shell({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="relative flex items-center justify-center" style={style}>
      {children}
    </div>
  );
}

export function SignVisual({ variant, size = 160 }: { variant: SignVariant; size?: number }) {
  const px = size;
  switch (variant.kind) {
    case "warning": {
      const inner = px * 0.5;
      return (
        <div className="relative inline-flex flex-col items-center">
          <div className="relative" style={{ width: px, height: px * 0.92 }}>
            <svg width={px} height={px * 0.92} viewBox="0 0 100 92">
              <polygon points="50,3 97,89 3,89" fill="#dc2626" />
              <polygon points="50,14 88,82 12,82" fill="#fff" />
            </svg>
            <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-[13%]">
              <div style={{ width: inner, height: inner }} className="flex items-center justify-center">
                <Sym k={variant.symbol} color="#000" size={inner} />
              </div>
            </div>
          </div>
          {variant.label && (
            <div className="mt-1 text-[10px] font-bold tracking-widest text-foreground">{variant.label}</div>
          )}
        </div>
      );
    }
    case "giveway":
      return (
        <Shell>
          <svg width={px} height={px * 0.92} viewBox="0 0 100 92">
            <polygon points="3,3 97,3 50,89" fill="#dc2626" />
            <polygon points="14,12 86,12 50,78" fill="#fff" />
          </svg>
          <div
            className="pointer-events-none absolute inset-x-0 top-[20%] text-center font-black uppercase leading-[1] text-black"
            style={{ fontSize: px * 0.14, fontFamily: "Arial, sans-serif" }}
          >
            Give<br />way
          </div>
        </Shell>
      );
    case "stop":
      return (
        <Shell>
          <svg width={px} height={px} viewBox="0 0 100 100">
            <polygon
              points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30"
              fill="#dc2626"
              stroke="#fff"
              strokeWidth="3"
            />
          </svg>
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center font-black text-white"
            style={{ fontSize: px * 0.28, fontFamily: "Arial, sans-serif", letterSpacing: "0.05em" }}
          >
            STOP
          </div>
        </Shell>
      );
    case "prohibition": {
      const inner = px * 0.55;
      return (
        <Shell>
          <svg width={px} height={px} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#dc2626" />
            <circle cx="50" cy="50" r="37" fill="#fff" />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div style={{ width: inner, height: inner }}>
              <Sym k={variant.symbol} color="#000" size={inner} />
            </div>
          </div>
          {variant.slash && (
            <svg
              className="pointer-events-none absolute inset-0"
              width={px}
              height={px}
              viewBox="0 0 100 100"
            >
              <line
                x1="18"
                y1="82"
                x2="82"
                y2="18"
                stroke="#dc2626"
                strokeWidth="9"
                strokeLinecap="round"
              />
            </svg>
          )}
        </Shell>
      );
    }
    case "no-entry":
      return (
        <Shell>
          <svg width={px} height={px} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#dc2626" />
            <rect x="16" y="44" width="68" height="12" fill="#fff" />
          </svg>
        </Shell>
      );
    case "speed-limit":
      return (
        <Shell>
          <svg width={px} height={px} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#dc2626" />
            <circle cx="50" cy="50" r="37" fill="#fff" />
          </svg>
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center font-black text-black"
            style={{ fontSize: px * 0.38, fontFamily: "Arial, sans-serif", letterSpacing: "-0.03em" }}
          >
            {variant.text}
          </div>
        </Shell>
      );
    case "national-speed":
      return (
        <Shell>
          <svg width={px} height={px} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#fff" stroke="#000" strokeWidth="4" />
            <line x1="20" y1="80" x2="80" y2="20" stroke="#000" strokeWidth="9" strokeLinecap="round" />
          </svg>
        </Shell>
      );
    case "end-restriction": {
      const inner = px * 0.55;
      return (
        <Shell>
          <svg width={px} height={px} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#fff" stroke="#000" strokeWidth="4" />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-70">
            <div style={{ width: inner, height: inner }}>
              <Sym k={variant.symbol} color="#000" size={inner} />
            </div>
          </div>
          <svg
            className="pointer-events-none absolute inset-0"
            width={px}
            height={px}
            viewBox="0 0 100 100"
          >
            <line x1="20" y1="80" x2="80" y2="20" stroke="#000" strokeWidth="7" strokeLinecap="round" />
          </svg>
        </Shell>
      );
    }
    case "mandatory": {
      const inner = px * 0.62;
      return (
        <Shell>
          <svg width={px} height={px} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#1849a9" />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div style={{ width: inner, height: inner }}>
              <Sym k={variant.symbol} color="#fff" size={inner} />
            </div>
          </div>
        </Shell>
      );
    }
    case "info-blue":
      return (
        <div
          className="flex items-center justify-center bg-[#1849a9] p-2 text-white"
          style={{ width: px, height: px }}
        >
          {variant.symbol && (
            <div style={{ width: px * 0.7, height: px * 0.7 }}>
              <Sym k={variant.symbol} color="#fff" size={px * 0.7} />
            </div>
          )}
          {variant.label && !variant.symbol && (
            <div className="text-center font-bold" style={{ fontSize: px * 0.16, fontFamily: "Arial, sans-serif" }}>
              {variant.label}
            </div>
          )}
        </div>
      );
    case "info-green":
      return (
        <div
          className="flex items-center justify-center border-2 border-white bg-[#0e7c3a] px-3 text-white shadow-md"
          style={{ width: px * 1.4, height: px * 0.75, fontFamily: "Arial, sans-serif" }}
        >
          <div className="text-center font-bold" style={{ fontSize: px * 0.15 }}>{variant.label}</div>
        </div>
      );
    case "info-white":
      return (
        <div
          className="flex items-center justify-center border-4 border-black bg-white px-3 text-black"
          style={{ width: px * 1.4, height: px * 0.75, fontFamily: "Arial, sans-serif" }}
        >
          <div className="text-center font-bold" style={{ fontSize: px * 0.15 }}>{variant.label}</div>
        </div>
      );
    case "motorway":
      return (
        <div
          className="flex items-center justify-center border-2 border-white bg-[#0033a0] px-3 text-white shadow-md"
          style={{ width: px * 1.4, height: px * 0.75, fontFamily: "Arial, sans-serif" }}
        >
          <div className="text-center font-bold" style={{ fontSize: px * 0.15 }}>{variant.label}</div>
        </div>
      );
    case "traffic-light": {
      const on = (c: string) =>
        variant.state === c || (variant.state === "red-amber" && (c === "red" || c === "amber"));
      return (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-md bg-[#111] p-3"
          style={{ width: px * 0.55, height: px }}
        >
          <div
            className="rounded-full"
            style={{
              width: px * 0.3,
              height: px * 0.3,
              background: on("red") ? "#ef4444" : "#3a1414",
              boxShadow: on("red") ? "0 0 22px #ef4444" : "none",
            }}
          />
          <div
            className="rounded-full"
            style={{
              width: px * 0.3,
              height: px * 0.3,
              background: on("amber") ? "#f59e0b" : "#3a2a10",
              boxShadow: on("amber") ? "0 0 22px #f59e0b" : "none",
            }}
          />
          <div
            className="rounded-full"
            style={{
              width: px * 0.3,
              height: px * 0.3,
              background: on("green") ? "#22c55e" : "#123a1a",
              boxShadow: on("green") ? "0 0 22px #22c55e" : "none",
            }}
          />
        </div>
      );
    }
    case "zebra-crossing": {
      const w = px * 1.3;
      const h = px * 0.95;
      const stripes = 7;
      const stripeH = 100 / (stripes * 2 - 1);
      return (
        <div className="relative" style={{ width: w, height: h }}>
          {/* Road */}
          <div className="absolute inset-y-3 left-[18%] right-[18%] overflow-hidden bg-[#2a2a2a]">
            {Array.from({ length: stripes }).map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 bg-white"
                style={{ top: `${i * stripeH * 2}%`, height: `${stripeH}%` }}
              />
            ))}
          </div>
          {/* Belisha beacons */}
          {[
            { side: "left" as const, left: "3%" },
            { side: "right" as const, right: "3%" },
          ].map((p, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 flex flex-col items-center"
              style={p.side === "left" ? { left: p.left } : { right: p.right }}
            >
              <div
                className="rounded-full"
                style={{
                  width: px * 0.2,
                  height: px * 0.2,
                  background: "#f5a623",
                  boxShadow: "0 0 14px #f5a623",
                }}
              />
              <div className="flex-1 overflow-hidden" style={{ width: px * 0.07 }}>
                <div className="h-1/4 bg-white" />
                <div className="h-1/4 bg-black" />
                <div className="h-1/4 bg-white" />
                <div className="h-1/4 bg-black" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    case "signal-crossing": {
      const isGreen = variant.state === "green-man";
      const bg = isGreen ? "#22c55e" : "#ef4444";
      return (
        <div
          className="flex items-center justify-center rounded-md bg-[#111] p-3"
          style={{ width: px * 0.7, height: px }}
        >
          <div
            className="flex items-center justify-center"
            style={{ width: "100%", height: "100%", background: "#050505" }}
          >
            <svg width={px * 0.5} height={px * 0.8} viewBox="0 0 100 150" fill={bg}>
              {isGreen ? (
                <g>
                  <circle cx="55" cy="18" r="12" />
                  <path d="M40 34 L68 32 L76 68 L66 72 L74 116 L74 140 L60 140 L54 100 L44 140 L32 140 L44 92 L34 72 L26 50 Z" />
                </g>
              ) : (
                <g>
                  <circle cx="50" cy="22" r="12" />
                  <path d="M32 40 L68 40 L76 100 L60 100 L58 140 L42 140 L40 100 L24 100 Z" />
                </g>
              )}
            </svg>
          </div>
        </div>
      );
    }
    case "countdown-marker": {
      const bg = variant.background === "primary" ? "#0e7c3a" : "#0033a0";
      const bars = variant.distance === 300 ? 3 : variant.distance === 200 ? 2 : 1;
      const w = px * 0.9;
      const h = px * 1.1;
      return (
        <div
          className="flex flex-col items-center justify-center gap-[6%] border-2 border-white text-white shadow-md"
          style={{ width: w, height: h, background: bg, padding: "6% 8%" }}
        >
          {Array.from({ length: bars }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "70%",
                height: h * 0.11,
                background: "#fff",
                transform: "skewX(-28deg)",
                borderRadius: 1,
              }}
            />
          ))}
          <div
            className="mt-[8%] font-bold leading-none"
            style={{ fontSize: px * 0.12, fontFamily: "Arial, sans-serif" }}
          >
            {variant.distance} yds
          </div>
        </div>
      );
    }
    case "roundabout-ads": {
      const bg =
        variant.background === "motorway"
          ? "#0033a0"
          : variant.background === "primary"
            ? "#0e7c3a"
            : "#fff";
      const fg = variant.background === "local" ? "#000" : "#fff";
      const stroke = variant.background === "local" ? "#000" : "#fff";
      const w = px * 2.2;
      const h = px * 1.7;
      // wider viewBox so long labels have room outside the ring
      const VB_W = 140;
      const VB_H = 90;
      const cx = 70;
      const cy = 52;
      const r = 12;
      // Each label sits well outside the ring so it can never overlap the diagram.
      const slots: Record<string, { x1: number; y1: number; x2: number; y2: number; tx: number; ty: number; anchor: "start" | "middle" | "end" }> = {
        left:        { x1: cx - r, y1: cy,           x2: 22,  y2: cy, tx: 4,   ty: cy - 5, anchor: "start" },
        "ahead-left":{ x1: cx - r*0.7, y1: cy - r*0.7, x2: 30, y2: 22, tx: 28, ty: 18,     anchor: "start" },
        ahead:       { x1: cx, y1: cy - r,           x2: cx, y2: 22, tx: cx, ty: 15,     anchor: "middle" },
        "ahead-right":{ x1: cx + r*0.7, y1: cy - r*0.7, x2: 110, y2: 22, tx: 112, ty: 18,  anchor: "end" },
        right:       { x1: cx + r, y1: cy,           x2: 118, y2: cy, tx: 136, ty: cy - 5, anchor: "end" },
      };
      return (
        <div
          className="flex items-center justify-center border-2 shadow-md"
          style={{
            width: w,
            height: h,
            background: bg,
            borderColor: variant.background === "local" ? "#000" : "#fff",
          }}
        >
          <svg width="96%" height="96%" viewBox={`0 0 ${VB_W} ${VB_H}`} fontFamily="Arial, sans-serif">
            {/* approach stub */}
            <line x1={cx} y1={cy + r} x2={cx} y2={VB_H - 6} stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
            {/* the ring */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth="3.5" />
            {/* exit stubs + labels */}
            {variant.exits.map((e, i) => {
              const s = slots[e.angle];
              if (!s) return null;
              return (
                <g key={i}>
                  <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
                  <text
                    x={s.tx}
                    y={s.ty}
                    fill={fg}
                    fontSize="5.5"
                    fontWeight="700"
                    textAnchor={s.anchor}
                  >
                    {e.route ? (
                      <>
                        <tspan x={s.tx} dy="0">{e.route}</tspan>
                        <tspan x={s.tx} dy="6">{e.label}</tspan>
                      </>
                    ) : (
                      <tspan x={s.tx}>{e.label}</tspan>
                    )}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      );
    }
    case "route-lanes": {
      const bg =
        variant.background === "motorway"
          ? "#0033a0"
          : variant.background === "primary"
            ? "#0e7c3a"
            : "#fff";
      const fg = variant.background === "local" ? "#000" : "#fff";
      const w = px * 2;
      const rowH = px * 0.36;
      const arrowFor = (a: "up" | "up-left" | "up-right") => {
        if (a === "up")
          return "M50,6 L64,26 L56,26 L56,52 L44,52 L44,26 L36,26 Z";
        if (a === "up-left")
          return "M14,32 L36,18 L36,26 L60,26 L60,44 L36,44 L36,52 Z";
        return "M86,32 L64,18 L64,26 L40,26 L40,44 L64,44 L64,52 Z";
      };
      return (
        <div
          className="flex flex-col border-2 shadow-md"
          style={{
            width: w,
            background: bg,
            borderColor: variant.background === "local" ? "#000" : "#fff",
            padding: 6,
            gap: 4,
            fontFamily: "Arial, sans-serif",
          }}
        >
          {variant.lanes.map((lane, i) => (
            <div key={i} className="flex items-center" style={{ height: rowH, color: fg }}>
              <svg width={rowH} height={rowH} viewBox="0 0 100 60">
                <path d={arrowFor(lane.arrow)} fill={fg} />
              </svg>
              <div className="ml-2 flex-1 truncate font-bold" style={{ fontSize: px * 0.13 }}>
                {lane.route ? `${lane.route}  ` : ""}
                {lane.destination}
              </div>
            </div>
          ))}
        </div>
      );
    }
  }
}