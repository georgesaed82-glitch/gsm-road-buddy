import { describe, it, expect } from "vitest";
import { signs, signGroups, signsByGroup, buildSignOptions } from "./signs";

// Verifies the quiz mapping invariant used by /road-signs:
// for every sign, buildSignOptions must return options where
// options[correctIndex] === sign.name (i.e. correctIndex maps back
// to the rendered sign.id). Runs many rounds because option order
// and distractors are randomised.

const ROUNDS = 25;

function assertRound(pool: typeof signs, label: string) {
  for (const sign of pool) {
    for (let r = 0; r < ROUNDS; r++) {
      const { options, correctIndex } = buildSignOptions(sign, pool);
      expect(options).toHaveLength(4);
      expect(new Set(options).size, `[${label}] duplicate options for ${sign.id}`).toBe(4);
      expect(correctIndex, `[${label}] correctIndex out of range for ${sign.id}`).toBeGreaterThanOrEqual(0);
      expect(correctIndex).toBeLessThan(options.length);
      expect(
        options[correctIndex],
        `[${label}] correctIndex does not map to rendered sign ${sign.id}`,
      ).toBe(sign.name);
    }
  }
}

describe("road-signs quiz mapping", () => {
  it("correctIndex points to the rendered sign across all signs (all pool)", () => {
    assertRound(signs, "all");
  });

  for (const g of signGroups) {
    it(`correctIndex points to the rendered sign within group: ${g.slug}`, () => {
      const pool = signsByGroup(g.slug);
      if (pool.length === 0) return;
      assertRound(pool, g.slug);
    });
  }

  it("has unique sign ids and names (no accidental collisions)", () => {
    const ids = new Set(signs.map((s) => s.id));
    const names = new Set(signs.map((s) => s.name));
    expect(ids.size).toBe(signs.length);
    expect(names.size).toBe(signs.length);
  });
});