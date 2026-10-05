#!/usr/bin/env bun
/**
 * Homepage structure check for the CURRENT public web homepage.
 *
 * The public site only renders the CMS "hero" and "cta" sections; the hero
 * block is followed by fixed Driving videos, Local areas and a minimal GSM
 * Buddy note. Expected visual order (by anchor id) at every breakpoint:
 *   top → videos → local-areas → gsm-buddy → get-in-touch
 * It also asserts removed public promotions (theory practice, app download,
 * GSM Plus portal) stay absent, and that no horizontal overflow occurs.
 *
 *   BASE_URL=http://localhost:8080/ BROWSER=chromium bun tests/section-order/check.ts
 */
import { chromium, firefox, webkit } from "playwright";
import type { BrowserType } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:8080/";
const VIEWPORTS = [
  ["phone-320", 320, 700],
  ["phone-390", 390, 844],
  ["tablet-820", 820, 1180],
  ["desktop-1440", 1440, 900],
] as const;
const EXPECTED_ORDER = ["top", "videos", "local-areas", "gsm-buddy", "get-in-touch"];
const REMOVED_IDS = ["training", "portal", "install-app", "gsm-plus-explainer"];
const REMOVED_TEXT = [/free theory practice/i, /download (the )?(gsm )?app/i, /gsm plus\+? learner portal/i];

async function main() {
  const name = (process.env.BROWSER || "chromium").toLowerCase();
  const launcher = ({ chromium, firefox, webkit } as Record<string, BrowserType>)[name];
  if (!launcher) throw new Error(`Unknown BROWSER ${name}`);
  const browser = await launcher.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined });
  const failures: string[] = [];
  console.log(`Homepage structure check on ${name} → ${BASE_URL}`);
  for (const [label, w, h] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("#get-in-touch", { timeout: 45000 });
    const r = await page.evaluate(
      ({ order, removed }) => {
        const tops = order.map((id) => {
          const el = document.getElementById(id);
          return el ? el.getBoundingClientRect().top + window.scrollY : null;
        });
        return {
          tops,
          present: removed.filter((id) => document.getElementById(id)),
          text: document.body.innerText,
          overflow: document.documentElement.scrollWidth - window.innerWidth,
        };
      },
      { order: EXPECTED_ORDER, removed: REMOVED_IDS },
    );
    const errs: string[] = [];
    r.tops.forEach((t, i) => t === null && errs.push(`missing #${EXPECTED_ORDER[i]}`));
    for (let i = 1; i < r.tops.length; i++) {
      const a = r.tops[i - 1], b = r.tops[i];
      if (a !== null && b !== null && b <= a) errs.push(`#${EXPECTED_ORDER[i]} is not below #${EXPECTED_ORDER[i - 1]}`);
    }
    r.present.forEach((id) => errs.push(`removed section #${id} is rendered`));
    REMOVED_TEXT.forEach((re) => re.test(r.text) && errs.push(`removed promotion text ${re} found`));
    if (r.overflow > 1) errs.push(`horizontal overflow ${r.overflow}px`);
    console.log(`[${label}] ${errs.length ? "FAIL\n  - " + errs.join("\n  - ") : "ok"}`);
    if (errs.length) failures.push(label);
    await ctx.close();
  }
  await browser.close();
  if (failures.length) {
    console.log(`\nFAIL on ${failures.join(", ")}`);
    process.exit(1);
  }
  console.log("\nOK: homepage structure consistent at all breakpoints.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
