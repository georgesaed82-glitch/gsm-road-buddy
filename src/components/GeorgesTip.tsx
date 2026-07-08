import { GraduationCap } from "lucide-react";
import type { ReactNode } from "react";

export function GeorgesTip({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="my-4 border-l-4 border-accent bg-accent/5 p-4 text-sm">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        <GraduationCap className="h-4 w-4" />
        George's Tip{" "}
        {title ? (
          <span className="text-muted-foreground normal-case tracking-normal">— {title}</span>
        ) : null}
      </div>
      <div className="mt-2 text-foreground leading-relaxed">{children}</div>
      <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        Draft — George to edit into his own voice
      </div>
    </aside>
  );
}
