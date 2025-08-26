-- ================================================================
-- Phase 1: Create Missing Tables (TypeScript Error Resolution)
-- Date: 2025-02-23
-- Purpose: Create performance_metrics, analytics_logs, youtube_search_history
-- ================================================================

-- 1. performance_metrics table (Core Web Vitals)
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

-- 2. analytics_logs table (YouTube Lens Analytics)
CREATE TABLE IF NOT EXISTS analytics_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL,
    video_count INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. youtube_search_history table (YouTube Search Tracking)
CREATE TABLE IF NOT EXISTS youtube_search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB,
    result_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. subscription_logs table (PubSubHubbub Logs)
CREATE TABLE IF NOT EXISTS subscription_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    status VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. webhook_events table (YouTube Webhook Events)
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
-- Create Indexes for Performance
-- ================================================================

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

-- ================================================================
-- Apply RLS (Row Level Security) Policies
-- ================================================================

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

-- Add triggers for performance_metrics
CREATE TRIGGER update_performance_metrics_updated_at 
    BEFORE UPDATE ON performance_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- Success Message
-- ================================================================
-- Phase 1 tables created successfully:
-- - performance_metrics
-- - analytics_logs
-- - youtube_search_history
-- - subscription_logs
-- - webhook_events
-- All RLS policies and indexes have been applied.