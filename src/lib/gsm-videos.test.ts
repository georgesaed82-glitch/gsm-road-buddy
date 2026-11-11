import { describe, expect, it } from "vitest";
import { GSM_VIDEOS, getTikTokPlayerUrl } from "./gsm-videos";

describe("GSM video gallery", () => {
  it("contains exactly ten distinct public GSM video URLs", () => {
    expect(GSM_VIDEOS).toHaveLength(10);
    expect(new Set(GSM_VIDEOS.map((video) => video.id)).size).toBe(10);
    expect(new Set(GSM_VIDEOS.map((video) => video.url)).size).toBe(10);
    for (const video of GSM_VIDEOS) {
      expect(video.url).toBe(`https://www.tiktok.com/@gsm.drivingschool/video/${video.id}`);
    }
  });

  it("always starts the official player muted", () => {
    for (const video of GSM_VIDEOS) {
      const player = new URL(getTikTokPlayerUrl(video.id));
      expect(player.origin).toBe("https://www.tiktok.com");
      expect(player.pathname).toBe(`/player/v1/${video.id}`);
      expect(player.searchParams.get("autoplay")).toBe("1");
      expect(player.searchParams.get("muted")).toBe("1");
    }
  });
});
