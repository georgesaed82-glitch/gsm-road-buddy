## Mobile App Home Redesign (Capacitor only)

The desktop and mobile website stay exactly as they are today. A new, purpose-built home screen renders only when the app is running inside the installed iPhone/Android app.

### What the app home will look like

1. **Hero (first screen, no scroll needed)**
   - Centered GSM logo, single-line headline "Drive today. Succeed tomorrow.", one sub-line.
   - 3 primary action pills below the headline: Call, WhatsApp, Book.
   - Fits inside the first viewport on iPhone 12+ so users see hero + top of grid immediately.

2. **Primary navigation grid (7 cards)**
   Exact list, in this order:
   - About
   - Practical Lessons
   - Prices & Packages
   - Theory Training
   - Reviews
   - Instructors
   - Contact

   Card spec (all identical):
   - 2-column grid, equal height, `rounded-2xl`, forest-green border, cream surface.
   - Centered icon (24px) above centered label (15px semibold), two lines max.
   - Uniform 16px page padding left/right, 12px gap.

3. **Condensed GSM Plus card**
   - Single compact card with gold "Coming Soon" chip, one-line pitch, "Learn more" arrow.
   - Roughly 1/3 the height of the current explainer; links to the existing GSM Plus landing page.

4. **Below-the-fold sections** (kept, tightened, in order)
   - Recent Passes strip (horizontal scroll of 6 photos, no big block).
   - Short reviews snippet (1 featured review + "See all reviews").
   - Footer contact block (phone + WhatsApp + address).

   Everything else that currently appears on `/` (Memorable Moments, About-GSM two-column, Areas grid, Signs/Hazard/Theory quiz teasers, gallery, install card, full GsmPlusExplainer) is hidden inside the native app to remove repetition. Nothing is deleted — the web still renders them.

### Visual & typography rules
- 16px symmetrical horizontal padding on every section.
- Section vertical rhythm: 24px between blocks (was 48-64px).
- Type scale: hero title 28px, section titles 18px, card labels 15px, body 14px.
- All cards share: `rounded-2xl`, `border-border/60`, `shadow-[0_2px_10px_-4px_rgba(29,42,34,0.15)]`, 88px min-height.
- Icons all 24px, forest-green stroke, terracotta on active/hover.

### Technical implementation
- New component `src/components/home/HomeNativeApp.tsx` containing the whole redesigned screen.
- `src/routes/index.tsx` reads `useIsNativeApp()` (hydration-safe: renders web layout during SSR, swaps to native layout on mount when detected). Zero changes to the existing web JSX branch.
- Reuses existing `trackContactClick`, `WhatsAppIcon`, gallery assets, and links to existing routes (`/about`, `/services`, `/pricing`, `/theory`, `/reviews`, `/instructors`, `/contact`, `/auth` for GSM Plus).
- No DB, no server function, no new dependency changes.

### Out of scope
- No changes to desktop or mobile-web home.
- No changes to Header, Footer, GSM Plus landing, or any other route.
- No new routes or backend work.
