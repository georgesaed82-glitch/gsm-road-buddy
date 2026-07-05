import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { areas } from "@/data/areas";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listAreas } from "@/lib/local-content.functions";

export const Route = createFileRoute("/areas/")({
  head: () => ({
    meta: [
      { title: "West London Driving Lesson Areas | GSM Driving School" },
      { name: "description", content: "GSM Driving School covers Notting Hill, Kensington, Holland Park, Bayswater, Shepherd's Bush, Chiswick and Fulham. Find driving lessons in your postcode." },
      { property: "og:title", content: "West London Driving Lesson Areas | GSM Driving School" },
      { property: "og:description", content: "Driving lessons across W2, W4, W8, W10, W11, W12, W14 and SW6. Local instructor, manual & automatic." },
      { property: "og:url", content: "https://www.gsmdrivingschool.com/areas" },
    ],
    links: [{ rel: "canonical", href: "https://www.gsmdrivingschool.com/areas" }],
  }),
  component: AreasIndex,
});

function AreasIndex() {
  const listFn = useServerFn(listAreas);
  const { data: dbRows } = useQuery({ queryKey: ["areas-public"], queryFn: () => listFn() });
  const enabled = (dbRows ?? []).filter((r) => r.enabled);
  const list =
    enabled.length > 0
      ? enabled.map((r) => ({ slug: r.slug, area: r.area, postcode: r.postcode }))
      : areas;
  return (
    <div className="flex flex-col">
      <section className="bg-secondary/40 py-10 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Areas we cover</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            DVSA-approved driving lessons across West London. Pick your area for postcode-specific lesson info, routes and FAQs.
          </p>
        </div>
      </section>
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3">
            {list.map((a) => (
              <Link
                key={a.slug}
                to="/areas/$area"
                params={{ area: a.slug }}
                className="group flex aspect-square flex-col justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/5"
              >
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {a.postcode}
                </div>
                <h2 className="font-display text-base font-semibold leading-tight group-hover:text-primary sm:text-lg">
                  {a.area}
                </h2>
                <span className="text-[11px] text-muted-foreground">Driving lessons →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}