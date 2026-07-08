// Mistakes bank — persists the IDs of theory questions the learner has got
// wrong so they can retry them in one place via /review.
//
// - Anonymous users: mistakes live in localStorage under `KEY` and stay on
//   this device.
// - Signed-in users: mistakes are namespaced per-user in localStorage
//   (`KEY:<userId>`) and mirrored to the `public.user_mistakes` table so
//   they follow the account across devices. On sign-in we merge any local
//   anonymous mistakes up so pre-signup practice isn't lost.
//
// The exported API stays synchronous — callers get instant UI updates from
// the cache, and DB writes happen in the background.

import { supabase } from "@/integrations/supabase/client";

const KEY = "gsm.mistakes.v1";
const STATS_KEY = "gsm.mistakes.stats.v1";
const STATS_EVENT = "gsm:mistakes-stats-changed";
const CHANGED_EVENT = "gsm:mistakes-changed";

// Which user's mistakes the in-browser cache currently reflects. `null` =
// anonymous (device-only). Updated by `initMistakesSync` below.
let currentUserId: string | null = null;
let syncInitialized = false;

function userKey(userId: string | null): string {
  return userId ? `${KEY}:${userId}` : KEY;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAt(key: string): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeAt(key: string, ids: string[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids))));
    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch {
    // storage full / disabled — silently ignore
  }
}

function read(): string[] {
  return readAt(userKey(currentUserId));
}

function write(ids: string[]) {
  writeAt(userKey(currentUserId), ids);
}

export function getMistakeIds(): string[] {
  return read();
}

export function addMistake(id: string) {
  const cur = read();
  if (!cur.includes(id)) write([...cur, id]);
  pushInsert([id]);
}

export function addMistakes(ids: string[]) {
  if (!ids.length) return;
  const cur = read();
  const merged = Array.from(new Set([...cur, ...ids]));
  const added = merged.filter((x) => !cur.includes(x));
  if (added.length) write(merged);
  if (ids.length) pushInsert(ids);
}

export function removeMistake(id: string) {
  const cur = read();
  const next = cur.filter((x) => x !== id);
  if (next.length !== cur.length) write(next);
  pushDelete([id]);
}

export function clearMistakes() {
  const cur = read();
  write([]);
  if (cur.length) pushDelete(cur);
}

/** Subscribe to mistakes-bank changes (same-tab + cross-tab). */
export function subscribeMistakes(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  const local = () => cb();
  const storage = (e: StorageEvent) => {
    if (e.key && e.key.startsWith(KEY)) cb();
  };
  window.addEventListener(CHANGED_EVENT, local);
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener(CHANGED_EVENT, local);
    window.removeEventListener("storage", storage);
  };
}

// ————————————————————————————————————————————————————————————————
// Supabase sync

function pushInsert(ids: string[]) {
  if (!currentUserId || !ids.length) return;
  const userId = currentUserId;
  const rows = Array.from(new Set(ids)).map((question_id) => ({ user_id: userId, question_id }));
  // Fire-and-forget. `onConflict` keeps this idempotent when the row exists.
  void supabase
    .from("user_mistakes")
    .upsert(rows, { onConflict: "user_id,question_id", ignoreDuplicates: true });
}

function pushDelete(ids: string[]) {
  if (!currentUserId || !ids.length) return;
  const userId = currentUserId;
  void supabase.from("user_mistakes").delete().eq("user_id", userId).in("question_id", ids);
}

async function hydrateFromServer(userId: string) {
  // Merge order: server rows + this user's local cache + any anonymous
  // mistakes gathered before sign-in. Local-only IDs get pushed up so the
  // account picks them up.
  const localAnon = readAt(userKey(null));
  const localUser = readAt(userKey(userId));
  const { data, error } = await supabase
    .from("user_mistakes")
    .select("question_id")
    .eq("user_id", userId);
  if (error) {
    // Offline / RLS hiccup — keep the local cache and try again next auth event.
    return;
  }
  const remote = (data ?? []).map((r) => r.question_id);
  const merged = Array.from(new Set<string>([...remote, ...localUser, ...localAnon]));
  const missingOnServer = merged.filter((id) => !remote.includes(id));

  writeAt(userKey(userId), merged);
  if (localAnon.length) writeAt(userKey(null), []); // consumed

  if (missingOnServer.length) {
    const rows = missingOnServer.map((question_id) => ({ user_id: userId, question_id }));
    void supabase
      .from("user_mistakes")
      .upsert(rows, { onConflict: "user_id,question_id", ignoreDuplicates: true });
  }
}

/**
 * Wire the mistakes bank to the current auth session. Safe to call many
 * times — only the first call attaches the auth listener.
 */
export function initMistakesSync() {
  if (!isBrowser() || syncInitialized) return;
  syncInitialized = true;

  supabase.auth.getUser().then(({ data }) => {
    const uid = data.user?.id ?? null;
    currentUserId = uid;
    if (uid) void hydrateFromServer(uid);
    // Trigger a re-render so components pick up the right namespace.
    window.dispatchEvent(new Event(CHANGED_EVENT));
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "INITIAL_SESSION") return;
    const nextId = session?.user?.id ?? null;
    if (nextId === currentUserId) return;
    currentUserId = nextId;
    if (nextId) void hydrateFromServer(nextId);
    window.dispatchEvent(new Event(CHANGED_EVENT));
  });
}

// Auto-init on browser import so any page that uses the mistakes bank picks
// up the signed-in user's data without extra wiring.
if (isBrowser()) {
  initMistakesSync();
}

// ————————————————————————————————————————————————————————————————
// Retry stats — every retry attempt is logged so we can show streaks and
// accuracy over time on /review. Kept lightweight (single localStorage key,
// capped history) so it stays snappy on low-end phones.

export type RetryAttempt = { t: number; correct: boolean; category?: string };

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

export function recordRetry(correct: boolean, category?: string) {
  const s = readStats();
  const nextAttempts = [...s.attempts, { t: Date.now(), correct, category }].slice(-MAX_HISTORY);
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

  // By-category breakdown: group every attempt that carries a category label.
  // Older attempts (pre-category rollout) get bucketed under "Uncategorised" so
  // the totals still add up to the top-line stats.
  const catMap = new Map<string, { total: number; correct: number }>();
  for (const a of s.attempts) {
    const key = a.category && a.category.trim().length ? a.category : "uncategorised";
    const cur = catMap.get(key) ?? { total: 0, correct: 0 };
    cur.total += 1;
    if (a.correct) cur.correct += 1;
    catMap.set(key, cur);
  }
  const byCategory = Array.from(catMap.entries())
    .map(([category, v]) => ({
      category,
      total: v.total,
      correct: v.correct,
      accuracy: v.total ? v.correct / v.total : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    total,
    correct,
    accuracy,
    currentStreak: s.currentStreak,
    bestStreak: s.bestStreak,
    days,
    byCategory,
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
