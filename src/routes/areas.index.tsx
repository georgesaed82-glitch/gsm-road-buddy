import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { areas } from "@/data/areas";

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
  return (
    <div className="flex flex-col">
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Areas we cover</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            DVSA-approved driving lessons across West London. Pick your area for postcode-specific lesson info, routes and FAQs.
          </p>
        </div>
      </section>
      <section className="py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((a) => (
              <Link
                key={a.slug}
                to="/areas/$area"
                params={{ area: a.slug }}
                className="group rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/5"
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {a.postcode}
                </div>
                <h2 className="mt-3 font-display text-2xl font-semibold group-hover:text-primary">
                  Driving Lessons in {a.area}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{a.intro}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}