import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Star } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { trackContactClick } from "@/lib/trackContactClick";
import { useSiteRating } from "@/hooks/useSiteRating";
import { areas, getArea, type AreaPage } from "@/data/areas";
import { listAreas } from "@/lib/local-content.functions";
import { getSiteRating, type SiteRatingValue } from "@/lib/cms.functions";

async function resolveArea(slug: string): Promise<AreaPage & { _rating: SiteRatingValue }> {
  const fallbackRating: SiteRatingValue = { rating: 5.0, review_count: 147, show: true };
  let ratingVal: SiteRatingValue = fallbackRating;
  try {
    ratingVal = await getSiteRating();
  } catch {
    /* fall back */
  }
  try {
    const rows = await listAreas();
    const enabled = rows.filter((r) => r.enabled);
    const match = enabled.find((r) => r.slug === slug);
    if (match) {
      return {
        slug: match.slug,
        area: match.area,
        postcode: match.postcode,
        nearbyPostcodes: match.nearby_postcodes,
        intro: match.intro,
        highlights: match.highlights,
        routes: match.routes_text,
        faqs: match.faqs,
        _rating: ratingVal,
      };
    }
  } catch {
    // fall through to static
  }
  const staticMatch = getArea(slug);
  if (!staticMatch) throw notFound();
  return { ...staticMatch, _rating: ratingVal };
}

