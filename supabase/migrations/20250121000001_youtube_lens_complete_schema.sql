-- YouTube Lens Complete Schema - Phase 1 Infrastructure
-- Created: 2025-01-21
-- Purpose: Implement full 11-table schema for YouTube Lens with proper relationships, indexes, and RLS

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. VIDEOS TABLE - Core video metadata storage
-- ============================================
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id VARCHAR(20) UNIQUE NOT NULL, -- YouTube video ID
    title TEXT NOT NULL,
    description TEXT,
    channel_id VARCHAR(30) NOT NULL, -- YouTube channel ID
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_seconds INTEGER,
    is_short BOOLEAN DEFAULT false, -- true if duration < 60 seconds
    
    -- Thumbnails stored as JSONB for flexibility
    thumbnails JSONB,
    
    -- Tags and categories
    tags TEXT[],
    category_id VARCHAR(10),
    
    -- Metadata
    language_code VARCHAR(10),
    region_code VARCHAR(5),
    
    -- Tracking
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 2. VIDEO_STATS TABLE - Time-series statistics
-- ============================================
CREATE TABLE IF NOT EXISTS video_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id VARCHAR(20) NOT NULL,
    
    -- Core metrics
    view_count BIGINT DEFAULT 0,
    like_count BIGINT DEFAULT 0,
    comment_count BIGINT DEFAULT 0,
    
    -- Calculated metrics
    views_per_hour DECIMAL(10, 2),
    engagement_rate DECIMAL(5, 2), -- (likes + comments) / views * 100
    viral_score DECIMAL(10, 2), -- Custom viral potential score
    
    -- Delta values (change since last snapshot)
    view_delta BIGINT DEFAULT 0,
    like_delta BIGINT DEFAULT 0,
    comment_delta BIGINT DEFAULT 0,
    
    -- Timestamp for this snapshot
    snapshot_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (video_id) REFERENCES videos(video_id) ON DELETE CASCADE
);

-- ============================================
-- 3. CHANNELS TABLE - YouTube channel information
-- ============================================
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id VARCHAR(30) UNIQUE NOT NULL, -- YouTube channel ID
    title TEXT NOT NULL,
    description TEXT,
    custom_url VARCHAR(100),
    
    -- Channel statistics
    subscriber_count BIGINT DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    view_count BIGINT DEFAULT 0,
    
    -- Channel metadata
    country VARCHAR(5),
    published_at TIMESTAMP WITH TIME ZONE,
    thumbnails JSONB,
    
    -- Monitoring status
    is_monitored BOOLEAN DEFAULT false,
    monitor_frequency_hours INTEGER DEFAULT 24, -- How often to check
    last_checked_at TIMESTAMP WITH TIME ZONE,
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 4. SOURCE_FOLDERS TABLE - Organize channels into folders
-- ============================================
CREATE TABLE IF NOT EXISTS source_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color for UI
    icon VARCHAR(50), -- Icon identifier
    
    -- Folder settings
    auto_monitor BOOLEAN DEFAULT true,
    monitor_frequency_hours INTEGER DEFAULT 6,
    
    -- Statistics
    channel_count INTEGER DEFAULT 0,
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, name)
);

-- ============================================
-- 5. FOLDER_CHANNELS TABLE - Many-to-many relationship
-- ============================================
CREATE TABLE IF NOT EXISTS folder_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_id UUID NOT NULL REFERENCES source_folders(id) ON DELETE CASCADE,
    channel_id VARCHAR(30) NOT NULL,
    
    -- Channel-specific settings in this folder
    custom_frequency_hours INTEGER, -- Override folder default
    notes TEXT,
    
    -- Tracking
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (channel_id) REFERENCES channels(channel_id) ON DELETE CASCADE,
    UNIQUE(folder_id, channel_id)
);

-- ============================================
-- 6. ALERT_RULES TABLE - Define monitoring thresholds
-- ============================================
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Rule configuration
    rule_type VARCHAR(50) NOT NULL, -- 'threshold', 'trend', 'anomaly'
    metric VARCHAR(50) NOT NULL, -- 'views', 'vph', 'engagement', 'viral_score'
    condition VARCHAR(20) NOT NULL, -- 'greater_than', 'less_than', 'change_percent'
    threshold_value DECIMAL(20, 2) NOT NULL,
    
    -- Scope
    scope VARCHAR(20) NOT NULL, -- 'video', 'channel', 'folder'
    scope_id TEXT, -- ID of specific video/channel/folder, or NULL for all
    
    -- Alert settings
    is_active BOOLEAN DEFAULT true,
    cooldown_hours INTEGER DEFAULT 24, -- Don't re-alert for same item within this period
    
    -- Notification preferences
    notify_email BOOLEAN DEFAULT false,
    notify_app BOOLEAN DEFAULT true,
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0
);

