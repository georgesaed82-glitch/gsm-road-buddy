UPDATE public.theme_settings
SET published = jsonb_set(
  jsonb_set(
    published,
    '{colors,background}',
    '"oklch(0.937 0.037 45.3)"',
    true
  ),
  '{colors,card}',
  '"oklch(0.972 0.014 88)"',
  true
)
WHERE id = 1;