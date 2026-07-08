import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import {
  listSiteSettings,
  listNavItems,
  listPageSeo,
  type NavItemRow,
  type PageSeoRow,
} from "@/lib/cms.functions";

export type BusinessInfo = {
  name: string;
  tagline: string;
  phone: string;
  phone_intl: string;
  email: string;
  address: string;
};
export type SocialLinks = { facebook: string; instagram: string; tiktok: string; youtube: string };
export type OpeningHours = Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", string>;

const DEFAULT_BUSINESS: BusinessInfo = {
  name: "GSM Driving School",
  tagline: "George's School of Motoring · Established 2005",
  phone: "07961 585231",
  phone_intl: "447961585231",
  email: "gsmdrivingschool@outlook.com",
  address: "71 Sandbourne House, Dartmouth Close, London W11 1DS",
};
const DEFAULT_SOCIAL: SocialLinks = {
  facebook: "https://www.facebook.com/share/1HySrwY5AA/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/gsm_driving_school_",
  tiktok: "",
  youtube: "",
};
const DEFAULT_HOURS: OpeningHours = {
  mon: "7:00 – 20:00",
  tue: "7:00 – 21:00",
  wed: "7:00 – 21:00",
  thu: "7:00 – 20:30",
  fri: "7:00 – 20:00",
  sat: "7:00 – 18:00",
  sun: "Closed",
};
const DEFAULT_FOOTER = {
  copy: "© 2005 George's School of Motoring. All rights reserved.",
  disclaimer: "",
  areas_covered: "Notting Hill Gate · Holland Park · High Street Kensington · Bayswater",
};

export function useSiteSettings() {
  const fn = useServerFn(listSiteSettings);
  const q = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => fn(),
    staleTime: 5 * 60_000,
  });
  return useMemo(() => {
    const map = new Map((q.data ?? []).map((r) => [r.key, r.value] as const));
    const business = {
      ...DEFAULT_BUSINESS,
      ...(map.get("business") as Partial<BusinessInfo> | undefined),
    };
    const social = {
      ...DEFAULT_SOCIAL,
      ...(map.get("social") as Partial<SocialLinks> | undefined),
    };
    const opening_hours = {
      ...DEFAULT_HOURS,
      ...(map.get("opening_hours") as Partial<OpeningHours> | undefined),
    };
    const footer = {
      ...DEFAULT_FOOTER,
      ...(map.get("footer") as Partial<typeof DEFAULT_FOOTER> | undefined),
    };
    return { business, social, opening_hours, footer, isLoading: q.isLoading };
  }, [q.data, q.isLoading]);
}

export function useNavItems(location: NavItemRow["location"]) {
  const fn = useServerFn(listNavItems);
  const q = useQuery({
    queryKey: ["nav-items"],
    queryFn: () => fn(),
    staleTime: 5 * 60_000,
  });
  const items = useMemo(
    () =>
      (q.data ?? [])
        .filter((r) => r.location === location && r.enabled)
        .sort((a, b) => a.order_index - b.order_index),
    [q.data, location],
  );
  return { items, isLoading: q.isLoading };
}

export function usePageSeo(route: string) {
  const fn = useServerFn(listPageSeo);
  const q = useQuery({
    queryKey: ["page-seo"],
    queryFn: () => fn(),
    staleTime: 5 * 60_000,
  });
  return useMemo<PageSeoRow | undefined>(
    () => (q.data ?? []).find((r) => r.route === route),
    [q.data, route],
  );
}
