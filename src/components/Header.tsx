import { useState, useEffect } from "react";
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
  BookOpen,
  Newspaper,
  GraduationCap,
  Home,
  Users,
  Trophy,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/components/LanguageSelector";
import { BLOG_ENABLED } from "@/lib/featureFlags";
import { DVSADisclaimer } from "@/components/DVSADisclaimer";
import { GsmPlus } from "@/components/GsmPlus";
import { BrandPlate } from "@/components/BrandPlate";
type NavItem = {
  to: string;
  label: string;
  icon: typeof Info;
  hash?: string;
  desc?: string;
};

const PRIMARY_NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home, desc: "Back to homepage" },
  { to: "/about", label: "About", icon: Info, desc: "Our story" },
  { to: "/services", label: "Practical Lessons", icon: Car, desc: "Manual & automatic" },
  { to: "/pricing", label: "Prices & Packages", icon: CreditCard, desc: "Rates & deals" },
  { to: "/theory", label: "Theory Training", icon: BookOpen, desc: "Pass the theory test" },
  { to: "/reviews", label: "Reviews", icon: Star, desc: "What learners say" },
  { to: "/instructors", label: "Instructor Team", icon: Users, desc: "Meet the team" },
  { to: "/contact", label: "Contact Us", icon: Phone, desc: "Call, WhatsApp, email" },
];

const EXPLORE_NAV: NavItem[] = [
  { to: "/", hash: "why-gsm", label: "Why GSM", icon: ShieldCheck, desc: "Our approach" },
  { to: "/", hash: "areas", label: "Areas Covered", icon: MapPin, desc: "West London" },
  { to: "/", hash: "recent-pass", label: "Recently Passed", icon: Trophy, desc: "Fresh test passes" },
  { to: "/auth", label: "GSM Plus+", icon: Sparkles, desc: "Coming soon" },
];

const BLOG_ITEM: NavItem = { to: "/blog", label: "Blog", icon: Newspaper, desc: "News & tips" };

