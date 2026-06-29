import { useState } from "react";
import { useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Menu, Mail } from "lucide-react";
import { Lock, LogOut } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { trackContactClick } from "@/lib/trackContactClick";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import gsmLogo from "@/assets/gsm-logo.jpeg.asset.json";

const navLinks = [
  { to: "/about", label: "About" },
  { to: "/services", label: "Practical" },
  { to: "/pricing", label: "Pricing" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
  { to: "/auth", label: "Learner portal" },
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

export function Header() {
  const [open, setOpen] = useState(false);
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
            const active = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
                {active && <span className="absolute inset-x-3 -bottom-0.5 h-px bg-accent" />}
              </Link>
            );
          })}
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
          <Button size="sm" variant="outline" asChild className="hidden md:inline-flex">
            <Link to="/auth">Learner portal</Link>
          </Button>
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
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "border-b border-border/60 py-3 font-display text-lg transition-colors",
                        pathname === link.to ? "text-primary" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="flex flex-col gap-3 pt-2">
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/auth" onClick={() => setOpen(false)}>
                      Learner portal
                    </Link>
                  </Button>
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
