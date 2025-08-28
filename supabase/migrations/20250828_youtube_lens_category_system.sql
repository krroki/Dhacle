-- YouTube Lens Phase 3: Category System Implementation
-- Created: 2025-08-28
-- Purpose: Add category classification system for channels and channel folders

BEGIN;

-- ============================================
-- 1. yl_channels 테이블에 카테고리 필드 추가
-- ============================================

-- 1차 카테고리 (대분류)
ALTER TABLE yl_channels
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- 2차 카테고리 (소분류)
ALTER TABLE yl_channels
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);

-- 지배적 형식 (쇼츠/롱폼/라이브)
ALTER TABLE yl_channels
ADD COLUMN IF NOT EXISTS dominant_format VARCHAR(50)
CHECK (dominant_format IN ('쇼츠', '롱폼', '라이브', '혼합', NULL));

-- 형식 분석 결과 저장 (쇼츠 개수, 롱폼 개수, 라이브 개수)
ALTER TABLE yl_channels
ADD COLUMN IF NOT EXISTS format_stats JSONB DEFAULT '{
  "shorts": 0,
  "longform": 0, 
  "live": 0,
  "analyzed_at": null
}';

-- 채널 언어
ALTER TABLE yl_channels
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'ko';

-- 채널 국가
ALTER TABLE yl_channels  
ADD COLUMN IF NOT EXISTS country VARCHAR(10) DEFAULT 'KR';

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_yl_channels_category ON yl_channels(category);
CREATE INDEX IF NOT EXISTS idx_yl_channels_subcategory ON yl_channels(subcategory);
CREATE INDEX IF NOT EXISTS idx_yl_channels_dominant_format ON yl_channels(dominant_format);

-- ============================================
-- 2. 카테고리 마스터 테이블 (카테고리 목록 관리)
-- ============================================
CREATE TABLE IF NOT EXISTS yl_categories (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, subcategory)
);

-- 기본 카테고리 데이터 삽입
INSERT INTO yl_categories (category, subcategory, display_order) VALUES
  ('게임', '액션', 1),
  ('게임', 'RPG', 2),
  ('게임', '전략', 3),
  ('게임', '스포츠', 4),
  ('음악', 'K-POP', 5),
  ('음악', '팝송', 6),
  ('음악', '인디', 7),
  ('음악', '클래식', 8),
  ('교육', '영어', 9),
  ('교육', '프로그래밍', 10),
  ('교육', '과학', 11),
  ('교육', '역사', 12),
  ('먹방', '한식', 13),
  ('먹방', '양식', 14),
  ('먹방', '중식', 15),
  ('먹방', '일식', 16),
  ('뷰티', '메이크업', 17),
  ('뷰티', '헤어', 18),
  ('뷰티', '패션', 19),
  ('뷰티', '네일', 20),
  ('엔터테인먼트', '코미디', 21),
  ('엔터테인먼트', '드라마', 22),
  ('엔터테인먼트', '예능', 23),
  ('라이프스타일', '브이로그', 24),
  ('라이프스타일', '여행', 25),
  ('라이프스타일', '요리', 26),
  ('테크', '리뷰', 27),
  ('테크', '개발', 28),
  ('테크', 'AI', 29),
  ('스포츠', '축구', 30),
  ('스포츠', '야구', 31),
  ('스포츠', '농구', 32)
ON CONFLICT (category, subcategory) DO NOTHING;

-- ============================================
-- 3. 채널 폴더 테이블 (채널 그룹 관리)
-- ============================================
CREATE TABLE IF NOT EXISTS yl_channel_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- HEX color code
  icon VARCHAR(50), -- icon name
  is_public BOOLEAN DEFAULT false,
  monitoring_enabled BOOLEAN DEFAULT true,
  monitoring_interval VARCHAR(20) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_channel_folders_user ON yl_channel_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_folders_public ON yl_channel_folders(is_public);

