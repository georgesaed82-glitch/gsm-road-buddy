import { useMemo } from "react";
import { useContentOverrides } from "@/hooks/useContentOverrides";
import { signs, type Sign, type SignCategory } from "@/data/signs";

const SIGN_CATEGORIES: SignCategory[] = [
  "warning",
  "prohibitory",
  "mandatory",
  "speed",
  "information",
  "direction",
  "signals",
  "crossings",
];

/**
 * Returns the CMS-merged list of signs: base catalogue + admin-added custom
 * signs, with hidden entries removed and sort_order honoured.
 * The image URL (if uploaded by the admin) is exposed via imageFor().
 */
export function useSignsCms() {
  const { get, isEnabled, sortOrder, customItems, applyText } = useContentOverrides();

  const allSigns = useMemo<Sign[]>(() => {
    const customs: Sign[] = customItems("sign").map((r) => {
      const cat = SIGN_CATEGORIES.includes(r.group_slug as SignCategory)
        ? (r.group_slug as SignCategory)
        : "information";
      return {
        id: r.item_id,
        name: r.name ?? "Custom sign",
        meaning: r.description ?? "",
        category: cat,
        variant: { kind: "warning", symbol: "exclaim" },
      };
    });
    const merged = [...signs, ...customs].filter((s) => isEnabled("sign", s.id));
    return merged.sort((a, b) => sortOrder("sign", a.id) - sortOrder("sign", b.id));
  }, [customItems, isEnabled, sortOrder]);

  const byCategory = (cat: SignCategory) => allSigns.filter((s) => s.category === cat);

  return {
    allSigns,
    signsByCategory: byCategory,
    imageFor: (id: string) => get("sign", id)?.image_url ?? null,
    applyText,
  };
}
