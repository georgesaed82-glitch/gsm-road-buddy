
CREATE TABLE public.home_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  section_type TEXT NOT NULL DEFAULT 'custom',
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  cta_primary_label TEXT NOT NULL DEFAULT '',
  cta_primary_href TEXT NOT NULL DEFAULT '',
  cta_secondary_label TEXT NOT NULL DEFAULT '',
  cta_secondary_href TEXT NOT NULL DEFAULT '',
  background TEXT NOT NULL DEFAULT 'default',
  layout TEXT NOT NULL DEFAULT 'default',
  extra JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'published',
  show_web BOOLEAN NOT NULL DEFAULT TRUE,
  show_app BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.home_sections TO anon;
GRANT SELECT ON public.home_sections TO authenticated;
GRANT ALL ON public.home_sections TO service_role;

ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published visible home sections"
  ON public.home_sections FOR SELECT
  USING (status = 'published' AND show_web = TRUE);

CREATE TRIGGER update_home_sections_updated_at
  BEFORE UPDATE ON public.home_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.home_sections (section_key, section_type, eyebrow, title, subtitle, body, sort_order) VALUES
  ('hero', 'hero', 'Notting Hill Gate · Holland Park · High Street Kensington · Bayswater', 'Drive today. Succeed tomorrow.', '', 'GSM Driving School has taught West London to drive since 2005 — practical lessons, theory prep and a full learner portal, from instructors who know these roads.', 10),
  ('why', 'why', 'Why GSM', 'Over 20 years'' experience, manual and automatic.', '', '', 20),
  ('postcodes', 'postcodes', 'Postcodes covered', '', '', '', 30),
  ('areas', 'areas', 'Driving lessons by area', 'Lessons in your West London postcode', '', '', 40),
  ('recent-pass', 'recent-pass', 'Recent pass', 'Another first-time pass. Another confident driver.', '', 'This is what success looks like at GSM — real students, real test centres, real certificates. We teach the skills, you earn the freedom.', 50),
  ('gallery', 'gallery', 'From our students', 'Pass certificates, smiles, and the GSM car.', '', '', 60),
  ('quizzes', 'quizzes', 'Free theory practice', 'Test yourself — right here.', '', 'This is a taster of the GSM Learner Portal. Every question in the full portal is explained the same way — answer, then a plain-English "why" — so you actually understand the road, not just memorise it. That''s how our students pass quicker.', 70),
  ('install-app', 'install-app', '', '', '', '', 80),
  ('portal', 'portal', 'The learner portal', 'Everything you need in one place.', '', 'Lesson notes, payment history, theory revision and hazard perception — synced from your instructor''s tablet after every session.', 90),
  ('cta', 'cta', '', 'Ready to start? Get in Touch.', '', '', 100);
