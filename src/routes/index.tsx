import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Calendar,
  Users,
  Award,
  Clock,
  MapPin,
  Star,
  ArrowRight,
} from "lucide-react";
import heroImage from "@/assets/hero-driving-school.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GSM Driving School | Learn to Drive with Confidence" },
      {
        name: "description",
        content:
          "GSM Driving School offers professional driving lessons, beginner courses, and test preparation. Book your lesson online today.",
      },
      {
        property: "og:title",
        content: "GSM Driving School | Learn to Drive with Confidence",
      },
      {
        property: "og:description",
        content:
          "Professional driving lessons with certified instructors. Book online in minutes.",
      },
    ],
  }),
  component: Index,
});

const stats = [
  { value: "15+", label: "Years experience" },
  { value: "5,000+", label: "Students passed" },
  { value: "92%", label: "First-time pass rate" },
  { value: "4.9", label: "Average rating" },
];

const features = [
  {
    icon: Shield,
    title: "Safety-first approach",
    description:
      "Every lesson builds defensive driving habits and road confidence from day one.",
  },
  {
    icon: Users,
    title: "Certified instructors",
    description:
      "Friendly, DVSA-approved instructors matched to your learning style.",
  },
  {
    icon: Calendar,
    title: "Easy online booking",
    description:
      "Pick your package, instructor, and time slot — all in a few clicks.",
  },
  {
    icon: Award,
    title: "Test preparation",
    description:
      "Mock tests, manoeuvre practice, and calm coaching for test day.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    text: "I passed first time after just 20 lessons. My instructor was patient and explained everything clearly.",
  },
  {
    name: "James K.",
    text: "Booking online was simple, and the reminders kept me on track. Highly recommend GSM Driving.",
  },
  {
    name: "Priya R.",
    text: "As a nervous learner, I appreciated the calm, safety-focused teaching style. Great school!",
  },
];

function Index() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <Star className="mr-1.5 h-3.5 w-3.5 text-warning" />
                Rated 4.9 by 500+ learners
              </div>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Learn to drive with{" "}
                <span className="text-primary">confidence</span>
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                Professional driving lessons from certified instructors. Book
                online, track your progress, and pass your test with GSM Driving
                School.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="text-base">
                  <Link to="/booking">
                    Book your first lesson
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link to="/pricing">View pricing</Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  Flexible hours
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  Local pick-up
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary" />
                  Safety focused
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-xl">
                <img
                  src={heroImage}
                  alt="Driving student and instructor in a modern car"
                  className="h-full w-full object-cover"
                  width={1280}
                  height={720}
                />
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-xl border border-border bg-card p-4 shadow-lg sm:-bottom-6 sm:-left-6 sm:p-5">
                <div className="text-2xl font-bold text-primary">92%</div>
                <div className="text-xs text-muted-foreground">First-time pass rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why learners choose GSM Driving
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We combine expert tuition, modern cars, and simple booking so you
              can focus on becoming a safe, confident driver.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to get behind the wheel?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
            Choose a lesson package and book your first session in minutes. No
            phone calls needed.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link to="/booking">Start booking</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base"
            >
              <Link to="/services">Explore services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What our students say
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-warning text-warning"
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    "{t.text}"
                  </p>
                  <div className="mt-4 font-semibold text-foreground">{t.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
