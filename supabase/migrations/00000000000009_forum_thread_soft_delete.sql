-- Add soft delete support for forum_threads
-- Also add RLS policy to hide deleted threads from non-admins

ALTER TABLE public.forum_threads ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Index for filtering out deleted threads efficiently
CREATE INDEX IF NOT EXISTS forum_threads_deleted_idx ON public.forum_threads(is_deleted) WHERE is_deleted = FALSE;

-- Update existing RLS: non-admins should not see deleted threads
-- We do this by adding a check to the existing read policy or creating a new one
-- The existing threads_read policy is: USING (auth.uid() IS NOT NULL)
-- We replace it with one that excludes deleted threads for non-admins

DROP POLICY IF EXISTS threads_read ON public.forum_threads;

CREATE POLICY threads_read
  ON public.forum_threads
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      is_deleted = FALSE
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator')
    )
  );
