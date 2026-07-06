const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'supabase', 'email-templates');

const LOGO_URL = 'https://bu-alumni-web.vercel.app/logos/bu.png';
const WEB_URL = 'https://bu-alumni-web.vercel.app';

function base(title, contentHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F5F0;font-family:'Source Sans 3','Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#FDFCFA;border-radius:16px;overflow:hidden;border:1px solid #E8E4D9;box-shadow:0 4px 24px rgba(11,61,32,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding:40px 32px 24px;text-align:center;">
              <div style="display:inline-block;padding:8px;background:#ffffff;border:1px solid #E8E4D9;border-radius:12px;box-shadow:0 2px 8px rgba(11,61,32,0.06);">
                <img src="${LOGO_URL}" alt="Baliuag University" width="56" height="56" style="display:block;border-radius:8px;">
              </div>
              <h1 style="margin:16px 0 0;font-family:Georgia,'DM Serif Display',serif;font-size:26px;font-weight:700;color:#0B3D20;letter-spacing:-0.02em;">BU Alumni</h1>
              <p style="margin:4px 0 0;font-size:11px;font-weight:600;color:#258045;letter-spacing:0.15em;text-transform:uppercase;">Tracer Study</p>
              <div style="margin:20px auto 0;width:40px;height:3px;background:linear-gradient(90deg,#D96A3D,#DAA520);border-radius:2px;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:16px 40px 40px;color:#4A4A45;font-size:16px;line-height:1.65;">
${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F7F5F0;padding:28px 40px;text-align:center;color:#747469;font-size:13px;line-height:1.6;border-top:1px solid #E8E4D9;">
              <p style="margin:0 0 6px;font-weight:600;color:#0B3D20;">Baliuag University</p>
              <p style="margin:0 0 12px;">Alumni Relations Office</p>
              <p style="margin:0 0 16px;"><a href="${WEB_URL}" style="color:#258045;text-decoration:none;font-weight:600;">bu-alumni-web.vercel.app</a></p>
              <p style="margin:16px 0 0;font-size:12px;color:#9A968A;">This is an automated message. Please do not reply directly to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(urlVar, text) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:32px 0;">
                <tr>
                  <td style="border-radius:10px;background:#258045;text-align:center;box-shadow:0 4px 12px rgba(37,128,69,0.25);">
                    <a href="${urlVar}" target="_blank" style="display:inline-block;padding:14px 32px;color:#F7F5F0;text-decoration:none;font-weight:600;font-size:16px;border-radius:10px;font-family:'Source Sans 3','Plus Jakarta Sans',system-ui,sans-serif;">${text}</a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:14px;color:#747469;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="margin:8px 0 0;font-size:13px;word-break:break-all;"><a href="${urlVar}" style="color:#258045;text-decoration:underline;">${urlVar}</a></p>`;
}

function heading(text) {
  return `<h2 style="margin:0 0 16px;font-family:Georgia,'DM Serif Display',serif;font-size:28px;font-weight:700;color:#0B3D20;letter-spacing:-0.02em;">${text}</h2>`;
}

function greeting(name = 'there') {
  return `<p style="margin:0 0 24px;">Hi ${name},</p>`;
}

function closing(note) {
  return `<p style="margin:32px 0 0;font-size:14px;color:#747469;">${note}</p>`;
}

function warningBox(text) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;width:100%;background:#FFF7ED;border-left:4px solid #D96A3D;border-radius:8px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:14px;color:#7C3A1A;line-height:1.55;">${text}</p>
                  </td>
                </tr>
              </table>`;
}

const templates = [
  {
    file: 'confirm_signup.html',
    subject: 'Confirm your BU Alumni Tracer Study account',
    title: 'Confirm your BU Alumni account',
    html: base('Confirm your BU Alumni account', [
      heading('Verify your email address'),
      greeting(),
      `<p style="margin:0 0 24px;">Thanks for signing up for the <strong style="color:#0B3D20;">BU Alumni Tracer Study</strong>. Please confirm your email address to activate your account and start connecting with fellow graduates.</p>`,
      button('{{ .ConfirmationURL }}', 'Confirm email address'),
      closing('If you did not create an account, you can safely ignore this email.'),
    ].join('\n')),
  },
  {
    file: 'magic_link.html',
    subject: 'Sign in to BU Alumni Tracer Study',
    title: 'Sign in to BU Alumni',
    html: base('Sign in to BU Alumni', [
      heading('Your sign-in link'),
      greeting(),
      `<p style="margin:0 0 24px;">Click the button below to sign in to your <strong style="color:#0B3D20;">BU Alumni Tracer Study</strong> account. This link expires shortly and can only be used once.</p>`,
      button('{{ .ConfirmationURL }}', 'Sign in'),
      closing('Didn\'t request this? You can safely ignore it.'),
    ].join('\n')),
  },
  {
    file: 'recovery.html',
    subject: 'Reset your BU Alumni Tracer Study password',
    title: 'Reset your BU Alumni password',
    html: base('Reset your BU Alumni password', [
      heading('Reset your password'),
      greeting(),
      `<p style="margin:0 0 24px;">We received a request to reset the password for your <strong style="color:#0B3D20;">BU Alumni Tracer Study</strong> account. Click the button below to choose a new password.</p>`,
      button('{{ .ConfirmationURL }}', 'Reset password'),
      closing('This link expires in 24 hours. If you did not request a password reset, you can safely ignore this email.'),
    ].join('\n')),
  },
  {
    file: 'invite.html',
    subject: "You're invited to BU Alumni Tracer Study Admin",
    title: "You're invited to BU Alumni",
    html: base("You're invited to BU Alumni", [
      heading('You\'re invited'),
      greeting(),
      `<p style="margin:0 0 24px;">You\'ve been invited to join the <strong style="color:#0B3D20;">BU Alumni Tracer Study</strong> admin portal. Click the button below to accept the invitation and set up your account.</p>`,
      button('{{ .ConfirmationURL }}', 'Accept invitation'),
      closing('If you were not expecting this invitation, you can safely ignore this email.'),
    ].join('\n')),
  },
  {
    file: 'email_change.html',
    subject: 'Confirm your new BU Alumni email address',
    title: 'Confirm your new BU Alumni email',
    html: base('Confirm your new BU Alumni email', [
      heading('Confirm your new email address'),
      greeting(),
      `<p style="margin:0 0 24px;">You requested to change the email address for your <strong style="color:#0B3D20;">BU Alumni Tracer Study</strong> account to <strong style="color:#0B3D20;">{{ .NewEmail }}</strong>. Click the button below to confirm this change.</p>`,
      button('{{ .ConfirmationURL }}', 'Confirm new email'),
      closing('If you did not request this change, you can safely ignore this email.'),
    ].join('\n')),
  },
  {
    file: 'reauthentication.html',
    subject: '{{ .Token }} is your BU Alumni verification code',
    title: 'Your BU Alumni verification code',
    html: base('Your BU Alumni verification code', [
      heading('Your verification code'),
      greeting(),
      `<p style="margin:0 0 24px;">Use the code below to verify your identity for your <strong style="color:#0B3D20;">BU Alumni Tracer Study</strong> account. It expires shortly.</p>`,
      `<div style="margin:32px 0;text-align:center;">
                <div style="display:inline-block;padding:18px 32px;background:#F7F5F0;border:1px solid #E8E4D9;border-radius:12px;font-family:'JetBrains Mono',monospace;font-size:32px;font-weight:700;color:#0B3D20;letter-spacing:0.2em;">{{ .Token }}</div>
                <p style="margin:12px 0 0;font-size:13px;color:#747469;">This code expires shortly.</p>
              </div>`,
      closing('If you did not request this code, you can safely ignore this email.'),
    ].join('\n')),
  },
  {
    file: 'password_changed_notification.html',
    subject: 'Your BU Alumni password was changed',
    title: 'Your BU Alumni password was changed',
    html: base('Your BU Alumni password was changed', [
      heading('Your password was changed'),
      greeting(),
      `<p style="margin:0 0 24px;">The password for your <strong style="color:#0B3D20;">BU Alumni Tracer Study</strong> account was recently changed.</p>`,
      warningBox('<strong>Didn\'t make this change?</strong> Contact the Alumni Relations Office immediately to secure your account.'),
      closing('This is a security notification. You do not need to reply to this email.'),
    ].join('\n')),
  },
  {
    file: 'email_changed_notification.html',
    subject: 'Your BU Alumni email address was changed',
    title: 'Your BU Alumni email was changed',
    html: base('Your BU Alumni email was changed', [
      heading('Your email address was changed'),
      greeting(),
      `<p style="margin:0 0 24px;">The email address for your <strong style="color:#0B3D20;">BU Alumni Tracer Study</strong> account was changed from <strong style="color:#0B3D20;">{{ .OldEmail }}</strong> to <strong style="color:#0B3D20;">{{ .Email }}</strong>.</p>`,
      warningBox('<strong>Didn\'t make this change?</strong> Contact the Alumni Relations Office immediately to secure your account.'),
      closing('This is a security notification. You do not need to reply to this email.'),
    ].join('\n')),
  },
];

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const t of templates) {
  fs.writeFileSync(path.join(outDir, t.file), t.html, 'utf8');
}

// Write a JSON manifest for programmatic API updates
const manifest = templates.map((t) => ({ file: t.file, subject: t.subject }));
fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

console.log('Generated', templates.length, 'email templates in', outDir);
