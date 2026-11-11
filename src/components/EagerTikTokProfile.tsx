import { useEffect, useRef, useState } from "react";
import { TIKTOK_HANDLE } from "@/lib/tiktok";
import { tiktokProfileHeight } from "@/lib/tiktokProfileEmbed";

const FRAME_NAME = "__tt_embed__gsm_profile";

/** Same official creator player, without the embed-script download chain. */
export function EagerTikTokProfile() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(570);
  useEffect(() => {
    const resize = (event: MessageEvent) => {
      if (!frame.current || event.source !== frame.current.contentWindow) return;
      const next = tiktokProfileHeight(event.origin, event.data, FRAME_NAME);
      if (next !== undefined) setHeight(next);
    };
    window.addEventListener("message", resize);
    return () => window.removeEventListener("message", resize);
  }, []);
  return (
    <div className="mx-auto w-full max-w-[340px] overflow-hidden lg:max-w-[480px]">
      <iframe
        ref={frame}
        name={FRAME_NAME}
        title="GSM Driving School TikTok profile and videos"
        src={`https://www.tiktok.com/embed/@${TIKTOK_HANDLE}?lang=en-GB`}
        loading="eager"
        width="100%"
        height={height}
        className="block w-full border-0"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts allow-top-navigation allow-same-origin"
        allow="fullscreen"
        allowFullScreen
      />
    </div>
  );
}