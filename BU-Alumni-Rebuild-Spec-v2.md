# ALUMNI: W.A.M — Ground-Up Rebuild Specification v2
**BU Alumni Tracer Study Platform — Baliuag University**
Version 2.0 · May 2026 · Full Stack Rebuild + Forum

---

## 0. What This Document Is

A complete, implementation-ready specification for rebuilding the BU Alumni Tracer Study platform from scratch. Firebase is fully replaced. Both the web portal and Flutter mobile app share a single **Supabase** backend. The rebuild adds a university-grade **forum** for alumni interaction and a polished design system aligned with Baliuag University's brand identity.

---

## 1. Why We're Leaving Firebase

| Concern | Firebase Problem | Supabase Solution |
|---|---|---|
| Vendor lock-in | Proprietary NoSQL, hard to migrate | PostgreSQL — portable, industry standard |
| Anonymous auth | No real user identity | Email/password, OAuth, magic link |
| Security rules | JS-like rules — easy to misconfigure | Row-Level Security (RLS) policies in SQL |
| Complex queries | Limited — no JOINs, no aggregations | Full SQL — GROUP BY, window functions, CTEs |
| Forum/social features | No built-in full-text search | `pg_trgm`, `tsvector` built into Postgres |
| File storage | Firebase Storage (expensive at scale) | Supabase Storage (S3-compatible, cheaper) |
| Realtime | Firestore `onSnapshot` | Supabase Realtime via Postgres CDC |
| Self-hosting | ❌ Impossible | ✅ Docker Compose — can run on university servers |
| Cost at scale | Firestore per-read pricing | Postgres rows = free; pay for compute |

---

## 2. Target Stack

### Web Portal
```
Next.js 15 (App Router)          — framework
TypeScript 5                      — language
Tailwind CSS 4                    — styling
Shadcn/UI + Radix UI              — component primitives
Framer Motion                     — animations
Supabase JS Client v2             — database + auth + storage + realtime
Zod                               — validation
React Hook Form                   — forms
Recharts                          — analytics charts
TipTap                            — rich text editor (forum posts)
Vercel / Railway                  — deployment
```

### Mobile App (Flutter)
```
Flutter 3.22+                     — framework
Dart 3.4+                         — language
Supabase Flutter SDK              — database + auth + storage + realtime
Flutter Riverpod 2                — state management
GoRouter                          — routing
fl_chart                          — charts
flutter_quill                     — rich text (forum posts)
google_generative_ai              — BUddy AI chatbot (Gemini 2.0 Flash)
cached_network_image              — avatar/image caching
```

### Backend
```
Supabase (self-hosted OR cloud)   — PostgreSQL 16
  ├── Database          — primary data store (all data)
  ├── Auth              — email/password + OAuth
  ├── Storage           — avatars, attachments
  ├── Realtime          — forum live updates, notifications
  ├── Edge Functions    — server-side logic (Deno)
  └── pg_cron           — scheduled analytics aggregation
```

### AI
```
Google Gemini 2.0 Flash           — BUddy chatbot (both apps)
Supabase Edge Function            — wraps AI calls server-side
```

---

## 3. Database Schema (PostgreSQL DDL)

### 3.1 Auth & Users

```sql
-- Supabase manages auth.users automatically.
-- We extend it with a public profile.

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  avatar_url    text,
  role          text not null default 'alumni'
                  check (role in ('alumni', 'admin', 'moderator')),
  bio           text,
  batch_year    int,               -- graduation year
  degree        text,
  college       text,
  is_verified   boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Trigger: auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'New User'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 3.2 Tracer Study — CHED GTS Aligned

```sql
-- Questionnaire definitions (admin-managed)
create table public.questionnaires (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  is_active   boolean default true,
  batch_year  int,
  deadline    date,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now()
);

-- Main GTS response container
create table public.gts_responses (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  questionnaire_id    uuid references public.questionnaires(id),
  status              text default 'draft'
                        check (status in ('draft', 'submitted', 'archived')),
  submitted_at        timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique (user_id, questionnaire_id)
);

-- Section A: General Information
create table public.gts_section_a (
  response_id         uuid primary key references public.gts_responses(id) on delete cascade,
  permanent_address   text,
  civil_status        text check (civil_status in
                        ('single','married','separated','single_parent','widowed')),
  sex                 text check (sex in ('male','female')),
  birthday            date,
  region_of_origin    text,
  province            text,
  location_type       text check (location_type in ('city','municipality'))
);

-- Section B: Educational Background (repeatable degrees)
create table public.gts_degrees (
  id                  uuid primary key default gen_random_uuid(),
  response_id         uuid not null references public.gts_responses(id) on delete cascade,
  degree_name         text not null,
  specialization      text,
  college_university  text,
  year_graduated      int,
  honors              text,
  sort_order          int default 0
);

create table public.gts_prof_exams (
  id            uuid primary key default gen_random_uuid(),
  response_id   uuid not null references public.gts_responses(id) on delete cascade,
  exam_name     text not null,
  date_taken    date,
  rating        text
);

