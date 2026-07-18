import { type ReactNode, type ElementType } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
  y?: number;
};

/**
 * Stability-first wrapper. Entrance animations are deliberately disabled so
 * page content is visible by default on iOS Safari and preview iframes.
 */
export function Reveal({
  children,
  delay: _delay = 0,
  className = "",
  as: Tag = "div",
  y: _y = 24,
}: Props) {
  const Comp = Tag as any;
  return (
    <Comp className={className}>
      {children}
    </Comp>
  );
}