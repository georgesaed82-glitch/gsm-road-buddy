import { useState, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Menu as MenuIcon,
  Phone,
  ChevronDown,
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
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/components/LanguageSelector";
import { DVSADisclaimer } from "@/components/DVSADisclaimer";
import { GsmPlus } from "@/components/GsmPlus";
import { BrandPlate } from "@/components/BrandPlate";

const NAV_LINKS: { to: string; label: string; icon: typeof Info }[] = [
  { to: "/about", label: "About", icon: Info },
  { to: "/services", label: "Practical Lessons", icon: Car },
  { to: "/pricing", label: "Prices & Packages", icon: CreditCard },
  { to: "/theory", label: "Theory Training", icon: BookOpen },
  { to: "/reviews", label: "Reviews", icon: Star },
  { to: "/blog", label: "Blog", icon: Newspaper },
];

function ContactPanel({
  business,
  onItemClick,
}: {
  business: ReturnType<typeof useSiteSettings>["business"];
  onItemClick?: () => void;
}) {
  const whatsappHref = `https://wa.me/${business.phone_intl}`;
  const emailHref = `mailto:${business.email}`;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    business.address,
  )}`;
  const row =
    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/10";
  const iconWrap =
    "grid h-9 w-9 shrink-0 place-items-center rounded-full text-primary-foreground shadow-sm";
  return (
    <div className="flex flex-col gap-1">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          trackContactClick("whatsapp", "Header contact panel");
          onItemClick?.();
        }}
        className={row}
      >
        <span className={cn(iconWrap, "bg-[#25D366]")}>
          <WhatsAppIcon className="h-4 w-4 text-white" />
        </span>
        <span className="min-w-0 truncate">{business.phone}</span>
      </a>
      <a
        href={emailHref}
        onClick={() => {
          trackContactClick("email", "Header contact panel");
          onItemClick?.();
        }}
        className={row}
      >
        <span className={cn(iconWrap, "bg-accent")}>
          <Mail className="h-4 w-4" />
        </span>
        <span className="min-w-0 truncate">{business.email}</span>
      </a>
      <a
        href={mapHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onItemClick}
        className={row}
      >
        <span className={cn(iconWrap, "bg-primary")}>
          <MapPin className="h-4 w-4" />
        </span>
        <span className="min-w-0">GSM Driving School</span>
      </a>
    </div>
  );
}

export function Header() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [languagesMobileOpen, setLanguagesMobileOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { business } = useSiteSettings();

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
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

  return (
    <header className="sticky top-0 z-[120] w-full border-b-2 border-accent bg-card/95 shadow-[0_4px_14px_-8px_rgba(29,42,34,0.25)] backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <div className="mx-auto flex min-h-[76px] w-full max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4 lg:px-8">
        {/* Left spacer (desktop only) — balances the actions on the right so the brand sits centred */}
        <div className="hidden lg:block" aria-hidden="true" />

        {/* Brand */}
        <Link
          to="/"
          className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4 lg:flex-none lg:justify-self-center"
          aria-label="GSM Driving School — home"
        >
          <BrandPlate size="sm" className="max-w-full lg:hidden" />
          <BrandPlate size="md" className="hidden max-w-full lg:inline-flex" />
        </Link>

        {/* Actions (same premium sheet menu on mobile and desktop) */}
        <div className="flex shrink-0 items-center gap-2 lg:justify-self-end">
          {/* Desktop-only GSM PLUS+ pill (mobile has it inside the sheet) */}
          <Link
            to="/auth"
            aria-label="Open GSM Plus learner portal"
            className="hidden lg:inline-flex h-11 items-center gap-2 rounded-full border border-accent/60 bg-gradient-to-r from-primary to-primary/90 px-4 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-primary-foreground">
              <GraduationCap className="h-3.5 w-3.5" />
            </span>
            <GsmPlus
              gsmClassName="text-primary-foreground"
              plusClassName="text-accent"
            />
          </Link>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className={cn(
                  circleIconBtn,
                  "lg:w-auto lg:gap-2 lg:px-4 lg:text-sm lg:font-semibold",
                )}
              >
                <MenuIcon className="h-5 w-5 text-accent" />
                <span className="hidden lg:inline">Menu</span>
                <ChevronDown className="hidden h-4 w-4 opacity-70 lg:inline" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[320px] flex-col overflow-hidden overscroll-contain bg-background p-0 sm:w-[360px]"
            >
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>

              <div className="flex items-center justify-center border-b border-accent/30 px-3 py-2.5">
                <BrandPlate size="xs" className="max-w-full" />
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                {/* GSM Plus feature card */}
                <Link
                  to="/auth"
                  onClick={() => setSheetOpen(false)}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-accent/50 bg-gradient-to-br from-primary to-primary/85 px-4 py-3.5 shadow-md"
                  aria-label="Open GSM Plus learner portal"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-primary-foreground shadow-inner">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <GsmPlus
                      className="text-[17px]"
                      gsmClassName="text-primary-foreground"
                      plusClassName="text-accent"
                    />
                    <span className="text-[11px] font-medium text-primary-foreground/80">
                      Learner portal · sign in
                    </span>
                  </span>
                </Link>

                <nav className="mt-4 flex flex-col gap-2.5">
                  {NAV_LINKS.map((link) => {
                    const Icon = link.icon;
                    const active = pathname === link.to;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setSheetOpen(false)}
                        className={cn(
                          "group flex items-center gap-3 rounded-2xl border bg-card px-3 py-3 text-[15px] font-semibold shadow-[0_2px_10px_-4px_rgba(29,42,34,0.18)] transition-all active:scale-[0.98]",
                          active
                            ? "border-accent/60 bg-accent/10 text-primary"
                            : "border-border/60 text-foreground hover:-translate-y-0.5 hover:border-accent/40",
                        )}
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-accent/50 bg-primary text-accent shadow-sm">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="h-8 w-px shrink-0 bg-border/70" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate">{link.label}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </Link>
                    );
                  })}

                  <Link
                    to="/contact"
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl border bg-card px-3 py-3 text-[15px] font-semibold shadow-[0_2px_10px_-4px_rgba(29,42,34,0.18)] transition-all active:scale-[0.98]",
                      pathname === "/contact"
                        ? "border-accent/60 bg-accent/10 text-primary"
                        : "border-border/60 text-foreground hover:-translate-y-0.5 hover:border-accent/40",
                    )}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-accent/50 bg-primary text-accent shadow-sm">
                      <Phone className="h-5 w-5" />
                    </span>
                    <span className="h-8 w-px shrink-0 bg-border/70" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">Contact Us</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setLanguagesMobileOpen((v) => !v)}
                    aria-expanded={languagesMobileOpen}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-3 py-3 text-left text-[15px] font-semibold shadow-[0_2px_10px_-4px_rgba(29,42,34,0.18)] transition-all active:scale-[0.98]",
                      languagesMobileOpen
                        ? "border-accent/60 bg-accent/10 text-primary"
                        : "text-foreground hover:-translate-y-0.5 hover:border-accent/40",
                    )}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-accent/50 bg-primary text-accent shadow-sm">
                      <Globe className="h-5 w-5" />
                    </span>
                    <span className="h-8 w-px shrink-0 bg-border/70" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">Languages</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        languagesMobileOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {languagesMobileOpen && (
                    <div className="rounded-2xl border border-accent/20 bg-card p-3 shadow-inner">
                      <LanguageSelector />
                    </div>
                  )}
                </nav>

                {isAuthed ? (
                  <div className="mt-5 border-t border-border/60 pt-4">
                    <Button className="w-full rounded-full" variant="outline" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="shrink-0 border-t border-border/60 bg-background px-5 py-3">
                <DVSADisclaimer variant="compact" />
              </div>
            </SheetContent>
          </Sheet>

          {isAuthed ? (
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              className={circleIconBtn}
            >
              <LogOut className="h-5 w-5" />
            </button>
          ) : (
            <Link
              to="/auth"
              search={{ admin: 1 }}
              aria-label="Admin login"
              className={circleIconBtn}
            >
              <UserCog className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

