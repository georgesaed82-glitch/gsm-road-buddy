-- Extend content_overrides to support arbitrary editable page blocks
ALTER TABLE public.content_overrides DROP CONSTRAINT content_overrides_kind_check;
ALTER TABLE public.content_overrides ADD CONSTRAINT content_overrides_kind_check
  CHECK (kind = ANY (ARRAY[
    'sign','marking','signal','highway','georges-tip','georges-principle',
    'memory-tip','common-fail','review','page-block'
  ]));

-- Legal pages CMS
CREATE TABLE public.legal_pages (
  slug text PRIMARY KEY,
  title text NOT NULL,
  body_markdown text NOT NULL DEFAULT '',
  seo_title text,
  seo_description text,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.legal_pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.legal_pages TO authenticated;
GRANT ALL ON public.legal_pages TO service_role;

ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read enabled legal pages" ON public.legal_pages
  FOR SELECT USING (true);
CREATE POLICY "Admins insert legal pages" ON public.legal_pages
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update legal pages" ON public.legal_pages
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete legal pages" ON public.legal_pages
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER legal_pages_touch BEFORE UPDATE ON public.legal_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed the standard legal pages
INSERT INTO public.legal_pages (slug, title, body_markdown, sort_order) VALUES
  ('privacy', 'Privacy Policy', '# Privacy Policy\n\nEdit this content from Admin → Legal.', 1),
  ('terms', 'Terms of Service', '# Terms of Service\n\nEdit this content from Admin → Legal.', 2),
  ('cookies', 'Cookie Policy', '# Cookie Policy\n\nEdit this content from Admin → Legal.', 3)
ON CONFLICT (slug) DO NOTHING;

-- Seed site_settings keys for global rating + AI prompts + cookie banner if not present
INSERT INTO public.site_settings (key, value) VALUES
  ('site_rating', '{"rating": 5.0, "review_count": 143, "show": true}'::jsonb),
  ('ai_chat', '{"welcome": "Hi! I''m the GSM Driving School assistant. Ask me about lessons, pricing or the driving test.", "prompts": ["What packages do you offer?", "How much are lessons?", "Do you cover my area?", "How do I book a lesson?"]}'::jsonb),
  ('cookie_banner', '{"enabled": true, "message": "We use cookies to improve your experience.", "accept_label": "Accept", "decline_label": "Decline", "policy_href": "/legal/cookies"}'::jsonb)
ON CONFLICT (key) DO NOTHING;