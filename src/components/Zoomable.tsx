import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
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
  /**
   * Whether tapping the enlarged content closes it. Defaults to true (good for
   * static images). Set to false when the enlarged view contains interactive
   * controls (e.g. animated diagrams with quiz buttons).
   */
  closeOnContentClick?: boolean;
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
export function Zoomable({
  children,
  label,
  className,
  aspectRatio,
  bare = false,
  closeOnContentClick = true,
}: ZoomableProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartRef = useRef<{
    dist: number;
    scale: number;
    cx: number;
    cy: number;
    tx: number;
    ty: number;
  } | null>(null);
  const panStartRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => setMounted(true), []);

  const resetTransform = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    resetTransform();
  }, [resetTransform]);

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

  const clampScale = (s: number) => Math.min(6, Math.max(1, s));

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragRef.current = { x: e.clientX, y: e.clientY };

    if (pointersRef.current.size === 2) {
      const [a, b] = Array.from(pointersRef.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      pinchStartRef.current = {
        dist,
        scale,
        cx: (a.x + b.x) / 2,
        cy: (a.y + b.y) / 2,
        tx,
        ty,
      };
      panStartRef.current = null;
      swipeStartRef.current = null;
    } else if (pointersRef.current.size === 1) {
      if (scale > 1) {
        panStartRef.current = { x: e.clientX, y: e.clientY, tx, ty };
        swipeStartRef.current = null;
      } else {
        swipeStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
        panStartRef.current = null;
      }
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2 && pinchStartRef.current) {
      const [a, b] = Array.from(pointersRef.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const ratio = dist / pinchStartRef.current.dist;
      const nextScale = clampScale(pinchStartRef.current.scale * ratio);
      setScale(nextScale);
      return;
    }

    if (panStartRef.current && scale > 1) {
      setTx(panStartRef.current.tx + (e.clientX - panStartRef.current.x));
      setTy(panStartRef.current.ty + (e.clientY - panStartRef.current.y));
      return;
    }

    if (swipeStartRef.current && scale === 1) {
      const dy = e.clientY - swipeStartRef.current.y;
      if (dy > 0) setTy(dy);
    }
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;
    const moved =
      start != null &&
      (Math.abs(e.clientX - start.x) > 6 || Math.abs(e.clientY - start.y) > 6);

    // Swipe-down to close (single-touch, un-zoomed)
    if (
      swipeStartRef.current &&
      scale === 1 &&
      pointersRef.current.size === 1
    ) {
      const dy = e.clientY - swipeStartRef.current.y;
      const dx = e.clientX - swipeStartRef.current.x;
      const dt = Date.now() - swipeStartRef.current.time;
      if (dy > 120 && Math.abs(dx) < 80 && dt < 800) {
        pointersRef.current.delete(e.pointerId);
        swipeStartRef.current = null;
        panStartRef.current = null;
        pinchStartRef.current = null;
        close();
        return;
      }
      setTy(0);
    }

    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchStartRef.current = null;
    if (pointersRef.current.size === 0) {
      panStartRef.current = null;
      swipeStartRef.current = null;
    }

    // Double-tap to toggle zoom (only if this was a tap, not a drag)
    if (!moved && pointersRef.current.size === 0) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        lastTapRef.current = 0;
        if (scale > 1) {
          resetTransform();
        } else {
          setScale(2.5);
          setTx(0);
          setTy(0);
        }
        return;
      }
      lastTapRef.current = now;
    }
    dragRef.current = null;
  };

  const handleWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 20) return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => clampScale(s * factor));
  };

  // Content clicks never close directly — closing is done via the X button,
  // the backdrop, Escape, or swipe-down on mobile. This keeps double-tap zoom
  // and pinch/pan gestures reliable. `closeOnContentClick` is retained on the
  // prop surface for backwards compatibility but is intentionally unused.
  void closeOnContentClick;
  const handleContentClick = (e: ReactMouseEvent) => {
    e.stopPropagation();
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

      {mounted &&
        open &&
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
              onClick={handleContentClick}
            >
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
                className="flex max-h-[85vh] max-w-full animate-scale-in items-center justify-center overflow-hidden touch-none select-none [&>*]:max-h-[85vh] [&>*]:max-w-full [&_img]:max-h-[85vh] [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain [&_svg]:max-h-[85vh] [&_svg]:w-auto [&_svg]:max-w-full"
                style={{
                  ...(aspectRatio ? { aspectRatio } : {}),
                  transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
                  transition:
                    pointersRef.current.size === 0 ? "transform 180ms ease-out" : "none",
                  cursor: scale > 1 ? "grab" : "zoom-in",
                  willChange: "transform",
                }}
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
