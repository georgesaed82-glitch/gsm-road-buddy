import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing | GSM Driving School" },
      {
        name: "description",
        content: "Simple, transparent pricing for driving lessons and packages at GSM Driving School.",
      },
      {
        property: "og:title",
        content: "Pricing | GSM Driving School",
      },
      {
        property: "og:description",
        content: "Simple, transparent pricing for driving lessons and packages.",
      },
    ],
  }),
  component: PricingPage,
});

const packages = [
  {
    name: "Single lesson",
    price: "$55",
    period: "per hour",
    description: "Perfect for an assessment or refresher session.",
    features: [
      { label: "1 hour 1-to-1 tuition", included: true },
      { label: "Flexible location", included: true },
      { label: "Progress feedback", included: true },
      { label: "Discounted bulk rate", included: false },
    ],
    cta: "Book single lesson",
    popular: false,
  },
  {
    name: "10-hour starter",
    price: "$520",
    period: "one-time",
    description: "Save $30 and build solid foundations over 10 hours.",
    features: [
      { label: "10 hours 1-to-1 tuition", included: true },
      { label: "Flexible location", included: true },
      { label: "Progress feedback", included: true },
      { label: "$30 discount", included: true },
    ],
    cta: "Book starter package",
    popular: true,
  },
  {
    name: "20-hour pass-ready",
    price: "$980",
    period: "one-time",
    description: "Best value for learners aiming to pass confidently.",
    features: [
      { label: "20 hours 1-to-1 tuition", included: true },
      { label: "Mock test included", included: true },
      { label: "Progress feedback", included: true },
      { label: "$120 discount", included: true },
    ],
    cta: "Book pass-ready package",
    popular: false,
  },
];

function PricingPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Choose a package that fits your goals. No hidden fees.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {packages.map((pkg) => (
              <Card
                key={pkg.name}
                className={`relative border-border bg-card ${pkg.popular ? "ring-2 ring-primary" : ""}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </div>
                )}
                <CardHeader className="pb-4">
                  <h2 className="font-display text-xl font-semibold">{pkg.name}</h2>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{pkg.price}</span>
                    <span className="text-sm text-muted-foreground">/{pkg.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature.label}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        {feature.included ? (
                          <Check className="h-4 w-4 shrink-0 text-success" />
                        ) : (
                          <X className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                        )}
                        {feature.label}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="mt-6 w-full" variant={pkg.popular ? "default" : "outline"}>
                    <Link to="/booking">{pkg.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>
              Need a custom intensive course?{" "}
              <Link to="/contact" className="font-medium text-primary underline underline-offset-4">
                Contact us
              </Link>{" "}
              for a personalised quote.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