create table public.gts_course_reasons (
  response_id   uuid not null references public.gts_responses(id) on delete cascade,
  reason_code   text not null,   -- enum slug matching CHED form options
  level         text check (level in ('undergraduate','graduate')),
  primary key (response_id, reason_code, level)
);

-- Section C: Trainings
create table public.gts_trainings (
  id              uuid primary key default gen_random_uuid(),
  response_id     uuid not null references public.gts_responses(id) on delete cascade,
  title           text not null,
  duration        text,
  credits_earned  text,
  institution     text
);

-- Section D: Employment
create table public.gts_employment (
  response_id               uuid primary key references public.gts_responses(id) on delete cascade,
  employment_status         text check (employment_status in ('employed','not_employed','never_employed')),
  not_employed_reasons      text[],
  present_emp_type          text check (present_emp_type in
                              ('regular','temporary','contractual','casual','self_employed')),
  present_occupation        text,
  self_employed_skills      text,
  major_line_of_business    text,
  place_of_work             text check (place_of_work in ('local','abroad')),
  is_first_job              boolean,
  reasons_for_staying       text[],
  reasons_for_accepting     text[],
  reasons_for_changing      text[],
  duration_in_first_job     text,
  how_found_first_job       text,
  time_to_land_first_job    text,
  job_level_first           text check (job_level_first in
                              ('rank_clerical','professional_technical','managerial','self_employed')),
  job_level_current         text check (job_level_current in
                              ('rank_clerical','professional_technical','managerial','self_employed')),
  initial_monthly_earning   text,   -- salary range enum
  is_curriculum_relevant    boolean
);

-- Section E: Skills & Feedback
create table public.gts_skills_feedback (
  response_id               uuid primary key references public.gts_responses(id) on delete cascade,
  useful_competencies       text[],
  curriculum_suggestions    text,
  peer_referrals            jsonb default '[]'::jsonb
  -- [{name, address, contact}]
);
```

### 3.3 Forum

```sql
-- Forum categories
create table public.forum_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  icon        text,         -- lucide icon name
  color       text,         -- hex color for category badge
  sort_order  int default 0,
  is_locked   boolean default false,
  created_at  timestamptz default now()
);

-- Seed categories
insert into public.forum_categories (slug, name, description, icon, color, sort_order) values
  ('announcements',   'Announcements',      'Official news from Baliuag University',          'megaphone',  '#4C992D', 0),
  ('career-advice',   'Career Advice',      'Job hunting tips and professional development',   'briefcase',  '#2D7A9A', 1),
  ('alumni-network',  'Alumni Network',     'Connect with fellow BU graduates',                'users',      '#7A4C99', 2),
  ('industry-talk',   'Industry Talk',      'Discuss trends in your field',                    'trending-up','#996B2D', 3),
  ('campus-life',     'Campus Life',        'Memories, reunions, and BU culture',              'university', '#2D9963', 4),
  ('opportunities',   'Opportunities',      'Job postings, scholarships, and partnerships',    'star',       '#D97706', 5),
  ('general',         'General',            'Anything and everything',                         'message-circle','#6B7280',6);

-- Forum threads
create table public.forum_threads (
  id              uuid primary key default gen_random_uuid(),
  category_id     uuid not null references public.forum_categories(id),
  author_id       uuid not null references public.profiles(id),
  title           text not null,
  slug            text unique not null,
  body            text not null,        -- TipTap JSON stored as text
  body_plain      text,                 -- stripped plain text for search
  is_pinned       boolean default false,
  is_locked       boolean default false,
  is_solved       boolean default false,
  view_count      int default 0,
  reply_count     int default 0,        -- denormalized for perf
  last_reply_at   timestamptz,
  last_reply_by   uuid references public.profiles(id),
  tags            text[] default '{}',
  search_vector   tsvector generated always as (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body_plain,''))
  ) stored,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index forum_threads_search_idx on public.forum_threads using gin(search_vector);
create index forum_threads_category_idx on public.forum_threads(category_id, last_reply_at desc);

-- Forum replies (flat + parent for threading)
create table public.forum_replies (
  id            uuid primary key default gen_random_uuid(),
  thread_id     uuid not null references public.forum_threads(id) on delete cascade,
  author_id     uuid not null references public.profiles(id),
  parent_id     uuid references public.forum_replies(id),   -- for 1 level of nesting
  body          text not null,
  body_plain    text,
  is_accepted   boolean default false,  -- marked as answer
  is_deleted    boolean default false,
  edit_count    int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Reactions (threads and replies)
create table public.forum_reactions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  target_type   text not null check (target_type in ('thread','reply')),
  target_id     uuid not null,
  emoji         text not null default '👍',   -- '👍','❤️','🎉','💡','🙏'
  created_at    timestamptz default now(),
  unique (user_id, target_type, target_id, emoji)
);

-- Bookmarks
create table public.forum_bookmarks (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  thread_id   uuid not null references public.forum_threads(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (user_id, thread_id)
);

-- Notifications
create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  recipient_id  uuid not null references public.profiles(id) on delete cascade,
  actor_id      uuid references public.profiles(id),
  type          text not null check (type in
                  ('reply','reaction','mention','announcement','system')),
  thread_id     uuid references public.forum_threads(id),
  reply_id      uuid references public.forum_replies(id),
  message       text,
  is_read       boolean default false,
  created_at    timestamptz default now()
);

