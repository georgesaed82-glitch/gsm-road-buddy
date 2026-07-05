
-- Instructors
CREATE TABLE public.instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Instructor',
  bio TEXT NOT NULL DEFAULT '',
  initials TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'bg-primary/10 text-primary',
  rating NUMERIC(3,2),
  reviews INT DEFAULT 0,
  location TEXT DEFAULT '',
  badges TEXT[] NOT NULL DEFAULT '{}',
  cta_href TEXT NOT NULL DEFAULT '/contact',
  image_path TEXT,
  order_index INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.instructors TO anon, authenticated;
GRANT ALL ON public.instructors TO service_role;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read enabled instructors"
  ON public.instructors FOR SELECT
  USING (enabled = true);
CREATE POLICY "Admins can read all instructors"
  ON public.instructors FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage instructors"
  ON public.instructors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER instructors_set_updated_at
  BEFORE UPDATE ON public.instructors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Packages (pricing)
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  features TEXT[] NOT NULL DEFAULT '{}',
  cta_label TEXT NOT NULL DEFAULT 'WhatsApp us',
  popular BOOLEAN NOT NULL DEFAULT false,
  order_index INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.packages TO anon, authenticated;
GRANT ALL ON public.packages TO service_role;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read enabled packages"
  ON public.packages FOR SELECT
  USING (enabled = true);
CREATE POLICY "Admins can read all packages"
  ON public.packages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage packages"
  ON public.packages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER packages_set_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed with existing hardcoded values so the site keeps looking identical.
INSERT INTO public.instructors (name, role, bio, initials, color, rating, reviews, location, badges, order_index) VALUES
  ('Mark Johnson','Senior instructor','12 years experience, specialises in nervous learners and test preparation.','MJ','bg-primary/10 text-primary',4.9,120,'North DC',ARRAY['DVSA approved','Manual'],0),
  ('Aisha Patel','Instructor','Patient and encouraging. Helps students build confidence quickly in busy traffic.','AP','bg-accent text-accent-foreground',5.0,94,'East DC',ARRAY['DVSA approved','Automatic'],1),
  ('David Chen','Instructor','Focuses on defensive driving and motorway confidence for refresher students.','DC','bg-secondary text-secondary-foreground',4.8,76,'South DC',ARRAY['DVSA approved','Manual'],2),
  ('Emma Wilson','Instructor','Great with first-time drivers. Creates a calm, supportive learning environment.','EW','bg-primary/10 text-primary',4.9,108,'West DC',ARRAY['DVSA approved','Automatic'],3);

INSERT INTO public.packages (name, duration, description, features, cta_label, popular, order_index) VALUES
  ('Single lessons','2 hours','Perfect for an assessment, refresher, or booking as you go.',
    ARRAY['2 hours 1-to-1 tuition','Flexible location','Progress feedback','Pay-as-you-go'],'WhatsApp us',false,0),
  ('Twelve-hour packages','12 hours','A structured block of lessons to build real confidence.',
    ARRAY['12 hours 1-to-1 tuition','Flexible location','Progress feedback','Discount bundle rate'],'WhatsApp us',true,1),
  ('Intense packages','Intensive','Fast-track learning for learners who want to pass quickly.',
    ARRAY['Concentrated 1-to-1 tuition','Flexible location','Progress feedback','Discount bundle rate'],'WhatsApp us',false,2),
  ('Weekend packages','Weekend','Saturday and Sunday sessions that fit around work or study.',
    ARRAY['Weekend 1-to-1 tuition','Flexible location','Progress feedback','Discount bundle rate'],'WhatsApp us',false,3),
  ('Refresher packages','Refresher','Rebuild confidence after a break or returning to driving.',
    ARRAY['Tailored 1-to-1 tuition','Flexible location','Progress feedback','Discount bundle rate'],'WhatsApp us',false,4),
  ('Pass Plus','Pass Plus','Advanced modules for motorway, night and all-weather driving.',
    ARRAY['Pass Plus 1-to-1 tuition','Flexible location','Progress feedback','Insurance discount potential'],'WhatsApp us',false,5);
