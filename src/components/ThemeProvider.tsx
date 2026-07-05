import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ThemeTokens } from "@/lib/theme.functions";

const CAMEL_TO_KEBAB = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

function applyTokens(tokens: Partial<ThemeTokens>) {
  const root = document.documentElement;

  // Colours -> CSS variables (--background, --primary, etc.)
  if (tokens.colors) {
    for (const [key, value] of Object.entries(tokens.colors)) {
      if (!value) continue;
      root.style.setProperty(`--${CAMEL_TO_KEBAB(key)}`, value);
    }
  }

  // Typography
  if (tokens.typography) {
    const { headingFont, bodyFont, baseSize, headingWeight } = tokens.typography;
    if (bodyFont) root.style.setProperty("--font-sans", `"${bodyFont}", ui-sans-serif, system-ui, sans-serif`);
    if (headingFont) root.style.setProperty("--font-display", `"${headingFont}", ui-sans-serif, system-ui, sans-serif`);
    if (baseSize) root.style.setProperty("--theme-base-size", baseSize);
    if (headingWeight) root.style.setProperty("--theme-heading-weight", headingWeight);
  }

  // Buttons
  if (tokens.buttons) {
    const { radius, weight, shadow, uppercase } = tokens.buttons;
    if (radius) root.style.setProperty("--btn-radius", radius);
    if (weight) root.style.setProperty("--btn-weight", weight);
    if (shadow) root.style.setProperty("--btn-shadow", shadow);
    root.style.setProperty("--btn-uppercase", uppercase ? "uppercase" : "none");
  }

  // Layout
  if (tokens.layout) {
    const { radius, containerMaxWidth, sectionSpacing, cardBorder, cardShadow } = tokens.layout;
    if (radius) root.style.setProperty("--radius", radius);
    if (containerMaxWidth) root.style.setProperty("--theme-container", containerMaxWidth);
    if (sectionSpacing) root.style.setProperty("--theme-section-spacing", sectionSpacing);
    if (cardBorder) root.style.setProperty("--theme-card-border", cardBorder);
    if (cardShadow) root.style.setProperty("--theme-card-shadow", cardShadow);
  }

  // Mobile overrides via media query support token
  if (tokens.mobile) {
    if (tokens.mobile.baseSize) root.style.setProperty("--theme-mobile-base-size", tokens.mobile.baseSize);
    if (tokens.mobile.sectionSpacing)
      root.style.setProperty("--theme-mobile-section-spacing", tokens.mobile.sectionSpacing);
  }

  // Brand: favicon + document title fallback
  if (tokens.brand?.faviconUrl) {
    const existing = document.querySelector<HTMLLinkElement>("link[rel~='icon'][data-theme-managed='1']");
    if (existing) existing.href = tokens.brand.faviconUrl;
    else {
      const link = document.createElement("link");
      link.rel = "icon";
      link.dataset.themeManaged = "1";
      link.href = tokens.brand.faviconUrl;
      document.head.appendChild(link);
    }
  }
}

function loadGoogleFonts(fonts: string[]) {
  const uniq = Array.from(new Set(fonts.filter(Boolean)));
  if (!uniq.length) return;
  const family = uniq
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join("&");
  const href = `https://fonts.googleapis.com/css2?${family}&display=swap`;
  const existing = document.querySelector<HTMLLinkElement>("link[data-theme-fonts='1']");
  if (existing) {
    if (existing.href !== href) existing.href = href;
    return;
  }
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.themeFonts = "1";
  document.head.appendChild(link);
}

function applyAll(tokens: Partial<ThemeTokens>) {
  applyTokens(tokens);
  const fonts: string[] = [];
  if (tokens.typography?.headingFont && tokens.typography.headingFont !== "Arial")
    fonts.push(tokens.typography.headingFont);
  if (tokens.typography?.bodyFont && tokens.typography.bodyFont !== "Arial")
    fonts.push(tokens.typography.bodyFont);
  loadGoogleFonts(fonts);
}

export function ThemeProvider() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const isPreview = url.searchParams.get("theme_preview") === "1";

    if (isPreview) {
      // Preview mode: don't fetch — wait for postMessage from parent editor.
      const handler = (ev: MessageEvent) => {
        if (!ev.data || typeof ev.data !== "object") return;
        if ((ev.data as { type?: string }).type === "gsm-theme-preview") {
          applyAll((ev.data as { tokens: Partial<ThemeTokens> }).tokens);
        }
      };
      window.addEventListener("message", handler);
      // Announce readiness so parent sends current draft.
      window.parent?.postMessage({ type: "gsm-theme-preview-ready" }, "*");
      return () => window.removeEventListener("message", handler);
    }

    // Normal mode: fetch published theme and apply.
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("theme_settings")
        .select("published")
        .eq("id", 1)
        .maybeSingle();
      if (cancelled) return;
      const tokens = (data?.published ?? {}) as Partial<ThemeTokens>;
      applyAll(tokens);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}