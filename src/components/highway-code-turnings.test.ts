/**
 * Structural regression for the turning-right diagrams in
 * HighwayCodeEssentials.tsx.
 *
 * Instead of pixel-diffing hand-authored SVGs we parse the source and
 * assert the geometric invariants of Rule 181 (UK, left-hand traffic):
 *
 *   • The RED car turns right 6→3 (south approach → east exit).
 *   • The BLUE car turns right 12→9 (north approach → west exit).
 *   • Both cars always finish in the destination road's LEFT lane.
 *   • Rotations: red front points NE→E  (~+30° to +90°),
 *                blue front points SW→W (~+210° to +270°).
 *   • Nearside (passenger-to-passenger): red SOUTH of centre, blue NORTH.
 *   • Offside  (driver-to-driver):       red NORTH of centre, blue SOUTH.
 *
 * These are exactly the invariants that were silently broken while we
 * iterated on the diagrams; this test locks them down.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(join(HERE, "HighwayCodeEssentials.tsx"), "utf8");

/** Extract the body of a top-level function by name. */
function bodyOf(name: string): string {
  const start = SOURCE.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`missing function ${name}`);
  // find next top-of-file `function ` after start (top-level only)
  const rest = SOURCE.slice(start + 1);
  const nextIdx = rest.search(/\nfunction \w+\(/);
  return nextIdx < 0 ? SOURCE.slice(start) : SOURCE.slice(start, start + 1 + nextIdx);
}

type Car = { x: number; y: number; rotate: number; color: string };
function extractCars(body: string): Car[] {
  const re =
    /<Car\s+x=\{(-?\d+(?:\.\d+)?)\}\s+y=\{(-?\d+(?:\.\d+)?)\}\s+rotate=\{(-?\d+(?:\.\d+)?)\}\s+color="([^"]+)"/g;
  const out: Car[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    out.push({ x: +m[1], y: +m[2], rotate: +m[3], color: m[4] });
  }
  return out;
}

/** Endpoint of every dashed arrow (the last x,y pair in each `d="..."`). */
function extractArrowEndpoints(body: string): Array<{ x: number; y: number }> {
  const re = /<path\s+d="([^"]+)"/g;
  const out: Array<{ x: number; y: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const nums = m[1].match(/-?\d+(?:\.\d+)?/g);
    if (!nums || nums.length < 2) continue;
    const n = nums.map(Number);
    out.push({ x: n[n.length - 2], y: n[n.length - 1] });
  }
  // Also include straight `<line x1=.. y1=.. x2=.. y2=..>` arrows.
  const lineRe =
    /<line\s+x1="(-?\d+(?:\.\d+)?)"\s+y1="(-?\d+(?:\.\d+)?)"\s+x2="(-?\d+(?:\.\d+)?)"\s+y2="(-?\d+(?:\.\d+)?)"/g;
  while ((m = lineRe.exec(body))) {
    out.push({ x: +m[3], y: +m[4] });
  }
  return out;
}

/** Normalise rotation to [0, 360). */
function norm(deg: number): number {
  const r = ((deg % 360) + 360) % 360;
  return r;
}
const RED = "#dc2626";
const BLUE = "#1d4ed8";

function red(cars: Car[]): Car {
  const c = cars.find((c) => c.color === RED);
  if (!c) throw new Error("no red car");
  return c;
}
function blue(cars: Car[]): Car {
  const c = cars.find((c) => c.color === BLUE);
  if (!c) throw new Error("no blue car");
  return c;
}

// ── shared assertions ───────────────────────────────────────────────
function expectRightTurnRotations(cars: Car[]) {
  const r = norm(red(cars).rotate);
  const b = norm(blue(cars).rotate);
  // red mid right-turn 6→3: front between 12 and 3
  expect(r, `red rotation ${r}° should be NE→E (30°–90°)`).toBeGreaterThanOrEqual(30);
  expect(r).toBeLessThanOrEqual(90);
  // blue mid right-turn 12→9: front between 6 and 9
  expect(b, `blue rotation ${b}° should be SW→W (210°–270°)`).toBeGreaterThanOrEqual(210);
  expect(b).toBeLessThanOrEqual(270);
}

