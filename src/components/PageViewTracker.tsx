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

function detectPlatform(): string {
  try {
    const nav = navigator as Navigator & { standalone?: boolean };
    const standalone =
      (typeof window.matchMedia === "function" &&
        window.matchMedia("(display-mode: standalone)").matches) ||
      nav.standalone === true;
    const ua = navigator.userAgent || "";
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isMobile = isIOS || isAndroid || /Mobile/i.test(ua);
    const surface = standalone ? "app" : "browser";
    const device = isIOS ? "ios" : isAndroid ? "android" : isMobile ? "mobile" : "desktop";
    return `${surface}-${device}`;
  } catch {
    return "unknown";
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
      platform: detectPlatform().slice(0, 40),
    };
    void supabase.from("page_views").insert(payload);
  }, [pathname]);

  return null;
}