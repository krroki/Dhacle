-- ====================================================
-- Verify RLS Status for All Target Tables
-- Phase 3: Security Verification
-- Date: 2025-08-25
-- ====================================================

-- Check RLS status for all target tables
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN 'RLS ENABLED ✅'
        ELSE 'RLS DISABLED ❌'
    END as rls_status,
    CASE 
        WHEN rowsecurity = true THEN 1
        ELSE 0
    END as enabled_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'user_roles',
    'course_badges_extended',
    'user_certificates',
    'course_reviews'
)
ORDER BY tablename;

-- Count RLS policies for each table
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'user_roles',
    'course_badges_extended',
    'user_certificates',
    'course_reviews'
)
GROUP BY tablename
ORDER BY tablename;

-- Summary
SELECT 
    COUNT(*) as total_tables,
    SUM(CASE WHEN rowsecurity = true THEN 1 ELSE 0 END) as rls_enabled_count,
    SUM(CASE WHEN rowsecurity = false THEN 1 ELSE 0 END) as rls_disabled_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'user_roles',
    'course_badges_extended',
    'user_certificates',
    'course_reviews'
);

-- Detailed policy information
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    SUBSTRING(qual FROM 1 FOR 50) as qual_preview,
    SUBSTRING(with_check FROM 1 FOR 50) as check_preview
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'user_roles',
    'course_badges_extended',
    'user_certificates',
    'course_reviews'
)
ORDER BY tablename, policyname;