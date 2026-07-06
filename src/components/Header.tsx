import { useState, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Menu,
  Mail,
  Lock,
  LogOut,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Eye,
  GraduationCap,
  LayoutDashboard,
  Download,
  Info,
  Car,
  CreditCard,
  Star,
  MessageSquare,
  Newspaper,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { trackContactClick } from "@/lib/trackContactClick";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import gsmLogo from "@/assets/gsm-logo.jpeg.asset.json";
import { useSiteSettings, useNavItems } from "@/hooks/useSiteSettings";
import { DVSADisclaimer } from "@/components/DVSADisclaimer";

const DEFAULT_NAV_LINKS = [
  { to: "/about", label: "About", icon: Info },
  { to: "/services", label: "Practical", icon: Car },
  { to: "/pricing", label: "Pricing", icon: CreditCard },
  { to: "/reviews", label: "Reviews", icon: Star },
  { to: "/contact", label: "Contact", icon: MessageSquare },
];

const portalLinks = [
  { to: "/dashboard", label: "Learner portal", icon: LayoutDashboard },
  { to: "/theory", label: "Theory practice", icon: BookOpen },
  { to: "/hazard-perception", label: "Hazard perception", icon: Eye },
  { to: "/lessons", label: "Lessons & progress", icon: GraduationCap },
  { to: "/#download-app", label: "Download app", icon: Download },
];

const MOBILE_ICON_MAP: Record<string, typeof BookOpen> = {
  about: Info,
  services: Car,
  practical: Car,
  pricing: CreditCard,
  reviews: Star,
  contact: MessageSquare,
  blog: Newspaper,
  faq: HelpCircle,
  dashboard: LayoutDashboard,
  theory: BookOpen,
  "hazard-perception": Eye,
  lessons: GraduationCap,
  "download-app": Download,
};

function getMobileIcon(href: string, label?: string) {
  const segment = href.replace(/^\//, "").split("/")[0].toLowerCase();
  if (segment && MOBILE_ICON_MAP[segment]) return MOBILE_ICON_MAP[segment];
  const labelKey = (label ?? "").toLowerCase().replace(/\s+/g, "-");
  if (labelKey && MOBILE_ICON_MAP[labelKey]) return MOBILE_ICON_MAP[labelKey];
  return ArrowRight;
}

function Monogram() {
  return (
    <img
      src={gsmLogo.url}
      alt="GSM Driving School logo"
      className="h-11 w-11 rounded-full object-cover ring-1 ring-primary/20"
    />
  );
}

function PortalMenuItem({
  to,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof BookOpen;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <DropdownMenuItem asChild className={cn("cursor-pointer p-0")}>
      <Link
        to={to}
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 px-2 py-2 text-sm outline-none transition-colors",
          active ? "bg-accent/50 font-medium text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
        <span>{label}</span>
      </Link>
    </DropdownMenuItem>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { business, footer } = useSiteSettings();
  const { items: dbNav } = useNavItems("header");
  const navLinks = dbNav.length > 0 ? dbNav.map((n) => ({ to: n.href, label: n.label })) : DEFAULT_NAV_LINKS;
  const whatsappHref = `https://wa.me/${business.phone_intl}`;
  const emailHref = `mailto:${business.email}`;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate({ to: "/", replace: true });
  };

  const isPortalActive = pathname.startsWith("/dashboard") || pathname.startsWith("/theory") || pathname.startsWith("/hazard-perception") || pathname.startsWith("/lessons") || pathname.startsWith("/payments") || pathname.startsWith("/profile");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-auto min-h-[68px] items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-primary">
          <Monogram />
          <div className="leading-tight">
            <div className="font-display text-[17px] font-semibold tracking-tight">{business.name}</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{business.tagline}</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.to || (link.to.startsWith("/#") && pathname === "/");
            const Icon = (link as { icon?: typeof Download }).icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                {link.label}
                {active && <span className="absolute inset-x-3 -bottom-0.5 h-px bg-accent" />}
              </Link>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors outline-none",
                  isPortalActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Learner portal menu"
              >
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Learner portal</span>
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                {isPortalActive && <span className="absolute inset-x-3 -bottom-0.5 h-px bg-accent" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[11rem]">
              {portalLinks.map((link) => {
                const active =
                  link.to.startsWith("/#")
                    ? pathname === "/"
                    : pathname === link.to || pathname.startsWith(link.to + "/");
                return <PortalMenuItem key={link.to} {...link} active={active} />;
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end md:flex">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${business.phone}`}
              onClick={() => trackContactClick("whatsapp", "Header (desktop)")}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-[#25D366]"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
              <span>{business.phone}</span>
            </a>
            <a
              href={emailHref}
              aria-label={`Email ${business.email}`}
              onClick={() => trackContactClick("email", "Header (desktop)")}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
            >
              <Mail className="h-3.5 w-3.5 text-accent" />
              <span>{business.email}</span>
            </a>
          </div>
          {isAuthed ? (
            <Button size="sm" variant="ghost" onClick={handleSignOut} className="hidden md:inline-flex">
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
            </Button>
          ) : (
            <Button size="sm" variant="ghost" asChild className="hidden md:inline-flex">
              <Link to="/auth" search={{ admin: 1 }} aria-label="Admin login">
                <Lock className="mr-1.5 h-3.5 w-3.5" /> Admin login
              </Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[300px] flex-col overflow-hidden overscroll-contain bg-background p-0">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>

              {/* Header: branding stays fixed at the top of the sheet */}
              <div className="shrink-0 px-5 py-4">
                <Link to="/" className="flex items-center gap-3 text-primary" onClick={() => setOpen(false)}>
                  <Monogram />
                  <div className="leading-tight">
                    <span className="font-display text-lg font-semibold">{business.name}</span>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{business.tagline}</div>
                  </div>
                </Link>
              </div>

              {/* Scrollable menu body */}
              <div className="flex-1 overflow-y-auto px-5">
                {/* Public pages grid */}
                <nav className="grid grid-cols-3 gap-2">
                  {navLinks.map((link) => {
                    const Icon = (link as { icon?: typeof Download }).icon ?? getMobileIcon(link.to, link.label);
                    const active = pathname === link.to || (link.to.startsWith("/#") && pathname === "/");
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-card p-2 text-center font-display text-sm leading-tight transition-colors",
                          active
                            ? "border-accent/40 bg-accent/10 text-primary"
                            : "text-muted-foreground hover:bg-accent/5 hover:text-foreground",
                        )}
                      >
                        <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Learner portal grid */}
                <div className="mt-5">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Learner portal
                  </div>
                  <nav className="grid grid-cols-2 gap-2">
                    {portalLinks.map((link) => {
                      const Icon = link.icon;
                      const active =
                        link.to.startsWith("/#")
                          ? pathname === "/"
                          : pathname === link.to || pathname.startsWith(link.to + "/");
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-card p-2 text-center font-display text-sm leading-tight transition-colors",
                            active
                              ? "border-accent/40 bg-accent/10 text-primary"
                              : "text-muted-foreground hover:bg-accent/5 hover:text-foreground",
                          )}
                        >
                          <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                {/* Admin / Sign out */}
                <div className="mt-4 pb-4">
                  {isAuthed ? (
                    <Button className="w-full" variant="ghost" onClick={handleSignOut}>
                      <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
                    </Button>
                  ) : (
                    <Button asChild className="w-full" variant="ghost">
                      <Link to="/auth" search={{ admin: 1 }} onClick={() => setOpen(false)} aria-label="Admin login">
                        <Lock className="mr-1.5 h-3.5 w-3.5" /> Admin login
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Footer: disclaimer and legal info pinned at the bottom */}
              <div className="shrink-0 border-t border-border/60 bg-background px-5 py-4">
                <DVSADisclaimer variant="footer" />
                {footer.copy && <p className="mt-2 text-[10px] text-muted-foreground">{footer.copy}</p>}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
