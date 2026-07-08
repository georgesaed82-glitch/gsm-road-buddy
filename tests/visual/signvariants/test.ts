#!/usr/bin/env bun
/**
 * Visual regression for OfficialSignImage variants.
 *
 * Runs across chromium/firefox/webkit. Baselines are per-browser under
 * baseline/<browser>/. First run per browser seeds baselines locally; CI
 * ships pre-seeded baselines for chromium and seeds firefox/webkit on
 * their first green run.
 *
 * Configure browser via BROWSER env var (default: chromium).
 */
import { chromium, firefox, webkit } from "playwright";
import type { BrowserType, Page } from "playwright";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { PNG } from "pngjs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BROWSER = (process.env.BROWSER || "chromium").toLowerCase();
const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

const ROOT = resolve(__dirname, ".");
const BASE = resolve(ROOT, "baseline", BROWSER);
const CUR = resolve(ROOT, "current", BROWSER);
const DIFF = resolve(ROOT, "diff", BROWSER);
const FIXTURE_SVG_PATH = resolve(__dirname, "../../../public/sign-variant-fixture.svg");
const FIXTURE_SVG = readFileSync(FIXTURE_SVG_PATH);

for (const p of [BASE, CUR, DIFF]) {
  mkdirSync(p, { recursive: true });
}

const VARIANTS = ["thumb", "card", "feedback", "detail", "hero"] as const;
const EXPECTED: Record<string, number> = {
  thumb: 64,
  card: 112,
  feedback: 128,
  detail: 176,
  hero: 220,
};
const VIEWS = [
  ["mobile", 390, 800],
  ["desktop", 1280, 1800],
] as const;
const PIXEL_TOL = 12;
const DIFF_BUDGET_RATIO = 0.02;
const GRID_SELECTOR = '[data-testid="variant-grid"]';
const GRID_IMAGE_SELECTOR = `${GRID_SELECTOR} img`;

interface DiffResult {
  ok: boolean;
  reason: string;
}

function diffImages(aPath: string, bPath: string, outPath: string): DiffResult {
  const a = PNG.sync.read(readFileSync(aPath));
  const b = PNG.sync.read(readFileSync(bPath));
  if (a.width !== b.width || a.height !== b.height) {
    return {
      ok: false,
      reason: `size ${a.width}x${a.height} vs ${b.width}x${b.height}`,
    };
  }
  const { width, height } = a;
  const diff = Buffer.alloc(width * height * 4);
  let bad = 0;
  for (let i = 0; i < width * height; i++) {
    const r = Math.abs(a.data[i * 4] - b.data[i * 4]);
    const g = Math.abs(a.data[i * 4 + 1] - b.data[i * 4 + 1]);
    const bl = Math.abs(a.data[i * 4 + 2] - b.data[i * 4 + 2]);
    if (Math.max(r, g, bl) > PIXEL_TOL) {
      bad += 1;
      diff[i * 4] = 255;
      diff[i * 4 + 1] = 0;
      diff[i * 4 + 2] = 255;
      diff[i * 4 + 3] = 255;
    }
  }
  const diffPng = new PNG({ width, height });
  diffPng.data = diff;
  writeFileSync(outPath, PNG.sync.write(diffPng));
  const ratio = bad / (width * height);
  return {
    ok: ratio <= DIFF_BUDGET_RATIO,
    reason: `${(ratio * 100).toFixed(2)}% pixels differ`,
  };
}

async function gridImageStates(page: Page) {
  return page.locator(GRID_IMAGE_SELECTOR).evaluateAll((imgs) =>
    imgs.map((img, index) => {
      const image = img as HTMLImageElement;
      const el = img as HTMLElement;
      return {
        index,
        src: image.src,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        visible: !!(el.offsetWidth || el.offsetHeight),
      };
    }),
  );
}

