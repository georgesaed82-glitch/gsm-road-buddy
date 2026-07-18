import { useEffect, useState } from "react";

export type SectionAnchor = { id: string; label: string };

/**
 * Floating jump-nav for the long homepage.
 * Desktop: vertical dot rail on the right.
 * Mobile / tablet: horizontal scroll-chip bar sticky just under the header.
 */
export function HomeSectionNav({ sections }: { sections: SectionAnchor[] }) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;

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

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <>
      {/* Mobile / tablet horizontal chip bar */}
      <nav
        aria-label="Jump to section"
        className={`notranslate sticky top-[64px] z-30 -mx-4 mb-2 border-y border-border/60 bg-background/85 backdrop-blur-md transition-opacity duration-200 lg:hidden ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => jump(s.id)}
              className={`shrink-0 snap-start rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                active === s.id
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border/70 bg-card text-muted-foreground hover:border-accent/50 hover:text-primary"
              }`}
            >
              {s.label}
            </button>
          ))}
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
        ))}
      </nav>
    </>
  );
}