create index notifications_recipient_idx on public.notifications(recipient_id, is_read, created_at desc);
```

### 3.4 Analytics (Materialized Views)

```sql
-- Aggregated employment stats — refreshed nightly via pg_cron
create materialized view public.mv_employment_stats as
select
  p.batch_year,
  p.degree,
  p.college,
  count(*) filter (where e.employment_status = 'employed')   as employed_count,
  count(*) filter (where e.employment_status = 'not_employed') as not_employed_count,
  count(*) filter (where e.employment_status = 'never_employed') as never_employed_count,
  count(*) as total_respondents,
  round(
    count(*) filter (where e.employment_status = 'employed') * 100.0 / nullif(count(*), 0),
    2
  ) as employment_rate,
  avg(case when e.time_to_land_first_job = 'less_than_month' then 0.5
           when e.time_to_land_first_job = '1_to_6_months'   then 3.5
           when e.time_to_land_first_job = '7_to_11_months'  then 9
           when e.time_to_land_first_job = '1_to_2_years'    then 18
           else null end
  ) as avg_months_to_employment
from public.gts_responses r
join public.profiles p on r.user_id = p.id
left join public.gts_employment e on r.id = e.response_id
where r.status = 'submitted'
group by p.batch_year, p.degree, p.college;

-- Refresh nightly
select cron.schedule('refresh-employment-stats', '0 2 * * *',
  'refresh materialized view concurrently public.mv_employment_stats');
```

---

## 4. Row-Level Security Policies

```sql
-- Enable RLS on all tables
alter table public.profiles            enable row level security;
alter table public.gts_responses       enable row level security;
alter table public.forum_threads       enable row level security;
alter table public.forum_replies       enable row level security;
alter table public.forum_reactions     enable row level security;
alter table public.notifications       enable row level security;

-- Profiles: anyone signed in can read; only owner or admin can write
create policy "profiles_read"  on public.profiles for select using (auth.uid() is not null);
create policy "profiles_write" on public.profiles for update
  using (auth.uid() = id or (select role from public.profiles where id = auth.uid()) = 'admin');

-- GTS responses: only owner can read/write their own
create policy "gts_own"  on public.gts_responses for all
  using (auth.uid() = user_id);
create policy "gts_admin" on public.gts_responses for select
  using ((select role from public.profiles where id = auth.uid()) in ('admin','moderator'));

-- Forum threads: anyone signed in can read; author can edit their own
create policy "threads_read"   on public.forum_threads for select using (auth.uid() is not null);
create policy "threads_insert" on public.forum_threads for insert with check (auth.uid() = author_id);
create policy "threads_update" on public.forum_threads for update
  using (auth.uid() = author_id or
         (select role from public.profiles where id = auth.uid()) in ('admin','moderator'));

-- Notifications: only recipient can read
create policy "notifs_own" on public.notifications for all using (auth.uid() = recipient_id);
```

---

## 5. UI/UX Design System

### 5.1 Design Direction

**"Academic Prestige"** — The visual language of established universities: structured layouts with generous whitespace, a confident typographic hierarchy, and a deep green palette drawn from BU's brand. Think the weight of a leather-bound thesis, rendered digitally. Clean but not sterile. Authoritative but welcoming.

### 5.2 Color System

```css
:root {
  /* BU Brand — Primary */
  --color-forest:       #004011;   /* darkest — hero backgrounds, nav */
  --color-emerald:      #006D1D;   /* dark — section accents */
  --color-primary:      #4C992D;   /* BU primary green — buttons, links */
  --color-meadow:       #6CB84A;   /* medium — hover states */
  --color-sage:         #A8D695;   /* light — subtle accents */
  --color-mint:         #E0F2E7;   /* lightest — backgrounds, cards */

  /* Neutrals */
  --color-ink:          #0F1A0C;   /* near-black text */
  --color-charcoal:     #2D3B28;   /* secondary text */
  --color-slate:        #5A6B54;   /* tertiary, placeholders */
  --color-mist:         #B8C4B4;   /* borders */
  --color-fog:          #E8EDE6;   /* dividers */
  --color-paper:        #F7F9F6;   /* page background */
  --color-white:        #FFFFFF;

  /* Forum Category Colors */
  --cat-announcement:   #4C992D;
  --cat-career:         #2D7A9A;
  --cat-network:        #7A4C99;
  --cat-industry:       #996B2D;
  --cat-campus:         #2D9963;
  --cat-opportunity:    #D97706;
  --cat-general:        #6B7280;

  /* Semantic */
  --color-success:      #22C55E;
  --color-warning:      #F59E0B;
  --color-error:        #EF4444;
  --color-info:         #3B82F6;

  /* Typography Scale (rem) */
  --text-xs:    0.75rem;    /* 12px */
  --text-sm:    0.875rem;   /* 14px */
  --text-base:  1rem;       /* 16px */
  --text-lg:    1.125rem;   /* 18px */
  --text-xl:    1.25rem;    /* 20px */
  --text-2xl:   1.5rem;     /* 24px */
  --text-3xl:   1.875rem;   /* 30px */
  --text-4xl:   2.25rem;    /* 36px */
  --text-5xl:   3rem;       /* 48px */
  --text-6xl:   3.75rem;    /* 60px */

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;

  /* Radius */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-xl:  16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* Shadow */
  --shadow-sm: 0 1px 2px rgba(0,64,17,0.06);
  --shadow-md: 0 4px 12px rgba(0,64,17,0.08);
  --shadow-lg: 0 8px 24px rgba(0,64,17,0.12);
  --shadow-xl: 0 16px 48px rgba(0,64,17,0.16);
}
```

### 5.3 Typography

```css
/* Fonts */
/* Display: Playfair Display — serif, prestigious, academic weight */
/* Body: Plus Jakarta Sans — humanist sans, friendly, highly legible */
/* Mono: JetBrains Mono — for code blocks in forum */

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
}