-- ============================================
-- 7. ALERTS TABLE - Store triggered alerts
-- ============================================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Alert details
    alert_type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'critical'
    
    -- Context data
    context_data JSONB, -- Store relevant video/channel/metric data
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    is_archived BOOLEAN DEFAULT false,
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. COLLECTIONS TABLE - User-created boards/collections
-- ============================================
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Collection settings
    is_public BOOLEAN DEFAULT false,
    cover_image TEXT,
    tags TEXT[],
    
    -- Statistics
    item_count INTEGER DEFAULT 0,
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, name)
);

-- ============================================
-- 9. COLLECTION_ITEMS TABLE - Videos in collections
-- ============================================
CREATE TABLE IF NOT EXISTS collection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    video_id VARCHAR(20) NOT NULL,
    
    -- Item metadata
    notes TEXT,
    tags TEXT[],
    position INTEGER DEFAULT 0, -- For ordering
    
    -- Tracking
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_by UUID REFERENCES profiles(id),
    
    FOREIGN KEY (video_id) REFERENCES videos(video_id) ON DELETE CASCADE,
    UNIQUE(collection_id, video_id)
);

-- ============================================
-- 10. SAVED_SEARCHES TABLE - Store search parameters
-- ============================================
CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Search parameters stored as JSONB
    search_params JSONB NOT NULL, -- {query, filters, sort, etc}
    
    -- Search type
    search_type VARCHAR(50) NOT NULL, -- 'keyword', 'popular', 'channel', 'trending'
    
    -- Auto-run settings
    auto_run BOOLEAN DEFAULT false,
    run_frequency_hours INTEGER DEFAULT 24,
    last_run_at TIMESTAMP WITH TIME ZONE,
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    use_count INTEGER DEFAULT 0,
    
    UNIQUE(user_id, name)
);

-- ============================================
-- 11. SUBSCRIPTIONS TABLE - User subscription plans
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Plan details
    plan_type VARCHAR(20) NOT NULL DEFAULT 'free', -- 'free', 'pro', 'team'
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    
    -- Limits based on plan
    api_quota_daily INTEGER DEFAULT 1000, -- Daily API quota
    max_monitors INTEGER DEFAULT 10, -- Max channels to monitor
    max_alerts INTEGER DEFAULT 5, -- Max alert rules
    max_collections INTEGER DEFAULT 3, -- Max collections
    max_saved_searches INTEGER DEFAULT 10, -- Max saved searches
    
    -- Team features (for team plan)
    team_id UUID,
    team_role VARCHAR(20), -- 'owner', 'admin', 'member'
    
    -- Billing
    billing_cycle VARCHAR(20), -- 'monthly', 'yearly'
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Videos indexes
CREATE INDEX idx_videos_channel_id ON videos(channel_id);
CREATE INDEX idx_videos_published_at ON videos(published_at DESC);
CREATE INDEX idx_videos_is_short ON videos(is_short) WHERE is_short = true;
CREATE INDEX idx_videos_video_id ON videos(video_id);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);

-- Video stats indexes
CREATE INDEX idx_video_stats_video_id ON video_stats(video_id);
CREATE INDEX idx_video_stats_snapshot_at ON video_stats(snapshot_at DESC);
CREATE INDEX idx_video_stats_vph ON video_stats(views_per_hour DESC) WHERE views_per_hour IS NOT NULL;
CREATE INDEX idx_video_stats_viral_score ON video_stats(viral_score DESC) WHERE viral_score IS NOT NULL;

-- Channels indexes
CREATE INDEX idx_channels_channel_id ON channels(channel_id);
CREATE INDEX idx_channels_is_monitored ON channels(is_monitored) WHERE is_monitored = true;
CREATE INDEX idx_channels_last_checked ON channels(last_checked_at);

-- Source folders indexes
CREATE INDEX idx_source_folders_user_id ON source_folders(user_id);
CREATE INDEX idx_source_folders_auto_monitor ON source_folders(auto_monitor) WHERE auto_monitor = true;

-- Folder channels indexes
CREATE INDEX idx_folder_channels_folder_id ON folder_channels(folder_id);
CREATE INDEX idx_folder_channels_channel_id ON folder_channels(channel_id);

-- Alert rules indexes
CREATE INDEX idx_alert_rules_user_id ON alert_rules(user_id);
CREATE INDEX idx_alert_rules_is_active ON alert_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_alert_rules_scope ON alert_rules(scope, scope_id);

-- Alerts indexes
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_rule_id ON alerts(rule_id);
CREATE INDEX idx_alerts_is_read ON alerts(is_read) WHERE is_read = false;
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);

-- Collections indexes
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_is_public ON collections(is_public) WHERE is_public = true;

-- Collection items indexes
CREATE INDEX idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX idx_collection_items_video_id ON collection_items(video_id);
CREATE INDEX idx_collection_items_position ON collection_items(position);

-- Saved searches indexes
CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_auto_run ON saved_searches(auto_run) WHERE auto_run = true;
CREATE INDEX idx_saved_searches_last_run ON saved_searches(last_run_at);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan_type ON subscriptions(plan_type);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE folder_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Videos policies (public read, admin write)
CREATE POLICY "Anyone can view videos"
    ON videos FOR SELECT
    USING (deleted_at IS NULL);

