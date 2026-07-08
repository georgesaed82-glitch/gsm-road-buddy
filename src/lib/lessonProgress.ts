import { useEffect, useState, useCallback } from "react";

const KEY = "gsm.lesson.completed.v1";

function read(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function write(set: Set<string>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...set]));
    window.dispatchEvent(new CustomEvent("gsm-lesson-progress"));
  } catch {
    // ignore quota / private-mode errors
  }
}

export function useLessonProgress() {
  const [completed, setCompleted] = useState<Set<string>>(() => read());

  useEffect(() => {
    const sync = () => setCompleted(read());
    window.addEventListener("gsm-lesson-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("gsm-lesson-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const next = new Set(read());
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    write(next);
    setCompleted(next);
  }, []);

  const isDone = useCallback((slug: string) => completed.has(slug), [completed]);

  return { completed, toggle, isDone };
}
