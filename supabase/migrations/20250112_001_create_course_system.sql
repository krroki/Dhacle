-- 디하클 강의 시스템 데이터베이스 스키마
-- Version: 1.1
-- Date: 2025-01-12
-- Description: 강의, 수강, Q&A, 뱃지 관리를 위한 스키마

-- =====================================================
-- Extensions
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. courses - 강의 정보 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(500), -- 부제목 추가
  description TEXT,
  instructor_name VARCHAR(100) NOT NULL,
  thumbnail_url TEXT,
  badge_icon_url TEXT, -- 관리자가 업로드한 뱃지 이미지 URL (Supabase Storage)
  duration_weeks INT NOT NULL CHECK (duration_weeks IN (4, 8)),
  price INT NOT NULL DEFAULT 0, -- 0 = 무료, 단위: 원
  original_price INT, -- 원가 (할인 전)
  discount_rate INT CHECK (discount_rate >= 0 AND discount_rate <= 100), -- 할인율
  is_premium BOOLEAN DEFAULT false,
  chat_room_url TEXT, -- 카카오 오픈채팅 링크
  launch_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  max_students INT DEFAULT NULL, -- NULL = 무제한
  included_items TEXT[], -- 포함 사항 배열
  duration_info VARCHAR(200), -- 수강 기한 정보
  content_blocks JSONB DEFAULT '[]'::jsonb, -- 콘텐츠 블록 시스템
  curriculum JSONB DEFAULT '[]'::jsonb, -- 커리큘럼 정보
  faqs JSONB DEFAULT '[]'::jsonb, -- FAQ 정보
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
  learning_objectives TEXT[], -- 학습 목표
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
  expires_at TIMESTAMP WITH TIME ZONE, -- 수강 만료일
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
-- 7. course_announcements - 강의 공지사항
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
-- 8. qna_likes - Q&A 좋아요
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
-- 9. user_roles - 사용자 역할 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'instructor', 'student')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 인덱스
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

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
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "qna_insert_policy" ON course_qna
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM enrollments 
    WHERE enrollments.course_id = course_qna.course_id 
    AND enrollments.user_id = auth.uid()
  ));

CREATE POLICY "qna_update_policy" ON course_qna
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role IN ('admin', 'instructor')
  ));

-- user_badges 테이블
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_select_policy" ON user_badges
  FOR SELECT TO authenticated, anon
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

CREATE TRIGGER update_course_announcements_updated_at BEFORE UPDATE ON course_announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Q&A 좋아요 카운트 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_qna_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE course_qna SET like_count = like_count + 1 WHERE id = NEW.qna_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE course_qna SET like_count = like_count - 1 WHERE id = OLD.qna_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_like_count_trigger
AFTER INSERT OR DELETE ON qna_likes
FOR EACH ROW EXECUTE FUNCTION update_qna_like_count();

-- 진도 완료 시 자동으로 수료증 발급 체크
CREATE OR REPLACE FUNCTION check_course_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_weeks INT;
  completed_weeks INT;
  course_id_val UUID;
  user_id_val UUID;
BEGIN
  -- 강의의 전체 주차 수 확인
  SELECT c.duration_weeks, c.id, e.user_id 
  INTO total_weeks, course_id_val, user_id_val
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
    INSERT INTO user_badges (user_id, course_id, badge_type, metadata)
    VALUES (
      user_id_val, 
      course_id_val, 
      'completion',
      jsonb_build_object(
        'completed_weeks', completed_weeks,
        'completion_date', NOW()
      )
    )
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
-- 뷰(Views) 생성 - 자주 사용되는 조회
-- =====================================================

-- 강의 목록 뷰 (상세 정보 포함)
CREATE OR REPLACE VIEW course_list_view AS
SELECT 
  c.*,
  COUNT(DISTINCT e.user_id) as enrolled_students,
  AVG(
    CASE 
      WHEN p.total_seconds > 0 
      THEN (p.watched_seconds::float / p.total_seconds) * 100 
      ELSE 0 
    END
  ) as avg_progress
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id AND e.is_active = true
LEFT JOIN progress p ON p.enrollment_id = e.id
GROUP BY c.id;

-- 사용자 진도 뷰
CREATE OR REPLACE VIEW user_progress_view AS
SELECT 
  e.user_id,
  e.course_id,
  c.title as course_title,
  c.duration_weeks,
  COUNT(p.id) as started_weeks,
  COUNT(CASE WHEN p.completed THEN 1 END) as completed_weeks,
  AVG(
    CASE 
      WHEN p.total_seconds > 0 
      THEN (p.watched_seconds::float / p.total_seconds) * 100 
      ELSE 0 
    END
  ) as overall_progress,
  e.enrolled_at,
  e.completed_at
FROM enrollments e
JOIN courses c ON e.course_id = c.id
LEFT JOIN progress p ON p.enrollment_id = e.id
WHERE e.is_active = true
GROUP BY e.user_id, e.course_id, c.title, c.duration_weeks, e.enrolled_at, e.completed_at;

-- =====================================================
-- 샘플 데이터 (개발용) - 주석 처리됨
-- =====================================================

-- 테스트용 관리자 계정 (실제 환경에서는 별도 처리)
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'admin' 
-- FROM auth.users 
-- WHERE email = 'admin@dhacle.com'
-- ON CONFLICT DO NOTHING;

-- 샘플 강의 데이터
-- INSERT INTO courses (
--   title, 
--   subtitle,
--   description, 
--   instructor_name, 
--   thumbnail_url,
--   badge_icon_url, 
--   duration_weeks, 
--   price, 
--   original_price,
--   discount_rate,
--   is_premium, 
--   launch_date, 
--   status,
--   included_items,
--   duration_info,
--   content_blocks
-- )
-- VALUES 
-- (
--   '유튜브 쇼츠 입문 과정',
--   '초보자도 4주만에 쇼츠 전문가로',
--   '유튜브 쇼츠의 기초부터 수익화까지 체계적으로 학습하는 입문 과정입니다.',
--   '김철수',
--   '/images/courses/shorts-basic.jpg',
--   '/images/badges/badge-basic.png',
--   4,
--   0,
--   NULL,
--   NULL,
--   false,
--   '2025-02-01',
--   'upcoming',
--   ARRAY['강의 영상 20개', '실습 자료', '수료증', '커뮤니티 접근'],
--   '수강 기한 없음',
--   '[
--     {"id": "1", "type": "heading", "content": "이 강의를 들으면"},
--     {"id": "2", "type": "text", "content": "4주 안에 쇼츠 전문가가 될 수 있습니다"},
--     {"id": "3", "type": "image", "url": "/images/course-detail-1.jpg"}
--   ]'::jsonb
-- );

-- =====================================================
-- 마이그레이션 완료 메시지
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Course system schema migration completed successfully';
END$$;