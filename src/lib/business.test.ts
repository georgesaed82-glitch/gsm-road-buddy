import { describe, expect, it } from "vitest";
import { GEORGE_PRICES, instructorPricing, TEAM_STARTING_RATE } from "./business";

describe("separate team and individual pricing", () => {
  it("sets the team starting rate at £45 per hour", () => {
    expect(TEAM_STARTING_RATE).toBe(45);
  });
  it("keeps George's four prices separate from the team rate", () => {
    const result = instructorPricing("George");
    expect(result.kind).toBe("george");
    if (result.kind !== "george") throw new Error("George must have his own prices");
    expect(result.prices.map((price) => price.price)).toEqual(["£70", "£780", "£80", "£900"]);
    expect(result.prices).toBe(GEORGE_PRICES);
  });
  for (const name of ["Michael", "Abdul", "Rana", "Ikeel"]) {
    it(`leaves ${name}'s individual price on enquiry rather than assigning £45`, () => {
      const result = instructorPricing(name);
      expect(result.kind).toBe("enquiry");
      expect("prices" in result).toBe(false);
    });
  }
});