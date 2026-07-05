
-- site_settings: single-row key/value store for site-wide config
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings public read" ON public.site_settings FOR SELECT USING (true);

-- nav_items: header + footer menu items
CREATE TABLE public.nav_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL CHECK (location IN ('header', 'footer-primary', 'footer-secondary', 'portal')),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  icon TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX nav_items_location_order ON public.nav_items(location, order_index);
GRANT SELECT ON public.nav_items TO anon, authenticated;
GRANT ALL ON public.nav_items TO service_role;
ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nav_items public read" ON public.nav_items FOR SELECT USING (enabled = true);

-- page_seo: per-route SEO overrides
CREATE TABLE public.page_seo (
  route TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_path TEXT,
  canonical_override TEXT,
  noindex BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.page_seo TO anon, authenticated;
GRANT ALL ON public.page_seo TO service_role;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "page_seo public read" ON public.page_seo FOR SELECT USING (true);

-- Shared updated_at trigger
CREATE TRIGGER site_settings_touch BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER nav_items_touch BEFORE UPDATE ON public.nav_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER page_seo_touch BEFORE UPDATE ON public.page_seo
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed defaults from current hardcoded values
INSERT INTO public.site_settings (key, value) VALUES
  ('business', jsonb_build_object(
    'name', 'GSM Driving School',
    'tagline', 'George''s School of Motoring · Established 2005',
    'phone', '07961 585231',
    'phone_intl', '447961585231',
    'email', 'gsmdrivingschool@outlook.com',
    'address', ''
  )),
  ('opening_hours', jsonb_build_object(
    'mon', '7:00–20:00', 'tue', '7:00–20:00', 'wed', '7:00–20:00',
    'thu', '7:00–20:00', 'fri', '7:00–20:00', 'sat', '8:00–18:00', 'sun', 'Closed'
  )),
  ('social', jsonb_build_object(
    'facebook', '', 'instagram', '', 'tiktok', '', 'youtube', ''
  )),
  ('footer', jsonb_build_object(
    'copy', '',
    'disclaimer', ''
  ));

INSERT INTO public.nav_items (location, label, href, order_index) VALUES
  ('header', 'About', '/about', 10),
  ('header', 'Practical', '/services', 20),
  ('header', 'Pricing', '/pricing', 30),
  ('header', 'Reviews', '/reviews', 40),
  ('header', 'Contact', '/contact', 50);
