# Viewport layout checks

Lightweight Playwright script that catches mobile horizontal-overflow and
cut-off regressions like the booking form/hero issues we hit earlier.

## What it checks

For each of these viewports — both portrait and landscape — and each of
`/`, `/contact`, `/auth`, `/pricing`, `/services`, `/about`:

- Galaxy S23 (360 × 800)
- iPhone SE (375 × 667)
- iPhone 14/15 (390 × 844)
- Pixel 7 (412 × 915)

It asserts that:

1. `documentElement.scrollWidth <= viewportWidth` (no horizontal scroll).
2. The `header`, header logo `img`, `main h1`, and any `form` stay fully
   inside the viewport on every route they appear on.

On any violation it prints the offender(s) and saves a screenshot under
`tests/viewport-layout/screenshots/FAIL_*.png`, then exits non-zero.

## Run locally

With the dev server running on `http://localhost:8080`:

```bash
python3 tests/viewport-layout/check.py
```

Playwright + Chromium are expected to be installed. The script has no npm
dependencies and does not touch the project build.