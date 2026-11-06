/** Confirmed GSM TikTok account (from George's own profile screenshot, Nov 2026). */
export const TIKTOK_HANDLE = "gsm.drivingschool";
export const TIKTOK_PROFILE_URL = `https://www.tiktok.com/@${TIKTOK_HANDLE}`;

/** Use the admin-set TikTok link unless it is blank. */
export function resolveTiktokUrl(stored?: string | null): string {
  const v = (stored ?? "").trim();
  return v || TIKTOK_PROFILE_URL;
}
