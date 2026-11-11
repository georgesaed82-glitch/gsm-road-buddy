import { useEffect, useRef } from "react";
import { TIKTOK_HANDLE, TIKTOK_PROFILE_URL } from "@/lib/tiktok";

/**
 * Official TikTok creator-profile embed. Loads TikTok's embed.js only after hydration.
 * If TikTok's script is blocked or the embed is unavailable, the blockquote
 * stays as a plain link to the profile, so watching/following still works.
 */
export function TikTokEmbed() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const s = document.createElement("script");
    s.src = "https://www.tiktok.com/embed.js";
    s.async = true;
    ref.current.appendChild(s);
    return () => { s.remove(); };
  }, []);
  return (
    <div ref={ref} className="mx-auto w-full max-w-[340px] overflow-hidden lg:max-w-[480px]">
      <blockquote
        className="tiktok-embed"
        cite={TIKTOK_PROFILE_URL}
        data-unique-id={TIKTOK_HANDLE}
        data-embed-type="creator"
        style={{ maxWidth: 780, minWidth: 288, margin: 0 }}
      >
        <section>
          <a target="_blank" rel="noopener noreferrer" href={`${TIKTOK_PROFILE_URL}?refer=creator_embed`}>
            @{TIKTOK_HANDLE} on TikTok
          </a>
        </section>
      </blockquote>
    </div>
  );
}
