import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { usePageSeo } from "@/hooks/useSiteSettings";

type Undo = () => void;

/** Set a head meta value and return a function that restores the previous state. */
function setMeta(attr: "name" | "property", key: string, content: string): Undo {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  const created = !el;
  const prev = el?.getAttribute("content") ?? null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  const node = el;
  return () => {
    if (created) node.remove();
    else if (prev !== null) node.setAttribute("content", prev);
  };
}

function setCanonical(href: string): Undo {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const created = !link;
  const prev = link?.getAttribute("href") ?? null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
  const node = link;
  return () => {
    if (created) node.remove();
    else if (prev !== null) node.setAttribute("href", prev);
  };
}

/**
 * Client-side SEO override. Reads admin-managed page_seo rows and mutates
 * document head for the current route so admins can edit title/description/OG
 * without a code change. Route-level head() still ships defaults for SSR.
 */
export function PageSeoOverride() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const seo = usePageSeo(pathname);

  useEffect(() => {
    if (!seo || typeof document === "undefined") return;
    // Every override is undone when the route or saved row changes, so the next
    // route keeps its own server-rendered head (robots, canonical, title).
    const undo: Undo[] = [];
    const prevTitle = document.title;
    if (seo.title) {
      document.title = seo.title;
      undo.push(() => {
        document.title = prevTitle;
      });
    }
    if (seo.description) undo.push(setMeta("name", "description", seo.description));
    const ogTitle = seo.og_title || seo.title;
    if (ogTitle) undo.push(setMeta("property", "og:title", ogTitle));
    const ogDesc = seo.og_description || seo.description;
    if (ogDesc) undo.push(setMeta("property", "og:description", ogDesc));
    if (seo.og_image_path) undo.push(setMeta("property", "og:image", seo.og_image_path));
    if (seo.noindex) undo.push(setMeta("name", "robots", "noindex, nofollow"));
    if (seo.canonical_override) undo.push(setCanonical(seo.canonical_override));
    return () => {
      for (const fn of undo.reverse()) fn();
    };
  }, [seo, pathname]);

  return null;
}
