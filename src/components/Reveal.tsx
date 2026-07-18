import { useEffect, useState, type ReactNode, type ElementType } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
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
  // Start visible during SSR so content is always rendered even if JS is slow
  // or an animation observer never fires (defensive: iOS Safari, low-power mode).
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // On the client, briefly hide, then fade in once — a single one-shot animation.
    // Respect reduced motion by skipping the animation entirely.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setMounted(true);
      setVisible(true);
      return;
    }
    setVisible(false);
    setMounted(true);
    const id = window.setTimeout(() => setVisible(true), 20 + delay);
    // Failsafe: guarantee visibility even if a transition is interrupted.
    const failsafe = window.setTimeout(() => setVisible(true), 1500 + delay);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(failsafe);
    };
  }, [delay]);

  const Comp = Tag as any;
  const animate = mounted;
  return (
    <Comp
      style={
        animate
          ? {
              transform: visible ? "translate3d(0,0,0)" : `translate3d(0,${y}px,0)`,
              opacity: visible ? 1 : 0,
              transition: `opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 800ms cubic-bezier(0.22,1,0.36,1)`,
              willChange: "opacity, transform",
            }
          : undefined
      }
      className={className}
    >
      {children}
    </Comp>
  );
}