CREATE POLICY "Service role can manage videos"
    ON videos FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Video stats policies (public read)
CREATE POLICY "Anyone can view video stats"
    ON video_stats FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage video stats"
    ON video_stats FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Channels policies (public read)
CREATE POLICY "Anyone can view channels"
    ON channels FOR SELECT
    USING (deleted_at IS NULL);

CREATE POLICY "Service role can manage channels"
    ON channels FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Source folders policies (user-specific)
CREATE POLICY "Users can view their own folders"
    ON source_folders FOR SELECT
    USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create their own folders"
    ON source_folders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
    ON source_folders FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
    ON source_folders FOR DELETE
    USING (auth.uid() = user_id);

-- Folder channels policies (based on folder ownership)
CREATE POLICY "Users can view channels in their folders"
    ON folder_channels FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM source_folders
        WHERE source_folders.id = folder_channels.folder_id
        AND source_folders.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage channels in their folders"
    ON folder_channels FOR ALL
    USING (EXISTS (
        SELECT 1 FROM source_folders
        WHERE source_folders.id = folder_channels.folder_id
        AND source_folders.user_id = auth.uid()
    ));

-- Alert rules policies (user-specific)
CREATE POLICY "Users can view their own alert rules"
    ON alert_rules FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alert rules"
    ON alert_rules FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert rules"
    ON alert_rules FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alert rules"
    ON alert_rules FOR DELETE
    USING (auth.uid() = user_id);

-- Alerts policies (user-specific)
CREATE POLICY "Users can view their own alerts"
    ON alerts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can create alerts"
    ON alerts FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can update their own alerts"
    ON alerts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
    ON alerts FOR DELETE
    USING (auth.uid() = user_id);

-- Collections policies (user-specific with public option)
CREATE POLICY "Users can view their own collections"
    ON collections FOR SELECT
    USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own collections"
    ON collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
    ON collections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
    ON collections FOR DELETE
    USING (auth.uid() = user_id);

-- Collection items policies (based on collection ownership)
CREATE POLICY "Users can view items in accessible collections"
    ON collection_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_items.collection_id
        AND (collections.user_id = auth.uid() OR collections.is_public = true)
    ));

CREATE POLICY "Users can manage items in their collections"
    ON collection_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_items.collection_id
        AND collections.user_id = auth.uid()
    ));

-- Saved searches policies (user-specific)
CREATE POLICY "Users can view their own saved searches"
    ON saved_searches FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved searches"
    ON saved_searches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved searches"
    ON saved_searches FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved searches"
    ON saved_searches FOR DELETE
    USING (auth.uid() = user_id);

-- Subscriptions policies (user-specific)
CREATE POLICY "Users can view their own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
    ON subscriptions FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- TRIGGER FUNCTIONS
-- ============================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_videos_updated_at 
    BEFORE UPDATE ON videos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at 
    BEFORE UPDATE ON channels 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_source_folders_updated_at 
    BEFORE UPDATE ON source_folders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at 
    BEFORE UPDATE ON alert_rules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at 
    BEFORE UPDATE ON collections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at 
    BEFORE UPDATE ON saved_searches 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update folder channel count
CREATE OR REPLACE FUNCTION update_folder_channel_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE source_folders 
        SET channel_count = channel_count + 1 
        WHERE id = NEW.folder_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE source_folders 
        SET channel_count = channel_count - 1 
        WHERE id = OLD.folder_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_folder_channel_count_trigger
    AFTER INSERT OR DELETE ON folder_channels
    FOR EACH ROW
    EXECUTE FUNCTION update_folder_channel_count();

-- Function to update collection item count
CREATE OR REPLACE FUNCTION update_collection_item_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE collections 
        SET item_count = item_count + 1 
        WHERE id = NEW.collection_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE collections 
        SET item_count = item_count - 1 
        WHERE id = OLD.collection_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_collection_item_count_trigger
    AFTER INSERT OR DELETE ON collection_items
    FOR EACH ROW
    EXECUTE FUNCTION update_collection_item_count();

-- Function to update alert trigger count
CREATE OR REPLACE FUNCTION update_alert_trigger_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE alert_rules 
    SET trigger_count = trigger_count + 1,
        last_triggered_at = NOW()
    WHERE id = NEW.rule_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_alert_trigger_count_trigger
    AFTER INSERT ON alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_alert_trigger_count();

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default subscription for new users (handled by auth trigger)
CREATE OR REPLACE FUNCTION handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO subscriptions (user_id, plan_type, status)
    VALUES (NEW.id, 'free', 'active')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- This trigger should be created on the profiles table
-- (Assuming profiles table exists from previous migrations)
CREATE TRIGGER create_default_subscription
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_subscription();

-- ============================================
-- MIGRATION COMPLETION
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'YouTube Lens Complete Schema (Phase 1) migration completed successfully';
    RAISE NOTICE 'Created 11 core tables with indexes, RLS policies, and triggers';
END $$;