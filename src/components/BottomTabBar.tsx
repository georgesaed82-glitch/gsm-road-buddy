import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Car, BookOpen, GraduationCap, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = {
  to: string;
  label: string;
  icon: typeof Home;
  match: (p: string) => boolean;
};

const TABS: Tab[] = [
  { to: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  { to: "/services", label: "Lessons", icon: Car, match: (p) => p.startsWith("/services") },
  { to: "/theory", label: "Theory", icon: BookOpen, match: (p) => p.startsWith("/theory") },
  { to: "/auth", label: "GSM Plus", icon: GraduationCap, match: (p) => p.startsWith("/auth") || p.startsWith("/gsm-plus") },
  { to: "/contact", label: "Contact", icon: Phone, match: (p) => p.startsWith("/contact") },
];

/**
 * Persistent premium bottom tab bar. Mounted globally for public routes
 * on both mobile and desktop. Uses forest-green surface with gold accent
 * for the active tab. Respects iOS safe-area insets.
 */
export function BottomTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Primary"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
        backgroundColor: "#234B36",
        boxShadow:
          "0 -12px 30px -18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10"
    >
      <div className="mx-auto flex max-w-3xl items-stretch justify-between px-2 pt-1.5 sm:px-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={active ? "page" : undefined}
              aria-label={tab.label}
              className={cn(
                "group relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-medium leading-none transition-all duration-200 ease-out",
                active ? "text-accent" : "text-white/75 hover:text-white",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-4 top-0 h-0.5 rounded-full bg-accent transition-transform duration-200 ease-out",
                  active ? "scale-x-100" : "scale-x-0",
                )}
              />
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  active ? "scale-110" : "group-active:scale-95",
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className="tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}