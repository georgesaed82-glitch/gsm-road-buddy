import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Smile,
  Target,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { trackContactClick } from "@/lib/trackContactClick";
import {
  YOUTUBE_SHORTS_URL,
  resolveYoutubeUrl,
  youtubeWhatsAppHref,
} from "@/lib/youtube";

const URL = "https://www.gsmdrivingschool.com/youtube";
const TITLE = "Driving Tips & YouTube Lessons | GSM Driving School";
const DESC =
  "Free driving tips from GSM Driving School on YouTube — parking, junctions, roundabouts and observation. Then book patient one-to-one lessons in Notting Hill, Kensington and West London.";

export const Route = createFileRoute("/youtube")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: YouTubePage,
});

const TOPICS = [
  { title: "Parking", body: "Bay parking, parallel parking and pulling up on the left, step by step." },
  { title: "Junctions & traffic lights", body: "Approach, positioning and when it is safe to go." },
  { title: "Roundabouts", body: "Lanes, signals and reading traffic on busy London roundabouts." },
  { title: "Observation", body: "Mirrors, blind spots and planning ahead like a confident driver." },
];

const LESSONS = [
  { icon: Car, title: "Automatic lessons with George", body: "One-to-one automatic tuition from GSM's founder." },
  { icon: Target, title: "Manual lessons with the team", body: "Patient manual instructors who know West London roads." },
  { icon: RefreshCw, title: "Refresher lessons", body: "Rebuild confidence after a break or in a new area." },
  { icon: Smile, title: "Nervous beginners", body: "Calm, quiet first lessons at your own pace." },
  { icon: ShieldCheck, title: "Test preparation", body: "Mock tests and test-route practice before the big day." },
];

const AREAS: { label: string; postcode: string; slug?: string }[] = [
  { label: "Notting Hill", postcode: "W11", slug: "notting-hill" },
  { label: "Kensington", postcode: "W8", slug: "kensington" },
  { label: "North Kensington", postcode: "W10" },
  { label: "Shepherd's Bush", postcode: "W12", slug: "shepherds-bush" },
  { label: "Holland Park / Brook Green", postcode: "W14", slug: "holland-park" },
  { label: "Bayswater / Paddington", postcode: "W2", slug: "bayswater" },
];

function YouTubePage() {
  const { business, social } = useSiteSettings();
  const channel = resolveYoutubeUrl(social.youtube);
  const wa = youtubeWhatsAppHref(business.phone_intl);

  return (
    <div className="bg-background">
      {/* Intro */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-8 bg-accent" /> GSM on YouTube
          </p>
          <h1 className="mt-4 text-balance font-display text-4xl font-medium leading-[1.05] text-primary sm:text-5xl">
            Found us on YouTube? <span className="italic text-accent">Watch. Learn.</span> Drive with confidence.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Free driving tips from George and the GSM team — then, when you're ready, patient
            one-to-one practical lessons around Notting Hill, Kensington and West London.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="h-14 rounded-2xl bg-primary px-7 text-primary-foreground">
              <a href={channel} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                <Youtube className="h-5 w-5" /> Watch on YouTube
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 rounded-2xl border-primary/30 px-7 text-primary">
              <a href={YOUTUBE_SHORTS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                Watch the Shorts <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-medium text-primary">What the videos cover</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {TOPICS.map((t) => (
            <div key={t.title} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <CheckCircle2 className="h-5 w-5 text-accent" /> {t.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-muted-foreground">
          New videos are posted on the{" "}
          <a href={channel} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4 hover:text-accent">
            GSM Driving School channel
          </a>
          . Videos only play when you choose to open them.
        </p>
      </section>

      {/* Lessons */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-medium text-primary">Ready to practise on the road?</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Videos help — but nothing replaces patient one-to-one time behind the wheel.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LESSONS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-background p-5">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <Link to="/pricing" className="font-medium text-primary underline underline-offset-4 hover:text-accent">
              See prices &amp; packages
            </Link>
            <Link to="/services" className="font-medium text-primary underline underline-offset-4 hover:text-accent">
              Practical lessons
            </Link>
          </div>
        </div>
      </section>

      {/* Areas */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-medium text-primary">Lessons across West London</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a) => (
            <li key={a.postcode}>
              {a.slug ? (
                <Link
                  to="/areas/$area"
                  params={{ area: a.slug }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-accent/60"
                >
                  <MapPin className="h-5 w-5 shrink-0 text-accent" />
                  <span><span className="font-semibold">{a.postcode}</span> · {a.label}</span>
                </Link>
              ) : (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-accent/60"
                >
                  <MapPin className="h-5 w-5 shrink-0 text-accent" />
                  <span><span className="font-semibold">{a.postcode}</span> · {a.label} — ask us</span>
                </a>
              )}
            </li>
          ))}
        </ul>
        <Link to="/areas" className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4 hover:text-accent">
          All areas we cover
        </Link>
      </section>

      {/* Enquire */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-medium">Ask about lessons</h2>
          <p className="mt-3 max-w-2xl text-primary-foreground/85">
            WhatsApp opens a ready-made message for you to check and send — it asks for your
            postcode, automatic/manual/refresher, experience and availability.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Button asChild size="lg" className="h-14 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
              <a href={wa} target="_blank" rel="noopener noreferrer" onClick={() => trackContactClick("whatsapp", "YouTube page")} className="inline-flex items-center justify-center gap-2">
                <WhatsAppIcon className="h-5 w-5" /> WhatsApp
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 rounded-xl border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <a href={`tel:+${business.phone_intl}`} onClick={() => trackContactClick("phone", "YouTube page")} className="inline-flex items-center justify-center gap-2">
                <Phone className="h-5 w-5" /> Call {business.phone}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 rounded-xl border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <a href={`mailto:${business.email}`} className="inline-flex min-w-0 items-center justify-center gap-2">
                <Mail className="h-5 w-5 shrink-0" /> Email us
              </a>
            </Button>
          </div>
          <p className="mt-6 text-sm text-primary-foreground/75">
            Please give at least 48 hours' notice to cancel or reschedule a lesson.
          </p>
          <p className="mt-8 font-display text-xl italic text-accent">
            Keep learning, build your confidence, and drive safely.
          </p>
        </div>
      </section>
    </div>
  );
}
