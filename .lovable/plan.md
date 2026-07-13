## Website & Content Manager — phased plan

This is a very large build (roughly 6–10 focused phases). Attempting it in one update would almost certainly break parts of the live site, which you explicitly asked me to avoid. I'll ship it in safe phases behind the existing Admin dashboard, each phase self-contained and reversible, without touching the live public site until you approve each Publish step.

You already have working CMS foundations I'll build on rather than duplicate:

- Home sections editor (`admin.home`) — draft / published / hidden, per-surface (web/app), sort order, media upload
- Lessons CMS (`admin.lessons`), Theory CMS (`admin.theory`), Road signs / markings / police signals admins
- Content overrides (`admin.content`), Page SEO (`admin.seo`), Navigation (`admin.navigation`), Legal pages, Blog, FAQs, Reviews, Instructors, Pricing, Areas, Downloads
- Theme editor (`admin.theme`), Site settings, Home blocks
- RBAC (Master Owner + role permissions + audit log), Email logs, Error logs
- Storage buckets: `content-images`, `downloads`, `hazard-clips`

### Phased scope

**Phase 1 — Website & Content Manager hub + Media Library (this turn if approved)**
- New `/admin/website` hub route that groups every existing editor (Home sections, Content overrides, Navigation, SEO, Theme, Legal, Blog, FAQs, Reviews, Instructors, Pricing, Areas, Downloads, Student passes) into one clearly labelled dashboard with search.
- New Media Library (`/admin/media`) backed by the existing `content-images` bucket: upload (with client-side compression), replace, delete, rename, alt-text + description, tag/filter, copy URL, insert-into-editor picker. Server-side thumbnails via signed URLs.
- Permission gate: Master Owner full; other admins only see sections their `admin_role_permissions` allow (already enforced server-side; UI hides the rest).
- No changes to public site.

**Phase 2 — Rich text + section editor upgrades**
- Upgrade Home section body/subtitle fields to a rich editor (bold, lists, links, headings) with live desktop/tablet/mobile preview panes.
- Draft autosave (debounced) + explicit Save Draft / Publish Now / Schedule (uses a `publish_at` column) / Unpublish.
- Version history table (`content_versions`) with restore; confirmation dialog before permanent delete; a Recycle Bin (soft-delete flag + purge after 30 days).

**Phase 3 — Page builder (drag-and-drop)**
- Reorder Home sections via drag handle (extends existing `reorderHomeSection`).
- Duplicate / hide / archive controls surfaced consistently across every CMS list.
- Per-breakpoint (desktop / tablet / mobile) visibility toggles on each section.

**Phase 4 — Training Content Manager**
- Extend the Lessons CMS schema with structured fields: What / Why / When / Where / How / Reference points / Common mistakes / Diagrams / Animation / Quiz / Summary / Instructor-only notes / Learner-visible content.
- Attach media from the Media Library; upload PDFs/worksheets to `downloads` bucket; per-lesson quiz editor already exists in theory CMS and will be reused.
- Draft/Published/Hidden/Archived status, categories, tags, search.

**Phase 5 — Custom pages**
- New `custom_pages` table + dynamic route `/p/$slug`. Master Owner can create, choose menu placement (header/mobile/portal/private), and edit with the same rich editor + media picker.

**Phase 6 — Fine-grained instructor permissions**
- UI in `admin.access` to grant instructors edit rights on specific sections only (already supported by `admin_role_permissions`; needs the assignment UX). Sensitive areas (payments, security, users, publishing) remain Master-Owner-only.

**Phase 7 — QA + Publish**
- Cross-browser / device pass, image optimisation audit (server-side WebP + width variants for the Media Library), permission smoke tests, then publish.

### What I will NOT do

- Ship a live-website "visual page builder" that lets you drag any DOM node anywhere — that requires rewriting every page as JSON-driven blocks, and would risk the current design. Instead, each page keeps its React layout and exposes its editable fields through the CMS (as Home already does). If later you want a specific page (e.g. About, Services) fully block-based, that's a follow-up phase per page.
- Overwrite any current content. All new tables are additive; existing content stays live until you press Publish on the new version.

### Technical notes

- Storage: `content-images` for pictures, new `content-media` (private, signed URLs) for video/GIF/MP4, `downloads` for PDFs.
- New tables: `content_versions` (polymorphic: entity_table, entity_id, snapshot jsonb, created_by, created_at), `custom_pages`, `media_assets` (id, path, mime, size, width, height, alt, description, tags[], uploaded_by, deleted_at).
- All new tables: GRANTs + RLS scoped to authenticated admins via `has_permission()`; service_role for edge writes.
- Client-side image compression via `browser-image-compression` before upload; server-side rejects > 20 MB.
- Autosave: debounced 1.5 s, stored as latest draft snapshot in `content_versions`.

### Confirm scope

Reply with either:

1. **"Start Phase 1"** — I'll build the hub + Media Library now, no public-site changes.
2. **A different starting point** — e.g. "Skip to Training Content Manager" or "Media Library only".
3. **Adjust the plan** — tell me what to add/remove/reorder.

Once Phase 1 is merged, I'll ask again before Phase 2.
