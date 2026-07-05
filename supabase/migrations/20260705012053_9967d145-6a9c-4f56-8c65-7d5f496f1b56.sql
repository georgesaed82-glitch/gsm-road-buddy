
ALTER TABLE public.content_overrides
  ADD COLUMN IF NOT EXISTS data jsonb;

ALTER TABLE public.content_overrides DROP CONSTRAINT IF EXISTS content_overrides_kind_check;
ALTER TABLE public.content_overrides
  ADD CONSTRAINT content_overrides_kind_check
  CHECK (kind IN (
    'sign','marking','signal','highway',
    'georges-tip','georges-principle','memory-tip','common-fail','review'
  ));
