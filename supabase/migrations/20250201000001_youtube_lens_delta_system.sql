-- YouTube Lens Delta System Migration
-- Phase 1: Core Tables for Channel Management and Delta Tracking

-- 1. 채널 마스터 테이블
CREATE TABLE IF NOT EXISTS yl_channels (
  channel_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  handle TEXT,
  description TEXT,
  custom_url TEXT,
  thumbnail_url TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approval_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'import', 'search', 'recommendation')),
  subscriber_count BIGINT,
  view_count_total BIGINT,
  video_count INTEGER,
  category TEXT,
  subcategory TEXT,
  tags TEXT[],
  dominant_format TEXT CHECK (dominant_format IN ('쇼츠', '롱폼', '라이브', NULL)),
  country TEXT DEFAULT 'KR',
  language TEXT DEFAULT 'ko',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_yl_channels_status ON yl_channels(approval_status);
CREATE INDEX idx_yl_channels_category ON yl_channels(category, subcategory);
CREATE INDEX idx_yl_channels_format ON yl_channels(dominant_format);
CREATE INDEX idx_yl_channels_country ON yl_channels(country);

-- 2. 일일 스냅샷 테이블
CREATE TABLE IF NOT EXISTS yl_channel_daily_snapshot (
  channel_id TEXT REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  view_count_total BIGINT NOT NULL,
  subscriber_count BIGINT,
  video_count INTEGER,
  shorts_count INTEGER DEFAULT 0,
  avg_views_per_video BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(channel_id, date)
);

-- 인덱스
CREATE INDEX idx_yl_snapshot_date ON yl_channel_daily_snapshot(date DESC);
CREATE INDEX idx_yl_snapshot_channel_date ON yl_channel_daily_snapshot(channel_id, date DESC);

-- 3. 일일 델타 (변화량) 테이블
CREATE TABLE IF NOT EXISTS yl_channel_daily_delta (
  channel_id TEXT REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  delta_views BIGINT NOT NULL,
  delta_subscribers BIGINT DEFAULT 0,
  delta_videos INTEGER DEFAULT 0,
  growth_rate NUMERIC(5,2),
  rank_overall INTEGER,
  rank_category INTEGER,
  rank_format INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(channel_id, date)
);

-- 인덱스
CREATE INDEX idx_yl_delta_date_views ON yl_channel_daily_delta(date DESC, delta_views DESC);
CREATE INDEX idx_yl_delta_channel_date ON yl_channel_daily_delta(channel_id, date DESC);
CREATE INDEX idx_yl_delta_rank ON yl_channel_daily_delta(date, rank_overall);

-- 4. 비디오 메타데이터 테이블
CREATE TABLE IF NOT EXISTS yl_videos (
  video_id TEXT PRIMARY KEY,
  channel_id TEXT REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  published_at TIMESTAMPTZ,
  duration INTEGER, -- 초 단위
  is_shorts BOOLEAN DEFAULT false,
  is_live BOOLEAN DEFAULT false,
  view_count BIGINT,
  like_count BIGINT,
  comment_count BIGINT,
  tags TEXT[],
  category_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_yl_videos_channel ON yl_videos(channel_id);
CREATE INDEX idx_yl_videos_published ON yl_videos(published_at DESC);
CREATE INDEX idx_yl_videos_shorts ON yl_videos(is_shorts) WHERE is_shorts = true;
CREATE INDEX idx_yl_videos_views ON yl_videos(view_count DESC);

-- 5. 급상승 키워드 테이블
CREATE TABLE IF NOT EXISTS yl_trending_keywords (
  date DATE NOT NULL,
  keyword TEXT NOT NULL,
  count INTEGER NOT NULL,
  growth_rate NUMERIC(6,2),
  channel_count INTEGER DEFAULT 1,
  video_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(date, keyword)
);

-- 인덱스
CREATE INDEX idx_yl_keywords_date ON yl_trending_keywords(date DESC, growth_rate DESC);
CREATE INDEX idx_yl_keywords_keyword ON yl_trending_keywords(keyword);

-- 6. 카테고리 메타데이터
CREATE TABLE IF NOT EXISTS yl_categories (
  category_id TEXT PRIMARY KEY,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  parent_category TEXT,
  icon TEXT,
  color TEXT,
  display_order INTEGER DEFAULT 999,
  is_active BOOLEAN DEFAULT true
);

-- YouTube 공식 카테고리 삽입
INSERT INTO yl_categories (category_id, name_ko, name_en, icon, color, display_order) VALUES
('1', '영화/애니메이션', 'Film & Animation', 'film', '#FF6B6B', 1),
('2', '자동차', 'Autos & Vehicles', 'car', '#4ECDC4', 2),
('10', '음악', 'Music', 'music', '#FFE66D', 3),
('15', '반려동물', 'Pets & Animals', 'heart', '#95E1D3', 4),
('17', '스포츠', 'Sports', 'activity', '#FFA07A', 5),
('19', '여행/이벤트', 'Travel & Events', 'map-pin', '#87CEEB', 6),
('20', '게임', 'Gaming', 'gamepad-2', '#9B59B6', 7),
('22', '인물/블로그', 'People & Blogs', 'users', '#F39C12', 8),
('23', '코미디', 'Comedy', 'smile', '#FF9FF3', 9),
('24', '엔터테인먼트', 'Entertainment', 'tv', '#EE5A6F', 10),
('25', '뉴스/정치', 'News & Politics', 'newspaper', '#95A5A6', 11),
('26', '노하우/스타일', 'Howto & Style', 'sparkles', '#FD79A8', 12),
('27', '교육', 'Education', 'book-open', '#74B9FF', 13),
('28', '과학기술', 'Science & Technology', 'cpu', '#00D2D3', 14)
ON CONFLICT (category_id) DO NOTHING;

-- 7. 사용자 팔로우 관계
CREATE TABLE IF NOT EXISTS yl_user_follows (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  notification_enabled BOOLEAN DEFAULT true,
  PRIMARY KEY(user_id, channel_id)
);

-- 인덱스
CREATE INDEX idx_yl_follows_user ON yl_user_follows(user_id);
CREATE INDEX idx_yl_follows_channel ON yl_user_follows(channel_id);

-- 8. 승인 로그
CREATE TABLE IF NOT EXISTS yl_approval_logs (
  id SERIAL PRIMARY KEY,
  channel_id TEXT REFERENCES yl_channels(channel_id),
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'pending')),
  actor_id UUID REFERENCES auth.users(id),
  before_status TEXT,
  after_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_yl_approval_logs_channel ON yl_approval_logs(channel_id);
