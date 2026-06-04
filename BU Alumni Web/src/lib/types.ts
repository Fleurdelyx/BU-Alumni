export type Profile = {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  display_name: string;
  full_name: string; // generated — backward compatibility during v3 transition
  avatar_url: string | null;
  role: 'alumni' | 'admin' | 'moderator';
  bio: string | null;
  batch_year: number | null;
  degree: string | null;
  college: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type Questionnaire = {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  batch_year: number | null;
  deadline: string | null;
  created_by: string | null;
  created_at: string;
};

export type GtsResponse = {
  id: string;
  user_id: string;
  questionnaire_id: string | null;
  status: 'draft' | 'submitted' | 'archived';
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ForumCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_locked: boolean;
  created_at: string;
};

export type ForumThread = {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  slug: string;
  body: string;
  body_plain: string | null;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  is_deleted: boolean;
  view_count: number;
  reply_count: number;
  last_reply_at: string | null;
  last_reply_by: string | null;
  tags: string[];
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  category?: ForumCategory;
};

export type ForumReply = {
  id: string;
  thread_id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  body_plain: string | null;
  is_accepted: boolean;
  is_deleted: boolean;
  edit_count: number;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
};

export type Notification = {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: 'reply' | 'reaction' | 'mention' | 'announcement' | 'system';
  thread_id: string | null;
  reply_id: string | null;
  message: string | null;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
};

export type EmploymentStats = {
  batch_year: number | null;
  degree: string | null;
  college: string | null;
  employed_count: number;
  not_employed_count: number;
  never_employed_count: number;
  total_respondents: number;
  employment_rate: number;
  avg_months_to_employment: number | null;
};
