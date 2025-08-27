-- YouTube PubSub 구독 관리
CREATE TABLE IF NOT EXISTS channel_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id VARCHAR(50) NOT NULL,
  hub_callback_url TEXT NOT NULL,
  hub_secret VARCHAR(255),
  hub_topic TEXT NOT NULL,
  subscription_status VARCHAR(20) DEFAULT 'pending',
  expires_at TIMESTAMPTZ,
  last_notification_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id)
);

-- Webhook 이벤트 로그
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id VARCHAR(50),
  event_type VARCHAR(50) NOT NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 구독 로그
CREATE TABLE IF NOT EXISTS subscription_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id VARCHAR(50),
  action VARCHAR(50) NOT NULL,
  status VARCHAR(20),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_channel_subs_status ON channel_subscriptions(subscription_status);
CREATE INDEX IF NOT EXISTS idx_channel_subs_channel ON channel_subscriptions(channel_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_channel ON webhook_events(channel_id);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_channel ON subscription_logs(channel_id);

-- RLS 정책
ALTER TABLE channel_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_logs ENABLE ROW LEVEL SECURITY;

-- 관리자 전체 권한 - channel_subscriptions
CREATE POLICY "channel_subscriptions_admin" ON channel_subscriptions
  FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 관리자 전체 권한 - webhook_events
CREATE POLICY "webhook_events_admin" ON webhook_events
  FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 관리자 전체 권한 - subscription_logs
CREATE POLICY "subscription_logs_admin" ON subscription_logs
  FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 외래 키 관계 추가 (yl_channels 테이블 생성 후)
ALTER TABLE webhook_events 
  ADD CONSTRAINT fk_webhook_events_channel 
  FOREIGN KEY (channel_id) 
  REFERENCES channel_subscriptions(channel_id) 
  ON DELETE SET NULL;