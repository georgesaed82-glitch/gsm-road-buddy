import { Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, Car, MapPin, ShieldCheck, Phone } from "lucide-react";
import logo from "@/assets/gsm-logo.jpeg.asset.json";
import heroCarImage from "@/assets/gsm-hero-mercedes.jpg.asset.json";

const FEATURES = [
  { icon: Car, title: "Manual & Automatic", body: "Lessons to suit your needs" },
  { icon: MapPin, title: "Local Instructors", body: "Experienced, DVSA approved" },
  { icon: ShieldCheck, title: "Proven Success", body: "Helping learners since 2005" },
];

export function HomeNativeApp() {
  return (
    <div
      className="flex flex-col bg-background"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Header plate (matches web) */}
      <header className="relative overflow-hidden bg-[#234B36] px-5 pb-8 pt-5 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-accent/70 bg-white shadow-[0_6px_20px_-8px_rgba(0,0,0,0.4)]">
            <img src={logo.url} alt="GSM" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-[22px] font-black tracking-tight">
              GSM <span className="text-accent">DRIVING SCHOOL</span>
            </div>
            <div className="text-[13px] text-primary-foreground/80">
              George School of Motoring
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/90">
              Established 2005
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-accent/70" />
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroCarImage.url}
          alt="GSM Driving School Mercedes"
          className="h-[300px] w-full object-cover object-center"
          loading="eager"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 top-0 p-5">
          <h1 className="font-black leading-[0.95] tracking-tight text-white drop-shadow-lg">
            <span className="block text-[38px]">LEARN.</span>
            <span className="block text-[38px]">IMPROVE.</span>
            <span className="mt-1 block text-[32px] text-accent">PASS WITH</span>
            <span className="block text-[32px] text-accent">CONFIDENCE.</span>
          </h1>
          <p className="mt-3 max-w-[240px] text-[13px] font-medium leading-snug text-white/90 drop-shadow">
            Expert tuition, proven methods and a friendly approach.
          </p>
          <Link
            to="/contact"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_25px_-8px_rgba(201,120,69,0.6)] active:scale-[0.97] transition-transform"
          >
            Book a Lesson
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* GSM Plus banner */}
      <section className="px-4 pt-5">
        <Link
          to="/auth"
          className="relative flex items-center gap-3 overflow-hidden rounded-2xl bg-[#234B36] px-4 py-4 text-primary-foreground shadow-[0_10px_28px_-14px_rgba(29,42,34,0.5)]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="text-[17px] font-bold">
                GSM <span className="text-accent">PLUS+</span>
              </span>
              <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                Coming Soon
              </span>
            </span>
            <span className="mt-0.5 block text-[12px] text-primary-foreground/80">
              New learner portal launching soon
            </span>
          </span>
        </Link>
      </section>

      {/* 3 feature cards */}
      <section className="grid grid-cols-3 gap-2.5 px-4 pt-5">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="flex flex-col items-center rounded-2xl border border-border/50 bg-card px-2 py-4 text-center shadow-[0_2px_10px_-4px_rgba(29,42,34,0.12)]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#234B36] text-white">
                <Icon className="h-5 w-5" />
              </span>
              <div className="mt-2.5 text-[13px] font-bold leading-tight text-primary">
                {f.title}
              </div>
              <div className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
                {f.body}
              </div>
            </div>
          );
        })}
      </section>

      {/* Ready to start */}
      <section className="px-4 pt-5">
        <div className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#234B36] text-white">
            <Phone className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[14px] font-bold text-primary">Ready to Start?</div>
            <div className="text-[12px] text-muted-foreground">
              Get in touch today and take the first step.
            </div>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1 rounded-xl bg-[#234B36] px-3 py-2 text-[12px] font-semibold text-white shadow-sm active:scale-95 transition-transform"
          >
            Contact
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <p className="mt-6 px-6 text-center text-[11px] leading-snug text-muted-foreground">
        Independent UK driving theory resource. Not affiliated with or endorsed by the DVSA.
      </p>
    </div>
  );
}