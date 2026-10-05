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
      {
        name: "description",
        content:
          "GSM Driving School covers Notting Hill, Kensington, Holland Park, Bayswater, Shepherd's Bush, Chiswick and Fulham. Find driving lessons in your postcode.",
      },
      { property: "og:title", content: "West London Driving Lesson Areas | GSM Driving School" },
      {
        property: "og:description",
        content:
          "Driving lessons across W2, W4, W8, W10, W11, W12, W14 and SW6. Local instructor, manual & automatic.",
      },
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
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Areas we cover
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            DVSA-approved driving lessons across West London. Pick your area for postcode-specific
            lesson info, routes and FAQs.
          </p>
        </div>
      </section>
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
            {list.map((a) => {
              const name = a.slug === "kensington" ? "High Street Kensington" : a.area;
              return (
                <Link
                  key={a.slug}
                  to="/areas/$area"
                  params={{ area: a.slug }}
                  className="group flex min-h-[132px] flex-col justify-between rounded-2xl border-2 border-primary/25 bg-card p-4 shadow-[0_6px_0_0_var(--color-primary),0_14px_24px_-10px_rgba(19,56,46,0.45)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_0_0_var(--color-primary),0_20px_30px_-12px_rgba(19,56,46,0.5)] active:translate-y-1 active:shadow-[0_2px_0_0_var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold tracking-wide text-primary-foreground">
                    <MapPin className="h-3 w-3" />
                    {a.postcode}
                  </span>
                  <h2 className="mt-3 font-display text-base font-semibold leading-tight text-foreground sm:text-lg">
                    {name}
                  </h2>
                  <span className="mt-2 text-xs font-medium text-primary">Driving lessons →</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 rounded-2xl border-2 border-primary/25 bg-secondary/50 p-5 shadow-[0_6px_0_0_var(--color-primary)] sm:p-6">
            <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">
              Nearby areas — we can still pick you up
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Live just outside our main areas, such as South Kensington? No problem. We pick up
              students from neighbouring areas too — we simply agree a convenient meeting point
              between us so your lesson starts on time.
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Ask about a meeting point
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
