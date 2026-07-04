export const ADMIN_GATE_KEY = "admin_unlocked";
export const ADMIN_PASSWORD_KEY = "admin_password";

/** Reads the admin password the user typed at /auth?admin=1. */
export function getAdminPassword(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ADMIN_PASSWORD_KEY) ?? "";
}

export function setAdminPassword(password: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_PASSWORD_KEY, password);
  window.localStorage.setItem(ADMIN_GATE_KEY, "1");
}

/** True if an error thrown from a server fn indicates an expired/invalid admin session. */
export function isAdminUnauthorizedError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /unauthorized/i.test(msg);
}

/** Clears cached admin unlock state (used when the server rejects the cached password). */
export function clearAdminUnlock() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_GATE_KEY);
  window.localStorage.removeItem(ADMIN_PASSWORD_KEY);
}