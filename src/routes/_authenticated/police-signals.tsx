import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { policeSignals, signalGroups } from "@/data/policeSignals";
import { OfflineDownloadButton } from "@/components/OfflineDownloadButton";

export const Route = createFileRoute("/_authenticated/police-signals")({
  head: () => ({
    meta: [
      { title: "Arm signals — police, HATOs & drivers | GSM Learner Portal" },
      { name: "description", content: "Realistic Highway Code illustrations of every hand signal you need — police officers and authorised persons directing traffic, plus the three driver arm signals from rule 103." },
    ],
  }),
  component: PoliceSignalsPage,
});

function PoliceSignalsPage() {
  return (
    <PortalShell eyebrow="Highway Code" title="Arm signals — police, HATOs & drivers">
      <p className="max-w-2xl text-muted-foreground">
        You must obey signals given by police officers, traffic officers, Highways Agency officers, DVSA examiners and school-crossing patrols. You also need to know the three arm signals you can give from your own vehicle. All of these come up in the theory test and in real life.
      </p>

      <OfflineDownloadButton
        className="mt-6"
        sectionKey="police-signals"
        label="arm signals guide"
        urls={["/police-signals"]}
      />

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