-- ============================================
-- 4. 폴더-채널 연결 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS yl_folder_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID REFERENCES yl_channel_folders(id) ON DELETE CASCADE,
  channel_id VARCHAR(50) REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(folder_id, channel_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_folder_channels_folder ON yl_folder_channels(folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_channels_channel ON yl_folder_channels(channel_id);

-- ============================================
-- 5. 형식 판별 함수 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION determine_dominant_format(
  shorts_count INTEGER,
  longform_count INTEGER,
  live_count INTEGER
) RETURNS VARCHAR AS $$
DECLARE
  total INTEGER;
  shorts_percent NUMERIC;
  longform_percent NUMERIC;
  live_percent NUMERIC;
BEGIN
  total := shorts_count + longform_count + live_count;
  
  -- 비디오가 없으면 NULL
  IF total = 0 THEN
    RETURN NULL;
  END IF;
  
  shorts_percent := (shorts_count::NUMERIC / total) * 100;
  longform_percent := (longform_count::NUMERIC / total) * 100;
  live_percent := (live_count::NUMERIC / total) * 100;
  
  -- 60% 이상이면 해당 형식이 지배적
  IF shorts_percent >= 60 THEN
    RETURN '쇼츠';
  ELSIF longform_percent >= 60 THEN
    RETURN '롱폼';
  ELSIF live_percent >= 60 THEN
    RETURN '라이브';
  ELSE
    RETURN '혼합';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. RLS (Row Level Security) 정책
-- ============================================

-- yl_categories 테이블 RLS
ALTER TABLE yl_categories ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 카테고리 목록 조회 가능
CREATE POLICY "Categories are viewable by everyone" ON yl_categories
  FOR SELECT USING (true);

-- 관리자만 카테고리 관리 가능
CREATE POLICY "Categories are manageable by admin" ON yl_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- yl_channel_folders 테이블 RLS
ALTER TABLE yl_channel_folders ENABLE ROW LEVEL SECURITY;

-- 자신의 폴더 관리
CREATE POLICY "Users can manage own folders" ON yl_channel_folders
  FOR ALL USING (auth.uid() = user_id);

-- 공개 폴더는 누구나 조회 가능
CREATE POLICY "Public folders are viewable by everyone" ON yl_channel_folders
  FOR SELECT USING (is_public = true);

-- yl_folder_channels 테이블 RLS
ALTER TABLE yl_folder_channels ENABLE ROW LEVEL SECURITY;

-- 폴더 소유자가 채널 관리
CREATE POLICY "Folder owners can manage channels" ON yl_folder_channels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM yl_channel_folders
      WHERE yl_channel_folders.id = folder_id
      AND yl_channel_folders.user_id = auth.uid()
    )
  );

-- 공개 폴더의 채널은 누구나 조회 가능
CREATE POLICY "Public folder channels are viewable" ON yl_folder_channels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM yl_channel_folders
      WHERE yl_channel_folders.id = folder_id
      AND yl_channel_folders.is_public = true
    )
  );

-- ============================================
-- 7. 권한 부여
-- ============================================

-- 테이블 권한
GRANT SELECT ON yl_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON yl_channel_folders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON yl_folder_channels TO authenticated;

-- 시퀀스 권한
GRANT USAGE, SELECT ON SEQUENCE yl_categories_id_seq TO authenticated;

-- ============================================
-- 8. 업데이트 트리거
-- ============================================

-- updated_at 자동 업데이트 트리거 재사용
DROP TRIGGER IF EXISTS update_yl_channel_folders_updated_at ON yl_channel_folders;
CREATE TRIGGER update_yl_channel_folders_updated_at
  BEFORE UPDATE ON yl_channel_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ============================================
-- 9. 검증 쿼리
-- ============================================

-- 카테고리 필드가 추가되었는지 확인
DO $$
BEGIN
  -- 필드 존재 확인
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'yl_channels'
    AND column_name IN ('category', 'subcategory', 'dominant_format')
  ) THEN
    RAISE NOTICE 'Category fields successfully added to yl_channels table';
  ELSE
    RAISE EXCEPTION 'Category fields were not added properly';
  END IF;
  
  -- 폴더 테이블 확인
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'yl_channel_folders'
  ) THEN
    RAISE NOTICE 'Channel folders table successfully created';
  END IF;
  
  RAISE NOTICE 'YouTube Lens Category System migration completed successfully!';
END;
$$;