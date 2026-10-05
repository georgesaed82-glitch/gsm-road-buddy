import { useState, useEffect, useRef } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Menu as MenuIcon,
  Phone,
  ChevronRight,
  UserCog,
  LogOut,
  Info,
  Car,
  CreditCard,
  Star,
  Newspaper,
  Home,
  Users,
  Trophy,
  MapPin,
  ShieldCheck,
  Youtube,
  PoundSterling,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/components/LanguageSelector";
import { BLOG_ENABLED } from "@/lib/featureFlags";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { BottomTabBar } from "@/components/BottomTabBar";
import brandArt from "@/assets/gsm-youtube-branding.png.asset.json";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Info;
  desc?: string;
};

const PRIMARY_NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home, desc: "Back to homepage" },
  { to: "/about", label: "About Us", icon: Info, desc: "Since 2005" },
  { to: "/reviews", label: "Reviews", icon: Star, desc: "What learners say" },
  { to: "/passes", label: "Passed Students", icon: Trophy, desc: "Test pass photos" },
  { to: "/areas", label: "Areas We Cover", icon: MapPin, desc: "West London" },
  { to: "/instructors", label: "Instructors", icon: Users, desc: "Meet the team" },
  { to: "/pricing", label: "Pricing", icon: PoundSterling, desc: "£45–£70 per hour" },
  { to: "/contact", label: "Contact Us", icon: Phone, desc: "Call, WhatsApp, email" },
];

const BLOG_ITEM: NavItem = { to: "/blog", label: "Blog", icon: Newspaper, desc: "News & tips" };

/** The GSM YouTube channel artwork, framed to keep emblem, wordmark and car visible. */
export function BrandBanner({ wide = false }: { wide?: boolean } = {}) {
  return (
    <Link
      to="/"
      aria-label="GSM Driving School — Home"
      className={`block min-w-0 flex-1 overflow-hidden rounded-2xl sm:w-[400px] sm:flex-none ${wide ? "lg:w-auto lg:flex-1" : "lg:w-[520px]"} border border-accent/50 shadow-md outline-none focus-visible:ring-2 focus-visible:ring-accent`}
    >
      <span
        role="img"
        aria-label="GSM Driving School, West London, Est. 2005 — emblem, wordmark and learner car"
        className={`block aspect-[3.3/1] w-full bg-no-repeat ${wide ? "lg:aspect-auto lg:h-[158px] lg:bg-cover" : ""}`}
        style={{
          backgroundImage: `url(${brandArt.url})`,
          backgroundSize: "150% auto",
          backgroundPosition: "64% 51%",
        }}
      />
    </Link>
  );
}

