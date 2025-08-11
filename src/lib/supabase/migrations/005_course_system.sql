-- 디하클 강의 시스템 데이터베이스 스키마
-- Version: 1.0
-- Date: 2025-01-11
-- Description: 강의, 수강, Q&A, 뱃지 관리를 위한 스키마

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 0. user_roles - 사용자 역할 테이블 (필요시)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'instructor', 'student')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- =====================================================
-- 1. courses - 강의 정보 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  instructor_name VARCHAR(100) NOT NULL,
  thumbnail_url TEXT,
  badge_icon_url TEXT, -- 관리자가 업로드한 뱃지 이미지 URL (Supabase Storage)
  duration_weeks INT NOT NULL CHECK (duration_weeks IN (4, 8)),
  price INT NOT NULL DEFAULT 0, -- 0 = 무료, 단위: 원
  is_premium BOOLEAN DEFAULT false,
  chat_room_url TEXT, -- 카카오 오픈채팅 링크
  launch_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  max_students INT DEFAULT NULL, -- NULL = 무제한
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_is_premium ON courses(is_premium);
CREATE INDEX idx_courses_launch_date ON courses(launch_date DESC);

-- =====================================================
-- 2. course_weeks - 주차별 콘텐츠
-- =====================================================
CREATE TABLE IF NOT EXISTS course_weeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  week_number INT NOT NULL CHECK (week_number BETWEEN 1 AND 8),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL, -- HLS 스트리밍 URL (m3u8)
  video_duration INT, -- 초 단위
  download_materials JSONB DEFAULT '[]'::jsonb, -- [{name: string, url: string, size: number}]
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, week_number)
);

-- 인덱스
CREATE INDEX idx_course_weeks_course ON course_weeks(course_id);
CREATE INDEX idx_course_weeks_published ON course_weeks(is_published);

-- =====================================================
-- 3. enrollments - 수강 신청 및 결제 정보
-- =====================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  payment_id VARCHAR(200), -- Stripe payment intent ID
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_amount INT, -- 실제 결제 금액
  payment_method VARCHAR(50), -- card, bank_transfer 등
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_issued BOOLEAN DEFAULT false,
  certificate_issued_at TIMESTAMP WITH TIME ZONE,
  certificate_url TEXT,
  is_active BOOLEAN DEFAULT true, -- 수강 활성 상태
  UNIQUE(user_id, course_id)
);

-- 인덱스
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_payment_status ON enrollments(payment_status);
CREATE INDEX idx_enrollments_active ON enrollments(is_active);

-- =====================================================
-- 4. progress - 진도 관리
-- =====================================================
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  week_number INT NOT NULL CHECK (week_number BETWEEN 1 AND 8),
  watched_seconds INT DEFAULT 0, -- 시청한 시간 (초)
  total_seconds INT, -- 전체 영상 길이 (초)
  last_position INT DEFAULT 0, -- 마지막 시청 위치 (초)
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  watch_count INT DEFAULT 0, -- 시청 횟수
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(enrollment_id, week_number)
);

-- 인덱스
CREATE INDEX idx_progress_enrollment ON progress(enrollment_id);
CREATE INDEX idx_progress_completed ON progress(completed);

-- =====================================================
-- 5. course_qna - Q&A 게시판
-- =====================================================
CREATE TABLE IF NOT EXISTS course_qna (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES course_qna(id) ON DELETE CASCADE, -- 답글용
  title VARCHAR(200), -- 질문일 때만 사용
  content TEXT NOT NULL,
  is_answer BOOLEAN DEFAULT false, -- 강사/관리자 답변 여부
  is_pinned BOOLEAN DEFAULT false, -- 상단 고정
  is_resolved BOOLEAN DEFAULT false, -- 해결됨 표시
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_qna_course ON course_qna(course_id);
CREATE INDEX idx_qna_user ON course_qna(user_id);
CREATE INDEX idx_qna_parent ON course_qna(parent_id);
CREATE INDEX idx_qna_created ON course_qna(created_at DESC);
CREATE INDEX idx_qna_pinned ON course_qna(is_pinned);

-- =====================================================
-- 6. user_badges - 사용자 뱃지 (수료증)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) DEFAULT 'completion' CHECK (badge_type IN ('completion', 'perfect', 'early_bird', 'special')),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb, -- 추가 정보 (점수, 순위 등)
  UNIQUE(user_id, course_id, badge_type)
);

