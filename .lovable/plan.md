
## Goal

Make almost everything on gsmdrivingschool.com editable from `/admin` without touching code. Ship in phases so nothing breaks and you get value quickly.

## What you already have (no work needed)

Admin today already edits: signs, road markings, police signals, Highway Code topics, theory questions, George's tips (per topic), driving principles, memory tips, common fail reasons, reviews (all with image upload), plus admin accounts, access codes, email settings, hazard videos, traffic, contact clicks, PWA installs, diagnostics and errors.

The plan below is only the NEW work.

## Phase 1 — Site chrome + per-page SEO (foundation)

Highest impact, lowest risk. Everything else builds on the pattern.

- New table `site_settings` (single-row key/value JSON) for: business name, phone, WhatsApp, email, address, opening hours, social links (Facebook, Instagram, TikTok, YouTube), footer copy, disclaimer.
- New table `nav_items` (label, href, order, enabled, parent_id) for header and footer menus.
- New table `page_seo` (route path unique, title, description, og_title, og_description, canonical_override, og_image_path, noindex flag).
- New admin pages: `/admin/site-settings`, `/admin/navigation`, `/admin/seo`.
- Wire `Header.tsx`, `Footer.tsx`, `__root.tsx` and every route's `head()` to read from these tables (with in-code defaults as fallback so SSR/prerender never breaks).

## Phase 2 — Homepage sections with drag-and-drop reorder + enable/disable

- New table `home_sections` (id, kind enum: hero/reviews/quiz-theory/quiz-signs/quiz-hazard/gallery/booking/tips/faq/custom, order_index, enabled, data JSONB, updated_at).
- Admin page `/admin/homepage`: `@dnd-kit/sortable` list of sections. Toggle enabled, drag to reorder, click to open a per-kind editor with text + image fields.
- Refactor `src/routes/index.tsx` to render sections from this table in order. Each kind maps to its existing component; text/image inputs override the current hardcoded copy.
- Image uploads reuse the existing `content-images` bucket + upload server fn.

## Phase 3 — Instructors, lesson packages & pricing

- Tables `instructors` (name, photo, bio, phone, areas, active, order), `packages` (name, description, hours, price_pence, promo_price_pence, promo_ends_at, active, order), `promotions` (code, description, discount, starts/ends, active).
- Admin CRUD: `/admin/instructors`, `/admin/packages`, `/admin/promotions`.
- Refactor `/instructors` and `/pricing` routes to read from these tables.

## Phase 4 — Blog / driving tips + FAQs + downloadable files

- Tables `posts` (slug, title, excerpt, body markdown, cover_image, category enum: blog/news/tip, published, published_at, seo_title, seo_description), `faqs` (question, answer, category, order, enabled), `downloads` (title, description, storage_path, category, order).
- New public routes: `/blog`, `/blog/$slug`, `/tips`, `/tips/$slug`, `/faq`, `/downloads`.
- Admin CRUD: `/admin/posts`, `/admin/faqs`, `/admin/downloads` (new `downloads` storage bucket).
- Add posts to sitemap.xml.

## Phase 5 — Advanced (largest phase, split further if needed)

- **Theme editor** `/admin/theme`: form for brand primary/accent hex, heading font, body font, radius. Values written to `theme_settings` row, injected as CSS variables via a `<style>` tag in `__root.tsx`. Google-Fonts-via-@fontsource swap for font choice.
- **Change history + restore**: new `content_history` table; a shared server helper wraps every upsert so it writes the previous JSON into history keyed by `(entity_kind, entity_id, version, snapshot, changed_by, changed_at)`. Admin history viewer per entity with "Restore" button.
- **Email template editor** `/admin/email-templates`: table `email_templates` (key, subject, html_body, text_body, variables). Wire existing outbound emails (booking, contact, admin alerts) through a renderer that substitutes `{{name}}` etc. Templates auto-seeded from current hardcoded copy on first deploy.

## Explicitly not in scope

- **Extra roles (Instructor / Staff)**: you did not pick this. Everything stays admin-only. If you want it, we add it as Phase 6.
- **Add/edit/delete pages from admin**: routes stay file-based (they must, for SSR + type-safe routing). Instead you get per-page SEO + editable content on every existing page + a Blog/Tips CMS for new content. If you want a true "arbitrary new page" builder, that's an extra phase.

## Technical details (safe to skim)

- All new admin routes gated by the existing `_authenticated/admin` layout + `verifyAdminPasswordServer` on every mutation.
- All new public tables: `GRANT SELECT ... TO anon` only on rows marked published/enabled; `authenticated` gets full CRUD via RLS; `service_role` gets ALL.
- Public read paths use the server publishable client (per `tanstack-supabase-integration`), never `supabaseAdmin`.
- SSR head reads settings via a public server fn cached with TanStack Query so route `head()` stays static-render-safe.
- Hardcoded content stays in the repo as a fallback so a DB outage never blanks the site.

## Ballpark size

Phase 1: ~1 turn. Phase 2: 1-2 turns. Phase 3: 1-2 turns. Phase 4: 2 turns. Phase 5: 2-3 turns (may split). Rough total: 8–10 focused turns.

## What I need from you

1. Approve this plan.
2. Confirm I should start with **Phase 1 (site chrome + per-page SEO)**.
3. Anything on the "not in scope" list you actually want added?
