DROP POLICY IF EXISTS ai_videos_storage_read ON storage.objects;

CREATE POLICY ai_videos_storage_read ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'ai-videos'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR owner = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.ai_videos v
      WHERE v.storage_path = storage.objects.name
        AND (
          v.status = 'approved'::ai_video_status
          OR v.uploaded_by = auth.uid()
        )
    )
  )
);