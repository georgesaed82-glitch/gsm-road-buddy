import { cn } from "@/lib/utils";

type Variant = "inline" | "pill";

/**
 * GSM Plus brand lockup. "GSM" is bold and cream/foreground-forward,
 * "PLUS+" is rendered in the accent gold to signal the premium learner tier.
 *
 * variant="inline" — standalone text lockup (default)
 * variant="pill"   — compact gold-outlined pill, good for eyebrows / badges
 */
export function GsmPlus({
  variant = "inline",
  className,
  gsmClassName,
  plusClassName,
}: {
  variant?: Variant;
  className?: string;
  gsmClassName?: string;
  plusClassName?: string;
}) {
  if (variant === "pill") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-accent/50 bg-accent/10 px-2.5 py-0.5 font-display text-[11px] font-semibold uppercase tracking-[0.18em]",
          className,
        )}
      >
        <span className={cn("text-foreground", gsmClassName)}>GSM</span>
        <span className={cn("font-bold text-accent", plusClassName)}>PLUS+</span>
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-baseline gap-1 font-display", className)}>
      <span className={cn("font-bold tracking-tight", gsmClassName)}>GSM</span>
      <span className={cn("font-semibold tracking-wide text-accent", plusClassName)}>PLUS+</span>
    </span>
  );
}
