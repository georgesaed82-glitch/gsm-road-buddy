import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  platforms?: string[];
};

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
  interface Window {
    gsmInstallPrompt?: BeforeInstallPromptEvent;
  }
}

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

function platformLabel(): string {
  const ua = navigator.userAgent || "";
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Macintosh/i.test(ua)) return "macos";
  if (/Windows/i.test(ua)) return "windows";
  return "other";
}

async function logEvent(event: string) {
  try {
    await supabase.from("pwa_events").insert({
      event,
      platform: platformLabel().slice(0, 60),
      user_agent: (navigator.userAgent || "").slice(0, 500),
      session_id: getSessionId().slice(0, 80),
    });
  } catch {
    /* ignore */
  }
}

function onceKey(key: string) {
  try {
    if (window.sessionStorage.getItem(key)) return false;
    window.sessionStorage.setItem(key, "1");
    return true;
  } catch {
    return true;
  }
}

export function PWAInstallTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Standalone launch (PWA already installed)
    try {
      const standalone =
        window.matchMedia?.("(display-mode: standalone)").matches ||
        // iOS Safari legacy
        (navigator as Navigator & { standalone?: boolean }).standalone === true;
      if (standalone && onceKey("gsm_pwa_standalone_logged")) {
        void logEvent("displayed_standalone");
      }
    } catch {
      /* ignore */
    }

    function handleBeforeInstall(e: BeforeInstallPromptEvent) {
      e.preventDefault();
      window.gsmInstallPrompt = e;
      if (onceKey("gsm_pwa_prompt_available_logged")) {
        void logEvent("prompt_available");
      }
      void e.userChoice
        .then((choice) => {
          if (choice.outcome === "accepted") void logEvent("prompt_accepted");
          else void logEvent("prompt_dismissed");
        })
        .catch(() => {});
    }

    function handleAppInstalled() {
      void logEvent("installed");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null;
}

/**
 * Programmatically show the browser's install prompt if one was deferred.
 * Logs `prompt_shown`. Returns true if a prompt was shown.
 */
export async function triggerPwaInstallPrompt(): Promise<boolean> {
  const ev = window.gsmInstallPrompt;
  if (!ev) return false;
  void logEvent("prompt_shown");
  try {
    await ev.prompt();
  } catch {
    /* ignore */
  }
  window.gsmInstallPrompt = undefined;
  return true;
}
