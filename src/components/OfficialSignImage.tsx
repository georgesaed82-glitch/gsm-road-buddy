import { useState } from "react";
import { SignVisual } from "@/components/SignVisual";
import { officialSignImageFor } from "@/data/signImages";
import type { Sign } from "@/data/signs";

export function OfficialSignImage({ sign, size = 160 }: { sign: Sign; size?: number }) {
  const src = officialSignImageFor(sign.id);
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return <SignVisual variant={sign.variant} size={size} />;
  }

  return (
    <img
      src={src}
      alt={sign.name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setErrored(true)}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}