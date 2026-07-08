import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { listSiteSettings } from "@/lib/cms.functions";

export type SiteRating = { rating: number; review_count: number; show: boolean };

const DEFAULT: SiteRating = { rating: 5.0, review_count: 143, show: true };

export function useSiteRating(): SiteRating {
  const fn = useServerFn(listSiteSettings);
  const q = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => fn(),
    staleTime: 5 * 60_000,
  });
  return useMemo(() => {
    const row = (q.data ?? []).find((r) => r.key === "site_rating");
    const v = (row?.value ?? {}) as Partial<SiteRating>;
    return {
      rating: typeof v.rating === "number" ? v.rating : DEFAULT.rating,
      review_count: typeof v.review_count === "number" ? v.review_count : DEFAULT.review_count,
      show: v.show !== false,
    };
  }, [q.data]);
}

export function formatRating(r: SiteRating): string {
  return `${r.rating.toFixed(1)} from ${r.review_count} Google reviews`;
}
