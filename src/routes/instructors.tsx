import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Award, Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/instructors")({
  head: () => ({
    meta: [
      { title: "Our Instructors | GSM Driving School" },
      {
        name: "description",
        content: "Meet the certified, friendly driving instructors at GSM Driving School.",
      },
      {
        property: "og:title",
        content: "Our Instructors | GSM Driving School",
      },
      {
        property: "og:description",
        content: "Meet the certified, friendly driving instructors at GSM Driving School.",
      },
    ],
  }),
  component: InstructorsPage,
});

const instructors = [
  {
    name: "Mark Johnson",
    role: "Senior instructor",
    bio: "12 years experience, specialises in nervous learners and test preparation.",
    rating: 4.9,
    reviews: 120,
    location: "North DC",
    badges: ["DVSA approved", "Manual"],
    initials: "MJ",
    color: "bg-primary/10 text-primary",
  },
  {
    name: "Aisha Patel",
    role: "Instructor",
    bio: "Patient and encouraging. Helps students build confidence quickly in busy traffic.",
    rating: 5.0,
    reviews: 94,
    location: "East DC",
    badges: ["DVSA approved", "Automatic"],
    initials: "AP",
    color: "bg-accent text-accent-foreground",
  },
  {
    name: "David Chen",
    role: "Instructor",
    bio: "Focuses on defensive driving and motorway confidence for refresher students.",
    rating: 4.8,
    reviews: 76,
    location: "South DC",
    badges: ["DVSA approved", "Manual"],
    initials: "DC",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    name: "Emma Wilson",
    role: "Instructor",
    bio: "Great with first-time drivers. Creates a calm, supportive learning environment.",
    rating: 4.9,
    reviews: 108,
    location: "West DC",
    badges: ["DVSA approved", "Automatic"],
    initials: "EW",
    color: "bg-primary/10 text-primary",
  },
];

function InstructorsPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Meet our instructors
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Certified, experienced, and friendly. Choose the instructor who fits your learning style.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {instructors.map((instructor) => (
              <Card key={instructor.name} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold ${instructor.color}`}>
                      {instructor.initials}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      {instructor.rating}
                    </div>
                  </div>
                  <h2 className="mt-4 font-display text-lg font-semibold">{instructor.name}</h2>
                  <p className="text-sm text-primary">{instructor.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{instructor.bio}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {instructor.badges.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
                      >
                        <Award className="mr-1 h-3 w-3" />
                        {badge}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {instructor.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {instructor.reviews} reviews
                    </span>
                  </div>
                  <Button asChild className="mt-5 w-full">
                    <Link to="/contact">Book with {instructor.name.split(" ")[0]}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
