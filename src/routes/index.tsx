import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, Phone, Download, GraduationCap, UserRound, MapPin, Trophy, LifeBuoy, Sparkles, CheckCircle2, Clock, Youtube, ParkingSquare, TrafficCone, RotateCw, Eye } from "lucide-react";
import { YOUTUBE_SHORTS_URL, resolveYoutubeUrl } from "@/lib/youtube";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { PhotoGallery } from "@/components/PhotoGallery";
import { InstallAppCard } from "@/components/InstallAppCard";
import { GsmPlus } from "@/components/GsmPlus";
import { HomeSignsQuiz } from "@/components/HomeSignsQuiz";
import { HomeHazardQuiz } from "@/components/HomeHazardQuiz";
import { HomeTheoryQuiz } from "@/components/HomeTheoryQuiz";
import { GsmPlusExplainer } from "@/components/GsmPlusExplainer";
import { HomeSectionNav, type SectionAnchor } from "@/components/HomeSectionNav";

import { trackContactClick } from "@/lib/trackContactClick";
import { HomeNativeApp } from "@/components/home/HomeNativeApp";
import { useIsNativeApp } from "@/lib/isNativeApp";
import { listPublicHomeSections, type HomeSectionRow } from "@/lib/home-cms.functions";
import { usePageBlocks, usePageBlockStrings } from "@/hooks/usePageBlocks";
import { useSiteRating, formatRating } from "@/hooks/useSiteRating";
import { listStudentPassPhotosPublic } from "@/lib/student-passes.functions";
import heroImage from "@/assets/gsm-hero-student.jpeg.asset.json";
import heroCarImage from "@/assets/gsm-video-car.jpeg.asset.json";
import studentPassImage from "@/assets/gsm-student-pass.jpeg.asset.json";
import memorable1 from "@/assets/memorable-1.jpg.asset.json";
import memorable2 from "@/assets/memorable-2.jpg.asset.json";
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
  "The GSM Driving School Mercedes — Notting Hill",
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
      { title: "Driving Lessons West London | Manual & Automatic | GSM Driving School" },
      { name: "description", content: "Driving lessons in West London since 2005 — manual and automatic, home pickup across Notting Hill, Kensington, Holland Park, Shepherd's Bush and Bayswater. Call 07961 585231." },
      { property: "og:title", content: "Driving Lessons West London | Manual & Automatic | GSM Driving School" },
      { property: "og:description", content: "Driving lessons in West London since 2005 — manual and automatic, home pickup across Notting Hill, Kensington, Holland Park, Shepherd's Bush and Bayswater. Call 07961 585231." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.gsmdrivingschool.com/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Driving Lessons West London | Manual & Automatic | GSM Driving School" },
      { name: "twitter:description", content: "Driving lessons in West London since 2005 — manual and automatic, home pickup across Notting Hill, Kensington, Holland Park, Shepherd's Bush and Bayswater. Call 07961 585231." },
    ],
    links: [{ rel: "canonical", href: "https://www.gsmdrivingschool.com/" }],
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
  { section_key: "memorable", section_type: "memorable", sort_order: 15 },
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

// GSM Plus and app downloads are on hold publicly. Stored CMS text that still
// advertises them is left untouched in the database but not rendered.
const STALE_PROMO = /gsm\s*plus|learner\s*(portal|platform)|download|install|#download-app|\bthe app\b/i;
const publicCopy = (v: string | undefined, def: string) =>
  v && v.trim().length > 0 && !STALE_PROMO.test(v) ? v : def;

