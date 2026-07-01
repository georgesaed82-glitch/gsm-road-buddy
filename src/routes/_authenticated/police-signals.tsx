import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { policeSignals, signalGroups } from "@/data/policeSignals";

export const Route = createFileRoute("/_authenticated/police-signals")({
  head: () => ({
    meta: [
      { title: "Police hand signals — GSM Learner Portal" },
      { name: "description", content: "Signals given by police, traffic officers, HATOs, DVSA examiners and school-crossing patrols — with clear illustrations and what each one means." },
    ],
  }),
  component: PoliceSignalsPage,
});

function PoliceSignalsPage() {
  return (
    <PortalShell eyebrow="Highway Code" title="Police & authorised person signals">
      <p className="max-w-2xl text-muted-foreground">
        You must obey signals given by police officers, traffic officers, Highways Agency officers, DVSA examiners and school-crossing patrols. Learn the arm positions — they will come up in the theory test and in real life.
      </p>

      <div className="mt-10 space-y-14">
        {signalGroups.map((group) => {
          const items = policeSignals.filter((s) => s.group === group.slug);
          return (
            <section key={group.slug}>
              <h2 className="font-display text-2xl leading-tight sm:text-3xl">{group.title}</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{group.blurb}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((s) => {
                  const Visual = s.Visual;
                  return (
                    <article key={s.id} className="border border-border bg-card p-4">
                      <div className="mx-auto w-40 max-w-full">
                        <div className="aspect-square overflow-hidden border border-border">
                          <Visual />
                        </div>
                      </div>
                      <h3 className="mt-4 font-display text-lg leading-tight">{s.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{s.meaning}</p>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </PortalShell>
  );
}