// Mistakes bank — persists the IDs of theory questions the learner has got
// wrong so they can retry them in one place via /review. Storage is
// client-side only (localStorage) so it survives reloads without needing a
// backend table.

const KEY = "gsm.mistakes.v1";
const STATS_KEY = "gsm.mistakes.stats.v1";
const STATS_EVENT = "gsm:mistakes-stats-changed";

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

// ————————————————————————————————————————————————————————————————
// Retry stats — every retry attempt is logged so we can show streaks and
// accuracy over time on /review. Kept lightweight (single localStorage key,
// capped history) so it stays snappy on low-end phones.

export type RetryAttempt = { t: number; correct: boolean };

type StatsShape = {
  attempts: RetryAttempt[]; // most recent last
  currentStreak: number;
  bestStreak: number;
};

const MAX_HISTORY = 500;

function readStats(): StatsShape {
  if (!isBrowser()) return { attempts: [], currentStreak: 0, bestStreak: 0 };
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) return { attempts: [], currentStreak: 0, bestStreak: 0 };
    const parsed = JSON.parse(raw) as Partial<StatsShape>;
    return {
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts.slice(-MAX_HISTORY) : [],
      currentStreak: typeof parsed.currentStreak === "number" ? parsed.currentStreak : 0,
      bestStreak: typeof parsed.bestStreak === "number" ? parsed.bestStreak : 0,
    };
  } catch {
    return { attempts: [], currentStreak: 0, bestStreak: 0 };
  }
}

function writeStats(s: StatsShape) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(s));
    window.dispatchEvent(new Event(STATS_EVENT));
  } catch {
    // ignore
  }
}

export function recordRetry(correct: boolean) {
  const s = readStats();
  const nextAttempts = [...s.attempts, { t: Date.now(), correct }].slice(-MAX_HISTORY);
  const currentStreak = correct ? s.currentStreak + 1 : 0;
  const bestStreak = Math.max(s.bestStreak, currentStreak);
  writeStats({ attempts: nextAttempts, currentStreak, bestStreak });
}

export function resetRetryStats() {
  writeStats({ attempts: [], currentStreak: 0, bestStreak: 0 });
}

export function getRetryStats() {
  const s = readStats();
  const total = s.attempts.length;
  const correct = s.attempts.filter((a) => a.correct).length;
  const accuracy = total ? correct / total : 0;

  // 7-day trend: bucket the last 7 calendar days (oldest → today).
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const days: { label: string; total: number; correct: number; accuracy: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = startOfToday - i * dayMs;
    const dayEnd = dayStart + dayMs;
    const inDay = s.attempts.filter((a) => a.t >= dayStart && a.t < dayEnd);
    const dTotal = inDay.length;
    const dCorrect = inDay.filter((a) => a.correct).length;
    days.push({
      label: new Date(dayStart).toLocaleDateString(undefined, { weekday: "short" }),
      total: dTotal,
      correct: dCorrect,
      accuracy: dTotal ? dCorrect / dTotal : 0,
    });
  }

  return {
    total,
    correct,
    accuracy,
    currentStreak: s.currentStreak,
    bestStreak: s.bestStreak,
    days,
  };
}

export function subscribeRetryStats(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  const local = () => cb();
  const storage = (e: StorageEvent) => {
    if (e.key === STATS_KEY) cb();
  };
  window.addEventListener(STATS_EVENT, local);
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener(STATS_EVENT, local);
    window.removeEventListener("storage", storage);
  };
}