export function Header({ showTabs = true }: { showTabs?: boolean } = {}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { business } = useSiteSettings();
  const headerRef = useRef<HTMLElement>(null);

  // Publish the real header height so sticky bars (HomeSectionNav) sit just below it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const root = document.documentElement;
    const set = () => root.style.setProperty("--site-header-h", `${Math.round(el.getBoundingClientRect().height)}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--site-header-h");
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSheetOpen(false);
    navigate({ to: "/", replace: true });
  };

  const circleIconBtn =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-accent/80 bg-card text-primary shadow-sm transition-colors hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent xl:h-10 xl:w-10";

  const navItems: NavItem[] = BLOG_ENABLED ? [...PRIMARY_NAV, BLOG_ITEM] : PRIMARY_NAV;

  const renderNavCard = (item: NavItem, opts: { compact?: boolean } = {}) => {
    const Icon = item.icon;
    const active = item.to === "/" ? pathname === "/" : pathname === item.to;
    return (
      <Link
        key={`${item.label}`}
        to={item.to}
        onClick={() => setSheetOpen(false)}
        className={cn(
          "group relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 bg-card px-3.5 py-3 text-left shadow-[0_5px_0_0_var(--primary),0_12px_20px_-10px_rgba(0,0,0,0.35)] transition-all duration-150 hover:-translate-y-0.5 hover:border-accent/60 active:translate-y-1 active:shadow-[0_1px_0_0_var(--primary)]",
          active ? "border-primary bg-accent/10 text-primary" : "border-primary/40 text-foreground",
        )}
      >
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-full border border-accent/50 bg-primary text-accent",
            opts.compact ? "h-10 w-10" : "h-11 w-11",
          )}
        >
          <Icon className={cn(opts.compact ? "h-4 w-4" : "h-5 w-5")} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14.5px] font-semibold leading-tight">
            {item.label}
          </span>
          {item.desc ? (
            <span className="block truncate text-[11.5px] font-medium text-muted-foreground">
              {item.desc}
            </span>
          ) : null}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-accent" />
      </Link>
    );
  };

  return (
    <header ref={headerRef} className={cn("sticky top-0 w-full bg-background/95", sheetOpen ? "z-40" : "z-[120]")}>
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-2 py-2 sm:gap-3 sm:px-4 lg:max-w-[1220px] lg:px-8">
        <BrandBanner wide={pathname === "/"} />

        <div className="grid shrink-0 grid-cols-1 gap-1.5 lg:ml-auto sm:flex sm:items-center sm:gap-2">
          {/* Single menu/dialog owner */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button type="button" aria-label="Open menu" className={cn(circleIconBtn, "border-2 border-primary shadow-[0_3px_0_0_var(--primary),0_6px_10px_-4px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--primary)]")}>
                <MenuIcon className="h-5 w-5 text-accent" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden overscroll-contain border-0 bg-background p-0 shadow-2xl sm:!max-w-none lg:flex-row"
              onInteractOutside={(e) => {
                const target = e.target as HTMLElement | null;
                if (
                  target?.closest(
                    "[data-radix-popper-content-wrapper], [data-language-menu], [data-radix-popover-content]",
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>

              <aside
                className="relative flex shrink-0 flex-col justify-between overflow-hidden bg-primary px-5 py-4 text-primary-foreground lg:w-[380px] lg:px-8 lg:py-8 xl:w-[440px]"
                style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 16px)" }}
              >
                <div className="relative">
                  <p className="hidden text-[11px] font-semibold uppercase tracking-[0.32em] text-accent lg:block">
                    Established 2005
                  </p>
                  <Link
                    to="/"
                    onClick={() => setSheetOpen(false)}
                    aria-label="GSM Driving School — Home"
                    className="block w-[min(78vw,340px)] overflow-hidden rounded-2xl border-2 border-accent/60 shadow-[0_4px_0_0_rgba(0,0,0,0.35)] lg:mt-3 lg:w-full"
                  >
                    <span
                      role="img"
                      aria-label="GSM Driving School, West London, Est. 2005 — emblem, wordmark and learner car"
                      className="block aspect-[3.3/1] w-full bg-no-repeat"
                      style={{ backgroundImage: `url(${brandArt.url})`, backgroundSize: "150% auto", backgroundPosition: "64% 51%" }}
                    />
                  </Link>
                </div>

                <div className="relative hidden lg:block">
                  <p className="max-w-[300px] text-[22px] font-semibold leading-tight">
                    Drive today. <span className="text-accent">Succeed</span> tomorrow.
                  </p>
                  <p className="mt-3 max-w-[300px] text-[13px] leading-relaxed text-primary-foreground/80">
                    Patient manual and automatic lessons around Notting Hill, Kensington &amp;
                    West London since 2005.
                  </p>
                </div>

                <div className="relative hidden lg:flex lg:flex-col lg:gap-2 lg:text-[12.5px] lg:text-primary-foreground/85">
                  <a
                    href={`tel:+${business.phone_intl}`}
                    className="inline-flex items-center gap-2 hover:text-accent"
                  >
                    <Phone className="h-3.5 w-3.5 text-accent" /> {business.phone}
                  </a>
                  <p className="opacity-75">Manual &amp; Automatic · Beginner to Test</p>
                </div>
              </aside>

              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between border-b border-border/60 px-4 pb-4 pt-3 lg:px-8 lg:py-4">
                  <a
                    href={`tel:+${business.phone_intl}`}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-card px-4 py-2 text-base font-extrabold text-primary shadow-[0_4px_0_0_var(--primary),0_8px_14px_-6px_rgba(0,0,0,0.35)] transition-transform active:translate-y-1 active:shadow-[0_1px_0_0_var(--primary)] lg:hidden"
                  >
                    <Phone className="h-5 w-5 text-primary" /> Call {business.phone}
                  </a>
                  <p className="hidden text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground lg:block">
                    Navigate
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-8 lg:py-6">
                  <nav aria-label="Main" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {navItems.map((item) => renderNavCard(item))}
                  </nav>

                  {isAuthed ? (
                    <div className="mt-4">
                      <Button className="w-full rounded-full" variant="outline" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" /> Sign out
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {isAuthed ? (
            <button type="button" onClick={handleSignOut} aria-label="Sign out" className={circleIconBtn}>
              <LogOut className="h-5 w-5" />
            </button>
          ) : (
            <Link to="/auth" search={{ admin: 1 }} aria-label="Secure admin login" className={cn(circleIconBtn, "border-2 border-primary bg-card shadow-[0_3px_0_0_var(--primary),0_6px_10px_-4px_rgba(0,0,0,0.35)] transition-transform active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--primary)]")}>
              <UserCog className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
      {showTabs ? <BottomTabBar placement="top" /> : null}
    </header>
  );
}
