-- BU Alumni Tracer Study — Admin-configurable graduation year range
-- Controls the years shown in the survey "Year Graduated" and signup "Batch Year" dropdowns.

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS graduation_year_min INTEGER DEFAULT 1950,
  ADD COLUMN IF NOT EXISTS graduation_year_max INTEGER DEFAULT 2026;

-- Initialize the existing singleton row with sensible defaults.
-- Uses the current year as the upper bound if the column was just added.
UPDATE public.site_settings
SET
  graduation_year_min = COALESCE(graduation_year_min, 1950),
  graduation_year_max = COALESCE(graduation_year_max, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  updated_at = NOW()
WHERE id = 1;

-- Only admins and moderators can write site_settings (already covered by existing policy),
-- but ensure the read policy exists for signed-in users.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_settings'
      AND policyname = 'site_settings_read'
  ) THEN
    CREATE POLICY "site_settings_read"
      ON public.site_settings
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;
