import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  y?: number;
};

/**
 * Reveal — smooth scroll-triggered fade + rise.
 * Uses IntersectionObserver, respects prefers-reduced-motion,
 * gracefully renders visible during SSR.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  y = 24,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Comp = Tag as any;
  return (
    <Comp
      ref={ref as any}
      style={{
        transform: visible ? "translate3d(0,0,0)" : `translate3d(0,${y}px,0)`,
        opacity: visible ? 1 : 0,
        transition: `opacity 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 800ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
      className={className}
    >
      {children}
    </Comp>
  );
}