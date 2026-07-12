import gsmLogo from "@/assets/gsm-logo.jpeg.asset.json";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

/**
 * Premium 3D brand plate: deep forest-green rounded rectangle with a
 * copper/gold border, the circular GSM logo on the left, and the
 * "GSM DRIVING SCHOOL" lockup on the right. Fully responsive — scales
 * cleanly from a mobile header to a large hero panel.
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
        "rounded-[22px] sm:rounded-[26px]",
        "border border-[hsl(var(--brand-copper)/0.85)]",
        "shadow-[0_10px_30px_-14px_rgba(0,0,0,0.55),0_2px_0_0_rgba(255,255,255,0.06)_inset]",
        s.padding,
        className,
      )}
      style={{
        background:
          "linear-gradient(180deg,#2a5a3f 0%,#1f4530 55%,#173525 100%)",
      }}
    >
      {/* Inner copper hairline for the double-bevel look */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[3px] rounded-[18px] sm:rounded-[22px] ring-1 ring-[hsl(var(--brand-copper)/0.55)]"
      />
      {/* Top light glaze */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-3 top-1 h-[38%] rounded-t-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0)_100%)]"
      />

      {/* Circular logo (kept, not replaced) */}
      <span
        className={cn(
          "relative shrink-0 rounded-full",
          "ring-2 ring-[hsl(var(--brand-copper))]",
          "shadow-[0_4px_10px_-2px_rgba(0,0,0,0.6)]",
          s.logoWrap,
        )}
        style={{
          background:
            "radial-gradient(circle at 30% 30%,#2f6446 0%,#1c3f2c 70%)",
        }}
      >
        <img
          src={gsmLogo.url}
          alt="GSM Driving School logo"
          className={cn("h-full w-full rounded-full object-cover", s.logoImg)}
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
              color: "hsl(var(--brand-copper))",
              textShadow:
                "0 1px 0 rgba(0,0,0,0.45),0 2px 6px rgba(0,0,0,0.35)",
            }}
          >
            DRIVING SCHOOL
          </span>
        </div>

        <div
          aria-hidden
          className={cn(
            "my-1 h-px w-full",
            "bg-[linear-gradient(90deg,transparent,hsl(var(--brand-copper)/0.75),transparent)]",
          )}
        />

        <div className={cn("font-medium tracking-wide text-white/90", s.subtitle)}>
          George School of Motoring
        </div>

        <div className={cn("mt-1.5", s.badgeWrap)}>
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-[2px] font-semibold tracking-[0.18em]",
              s.badge,
            )}
            style={{
              color: "hsl(var(--brand-copper))",
              borderColor: "hsl(var(--brand-copper) / 0.7)",
              background:
                "linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.15))",
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
  sm: {
    padding: "p-2 pr-3",
    logoWrap: "h-11 w-11",
    logoImg: "",
    title: "text-[15px]",
    subtitle: "text-[10px]",
    badgeWrap: "",
    badge: "text-[8.5px]",
  },
  md: {
    padding: "p-2.5 pr-4 sm:p-3 sm:pr-5",
    logoWrap: "h-14 w-14 sm:h-[64px] sm:w-[64px]",
    logoImg: "",
    title: "text-[18px] sm:text-[22px]",
    subtitle: "text-[11px] sm:text-[12px]",
    badgeWrap: "",
    badge: "text-[9.5px] sm:text-[10.5px]",
  },
  lg: {
    padding: "p-3 pr-5 sm:p-4 sm:pr-7",
    logoWrap: "h-16 w-16 sm:h-[80px] sm:w-[80px]",
    logoImg: "",
    title: "text-[22px] sm:text-[30px] md:text-[34px]",
    subtitle: "text-[12px] sm:text-sm",
    badgeWrap: "",
    badge: "text-[10.5px] sm:text-[12px]",
  },
} as const;