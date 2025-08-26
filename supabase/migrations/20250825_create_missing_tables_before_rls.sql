-- ====================================================
-- Create Missing Tables Before Applying RLS
-- Phase 3: Security Hardening - Prerequisites
-- Date: 2025-08-25
-- ====================================================

-- ====================================================
-- user_roles Table
-- ====================================================

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'moderator', 'instructor')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, role) -- Prevent duplicate roles for same user
);

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_roles
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================
-- course_badges_extended Table
-- ====================================================

-- Create course_badges_extended table if it doesn't exist
CREATE TABLE IF NOT EXISTS course_badges_extended (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL,
    badge_type TEXT NOT NULL CHECK (badge_type IN ('completion', 'achievement', 'milestone', 'perfect_score')),
    badge_name TEXT NOT NULL,
    badge_description TEXT,
    earned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, course_id, badge_type) -- Prevent duplicate badges
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_course_badges_extended_user_id ON course_badges_extended(user_id);
CREATE INDEX IF NOT EXISTS idx_course_badges_extended_course_id ON course_badges_extended(course_id);
CREATE INDEX IF NOT EXISTS idx_course_badges_extended_badge_type ON course_badges_extended(badge_type);

-- ====================================================
-- user_certificates Table
-- ====================================================

-- Create user_certificates table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL,
    certificate_number TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completion_date TIMESTAMPTZ NOT NULL,
    grade TEXT,
    score NUMERIC(5,2),
    is_public BOOLEAN DEFAULT false,
    certificate_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, course_id) -- One certificate per user per course
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_certificates_user_id ON user_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certificates_course_id ON user_certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_user_certificates_certificate_number ON user_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_user_certificates_is_public ON user_certificates(is_public);

-- Create trigger for user_certificates
DROP TRIGGER IF EXISTS update_user_certificates_updated_at ON user_certificates;
CREATE TRIGGER update_user_certificates_updated_at
    BEFORE UPDATE ON user_certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================
-- course_reviews Table (if doesn't exist)
-- ====================================================

-- Create course_reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS course_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, course_id) -- One review per user per course
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id ON course_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_rating ON course_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_course_reviews_created_at ON course_reviews(created_at DESC);

-- Create trigger for course_reviews
DROP TRIGGER IF EXISTS update_course_reviews_updated_at ON course_reviews;
CREATE TRIGGER update_course_reviews_updated_at
    BEFORE UPDATE ON course_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================
-- Verification Query
-- ====================================================

-- Check if all tables exist
SELECT 
    tablename,
    CASE 
        WHEN tablename IS NOT NULL THEN 'EXISTS ✅'
        ELSE 'MISSING ❌'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND tablename IN (
    'user_roles',
    'course_badges_extended',
    'user_certificates',
    'course_reviews'
)
ORDER BY tablename;

-- ====================================================
-- Default Data (Optional)
-- ====================================================

-- Insert default admin role for the first user (if needed)
-- This should be customized based on your admin user's ID
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'admin'
-- FROM auth.users
-- WHERE email = 'admin@dhacle.com'
-- ON CONFLICT (user_id, role) DO NOTHING;

-- ====================================================
-- Important Notes
-- ====================================================
-- 1. These tables are created with basic structure
-- 2. Adjust column types and constraints based on your needs
-- 3. RLS policies will be applied in the next migration
-- 4. All tables have proper foreign key constraints to auth.users
-- ====================================================