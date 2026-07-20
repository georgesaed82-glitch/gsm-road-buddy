import { useEffect, useMemo, useRef, useState } from "react";
import { Globe, ChevronDown, Check, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type LangCode =
  | "en"
  | "ar"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "nl"
  | "pl"
  | "ro"
  | "tr"
  | "el"
  | "ru"
  | "uk"
  | "zh-CN"
  | "zh-TW"
  | "ja"
  | "ko"
  | "hi"
  | "ur"
  | "pa"
  | "bn"
  | "fa"
  | "iw"
  | "vi"
  | "th"
  | "id"
  | "ms"
  | "fil";

type Lang = { code: LangCode; label: string; native: string; flag: string; rtl?: boolean };

const LANGUAGES: Lang[] = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "fr", label: "French", native: "Français", flag: "🇫🇷" },
  { code: "es", label: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "de", label: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "ar", label: "Arabic", native: "العربية", flag: "🇸🇦", rtl: true },
  { code: "it", label: "Italian", native: "Italiano", flag: "🇮🇹" },
  { code: "ja", label: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "zh-CN", label: "Chinese (Simplified)", native: "中文（简体）", flag: "🇨🇳" },
  { code: "zh-TW", label: "Chinese (Traditional)", native: "中文（繁體）", flag: "🇹🇼" },
  { code: "ko", label: "Korean", native: "한국어", flag: "🇰🇷" },
  { code: "pt", label: "Portuguese", native: "Português", flag: "🇵🇹" },
  { code: "nl", label: "Dutch", native: "Nederlands", flag: "🇳🇱" },
  { code: "pl", label: "Polish", native: "Polski", flag: "🇵🇱" },
  { code: "ro", label: "Romanian", native: "Română", flag: "🇷🇴" },
  { code: "tr", label: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  { code: "el", label: "Greek", native: "Ελληνικά", flag: "🇬🇷" },
  { code: "ru", label: "Russian", native: "Русский", flag: "🇷🇺" },
  { code: "uk", label: "Ukrainian", native: "Українська", flag: "🇺🇦" },
  { code: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "ur", label: "Urdu", native: "اردو", flag: "🇵🇰", rtl: true },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", native: "বাংলা", flag: "🇧🇩" },
  { code: "fa", label: "Persian (Farsi)", native: "فارسی", flag: "🇮🇷", rtl: true },
  { code: "iw", label: "Hebrew", native: "עברית", flag: "🇮🇱", rtl: true },
  { code: "vi", label: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳" },
  { code: "th", label: "Thai", native: "ไทย", flag: "🇹🇭" },
  { code: "id", label: "Indonesian", native: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ms", label: "Malay", native: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "fil", label: "Filipino", native: "Filipino", flag: "🇵🇭" },
];

const STORAGE_KEY = "gsm_lang";
const CHANGE_EVENT = "gsm-language-changed";

function setGoogTransCookie(target: LangCode) {
  const host = window.location.hostname;
  const value = `/en/${target}`;
  // Session cookie so switching back to English clears cleanly.
  const base = `googtrans=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
  document.cookie = base;
  const parts = host.split(".");
  if (parts.length > 1 && host !== "localhost") {
    document.cookie = base + `; domain=.${parts.slice(-2).join(".")}`;
  }
}

function clearGoogTransCookie() {
  const host = window.location.hostname;
  const expire = "googtrans=; path=/; max-age=0; SameSite=Lax";
  document.cookie = expire;
  const parts = host.split(".");
  if (parts.length > 1 && host !== "localhost") {
    document.cookie = expire + `; domain=.${parts.slice(-2).join(".")}`;
  }
}

const GT_SCRIPT_ID = "gsm-google-translate-script";
const GT_MOUNT_ID = "google_translate_element";

function ensureGoogleTranslateLoaded() {
  if (document.getElementById(GT_SCRIPT_ID)) return;
  if (!document.getElementById(GT_MOUNT_ID)) {
    const mount = document.createElement("div");
    mount.id = GT_MOUNT_ID;
    mount.style.cssText =
      "position:fixed;left:-9999px;top:-9999px;width:0;height:0;overflow:hidden;";
    document.body.appendChild(mount);
  }
  (window as unknown as { googleTranslateElementInit?: () => void }).googleTranslateElementInit =
    function googleTranslateElementInit() {
      const w = window as unknown as {
        google?: { translate?: { TranslateElement?: new (opts: object, id: string) => unknown } };
      };
      const Ctor = w.google?.translate?.TranslateElement;
      if (!Ctor) return;
      // eslint-disable-next-line no-new
      new Ctor(
        {
          pageLanguage: "en",
          includedLanguages:
            "ar,bn,de,el,en,es,fa,fil,fr,hi,id,it,iw,ja,ko,ms,nl,pa,pl,pt,ro,ru,th,tr,uk,ur,vi,zh-CN,zh-TW",
          autoDisplay: false,
        },
        GT_MOUNT_ID,
      );
    };
  const s = document.createElement("script");
  s.id = GT_SCRIPT_ID;
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async = true;
  document.head.appendChild(s);
}

function currentLangFromCookie(): LangCode {
  const m = document.cookie.match(/(?:^|; )googtrans=([^;]+)/);
  if (!m) return "en";
  const decoded = decodeURIComponent(m[1]);
  const parts = decoded.split("/");
  const target = parts[2] as LangCode | undefined;
  if (target && LANGUAGES.some((l) => l.code === target)) return target;
  return "en";
}

function setDocumentLanguage(lang: LangCode) {
  const rtl = LANGUAGES.find((l) => l.code === lang)?.rtl;
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
  document.body?.setAttribute("dir", rtl ? "rtl" : "ltr");
}

function applyLanguage(lang: LangCode, opts: { reload?: boolean } = {}) {
  setDocumentLanguage(lang);
  localStorage.setItem(STORAGE_KEY, lang);
  if (lang === "en") {
    clearGoogTransCookie();
    if (opts.reload) window.location.reload();
    return;
  }
  setGoogTransCookie(lang);
  ensureGoogleTranslateLoaded();
  if (opts.reload) {
    // Reload so Google Translate picks up the cookie and translates the
    // full page — menus, headings, buttons, body copy, and portal content.
    window.location.reload();
  }
}

export function LanguageSelector({
  className,
  variant = "compact",
  side,
  align,
}: {
  className?: string;
  variant?: "compact" | "full" | "icon" | "menu-row";
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}) {
  const [active, setActive] = useState<LangCode>("en");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as LangCode | null) || null;
    const fromCookie = currentLangFromCookie();
    const initial = saved && LANGUAGES.some((l) => l.code === saved) ? saved : fromCookie;
    setActive(initial);
    // On mount, honour the current cookie without reloading. If a
    // non-English cookie is set, ensure the widget is loaded so the page
    // gets translated.
    setDocumentLanguage(initial);
    if (initial !== "en" || fromCookie !== "en") {
      ensureGoogleTranslateLoaded();
    }
  }, []);

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const next = (event as CustomEvent<LangCode>).detail;
      if (next && LANGUAGES.some((l) => l.code === next)) setActive(next);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const next = event.newValue as LangCode | null;
      if (next && LANGUAGES.some((l) => l.code === next)) setActive(next);
    };
    window.addEventListener(CHANGE_EVENT, handleLanguageChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handleLanguageChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const choose = (code: LangCode) => {
    setActive(code);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: code }));
    setOpen(false);
    setQuery("");
    // Reload so Google Translate re-runs across the entire document —
    // this is what actually translates menus, headings, body copy and
    // portal content on both website and installed PWA.
    applyLanguage(code, { reload: true });
  };

  const current = LANGUAGES.find((l) => l.code === active) ?? LANGUAGES[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(
      (l) =>
        l.label.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q),
    );
  }, [query]);

  // Focus the search field when the popover opens.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [open]);

  let trigger: React.ReactNode;
  if (variant === "icon") {
    trigger = (
      <button
        type="button"
        aria-label="Select language"
        className={cn(
          "notranslate inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card text-primary shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:h-10 sm:w-10",
          className,
        )}
        style={{ borderColor: "rgba(198,135,60,0.85)" }}
      >
        <Globe className="h-5 w-5 text-accent" />
      </button>
    );
  } else if (variant === "menu-row") {
    trigger = (
      <button
        type="button"
        aria-label="Select language"
        className={cn(
          "notranslate group flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card px-3 py-3 text-left text-[15px] font-semibold shadow-[0_2px_10px_-4px_rgba(29,42,34,0.18)] transition-all active:scale-[0.98] hover:-translate-y-0.5 hover:border-accent/40",
          className,
        )}
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-accent/50 bg-primary text-accent shadow-sm">
          <Globe className="h-5 w-5" />
        </span>
        <span className="h-8 w-px shrink-0 bg-border/70" aria-hidden="true" />
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate">Language</span>
          <span
            lang={current.code}
            dir={current.rtl ? "rtl" : "ltr"}
            className="truncate text-[12px] font-medium text-muted-foreground"
          >
            <span className="mr-1" aria-hidden>
              {current.flag}
            </span>
            {current.native}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    );
  } else {
    trigger = (
      <button
        type="button"
        aria-label="Select language"
        className={cn(
          "notranslate inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-2 text-xs font-semibold text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent/10",
          className,
        )}
      >
        <Globe className="h-4 w-4 text-accent" />
        <span className="tracking-wide" aria-hidden>
          {current.flag}
        </span>
        <span className="tracking-wide">
          {variant === "full" ? current.native : "Language"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </button>
    );
  }

  const resolvedSide = side ?? (variant === "menu-row" ? "top" : "bottom");
  const resolvedAlign = align ?? "end";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side={resolvedSide}
        align={resolvedAlign}
        sideOffset={8}
        collisionPadding={12}
        data-language-menu
        // Higher than the mobile Sheet (z-50) and sticky chip bars (z-115)
        // so the menu is never hidden behind other sections.
        className="notranslate z-[300] w-[min(94vw,22rem)] overflow-hidden rounded-2xl border-border/70 p-0 shadow-2xl"
        onOpenAutoFocus={(e) => {
          // Let the search input handle focus itself; prevents iOS Safari
          // from scrolling the popover off-screen on open.
          e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          // Prevent an ancestor Radix Dialog (e.g. the mobile menu Sheet)
          // from closing when the user taps inside the language list.
          const target = e.target as HTMLElement | null;
          if (target?.closest('[data-language-menu]')) e.preventDefault();
        }}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Select language
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close language menu"
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="border-b border-border/60 p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search languages"
              aria-label="Search languages"
              className="w-full rounded-xl border border-border/60 bg-background py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>
        <div
          role="listbox"
          aria-label="Languages"
          className="max-h-[60vh] overflow-y-auto overscroll-contain p-1.5"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              No languages match "{query}"
            </div>
          ) : (
            filtered.map((l) => {
              const isActive = l.code === active;
              return (
                <button
                  key={l.code}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => choose(l.code)}
                  lang={l.code}
                  dir={l.rtl ? "rtl" : "ltr"}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors active:scale-[0.99]",
                    isActive
                      ? "bg-accent/10 text-primary"
                      : "text-foreground hover:bg-accent/5",
                  )}
                >
                  <span className="text-xl leading-none" aria-hidden>
                    {l.flag}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate font-semibold">{l.native}</span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {l.label}
                    </span>
                  </span>
                  {isActive ? <Check className="h-4 w-4 shrink-0 text-accent" /> : null}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
