import { useEffect, useState } from "react";
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

/**
 * Google Translate powered language selector.
 *
 * Loads the Google Website Translator widget once (hidden), then swaps the
 * active language by writing the standard `googtrans` cookie and reloading.
 * The choice is persisted in localStorage so the site remembers the user's
 * language on future visits (and across the portals + admin).
 */

export type LangCode =
  | "en"
  | "fr"
  | "es"
  | "ar"
  | "pt"
  | "it"
  | "de"
  | "ja"
  | "zh-CN"
  | "zh-TW"
  | "tr"
  | "pl"
  | "ro"
  | "ru"
  | "uk";

type Lang = { code: LangCode; label: string; native: string; rtl?: boolean };

const LANGUAGES: Lang[] = [
  { code: "en", label: "English", native: "English" },
  { code: "fr", label: "French", native: "Français" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "ar", label: "Arabic", native: "العربية", rtl: true },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "it", label: "Italian", native: "Italiano" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "zh-CN", label: "Chinese (Mandarin)", native: "中文（简体）" },
  { code: "zh-TW", label: "Chinese (Cantonese)", native: "中文（繁體）" },
  { code: "tr", label: "Turkish", native: "Türkçe" },
  { code: "pl", label: "Polish", native: "Polski" },
  { code: "ro", label: "Romanian", native: "Română" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "uk", label: "Ukrainian", native: "Українська" },
];

const STORAGE_KEY = "gsm_lang";
const INCLUDED_LANGS = LANGUAGES.map((l) => l.code).join(",");

function setGoogTransCookie(lang: LangCode) {
  const value = lang === "en" ? "/en/en" : `/en/${lang}`;
  // Set on current host + parent domain so it survives across subdomains.
  const host = window.location.hostname;
  const cookie = (domain?: string) =>
    `googtrans=${value}; path=/; max-age=31536000${domain ? `; domain=${domain}` : ""}`;
  document.cookie = cookie();
  const parts = host.split(".");
  if (parts.length > 1) {
    document.cookie = cookie("." + parts.slice(-2).join("."));
  }
}

function clearGoogTransCookie() {
  const host = window.location.hostname;
  const expire = "googtrans=; path=/; max-age=0";
  document.cookie = expire;
  const parts = host.split(".");
  if (parts.length > 1) document.cookie = expire + `; domain=.${parts.slice(-2).join(".")}`;
}

function ensureTranslateElement() {
  if (document.getElementById("google_translate_element")) return;
  const el = document.createElement("div");
  el.id = "google_translate_element";
  el.style.position = "fixed";
  el.style.left = "-10000px";
  el.style.top = "0";
  el.style.width = "1px";
  el.style.height = "1px";
  el.style.overflow = "hidden";
  document.body.appendChild(el);
}

let scriptLoaded = false;
function loadTranslateScript() {
  if (scriptLoaded) return;
  scriptLoaded = true;
  ensureTranslateElement();
  const g = window as unknown as {
    googleTranslateElementInit?: () => void;
    google?: { translate?: { TranslateElement?: new (opts: unknown, id: string) => unknown } };
  };
  g.googleTranslateElementInit = () => {
    try {
      const T = g.google?.translate?.TranslateElement as unknown as {
        new (opts: unknown, id: string): unknown;
        InlineLayout?: { SIMPLE: number };
      };
      if (!T) return;
      new T(
        {
          pageLanguage: "en",
          includedLanguages: INCLUDED_LANGS,
          autoDisplay: false,
        },
        "google_translate_element",
      );
    } catch {
      // ignore
    }
  };
  const s = document.createElement("script");
  s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
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

export function LanguageSelector({
  className,
  variant = "compact",
}: {
  className?: string;
  variant?: "compact" | "full";
}) {
  const [active, setActive] = useState<LangCode>("en");

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as LangCode | null) || null;
    const fromCookie = currentLangFromCookie();
    const initial = saved && LANGUAGES.some((l) => l.code === saved) ? saved : fromCookie;
    setActive(initial);
    if (initial !== fromCookie) {
      if (initial === "en") clearGoogTransCookie();
      else setGoogTransCookie(initial);
    }
    loadTranslateScript();
    // Apply RTL for Arabic.
    const rtl = LANGUAGES.find((l) => l.code === initial)?.rtl;
    document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
  }, []);

  const choose = (code: LangCode) => {
    localStorage.setItem(STORAGE_KEY, code);
    if (code === "en") clearGoogTransCookie();
    else setGoogTransCookie(code);
    // Reload to let Google Translate apply the new language cleanly.
    window.location.reload();
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
      <DropdownMenuContent align="end" className="notranslate max-h-[70vh] w-56 overflow-y-auto">
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onSelect={() => choose(l.code)}
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