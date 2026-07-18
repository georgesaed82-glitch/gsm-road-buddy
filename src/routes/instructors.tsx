import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, ArrowRight } from "lucide-react";
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
            DVSA-qualified instructors teaching manual and automatic across West London.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((instructor) => (
              <InstructorCard key={instructor.id} instructor={instructor} />
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-3xl rounded-2xl border border-dashed border-border bg-secondary/30 p-4 text-center text-sm leading-relaxed text-muted-foreground">
            Instructor prices may vary depending on the instructor's qualifications, experience,
            lesson location and any package discounts available.
          </p>
        </div>
      </section>
    </div>
  );
}

type BioParts = {
  description: string | null;
  standard: string | null;
  packageRate: string | null;
  extra: string[];
};

function parseBio(bio: string): BioParts {
  const parts: BioParts = { description: null, standard: null, packageRate: null, extra: [] };
  const lines = bio.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith("standard rate:")) {
      parts.standard = line.replace(/^standard rate:\s*/i, "").trim();
    } else if (lower.startsWith("12-hour package:") || lower.startsWith("package:")) {
      parts.packageRate = line.replace(/^(12-hour package|package):\s*/i, "").trim();
    } else if (!parts.description) {
      parts.description = line;
    } else {
      parts.extra.push(line);
    }
  }
  return parts;
}

function InstructorCard({ instructor }: { instructor: InstructorRow }) {
  const bio = parseBio(instructor.bio ?? "");
  return (
    <Card className="flex h-full flex-col overflow-hidden border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col p-6">
        <div className="flex items-center gap-4">
          {instructor.image_url ? (
            <img
              src={instructor.image_url}
              alt={instructor.name}
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-primary/10"
            />
          ) : (
            <div
              className={`grid h-16 w-16 shrink-0 place-items-center rounded-full text-xl font-bold ring-2 ring-primary/10 ${instructor.color}`}
              aria-hidden="true"
            >
              {instructor.initials}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="truncate font-display text-xl font-semibold text-foreground">
              {instructor.name}
            </h2>
            <p className="text-sm font-medium text-primary">{instructor.role}</p>
          </div>
        </div>

        {(instructor.badges ?? []).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {(instructor.badges ?? []).map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground"
              >
                <Award className="mr-1 h-3 w-3" />
                {badge}
              </span>
            ))}
          </div>
        )}

        {bio.description && (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{bio.description}</p>
        )}

        {(bio.standard || bio.packageRate) && (
          <dl className="mt-5 space-y-2 rounded-xl border border-border/60 bg-secondary/30 p-3 text-sm">
            {bio.standard && (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Standard rate</dt>
                <dd className="text-right font-semibold text-foreground">{bio.standard}</dd>
              </div>
            )}
            {bio.packageRate && (
              <div className="flex items-baseline justify-between gap-3 border-t border-border/50 pt-2">
                <dt className="text-muted-foreground">12-hour package</dt>
                <dd className="text-right font-semibold text-primary">{bio.packageRate}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="mt-auto pt-6">
          <Button asChild className="w-full">
            <Link to={instructor.cta_href || "/contact"}>
              Enquire / Book lessons
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
