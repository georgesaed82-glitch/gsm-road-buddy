import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listContentOverrides,
  type ContentKind,
  type ContentOverrideRow,
  type OverrideBlock,
  type OverrideData,
} from "@/lib/content-overrides.functions";

export type { ContentKind, ContentOverrideRow, OverrideBlock, OverrideData };

export function useContentOverrides() {
  const fn = useServerFn(listContentOverrides);
  const q = useQuery({
    queryKey: ["content-overrides"],
    queryFn: () => fn(),
    staleTime: 60_000,
  });
  const byKey = useMemo(() => {
    const m = new Map<string, ContentOverrideRow>();
    for (const r of q.data ?? []) m.set(`${r.kind}:${r.item_id}`, r);
    return m;
  }, [q.data]);

  function get(kind: ContentKind, id: string) {
    return byKey.get(`${kind}:${id}`);
  }

  function getBlocks(kind: ContentKind, id: string): OverrideBlock[] | null {
    const row = byKey.get(`${kind}:${id}`);
    const blocks = row?.data?.blocks;
    return blocks && blocks.length ? blocks : null;
  }

  function getStrings(kind: ContentKind, id: string): string[] | null {
    const row = byKey.get(`${kind}:${id}`);
    const strings = row?.data?.strings;
    return strings && strings.length ? strings : null;
  }

  function applyText<T extends { id: string; name: string; meaning?: string }>(
    kind: ContentKind,
    items: T[],
    opts?: { descriptionKey?: keyof T },
  ): T[] {
    const descKey = (opts?.descriptionKey ?? "meaning") as keyof T;
    return items.map((it) => {
      const o = byKey.get(`${kind}:${it.id}`);
      if (!o) return it;
      const next: T = { ...it };
      if (o.name) (next as { name: string }).name = o.name;
      if (o.description) (next as Record<string, unknown>)[descKey as string] = o.description;
      return next;
    });
  }

  function applyHighway<T extends { slug: string; title: string; description: string; topics: string[]; keyPoints: string[] }>(items: T[]): T[] {
    return items.map((it) => {
      const o = byKey.get(`highway:${it.slug}`);
      if (!o) return it;
      return {
        ...it,
        title: o.name ?? it.title,
        description: o.description ?? it.description,
        topics: o.topics && o.topics.length ? o.topics : it.topics,
        keyPoints: o.key_points && o.key_points.length ? o.key_points : it.keyPoints,
      };
    });
  }

  return {
    isLoading: q.isLoading,
    get,
    getBlocks,
    getStrings,
    applyText,
    applyHighway,
    all: q.data ?? [],
  };
}