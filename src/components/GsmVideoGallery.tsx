import { useState } from "react";
import { ExternalLink, Play, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TikTokIcon } from "@/components/TikTokIcon";
import { GSM_VIDEOS, getTikTokPlayerUrl } from "@/lib/gsm-videos";

export function GsmVideoGallery() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section aria-labelledby="gsm-video-gallery-title" className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:max-w-[1180px] lg:px-8">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-8 bg-accent" /> GSM video library
          </p>
          <h2 id="gsm-video-gallery-title" className="mt-4 font-display text-3xl font-medium leading-tight text-primary sm:text-4xl">
            Watch GSM driving lessons
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Choose a video to load TikTok&apos;s official player. Videos start muted; use the player controls for playback, sound and fullscreen.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Only one player opens at a time, so choosing another video stops the previous one. TikTok&apos;s own consent choices still apply.
          </p>
        </div>

        <ol className="mt-8 grid grid-cols-1 justify-center gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {GSM_VIDEOS.map((video, index) => {
            const isActive = activeId === video.id;
            return (
              <li key={video.id} className={index === GSM_VIDEOS.length - 1 ? "xl:col-start-2" : undefined}>
                <article className="mx-auto w-full max-w-[390px] overflow-hidden rounded-2xl border-2 border-primary/25 bg-card box-3d">
                  <div className="relative aspect-[325/578] w-full bg-primary">
                    {isActive ? (
                      <iframe
                        key={video.id}
                        src={getTikTokPlayerUrl(video.id)}
                        title={`${video.title} — TikTok player`}
                        className="absolute inset-0 h-full w-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveId(video.id)}
                        className="group absolute inset-0 block h-full w-full text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-accent"
                        aria-label={`Load and play ${video.title} on TikTok, initially muted`}
                      >
                        <img
                          src={video.coverUrl}
                          alt={`${video.title} — GSM video cover`}
                          className="absolute inset-0 h-full w-full object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-tiktok text-tiktok-foreground shadow-lg transition-transform group-hover:scale-105 group-focus-visible:scale-105">
                          <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
                        </span>
                        <span className="absolute inset-x-4 bottom-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-background/95 px-4 py-2 text-center text-sm font-semibold text-primary shadow-md">
                          <TikTokIcon className="h-4 w-4 shrink-0" /> Load official TikTok player
                        </span>
                      </button>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold leading-snug text-foreground">{video.title}</h3>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button asChild variant="outline" size="sm" className="min-h-11 border-primary/30 text-primary">
                        <a href={video.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${video.title} on TikTok`}>
                          <ExternalLink className="h-4 w-4" /> Open on TikTok
                        </a>
                      </Button>
                      {isActive ? (
                        <Button type="button" variant="ghost" size="sm" className="min-h-11 text-primary" onClick={() => setActiveId(null)}>
                          <X className="h-4 w-4" /> Close player
                        </Button>
                      ) : (
                        <span className="inline-flex min-h-11 items-center gap-1.5 px-2 text-xs text-muted-foreground">
                          <VolumeX className="h-4 w-4" aria-hidden="true" /> Starts muted
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