/* Usage */
h1, h2, h3      { font-family: var(--font-display); }
body, p, label  { font-family: var(--font-body); }
code, pre       { font-family: var(--font-mono); }
```

### 5.4 Component Inventory

#### Navigation (Web)
- **Top bar** (64px): BU logo left, primary nav center, avatar + notifications right.
- **Sidebar** (collapsed on mobile): Dashboard, Tracer Study, Forum, Directory, Profile, Settings.
- **Mobile bottom tab bar** (Flutter): Home, Forum, Survey, Directory, Profile.

#### Cards
- **Forum Thread Card**: Category badge (colored pill), title (Playfair, 18px semibold), author avatar + name, reply count, reaction count, last activity time. Hover: subtle green left border.
- **Alumni Profile Card**: Avatar (64px rounded), name, batch year, degree, college, verified badge.
- **Stats Card**: Metric label (sm, slate), large number (Playfair, 48px, forest green), trend chip.
- **Survey Step Card**: Step number pill, section title, progress bar, form fields.

#### Buttons
```
Primary:    bg-primary text-white    — main actions
Secondary:  bg-mint text-forest      — secondary actions
Ghost:      transparent text-primary border border-mist
Danger:     bg-error text-white
Icon:       circular, 36px/40px/48px
```

#### Form Elements
- Labels: `text-sm font-semibold text-charcoal`
- Inputs: `border border-mist rounded-lg px-4 py-3 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20`
- Select: custom styled with chevron icon, same dimensions as input.
- Checkbox/Radio: custom green accent, 18px hit target.
- Textarea: min-height 120px, same border treatment.

---

## 6. Web Portal — Page Inventory

### 6.1 Public Pages (no auth)

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero with BU branding, feature highlights, CTA to sign up or log in |
| `/login` | Login | Email/password, link to sign up |
| `/signup` | Sign Up | Name, email, password, batch year, degree, college |
| `/forgot-password` | Reset | Email entry, magic link |

### 6.2 Authenticated Pages

#### Dashboard (`/dashboard`)
- Welcome banner with alumni name + avatar.
- **Quick Stats row**: Employment rate (current cohort), total respondents, forum posts this week.
- **Survey status card**: % complete, resume CTA if draft.
- **Recent forum activity**: Latest 5 threads across all categories.
- **Notifications panel**: Unread forum replies, reactions, system announcements.

#### Tracer Study (`/survey`)
- Multi-step wizard — 5 steps (see Section 7).
- Progress bar at top showing step names + completion state.
- Auto-save draft to Supabase on every step completion.
- Final review screen before submission.
- Post-submission success screen with social share option.

#### Forum (`/forum`)
- **Category index** — grid of 7 category cards with thread/post counts.
- **Thread list** (`/forum/[category]`) — sorted by last reply (default), with filter chips: All, Popular, Unanswered, My Posts.
- **Thread detail** (`/forum/[category]/[thread-slug]`) — full thread + replies.
- **New thread** (`/forum/new`) — category select, title, TipTap editor, tags.
- **Search** (`/forum/search?q=`) — full-text across titles and bodies.
- **My Bookmarks** (`/forum/bookmarks`)

#### Directory (`/directory`)
- Search alumni by name, degree, batch year, college.
- Alumni cards in a responsive grid.
- Alumni profile modal with contact info and survey participation status (public/private toggle).

#### Profile (`/profile/[id]`)
- Own profile: editable. Others: view only.
- Avatar upload, bio, batch year, degree, college.
- Forum post history.
- Survey submission status (visible only to self + admin).

#### Admin (`/admin`) — role-gated
- **Dashboard**: Response rates by college and batch year, employment rate charts.
- **Respondents**: Table of all submissions, filterable, exportable to CSV.
- **Forum moderation**: Reported posts, pin/lock/delete controls.
- **Questionnaire manager**: Create/edit questionnaire definitions, set active survey.
- **User management**: View users, assign roles (moderator, admin).
- **Logs**: Audit trail of admin actions.

---

## 7. Questionnaire — Full CHED GTS Implementation

### Step Navigation Pattern
```
[1 General Info] → [2 Education] → [3 Trainings] → [4 Employment] → [5 Skills]
     ●                  ○               ○                ○               ○
