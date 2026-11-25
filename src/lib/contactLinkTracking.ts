import { isNativeApp } from "@/lib/isNativeApp";
import { isPublicAnalyticsPath, trackGoogleAnalyticsEvent } from "@/lib/google-analytics";

/**
 * Site-wide phone/WhatsApp link-tap measurement.
 * Events describe link taps only — never completed calls, sent messages or bookings.
 * Parameters are non-personal: no URL query strings, message text or phone numbers.
 */
export type ContactMethod = "phone" | "whatsapp";

export function contactMethodForHref(href: string | null | undefined): ContactMethod | null {
  if (!href) return null;
  const h = href.trim().toLowerCase();
  if (h.startsWith("tel:")) return "phone";
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|(www\.)?whatsapp\.com\/send)/.test(h) || h.startsWith("whatsapp:")) {
    return "whatsapp";
  }
  return null;
}

/** Path only, with no query string or hash, and capped in length. */
export function sanitisePath(pathname: string): string {
  const p = (pathname || "/").split(/[?#]/)[0] ?? "/";
  return p.replace(/[^A-Za-z0-9/_\-.]/g, "").slice(0, 100) || "/";
}

export function pageContext(pathname: string): { page_type: string; page_area: string } {
  const p = sanitisePath(pathname);
  const area = /^\/areas\/([a-z0-9-]+)/.exec(p)?.[1];
  if (area) return { page_type: "area", page_area: area };
  const first = p.split("/")[1] || "home";
  return { page_type: first, page_area: "not_set" };
}

/** Only accept short slug-like location labels so no free text can leak. */
export function sanitiseLocation(raw: string | null | undefined): string {
  const v = (raw ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return v.slice(0, 40) || "page_body";
}

export function buildContactEvent(method: ContactMethod, location: string, pathname: string) {
  return {
    name: method === "phone" ? ("phone_click" as const) : ("whatsapp_click" as const),
    params: {
      contact_method: method,
      link_location: sanitiseLocation(location),
      page_path: sanitisePath(pathname),
      ...pageContext(pathname),
    },
  };
}

function locationFor(el: Element): string {
  const tagged = el.closest("[data-track-location]")?.getAttribute("data-track-location");
  if (tagged) return tagged;
  if (el.closest("header")) return "header";
  if (el.closest("footer")) return "footer";
  if (el.closest("nav")) return "navigation";
  const section = el.closest("section[id]")?.id;
  if (section) return `section_${section}`;
  return "page_body";
}

let lastFired = { key: "", at: 0 };

/** Sends one event per deliberate activation; safe if analytics is off or blocked. */
export function trackContactLinkTap(method: ContactMethod, location: string) {
  try {
    if (typeof window === "undefined" || isNativeApp()) return;
    if (!isPublicAnalyticsPath(window.location.pathname)) return;
    const evt = buildContactEvent(method, location, window.location.pathname);
    const key = `${evt.name}|${evt.params.link_location}`;
    const now = Date.now();
    if (key === lastFired.key && now - lastFired.at < 800) return;
    lastFired = { key, at: now };
    trackGoogleAnalyticsEvent(evt.name, { ...evt.params, transport_type: "beacon" });
  } catch {
    // Measurement must never block the link.
  }
}

let installed = false;

/** One delegated listener covers every phone/WhatsApp link, including dynamic ones. */
export function installContactLinkTracking() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  document.addEventListener(
    "click",
    (e) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!link) return;
      const method = contactMethodForHref(link.getAttribute("href"));
      if (!method) return;
      trackContactLinkTap(method, locationFor(link));
    },
    { capture: true },
  );
}
