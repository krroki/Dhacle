-- ====================================================
-- RLS Policy Application for Remaining Tables
-- Phase 3: Security Hardening
-- Date: 2025-08-25
-- ====================================================

-- ====================================================
-- user_roles Table RLS Policies
-- ====================================================

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT 
  USING (user_id = auth.uid());

-- Policy: Only admins can manage roles
CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles AS ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

-- ====================================================
-- course_badges_extended Table RLS Policies
-- ====================================================

-- Enable RLS
ALTER TABLE course_badges_extended ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own badges" ON course_badges_extended;
DROP POLICY IF EXISTS "System can create badges" ON course_badges_extended;

-- Policy: Users can view their own badges
CREATE POLICY "Users can view own badges" ON course_badges_extended
  FOR SELECT 
  USING (user_id = auth.uid());

-- Policy: System (service role) can create badges - regular users cannot
CREATE POLICY "System can create badges" ON course_badges_extended
  FOR INSERT 
  WITH CHECK (false); -- Only service role can bypass this

-- ====================================================
-- user_certificates Table RLS Policies
-- ====================================================

-- Enable RLS
ALTER TABLE user_certificates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own certificates" ON user_certificates;
DROP POLICY IF EXISTS "Public certificates viewable by all" ON user_certificates;
DROP POLICY IF EXISTS "System can create certificates" ON user_certificates;

-- Policy: Users can view their own certificates
CREATE POLICY "Users can view own certificates" ON user_certificates
  FOR SELECT 
  USING (user_id = auth.uid());

-- Policy: Public certificates are viewable by all authenticated users
CREATE POLICY "Public certificates viewable by all" ON user_certificates
  FOR SELECT 
  USING (is_public = true AND auth.uid() IS NOT NULL);

-- Policy: System (service role) can create certificates
CREATE POLICY "System can create certificates" ON user_certificates
  FOR INSERT 
  WITH CHECK (false); -- Only service role can bypass this

-- ====================================================
-- course_reviews Table RLS Policies (if exists)
-- ====================================================

-- Check if table exists and apply RLS
DO $$ 
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'course_reviews'
    ) THEN
        -- Enable RLS
        ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Reviews are public" ON course_reviews;
        DROP POLICY IF EXISTS "Authenticated users can create reviews" ON course_reviews;
        DROP POLICY IF EXISTS "Users can manage own reviews" ON course_reviews;
        DROP POLICY IF EXISTS "Users can delete own reviews" ON course_reviews;
        
        -- Policy: All authenticated users can view reviews
        CREATE POLICY "Reviews are public" ON course_reviews
          FOR SELECT 
          USING (auth.uid() IS NOT NULL);
        
        -- Policy: Authenticated users can create reviews
        CREATE POLICY "Authenticated users can create reviews" ON course_reviews
          FOR INSERT 
          WITH CHECK (
            auth.uid() IS NOT NULL 
            AND user_id = auth.uid()
          );
        
        -- Policy: Users can update their own reviews
        CREATE POLICY "Users can manage own reviews" ON course_reviews
          FOR UPDATE 
          USING (user_id = auth.uid());
        
        -- Policy: Users can delete their own reviews
        CREATE POLICY "Users can delete own reviews" ON course_reviews
          FOR DELETE 
          USING (user_id = auth.uid());
    END IF;
END $$;

-- ====================================================
-- Verification Query
-- ====================================================

-- Check RLS status for all tables
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN 'ENABLED ✅'
        ELSE 'DISABLED ❌'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'user_roles',
    'course_badges_extended',
    'user_certificates',
    'course_reviews'
)
ORDER BY tablename;

-- List all policies for these tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'user_roles',
    'course_badges_extended', 
    'user_certificates',
    'course_reviews'
)
ORDER BY tablename, policyname;

-- ====================================================
-- Important Notes
-- ====================================================
-- 1. Service role (SUPABASE_SERVICE_ROLE_KEY) bypasses RLS
-- 2. Regular users (authenticated with JWT) are subject to RLS
-- 3. System operations that need to bypass RLS should use service role
-- 4. All policies are designed to be idempotent (safe to run multiple times)
-- ====================================================