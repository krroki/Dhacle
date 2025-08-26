-- Phase 4: 누락된 테이블 생성
-- Created: 2025-02-24
-- Purpose: 주석 처리된 DB 호출 복원을 위한 누락 테이블 생성

-- 1. channelSubscriptions 테이블 (YouTube 채널 구독 관리)
CREATE TABLE IF NOT EXISTS channelSubscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  channel_title TEXT,
  hub_callback_url TEXT,
  hub_secret TEXT,
  hub_topic TEXT,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

-- 2. webhookEvents 테이블 (웹훅 이벤트 로그)
CREATE TABLE IF NOT EXISTS webhookEvents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  channel_id TEXT,
  video_id TEXT,
  payload JSONB,
  status TEXT DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. subscriptionLogs 테이블 (구독 활동 로그)
CREATE TABLE IF NOT EXISTS subscriptionLogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID,
  action TEXT NOT NULL,
  details JSONB,
  status TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. analyticsLogs 테이블 (분석 활동 로그)
CREATE TABLE IF NOT EXISTS analyticsLogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT,
  analysis_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. naverCafeVerifications 테이블 (네이버 카페 인증)
CREATE TABLE IF NOT EXISTS naverCafeVerifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cafe_nickname TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS 정책 활성화
ALTER TABLE channelSubscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhookEvents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptionLogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyticsLogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE naverCafeVerifications ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성: channelSubscriptions
CREATE POLICY "Users can view own subscriptions" ON channelSubscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions" ON channelSubscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON channelSubscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions" ON channelSubscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS 정책 생성: analyticsLogs
CREATE POLICY "Users can view own analytics logs" ON analyticsLogs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analytics logs" ON analyticsLogs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS 정책 생성: naverCafeVerifications
CREATE POLICY "Users can view own verifications" ON naverCafeVerifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own verifications" ON naverCafeVerifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verifications" ON naverCafeVerifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS 정책 생성: webhookEvents (시스템 테이블 - 관리자만)
CREATE POLICY "Service role only" ON webhookEvents
  FOR ALL USING (auth.role() = 'service_role');

-- RLS 정책 생성: subscriptionLogs (시스템 테이블 - 관리자만)
CREATE POLICY "Service role only" ON subscriptionLogs
  FOR ALL USING (auth.role() = 'service_role');

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_channel_subscriptions_user_id ON channelSubscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_subscriptions_channel_id ON channelSubscriptions(channel_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_channel_id ON webhookEvents(channel_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_video_id ON webhookEvents(video_id);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_user_id ON analyticsLogs(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_video_id ON analyticsLogs(video_id);
CREATE INDEX IF NOT EXISTS idx_naver_cafe_verifications_user_id ON naverCafeVerifications(user_id);

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_channel_subscriptions_updated_at
  BEFORE UPDATE ON channelSubscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_naver_cafe_verifications_updated_at
  BEFORE UPDATE ON naverCafeVerifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();