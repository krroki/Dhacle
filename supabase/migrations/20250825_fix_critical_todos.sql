-- ====================================================
-- Critical TODO Fixes Migration
-- Date: 2025-08-25
-- Description: Fix critical missing tables and fields for TODO implementations
-- ====================================================

-- ============================================
-- 1. Add missing fields to profiles table
-- ============================================

-- Add is_admin field for admin permission checks
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add randomNickname field for username generation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS randomNickname TEXT;

-- Add avatar_url field for user profile pictures
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create unique index for randomNickname
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_random_nickname ON profiles(randomNickname) WHERE randomNickname IS NOT NULL;

-- ============================================
-- 2. Create coupons table
-- ============================================

CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE, -- NULL means applicable to all courses
    max_usage INTEGER, -- NULL means unlimited
    usage_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for coupons
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON coupons(valid_until);
CREATE INDEX IF NOT EXISTS idx_coupons_course_id ON coupons(course_id);

-- Enable RLS on coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Coupons policies (read-only for users, admin can manage)
CREATE POLICY "Users can view active coupons" ON coupons
  FOR SELECT USING (is_active = true AND valid_until > CURRENT_TIMESTAMP);

-- Admin policies will be added when is_admin field is properly implemented

-- ============================================
-- 3. Create adminNotifications table
-- ============================================

CREATE TABLE IF NOT EXISTS adminNotifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    read_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolution_note TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for adminNotifications
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON adminNotifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON adminNotifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_resolved ON adminNotifications(is_resolved);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_priority ON adminNotifications(priority);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON adminNotifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_assigned ON adminNotifications(assigned_to);

-- Enable RLS on adminNotifications
ALTER TABLE adminNotifications ENABLE ROW LEVEL SECURITY;

-- Admin notifications policies (only admins can access)
-- Note: These policies will work once is_admin field is properly implemented
CREATE POLICY "Admins can view all notifications" ON adminNotifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can create notifications" ON adminNotifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update notifications" ON adminNotifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- ============================================
-- 4. Create youtube_favorites table (for migration from old structure)
-- ============================================

CREATE TABLE IF NOT EXISTS youtube_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    video_title TEXT,
    video_description TEXT,
    video_thumbnail TEXT,
    channel_id TEXT,
    channel_title TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(user_id, video_id)
);

-- Create indexes for youtube_favorites
CREATE INDEX IF NOT EXISTS idx_youtube_favorites_user ON youtube_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_favorites_video ON youtube_favorites(video_id);
CREATE INDEX IF NOT EXISTS idx_youtube_favorites_channel ON youtube_favorites(channel_id);
CREATE INDEX IF NOT EXISTS idx_youtube_favorites_created ON youtube_favorites(created_at DESC);

-- Enable RLS on youtube_favorites
ALTER TABLE youtube_favorites ENABLE ROW LEVEL SECURITY;

-- YouTube favorites policies
CREATE POLICY "Users can view own favorites" ON youtube_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites" ON youtube_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON youtube_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. Create YouTube Lens admin tables
-- ============================================

-- yl_channels table (YouTube Lens channels)
CREATE TABLE IF NOT EXISTS yl_channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id TEXT UNIQUE NOT NULL,
    channel_title TEXT,
    channel_description TEXT,
    thumbnail_url TEXT,
    subscriber_count BIGINT DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    view_count BIGINT DEFAULT 0,
    country TEXT,
    published_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    last_updated TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_yl_channels_channel_id ON yl_channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_yl_channels_status ON yl_channels(status);
CREATE INDEX IF NOT EXISTS idx_yl_channels_subscriber_count ON yl_channels(subscriber_count DESC);

-- yl_approval_logs table
CREATE TABLE IF NOT EXISTS yl_approval_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'suspend', 'activate')),
    reason TEXT,
    notes TEXT,
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_yl_approval_logs_channel ON yl_approval_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_yl_approval_logs_action ON yl_approval_logs(action);
CREATE INDEX IF NOT EXISTS idx_yl_approval_logs_admin ON yl_approval_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_yl_approval_logs_created ON yl_approval_logs(created_at DESC);

