import { supabase } from "@/integrations/supabase/client";
import { isNativeApp } from "@/lib/isNativeApp";
import {
  contactAnalyticsEvent,
  isPublicAnalyticsPath,
  trackGoogleAnalyticsEvent,
} from "@/lib/google-analytics";

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
