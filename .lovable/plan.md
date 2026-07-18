
# Refinement Pass — Proposed Scope

Your list mixes quick fixes, medium redesigns, and multi-week AI/video products. I want to be honest about what I can ship in this pass vs. what needs its own project so we don't half-build the big features.

## Pass A — Ship now (this session, one commit, then publish)

**1. Critical bug fixes**
- `mailto:` links: audit Header, Footer, Contact, GSM Plus, Portal — ensure `href="mailto:…"` (not JS handlers) so the OS mail app opens; add `tel:` where used.
- Language selector: fix Google Translate init race + click handler on mobile; ensure the dropdown is keyboard/tap accessible and closes on outside click.
- Image zoom / lightbox: audit `Zoomable` usage across VRP diagrams, lesson animations, and gallery — make close button always visible (top-right, safe-area padded), add ESC + swipe-down close, and wrap missing images.
- Opening hours: single source of truth in `site_settings` — banner + detail block both read the same field.
- Contact link audit: sweep every `<a>`/`<Link>` for `#`, empty `href`, or stale routes; add a unit list to `tests/`.

**2. Homepage sticky section nav**
- Floating right-side dot nav on desktop, horizontal scroll-chip bar sticky under header on mobile.
- Sections: Why GSM, Areas, Theory, Hazard, Reviews, GSM Plus, Instructors, FAQ, Contact.
- Uses `IntersectionObserver` to highlight active section; smooth scroll.

**3. GSM Plus explainer block (moved higher on homepage)**
- New `GsmPlusExplainer` section placed just under the hero: "What is GSM Plus", "Who it's for", Free vs Premium comparison table, 11 feature cards (AI Lesson Notes, Interactive Lessons, Progress Tracking, Mock Tests, Hazard Perception, Road Signs, Highway Code, Lesson History, Vehicle Reference Points, Instructor Feedback, Future Lesson Planner) — cards link to the relevant portal route or a "Coming soon" state.

**4. Pricing page transparency**
- Replace the "contact for pricing" wall with a "from £45–£75/hr" band, a "what affects price" list (Instructor grade, Manual/Auto, Package size, Location), and keep the CTA to request a quote.

**5. Instructor cards upgraded**
- Extend `instructors` table with: `qualification` (ADI/PDI), `years_experience`, `languages` (text[]), `teaching_style`, `areas_covered` (text[]), `bio_long`.
- Migration + admin form fields + public `/instructors` and homepage card redesign.

**6. Blog — temporary hide**
- Feature-flag `blog_enabled` in `site_settings` (default off). Header + footer + sitemap hide `/blog` when off. Admin toggle in `/admin/site-settings`. When you have posts ready, flip the switch.

**7. FAQ consolidation**
- Move About-page FAQs into the main `/faq` page (single `faqs` table already exists). Remove the FAQ block from About and link to `/faq`.

## Pass B — Deferred (needs its own project, not this session)

I don't want to fake these — they're real product work:

- **8. Realistic AI hazard-perception clips** — generating dozens of 30–45s realistic UK dashcam videos with pedestrians/cyclists/weather is a video-production project (AI video costs, review pipeline, storage, DVSA-realistic quality bar). I'd build the video-player + admin upload pipeline first, then commission/generate clips as content.
- **9. Photorealistic VRP diagrams** — same problem: needs a photo shoot from inside the GSM teaching vehicle or high-quality 3D renders. I can wire realistic dashboard photo backgrounds behind the existing overlays once you provide 6–10 reference photos.
- **10. Full lesson-management schema** — topics/notes/AI summary/strengths/homework/next-objectives is a proper feature; needs its own table design, instructor UX, student view.
- **11. Lesson planner** — calendar sync (`.ics`), 48h cancel policy engine, reschedule requests → notifications. Needs booking model redesign.
- **12. AI lesson notes from dictation** — upload/dictate → transcribe (Lovable AI STT) → structured summary (Lovable AI) → save to lesson record. Depends on #10 existing first.
- **13. AI video library** — same shape as #8, driven by the video pipeline.

For Pass B, I'll write a follow-up roadmap doc once Pass A is live so we scope each properly.

## Pass C — QA sweep (end of this session)

Items 14 & 15: run through the site on mobile/tablet/desktop viewports, verify:
- Sticky nav doesn't overlap Back-to-Top or WhatsApp button
- New GSM Plus block scales cleanly
- All mailto/tel/link fixes verified
- Contrast + focus rings on new UI

Then publish.

## Why phased

Trying to ship 15 features in one turn produces 15 half-broken features. Pass A is the "premium polish" you asked for and unblocks Helena's feedback; Pass B is where the real GSM Plus platform lives.

**Reply "start Pass A"** and I'll begin with the critical bug fixes, then the homepage nav + GSM Plus explainer, then instructor/pricing/FAQ/blog — one commit, then publish for review.
