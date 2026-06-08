# ALUMNI: W.A.M — Spec v3 · Auth + Admin Portal
**BU Alumni Tracer Study Platform — Baliuag University**
Version 3.0 · May 2026 · Auth Overhaul · Separate Admin Portal

---

## 0. What Changed from v2

This spec is additive — everything in v2 stands. The changes in v3 are:

| # | Area | v2 | v3 |
|---|---|---|---|
| 1 | Name field | Single `full_name` text input | Three separate fields: First, Middle, Last |
| 2 | Password UX | Basic input | Visibility toggle + real-time strength meter |
| 3 | Password rules | None defined | Enforced: 8+ chars, uppercase, number, special char |
| 4 | Confirm password | Missing | Required field + match validation |
| 5 | Email validation | Basic HTML5 | Regex + format feedback + uniqueness check |
| 6 | 2FA | None | TOTP (authenticator app) + email OTP fallback |
| 7 | BU Logo | Placeholder circle | `assets/logos/bu.png` — both portals |
| 8 | Admin | Route-guarded section of web app | **Completely separate Next.js app** |
| 9 | API key error | Supabase anon key missing in env | Fix: env validation on startup + onboarding guide |

---

## 1. Fixing "Invalid API Key" on Signup

The error occurs when `NEXT_PUBLIC_SUPABASE_ANON_KEY` is undefined at runtime. Supabase's JS client silently initialises with `undefined` as the key and the first network call returns a 401.

### Root cause & fix

```typescript
// src/lib/supabase/client.ts
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[BU Alumni] Missing Supabase environment variables.\n' +
    'Copy .env.example to .env.local and fill in your project URL and anon key.\n' +
    'Get them from: https://supabase.com/dashboard → Project Settings → API'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

Add to `next.config.ts` so the build fails fast if variables are missing:

```typescript
// next.config.ts
const requiredEnv = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});
```

### `.env.example` (commit this, not `.env.local`)

```env
# Supabase — get from supabase.com/dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Only needed for server-side admin operations (Edge Functions, CSV export)
# NEVER expose this to the browser
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI
GOOGLE_GENAI_API_KEY=AIzaSy...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

---

## 2. Database Schema Changes — Name Split

### `public.profiles` update

```sql
-- Drop old full_name column, add split name columns
alter table public.profiles
  drop column if exists full_name,
  add column first_name  text not null default '',
  add column middle_name text,              -- nullable — not everyone has one
  add column last_name   text not null default '';

-- Generated column for display/search convenience
alter table public.profiles
  add column display_name text generated always as (
    trim(first_name || ' ' || coalesce(middle_name || ' ', '') || last_name)
  ) stored;

-- Full-text search index on names
create index profiles_name_search_idx on public.profiles
  using gin(to_tsvector('simple', display_name));
```

### Updated `handle_new_user` trigger

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, first_name, middle_name, last_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    new.raw_user_meta_data->>'middle_name',   -- nullable
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    'alumni'
  );
  return new;
