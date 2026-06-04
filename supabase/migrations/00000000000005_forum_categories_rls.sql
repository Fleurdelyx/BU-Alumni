-- Fix: Enable RLS on forum_categories (Supabase Security Advisor flagged this)
-- forum_categories was the only forum table missing RLS

ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

-- All signed-in users can read categories
CREATE POLICY "categories_read"
  ON public.forum_categories
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins and moderators can modify categories
CREATE POLICY "categories_write"
  ON public.forum_categories
  FOR ALL
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator')
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator')
  );
