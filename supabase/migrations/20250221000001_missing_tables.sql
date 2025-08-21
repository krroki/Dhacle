-- ================================================================
-- 누락된 테이블 생성 스크립트
-- 생성일: 2025-02-21
-- 목적: TypeScript 오류 해결을 위한 누락 테이블 생성
-- ================================================================

-- 1. badges 테이블 (사용자 뱃지 시스템)
CREATE TABLE IF NOT EXISTS badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL,
    badge_level VARCHAR(20) DEFAULT 'bronze',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_type)
);

-- 2. course_enrollments 테이블 (강의 수강 신청)
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 3. revenues 테이블 (수익 인증 - 기존 revenue_proofs와 별개)
CREATE TABLE IF NOT EXISTS revenues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    proof_url TEXT,
    proof_type VARCHAR(50),
    description TEXT,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. naver_cafe_verifications 테이블 (네이버 카페 인증)
CREATE TABLE IF NOT EXISTS naver_cafe_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cafe_nickname VARCHAR(255) NOT NULL,
    cafe_member_url TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 5. proof_likes 테이블 (수익 인증 좋아요)
CREATE TABLE IF NOT EXISTS proof_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    proof_id UUID NOT NULL REFERENCES revenue_proofs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, proof_id)
);

-- 6. proof_comments 테이블 (수익 인증 댓글)
CREATE TABLE IF NOT EXISTS proof_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    proof_id UUID NOT NULL REFERENCES revenue_proofs(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES proof_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. course_progress_extended 테이블 (확장된 강의 진행 정보)
CREATE TABLE IF NOT EXISTS course_progress_extended (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    total_lessons INTEGER DEFAULT 0,
    completed_lessons INTEGER DEFAULT 0,
    last_position INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id, lesson_id)
);

-- 8. video_stats 테이블 (비디오 통계 - YouTube Lens 관련)
CREATE TABLE IF NOT EXISTS video_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    view_count BIGINT DEFAULT 0,
    like_count BIGINT DEFAULT 0,
    comment_count BIGINT DEFAULT 0,
    view_delta BIGINT DEFAULT 0,
    like_delta BIGINT DEFAULT 0,
    comment_delta BIGINT DEFAULT 0,
    viral_score DECIMAL(5, 2),
    engagement_rate DECIMAL(5, 2),
    views_per_hour DECIMAL(10, 2),
    snapshot_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(video_id, date)
);

-- ================================================================
-- 인덱스 생성
-- ================================================================

-- badges 인덱스
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_earned_at ON badges(earned_at DESC);

-- course_enrollments 인덱스
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_last_accessed ON course_enrollments(last_accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);

-- revenues 인덱스
CREATE INDEX IF NOT EXISTS idx_revenues_user_id ON revenues(user_id);
CREATE INDEX IF NOT EXISTS idx_revenues_verified ON revenues(verified);
CREATE INDEX IF NOT EXISTS idx_revenues_created_at ON revenues(created_at DESC);

-- naver_cafe_verifications 인덱스
CREATE INDEX IF NOT EXISTS idx_naver_cafe_verifications_user_id ON naver_cafe_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_naver_cafe_verifications_status ON naver_cafe_verifications(verification_status);

-- proof_likes 인덱스
CREATE INDEX IF NOT EXISTS idx_proof_likes_proof_id ON proof_likes(proof_id);
CREATE INDEX IF NOT EXISTS idx_proof_likes_user_id ON proof_likes(user_id);

-- proof_comments 인덱스
CREATE INDEX IF NOT EXISTS idx_proof_comments_proof_id ON proof_comments(proof_id);
CREATE INDEX IF NOT EXISTS idx_proof_comments_user_id ON proof_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_proof_comments_parent_id ON proof_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_proof_comments_created_at ON proof_comments(created_at DESC);

-- course_progress_extended 인덱스
CREATE INDEX IF NOT EXISTS idx_course_progress_extended_user_id ON course_progress_extended(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_extended_course_id ON course_progress_extended(course_id);

-- video_stats 인덱스
CREATE INDEX IF NOT EXISTS idx_video_stats_video_id ON video_stats(video_id);
CREATE INDEX IF NOT EXISTS idx_video_stats_date ON video_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_video_stats_viral_score ON video_stats(viral_score DESC);

-- ================================================================
-- RLS (Row Level Security) 정책
-- ================================================================

-- badges RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_select_own" ON badges
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "badges_insert_own" ON badges
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "badges_update_own" ON badges
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "badges_delete_own" ON badges
    FOR DELETE USING (user_id = auth.uid());

-- course_enrollments RLS
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_enrollments_select_own" ON course_enrollments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "course_enrollments_insert_own" ON course_enrollments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "course_enrollments_update_own" ON course_enrollments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "course_enrollments_delete_own" ON course_enrollments
    FOR DELETE USING (user_id = auth.uid());

-- revenues RLS
ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revenues_select_public" ON revenues
    FOR SELECT USING (verified = true OR user_id = auth.uid());

CREATE POLICY "revenues_insert_own" ON revenues
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "revenues_update_own" ON revenues
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "revenues_delete_own" ON revenues
    FOR DELETE USING (user_id = auth.uid());

-- naver_cafe_verifications RLS
ALTER TABLE naver_cafe_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "naver_cafe_verifications_select_own" ON naver_cafe_verifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "naver_cafe_verifications_insert_own" ON naver_cafe_verifications
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "naver_cafe_verifications_update_own" ON naver_cafe_verifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "naver_cafe_verifications_delete_own" ON naver_cafe_verifications
    FOR DELETE USING (user_id = auth.uid());

-- proof_likes RLS
ALTER TABLE proof_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proof_likes_select_all" ON proof_likes
    FOR SELECT USING (true);

CREATE POLICY "proof_likes_insert_own" ON proof_likes
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "proof_likes_delete_own" ON proof_likes
    FOR DELETE USING (user_id = auth.uid());

-- proof_comments RLS
ALTER TABLE proof_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proof_comments_select_all" ON proof_comments
    FOR SELECT USING (true);

CREATE POLICY "proof_comments_insert_own" ON proof_comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "proof_comments_update_own" ON proof_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "proof_comments_delete_own" ON proof_comments
    FOR DELETE USING (user_id = auth.uid());

-- course_progress_extended RLS
ALTER TABLE course_progress_extended ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_progress_extended_select_own" ON course_progress_extended
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "course_progress_extended_insert_own" ON course_progress_extended
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "course_progress_extended_update_own" ON course_progress_extended
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "course_progress_extended_delete_own" ON course_progress_extended
    FOR DELETE USING (user_id = auth.uid());

-- video_stats RLS (공개 데이터)
ALTER TABLE video_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "video_stats_select_all" ON video_stats
    FOR SELECT USING (true);

CREATE POLICY "video_stats_insert_service" ON video_stats
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "video_stats_update_service" ON video_stats
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "video_stats_delete_service" ON video_stats
    FOR DELETE USING (auth.role() = 'service_role');

-- ================================================================
-- 트리거 함수 (updated_at 자동 업데이트)
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_badges_updated_at BEFORE UPDATE ON badges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_enrollments_updated_at BEFORE UPDATE ON course_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenues_updated_at BEFORE UPDATE ON revenues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_naver_cafe_verifications_updated_at BEFORE UPDATE ON naver_cafe_verifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proof_comments_updated_at BEFORE UPDATE ON proof_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_progress_extended_updated_at BEFORE UPDATE ON course_progress_extended
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 완료 메시지
-- ================================================================
-- 모든 누락된 테이블이 성공적으로 생성되었습니다.
-- RLS 정책과 인덱스가 적용되었습니다.