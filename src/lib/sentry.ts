import * as Sentry from "@sentry/react";
import { getSentryConfig } from "./error-logs.functions";

let initPromise: Promise<void> | null = null;

export function initSentryOnce() {
  if (typeof window === "undefined") return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const cfg = await getSentryConfig();
      if (!cfg?.dsn) return;
      Sentry.init({
        dsn: cfg.dsn,
        environment: cfg.environment ?? "production",
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0.5,
        integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false })],
        beforeSend(event) {
          // Drop noisy ResizeObserver warnings.
          if (event.message?.includes("ResizeObserver")) return null;
          return event;
        },
      });
      (window as unknown as { Sentry?: typeof Sentry }).Sentry = Sentry;
    } catch {
      /* SDK init errors must never break the app */
    }
  })();
  return initPromise;
}