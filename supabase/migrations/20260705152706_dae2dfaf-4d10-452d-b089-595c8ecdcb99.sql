
-- 1. theme_settings: single-row (id=1) draft + published token store
CREATE TABLE public.theme_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  draft JSONB NOT NULL DEFAULT '{}'::jsonb,
  published JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

GRANT SELECT ON public.theme_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.theme_settings TO authenticated;
GRANT ALL ON public.theme_settings TO service_role;

ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read theme"
  ON public.theme_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update theme"
  ON public.theme_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert theme"
  ON public.theme_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_theme_settings_updated_at
  BEFORE UPDATE ON public.theme_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed the single row with current defaults matching src/styles.css
INSERT INTO public.theme_settings (id, draft, published) VALUES (
  1,
  '{}'::jsonb,
  jsonb_build_object(
    'brand', jsonb_build_object(
      'name', 'GSM Driving School',
      'tagline', 'Notting Hill & West London',
      'logoUrl', '',
      'faviconUrl', ''
    ),
    'colors', jsonb_build_object(
      'background', 'oklch(0.97 0.01 95)',
      'foreground', 'oklch(0.25 0.03 155)',
      'card', 'oklch(0.99 0.005 95)',
      'cardForeground', 'oklch(0.25 0.03 155)',
      'primary', 'oklch(0.45 0.08 155)',
      'primaryForeground', 'oklch(0.97 0.01 95)',
      'secondary', 'oklch(0.94 0.02 95)',
      'secondaryForeground', 'oklch(0.25 0.03 155)',
      'accent', 'oklch(0.65 0.12 50)',
      'accentForeground', 'oklch(0.99 0.005 95)',
      'muted', 'oklch(0.93 0.01 95)',
      'mutedForeground', 'oklch(0.55 0.03 150)',
      'destructive', 'oklch(0.55 0.2 28)',
      'border', 'oklch(0.88 0.01 100)',
      'ring', 'oklch(0.45 0.08 155)'
    ),
    'typography', jsonb_build_object(
      'headingFont', 'Arial',
      'bodyFont', 'Arial',
      'baseSize', '16px',
      'headingWeight', '600'
    ),
    'buttons', jsonb_build_object(
      'radius', '0px',
      'weight', '600',
      'shadow', 'none',
      'uppercase', false
    ),
    'layout', jsonb_build_object(
      'radius', '0.75rem',
      'containerMaxWidth', '1200px',
      'sectionSpacing', '4rem',
      'cardBorder', '1px',
      'cardShadow', 'none'
    ),
    'header', jsonb_build_object(
      'sticky', true,
      'transparent', false,
      'showTagline', true
    ),
    'footer', jsonb_build_object(
      'showSocial', true,
      'showAreas', true,
      'copyright', '© GSM Driving School'
    ),
    'mobile', jsonb_build_object(
      'baseSize', '15px',
      'sectionSpacing', '2.5rem'
    )
  )
);

-- 2. brand_assets: reusable media library (logos, banners, icons, backgrounds)
CREATE TABLE public.brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'image',
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

GRANT SELECT ON public.brand_assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_assets TO authenticated;
GRANT ALL ON public.brand_assets TO service_role;

ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view brand assets"
  ON public.brand_assets FOR SELECT
  USING (true);

CREATE POLICY "Admins manage brand assets"
  ON public.brand_assets FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_brand_assets_updated_at
  BEFORE UPDATE ON public.brand_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_brand_assets_kind ON public.brand_assets(kind);
CREATE INDEX idx_brand_assets_created_at ON public.brand_assets(created_at DESC);
