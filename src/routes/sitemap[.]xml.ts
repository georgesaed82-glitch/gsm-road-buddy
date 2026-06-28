import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { areas } from "@/data/areas";

const BASE_URL = "https://www.gsmdrivingschool.com";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = [
          { path: "/", priority: "1.0", changefreq: "weekly" as const },
          { path: "/about", priority: "0.8", changefreq: "monthly" as const },
          { path: "/services", priority: "0.9", changefreq: "monthly" as const },
          { path: "/pricing", priority: "0.7", changefreq: "monthly" as const },
          { path: "/instructors", priority: "0.7", changefreq: "monthly" as const },
          { path: "/reviews", priority: "0.8", changefreq: "weekly" as const },
          { path: "/contact", priority: "0.8", changefreq: "monthly" as const },
          { path: "/areas", priority: "0.9", changefreq: "monthly" as const },
        ];

        const areaPaths = areas.map((a) => ({
          path: `/areas/${a.slug}`,
          priority: "0.9",
          changefreq: "monthly" as const,
        }));

        const all = [...staticPaths, ...areaPaths];

        const urls = all
          .map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});