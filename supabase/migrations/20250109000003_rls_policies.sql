-- ================================================
-- RLS (Row Level Security) Policies for Dhacle
-- Version: 003
-- Date: 2025-01-10
-- Description: Security policies for user data access
-- ================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- ================================================
-- USERS TABLE POLICIES
-- ================================================

-- Public profiles are viewable by everyone
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.users FOR SELECT 
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Only the user themselves can insert their profile (handled by trigger)
CREATE POLICY "Users can insert own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- ================================================
-- COURSES TABLE POLICIES
-- ================================================

-- Published courses are viewable by everyone
CREATE POLICY "Published courses are viewable by everyone" 
ON public.courses FOR SELECT 
USING (is_published = true);

-- Only instructors and admins can insert courses
CREATE POLICY "Instructors can create courses" 
ON public.courses FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('instructor', 'admin')
  )
);

-- Instructors can update their own courses, admins can update any
CREATE POLICY "Instructors can update own courses" 
ON public.courses FOR UPDATE 
USING (
  instructor_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ================================================
-- ENROLLMENTS TABLE POLICIES
-- ================================================

-- Users can view their own enrollments
CREATE POLICY "Users can view own enrollments" 
ON public.enrollments FOR SELECT 
USING (user_id = auth.uid());

-- Instructors can view enrollments for their courses
CREATE POLICY "Instructors can view course enrollments" 
ON public.enrollments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = enrollments.course_id 
    AND courses.instructor_id = auth.uid()
  )
);

-- Users can enroll themselves
CREATE POLICY "Users can enroll in courses" 
ON public.enrollments FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Users can update their own enrollment progress
CREATE POLICY "Users can update own enrollment" 
ON public.enrollments FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ================================================
-- REVENUE CERTIFICATIONS TABLE POLICIES
-- ================================================

-- All verified certifications are public
CREATE POLICY "Verified certifications are public" 
ON public.revenue_certifications FOR SELECT 
USING (is_verified = true);

-- Users can view their own certifications (even unverified)
CREATE POLICY "Users can view own certifications" 
ON public.revenue_certifications FOR SELECT 
USING (user_id = auth.uid());

-- Users can create their own certifications
CREATE POLICY "Users can create certifications" 
ON public.revenue_certifications FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Users can update their own unverified certifications
CREATE POLICY "Users can update own unverified certifications" 
ON public.revenue_certifications FOR UPDATE 
USING (user_id = auth.uid() AND is_verified = false)
WITH CHECK (user_id = auth.uid());

-- Only admins can verify certifications
CREATE POLICY "Admins can verify certifications" 
ON public.revenue_certifications FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ================================================
-- RANKINGS TABLE POLICIES
-- ================================================

-- Rankings are public
CREATE POLICY "Rankings are public" 
ON public.rankings FOR SELECT 
USING (true);

-- Only system can insert/update rankings (via functions/triggers)
-- No direct insert/update policies for users

-- ================================================
-- COMMUNITIES TABLE POLICIES
-- ================================================

-- Published posts are viewable by everyone
CREATE POLICY "Published posts are viewable" 
ON public.communities FOR SELECT 
USING (is_deleted = false);

-- Users can create posts
CREATE POLICY "Users can create posts" 
ON public.communities FOR INSERT 
WITH CHECK (user_id = auth.uid() AND is_deleted = false);

-- Users can update their own posts
CREATE POLICY "Users can update own posts" 
ON public.communities FOR UPDATE 
USING (user_id = auth.uid() AND is_deleted = false)
WITH CHECK (user_id = auth.uid());

-- Users can soft delete their own posts
CREATE POLICY "Users can delete own posts" 
ON public.communities FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND is_deleted = true);

-- Admins can update any post
CREATE POLICY "Admins can moderate posts" 
ON public.communities FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ================================================
-- COMMENTS TABLE POLICIES
-- ================================================

-- Non-deleted comments are viewable
CREATE POLICY "Comments are viewable" 
ON public.comments FOR SELECT 
USING (is_deleted = false);

-- Users can create comments
CREATE POLICY "Users can create comments" 
ON public.comments FOR INSERT 
WITH CHECK (user_id = auth.uid() AND is_deleted = false);

-- Users can update their own comments
CREATE POLICY "Users can update own comments" 
ON public.comments FOR UPDATE 
USING (user_id = auth.uid() AND is_deleted = false)
WITH CHECK (user_id = auth.uid());

-- Users can soft delete their own comments
CREATE POLICY "Users can delete own comments" 
ON public.comments FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND is_deleted = true);

-- ================================================
-- TOOLS TABLE POLICIES
-- ================================================

-- Users can view their own tool usage
CREATE POLICY "Users can view own tool usage" 
ON public.tools FOR SELECT 
USING (user_id = auth.uid());

-- Users can create tool usage records
CREATE POLICY "Users can use tools" 
ON public.tools FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Users can update their own pending tool records
CREATE POLICY "Users can update own tool records" 
ON public.tools FOR UPDATE 
USING (user_id = auth.uid() AND status IN ('pending', 'processing'))
WITH CHECK (user_id = auth.uid());

-- ================================================
-- HELPER FUNCTIONS FOR RLS
-- ================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is instructor
CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('instructor', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a course
CREATE OR REPLACE FUNCTION public.owns_course(course_id UUID)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_id 
    AND instructor_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- END OF RLS POLICIES
-- ================================================

-- Note: To apply these policies, run this SQL in Supabase Dashboard
-- Make sure to test thoroughly in development before applying to production