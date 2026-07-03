import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { ClipShell } from "@/components/driving-clips/ClipShell";
import { drivingClips } from "@/components/driving-clips/clips";

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