UPDATE public.theme_settings
SET published = published
  || jsonb_build_object(
    'colors',
    COALESCE(published->'colors', '{}'::jsonb)
    || jsonb_build_object(
      'background',        'oklch(0.964 0.015 90.2)',
      'foreground',        'oklch(0.270 0.023 157.4)',
      'card',              'oklch(0.978 0.011 90)',
      'cardForeground',    'oklch(0.270 0.023 157.4)',
      'primary',           'oklch(0.377 0.059 158.9)',
      'primaryForeground', 'oklch(0.964 0.015 90.2)',
      'secondary',         'oklch(0.940 0.014 90)',
      'secondaryForeground','oklch(0.270 0.023 157.4)',
      'muted',             'oklch(0.930 0.012 90)',
      'mutedForeground',   'oklch(0.548 0.016 155.3)',
      'accent',            'oklch(0.651 0.121 51.3)',
      'accentForeground',  'oklch(0.978 0.011 90)',
      'border',            'oklch(0.885 0.012 90)',
      'ring',              'oklch(0.377 0.059 158.9)'
    )
  )
WHERE id = 1;