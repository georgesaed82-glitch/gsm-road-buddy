import { useState, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Menu as MenuIcon,
  Mail,
  MapPin,
  Phone,
  ChevronDown,
  UserCog,
  LogOut,
  Info,
  Car,
  CreditCard,
  Star,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { trackContactClick } from "@/lib/trackContactClick";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import gsmLogo from "@/assets/gsm-logo.jpeg.asset.json";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { LanguageSelector } from "@/components/LanguageSelector";
import { DVSADisclaimer } from "@/components/DVSADisclaimer";

const NAV_LINKS: { to: string; label: string; icon: typeof Info }[] = [
  { to: "/about", label: "About", icon: Info },
  { to: "/services", label: "Practical Lessons", icon: Car },
  { to: "/pricing", label: "Prices & Packages", icon: CreditCard },
  { to: "/theory", label: "Theory Training", icon: BookOpen },
  { to: "/reviews", label: "Reviews", icon: Star },
];

function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const dim = size === "lg" ? "h-16 w-16 sm:h-[70px] sm:w-[70px]" : "h-14 w-14";
  return (
    <img
      src={gsmLogo.url}
      alt="GSM Driving School logo"
      className={cn(
        "shrink-0 rounded-full object-cover shadow-md ring-2 ring-accent/40",
        dim,
      )}
    />
  );
}

function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="min-w-0 leading-tight">
      <div
        className={cn(
          "font-display font-extrabold tracking-tight text-primary",
          compact ? "text-[17px] sm:text-[19px]" : "text-[19px] sm:text-2xl md:text-[26px]",
        )}
      >
        GSM DRIVING SCHOOL
      </div>
      <div
        className={cn(
          "font-medium text-foreground/80",
          compact ? "text-[11px] sm:text-[12px]" : "text-[12px] sm:text-sm",
        )}
      >
        George's School of Motoring
      </div>
      <div
        className={cn(
          "font-semibold text-accent",
          compact ? "text-[10px] sm:text-[11px]" : "text-[11px] sm:text-[12px]",
        )}
      >
        Established 2005
      </div>
    </div>
  );
}

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
  const [contactMobileOpen, setContactMobileOpen] = useState(false);
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
    <header className="sticky top-0 z-50 w-full border-b-2 border-accent bg-card/95 shadow-[0_4px_14px_-8px_rgba(29,42,34,0.25)] backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <div className="mx-auto flex min-h-[76px] w-full max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4"
          aria-label="GSM Driving School — home"
        >
          <Logo size="lg" />
          <BrandLockup />
        </Link>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <LanguageSelector />

          {/* Menu dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={pillBtn} aria-label="Open menu">
                <MenuIcon className="h-4 w-4 text-accent" />
                <span>Menu</span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-60 rounded-2xl border-border/70 p-2 shadow-xl"
            >
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.to;
                return (
                  <DropdownMenuItem key={link.to} asChild>
                    <Link
                      to={link.to}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium",
                        active ? "bg-accent/10 text-primary" : "text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 text-accent" />
                      <span>{link.label}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuItem asChild>
                <Link
                  to="/contact"
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-accent"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Contact Us</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
              className="w-72 rounded-2xl border-border/70 p-2 shadow-xl"
            >
              <ContactPanel business={business} />
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

              <div className="flex items-center gap-3 border-b border-accent/30 px-5 py-4">
                <Logo />
                <BrandLockup compact />
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <nav className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => {
                    const Icon = link.icon;
                    const active = pathname === link.to;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setSheetOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-[15px] font-semibold transition-colors",
                          active
                            ? "border-accent/40 bg-accent/10 text-primary"
                            : "text-foreground hover:bg-accent/5",
                        )}
                      >
                        <Icon className="h-4 w-4 text-accent" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setContactMobileOpen((v) => !v)}
                    aria-expanded={contactMobileOpen}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-4 py-3 text-[15px] font-semibold transition-colors",
                      contactMobileOpen
                        ? "border-accent/50 bg-accent/10 text-primary"
                        : "border-transparent text-accent hover:bg-accent/5",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4" />
                      Contact Us
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        contactMobileOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {contactMobileOpen && (
                    <div className="rounded-xl border border-accent/20 bg-card p-1.5">
                      <ContactPanel
                        business={business}
                        onItemClick={() => setSheetOpen(false)}
                      />
                    </div>
                  )}
                </nav>

                <div className="mt-5 border-t border-border/60 pt-4">
                  {isAuthed ? (
                    <Button className="w-full rounded-full" variant="outline" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </Button>
                  ) : (
                    <Button asChild className="w-full rounded-full" variant="outline">
                      <Link
                        to="/auth"
                        search={{ admin: 1 }}
                        onClick={() => setSheetOpen(false)}
                        aria-label="Admin login"
                      >
                        <UserCog className="mr-2 h-4 w-4" /> Admin Login
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="mt-4">
                  <LanguageSelector />
                </div>
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

