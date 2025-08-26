-- ====================================================
-- Create Analytics Logs Table
-- Date: 2025-08-26
-- Description: Create analyticsLogs table for YouTube analysis tracking
-- ====================================================

-- Create analyticsLogs table
CREATE TABLE IF NOT EXISTS public.analyticsLogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysisType TEXT NOT NULL,
  videoId TEXT,
  channelId TEXT,
  query TEXT,
  results JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_logs_user_id ON analyticsLogs(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_analysis_type ON analyticsLogs(analysisType);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_created_at ON analyticsLogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_video_id ON analyticsLogs(videoId);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_channel_id ON analyticsLogs(channelId);

-- Enable RLS
ALTER TABLE analyticsLogs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own analytics logs" ON analyticsLogs;
DROP POLICY IF EXISTS "Users can create own analytics logs" ON analyticsLogs;
DROP POLICY IF EXISTS "Users can update own analytics logs" ON analyticsLogs;
DROP POLICY IF EXISTS "Users can delete own analytics logs" ON analyticsLogs;

-- RLS Policies
-- Users can only view their own analytics logs
CREATE POLICY "Users can view own analytics logs" ON analyticsLogs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own analytics logs
CREATE POLICY "Users can create own analytics logs" ON analyticsLogs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own analytics logs
CREATE POLICY "Users can update own analytics logs" ON analyticsLogs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own analytics logs
CREATE POLICY "Users can delete own analytics logs" ON analyticsLogs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE TRIGGER update_analytics_logs_updated_at
  BEFORE UPDATE ON analyticsLogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Analytics Logs table created successfully!';
  RAISE NOTICE 'Table includes: id, user_id, analysisType, videoId, channelId, query, results, metadata, created_at, updated_at';
END $$;