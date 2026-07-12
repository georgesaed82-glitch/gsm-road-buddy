
CREATE TABLE public.student_pass_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_path text,
  image_url text,
  caption text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.student_pass_photos TO anon, authenticated;
GRANT ALL ON public.student_pass_photos TO service_role;

ALTER TABLE public.student_pass_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view enabled student pass photos"
  ON public.student_pass_photos
  FOR SELECT
  TO anon, authenticated
  USING (enabled = true);

CREATE TRIGGER student_pass_photos_set_updated_at
  BEFORE UPDATE ON public.student_pass_photos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX student_pass_photos_order_idx
  ON public.student_pass_photos (order_index ASC, created_at DESC);
