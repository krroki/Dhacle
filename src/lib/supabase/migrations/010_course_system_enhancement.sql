-- 디하클 강의 시스템 확장 마이그레이션
-- Version: 2.0
-- Date: 2025-01-14
-- Description: Stripe 결제, Cloudflare Stream, 쿠폰, 확장된 진도 추적

-- =====================================================
-- 1. lessons - 레슨 테이블 (course_weeks 보완)
-- =====================================================
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  video_url TEXT, -- Cloudflare Stream URL
  thumbnail_url TEXT,
  duration INTEGER, -- 초 단위
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, order_index)
);

-- 인덱스
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_order ON lessons(order_index);
CREATE INDEX idx_lessons_free ON lessons(is_free);

-- =====================================================
-- 2. purchases - 구매 내역 (Stripe 통합)
-- =====================================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'krw',
  coupon_id UUID,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 인덱스
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_course ON purchases(course_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_stripe_intent ON purchases(stripe_payment_intent_id);

-- =====================================================
-- 3. coupons - 쿠폰 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed_amount')),
  value DECIMAL(10,2) NOT NULL,
  min_purchase_amount DECIMAL(10,2),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE, -- NULL = 전체 강의 적용
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_course ON coupons(course_id);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupons_validity ON coupons(valid_from, valid_until);

-- =====================================================
-- 4. course_progress_extended - 확장된 진도 추적
-- =====================================================
CREATE TABLE IF NOT EXISTS course_progress_extended (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0, -- 시청한 초
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_watched_at TIMESTAMP WITH TIME ZONE,
  watch_count INTEGER DEFAULT 1,
  notes TEXT, -- 사용자 메모
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 인덱스
CREATE INDEX idx_progress_ext_user ON course_progress_extended(user_id);
CREATE INDEX idx_progress_ext_course ON course_progress_extended(course_id);
CREATE INDEX idx_progress_ext_lesson ON course_progress_extended(lesson_id);
CREATE INDEX idx_progress_ext_completed ON course_progress_extended(completed);

-- =====================================================
-- 5. course_badges_extended - 확장된 뱃지 정의
-- =====================================================
CREATE TABLE IF NOT EXISTS course_badges_extended (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  type VARCHAR(50) DEFAULT 'completion' CHECK (type IN ('completion', 'perfect', 'early_bird', 'special', 'milestone')),
  completion_criteria JSONB DEFAULT '{"type": "progress", "value": 100}'::jsonb,
  points INTEGER DEFAULT 0, -- 뱃지 포인트
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, type)
);

-- 인덱스
CREATE INDEX idx_badges_ext_course ON course_badges_extended(course_id);
CREATE INDEX idx_badges_ext_type ON course_badges_extended(type);

-- =====================================================
-- 6. user_certificates - 수료증
-- =====================================================
CREATE TABLE IF NOT EXISTS user_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  certificate_url TEXT,
  completion_rate DECIMAL(5,2), -- 완료율
  total_watch_time INTEGER, -- 총 시청 시간 (초)
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, course_id)
);

-- 인덱스
CREATE INDEX idx_certificates_user ON user_certificates(user_id);
CREATE INDEX idx_certificates_course ON user_certificates(course_id);
CREATE INDEX idx_certificates_number ON user_certificates(certificate_number);

-- =====================================================
-- 7. course_reviews - 강의 리뷰
-- =====================================================
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(200),
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 인덱스
CREATE INDEX idx_reviews_course ON course_reviews(course_id);
CREATE INDEX idx_reviews_user ON course_reviews(user_id);
CREATE INDEX idx_reviews_rating ON course_reviews(rating);
CREATE INDEX idx_reviews_created ON course_reviews(created_at DESC);

-- =====================================================
-- 8. instructor_profiles - 강사 프로필
-- =====================================================
CREATE TABLE IF NOT EXISTS instructor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  specialty VARCHAR(200),
  youtube_channel_url TEXT,
  instagram_url TEXT,
  total_students INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 인덱스
CREATE INDEX idx_instructor_user ON instructor_profiles(user_id);
CREATE INDEX idx_instructor_verified ON instructor_profiles(is_verified);

-- =====================================================
-- 9. 기존 courses 테이블 확장
-- =====================================================
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES instructor_profiles(id),
ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS total_duration INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS student_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preview_video_url TEXT,
ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS what_you_learn JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS target_audience JSONB DEFAULT '[]'::jsonb;

-- =====================================================
-- RLS 정책
-- =====================================================

