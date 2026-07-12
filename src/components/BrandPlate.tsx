import gsmLogo from "@/assets/gsm-logo.jpeg.asset.json";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const COPPER = "#C6873C";
const COPPER_LIGHT = "#E4A85B";
const COPPER_LINE = "rgba(198,135,60,0.75)";
const COPPER_SOFT = "rgba(198,135,60,0.55)";

/**
 * Premium 3D brand plate: deep forest-green rounded rectangle with a
 * copper/gold double border, the circular GSM logo on the left, and a
 * "GSM DRIVING SCHOOL" lockup on the right with an ESTABLISHED 2005 badge.
 * Fully responsive, SVG-quality (pure CSS/text — no rasterisation).
 */
export function BrandPlate({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  const s = SIZES[size];

  return (
    <div
      className={cn(
        "relative isolate inline-flex items-center gap-3 sm:gap-4",
        "rounded-[22px] sm:rounded-[26px] border",
        "shadow-[0_10px_30px_-14px_rgba(0,0,0,0.55)]",
        s.padding,
        className,
      )}
      style={{
        background:
          "linear-gradient(180deg,#2a5a3f 0%,#1f4530 55%,#173525 100%)",
        borderColor: "rgba(198,135,60,0.85)",
      }}
    >
      {/* Inner copper hairline for the double-bevel look */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[3px] rounded-[18px] sm:rounded-[22px]"
        style={{ boxShadow: `inset 0 0 0 1px ${COPPER_SOFT}` }}
      />
      {/* Top light glaze */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-3 top-1 h-[38%] rounded-t-[18px]"
        style={{
          background:
            "linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0) 100%)",
        }}
      />

      {/* Circular logo (kept, not replaced) */}
      <span
        className={cn("relative shrink-0 rounded-full", s.logoWrap)}
        style={{
          background:
            "radial-gradient(circle at 30% 30%,#2f6446 0%,#1c3f2c 70%)",
          boxShadow: `0 0 0 2px ${COPPER}, 0 4px 10px -2px rgba(0,0,0,0.6)`,
        }}
      >
        <img
          src={gsmLogo.url}
          alt="GSM Driving School logo"
          className="h-full w-full rounded-full object-cover"
        />
      </span>

      {/* Type lockup */}
      <div className="relative min-w-0 leading-[1.05]">
        <div className={cn("font-display font-extrabold tracking-tight", s.title)}>
          <span
            className="text-white"
            style={{
              textShadow:
                "0 1px 0 rgba(0,0,0,0.35),0 2px 6px rgba(0,0,0,0.35)",
            }}
          >
            GSM
          </span>{" "}
          <span
            style={{
              backgroundImage: `linear-gradient(180deg,${COPPER_LIGHT} 0%,${COPPER} 55%,#8f5a1f 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: "0 1px 0 rgba(0,0,0,0.35)",
            }}
          >
            DRIVING SCHOOL
          </span>
        </div>

        <div
          aria-hidden
          className="my-1 h-px w-full"
          style={{
            background: `linear-gradient(90deg,transparent,${COPPER_LINE},transparent)`,
          }}
        />

        <div className={cn("font-medium tracking-wide text-white/90", s.subtitle)}>
          George School of Motoring
        </div>

        <div className="mt-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-[2px] font-semibold tracking-[0.18em]",
              s.badge,
            )}
            style={{
              color: COPPER_LIGHT,
              borderColor: COPPER_LINE,
              background:
                "linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.20))",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.08) inset,0 1px 4px rgba(0,0,0,0.35)",
            }}
          >
            ESTABLISHED 2005
          </span>
        </div>
      </div>
    </div>
  );
}

const SIZES = {
  xs: {
    padding: "p-1.5 pr-3",
    logoWrap: "h-9 w-9",
    title: "text-[13px]",
    subtitle: "text-[9.5px]",
    badge: "text-[8px]",
  },
  sm: {
    padding: "p-2 pr-3",
    logoWrap: "h-11 w-11",
    title: "text-[15px]",
    subtitle: "text-[10px]",
    badge: "text-[8.5px]",
  },
  md: {
    padding: "p-2.5 pr-4 sm:p-3 sm:pr-5",
    logoWrap: "h-14 w-14 sm:h-[64px] sm:w-[64px]",
    title: "text-[18px] sm:text-[22px]",
    subtitle: "text-[11px] sm:text-[12px]",
    badge: "text-[9.5px] sm:text-[10.5px]",
  },
  lg: {
    padding: "p-3 pr-5 sm:p-4 sm:pr-7",
    logoWrap: "h-16 w-16 sm:h-[80px] sm:w-[80px]",
    title: "text-[22px] sm:text-[30px] md:text-[34px]",
    subtitle: "text-[12px] sm:text-sm",
    badge: "text-[10.5px] sm:text-[12px]",
  },
  xl: {
    padding: "p-4 pr-8",
    logoWrap: "h-[84px] w-[84px]",
    title: "text-[32px] xl:text-[36px]",
    subtitle: "text-[13px] xl:text-[14px]",
    badge: "text-[11px] xl:text-[12.5px]",
  },
} as const;