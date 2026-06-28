import { supabase } from "@/integrations/supabase/client";

export type ContactChannel = "whatsapp" | "email" | "phone" | "portal_view";

export function trackContactClick(channel: ContactChannel, pkg?: string) {
  if (typeof window === "undefined") return;
  // Fire and forget — never block the navigation.
  void supabase.from("contact_clicks").insert({
    channel,
    package: pkg ?? null,
    page: window.location.pathname,
    user_agent: navigator.userAgent,
    referrer: document.referrer || null,
  });
}