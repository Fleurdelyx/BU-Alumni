const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'lalddttyizimgsmnhuet';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

const templatesDir = path.join(__dirname, '..', 'supabase', 'email-templates');
const manifest = JSON.parse(fs.readFileSync(path.join(templatesDir, 'manifest.json'), 'utf8'));

const keyMap = {
  'confirm_signup.html': { subject: 'mailer_subjects_confirmation', content: 'mailer_templates_confirmation_content' },
  'magic_link.html': { subject: 'mailer_subjects_magic_link', content: 'mailer_templates_magic_link_content' },
  'recovery.html': { subject: 'mailer_subjects_recovery', content: 'mailer_templates_recovery_content' },
  'invite.html': { subject: 'mailer_subjects_invite', content: 'mailer_templates_invite_content' },
  'email_change.html': { subject: 'mailer_subjects_email_change', content: 'mailer_templates_email_change_content' },
  'reauthentication.html': { subject: 'mailer_subjects_reauthentication', content: 'mailer_templates_reauthentication_content' },
  'password_changed_notification.html': { subject: 'mailer_subjects_password_changed_notification', content: 'mailer_templates_password_changed_notification_content' },
  'email_changed_notification.html': { subject: 'mailer_subjects_email_changed_notification', content: 'mailer_templates_email_changed_notification_content' },
};

const payload = {};
for (const item of manifest) {
  const mapping = keyMap[item.file];
  if (!mapping) {
    console.warn('No API mapping for', item.file);
    continue;
  }
  const content = fs.readFileSync(path.join(templatesDir, item.file), 'utf8');
  payload[mapping.subject] = item.subject;
  payload[mapping.content] = content;
}

async function apply() {
  if (!ACCESS_TOKEN) {
    console.error('Set SUPABASE_ACCESS_TOKEN env var.');
    process.exit(1);
  }

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await res.text();
  if (res.ok) {
    console.log('Email templates applied successfully.');
  } else {
    console.error(`Failed (${res.status}):`, body);
    process.exit(1);
  }
}

apply();