function expectEastArrowAndWestArrow(endpoints: Array<{ x: number; y: number }>) {
  const eastArrows = endpoints.filter((p) => p.x >= 590);
  const westArrows = endpoints.filter((p) => p.x <= 40);
  expect(eastArrows.length, "at least one arrow ends in the EAST exit").toBeGreaterThanOrEqual(1);
  expect(westArrows.length, "at least one arrow ends in the WEST exit").toBeGreaterThanOrEqual(1);
  // finish in the destination road's LEFT lane
  for (const p of eastArrows) {
    expect(
      p.y,
      `east-bound arrow endpoint y=${p.y} must be in left (north) lane 100–190`,
    ).toBeGreaterThanOrEqual(100);
    expect(p.y).toBeLessThanOrEqual(190);
  }
  for (const p of westArrows) {
    expect(
      p.y,
      `west-bound arrow endpoint y=${p.y} must be in left (south) lane 190–290`,
    ).toBeGreaterThanOrEqual(190);
    expect(p.y).toBeLessThanOrEqual(290);
  }
}

// ── tests ───────────────────────────────────────────────────────────
describe("YellowBoxJunctionSvg", () => {
  const body = bodyOf("YellowBoxJunctionSvg");
  const cars = extractCars(body);
  const arrows = extractArrowEndpoints(body);

  it("red car sits inside the yellow box, angled NE", () => {
    const r = red(cars);
    expect(r.x, "inside box x=252..388").toBeGreaterThanOrEqual(252);
    expect(r.x).toBeLessThanOrEqual(388);
    expect(r.y, "inside box y=122..258").toBeGreaterThanOrEqual(122);
    expect(r.y).toBeLessThanOrEqual(258);
    const rot = norm(r.rotate);
    expect(rot, `red rotate ${rot}° should point NE (30–80)`).toBeGreaterThanOrEqual(30);
    expect(rot).toBeLessThanOrEqual(80);
  });

  it("blue oncoming car is far up the north approach, facing south", () => {
    const b = blue(cars);
    expect(b.y, "far away from junction").toBeLessThanOrEqual(80);
    expect(b.x, "north approach left lane x=250..320").toBeGreaterThanOrEqual(250);
    expect(b.x).toBeLessThanOrEqual(320);
    expect(norm(b.rotate), "blue faces due south (180°)").toBe(180);
  });

  it("red arrow curves into the east exit", () => {
    const east = arrows.find((p) => p.x >= 550 && p.y <= 190);
    expect(east, "a curved arrow ends in the east exit").toBeTruthy();
  });
});

describe("NearsideTurnSvg (turn IN FRONT, passenger-to-passenger)", () => {
  const body = bodyOf("NearsideTurnSvg");
  const cars = extractCars(body);
  const arrows = extractArrowEndpoints(body);

  it("cars have right-turn rotations", () => expectRightTurnRotations(cars));

  it("red is SOUTH of centre, blue is NORTH of centre (passenger sides meet)", () => {
    expect(red(cars).y, "red south of centre y>190").toBeGreaterThan(190);
    expect(blue(cars).y, "blue north of centre y<190").toBeLessThan(190);
  });

  it("arrows finish east/west in the correct LEFT lanes", () =>
    expectEastArrowAndWestArrow(arrows));
});

describe("OffsideTurnSvg (swing BEHIND, driver-to-driver)", () => {
  const body = bodyOf("OffsideTurnSvg");
  const cars = extractCars(body);
  const arrows = extractArrowEndpoints(body);

  it("cars have right-turn rotations", () => expectRightTurnRotations(cars));

  it("red is NORTH of centre, blue is SOUTH of centre (driver sides meet)", () => {
    expect(red(cars).y, "red north of centre y<190").toBeLessThan(190);
    expect(blue(cars).y, "blue south of centre y>190").toBeGreaterThan(190);
  });

  it("arrows finish east/west in the correct LEFT lanes", () =>
    expectEastArrowAndWestArrow(arrows));
});

describe("Extra Rule 181 scenarios", () => {
  for (const [name, method] of [
    ["StaggeredOffsideSvg", "offside"],
    ["StaggeredNearsideSvg", "nearside"],
    ["MajorMinorNearsideSvg", "nearside"],
    ["MajorMinorOffsideSvg", "offside"],
  ] as const) {
    describe(name, () => {
      const body = bodyOf(name);
      const cars = extractCars(body);
      const arrows = extractArrowEndpoints(body);

      it("cars have right-turn rotations", () => expectRightTurnRotations(cars));
      it("arrows finish east/west in the correct LEFT lanes", () =>
        expectEastArrowAndWestArrow(arrows));
      it(`car positions match the ${method} technique`, () => {
        if (method === "offside") {
          expect(red(cars).y, "offside: red north of centre").toBeLessThan(190);
          expect(blue(cars).y, "offside: blue south of centre").toBeGreaterThan(190);
        } else {
          expect(red(cars).y, "nearside: red south of centre").toBeGreaterThan(190);
          expect(blue(cars).y, "nearside: blue north of centre").toBeLessThan(190);
        }
      });
    });
  }
});
