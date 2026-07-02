import { useState, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Menu, Mail, Lock, LogOut, ChevronDown, ChevronUp, BookOpen, Eye, GraduationCap, LayoutDashboard, Download } from "lucide-react";
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
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import gsmLogo from "@/assets/gsm-logo.jpeg.asset.json";

const navLinks = [
  { to: "/about", label: "About" },
  { to: "/services", label: "Practical" },
  { to: "/pricing", label: "Pricing" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
];

const portalLinks = [
  { to: "/dashboard", label: "Learner portal", icon: LayoutDashboard },
  { to: "/theory", label: "Theory practice", icon: BookOpen },
  { to: "/hazard-perception", label: "Hazard perception", icon: Eye },
  { to: "/lessons", label: "Lessons & progress", icon: GraduationCap },
  { to: "/#download-app", label: "Download app", icon: Download },
];

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
  const [portalOpen, setPortalOpen] = useState(false);
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
            <div className="font-display text-[17px] font-semibold tracking-tight">GSM Driving School</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              George's School of Motoring · Established 2005
            </div>
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
              href="https://wa.me/447961585231"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp 07961 585231"
              onClick={() => trackContactClick("whatsapp", "Header (desktop)")}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-[#25D366]"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
              <span>07961 585231</span>
            </a>
            <a
              href="mailto:gsmdrivingschool@outlook.com"
              aria-label="Email gsmdrivingschool@outlook.com"
              onClick={() => trackContactClick("email", "Header (desktop)")}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
            >
              <Mail className="h-3.5 w-3.5 text-accent" />
              <span>gsmdrivingschool@outlook.com</span>
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
            <SheetContent side="right" className="w-[300px] bg-background">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex flex-col gap-6 pt-6">
                <Link to="/" className="flex items-center gap-3 text-primary" onClick={() => setOpen(false)}>
                  <Monogram />
                  <div className="leading-tight">
                    <span className="font-display text-lg font-semibold">GSM Driving School</span>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      George's School of Motoring · Established 2005
                    </div>
                  </div>
                </Link>
                <nav className="flex flex-col">
                  {navLinks.map((link) => {
                    const Icon = (link as { icon?: typeof Download }).icon;
                    const active = pathname === link.to || (link.to.startsWith("/#") && pathname === "/");
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-2 border-b border-border/60 py-3 font-display text-lg transition-colors",
                          active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                        {link.label}
                      </Link>
                    );
                  })}

                  <Collapsible open={portalOpen} onOpenChange={setPortalOpen}>
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "flex w-full items-center justify-between gap-2 border-b border-border/60 py-3 font-display text-lg transition-colors outline-none",
                          isPortalActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                        )}
                        aria-label="Learner portal menu"
                      >
                        <span className="flex items-center gap-2">
                          <Lock className="h-4 w-4" aria-hidden="true" />
                          <span>Learner portal</span>
                        </span>
                        {portalOpen ? (
                          <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="flex flex-col border-b border-border/60 pb-2">
                        {portalLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link
                              key={link.to}
                              to={link.to}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "flex items-center gap-2 py-2.5 pl-7 text-sm transition-colors",
                                pathname === link.to ? "text-primary" : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{link.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </nav>
                <div className="flex flex-col gap-3 pt-2">
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
                  <a
                    href="https://wa.me/447961585231"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp 07961 585231"
                    onClick={() => trackContactClick("whatsapp", "Header (mobile)")}
                    className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-[#25D366]"
                  >
                    <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                    <span>WhatsApp 07961 585231</span>
                  </a>
                  <a
                    href="mailto:gsmdrivingschool@outlook.com"
                    aria-label="Email gsmdrivingschool@outlook.com"
                    onClick={() => trackContactClick("email", "Header (mobile)")}
                    className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary"
                  >
                    <Mail className="h-3.5 w-3.5 text-accent" />
                    <span>gsmdrivingschool@outlook.com</span>
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
