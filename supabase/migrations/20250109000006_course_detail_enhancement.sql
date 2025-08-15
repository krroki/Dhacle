-- 강의 상세 페이지 개선을 위한 스키마 확장
-- Date: 2025-01-11
-- Description: FastCampus/인프런 스타일 강의 상세 페이지를 위한 필드 추가

-- courses 테이블에 새로운 컬럼 추가
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS student_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_price INT,
ADD COLUMN IF NOT EXISTS discount_rate INT DEFAULT 0 CHECK (discount_rate >= 0 AND discount_rate <= 100),
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS level VARCHAR(50) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS preview_video_url TEXT,
ADD COLUMN IF NOT EXISTS learning_goals JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_courses_rating ON courses(rating DESC);
CREATE INDEX IF NOT EXISTS idx_courses_student_count ON courses(student_count DESC);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);

-- 리뷰 테이블 생성 (추후 사용)
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- 리뷰 인덱스
CREATE INDEX IF NOT EXISTS idx_reviews_course ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON course_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON course_reviews(rating);

-- 강의 콘텐츠 블록 타입 정의 (JSONB 구조 예시)
COMMENT ON COLUMN courses.content_blocks IS '
[
  {
    "id": "unique-id",
    "type": "heading|text|image|video|gif|grid|divider|button|html|accordion",
    "content": "텍스트 내용",
    "url": "이미지/비디오 URL",
    "alt": "대체 텍스트",
    "style": {},
    "columns": [[]],
    "items": []
  }
]';

-- 샘플 데이터 업데이트 (개발용)
UPDATE courses 
SET 
  content_blocks = '[
    {"id": "1", "type": "heading", "content": "🎯 이런 분들께 추천해요"},
    {"id": "2", "type": "grid", "columns": [
      [{"type": "text", "content": "✅ 유튜브 쇼츠를 처음 시작하는 분"}],
      [{"type": "text", "content": "✅ 수익화를 목표로 하는 크리에이터"}]
    ]},
    {"id": "3", "type": "divider"},
    {"id": "4", "type": "heading", "content": "📚 무엇을 배우나요?"},
    {"id": "5", "type": "text", "content": "이 강의에서는 유튜브 쇼츠의 A부터 Z까지 모든 것을 다룹니다."},
    {"id": "6", "type": "image", "url": "/course-preview.jpg", "alt": "강의 미리보기"}
  ]'::jsonb,
  rating = 4.8,
  student_count = 1234,
  original_price = 199000,
  discount_rate = 50,
  category = '콘텐츠 제작',
  level = 'beginner',
  learning_goals = '[
    "쇼츠 알고리즘 완벽 이해",
    "바이럴 콘텐츠 제작 노하우",
    "수익화 전략 수립"
  ]'::jsonb,
  requirements = '[
    "스마트폰 (아이폰 또는 안드로이드)",
    "기본적인 영상 편집 앱",
    "열정과 꾸준함"
  ]'::jsonb,
  tags = '["유튜브", "쇼츠", "수익화", "콘텐츠"]'::jsonb
WHERE id IN (SELECT id FROM courses LIMIT 1);