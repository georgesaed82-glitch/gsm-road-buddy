import { useEffect, useState } from "react";
import { Download, Smartphone, Share, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerPwaInstallPrompt } from "@/components/PWAInstallTracker";

function detectPlatform() {
  if (typeof navigator === "undefined") return { ios: false, android: false, standalone: false };
  const ua = navigator.userAgent || "";
  const ios = /iPhone|iPad|iPod/i.test(ua);
  const android = /Android/i.test(ua);
  const standalone =
    (typeof window !== "undefined" &&
      window.matchMedia?.("(display-mode: standalone)").matches) ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return { ios, android, standalone };
}

export function InstallAppCard() {
  const [platform, setPlatform] = useState({ ios: false, android: false, standalone: false });
  const [canPrompt, setCanPrompt] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    const refresh = () => setCanPrompt(Boolean(window.gsmInstallPrompt));
    refresh();
    const onAvail = () => setCanPrompt(true);
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onAvail);
    window.addEventListener("appinstalled", onInstalled);
    const interval = window.setInterval(refresh, 1500);
    return () => {
      window.removeEventListener("beforeinstallprompt", onAvail);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearInterval(interval);
    };
  }, []);

  if (platform.standalone || installed) return null;

  const handleInstall = async () => {
    if (platform.ios) {
      setShowIosHelp(true);
      return;
    }
    const shown = await triggerPwaInstallPrompt();
    if (!shown) {
      setShowIosHelp(true);
    }
  };

  return (
    <section id="download-app" className="border-y border-border bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-8 shadow-lg sm:p-12 lg:p-14">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-accent" />
          <div className="grid items-center gap-10 lg:grid-cols-[auto_1fr_auto]">
            <div className="hidden h-20 w-20 items-center justify-center rounded-full bg-accent/10 lg:flex">
              <Smartphone className="h-10 w-10 text-accent" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span className="h-px w-6 bg-accent" />
                GSM mobile app
              </div>
              <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium leading-[1.1] text-foreground sm:text-4xl lg:text-[44px]">
                Download the GSM <span className="text-accent">app</span> to your phone.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Install the GSM Driving School app for one-tap access to lessons, theory practice,
                hazard perception and your learner portal — straight from your home screen, online or
                offline.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-accent" /> iPhone &amp; Android
                </span>
                <span className="inline-flex items-center gap-2">
                  <Download className="h-4 w-4 text-accent" /> Free — no app store
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <Button
                size="lg"
                onClick={handleInstall}
                className="h-14 rounded-none bg-accent px-8 text-sm uppercase tracking-[0.22em] text-accent-foreground hover:bg-accent/90"
              >
                <Download className="mr-2 h-5 w-5" />
                {platform.ios ? "Add to Home Screen" : "Install the GSM app"}
              </Button>
              {canPrompt && !platform.ios && (
                <p className="text-xs text-muted-foreground lg:text-right">
                  Your browser is ready to install.
                </p>
              )}
            </div>
          </div>

          {showIosHelp && (
            <div className="mt-8 rounded-lg border border-border bg-muted p-6 text-sm">
              <p className="font-medium text-foreground">
                {platform.ios ? "Install on iPhone / iPad" : "Install on your device"}
              </p>
              <ol className="mt-3 space-y-2 text-muted-foreground">
                {platform.ios ? (
                  <>
                    <li className="flex gap-2">
                      <span className="font-medium text-foreground">1.</span>
                      <span className="inline-flex flex-wrap items-center gap-1">
                        Tap the <Share className="inline h-4 w-4 text-accent" /> Share button at the bottom of Safari.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-foreground">2.</span>
                      <span className="inline-flex flex-wrap items-center gap-1">
                        Choose <Plus className="inline h-4 w-4 text-accent" /> <strong className="text-foreground">Add to Home Screen</strong>.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-foreground">3.</span>
                      <span>Tap <strong className="text-foreground">Add</strong> — the GSM icon appears on your home screen.</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li>Open this site in Chrome, Edge or Samsung Internet.</li>
                    <li>Open the browser menu (⋮) and choose <strong className="text-foreground">Install app</strong> or <strong className="text-foreground">Add to Home screen</strong>.</li>
                    <li>Confirm to add the GSM icon to your home screen.</li>
                  </>
                )}
              </ol>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