export function Header() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

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
    "inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card text-primary shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:h-9 sm:w-9 lg:h-9 lg:w-9 xl:h-10 xl:w-10";
  const circleIconBtnStyle = { borderColor: "rgba(198,135,60,0.85)" } as const;

  const exploreItems: NavItem[] = BLOG_ENABLED ? [...EXPLORE_NAV, BLOG_ITEM] : EXPLORE_NAV;

  const renderNavCard = (item: NavItem, opts: { compact?: boolean } = {}) => {
    const Icon = item.icon;
    const active =
      !item.hash && (item.to === "/" ? pathname === "/" : pathname === item.to);
    return (
      <Link
        key={`${item.to}${item.hash ?? ""}`}
        to={item.to}
        hash={item.hash}
        onClick={() => setSheetOpen(false)}
        className={cn(
          "group relative flex items-center gap-3 overflow-hidden rounded-2xl border bg-card px-3.5 py-3 text-left shadow-[0_2px_10px_-4px_rgba(29,42,34,0.18)] transition-all duration-200 active:scale-[0.98]",
          "hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-[0_10px_24px_-12px_rgba(29,42,34,0.35)]",
          "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:origin-left before:scale-x-0 before:bg-gradient-to-r before:from-accent before:to-accent/40 before:transition-transform before:duration-300 hover:before:scale-x-100",
          active
            ? "border-accent/70 bg-accent/10 text-primary"
            : "border-border/60 text-foreground",
        )}
      >
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-full border border-accent/50 bg-primary text-accent shadow-sm transition-transform duration-200 group-hover:scale-105",
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
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent" />
      </Link>
    );
  };

  const actions = (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Open menu"
            className={circleIconBtn}
            style={circleIconBtnStyle}
          >
            <MenuIcon className="h-5 w-5 text-accent" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden overscroll-contain border-0 bg-background p-0 shadow-2xl sm:!max-w-none lg:flex-row"
          onInteractOutside={(e) => {
            // Keep the menu open when the user is interacting with a
            // Radix popover that renders through a portal outside the
            // sheet (e.g. the language selector list). Without this the
            // sheet closes before the tap on a language registers.
            const target = e.target as HTMLElement | null;
            if (
              target?.closest(
                '[data-radix-popper-content-wrapper], [data-language-menu], [data-radix-popover-content]',
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>

          {/* Left brand column — GSM green with gold accents. Full height on desktop, slim header on mobile. */}
          <aside
            className="relative flex shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-[#1a3a29] px-5 py-4 text-primary-foreground lg:w-[380px] lg:px-8 lg:py-8 xl:w-[440px]"
            style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 16px)" }}
          >
            {/* Decorative gold rings */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-accent/30"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-accent/20"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,120,69,0.15),transparent_55%)]"
            />

            <div className="relative flex items-center justify-between gap-3 lg:block">
              <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-4">
                <div className="hidden lg:block">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
                    Established 2005
                  </p>
                </div>
                <p className="text-lg font-black tracking-tight lg:text-3xl">
                  GSM Driving School
                </p>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <p className="max-w-[300px] text-[22px] font-semibold leading-tight">
                Drive today. <span className="text-accent">Succeed</span> tomorrow.
              </p>
              <p className="mt-3 max-w-[300px] text-[13px] leading-relaxed text-primary-foreground/75">
                West London&apos;s original driving school — 20+ years teaching new drivers around
                Notting Hill, Holland Park &amp; beyond.
              </p>

              <Link
                to="/auth"
                onClick={() => setSheetOpen(false)}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/60 bg-accent/15 px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-accent transition-colors hover:bg-accent/25"
              >
                <Sparkles className="h-3.5 w-3.5" /> GSM Plus+ coming soon
              </Link>
            </div>

            <div className="relative hidden lg:flex lg:flex-col lg:gap-2 lg:text-[12.5px] lg:text-primary-foreground/80">
              <a
                href="tel:07515398010"
                className="inline-flex items-center gap-2 hover:text-accent"
              >
                <Phone className="h-3.5 w-3.5 text-accent" /> 07515 398010
              </a>
              <p className="opacity-70">Manual &amp; Automatic · Beginner to Test</p>
            </div>
          </aside>

          {/* Right navigation column — fills remaining space. */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 lg:px-8 lg:py-4">
              <BrandPlate size="xs" className="max-w-[70%] lg:hidden" />
              <p className="hidden text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground lg:block">
                Navigate
              </p>
              <LanguageSelector variant="icon" side="bottom" align="end" />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-8 lg:py-6">
              {/* GSM Plus feature card */}
              <Link
                to="/auth"
                onClick={() => setSheetOpen(false)}
                className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-accent/50 bg-gradient-to-br from-primary to-primary/85 px-4 py-3.5 shadow-md transition-transform duration-200 active:scale-[0.98] hover:-translate-y-0.5 lg:hidden"
                aria-label="GSM Plus+ coming soon — learn more"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-primary-foreground shadow-inner">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-2">
                    <GsmPlus
                      className="text-[17px]"
                      gsmClassName="text-primary-foreground"
                      plusClassName="text-accent"
                    />
                    <span className="rounded-full border border-accent/50 bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground shadow-sm">
                      Coming Soon
                    </span>
                  </span>
                  <span className="text-[11px] font-medium text-primary-foreground/80">
                    New learner portal launching soon
                  </span>
                </span>
              </Link>

              <div className="mt-4 lg:mt-0">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Main
                </p>
                <nav className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {PRIMARY_NAV.map((item) => renderNavCard(item))}
                </nav>
              </div>

              <div className="mt-6">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Explore
                </p>
                <nav className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {exploreItems.map((item) => renderNavCard(item, { compact: true }))}
                </nav>
              </div>

              <div className="mt-6 border-t border-border/60 pt-4">
                <LanguageSelector variant="menu-row" side="top" align="end" />
              </div>

              {isAuthed ? (
                <div className="mt-4">
                  <Button className="w-full rounded-full" variant="outline" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-border/60 bg-background px-5 py-3">
              <DVSADisclaimer variant="compact" />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop globe: compact popover language switcher */}
      <span className="hidden sm:inline-flex">
        <LanguageSelector variant="icon" side="bottom" align="end" />
      </span>

      {isAuthed ? (
        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out"
          className={circleIconBtn}
          style={circleIconBtnStyle}
        >
          <LogOut className="h-5 w-5" />
        </button>
      ) : (
        <Link
          to="/auth"
          search={{ admin: 1 }}
          aria-label="Admin login"
          className={circleIconBtn}
          style={circleIconBtnStyle}
        >
          <UserCog className="h-5 w-5" />
        </Link>
      )}
    </>
  );

  return (
    <header
      className="sticky top-0 z-[120] w-full bg-background/95 supports-[backdrop-filter]:bg-background/95"
    >
      <div className="mx-auto w-full max-w-7xl px-2 py-2 sm:px-4 sm:py-2.5 lg:max-w-[1220px] lg:px-8 lg:py-1 xl:py-1.5">
        <div className="sm:hidden">
          <BrandPlate size="xs" fill homeLink rightSlot={actions} />
        </div>
        <div className="hidden sm:block lg:hidden">
          <BrandPlate size="sm" fill homeLink rightSlot={actions} />
        </div>
        <div className="hidden lg:block">
          <BrandPlate size="hero" fill homeLink rightSlot={actions} />
        </div>
      </div>
    </header>
  );
}