-- 인덱스
CREATE INDEX idx_badges_user ON user_badges(user_id);
CREATE INDEX idx_badges_course ON user_badges(course_id);
CREATE INDEX idx_badges_earned ON user_badges(earned_at DESC);

-- =====================================================
-- 7. course_announcements - 강의 공지사항 (추가)
-- =====================================================
CREATE TABLE IF NOT EXISTS course_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_important BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_announcements_course ON course_announcements(course_id);
CREATE INDEX idx_announcements_created ON course_announcements(created_at DESC);

-- =====================================================
-- 8. qna_likes - Q&A 좋아요 (추가)
-- =====================================================
CREATE TABLE IF NOT EXISTS qna_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qna_id UUID NOT NULL REFERENCES course_qna(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(qna_id, user_id)
);

-- 인덱스
CREATE INDEX idx_qna_likes_qna ON qna_likes(qna_id);
CREATE INDEX idx_qna_likes_user ON qna_likes(user_id);

-- =====================================================
-- RLS (Row Level Security) 정책
-- =====================================================

-- courses 테이블
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_select_policy" ON courses
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "courses_insert_policy" ON courses
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

CREATE POLICY "courses_update_policy" ON courses
  FOR UPDATE TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

-- course_weeks 테이블
ALTER TABLE course_weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_weeks_select_policy" ON course_weeks
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "course_weeks_insert_policy" ON course_weeks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

CREATE POLICY "course_weeks_update_policy" ON course_weeks
  FOR UPDATE TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

-- enrollments 테이블
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments_select_policy" ON enrollments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

CREATE POLICY "enrollments_insert_policy" ON enrollments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- progress 테이블
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_select_policy" ON progress
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM enrollments 
    WHERE enrollments.id = progress.enrollment_id 
    AND enrollments.user_id = auth.uid()
  ));

CREATE POLICY "progress_insert_update_policy" ON progress
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM enrollments 
    WHERE enrollments.id = progress.enrollment_id 
    AND enrollments.user_id = auth.uid()
  ));

-- course_qna 테이블
ALTER TABLE course_qna ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qna_select_policy" ON course_qna
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "qna_insert_policy" ON course_qna
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "qna_update_policy" ON course_qna
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role IN ('admin', 'instructor')
  ));

-- user_badges 테이블
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_select_policy" ON user_badges
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "badges_insert_policy" ON user_badges
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

-- course_announcements 테이블
ALTER TABLE course_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements_select_policy" ON course_announcements
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "announcements_insert_policy" ON course_announcements
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role IN ('admin', 'instructor')
  ));

-- qna_likes 테이블
ALTER TABLE qna_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qna_likes_select_policy" ON qna_likes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "qna_likes_insert_policy" ON qna_likes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "qna_likes_delete_policy" ON qna_likes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- 트리거 함수
-- =====================================================

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_weeks_updated_at BEFORE UPDATE ON course_weeks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_qna_updated_at BEFORE UPDATE ON course_qna
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_announcements_updated_at BEFORE UPDATE ON course_announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 진도 완료 시 자동으로 수료증 발급 체크
CREATE OR REPLACE FUNCTION check_course_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_weeks INT;
  completed_weeks INT;