```

### Step 1 — General Information (CHED Section A, Q1–11)
```
Fields:
  • Full Name (pre-filled from profile, editable)
  • Permanent Address (text)
  • Email (pre-filled, read-only)
  • Telephone / Contact Number(s)
  • Mobile Number
  • Civil Status (radio: Single | Married | Separated | Single Parent | Widowed)
  • Sex (radio: Male | Female)
  • Date of Birth (date picker)
  • Region of Origin (select: NCR, CAR, ARMM, CARAGA, Region 1–12)
  • Province (text)
  • Location of Residence (radio: City | Municipality)
```

### Step 2 — Educational Background (CHED Section B, Q12–14)
```
Repeatable degree rows:
  • Degree & Specialization
  • College / University
  • Year Graduated (number, 4 digits)
  • Honors / Awards Received (text)
  [+ Add Another Degree]

Repeatable professional exam rows:
  • Name of Examination
  • Date Taken
  • Rating
  [+ Add Another Exam]

Reasons for taking the course (multi-select checkboxes, two columns UG/Grad):
  □ High grades in subject area
  □ Good grades in high school
  □ Influence of parents or relatives
  □ Peer influence
  □ Inspired by a role model
  □ Strong passion for the profession
  □ Prospect for immediate employment
  □ Status or prestige of the profession
  □ Availability of course in chosen institution
  □ Prospect of career advancement
  □ Affordable for the family
  □ Prospect of attractive compensation
  □ Opportunity for employment abroad
  □ No particular choice / no better idea
  □ Others (open text)
```

### Step 3 — Trainings & Advanced Studies (CHED Section C, Q15)
```
Repeatable training rows:
  • Title of Training or Advance Study
  • Duration & Credits Earned
  • Name of Training Institution
  [+ Add Another Training]

Reasons for pursuing advanced studies:
  (radio)  ○ For promotion
           ○ For professional development
           ○ Others (open text)
```

### Step 4 — Employment Data (CHED Section D, Q16–32)
```
Q16. Are you presently employed?
  ○ Yes  ○ No  ○ Never Been Employed

[Branch: No / Never] → Q17: Reason(s) not employed (multi-select)
  □ Advance or further study      □ No job opportunity
  □ Family concern                □ Did not look for a job
  □ Health-related reason         □ Lack of work experience
  □ Others (text)
  → Skip to Step 5.

[Branch: Yes]
Q18. Employment Status
  ○ Regular/Permanent  ○ Temporary  ○ Contractual  ○ Casual  ○ Self-employed
  (if self-employed) → What skills from college did you apply? (text)

Q19. Present Occupation (text)

Q20. Major Line of Business (select — 17 CHED options)
  Agriculture/Hunting/Forestry | Fishing | Mining | Manufacturing |
  Electricity/Gas/Water | Construction | Wholesale & Retail Trade |
  Hotels & Restaurants | Transport Storage & Communication |
  Financial Intermediation | Real Estate | Public Administration |
  Education | Health & Social Work | Other Community Services |
  Private Households | Extra-territorial Organizations

Q21. Place of Work (radio: Local | Abroad)

Q22. Is this your first job after college? (radio: Yes | No)

[Branch: Yes to Q22] → Q23: Reasons for staying on the job (multi-select)
  □ Salaries and benefits  □ Career challenge  □ Related to special skill
  □ Related to course/program  □ Proximity to residence
  □ Peer influence  □ Family influence  □ Others (text)

Q24. Is your first job related to your course? (radio: Yes | No)

[Branch: No to Q22] → Q25: Reasons for changing job (multi-select — same options as Q23)
Q27. How long in first job? (radio — duration ranges from CHED form)

Q28. How did you find your first job? (radio — 7 options from CHED form)

Q29. How long to land first job? (radio — duration ranges)

Q30. Job Level
  First Job:    ○ Rank/Clerical  ○ Professional/Technical  ○ Managerial  ○ Self-employed
  Current Job:  ○ Rank/Clerical  ○ Professional/Technical  ○ Managerial  ○ Self-employed

Q31. Initial Gross Monthly Earning — First Job (radio)
  ○ Below ₱5,000        ○ ₱15,000 – ₱19,999
  ○ ₱5,000 – ₱9,999    ○ ₱20,000 – ₱24,999
  ○ ₱10,000 – ₱14,999  ○ ₱25,000 and above

Q32. Was curriculum relevant to first job? (radio: Yes | No)
```

### Step 5 — Skills & Feedback (CHED Section E, Q33–34)
```
[Branch: Only shown if Q32 = Yes]
Q33. Competencies useful in first job (multi-select):
  □ Communication skills
  □ Human Relations skills
  □ Entrepreneurial skills
  □ Information Technology skills
  □ Problem-solving skills
  □ Critical Thinking skills
  □ Others (text)

Q34. Suggestions to improve course curriculum (textarea, min 3 lines)

Peer Referrals (repeatable):
  • Graduate Name
  • Full Address
  • Contact Number
  [+ Add Another Graduate]
