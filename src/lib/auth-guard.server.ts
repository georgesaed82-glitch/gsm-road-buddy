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