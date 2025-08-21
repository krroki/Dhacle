-- ============================================
-- COMBINED MIGRATION SCRIPT FOR DHACLE PROJECT
-- Execute this in Supabase Dashboard SQL Editor
-- Date: 2025-02-02
-- ============================================

-- Note: This is a combined script of critical migrations
-- Only includes tables that are immediately needed for build

-- ============================================
-- COURSE SYSTEM TABLES
-- ============================================

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  instructor_id uuid REFERENCES users(id),
  instructor_name text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  is_free boolean DEFAULT false,
  thumbnail_url text,
  category text,
  level text CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration_weeks integer,
  total_students integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT false,
  curriculum jsonb,
  requirements text[],
  what_youll_learn text[]
);

-- Course weeks
CREATE TABLE IF NOT EXISTS course_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  week_number integer NOT NULL,
  title text NOT NULL,
  description text,
  content text,
  video_url text,
  materials jsonb,
  assignments text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(course_id, week_number)
);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  week_id uuid REFERENCES course_weeks(id) ON DELETE CASCADE,
  lesson_number integer NOT NULL,
  title text NOT NULL,
  description text,
  video_url text,
  duration_minutes integer,
  content_type text CHECK (content_type IN ('video', 'text', 'quiz', 'assignment')),
  content jsonb,
  resources jsonb,
  is_preview boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  progress integer DEFAULT 0,
  last_accessed_at timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'dropped')),
  certificate_url text,
  UNIQUE(user_id, course_id)
);

-- Progress tracking
CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  week_id uuid REFERENCES course_weeks(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  time_spent_minutes integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Purchases
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  final_amount integer NOT NULL,
  coupon_id uuid,
  payment_method text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_id text,
  payment_data jsonb,
  purchased_at timestamptz DEFAULT now(),
  refunded_at timestamptz,
  refund_reason text,
  UNIQUE(user_id, course_id)
);

-- Course QnA
CREATE TABLE IF NOT EXISTS course_qna (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  week_id uuid REFERENCES course_weeks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES course_qna(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL,
  is_answered boolean DEFAULT false,
  is_instructor_answer boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Course Reviews
CREATE TABLE IF NOT EXISTS course_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  content text,
  is_verified_purchase boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- ============================================
-- YOUTUBE LENS TABLES
-- ============================================

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id text PRIMARY KEY,
  channel_id text NOT NULL,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  published_at timestamptz,
  duration text,
  view_count bigint DEFAULT 0,
  like_count bigint DEFAULT 0,
  comment_count bigint DEFAULT 0,
  tags text[],
  category_id text,
  default_language text,
  default_audio_language text,
  is_live boolean DEFAULT false,
  live_broadcast_content text,
  privacy_status text,
  made_for_kids boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  custom_url text,
  published_at timestamptz,
  country text,
  view_count bigint DEFAULT 0,
  subscriber_count bigint DEFAULT 0,
  video_count bigint DEFAULT 0,
  uploads_playlist_id text,
  keywords text[],
  tracking_since timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  last_video_published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Collections
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  cover_image_url text,
  tags text[],
  item_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Collection items
CREATE TABLE IF NOT EXISTS collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  video_id text NOT NULL,
  added_by uuid NOT NULL REFERENCES users(id),
  notes text,
  position integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(collection_id, video_id)
);

-- Source folders
CREATE TABLE IF NOT EXISTS source_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  icon text DEFAULT '📁',
  color text DEFAULT '#gray',
  channel_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Folder channels
CREATE TABLE IF NOT EXISTS folder_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL REFERENCES source_folders(id) ON DELETE CASCADE,
  channel_id text NOT NULL,
  added_at timestamptz DEFAULT now(),
  UNIQUE(folder_id, channel_id)
);

-- Video stats
CREATE TABLE IF NOT EXISTS video_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  date date NOT NULL,
  view_count bigint DEFAULT 0,
  like_count bigint DEFAULT 0,
  comment_count bigint DEFAULT 0,
  view_delta bigint DEFAULT 0,
  like_delta bigint DEFAULT 0,
  comment_delta bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(video_id, date)
);

-- ============================================
-- ADDITIONAL REQUIRED TABLES
-- ============================================

-- User badges
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  badge_level text,
  earned_at timestamptz DEFAULT now(),
  metadata jsonb,
  UNIQUE(user_id, badge_type)
);

-- Revenue certifications
CREATE TABLE IF NOT EXISTS revenue_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'KRW',
  period_start date NOT NULL,
  period_end date NOT NULL,
  screenshot_url text,
  verification_status text DEFAULT 'pending',
  verified_at timestamptz,
  verified_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_channel ON videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_source_folders_user ON source_folders(user_id);

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_qna ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE folder_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_certifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BASIC RLS POLICIES (TEMPORARY - FOR DEVELOPMENT)
-- ============================================

-- Allow authenticated users to read courses
CREATE POLICY "courses_read_all" ON courses FOR SELECT TO authenticated USING (true);

-- Allow users to read their own enrollments
CREATE POLICY "enrollments_read_own" ON enrollments FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Allow users to manage their own collections
CREATE POLICY "collections_manage_own" ON collections FOR ALL TO authenticated USING (user_id = auth.uid());

-- Allow users to manage their own folders
CREATE POLICY "folders_manage_own" ON source_folders FOR ALL TO authenticated USING (user_id = auth.uid());

-- ============================================
-- END OF COMBINED MIGRATION
-- ============================================

-- After running this script:
-- 1. Run: npm run types:generate
-- 2. Run: npm run build
-- 3. Test the application