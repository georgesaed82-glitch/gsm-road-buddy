// Guarded service-worker registration for the GSM PWA.
// - Only runs in production browsers on the real domain.
// - Refuses to register in Lovable preview, iframes, dev, or when ?sw=off is set.
// - Unregisters any matching /sw.js in refused contexts so stale workers clean up.

const SW_URL = "/sw.js";

function isRefusedContext(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return true;
  if (!("serviceWorker" in navigator)) return true;
  if (!import.meta.env.PROD) return true;

  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }

  const host = window.location.hostname;
  if (
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev")
  ) {
    return true;
  }

  if (new URL(window.location.href).searchParams.get("sw") === "off") return true;

  return false;
}

async function unregisterMatching() {
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(
      regs
        .filter((r) => {
          const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
          return url.endsWith(SW_URL);
        })
        .map((r) => r.unregister()),
    );
  } catch {
    /* ignore */
  }
}

export function registerServiceWorker() {
  if (isRefusedContext()) {
    void unregisterMatching();
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register(SW_URL, { scope: "/" }).catch(() => {
      /* ignore */
    });
  });
}