end;
$$;
```

### Supabase sign-up call (web)

```typescript
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      first_name:  firstName.trim(),
      middle_name: middleName.trim() || null,
      last_name:   lastName.trim(),
    },
    emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
  },
});
```

### Flutter sign-up call (mobile)

```dart
await Supabase.instance.client.auth.signUp(
  email: email,
  password: password,
  data: {
    'first_name':  firstName.trim(),
    'middle_name': middleName.isEmpty ? null : middleName.trim(),
    'last_name':   lastName.trim(),
  },
);
```

---

## 3. Auth — Full Signup Form Specification

### 3.1 Field Layout

```
┌─────────────────────────────────────────────────────┐
│  [BU Logo 48px]  ALUMNI Portal · Baliuag University  │
│  ─────────────────────────────────────────────────── │
│  Create your account                                  │
│  Already have one? Sign in                           │
│                                                       │
│  First Name *          Middle Name         Last Name *│
│  [_______________]  [_______________]  [_____________]│
│                                                       │
│  Email Address *                                      │
│  [___________________________________________]        │
│  ✓ looks good  / ✗ invalid format                    │
│                                                       │
│  Password *                               [👁 Show]   │
│  [___________________________________________]        │
│  Strength: [░░░░░░░░░░] Weak / Fair / Strong / Secure│
│  ✓ 8+ characters    ✓ Uppercase letter                │
│  ✓ Number (0–9)     ✓ Special character (!@#$%^&*)   │
│                                                       │
│  Confirm Password *                       [👁 Show]   │
│  [___________________________________________]        │
│  ✓ Passwords match  / ✗ Passwords do not match       │
│                                                       │
│  College / School *          Degree *                 │
│  [Select college ▾]          [e.g. BS Computer Sci.] │
│                                                       │
│  Batch Year *                                         │
│  [Select year ▾]                                     │
│                                                       │
│  [✓] I agree to the Privacy Policy and Terms         │
│                                                       │
│  [          Create Account          ]                 │
│                                                       │
│  Or sign up with:  [Google]  [Microsoft]             │
└─────────────────────────────────────────────────────┘
```

### 3.2 Name Field Rules

| Field | Required | Min | Max | Validation |
|---|---|---|---|---|
| First Name | Yes | 2 | 50 | Letters, hyphens, apostrophes only. Trim on blur. |
| Middle Name | No | — | 50 | Same charset. Shown greyed: "Optional". |
| Last Name | Yes | 2 | 50 | Same charset. |

Regex: `/^[a-zA-ZÀ-ÿ\s\-\'\.]+$/` — covers Filipino names with accents, hyphenated surnames (e.g. Santos-Cruz), and names with apostrophes (e.g. O'Brien).

Error messages:
- Empty required field on blur → `"First name is required"`
- Invalid chars → `"Name may only contain letters, hyphens, and apostrophes"`
- Too short → `"Name must be at least 2 characters"`

### 3.3 Email Validation (Multi-layer)

Layer 1 — Client-side format check (on blur):
```typescript
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

// Additional checks
const hasConsecutiveDots = /\.{2,}/.test(email);
const hasLeadingDot = email.startsWith('.');
const hasDomainDot = email.split('@')[1]?.includes('.');
```

Layer 2 — Domain existence (debounced, 800ms after typing stops):
```typescript
// Supabase Edge Function: check-email
// Uses dns.lookup to verify the domain MX record exists
// Returns: { valid: boolean, suggestion?: string }
// e.g. "Did you mean gmail.com?" for "gmial.com"
```

Layer 3 — Uniqueness check (on blur, after format passes):
```typescript
const { data } = await supabase
  .from('profiles')
  .select('id')
  .eq('email', email.toLowerCase())
  .maybeSingle();

if (data) setError('email', { message: 'This email is already registered. Sign in instead.' });
```

Layer 4 — Email confirmation (Supabase sends on signup):
- User must click the confirmation link before they can log in.
- Link expires in 24 hours.
- Resend link shown on login if email not confirmed.

### 3.4 Password Rules

Enforced requirements (all must pass before form can submit):

| Rule | Check | Error message |
|---|---|---|
| Minimum 8 characters | `length >= 8` | "At least 8 characters" |
| Uppercase letter | `/[A-Z]/.test(pw)` | "One uppercase letter (A–Z)" |
| Lowercase letter | `/[a-z]/.test(pw)` | "One lowercase letter (a–z)" |
| Number | `/[0-9]/.test(pw)` | "One number (0–9)" |
| Special character | `/[!@#$%^&*()_+\-=\[\]{};\':\"\\|,.<>\/?]/.test(pw)` | "One special character (!@#$%…)" |
| Not a common password | Check against top-1000 list in a `Set<string>` | "Password is too common" |

Strength meter scoring (0–4, one point per rule met):
- 0–1 → "Weak" (red)
- 2 → "Fair" (amber)
- 3 → "Strong" (light green)
- 4–5 → "Secure" (dark green)

Password visibility toggle:
- Eye icon button inside the input's right padding.
- Toggles `input type` between `password` and `text`.
- Aria-label: `"Show password"` / `"Hide password"`.
- Both Password and Confirm Password fields have independent toggles.

### 3.5 Confirm Password

- Validated on blur and on every keystroke after the first blur.
- Error: `"Passwords do not match"` (shown with red border + icon).
- Success: `"Passwords match"` (shown with green check + icon).
- Confirm field is disabled until the main password field passes all 5 rules.

### 3.6 Form-level Validation (Zod)

```typescript
// src/lib/schemas/signup.ts
import { z } from 'zod';

const nameField = z
  .string()
  .min(2, 'At least 2 characters')
  .max(50, 'Too long')
  .regex(/^[a-zA-ZÀ-ÿ\s\-\'\.]+$/, 'Letters, hyphens, and apostrophes only');

export const SignupSchema = z
  .object({
    firstName:    nameField,
    middleName:   nameField.optional().or(z.literal('')),
    lastName:     nameField,
    email:        z.string().email('Invalid email address').toLowerCase(),
    password:     z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'One uppercase letter')
      .regex(/[a-z]/, 'One lowercase letter')
      .regex(/[0-9]/, 'One number')
      .regex(/[^a-zA-Z0-9]/, 'One special character'),
    confirmPassword: z.string(),
    college:      z.string().min(1, 'Select your college'),
    degree:       z.string().min(2, 'Enter your degree'),
    batchYear:    z.number().int().min(1990).max(new Date().getFullYear()),
    agreedToTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to continue' }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
```

---

## 4. Two-Factor Authentication (2FA)

### 4.1 Overview

2FA is optional at signup but **strongly encouraged** via a prompt on first login. Admins have 2FA **enforced** — they cannot access the admin portal without it.

### 4.2 Methods Supported

| Method | Library | Notes |
|---|---|---|
| TOTP (Google Authenticator, Authy, etc.) | Supabase MFA built-in | Primary method |
| Email OTP | Supabase built-in | Fallback if TOTP device lost |

### 4.3 TOTP Setup Flow (Web)

```
Step 1: User goes to Settings → Security → Enable 2FA
Step 2: Show QR code from supabase.auth.mfa.enroll({ factorType: 'totp' })
Step 3: User scans with authenticator app
Step 4: User enters 6-digit code to verify → supabase.auth.mfa.challenge() + verify()
Step 5: Show 10 backup codes (store hashed in DB) → force download/copy
Step 6: 2FA is now active on the account
```

```typescript
// Enroll TOTP
const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
// data.totp.qr_code  → render as <img src={data.totp.qr_code} />
// data.totp.secret   → show as manual entry fallback
// data.id            → factorId, store for verify step

// Verify enrollment
const { data: challenge } = await supabase.auth.mfa.challenge({ factorId });
await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code: otpInput });
```

### 4.4 Login with 2FA

```
Standard login → Supabase returns session with assurance level 'aal1'
If user has 2FA enabled:
  → Show 2FA input screen (6-digit code)
  → supabase.auth.mfa.challenge() + verify()
  → Session upgrades to assurance level 'aal2'
  → Redirect to dashboard

If code is wrong: show error, allow 3 attempts before 60-second lockout
If no device: show "Use email OTP instead" link
```

### 4.5 Email OTP Fallback

```typescript
// Send OTP to registered email
await supabase.auth.signInWithOtp({ email });
// User receives 6-digit code, valid for 10 minutes
await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
```

### 4.6 Flutter (Mobile) — Biometric Gate

On mobile, 2FA is handled via:
1. **Biometric auth** (fingerprint/face ID) using `local_auth` package as the primary gate.
2. TOTP code entry as fallback if biometrics fail.

```dart
// pubspec.yaml: local_auth: ^2.1.8
final didAuthenticate = await auth.authenticate(
  localizedReason: 'Authenticate to access your BU Alumni account',
  options: const AuthenticationOptions(biometricOnly: false),
);
```

---

## 5. BU Logo Integration

The BU logo is stored at `assets/logos/bu.png` in the shared assets folder.

### Web Portal

```typescript
// next.config.ts — allow image from assets
module.exports = {
  images: {
    domains: [],  // served locally, no external domain needed
  },
};

// Usage in auth layout and nav
import Image from 'next/image';
import buLogo from '@/assets/logos/bu.png';

<Image
  src={buLogo}
  alt="Baliuag University"
  width={48}
  height={48}
  priority         // load immediately — above the fold
  className="rounded-full"
/>
```

Logo placement rules:
- **Auth pages** (login, signup, forgot password): 64px centered above the form card.
- **Top navigation**: 36px, leftmost element, next to "ALUMNI Portal" wordmark.
- **Admin portal**: 32px in the sidebar header, next to "ADMIN Portal" wordmark.
- **Email templates** (confirmation, password reset): 80px centered, top of email.
- **Flutter app**: loaded as `AssetImage('assets/logos/bu.png')` in `AppBar` and splash screen.

### Flutter (Mobile)

```yaml
# pubspec.yaml — assets block
flutter:
  assets:
    - assets/logos/bu.png
    - assets/logos/bu@2x.png   # optional retina version
    - assets/fonts/GoudyOldStyleRoman.ttf
```

```dart
// In AppBar
AppBar(
  leading: Padding(
    padding: const EdgeInsets.all(8),
    child: Image.asset('assets/logos/bu.png'),
  ),
  title: Text('ALUMNI Portal',
    style: TextStyle(fontFamily: 'GoudyOldStyleRoman', fontSize: 18)),
)
```

---

## 6. Separate Admin Portal

### 6.1 Why Separate?

| Concern | Shared app | Separate admin app |
|---|---|---|
| Security surface | Alumni JS bundle contains admin code | Admin code never shipped to alumni |
| Access control | Route-guarded pages | Separate domain, separate deploy, separate Supabase service-role key |
| URL | `/admin/*` visible in alumni URL bar | `admin.alumni.baliuag.edu.ph` — not guessable by alumni |
| Bundle size | Admin charts/tables add ~80KB to alumni load | Alumni app stays lean |
| Team independence | Admin UI changes risk breaking alumni UI | Separate repo, separate CI pipeline |

### 6.2 Repository Structure

```
/
├── bu-alumni-app/              ← Next.js 15 — alumni web portal (port 3000)
├── bu-alumni-admin/            ← Next.js 15 — admin portal (port 3001)  ← NEW
├── bu-alumni-mobile/           ← Flutter app
├── assets/                     ← Shared (logos, fonts)
└── supabase/                   ← Shared DB schema, migrations, edge functions
    ├── migrations/
    ├── functions/
    └── seed.sql
```

### 6.3 Admin Portal — Tech Stack

```
Next.js 15 (App Router)         — framework
TypeScript 5                    — language
Tailwind CSS 4                  — styling (same design tokens as alumni app)
Shadcn/UI + Radix               — component primitives
Recharts + Chart.js             — analytics visualizations
TanStack Table v8               — sortable, filterable data tables
Supabase JS (service-role key)  — full DB access (bypasses RLS for admin ops)
Supabase Realtime               — live log stream, live response feed
date-fns                        — date formatting for logs/charts
react-csv                       — CSV export
Vercel / Railway                — deployed at admin.alumni.baliuag.edu.ph
```

### 6.4 Admin Authentication

The admin portal uses the **same Supabase project** but with stricter auth checks:

```typescript
// bu-alumni-admin/src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,   // service role for middleware
    { cookies: { ... } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'moderator'].includes(profile.role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Enforce 2FA for admins
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user.app_metadata.aal !== 'aal2') {
    return NextResponse.redirect(new URL('/login?mfa_required=true', request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ['/((?!login|unauthorized|_next).*)'] };
```

### 6.5 Admin Portal — Page Inventory

#### `/` → Dashboard (Overview)
Real-time snapshot of the platform state.

**Widgets:**
- KPI row: Total alumni, total responses, response rate %, employment rate %.
- Response timeline chart: Submissions per day (last 30 days) — line chart.
- Employment breakdown: Donut chart — employed / not employed / never employed.
- Live feed: Last 10 submissions with name, degree, batch year, and submission time.
- Alerts: Overdue survey (deadline < 7 days), pending reported forum posts.

#### `/respondents` → GTS Response Management
Full table of all GTS submissions.

**Table columns:** Name, Email, Degree, College, Batch Year, Submission Date, Status (draft/submitted), Employment Status.

**Features:**
- Global search across name, email, degree.
- Filter chips: College, Batch Year, Status, Employment Status.
- Sort on every column.
- Row click → full response detail view (read-only).
- Bulk export (selected rows or full filtered set) → CSV.
- Column visibility toggle.
- Pagination (50 per page default).

**CSV export format:**
```
ID, Last Name, First Name, Middle Name, Email, College, Degree, Batch Year,
Civil Status, Sex, Birthday, Region, Province,
Employment Status, Occupation, Line of Business, Place of Work,
Job Level (First), Job Level (Current), Initial Salary Range,
Is Curriculum Relevant, Useful Competencies,
Submitted At, Survey Version
```

#### `/analytics` → Insights & Charts
Deep-dive analytics pulled from `mv_employment_stats` and live Firestore.

**Charts:**
1. Employment rate by college — horizontal bar chart.
2. Employment rate by batch year — line chart with trend.
3. Time to first job — stacked bar (< 1 mo, 1–6 mo, 7–11 mo, 1–2 yr, 2+ yr).
4. Job level distribution — grouped bar (first job vs current job).
5. Salary range distribution — histogram.
6. Top industries — ranked horizontal bar (Q20 line of business).
7. Curriculum relevance rate — gauge chart with college breakdown.
8. Top competencies — word cloud / ranked list (Q33).
9. Response rate by degree program — table + sparkline.

**Filters:** Date range, College, Degree, Batch Year — apply globally to all charts.

**Export:** Download any chart as PNG. Download underlying data as CSV.

#### `/questionnaires` → Survey Management
Manage which GTS questionnaire is active.

**Features:**
- List all questionnaire versions (title, created date, response count, status: active/draft/archived).
- Create new questionnaire → form builder with drag-and-drop section ordering.
- Edit draft questionnaire (cannot edit a questionnaire with existing responses).
- Set active questionnaire (only one can be active at a time).
- Set deadline date with countdown display.
- Preview questionnaire as alumni would see it.
- Duplicate a past questionnaire as a new draft.

#### `/forum` → Forum Moderation
Moderation queue and controls.

**Views:**
- **Reports queue**: Flagged threads and replies, sorted by report count. Each item shows: content preview, reporter, reason, time. Actions: Dismiss / Warn user / Delete post / Ban user.
- **All threads**: Full list with pin/lock/move/delete controls.
- **User warnings**: History of warnings issued, with ability to escalate to ban.
- **Category management**: Reorder, rename, lock, or add forum categories.

#### `/users` → User Management
Manage alumni accounts and roles.

**Table columns:** Avatar, Name, Email, Degree, Batch Year, Role, 2FA Status, Created At, Last Active.

**Features:**
- Search by name or email.
- Filter by role, college, batch year.
- Role change: promote to moderator, demote to alumni.
- Account actions: Verify email, suspend (soft delete), delete account.
- View full profile and survey submission status.
- Export user list as CSV.

#### `/logs` → Audit Log
Complete audit trail of all admin actions and system events.

**Log types:**
- `auth.signup` — new account created.
- `auth.login` — login event with IP, user agent.
- `auth.mfa_enabled` / `auth.mfa_disabled`.
- `admin.role_change` — who changed whose role.
- `admin.post_deleted` — which post, by whom.
- `admin.user_suspended`.
- `survey.submitted` — which user, which questionnaire.
- `survey.export` — admin who exported, row count.
- `system.questionnaire_activated`.

**Table features:** Search, date range filter, log type filter, real-time stream via Supabase Realtime, CSV export.

#### `/settings` → Admin Settings
- Active questionnaire deadline.
- Email template editor (confirmation email, survey reminder).
- 2FA enforcement toggle (require all admins to have 2FA).
- Platform maintenance mode.
- Admin profile + own 2FA management.

### 6.6 Admin Database Schema Additions

```sql
-- Audit log table
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id),
  action      text not null,           -- e.g. 'admin.role_change'
  target_id   uuid,                    -- affected user/thread/response ID
  target_type text,                    -- 'user' | 'thread' | 'response' | 'system'
  metadata    jsonb default '{}',      -- { old_role, new_role } etc.
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz default now()
);

create index audit_logs_actor_idx  on public.audit_logs(actor_id, created_at desc);
create index audit_logs_action_idx on public.audit_logs(action, created_at desc);

-- RLS: only admins can read logs
alter table public.audit_logs enable row level security;
create policy "logs_admin_only" on public.audit_logs for all
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Forum reports
create table public.forum_reports (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid not null references public.profiles(id),
  target_type   text not null check (target_type in ('thread', 'reply')),
  target_id     uuid not null,
  reason        text not null check (reason in (
                  'spam', 'harassment', 'misinformation',
                  'inappropriate', 'off_topic', 'other')),
  details       text,
  status        text default 'pending'
                  check (status in ('pending', 'resolved', 'dismissed')),
  resolved_by   uuid references public.profiles(id),
  resolved_at   timestamptz,
  created_at    timestamptz default now()
);

-- Edge Function: log-audit (called from admin actions)
-- supabase/functions/log-audit/index.ts
-- Inserts into audit_logs with the actor's session info
```

### 6.7 Admin Portal — Environment Variables

```env
# bu-alumni-admin/.env.local

# Same Supabase project — but service role key (NOT the anon key)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# The anon key is still needed for auth (client-side session)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Used in links back to the alumni app
NEXT_PUBLIC_ALUMNI_APP_URL=https://alumni.baliuag.edu.ph

# Admin portal's own URL
NEXT_PUBLIC_APP_URL=https://admin.alumni.baliuag.edu.ph
```

---

## 7. Auth Flow — Complete State Machine

```
[/signup]
  → validate all fields (Zod)
  → supabase.auth.signUp()
    ├── error: duplicate email → "Email already registered"
    ├── error: weak password  → "Password does not meet requirements"
    └── success → "Check your email" confirmation screen
          → user clicks email link
          → /auth/callback → session created → /dashboard
            → 2FA prompt (optional, dismissible with "Ask me later")

[/login]
  → supabase.auth.signInWithPassword()
    ├── error: invalid credentials → "Incorrect email or password" (generic)
    ├── error: email not confirmed → show resend link
    └── success (aal1 session)
          ├── no 2FA enrolled → /dashboard
          └── 2FA enrolled → /login/2fa
                → enter 6-digit TOTP or "Use email instead"
                → supabase.auth.mfa.verify()
                  ├── fail (3 tries) → 60s lockout → back to /login
                  └── success (aal2 session) → /dashboard

[/forgot-password]
  → enter email → supabase.auth.resetPasswordForEmail()
  → email sent → /auth/reset-password?token=...
  → enter new password (same rules as signup)
  → supabase.auth.updateUser({ password })
  → redirect to /login with success toast

[Admin portal /login]
  → same flow but middleware enforces aal2 (2FA required)
  → if no 2FA enrolled: redirect to /login/setup-2fa before access granted
```

---

## 8. CI/CD — Admin Portal Pipeline

```yaml
# .github/workflows/admin.yml
name: Deploy Admin Portal
on:
  push:
    branches: [main]
    paths:
      - 'bu-alumni-admin/**'
      - 'supabase/migrations/**'

jobs:
  deploy-admin:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - name: Install & build
        run: cd bu-alumni-admin && npm ci && npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL:      ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY:     ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      - name: Deploy to Vercel (admin project)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token:      ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id:     ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_ADMIN_PROJECT_ID }}
          working-directory: bu-alumni-admin
          vercel-args: '--prod'
```

---

## 9. Summary of All Changes vs v2

| Section | Change |
|---|---|
| `profiles` table | `full_name` → `first_name`, `middle_name`, `last_name`, `display_name` (generated) |
| Signup form | 3 name fields, email multi-layer validation, password strength meter, confirm password, BU logo |
| Password rules | 8+ chars, uppercase, lowercase, number, special char, not in top-1000 |
| 2FA | TOTP (Supabase MFA) + email OTP fallback; enforced for admins; biometric on mobile |
| API key bug | Env validation on startup; fail-fast build step; `.env.example` committed |
| BU Logo | `assets/logos/bu.png` in all auth pages, nav, admin portal, email templates |
| Admin portal | Separate Next.js app (`bu-alumni-admin`), separate domain, service-role key, 2FA enforced |
| Admin pages | Dashboard, Respondents, Analytics, Questionnaires, Forum Mod, Users, Logs, Settings |
| Audit log | New `audit_logs` table with RLS (admin-only), realtime stream in admin UI |
| Forum reports | New `forum_reports` table with moderation workflow |

---

*Spec v3 authored May 2026. Additive to v2. Aligned with AGENTS.md and CHED GTS form.*
