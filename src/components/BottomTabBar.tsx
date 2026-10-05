import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Car, BookOpen, GraduationCap, Phone, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsNativeApp } from "@/lib/isNativeApp";

type Tab = {
  to: string;
  label: string;
  icon: typeof Home;
  match: (p: string) => boolean;
};

const HOME: Tab = { to: "/", label: "Home", icon: Home, match: (p) => p === "/" };
const LESSONS: Tab = { to: "/services", label: "Lessons", icon: Car, match: (p) => p.startsWith("/services") };
const CONTACT: Tab = { to: "/contact", label: "Contact", icon: Phone, match: (p) => p.startsWith("/contact") };

/** Public website tabs: no theory practice or GSM Plus promotion. */
const WEB_TABS: Tab[] = [
  HOME,
  LESSONS,
  { to: "/youtube", label: "Videos", icon: Youtube, match: (p) => p.startsWith("/youtube") },
  CONTACT,
];

/** Native app keeps its existing tabs. */
const NATIVE_TABS: Tab[] = [
  HOME,
  LESSONS,
  { to: "/theory", label: "Theory", icon: BookOpen, match: (p) => p.startsWith("/theory") },
  { to: "/auth", label: "GSM Plus", icon: GraduationCap, match: (p) => p.startsWith("/auth") || p.startsWith("/gsm-plus") },
  CONTACT,
];

export function BottomTabBar({ placement = "bottom" }: { placement?: "bottom" | "top" }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isNative = useIsNativeApp();
  const tabs = isNative ? NATIVE_TABS : WEB_TABS;
  const top = placement === "top";

  return (
    <nav
      aria-label="Primary"
      style={
        top
          ? { boxShadow: "0 4px 0 0 #0b231c, 0 10px 18px -8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)" }
          : {
              paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
              boxShadow: "0 -12px 30px -18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
            }
      }
      className={
        top
          ? "mx-2 mb-2 rounded-2xl border border-primary-foreground/10 bg-[var(--brand-dark)] pb-1.5 sm:mx-4 lg:mx-auto lg:max-w-[1156px]"
          : "fixed inset-x-0 bottom-0 z-40 border-t border-primary-foreground/10 bg-[var(--brand-dark)]"
      }
    >
      <div className="mx-auto flex max-w-3xl items-stretch justify-between px-2 pt-1.5 sm:px-4">
        {tabs.map((tab) => {
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
                active ? "text-accent" : "text-primary-foreground/80 hover:text-primary-foreground",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-4 top-0 h-0.5 rounded-full bg-accent transition-transform duration-200 ease-out",
                  active ? "scale-x-100" : "scale-x-0",
                )}
              />
              <Icon className={cn("h-5 w-5", active && "scale-110")} strokeWidth={active ? 2.5 : 2} />
              <span className="tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
