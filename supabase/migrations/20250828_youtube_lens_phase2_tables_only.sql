-- YouTube Lens Phase 2: Tables Only (without functions)
-- Created: 2025-08-28
-- Purpose: Add tables for Shorts detection, keyword trends, category stats, and follow updates

-- ============================================
-- 1. 비디오 메타데이터 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS yl_videos (
  video_id TEXT PRIMARY KEY,
  channel_id TEXT REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER,
  is_shorts BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  view_count BIGINT DEFAULT 0,
  like_count BIGINT DEFAULT 0,
  comment_count BIGINT DEFAULT 0,
  thumbnail_url TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_videos_channel ON yl_videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_videos_shorts ON yl_videos(is_shorts);
CREATE INDEX IF NOT EXISTS idx_videos_published ON yl_videos(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_views ON yl_videos(view_count DESC);

-- ============================================
-- 2. 키워드 트렌드 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS yl_keyword_trends (
  keyword TEXT,
  date DATE,
  frequency INTEGER DEFAULT 1,
  channels TEXT[], -- 해당 키워드 사용 채널들
  growth_rate NUMERIC(5,2),
  category TEXT,
  PRIMARY KEY(keyword, date)
);

CREATE INDEX IF NOT EXISTS idx_keywords_date ON yl_keyword_trends(date DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_frequency ON yl_keyword_trends(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_growth ON yl_keyword_trends(growth_rate DESC);

-- ============================================
-- 3. 카테고리 통계 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS yl_category_stats (
  category TEXT,
  subcategory TEXT,
  date DATE,
  channel_count INTEGER DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  total_subscribers BIGINT DEFAULT 0,
  avg_delta_views BIGINT DEFAULT 0,
  top_channel_id TEXT,
  PRIMARY KEY(category, subcategory, date)
);

CREATE INDEX IF NOT EXISTS idx_category_stats_date ON yl_category_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_category_stats_views ON yl_category_stats(total_views DESC);

-- ============================================
-- 4. 팔로우 채널 업데이트 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS yl_follow_updates (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  update_type TEXT CHECK (update_type IN ('new_video', 'milestone', 'trending')),
  message TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_follow_updates_user ON yl_follow_updates(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_follow_updates_created ON yl_follow_updates(created_at DESC);

-- ============================================
-- RLS (Row Level Security) 정책
-- ============================================

-- yl_videos 테이블 RLS
ALTER TABLE yl_videos ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 조회 가능
CREATE POLICY "Videos are viewable by everyone" ON yl_videos
  FOR SELECT USING (true);

-- 인증된 사용자만 삽입/수정 가능 
CREATE POLICY "Videos are insertable by authenticated users" ON yl_videos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Videos are updatable by authenticated users" ON yl_videos
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- yl_keyword_trends 테이블 RLS
ALTER TABLE yl_keyword_trends ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 조회 가능
CREATE POLICY "Keyword trends are viewable by everyone" ON yl_keyword_trends
  FOR SELECT USING (true);

-- 시스템만 삽입/수정 가능
CREATE POLICY "Keyword trends are managed by system" ON yl_keyword_trends
  FOR ALL USING (auth.uid() IS NOT NULL);

-- yl_category_stats 테이블 RLS
ALTER TABLE yl_category_stats ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 조회 가능
CREATE POLICY "Category stats are viewable by everyone" ON yl_category_stats
  FOR SELECT USING (true);

-- 시스템만 삽입/수정 가능
CREATE POLICY "Category stats are managed by system" ON yl_category_stats
  FOR ALL USING (auth.uid() IS NOT NULL);

-- yl_follow_updates 테이블 RLS
ALTER TABLE yl_follow_updates ENABLE ROW LEVEL SECURITY;

-- 자신의 업데이트만 조회 가능
CREATE POLICY "Users can view own follow updates" ON yl_follow_updates
  FOR SELECT USING (auth.uid() = user_id);

-- 자신의 업데이트만 수정 가능 (읽음 표시 등)
CREATE POLICY "Users can update own follow updates" ON yl_follow_updates
  FOR UPDATE USING (auth.uid() = user_id);

-- 시스템만 삽입 가능
CREATE POLICY "System can insert follow updates" ON yl_follow_updates
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 권한 부여
-- ============================================

-- 필요한 권한 부여 (authenticated 역할)
GRANT SELECT ON yl_videos TO authenticated;
GRANT INSERT, UPDATE ON yl_videos TO authenticated;

GRANT SELECT ON yl_keyword_trends TO authenticated;
GRANT SELECT ON yl_category_stats TO authenticated;

GRANT SELECT, UPDATE ON yl_follow_updates TO authenticated;
GRANT INSERT ON yl_follow_updates TO service_role;

-- 시퀀스 권한
GRANT USAGE, SELECT ON SEQUENCE yl_follow_updates_id_seq TO authenticated;