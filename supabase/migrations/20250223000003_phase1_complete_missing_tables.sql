-- ================================================================
-- Phase 1: Complete Missing Tables Creation (15 tables)
-- Date: 2025-02-23
-- Purpose: Create ALL missing tables required for TypeScript compilation
-- ================================================================

-- ================================================================
-- GROUP 1: YouTube PubSubHubbub System (2 tables)
-- ================================================================

-- 1. channel_subscriptions table (YouTube webhook subscriptions)
CREATE TABLE IF NOT EXISTS channel_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_id VARCHAR(255) NOT NULL,
    channel_title VARCHAR(255),
    hub_callback_url TEXT,
    hub_secret VARCHAR(255),
    hub_topic TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    last_checked TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, channel_id)
);

-- 2. subscription_logs table (PubSubHubbub activity logs)
CREATE TABLE IF NOT EXISTS subscription_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    status VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. webhook_events table (YouTube webhook notifications)
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    video_id VARCHAR(255),
    video_title TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    raw_data JSONB,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- GROUP 2: YouTube Lens Analytics (5 tables)
-- ================================================================

-- 4. yl_channels table (YouTube Lens channel data)
CREATE TABLE IF NOT EXISTS yl_channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    subscriber_count BIGINT,
    video_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. yl_approval_logs table (YouTube Lens admin approvals)
CREATE TABLE IF NOT EXISTS yl_approval_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_id VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. performance_metrics table (Core Web Vitals tracking)
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    page_url TEXT NOT NULL,
    metric_name VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10, 3) NOT NULL,
    rating VARCHAR(20),
    user_agent TEXT,
    navigation_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. analytics_logs table (YouTube Lens analysis tracking)
CREATE TABLE IF NOT EXISTS analytics_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL,
    video_count INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. youtube_search_history table (YouTube search tracking)
CREATE TABLE IF NOT EXISTS youtube_search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB,
    result_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- GROUP 3: User System & Gamification (3 tables)
-- ================================================================

-- 9. badges table (User achievement system)
CREATE TABLE IF NOT EXISTS badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL,
    badge_level VARCHAR(20) DEFAULT 'bronze',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_type)
);

-- 10. api_usage table (API quota tracking)
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    method VARCHAR(10) NOT NULL,
    quota_used INTEGER DEFAULT 1,
    response_time INTEGER,
    status_code INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. naver_cafe_verifications table (Naver Cafe member verification)
CREATE TABLE IF NOT EXISTS naver_cafe_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cafe_nickname VARCHAR(255) NOT NULL,
    cafe_member_url TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ================================================================
-- GROUP 4: Revenue & Social Features (4 tables)
-- ================================================================

-- 12. revenues table (Revenue certification)
CREATE TABLE IF NOT EXISTS revenues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    proof_url TEXT,
    proof_type VARCHAR(50),
    description TEXT,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. proof_likes table (Revenue proof likes)
CREATE TABLE IF NOT EXISTS proof_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    proof_id UUID NOT NULL REFERENCES revenue_proofs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, proof_id)
);

