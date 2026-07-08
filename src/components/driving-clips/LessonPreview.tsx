import { useEffect, useRef, useState, type ReactNode } from "react";

// Small always-playing animated preview used on the lesson index page.
// It just runs the lesson's render(t) on a rAF loop — no controls.
export function LessonPreview({
  render,
  durationMs = 14000,
}: {
  render: (t: number) => ReactNode;
  durationMs?: number;
}) {
  const [t, setT] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef<number | null>(null);

  useEffect(() => {
    const step = (now: number) => {
      if (start.current === null) start.current = now;
      const elapsed = now - start.current;
      setT((elapsed / durationMs) % 1);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [durationMs]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black">
      {render(t)}
      <div className="pointer-events-none absolute right-2 bottom-2 flex items-center gap-1 rounded bg-black/55 px-1.5 py-0.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/85">
          GSM
        </span>
      </div>
    </div>
  );
}
