
-- Content versions (polymorphic snapshot store for autosave + version history)
CREATE TABLE public.content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_table TEXT NOT NULL,
  entity_id UUID NOT NULL,
  kind TEXT NOT NULL DEFAULT 'manual', -- 'autosave' | 'manual' | 'publish'
  label TEXT,
  snapshot JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX content_versions_entity_idx
  ON public.content_versions (entity_table, entity_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_versions TO authenticated;
GRANT ALL ON public.content_versions TO service_role;

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

-- Only admins (any admin_role_slug or master owner) can read/write versions
CREATE POLICY "Admins read content versions"
  ON public.content_versions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (COALESCE(p.is_master_owner, false) OR COALESCE(p.admin_role_slug, '') <> '')
    )
  );

CREATE POLICY "Admins write content versions"
  ON public.content_versions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (COALESCE(p.is_master_owner, false) OR COALESCE(p.admin_role_slug, '') <> '')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (COALESCE(p.is_master_owner, false) OR COALESCE(p.admin_role_slug, '') <> '')
    )
  );

-- Recycle bin support on home_sections
ALTER TABLE public.home_sections
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS home_sections_deleted_at_idx
  ON public.home_sections (deleted_at);
