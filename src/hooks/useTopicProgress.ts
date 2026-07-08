import { useCallback, useEffect, useState } from "react";

// Tracks per-topic study state for the Highway Code page.
// Persists in localStorage — device-local, no server round-trip.
// Keys are topic slugs (see src/data/theory.ts).

const STUDIED_KEY = "gsm.hc.studied";
const BOOKMARK_KEY = "gsm.hc.bookmarked";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr.filter((x) => typeof x === "string")) : new Set();
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify([...set]));
}

export function useTopicProgress() {
  const [studied, setStudied] = useState<Set<string>>(() => readSet(STUDIED_KEY));
  const [bookmarked, setBookmarked] = useState<Set<string>>(() => readSet(BOOKMARK_KEY));

  useEffect(() => writeSet(STUDIED_KEY, studied), [studied]);
  useEffect(() => writeSet(BOOKMARK_KEY, bookmarked), [bookmarked]);

  // Cross-tab sync: mirror changes made in other tabs of the portal.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === STUDIED_KEY) setStudied(readSet(STUDIED_KEY));
      if (e.key === BOOKMARK_KEY) setBookmarked(readSet(BOOKMARK_KEY));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback(
    (set: Set<string>, setter: (s: Set<string>) => void) => (slug: string) => {
      const next = new Set(set);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      setter(next);
    },
    [],
  );

  const toggleStudied = useCallback((slug: string) => {
    setStudied((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((slug: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  return {
    studied,
    bookmarked,
    toggleStudied,
    toggleBookmark,
    isStudied: (slug: string) => studied.has(slug),
    isBookmarked: (slug: string) => bookmarked.has(slug),
    // Not actually used, exposed for future needs.
    _toggle: toggle,
  };
}