BEGIN
  -- 강의의 전체 주차 수 확인
  SELECT duration_weeks INTO total_weeks
  FROM courses c
  JOIN enrollments e ON e.course_id = c.id
  WHERE e.id = NEW.enrollment_id;
  
  -- 완료한 주차 수 확인
  SELECT COUNT(*) INTO completed_weeks
  FROM progress
  WHERE enrollment_id = NEW.enrollment_id
  AND completed = true;
  
  -- 모든 주차를 완료했으면 수료 처리
  IF completed_weeks >= total_weeks THEN
    UPDATE enrollments
    SET completed_at = NOW(),
        certificate_issued = true,
        certificate_issued_at = NOW()
    WHERE id = NEW.enrollment_id;
    
    -- 뱃지 발급
    INSERT INTO user_badges (user_id, course_id, badge_type)
    SELECT e.user_id, e.course_id, 'completion'
    FROM enrollments e
    WHERE e.id = NEW.enrollment_id
    ON CONFLICT (user_id, course_id, badge_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_completion_trigger
AFTER UPDATE OF completed ON progress
FOR EACH ROW
WHEN (NEW.completed = true)
EXECUTE FUNCTION check_course_completion();

-- =====================================================
-- 샘플 데이터 (개발용)
-- =====================================================

-- 샘플 강의 데이터 삽입
INSERT INTO courses (title, description, instructor_name, thumbnail_url, badge_icon_url, duration_weeks, price, is_premium, launch_date, status)
VALUES 
('유튜브 쇼츠 입문 과정', '초보자를 위한 4주 완성 과정입니다. 기초부터 차근차근 배워보세요.', '김철수', 
 '/images/courses/course1-thumbnail.jpg',
 '/images/badges/badge-beginner.png',
 4, 0, false, '2025-02-01', 'upcoming'),
('쇼츠 마스터 과정', '수익화까지 완벽 정복하는 8주 과정입니다. 전문가가 되어보세요.', '이영희', 
 '/images/courses/course2-thumbnail.jpg',
 '/images/badges/badge-master.png',
 8, 200000, true, '2025-02-15', 'upcoming'),
('콘텐츠 기획 특강', '아이디어부터 실행까지, 4주간의 집중 트레이닝', '박지민',
 '/images/courses/course3-thumbnail.jpg',
 '/images/badges/badge-planning.png',
 4, 50000, true, '2025-02-01', 'active'),
('알고리즘 완전정복', '유튜브 알고리즘의 모든 것을 파헤치는 4주 과정', '최준호',
 '/images/courses/course4-thumbnail.jpg',
 '/images/badges/badge-algorithm.png',
 4, 0, false, '2025-03-01', 'upcoming')
ON CONFLICT DO NOTHING;

-- 주차별 콘텐츠 샘플 (첫 번째 강의용)
INSERT INTO course_weeks (course_id, week_number, title, description, video_url, video_duration, is_published)
SELECT 
  c.id,
  w.week_number,
  'Week ' || w.week_number || ': ' || 
  CASE w.week_number
    WHEN 1 THEN '쇼츠 기초 이론'
    WHEN 2 THEN '콘텐츠 기획하기'
    WHEN 3 THEN '촬영과 편집'
    WHEN 4 THEN '업로드와 분석'
  END,
  '이번 주차에서는 중요한 내용을 다룹니다.',
  'https://example.com/videos/week' || w.week_number || '.m3u8',
  2700, -- 45분
  true
FROM courses c
CROSS JOIN (VALUES (1), (2), (3), (4)) AS w(week_number)
WHERE c.title = '유튜브 쇼츠 입문 과정'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 주의사항
-- =====================================================
-- 1. 이 스크립트를 실행하기 전에 Supabase Dashboard에서 'badges' Storage 버킷을 생성해야 합니다.
-- 2. Storage > New Bucket > Name: badges, Public: true
-- 3. 실제 배포 시에는 샘플 데이터 부분을 제거하거나 수정해야 합니다.
-- 4. badge_icon_url과 thumbnail_url은 실제 이미지 업로드 후 수정이 필요합니다.