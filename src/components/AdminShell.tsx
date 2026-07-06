import type { ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutDashboard, BarChart3, LogOut, ShieldCheck, Mail, Film, KeyRound, Activity, Download, TrendingUp, AlertTriangle, BookOpen, SignpostBig, Sparkles, Settings, ListTree, Search, Users, Tag, Newspaper, HelpCircle, FileDown, MapPin, Star, Video, Image as ImageIcon, Route as RouteIcon, Hand, Palette, GraduationCap, Home as HomeIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

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

  const onSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("admin_unlocked");
      window.localStorage.removeItem("admin_password");
    }
    navigate({ to: "/", replace: true });
  };

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
    );

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="border border-border bg-card p-2">
          <div className="border-b border-border px-3 py-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-accent">Admin portal</div>
            <div className="mt-1 font-display text-lg text-foreground">GSM control</div>
          </div>
          <nav className="mt-2 flex flex-col gap-0.5">
            <Link to={overview.to} className={linkClass(pathname === overview.to)}>
              <overview.icon className="h-4 w-4" />
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
                      "flex w-full items-center gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors",
                      groupActive ? "text-accent" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open ? "rotate-180" : "rotate-0")} />
                  </button>
                  {open && (
                    <div className="flex flex-col gap-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link key={item.to} to={item.to} className={linkClass(pathname === item.to)}>
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <Link
            to="/dashboard"
            className="mt-2 flex w-full items-center gap-3 border-t border-border px-3 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Learner portal
          </Link>
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-3 border-t border-border px-3 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
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