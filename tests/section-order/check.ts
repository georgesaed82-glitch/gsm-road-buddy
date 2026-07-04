#!/usr/bin/env bun
/**
 * Verify the homepage section order is identical across mobile, tablet,
 * and desktop breakpoints.
 *
 * Expected DOM order of <section> heading labels (uppercase eyebrow):
 *   1. Hero            — "Notting Hill Gate..."
 *   2. Why GSM
 *   3. Driving lessons by area (postcodes + areas)
 *   4. Recent pass
 *   5. From our students (gallery)
 *   6. Free theory practice
 *   7. Download the GSM app
 *   8. The learner portal
 *   9. CTA (Ready to start)
 *
 * Run with the dev server on http://localhost:8080:
 *     bun tests/section-order/check.ts
 */
import { chromium, firefox, webkit } from "playwright";
import type { Browser, BrowserType } from "playwright";

const BASE_URL = "http://localhost:8080/";

const VIEWPORTS = [
  ["mobile", 390, 844],
  ["tablet", 820, 1180],
  ["desktop", 1440, 900],
] as const;

const EXPECTED = [
  "Notting Hill", // hero eyebrow
  "Why GSM",
  "Driving lessons by area",
  "Recent pass",
  "From our students",
  "Free theory practice",
  "GSM mobile app", // InstallAppCard eyebrow
  "The learner portal",
  "Ready to start", // CTA h2 (no eyebrow)
];

interface SectionLabel {
  text: string;
  top: number;
}

async function collectLabels(page: Awaited<ReturnType<Browser["newPage"]>>): Promise<SectionLabel[]> {
  return await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll("section"));
    return sections
      .map((s) => {
        const eyebrow = s.querySelector(".uppercase");
        const heading = s.querySelector("h1, h2");
        const text = (eyebrow?.textContent || heading?.textContent || "").trim();
        const rect = s.getBoundingClientRect();
        return { text, top: rect.top + window.scrollY };
      })
      .filter((x) => x.text);
  });
}

function matchOrder(labels: SectionLabel[]) {
  let idx = 0;
  const matched: [string, string][] = [];
  for (const label of labels) {
    if (
      idx < EXPECTED.length &&
      label.text.toLowerCase().includes(EXPECTED[idx].toLowerCase())
    ) {
      matched.push([EXPECTED[idx], label.text]);
      idx += 1;
    }
  }
  return { ok: idx === EXPECTED.length, matched };
}

async function main() {
  const failures: string[] = [];
  const browserName = (process.env.BROWSER || "chromium").toLowerCase();
  const launcher: BrowserType = { chromium, firefox, webkit }[browserName] as BrowserType;
  const browser = await launcher.launch({ headless: true });
  console.log(`Running section-order check on ${browserName}`);
  for (const [name, w, h] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    // let hydration + lazy sections settle
    await page.waitForSelector("footer", { timeout: 30000 });
    try {
      await page.waitForLoadState("networkidle", { timeout: 15000 });
    } catch {
      // ignore timeout
    }
    // scroll to bottom to trigger any viewport-lazy sections, then back to top
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
    await page.waitForTimeout(500);
    await page.evaluate("window.scrollTo(0, 0)");
    await page.waitForTimeout(200);
    const labels = await collectLabels(page);
    // sort by vertical position (defensive — visual order is what matters)
    const labelsSorted = [...labels].sort((a, b) => a.top - b.top);
    const { ok, matched } = matchOrder(labelsSorted);
    console.log(`\n[${name} ${w}x${h}] matched ${matched.length}/${EXPECTED.length}`);
    for (const [exp, got] of matched) {
      console.log(`  ✓ ${exp} ← ${got.slice(0, 60)}`);
    }
    if (!ok) {
      const missing = EXPECTED.slice(matched.length);
      console.log(`  ✗ missing/out-of-order: ${missing}`);
      console.log(
        `  visible section labels: ${labelsSorted.map((l) => l.text.slice(0, 50))}`
      );
      failures.push(name);
    }
    await ctx.close();
  }
  await browser.close();

  if (failures.length) {
    console.log(`\nFAIL: section order broken on ${failures.join(", ")}`);
    process.exit(1);
  }
  console.log("\nOK: section order 1–9 preserved on mobile, tablet, and desktop.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
