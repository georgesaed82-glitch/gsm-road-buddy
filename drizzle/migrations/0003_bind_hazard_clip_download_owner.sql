DROP POLICY IF EXISTS "Authenticated can read hazard clip files" ON storage.objects;
CREATE POLICY "Authenticated can read hazard clip files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'hazard-clips'
  AND (
    owner_id = (SELECT auth.uid()::text)
    OR public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM public.hazard_clip_videos hcv
      JOIN public.hazard_clips hc ON hc.slug = hcv.clip_slug
      WHERE (
          hcv.video_path = storage.objects.name
          OR hcv.poster_path = storage.objects.name
        )
        AND (
          hcv.updated_by = (SELECT auth.uid())
          OR hc.enabled = true
        )
    )
  )
);