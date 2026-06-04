# BU Alumni Tracer Study - Agent Guide

This repository contains two independent applications for Baliuag University's Graduate Tracer Study (GTS):
1. **BU Alumni Mobile** — Flutter Android app with Supabase backend.
2. **BU Alumni Web** — Next.js 15 web portal with Supabase backend.

> **Critical Architecture Note:** Both apps now share a single **Supabase** backend (PostgreSQL + Auth + Storage + Realtime). This is a full ground-up rebuild (v2.0) replacing the previous split backend (Firebase for web, Dart Frog/SQLite for mobile).

---

## Repository Layout

```
/
├── BU Alumni Mobile/          # Flutter application
│   ├── lib/                   # Flutter source code (rebuilt from scratch)
│   ├── android/               # Android platform files
│   ├── assets/                # Fonts, logos, images
│   ├── test/                  # Flutter tests
│   ├── pubspec.yaml
│   └── README.md
├── BU Alumni Web/             # Next.js 15 web application
│   ├── src/
│   │   ├── app/               # Next.js App Router pages (rebuilt)
│   │   ├── components/        # Shared React components + Shadcn UI
│   │   ├── lib/               # Utilities, types, Supabase clients
│   │   └── hooks/             # Custom hooks
│   ├── package.json
│   └── README.md
├── supabase/                  # Shared backend
│   ├── migrations/            # PostgreSQL schema DDL
│   ├── seed.sql               # Seed data
│   └── functions/             # Edge Functions
│       ├── buddy-chat/        # Gemini AI chatbot
│       ├── notify-reply/      # Forum reply notifications
│       ├── export-csv/        # Admin CSV export
│       └── thread-slug/       # Slug generator
├── assets/                    # Shared brand assets (fonts, logos)
└── AGENTS.md                  # This file
```

---

## BU Alumni Mobile (Flutter + Supabase)

### Technology Stack
- **Frontend:** Flutter 3.22+, Material 3
- **State Management:** Flutter Riverpod 2
- **Routing:** GoRouter
- **Backend:** Supabase Flutter SDK (auth, database, storage, realtime)
- **Charts:** fl_chart
- **AI Chatbot:** google_generative_ai (Gemini 2.0 Flash) — "BUddy"
- **Icons/Font:** font_awesome_flutter, Goudy Old Style Roman

### Code Organization
```
lib/
├── main.dart                  # Entry point: Supabase init, ProviderScope, GoRouter
├── router.dart                # Route definitions
├── models/                    # Dart data models
├── providers/                 # Riverpod providers
├── screens/                   # UI screens
│   ├── auth/
│   ├── home/
│   ├── forum/
│   ├── survey/
│   ├── directory/
│   └── profile/
├── services/                  # Business logic
├── theme/app_theme.dart       # Light & dark ThemeData
└── widgets/                   # Reusable widgets
```

### Build Commands
```bash
flutter pub get
flutter run -d <device_id>
flutter build apk --release
```

### Environment
Create `.env` or pass via `--dart-define`:
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
GEMINI_API_KEY=AIza...
```

---

## BU Alumni Web (Next.js + Supabase)

### Technology Stack
- **Framework:** Next.js 15.5.9 (App Router), React 19.2.1, TypeScript 5.x
- **Styling:** Tailwind CSS 3.4.1, Shadcn UI + Radix UI primitives
- **Forms:** react-hook-form + Zod
- **State:** React hooks + Server Actions
- **Backend:** Supabase JS Client v2 (@supabase/ssr for auth)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Themes:** next-themes (dark/light toggle)

### Code Organization
```
src/
├── app/                       # Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   ├── login/                 # Auth entry
│   ├── signup/
│   ├── forgot-password/
│   ├── dashboard/
│   ├── survey/                # CHED GTS 5-step questionnaire
│   ├── forum/                 # Forum pages
│   ├── directory/
│   ├── profile/
│   ├── settings/
│   ├── notifications/
│   └── admin/
├── components/
│   ├── ui/                    # 35+ Shadcn/Radix primitives
│   ├── app-layout.tsx         # Sidebar + header shell
│   └── theme-provider.tsx
├── lib/
│   ├── utils.ts               # cn() helper
│   ├── types.ts               # TypeScript interfaces
│   └── supabase/              # Client + server + middleware
├── middleware.ts              # Auth session refresh
└── hooks/
    └── use-toast.ts