export const Route = createFileRoute("/areas/$area")({
  loader: ({ params }) => {
    return resolveArea(params.area);
  },
  head: ({ loaderData }) => {
    const a = loaderData;
    if (!a) return { meta: [] };
    const rv = a._rating ?? { rating: 5, review_count: 147 };
    const ratingLabel = `${rv.rating.toFixed(1)} from ${rv.review_count} Google reviews`;
    const isKen = a.slug === "kensington";
    const title = isKen
      ? "Driving Lessons in High Street Kensington (W8) | GSM Driving School"
      : `Driving Lessons ${a.area} (${a.postcode}) | GSM Driving School`;
    const description = isKen
      ? `Driving lessons in High Street Kensington (W8) since 2005. Manual or automatic, two-hour lessons, patient one-to-one tuition and an agreed High Street Kensington meeting point. Rated ${ratingLabel}.`
      : `Driving lessons in ${a.area} ${a.postcode}. DVSA-approved local instructor, manual & automatic, door-to-door pickup. Rated ${ratingLabel}.`;
    const url = `https://www.gsmdrivingschool.com/areas/${a.slug}`;
    return {
      meta: [
        ...(a.pendingConfirmation ? [{ name: "robots", content: "noindex, follow" }] : []),
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": `https://www.gsmdrivingschool.com/areas/${a.slug}#business`,
            name: `GSM Driving School — ${a.area}`,
            image: "https://www.gsmdrivingschool.com/og-image.jpg",
            url,
            telephone: "+447961585231",
            email: "gsmdrivingschool@outlook.com",
            priceRange: "££",
            address: {
              "@type": "PostalAddress",
              streetAddress: "71 Sandbourne House, Dartmouth Close",
              addressLocality: "London",
              postalCode: "W11 1DS",
              addressCountry: "GB",
            },
            areaServed: [a.postcode, ...a.nearbyPostcodes].map((pc) => ({
              "@type": "PostalCodeSpecification",
              postalCode: pc,
              addressCountry: "GB",
            })),
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: rv.rating.toFixed(1),
              reviewCount: String(rv.review_count),
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.gsmdrivingschool.com/" },
              { "@type": "ListItem", position: 2, name: "Areas we cover", item: "https://www.gsmdrivingschool.com/areas" },
              { "@type": "ListItem", position: 3, name: a.area, item: url },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: a.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: AreaPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl">Area not found</h1>
      <p className="mt-2 text-muted-foreground">
        We cover Notting Hill, Kensington, Holland Park, Bayswater, Shepherd's Bush, Chiswick and
        Fulham.
      </p>
      <Link to="/areas" className="mt-6 inline-block text-primary underline">
        See all areas
      </Link>
    </div>
  ),
});

function AreaPage() {
  const a = Route.useLoaderData() as AreaPage;
  const rating = useSiteRating();

  return (
    <div className="flex flex-col">
      <section className="bg-secondary/40 py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {a.postcode} · West London
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {a.slug === "kensington" ? "Driving lessons in High Street Kensington" : `Driving Lessons in ${a.area}`}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{a.intro}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span>
              Rated {rating.rating.toFixed(1)} from {rating.review_count} Google reviews
            </span>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-none bg-[#25D366] text-white hover:bg-[#1ebe57]"
            >
              <a
                href="https://wa.me/447961585231"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackContactClick("whatsapp", `Area page – ${a.area}`)}
              >
                <WhatsAppIcon className="mr-2 h-4 w-4" />
                WhatsApp 07961 585231
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-none">
              <a
                href="tel:+447961585231"
                onClick={() => trackContactClick("phone", `Area page – ${a.area}`)}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call 07961 585231
              </a>
            </Button>
          </div>
        </div>
      </section>

      {a.slug === "kensington" ? (
        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border-2 border-primary/25 bg-card p-5 shadow-[0_6px_0_0_var(--color-primary),0_14px_24px_-10px_rgba(19,56,46,0.45)] sm:p-8">
              <h2 className="font-display text-2xl font-semibold text-primary">
                Your driving lessons in High Street Kensington
              </h2>
              <p className="mt-3 text-muted-foreground">
                High Street Kensington is our main focus for new learners. We meet you at an agreed
                point in High Street Kensington (W8) and teach one-to-one from there, so you learn on
                the same busy West London roads you will drive on after your test.
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                <li className="rounded-xl border bg-background p-4"><strong className="text-foreground">Manual or automatic</strong><span className="block text-sm text-muted-foreground">Choose the car that suits you; both are available.</span></li>
                <li className="rounded-xl border bg-background p-4"><strong className="text-foreground">Two-hour lessons</strong><span className="block text-sm text-muted-foreground">Every lesson is two hours, paid in advance when you book.</span></li>
                <li className="rounded-xl border bg-background p-4"><strong className="text-foreground">Patient tuition</strong><span className="block text-sm text-muted-foreground">Calm, clear teaching for beginners and nervous learners alike.</span></li>
                <li className="rounded-xl border bg-background p-4"><strong className="text-foreground">Fair, simple prices</strong><span className="block text-sm text-muted-foreground">£45–£70 per hour with 48 hours' notice to cancel or reschedule.</span></li>
              </ul>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="btn-3d rounded-2xl bg-primary text-primary-foreground">
                  <a href="tel:+447961585231">Call 07961 585231</a>
                </Button>
                <Button asChild variant="outline" className="rounded-2xl border-2 border-primary">
                  <a href="https://wa.me/447961585231" target="_blank" rel="noopener noreferrer">WhatsApp us</a>
                </Button>
                <Button asChild variant="outline" className="rounded-2xl border-2 border-primary">
                  <Link to="/contact">Send an enquiry</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold">
            Why learners in {a.area} choose GSM
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {a.highlights.map((h) => (
              <li
                key={h}
                className="rounded-lg border  bg-card p-5 text-sm text-foreground box-3d"
              >
                {h}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-secondary/30 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold">Routes we practise in {a.area}</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            {a.routes}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {[a.postcode, ...a.nearbyPostcodes].map((pc) => (
              <span
                key={pc}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium"
              >
                <MapPin className="h-3 w-3" />
                {pc}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold">{a.area} driving lessons — FAQ</h2>
          <div className="mt-6 space-y-4">
            {a.faqs.map((f) => (
              <Card key={f.q} className="border-border">
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold">{f.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold">
            Book your first lesson in {a.area}
          </h2>
          <p className="mt-3 opacity-80">
            Message George on WhatsApp — usually answered the same day.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-none bg-[#25D366] text-white hover:bg-[#1ebe57]"
            >
              <a
                href="https://wa.me/447961585231"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackContactClick("whatsapp", `Area page CTA – ${a.area}`)}
              >
                <WhatsAppIcon className="mr-2 h-4 w-4" />
                WhatsApp now
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-none">
              <a
                href="mailto:gsmdrivingschool@outlook.com"
                onClick={() => trackContactClick("email", `Area page CTA – ${a.area}`)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email us
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-xl font-semibold">Other areas we cover</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {areas
              .filter((x) => x.slug !== a.slug && !x.pendingConfirmation)
              .map((x) => (
                <Link
                  key={x.slug}
                  to="/areas/$area"
                  params={{ area: x.slug }}
                  className="rounded-full border border-border bg-card px-4 py-1.5 text-sm hover:bg-accent/10"
                >
                  {x.area} ({x.postcode})
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
