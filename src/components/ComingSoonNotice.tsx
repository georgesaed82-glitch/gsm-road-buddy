import { GsmPlus } from "@/components/GsmPlus";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

/**
 * Reusable GSM Plus+ coming-soon notice.
 * Use in any card, dialog, or page where the learner portal is referenced
 * while the full system is still being built.
 */
export function ComingSoonNotice({
  showTitle = true,
  compact = false,
  className = "",
}: {
  showTitle?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-accent/40 bg-gradient-to-br from-secondary/40 to-background p-6 text-center shadow-[0_18px_45px_-32px_rgba(29,42,34,0.35)] sm:p-8 ${className}`}
    >
      {showTitle && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <GsmPlus className="text-2xl sm:text-3xl" gsmClassName="text-primary" />
          <Badge
            variant="secondary"
            className="rounded-full border border-accent/50 bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground shadow-sm"
          >
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            Coming Soon
          </Badge>
        </div>
      )}
      <h3
        className={`font-display font-bold leading-tight text-foreground ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}
      >
        GSM PLUS+ — COMING SOON
      </h3>
      <p
        className={`mx-auto mt-3 max-w-2xl leading-relaxed text-muted-foreground ${compact ? "text-sm" : "text-base sm:text-lg"}`}
      >
        Our new premium learner portal is currently under development. It will include lesson
        progress, theory training, hazard perception, mock tests, driving animations, reference
        points and personalised learning support.
      </p>
      <p
        className={`mx-auto mt-4 max-w-2xl font-medium text-foreground ${compact ? "text-sm" : "text-base"}`}
      >
        GSM Plus+ is not fully available yet. Please check back soon.
      </p>
    </div>
  );
}
