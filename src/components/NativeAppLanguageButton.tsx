import { LanguageSelector } from "@/components/LanguageSelector";
import { useIsNativeApp } from "@/lib/isNativeApp";

/**
 * Floating language switcher for the installed Capacitor app.
 *
 * The regular website header is hidden inside the native app (per user
 * request), so we expose the language selector as a small floating
 * control anchored to the top-right, respecting the iOS safe area.
 */
export function NativeAppLanguageButton() {
  const native = useIsNativeApp();
  if (!native) return null;
  return (
    <div
      className="pointer-events-none fixed right-3 z-[200]"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
    >
      <div className="pointer-events-auto">
        <LanguageSelector variant="icon" side="bottom" align="end" />
      </div>
    </div>
  );
}