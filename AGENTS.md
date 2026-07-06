# BU Alumni Tracer Study — Agent Context

> **Last updated:** 2026-07-03  
> **Use this file** as the primary system prompt when starting a new session on this project.

---

## Project Overview

Two independent applications sharing a single **Supabase** backend (PostgreSQL + Auth + Storage + Realtime + Edge Functions):

| App | Tech Stack | Deploy Target |
|-----|-----------|---------------|
| **BU Alumni Web** | Next.js 15.5.19, React 19, TypeScript, Tailwind, shadcn/ui, framer-motion | Vercel (`https://bu-alumni-web.vercel.app`) |
| **BU Alumni Admin** | Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui | Vercel (`bu-alumni-admin.vercel.app`) |
| **BU Alumni Mobile** | Flutter 3.22+, Riverpod 2, GoRouter, Supabase Flutter SDK | Manual APK release |

---

## Repository Layout

```
/
├── BU Alumni Web/          # Next.js 15 App Router (primary user-facing portal)
│   ├── src/app/            # Pages: login, signup, dashboard, survey, forum, directory, profile, settings, admin
│   ├── src/components/     # Shared React components + 35+ shadcn/ui primitives
│   ├── src/components/ui/  # shadcn components (button, card, dialog, form, etc.)
│   ├── src/lib/            # utils.ts (cn), types.ts, supabase/ (client + server + middleware)
│   ├── src/hooks/          # use-toast.ts
│   ├── public/logos/bu.png # BU logo
│   └── .env                # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GEMINI_API_KEY
│
├── BU Alumni Admin/        # Next.js 15 admin dashboard
│   ├── src/app/            # Admin pages: login, dashboard, users, forum-moderation, analytics, settings
│   └── (same structure as web)
│
├── BU Alumni Mobile/       # Flutter Android app
│   ├── lib/
│   │   ├── main.dart       # Supabase init, ProviderScope, GoRouter
│   │   ├── router.dart     # Route definitions
│   │   ├── models/         # Dart data models
│   │   ├── providers/      # Riverpod providers
│   │   ├── screens/        # UI screens (auth, home, forum, survey, directory, profile)
│   │   ├── services/       # Business logic
│   │   └── widgets/        # Reusable widgets
│   └── Releases/           # Built APKs
│
├── supabase/
│   ├── migrations/           # PostgreSQL schema DDL
│   ├── seed.sql              # Seed data
│   ├── functions/            # Deno Edge Functions
│   └── email-templates/      # Custom Supabase Auth email templates (HTML)
│       ├── buddy-chat/       # BUddy AI chatbot (Moonshot kimi-k2.5)
│       ├── notify-reply/     # Forum reply notifications
│       ├── export-csv/       # Admin CSV export
│       └── thread-slug/      # Slug generator
│
└── assets/logos/bu.png       # Shared brand asset
```

---

## Key Architectural Decisions

1. **Shared Supabase backend** — Both web and mobile use the same Supabase project (`lalddttyizimgsmnhuet.supabase.co`). No Firebase, no Dart Frog, no split backends.
2. **Thread routing by ID** — Forum URLs are `/forum/${categorySlug}/${thread.id}` (not slug-based) to avoid slug lookup failures.
3. **Voting via `apply_vote` RPC** — Single source of truth for upvotes/downvotes across web and mobile.
4. **Cookie-based SSR auth** (web) — Uses `@supabase/ssr` with middleware.ts for session refresh.
5. **APK on Google Drive** — Mobile releases are uploaded to Google Drive; the download URL and version are stored in `site_settings` and editable from the admin portal so the web `/mobile-app` page updates without a code change.

---

## Database Schema (Key Tables)

