
CREATE TABLE IF NOT EXISTS public.lesson_block_videos (
  block_id uuid NOT NULL REFERENCES public.lesson_blocks(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.ai_videos(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (block_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_lbv_block ON public.lesson_block_videos (block_id, position);
CREATE INDEX IF NOT EXISTS idx_lbv_video ON public.lesson_block_videos (video_id);

GRANT SELECT ON public.lesson_block_videos TO authenticated;
GRANT ALL ON public.lesson_block_videos TO service_role;

ALTER TABLE public.lesson_block_videos ENABLE ROW LEVEL SECURITY;

-- Any signed-in user can read attachments; the AI video's own RLS still
-- gates what they can actually resolve from ai_videos.
CREATE POLICY "lbv_read_auth" ON public.lesson_block_videos
  FOR SELECT TO authenticated USING (true);

-- Admins and senior instructors manage attachments via server functions;
-- writes only ever happen with the service role, so we intentionally do
-- not add write policies for authenticated.
