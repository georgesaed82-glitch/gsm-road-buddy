import { useCallback, useEffect, useState, type ReactNode, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ZoomableProps = {
  children: ReactNode;
  /** Label announced to screen readers and shown under the enlarged view. */
  label?: string;
  /** Tailwind classes for the trigger wrapper. */
  className?: string;
  /** Optional aspect ratio hint for the enlarged view (e.g. "16/9", "1/1"). */
  aspectRatio?: string;
  /** When true, the trigger renders without the built-in hover affordance. */
  bare?: boolean;
};

/**
 * Wraps any image, diagram or animation in a click-to-zoom lightbox.
 *
 * - Tap to open a full-screen overlay with a dimmed backdrop.
 * - Tap the enlarged content, tap the backdrop, press Escape or use the ✕ button to close.
 * - Content scales to fit while keeping its aspect ratio (object-contain).
 * - Body scroll is locked while open, so returning to the lesson keeps scroll position.
 * - Works for <img>, SVG diagrams and live-updating animations (children re-render inside the overlay).
 */
export function Zoomable({ children, label, className, aspectRatio, bare = false }: ZoomableProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const onTriggerKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={label ? `Enlarge ${label}` : "Enlarge image"}
        onClick={() => setOpen(true)}
        onKeyDown={onTriggerKey}
        className={cn(
          "group relative block cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-accent",
          !bare && "transition-transform duration-200 hover:brightness-105",
          className,
        )}
      >
        {children}
      </div>

      {mounted && open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={label ?? "Enlarged view"}
            onClick={close}
            className="fixed inset-0 z-[200] flex animate-fade-in items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          >
            <button
              type="button"
              aria-label="Close enlarged view"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
            >
              <X className="h-4 w-4" />
              Close
            </button>

            <figure
              className="relative flex max-h-full max-w-[95vw] flex-col items-center"
              onClick={(e) => {
                // Tap the enlarged content itself to close, mirroring the backdrop behaviour.
                e.stopPropagation();
                close();
              }}
            >
              <div
                className="flex max-h-[85vh] max-w-full animate-scale-in items-center justify-center overflow-hidden [&>*]:max-h-[85vh] [&>*]:max-w-full [&_img]:max-h-[85vh] [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain [&_svg]:max-h-[85vh] [&_svg]:w-auto [&_svg]:max-w-full"
                style={aspectRatio ? { aspectRatio } : undefined}
              >
                {children}
              </div>
              {label && (
                <figcaption className="mt-4 max-w-2xl text-center font-display text-sm text-white/90 sm:text-base">
                  {label}
                </figcaption>
              )}
            </figure>
          </div>,
          document.body,
        )}
    </>
  );
}
