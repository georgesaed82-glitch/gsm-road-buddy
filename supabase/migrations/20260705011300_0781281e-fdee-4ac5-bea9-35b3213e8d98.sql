
ALTER TABLE public.content_overrides
  ADD COLUMN IF NOT EXISTS key_points text[],
  ADD COLUMN IF NOT EXISTS topics text[];

ALTER TABLE public.content_overrides DROP CONSTRAINT IF EXISTS content_overrides_kind_check;
ALTER TABLE public.content_overrides
  ADD CONSTRAINT content_overrides_kind_check
  CHECK (kind IN ('sign','marking','signal','highway'));
