-- ====================================================
-- Fix Profiles Table - Add Missing Fields
-- Date: 2025-08-25
-- Description: Add missing fields to profiles table for admin checks and user features
-- ====================================================

-- Try to add is_admin field (ignore if exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Try to add randomNickname field (ignore if exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'randomNickname'
    ) THEN
        ALTER TABLE profiles ADD COLUMN randomNickname TEXT;
    END IF;
END $$;

-- Try to add avatar_url field (ignore if exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Create unique index for randomNickname if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_profiles_random_nickname'
        AND n.nspname = 'public'
    ) THEN
        CREATE UNIQUE INDEX idx_profiles_random_nickname ON profiles(randomNickname) WHERE randomNickname IS NOT NULL;
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Profiles table fields added successfully!';
    RAISE NOTICE 'Fields: is_admin, randomNickname, avatar_url';
END $$;