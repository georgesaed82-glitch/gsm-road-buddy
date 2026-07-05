ALTER TABLE public.content_overrides
  ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_content_overrides_kind_sort
  ON public.content_overrides (kind, sort_order);