```

---

## 8. Forum — Detailed Feature Spec

### 8.1 Thread Creation
- Category selector (styled card grid, not a dropdown).
- Title input with character counter (max 150).
- **TipTap rich text editor** (web) / **flutter_quill** (mobile):
  - Bold, italic, underline, strikethrough.
  - H2, H3 headings.
  - Bullet list, numbered list.
  - Blockquote.
  - Code block (JetBrains Mono, syntax highlighted).
  - Image embed (Supabase Storage).
  - Hyperlink with title.
- Tags input — up to 5 tags, autocomplete from existing tags.
- **Preview toggle** — side-by-side write/preview on desktop, tab toggle on mobile.
- Submit → creates thread + notifies category followers.

### 8.2 Thread List UI
```
┌────────────────────────────────────────────────────────────┐
│ [📢 Announcements]                              [+ New Post]│
│ Filter: [All] [Popular] [Unanswered] [My Posts]             │
│ Sort:   Latest Reply ▾                                      │
├────────────────────────────────────────────────────────────┤
│ [PINNED]                                                    │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 📌 Welcome to the BU Alumni Forum! Read the rules first ││
│ │    Admin · 248 replies · 5.2k views · Pinned            ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ [Regular Threads]                                           │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 💼 [Career Advice] Tips for transitioning to tech?       ││
│ │    Maria Santos · 12 replies · 234 views · 2h ago        ││
│ │    👍 24  ❤️ 8  🎉 3                                     ││
│ └─────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

### 8.3 Thread Detail UI
- Thread header: category badge, title (Playfair 28px), author info, date.
- Thread body: rendered rich text.
- Reactions bar: 5 emoji reactions with counts, tap to toggle.
- Share + Bookmark actions.
- **Replies** — flat list with 1 level of nesting (reply-to-reply).
- Reply composer pinned at bottom of page.
- **Mark as Answer** — thread author can mark one reply as accepted (green checkmark).

### 8.4 Notifications System
- Bell icon in nav with unread count badge.
- Notification types: reply to your thread, reply to your reply, @mention, reaction to your post, admin announcement.
- Realtime push via Supabase Realtime WebSocket subscription.
- Mark all read button.
- Notification preferences in settings (per-type toggle).

### 8.5 Moderation Tools
- **Report system**: flag button on every thread and reply → reason dropdown → goes to admin queue.
- **Moderator panel** (`/admin/forum`): list of reported items with approve/remove/warn actions.
- **User warnings**: soft warning (shown to user only), hard warning (public notice on post).
- **Lock thread**: prevents new replies, shows lock banner.
- **Pin thread**: appears at top of category, max 3 pins per category.
- **Move thread**: reassign to a different category.

---

## 9. Flutter App — Screen Map

```
Auth Flow
  SplashScreen → LoginScreen → SignupScreen → ForgotPasswordScreen

Main Shell (BottomNavigationBar — 5 tabs)
  Tab 1: Home (HomeScreen)
    ├── Welcome card + survey progress
    ├── Forum highlights (3 recent threads)
    └── Quick stats widgets

  Tab 2: Forum (ForumScreen)
    ├── ForumCategoryScreen (grid of categories)
    ├── ThreadListScreen (per category)
    ├── ThreadDetailScreen
    └── NewThreadScreen (TipTap → flutter_quill)

  Tab 3: Survey (SurveyScreen)
    ├── SurveyLandingScreen (status card)
    ├── GtsStep1Screen – GtsStep5Screen
    └── SurveySubmittedScreen

  Tab 4: Directory (DirectoryScreen)
    ├── Search + filter bar
    ├── AlumniListView
    └── AlumniProfileScreen

  Tab 5: Profile (ProfileScreen)
    ├── EditProfileScreen
    ├── MyForumPostsScreen
    └── SettingsScreen
        ├── Theme (dark/light)
        ├── Notification preferences
        └── About / Privacy Policy
```

---

## 10. Supabase Edge Functions

```
/functions/
├── buddy-chat/index.ts       — BUddy AI chatbot (Gemini 2.0 Flash)
│     Input:  { message, conversationHistory[] }
│     Output: { reply }
│
├── notify-reply/index.ts     — triggered by Supabase webhook on forum_replies insert
│     Creates notification rows for thread author + mentioned users
│
├── export-csv/index.ts       — admin-only; streams GTS data as CSV
│     Auth: checks profiles.role == 'admin'
│
├── thread-slug/index.ts      — generates unique slugs from thread titles
│
└── analytics-snapshot/index.ts — called by pg_cron; refreshes mv_employment_stats
```

### BUddy System Prompt
```
You are BUddy, the AI assistant for Baliuag University's Alumni Portal.
You help alumni navigate the platform, complete the CHED Graduate Tracer Survey,
and connect with the alumni community through the forum.

You can help with:
- Explaining each section of the GTS questionnaire
- Navigating the forum and finding relevant discussions
- Understanding employment statistics on the dashboard
- General questions about Baliuag University

Always respond in a friendly, professional, and encouraging tone.
Keep responses concise (under 150 words unless asked for more detail).
Do not make up information about alumni, employment rates, or university policies.
```

