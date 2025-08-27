-- Check current constraints on users table
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'users'
AND (
    pg_get_constraintdef(con.oid) LIKE '%email%'
    OR con.conname LIKE '%email%'
);

-- Check if email column exists and its properties
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'email';

-- Check all indexes on email column
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'users'
AND indexdef LIKE '%email%';