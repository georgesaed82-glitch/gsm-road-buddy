import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

export type SectionAnchor = {
  /** DOM id to scroll to on the current page, OR a stable key when using `href`. */
  id: string;
  label: string;
  /** If set, tapping the chip navigates to this route instead of scrolling. */
  href?: string;
};

/**
 * Floating jump-nav for the long homepage.
 * Desktop: vertical dot rail on the right.
 * Mobile / tablet: horizontal scroll-chip bar sticky just under the header.
 */
export function HomeSectionNav({ sections }: { sections: SectionAnchor[] }) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const chipRefs = useRef<Record<string, HTMLElement | null>>({});

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Account for the sticky header (~64px) + the chip bar itself (~48px).
    const header = document.querySelector("header");
    const headerH = header ? header.getBoundingClientRect().height : 64;
    const chipBar = scrollerRef.current?.parentElement;
    const chipH = chipBar ? chipBar.getBoundingClientRect().height : 48;
    const y = el.getBoundingClientRect().top + window.scrollY - headerH - chipH - 8;
    window.scrollTo({ top: y, behavior: "auto" });
    setActive(id);
  };

  return (
    <>
      <nav
        aria-label="Jump to section"
        className="notranslate sticky top-[64px] z-[115] mb-2 border-y border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:top-[76px] lg:top-[96px]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%)",
        }}
      >
        <div
          ref={scrollerRef}
          className="mx-auto flex max-w-7xl snap-x gap-1.5 overflow-x-auto overscroll-x-contain px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:justify-center lg:gap-2 lg:px-8 lg:py-2.5 [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {sections.map((s) => {
            const isActive = active === s.id;
            const cls = `shrink-0 snap-start whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors lg:px-4 lg:py-2 lg:text-[12px] ${
              isActive
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border/70 bg-card text-muted-foreground hover:border-accent/50 hover:text-primary"
            }`;
            const setRef = (el: HTMLElement | null) => {
              chipRefs.current[s.id] = el;
            };
            if (s.href) {
              return (
                <Link
                  key={s.id}
                  ref={setRef as never}
                  to={s.href}
                  className={cls}
                >
                  {s.label}
                </Link>
              );
            }
            return (
              <button
                key={s.id}
                ref={setRef as never}
                type="button"
                onClick={() => jump(s.id)}
                className={cls}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop: no floating side rail — it blocked scrolling and felt
          like a floating panel over the page. The sticky header + in-page
          links are enough on wide screens. */}
    </>
  );
}