import { logClientError } from "./error-logs.functions";

type LovableErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type LovableEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: LovableErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __lovableEvents?: LovableEvents;
  }
}

function extractMessageAndStack(error: unknown): { message: string; stack: string | null } {
  if (error instanceof Error)
    return { message: error.message || String(error), stack: error.stack ?? null };
  if (typeof error === "string") return { message: error, stack: null };
  try {
    return { message: JSON.stringify(error).slice(0, 500), stack: null };
  } catch {
    return { message: String(error), stack: null };
  }
}

/** Report an error to Lovable's built-in stream AND to our own error_logs table. */
export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const { message, stack } = extractMessageAndStack(error);
  const mechanism = (context.mechanism as string | undefined) ?? "react_error_boundary";

  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: mechanism as LovableErrorOptions["mechanism"],
      handled: false,
      severity: "error",
    },
  );

  // Best-effort persist to our own error_logs table.
  try {
    void logClientError({
      data: {
        message,
        stack,
        route: window.location.pathname,
        url: window.location.href,
        userAgent: navigator.userAgent,
        mechanism,
        level: "error",
        source: "client",
      },
    }).catch(() => {});
  } catch {
    /* never throw from the reporter */
  }

  // Forward to Sentry when it has been initialised.
  try {
    const sentry = (
      window as unknown as { Sentry?: { captureException?: (e: unknown, hint?: unknown) => void } }
    ).Sentry;
    sentry?.captureException?.(error, { extra: context });
  } catch {
    /* ignore */
  }
}

/** Install global window.onerror + unhandledrejection handlers exactly once. */
let installed = false;
export function installGlobalErrorHandlers() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (evt) => {
    reportLovableError(evt.error ?? evt.message, { mechanism: "onerror" });
  });
  window.addEventListener("unhandledrejection", (evt) => {
    reportLovableError(evt.reason, { mechanism: "unhandledrejection" });
  });
}
