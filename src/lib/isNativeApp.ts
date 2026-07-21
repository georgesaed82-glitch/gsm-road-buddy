// Detects whether the app is running inside the Capacitor native app
// shell (installed iOS/Android app) vs a normal web browser.
//
// We check both the Capacitor global and the user-agent because on some
// devices the global is injected slightly after first render.
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as {
    Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string };
  };
  try {
    if (w.Capacitor?.isNativePlatform?.()) return true;
    const platform = w.Capacitor?.getPlatform?.();
    if (platform === "ios" || platform === "android") return true;
  } catch {
    // ignore
  }
  const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
  return /GSMPlusApp|CapacitorApp/i.test(ua);
}

import { useEffect, useState } from "react";

export function useIsNativeApp(): boolean {
  const [native, setNative] = useState(false);
  useEffect(() => {
    setNative(isNativeApp());
  }, []);
  return native;
}