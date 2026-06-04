-- Add split name columns to gts_section_a for the tracer study
ALTER TABLE public.gts_section_a
  ADD COLUMN IF NOT EXISTS first_name  TEXT,
  ADD COLUMN IF NOT EXISTS middle_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name   TEXT;

-- Migrate existing full_name data into first_name as a safe fallback
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gts_section_a' AND column_name = 'full_name'
  ) THEN
    UPDATE public.gts_section_a
    SET first_name = COALESCE(full_name, '')
    WHERE first_name IS NULL OR first_name = '';
  END IF;
END $$;
