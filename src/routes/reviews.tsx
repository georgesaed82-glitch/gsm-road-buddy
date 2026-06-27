import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Star, ArrowLeft, Search, ExternalLink, Instagram, Facebook } from "lucide-react";
import { reviews } from "@/data/reviews";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — GSM Driving School (111 five-star reviews)" },
      {
        name: "description",
        content:
          "Read 111 verified five-star reviews from GSM Driving School learners across Notting Hill, Holland Park, Kensington and West London.",
      },
      { property: "og:title", content: "111 five-star reviews — GSM Driving School" },
      {
        property: "og:description",
        content: "Real student stories from West London first-time passes, intensive courses and refresher lessons.",
      },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(18);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.note.toLowerCase().includes(q) ||
        r.quote.toLowerCase().includes(q),
    );
  }, [query]);

  const shown = filtered.slice(0, visible);

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-primary-foreground/70 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to home
          </Link>
          <div className="mt-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-accent">
            <span className="h-px w-8 bg-accent" />
            What learners say
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-medium leading-[1.05] sm:text-6xl">
            {reviews.length} five-star reviews from West London learners.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-primary-foreground/80">
            Verified students from Notting Hill, Holland Park, Kensington and beyond. First-time
            passes, refreshers, intensive courses and international licence conversions.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://www.google.com/maps/place/?q=place_id:ChIJ-bZmJfMPdkgRiuS70tXn6ao"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              <ExternalLink className="h-4 w-4" />
              Read & post reviews on Google
            </a>
            <a
              href="https://www.instagram.com/gsm_driving_school_/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-primary-foreground/30 px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Instagram className="h-4 w-4" />
              See comments on Instagram
            </a>
            <a
              href="https://www.facebook.com/search/top?q=gsm%20driving%20school%20london"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-primary-foreground/30 px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Facebook className="h-4 w-4" />
              See reviews on Facebook
            </a>
          </div>

          <div className="mt-10 grid max-w-3xl grid-cols-3 gap-6 border-t border-primary-foreground/15 pt-8">
            <Stat value="5.0" label="Google rating" />
            <Stat value="143" label="Reviews on Google" />
            <Stat value="20+ yrs" label="Teaching in W11" />
          </div>
        </div>
      </section>

      <section className="bg-muted">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisible(18);
                }}
                placeholder="Search reviews — name, keyword, location…"
                className="h-12 w-full min-w-0 border border-border bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent sm:w-96"
              />
            </div>
            <div className="shrink-0 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Showing {shown.length} of {filtered.length}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">
              No reviews match "{query}".
            </p>
          ) : (
            <div className="columns-1 gap-6 md:columns-2 lg:columns-3 [&>*]:mb-6 [&>*]:break-inside-avoid">
              {shown.map((r, i) => (
                <figure
                  key={`${r.name}-${i}`}
                  className="border border-border bg-card p-6 transition hover:border-accent/60"
                >
                  <div className="flex text-accent">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-accent" />
                    ))}
                  </div>
                  <blockquote className="mt-4 font-display text-base leading-snug text-foreground sm:text-lg">
                    "{r.quote}"
                  </blockquote>
                  <figcaption className="mt-5 border-t border-border pt-4">
                    <div className="text-sm font-medium text-foreground">{r.name}</div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {r.note}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

          {visible < filtered.length && (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + 24)}
                className="border border-foreground bg-foreground px-8 py-4 text-xs uppercase tracking-[0.22em] text-background transition hover:bg-foreground/90"
              >
                Load more reviews
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-medium sm:text-4xl">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-primary-foreground/60">
        {label}
      </div>
    </div>
  );
}