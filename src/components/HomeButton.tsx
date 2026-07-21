import { Link, useRouterState } from "@tanstack/react-router";
import { Home } from "lucide-react";

/**
 * Persistent floating Home button visible on every route except "/".
 * Consistent across desktop, mobile web, and the installed Capacitor app.
 * Anchored bottom-left so it never conflicts with the bottom-right
 * Back to Top / chat widget stack.
 */
export function HomeButton() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/") return null;

  return (
    <Link
      to="/"
      aria-label="Go to home page"
      style={{
        backgroundColor: "#234B36",
        color: "#FFFFFF",
        boxShadow:
          "0 10px 25px -8px rgba(35,75,54,0.45), 0 4px 10px -2px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.18)",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0px)",
      }}
      className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-white/20 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:bottom-6 sm:left-6 sm:text-[15px]"
    >
      <Home className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
      <span>Home</span>
    </Link>
  );
}