# BU Alumni Tracer Study — Supabase Auth Email Templates

Custom HTML email templates for Supabase Auth, styled to match the **BU Alumni Tracer Study** web aesthetic.

## Design

The templates use the site's tropical-editorial palette:

- **Warm cream paper:** `#F7F5F0` background
- **Card surface:** `#FDFCFA` with a soft warm border
- **Forest green headings:** `#0B3D20`
- **Primary action green:** `#258045`
- **Accent gradient:** terracotta `#D96A3D` to gold `#DAA520`
- **Typography:** Georgia / DM Serif Display for headings, Source Sans 3 / Plus Jakarta Sans for body

All styles are inlined for broad email-client compatibility (Gmail, Outlook, Apple Mail).

## Templates included

### Authentication templates

| File | Supabase template | Use case |
|------|-------------------|----------|
| `confirm_signup.html` | Confirm signup | Email verification after registration |
| `magic_link.html` | Magic Link | Passwordless sign-in |
| `recovery.html` | Recovery | Password reset |
| `invite.html` | Invite user | Admin/staff account invitations |
| `email_change.html` | Change Email Address | Confirm a new email address |
| `reauthentication.html` | Reauthentication | OTP / nonce verification code |

### Security notification templates

| File | Supabase template | Use case |
|------|-------------------|----------|
| `password_changed_notification.html` | Password changed | Alert after a password change |
| `email_changed_notification.html` | Email address changed | Alert after an email address change |

## How to install

### Option A: Automatic (Management API)

A script applies both the subject lines and HTML content to Supabase:

```bash
export SUPABASE_ACCESS_TOKEN="sbp_..."
node scripts/apply-email-templates.js
```

### Option B: Manual (Dashboard)

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Email Templates**.
2. For each template type, switch the editor to **HTML**.
3. Copy the contents of the matching `.html` file from this folder and paste it into the editor.
4. Update the **Subject** field for each template using the values in `manifest.json`.
5. Click **Save**.

Security notification templates are under the **Notifications** tab in the same Email Templates section.

## How to regenerate

If you change the design or copy, regenerate the files from the shared template generator:

```bash
node scripts/generate-email-templates.js
```

Then re-run `scripts/apply-email-templates.js` or paste the updated files into Supabase manually.

## Recommended subjects

See `manifest.json` for the exact subject lines used by the apply script.

### Authentication

| Template | Subject line |
|----------|--------------|
| Confirm signup | `Confirm your BU Alumni Tracer Study account` |
| Magic Link | `Sign in to BU Alumni Tracer Study` |
| Recovery | `Reset your BU Alumni Tracer Study password` |
| Invite user | `You're invited to BU Alumni Tracer Study Admin` |
| Email change | `Confirm your new BU Alumni email address` |
| Reauthentication | `{{ .Token }} is your BU Alumni verification code` |

### Notifications

| Template | Subject line |
|----------|--------------|
| Password changed | `Your BU Alumni password was changed` |
| Email address changed | `Your BU Alumni email address was changed` |

## Variables used

These templates use Supabase Go template variables:

- `{{ .ConfirmationURL }}` — the confirmation/reset/invite link
- `{{ .Token }}` — the 6-digit OTP token (used in the reauthentication template)
- `{{ .TokenHash }}` — hashed version of the token
- `{{ .Email }}` — the user's current email address
- `{{ .NewEmail }}` — the new email address (email_change template only)
- `{{ .OldEmail }}` — the previous email address (email_changed_notification template only)
- `{{ .SiteURL }}` — the Site URL configured in Auth settings
- `{{ .RedirectTo }}` — the redirect URL passed from the client
- `{{ .Data }}` — custom user metadata (e.g. `{{ .Data.first_name }}`)

> Do not remove or rename the placeholders used in a template. Supabase replaces them at send time.

## Brand assets

The templates reference the BU logo at:

```
https://bu-alumni-web.vercel.app/logos/bu.png
```

Make sure this URL is publicly accessible. If you deploy the web app to a different domain, update the `src` attribute in the generator and regenerate.

## Customization

Edit `scripts/generate-email-templates.js` to change colors, fonts, or layout, then regenerate.

Key tokens:

- Primary green: `#258045`
- Dark forest: `#0B3D20`
- Warm cream: `#F7F5F0`
- Terracotta accent: `#D96A3D`
- Gold accent: `#DAA520`

Update footer links if your production URLs differ from:

- Web: `https://bu-alumni-web.vercel.app`
- Admin: `https://bu-alumni-admin.vercel.app`
