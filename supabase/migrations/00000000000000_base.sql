-- BU Alumni Tracer Study — Full Schema
-- PostgreSQL 16 + Supabase

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'alumni'
                  CHECK (role IN ('alumni', 'admin', 'moderator')),
  bio           TEXT,
  batch_year    INT,
  degree        TEXT,
  college       TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. QUESTIONNAIRES
-- ============================================
CREATE TABLE public.questionnaires (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  batch_year  INT,
  deadline    DATE,
  created_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. GTS RESPONSES (main container)
-- ============================================
CREATE TABLE public.gts_responses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  questionnaire_id    UUID REFERENCES public.questionnaires(id),
  status              TEXT DEFAULT 'draft'
                        CHECK (status IN ('draft', 'submitted', 'archived')),
  submitted_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, questionnaire_id)
);

-- ============================================
-- 4. GTS SECTION A: GENERAL INFORMATION
-- ============================================
CREATE TABLE public.gts_section_a (
  response_id         UUID PRIMARY KEY REFERENCES public.gts_responses(id) ON DELETE CASCADE,
  permanent_address   TEXT,
  civil_status        TEXT CHECK (civil_status IN
                        ('single','married','separated','single_parent','widowed')),
  sex                 TEXT CHECK (sex IN ('male','female')),
  birthday            DATE,
  region_of_origin    TEXT,
  province            TEXT,
  location_type       TEXT CHECK (location_type IN ('city','municipality')),
  telephone           TEXT,
  mobile_number       TEXT
);

-- ============================================
-- 5. GTS SECTION B: EDUCATIONAL BACKGROUND
-- ============================================
CREATE TABLE public.gts_degrees (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id         UUID NOT NULL REFERENCES public.gts_responses(id) ON DELETE CASCADE,
  degree_name         TEXT NOT NULL,
  specialization      TEXT,
  college_university  TEXT,
  year_graduated      INT,
  honors              TEXT,
  sort_order          INT DEFAULT 0
);

CREATE TABLE public.gts_prof_exams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id   UUID NOT NULL REFERENCES public.gts_responses(id) ON DELETE CASCADE,
  exam_name     TEXT NOT NULL,
  date_taken    DATE,
  rating        TEXT
);

CREATE TABLE public.gts_course_reasons (
  response_id   UUID NOT NULL REFERENCES public.gts_responses(id) ON DELETE CASCADE,
  reason_code   TEXT NOT NULL,
  level         TEXT CHECK (level IN ('undergraduate','graduate')),
  PRIMARY KEY (response_id, reason_code, level)
);

-- ============================================
-- 6. GTS SECTION C: TRAININGS
-- ============================================
CREATE TABLE public.gts_trainings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id     UUID NOT NULL REFERENCES public.gts_responses(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  duration        TEXT,
  credits_earned  TEXT,
  institution     TEXT
);

-- ============================================
-- 7. GTS SECTION D: EMPLOYMENT
-- ============================================
CREATE TABLE public.gts_employment (
  response_id               UUID PRIMARY KEY REFERENCES public.gts_responses(id) ON DELETE CASCADE,
  employment_status         TEXT CHECK (employment_status IN ('employed','not_employed','never_employed')),
  not_employed_reasons      TEXT[],
  present_emp_type          TEXT CHECK (present_emp_type IN
                              ('regular','temporary','contractual','casual','self_employed')),
  present_occupation        TEXT,
  self_employed_skills      TEXT,
  major_line_of_business    TEXT,
  place_of_work             TEXT CHECK (place_of_work IN ('local','abroad')),
  is_first_job              BOOLEAN,
  reasons_for_staying       TEXT[],
  reasons_for_accepting     TEXT[],
  reasons_for_changing      TEXT[],
  duration_in_first_job     TEXT,
  how_found_first_job       TEXT,
  time_to_land_first_job    TEXT,
  job_level_first           TEXT CHECK (job_level_first IN
                              ('rank_clerical','professional_technical','managerial','self_employed')),
  job_level_current         TEXT CHECK (job_level_current IN
                              ('rank_clerical','professional_technical','managerial','self_employed')),
  initial_monthly_earning   TEXT,
  is_curriculum_relevant    BOOLEAN
);

