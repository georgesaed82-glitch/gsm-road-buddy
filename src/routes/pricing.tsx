import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, CalendarX, Clock, Phone, HeartHandshake } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { TeamLessonPricing } from "@/components/TeamLessonPricing";
import { BUSINESS, GEORGE_AVAILABILITY, GEORGE_PRICES, TEAM_PRICE_SUMMARY } from "@/lib/business";

const TITLE = "Driving Lesson Prices West London | George's Automatic Lessons | GSM";
const DESC =
  "George's automatic driving lesson prices in West London: £70/hour weekdays or £780 for 12 hours, £80/hour weekends or £900 for 12 hours. Payment before lessons, 48 hours' notice.";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.gsmdrivingschool.com/pricing" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://www.gsmdrivingschool.com/pricing" }],
  }),
  component: PricingPage,
});

const TERMS = [
  { icon: CreditCard, label: "Payment before lessons" },
  { icon: CalendarX, label: "48 hours' notice to cancel or reschedule" },
  { icon: Clock, label: "Lesson length agreed when you book" },
];

function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
      <h1 className="text-center font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
        Driving Lesson Prices
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-center text-base text-muted-foreground sm:text-lg">
        {TEAM_PRICE_SUMMARY}
      </p>

      <section className="box-3d mt-8 rounded-3xl bg-primary px-5 py-7 text-primary-foreground sm:px-8 sm:py-9">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-accent">
          George's automatic prices
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {GEORGE_PRICES.map((p) => (
            <div key={p.label} className="rounded-2xl bg-primary-foreground/10 p-5 text-center ring-1 ring-primary-foreground/20">
              <p className="text-sm font-semibold uppercase tracking-wider">{p.label}</p>
              <p className="mt-1 font-display text-4xl font-extrabold leading-none sm:text-5xl">{p.price}</p>
              <p className="mt-1 text-lg font-bold">{p.unit}</p>
              <p className="mt-2 text-sm opacity-90">{p.note}</p>
            </div>
          ))}
        </div>
      </section>

      <TeamLessonPricing location="pricing_team" />

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {TERMS.map(({ icon: Icon, label }) => (
          <div key={label} className="box-3d flex items-center gap-3 rounded-2xl bg-card p-4 sm:flex-col sm:text-center">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
              <Icon className="h-5 w-5" />
            </span>
            <p className="text-lg font-bold leading-tight text-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="box-3d mt-8 space-y-3 rounded-2xl bg-card p-5 text-base leading-relaxed text-foreground sm:p-6 sm:text-lg">
        <p>Lessons are paid for before they take place. Packages are paid in advance.</p>
        <p>Our cancellation policy requires at least 48 hours' notice to cancel or reschedule a lesson.</p>
        <p>Lesson length is agreed when you book, and longer sessions are possible.</p>
        <p className="text-muted-foreground">{GEORGE_AVAILABILITY}</p>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href={`tel:+${BUSINESS.phoneIntl}`}
          data-track-location="pricing"
          className="btn-3d inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-bold text-primary-foreground"
        >
          <Phone className="h-5 w-5" /> Call George
        </a>
        <a
          href={`https://wa.me/${BUSINESS.phoneIntl}`}
          target="_blank"
          rel="noopener noreferrer"
          data-track-location="pricing"
          className="btn-3d inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-bold text-accent-foreground"
        >
          <WhatsAppIcon className="h-5 w-5" /> WhatsApp George
        </a>
      </div>
      <p className="mt-6 text-center">
        <Link to="/how-i-teach" className="inline-flex items-center gap-2 font-semibold text-primary underline underline-offset-4">
          <HeartHandshake className="h-4 w-4" /> How George teaches
        </Link>
      </p>
    </main>
  );
}
