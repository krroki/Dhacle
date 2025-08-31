-- Check if profiles is a table or view
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- Check columns in auth.users
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Check if profiles view definition
SELECT pg_get_viewdef('public.profiles', true) AS view_definition;