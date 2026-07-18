
-- Storage RLS for ai-videos bucket
CREATE POLICY "ai_videos_storage_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'ai-videos');

CREATE POLICY "ai_videos_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'ai-videos'
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'senior_instructor'::app_role)
    )
  );

CREATE POLICY "ai_videos_storage_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'ai-videos'
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR (
        public.has_role(auth.uid(), 'senior_instructor'::app_role)
        AND owner = auth.uid()
      )
    )
  );

CREATE POLICY "ai_videos_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'ai-videos'
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR (
        public.has_role(auth.uid(), 'senior_instructor'::app_role)
        AND owner = auth.uid()
      )
    )
  );

-- Helper: atomic view counter for approved videos
CREATE OR REPLACE FUNCTION public.increment_ai_video_view(_video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ai_videos
     SET view_count = view_count + 1
   WHERE id = _video_id AND status = 'approved';
END;
$$;

REVOKE ALL ON FUNCTION public.increment_ai_video_view(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_ai_video_view(uuid) TO authenticated;
