-- Add randomNickname column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS randomNickname TEXT;

-- Create unique index to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_random_nickname 
ON profiles(randomNickname) 
WHERE randomNickname IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.randomNickname IS 'Randomly generated unique nickname for users';