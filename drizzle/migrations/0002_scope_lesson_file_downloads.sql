DROP POLICY IF EXISTS "gsm_learning_assets_read_auth" ON storage.objects;
CREATE POLICY "gsm_learning_assets_read_auth"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'learning-assets'
  AND (
    owner_id = (SELECT auth.uid()::text)
    OR public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM public.learning_assets la
      WHERE la.storage_path = storage.objects.name
        AND (
          la.uploaded_by = (SELECT auth.uid())
          OR EXISTS (
            SELECT 1
            FROM public.learning_modules lm
            WHERE lm.cover_asset_id = la.id
              AND lm.is_published = true
          )
          OR EXISTS (
            SELECT 1
            FROM public.lesson_blocks lb
            JOIN public.learning_lessons ll ON ll.id = lb.lesson_id
            JOIN public.learning_topics lt ON lt.id = ll.topic_id
            JOIN public.learning_modules lm ON lm.id = lt.module_id
            WHERE lb.asset_id = la.id
              AND ll.is_published = true
              AND lt.is_published = true
              AND lm.is_published = true
          )
        )
    )
  )
);

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
      WHERE hc.enabled = true
        AND (
          hcv.video_path = storage.objects.name
          OR hcv.poster_path = storage.objects.name
        )
    )
  )
);