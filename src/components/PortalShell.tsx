import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  BookOpen,
  Eye,
  LogOut,
  UserCircle2,
  SignpostBig,
  HelpCircle,
  ClipboardCheck,
  Milestone,
  Hand,
  RotateCcw,
  ChevronDown,
  Copyright,
  History,
  Film,
  Compass,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { PortalSearch } from "@/components/PortalSearch";
import { PortalFooter } from "@/components/PortalFooter";
import { LanguageSelector } from "@/components/LanguageSelector";
import { GsmPlus } from "@/components/GsmPlus";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

type Item = { to: string; label: string; icon: typeof LayoutDashboard };

const overviewItem: Item = { to: "/dashboard", label: "Overview", icon: LayoutDashboard };

type Group = { id: string; label: string; items: Item[] };

const learningGroup: Group = {
  id: "learning",
  label: "Learning",
  items: [
    { to: "/gsm-plus", label: "GSM Plus dashboard", icon: LayoutDashboard },
    { to: "/gsm-method", label: "GSM Driving Method", icon: Compass },
    { to: "/hazard-perception", label: "Hazard perception", icon: Eye },
    { to: "/driving-clips/", label: "Practical strategy videos", icon: Film },
  ],
};

const theoryGroup: Group = {
  id: "theory",
  label: "Theory",
  items: [
    { to: "/highway-code", label: "Highway Code", icon: BookOpen },
    { to: "/road-signs", label: "Road signs", icon: SignpostBig },
    { to: "/road-markings", label: "Road markings", icon: Milestone },
    { to: "/police-signals", label: "Arm signals", icon: Hand },
    { to: "/questions", label: "Questions", icon: HelpCircle },
    { to: "/mock-tests", label: "Mock tests", icon: ClipboardCheck },
    { to: "/review", label: "Review mistakes", icon: RotateCcw },
    { to: "/my-attempts", label: "My attempts", icon: History },
  ],
};

const myLearningGroup: Group = {
  id: "my-learning",
  label: "My learning",
  items: [
    { to: "/lessons", label: "Lessons & progress", icon: CalendarCheck },
    { to: "/payments", label: "Payments", icon: CreditCard },
  ],
};

const accountGroup: Group = {
  id: "account",
  label: "Account",
  items: [{ to: "/profile", label: "Profile", icon: UserCircle2 }],
};

const groups: Group[] = [learningGroup, theoryGroup, myLearningGroup, accountGroup];

export function PortalShell({
  children,
  title,
  eyebrow,
  showCopyright = false,
}: {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  showCopyright?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const activeGroupId =
    groups.find((g) => g.items.some((i) => pathname === i.to || pathname.startsWith(i.to + "/")))
      ?.id ?? null;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.id, activeGroupId ? g.id === activeGroupId : true])),
  );
  const toggleGroup = (id: string) => setOpenGroups((s) => ({ ...s, [id]: !s[id] }));

  const isOverview = pathname === overviewItem.to;
  const [sheetOpen, setSheetOpen] = useState(false);
  // Close the mobile/collapsed nav sheet when navigating to a new route.
  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  const onSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const linkClass = (active: boolean) =>
    cn(
      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:translate-x-0.5 hover:bg-accent/10 hover:text-primary",
    );

  const sidebarInner = (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card p-2 shadow-sm">
      <div className="border-b border-border/70 px-3 py-3">
        <GsmPlus variant="pill" />
        <div className="mt-1 font-display text-lg text-foreground">Your dashboard</div>
      </div>
      <div className="border-b border-border/70 p-2">
        <PortalSearch />
      </div>
      <nav className="mt-2 flex flex-col gap-0.5">
        <Link to={overviewItem.to} className={linkClass(pathname === overviewItem.to)}>
          <overviewItem.icon
            className={cn("h-4 w-4", pathname === overviewItem.to ? "" : "text-accent/80")}
          />
          {overviewItem.label}
        </Link>
        {groups.map((group) => {
          const open = !!openGroups[group.id];
          const groupActive = group.items.some(
            (i) => pathname === i.to || pathname.startsWith(i.to + "/"),
          );
          return (
            <div key={group.id} className="mt-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={open}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-accent/5",
                  groupActive ? "text-accent" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    open ? "rotate-180" : "rotate-0",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out",
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-0.5 pt-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = pathname === item.to || pathname.startsWith(item.to + "/");
                      return (
                        <Link key={item.to} to={item.to} className={linkClass(active)}>
                          <Icon className={cn("h-4 w-4", active ? "" : "text-accent/80")} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>
      <button
        onClick={onSignOut}
        className="mt-3 flex w-full items-center gap-3 rounded-lg border-t border-border/70 px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent/5 hover:text-primary"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );

  return (
    <div className="flex min-h-full flex-col">
      <div
        className={cn(
          "mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 transition-[grid-template-columns] duration-300 ease-out sm:px-6 lg:px-8",
          isOverview ? "lg:grid-cols-[260px_1fr]" : "lg:grid-cols-[1fr]",
        )}
      >
        {isOverview && (
          <aside className="hidden animate-fade-in lg:sticky lg:top-24 lg:block lg:h-fit">
            {sidebarInner}
          </aside>
        )}

        <main className="min-w-0">
          <header className="border-b border-border pb-6">
            <div className="mb-3 flex items-center gap-2">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:text-primary"
                  aria-label="Open GSM Plus menu"
                >
                  <Menu className="h-4 w-4 text-accent" />
                  Menu
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto p-3 sm:w-[320px]">
                  <SheetTitle className="sr-only">GSM Plus navigation</SheetTitle>
                  <SheetDescription className="sr-only">Choose a topic to open.</SheetDescription>
                  {sidebarInner}
                </SheetContent>
              </Sheet>
              <div className="ml-auto">
                <LanguageSelector />
              </div>
            </div>
            {eyebrow && (
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                <span className="h-px w-6 bg-accent" />
                {eyebrow}
              </div>
            )}
            <h1 className="mt-2 break-words font-display text-3xl font-medium leading-tight text-foreground sm:text-4xl">
              {title}
            </h1>
          </header>
          {showCopyright && (
            <div
              role="note"
              aria-label="Copyright notice"
              className="mt-6 flex items-start gap-3 border border-accent/60 bg-accent/10 px-4 py-4 text-sm leading-relaxed text-foreground"
            >
              <Copyright className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <p className="font-semibold text-foreground">
                  Important: copyright protected learning material — personal learning use only
                </p>
                <p className="mt-1">
                  <strong>
                    © {new Date().getFullYear()} George School of Motoring (GSM Driving School).
                  </strong>{" "}
                  All images, videos, diagrams, notes, quizzes and audio on this learner portal are
                  the exclusive property of George School of Motoring (GSM Driving School) and are
                  protected by copyright.
                </p>
                <p className="mt-2">
                  You may view and study this material for your{" "}
                  <strong>own personal learning only</strong>. You may <strong>not</strong>{" "}
                  download, screenshot, screen-record, copy, share, republish, resell, upload to
                  other websites or social media, distribute to other learners, or reuse any part of
                  it in any other course, training material, app, video or publication.
                </p>
                <p className="mt-2 text-muted-foreground">
                  Any other use requires prior written permission from George School of Motoring
                  (GSM Driving School). Unauthorised use is a breach of copyright and will be
                  enforced.
                </p>
              </div>
            </div>
          )}
          <div className={showCopyright ? "portal-watermark-wrap pt-8" : "pt-8"}>{children}</div>
        </main>
      </div>
      <div className="mt-auto">
        <PortalFooter />
      </div>
    </div>
  );
}
