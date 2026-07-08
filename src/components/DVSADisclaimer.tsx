import { Info } from "lucide-react";

/**
 * Independent-content disclaimer required on every screen that shows theory
 * questions, sign audits or Highway Code learning material.
 *
 * Wording is set here so a single edit updates every placement.
 */
export const DVSA_DISCLAIMER_TEXT =
  "This app is an independent learning resource for UK driving theory. It is not affiliated with or endorsed by the Driver and Vehicle Standards Agency (DVSA). All questions have been independently written using the current Highway Code and UK road traffic regulations as reference material.";

export function DVSADisclaimer({
  variant = "card",
}: {
  variant?: "card" | "inline" | "footer" | "compact";
}) {
  if (variant === "compact") {
    return (
      <p className="text-[10px] leading-relaxed opacity-70">
        Independent UK driving theory resource. Not affiliated with or endorsed by the DVSA.
      </p>
    );
  }
  if (variant === "footer") {
    return <p className="text-[11px] leading-relaxed opacity-70">{DVSA_DISCLAIMER_TEXT}</p>;
  }
  if (variant === "inline") {
    return <p className="text-xs text-muted-foreground leading-relaxed">{DVSA_DISCLAIMER_TEXT}</p>;
  }
  return (
    <div
      role="note"
      aria-label="Independent learning resource notice"
      className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>{DVSA_DISCLAIMER_TEXT}</p>
    </div>
  );
}
