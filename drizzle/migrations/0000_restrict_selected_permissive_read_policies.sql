-- Public website settings: expose only explicitly public records.
DROP POLICY "site_settings public read" ON public.site_settings;
CREATE POLICY "site_settings public read" ON public.site_settings
FOR SELECT TO anon, authenticated
USING (key IN ('business', 'social', 'opening_hours', 'footer', 'site_rating', 'cookie_banner', 'ai_chat'));

DROP POLICY "page_seo public read" ON public.page_seo;
CREATE POLICY "page_seo public read" ON public.page_seo
FOR SELECT TO anon, authenticated
USING (noindex = false);

DROP POLICY "Anyone can read enabled legal pages" ON public.legal_pages;
CREATE POLICY "Anyone can read enabled legal pages" ON public.legal_pages
FOR SELECT TO anon, authenticated
USING (enabled = true);

DROP POLICY "Public can view categories" ON public.blog_categories;
CREATE POLICY "Public can view categories" ON public.blog_categories
FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.blog_posts bp
    WHERE bp.category_id = blog_categories.id
      AND bp.published = true
  )
);

-- Brand asset metadata belongs to its uploader; admins retain their ALL policy.
DROP POLICY "Anyone can view brand assets" ON public.brand_assets;
CREATE POLICY "Anyone can view brand assets" ON public.brand_assets
FOR SELECT TO authenticated
USING (created_by = auth.uid());

-- The singleton published theme is public, but draft/admin columns are not.
DROP POLICY "Anyone can read theme" ON public.theme_settings;
CREATE POLICY "Anyone can read theme" ON public.theme_settings
FOR SELECT TO anon, authenticated
USING (id = 1);
REVOKE SELECT ON TABLE public.theme_settings FROM anon, authenticated;
GRANT SELECT (id, published, updated_at) ON public.theme_settings TO anon, authenticated;

-- Learning content: signed-in users see published material, not every draft.
DROP POLICY "learning_modules_read_auth" ON public.learning_modules;
CREATE POLICY "learning_modules_read_auth" ON public.learning_modules
FOR SELECT TO authenticated
USING (is_published = true);

DROP POLICY "learning_topics_read_auth" ON public.learning_topics;
CREATE POLICY "learning_topics_read_auth" ON public.learning_topics
FOR SELECT TO authenticated
USING (
  is_published = true
  AND EXISTS (
    SELECT 1 FROM public.learning_modules lm
    WHERE lm.id = learning_topics.module_id
      AND lm.is_published = true
  )
);

DROP POLICY "lesson_blocks_read_auth" ON public.lesson_blocks;
CREATE POLICY "lesson_blocks_read_auth" ON public.lesson_blocks
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.learning_lessons ll
    JOIN public.learning_topics lt ON lt.id = ll.topic_id
    JOIN public.learning_modules lm ON lm.id = lt.module_id
    WHERE ll.id = lesson_blocks.lesson_id
      AND ll.is_published = true
      AND lt.is_published = true
      AND lm.is_published = true
  )
);

DROP POLICY "lbv_read_auth" ON public.lesson_block_videos;
CREATE POLICY "lbv_read_auth" ON public.lesson_block_videos
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR (
    EXISTS (
      SELECT 1
      FROM public.lesson_blocks lb
      JOIN public.learning_lessons ll ON ll.id = lb.lesson_id
      JOIN public.learning_topics lt ON lt.id = ll.topic_id
      JOIN public.learning_modules lm ON lm.id = lt.module_id
      WHERE lb.id = lesson_block_videos.block_id
        AND ll.is_published = true
        AND lt.is_published = true
        AND lm.is_published = true
    )
    AND EXISTS (
      SELECT 1 FROM public.ai_videos av
      WHERE av.id = lesson_block_videos.video_id
        AND av.status = 'approved'::public.ai_video_status
    )
  )
);

DROP POLICY "lesson_quizzes_read_auth" ON public.lesson_quizzes;
CREATE POLICY "lesson_quizzes_read_auth" ON public.lesson_quizzes
FOR SELECT TO authenticated
USING (
  (
    lesson_quizzes.lesson_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.learning_lessons ll
      JOIN public.learning_topics lt ON lt.id = ll.topic_id
      JOIN public.learning_modules lm ON lm.id = lt.module_id
      WHERE ll.id = lesson_quizzes.lesson_id
        AND ll.is_published = true
        AND lt.is_published = true
        AND lm.is_published = true
    )
  )
  OR (
    lesson_quizzes.topic_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.learning_topics lt
      JOIN public.learning_modules lm ON lm.id = lt.module_id
      WHERE lt.id = lesson_quizzes.topic_id
        AND lt.is_published = true
        AND lm.is_published = true
    )
  )
);

DROP POLICY "quiz_questions_read_auth" ON public.quiz_questions;
CREATE POLICY "quiz_questions_read_auth" ON public.quiz_questions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.lesson_quizzes lq
    LEFT JOIN public.learning_lessons ll ON ll.id = lq.lesson_id
    LEFT JOIN public.learning_topics lt ON lt.id = COALESCE(lq.topic_id, ll.topic_id)
    LEFT JOIN public.learning_modules lm ON lm.id = lt.module_id
    WHERE lq.id = quiz_questions.quiz_id
      AND (lq.lesson_id IS NULL OR ll.is_published = true)
      AND lt.is_published = true
      AND lm.is_published = true
  )
);

DROP POLICY "learning_assets_read_auth" ON public.learning_assets;
CREATE POLICY "learning_assets_read_auth" ON public.learning_assets
FOR SELECT TO authenticated
USING (
  uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.learning_modules lm
    WHERE lm.cover_asset_id = learning_assets.id
      AND lm.is_published = true
  )
  OR EXISTS (
    SELECT 1
    FROM public.lesson_blocks lb
    JOIN public.learning_lessons ll ON ll.id = lb.lesson_id
    JOIN public.learning_topics lt ON lt.id = ll.topic_id
    JOIN public.learning_modules lm ON lm.id = lt.module_id
    WHERE lb.asset_id = learning_assets.id
      AND ll.is_published = true
      AND lt.is_published = true
      AND lm.is_published = true
  )
);

DROP POLICY "ar_read_auth" ON public.achievement_rules;
CREATE POLICY "ar_read_auth" ON public.achievement_rules
FOR SELECT TO authenticated
USING (is_active = true);

DROP POLICY "Authenticated can read clip videos" ON public.hazard_clip_videos;
CREATE POLICY "Authenticated can read clip videos" ON public.hazard_clip_videos
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (
    SELECT 1 FROM public.hazard_clips hc
    WHERE hc.slug = hazard_clip_videos.clip_slug
      AND hc.enabled = true
  )
);