/**
 * Legacy admin-gate shims.
 *
 * Admin auth now uses the Supabase session bearer token plus the `admin`
 * role in `public.user_roles`. Nothing sensitive is stored in the browser.
 * These helpers remain as no-op stubs so existing call sites compile — the
 * `password` value they return is not used by the server for any decision.
 */

export const ADMIN_GATE_KEY = "admin_unlocked";
export const ADMIN_PASSWORD_KEY = "admin_password";

/** Returns an empty string. The server ignores this value. */
export function getAdminPassword(): string {
  return "";
}

/** No-op. Kept for backwards-compat with old call sites. */
export function setAdminPassword(_password: string) {
  clearAdminUnlock();
}

export function isAdminUnauthorizedError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /unauthorized/i.test(msg);
}

/** Best-effort scrub of any password/token left in localStorage by an older build. */
export function clearAdminUnlock() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ADMIN_GATE_KEY);
    window.localStorage.removeItem(ADMIN_PASSWORD_KEY);
  } catch {}
}