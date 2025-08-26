-- Add randomNickname column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS randomNickname TEXT;

-- Create unique index to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_random_nickname 
ON users(randomNickname) 
WHERE randomNickname IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.randomNickname IS 'Randomly generated unique nickname for users';

-- Drop the existing profiles view
DROP VIEW IF EXISTS profiles;

-- Recreate profiles view with randomNickname column
CREATE VIEW profiles AS
SELECT 
    id,
    username,
    full_name,
    channel_name,
    channel_url,
    work_type,
    job_category,
    current_income,
    target_income,
    experience_level,
    randomNickname,  -- New column added
    created_at,
    updated_at
FROM users;