-- yl_channel_daily_delta table (for trending analysis)
CREATE TABLE IF NOT EXISTS yl_channel_daily_delta (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id TEXT NOT NULL,
    date DATE NOT NULL,
    subscriber_delta INTEGER DEFAULT 0,
    video_delta INTEGER DEFAULT 0,
    view_delta BIGINT DEFAULT 0,
    total_subscribers BIGINT DEFAULT 0,
    total_videos INTEGER DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(channel_id, date)
);

CREATE INDEX IF NOT EXISTS idx_yl_channel_daily_delta_channel ON yl_channel_daily_delta(channel_id);
CREATE INDEX IF NOT EXISTS idx_yl_channel_daily_delta_date ON yl_channel_daily_delta(date DESC);
CREATE INDEX IF NOT EXISTS idx_yl_channel_daily_delta_subscriber_delta ON yl_channel_daily_delta(subscriber_delta DESC);

-- Enable RLS on YouTube Lens tables
ALTER TABLE yl_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE yl_approval_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE yl_channel_daily_delta ENABLE ROW LEVEL SECURITY;

-- YouTube Lens policies (admin only)
CREATE POLICY "Admins can view yl_channels" ON yl_channels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can manage yl_channels" ON yl_channels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can view approval logs" ON yl_approval_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can create approval logs" ON yl_approval_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Public can view channel deltas" ON yl_channel_daily_delta
  FOR SELECT USING (true);

-- System can insert/update channel deltas
CREATE POLICY "System can manage channel deltas" ON yl_channel_daily_delta
  FOR ALL USING (false); -- Only service role can access

-- ============================================
-- 6. Create analytics logs table
-- ============================================

CREATE TABLE IF NOT EXISTS analyticsLogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_logs_user ON analyticsLogs(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_event_type ON analyticsLogs(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_session ON analyticsLogs(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_created ON analyticsLogs(created_at DESC);

-- Enable RLS on analyticsLogs
ALTER TABLE analyticsLogs ENABLE ROW LEVEL SECURITY;

-- Analytics policies (users can view own data, admins can view all)
CREATE POLICY "Users can view own analytics" ON analyticsLogs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" ON analyticsLogs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "System can insert analytics" ON analyticsLogs
  FOR INSERT WITH CHECK (true); -- Allow system to log analytics

-- ============================================
-- 7. Create triggers for updated_at columns
-- ============================================

-- Create or replace the trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for new tables
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_notifications_updated_at BEFORE UPDATE ON adminNotifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_youtube_favorites_updated_at BEFORE UPDATE ON youtube_favorites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_yl_channels_updated_at BEFORE UPDATE ON yl_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. Grant permissions for service role
-- ============================================

GRANT ALL ON profiles TO service_role;
GRANT ALL ON coupons TO service_role;
GRANT ALL ON adminNotifications TO service_role;
GRANT ALL ON youtube_favorites TO service_role;
GRANT ALL ON yl_channels TO service_role;
GRANT ALL ON yl_approval_logs TO service_role;
GRANT ALL ON yl_channel_daily_delta TO service_role;
GRANT ALL ON analyticsLogs TO service_role;

-- ============================================
-- 9. Insert default admin user (if specified in env)
-- ============================================

-- This will be handled by the application logic using ADMIN_USER_IDS env var
-- We don't want to hardcode admin users in the migration

-- ============================================
-- 10. Completion message
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Critical TODO fixes migration completed successfully!';
    RAISE NOTICE 'Tables created/updated:';
    RAISE NOTICE '  - profiles: Added is_admin, randomNickname, avatar_url fields';
    RAISE NOTICE '  - coupons: Full table created with RLS';
    RAISE NOTICE '  - adminNotifications: Full table created with RLS';
    RAISE NOTICE '  - youtube_favorites: Migration table created';
    RAISE NOTICE '  - yl_channels, yl_approval_logs, yl_channel_daily_delta: YouTube Lens admin tables';
    RAISE NOTICE '  - analyticsLogs: Analytics tracking table';
    RAISE NOTICE 'All tables have RLS policies and proper indexes';
END $$;