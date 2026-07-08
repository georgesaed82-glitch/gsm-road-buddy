import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type GalleryPhoto = {
  url: string;
  caption: string;
};

type Props = {
  photos: GalleryPhoto[];
};

export function PhotoGallery({ photos }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, prev, next]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <>
      {/* Mobile carousel */}
      <div className="relative md:hidden">
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="relative aspect-[4/5] w-[78%] shrink-0 snap-center overflow-hidden bg-background"
            >
              <img
                src={p.url}
                alt={p.caption}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-left">
                <p className="text-sm font-medium text-white">{p.caption}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            aria-label="Previous photos"
            onClick={() => scrollBy(-1)}
            className="grid h-10 w-10 place-items-center border border-border bg-background"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next photos"
            onClick={() => scrollBy(1)}
            className="grid h-10 w-10 place-items-center border border-border bg-background"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Desktop grid */}
      <div className="hidden grid-cols-3 gap-3 md:grid lg:grid-cols-5">
        {photos.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-square overflow-hidden bg-background"
          >
            <img
              src={p.url}
              alt={p.caption}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-3 text-left transition-transform duration-300 group-hover:translate-y-0">
              <p className="text-xs font-medium text-white">{p.caption}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={photos[openIndex].caption}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 sm:p-8"
          onClick={close}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center border border-white/20 bg-white/5 text-white transition hover:bg-white/15 sm:right-6 sm:top-6"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border border-white/20 bg-white/5 text-white transition hover:bg-white/15 sm:left-6 sm:h-12 sm:w-12"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border border-white/20 bg-white/5 text-white transition hover:bg-white/15 sm:right-6 sm:h-12 sm:w-12"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <figure
            className="relative flex max-h-full max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[openIndex].url}
              alt={photos[openIndex].caption}
              className="max-h-[78vh] w-auto max-w-full object-contain"
            />
            <figcaption className="mt-4 flex w-full items-center justify-between gap-4 text-white/90">
              <p className="font-display text-base sm:text-lg">{photos[openIndex].caption}</p>
              <span className="shrink-0 text-xs uppercase tracking-[0.22em] text-white/60">
                {openIndex + 1} / {photos.length}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
