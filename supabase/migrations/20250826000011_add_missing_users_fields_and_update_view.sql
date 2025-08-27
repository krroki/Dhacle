-- File: supabase/migrations/20250826000011_add_missing_users_fields_and_update_view.sql
-- Phase 1: Add missing fields to users table and update profiles view
-- Date: 2025-08-26
-- Note: profiles is a VIEW that reads from users table

-- =====================================================
-- Step 1: Add missing columns to users table
-- =====================================================

-- Add random_nickname column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS random_nickname TEXT;

-- Add naver_cafe_verified column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS naver_cafe_verified BOOLEAN DEFAULT false;

-- Add cafe_member_url column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cafe_member_url TEXT;

-- Add naver_cafe_nickname column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS naver_cafe_nickname TEXT;

-- Add naver_cafe_verified_at column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS naver_cafe_verified_at TIMESTAMP WITH TIME ZONE;

-- Add email column (if not exists in auth.users)
-- Note: email might already exist in auth.users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email TEXT;

-- =====================================================
-- Step 2: Create indexes for better performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_random_nickname ON users(random_nickname);
CREATE INDEX IF NOT EXISTS idx_users_naver_cafe_verified ON users(naver_cafe_verified);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- Step 3: Drop and recreate profiles view with new columns
-- =====================================================

DROP VIEW IF EXISTS profiles;

CREATE OR REPLACE VIEW profiles AS
SELECT 
    id,
    username,
    full_name,
    avatar_url,
    channel_name,
    channel_url,
    work_type,
    job_category,
    current_income,
    target_income,
    experience_level,
    randomnickname,  -- Existing column
    random_nickname, -- New column
    naver_cafe_verified, -- New column
    cafe_member_url, -- New column
    naver_cafe_nickname, -- New column
    naver_cafe_verified_at, -- New column
    email, -- New column
    created_at,
    updated_at
FROM users;

-- =====================================================
-- Step 4: Set default values for existing rows
-- =====================================================

-- Generate random nicknames for existing users if not set
UPDATE users 
SET random_nickname = 'User_' || substring(id::text, 1, 8)
WHERE random_nickname IS NULL;

-- =====================================================
-- Step 5: Add comments for documentation
-- =====================================================

COMMENT ON COLUMN users.random_nickname IS 'Randomly generated nickname for anonymous display';
COMMENT ON COLUMN users.naver_cafe_verified IS 'Whether the user has verified their Naver Cafe membership';
COMMENT ON COLUMN users.cafe_member_url IS 'URL to the user''s Naver Cafe profile';
COMMENT ON COLUMN users.naver_cafe_nickname IS 'User''s nickname in Naver Cafe';
COMMENT ON COLUMN users.naver_cafe_verified_at IS 'Timestamp when Naver Cafe verification was completed';
COMMENT ON COLUMN users.email IS 'User email address for notifications and identification';

-- =====================================================
-- Step 6: Grant permissions on the view
-- =====================================================

GRANT SELECT ON profiles TO anon;
GRANT SELECT ON profiles TO authenticated;