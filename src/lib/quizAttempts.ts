// Device-local quiz attempt store.
// Each attempt records the questions, options, the learner's picks and
// correctness so they can review any past attempt from /my-attempts.
//
// Kept in localStorage under a single namespaced key. No server round-trip.

export type QuizKind =
  | "mock"
  | "signs"
  | "markings"
  | "topic"
  | "questions-easy"
  | "questions-medium"
  | "questions-hard";

export type QuizAttemptItem = {
  prompt: string;
  options: string[];
  correctIndex: number;
  pickedIndex: number | null;
  correct: boolean;
  explanation?: string;
  // Optional context (e.g. category / sign group). Purely for display.
  meta?: string;
};

export type QuizAttempt = {
  id: string;
  kind: QuizKind;
  label: string;
  finishedAt: number;
  score: number;
  total: number;
  items: QuizAttemptItem[];
};

const KEY = "gsm.quizAttempts.v1";
const MAX_ATTEMPTS = 50; // keep storage small

function safeRead(): QuizAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as QuizAttempt[]) : [];
  } catch {
    return [];
  }
}

function safeWrite(list: QuizAttempt[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ATTEMPTS)));
    // Notify same-tab listeners (the storage event only fires cross-tab).
    window.dispatchEvent(new Event("gsm.quizAttempts.change"));
  } catch {
    // Ignore quota errors — attempts are best-effort.
  }
}

export function saveAttempt(attempt: Omit<QuizAttempt, "id" | "finishedAt"> & { finishedAt?: number }): QuizAttempt {
  const id =
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36));
  const full: QuizAttempt = {
    id,
    finishedAt: attempt.finishedAt ?? Date.now(),
    kind: attempt.kind,
    label: attempt.label,
    score: attempt.score,
    total: attempt.total,
    items: attempt.items,
  };
  const list = [full, ...safeRead()];
  safeWrite(list);
  return full;
}

export function listAttempts(): QuizAttempt[] {
  return safeRead().sort((a, b) => b.finishedAt - a.finishedAt);
}

export function getAttempt(id: string): QuizAttempt | undefined {
  return safeRead().find((a) => a.id === id);
}

export function deleteAttempt(id: string) {
  safeWrite(safeRead().filter((a) => a.id !== id));
}

export function clearAttempts() {
  safeWrite([]);
}

export const kindLabels: Record<QuizKind, string> = {
  mock: "Mock test",
  signs: "Road signs",
  markings: "Road markings",
  topic: "Topic mini-quiz",
  "questions-easy": "Theory questions · Easy",
  "questions-medium": "Theory questions · Medium",
  "questions-hard": "Theory questions · Hard",
};