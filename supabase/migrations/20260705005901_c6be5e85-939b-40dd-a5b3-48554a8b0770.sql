
CREATE TABLE public.content_overrides (
  kind text NOT NULL,
  item_id text NOT NULL,
  name text,
  description text,
  group_slug text,
  image_path text,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (kind, item_id),
  CONSTRAINT content_overrides_kind_check CHECK (kind IN ('sign','marking','signal'))
);

GRANT SELECT ON public.content_overrides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_overrides TO authenticated;
GRANT ALL ON public.content_overrides TO service_role;

ALTER TABLE public.content_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read content overrides"
  ON public.content_overrides FOR SELECT USING (true);

CREATE POLICY "Admins can insert content overrides"
  ON public.content_overrides FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update content overrides"
  ON public.content_overrides FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content overrides"
  ON public.content_overrides FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER content_overrides_set_updated_at
  BEFORE UPDATE ON public.content_overrides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage policies for content-images (private bucket; reads go through signed URLs)
CREATE POLICY "Admins can read content-images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload content-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update content-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'));
