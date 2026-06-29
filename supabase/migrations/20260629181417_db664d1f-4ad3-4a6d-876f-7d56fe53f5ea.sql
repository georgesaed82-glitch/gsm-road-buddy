
CREATE TABLE public.hazard_clip_videos (
  clip_slug text PRIMARY KEY,
  video_path text NOT NULL,
  poster_path text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hazard_clip_videos TO authenticated;
GRANT ALL ON public.hazard_clip_videos TO service_role;

ALTER TABLE public.hazard_clip_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read clip videos"
  ON public.hazard_clip_videos FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins can insert clip videos"
  ON public.hazard_clip_videos FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update clip videos"
  ON public.hazard_clip_videos FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete clip videos"
  ON public.hazard_clip_videos FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can read hazard clip files"
  ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'hazard-clips');

CREATE POLICY "Admins can upload hazard clip files"
  ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'hazard-clips' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update hazard clip files"
  ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'hazard-clips' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete hazard clip files"
  ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'hazard-clips' AND public.has_role(auth.uid(), 'admin'));
