import { useState, type CSSProperties } from "react";
import { SignVisual } from "@/components/SignVisual";
import { officialSignImageFor } from "@/data/signImages";
import type { Sign } from "@/data/signs";
import { Zoomable } from "@/components/Zoomable";

/**
 * Shared sizing tokens so every page renders signs consistently.
 *
 * - `thumb`    — dense list rows / inline chips
 * - `card`     — gallery / grid cards
 * - `feedback` — quiz correct-answer callouts
 * - `detail`   — quiz prompt / large presentation
 * - `hero`     — top-of-page hero
 */
export type SignImageVariant = "thumb" | "card" | "feedback" | "detail" | "hero";

export const SIGN_IMAGE_SIZES: Record<SignImageVariant, number> = {
  thumb: 64,
  card: 112,
  feedback: 128,
  detail: 176,
  hero: 220,
};

type OfficialSignImageProps = {
  sign: Sign;
  /** Preferred: pick a shared visual token so pages stay consistent. */
  variant?: SignImageVariant;
  /** Escape hatch — overrides `variant`. Prefer `variant` in new code. */
  size?: number;
  /** Test/dev escape hatch for stable local image fixtures. */
  imageSrc?: string;
  /** Admin content override image URL. When set, wins over official/imageSrc. */
  overrideSrc?: string | null;
  /** Visual tests can opt out of lazy loading so browsers render before screenshots. */
  loading?: "eager" | "lazy";
  /** Opt out of the tap-to-zoom lightbox (e.g. inside quiz answer buttons). */
  zoomable?: boolean;
};

/**
 * Renders a road-sign asset that is crisp at any size on mobile and desktop.
 *
 * - The resolved size (from `variant` or `size`) is the intrinsic/desktop target,
 *   not a hard pixel lock.
 *   On narrow containers the sign scales down (max-width: 100%) so it never
 *   overflows the card / grid cell.
 * - Aspect ratio is locked to 1:1 so scaling never distorts the artwork.
 * - The underlying assets are SVG (either official Wikimedia SVGs or our own
 *   SignVisual pictograms), so scaling is resolution-independent and stays
 *   crisp on high-DPR mobile screens.
 */
export function OfficialSignImage({
  sign,
  variant = "detail",
  size,
  imageSrc,
  overrideSrc,
  loading = "lazy",
  zoomable = true,
}: OfficialSignImageProps) {
  const resolvedSize = size ?? SIGN_IMAGE_SIZES[variant];
  const src = overrideSrc || imageSrc || officialSignImageFor(sign.id);
  const [errored, setErrored] = useState(false);

  const wrapperStyle: CSSProperties = {
    width: resolvedSize,
    maxWidth: "100%",
    aspectRatio: "1 / 1",
    verticalAlign: "top",
  };

  const content = !src || errored ? (
    <div style={wrapperStyle} className="flex items-center justify-center">
      <SignVisual variant={sign.variant} size={resolvedSize} />
    </div>
  ) : (
    <div style={wrapperStyle} className="block">
      <img
        src={src}
        alt={sign.name}
        width={resolvedSize}
        height={resolvedSize}
        loading={loading}
        decoding="async"
        onError={() => setErrored(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          imageRendering: "auto",
          verticalAlign: "top",
        }}
      />
    </div>
  );

  if (!zoomable) return content;
  return (
    <Zoomable label={sign.name} aspectRatio="1 / 1" className="inline-block">
      {content}
    </Zoomable>
  );
}