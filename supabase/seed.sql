-- Seed data for BU Alumni Tracer Study

-- Forum categories
INSERT INTO public.forum_categories (slug, name, description, icon, color, sort_order) VALUES
  ('announcements',   'Announcements',      'Official news from Baliuag University',          'megaphone',  '#4C992D', 0),
  ('career-advice',   'Career Advice',      'Job hunting tips and professional development',   'briefcase',  '#2D7A9A', 1),
  ('alumni-network',  'Alumni Network',     'Connect with fellow BU graduates',                'users',      '#7A4C99', 2),
  ('industry-talk',   'Industry Talk',      'Discuss trends in your field',                    'trending-up','#996B2D', 3),
  ('campus-life',     'Campus Life',        'Memories, reunions, and BU culture',              'university', '#2D9963', 4),
  ('opportunities',   'Opportunities',      'Job postings, scholarships, and partnerships',    'star',       '#D97706', 5),
  ('general',         'General',            'Anything and everything',                         'message-circle','#6B7280',6);

-- Sample active questionnaire
INSERT INTO public.questionnaires (title, description, is_active, batch_year, deadline) VALUES
  ('BU Graduate Tracer Study 2025-2026', 'Official CHED-aligned graduate tracer study for academic year 2025-2026', TRUE, 2025, '2026-06-30');
