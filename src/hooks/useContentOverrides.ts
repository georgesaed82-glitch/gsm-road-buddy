import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listContentOverrides,
  type ContentKind,
  type ContentOverrideRow,
} from "@/lib/content-overrides.functions";

export type { ContentKind, ContentOverrideRow };

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

  return { isLoading: q.isLoading, get, applyText, all: q.data ?? [] };
}