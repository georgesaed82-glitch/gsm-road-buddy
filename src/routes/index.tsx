import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, Phone, Download, GraduationCap, UserRound, MapPin, Trophy, LifeBuoy } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { PhotoGallery } from "@/components/PhotoGallery";
import { InstallAppCard } from "@/components/InstallAppCard";
import { GsmPlus } from "@/components/GsmPlus";
import { HomeSignsQuiz } from "@/components/HomeSignsQuiz";
import { HomeHazardQuiz } from "@/components/HomeHazardQuiz";
import { HomeTheoryQuiz } from "@/components/HomeTheoryQuiz";

import { trackContactClick } from "@/lib/trackContactClick";
import { listPublicHomeSections, type HomeSectionRow } from "@/lib/home-cms.functions";
import { usePageBlocks, usePageBlockStrings } from "@/hooks/usePageBlocks";
import { useSiteRating, formatRating } from "@/hooks/useSiteRating";
import { listStudentPassPhotosPublic } from "@/lib/student-passes.functions";
import heroImage from "@/assets/gsm-hero-student.jpeg.asset.json";
import heroCarImage from "@/assets/gsm-hero-mercedes.jpg.asset.json";
import studentPassImage from "@/assets/gsm-student-pass.jpeg.asset.json";
import g0 from "@/assets/gallery/gsm-gallery-0.jpg.asset.json";
import g1 from "@/assets/gallery/gsm-gallery-1.jpg.asset.json";
import g2 from "@/assets/gallery/gsm-gallery-2.jpg.asset.json";
import g3 from "@/assets/gallery/gsm-gallery-3.jpg.asset.json";
import g4 from "@/assets/gallery/gsm-gallery-4.jpg.asset.json";
import g5 from "@/assets/gallery/gsm-gallery-5.jpg.asset.json";
import g6 from "@/assets/gallery/gsm-gallery-6.jpg.asset.json";
import g7 from "@/assets/gallery/gsm-gallery-7.jpg.asset.json";
import g8 from "@/assets/gallery/gsm-gallery-8.jpg.asset.json";
import g9 from "@/assets/gallery/gsm-gallery-9.jpg.asset.json";
import g10 from "@/assets/gallery/gsm-gallery-10.jpg.asset.json";
import g11 from "@/assets/gallery/gsm-gallery-11.jpg.asset.json";
import g12 from "@/assets/gallery/gsm-gallery-12.jpg.asset.json";
import g13 from "@/assets/gallery/gsm-gallery-13.jpg.asset.json";
import g14 from "@/assets/gallery/gsm-gallery-14.jpg.asset.json";
import g15 from "@/assets/gallery/gsm-gallery-15.jpg.asset.json";
import g16 from "@/assets/gallery/gsm-gallery-16.jpg.asset.json";
import g17 from "@/assets/gallery/gsm-gallery-17.jpg.asset.json";
import g18 from "@/assets/gallery/gsm-gallery-18.jpg.asset.json";
import g19 from "@/assets/gallery/gsm-gallery-19.jpg.asset.json";

