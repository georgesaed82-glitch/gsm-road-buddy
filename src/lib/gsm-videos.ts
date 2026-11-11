import cover01 from "@/assets/videos/gsm-tiktok-video-01-cover.jpg.asset.json";
import cover02 from "@/assets/videos/gsm-tiktok-video-02-cover.jpg.asset.json";
import cover03 from "@/assets/videos/gsm-tiktok-video-03-cover.jpg.asset.json";
import cover04 from "@/assets/videos/gsm-tiktok-video-04-cover.jpg.asset.json";
import cover05 from "@/assets/videos/gsm-tiktok-video-05-cover.jpg.asset.json";
import cover06 from "@/assets/videos/gsm-tiktok-video-06-cover.jpg.asset.json";
import cover07 from "@/assets/videos/gsm-tiktok-video-07-cover.jpg.asset.json";
import cover08 from "@/assets/videos/gsm-tiktok-video-08-cover.jpg.asset.json";
import cover09 from "@/assets/videos/gsm-tiktok-video-09-cover.jpg.asset.json";
import cover10 from "@/assets/videos/gsm-tiktok-video-10-cover.jpg.asset.json";

export type GsmVideo = {
  id: string;
  title: string;
  url: string;
  coverUrl: string;
};

const video = (id: string, title: string, coverUrl: string): GsmVideo => ({
  id,
  title,
  url: `https://www.tiktok.com/@gsm.drivingschool/video/${id}`,
  coverUrl,
});

export const GSM_VIDEOS: GsmVideo[] = [
  video("7706319824313535766", "Police approaching: hold your lane?", cover01.url),
  video("7703298255622442263", "Roundabout lane corridors", cover02.url),
  video("7698796083597626646", "Mirror system", cover03.url),
  video("7703251831257828631", "21-tonne lorry: wait or go?", cover04.url),
  video("7705516166466391318", "Big lorry: join or wait?", cover05.url),
  video("7704619639757720835", "Roundabout traffic lights", cover06.url),
  video("7702581345331023126", "Red light, blue lights", cover07.url),
  video("7703636896378932502", "Big spiral roundabout", cover08.url),
  video("7704971798529592598", "Orthodox roundabouts: follow the curve", cover09.url),
  video("7696773192702053654", "Speed limit: pass or fail?", cover10.url),
];

export function getTikTokPlayerUrl(videoId: string) {
  const params = new URLSearchParams({
    embed_from: "oembed",
    music_info: "1",
    description: "1",
    autoplay: "1",
    muted: "1",
  });
  return `https://www.tiktok.com/player/v1/${videoId}?${params.toString()}`;
}
