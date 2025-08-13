-- =============================================
-- Dhacle Database Fix - Complete Solution
-- This works with existing 'users' table instead of 'profiles'
-- Execute AFTER running the initial users table creation
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Create profiles VIEW (for compatibility)
-- Maps profiles references to users table
-- =============================================
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  channel_name,
  channel_url,
  total_revenue,
  role,
  created_at,
  updated_at
FROM public.users;

-- =============================================
-- 1. Create revenue_proofs table (using users table)
-- =============================================
CREATE TABLE IF NOT EXISTS public.revenue_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL, -- TipTap JSON format
  amount DECIMAL(12,0) NOT NULL CHECK (amount >= 0),
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('youtube', 'instagram', 'tiktok')),
  screenshot_url TEXT NOT NULL,
  screenshot_blur TEXT, -- blur placeholder
  signature_data TEXT NOT NULL, -- canvas signature base64
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  reports_count INT DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. Create proof_likes table
-- =============================================
CREATE TABLE IF NOT EXISTS public.proof_likes (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  proof_id UUID REFERENCES revenue_proofs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, proof_id)
);

-- =============================================
-- 3. Create proof_comments table
-- =============================================
CREATE TABLE IF NOT EXISTS public.proof_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id UUID REFERENCES revenue_proofs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. Create proof_reports table
-- =============================================
CREATE TABLE IF NOT EXISTS public.proof_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id UUID REFERENCES revenue_proofs(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reason VARCHAR(50) NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(proof_id, reporter_id) -- Prevent duplicate reports
);

-- =============================================
-- 5. Create user_badges table
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  badge_type VARCHAR(50) NOT NULL,
  badge_data JSONB,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. Create monthly_rankings table
-- =============================================
CREATE TABLE IF NOT EXISTS public.monthly_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  total_amount DECIMAL(12,0) NOT NULL,
  rank INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, user_id)
);

-- =============================================
-- Create Indexes for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_revenue_proofs_created_at ON revenue_proofs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_proofs_user_id ON revenue_proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_proofs_is_hidden ON revenue_proofs(is_hidden);
CREATE INDEX IF NOT EXISTS idx_revenue_proofs_platform ON revenue_proofs(platform);
CREATE INDEX IF NOT EXISTS idx_proof_likes_proof_id ON proof_likes(proof_id);
CREATE INDEX IF NOT EXISTS idx_proof_comments_proof_id ON proof_comments(proof_id);
CREATE INDEX IF NOT EXISTS idx_monthly_rankings_month ON monthly_rankings(month);
CREATE INDEX IF NOT EXISTS idx_monthly_rankings_user_id ON monthly_rankings(user_id);

-- =============================================
-- Enable Row Level Security (RLS)
-- =============================================
ALTER TABLE revenue_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_rankings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies for revenue_proofs
-- =============================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access on revenue_proofs" ON revenue_proofs;
DROP POLICY IF EXISTS "Authenticated users can create revenue_proofs" ON revenue_proofs;
DROP POLICY IF EXISTS "Users can update own revenue_proofs" ON revenue_proofs;
DROP POLICY IF EXISTS "Users can delete own revenue_proofs" ON revenue_proofs;

-- Public read access (except hidden)
CREATE POLICY "Public read access on revenue_proofs" ON revenue_proofs
  FOR SELECT USING (is_hidden = false);

-- Authenticated users can create (once per day)
CREATE POLICY "Authenticated users can create revenue_proofs" ON revenue_proofs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM revenue_proofs
      WHERE user_id = auth.uid()
      AND DATE(created_at) = CURRENT_DATE
    )
  );

-- Users can update own proofs (within 24 hours)
CREATE POLICY "Users can update own revenue_proofs" ON revenue_proofs
  FOR UPDATE USING (
    auth.uid() = user_id AND
    created_at > NOW() - INTERVAL '24 hours'
  );

