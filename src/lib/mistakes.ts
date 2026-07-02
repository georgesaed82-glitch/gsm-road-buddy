// Mistakes bank — persists the IDs of theory questions the learner has got
// wrong so they can retry them in one place via /review. Storage is
// client-side only (localStorage) so it survives reloads without needing a
// backend table.

const KEY = "gsm.mistakes.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function read(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(ids))));
    window.dispatchEvent(new Event("gsm:mistakes-changed"));
  } catch {
    // storage full / disabled — silently ignore
  }
}

export function getMistakeIds(): string[] {
  return read();
}

export function addMistake(id: string) {
  const cur = read();
  if (cur.includes(id)) return;
  write([...cur, id]);
}

export function addMistakes(ids: string[]) {
  if (!ids.length) return;
  const cur = read();
  const merged = Array.from(new Set([...cur, ...ids]));
  if (merged.length === cur.length) return;
  write(merged);
}

export function removeMistake(id: string) {
  const cur = read();
  const next = cur.filter((x) => x !== id);
  if (next.length === cur.length) return;
  write(next);
}

export function clearMistakes() {
  write([]);
}

/** Subscribe to mistakes-bank changes (same-tab + cross-tab). */
export function subscribeMistakes(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  const local = () => cb();
  const storage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("gsm:mistakes-changed", local);
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener("gsm:mistakes-changed", local);
    window.removeEventListener("storage", storage);
  };
}