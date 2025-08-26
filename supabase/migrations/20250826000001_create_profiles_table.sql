-- ====================================================
-- Create Profiles Table - Complete Implementation
-- Date: 2025-08-26
-- Description: Create profiles table that code expects with all required fields
-- ====================================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'instructor', 'admin')),
  is_admin BOOLEAN DEFAULT false,
  randomNickname TEXT UNIQUE,
  channel_name TEXT,
  channel_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_random_nickname ON profiles(randomNickname);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;

-- RLS Policies
-- Allow anyone to read profiles (for public display)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only authenticated users can insert (usually during signup)
CREATE POLICY "Enable insert for authenticated users only" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migrate data from users table if it exists and profiles is empty
DO $$
BEGIN
  -- Check if users table exists and has data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    -- Only migrate if profiles table is empty
    IF NOT EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN
      -- Insert data from users table into profiles
      INSERT INTO profiles (
        id,
        email,
        username,
        full_name,
        avatar_url,
        role,
        channel_name,
        channel_url,
        created_at,
        updated_at
      )
      SELECT 
        id,
        email,
        username,
        full_name,
        avatar_url,
        role,
        channel_name,
        channel_url,
        created_at,
        updated_at
      FROM users
      ON CONFLICT (id) DO NOTHING;
      
      RAISE NOTICE '✅ Migrated data from users table to profiles table';
    END IF;
  END IF;
END $$;

-- Create or update function to handle new user signups
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Profiles table created successfully!';
  RAISE NOTICE 'Table includes: id, email, username, full_name, avatar_url, role, is_admin, randomNickname, channel_name, channel_url, bio';
END $$;