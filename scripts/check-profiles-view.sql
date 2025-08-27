-- Get the current definition of the profiles view
SELECT pg_get_viewdef('public.profiles', true) AS view_definition;

-- Check columns in the profiles view
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check columns in the users table that contain 'nickname'
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
AND column_name LIKE '%nickname%'
ORDER BY ordinal_position;