CREATE INDEX idx_yl_approval_logs_actor ON yl_approval_logs(actor_id);

-- 9. 배치 실행 로그
CREATE TABLE IF NOT EXISTS yl_batch_logs (
  id SERIAL PRIMARY KEY,
  function_name TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  processed_count INTEGER DEFAULT 0,
  errors TEXT[],
  execution_time_ms INTEGER,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_yl_batch_logs_function ON yl_batch_logs(function_name, executed_at DESC);

-- =============================================
-- RLS (Row Level Security) 정책
-- =============================================

-- 1. yl_channels RLS
ALTER TABLE yl_channels ENABLE ROW LEVEL SECURITY;

-- 승인된 채널만 일반 사용자에게 노출
CREATE POLICY yl_channels_select_approved ON yl_channels
  FOR SELECT USING (
    approval_status = 'approved' 
    OR 
    auth.jwt() ->> 'email' = (SELECT email FROM auth.users WHERE id = auth.uid() AND email IN (SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))))
  );

-- 관리자만 INSERT/UPDATE/DELETE
CREATE POLICY yl_channels_admin_all ON yl_channels
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ',')))
  );

-- 2. yl_channel_daily_snapshot RLS
ALTER TABLE yl_channel_daily_snapshot ENABLE ROW LEVEL SECURITY;

-- 승인된 채널의 스냅샷만 조회 가능
CREATE POLICY yl_snapshot_select ON yl_channel_daily_snapshot
  FOR SELECT USING (
    channel_id IN (SELECT channel_id FROM yl_channels WHERE approval_status = 'approved')
    OR
    auth.jwt() ->> 'email' IN (SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ',')))
  );

-- 관리자만 수정
CREATE POLICY yl_snapshot_admin ON yl_channel_daily_snapshot
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ',')))
  );

-- 3. yl_channel_daily_delta RLS
ALTER TABLE yl_channel_daily_delta ENABLE ROW LEVEL SECURITY;

-- 승인된 채널의 델타만 조회 가능
CREATE POLICY yl_delta_select ON yl_channel_daily_delta
  FOR SELECT USING (
    channel_id IN (SELECT channel_id FROM yl_channels WHERE approval_status = 'approved')
    OR
    auth.jwt() ->> 'email' IN (SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ',')))
  );

-- 관리자만 수정
CREATE POLICY yl_delta_admin ON yl_channel_daily_delta
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ',')))
  );

-- 4. yl_videos RLS
ALTER TABLE yl_videos ENABLE ROW LEVEL SECURITY;

-- 승인된 채널의 비디오만 조회 가능
CREATE POLICY yl_videos_select ON yl_videos
  FOR SELECT USING (
    channel_id IN (SELECT channel_id FROM yl_channels WHERE approval_status = 'approved')
    OR
    auth.jwt() ->> 'email' IN (SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ',')))
  );

-- 관리자만 수정
CREATE POLICY yl_videos_admin ON yl_videos
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ',')))
  );

-- 5. yl_trending_keywords RLS
ALTER TABLE yl_trending_keywords ENABLE ROW LEVEL SECURITY;

