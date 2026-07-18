import { useEffect, useState } from "react";
import { useRef } from "react";
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
  const [visible, setVisible] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const chipRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = sections
      .filter((s) => !s.href)
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) {
      const onScrollOnly = () => setVisible(window.scrollY > 320);
      onScrollOnly();
      window.addEventListener("scroll", onScrollOnly, { passive: true });
      return () => window.removeEventListener("scroll", onScrollOnly);
    }

    const io = new IntersectionObserver(
      (entries) => {
        const inView = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (inView?.target?.id) setActive(inView.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    els.forEach((el) => io.observe(el));

    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [sections]);

  // Keep the active chip fully in view within the horizontal scroller.
  useEffect(() => {
    const chip = chipRefs.current[active];
    const scroller = scrollerRef.current;
    if (!chip || !scroller) return;
    const cRect = chip.getBoundingClientRect();
    const sRect = scroller.getBoundingClientRect();
    const pad = 16;
    if (cRect.left < sRect.left + pad) {
      scroller.scrollBy({ left: cRect.left - sRect.left - pad, behavior: "smooth" });
    } else if (cRect.right > sRect.right - pad) {
      scroller.scrollBy({ left: cRect.right - sRect.right + pad, behavior: "smooth" });
    }
  }, [active]);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Account for the sticky header (~64px) + the chip bar itself (~48px).
    const header = document.querySelector("header");
    const headerH = header ? header.getBoundingClientRect().height : 64;
    const chipBar = scrollerRef.current?.parentElement;
    const chipH = chipBar ? chipBar.getBoundingClientRect().height : 48;
    const y = el.getBoundingClientRect().top + window.scrollY - headerH - chipH - 8;
    window.scrollTo({ top: y, behavior: "smooth" });
    setActive(id);
  };

  return (
    <>
      {/* Mobile / tablet horizontal chip bar */}
      <nav
        aria-label="Jump to section"
        className={`notranslate sticky top-[64px] z-[115] mb-2 border-y border-border/60 bg-background/95 backdrop-blur-md transition-opacity duration-200 sm:top-[76px] lg:hidden ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%)",
        }}
      >
        <div
          ref={scrollerRef}
          className="flex snap-x gap-1.5 overflow-x-auto overscroll-x-contain px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {sections.map((s) => {
            const isActive = active === s.id;
            const cls = `shrink-0 snap-start whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
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

      {/* Desktop dot rail */}
      <nav
        aria-label="Jump to section"
        className={`fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 rounded-2xl border border-border/60 bg-card/90 p-2 shadow-xl backdrop-blur-md transition-all duration-300 lg:flex ${
          visible ? "opacity-100" : "translate-x-4 opacity-0 pointer-events-none"
        }`}
      >
        {sections.map((s) => (
          s.href ? (
            <Link
              key={s.id}
              title={s.label}
              to={s.href}
              className="group flex items-center gap-2"
            >
              <span
                className={`h-2 w-2 rounded-full transition-all ${
                  active === s.id ? "bg-accent scale-125" : "bg-border group-hover:bg-accent/70"
                }`}
              />
              <span
                className={`whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] transition-all ${
                  active === s.id
                    ? "text-primary opacity-100"
                    : "text-muted-foreground opacity-0 group-hover:opacity-100"
                }`}
              >
                {s.label}
              </span>
            </Link>
          ) : (
          <button
            key={s.id}
            type="button"
            title={s.label}
            onClick={() => jump(s.id)}
            className="group flex items-center gap-2"
          >
            <span
              className={`h-2 w-2 rounded-full transition-all ${
                active === s.id ? "bg-accent scale-125" : "bg-border group-hover:bg-accent/70"
              }`}
            />
            <span
              className={`whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] transition-all ${
                active === s.id
                  ? "text-primary opacity-100"
                  : "text-muted-foreground opacity-0 group-hover:opacity-100"
              }`}
            >
              {s.label}
            </span>
          </button>
          )
        ))}
      </nav>
    </>
  );
}