function Home() {
  const isNative = useIsNativeApp();
  const listFn = useServerFn(listPublicHomeSections);
  const { data } = useQuery({
    queryKey: ["home-sections", "web"],
    queryFn: () => listFn({ data: { surface: "web" } }),
  });

  if (isNative) return <HomeNativeApp />;

  const KEEP_ON_WEB = new Set(["hero", "cta"]);
  const allSections: Array<
    Partial<HomeSectionRow> & { section_type: string; section_key: string; sort_order: number }
  > = data && data.length > 0 ? data : DEFAULT_SECTIONS;
  const sections = allSections.filter((s) => KEEP_ON_WEB.has(s.section_type));

  const SECTION_META: Record<string, { id: string; label: string }> = {
    hero: { id: "top", label: "Top" },
    why: { id: "why-gsm", label: "Why GSM" },
    areas: { id: "areas", label: "Areas" },
    "recent-pass": { id: "recent-pass", label: "Recent Pass" },
    quizzes: { id: "training", label: "Theory & Hazard" },
    memorable: { id: "moments", label: "Moments" },
    gallery: { id: "gallery", label: "Gallery" },
    portal: { id: "portal", label: "Portal" },
    cta: { id: "get-in-touch", label: "Get in touch" },
  };
  const scrollAnchors: SectionAnchor[] = sections
    .flatMap((s) =>
      s.section_type === "hero"
        ? [SECTION_META.hero, { id: "videos", label: "Driving videos" }, { id: "local-areas", label: "Areas" }]
        : [SECTION_META[s.section_type]],
    )
    .filter((a): a is SectionAnchor => !!a);
  // Route chips take users to the correct dedicated pages.
  const routeAnchors: SectionAnchor[] = [
    { id: "route-reviews", label: "Reviews", href: "/reviews" },
    { id: "route-instructors", label: "Instructors", href: "/instructors" },
    { id: "route-contact", label: "Contact", href: "/contact" },
  ];
  const navAnchors: SectionAnchor[] = [...scrollAnchors, ...routeAnchors];

  return (
    <div className="flex flex-col">
      {/* section chip bar removed */}
      {sections.map((s) => {
        const key = s.section_key ?? s.section_type;
        const anchorId = SECTION_META[s.section_type]?.id;
        const wrap = (node: ReactNode) =>
          anchorId ? (
            <div id={anchorId} key={key} className="scroll-mt-32">
              {node}
            </div>
          ) : (
            <div key={key}>{node}</div>
          );
        switch (s.section_type) {
          case "hero":
            return (
              <div key={key}>
                {wrap(<HeroSection s={s} />)}
                <div id="videos" className="scroll-mt-32">
                  <VideoTipsSection />
                </div>
                <div id="local-areas" className="scroll-mt-32">
                  <LocalAreasSection />
                </div>
                <BuddyNote />
              </div>
            );
          case "gsm-plus-explainer":
            return wrap(<GsmPlusExplainer />);
          case "why":
            return wrap(<WhySection s={s} />);
          case "postcodes":
            return wrap(<PostcodesSection s={s} />);
          case "areas":
            return wrap(<AreasSection s={s} />);
          case "recent-pass":
            return wrap(<RecentPassSection s={s} />);
          case "memorable":
            return wrap(<MemorableMomentsSection />);
          case "gallery":
            return wrap(<GallerySection s={s} />);
          case "quizzes":
            return wrap(<QuizzesSection s={s} />);
          case "install-app":
            return wrap(<InstallAppCard />);
          case "portal":
            return wrap(<PortalSection s={s} />);
          case "cta":
            return wrap(<CtaSection s={s} />);
          case "custom":
            return wrap(<CustomSection s={s} />);
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
  const { social } = useSiteSettings();
  const youtubeUrl = resolveYoutubeUrl(social.youtube);
  const secondaryIsStale =
    !s.cta_secondary_href?.trim() ||
    !s.cta_secondary_label?.trim() ||
    STALE_PROMO.test(`${s.cta_secondary_href} ${s.cta_secondary_label}`);
  const heroTitle =
    s.title && s.title.trim().length > 0 ? s.title : "Drive today. Succeed tomorrow.";
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-8 pt-3 sm:px-6 sm:gap-8 sm:pb-12 sm:pt-5 lg:max-w-[1180px] lg:gap-8 lg:px-8 lg:pb-8 lg:pt-4">
        {/* Desktop: two-column hero (image + copy). Mobile keeps stacked. */}
        <div className="lg:grid lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-10">
        <div className="overflow-hidden rounded-3xl bg-[color-mix(in_oklab,var(--primary)_8%,var(--background))] shadow-2xl ring-1 ring-border/40 lg:order-1">
          <img
            src={heroCarImage.url}
            alt="GSM branded learner car with a GSM roof sign, red L plate and GSM display plate"
            className="aspect-[1170/659] w-full object-contain"
            width={1170}
            height={659}
            fetchPriority="high"
          />
        </div>

        {/* Tagline + buttons */}
        <div className="mt-6 flex flex-col justify-center lg:mt-0 lg:order-2">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-8 bg-accent" />
            {or(s.eyebrow, "Notting Hill Gate · Holland Park · High Street Kensington · Bayswater")}
          </div>
          <h1 className="mt-3 text-balance font-display text-[32px] font-medium leading-[1.05] text-foreground sm:mt-5 sm:text-5xl lg:mt-3 lg:text-[40px] xl:text-[44px]">
            <span className="mb-3 inline-flex rounded-full bg-primary px-3 py-1 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
              20+ years teaching West London · Since 2005
            </span>
            <span className="mb-2 block font-sans text-[13px] font-semibold uppercase tracking-[0.14em] text-primary sm:text-sm">
              Manual &amp; automatic driving lessons in Notting Hill, Kensington &amp; West London
            </span>
            <span className="block">{renderHeroTitle(heroTitle)}</span>
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
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg lg:mt-4 lg:max-w-none lg:text-[15px]">
            {publicCopy(
              s.body,
              "GSM Driving School has taught West London to drive since 2005 — patient one-to-one practical lessons, automatic and manual, plus free driving tips on our YouTube channel.",
            )}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap lg:mt-5 lg:gap-3">
            <Button
              asChild
              size="lg"
              className="h-10 w-full rounded-2xl bg-primary px-5 text-primary-foreground btn-3d transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:btn-3d active:translate-y-0 sm:w-auto lg:h-10 lg:px-6 lg:text-[15px]"
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
              className="h-10 w-full rounded-2xl bg-youtube px-5 text-youtube-foreground btn-3d transition-all duration-200 hover:-translate-y-0.5 hover:bg-youtube/90 hover:shadow-lg active:translate-y-0 sm:w-auto lg:h-10 lg:px-6 lg:text-[15px]"
            >
              {secondaryIsStale ? (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium"
                >
                  <Youtube className="h-5 w-5" />
                  Watch on YouTube
                </a>
              ) : (
                <a href={s.cta_secondary_href} className="inline-flex items-center gap-2 font-medium">
                  {s.cta_secondary_label}
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </Button>
          </div>
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
  { icon: Trophy, title: "Since 2005", body: "Two decades teaching locally" },
  { icon: LifeBuoy, title: "Patient Lessons", body: "One-to-one, at your pace" },
];

function FeatureStrip() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:max-w-6xl lg:px-8 lg:pb-8">
      <div className="grid grid-cols-2 gap-4 rounded-2xl border /60 bg-card px-4 py-5 shadow-[0_10px_30px_-18px_rgba(29,42,34,0.35)] sm:grid-cols-4 sm:gap-6 sm:px-6 sm:py-6 lg:gap-4 lg:px-5 lg:py-4 box-3d">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="flex flex-col items-center text-center gap-2 sm:flex-row sm:items-start sm:text-left sm:gap-4 lg:gap-3"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent sm:h-11 sm:w-11 lg:h-9 lg:w-9">
              <Icon className="h-5 w-5 lg:h-[18px] lg:w-[18px]" />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary sm:text-xs sm:tracking-[0.14em] lg:text-[11px]">
                {title}
              </div>
              <div className="mt-1 text-[12px] leading-snug text-muted-foreground sm:text-[13px] lg:text-[12px] break-words">
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
    <section className="py-12 sm:py-16 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:max-w-[1180px] lg:px-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px w-8 bg-accent" />
          {or(s.eyebrow, "Why GSM")}
        </div>
        <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-foreground sm:text-5xl lg:text-[32px]">
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
        <div className="mt-14 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3 lg:mt-10">
          {reasons.map((r) => (
            <div key={r.id} className="bg-background p-8 lg:p-6">
              <div className="font-display text-2xl font-medium text-accent lg:text-xl">{r.id}</div>
              <h3 className="mt-6 font-display text-2xl text-foreground lg:mt-4 lg:text-xl">{r.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground lg:mt-2">{r.description}</p>
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
    <section className="border-b border-border bg-background py-14 sm:py-16 lg:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:max-w-[1180px] lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-8 bg-accent" />
              {or(s.eyebrow, "Driving lessons by area")}
            </div>
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-3xl">
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

function MemorableMomentsSection() {
  const photos = [
    { url: memorable1.url, alt: "GSM founder standing beside the GSM Ford Fiesta on a leafy West London street" },
    { url: memorable2.url, alt: "A GSM student smiling with their practical driving test pass certificate beside the GSM car" },
  ];
  return (
    <section className="bg-background pt-6 pb-4 sm:pt-10 sm:pb-8 lg:py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-[1180px] lg:px-8">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">
          <span className="h-px w-8 bg-accent" />
          Memorable Moments
        </div>
        <h2 className="mt-3 font-display text-[22px] font-medium leading-[1.15] text-primary sm:mt-4 sm:text-4xl lg:text-[30px]">
          Memorable Moments
          <span className="italic text-accent"> with GSM.</span>
        </h2>
        <div className="mt-5 sm:mt-6 lg:mt-6 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-8">
          <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-4">
            {photos.map((p) => (
              <div
                key={p.url}
                className="overflow-hidden rounded-2xl border  bg-background shadow-lg box-3d"
              >
                <img
                  src={p.url}
                  alt={p.alt}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover lg:aspect-[4/5]"
                />
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-3xl box-3d bg-[oklch(0.94_0.03_150)] px-5 py-6 shadow-[0_20px_40px_-24px_rgba(29,42,34,0.45)] sm:mt-8 sm:px-8 sm:py-8 lg:mt-0 lg:px-7 lg:py-7">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">
              <span className="h-px w-8 bg-accent" />
              About GSM
            </div>
            <p className="mt-4 font-display text-[18px] leading-[1.5] text-primary sm:text-[22px] sm:leading-[1.55] lg:mt-3 lg:text-[18px] lg:leading-[1.55]">
              George founded GSM in 2005 and has been DVSA-approved ever since. Michael, also DVSA-approved, joined the team bringing the same patient, structured teaching style.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function RecentPassSection({ s }: SectionProps) {
  return (
    <section className="bg-background pb-10 pt-2 sm:py-16 lg:py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-[1180px] lg:px-8">
        <div className="flex flex-col gap-6 sm:gap-8 lg:grid lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-10">
          {/* Photograph is shown in full — no text overlay. */}
          <div className="overflow-hidden rounded-3xl border border-border bg-[color-mix(in_oklab,var(--primary)_8%,var(--background))] shadow-xl">
            <img
              src={or(s.image_url, studentPassImage.url)}
              alt="A happy GSM student holding their practical driving test pass certificate next to the GSM car"
              className="aspect-[3/4] w-full object-cover object-center sm:aspect-[4/3] lg:aspect-[4/5]"
              width={1200}
              height={1500}
            />
          </div>
          <div className="rounded-3xl box-3d bg-[oklch(0.94_0.03_150)] px-5 py-6 shadow-[0_20px_40px_-24px_rgba(29,42,34,0.45)] sm:px-8 sm:py-8 lg:px-8 lg:py-8">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">
            <span className="h-px w-8 bg-accent" />
            {or(s.eyebrow, "About GSM")}
          </div>
          <h2 className="mt-3 font-display text-[22px] font-medium leading-[1.15] text-primary sm:mt-4 sm:text-4xl lg:mt-3 lg:text-[30px]">
            {s.title && s.title.trim().length > 0 ? (
              s.title
            ) : (
              <>
                A family school teaching West London to drive
                <span className="italic text-accent"> since 2005.</span>
              </>
            )}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-primary/90 sm:mt-5 sm:text-lg lg:mt-3 lg:text-[15px]">
            {or(
              s.body,
              "George founded GSM in 2005 and has been DVSA-approved ever since. Michael, also DVSA-approved, joined the team bringing the same patient, structured teaching style.",
            )}
          </p>
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
    <section className="bg-muted py-12 sm:py-16 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:max-w-[1180px] lg:px-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px w-8 bg-accent" />
          {or(s.eyebrow, "From our students")}
        </div>
        <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] sm:text-5xl lg:text-[32px]">
          {s.title && s.title.trim().length > 0 ? (
            s.title
          ) : (
            <>
              Pass certificates, smiles,{" "}
              <span className="italic text-accent">and the GSM car.</span>
            </>
          )}
        </h2>
        <div className="mt-12 lg:mt-8">
          <PhotoGallery photos={galleryPhotos} />
        </div>
      </div>
    </section>
  );
}

function QuizzesSection({ s }: SectionProps) {
  return (
    <section className="border-t border-border bg-background py-12 sm:py-16 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:max-w-[1180px] lg:px-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px w-8 bg-accent" />
          {or(s.eyebrow, "Free theory practice")}
        </div>
        <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-foreground sm:text-5xl lg:text-[32px]">
          {s.title && s.title.trim().length > 0 ? (
            s.title
          ) : (
            <>
              Test yourself — <span className="italic text-accent">right here.</span>
            </>
          )}
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-base">
          {or(
            s.body,
            `This is a taster of GSM Plus. Every question in the full platform is explained the same way — answer, then a plain-English "why" — so you actually understand the road, not just memorise it. That's how our students pass quicker.`,
          )}
        </p>
        <div className="mt-10 grid gap-6 lg:mt-8 lg:grid-cols-2 lg:gap-5">
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
          <Link to="/auth" className="font-medium text-primary underline underline-offset-4">
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
  const portalHref = or(s.cta_primary_href, "/auth") === "/dashboard" ? "/auth" : or(s.cta_primary_href, "/auth");
  return (
    <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground sm:py-20 lg:py-24">
      {/* soft radial glow for premium feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 45% at 15% 20%, color-mix(in oklab, var(--accent) 22%, transparent) 0%, transparent 70%), radial-gradient(50% 40% at 90% 90%, color-mix(in oklab, var(--accent) 14%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          {/* Left column — narrative */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                {or(s.eyebrow, "GSM Learning Platform")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground shadow-sm">
                <Clock className="h-3.5 w-3.5" />
                Coming Soon
              </span>
            </div>

            <h2 className="mt-5 font-display text-4xl font-medium leading-[1.04] tracking-tight sm:text-5xl">
              {s.title && s.title.trim().length > 0 ? s.title : (
                <>
                  <GsmPlus
                    className="text-4xl sm:text-5xl"
                    gsmClassName="text-primary-foreground"
                    plusClassName="text-accent"
                  />
                </>
              )}
            </h2>

            {/* One-sentence explainer */}
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-primary-foreground/90 sm:text-xl">
              {or(
                s.subtitle,
                "GSM Plus is our premium learner platform — everything you need to prepare, practise and pass, in one place.",
              )}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                asChild
                size="lg"
                className="h-10 rounded-2xl bg-accent px-5 text-accent-foreground btn-3d transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-xl active:translate-y-0"
              >
                <a
                  href="mailto:gsmdrivingschool@outlook.com?subject=Join%20GSM%20Plus%20waiting%20list"
                  className="inline-flex items-center gap-2 font-semibold"
                >
                  Join GSM Plus
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-10 rounded-2xl border-accent/60 bg-transparent px-5 text-primary-foreground btn-3d transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/10 active:translate-y-0"
              >
                <a
                  href={portalHref}
                  className="inline-flex items-center gap-2 font-semibold"
                >
                  Learn more
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <p className="mt-5 text-xs text-primary-foreground/60">
              {or(
                s.body,
                "Lesson progress, driving topics, training videos, theory practice, mock tests and personalised feedback — all in one dashboard.",
              )}
            </p>
          </div>

          {/* Right column — Free vs GSM Plus comparison card */}
          <div className="relative rounded-[2rem] border border-accent/25 bg-primary-foreground/5 p-3 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Free */}
              <div className="rounded-2xl box-3d-dark bg-primary-foreground/[0.06] p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-foreground/60">
                  Free
                </div>
                <div className="mt-1 font-display text-xl font-semibold text-primary-foreground">
                  Starter access
                </div>
                <ul className="mt-4 space-y-2 text-sm text-primary-foreground/85">
                  {["Basic info & road signs", "Selected learning material", "Starter theory quizzes"].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground/60" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* GSM Plus */}
              <div className="relative rounded-2xl box-3d-dark bg-accent/12 p-5 ring-1 ring-accent/40">
                <span className="absolute -top-2 right-3 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground shadow-sm">
                  Premium
                </span>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                  GSM Plus
                </div>
                <div className="mt-1 font-display text-xl font-semibold text-primary-foreground">
                  The full platform
                </div>
                <ul className="mt-4 space-y-2 text-sm text-primary-foreground">
                  {[
                    "Full syllabus & lesson progress",
                    "AI video library & animations",
                    "Hazard perception + mock tests",
                    "Personalised instructor feedback",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span className="font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection({ s }: SectionProps) {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:max-w-[1180px] lg:px-8 lg:py-12">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-8 bg-accent" />
              Ready to start
            </div>
            <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] text-primary sm:text-5xl lg:text-[34px]">
              {publicCopy(s.title, "Ready to start? Get in Touch.")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground lg:text-[15px]">
              Message us on WhatsApp or give us a call to book your first lesson — and watch our
              free driving tips on YouTube in the meantime.
            </p>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto">
            <Button
              asChild
              size="lg"
              className="h-10 rounded-xl bg-primary px-6 text-primary-foreground btn-3d transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:btn-3d active:translate-y-0"
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
              className="h-10 rounded-xl border  bg-background px-6 text-primary shadow-md transition-all duration-200 hover:-translate-y-0.5 hover: hover:bg-accent/5 hover:shadow-lg active:translate-y-0 box-3d"
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
              className="h-10 rounded-xl bg-accent px-6 text-accent-foreground btn-3d transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90 hover:btn-3d active:translate-y-0"
            >
              <Link to="/youtube" className="inline-flex items-center justify-center gap-2 font-medium">
                <Youtube className="h-5 w-5" />
                Driving videos
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
                className="h-10 rounded-none bg-primary px-6 text-primary-foreground hover:bg-primary/90"
              >
                <a href={or(s.cta_primary_href, "#")} className="inline-flex items-center gap-2">
                  {s.cta_primary_label}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            )}
            {s.cta_secondary_label && (
              <Button asChild size="lg" variant="outline" className="h-10 rounded-none px-6">
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

const VIDEO_TOPICS = [
  { icon: ParkingSquare, title: "Parking", body: "Bay, parallel and pulling up on the left." },
  { icon: TrafficCone, title: "Junctions & traffic lights", body: "Positioning, timing and safe decisions." },
  { icon: RotateCw, title: "Roundabouts", body: "Lanes, signals and reading traffic." },
  { icon: Eye, title: "Observation", body: "Mirrors, blind spots and planning ahead." },
];

function VideoTipsSection() {
  const { social } = useSiteSettings();
  const channel = resolveYoutubeUrl(social.youtube);
  return (
    <section className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:max-w-[1180px] lg:px-8 lg:py-12">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-primary-foreground/70">
          <span className="h-px w-8 bg-accent" /> Free driving videos
        </div>
        <h2 className="mt-4 font-display text-3xl font-medium leading-tight sm:text-4xl lg:text-[34px]">
          Learn with GSM on <span className="italic text-accent">YouTube</span>
        </h2>
        <p className="mt-3 max-w-2xl text-primary-foreground/80">
          Clear, practical driving tips from George and the GSM team, with step-by-step visual explanations.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {VIDEO_TOPICS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl box-3d-dark bg-primary-foreground/5 p-5">
              <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-primary-foreground/75">{body}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg" className="h-10 rounded-2xl bg-youtube px-6 text-youtube-foreground hover:bg-youtube/90 btn-3d">
            <a href={channel} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
              <Youtube className="h-5 w-5" /> Watch on YouTube
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-10 rounded-2xl border-primary-foreground/40 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <a href={YOUTUBE_SHORTS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
              Watch the Shorts <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-10 rounded-2xl border-primary-foreground/40 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <Link to="/youtube" className="inline-flex items-center gap-2">
              Driving tips &amp; lessons <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

const LOCAL_AREAS: { postcode: string; label: string; slug?: string }[] = [
  { postcode: "W11", label: "Notting Hill", slug: "notting-hill" },
  { postcode: "W8", label: "High Street Kensington", slug: "kensington" },
  { postcode: "W14", label: "Holland Park", slug: "holland-park" },
  { postcode: "W12", label: "Shepherd's Bush", slug: "shepherds-bush" },
  { postcode: "W2", label: "Bayswater", slug: "bayswater" },
  { postcode: "W10", label: "North Kensington", slug: "north-kensington" },
];

function LocalAreasSection() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:max-w-[1180px] lg:px-8 lg:py-10">
        <h2 className="font-display text-3xl font-medium text-primary lg:text-[30px]">
          Driving lessons near you in West London
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Local pick-ups for automatic and manual lessons across these postcodes.
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {LOCAL_AREAS.map((a) => (
            <li key={a.postcode}>
              {a.slug ? (
                <Link
                  to="/areas/$area"
                  params={{ area: a.slug }}
                  className="flex h-full flex-col rounded-xl border  bg-card p-4 transition-colors hover: box-3d"
                >
                  <span className="font-display text-lg font-semibold text-primary">{a.postcode}</span>
                  <span className="text-sm text-muted-foreground">{a.label}</span>
                </Link>
              ) : (
                <Link
                  to="/contact"
                  className="flex h-full flex-col rounded-xl border  bg-card p-4 transition-colors hover: box-3d"
                >
                  <span className="font-display text-lg font-semibold text-primary">{a.postcode}</span>
                  <span className="text-sm text-muted-foreground">{a.label} — enquire</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          <Link to="/areas" className="font-medium text-primary underline underline-offset-4 hover:text-accent">All areas</Link>
          <Link to="/pricing" className="font-medium text-primary underline underline-offset-4 hover:text-accent">Prices &amp; packages</Link>
          <Link to="/services" className="font-medium text-primary underline underline-offset-4 hover:text-accent">Practical lessons</Link>
        </div>
      </div>
    </section>
  );
}

function BuddyNote() {
  return (
    <aside id="gsm-buddy" className="mx-auto mb-10 w-full max-w-7xl px-4 sm:px-6 lg:max-w-[1180px] lg:px-8">
      <div className="rounded-xl border  bg-card px-4 py-3 text-sm box-3d">
        <p className="font-semibold text-primary">GSM Buddy</p>
        <p className="text-muted-foreground">Progress sheets and driving topics coming soon.</p>
      </div>
    </aside>
  );
}