- `auth.users` — Supabase Auth managed
- `profiles` — Extends auth.users with alumni data (college, degree, batch_year, avatar_url, role)
- `questionnaires` — Survey definitions
- `gts_responses`, `gts_section_a`, `gts_degrees`, `gts_prof_exams`, `gts_course_reasons`, `gts_trainings`, `gts_employment`, `gts_skills_feedback` — CHED Graduate Tracer Study data
- `forum_categories`, `forum_threads`, `forum_replies`, `forum_reactions`, `forum_bookmarks` — Forum
- `notifications` — Realtime notifications
- `mv_employment_stats` — Materialized view for analytics
- `site_settings` — Global configuration (chatbot provider/model/key/system prompt, mobile APK URL/version)
- RPC `get_alumni_map_pins()` — Anonymous aggregated alumni location/program/industry data for the career map

**RLS:** All tables have Row-Level Security enabled. Profiles readable by all signed-in users, writable by owner or admin. GTS responses only owner + admin. Forum readable by all signed-in, writable by author/admin.

---

## Features Inventory

### Auth (Web + Mobile)
- Email/password sign-up with email confirmation
- Login with session persistence
- Forgot password / reset password flow
- Profile auto-populated from auth metadata
- **Custom Supabase Auth email templates** in `supabase/email-templates/` (confirm signup, password reset, magic link, invite, email change, reauthentication, plus password/email changed notifications)

### Landing Page (Web)
- Hero section with BU branding
- Feature highlights, statistics, testimonials
- Mobile app promo card with QR code
- **No** "Made with care" footer line

### Dashboard (Web)
- Employment stats charts (Recharts)
- Recent forum threads
- Announcements (staff-only posting, 3-layer protection)
- Mobile app download card
- **Alumni Career Map** (`/career-map`) — interactive Philippine map showing submitted tracer-study locations, programs, and industries

### CHED Graduate Tracer Survey (Web + Mobile)
- 5 steps: General Info → Educational Background → Trainings → Employment Data → Skills & Feedback
- Skip sections freely; cross-step validation on final submit
- Toast listing incomplete sections
- Required fields marked with red asterisk (`RequiredLabel` component)
- Auto-save draft to `gts_responses` (status = 'draft')
- Review screen before submission

### Forum (Web + Mobile)
- Categories with thread counts
- Thread list with voting scores, reply counts, timestamps
- **Thread detail:** Nested replies, voting, bookmarks, edit/delete (author/admin), search
- Realtime reply updates via Supabase Realtime (`postgres_changes` on `forum_replies`)
- Full-text search via `search_vector` + `websearch`
- Voting: auto-upvote on creation; green upvote / terracotta downvote buttons
- Bookmarks: dedicated `/forum/bookmarks` page
- **Delete confirmations:** AlertDialog for threads and replies
- Staff-only announcements posting

### Directory (Web)
- Searchable/filterable alumni directory
- Profile cards with avatar + fallback initials

### Profile (Web + Mobile)
- View/edit personal info
- Avatar upload with conditional rendering (fallback initials when no photo)

### Settings (Web + Mobile)
- Dark/light mode toggle (`next-themes`, `defaultTheme="system"`)
- Notification preferences
- Account management

### Admin Portal
- User management, forum moderation, analytics
- PWA manifest, security headers (CSP with `wss://*.supabase.co`)
- Vote counts in forum moderation
- BU logo with white background

### BUddy AI Chatbot (Web)
- Floating chat widget (bottom-right)
- Calls `/api/buddy-chat` Next.js API route
- **Model:** `kimi-k2.5` via Moonshot API (`https://api.moonshot.ai/v1`)
- System prompt: friendly BU alumni assistant, <150 words, no made-up stats
- Conversation history maintained in client state
- Error fallback: "BUddy is temporarily unavailable"

### Privacy Policy Glance Preview (Signup)
- Click "Privacy Policy" → opens formatted modal with full Baliuag University Data Privacy Statement
- Hardcoded content (sections: What info collected, How collected, Who uses it, etc.)
- **Scroll-to-agree:** Checkbox disabled until user scrolls to bottom
- Tooltip on disabled checkbox: "Please scroll through the Privacy Policy first to enable agreement."