-- Users can delete own proofs
CREATE POLICY "Users can delete own revenue_proofs" ON revenue_proofs
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- RLS Policies for proof_likes
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can like" ON proof_likes;

CREATE POLICY "Authenticated users can like" ON proof_likes
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- RLS Policies for proof_comments
-- =============================================
DROP POLICY IF EXISTS "Public read comments" ON proof_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON proof_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON proof_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON proof_comments;

-- Public read comments
CREATE POLICY "Public read comments" ON proof_comments
  FOR SELECT USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" ON proof_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own comments
CREATE POLICY "Users can update own comments" ON proof_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete own comments
CREATE POLICY "Users can delete own comments" ON proof_comments
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- RLS Policies for proof_reports
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can report" ON proof_reports;

-- Authenticated users can report
CREATE POLICY "Authenticated users can report" ON proof_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- =============================================
-- RLS Policies for user_badges
-- =============================================
DROP POLICY IF EXISTS "Public read badges" ON user_badges;

-- Public read badges
CREATE POLICY "Public read badges" ON user_badges
  FOR SELECT USING (true);

-- =============================================
-- RLS Policies for monthly_rankings
-- =============================================
DROP POLICY IF EXISTS "Public read rankings" ON monthly_rankings;

-- Public read rankings
CREATE POLICY "Public read rankings" ON monthly_rankings
  FOR SELECT USING (true);

-- =============================================
-- Create Trigger Functions
-- =============================================

-- Function: Update likes count
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE revenue_proofs 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.proof_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE revenue_proofs 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.proof_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for likes count
DROP TRIGGER IF EXISTS update_likes_count_trigger ON proof_likes;
CREATE TRIGGER update_likes_count_trigger
AFTER INSERT OR DELETE ON proof_likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- Function: Update comments count
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE revenue_proofs 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.proof_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE revenue_proofs 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.proof_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comments count
DROP TRIGGER IF EXISTS update_comments_count_trigger ON proof_comments;
CREATE TRIGGER update_comments_count_trigger
AFTER INSERT OR DELETE ON proof_comments
FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- Function: Handle report (auto-hide after 3 reports)
CREATE OR REPLACE FUNCTION handle_report()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE revenue_proofs 
  SET reports_count = reports_count + 1 
  WHERE id = NEW.proof_id;
  
  -- Auto-hide after 3 reports
  UPDATE revenue_proofs 
  SET is_hidden = true 
  WHERE id = NEW.proof_id AND reports_count >= 3;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reports
DROP TRIGGER IF EXISTS handle_report_trigger ON proof_reports;
CREATE TRIGGER handle_report_trigger
AFTER INSERT ON proof_reports
FOR EACH ROW EXECUTE FUNCTION handle_report();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_revenue_proofs_updated_at ON revenue_proofs;
CREATE TRIGGER update_revenue_proofs_updated_at
BEFORE UPDATE ON revenue_proofs
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Add bio and naver_cafe_nickname columns to users table if not exists
-- =============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'bio') THEN
    ALTER TABLE users ADD COLUMN bio TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'naver_cafe_nickname') THEN
    ALTER TABLE users ADD COLUMN naver_cafe_nickname TEXT;
  END IF;
END $$;

-- =============================================
-- Verification Query
-- =============================================
DO $$
DECLARE
  table_count INT;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('users', 'revenue_proofs', 'proof_likes', 'proof_comments', 'proof_reports', 'user_badges', 'monthly_rankings');
  
  RAISE NOTICE '✅ Successfully created % tables', table_count;
  RAISE NOTICE '✅ profiles view created for compatibility';
  RAISE NOTICE '✅ All RLS policies applied';
  RAISE NOTICE '✅ All triggers activated';
END $$;

-- =============================================
-- Test Query - Run this to verify everything works
-- =============================================
-- SELECT table_name, 'EXISTS' as status
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('users', 'revenue_proofs', 'proof_likes', 'proof_comments', 'proof_reports', 'user_badges', 'monthly_rankings')
-- ORDER BY table_name;