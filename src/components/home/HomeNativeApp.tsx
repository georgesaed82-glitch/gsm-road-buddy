import { Link } from "@tanstack/react-router";
import { Phone, Info, Car, Tag, BookOpen, Star, Users, Mail, ArrowRight, Sparkles, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { trackContactClick } from "@/lib/trackContactClick";
import logo from "@/assets/gsm-logo.jpeg.asset.json";

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

const POSTCODES = ["W2", "W3", "W4", "SW6", "W8", "W10", "W11", "W12", "W14"];

export function HomeNativeApp() {
  return (
    <div
      className="flex flex-col bg-background"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 56px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)",
      }}
    >
      {/* Hero */}
      <section className="px-5 pb-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-accent/40 bg-card shadow-[0_6px_20px_-8px_rgba(29,42,34,0.35)]">
          <img
            src={logo.url}
            alt="GSM Driving School"
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>
        <h1 className="mt-5 text-[26px] font-semibold leading-[1.15] tracking-tight text-primary">
          Drive today.{" "}
          <span className="text-accent">Succeed</span> tomorrow.
        </h1>
        <p className="mx-auto mt-2 max-w-[260px] text-[13px] leading-snug text-muted-foreground">
          West London driving school · since 2005
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <a
            href="tel:07515398010"
            onClick={() => trackContactClick("phone", "app_home_hero")}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-primary py-3.5 text-primary-foreground shadow-[0_4px_14px_-4px_rgba(29,42,34,0.4)] active:scale-[0.97] transition-transform"
          >
            <Phone className="h-5 w-5" />
            <span className="text-[12px] font-semibold">Call</span>
          </a>
          <a
            href="https://wa.me/447515398010"
            target="_blank"
            rel="noreferrer"
            onClick={() => trackContactClick("whatsapp", "app_home_hero")}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#25D366] py-3.5 text-white shadow-[0_4px_14px_-4px_rgba(37,211,102,0.5)] active:scale-[0.97] transition-transform"
          >
            <WhatsAppIcon className="h-5 w-5" />
            <span className="text-[12px] font-semibold">WhatsApp</span>
          </a>
          <Link
            to="/contact"
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-accent/60 bg-card py-3.5 text-primary shadow-[0_4px_14px_-4px_rgba(201,120,69,0.35)] active:scale-[0.97] transition-transform"
          >
            <Car className="h-5 w-5 text-accent" />
            <span className="text-[12px] font-semibold">Book</span>
          </Link>
        </div>
      </section>

      {/* Primary nav grid */}
      <section className="px-5 pt-2">
        <div className="grid grid-cols-2 gap-3.5">
          {NAV_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                to={card.href}
                className="flex min-h-[100px] flex-col items-center justify-center gap-2.5 rounded-2xl border border-border/50 bg-card p-4 text-center shadow-[0_2px_10px_-4px_rgba(29,42,34,0.12)] active:scale-[0.98] transition-transform"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/5">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
                <span className="text-[13.5px] font-semibold leading-tight text-primary">
                  {card.label}
                </span>
              </Link>
            );
          })}
          <Link
            to="/auth"
            className="col-span-2 flex min-h-[72px] items-center justify-between rounded-2xl border border-accent/40 bg-gradient-to-br from-primary to-[#1a3a29] px-4 py-3.5 text-primary-foreground shadow-[0_4px_16px_-6px_rgba(29,42,34,0.5)] active:scale-[0.98] transition-transform"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/20 text-accent">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="flex flex-col leading-tight text-left">
                <span className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold">GSM Plus</span>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    Soon
                  </span>
                </span>
                <span className="text-[12px] text-primary-foreground/75">
                  Premium learner platform
                </span>
              </span>
            </span>
            <ArrowRight className="h-5 w-5 text-accent" />
          </Link>
        </div>
      </section>

      {/* Postcodes covered */}
      <section className="px-5 pt-8">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-accent" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Postcodes covered
          </h2>
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-3">
          {POSTCODES.map((pc) => (
            <div
              key={pc}
              className="flex items-center justify-center rounded-lg border border-border/60 bg-card px-1 py-2 shadow-[0_2px_8px_-4px_rgba(29,42,34,0.12)]"
            >
              <span className="text-[13px] font-semibold tracking-wide text-primary">
                {pc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer meta */}
      <p className="mt-10 px-5 text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Notting Hill · Holland Park · Kensington
      </p>
    </div>
  );
}