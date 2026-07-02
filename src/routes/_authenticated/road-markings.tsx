import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { roadMarkings, markingGroups } from "@/data/roadMarkings";
import { OfflineDownloadButton } from "@/components/OfflineDownloadButton";

export const Route = createFileRoute("/_authenticated/road-markings")({
  head: () => ({
    meta: [
      { title: "Road markings — GSM Learner Portal" },
      { name: "description", content: "Every UK road marking explained — centre lines, hazard lines, double whites, zig-zags, yellow lines and red routes." },
    ],
  }),
  component: RoadMarkingsPage,
});

function RoadMarkingsPage() {
  return (
    <PortalShell eyebrow="Highway Code" title="Road markings">
      <p className="max-w-2xl text-muted-foreground">
        Painted markings carry the same authority as signs. Get every one of these on sight — they are worth easy marks on theory and confidence on your practical.
      </p>

      <OfflineDownloadButton
        className="mt-6"
        sectionKey="road-markings"
        label="road markings guide"
        urls={["/road-markings"]}
      />

      <div className="mt-10 space-y-14">
        {markingGroups.map((group) => {
          const items = roadMarkings.filter((m) => m.group === group.slug);
          return (
            <section key={group.slug}>
              <div className="flex items-baseline gap-3">
                <h2 className="font-display text-2xl leading-tight sm:text-3xl">{group.title}</h2>
                <span className="text-sm text-muted-foreground">{items.length}</span>
              </div>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{group.blurb}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((m) => {
                  const Visual = m.Visual;
                  return (
                    <article key={m.id} className="border border-border bg-card p-4">
                      <div className="mx-auto w-40 max-w-full">
                        <div className="aspect-square overflow-hidden border border-border">
                          <Visual />
                        </div>
                      </div>
                      <h3 className="mt-4 font-display text-lg leading-tight">{m.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{m.meaning}</p>
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