async function waitForGridImages(page: Page, viewName: string) {
  await page.waitForSelector(GRID_SELECTOR, {
    state: "visible",
    timeout: 30000,
  });

  const images = page.locator(GRID_IMAGE_SELECTOR);
  await images.first().waitFor({ state: "visible", timeout: 30000 });

  const imageStatus = await gridImageStates(page);
  console.log("Variant image status:", imageStatus);

  try {
    await page.waitForFunction(
      () => {
        const imgs = Array.from(
          document.querySelectorAll('[data-testid="variant-grid"] img'),
        ).filter((img) => {
          const el = img as HTMLElement;
          return !!(el.offsetWidth || el.offsetHeight);
        }) as HTMLImageElement[];

        return (
          imgs.length > 0 &&
          imgs.every((img) => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0)
        );
      },
      { timeout: 30000 },
    );
  } catch (err) {
    console.error(`[${BROWSER}/${viewName}] variant-grid image states:`);
    console.error(JSON.stringify(await gridImageStates(page), null, 2));
    throw err;
  }
}

async function main() {
  const failures: string[] = [];
  const seeded: string[] = [];
  const launcher: BrowserType = { chromium, firefox, webkit }[BROWSER] as BrowserType;
  const browser = await launcher.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
  });
  for (const [viewName, w, h] of VIEWS) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.route("**/sign-variant-fixture.svg", (route) =>
      route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: FIXTURE_SVG,
      }),
    );
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => window.sessionStorage.setItem("portal_unlocked", "1"));
    await page.goto(`${BASE_URL}/dev/sign-variants`, { waitUntil: "networkidle" });
    await waitForGridImages(page, viewName);
    await page.waitForTimeout(300);

    for (const v of VARIANTS) {
      const sel = `[data-testid="variant-${v}"]`;
      const el = page.locator(sel);
      const wrapper = el.locator("> div").first();
      const wbox = await wrapper.boundingBox();
      if (!wbox) {
        failures.push(`[${viewName}/${v}] no wrapper box`);
        continue;
      }
      const aspect = wbox.height ? wbox.width / wbox.height : 0;
      if (Math.abs(aspect - 1.0) > 0.05) {
        failures.push(`[${viewName}/${v}] aspect ${aspect.toFixed(3)} != 1:1`);
      }
      const expected = EXPECTED[v];
      if (viewName === "desktop") {
        if (Math.abs(wbox.width - expected) > 1) {
          failures.push(`[${viewName}/${v}] width ${wbox.width.toFixed(1)} != ${expected}`);
        }
      } else {
        if (wbox.width > expected + 1) {
          failures.push(`[${viewName}/${v}] mobile width ${wbox.width.toFixed(1)} > ${expected}`);
        }
        if (wbox.x + wbox.width > w + 1) {
          failures.push(`[${viewName}/${v}] overflows viewport`);
        }
      }

      const curPath = resolve(CUR, `${viewName}_${v}.png`);
      // Screenshot only the 1:1 sign wrapper — excluding the dev-page caption
      // text below, whose font antialiasing shifts between Chromium builds
      // and busts the pixel budget on the small tiles.
      await wrapper.screenshot({ path: curPath });
      const basePath = resolve(BASE, `${viewName}_${v}.png`);
      if (!existsSync(basePath)) {
        // copy current screenshot to baseline
        writeFileSync(basePath, readFileSync(curPath));
        seeded.push(`${viewName}/${v}`);
      } else {
        const res = diffImages(basePath, curPath, resolve(DIFF, `${viewName}_${v}.png`));
        if (!res.ok) {
          failures.push(`[${viewName}/${v}] visual diff — ${res.reason}`);
        }
      }
    }
    await ctx.close();
  }
  await browser.close();

  console.log(`=== ${BROWSER.toUpperCase()} ===`);
  if (seeded.length) {
    console.log(`Seeded ${seeded.length} baseline(s): ${seeded.join(", ")}`);
  }
  if (failures.length) {
    console.log(`FAIL — ${failures.length} issue(s):`);
    for (const f of failures) console.log(" -", f);
    process.exit(1);
  }
  console.log(`PASS — ${VARIANTS.length * VIEWS.length} renders match baseline (or newly seeded)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
