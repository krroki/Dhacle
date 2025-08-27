-- YouTube Lens 채널 관리 테이블
CREATE TABLE IF NOT EXISTS yl_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  subscriber_count BIGINT DEFAULT 0,
  video_count BIGINT DEFAULT 0,
  view_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ
);

-- 일별 채널 변화 추적
CREATE TABLE IF NOT EXISTS yl_channel_daily_delta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id VARCHAR(50) REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  subscriber_delta BIGINT DEFAULT 0,
  video_delta BIGINT DEFAULT 0,
  view_delta BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, date)
);

-- 승인 로그
CREATE TABLE IF NOT EXISTS yl_approval_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id VARCHAR(50) REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL, -- approve, reject, pending
  admin_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_yl_channels_status ON yl_channels(status);
CREATE INDEX IF NOT EXISTS idx_yl_channels_channel_id ON yl_channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_yl_daily_delta_date ON yl_channel_daily_delta(date);
CREATE INDEX IF NOT EXISTS idx_yl_daily_delta_channel ON yl_channel_daily_delta(channel_id);
CREATE INDEX IF NOT EXISTS idx_yl_approval_logs_channel ON yl_approval_logs(channel_id);

-- RLS 정책
ALTER TABLE yl_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE yl_channel_daily_delta ENABLE ROW LEVEL SECURITY;
ALTER TABLE yl_approval_logs ENABLE ROW LEVEL SECURITY;

-- 읽기 권한 (승인된 채널은 모든 사용자가 볼 수 있음)
CREATE POLICY "yl_channels_read_approved" ON yl_channels
  FOR SELECT 
  USING (status = 'approved');

-- 관리자 전체 권한 (auth.users metadata에서 role 체크)
CREATE POLICY "yl_channels_admin_all" ON yl_channels
  FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 일별 델타 읽기 권한 (승인된 채널만)
CREATE POLICY "yl_daily_delta_read" ON yl_channel_daily_delta
  FOR SELECT 
  USING (
    channel_id IN (
      SELECT channel_id FROM yl_channels WHERE status = 'approved'
    )
  );

-- 일별 델타 관리자 전체 권한
CREATE POLICY "yl_daily_delta_admin" ON yl_channel_daily_delta
  FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 승인 로그 관리자만 볼 수 있음
CREATE POLICY "yl_approval_logs_admin" ON yl_approval_logs
  FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );