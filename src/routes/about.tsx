import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Award, Heart, UserCheck, Star, Sun, Headphones } from "lucide-react";
import { usePageBlocks } from "@/hooks/usePageBlocks";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | GSM Driving School" },
      {
        name: "description",
        content:
          "GSM Driving School has been helping learners pass their driving tests for over 20 years with safety-first tuition.",
      },
      {
        property: "og:title",
        content: "About Us | GSM Driving School",
      },
      {
        property: "og:description",
        content: "Over 20 years of safety-first driving tuition.",
      },
    ],
  }),
  component: AboutPage,
});

const DEFAULT_VALUES = [
  {
    id: "safety-first",
    name: "Safety first",
    description: "We teach defensive habits that keep you safe long after you pass.",
  },
  {
    id: "patient-teaching",
    name: "Patient teaching",
    description: "Every learner is different. We adapt to your pace and confidence level.",
  },
  {
    id: "local-expertise",
    name: "Local expertise",
    description: "Our instructors know the local test routes and road conditions.",
  },
  {
    id: "high-standards",
    name: "High standards",
    description: "All instructors are certified and regularly assessed for quality.",
  },
];

const VALUE_ICONS: Record<string, typeof Shield> = {
  "safety-first": Shield,
  "patient-teaching": Heart,
  "local-expertise": Users,
  "high-standards": Award,
};

const DEFAULT_KEY_POINTS = [
  { id: "dvsa-approved", name: "DVSA-Approved Instructors" },
  { id: "pass-rate", name: "High Pass Rate & Proven Results" },
  { id: "flexible", name: "Flexible Lessons to Suit You" },
  { id: "friendly", name: "Patient, Friendly & Supportive" },
];
const KEY_POINT_ICONS: Record<string, typeof UserCheck> = {
  "dvsa-approved": UserCheck,
  "pass-rate": Star,
  flexible: Sun,
  friendly: Headphones,
};

const DEFAULT_FAQS = [
  {
    id: "how-many-lessons",
    name: "How many lessons will I need?",
    description:
      "It depends on your experience. We normally recommend beginners take around 45 hours of lessons plus 20 hours of practice outside of lessons with friends or family. If you are partly experienced, we usually suggest around 25 hours, and if you are already experienced, around 18 hours should be enough to get you ready for a first-time pass.",
  },
  {
    id: "automatic-lessons",
    name: "Do you offer automatic lessons?",
    description:
      "Yes — we offer both automatic and manual lessons. Please check with your instructor to confirm what car and transmission they will be using for your lessons.",
  },
  {
    id: "pick-instructor",
    name: "Can I pick my instructor?",
    description:
      "Absolutely. During booking you can choose an instructor by location, availability, and teaching style.",
  },
  {
    id: "cancel-policy",
    name: "What happens if I need to cancel?",
    description:
      "You can reschedule or cancel up to 48 hours before your lesson through your student dashboard.",
  },
];

function AboutPage() {
  const values = usePageBlocks("about-values", DEFAULT_VALUES);
  const keyPoints = usePageBlocks("about-key-points", DEFAULT_KEY_POINTS);
  const faqs = usePageBlocks("about-faqs", DEFAULT_FAQS);
  return (
    <div className="flex flex-col">
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            About GSM Driving School
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Over 20 years of helping learners become safe, confident drivers.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-lg leading-relaxed text-muted-foreground">
            GSM Driving School was founded with a simple mission: help every learner pass their test
            and stay safe on the road. From nervous first-time drivers to experienced
            licence-holders who need a refresher, we treat every student with patience, respect, and
            expert tuition.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Our instructors are fully certified, insured, and passionate about road safety. We use
            modern, dual-control vehicles and keep our booking process simple so you can spend more
            time learning and less time on admin.
          </p>
        </div>
      </section>

      <section className="bg-secondary/30 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why choose us
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {keyPoints.map((point) => {
              const Icon = KEY_POINT_ICONS[point.id] ?? UserCheck;
              const titleId = point.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
              return (
                <Card
                  key={point.id}
                  role="group"
                  tabIndex={0}
                  aria-labelledby={titleId}
                  className="border-border bg-background transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 id={titleId} className="font-display text-lg font-semibold">
                      {point.name}
                    </h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our values
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = VALUE_ICONS[value.id] ?? Shield;
              return (
                <Card key={value.id} className="border-border bg-background">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold">{value.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-display font-semibold text-foreground">{faq.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
