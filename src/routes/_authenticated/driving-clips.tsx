import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { ClipShell } from "@/components/driving-clips/ClipShell";
import { drivingClips } from "@/components/driving-clips/clips";
import { drivingLessons } from "@/data/drivingLessons";

export const Route = createFileRoute("/_authenticated/driving-clips")({
  head: () => ({
    meta: [
      { title: "Animated driving clips · GSM" },
      { name: "description", content: "Short animated diagrams for common UK driving scenarios — turning right, roundabouts, zebra crossings, smart motorways and more." },
    ],
  }),
  component: DrivingClipsPage,
});

function DrivingClipsPage() {
  return (
    <PortalShell eyebrow="Practical" title="Animated driving clips">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Short top-down animations for the trickiest bits of UK driving. Play,
        pause, restart. Each clip is a working diagram tied to the relevant
        Highway Code rules — treat them as a teaching aid, not a replacement
        for on-road tuition.
      </p>

      {drivingLessons.length > 0 && (
        <div className="mt-8 rounded-xl border-2 border-accent bg-accent/5 p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent">
            <Sparkles className="h-4 w-4" /> Full GSM lessons
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            New format: Objective → THINK → Rule → Why → George Explains → Mistakes → Tips → Takeaway.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {drivingLessons.map((l) => (
              <Link
                key={l.slug}
                to="/driving-clips/$slug"
                params={{ slug: l.slug }}
                className="group flex items-center justify-between gap-2 rounded-md border border-border bg-card p-3 text-sm transition-colors hover:border-accent"
              >
                <span>
                  <span className="block font-display text-base">{l.title}</span>
                  <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">
                    {l.rule ?? l.category}
                  </span>
                </span>
                <span className="text-accent group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {drivingClips.map((clip) => (
          <div key={clip.slug} id={clip.slug} className="scroll-mt-24">
            <ClipShell
              title={clip.title}
              rule={clip.rule}
              beats={clip.beats}
              render={clip.render}
              durationMs={clip.durationMs}
            />
          </div>
        ))}
      </div>
    </PortalShell>
  );
}