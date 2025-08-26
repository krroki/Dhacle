-- Critical Missing Tables Creation
-- Created: 2025-08-25
-- Description: Create critical missing tables identified in error analysis

-- ============================================
-- API Usage Tracking Table
-- ============================================

CREATE TABLE IF NOT EXISTS api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  quota_used INTEGER DEFAULT 1,
  response_time INTEGER,
  status_code INTEGER,
  error_message TEXT,
  request_params JSONB,
  response_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Add index for better performance
  INDEX idx_api_usage_user (user_id),
  INDEX idx_api_usage_api_key (api_key_id),
  INDEX idx_api_usage_created (created_at DESC)
);

-- ============================================
-- YouTube Subscriptions Table (different from channelSubscriptions)
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  channel_title TEXT,
  channel_thumbnail TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, channel_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_channel ON subscriptions(channel_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active);

-- ============================================
-- Naver Cafe Members Table
-- ============================================

CREATE TABLE IF NOT EXISTS naver_cafe_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cafe_member_id TEXT UNIQUE NOT NULL,
  nickname TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_code TEXT,
  verification_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_naver_cafe_user ON naver_cafe_members(user_id);
CREATE INDEX IF NOT EXISTS idx_naver_cafe_member_id ON naver_cafe_members(cafe_member_id);
CREATE INDEX IF NOT EXISTS idx_naver_cafe_verified ON naver_cafe_members(verified);

-- ============================================
-- YouTube Analysis Cache Table
-- ============================================

CREATE TABLE IF NOT EXISTS youtube_analysis_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT UNIQUE NOT NULL,
  channel_id TEXT,
  analysis_type TEXT NOT NULL, -- 'transcript', 'metrics', 'sentiment', 'keywords'
  analysis_data JSONB NOT NULL,
  metrics JSONB,
  confidence_score NUMERIC(3,2),
  processing_time INTEGER, -- milliseconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_analysis_cache_video ON youtube_analysis_cache(video_id);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_channel ON youtube_analysis_cache(channel_id);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_type ON youtube_analysis_cache(analysis_type);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_expires ON youtube_analysis_cache(expires_at);

-- ============================================
-- Analytics Logs Table (referenced in analysis route)
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT, -- 'video', 'channel', 'playlist'
  resource_id TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_logs_user ON analytics_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_action ON analytics_logs(action);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_created ON analytics_logs(created_at DESC);

-- ============================================
-- Naver Cafe Verifications Table (referenced in profile page)
-- ============================================

CREATE TABLE IF NOT EXISTS naver_cafe_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cafe_id TEXT NOT NULL,
  cafe_name TEXT,
  member_level TEXT,
  verified BOOLEAN DEFAULT false,
  verification_data JSONB,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, cafe_id)
);

CREATE INDEX IF NOT EXISTS idx_naver_verifications_user ON naver_cafe_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_naver_verifications_verified ON naver_cafe_verifications(verified);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE naver_cafe_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE naver_cafe_verifications ENABLE ROW LEVEL SECURITY;

-- API Usage policies
CREATE POLICY "Users can view own api usage" ON api_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api usage" ON api_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can manage own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Naver Cafe Members policies
CREATE POLICY "Users can view own naver cafe membership" ON naver_cafe_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own naver cafe membership" ON naver_cafe_members
  FOR ALL USING (auth.uid() = user_id);

-- YouTube Analysis Cache policies (public read, authenticated write)
CREATE POLICY "Anyone can view youtube analysis cache" ON youtube_analysis_cache
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert analysis cache" ON youtube_analysis_cache
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update analysis cache" ON youtube_analysis_cache
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Analytics Logs policies
CREATE POLICY "Users can view own analytics logs" ON analytics_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics logs" ON analytics_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Naver Cafe Verifications policies
CREATE POLICY "Users can manage own verifications" ON naver_cafe_verifications
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Update Profiles Table with Missing Fields
-- ============================================

-- Add missing fields to profiles table (if not exists)
DO $$
BEGIN
  -- Add email field if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
  END IF;
  
  -- Add randomNickname field if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'random_nickname') THEN
    ALTER TABLE profiles ADD COLUMN random_nickname TEXT;
  END IF;
  
  -- Add naverCafeVerified field if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'naver_cafe_verified') THEN
    ALTER TABLE profiles ADD COLUMN naver_cafe_verified BOOLEAN DEFAULT false;
  END IF;
  
  -- Add role field if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END
$$;

-- ============================================
-- Functions for auto-updating timestamps
-- ============================================

-- Reuse existing function or create if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_naver_cafe_members_updated_at BEFORE UPDATE ON naver_cafe_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_youtube_analysis_cache_updated_at BEFORE UPDATE ON youtube_analysis_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_naver_cafe_verifications_updated_at BEFORE UPDATE ON naver_cafe_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Grant permissions for service role
-- ============================================

GRANT ALL ON api_usage TO service_role;
GRANT ALL ON subscriptions TO service_role;
GRANT ALL ON naver_cafe_members TO service_role;
GRANT ALL ON youtube_analysis_cache TO service_role;
GRANT ALL ON analytics_logs TO service_role;
GRANT ALL ON naver_cafe_verifications TO service_role;

-- ============================================
-- Completion message
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Critical missing tables creation completed successfully';
  RAISE NOTICE 'Tables created: api_usage, subscriptions, naver_cafe_members, youtube_analysis_cache, analytics_logs, naver_cafe_verifications';
  RAISE NOTICE 'Profile table updated with missing fields: email, random_nickname, naver_cafe_verified, role';
  RAISE NOTICE 'RLS policies applied to all tables';
END $$;