#!/usr/bin/env python3
"""Verify the homepage section order is identical across mobile, tablet,
and desktop breakpoints.

Expected DOM order of <section> heading labels (uppercase eyebrow):
  1. Hero            — "Notting Hill Gate..."
  2. Why GSM
  3. Driving lessons by area (postcodes + areas)
  4. Recent pass
  5. From our students (gallery)
  6. Free theory practice
  7. Download the GSM app
  8. The learner portal
  9. CTA (Ready to start)

Run with the dev server on http://localhost:8080:
    python3 tests/section-order/check.py
"""
import asyncio
import sys
from playwright.async_api import async_playwright

BASE_URL = "http://localhost:8080/"

VIEWPORTS = [
    ("mobile", 390, 844),
    ("tablet", 820, 1180),
    ("desktop", 1440, 900),
]

EXPECTED = [
    "Notting Hill",           # hero eyebrow
    "Why GSM",
    "Driving lessons by area",
    "Recent pass",
    "From our students",
    "Free theory practice",
    "GSM mobile app",         # InstallAppCard eyebrow
    "The learner portal",
    "Ready to start",         # CTA h2 (no eyebrow)
]


async def collect_labels(page):
    return await page.evaluate(
        """
        () => {
          const sections = Array.from(document.querySelectorAll('section'));
          return sections.map(s => {
            const eyebrow = s.querySelector('.uppercase');
            const heading = s.querySelector('h1, h2');
            const text = (eyebrow?.textContent || heading?.textContent || '').trim();
            const rect = s.getBoundingClientRect();
            return { text, top: rect.top + window.scrollY };
          }).filter(x => x.text);
        }
        """
    )


def match_order(labels):
    """Return (ok, details). Each EXPECTED substring must appear in order."""
    idx = 0
    matched = []
    for label in labels:
        if idx < len(EXPECTED) and EXPECTED[idx].lower() in label["text"].lower():
            matched.append((EXPECTED[idx], label["text"]))
            idx += 1
    return idx == len(EXPECTED), matched


async def main():
    failures = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        for name, w, h in VIEWPORTS:
            ctx = await browser.new_context(viewport={"width": w, "height": h})
            page = await ctx.new_page()
            await page.goto(BASE_URL, wait_until="domcontentloaded")
            # let hydration + lazy sections settle
            await page.wait_for_selector("footer", timeout=10000)
            labels = await collect_labels(page)
            # sort by vertical position (defensive — visual order is what matters)
            labels_sorted = sorted(labels, key=lambda l: l["top"])
            ok, matched = match_order(labels_sorted)
            print(f"\n[{name} {w}x{h}] matched {len(matched)}/{len(EXPECTED)}")
            for exp, got in matched:
                print(f"  ✓ {exp!r} ← {got[:60]!r}")
            if not ok:
                missing = EXPECTED[len(matched):]
                print(f"  ✗ missing/out-of-order: {missing}")
                print(f"  visible section labels: {[l['text'][:50] for l in labels_sorted]}")
                failures.append(name)
            await ctx.close()
        await browser.close()

    if failures:
        print(f"\nFAIL: section order broken on {failures}")
        sys.exit(1)
    print("\nOK: section order 1–9 preserved on mobile, tablet, and desktop.")


if __name__ == "__main__":
    asyncio.run(main())