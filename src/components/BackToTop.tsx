import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      // Show once user is past 60% of scrollable height (or 600px in short pages)
      const threshold = Math.min(600, Math.max(300, height * 0.6));
      setVisible(scrolled > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      style={{
        backgroundColor: "#bc7c50",
        color: "#FFFFFF",
        boxShadow:
          "0 10px 25px -8px rgba(188,124,80,0.45), 0 4px 10px -2px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)",
      }}
      className={`fixed right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-white/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bc7c50] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:right-6 sm:h-12 sm:w-12 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
    </button>
  );
}
