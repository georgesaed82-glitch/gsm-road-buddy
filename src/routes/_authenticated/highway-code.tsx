import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { theoryCategories } from "@/data/theory";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/highway-code")({
  head: () => ({ meta: [{ title: "Highway Code · GSM" }] }),
  component: HighwayCodePage,
});

function HighwayCodePage() {
  return (
    <PortalShell eyebrow="Reference" title="The Highway Code — key points">
      <p className="max-w-2xl text-sm text-muted-foreground">
        The essentials from all 14 DVSA topics, distilled into the things you
        actually need to remember. Skim before a lesson, revise before a test.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {theoryCategories.map((c) => (
          <div key={c.slug} className="border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5 text-accent" />
              {c.topics.join(" · ")}
            </div>
            <h3 className="mt-2 font-display text-xl">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {c.keyPoints.map((p, i) => (
                <li key={i} className="flex gap-2 leading-relaxed">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}