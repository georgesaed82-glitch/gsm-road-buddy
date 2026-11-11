export const TIKTOK_EMBED_ORIGIN = "https://www.tiktok.com";

// Accept only official creator-frame sizing, never messages from other windows.
export function tiktokProfileHeight(origin: string, data: unknown, frameName: string): number | undefined {
  if (origin !== TIKTOK_EMBED_ORIGIN || typeof data !== "string") return;
  try {
    const message: unknown = JSON.parse(data);
    if (!message || typeof message !== "object") return;
    const { signalSource, height } = message as { signalSource?: unknown; height?: unknown };
    if (signalSource !== frameName || typeof height !== "number" || !Number.isFinite(height) || height < 100 || height > 2000) return;
    return height;
  } catch { return; }
}