import { useMemo } from "react";
import { useContentOverrides } from "@/hooks/useContentOverrides";

/**
 * Reads editable "page-block" overrides from content_overrides for a given group
 * (e.g. "about-values", "about-key-points", "about-faqs", "services",
 *  "home-reasons", "home-postcodes", "home-gallery-captions").
 *
 * Each block is matched to a provided default by item_id. Admin edits to a
 * matching item_id override name/description/key_points/data. Admins can also
 * add new items with a "custom:" prefix which are appended, or hide items via
 * enabled=false. Order honours sort_order when set.
 */
export type PageBlockDefault = {
  id: string;
  name: string;
  description?: string;
  key_points?: string[];
  data?: Record<string, unknown> | null;
};

export type PageBlockItem = PageBlockDefault & { fromCms: boolean };

export function usePageBlocks(group: string, defaults: PageBlockDefault[]): PageBlockItem[] {
  const { all, isEnabled, sortOrder, get } = useContentOverrides();
  return useMemo(() => {
    // Merge each default with matching override
    const merged: PageBlockItem[] = defaults.map((d) => {
      const o = get("page-block", d.id);
      return {
        id: d.id,
        name: o?.name ?? d.name,
        description: o?.description ?? d.description,
        key_points: (o?.key_points && o.key_points.length ? o.key_points : d.key_points) ?? undefined,
        data: (o?.data as Record<string, unknown> | null | undefined) ?? d.data ?? null,
        fromCms: !!o,
      };
    });
    // Append custom rows for this group (admin-added)
    const customs: PageBlockItem[] = (all ?? [])
      .filter((r) => r.kind === "page-block" && r.group_slug === group && r.item_id.startsWith("custom:"))
      .map((r) => ({
        id: r.item_id,
        name: r.name ?? "Custom",
        description: r.description ?? undefined,
        key_points: r.key_points ?? undefined,
        data: (r.data as Record<string, unknown> | null | undefined) ?? null,
        fromCms: true,
      }));
    const all2 = [...merged, ...customs]
      .filter((it) => isEnabled("page-block", it.id))
      .sort((a, b) => sortOrder("page-block", a.id) - sortOrder("page-block", b.id));
    return all2;
  }, [all, defaults, get, group, isEnabled, sortOrder]);
}

/**
 * Reads a simple list of strings from a page-block group. Falls back to the
 * supplied defaults if no admin override is set. Each string is stored as an
 * override with item_id `${group}:${index}` and its `name` field.
 */
export function usePageBlockStrings(group: string, defaults: string[]): string[] {
  const items = usePageBlocks(
    group,
    defaults.map((s, i) => ({ id: `${group}:${i}`, name: s })),
  );
  return useMemo(() => items.map((it) => it.name), [items]);
}