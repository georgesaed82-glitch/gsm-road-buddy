
ALTER TYPE public.lesson_block_kind ADD VALUE IF NOT EXISTS 'ai_video';
ALTER TYPE public.lesson_block_kind ADD VALUE IF NOT EXISTS 'interactive_animation';
ALTER TYPE public.lesson_block_kind ADD VALUE IF NOT EXISTS 'quiz_true_false';
ALTER TYPE public.lesson_block_kind ADD VALUE IF NOT EXISTS 'drag_drop';
ALTER TYPE public.lesson_block_kind ADD VALUE IF NOT EXISTS 'hotspot';
ALTER TYPE public.lesson_block_kind ADD VALUE IF NOT EXISTS 'scenario_challenge';
ALTER TYPE public.lesson_block_kind ADD VALUE IF NOT EXISTS 'callout';
ALTER TYPE public.lesson_block_kind ADD VALUE IF NOT EXISTS 'highway_code_rule';
ALTER TYPE public.lesson_block_kind ADD VALUE IF NOT EXISTS 'road_sign';
ALTER TYPE public.lesson_block_kind ADD VALUE IF NOT EXISTS 'road_marking';
ALTER TYPE public.lesson_block_kind ADD VALUE IF NOT EXISTS 'vehicle_controls';
ALTER TYPE public.lesson_block_kind ADD VALUE IF NOT EXISTS 'hazard_clip';
ALTER TYPE public.lesson_block_kind ADD VALUE IF NOT EXISTS 'driving_test_tip';
ALTER TYPE public.lesson_block_kind ADD VALUE IF NOT EXISTS 'summary';
ALTER TYPE public.lesson_block_kind ADD VALUE IF NOT EXISTS 'progress_check';
ALTER TYPE public.lesson_block_kind ADD VALUE IF NOT EXISTS 'downloadable_pdf';

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'senior_instructor';
