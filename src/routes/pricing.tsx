import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, CreditCard, CalendarX, MessageCircle } from "lucide-react";

const TITLE = "Driving Lesson Prices West London | GSM Driving School";
const DESC =
  "Our prices range from £45–£70 per hour, depending on the instructor’s experience and your area. Two-hour lessons, paid in advance, 48 hours’ cancellation notice.";

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
  {
    icon: Clock,
    label: "2-hour lessons",
    text: "All lessons are two hours long and must be paid for in advance at the time of booking.",
  },
  {
    icon: CreditCard,
    label: "Payment in advance when booking",
    text: "All lessons are two hours long and must be paid for in advance at the time of booking.",
  },
  {
    icon: CalendarX,
    label: "48-hour cancellation notice",
    text: "Our cancellation policy requires at least 48 hours’ notice to cancel or reschedule a lesson.",
  },
];

function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-center font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
        Driving Lesson Prices
      </h1>

      <section className="box-3d mt-8 rounded-3xl bg-primary px-5 py-8 text-center text-primary-foreground sm:px-10 sm:py-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Standard price range</p>
        <p className="mt-2 font-display text-5xl font-extrabold leading-none sm:text-7xl">£45–£70</p>
        <p className="mt-1 text-xl font-bold sm:text-2xl">per hour</p>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg">
          Our prices range from £45–£70 per hour, depending on the instructor’s experience and your area.
        </p>
      </section>

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
        <p>All lessons are two hours long and must be paid for in advance at the time of booking.</p>
        <p>Our cancellation policy requires at least 48 hours’ notice to cancel or reschedule a lesson.</p>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/contact"
          className="btn-3d inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-bold text-primary-foreground"
        >
          <MessageCircle className="h-5 w-5" /> Ask about lessons
        </Link>
      </div>
    </main>
  );
}
