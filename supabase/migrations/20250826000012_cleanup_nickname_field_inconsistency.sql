-- File: supabase/migrations/20250826000012_cleanup_nickname_field_inconsistency.sql
-- Purpose: Clean up field naming inconsistency between randomnickname and random_nickname
-- Date: 2025-08-26

-- =====================================================
-- Step 1: Copy data from randomnickname to random_nickname if needed
-- =====================================================
UPDATE users 
SET random_nickname = COALESCE(random_nickname, randomnickname)
WHERE random_nickname IS NULL AND randomnickname IS NOT NULL;

-- =====================================================
-- Step 2: Drop and recreate profiles view without randomnickname
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
    random_nickname,  -- Only use the standardized name
    naver_cafe_verified,
    cafe_member_url,
    naver_cafe_nickname,
    naver_cafe_verified_at,
    email,
    created_at,
    updated_at
FROM users;

-- =====================================================
-- Step 3: Grant permissions on the updated view
-- =====================================================
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON profiles TO authenticated;

-- =====================================================
-- Step 4: Drop the old randomnickname column from users table
-- =====================================================
ALTER TABLE users DROP COLUMN IF EXISTS randomnickname;

-- =====================================================
-- Step 5: Add comment for clarity
-- =====================================================
COMMENT ON COLUMN users.random_nickname IS 'Standardized random nickname field (replaced randomnickname)';

-- =====================================================
-- Verification: The final state should have only random_nickname
-- =====================================================