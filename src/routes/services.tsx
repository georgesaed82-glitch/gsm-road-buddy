import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, ArrowRight, Car, Shield, FileCheck } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Driving Services | GSM Driving School" },
      {
        name: "description",
        content:
          "Beginner lessons, refresher courses, intensive courses, and test preparation from GSM Driving School.",
      },
      {
        property: "og:title",
        content: "Driving Services | GSM Driving School",
      },
      {
        property: "og:description",
        content: "Beginner lessons, refresher courses, intensive courses, and test preparation.",
      },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    icon: Car,
    title: "Beginner lessons",
    description:
      "Start from the basics in a dual-control car. Build clutch control, steering, and road awareness at your pace.",
    features: ["1-to-1 tuition", "Dual-control cars", "Pick-up from home or work"],
  },
  {
    icon: Shield,
    title: "Refresher courses",
    description:
      "Haven't driven in a while? Rebuild confidence on motorways, parking, and busy junctions.",
    features: ["Flexible hours", "Motorway practice", "Parking confidence"],
  },
  {
    icon: FileCheck,
    title: "Test preparation",
    description:
      "Mock tests, manoeuvre coaching, and last-minute tips to help you pass the practical driving test.",
    features: ["Mock test routes", "Show-me-tell-me questions", "Calm test-day coaching"],
  },
  {
    icon: ArrowRight,
    title: "Intensive courses",
    description:
      "Fast-track your learning with daily lessons. Ideal if you need to pass quickly or have a deadline.",
    features: ["Daily lessons", "Theory support", "Test booking help"],
  },
];

function ServicesPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Our services
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Driving lessons tailored to your experience, schedule, and goals.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service) => (
              <Card key={service.title} className="border-border bg-card">
                <CardHeader className="flex flex-row items-start gap-4 pb-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <service.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold">{service.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

