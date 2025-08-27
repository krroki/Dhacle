-- File: supabase/migrations/20250826000010_add_missing_profile_fields.sql
-- Phase 1: Add missing fields to profiles table
-- Date: 2025-08-26

-- 1. Add random_nickname field (for anonymous display)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'random_nickname'
    ) THEN
        ALTER TABLE profiles ADD COLUMN random_nickname TEXT;
    END IF;
END $$;

-- 2. Add Naver Cafe verification fields
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'naver_cafe_verified'
    ) THEN
        ALTER TABLE profiles ADD COLUMN naver_cafe_verified BOOLEAN DEFAULT false;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'cafe_member_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN cafe_member_url TEXT;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'naver_cafe_nickname'
    ) THEN
        ALTER TABLE profiles ADD COLUMN naver_cafe_nickname TEXT;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'naver_cafe_verified_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN naver_cafe_verified_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 3. Add email field (unique constraint for user identification)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_random_nickname ON profiles(random_nickname);
CREATE INDEX IF NOT EXISTS idx_profiles_naver_cafe_verified ON profiles(naver_cafe_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add unique constraint on email (only if not already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_email_key' 
        AND conrelid = 'profiles'::regclass
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN profiles.random_nickname IS 'Randomly generated nickname for anonymous display';
COMMENT ON COLUMN profiles.naver_cafe_verified IS 'Whether the user has verified their Naver Cafe membership';
COMMENT ON COLUMN profiles.cafe_member_url IS 'URL to the user''s Naver Cafe profile';
COMMENT ON COLUMN profiles.naver_cafe_nickname IS 'User''s nickname in Naver Cafe';
COMMENT ON COLUMN profiles.naver_cafe_verified_at IS 'Timestamp when Naver Cafe verification was completed';
COMMENT ON COLUMN profiles.email IS 'User email address for notifications and identification';

-- Update existing profiles to have random nicknames if not set
UPDATE profiles 
SET random_nickname = 'User_' || substring(id::text, 1, 8)
WHERE random_nickname IS NULL;