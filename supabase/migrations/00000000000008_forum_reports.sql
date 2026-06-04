-- Forum reports table
CREATE TABLE IF NOT EXISTS public.forum_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   UUID NOT NULL REFERENCES public.profiles(id),
  target_type   TEXT NOT NULL CHECK (target_type IN ('thread', 'reply')),
  target_id     UUID NOT NULL,
  reason        TEXT NOT NULL CHECK (reason IN (
    'spam', 'harassment', 'misinformation',
    'inappropriate', 'off_topic', 'other')),
  details       TEXT,
  status        TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending', 'resolved', 'dismissed')),
  resolved_by   UUID REFERENCES public.profiles(id),
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS forum_reports_status_idx ON public.forum_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS forum_reports_target_idx ON public.forum_reports(target_type, target_id);

-- RLS
ALTER TABLE public.forum_reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'forum_reports' AND policyname = 'reports_readable_by_moderators'
  ) THEN
    CREATE POLICY "reports_readable_by_moderators" ON public.forum_reports
      FOR SELECT
      USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'forum_reports' AND policyname = 'reports_insertable_by_authenticated'
  ) THEN
    CREATE POLICY "reports_insertable_by_authenticated" ON public.forum_reports
      FOR INSERT
      WITH CHECK (auth.uid() = reporter_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'forum_reports' AND policyname = 'reports_updatable_by_moderators'
  ) THEN
    CREATE POLICY "reports_updatable_by_moderators" ON public.forum_reports
      FOR UPDATE
      USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator'));
  END IF;
END $$;
