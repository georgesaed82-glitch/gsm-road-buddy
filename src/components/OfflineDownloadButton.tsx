import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, Loader2, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** Stable key used to remember the "downloaded" state per section. */
  sectionKey: string;
  /** Human label for the lesson section (e.g. "theory topics"). */
  label: string;
  /**
   * URLs to pre-cache. Can be page routes ("/theory") or absolute asset
   * URLs (videos, posters, JSON). The service worker's runtime caches will
   * hold on to them for offline use.
   */
  urls: string[];
  className?: string;
};

const STORAGE_PREFIX = "gsm.offline.section.";

export function OfflineDownloadButton({ sectionKey, label, urls, className }: Props) {
  const storageKey = STORAGE_PREFIX + sectionKey;
  const [state, setState] = useState<"idle" | "downloading" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only meaningful when a service worker is controlling the page (i.e. the
    // published site, PWA install). In Lovable preview / dev this stays off
    // and the button explains why.
    const ready = "serviceWorker" in navigator && !!navigator.serviceWorker.controller;
    setSwReady(ready);
    try {
      if (window.localStorage.getItem(storageKey)) setState("done");
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  async function handleDownload() {
    if (state === "downloading") return;
    setState("downloading");
    setProgress(0);
    setTotal(urls.length);

    let ok = 0;
    // Fetch sequentially in small batches to avoid hammering the network.
    const batchSize = 4;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (url) => {
          try {
            // `cache: "reload"` forces a network fetch so the SW's runtime
            // caches get a fresh copy instead of a stale HTTP cache hit.
            const res = await fetch(url, { cache: "reload", credentials: "same-origin" });
            if (res.ok || res.type === "opaque") ok++;
          } catch {
            /* offline / blocked — skip */
          }
          setProgress((p) => p + 1);
        }),
      );
    }

    if (ok > 0) {
      try {
        window.localStorage.setItem(storageKey, String(Date.now()));
      } catch {
        /* ignore */
      }
      setState("done");
    } else {
      setState("error");
    }
  }

  function handleReset() {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setState("idle");
    setProgress(0);
  }

  const pct = total ? Math.round((progress / total) * 100) : 0;

  return (
    <div className={cn("rounded-lg border border-border bg-card/60 p-4", className)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-accent">
          {state === "done" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : state === "downloading" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : state === "error" ? (
            <WifiOff className="h-5 w-5" />
          ) : (
            <Download className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">
            {state === "done"
              ? `${label} saved for offline`
              : state === "downloading"
                ? `Saving ${label}…`
                : state === "error"
                  ? `Couldn't save ${label}`
                  : `Download ${label} for offline`}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {state === "done"
              ? "These pages and materials will load without signal on this device."
              : state === "downloading"
                ? `${progress} of ${total} items · ${pct}%`
                : state === "error"
                  ? "You may be offline right now. Try again once you have signal."
                  : swReady
                    ? "Pre-caches this section so it works with poor or no signal. Uses a bit of mobile data now."
                    : "Open the published app once online, then come back — offline saving activates after the app installs its cache."}
          </p>
          {state === "downloading" ? (
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
              aria-hidden
            >
              <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          {state === "done" ? (
            <Button size="sm" variant="outline" onClick={handleReset}>
              Refresh
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={state === "downloading" || urls.length === 0}
            >
              {state === "error" ? "Retry" : "Download"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
