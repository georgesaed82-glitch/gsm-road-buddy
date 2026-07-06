import type { ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, BarChart3, LogOut, ShieldCheck, Mail, Film, KeyRound, Activity, Download, TrendingUp, AlertTriangle, BookOpen, SignpostBig, Sparkles, Settings, ListTree, Search, Users, Tag, Newspaper, HelpCircle, FileDown, MapPin, Star, Video, Image as ImageIcon, Route as RouteIcon, Hand, Palette, GraduationCap, Home as HomeIcon, ChevronDown, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

type Item = { to: string; label: string; icon: typeof LayoutDashboard };
type Group = { id: string; label: string; items: Item[] };

const overview: Item = { to: "/admin", label: "Overview", icon: LayoutDashboard };

const groups: Group[] = [
  {
    id: "website",
    label: "Website",
    items: [
      { to: "/admin/theme", label: "Theme & branding", icon: Palette },
      { to: "/admin/site-settings", label: "Site settings", icon: Settings },
      { to: "/admin/home", label: "Homepage sections", icon: HomeIcon },
      { to: "/admin/navigation", label: "Navigation menus", icon: ListTree },
      { to: "/admin/seo", label: "Page SEO", icon: Search },
      { to: "/admin/legal", label: "Legal pages", icon: Newspaper },
    ],
  },
  {
    id: "learning",
    label: "Learning content",
    items: [
      { to: "/admin/lessons", label: "Lessons CMS", icon: GraduationCap },
      { to: "/admin/theory", label: "Theory questions CMS", icon: BookOpen },
      { to: "/admin/hazard-clips", label: "Practical animations CMS", icon: Video },
      { to: "/admin/hazard-videos", label: "Hazard perception CMS", icon: Film },
      { to: "/admin/road-signs", label: "Road signs library", icon: ImageIcon },
      { to: "/admin/road-markings", label: "Road markings library", icon: RouteIcon },
      { to: "/admin/police-signals", label: "Arm signals library", icon: Hand },
      { to: "/admin/content", label: "Signs, markings & Highway Code", icon: SignpostBig },
      { to: "/admin/blocks", label: "George's methods & reviews", icon: Sparkles },
      { to: "/admin/downloads", label: "Downloads", icon: FileDown },
    ],
  },
  {
    id: "business",
    label: "Business",
    items: [
      { to: "/admin/instructors", label: "Instructors", icon: Users },
      { to: "/admin/pricing", label: "Pricing packages", icon: Tag },
      { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
      { to: "/admin/blog", label: "Blog & articles", icon: Newspaper },
      { to: "/admin/areas", label: "Areas covered", icon: MapPin },
      { to: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    items: [
      { to: "/admin/contact-clicks", label: "Contact clicks", icon: BarChart3 },
      { to: "/admin/traffic", label: "Traffic", icon: TrendingUp },
      { to: "/admin/pwa-installs", label: "PWA installs", icon: Download },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { to: "/admin/admins", label: "Admin accounts", icon: ShieldCheck },
      { to: "/admin/access", label: "Access codes", icon: KeyRound },
      { to: "/admin/email", label: "Email settings", icon: Mail },
      { to: "/admin/diagnostics", label: "Diagnostics", icon: Activity },
      { to: "/admin/errors", label: "Errors", icon: AlertTriangle },
    ],
  },
];

export function AdminShell({ children, title, eyebrow }: { children: ReactNode; title: string; eyebrow?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const activeGroupId = groups.find((g) => g.items.some((i) => pathname === i.to))?.id ?? null;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.id, activeGroupId ? g.id === activeGroupId : true])),
  );
  const toggleGroup = (id: string) => setOpenGroups((s) => ({ ...s, [id]: !s[id] }));

  const isOverview = pathname === overview.to;
  const [sheetOpen, setSheetOpen] = useState(false);
  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  const onSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    if (typeof window !== "undefined") {
    }
    navigate({ to: "/", replace: true });
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
        <div className="text-[10px] uppercase tracking-[0.2em] text-accent">Admin portal</div>
        <div className="mt-1 font-display text-lg text-foreground">GSM control</div>
      </div>
      <nav className="mt-2 flex flex-col gap-0.5">
        <Link to={overview.to} className={linkClass(pathname === overview.to)}>
          <overview.icon className={cn("h-4 w-4", pathname === overview.to ? "" : "text-accent/80")} />
          {overview.label}
        </Link>
        {groups.map((group) => {
          const open = !!openGroups[group.id];
          const groupActive = group.items.some((i) => pathname === i.to);
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
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open ? "rotate-180" : "rotate-0")} />
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
                      const active = pathname === item.to;
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
      <Link
        to="/dashboard"
        className="mt-3 flex w-full items-center gap-3 rounded-lg border-t border-border/70 px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent/5 hover:text-primary"
      >
        ← Learner portal
      </Link>
      <button
        onClick={onSignOut}
        className="mt-1 flex w-full items-center gap-3 rounded-lg border-t border-border/70 px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent/5 hover:text-primary"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );

  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl gap-8 px-4 py-10 transition-[grid-template-columns] duration-300 ease-out sm:px-6 lg:px-8",
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
                aria-label="Open admin portal menu"
              >
                <Menu className="h-4 w-4 text-accent" />
                Menu
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto p-3 sm:w-[320px]">
                <SheetTitle className="sr-only">Admin portal navigation</SheetTitle>
                <SheetDescription className="sr-only">Choose an admin section to open.</SheetDescription>
                {sidebarInner}
              </SheetContent>
            </Sheet>
          </div>
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