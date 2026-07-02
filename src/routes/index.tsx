import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, Phone, Download } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { PhotoGallery } from "@/components/PhotoGallery";
import { InstallAppCard } from "@/components/InstallAppCard";
import { HomeSignsQuiz } from "@/components/HomeSignsQuiz";
import { HomeHazardQuiz } from "@/components/HomeHazardQuiz";
import { HomeTheoryQuiz } from "@/components/HomeTheoryQuiz";

import { trackContactClick } from "@/lib/trackContactClick";
import heroImage from "@/assets/gsm-hero-student.jpeg.asset.json";
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

const galleryCaptions = [
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
];

const galleryPhotos = [
  g0,
  g1,
  g2,
  g3,
  g4,
  g5,
  g6,
  g7,
  g8,
  g9,
  g10,
].map((img, i) => ({
  url: img.url,
  caption: galleryCaptions[i],
}));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GSM Driving School — Drive today. Succeed tomorrow." },
      { name: "description", content: "DVSA-approved manual & automatic driving lessons in Notting Hill, Holland Park & Kensington. 20+ years' experience, 143 five-star Google reviews." },
      { property: "og:title", content: "GSM Driving School — Drive today. Succeed tomorrow." },
      { property: "og:description", content: "DVSA-approved driving lessons across Notting Hill, Holland Park and Kensington. Manual & automatic. 20+ years' experience, 143 five-star Google reviews." },
      { property: "og:image", content: heroImage.url },
      { property: "og:image:alt", content: "GSM Driving School student holding a practical driving test pass certificate in front of the GSM car in Notting Hill, West London." },
      { property: "og:image:width", content: "1600" },
      { property: "og:image:height", content: "1200" },
      { property: "og:image:type", content: "image/jpeg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "GSM Driving School — Drive today. Succeed tomorrow." },
      { name: "twitter:description", content: "DVSA-approved driving lessons across Notting Hill, Holland Park and Kensington. Manual & automatic. 20+ years' experience, 143 five-star Google reviews." },
      { name: "twitter:image:alt", content: "GSM Driving School student holding a practical driving test pass certificate in front of the GSM car in Notting Hill, West London." },
    ],
  }),
  component: Home,
});

const postcodes = ["W2", "W3", "W4", "SW6", "W8", "W10", "W11", "W12", "W14"];


const reasons = [
  {
    n: "01",
    title: "Local knowledge",
    body: "Every test route junction and tricky give-way in W11 and W8, learned over 20+ years on these exact streets.",
  },
  {
    n: "02",
    title: "Consistent teaching",
    body: "Same instructor from your first lesson to test day — no handovers, no repeated explanations, no wasted hours.",
  },
  {
    n: "03",
    title: "Full support",
    body: "Practical lessons paired with a theory & hazard perception portal so revision and driving reinforce each other.",
  },
];