-- lessons 테이블
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lessons_select_policy" ON lessons
  FOR SELECT TO authenticated, anon
  USING (
    is_free = true OR
    EXISTS (
      SELECT 1 FROM purchases
      WHERE purchases.user_id = auth.uid()
      AND purchases.course_id = lessons.course_id
      AND purchases.status = 'completed'
    ) OR
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.user_id = auth.uid()
      AND enrollments.course_id = lessons.course_id
      AND enrollments.is_active = true
    )
  );

CREATE POLICY "lessons_admin_policy" ON lessons
  FOR ALL TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- purchases 테이블
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchases_select_policy" ON purchases
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

CREATE POLICY "purchases_insert_policy" ON purchases
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- coupons 테이블
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons_select_policy" ON coupons
  FOR SELECT TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "coupons_admin_policy" ON coupons
  FOR ALL TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- course_progress_extended 테이블
ALTER TABLE course_progress_extended ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_ext_policy" ON course_progress_extended
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- course_reviews 테이블
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_policy" ON course_reviews
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "reviews_insert_policy" ON course_reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM purchases
      WHERE purchases.user_id = auth.uid()
      AND purchases.course_id = course_reviews.course_id
      AND purchases.status = 'completed'
    )
  );

CREATE POLICY "reviews_update_policy" ON course_reviews
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- instructor_profiles 테이블
ALTER TABLE instructor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instructor_select_policy" ON instructor_profiles
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "instructor_manage_policy" ON instructor_profiles
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid() OR
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- =====================================================
-- 트리거 함수
-- =====================================================

-- 진도 완료 시 자동 뱃지 발급
CREATE OR REPLACE FUNCTION check_course_completion_extended()
RETURNS TRIGGER AS $$
DECLARE
  total_lessons INT;
  completed_lessons INT;
  course_id_val UUID;
  user_id_val UUID;
BEGIN
  -- 강의 ID와 사용자 ID 가져오기
  SELECT course_id, user_id INTO course_id_val, user_id_val
  FROM course_progress_extended
  WHERE id = NEW.id;

  -- 전체 레슨 수
  SELECT COUNT(*) INTO total_lessons
  FROM lessons
  WHERE course_id = course_id_val;

  -- 완료한 레슨 수
  SELECT COUNT(*) INTO completed_lessons
  FROM course_progress_extended
  WHERE user_id = user_id_val
  AND course_id = course_id_val
  AND completed = true;

  -- 100% 완료 시 수료증 발급
  IF completed_lessons >= total_lessons AND total_lessons > 0 THEN
    -- 수료증 발급
    INSERT INTO user_certificates (
      user_id, 
      course_id, 
      certificate_number,
      completion_rate
    )
    VALUES (
      user_id_val,
      course_id_val,
      'CERT-' || substring(md5(random()::text) from 1 for 8) || '-' || to_char(NOW(), 'YYYYMMDD'),
      100.0
    )
    ON CONFLICT (user_id, course_id) DO NOTHING;

    -- 뱃지 발급
    INSERT INTO user_badges (user_id, course_id, badge_type)
    VALUES (user_id_val, course_id_val, 'completion')
    ON CONFLICT (user_id, course_id, badge_type) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_completion_extended_trigger
AFTER UPDATE OF completed ON course_progress_extended
FOR EACH ROW
WHEN (NEW.completed = true)
EXECUTE FUNCTION check_course_completion_extended();

-- 구매 완료 시 enrollments 테이블에도 추가
CREATE OR REPLACE FUNCTION sync_purchase_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO enrollments (
      user_id,
      course_id,
      payment_id,
      payment_status,
      payment_amount,
      is_active
    )
    VALUES (
      NEW.user_id,
      NEW.course_id,
      NEW.stripe_payment_intent_id,
      'completed',
      NEW.amount,
      true
    )
    ON CONFLICT (user_id, course_id) 
    DO UPDATE SET 
      payment_status = 'completed',
      is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_purchase_trigger
AFTER INSERT OR UPDATE ON purchases
FOR EACH ROW
EXECUTE FUNCTION sync_purchase_enrollment();

-- 리뷰 작성 시 강의 평점 업데이트
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  review_cnt INTEGER;
BEGIN
  SELECT AVG(rating), COUNT(*) INTO avg_rating, review_cnt
  FROM course_reviews
  WHERE course_id = NEW.course_id;

  UPDATE courses
  SET average_rating = avg_rating,
      review_count = review_cnt
  WHERE id = NEW.course_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON course_reviews
FOR EACH ROW
EXECUTE FUNCTION update_course_rating();

-- =====================================================
-- 기본 데이터
-- =====================================================

-- 관리자 역할 추가 (필요한 경우)
-- INSERT INTO user_roles (user_id, role)
-- VALUES 
--   ((SELECT id FROM auth.users WHERE email = 'admin@dhacle.com'), 'admin')
-- ON CONFLICT DO NOTHING;