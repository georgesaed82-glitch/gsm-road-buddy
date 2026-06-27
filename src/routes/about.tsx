import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Award, Heart } from "lucide-react";

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

const values = [
  {
    icon: Shield,
    title: "Safety first",
    description: "We teach defensive habits that keep you safe long after you pass.",
  },
  {
    icon: Heart,
    title: "Patient teaching",
    description: "Every learner is different. We adapt to your pace and confidence level.",
  },
  {
    icon: Users,
    title: "Local expertise",
    description: "Our instructors know the local test routes and road conditions.",
  },
  {
    icon: Award,
    title: "High standards",
    description: "All instructors are certified and regularly assessed for quality.",
  },
];

const faqs = [
  {
    question: "How many lessons will I need?",
    answer:
      "It depends on your experience. We normally recommend beginners take around 45 hours of lessons plus 20 hours of practice outside of lessons with friends or family. If you are partly experienced, we usually suggest around 25 hours, and if you are already experienced, around 18 hours should be enough to get you ready for a first-time pass.",
  },
  {
    question: "Do you offer automatic lessons?",
    answer: "Yes — we offer both automatic and manual lessons. Please check with your instructor to confirm what car and transmission they will be using for your lessons.",
  },
  {
    question: "Can I pick my instructor?",
    answer:
      "Absolutely. During booking you can choose an instructor by location, availability, and teaching style.",
  },
  {
    question: "What happens if I need to cancel?",
    answer:
      "You can reschedule or cancel up to 48 hours before your lesson through your student dashboard.",
  },
];

function AboutPage() {
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
            and stay safe on the road. From nervous first-time drivers to experienced licence-holders
            who need a refresher, we treat every student with patience, respect, and expert tuition.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Our instructors are fully certified, insured, and passionate about road safety. We use modern,
            dual-control vehicles and keep our booking process simple so you can spend more time learning
            and less time on admin.
          </p>
        </div>
      </section>

      <section className="bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our values
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card key={value.title} className="border-border bg-background">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary">
                    <value.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
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
              <div key={faq.question} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-display font-semibold text-foreground">{faq.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
