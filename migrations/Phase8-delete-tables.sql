-- Phase 8: 데이터베이스 테이블 삭제 (YouTube 크리에이터 도구 사이트 전환)
-- ⚠️  경고: 이 작업은 되돌릴 수 없습니다!
--
-- 삭제 대상: 22개 테이블
-- - 강의 관련 (10개)
-- - 수익인증 관련 (6개)  
-- - 커뮤니티 관련 (5개)
-- - 기타 (1개)

-- =============================================================================
-- 1. 강의 관련 테이블 (10개) - CASCADE 삭제
-- =============================================================================

-- 강의 공지사항
DROP TABLE IF EXISTS course_announcements CASCADE;

-- 강의 배지 확장
DROP TABLE IF EXISTS course_badges_extended CASCADE;

-- 수강 등록
DROP TABLE IF EXISTS course_enrollments CASCADE;

-- 수강 진도 확장
DROP TABLE IF EXISTS course_progress_extended CASCADE;

-- 강의 Q&A
DROP TABLE IF EXISTS course_qna CASCADE;

-- 강의 리뷰
DROP TABLE IF EXISTS course_reviews CASCADE;

-- 강의 주차별 내용
DROP TABLE IF EXISTS course_weeks CASCADE;

-- 수강 진도 (중복)
DROP TABLE IF EXISTS courseprogressextended CASCADE;

-- 강의 메인 테이블
DROP TABLE IF EXISTS courses CASCADE;

-- 등록 정보 (중복)
DROP TABLE IF EXISTS enrollments CASCADE;

-- =============================================================================
-- 2. 수익인증 관련 테이블 (6개) - CASCADE 삭제
-- =============================================================================

-- 수익인증 댓글
DROP TABLE IF EXISTS proof_comments CASCADE;

-- 수익인증 좋아요
DROP TABLE IF EXISTS proof_likes CASCADE;

-- 수익인증 신고
DROP TABLE IF EXISTS proof_reports CASCADE;

-- 수익 인증서
DROP TABLE IF EXISTS revenue_certifications CASCADE;

-- 수익 인증 게시글
DROP TABLE IF EXISTS revenue_proofs CASCADE;

-- 수익 정보
DROP TABLE IF EXISTS revenues CASCADE;

-- =============================================================================
-- 3. 커뮤니티 관련 테이블 (5개) - CASCADE 삭제
-- =============================================================================

-- 커뮤니티
DROP TABLE IF EXISTS communities CASCADE;

-- 커뮤니티 댓글
DROP TABLE IF EXISTS community_comments CASCADE;

-- 커뮤니티 좋아요
DROP TABLE IF EXISTS community_likes CASCADE;

-- 커뮤니티 게시글
DROP TABLE IF EXISTS community_posts CASCADE;

-- 댓글 (범용)
DROP TABLE IF EXISTS comments CASCADE;

-- =============================================================================
-- 4. 기타 테이블 (1개)
-- =============================================================================

-- 쿠폰
DROP TABLE IF EXISTS coupons CASCADE;

-- =============================================================================
-- 삭제 완료 확인
-- =============================================================================

-- 삭제된 테이블 목록 확인 (22개가 모두 없어야 함)
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    -- 강의 관련 (10개)
    'course_announcements', 'course_badges_extended', 'course_enrollments',
    'course_progress_extended', 'course_qna', 'course_reviews', 'course_weeks',
    'courseprogressextended', 'courses', 'enrollments',
    -- 수익인증 관련 (6개)
    'proof_comments', 'proof_likes', 'proof_reports',
    'revenue_certifications', 'revenue_proofs', 'revenues',
    -- 커뮤니티 관련 (5개)
    'communities', 'community_comments', 'community_likes',
    'community_posts', 'comments',
    -- 기타 (1개)
    'coupons'
)
ORDER BY table_name;

-- 결과가 0 rows면 성공적으로 삭제됨

-- =============================================================================
-- Phase 8 완료 마크
-- =============================================================================

COMMENT ON SCHEMA public IS 'Phase 8 Complete: YouTube Creator Tools Site - 22 tables removed';