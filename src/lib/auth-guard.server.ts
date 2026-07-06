import { getRequest } from "@tanstack/react-start/server";

export function reqMeta(): { ip: string | null; ua: string | null } {
  try {
    const req = getRequest();
    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      null;
    const ua = req.headers.get("user-agent");
    return { ip, ua: ua ? ua.slice(0, 300) : null };
  } catch {
    return { ip: null, ua: null };
  }
}

/**
 * Read the current server-function request's Authorization bearer token,
 * if any. Server-only — must be imported via dynamic import from
 * `.functions.ts` files so it never lands in the client bundle.
 */
export function getBearerToken(): string | null {
  try {
    const req = getRequest();
    const header =
      req?.headers.get("authorization") || req?.headers.get("Authorization");
    if (!header) return null;
    const token = header.replace(/^Bearer\s+/i, "").trim();
    return token || null;
  } catch {
    return null;
  }
}

export function getRequestOrigin(): string {
  try {
    return new URL(getRequest().url).origin;
  } catch {
    return "";
  }
}