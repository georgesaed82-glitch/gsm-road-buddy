import { describe, expect, it } from "vitest";
import { tiktokProfileHeight, TIKTOK_EMBED_ORIGIN } from "./tiktokProfileEmbed";

describe("official TikTok profile resizing", () => {
  const name = "__tt_embed__gsm_profile";
  const message = JSON.stringify({ signalSource: name, height: 389 });
  it("preserves the real profile height", () => {
    expect(tiktokProfileHeight(TIKTOK_EMBED_ORIGIN, message, name)).toBe(389);
  });
  it("rejects other origins and other frames", () => {
    expect(tiktokProfileHeight("https://example.com", message, name)).toBeUndefined();
    expect(tiktokProfileHeight(TIKTOK_EMBED_ORIGIN, message, "other")).toBeUndefined();
  });
  it("rejects invalid sizing messages", () => {
    for (const height of [0, -1, 2001, "389", null]) {
      expect(tiktokProfileHeight(TIKTOK_EMBED_ORIGIN, JSON.stringify({ signalSource: name, height }), name)).toBeUndefined();
    }
    expect(tiktokProfileHeight(TIKTOK_EMBED_ORIGIN, "bad json", name)).toBeUndefined();
  });
});