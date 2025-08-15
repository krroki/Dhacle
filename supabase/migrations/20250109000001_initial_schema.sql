-- =============================================
-- Dhacle Database Schema - Initial Migration
-- Version: 001
-- Date: 2025-01-09
-- Description: Complete database schema for Dhacle platform
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES CREATION
-- =============================================

-- 1. Users Table (Supabase Auth Integration)
-- Stores user profile information linked to auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  channel_name TEXT,
  channel_url TEXT,
  total_revenue BIGINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'instructor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Courses Table
-- Stores course information created by instructors
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  price INTEGER NOT NULL DEFAULT 0,
  discount_rate INTEGER DEFAULT 0 CHECK (discount_rate >= 0 AND discount_rate <= 100),
  thumbnail_url TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT CHECK (category IN ('shorts', 'marketing', 'editing', 'monetization', 'analytics')),
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  student_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enrollments Table
-- Tracks course enrollments (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  is_completed BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

-- 4. Revenue Certifications Table
-- Stores user revenue proof/certifications
CREATE TABLE IF NOT EXISTS public.revenue_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'KRW' CHECK (currency IN ('KRW', 'USD')),
  screenshot_url TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('youtube', 'blog', 'tiktok', 'instagram', 'other')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (period_end >= period_start)
);

-- 5. Rankings Table
-- Stores user rankings based on revenue
CREATE TABLE IF NOT EXISTS public.rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  period_type TEXT CHECK (period_type IN ('weekly', 'monthly', 'yearly', 'all-time')),
  period_date DATE NOT NULL,
  rank INTEGER NOT NULL CHECK (rank > 0),
  total_revenue BIGINT NOT NULL CHECK (total_revenue >= 0),
  change_from_previous INTEGER DEFAULT 0,
  percentile DECIMAL(5,2) CHECK (percentile >= 0 AND percentile <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_type, period_date)
);

-- 6. Communities Table (Posts)
-- Stores community posts/articles
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('notice', 'free', 'success', 'qna', 'tips', 'resources')),
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Comments Table
-- Stores comments on community posts
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tools Table
-- Tracks tool usage (subtitle generator, etc.)
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL CHECK (tool_type IN ('subtitle_generator', 'thumbnail_analyzer', 'title_optimizer', 'tag_generator')),
  input_data JSONB,
  output_data JSONB,
  processing_time_ms INTEGER,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  file_url TEXT,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON public.courses(is_featured);

-- Enrollments indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_completed ON public.enrollments(is_completed);

-- Revenue certifications indexes
CREATE INDEX IF NOT EXISTS idx_revenue_user ON public.revenue_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_verified ON public.revenue_certifications(is_verified);
CREATE INDEX IF NOT EXISTS idx_revenue_platform ON public.revenue_certifications(platform);
CREATE INDEX IF NOT EXISTS idx_revenue_period ON public.revenue_certifications(period_start, period_end);

-- Rankings indexes
CREATE INDEX IF NOT EXISTS idx_rankings_user ON public.rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_rankings_period ON public.rankings(period_type, period_date);
CREATE INDEX IF NOT EXISTS idx_rankings_rank ON public.rankings(rank);

-- Communities indexes
CREATE INDEX IF NOT EXISTS idx_communities_user ON public.communities(user_id);
CREATE INDEX IF NOT EXISTS idx_communities_category ON public.communities(category);
CREATE INDEX IF NOT EXISTS idx_communities_pinned ON public.communities(is_pinned);
CREATE INDEX IF NOT EXISTS idx_communities_created ON public.communities(created_at DESC);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);

-- Tools indexes
CREATE INDEX IF NOT EXISTS idx_tools_user ON public.tools(user_id);
CREATE INDEX IF NOT EXISTS idx_tools_type ON public.tools(tool_type);
CREATE INDEX IF NOT EXISTS idx_tools_status ON public.tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_created ON public.tools(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Users Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Courses Policies
CREATE POLICY "Published courses are viewable by everyone"
  ON public.courses FOR SELECT
  USING (is_published = true OR instructor_id = (SELECT auth.uid()));

CREATE POLICY "Instructors can create courses"
  ON public.courses FOR INSERT
  TO authenticated
  WITH CHECK (
    instructor_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = (SELECT auth.uid()) 
      AND role IN ('instructor', 'admin')
    )
  );

CREATE POLICY "Instructors can update their own courses"
  ON public.courses FOR UPDATE
  TO authenticated
  USING (instructor_id = (SELECT auth.uid()))
  WITH CHECK (instructor_id = (SELECT auth.uid()));

CREATE POLICY "Instructors can delete their own courses"
  ON public.courses FOR DELETE
  TO authenticated
  USING (instructor_id = (SELECT auth.uid()));

-- Enrollments Policies
CREATE POLICY "Users can view their own enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Instructors can view course enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = course_id
      AND instructor_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can enroll in courses"
  ON public.enrollments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own enrollments"
  ON public.enrollments FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Revenue Certifications Policies
CREATE POLICY "Users can view their own certifications"
  ON public.revenue_certifications FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all certifications"
  ON public.revenue_certifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can submit certifications"
  ON public.revenue_certifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their unverified certifications"
  ON public.revenue_certifications FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()) AND is_verified = false)
  WITH CHECK (user_id = (SELECT auth.uid()) AND is_verified = false);

-- Rankings Policies
CREATE POLICY "Rankings are viewable by everyone"
  ON public.rankings FOR SELECT
  USING (true);

CREATE POLICY "System can manage rankings"
  ON public.rankings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Communities Policies
CREATE POLICY "Published posts are viewable by everyone"
  ON public.communities FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "Users can create posts"
  ON public.communities FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own posts"
  ON public.communities FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can soft delete their own posts"
  ON public.communities FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (
    user_id = (SELECT auth.uid()) AND
    is_deleted = true
  );

-- Comments Policies
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can soft delete their own comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (
    user_id = (SELECT auth.uid()) AND
    is_deleted = true
  );

-- Tools Policies
CREATE POLICY "Users can view their own tool usage"
  ON public.tools FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can use tools"
  ON public.tools FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "System can update tool records"
  ON public.tools FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_certifications_updated_at BEFORE UPDATE ON public.revenue_certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update comment count on communities
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities 
    SET comment_count = comment_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_community_comment_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- Function to update student count on courses
CREATE OR REPLACE FUNCTION update_student_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.courses 
    SET student_count = student_count + 1 
    WHERE id = NEW.course_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.courses 
    SET student_count = student_count - 1 
    WHERE id = OLD.course_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_student_count
  AFTER INSERT OR DELETE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION update_student_count();

-- =============================================
-- INITIAL DATA (Optional)
-- =============================================

-- Insert default admin user (optional, remove in production)
-- This should be done through Supabase Auth first
-- INSERT INTO public.users (id, email, username, full_name, role)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000000', 'admin@dhacle.com', 'admin', 'System Admin', 'admin')
-- ON CONFLICT (id) DO NOTHING;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant usage on schema to authenticated and anon users
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================
-- END OF MIGRATION
-- =============================================