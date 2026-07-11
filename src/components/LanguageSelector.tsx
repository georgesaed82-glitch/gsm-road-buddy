import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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

type Lang = { code: LangCode; label: string; native: string; rtl?: boolean };

const LANGUAGES: Lang[] = [
  { code: "en", label: "English", native: "English" },
  { code: "ar", label: "Arabic", native: "العربية", rtl: true },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "it", label: "Italian", native: "Italiano" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "nl", label: "Dutch", native: "Nederlands" },
  { code: "pl", label: "Polish", native: "Polski" },
  { code: "ro", label: "Romanian", native: "Română" },
  { code: "tr", label: "Turkish", native: "Türkçe" },
  { code: "el", label: "Greek", native: "Ελληνικά" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "uk", label: "Ukrainian", native: "Українська" },
  { code: "zh-CN", label: "Chinese (Simplified)", native: "中文（简体）" },
  { code: "zh-TW", label: "Chinese (Traditional)", native: "中文（繁體）" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "ko", label: "Korean", native: "한국어" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ur", label: "Urdu", native: "اردو", rtl: true },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "fa", label: "Persian (Farsi)", native: "فارسی", rtl: true },
  { code: "iw", label: "Hebrew", native: "עברית", rtl: true },
  { code: "vi", label: "Vietnamese", native: "Tiếng Việt" },
  { code: "th", label: "Thai", native: "ไทย" },
  { code: "id", label: "Indonesian", native: "Bahasa Indonesia" },
  { code: "ms", label: "Malay", native: "Bahasa Melayu" },
  { code: "fil", label: "Filipino", native: "Filipino" },
];

const STORAGE_KEY = "gsm_lang";
const CHANGE_EVENT = "gsm-language-changed";
const INCLUDED_LANGS = LANGUAGES.map((l) => l.code).join(",");
const ELEMENT_ID = "google_translate_element";
const SCRIPT_ID = "google-translate-script";

type GoogleTranslateCtor = {
  new (opts: Record<string, unknown>, id: string): unknown;
  InlineLayout?: { SIMPLE?: number };
};

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: { translate?: { TranslateElement?: GoogleTranslateCtor } };
  }
}

let scriptPromise: Promise<void> | null = null;
let comboPromise: Promise<HTMLSelectElement> | null = null;
let translateTimer: number | undefined;
let mutationObserver: MutationObserver | null = null;
let suppressMutationUntil = 0;

function setGoogTransCookie(lang: LangCode) {
  const value = lang === "en" ? "/en/en" : `/en/${lang}`;
  // Set on current host + parent domain so it survives across subdomains.
  const host = window.location.hostname;
  const cookie = (domain?: string) =>
    `googtrans=${value}; path=/; max-age=31536000; SameSite=Lax${domain ? `; domain=${domain}` : ""}`;
  document.cookie = cookie();
  const parts = host.split(".");
  if (parts.length > 1 && host !== "localhost") {
    document.cookie = cookie("." + parts.slice(-2).join("."));
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

function ensureTranslateElement() {
  if (document.getElementById(ELEMENT_ID)) return;
  const el = document.createElement("div");
  el.id = ELEMENT_ID;
  el.className = "skiptranslate notranslate";
  el.style.position = "fixed";
  el.style.left = "-10000px";
  el.style.top = "0";
  el.style.width = "1px";
  el.style.height = "1px";
  el.style.overflow = "hidden";
  document.body.appendChild(el);
}

function initTranslateElement(resolve?: () => void) {
  ensureTranslateElement();
  try {
    const T = window.google?.translate?.TranslateElement;
    if (!T) return;
    if (!document.querySelector(".goog-te-combo")) {
      new T(
        {
          pageLanguage: "en",
          includedLanguages: INCLUDED_LANGS,
          autoDisplay: false,
          layout: T.InlineLayout?.SIMPLE,
        },
        ELEMENT_ID,
      );
    }
    resolve?.();
  } catch {
    resolve?.();
  }
}

function loadTranslateScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve) => {
    if (typeof document === "undefined") {
      resolve();
      return;
    }
    window.googleTranslateElementInit = () => initTranslateElement(resolve);
    if (window.google?.translate?.TranslateElement) {
      initTranslateElement(resolve);
      return;
    }
    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      window.setTimeout(resolve, 1500);
      return;
    }
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    s.onerror = () => resolve();
    document.head.appendChild(s);
    window.setTimeout(resolve, 8000);
  });
  return scriptPromise;
}