-- ============================================
-- 8. GTS SECTION E: SKILLS & FEEDBACK
-- ============================================
CREATE TABLE public.gts_skills_feedback (
  response_id               UUID PRIMARY KEY REFERENCES public.gts_responses(id) ON DELETE CASCADE,
  useful_competencies       TEXT[],
  curriculum_suggestions    TEXT,
  peer_referrals            JSONB DEFAULT '[]'::JSONB
);

-- ============================================
-- 9. FORUM
-- ============================================
CREATE TABLE public.forum_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  color       TEXT,
  sort_order  INT DEFAULT 0,
  is_locked   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.forum_threads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID NOT NULL REFERENCES public.forum_categories(id),
  author_id       UUID NOT NULL REFERENCES public.profiles(id),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  body            TEXT NOT NULL,
  body_plain      TEXT,
  is_pinned       BOOLEAN DEFAULT FALSE,
  is_locked       BOOLEAN DEFAULT FALSE,
  is_solved       BOOLEAN DEFAULT FALSE,
  view_count      INT DEFAULT 0,
  reply_count     INT DEFAULT 0,
  last_reply_at   TIMESTAMPTZ,
  last_reply_by   UUID REFERENCES public.profiles(id),
  tags            TEXT[] DEFAULT '{}',
  search_vector   TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', COALESCE(title,'') || ' ' || COALESCE(body_plain,''))
  ) STORED,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX forum_threads_search_idx ON public.forum_threads USING GIN(search_vector);
CREATE INDEX forum_threads_category_idx ON public.forum_threads(category_id, last_reply_at DESC);

CREATE TABLE public.forum_replies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id     UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  author_id     UUID NOT NULL REFERENCES public.profiles(id),
  parent_id     UUID REFERENCES public.forum_replies(id),
  body          TEXT NOT NULL,
  body_plain    TEXT,
  is_accepted   BOOLEAN DEFAULT FALSE,
  is_deleted    BOOLEAN DEFAULT FALSE,
  edit_count    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.forum_reactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type   TEXT NOT NULL CHECK (target_type IN ('thread','reply')),
  target_id     UUID NOT NULL,
  emoji         TEXT NOT NULL DEFAULT '👍',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id, emoji)
);

CREATE TABLE public.forum_bookmarks (
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  thread_id   UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, thread_id)
);

-- ============================================
-- 10. NOTIFICATIONS
-- ============================================
CREATE TABLE public.notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id      UUID REFERENCES public.profiles(id),
  type          TEXT NOT NULL CHECK (type IN
                  ('reply','reaction','mention','announcement','system')),
  thread_id     UUID REFERENCES public.forum_threads(id),
  reply_id      UUID REFERENCES public.forum_replies(id),
  message       TEXT,
  is_read       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX notifications_recipient_idx ON public.notifications(recipient_id, is_read, created_at DESC);

-- ============================================
-- 11. ANALYTICS — MATERIALIZED VIEW
-- ============================================
CREATE MATERIALIZED VIEW public.mv_employment_stats AS
SELECT
  p.batch_year,
  p.degree,
  p.college,
  COUNT(*) FILTER (WHERE e.employment_status = 'employed') AS employed_count,
  COUNT(*) FILTER (WHERE e.employment_status = 'not_employed') AS not_employed_count,
  COUNT(*) FILTER (WHERE e.employment_status = 'never_employed') AS never_employed_count,
  COUNT(*) AS total_respondents,
  ROUND(
    COUNT(*) FILTER (WHERE e.employment_status = 'employed') * 100.0 / NULLIF(COUNT(*), 0),
    2
  ) AS employment_rate,
  AVG(CASE WHEN e.time_to_land_first_job = 'less_than_month' THEN 0.5
           WHEN e.time_to_land_first_job = '1_to_6_months'   THEN 3.5
           WHEN e.time_to_land_first_job = '7_to_11_months'  THEN 9
           WHEN e.time_to_land_first_job = '1_to_2_years'    THEN 18
           ELSE NULL END
  ) AS avg_months_to_employment
FROM public.gts_responses r
JOIN public.profiles p ON r.user_id = p.id
LEFT JOIN public.gts_employment e ON r.id = e.response_id
WHERE r.status = 'submitted'
GROUP BY p.batch_year, p.degree, p.college;

