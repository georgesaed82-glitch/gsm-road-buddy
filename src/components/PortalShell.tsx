import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, CalendarCheck, CreditCard, BookOpen, Eye, LogOut, UserCircle2, ShieldCheck, SignpostBig, HelpCircle, ClipboardCheck, Milestone, Hand, RotateCcw, GraduationCap, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useIsAdmin } from "@/hooks/useIsAdmin";

type Item = { to: string; label: string; icon: typeof LayoutDashboard };

const topItems: Item[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/lessons", label: "Lessons & progress", icon: CalendarCheck },
  { to: "/payments", label: "Payments", icon: CreditCard },
];

const theoryItems: Item[] = [
  { to: "/highway-code", label: "Highway Code", icon: BookOpen },
  { to: "/road-signs", label: "Road signs", icon: SignpostBig },
  { to: "/road-markings", label: "Road markings", icon: Milestone },
  { to: "/police-signals", label: "Arm signals", icon: Hand },
  { to: "/questions", label: "Questions", icon: HelpCircle },
  { to: "/mock-tests", label: "Mock tests", icon: ClipboardCheck },
  { to: "/review", label: "Review mistakes", icon: RotateCcw },
];

const hazardItem: Item = { to: "/hazard-perception", label: "Hazard perception", icon: Eye };

const bottomItems: Item[] = [
  { to: "/profile", label: "Profile", icon: UserCircle2 },
];

export function PortalShell({ children, title, eyebrow }: { children: ReactNode; title: string; eyebrow?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useIsAdmin();

  const theoryPaths = theoryItems.map((i) => i.to);
  const theoryActive = theoryPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
  // Persist the Theory group's open/closed state across sessions.
  // Default: open when on a theory page, otherwise fall back to the saved
  // preference (open by default on first visit).
  const [theoryOpen, setTheoryOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return theoryActive;
    const saved = window.localStorage.getItem("gsm.portal.theoryOpen");
    if (saved === "1") return true;
    if (saved === "0") return false;
    return theoryActive;
  });

  const hazardActive = pathname === hazardItem.to || pathname.startsWith(hazardItem.to + "/");

  // Auto-open when navigating into a theory page, but don't force-close
  // when leaving — respect the user's explicit choice.
  useEffect(() => {
    if (theoryActive) setTheoryOpen(true);
  }, [theoryActive]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("gsm.portal.theoryOpen", theoryOpen ? "1" : "0");
  }, [theoryOpen]);

  const onSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="border border-border bg-card p-2">
          <div className="border-b border-border px-3 py-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Learner portal</div>
            <div className="mt-1 font-display text-lg text-foreground">Your dashboard</div>
          </div>
          <nav className="mt-2 flex flex-col gap-0.5">
            {topItems.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setTheoryOpen((v) => !v)}
              aria-expanded={theoryOpen}
              aria-controls="portal-theory-group"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                theoryActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <GraduationCap className="h-4 w-4" />
              <span className="flex-1 text-left">Theory</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  theoryOpen ? "rotate-180" : "rotate-0",
                )}
              />
            </button>
            {theoryOpen && (
              <div id="portal-theory-group" className="flex flex-col gap-0.5 pl-3 border-l border-border ml-4">
                {theoryItems.map((item) => {
                  const active = pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}

            <Link
              to={hazardItem.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                hazardActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <hazardItem.icon className="h-4 w-4" />
              {hazardItem.label}
            </Link>

            {bottomItems.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {isAdmin && (
            <Link
              to="/admin"
              className="mt-2 flex w-full items-center gap-3 border-t border-border px-3 py-3 text-sm text-accent transition-colors hover:text-foreground"
            >
              <ShieldCheck className="h-4 w-4" /> Admin portal
            </Link>
          )}
          <button
            onClick={onSignOut}
            className="mt-2 flex w-full items-center gap-3 border-t border-border px-3 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0">
        <header className="border-b border-border pb-6">
          {eyebrow && (
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-6 bg-accent" />
              {eyebrow}
            </div>
          )}
          <h1 className="mt-2 font-display text-4xl font-medium leading-tight text-foreground">{title}</h1>
        </header>
        <div className="pt-8">{children}</div>
      </main>
    </div>
  );
}
