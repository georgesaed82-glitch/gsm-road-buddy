import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, ArrowRight, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { PhotoGallery } from "@/components/PhotoGallery";
import { InstallAppCard } from "@/components/InstallAppCard";
import { HomeSignsQuiz } from "@/components/HomeSignsQuiz";
import { HomeHazardQuiz } from "@/components/HomeHazardQuiz";

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

const areaLinks = [
  { slug: "notting-hill", label: "Notting Hill", postcode: "W11" },
  { slug: "kensington", label: "Kensington", postcode: "W8" },
  { slug: "holland-park", label: "Holland Park", postcode: "W14" },
  { slug: "bayswater", label: "Bayswater", postcode: "W2" },
  { slug: "shepherds-bush", label: "Shepherd's Bush", postcode: "W12" },
  { slug: "chiswick", label: "Chiswick", postcode: "W4" },
  { slug: "fulham", label: "Fulham", postcode: "SW6" },
];

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

      {/* DOWNLOAD APP */}
      <InstallAppCard />

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
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
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
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {areaLinks.map((a) => (
              <Link
                key={a.slug}
                to="/areas/$area"
                params={{ area: a.slug }}
                className="group rounded-lg border border-border bg-card px-5 py-4 transition-colors hover:bg-accent/5"
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{a.postcode}</div>
                <div className="mt-1 font-display text-lg text-foreground group-hover:text-primary">
                  Driving lessons in {a.label}
                </div>
              </Link>
            ))}
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

      {/* BOOK A DRIVING LESSON */}
      <BookingForm />

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
            Two mini quizzes, straight from the theory syllabus. Get it wrong and we explain why — that's how you actually learn.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Road signs
              </div>
              <HomeSignsQuiz />
            </div>
            <div>
              <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Hazard perception & anticipation
              </div>
              <HomeHazardQuiz />
            </div>
          </div>

          <div className="mt-8 text-sm text-muted-foreground">
            Want the full 14-category theory set, road markings, police signals, hazard clips and 50-question mock tests? They're all in the{" "}
            <Link to="/dashboard" className="font-medium text-primary underline underline-offset-4">learner portal</Link>.
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

      {/* CTA */}
      <section className="border-t border-border bg-accent text-accent-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <h2 className="max-w-xl font-display text-4xl font-medium leading-[1.05]">
            Ready to start? Call George.
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
          </div>
        </div>
      </section>
    </div>
  );
}

function BookingForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    postcode: "",
    transmission: "manual",
    availability: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    const name = form.name.trim();
    if (name.length < 2 || name.length > 100) next.name = "Enter your full name (2-100 characters)";
    const email = form.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) next.email = "Enter a valid email address";
    const phone = form.phone.trim();
    if (!/^[\d\s+()\-]{7,20}$/.test(phone)) next.phone = "Enter a valid phone number";
    const postcode = form.postcode.trim();
    if (!postcode || postcode.length > 20) next.postcode = "Enter your postcode (max 20 characters)";
    if (form.availability.trim().length > 200) next.availability = "Keep under 200 characters";
    if (form.message.trim().length > 500) next.message = "Keep under 500 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const text = [
      "Hi GSM Driving School, I'd like to book a driving lesson.",
      "",
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim().toLowerCase()}`,
      `Phone: ${form.phone.trim()}`,
      `Postcode: ${form.postcode.trim().toUpperCase()}`,
      `Transmission: ${form.transmission === "manual" ? "Manual" : "Automatic"}`,
      `Preferred times: ${form.availability.trim() || "Anytime"}`,
      ...(form.message.trim() ? [`Message: ${form.message.trim()}`] : []),
    ].join("\n");
    trackContactClick("whatsapp", "Book a driving lesson form");
    window.open(
      `https://wa.me/447961585231?text=${encodeURIComponent(text)}`,
      "_blank",
    );
    setSuccess(true);
  };

  if (success) {
    return (
      <section className="bg-muted py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="border border-border bg-background p-10 shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center bg-primary text-primary-foreground">
              <WhatsAppIcon className="h-7 w-7" />
            </div>
            <h2 className="mt-6 font-display text-3xl font-medium text-foreground">Your message is ready</h2>
            <p className="mt-3 text-muted-foreground">
              A WhatsApp chat has opened with your details. Send the message and George will confirm your availability.
            </p>
            <Button asChild size="lg" className="mt-8 h-12 rounded-none bg-primary px-6 text-primary-foreground hover:bg-primary/90">
              <a href="https://wa.me/447961585231" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                <WhatsAppIcon className="h-5 w-5" />
                Open WhatsApp again
              </a>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-muted py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border border-border bg-background p-5 shadow-xl sm:p-12 lg:p-16">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div className="min-w-0 text-center lg:text-left">
              <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground lg:justify-start">
                <span className="h-px w-8 bg-accent" />
                Book a driving lesson
              </div>
              <h2 className="mt-4 text-balance font-display text-[1.6rem] font-medium leading-[1.1] text-foreground sm:text-4xl lg:text-5xl">
                Get on the road <span className="italic text-accent">this week.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
                Tell us where you are, what you prefer, and when you are free. We will reply with availability and the best package for you.
              </p>
              <div className="mt-8 hidden lg:block">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>Prefer to call? 07961 585231</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" className="mt-1.5 rounded-none border-border bg-transparent" />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@email.com" className="mt-1.5 rounded-none border-border bg-transparent" />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="07..." className="mt-1.5 rounded-none border-border bg-transparent" />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="postcode">Postcode</Label>
                <Input id="postcode" value={form.postcode} onChange={(e) => update("postcode", e.target.value)} placeholder="W11 1DS" className="mt-1.5 rounded-none border-border bg-transparent" />
                {errors.postcode && <p className="mt-1 text-xs text-destructive">{errors.postcode}</p>}
              </div>
              <div>
                <Label>Transmission</Label>
                <div className="mt-1.5 flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="transmission" value="manual" checked={form.transmission === "manual"} onChange={(e) => update("transmission", e.target.value)} className="h-4 w-4 accent-primary" />
                    Manual
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="transmission" value="automatic" checked={form.transmission === "automatic"} onChange={(e) => update("transmission", e.target.value)} className="h-4 w-4 accent-primary" />
                    Automatic
                  </label>
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="availability">Preferred days / times</Label>
                <Input id="availability" value={form.availability} onChange={(e) => update("availability", e.target.value)} placeholder="e.g. Weekday evenings or Saturday mornings" className="mt-1.5 rounded-none border-border bg-transparent" />
                {errors.availability && <p className="mt-1 text-xs text-destructive">{errors.availability}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="message">Anything else we should know?</Label>
                <Textarea id="message" value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Previous experience, test date, or special requirements..." className="mt-1.5 min-h-[100px] rounded-none border-border bg-transparent" />
                {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" className="h-14 w-full rounded-none bg-primary px-8 text-primary-foreground hover:bg-primary/90">
                  <WhatsAppIcon className="mr-2 h-5 w-5" />
                  Request availability on WhatsApp
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  We will reply with available slots and pricing.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
