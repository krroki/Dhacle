-- Phase 4: Database Restoration - Missing Tables Creation
-- Created: 2025-08-25
-- Description: Create missing tables for YouTube PubSub, Revenue Proof, and Course features

-- ============================================
-- YouTube PubSub Related Tables
-- ============================================

-- Channel Subscriptions table
CREATE TABLE IF NOT EXISTS channelSubscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id TEXT NOT NULL,
  channel_title TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hub_callback_url TEXT NOT NULL,
  hub_secret TEXT NOT NULL,
  hub_topic TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  lease_seconds INTEGER DEFAULT 432000,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_notification_at TIMESTAMP WITH TIME ZONE,
  notification_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(channel_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_channel_subscriptions_channel ON channelSubscriptions(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_subscriptions_user ON channelSubscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_subscriptions_status ON channelSubscriptions(status);
CREATE INDEX IF NOT EXISTS idx_channel_subscriptions_expires ON channelSubscriptions(expires_at);

-- Subscription Logs table
CREATE TABLE IF NOT EXISTS subscriptionLogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES channelSubscriptions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  status TEXT,
  request_data JSONB,
  response_data JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_logs_subscription ON subscriptionLogs(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_created ON subscriptionLogs(created_at DESC);

-- Webhook Events table
CREATE TABLE IF NOT EXISTS webhookEvents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES channelSubscriptions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  video_id TEXT,
  video_title TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  raw_data JSONB,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_subscription ON webhookEvents(subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhookEvents(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created ON webhookEvents(created_at DESC);

-- ============================================
-- YouTube Video Related Tables
-- ============================================

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT UNIQUE NOT NULL,
  channel_id TEXT NOT NULL,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_videos_video_id ON videos(video_id);
CREATE INDEX IF NOT EXISTS idx_videos_channel_id ON videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(published_at DESC);

-- Video Statistics table
CREATE TABLE IF NOT EXISTS videoStats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT NOT NULL,
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  dislikes BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  favorites BIGINT DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_stats_video ON videoStats(video_id);
CREATE INDEX IF NOT EXISTS idx_video_stats_recorded ON videoStats(recorded_at DESC);

-- ============================================
-- Revenue Proof Related Tables
-- ============================================

-- Proof Likes table
CREATE TABLE IF NOT EXISTS proof_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proof_id UUID REFERENCES revenue_proofs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(proof_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_proof_likes_proof ON proof_likes(proof_id);
CREATE INDEX IF NOT EXISTS idx_proof_likes_user ON proof_likes(user_id);

-- Proof Comments table
CREATE TABLE IF NOT EXISTS proof_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proof_id UUID REFERENCES revenue_proofs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES proof_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proof_comments_proof ON proof_comments(proof_id);
CREATE INDEX IF NOT EXISTS idx_proof_comments_user ON proof_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_proof_comments_parent ON proof_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_proof_comments_created ON proof_comments(created_at DESC);

-- ============================================
-- Course Progress Related Tables
-- ============================================

-- Course Progress Extended view/table
CREATE TABLE IF NOT EXISTS courseProgressExtended (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  last_watched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_course_progress_user ON courseProgressExtended(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_course ON courseProgressExtended(course_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_lesson ON courseProgressExtended(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_completed ON courseProgressExtended(completed);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE channelSubscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptionLogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhookEvents ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE videoStats ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courseProgressExtended ENABLE ROW LEVEL SECURITY;

-- Channel Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON channelSubscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions" ON channelSubscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON channelSubscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions" ON channelSubscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Subscription Logs policies (read-only for users)
CREATE POLICY "Users can view own subscription logs" ON subscriptionLogs
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM channelSubscriptions WHERE user_id = auth.uid()
    )
  );

-- Webhook Events policies (read-only for users)
CREATE POLICY "Users can view own webhook events" ON webhookEvents
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM channelSubscriptions WHERE user_id = auth.uid()
    )
  );

-- Videos policies (public read)
CREATE POLICY "Anyone can view videos" ON videos
  FOR SELECT USING (true);

-- Video Stats policies (public read)
CREATE POLICY "Anyone can view video stats" ON videoStats
  FOR SELECT USING (true);

-- Proof Likes policies
CREATE POLICY "Anyone can view likes" ON proof_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create own likes" ON proof_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON proof_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Proof Comments policies
CREATE POLICY "Anyone can view non-deleted comments" ON proof_comments
  FOR SELECT USING (is_deleted = false);

CREATE POLICY "Users can create own comments" ON proof_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON proof_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete own comments" ON proof_comments
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (is_deleted = true);

-- Course Progress Extended policies
CREATE POLICY "Users can view own progress" ON courseProgressExtended
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress" ON courseProgressExtended
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON courseProgressExtended
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON courseProgressExtended
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Functions for auto-updating timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_channel_subscriptions_updated_at BEFORE UPDATE ON channelSubscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proof_comments_updated_at BEFORE UPDATE ON proof_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_progress_updated_at BEFORE UPDATE ON courseProgressExtended
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Add Foreign Key for proof_comments
-- ============================================

ALTER TABLE proof_comments 
  ADD CONSTRAINT proofCommentsUserIdFkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ============================================
-- Grant permissions for service role
-- ============================================

GRANT ALL ON channelSubscriptions TO service_role;
GRANT ALL ON subscriptionLogs TO service_role;
GRANT ALL ON webhookEvents TO service_role;
GRANT ALL ON videos TO service_role;
GRANT ALL ON videoStats TO service_role;
GRANT ALL ON proof_likes TO service_role;
GRANT ALL ON proof_comments TO service_role;
GRANT ALL ON courseProgressExtended TO service_role;

-- ============================================
-- Completion message
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 4 database restoration completed successfully';
  RAISE NOTICE 'Tables created: channelSubscriptions, subscriptionLogs, webhookEvents, videos, videoStats, proof_likes, proof_comments, courseProgressExtended';
  RAISE NOTICE 'RLS policies applied to all tables';
END $$;