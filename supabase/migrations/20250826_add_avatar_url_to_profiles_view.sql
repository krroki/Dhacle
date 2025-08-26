-- Drop the existing profiles view
DROP VIEW IF EXISTS profiles;

-- Recreate profiles view with avatar_url column
CREATE VIEW profiles AS
SELECT 
    id,
    username,
    full_name,
    avatar_url,  -- Add avatar_url column
    channel_name,
    channel_url,
    work_type,
    job_category,
    current_income,
    target_income,
    experience_level,
    randomnickname,
    created_at,
    updated_at
FROM users;