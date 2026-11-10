import { Link, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ANALYTICS_PREFERENCES_EVENT,
  disableGoogleAnalytics,
  enableGoogleAnalytics,
  hasGlobalPrivacyControl,
  isConsentRegion,
  isPublicAnalyticsPath,
  parseCloudflareTrace,
  readAnalyticsConsent,
  resolveAnalyticsPermission,
  saveAnalyticsConsent,
  type AnalyticsConsentChoice,
  type AnalyticsConsentRecord,
} from "@/lib/google-analytics";

async function detectRegion(signal: AbortSignal): Promise<string> {
  try {
    const response = await fetch("/cdn-cgi/trace", {
      credentials: "same-origin",
      cache: "no-store",
      signal,
    });
    if (!response.ok) return "UNKNOWN";
    return parseCloudflareTrace(await response.text(), window.location.hostname) ?? "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
}

export function GoogleAnalytics({ isPublicWebsite }: { isPublicWebsite: boolean }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [ready, setReady] = useState(false);
  const [region, setRegion] = useState("UNKNOWN");
  const [record, setRecord] = useState<AnalyticsConsentRecord | null>(null);
  const [globalPrivacyControl, setGlobalPrivacyControl] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2000);
    setRecord(readAnalyticsConsent());
    setGlobalPrivacyControl(hasGlobalPrivacyControl());
    void detectRegion(controller.signal).then((detected) => {
      setRegion(detected);
      setReady(true);
      window.clearTimeout(timeout);
    });

    const openPreferences = () => setBannerOpen(true);
    const syncChoice = (event: StorageEvent) => {
      if (event.key !== null && event.key !== "gsm.analytics-consent.v1") return;
      setRecord(readAnalyticsConsent());
    };
    window.addEventListener(ANALYTICS_PREFERENCES_EVENT, openPreferences);
    window.addEventListener("storage", syncChoice);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
      window.removeEventListener(ANALYTICS_PREFERENCES_EVENT, openPreferences);
      window.removeEventListener("storage", syncChoice);
    };
  }, []);

  const permitted = resolveAnalyticsPermission(record, region, globalPrivacyControl);

  useEffect(() => {
    if (!ready || !isPublicWebsite || !isPublicAnalyticsPath(pathname)) {
      setTrackingActive(false);
      setBannerOpen(false);
      lastTrackedPage.current = null;
      disableGoogleAnalytics();
      return;
    }

    if (!permitted) {
      setTrackingActive(false);
      lastTrackedPage.current = null;
      disableGoogleAnalytics(record?.choice === "rejected");
      if (!record && isConsentRegion(region) && !globalPrivacyControl) setBannerOpen(true);
      return;
    }

    const enabled = enableGoogleAnalytics();
    setTrackingActive(enabled);
    if (!enabled) lastTrackedPage.current = null;
  }, [ready, isPublicWebsite, pathname, permitted, record, region, globalPrivacyControl]);

  useEffect(() => {
    if (!trackingActive || !isPublicWebsite || !isPublicAnalyticsPath(pathname)) return;
    if (lastTrackedPage.current === pathname) return;
    lastTrackedPage.current = pathname;
    trackGoogleAnalyticsEvent("page_view", {
      page_path: pathname,
      page_location: `${window.location.origin}${pathname}`,
      page_title: document.title,
    });
  }, [trackingActive, isPublicWebsite, pathname]);

  const choose = useCallback(
    (choice: AnalyticsConsentChoice) => {
      const next = saveAnalyticsConsent(choice, region);
      setRecord(next);
      setBannerOpen(false);
      if (choice === "rejected") disableGoogleAnalytics(true);
    },
    [region],
  );

  if (!isPublicWebsite || !bannerOpen) return null;

  return (
    <aside
      role="dialog"
      aria-label="Analytics preferences"
      aria-describedby="analytics-preference-description"
      className="fixed inset-x-3 bottom-3 z-[240] mx-auto max-w-2xl rounded-2xl border-2 border-accent/60 bg-card p-4 text-card-foreground shadow-[0_5px_0_0_var(--primary),0_18px_45px_-12px_rgba(0,0,0,0.45)] sm:bottom-5 sm:p-5"
    >
      <h2 className="font-display text-lg font-bold">Analytics choices</h2>
      <p id="analytics-preference-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">
        We use Google Analytics to measure website visits and phone or WhatsApp button clicks.
        We do not send your name, email address, phone number or message contents. You can accept
        or reject Analytics.{" "}
        <Link to="/legal/analytics" className="font-semibold text-primary underline underline-offset-2">
          Read the Analytics privacy notice
        </Link>
        .
      </p>
      {globalPrivacyControl ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-primary">
            Your browser’s Global Privacy Control is on, so Analytics stays off.
          </p>
          <Button type="button" variant="outline" onClick={() => setBannerOpen(false)} className="min-h-11">
            Close
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => choose("rejected")}
            className="min-h-11 border-primary text-primary"
          >
            Reject
          </Button>
          <Button type="button" onClick={() => choose("accepted")} className="min-h-11">
            Accept
          </Button>
        </div>
      )}
    </aside>
  );
}