function waitForTranslateCombo() {
  if (comboPromise) return comboPromise;
  comboPromise = new Promise<HTMLSelectElement>((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (combo) {
        resolve(combo);
        return;
      }
      if (Date.now() - started > 9000) {
        reject(new Error("Google Translate language menu did not load"));
        return;
      }
      window.setTimeout(tick, 100);
    };
    tick();
  });
  return comboPromise;
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

function hasVisibleText(node: Node): boolean {
  if (node.nodeType === Node.TEXT_NODE) return !!node.textContent?.trim();
  if (!(node instanceof Element)) return false;
  if (
    node.closest(".skiptranslate, .notranslate, script, style, noscript") ||
    node.id === ELEMENT_ID
  ) {
    return false;
  }
  return Array.from(node.childNodes).some(hasVisibleText);
}

function stopMutationTranslation() {
  mutationObserver?.disconnect();
  mutationObserver = null;
}

function queueApplyLanguage(lang: LangCode, delay = 120) {
  window.clearTimeout(translateTimer);
  translateTimer = window.setTimeout(() => {
    void applyLanguage(lang, false);
  }, delay);
}

function triggerTranslateCombo(combo: HTMLSelectElement, lang: LangCode) {
  combo.value = "";
  combo.dispatchEvent(new Event("change", { bubbles: true }));
  window.setTimeout(() => {
    combo.value = lang;
    combo.dispatchEvent(new Event("change", { bubbles: true }));
  }, 80);
}

function startMutationTranslation(lang: LangCode) {
  stopMutationTranslation();
  if (lang === "en") return;
  mutationObserver = new MutationObserver((mutations) => {
    if (Date.now() < suppressMutationUntil) return;
    const shouldTranslate = mutations.some((m) =>
      Array.from(m.addedNodes).some((node) => hasVisibleText(node)),
    );
    if (shouldTranslate) queueApplyLanguage(lang, 500);
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

async function applyLanguage(lang: LangCode, reloadForEnglish: boolean) {
  setDocumentLanguage(lang);
  if (lang === "en") {
    localStorage.setItem(STORAGE_KEY, lang);
    clearGoogTransCookie();
    setGoogTransCookie(lang);
    stopMutationTranslation();
    if (reloadForEnglish) window.location.reload();
    return;
  }

  localStorage.setItem(STORAGE_KEY, lang);
  setGoogTransCookie(lang);
  await loadTranslateScript();
  try {
    const combo = await waitForTranslateCombo();
    suppressMutationUntil = Date.now() + 2600;
    triggerTranslateCombo(combo, lang);
    window.setTimeout(() => {
      triggerTranslateCombo(combo, lang);
    }, 900);
    window.setTimeout(() => {
      triggerTranslateCombo(combo, lang);
    }, 1800);
  } catch {
    // The cookie remains in place so a refresh still lets Google Translate apply.
    comboPromise = null;
  }
  startMutationTranslation(lang);
}

export function LanguageSelector({
  className,
  variant = "compact",
}: {
  className?: string;
  variant?: "compact" | "full";
}) {
  const [active, setActive] = useState<LangCode>("en");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as LangCode | null) || null;
    const fromCookie = currentLangFromCookie();
    const initial = saved && LANGUAGES.some((l) => l.code === saved) ? saved : fromCookie;
    setActive(initial);
    void applyLanguage(initial, false);
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

  useEffect(() => {
    if (active !== "en") queueApplyLanguage(active, 450);
  }, [active, pathname]);

  const choose = (code: LangCode) => {
    setActive(code);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: code }));
    void applyLanguage(code, code === "en");
  };

  const current = LANGUAGES.find((l) => l.code === active) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "notranslate inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-primary",
          className,
        )}
        aria-label="Choose language"
      >
        <Globe className="h-3.5 w-3.5 text-accent" />
        <span className="uppercase tracking-wider">{current.code.toUpperCase()}</span>
        {variant === "full" && <span className="hidden sm:inline">{current.native}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[70vh] w-56 overflow-y-auto">
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onSelect={() => choose(l.code)}
            lang={l.code}
            dir={l.rtl ? "rtl" : "ltr"}
            className={cn(
              "flex items-center justify-between gap-2 text-sm",
              l.code === active && "bg-accent/10 text-primary",
            )}
          >
            <span>{l.native}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {l.code}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
