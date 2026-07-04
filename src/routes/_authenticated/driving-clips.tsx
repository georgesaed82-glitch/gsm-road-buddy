import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { ClipShell } from "@/components/driving-clips/ClipShell";
import { drivingClips } from "@/components/driving-clips/clips";
import { drivingLessons } from "@/data/drivingLessons";
import { LessonPreview } from "@/components/driving-clips/LessonPreview";

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
        <section className="mt-8">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent">
            <Sparkles className="h-4 w-4" /> Full GSM lessons — {drivingLessons.length} animated
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every clip plays below. Tap any card to open the full lesson with George Explains, common mistakes, GSM tips and the interactive question.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {drivingLessons.map((l) => (
              <Link
                key={l.slug}
                to="/driving-clips/$slug"
                params={{ slug: l.slug }}
                className="group block overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-accent"
              >
                <LessonPreview render={l.render} durationMs={l.durationMs} />
                <div className="flex items-start justify-between gap-2 p-3">
                  <div>
                    <div className="font-display text-base leading-tight">{l.title}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {l.rule ?? l.category}
                    </div>
                  </div>
                  <span className="text-accent transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
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