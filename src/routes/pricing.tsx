import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Mail, Phone, Cog, MapPin, Award, Package } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { trackContactClick } from "@/lib/trackContactClick";
import { listPackages, type PackageRow } from "@/lib/catalog.functions";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing | GSM Driving School" },
      {
        name: "description",
        content:
          "Flexible driving lesson packages at GSM Driving School. Single lessons, 12-hour blocks, intensive, weekend, refresher and Pass Plus courses.",
      },
      {
        property: "og:title",
        content: "Pricing | GSM Driving School",
      },
      {
        property: "og:description",
        content: "Flexible driving lesson packages tailored to your goals.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const listFn = useServerFn(listPackages);
  const { data: packages = [] } = useQuery<PackageRow[]>({
    queryKey: ["packages-public"],
    queryFn: () => listFn(),
    staleTime: 5 * 60_000,
  });
  const visible = packages.filter((p) => p.enabled);
  const { business } = useSiteSettings();
  const waHref = `https://wa.me/${business.phone_intl}`;
  const emailHref = `mailto:${business.email}`;
  return (
    <div className="flex flex-col">
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Lesson packages
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Flexible driving lesson packages tailored to your goals. No hidden fees.
          </p>

          {/* Transparent pricing band */}
          <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-border/60 bg-card p-6 shadow-lg sm:p-8">
            <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.22em] text-accent">
              <span className="h-px w-6 bg-accent" />
              Lesson prices from
              <span className="h-px w-6 bg-accent" />
            </div>
            <div className="mt-3 flex items-baseline justify-center gap-2">
              <span className="font-display text-5xl font-semibold text-primary sm:text-6xl">£45</span>
              <span className="font-display text-2xl text-muted-foreground">–</span>
              <span className="font-display text-5xl font-semibold text-primary sm:text-6xl">£75</span>
              <span className="ml-1 text-sm font-medium text-muted-foreground">/ hour</span>
            </div>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
              Prices vary based on the four factors below. Message us and we&apos;ll give you an
              exact quote for your lessons within minutes.
            </p>
            <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
              {[
                { icon: Award, title: "Instructor grade", body: "PDI, ADI, or senior ADI with 20+ years of West London experience." },
                { icon: Cog, title: "Manual or automatic", body: "Automatic lessons are priced slightly higher due to demand." },
                { icon: Package, title: "Lesson package", body: "Blocks of 10, 20 or intensive courses reduce the hourly rate." },
                { icon: MapPin, title: "Pickup location", body: "Central West London postcodes vs. wider catchment." },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-primary">{f.title}</div>
                      <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{f.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild className="h-11 gap-2">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackContactClick("whatsapp", "Pricing band")}
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  WhatsApp for a quote
                </a>
              </Button>
              <Button asChild variant="outline" className="h-11 gap-2">
                <a href={emailHref} onClick={() => trackContactClick("email", "Pricing band")}>
                  <Mail className="h-4 w-4" />
                  Email us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((pkg) => (
              <Card
                key={pkg.id}
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
                    <span className="text-4xl font-bold text-foreground">{pkg.duration}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 shrink-0 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-col gap-2">
                    <Button
                      asChild
                      variant={pkg.popular ? "default" : "outline"}
                      className="w-full gap-2"
                    >
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackContactClick("whatsapp", pkg.name)}
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                        {pkg.cta_label || "WhatsApp us"}
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full gap-2 text-muted-foreground hover:text-primary"
                    >
                      <a href={emailHref} onClick={() => trackContactClick("email", pkg.name)}>
                        <Mail className="h-4 w-4" />
                        Email us
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 rounded-lg border border-border bg-card p-8 text-center sm:p-10">
            <h3 className="font-display text-2xl font-semibold text-foreground">
              Need pricing details?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Every learner is different. Call or email us for a personalised quote based on your
              experience and goals.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild variant="outline" className="h-11 gap-2">
                <a href={waHref} onClick={() => trackContactClick("whatsapp", "Pricing CTA")}>
                  <Phone className="h-4 w-4" />
                  WhatsApp us
                </a>
              </Button>
              <Button asChild className="h-11 gap-2">
                <Link to="/contact" onClick={() => trackContactClick("email", "Pricing CTA")}>
                  <Mail className="h-4 w-4" />
                  Email us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
