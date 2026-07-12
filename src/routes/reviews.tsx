import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Star, ArrowLeft, Search, ExternalLink, Instagram, Facebook } from "lucide-react";
import { reviews } from "@/data/reviews";
import { useContentOverrides } from "@/hooks/useContentOverrides";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listReviews } from "@/lib/local-content.functions";
import { useSiteRating } from "@/hooks/useSiteRating";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — GSM Driving School (143 five-star Google reviews)" },
      {
        name: "description",
        content:
          "Read 143 verified five-star Google reviews from GSM Driving School learners across Notting Hill, Holland Park, Kensington and West London.",
      },
      { property: "og:title", content: "143 five-star Google reviews — GSM Driving School" },
      {
        property: "og:description",
        content:
          "Real student stories from West London first-time passes, intensive courses and refresher lessons. Rated 5.0 from 143 Google reviews.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "143 five-star Google reviews — GSM Driving School" },
      {
        name: "twitter:description",
        content:
          "Real student stories from West London first-time passes, intensive courses and refresher lessons. Rated 5.0 from 143 Google reviews.",
      },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(18);
  const rating = useSiteRating();
  const { get } = useContentOverrides();
  const listFn = useServerFn(listReviews);
  const { data: dbRows } = useQuery({
    queryKey: ["reviews-public"],
    queryFn: () => listFn(),
  });

  const source = useMemo(() => {
    const enabled = (dbRows ?? []).filter((r) => r.enabled);
    if (enabled.length > 0) {
      return enabled.map((r) => ({ name: r.name, note: r.note, quote: r.quote }));
    }
    return reviews;
  }, [dbRows]);

  const merged = useMemo(
    () =>
      source.map((r, i) => {
        const o = get("review", `r-${i}`);
        if (!o) return r;
        return {
          name: o.name ?? r.name,
          note: o.description ?? r.note,
          quote: o.data?.blocks?.[0]?.body ?? r.quote,
        };
      }),
    [get, source],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return merged;
    return merged.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.note.toLowerCase().includes(q) ||
        r.quote.toLowerCase().includes(q),
    );
  }, [query, merged]);

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
            {source.length} five-star reviews from West London learners.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-primary-foreground/80">
            Verified students from Notting Hill, Holland Park, Kensington and beyond. First-time
            passes, refreshers, intensive courses and international licence conversions.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <a
              href="https://www.google.com/maps/search/?api=1&query=GSM+Driving+School+71+Sandbourne+House+London+W11+1DS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-medium text-accent-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-lg active:translate-y-0"
            >
              <ExternalLink className="h-4 w-4" />
              Read &amp; post on Google
            </a>
            <a
              href="https://www.instagram.com/gsm_driving_school_/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-background px-6 text-sm font-medium text-primary shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-accent/5 hover:shadow-lg active:translate-y-0"
            >
              <Instagram className="h-4 w-4 text-accent" />
              Comments on Instagram
            </a>
            <a
              href="https://www.facebook.com/search/top?q=gsm%20driving%20school%20london"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-background px-6 text-sm font-medium text-primary shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-accent/5 hover:shadow-lg active:translate-y-0"
            >
              <Facebook className="h-4 w-4 text-accent" />
              Reviews on Facebook
            </a>
          </div>

          <div className="mt-10 grid max-w-3xl grid-cols-3 gap-6 border-t border-primary-foreground/15 pt-8">
            <Stat value={rating.rating.toFixed(1)} label="Google rating" />
            <Stat value={String(rating.review_count)} label="Reviews on Google" />
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

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">No reviews match "{query}".</p>
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
