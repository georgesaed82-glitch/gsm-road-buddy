## Goal

Adopt the screenshot as the new premium direction across mobile app, mobile web, and desktop — one unified design system with a simpler homepage and a persistent bottom tab bar (Home · Lessons · Theory · GSM Plus · Contact).

## Design system pass

- Lock the palette: forest green `#234B36`, gold accent `#C97845` / `#B8863A`, cream `#F7F3E8`, ink `#1D2A22`.
- Introduce shared premium primitives in `src/styles.css`:
  - `.premium-card` — cream card, subtle border, soft shadow, rounded-2xl.
  - `.premium-cta` — gold pill with hover lift.
  - `.premium-hero-plate` — forest→deep-green gradient with hairline gold divider (matches the arced header in the screenshot).
- Apply a consistent page frame to every route (About, Lessons, Prices, Theory, Reviews, Contact, Instructors, GSM Plus): same eyebrow style, same H1 scale, same soft cream background, same section padding.

## Homepage (only what stays)

Everything else moves off the homepage and into the Menu / bottom-tab destinations.

Sections kept:
1. Hero — Mercedes image (existing `gsm-hero-mercedes.jpg`, refined framing/overlay only, no new image), tagline "Learn. Improve. **Pass with confidence.**", one primary CTA "Book a Lesson".
2. Slim GSM Plus "Coming Soon" banner (single-line, links to `/auth`).
3. 3 feature cards: Manual & Automatic · Local Instructors · Proven Success.
4. Single "Ready to Start?" contact strip.
5. DVSA disclaimer line above footer.

Sections removed from the homepage (still reachable via menu / dedicated routes):
- Memorable Moments, Recent Passes, Why GSM, Postcodes, Areas, Gallery, Quizzes, Install-app card, Portal section, GSM Plus explainer.

The homepage CMS section order stays intact in the database; only the web renderer stops rendering the removed types on `/`. Admin editing continues to work for the other pages that use those sections.

## Bottom tab bar (new, global)

Persistent bottom nav on every route, mobile + desktop:

```text
Home · Lessons · Theory · GSM Plus · Contact
```

- Mounted in `src/routes/__root.tsx` as `<BottomTabBar />`.
- Fixed bottom, safe-area aware, forest-green surface with gold active tab.
- Icons: Home, Car, BookOpen, GraduationCap, Phone.
- Active tab derived from `useRouterState` pathname.
- Reserves bottom padding on the page so content isn't hidden.
- The floating BackToTop and HomeButton reposition above it; on `/` the HomeButton hides (already does).

## Native app home

`HomeNativeApp.tsx` follows the same 5-section homepage rules (hero → GSM Plus banner → 3 feature cards → Ready to Start → disclaimer). Remove the 7-card nav grid and postcodes block — those live in the menu now. Bottom tab bar takes their place for primary navigation.

## Menu (Sheet)

The full-screen menu keeps every existing destination (About, Practical Lessons, Prices & Packages, Theory Training, Reviews, Instructors, Contact, Areas, Recent Passes, GSM Plus, Downloads, FAQ, Legal). No content is lost — it just moves off the homepage.

## Consistency across pages

Apply the shared premium frame + updated header/section spacing to:
- `/about`, `/services`, `/pricing`, `/theory`, `/reviews`, `/instructors`, `/contact`, `/auth` (GSM Plus landing), `/faq`, `/downloads`.

No content changes on those pages — visual polish only (eyebrow, H1 scale, cream background, card treatment, CTA style, bottom-tab padding).

## Animations

- Reuse existing `Reveal` fade-in-up for section entry (250ms, ease-out).
- Tab bar active indicator: 200ms translate + gold underline.
- Hover: `-translate-y-0.5` on cards/CTAs, `duration-200 ease-out`.
- No new animation libraries.

## Files touched

Frontend / presentation only.

- New: `src/components/BottomTabBar.tsx`, plus premium utility classes appended to `src/styles.css`.
- Edit: `src/routes/__root.tsx` (mount tab bar, hide on admin/portal shells if needed).
- Edit: `src/routes/index.tsx` (filter web section list to hero/gsm-plus banner/features/cta; keep hero refinements).
- Edit: `src/components/home/HomeNativeApp.tsx` (simplify to the 5-section shape).
- Edit: `src/components/BackToTop.tsx`, `src/components/HomeButton.tsx` (raise offsets above tab bar).
- Light polish edits on the listed public pages for premium consistency.

No database, RLS, server-function, or business-logic changes.

## Out of scope

- Generating a new Mercedes image (reusing existing per your answer).
- Removing content from other pages — just visual consistency.
- Changing the admin portal or GSM Plus authenticated dashboards.

Approve and I'll implement in one pass.