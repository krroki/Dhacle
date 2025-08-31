-- RLS 정책 확인 쿼리
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = t.schemaname 
      AND tablename = t.tablename
    ) THEN 'YES'
    ELSE 'NO'
  END as has_policies,
  COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
WHERE t.schemaname = 'public'
GROUP BY t.schemaname, t.tablename
ORDER BY t.tablename;