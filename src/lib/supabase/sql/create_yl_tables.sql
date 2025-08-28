-- YouTube Lens Additional Tables for TODO Resolution
-- Phase 1: Critical Tables

-- 1. yl_approval_logs table for admin approval tracking
CREATE TABLE IF NOT EXISTS public.yl_approval_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  channel_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('approve', 'reject', 'pending')),
  reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2. yl_channels table for YouTube channel data
CREATE TABLE IF NOT EXISTS public.yl_channels (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  custom_url text,
  thumbnail_url text,
  subscriber_count bigint DEFAULT 0,
  view_count bigint DEFAULT 0,
  video_count bigint DEFAULT 0,
  country text,
  published_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. yl_channel_daily_delta table for tracking daily changes
CREATE TABLE IF NOT EXISTS public.yl_channel_daily_delta (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id text REFERENCES public.yl_channels(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  subscriber_delta bigint DEFAULT 0,
  view_delta bigint DEFAULT 0,
  video_delta bigint DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(channel_id, date)
);

-- Enable RLS
ALTER TABLE public.yl_approval_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yl_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yl_channel_daily_delta ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_yl_approval_logs_user_id ON public.yl_approval_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_yl_approval_logs_channel_id ON public.yl_approval_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_yl_channels_subscriber_count ON public.yl_channels(subscriber_count DESC);
CREATE INDEX IF NOT EXISTS idx_yl_channel_daily_delta_date ON public.yl_channel_daily_delta(date DESC);
CREATE INDEX IF NOT EXISTS idx_yl_channel_daily_delta_channel_id ON public.yl_channel_daily_delta(channel_id);

-- RLS Policies

-- yl_approval_logs policies
CREATE POLICY "Admin users can view all approval logs"
  ON public.yl_approval_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin users can create approval logs"
  ON public.yl_approval_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- yl_channels policies
CREATE POLICY "Anyone can view channels"
  ON public.yl_channels
  FOR SELECT
  USING (true);

CREATE POLICY "Admin users can manage channels"
  ON public.yl_channels
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- yl_channel_daily_delta policies
CREATE POLICY "Anyone can view channel deltas"
  ON public.yl_channel_daily_delta
  FOR SELECT
  USING (true);

CREATE POLICY "Admin users can manage channel deltas"
  ON public.yl_channel_daily_delta
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_yl_approval_logs
  BEFORE UPDATE ON public.yl_approval_logs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_yl_channels
  BEFORE UPDATE ON public.yl_channels
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();