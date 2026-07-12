import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Award, Calendar, MapPin } from "lucide-react";
import { listInstructors, type InstructorRow } from "@/lib/catalog.functions";

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

function InstructorsPage() {
  const listFn = useServerFn(listInstructors);
  const { data: instructors = [] } = useQuery<InstructorRow[]>({
    queryKey: ["instructors-public"],
    queryFn: () => listFn(),
    staleTime: 5 * 60_000,
  });
  const visible = instructors.filter((i) => i.enabled);
  return (
    <div className="flex flex-col">
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Meet our instructors
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Certified, experienced, and friendly. Choose the instructor who fits your learning
            style.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((instructor) => (
              <Card key={instructor.id} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {instructor.image_url ? (
                      <img
                        src={instructor.image_url}
                        alt={instructor.name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold ${instructor.color}`}
                      >
                        {instructor.initials}
                      </div>
                    )}
                    {instructor.rating != null && (
                      <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        {instructor.rating}
                      </div>
                    )}
                  </div>
                  <h2 className="mt-4 font-display text-lg font-semibold">{instructor.name}</h2>
                  <p className="text-sm text-primary">{instructor.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{instructor.bio}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(instructor.badges ?? []).map((badge) => (
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
                    {instructor.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {instructor.location}
                      </span>
                    )}
                    {instructor.reviews != null && instructor.reviews > 0 && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {instructor.reviews} reviews
                      </span>
                    )}
                  </div>
                  <Button asChild className="mt-5 w-full">
                    <Link to={instructor.cta_href || "/contact"}>
                      Book with {instructor.name.split(" ")[0]}
                    </Link>
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
