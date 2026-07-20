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

const ALL_NAV_LINKS: { to: string; label: string; icon: typeof Info }[] = [
  { to: "/about", label: "About", icon: Info },
  { to: "/services", label: "Practical Lessons", icon: Car },
  { to: "/pricing", label: "Prices & Packages", icon: CreditCard },
  { to: "/theory", label: "Theory Training", icon: BookOpen },
  { to: "/reviews", label: "Reviews", icon: Star },
  { to: "/blog", label: "Blog", icon: Newspaper },
];
const NAV_LINKS = ALL_NAV_LINKS.filter((l) => BLOG_ENABLED || l.to !== "/blog");

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
          className="flex w-[320px] flex-col overflow-hidden overscroll-contain bg-background p-0 sm:w-[360px]"
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

          <div className="flex items-center justify-center border-b border-accent/30 px-3 py-2.5">
            <BrandPlate size="xs" className="max-w-full" />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <Link
              to="/auth"
              onClick={() => setSheetOpen(false)}
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-accent/50 bg-gradient-to-br from-primary to-primary/85 px-4 py-3.5 shadow-md"
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

            </nav>

            <div className="mt-5 border-t border-border/60 pt-4">
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
      <div className="mx-auto w-full max-w-7xl px-2 py-2 sm:px-4 sm:py-2.5 lg:max-w-[1440px] lg:px-8 lg:py-1.5 xl:px-10 xl:py-2">
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