-- Refresh nightly
SELECT cron.schedule('refresh-employment-stats', '0 2 * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_employment_stats');

-- ============================================
-- 12. ROW-LEVEL SECURITY POLICIES
-- ============================================
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaires      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gts_responses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gts_section_a       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gts_degrees         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gts_prof_exams      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gts_course_reasons  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gts_trainings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gts_employment      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gts_skills_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_bookmarks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications       ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_read"  ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "profiles_write" ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Questionnaires (read for all signed-in, write admin only)
CREATE POLICY "questionnaires_read"  ON public.questionnaires FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "questionnaires_write" ON public.questionnaires FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','moderator'));

-- GTS responses
CREATE POLICY "gts_own"   ON public.gts_responses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "gts_admin" ON public.gts_responses FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','moderator'));

-- GTS sub-tables (cascade through response ownership)
CREATE POLICY "gts_section_a_own"   ON public.gts_section_a FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.gts_responses WHERE id = response_id)
);
CREATE POLICY "gts_section_a_admin" ON public.gts_section_a FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','moderator'));

CREATE POLICY "gts_degrees_own"   ON public.gts_degrees FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.gts_responses WHERE id = response_id)
);
CREATE POLICY "gts_degrees_admin" ON public.gts_degrees FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','moderator'));

CREATE POLICY "gts_prof_exams_own"   ON public.gts_prof_exams FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.gts_responses WHERE id = response_id)
);
CREATE POLICY "gts_prof_exams_admin" ON public.gts_prof_exams FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','moderator'));

CREATE POLICY "gts_course_reasons_own"   ON public.gts_course_reasons FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.gts_responses WHERE id = response_id)
);
CREATE POLICY "gts_course_reasons_admin" ON public.gts_course_reasons FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','moderator'));

CREATE POLICY "gts_trainings_own"   ON public.gts_trainings FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.gts_responses WHERE id = response_id)
);
CREATE POLICY "gts_trainings_admin" ON public.gts_trainings FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','moderator'));

CREATE POLICY "gts_employment_own"   ON public.gts_employment FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.gts_responses WHERE id = response_id)
);
CREATE POLICY "gts_employment_admin" ON public.gts_employment FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','moderator'));

CREATE POLICY "gts_skills_feedback_own"   ON public.gts_skills_feedback FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.gts_responses WHERE id = response_id)
);
CREATE POLICY "gts_skills_feedback_admin" ON public.gts_skills_feedback FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','moderator'));

-- Forum threads
CREATE POLICY "threads_read"   ON public.forum_threads FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "threads_insert" ON public.forum_threads FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "threads_update" ON public.forum_threads FOR UPDATE
  USING (auth.uid() = author_id OR
         (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','moderator'));
CREATE POLICY "threads_delete" ON public.forum_threads FOR DELETE
  USING (auth.uid() = author_id OR
         (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','moderator'));

-- Forum replies
CREATE POLICY "replies_read"   ON public.forum_replies FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "replies_insert" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "replies_update" ON public.forum_replies FOR UPDATE
  USING (auth.uid() = author_id OR
         (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','moderator'));
CREATE POLICY "replies_delete" ON public.forum_replies FOR DELETE
  USING (auth.uid() = author_id OR
         (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','moderator'));

-- Forum reactions
CREATE POLICY "reactions_read"   ON public.forum_reactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "reactions_insert" ON public.forum_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_delete" ON public.forum_reactions FOR DELETE USING (auth.uid() = user_id);

-- Forum bookmarks
CREATE POLICY "bookmarks_read"   ON public.forum_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert" ON public.forum_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete" ON public.forum_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "notifs_own" ON public.notifications FOR ALL USING (auth.uid() = recipient_id);

-- ============================================
-- 13. FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION public.increment_thread_view(thread_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.forum_threads SET view_count = view_count + 1 WHERE id = thread_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_thread_slug(title TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INT := 1;
BEGIN
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := regexp_replace(base_slug, '^-|-$', '', 'g');
  new_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.forum_threads WHERE slug = new_slug) LOOP
    new_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  RETURN new_slug;
END;
$$;