-- 14. proof_comments table (Revenue proof comments)
CREATE TABLE IF NOT EXISTS proof_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    proof_id UUID NOT NULL REFERENCES revenue_proofs(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES proof_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. proof_reports table (Revenue proof reports)
CREATE TABLE IF NOT EXISTS proof_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proof_id UUID NOT NULL REFERENCES revenue_proofs(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- Create Indexes for Performance
-- ================================================================

-- channel_subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_channel_subscriptions_user_id ON channel_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_subscriptions_channel_id ON channel_subscriptions(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_subscriptions_status ON channel_subscriptions(status);

-- subscription_logs indexes
CREATE INDEX IF NOT EXISTS idx_subscription_logs_subscription_id ON subscription_logs(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_action ON subscription_logs(action);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_created_at ON subscription_logs(created_at DESC);

-- webhook_events indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_subscription_id ON webhook_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_video_id ON webhook_events(video_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- yl_channels indexes
CREATE INDEX IF NOT EXISTS idx_yl_channels_channel_id ON yl_channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_yl_channels_created_at ON yl_channels(created_at DESC);

-- yl_approval_logs indexes
CREATE INDEX IF NOT EXISTS idx_yl_approval_logs_user_id ON yl_approval_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_yl_approval_logs_channel_id ON yl_approval_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_yl_approval_logs_created_at ON yl_approval_logs(created_at DESC);

-- performance_metrics indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_page_url ON performance_metrics(page_url);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at DESC);

-- analytics_logs indexes
CREATE INDEX IF NOT EXISTS idx_analytics_logs_user_id ON analytics_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_analysis_type ON analytics_logs(analysis_type);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_created_at ON analytics_logs(created_at DESC);

-- youtube_search_history indexes
CREATE INDEX IF NOT EXISTS idx_youtube_search_history_user_id ON youtube_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_search_history_query ON youtube_search_history(query);
CREATE INDEX IF NOT EXISTS idx_youtube_search_history_created_at ON youtube_search_history(created_at DESC);

-- badges indexes
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_earned_at ON badges(earned_at DESC);

-- api_usage indexes
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at DESC);

-- naver_cafe_verifications indexes
CREATE INDEX IF NOT EXISTS idx_naver_cafe_verifications_user_id ON naver_cafe_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_naver_cafe_verifications_status ON naver_cafe_verifications(verification_status);

-- revenues indexes
CREATE INDEX IF NOT EXISTS idx_revenues_user_id ON revenues(user_id);
CREATE INDEX IF NOT EXISTS idx_revenues_verified ON revenues(verified);
CREATE INDEX IF NOT EXISTS idx_revenues_created_at ON revenues(created_at DESC);

-- proof_likes indexes
CREATE INDEX IF NOT EXISTS idx_proof_likes_proof_id ON proof_likes(proof_id);
CREATE INDEX IF NOT EXISTS idx_proof_likes_user_id ON proof_likes(user_id);

-- proof_comments indexes
CREATE INDEX IF NOT EXISTS idx_proof_comments_proof_id ON proof_comments(proof_id);
CREATE INDEX IF NOT EXISTS idx_proof_comments_user_id ON proof_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_proof_comments_parent_id ON proof_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_proof_comments_created_at ON proof_comments(created_at DESC);

-- proof_reports indexes
CREATE INDEX IF NOT EXISTS idx_proof_reports_proof_id ON proof_reports(proof_id);
CREATE INDEX IF NOT EXISTS idx_proof_reports_reporter_id ON proof_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_proof_reports_status ON proof_reports(status);

-- ================================================================
-- Apply RLS (Row Level Security) Policies
-- ================================================================

-- channel_subscriptions RLS
ALTER TABLE channel_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "channel_subscriptions_select_own" ON channel_subscriptions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "channel_subscriptions_insert_own" ON channel_subscriptions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "channel_subscriptions_update_own" ON channel_subscriptions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "channel_subscriptions_delete_own" ON channel_subscriptions
    FOR DELETE USING (user_id = auth.uid());

-- subscription_logs RLS (service role only)
ALTER TABLE subscription_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscription_logs_select_all" ON subscription_logs
    FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "subscription_logs_insert_service" ON subscription_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "subscription_logs_update_service" ON subscription_logs
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "subscription_logs_delete_service" ON subscription_logs
    FOR DELETE USING (auth.role() = 'service_role');

-- webhook_events RLS (service role only)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_events_select_all" ON webhook_events
    FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "webhook_events_insert_service" ON webhook_events
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "webhook_events_update_service" ON webhook_events
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "webhook_events_delete_service" ON webhook_events
    FOR DELETE USING (auth.role() = 'service_role');

-- yl_channels RLS (public read, service write)
ALTER TABLE yl_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "yl_channels_select_all" ON yl_channels
    FOR SELECT USING (true);

CREATE POLICY "yl_channels_insert_service" ON yl_channels
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "yl_channels_update_service" ON yl_channels
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "yl_channels_delete_service" ON yl_channels
    FOR DELETE USING (auth.role() = 'service_role');

-- yl_approval_logs RLS
ALTER TABLE yl_approval_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "yl_approval_logs_select_own" ON yl_approval_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "yl_approval_logs_insert_own" ON yl_approval_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- performance_metrics RLS
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "performance_metrics_select_own" ON performance_metrics
    FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "performance_metrics_insert_own" ON performance_metrics
    FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "performance_metrics_update_own" ON performance_metrics
    FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "performance_metrics_delete_own" ON performance_metrics
    FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- analytics_logs RLS
ALTER TABLE analytics_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_logs_select_own" ON analytics_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "analytics_logs_insert_own" ON analytics_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "analytics_logs_update_own" ON analytics_logs
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "analytics_logs_delete_own" ON analytics_logs
    FOR DELETE USING (user_id = auth.uid());

-- youtube_search_history RLS
ALTER TABLE youtube_search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "youtube_search_history_select_own" ON youtube_search_history
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "youtube_search_history_insert_own" ON youtube_search_history
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "youtube_search_history_update_own" ON youtube_search_history
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "youtube_search_history_delete_own" ON youtube_search_history
    FOR DELETE USING (user_id = auth.uid());

-- badges RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_select_own" ON badges
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "badges_insert_own" ON badges
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "badges_update_own" ON badges
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "badges_delete_own" ON badges
    FOR DELETE USING (user_id = auth.uid());

-- api_usage RLS
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_usage_select_own" ON api_usage
    FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "api_usage_insert_all" ON api_usage
    FOR INSERT WITH CHECK (true);

-- naver_cafe_verifications RLS
ALTER TABLE naver_cafe_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "naver_cafe_verifications_select_own" ON naver_cafe_verifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "naver_cafe_verifications_insert_own" ON naver_cafe_verifications
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "naver_cafe_verifications_update_own" ON naver_cafe_verifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "naver_cafe_verifications_delete_own" ON naver_cafe_verifications
    FOR DELETE USING (user_id = auth.uid());

-- revenues RLS
ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revenues_select_public" ON revenues
    FOR SELECT USING (verified = true OR user_id = auth.uid());

CREATE POLICY "revenues_insert_own" ON revenues
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "revenues_update_own" ON revenues
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "revenues_delete_own" ON revenues
    FOR DELETE USING (user_id = auth.uid());

-- proof_likes RLS
ALTER TABLE proof_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proof_likes_select_all" ON proof_likes
    FOR SELECT USING (true);

CREATE POLICY "proof_likes_insert_own" ON proof_likes
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "proof_likes_delete_own" ON proof_likes
    FOR DELETE USING (user_id = auth.uid());

-- proof_comments RLS
ALTER TABLE proof_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proof_comments_select_all" ON proof_comments
    FOR SELECT USING (true);

CREATE POLICY "proof_comments_insert_own" ON proof_comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "proof_comments_update_own" ON proof_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "proof_comments_delete_own" ON proof_comments
    FOR DELETE USING (user_id = auth.uid());

-- proof_reports RLS
ALTER TABLE proof_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proof_reports_select_all" ON proof_reports
    FOR SELECT USING (true);

CREATE POLICY "proof_reports_insert_auth" ON proof_reports
    FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "proof_reports_update_own" ON proof_reports
    FOR UPDATE USING (reporter_id = auth.uid());

-- ================================================================
-- Create Triggers for updated_at
-- ================================================================

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for tables with updated_at column
CREATE TRIGGER update_channel_subscriptions_updated_at 
    BEFORE UPDATE ON channel_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_yl_channels_updated_at 
    BEFORE UPDATE ON yl_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_metrics_updated_at 
    BEFORE UPDATE ON performance_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_badges_updated_at 
    BEFORE UPDATE ON badges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_naver_cafe_verifications_updated_at 
    BEFORE UPDATE ON naver_cafe_verifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenues_updated_at 
    BEFORE UPDATE ON revenues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proof_comments_updated_at 
    BEFORE UPDATE ON proof_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proof_reports_updated_at 
    BEFORE UPDATE ON proof_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- Success Message
-- ================================================================
-- Phase 1 Complete: All 15 missing tables created successfully
-- Tables created:
-- Group 1 (PubSubHubbub): channel_subscriptions, subscription_logs, webhook_events
-- Group 2 (YouTube Lens): yl_channels, yl_approval_logs, performance_metrics, analytics_logs, youtube_search_history  
-- Group 3 (User System): badges, api_usage, naver_cafe_verifications
-- Group 4 (Revenue Social): revenues, proof_likes, proof_comments, proof_reports
-- All RLS policies and indexes have been applied.