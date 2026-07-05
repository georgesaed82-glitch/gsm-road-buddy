import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { usePageSeo } from "@/hooks/useSiteSettings";

function setMeta(selector: string, attr: "name" | "property", key: string, content: string | null) {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!content) return;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
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
    if (!seo) return;
    if (seo.title) document.title = seo.title;
    if (seo.description) setMeta('meta[name="description"]', "name", "description", seo.description);
    if (seo.og_title || seo.title) setMeta('meta[property="og:title"]', "property", "og:title", seo.og_title || seo.title);
    if (seo.og_description || seo.description) setMeta('meta[property="og:description"]', "property", "og:description", seo.og_description || seo.description);
    if (seo.og_image_path) setMeta('meta[property="og:image"]', "property", "og:image", seo.og_image_path);
    if (seo.noindex) setMeta('meta[name="robots"]', "name", "robots", "noindex, nofollow");
    if (seo.canonical_override) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", seo.canonical_override);
    }
  }, [seo, pathname]);

  return null;
}