const GALLERY_URLS = [
  g0, g1, g2, g3, g4, g5, g6, g7, g8, g9, g10,
  g11, g12, g13, g14, g15, g16, g17, g18, g19,
].map((img) => img.url);
const DEFAULT_GALLERY_CAPTIONS = [
  "The GSM Driving School T-Cross — Notting Hill",
  "Student pass — Greenford Test Centre",
  "On lesson around Holland Park",
  "Pass certificate moment",
  "DVSA test pass — West London",
  "Manual & automatic lessons available",
  "Local pickup — W11 / W14 / W8",
  "Confidence behind the wheel",
  "Another GSM pass",
  "20+ years teaching West London",
  "Street view — GSM service area",
  "First-time pass — Greenford Test Centre",
  "Pass certificate smile",
  "Another confident driver — West London",
  "DVSA pass — proud moment",
  "First-time pass with GSM",
  "Pass day outside Greenford Test Centre",
  "Pass certificate — West London",
  "First-time pass — Notting Hill area",
  "Pass day with the GSM car",
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GSM Driving School — Drive today. Succeed tomorrow." },
      {
        name: "description",
        content:
          "DVSA-approved manual & automatic driving lessons in Notting Hill, Holland Park & Kensington. 20+ years' experience, 143 five-star Google reviews.",
      },
      { property: "og:title", content: "GSM Driving School — Drive today. Succeed tomorrow." },
      {
        property: "og:description",
        content:
          "DVSA-approved driving lessons across Notting Hill, Holland Park and Kensington. Manual & automatic. 20+ years' experience, 143 five-star Google reviews.",
      },
      { property: "og:image", content: heroImage.url },
      {
        property: "og:image:alt",
        content:
          "GSM Driving School student holding a practical driving test pass certificate in front of the GSM car in Notting Hill, West London.",
      },
      { property: "og:image:width", content: "1600" },
      { property: "og:image:height", content: "1200" },
      { property: "og:image:type", content: "image/jpeg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "GSM Driving School — Drive today. Succeed tomorrow." },
      {
        name: "twitter:description",
        content:
          "DVSA-approved driving lessons across Notting Hill, Holland Park and Kensington. Manual & automatic. 20+ years' experience, 143 five-star Google reviews.",
      },
      {
        name: "twitter:image:alt",
        content:
          "GSM Driving School student holding a practical driving test pass certificate in front of the GSM car in Notting Hill, West London.",
      },
    ],
  }),
  component: Home,
});

const DEFAULT_POSTCODES = ["W2", "W3", "W4", "SW6", "W8", "W10", "W11", "W12", "W14"];

const DEFAULT_REASONS = [
  {
    id: "01",
    name: "Local knowledge",
    description:
      "Every test route junction and tricky give-way in W11 and W8, learned over 20+ years on these exact streets.",
  },
  {
    id: "02",
    name: "Consistent teaching",
    description:
      "Same instructor from your first lesson to test day — no handovers, no repeated explanations, no wasted hours.",
  },
  {
    id: "03",
    name: "Full support",
    description:
      "Practical lessons paired with a theory & hazard perception portal so revision and driving reinforce each other.",
  },
];

// Defaults ensure the homepage renders identically until an admin edits the CMS.
const DEFAULT_SECTIONS: Array<
  Partial<HomeSectionRow> & { section_type: string; section_key: string; sort_order: number }
> = [
  { section_key: "hero", section_type: "hero", sort_order: 10 },
  { section_key: "recent-pass", section_type: "recent-pass", sort_order: 20 },
  { section_key: "why", section_type: "why", sort_order: 30 },
  { section_key: "postcodes", section_type: "postcodes", sort_order: 40 },
  { section_key: "areas", section_type: "areas", sort_order: 50 },
  { section_key: "gallery", section_type: "gallery", sort_order: 60 },
  { section_key: "quizzes", section_type: "quizzes", sort_order: 70 },
  { section_key: "install-app", section_type: "install-app", sort_order: 80 },
  { section_key: "portal", section_type: "portal", sort_order: 90 },
  { section_key: "cta", section_type: "cta", sort_order: 100 },
];

// helper: return the CMS value if non-empty, else the code default
const or = (v: string | undefined, def: string) => (v && v.trim().length > 0 ? v : def);

