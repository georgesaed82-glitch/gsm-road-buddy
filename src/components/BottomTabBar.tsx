import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Car, BookOpen, GraduationCap, Phone, Youtube, Mail, MessageCircle, ChevronRight, Star } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BUSINESS } from "@/lib/business";
import { cn } from "@/lib/utils";
import { useIsNativeApp } from "@/lib/isNativeApp";

type Tab = {
  to: string;
  label: string;
  icon: typeof Home;
  match: (p: string) => boolean;
};

const HOME: Tab = { to: "/", label: "Home", icon: Home, match: (p) => p === "/" };
const LESSONS: Tab = { to: "/services", label: "Lessons", icon: Car, match: (p) => p.startsWith("/services") };
const CONTACT: Tab = { to: "/contact", label: "Contact", icon: Phone, match: (p) => p.startsWith("/contact") };

/** Public website tabs: no theory practice or GSM Plus promotion. */
const REVIEWS: Tab = { to: "/reviews", label: "Reviews", icon: Star, match: (p) => p.startsWith("/reviews") };

const WEB_TABS: Tab[] = [
  HOME,
  LESSONS,
  REVIEWS,
  { to: "/youtube", label: "Videos", icon: Youtube, match: (p) => p.startsWith("/youtube") },
  CONTACT,
];

/** Native app keeps its existing tabs. */
const NATIVE_TABS: Tab[] = [
  HOME,
  LESSONS,
  { to: "/theory", label: "Theory", icon: BookOpen, match: (p) => p.startsWith("/theory") },
  { to: "/auth", label: "GSM Plus", icon: GraduationCap, match: (p) => p.startsWith("/auth") || p.startsWith("/gsm-plus") },
  CONTACT,
];

export function BottomTabBar({ placement = "bottom" }: { placement?: "bottom" | "top" }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isNative = useIsNativeApp();
  const tabs = isNative ? NATIVE_TABS : WEB_TABS;
  const top = placement === "top";

  return (
    <nav
      aria-label="Primary"
      style={
        top
          ? { boxShadow: "0 4px 0 0 #0b231c, 0 10px 18px -8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)" }
          : {
              paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
              boxShadow: "0 -12px 30px -18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
            }
      }
      className={
        top
          ? "mx-2 mb-2 rounded-2xl border border-primary-foreground/10 bg-[var(--brand-dark)] pb-1.5 sm:mx-4 lg:mx-auto lg:max-w-[1156px]"
          : "fixed inset-x-0 bottom-0 z-40 border-t border-primary-foreground/10 bg-[var(--brand-dark)]"
      }
    >
      <div className="mx-auto flex max-w-3xl items-stretch justify-between px-2 pt-1.5 sm:px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.match(pathname);
          if (tab === CONTACT) return <ContactTab key="contact" active={active} />;
          if (tab === REVIEWS)
            return (
              <Link
                key="reviews"
                to="/reviews"
                aria-current={active ? "page" : undefined}
                aria-label="Reviews"
                className={cn(
                  "btn-3d mx-0.5 flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl border-2 px-1 py-1.5 text-[11px] font-extrabold leading-none transition-all duration-200",
                  active
                    ? "border-primary-foreground/60 bg-accent text-accent-foreground"
                    : "border-accent/70 bg-accent/90 text-accent-foreground hover:bg-accent",
                )}
              >
                <Star className="h-5 w-5" strokeWidth={2.5} />
                <span className="tracking-tight">Reviews</span>
              </Link>
            );
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={active ? "page" : undefined}
              aria-label={tab.label}
              className={cn(
                "group relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-medium leading-none transition-all duration-200 ease-out",
                active ? "text-accent" : "text-primary-foreground/80 hover:text-primary-foreground",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-4 top-0 h-0.5 rounded-full bg-accent transition-transform duration-200 ease-out",
                  active ? "scale-x-100" : "scale-x-0",
                )}
              />
              <Icon className={cn("h-5 w-5", active && "scale-110")} strokeWidth={active ? 2.5 : 2} />
              <span className="tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

const quickBtn =
  "flex items-center gap-3 rounded-xl border-2 border-primary bg-card px-3 py-2.5 text-sm font-bold text-primary shadow-[0_3px_0_0_var(--primary)] active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--primary)]";

function ContactTab({ active }: { active: boolean }) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Contact"
        className={cn(
          "group relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-medium leading-none transition-all duration-200 ease-out",
          active ? "text-accent" : "text-primary-foreground/80 hover:text-primary-foreground",
        )}
      >
        <Phone className={cn("h-5 w-5", active && "scale-110")} strokeWidth={active ? 2.5 : 2} />
        <span className="tracking-tight">Contact</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="z-[150] w-64 space-y-2 rounded-2xl border-2 border-primary bg-background p-3">
        <a href={`tel:+${BUSINESS.phoneIntl}`} className={quickBtn}>
          <Phone className="h-4 w-4" /> Call {BUSINESS.phone}
        </a>
        <a href={`https://wa.me/${BUSINESS.phoneIntl}`} target="_blank" rel="noopener noreferrer" className={quickBtn}>
          <MessageCircle className="h-4 w-4" /> WhatsApp us
        </a>
        <a href={`mailto:${BUSINESS.email}`} className={quickBtn}>
          <Mail className="h-4 w-4" /> Email us
        </a>
        <Link to="/contact" className="flex items-center justify-between px-1 pt-1 text-xs font-semibold text-muted-foreground hover:text-primary">
          All contact details <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </PopoverContent>
    </Popover>
  );
}
