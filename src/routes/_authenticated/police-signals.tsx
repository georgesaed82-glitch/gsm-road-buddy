import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { policeSignals, signalGroups } from "@/data/policeSignals";
import type { PoliceSignal, SignalGroup } from "@/data/policeSignals";
import type { ReactElement } from "react";
import { OfflineDownloadButton } from "@/components/OfflineDownloadButton";
import { useContentOverrides } from "@/hooks/useContentOverrides";

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
  const { applyText, get, isEnabled, sortOrder, customItems } = useContentOverrides();
  const baseItems = applyText("signal", policeSignals);
  const emptyVisual = (() => null) as unknown as () => ReactElement;
  const customList: PoliceSignal[] = customItems("signal").map((r) => ({
    id: r.item_id,
    name: r.name ?? "Custom signal",
    meaning: r.description ?? "",
    group: (signalGroups.some((g) => g.slug === r.group_slug)
      ? (r.group_slug as SignalGroup)
      : "stop"),
    Visual: emptyVisual,
  }));
  const items = [...baseItems, ...customList]
    .filter((s) => isEnabled("signal", s.id))
    .sort((a, b) => sortOrder("signal", a.id) - sortOrder("signal", b.id));
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
          const groupItems = items.filter((s) => s.group === group.slug);
          return (
            <section key={group.slug}>
              <h2 className="font-display text-2xl leading-tight sm:text-3xl">{group.title}</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{group.blurb}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groupItems.map((s) => {
                  const Visual = s.Visual;
                  const img = get("signal", s.id)?.image_url ?? null;
                  return (
                    <article key={s.id} className="border border-border bg-card p-4">
                      <div className="mx-auto w-40 max-w-full">
                        <div className="aspect-square overflow-hidden border border-border">
                          {img ? (
                            <img src={img} alt={s.name} className="h-full w-full object-cover" />
                          ) : (
                            <Visual />
                          )}
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