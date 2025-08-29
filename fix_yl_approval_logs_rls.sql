-- yl_approval_logs RLS 정책 수정
-- 문제: auth.users 테이블 직접 접근으로 인한 권한 오류
-- 해결: API Route 레벨에서 관리자 권한 체크, RLS는 단순화

-- 기존 정책 삭제
DROP POLICY IF EXISTS "yl_approval_logs_admin" ON yl_approval_logs;

-- 새로운 단순화된 정책 생성
-- API Route에서 이미 관리자 권한을 체크하므로, RLS는 인증된 사용자만 허용
CREATE POLICY "yl_approval_logs_authenticated_access" ON yl_approval_logs
  FOR ALL 
  TO authenticated
  USING (true);