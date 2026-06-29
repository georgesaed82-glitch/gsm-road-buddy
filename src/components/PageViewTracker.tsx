import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

function getSessionId(): string {
  try {
    let id = window.sessionStorage.getItem("gsm_sid");
    if (!id) {
      id =
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2)) + Date.now().toString(36);
      window.sessionStorage.setItem("gsm_sid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function PageViewTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!pathname) return;
    // Skip admin pages so the dashboard doesn't inflate its own numbers.
    if (pathname.startsWith("/admin")) return;

    const payload = {
      path: pathname.slice(0, 300),
      referrer: document.referrer ? document.referrer.slice(0, 500) : null,
      user_agent: navigator.userAgent ? navigator.userAgent.slice(0, 500) : null,
      session_id: getSessionId().slice(0, 80),
    };
    void supabase.from("page_views").insert(payload);
  }, [pathname]);

  return null;
}