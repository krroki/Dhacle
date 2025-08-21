-- alert_rules와 alerts 테이블 생성
-- 2025-01-22

-- 1. alert_rules 테이블 생성
CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('threshold', 'growth_rate', 'anomaly', 'comparison')),
  is_active BOOLEAN DEFAULT true,
  
  -- 규칙 조건
  metric TEXT NOT NULL CHECK (metric IN ('views', 'likes', 'comments', 'shares', 'watch_time', 'subscribers')),
  condition TEXT NOT NULL CHECK (condition IN ('greater_than', 'less_than', 'equals', 'between', 'percent_change')),
  threshold_value NUMERIC,
  threshold_min NUMERIC,
  threshold_max NUMERIC,
  comparison_period TEXT, -- '24h', '7d', '30d' 등
  
  -- 적용 대상
  target_type TEXT CHECK (target_type IN ('channel', 'video', 'folder', 'all')),
  target_id TEXT, -- channel_id, video_id, folder_id
  
  -- 알림 설정
  notification_channels JSONB DEFAULT '["email"]'::jsonb,
  cooldown_minutes INTEGER DEFAULT 60,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- alert_rules 인덱스
CREATE INDEX IF NOT EXISTS idx_alert_rules_user_id ON alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_is_active ON alert_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_alert_rules_target ON alert_rules(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_last_triggered ON alert_rules(last_triggered_at);

-- alert_rules RLS 활성화
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;

-- alert_rules RLS 정책
CREATE POLICY "alert_rules_select_own" ON alert_rules
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "alert_rules_insert_own" ON alert_rules
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "alert_rules_update_own" ON alert_rules
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "alert_rules_delete_own" ON alert_rules
  FOR DELETE USING (user_id = auth.uid());

-- 2. alerts 테이블 생성 (실제 발생한 알림)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 알림 내용
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  
  -- 트리거 데이터
  triggered_value NUMERIC,
  threshold_value NUMERIC,
  metric_data JSONB,
  
  -- 상태
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_note TEXT,
  
  -- 관련 엔티티
  entity_type TEXT CHECK (entity_type IN ('channel', 'video', 'folder')),
  entity_id TEXT,
  entity_name TEXT,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- alerts 인덱스
CREATE INDEX IF NOT EXISTS idx_alerts_rule_id ON alerts(rule_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_is_resolved ON alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_entity ON alerts(entity_type, entity_id);

-- alerts RLS 활성화
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- alerts RLS 정책
CREATE POLICY "alerts_select_own" ON alerts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "alerts_insert_own" ON alerts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "alerts_update_own" ON alerts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "alerts_delete_own" ON alerts
  FOR DELETE USING (user_id = auth.uid());

-- 3. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- alert_rules 트리거
DROP TRIGGER IF EXISTS update_alert_rules_updated_at ON alert_rules;
CREATE TRIGGER update_alert_rules_updated_at
BEFORE UPDATE ON alert_rules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();