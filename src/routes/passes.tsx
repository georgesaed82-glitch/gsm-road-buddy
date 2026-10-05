import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Instagram, Facebook, MapPin } from "lucide-react";
import { PhotoGallery } from "@/components/PhotoGallery";
import { listStudentPassPhotosPublic } from "@/lib/student-passes.functions";
import { BUSINESS } from "@/lib/business";

const passesQuery = queryOptions({
  queryKey: ["student-pass-photos", "public"],
  queryFn: () => listStudentPassPhotosPublic(),
  staleTime: 5 * 60 * 1000,
});

const TITLE = "Students Who Passed | GSM Driving School";
const DESC =
  "Photos of GSM Driving School learners who passed their driving test in West London. Follow more passes on Instagram, Facebook and Google Maps.";

export const Route = createFileRoute("/passes")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${BUSINESS.url}/passes` }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(passesQuery),
  component: PassesPage,
});

const [, INSTAGRAM, FACEBOOK, GOOGLE_MAPS] = BUSINESS.sameAs;

const SOCIALS = [
  { href: INSTAGRAM, label: "Instagram", icon: Instagram },
  { href: FACEBOOK, label: "Facebook", icon: Facebook },
  { href: GOOGLE_MAPS, label: "Google Maps", icon: MapPin },
];

function PassesPage() {
  const { data } = useSuspenseQuery(passesQuery);
  const photos = data
    .filter((p) => p.image_url)
    .map((p) => ({ url: p.image_url as string, caption: p.caption }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <h1 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
        Students who passed
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Congratulations to every GSM learner who passed their driving test. See more on our
        social pages.
      </p>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {SOCIALS.map(({ href, label, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-card px-4 py-2 text-sm font-bold text-primary shadow-[0_4px_0_0_var(--primary)] transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_0_var(--primary)]"
          >
            <Icon className="h-4 w-4" /> {label}
          </a>
        ))}
      </div>

      <div className="mt-8">
        {photos.length > 0 ? (
          <PhotoGallery photos={photos} />
        ) : (
          <p className="text-muted-foreground">Pass photos coming soon.</p>
        )}
      </div>
    </div>
  );
}