---

## Environment Variables

### Web (`.env` / Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://lalddttyizimgsmnhuet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # server-only
KIMI_API_KEY=sk-...                   # Moonshot API key for BUddy
GEMINI_API_KEY=AIzaSy...              # Fallback / other uses
NEXT_PUBLIC_APP_URL=https://bu-alumni-web.vercel.app
```

### Mobile (`--dart-define` or `.env`)
```
SUPABASE_URL=https://lalddttyizimgsmnhuet.supabase.co
SUPABASE_ANON_KEY=...
GEMINI_API_KEY=...
```

### Edge Functions (Supabase Secrets)
```
KIMI_API_KEY=sk-...                   # For buddy-chat edge function
KIMI_API_BASE=https://api.moonshot.ai/v1
KIMI_MODEL=kimi-k2.5
```

---

## Build & Deploy Commands

### Web
```bash
cd "BU Alumni Web"
npm install
npm run dev        # localhost:9002
npm run build
npm run typecheck  # CI only; ignored locally via next.config.ts
npm run lint
```

### Mobile
```bash
cd "BU Alumni Mobile"
flutter pub get
flutter run -d <device_id>
flutter build apk --release
```

### Deploy to Vercel (Web)
```bash
cd "BU Alumni Web"
npx vercel --prod --token=<TOKEN>
```

---

## Brand & Design Tokens

- **Primary:** `#4C992D` (medium green)
- **Dark green:** `#004011` (forest)
- **Light bg:** `#E0F2E7` (mint)
- **Web fonts:** Playfair Display (headlines), Plus Jakarta Sans (body)
- **Mobile font:** Goudy Old Style Roman
- **Logo:** White background container (`bg-white border border-border`) to avoid green-on-green blending

---

## Pre-existing Issues (Do Not Fix Unless Asked)

### Web TypeScript (ignored in non-CI builds)
- `signup/page.tsx:142` — Type error
- `signup/page.tsx:171` — Type error  
- `lib/supabase/client.ts:15` — Type error

### Flutter Warnings
- Deprecated `value` on dropdowns
- Unused `_editingReplyId` variable
- `use_build_context_synchronously` lints

---

## Common Gotchas

1. **Forum thread URLs use IDs, not slugs** — Always link to `/forum/${categorySlug}/${thread.id}`. Slug lookup was removed due to encoding issues.
2. **Avatar conditional rendering** — Always use `{profile?.avatar_url && <AvatarImage src={...} />}` before `<AvatarFallback>` to ensure initials show when no photo exists.
3. **Survey skip/validation** — Users can skip steps, but on final submit all required fields across all steps are validated. Toast shows which sections are incomplete.
4. **Edge Function vs API Route for BUddy** — The web app uses `/api/buddy-chat` (Next.js API route) rather than the Supabase Edge Function because the edge function requires separate Supabase CLI deployment for env var changes. The edge function code is kept in sync for future use.
5. **Moonshot API endpoint** — Must use `https://api.moonshot.ai/v1` (international), NOT `.cn` (China). Keys are not interchangeable between the two.
6. **next.config.ts** has `ignoreBuildErrors: process.env.CI !== 'true'` — Type errors won't block local or Vercel builds unless `CI=true`.

---

## When Modifying Code

- **Web:** Use `@/` path alias for `src/`. Prefer shadcn/ui components from `src/components/ui/` before building custom.
- **Mobile:** Follow `flutter_lints`. Use Riverpod for state management. UI goes in `screens/` and `widgets/`, logic in `services/` and `providers/`.
- **Database:** Schema changes go in `supabase/migrations/`. RLS policies must be included.
- **Edge Functions:** Written in Deno. Use `verifyUser` from `../_shared/auth.ts` for JWT verification.
- **If you modify AGENTS.md conventions:** Update this file to keep it current.
