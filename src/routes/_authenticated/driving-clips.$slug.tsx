import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { LessonShell } from "@/components/driving-clips/LessonShell";
import { getLesson, drivingLessons } from "@/data/drivingLessons";

export const Route = createFileRoute("/_authenticated/driving-clips/$slug")({
  head: ({ params }) => {
    const lesson = getLesson(params.slug);
    return {
      meta: [
        { title: lesson ? `${lesson.title} · GSM lesson` : "Lesson · GSM" },
        {
          name: "description",
          content: lesson?.objective ?? "GSM Driving School animated lesson.",
        },
      ],
    };
  },
  loader: ({ params }) => {
    const lesson = getLesson(params.slug);
    if (!lesson) throw notFound();
    return { slug: params.slug };
  },
  notFoundComponent: LessonNotFound,
  component: LessonPage,
});

function LessonPage() {
  const { slug } = Route.useParams();
  const lesson = getLesson(slug)!;
  const idx = drivingLessons.findIndex((l) => l.slug === slug);
  const nextLesson = idx >= 0 && idx < drivingLessons.length - 1 ? drivingLessons[idx + 1] : null;
  return (
    <PortalShell eyebrow="Practical" title={lesson.title}>
      <Link
        to="/driving-clips/"
        className="mb-6 inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> All animated lessons
      </Link>
      <LessonShell
        lesson={lesson}
        next={nextLesson ? { slug: nextLesson.slug, title: nextLesson.title } : null}
      />
    </PortalShell>
  );
}

function LessonNotFound() {
  return (
    <PortalShell eyebrow="Practical" title="Lesson not found">
      <p className="text-sm text-muted-foreground">
        We couldn't find that animated lesson. Available lessons:
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        {drivingLessons.map((l) => (
          <li key={l.slug}>
            <Link
              to="/driving-clips/$slug"
              params={{ slug: l.slug }}
              className="text-accent hover:underline"
            >
              {l.title}
            </Link>
          </li>
        ))}
      </ul>
    </PortalShell>
  );
}