function Home() {
  const listFn = useServerFn(listPublicHomeSections);
  const { data } = useQuery({
    queryKey: ["home-sections", "web"],
    queryFn: () => listFn({ data: { surface: "web" } }),
  });

  const sections: Array<
    Partial<HomeSectionRow> & { section_type: string; section_key: string; sort_order: number }
  > = data && data.length > 0 ? data : DEFAULT_SECTIONS;

  return (
    <div className="flex flex-col">
      {sections.map((s) => {
        const key = s.section_key ?? s.section_type;
        switch (s.section_type) {
          case "hero":
            return <HeroSection key={key} s={s} />;
          case "why":
            return <WhySection key={key} s={s} />;
          case "postcodes":
            return <PostcodesSection key={key} s={s} />;
          case "areas":
            return <AreasSection key={key} s={s} />;
          case "recent-pass":
            return <RecentPassSection key={key} s={s} />;
          case "gallery":
            return <GallerySection key={key} s={s} />;
          case "quizzes":
            return <QuizzesSection key={key} s={s} />;
          case "install-app":
            return <InstallAppCard key={key} />;
          case "portal":
            return <PortalSection key={key} s={s} />;
          case "cta":
            return <CtaSection key={key} s={s} />;
          case "custom":
            return <CustomSection key={key} s={s} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

type SectionProps = { s: Partial<HomeSectionRow> };

function renderHeroTitle(title: string) {
  if (!title.includes("Succeed")) return title;
  const [before, after] = title.split("Succeed");
  return (
    <>
      {before}
      <span className="italic text-accent">Succeed</span>
      {after}
    </>
  );
}

function HeroSection({ s }: SectionProps) {
  const rating = useSiteRating();
  const heroTitle =
    s.title && s.title.trim().length > 0 ? s.title : "Drive today. Succeed tomorrow.";
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-8 pt-3 sm:px-6 sm:gap-8 sm:pb-12 sm:pt-5 lg:gap-10 lg:px-8 lg:pb-14 lg:pt-6">
        {/* 1) GSM PLUS+ hero card */}
        <Link
          to="/auth"
          aria-label="Open GSM Plus learner portal"
          className="group relative flex items-center gap-3 rounded-3xl border border-border/60 bg-card px-4 py-3.5 shadow-[0_8px_24px_-14px_rgba(29,42,34,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg sm:gap-4 sm:px-5 sm:py-4"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-primary-foreground shadow-md sm:h-12 sm:w-12">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <GsmPlus
              className="text-[20px] sm:text-[24px]"
              gsmClassName="text-primary"
              plusClassName="text-accent"
            />
          </span>
          <ArrowRight className="h-5 w-5 text-accent transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>

        {/* 2) Mercedes hero image */}
        <div className="overflow-hidden rounded-3xl bg-muted shadow-2xl ring-1 ring-border/40">
          <img
            src={or(s.image_url, heroCarImage.url)}
            alt="The GSM Driving School Mercedes-Benz GLA AMG Line with a green rooftop sign and GSM 2005 number plate, parked on a leafy West London street."
            className="aspect-[4/3] w-full object-cover sm:aspect-[16/10] lg:aspect-[16/9] lg:max-h-[62vh]"
            width={1536}
            height={1024}
            fetchPriority="high"
          />
        </div>

        {/* 3) Tagline + buttons */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-8 bg-accent" />
            {or(s.eyebrow, "Notting Hill Gate · Holland Park · High Street Kensington · Bayswater")}
          </div>
          <h1 className="mt-3 text-balance font-display text-[32px] font-medium leading-[1.05] text-foreground sm:mt-5 sm:text-5xl lg:text-[56px] xl:text-[60px]">
            {renderHeroTitle(heroTitle)}
          </h1>
          <a
            href="https://maps.google.com/?cid=12315071950298926858"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-3 hover:opacity-80 sm:mt-6"
          >
            <div className="flex text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-accent" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{formatRating(rating)}</span>
          </a>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            {or(
              s.body,
              "GSM Driving School has taught West London to drive since 2005 — practical lessons, theory prep and GSM Plus, our premium learner platform, from instructors who know these roads.",
            )}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <Button
              asChild
              size="lg"
              className="h-14 w-full rounded-2xl bg-primary px-7 text-primary-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 sm:w-auto"
            >
              <a
                href={or(s.cta_primary_href, "/contact")}
                className="inline-flex items-center gap-2 font-medium"
              >
                {or(s.cta_primary_label, "Get in touch")}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-14 w-full rounded-2xl bg-accent px-7 text-accent-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-lg active:translate-y-0 sm:w-auto"
            >
              <a
                href={or(s.cta_secondary_href, "/#download-app")}
                className="inline-flex items-center gap-2 font-medium"
              >
                {or(s.cta_secondary_label, "Download the App")}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
      <FeatureStrip />
    </section>
  );
}

const FEATURES: { icon: typeof UserRound; title: string; body: string }[] = [
  { icon: UserRound, title: "Experienced", body: "DVSA qualified instructors" },
  { icon: MapPin, title: "Local Expertise", body: "West London specialists" },
  { icon: Trophy, title: "High Pass Rate", body: "Proven results since 2005" },
  { icon: LifeBuoy, title: "Full Support", body: "Lessons, theory & learner portal" },
];

function FeatureStrip() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8">
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-card px-4 py-5 shadow-[0_10px_30px_-18px_rgba(29,42,34,0.35)] sm:grid-cols-4 sm:gap-6 sm:px-6 sm:py-6">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="flex items-start gap-3 sm:gap-4"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent sm:h-11 sm:w-11">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary sm:text-xs">
                {title}
              </div>
              <div className="mt-1 text-[12px] leading-snug text-muted-foreground sm:text-[13px]">
                {body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhySection({ s }: SectionProps) {
  const reasons = usePageBlocks("home-reasons", DEFAULT_REASONS);
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px w-8 bg-accent" />
          {or(s.eyebrow, "Why GSM")}
        </div>
        <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-foreground sm:text-5xl">
          {s.title && s.title.trim().length > 0 ? (
            s.title
          ) : (
            <>
              Over 20 years' experience,
              <br className="hidden sm:block" /> manual{" "}
              <span className="italic text-accent">and</span> automatic.
            </>
          )}
        </h2>
        <div className="mt-14 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
          {reasons.map((r) => (
            <div key={r.id} className="bg-background p-8 lg:p-10">
              <div className="font-display text-2xl font-medium text-accent">{r.id}</div>
              <h3 className="mt-6 font-display text-2xl text-foreground">{r.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PostcodesSection({ s }: SectionProps) {
  const postcodes = usePageBlockStrings("home-postcodes", DEFAULT_POSTCODES);
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-6 sm:px-6 lg:px-8">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {or(s.eyebrow, "Postcodes covered")}
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-display text-lg text-primary">
          {postcodes.map((p, i) => (
            <span key={p} className="flex items-center gap-6">
              {p}
              {i < postcodes.length - 1 && <span className="h-1 w-1 rounded-full bg-accent" />}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function AreasSection({ s }: SectionProps) {
  return (
    <section className="border-b border-border bg-background py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-8 bg-accent" />
              {or(s.eyebrow, "Driving lessons by area")}
            </div>
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-foreground sm:text-4xl">
              {or(s.title, "Lessons in your West London postcode")}
            </h2>
          </div>
          <Link to="/areas" className="text-sm font-medium text-primary hover:underline">
            {or(s.cta_primary_label, "See all areas →")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function RecentPassSection({ s }: SectionProps) {
  const rating = useSiteRating();
  return (
    <section className="bg-muted py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:items-center">
          <div className="overflow-hidden border border-border bg-background shadow-xl">
            <img
              src={or(s.image_url, studentPassImage.url)}
              alt="A happy GSM student holding their practical driving test pass certificate next to the GSM car"
              className="aspect-[4/5] w-full object-cover object-top"
              width={1200}
              height={1500}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-8 bg-accent" />
              {or(s.eyebrow, "Recent pass")}
            </div>
            <h2 className="mt-4 max-w-md font-display text-4xl font-medium leading-[1.1] sm:text-5xl">
              {s.title && s.title.trim().length > 0 ? (
                s.title
              ) : (
                <>
                  Another first-time pass.{" "}
                  <span className="italic text-accent">Another confident driver.</span>
                </>
              )}
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              {or(
                s.body,
                "This is what success looks like at GSM — real students, real test centres, real certificates. We teach the skills, you earn the freedom.",
              )}
            </p>
            <a
              href="https://maps.google.com/?cid=12315071950298926858"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center gap-4 hover:opacity-80"
            >
              <div className="flex text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{formatRating(rating)}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function GallerySection({ s }: SectionProps) {
  const captions = usePageBlockStrings("home-gallery-captions", DEFAULT_GALLERY_CAPTIONS);
  const listFn = useServerFn(listStudentPassPhotosPublic);
  const { data: dbPhotos } = useQuery({
    queryKey: ["student-passes-public"],
    queryFn: () => listFn(),
    staleTime: 60_000,
  });
  // Prefer database-managed photos when available. They're already ordered
  // newest-first (lowest order_index, then most recent). Fall back to the
  // baked-in gallery so the section never renders empty.
  const galleryPhotos =
    dbPhotos && dbPhotos.length > 0
      ? dbPhotos
          .filter((p) => !!p.image_url)
          .map((p) => ({ url: p.image_url as string, caption: p.caption }))
      : GALLERY_URLS.map((url, i) => ({
          url,
          caption: captions[i] ?? DEFAULT_GALLERY_CAPTIONS[i] ?? "",
        }));
  return (
    <section className="bg-muted py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px w-8 bg-accent" />
          {or(s.eyebrow, "From our students")}
        </div>
        <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] sm:text-5xl">
          {s.title && s.title.trim().length > 0 ? (
            s.title
          ) : (
            <>
              Pass certificates, smiles,{" "}
              <span className="italic text-accent">and the GSM car.</span>
            </>
          )}
        </h2>
        <div className="mt-12">
          <PhotoGallery photos={galleryPhotos} />
        </div>
      </div>
    </section>
  );
}

function QuizzesSection({ s }: SectionProps) {
  return (
    <section className="border-t border-border bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px w-8 bg-accent" />
          {or(s.eyebrow, "Free theory practice")}
        </div>
        <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-foreground sm:text-5xl">
          {s.title && s.title.trim().length > 0 ? (
            s.title
          ) : (
            <>
              Test yourself — <span className="italic text-accent">right here.</span>
            </>
          )}
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {or(
            s.body,
            `This is a taster of GSM Plus. Every question in the full platform is explained the same way — answer, then a plain-English "why" — so you actually understand the road, not just memorise it. That's how our students pass quicker.`,
          )}
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Road signs · 10 questions
            </div>
            <HomeSignsQuiz />
          </div>
          <div>
            <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Theory questions · 10 questions
            </div>
            <HomeTheoryQuiz />
          </div>
          <div className="lg:col-span-2">
            <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Hazard perception & anticipation
            </div>
            <div className="mb-4 overflow-hidden border-2 border-accent bg-primary p-6 text-primary-foreground shadow-lg sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-accent">
                    Status update
                  </div>
                  <div className="mt-2 font-display text-3xl leading-[1.05] sm:text-4xl md:text-5xl">
                    Hazard perception from GSM —{" "}
                    <span className="italic text-accent">coming soon</span>
                  </div>
                  <p className="mt-3 max-w-2xl text-sm opacity-90 sm:text-base">
                    Built from{" "}
                    <span className="font-semibold text-accent">
                      real dashcam recordings of live driving situations
                    </span>{" "}
                    around West London — not stock footage. Filming now.
                  </p>
                </div>
                <div className="flex-none self-start border border-accent/60 px-4 py-2 text-center">
                  <div className="text-[10px] uppercase tracking-[0.22em] opacity-70">Progress</div>
                  <div className="mt-1 font-display text-lg">Filming now</div>
                </div>
              </div>
            </div>
            <HomeHazardQuiz />
          </div>
        </div>
        <div className="mt-8 text-sm text-muted-foreground">
          Just a taster. The full{" "}
          <Link to="/dashboard" className="font-medium text-primary underline underline-offset-4">
            GSM Plus
          </Link>{" "}
          gives you all 14 theory categories, every UK road sign, road markings, police signals,
          hazard perception clips and full 50-question mock tests — each with the same "why"
          explanation so you learn faster and pass sooner.
        </div>
      </div>
    </section>
  );
}

function PortalSection({ s }: SectionProps) {
  return (
    <section className="bg-primary py-20 text-primary-foreground sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-primary-foreground/60">
              <span className="h-px w-8 bg-accent" />
              {or(s.eyebrow, "GSM Plus")}
            </div>
            <h2 className="mt-4 font-display text-4xl font-medium leading-[1.1] sm:text-5xl">
              {s.title && s.title.trim().length > 0 ? (
                s.title
              ) : (
                <>
                  Everything you need <span className="italic text-accent">in one place.</span>
                </>
              )}
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed opacity-80">
              {or(
                s.body,
                "Lesson notes, payment history, theory revision and hazard perception — synced from your instructor's tablet after every session.",
              )}
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 h-14 rounded-xl bg-accent px-7 text-accent-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-lg active:translate-y-0"
            >
              <a
                href={or(s.cta_primary_href, "/dashboard")}
                className="inline-flex items-center gap-2 font-medium"
              >
                {or(s.cta_primary_label, "Open your portal")}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <ul className="grid gap-px bg-primary-foreground/10 sm:grid-cols-2">
            {[
              ["Lesson progress", "Skills mastered, hours logged, instructor notes."],
              ["Payments", "Package balance, receipts, hours remaining."],
              ["Theory materials", "All 14 Highway Code categories with sample questions."],
              ["Hazard perception", "Real West London clips, scored on reaction time."],
            ].map(([t, d]) => (
              <li key={t} className="bg-primary p-6">
                <h2 className="font-display text-xl">{t}</h2>
                <p className="mt-2 text-sm leading-relaxed opacity-75">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function CtaSection({ s }: SectionProps) {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-8 bg-accent" />
              Ready to start
            </div>
            <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] text-primary sm:text-5xl">
              {or(s.title, "Ready to start? Get in Touch.")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Message us on WhatsApp, give us a call, or download the app to book your first lesson
              today.
            </p>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto">
            <Button
              asChild
              size="lg"
              className="h-14 rounded-xl bg-primary px-6 text-primary-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0"
            >
              <a
                href="https://wa.me/447961585231"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackContactClick("whatsapp", "Home bottom CTA")}
                className="inline-flex items-center justify-center gap-2 font-medium"
              >
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-14 rounded-xl border border-primary/20 bg-background px-6 text-primary shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-accent/5 hover:shadow-lg active:translate-y-0"
            >
              <a
                href="tel:+447961585231"
                onClick={() => trackContactClick("phone", "Home bottom CTA")}
                className="inline-flex items-center justify-center gap-2 font-medium"
              >
                <Phone className="h-5 w-5" />
                Call
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-14 rounded-xl bg-accent px-6 text-accent-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-lg active:translate-y-0"
            >
              <Link
                to="/"
                hash="download-app"
                className="inline-flex items-center justify-center gap-2 font-medium"
              >
                <Download className="h-5 w-5" />
                {or(s.cta_primary_label, "Download the App")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CustomSection({ s }: SectionProps) {
  const bg =
    s.background === "primary"
      ? "bg-primary text-primary-foreground"
      : s.background === "accent"
        ? "bg-accent text-accent-foreground"
        : s.background === "muted"
          ? "bg-muted"
          : s.background === "card"
            ? "bg-card"
            : "bg-background";
  return (
    <section className={`${bg} border-t border-border py-12 sm:py-16`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {s.eyebrow && (
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-8 bg-accent" />
            {s.eyebrow}
          </div>
        )}
        {s.title && (
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-[1.1] sm:text-5xl">
            {s.title}
          </h2>
        )}
        {s.subtitle && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{s.subtitle}</p>}
        {s.image_url && (
          <img
            src={s.image_url}
            alt={s.title ?? ""}
            className="mt-8 max-h-[420px] w-full object-cover"
          />
        )}
        {s.body && (
          <p className="mt-6 max-w-3xl whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
            {s.body}
          </p>
        )}
        {(s.cta_primary_label || s.cta_secondary_label) && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {s.cta_primary_label && (
              <Button
                asChild
                size="lg"
                className="h-12 rounded-none bg-primary px-6 text-primary-foreground hover:bg-primary/90"
              >
                <a href={or(s.cta_primary_href, "#")} className="inline-flex items-center gap-2">
                  {s.cta_primary_label}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            )}
            {s.cta_secondary_label && (
              <Button asChild size="lg" variant="outline" className="h-12 rounded-none px-6">
                <a href={or(s.cta_secondary_href, "#")} className="inline-flex items-center gap-2">
                  {s.cta_secondary_label}
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
