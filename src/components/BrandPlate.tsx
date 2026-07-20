import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import gsmLogo from "@/assets/gsm-logo.jpeg.asset.json";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

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
  rightSlot,
  fill = false,
  homeLink = false,
}: {
  size?: Size;
  className?: string;
  rightSlot?: ReactNode;
  fill?: boolean;
  homeLink?: boolean;
}) {
  const s = SIZES[size];
  const BrandInner = (
    <>
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

      <div className={cn("relative min-w-0 leading-[1.05]", fill && "flex-1")}>
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
              "inline-flex items-center rounded-md border font-semibold tracking-[0.18em]",
              s.badge,
              s.badgePadding ?? "px-2 py-[2px]",
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
    </>
  );

  return (
    <div
      className={cn(
        "relative isolate inline-flex items-center gap-2.5 sm:gap-3.5",
        fill && "flex w-full",
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

      {homeLink ? (
        <Link
          to="/"
          aria-label="GSM Driving School — home"
          className={cn(
            "relative flex items-center gap-2.5 sm:gap-3.5 rounded-[18px] outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
            fill && "flex-1 min-w-0",
          )}
        >
          {BrandInner}
        </Link>
      ) : (
        BrandInner
      )}

      {rightSlot ? (
        <div className="relative ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          {rightSlot}
        </div>
      ) : null}
    </div>
  );
}

const SIZES = {
  xs: {
    padding: "p-1 pr-2.5",
    logoWrap: "h-8 w-8",
    title: "text-[12px]",
    subtitle: "text-[9px]",
    badge: "text-[7.5px]",
  },
  sm: {
    padding: "p-1.5 pr-3",
    logoWrap: "h-10 w-10",
    title: "text-[14px]",
    subtitle: "text-[9.5px]",
    badge: "text-[8px]",
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
  hero: {
    padding: "px-6 py-4 pr-8 lg:px-8 lg:py-5 lg:pr-10 xl:px-10 xl:py-6 xl:pr-12",
    logoWrap: "h-[92px] w-[92px] lg:h-[112px] lg:w-[112px] xl:h-[128px] xl:w-[128px]",
    title:
      "text-[38px] lg:text-[52px] xl:text-[64px] 2xl:text-[72px] leading-[1] tracking-[-0.025em]",
    subtitle: "text-[15px] lg:text-[18px] xl:text-[20px]",
    badge: "text-[12px] lg:text-[14px] xl:text-[15px]",
  },
} as const;