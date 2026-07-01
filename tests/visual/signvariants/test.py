"""
Visual regression for OfficialSignImage variants.

Runs across chromium/firefox/webkit. Baselines are per-browser under
baseline/<browser>/. First run per browser seeds baselines locally; CI
ships pre-seeded baselines for chromium and seeds firefox/webkit on
their first green run.

Configure browser via BROWSER env var (default: chromium).
"""
import asyncio, os, sys
from pathlib import Path
from PIL import Image, ImageChops
from playwright.async_api import async_playwright

BROWSER = os.environ.get("BROWSER", "chromium").lower()
BASE_URL = os.environ.get("BASE_URL", "http://localhost:8080")

ROOT = Path(__file__).parent
BASE = ROOT / "baseline" / BROWSER; BASE.mkdir(parents=True, exist_ok=True)
CUR  = ROOT / "current"  / BROWSER; CUR.mkdir(parents=True, exist_ok=True)
DIFF = ROOT / "diff"     / BROWSER; DIFF.mkdir(parents=True, exist_ok=True)

VARIANTS = ["thumb", "card", "feedback", "detail", "hero"]
EXPECTED = {"thumb": 64, "card": 112, "feedback": 128, "detail": 176, "hero": 220}
VIEWS = [("mobile", 390, 800), ("desktop", 1280, 1800)]
PIXEL_TOL = 12
DIFF_BUDGET_RATIO = 0.02

def diff_images(a: Path, b: Path, out: Path):
    ia = Image.open(a).convert("RGB")
    ib = Image.open(b).convert("RGB")
    if ia.size != ib.size:
        return {"ok": False, "reason": f"size {ia.size} vs {ib.size}"}
    d = ImageChops.difference(ia, ib)
    px = d.load(); w, h = d.size
    bad = 0
    for y in range(h):
        for x in range(w):
            r, g, bl = px[x, y]
            if max(r, g, bl) > PIXEL_TOL:
                bad += 1
    ratio = bad / (w * h)
    d.save(out)
    return {"ok": ratio <= DIFF_BUDGET_RATIO, "reason": f"{ratio*100:.2f}% pixels differ"}

async def run():
    failures, seeded = [], []
    async with async_playwright() as p:
        launcher = {"chromium": p.chromium, "firefox": p.firefox, "webkit": p.webkit}[BROWSER]
        browser = await launcher.launch(headless=True)
        for view_name, w, h in VIEWS:
            ctx = await browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
            page = await ctx.new_page()
            await page.goto(BASE_URL, wait_until="domcontentloaded")
            await page.evaluate("window.sessionStorage.setItem('portal_unlocked','1')")
            await page.goto(f"{BASE_URL}/dev/sign-variants", wait_until="networkidle")
            await page.wait_for_selector('[data-testid="variant-grid"] img', timeout=15000)
            await page.wait_for_timeout(800)

            for v in VARIANTS:
                sel = f'[data-testid="variant-{v}"]'
                el = page.locator(sel)
                wrapper = el.locator("> div").first
                wbox = await wrapper.bounding_box()
                if not wbox:
                    failures.append(f"[{view_name}/{v}] no wrapper box"); continue
                aspect = wbox["width"] / wbox["height"] if wbox["height"] else 0
                if abs(aspect - 1.0) > 0.05:
                    failures.append(f"[{view_name}/{v}] aspect {aspect:.3f} != 1:1")
                expected = EXPECTED[v]
                if view_name == "desktop":
                    if abs(wbox["width"] - expected) > 1:
                        failures.append(f"[{view_name}/{v}] width {wbox['width']:.1f} != {expected}")
                else:
                    if wbox["width"] > expected + 1:
                        failures.append(f"[{view_name}/{v}] mobile width {wbox['width']:.1f} > {expected}")
                    if wbox["x"] + wbox["width"] > w + 1:
                        failures.append(f"[{view_name}/{v}] overflows viewport")

                cur_path = CUR / f"{view_name}_{v}.png"
                await el.screenshot(path=str(cur_path))
                base_path = BASE / f"{view_name}_{v}.png"
                if not base_path.exists():
                    Image.open(cur_path).save(base_path)
                    seeded.append(f"{view_name}/{v}")
                else:
                    res = diff_images(base_path, cur_path, DIFF / f"{view_name}_{v}.png")
                    if not res["ok"]:
                        failures.append(f"[{view_name}/{v}] visual diff — {res['reason']}")
            await ctx.close()
        await browser.close()

    print(f"=== {BROWSER.upper()} ===")
    if seeded:
        print(f"Seeded {len(seeded)} baseline(s): {', '.join(seeded)}")
    if failures:
        print(f"FAIL — {len(failures)} issue(s):")
        for f in failures: print(" -", f)
        sys.exit(1)
    print(f"PASS — {len(VARIANTS)*len(VIEWS)} renders match baseline (or newly seeded)")

asyncio.run(run())