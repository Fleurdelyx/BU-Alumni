-- BU Alumni Tracer Study — Site-wide settings table
-- Used by both Web and Admin apps for shared configuration.

CREATE TABLE IF NOT EXISTS public.site_settings (
  id                          INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  restrict_email_domain       BOOLEAN DEFAULT FALSE,
  allowed_email_domains       TEXT[] DEFAULT '{}',
  student_id_only_login       BOOLEAN DEFAULT FALSE,
  require_student_id          BOOLEAN DEFAULT FALSE,
  chatbot_enabled             BOOLEAN DEFAULT TRUE,
  chatbot_provider            TEXT DEFAULT 'gemini',
  chatbot_model               TEXT DEFAULT 'gemini-2.0-flash',
  chatbot_api_base            TEXT,
  chatbot_api_key             TEXT,
  chatbot_system_prompt       TEXT,
  mobile_app_download_url     TEXT,
  mobile_app_version          TEXT DEFAULT 'v1.1.0',
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns referenced by the apps exist (idempotent upgrades)
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS restrict_email_domain BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allowed_email_domains TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS student_id_only_login BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS require_student_id BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS chatbot_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS chatbot_provider TEXT DEFAULT 'gemini',
  ADD COLUMN IF NOT EXISTS chatbot_model TEXT DEFAULT 'gemini-2.0-flash',
  ADD COLUMN IF NOT EXISTS chatbot_api_base TEXT,
  ADD COLUMN IF NOT EXISTS chatbot_api_key TEXT,
  ADD COLUMN IF NOT EXISTS chatbot_system_prompt TEXT,
  ADD COLUMN IF NOT EXISTS mobile_app_download_url TEXT,
  ADD COLUMN IF NOT EXISTS mobile_app_version TEXT DEFAULT 'v1.1.0';

-- Seed a single default row if none exists
INSERT INTO public.site_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- All signed-in users can read site settings
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

-- Only admins and moderators can modify site settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_settings'
      AND policyname = 'site_settings_write'
  ) THEN
    CREATE POLICY "site_settings_write"
      ON public.site_settings
      FOR ALL
      USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator')
      )
      WITH CHECK (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator')
      );
  END IF;
END
$$;