---

## 11. API / Supabase Client Patterns

### Auth (both apps)
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email, password,
  options: { data: { full_name: name } }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// Session listener (Next.js middleware)
supabase.auth.onAuthStateChange((event, session) => { ... });
```

### Forum — Realtime Replies
```typescript
// Subscribe to new replies in a thread
const channel = supabase
  .channel(`thread-${threadId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'forum_replies',
    filter: `thread_id=eq.${threadId}`,
  }, (payload) => {
    setReplies(prev => [...prev, payload.new as ForumReply]);
  })
  .subscribe();

return () => supabase.removeChannel(channel);
```

### Forum — Full-Text Search
```typescript
// Uses the search_vector tsvector column
const { data } = await supabase
  .from('forum_threads')
  .select('id, title, body_plain, category_id, author_id, reply_count, created_at')
  .textSearch('search_vector', query, { type: 'websearch', config: 'english' })
  .order('created_at', { ascending: false })
  .limit(20);
```

### GTS — Upsert Draft (auto-save)
```typescript
// Called on every step completion
await supabase
  .from('gts_employment')
  .upsert({ response_id: draftId, ...sectionDData },
           { onConflict: 'response_id' });
```

---

## 12. Flutter — Supabase Integration

```dart
// main.dart
await Supabase.initialize(
  url: const String.fromEnvironment('SUPABASE_URL'),
  anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY'),
);

// lib/services/forum_service.dart
class ForumService {
  final _client = Supabase.instance.client;

  Stream<List<ForumReply>> watchReplies(String threadId) {
    return _client
      .from('forum_replies')
      .stream(primaryKey: ['id'])
      .eq('thread_id', threadId)
      .order('created_at')
      .map((rows) => rows.map(ForumReply.fromJson).toList());
  }

  Future<void> postReply({
    required String threadId,
    required String body,
    String? parentId,
  }) async {
    await _client.from('forum_replies').insert({
      'thread_id': threadId,
      'author_id': _client.auth.currentUser!.id,
      'body': body,
      'body_plain': _stripHtml(body),
      'parent_id': parentId,
    });
  }
}
```

---

## 13. Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Production                         │
│                                                      │
│  ┌──────────────────┐   ┌────────────────────────┐  │
│  │   Vercel          │   │   Supabase Cloud       │  │
│  │   Next.js 15 Web │   │   (or self-hosted)     │  │
│  │   - Edge runtime │   │   - PostgreSQL 16      │  │
│  │   - ISR pages    │◄──┤   - Auth               │  │
│  │   - API routes   │   │   - Storage            │  │
│  └──────────────────┘   │   - Realtime           │  │
│                          │   - Edge Functions     │  │
│  ┌──────────────────┐   └────────────────────────┘  │
│  │  Google Play     │             ▲                  │
│  │  Flutter APK     │─────────────┘                  │
│  └──────────────────┘                                │
└─────────────────────────────────────────────────────┘
```

### Environment Variables

**Web (`.env.local`)**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # server-only (Edge Functions / export)
GOOGLE_GENAI_API_KEY=AIza...
NEXT_PUBLIC_APP_URL=https://alumni.baliuag.edu.ph
```

**Mobile (`.env` / `--dart-define`)**
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
GEMINI_API_KEY=AIza...
```

### CI/CD — GitHub Actions

**Web deploy (`.github/workflows/web.yml`)**
```yaml
name: Deploy Web
on: push: branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd "BU Alumni Web" && npm ci && npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL:      ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          GOOGLE_GENAI_API_KEY:          ${{ secrets.GOOGLE_GENAI_API_KEY }}
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token:   ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id:  ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Mobile build (`.github/workflows/mobile.yml`)**
```yaml
name: Build APK
on: push: tags: ['v*']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with: { flutter-version: '3.22.x', channel: 'stable' }
      - run: cd "BU Alumni Mobile" && flutter pub get
      - run: cd "BU Alumni Mobile" && flutter build apk --release
              --dart-define=SUPABASE_URL=${{ secrets.SUPABASE_URL }}
              --dart-define=SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }}
              --dart-define=GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}
      - uses: softprops/action-gh-release@v1
        with:
          files: BU Alumni Mobile/build/app/outputs/flutter-apk/app-release.apk
```

---

## 14. Self-Hosting Option (University Servers)

For institutions that cannot use external cloud services, Supabase is fully self-hostable via Docker Compose:

```yaml
# docker-compose.yml (condensed — see supabase/supabase for full file)
services:
  db:
    image: supabase/postgres:16.1.0
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes: [./volumes/db:/var/lib/postgresql/data]

  auth:
    image: supabase/gotrue:v2.x
    environment:
      DB_DRIVER: postgres
      API_EXTERNAL_URL: https://alumni.baliuag.edu.ph

  rest:
    image: postgrest/postgrest:v12.x

  realtime:
    image: supabase/realtime:v2.x

  storage:
    image: supabase/storage-api:v1.x

  studio:          # Admin UI (internal use only)
    image: supabase/studio:latest
    ports: ["3000:3000"]
```

Deploy on any Ubuntu 22.04+ server with 4GB RAM, 2 vCPU, 40GB SSD. Estimated cost on a Philippine cloud provider (e.g., CloudSigma PH): ~₱2,500–₱4,000/month vs. Firebase's per-read pricing.

---

## 15. Migration From Current Codebase

### Files to delete
```
BU Alumni Mobile/backend/          — entire Dart Frog server
BU Alumni Mobile/lib/services/api_client.dart
BU Alumni Mobile/lib/services/auth_service.dart   (rewrite)
BU Alumni Mobile/lib/services/data_service.dart   (rewrite)
BU Alumni Mobile/lib/firebase_options.dart
BU Alumni Mobile/lib/services/firestore_service.dart
BU Alumni Mobile/lib/services/firebase_sync_service.dart
BU Alumni Mobile/lib/services/firestore_seed.dart
BU Alumni Web/src/firebase/                       — entire firebase directory
BU Alumni Web/src/app/login/ (rewrite for Supabase auth)
```

### Files to keep / adapt
```
BU Alumni Mobile/lib/screens/        — all screens (update data sources)
BU Alumni Mobile/lib/models/         — update to match new Postgres schema
BU Alumni Mobile/lib/widgets/        — keep
BU Alumni Mobile/lib/theme/          — keep, extend with new design tokens
BU Alumni Web/src/components/ui/     — keep all Shadcn components
BU Alumni Web/src/app/dashboard/     — rewrite data fetching (Supabase)
BU Alumni Web/src/app/questionnaire/ — full rewrite (CHED GTS 5-step)
BU Alumni Web/src/ai/               — keep structure, update to Edge Function calls
```

### Data migration script
```typescript
// scripts/migrate-firebase-to-supabase.ts
// Run once against existing Firestore data
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createClient } from '@supabase/supabase-js';

const db = getFirestore();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function migrateAlumni() {
  const snapshot = await db.collection('alumni').get();
  for (const doc of snapshot.docs) {
    const data = doc.data();
    // Map Firestore fields → Postgres schema
    await supabase.from('profiles').upsert({ id: doc.id, full_name: data.name, ... });
  }
}

async function migrateResponses() {
  const snapshot = await db.collectionGroup('questionnaireResponses').get();
  for (const doc of snapshot.docs) {
    // Map to gts_responses + sub-tables
  }
}
```

---

## 16. Testing Strategy

### Web (Vitest + Playwright)
```
Unit tests (Vitest):
  - GTS form Zod schemas (all 5 sections)
  - Forum reaction toggle logic
  - Notification read/unread state
  - Analytics calculations (employment rate, curriculum relevance)

Integration tests (Vitest + Supabase local):
  - Submit GTS response end-to-end
  - Create thread + reply flow
  - Admin CSV export

E2E tests (Playwright):
  - Sign up → complete survey → submit
  - Create forum thread → receive notification
  - Admin moderates a reported post
```

### Mobile (flutter_test)
```dart
// Replace broken widget_test.dart
testWidgets('HomeScreen renders welcome card', (tester) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [currentUserProvider.overrideWithValue(mockUser)],
      child: const MaterialApp(home: HomeScreen()),
    ),
  );
  expect(find.textContaining('Welcome'), findsOneWidget);
});
```

---

## 17. Phase Delivery Timeline

| Phase | Deliverable | Duration |
|---|---|---|
| 0 | Supabase project setup, schema migration, RLS policies, seed data | Week 1 |
| 1 | Web auth (sign up/login/reset), profile pages, mobile Supabase SDK | Week 1–2 |
| 2 | GTS questionnaire (web 5-step + mobile 5-step), auto-save draft | Week 2–3 |
| 3 | Forum — thread list, thread detail, new thread, replies, realtime | Week 3–4 |
| 4 | Forum — reactions, bookmarks, notifications, search, moderation | Week 4–5 |
| 5 | Dashboard analytics (charts, materialized views, CSV export) | Week 5–6 |
| 6 | BUddy AI (Edge Function wrapper, chat UI on both platforms) | Week 6 |
| 7 | Admin panel (respondents, forum mod, user management, logs) | Week 6–7 |
| 8 | QA, accessibility audit, Playwright E2E tests, performance | Week 7–8 |
| 9 | Deployment — web to Vercel, APK to Google Play, CI/CD pipelines | Week 8 |

---

## 18. Accessibility & Performance Targets

- **WCAG 2.1 AA** compliance — all color contrast ratios ≥ 4.5:1.
- All form fields have associated `<label>` elements and ARIA descriptions.
- Forum rich text editor is fully keyboard-navigable.
- **Core Web Vitals targets**: LCP < 2.5s, CLS < 0.1, INP < 200ms.
- Images served via Next.js `<Image>` (automatic WebP, responsive sizes).
- Avatar images stored at max 512×512 in Supabase Storage, served via CDN.
- Mobile app: initial load < 3s on 4G, offline survey draft via local state persistence.

---

*Spec v2 authored May 2026. Replaces v1 (Firebase). Aligned with CHED GTS form (CHED-OPB-14-2021-11), BU ALUMNI capstone documentation (March 2026), and AGENTS.md architecture notes.*
