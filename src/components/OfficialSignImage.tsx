import { useState } from "react";
import { SignVisual } from "@/components/SignVisual";
import { officialSignImageFor } from "@/data/signImages";
import type { Sign } from "@/data/signs";

/**
 * Renders a road-sign asset that is crisp at any size on mobile and desktop.
 *
 * - `size` is treated as the intrinsic/desktop target size, not a hard pixel lock.
 *   On narrow containers the sign scales down (max-width: 100%) so it never
 *   overflows the card / grid cell.
 * - Aspect ratio is locked to 1:1 so scaling never distorts the artwork.
 * - The underlying assets are SVG (either official Wikimedia SVGs or our own
 *   SignVisual pictograms), so scaling is resolution-independent and stays
 *   crisp on high-DPR mobile screens.
 */
export function OfficialSignImage({ sign, size = 160 }: { sign: Sign; size?: number }) {
  const src = officialSignImageFor(sign.id);
  const [errored, setErrored] = useState(false);

  const wrapperStyle: React.CSSProperties = {
    width: size,
    maxWidth: "100%",
    aspectRatio: "1 / 1",
  };

  if (!src || errored) {
    return (
      <div style={wrapperStyle} className="inline-flex items-center justify-center">
        <SignVisual variant={sign.variant} size={size} />
      </div>
    );
  }

  return (
    <div style={wrapperStyle} className="inline-block">
      <img
        src={src}
        alt={sign.name}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setErrored(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          // SVGs render sharp by default; this hint keeps rasterised fallbacks
          // (should a PNG ever slip in) from getting blurred on high-DPR screens.
          imageRendering: "auto",
        }}
      />
    </div>
  );
}