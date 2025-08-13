-- =============================================
-- Database Verification Query
-- Run this after executing fix-database-schema.sql
-- =============================================

-- Check if all required tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('profiles', 'revenue_proofs', 'proof_likes', 'proof_comments', 'proof_reports', 'user_badges', 'monthly_rankings')
    THEN '✅ Created'
    ELSE '❌ Missing'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'revenue_proofs', 'proof_likes', 'proof_comments', 'proof_reports', 'user_badges', 'monthly_rankings')
ORDER BY table_name;

-- Count records in each table
SELECT 
  'profiles' as table_name, 
  COUNT(*) as record_count 
FROM profiles
UNION ALL
SELECT 
  'revenue_proofs' as table_name, 
  COUNT(*) as record_count 
FROM revenue_proofs
UNION ALL
SELECT 
  'proof_likes' as table_name, 
  COUNT(*) as record_count 
FROM proof_likes
UNION ALL
SELECT 
  'proof_comments' as table_name, 
  COUNT(*) as record_count 
FROM proof_comments;

-- Check RLS policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'revenue_proofs', 'proof_likes', 'proof_comments')
ORDER BY tablename, policyname;