```

### Build Commands
```bash
npm install
npm run dev       # port 9002
npm run build
npm run typecheck
npm run lint
```

### Environment
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # server-only
GOOGLE_GENAI_API_KEY=AIza...
NEXT_PUBLIC_APP_URL=https://alumni.baliuag.edu.ph
```

---

## Supabase Backend

### Database Schema
Full schema in `supabase/migrations/00000000000000_init.sql`.

Key tables:
- `auth.users` — managed by Supabase Auth
- `profiles` — extends auth.users with alumni data
- `questionnaires` — survey definitions
- `gts_responses`, `gts_section_a`, `gts_degrees`, `gts_prof_exams`, `gts_course_reasons`, `gts_trainings`, `gts_employment`, `gts_skills_feedback` — CHED GTS data
- `forum_categories`, `forum_threads`, `forum_replies`, `forum_reactions`, `forum_bookmarks` — Forum
- `notifications` — Realtime notifications
- `mv_employment_stats` — Materialized view for analytics

### Edge Functions
```
/functions/
├── buddy-chat/index.ts       — BUddy AI chatbot (Gemini 2.0 Flash)
├── notify-reply/index.ts     — Creates notifications on forum replies
├── export-csv/index.ts       — Admin-only GTS CSV export
└── thread-slug/index.ts      — Generates unique slugs
```

### Row-Level Security
All tables have RLS enabled. Key policies:
- Profiles: readable by all signed-in users, writable by owner or admin
- GTS responses: only owner can read/write, admin can read all
- Forum: readable by all signed-in, writable by author/admin
- Notifications: only recipient can read

---

## Shared Brand & Design Conventions

Both applications use Baliuag University branding:
- **Primary color:** `#4C992D` (medium green)
- **Dark green:** `#004011` (forest)
- **Light background:** `#E0F2E7` (mint)
- **Headline font:** Playfair Display (web) / Goudy Old Style Roman (mobile)
- **Body font:** Plus Jakarta Sans (web) / system sans (mobile)
- **Logo:** `assets/logos/bu.png`

---

## Data Models & API Contracts

### Auth (both apps)
```typescript
// Sign up
await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });

// Sign in
await supabase.auth.signInWithPassword({ email, password });

// Session
supabase.auth.onAuthStateChange((event, session) => { ... });
```

### Forum — Realtime Replies
```typescript
const channel = supabase
  .channel(`thread-${threadId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'forum_replies',
    filter: `thread_id=eq.${threadId}`,
  }, callback)
  .subscribe();
```

### Forum — Full-Text Search
```typescript
await supabase
  .from('forum_threads')
  .select('id, title, body_plain, reply_count, created_at')
  .textSearch('search_vector', query, { type: 'websearch', config: 'english' })
  .order('created_at', { ascending: false })
  .limit(20);
```

---

## Security Considerations

1. **Secrets:** Use `.env` files (ignored in `.gitignore`). Never commit API keys.
2. **RLS:** All tables have Row-Level Security. Policies enforce ownership model.
3. **Auth:** Web uses cookie-based SSR auth via `@supabase/ssr`. Mobile uses `supabase_flutter`.
4. **AI API keys:** Stored in Edge Functions (server-side only), never exposed to clients.

---

## CI/CD

- **Web:** `.github/workflows/web.yml` — builds and deploys to Vercel on push to `main`
- **Mobile:** `.github/workflows/mobile.yml` — builds release APK on version tag push

---

## Development Conventions

### TypeScript / Next.js
- Path alias `@/*` maps to `./src/*`.
- Use Shadcn UI components from `src/components/ui/` before building custom ones.
- Tailwind custom theme tokens are defined in `tailwind.config.ts`.
- Supabase client: browser `@/lib/supabase/client`, server `@/lib/supabase/server`.

### Dart / Flutter
- Follow `flutter_lints` rules.
- Use Riverpod for state management.
- Keep UI in `screens/` and `widgets/`, business logic in `services/` and `providers/`.

---

## Quick Reference

| Task | Mobile | Web |
|------|--------|-----|
| Install deps | `flutter pub get` | `npm install` |
| Dev server | `flutter run` | `npm run dev` (port 9002) |
| Build | `flutter build apk --release` | `npm run build` |
| Lint/Analyze | `flutter analyze` | `npm run lint` |
| Type check | `dart analyze` | `npm run typecheck` |
