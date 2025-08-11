-- 디하클 강의 시스템 데이터베이스 스키마
-- Version: 1.0
-- Date: 2025-01-11
-- Description: 강의, 수강, Q&A, 뱃지 관리를 위한 스키마

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
-- Supabase Storage 버킷 설정 (badges)
-- =====================================================
-- Storage 버킷 생성 (Supabase Dashboard에서 실행)
-- 1. Storage > New Bucket
-- 2. Name: badges
-- 3. Public: true (읽기 전용 공개)
-- 4. File size limit: 500KB
-- 5. Allowed MIME types: image/png, image/svg+xml

-- =====================================================
-- 초기 데이터 (옵션)
-- =====================================================

-- 관리자 역할 테이블 (없으면 생성)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'instructor', 'student')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 샘플 강의 데이터 (개발용)
-- badge_icon_url은 실제 이미지 업로드 후 URL 입력 필요
-- INSERT INTO courses (title, description, instructor_name, badge_icon_url, duration_weeks, price, is_premium, launch_date, status)
-- VALUES 
-- ('유튜브 쇼츠 입문 과정', '초보자를 위한 4주 완성 과정', '김철수', 
--  'https://[project-id].supabase.co/storage/v1/object/public/badges/badge_course_001.png',
--  4, 0, false, '2025-02-01', 'upcoming'),
-- ('쇼츠 마스터 과정', '수익화까지 완벽 정복하는 8주 과정', '이영희', 
--  'https://[project-id].supabase.co/storage/v1/object/public/badges/badge_course_002.png',
--  8, 200000, true, '2025-02-15', 'upcoming');