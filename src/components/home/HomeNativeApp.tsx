import { Link } from "@tanstack/react-router";
import { Phone, Info, Car, Tag, BookOpen, Star, Users, Mail, ArrowRight, Sparkles } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { trackContactClick } from "@/lib/trackContactClick";
import logo from "@/assets/gsm-logo.jpeg.asset.json";
import g0 from "@/assets/gallery/gsm-gallery-0.jpg.asset.json";
import g1 from "@/assets/gallery/gsm-gallery-1.jpg.asset.json";
import g2 from "@/assets/gallery/gsm-gallery-2.jpg.asset.json";
import g3 from "@/assets/gallery/gsm-gallery-3.jpg.asset.json";
import g4 from "@/assets/gallery/gsm-gallery-4.jpg.asset.json";
import g5 from "@/assets/gallery/gsm-gallery-5.jpg.asset.json";
import { reviews } from "@/data/reviews";

const PASS_PHOTOS = [g0, g1, g2, g3, g4, g5].map((i) => i.url);

type NavCard = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_CARDS: NavCard[] = [
  { label: "About", href: "/about", icon: Info },
  { label: "Practical Lessons", href: "/services", icon: Car },
  { label: "Prices & Packages", href: "/pricing", icon: Tag },
  { label: "Theory Training", href: "/theory", icon: BookOpen },
  { label: "Reviews", href: "/reviews", icon: Star },
  { label: "Instructors", href: "/instructors", icon: Users },
  { label: "Contact", href: "/contact", icon: Mail },
];

export function HomeNativeApp() {
  const featured = reviews[0];
  return (
    <div className="flex flex-col bg-background pb-10">
      {/* Hero */}
      <section className="px-4 pt-6 pb-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-accent/50 bg-card shadow-[0_6px_20px_-8px_rgba(29,42,34,0.35)]">
          <img
            src={logo.url}
            alt="GSM Driving School"
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>
        <h1 className="mt-4 text-[26px] font-black leading-tight tracking-tight text-primary">
          Drive today.{" "}
          <span className="text-accent">Succeed</span> tomorrow.
        </h1>
        <p className="mx-auto mt-2 max-w-[280px] text-[13px] leading-snug text-muted-foreground">
          West London's original driving school — since 2005.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <a
            href="tel:07515398010"
            onClick={() => trackContactClick("phone", "app_home_hero")}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-primary py-3 text-primary-foreground shadow-[0_4px_14px_-4px_rgba(29,42,34,0.4)] active:scale-[0.97] transition-transform"
          >
            <Phone className="h-5 w-5" />
            <span className="text-[12px] font-semibold">Call</span>
          </a>
          <a
            href="https://wa.me/447515398010"
            target="_blank"
            rel="noreferrer"
            onClick={() => trackContactClick("whatsapp", "app_home_hero")}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#25D366] py-3 text-white shadow-[0_4px_14px_-4px_rgba(37,211,102,0.5)] active:scale-[0.97] transition-transform"
          >
            <WhatsAppIcon className="h-5 w-5" />
            <span className="text-[12px] font-semibold">WhatsApp</span>
          </a>
          <Link
            to="/contact"
            className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-accent/60 bg-card py-3 text-primary shadow-[0_4px_14px_-4px_rgba(201,120,69,0.35)] active:scale-[0.97] transition-transform"
          >
            <Car className="h-5 w-5 text-accent" />
            <span className="text-[12px] font-semibold">Book</span>
          </Link>
        </div>
      </section>

      {/* Primary nav grid */}
      <section className="px-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          {NAV_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                to={card.href}
                className="flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card p-3 text-center shadow-[0_2px_10px_-4px_rgba(29,42,34,0.15)] active:scale-[0.98] transition-transform"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/5">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
                </span>
                <span className="text-[14px] font-semibold leading-tight text-primary">
                  {card.label}
                </span>
              </Link>
            );
          })}
          <Link
            to="/auth"
            className="col-span-2 flex min-h-[76px] items-center justify-between rounded-2xl border border-accent/50 bg-gradient-to-br from-primary to-[#1a3a29] px-4 py-3 text-primary-foreground shadow-[0_4px_16px_-6px_rgba(29,42,34,0.5)] active:scale-[0.98] transition-transform"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/20 text-accent">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="flex flex-col leading-tight text-left">
                <span className="flex items-center gap-2">
                  <span className="text-[15px] font-bold">GSM Plus</span>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    Coming Soon
                  </span>
                </span>
                <span className="text-[12px] text-primary-foreground/80">
                  Premium learning platform
                </span>
              </span>
            </span>
            <ArrowRight className="h-5 w-5 text-accent" />
          </Link>
        </div>
      </section>

      {/* Recent passes strip */}
      <section className="mt-6 px-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-primary">Recent passes</h2>
          <Link to="/reviews" className="text-[12px] font-semibold text-accent">
            View all
          </Link>
        </div>
        <div className="-mx-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2.5 px-4 pb-1">
            {PASS_PHOTOS.map((src, i) => (
              <div
                key={i}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm"
              >
                <img
                  src={src}
                  alt="GSM pass"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured review */}
      {featured && (
        <section className="mt-6 px-4">
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-[0_2px_10px_-4px_rgba(29,42,34,0.15)]">
            <div className="mb-2 flex items-center gap-1 text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <p className="text-[13px] leading-relaxed text-foreground line-clamp-4">
              "{featured.quote}"
            </p>
            <p className="mt-2 text-[12px] font-semibold text-primary">
              — {featured.name}
              <span className="font-normal text-muted-foreground"> · {featured.note}</span>
            </p>
            <Link
              to="/reviews"
              className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-accent"
            >
              See all reviews <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* Contact block */}
      <section className="mt-6 px-4">
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-[0_2px_10px_-4px_rgba(29,42,34,0.15)]">
          <h2 className="text-[16px] font-bold text-primary">Get in touch</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Notting Hill · Holland Park · West London
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <a
              href="tel:07515398010"
              onClick={() => trackContactClick("phone", "app_home_contact")}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground active:scale-[0.97] transition-transform"
            >
              <Phone className="h-4 w-4" /> Call
            </a>
            <a
              href="https://wa.me/447515398010"
              target="_blank"
              rel="noreferrer"
              onClick={() => trackContactClick("whatsapp", "app_home_contact")}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-[13px] font-semibold text-white active:scale-[0.97] transition-transform"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}