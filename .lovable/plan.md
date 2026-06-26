## GSM Driving School — Full App Plan

### Phase 1: Foundation & Design
- Define a distinctive design system in `src/styles.css` (color tokens, typography, spacing, component variants) so the app looks polished and on-brand.
- Generate hero/brand imagery for the driving school.
- Add shared layout components: Header, Footer, and mobile navigation.

### Phase 2: Database & Auth (Lovable Cloud)
- Configure email/password + Google sign-in.
- Create migrations:
  - `profiles` (students & staff, linked to `auth.users`)
  - `instructors` (bio, photo, license, car, active status)
  - `packages` (lesson count, duration, price, category)
  - `availability` (instructor free slots)
  - `bookings` (student, instructor, package, scheduled time, status, notes)
  - `user_roles` for admin/instructor/student access control
- Enable RLS and GRANTs on every public table.
- Seed sample instructors and packages.

### Phase 3: Public Marketing Site
- `src/routes/index.tsx` — Hero, key stats, trusted-by/logos, CTA to booking.
- `src/routes/services.tsx` — Packages and what each lesson covers.
- `src/routes/instructors.tsx` — Instructor profiles and availability preview.
- `src/routes/pricing.tsx` — Package comparison table.
- `src/routes/contact.tsx` — Contact form with validation.
- `src/routes/about.tsx` — School story, safety stats, FAQ.
- `sitemap.xml` and `robots.txt` for SEO.

### Phase 4: Online Lesson Booking (core feature)
- Student sign-up/sign-in.
- `/booking` route: choose package → choose instructor → pick date/time from availability → confirm.
- Server function to create a booking, decrement the package balance, and block the slot.
- Student dashboard showing upcoming and past lessons.
- Confirmation state + email-style summary page.

### Phase 5: Instructor & Admin Dashboards
- Instructor view: see my upcoming schedule, mark attendance/notes.
- Admin view: manage instructors, packages, availability, bookings, and basic analytics.
- Role-based access via `user_roles` + RLS policies.

### Phase 6: Polish
- Toast notifications, loading states, form validation, error boundaries.
- Responsive/mobile-first UI (your current viewport is mobile).
- Security scan + final build verification.

### Deliverables
- A deployable, full-stack driving school app.
- Public-facing site + authenticated booking + instructor/admin dashboards.
- Clean design system ready for future iterations.