function Home() {
  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="relative overflow-hidden bg-background">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-8 bg-accent" />
              Notting Hill Gate · Holland Park · High Street Kensington · Bayswater
            </div>
            <h1 className="mt-6 text-balance font-display text-[44px] font-medium leading-[1.05] text-foreground sm:text-6xl lg:text-[72px]">
              Drive today.{" "}
              <span className="italic text-accent">Succeed</span>{" "}
              tomorrow.
            </h1>
            <a
              href="https://maps.google.com/?cid=12315071950298926858"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center gap-3 hover:opacity-80"
            >
              <div className="flex text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">5.0 from 143 Google reviews</span>
            </a>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              GSM Driving School has taught West London to drive since 2005 — practical lessons, theory prep and a full learner portal, from instructors who know these roads.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-none bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                <Link to="/contact" className="inline-flex items-center gap-2">
                  Get in touch
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="h-12 rounded-none bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                <Link to="/#download-app" className="inline-flex items-center gap-2">
                  Download the App
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden bg-muted shadow-2xl">
              <img
                src={heroImage.url}
                alt="A happy GSM Driving School student showing their DVSA practical driving test pass certificate next to the GSM car in Notting Hill, West London."
                className="aspect-[4/5] w-full object-cover"
                width={1600}
                height={1200}
              />
            </div>
            <div className="absolute -bottom-6 left-0 max-w-[260px] bg-primary p-6 text-primary-foreground shadow-xl sm:-bottom-8 lg:-left-8">
              <div className="text-[11px] uppercase tracking-[0.2em] opacity-70">About GSM</div>
              <p className="mt-3 text-sm leading-relaxed">
                George founded GSM in 2005 and has been DVSA-approved ever since. Michael, also DVSA-approved, joined the team bringing the same patient, structured teaching style.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY GSM */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-8 bg-accent" />
            Why GSM
          </div>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-foreground sm:text-5xl">
            Over 20 years' experience,<br className="hidden sm:block" /> manual <span className="italic text-accent">and</span> automatic.
          </h2>

          <div className="mt-14 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
            {reasons.map((r) => (
              <div key={r.n} className="bg-background p-8 lg:p-10">
                <div className="font-display text-2xl font-medium text-accent">{r.n}</div>
                <h3 className="mt-6 font-display text-2xl text-foreground">{r.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POSTCODE STRIP */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Postcodes covered</div>
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

      {/* AREAS — local landing pages for SEO */}
      <section className="border-b border-border bg-background py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                <span className="h-px w-8 bg-accent" />
                Driving lessons by area
              </div>
              <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-foreground sm:text-4xl">
                Lessons in your West London postcode
              </h2>
            </div>
            <Link to="/areas" className="text-sm font-medium text-primary hover:underline">
              See all areas →
            </Link>
          </div>
        </div>
      </section>

      {/* RECENT PASS */}
      <section className="bg-muted py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:items-center">
            <div className="overflow-hidden border border-border bg-background shadow-xl">
              <img
                src={studentPassImage.url}
                alt="A happy GSM student holding their practical driving test pass certificate next to the GSM car"
                className="aspect-[4/5] w-full object-cover object-top"
                width={1200}
                height={1500}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                <span className="h-px w-8 bg-accent" />
                Recent pass
              </div>
              <h2 className="mt-4 max-w-md font-display text-4xl font-medium leading-[1.1] sm:text-5xl">
                Another first-time pass. <span className="italic text-accent">Another confident driver.</span>
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
                This is what success looks like at GSM — real students, real test centres, real certificates. We teach the skills, you earn the freedom.
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
                <span className="text-sm text-muted-foreground">5.0 from 143 Google reviews</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="bg-muted py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-8 bg-accent" />
            From our students
          </div>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] sm:text-5xl">
            Pass certificates, smiles, <span className="italic text-accent">and the GSM car.</span>
          </h2>
          <div className="mt-12">
            <PhotoGallery photos={galleryPhotos} />
          </div>
        </div>
      </section>

      {/* FREE QUIZZES */}
      <section className="border-t border-border bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-8 bg-accent" />
            Free theory practice
          </div>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-foreground sm:text-5xl">
            Test yourself — <span className="italic text-accent">right here.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            This is a taster of the GSM Learner Portal. Every question in the full portal is explained the same way — <span className="italic">answer, then a plain-English "why"</span> — so you actually understand the road, not just memorise it. That's how our students pass quicker.
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
                    <div className="text-[11px] uppercase tracking-[0.24em] text-accent">Status update</div>
                    <div className="mt-2 font-display text-3xl leading-[1.05] sm:text-4xl md:text-5xl">
                      Hazard perception from GSM — <span className="italic text-accent">coming soon</span>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm opacity-90 sm:text-base">
                      Built from <span className="font-semibold text-accent">real dashcam recordings of live driving situations</span> around West London — not stock footage. Filming now.
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
            <Link to="/dashboard" className="font-medium text-primary underline underline-offset-4">GSM Learner Portal</Link>{" "}
            gives you all 14 theory categories, every UK road sign, road markings, police signals, hazard perception clips and full 50-question mock tests — each with the same "why" explanation so you learn faster and pass sooner.
          </div>
        </div>
      </section>

      {/* DOWNLOAD APP */}
      <InstallAppCard />

      {/* PORTAL FEATURE */}
      <section className="bg-primary py-20 text-primary-foreground sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-primary-foreground/60">
                <span className="h-px w-8 bg-accent" />
                The learner portal
              </div>
              <h2 className="mt-4 font-display text-4xl font-medium leading-[1.1] sm:text-5xl">
                Everything you need <span className="italic text-accent">in one place.</span>
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed opacity-80">
                Lesson notes, payment history, theory revision and hazard perception — synced from your instructor's tablet after every session.
              </p>
              <Button asChild size="lg" className="mt-8 h-12 rounded-none bg-accent px-6 text-accent-foreground hover:bg-accent/90">
                <Link to="/dashboard">
                  Open your portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
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

      {/* CTA */}
      <section className="border-t border-border bg-accent text-accent-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <h2 className="max-w-xl font-display text-4xl font-medium leading-[1.05]">
            Ready to start? Get in Touch.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-14 rounded-none bg-[#25D366] px-8 text-white hover:bg-[#1ebe57]">
              <a
                href="https://wa.me/447961585231"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackContactClick("whatsapp", "Home bottom CTA")}
                className="inline-flex items-center gap-3"
              >
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp 07961 585231
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 rounded-none border-accent-foreground/30 bg-transparent px-8 text-accent-foreground hover:bg-accent-foreground hover:text-accent">
              <a
                href="tel:+447961585231"
                onClick={() => trackContactClick("phone", "Home bottom CTA")}
                className="inline-flex items-center gap-3"
              >
                <Phone className="h-5 w-5" />
                Call 07961 585231
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 rounded-none border-accent-foreground/30 bg-transparent px-8 text-accent-foreground hover:bg-accent-foreground hover:text-accent">
              <Link to="/#download-app" className="inline-flex items-center gap-3">
                <Download className="h-5 w-5" />
                Download the App
              </Link>
            </Button>
          </div>
        </div>
      </section>


    </div>
  );
}

