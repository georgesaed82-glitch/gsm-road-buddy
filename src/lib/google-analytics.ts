import { isNativeApp } from "@/lib/isNativeApp";

export const ANALYTICS_PREFERENCES_EVENT = "gsm:analytics-preferences";
export const ANALYTICS_CONSENT_STORAGE_KEY = "gsm.analytics-consent.v1";
export const ANALYTICS_NOTICE_VERSION = 1;

const MEASUREMENT_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY as
  | string
  | undefined;

const CONSENT_REGIONS = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IS", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL",
  "PT", "RO", "SK", "SI", "ES", "SE", "GB", "CH", "CA",
]);

const PRIVATE_PATH_PREFIXES = [
  "/admin",
  "/auth",
  "/reset-password",
  "/dashboard",
  "/payments",
  "/profile",
  "/ai-videos",
  "/driving-clips",
  "/gsm-method",
  "/gsm-plus",
  "/hazard-perception",
  "/highway-code",
  "/lessons",
  "/mock-tests",
  "/my-attempts",
  "/police-signals",
  "/questions",
  "/review",
  "/road-markings",
  "/road-signs",
  "/route",
  "/signs",
  "/theory",
  "/vehicle-reference-points",
  "/downloads",
  "/dev",
  "/api",
  "/mcp",
  "/.lovable",
];

export type AnalyticsConsentChoice = "accepted" | "rejected";
export type AnalyticsConsentRecord = {
  choice: AnalyticsConsentChoice;
  decidedAt: string;
  noticeVersion: number;
  region: string;
};

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

let transmissionAllowed = false;

export function isConsentRegion(region: string | null | undefined): boolean {
  if (!region || !/^[A-Z]{2}$/.test(region) || region === "XX" || region === "T1") return true;
  return CONSENT_REGIONS.has(region);
}

export function resolveAnalyticsPermission(
  record: Pick<AnalyticsConsentRecord, "choice"> | null,
  region: string | null | undefined,
  globalPrivacyControl: boolean,
): boolean {
  if (globalPrivacyControl || record?.choice === "rejected") return false;
  if (record?.choice === "accepted") return true;
  return !isConsentRegion(region);
}

export function isPublicAnalyticsPath(pathname: string): boolean {
  const path = pathname || "/";
  return !PRIVATE_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function contactAnalyticsEvent(channel: string): "whatsapp_click" | "phone_click" | null {
  if (channel === "whatsapp") return "whatsapp_click";
  if (channel === "phone") return "phone_click";
  return null;
}

export function parseCloudflareTrace(trace: string, expectedHost: string): string | null {
  const fields = new Map(
    trace
      .split("\n")
      .map((line) => line.split("="))
      .filter((parts): parts is [string, string] => parts.length === 2)
      .map(([key, value]) => [key, value] as const),
  );
  if (fields.get("h") !== expectedHost) return null;
  const location = fields.get("loc")?.toUpperCase() ?? null;
  return location && /^[A-Z]{2}$/.test(location) && location !== "XX" && location !== "T1"
    ? location
    : null;
}

export function readAnalyticsConsent(): AnalyticsConsentRecord | null {
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<AnalyticsConsentRecord>;
    if (parsed.choice !== "accepted" && parsed.choice !== "rejected") return null;
    return {
      choice: parsed.choice,
      decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : "",
      noticeVersion:
        typeof parsed.noticeVersion === "number" ? parsed.noticeVersion : ANALYTICS_NOTICE_VERSION,
      region: typeof parsed.region === "string" ? parsed.region : "UNKNOWN",
    };
  } catch {
    return null;
  }
}

export function saveAnalyticsConsent(
  choice: AnalyticsConsentChoice,
  region: string,
): AnalyticsConsentRecord {
  const record: AnalyticsConsentRecord = {
    choice,
    decidedAt: new Date().toISOString(),
    noticeVersion: ANALYTICS_NOTICE_VERSION,
    region,
  };
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // The in-memory choice still applies for this page visit.
  }
  return record;
}

export function hasGlobalPrivacyControl(): boolean {
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

function setGaDisabled(disabled: boolean) {
  if (!MEASUREMENT_ID) return;
  (window as unknown as Record<string, unknown>)[`ga-disable-${MEASUREMENT_ID}`] = disabled;
}

function clearAnalyticsCookies() {
  if (!MEASUREMENT_ID) return;
  const streamId = MEASUREMENT_ID.replace(/^G-/, "");
  const names = ["_ga", `_ga_${streamId}`];
  const domains = [window.location.hostname, `.${window.location.hostname}`];
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}; SameSite=Lax`;
    }
    document.cookie = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  }
}

export function disableGoogleAnalytics(clearCookies = false) {
  transmissionAllowed = false;
  setGaDisabled(true);
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  if (clearCookies) clearAnalyticsCookies();
}

export function enableGoogleAnalytics(): boolean {
  if (!MEASUREMENT_ID || !/^G-[A-Z0-9]+$/.test(MEASUREMENT_ID)) return false;
  if (isNativeApp() || !isPublicAnalyticsPath(window.location.pathname)) return false;

  setGaDisabled(false);
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // Google tag requires the Arguments object here.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    } as Gtag;
  }

  const scriptId = `gsm-ga4-${MEASUREMENT_ID}`;
  if (!document.getElementById(scriptId)) {
    window.gtag("set", "developer_id.dZjgwMW", true);
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      debug_mode: new URLSearchParams(window.location.search).get("ga_debug") === "1",
    });

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    document.head.appendChild(script);
  }

  window.gtag("consent", "update", { analytics_storage: "granted" });
  transmissionAllowed = true;
  return true;
}

export function trackGoogleAnalyticsEvent(
  eventName: string,
  parameters: Record<string, unknown> = {},
): boolean {
  if (
    !transmissionAllowed ||
    !window.gtag ||
    isNativeApp() ||
    !isPublicAnalyticsPath(window.location.pathname)
  ) {
    return false;
  }
  window.gtag("event", eventName, parameters);
  return true;
}
