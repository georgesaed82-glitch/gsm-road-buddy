import { useState, useEffect, useRef } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Menu as MenuIcon,
  Mail,
  MapPin,
  Phone,
  ChevronDown,
  ChevronRight,
  UserCog,
  LogOut,
  Info,
  Car,
  CreditCard,
  Star,
  MessageSquare,
  BookOpen,
  Newspaper,
  GraduationCap,
  Globe,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { trackContactClick } from "@/lib/trackContactClick";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [contactMobileOpen, setContactMobileOpen] = useState(false);
  const [languagesMobileOpen, setLanguagesMobileOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
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
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSheetOpen(false);
    navigate({ to: "/", replace: true });
  };

  // Shared classes for the circular pill buttons in the desktop header.
  const pillBtn =
    "inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";
  const circleIconBtn =
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

  return (
    <header className="sticky top-0 z-[120] w-full border-b-2 border-accent bg-card/95 shadow-[0_4px_14px_-8px_rgba(29,42,34,0.25)] backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <div className="mx-auto flex min-h-[76px] w-full max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4"
          aria-label="GSM Driving School — home"
        >
          <BrandPlate size="md" className="max-w-full" />
        </Link>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <LanguageSelector />

          {/* GSM Plus learner portal */}
          <Link
            to="/auth"
            aria-label="Open GSM Plus learner portal"
            className={cn(
              pillBtn,
              "border-accent/60 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md hover:border-accent hover:from-primary hover:to-primary hover:text-primary-foreground",
            )}
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-primary-foreground">
              <GraduationCap className="h-3.5 w-3.5" />
            </span>
            <GsmPlus
              gsmClassName="text-primary-foreground"
              plusClassName="text-accent"
            />
          </Link>

          {/* Menu dropdown */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              className={pillBtn}
              aria-label="Open menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
                <MenuIcon className="h-4 w-4 text-accent" />
                <span>Menu</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 opacity-70 transition-transform duration-200",
                    menuOpen && "rotate-180",
                  )}
                />
            </button>
            {menuOpen && (
              <div
                role="menu"
                aria-label="Main navigation"
                className="absolute right-0 top-[calc(100%+0.625rem)] z-[140] w-80 origin-top-right animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 overflow-hidden rounded-2xl border border-accent/45 bg-card p-0 text-foreground shadow-[0_24px_70px_-22px_rgba(29,42,34,0.55)] ring-1 ring-primary/10 duration-200"
              >
              <div className="bg-gradient-to-r from-primary to-primary/85 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                  Explore GSM
                </p>
                <p className="mt-0.5 text-sm font-semibold text-primary-foreground">
                  George School of Motoring
                </p>
              </div>
              <div className="flex flex-col gap-1 p-2">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const active = pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/40",
                        active
                          ? "bg-accent/15 text-primary"
                          : "text-foreground hover:bg-accent/10 focus:bg-accent/10",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-accent/40 bg-primary text-accent shadow-sm transition-transform group-hover:scale-105",
                          active && "border-accent bg-accent text-primary-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 truncate">{link.label}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                    </Link>
                  );
                })}
                <div className="my-1 h-px bg-accent/20" />
                <Link
                  to="/contact"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="group flex cursor-pointer items-center gap-3 rounded-xl bg-accent/10 px-2.5 py-2.5 text-sm font-semibold text-primary outline-none transition-colors hover:bg-accent/20 focus:bg-accent/20 focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-primary-foreground shadow-sm">
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <span className="flex-1 truncate">Contact Us</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              </div>
            )}
          </div>

          {/* Contact Us popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  pillBtn,
                  "border-accent/40 bg-accent/10 text-primary hover:bg-accent/20",
                )}
                aria-label="Contact us"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-primary-foreground">
                  <Phone className="h-3.5 w-3.5" />
                </span>
                <span>Contact Us</span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={10}
              className="w-80 overflow-hidden rounded-2xl border border-accent/40 bg-card p-0 shadow-[0_20px_60px_-20px_rgba(29,42,34,0.45)]"
            >
              <div className="bg-gradient-to-r from-primary to-primary/85 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                  Get in touch
                </p>
                <p className="mt-0.5 text-sm font-semibold text-primary-foreground">
                  Call, message or find us
                </p>
              </div>
              <div className="p-2">
                <ContactPanel business={business} />
              </div>
            </PopoverContent>
          </Popover>

          {/* Admin login circular */}
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

        {/* Mobile actions */}
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className={circleIconBtn}
              >
                <MenuIcon className="h-5 w-5 text-accent" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[320px] flex-col overflow-hidden overscroll-contain bg-background p-0"
            >
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>

              <div className="flex items-center justify-center border-b border-accent/30 px-4 py-4">
                <BrandPlate size="sm" className="w-full" />
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

                  <button
                    type="button"
                    onClick={() => setContactMobileOpen((v) => !v)}
                    aria-expanded={contactMobileOpen}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-3 py-3 text-left text-[15px] font-semibold shadow-[0_2px_10px_-4px_rgba(29,42,34,0.18)] transition-all active:scale-[0.98]",
                      contactMobileOpen
                        ? "border-accent/60 bg-accent/10 text-primary"
                        : "text-foreground hover:-translate-y-0.5 hover:border-accent/40",
                    )}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-accent/50 bg-primary text-accent shadow-sm">
                      <Phone className="h-5 w-5" />
                    </span>
                    <span className="h-8 w-px shrink-0 bg-border/70" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">Contact Us</span>
                      <span className="block truncate text-[11px] font-medium text-muted-foreground">
                        Call, Email &amp; Location
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        contactMobileOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {contactMobileOpen && (
                    <div className="rounded-2xl border border-accent/20 bg-card p-1.5 shadow-inner">
                      <ContactPanel
                        business={business}
                        onItemClick={() => setSheetOpen(false)}
                      />
                    </div>
                  )}

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

