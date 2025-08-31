-- Check columns in users table for admin-related fields
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
AND (
    column_name LIKE '%admin%' 
    OR column_name LIKE '%role%'
)
ORDER BY ordinal_position;

-- Check what role field contains
SELECT DISTINCT role
FROM users
WHERE role IS NOT NULL
LIMIT 10;