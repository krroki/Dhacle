-- YouTube Lens 테이블 생성 및 RLS 정책
-- 2025-01-28: YouTube 채널 관리 시스템

BEGIN;

-- =====================================
-- 1. yl_channels 테이블 생성
-- =====================================
CREATE TABLE IF NOT EXISTS public.yl_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id VARCHAR(255) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  subscriber_count INTEGER DEFAULT 0,
  video_count INTEGER DEFAULT 0,
  view_count BIGINT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  category VARCHAR(100),
  subcategory VARCHAR(100),
  dominant_format VARCHAR(50),
  format_stats JSONB,
  language VARCHAR(10),
  country VARCHAR(10),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_yl_channels_channel_id ON public.yl_channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_yl_channels_status ON public.yl_channels(status);
CREATE INDEX IF NOT EXISTS idx_yl_channels_category ON public.yl_channels(category);
CREATE INDEX IF NOT EXISTS idx_yl_channels_created_at ON public.yl_channels(created_at DESC);

-- =====================================
-- 2. yl_approval_logs 테이블 생성
-- =====================================
CREATE TABLE IF NOT EXISTS public.yl_approval_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_yl_approval_logs_channel_id ON public.yl_approval_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_yl_approval_logs_user_id ON public.yl_approval_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_yl_approval_logs_created_at ON public.yl_approval_logs(created_at DESC);

-- 외래키 추가 (channel_id 참조)
ALTER TABLE public.yl_approval_logs 
  ADD CONSTRAINT fk_approval_logs_channel 
  FOREIGN KEY (channel_id) 
  REFERENCES public.yl_channels(channel_id) 
  ON DELETE CASCADE;

-- =====================================
-- 3. yl_channel_daily_delta 테이블 (선택적)
-- =====================================
CREATE TABLE IF NOT EXISTS public.yl_channel_daily_delta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id VARCHAR(255) NOT NULL REFERENCES public.yl_channels(channel_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  subscriber_delta INTEGER DEFAULT 0,
  view_delta BIGINT DEFAULT 0,
  video_delta INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, date)
);

CREATE INDEX IF NOT EXISTS idx_yl_channel_daily_delta_channel_date ON public.yl_channel_daily_delta(channel_id, date);

-- =====================================
-- 4. RLS (Row Level Security) 정책 적용
-- =====================================

-- yl_channels 테이블 RLS 활성화
ALTER TABLE public.yl_channels ENABLE ROW LEVEL SECURITY;

-- 읽기 권한: 모든 사용자 (approved 채널만)
CREATE POLICY "yl_channels_select_approved" ON public.yl_channels
  FOR SELECT
  USING (status = 'approved');

-- 관리자 전체 권한
CREATE POLICY "yl_channels_admin_all" ON public.yl_channels
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('glemfkcl@naver.com')
    )
  );

-- yl_approval_logs 테이블 RLS 활성화
ALTER TABLE public.yl_approval_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 접근 가능
CREATE POLICY "yl_approval_logs_admin_all" ON public.yl_approval_logs
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('glemfkcl@naver.com')
    )
  );

-- yl_channel_daily_delta 테이블 RLS 활성화
ALTER TABLE public.yl_channel_daily_delta ENABLE ROW LEVEL SECURITY;

-- 읽기 권한: 모든 사용자 (approved 채널만)
CREATE POLICY "yl_channel_daily_delta_select" ON public.yl_channel_daily_delta
  FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM public.yl_channels WHERE status = 'approved'
    )
  );

-- 관리자 전체 권한
CREATE POLICY "yl_channel_daily_delta_admin_all" ON public.yl_channel_daily_delta
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('glemfkcl@naver.com')
    )
  );

-- =====================================
-- 5. 업데이트 트리거 (updated_at 자동 갱신)
-- =====================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_yl_channels_updated_at BEFORE UPDATE
    ON public.yl_channels 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- =====================================
-- 검증 쿼리
-- =====================================
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('yl_channels', 'yl_approval_logs', 'yl_channel_daily_delta');