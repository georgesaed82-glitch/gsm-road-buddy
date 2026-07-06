import { describe, it, expect } from "vitest";
import { sampleTheoryQuestions } from "./theory";
import { homeTheoryQuestions } from "./homeTheoryQuiz";
import { topicQuizzes } from "./topicQuizzes";
import { hazardQuestions } from "./hazardQuiz";

// Compliance & integrity checks for all theory-quiz question sources.
// Goal: catch duplicate IDs, out-of-range correctIndex, empty options,
// and any accidental reproduction of DVSA copyright markers.

describe("theory content compliance", () => {
  it("sampleTheoryQuestions have unique ids", () => {
    const ids = sampleTheoryQuestions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every theory question has a valid correctIndex and 2+ options", () => {
    for (const q of sampleTheoryQuestions) {
      expect(q.options.length, `id=${q.id}`).toBeGreaterThanOrEqual(2);
      expect(q.correctIndex, `id=${q.id}`).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex, `id=${q.id}`).toBeLessThan(q.options.length);
      expect(q.options.filter(Boolean).length, `id=${q.id}`).toBe(q.options.length);
      expect(new Set(q.options).size, `duplicate options in ${q.id}`).toBe(q.options.length);
      expect(q.optionExplanations.length, `id=${q.id}`).toBe(q.options.length);
    }
  });

  it("home + topic + hazard quizzes have valid correctIndex", () => {
    const all = [
      ...homeTheoryQuestions.map((q, i) => ({ id: `home-${i}`, ...q })),
      ...Object.entries(topicQuizzes).flatMap(([slug, qs]) =>
        qs.map((q, i) => ({ id: `${slug}-${i}`, question: q.q, options: q.options, correctIndex: q.correctIndex })),
      ),
      ...hazardQuestions.map((q) => ({ id: q.id, question: q.question, options: q.options, correctIndex: q.correctIndex })),
    ];
    for (const q of all) {
      expect(q.correctIndex, `id=${q.id}`).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex, `id=${q.id}`).toBeLessThan(q.options.length);
      expect(new Set(q.options).size, `duplicate options in ${q.id}`).toBe(q.options.length);
    }
  });

  it("no question text carries a DVSA copyright/attribution marker", () => {
    // Regex — matches typical copyright markers that would indicate a direct
    // paste from DVSA / Crown Copyright materials. Learners can still read
    // "DVSA" as a topic label; this only flags copyright notices.
    const forbidden = /(©|\(c\))\s*(crown copyright|dvsa|driver and vehicle standards agency)/i;
    const all = [
      ...sampleTheoryQuestions.map((q) => ({ id: q.id, text: `${q.question} ${q.explanation} ${q.optionExplanations.join(" ")}` })),
      ...homeTheoryQuestions.map((q, i) => ({ id: `home-${i}`, text: `${q.question} ${q.explanation}` })),
      ...Object.entries(topicQuizzes).flatMap(([slug, qs]) =>
        qs.map((q, i) => ({ id: `${slug}-${i}`, text: `${q.q} ${q.explanation}` })),
      ),
      ...hazardQuestions.map((q) => ({ id: q.id, text: `${q.question} ${q.explanation}` })),
    ];
    for (const q of all) {
      expect(forbidden.test(q.text), `possible DVSA copyright marker in ${q.id}: "${q.text.slice(0, 120)}"`).toBe(false);
    }
  });
});