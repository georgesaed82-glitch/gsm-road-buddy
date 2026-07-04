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