/** Confirmed GSM Driving School YouTube channel (channel settings, 3 Oct 2026). */
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@GSMDrivingSchool";
export const YOUTUBE_SHORTS_URL = "https://www.youtube.com/@GSMDrivingSchool/shorts";

const RETIRED_HANDLES = [/@georgesaed6390/i];

/** Use the admin-set YouTube link unless it is empty or the retired channel. */
export function resolveYoutubeUrl(stored?: string | null): string {
  const v = (stored ?? "").trim();
  if (!v || RETIRED_HANDLES.some((r) => r.test(v))) return YOUTUBE_CHANNEL_URL;
  return v;
}

/** WhatsApp draft for visitors arriving from YouTube. The visitor sends it themselves. */
export function youtubeWhatsAppHref(phoneIntl: string): string {
  const text = [
    "Hi George, I found GSM Driving School on YouTube and I'd like to ask about lessons.",
    "My postcode: ",
    "Automatic, manual or refresher: ",
    "My driving experience so far: ",
    "My availability: ",
  ].join("\n");
  return `https://wa.me/${phoneIntl}?text=${encodeURIComponent(text)}`;
}