-- 모든 사용자 조회 가능
CREATE POLICY yl_keywords_select ON yl_trending_keywords
  FOR SELECT USING (true);

-- 관리자만 수정
CREATE POLICY yl_keywords_admin ON yl_trending_keywords
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ',')))
  );

-- 6. yl_user_follows RLS
ALTER TABLE yl_user_follows ENABLE ROW LEVEL SECURITY;

-- 자신의 팔로우만 관리
CREATE POLICY yl_follows_own ON yl_user_follows
  FOR ALL USING (user_id = auth.uid());

-- 7. yl_approval_logs RLS
ALTER TABLE yl_approval_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 조회/수정
CREATE POLICY yl_approval_logs_admin ON yl_approval_logs
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ',')))
  );

-- 8. yl_batch_logs RLS
ALTER TABLE yl_batch_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 조회
CREATE POLICY yl_batch_logs_admin ON yl_batch_logs
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ',')))
  );

-- =============================================
-- Functions & Triggers
-- =============================================

-- 자동 updated_at 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_yl_channels_updated_at BEFORE UPDATE ON yl_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_yl_videos_updated_at BEFORE UPDATE ON yl_videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 승인 상태 변경 시 로그 자동 기록
CREATE OR REPLACE FUNCTION log_approval_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.approval_status IS DISTINCT FROM NEW.approval_status THEN
    INSERT INTO yl_approval_logs (
      channel_id,
      action,
      actor_id,
      before_status,
      after_status,
      notes
    ) VALUES (
      NEW.channel_id,
      CASE 
        WHEN NEW.approval_status = 'approved' THEN 'approve'
        WHEN NEW.approval_status = 'rejected' THEN 'reject'
        ELSE 'pending'
      END,
      auth.uid(),
      OLD.approval_status,
      NEW.approval_status,
      NEW.approval_notes
    );
    
    -- 승인 시 approved_at, approved_by 자동 설정
    IF NEW.approval_status = 'approved' THEN
      NEW.approved_at = NOW();
      NEW.approved_by = auth.uid();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_channel_approval_change BEFORE UPDATE ON yl_channels
  FOR EACH ROW EXECUTE FUNCTION log_approval_change();

-- 랭킹 계산 함수
CREATE OR REPLACE FUNCTION calculate_channel_rankings(target_date DATE)
RETURNS void AS $$
BEGIN
  -- 전체 랭킹
  WITH ranked AS (
    SELECT 
      channel_id,
      delta_views,
      ROW_NUMBER() OVER (ORDER BY delta_views DESC) as rank
    FROM yl_channel_daily_delta
    WHERE date = target_date
  )
  UPDATE yl_channel_daily_delta d
  SET rank_overall = r.rank
  FROM ranked r
  WHERE d.channel_id = r.channel_id AND d.date = target_date;
  
  -- 카테고리별 랭킹
  WITH ranked AS (
    SELECT 
      d.channel_id,
      d.delta_views,
      c.category,
      ROW_NUMBER() OVER (PARTITION BY c.category ORDER BY d.delta_views DESC) as rank
    FROM yl_channel_daily_delta d
    JOIN yl_channels c ON d.channel_id = c.channel_id
    WHERE d.date = target_date
  )
  UPDATE yl_channel_daily_delta d
  SET rank_category = r.rank
  FROM ranked r
  WHERE d.channel_id = r.channel_id AND d.date = target_date;
  
  -- 형식별 랭킹 (쇼츠/롱폼/라이브)
  WITH ranked AS (
    SELECT 
      d.channel_id,
      d.delta_views,
      c.dominant_format,
      ROW_NUMBER() OVER (PARTITION BY c.dominant_format ORDER BY d.delta_views DESC) as rank
    FROM yl_channel_daily_delta d
    JOIN yl_channels c ON d.channel_id = c.channel_id
    WHERE d.date = target_date AND c.dominant_format IS NOT NULL
  )
  UPDATE yl_channel_daily_delta d
  SET rank_format = r.rank
  FROM ranked r
  WHERE d.channel_id = r.channel_id AND d.date = target_date;
END;
$$ LANGUAGE plpgsql;

-- 관리자 이메일 설정
ALTER DATABASE postgres SET app.admin_emails = 'glemfkcl@naver.com';

-- =============================================
-- 초기 데이터 (선택사항)
-- =============================================

-- 테스트용 채널 추가 (예시)
-- INSERT INTO yl_channels (channel_id, title, approval_status, subscriber_count, view_count_total, category, dominant_format)
-- VALUES 
-- ('UCxxxxxxxx1', '테스트 채널 1', 'approved', 100000, 5000000, '게임', '쇼츠'),
-- ('UCxxxxxxxx2', '테스트 채널 2', 'pending', 50000, 2000000, '음악', '롱폼'),
-- ('UCxxxxxxxx3', '테스트 채널 3', 'approved', 200000, 10000000, '엔터테인먼트', '쇼츠');