-- ====================================
-- 이것만 실행하면 끝!
-- ====================================

-- profiles를 users 테이블로 연결하는 뷰 생성
CREATE OR REPLACE VIEW profiles AS 
SELECT * FROM users;

-- revenue_proofs 테이블 생성
CREATE TABLE IF NOT EXISTS revenue_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  amount DECIMAL(12,0) NOT NULL CHECK (amount >= 0),
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('youtube', 'instagram', 'tiktok')),
  screenshot_url TEXT NOT NULL,
  screenshot_blur TEXT,
  signature_data TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  reports_count INT DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE revenue_proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "누구나 읽기 가능" ON revenue_proofs
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "로그인한 사람만 작성" ON revenue_proofs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 모든 테이블 생성 완료!';
END $$;