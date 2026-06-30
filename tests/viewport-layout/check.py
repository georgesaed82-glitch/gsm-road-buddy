#!/usr/bin/env python3
"""Automated viewport layout checks.

Verifies that key routes have no horizontal overflow and that the booking
form / hero / header / logo all stay inside the viewport on the narrowest
supported phone widths in both orientations.

Run with the dev server on http://localhost:8080:
    python3 tests/viewport-layout/check.py

Exits non-zero on any layout violation so this can be wired into CI later.
"""
import asyncio
import sys
from pathlib import Path

from playwright.async_api import async_playwright

BASE_URL = "http://localhost:8080"

# (label, width, height) — narrow widths matter most.
VIEWPORTS = [
    ("galaxy-s23-portrait", 360, 800),
    ("iphone-se-portrait", 375, 667),
    ("iphone-14-15-portrait", 390, 844),
    ("pixel-7-portrait", 412, 915),
    ("iphone-se-landscape", 667, 375),
    ("galaxy-s23-landscape", 800, 360),
    ("iphone-14-15-landscape", 844, 390),
    ("pixel-7-landscape", 915, 412),
]

ROUTES = ["/", "/contact", "/auth", "/pricing", "/services", "/about"]

# Selectors that must stay fully inside the viewport on every route they
# appear on.
CRITICAL_SELECTORS = [
    "header",
    "header img",
    "main h1",
    "form",
]

SCREENSHOTS = Path(__file__).parent / "screenshots"


async def check_page(page, route: str, vw: int):
    return await page.evaluate(
        """
        ({ selectors, vw }) => {
            const html = document.documentElement;
            const body = document.body;
            const horizontalScroll = html.scrollWidth > vw + 1;
            const targets = selectors.flatMap((sel) =>
                Array.from(document.querySelectorAll(sel)).map((el) => {
                    const r = el.getBoundingClientRect();
                    return {
                        selector: sel,
                        left: r.left,
                        right: r.right,
                        width: r.width,
                        overflowRight: r.right > vw + 1,
                        overflowLeft: r.left < -1,
                        visible: r.width > 0 && r.height > 0,
                    };
                })
            );
            return {
                horizontalScroll,
                htmlScrollWidth: html.scrollWidth,
                bodyScrollWidth: body.scrollWidth,
                targets,
            };
        }
        """,
        {"selectors": CRITICAL_SELECTORS, "vw": vw},
    )


async def main() -> int:
    SCREENSHOTS.mkdir(parents=True, exist_ok=True)
    failures: list[str] = []
    checks = 0

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        for label, w, h in VIEWPORTS:
            ctx = await browser.new_context(viewport={"width": w, "height": h})
            page = await ctx.new_page()
            for route in ROUTES:
                checks += 1
                try:
                    await page.goto(f"{BASE_URL}{route}", wait_until="networkidle", timeout=15000)
                except Exception as e:
                    failures.append(f"[{label} {route}] navigation failed: {e}")
                    continue

                result = await check_page(page, route, w)
                if result["horizontalScroll"]:
                    failures.append(
                        f"[{label} {route}] horizontal scroll: htmlScrollWidth={result['htmlScrollWidth']} vw={w}"
                    )
                for t in result["targets"]:
                    if not t["visible"]:
                        continue
                    if t["overflowRight"] or t["overflowLeft"]:
                        failures.append(
                            f"[{label} {route}] '{t['selector']}' overflows: left={t['left']:.0f} right={t['right']:.0f} vw={w}"
                        )

                if failures and failures[-1].startswith(f"[{label} {route}]"):
                    safe_route = route.replace("/", "_") or "_root"
                    await page.screenshot(path=str(SCREENSHOTS / f"FAIL_{label}{safe_route}.png"))
            await ctx.close()
        await browser.close()

    print(f"Ran {checks} viewport × route checks across {len(VIEWPORTS)} viewports and {len(ROUTES)} routes.")
    if failures:
        print(f"\n{len(failures)} layout violation(s):")
        for f in failures:
            print(f"  - {f}")
        print(f"\nFailing screenshots saved under {SCREENSHOTS}/")
        return 1
    print("All viewport layout checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))