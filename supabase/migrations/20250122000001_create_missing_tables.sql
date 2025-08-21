-- 누락된 테이블 생성 마이그레이션
-- 2025-01-22

-- 1. proof_likes 테이블 생성
CREATE TABLE IF NOT EXISTS proof_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proof_id UUID NOT NULL REFERENCES revenue_proofs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(proof_id, user_id)
);

-- proof_likes 인덱스
CREATE INDEX IF NOT EXISTS idx_proof_likes_proof_id ON proof_likes(proof_id);
CREATE INDEX IF NOT EXISTS idx_proof_likes_user_id ON proof_likes(user_id);

-- proof_likes RLS 활성화
ALTER TABLE proof_likes ENABLE ROW LEVEL SECURITY;

-- proof_likes RLS 정책
CREATE POLICY "proof_likes_select_public" ON proof_likes
  FOR SELECT USING (true);

CREATE POLICY "proof_likes_insert_own" ON proof_likes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "proof_likes_delete_own" ON proof_likes
  FOR DELETE USING (user_id = auth.uid());

-- 2. proof_comments 테이블 생성
CREATE TABLE IF NOT EXISTS proof_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proof_id UUID NOT NULL REFERENCES revenue_proofs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- proof_comments 인덱스
CREATE INDEX IF NOT EXISTS idx_proof_comments_proof_id ON proof_comments(proof_id);
CREATE INDEX IF NOT EXISTS idx_proof_comments_user_id ON proof_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_proof_comments_created_at ON proof_comments(created_at DESC);

-- proof_comments RLS 활성화
ALTER TABLE proof_comments ENABLE ROW LEVEL SECURITY;

-- proof_comments RLS 정책
CREATE POLICY "proof_comments_select_public" ON proof_comments
  FOR SELECT USING (is_hidden = false OR user_id = auth.uid());

CREATE POLICY "proof_comments_insert_own" ON proof_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "proof_comments_update_own" ON proof_comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "proof_comments_delete_own" ON proof_comments
  FOR DELETE USING (user_id = auth.uid());

-- 3. naver_cafe_verifications 테이블 생성
CREATE TABLE IF NOT EXISTS naver_cafe_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cafe_url TEXT NOT NULL,
  cafe_name TEXT NOT NULL,
  member_level TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- naver_cafe_verifications 인덱스
CREATE INDEX IF NOT EXISTS idx_naver_cafe_verifications_user_id ON naver_cafe_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_naver_cafe_verifications_status ON naver_cafe_verifications(verification_status);

-- naver_cafe_verifications RLS 활성화
ALTER TABLE naver_cafe_verifications ENABLE ROW LEVEL SECURITY;

-- naver_cafe_verifications RLS 정책
CREATE POLICY "naver_cafe_verifications_select_own" ON naver_cafe_verifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "naver_cafe_verifications_insert_own" ON naver_cafe_verifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "naver_cafe_verifications_update_own" ON naver_cafe_verifications
  FOR UPDATE USING (user_id = auth.uid());

-- 4. subscription_logs 테이블 생성
CREATE TABLE IF NOT EXISTS subscription_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('subscribe', 'unsubscribe')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- subscription_logs 인덱스
CREATE INDEX IF NOT EXISTS idx_subscription_logs_user_id ON subscription_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_channel_id ON subscription_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_created_at ON subscription_logs(created_at DESC);

-- subscription_logs RLS 활성화
ALTER TABLE subscription_logs ENABLE ROW LEVEL SECURITY;

-- subscription_logs RLS 정책
CREATE POLICY "subscription_logs_select_own" ON subscription_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "subscription_logs_insert_own" ON subscription_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 5. channel_subscriptions 테이블 생성
CREATE TABLE IF NOT EXISTS channel_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  channel_name TEXT,
  channel_thumbnail TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

-- channel_subscriptions 인덱스
CREATE INDEX IF NOT EXISTS idx_channel_subscriptions_user_id ON channel_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_subscriptions_channel_id ON channel_subscriptions(channel_id);

-- channel_subscriptions RLS 활성화
ALTER TABLE channel_subscriptions ENABLE ROW LEVEL SECURITY;

-- channel_subscriptions RLS 정책
CREATE POLICY "channel_subscriptions_select_own" ON channel_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "channel_subscriptions_insert_own" ON channel_subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "channel_subscriptions_delete_own" ON channel_subscriptions
  FOR DELETE USING (user_id = auth.uid());

-- 6. webhook_events 테이블 생성
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- webhook_events 인덱스
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- webhook_events RLS 활성화 (관리자만 접근 가능)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- webhook_events RLS 정책 (관리자만 접근)
CREATE POLICY "webhook_events_admin_only" ON webhook_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 7. course_progress_extended 테이블 생성 (snake_case로)
CREATE TABLE IF NOT EXISTS course_progress_extended (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID,
  quiz_scores JSONB DEFAULT '[]'::jsonb,
  assignments_completed JSONB DEFAULT '[]'::jsonb,
  certificates JSONB DEFAULT '[]'::jsonb,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- course_progress_extended 인덱스
CREATE INDEX IF NOT EXISTS idx_course_progress_extended_user_id ON course_progress_extended(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_extended_course_id ON course_progress_extended(course_id);

-- course_progress_extended RLS 활성화
ALTER TABLE course_progress_extended ENABLE ROW LEVEL SECURITY;

-- course_progress_extended RLS 정책
CREATE POLICY "course_progress_extended_select_own" ON course_progress_extended
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "course_progress_extended_insert_own" ON course_progress_extended
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "course_progress_extended_update_own" ON course_progress_extended
  FOR UPDATE USING (user_id = auth.uid());

-- 좋아요 수 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_proof_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE revenue_proofs 
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = NEW.proof_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE revenue_proofs 
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = OLD.proof_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS update_proof_likes_count_trigger ON proof_likes;
CREATE TRIGGER update_proof_likes_count_trigger
AFTER INSERT OR DELETE ON proof_likes
FOR EACH ROW
EXECUTE FUNCTION update_proof_likes_count();

-- 댓글 수 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_proof_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE revenue_proofs 
    SET comments_count = COALESCE(comments_count, 0) + 1
    WHERE id = NEW.proof_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE revenue_proofs 
    SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
    WHERE id = OLD.proof_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS update_proof_comments_count_trigger ON proof_comments;
CREATE TRIGGER update_proof_comments_count_trigger
AFTER INSERT OR DELETE ON proof_comments
FOR EACH ROW
EXECUTE FUNCTION update_proof_comments_count();