-- 007_revenue_proof_system.sql
-- 수익인증 시스템 테이블 생성

-- 1. 수익인증 메인 테이블
CREATE TABLE IF NOT EXISTS revenue_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL, -- TipTap JSON 형식
  amount DECIMAL(12,0) NOT NULL CHECK (amount >= 0),
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('youtube', 'instagram', 'tiktok')),
  screenshot_url TEXT NOT NULL,
  screenshot_blur TEXT, -- blur placeholder
  signature_data TEXT NOT NULL, -- 캔버스 서명 base64
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  reports_count INT DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 좋아요 테이블
CREATE TABLE IF NOT EXISTS proof_likes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  proof_id UUID REFERENCES revenue_proofs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, proof_id)
);

-- 3. 댓글 테이블
CREATE TABLE IF NOT EXISTS proof_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id UUID REFERENCES revenue_proofs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 신고 테이블
CREATE TABLE IF NOT EXISTS proof_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id UUID REFERENCES revenue_proofs(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason VARCHAR(50) NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(proof_id, reporter_id) -- 한 사용자가 같은 게시물을 중복 신고 방지
);

-- 5. 사용자 배지 테이블
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_type VARCHAR(50) NOT NULL,
  badge_data JSONB,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 월간 랭킹 스냅샷 (성능 최적화)
CREATE TABLE IF NOT EXISTS monthly_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  total_amount DECIMAL(12,0) NOT NULL,
  rank INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, user_id) -- 같은 달에 같은 사용자 중복 방지
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_revenue_proofs_created_at ON revenue_proofs(created_at DESC);
CREATE INDEX idx_revenue_proofs_user_id ON revenue_proofs(user_id);
CREATE INDEX idx_revenue_proofs_is_hidden ON revenue_proofs(is_hidden);
CREATE INDEX idx_revenue_proofs_platform ON revenue_proofs(platform);
CREATE INDEX idx_proof_likes_proof_id ON proof_likes(proof_id);
CREATE INDEX idx_proof_comments_proof_id ON proof_comments(proof_id);
CREATE INDEX idx_monthly_rankings_month ON monthly_rankings(month);
CREATE INDEX idx_monthly_rankings_user_id ON monthly_rankings(user_id);

-- RLS (Row Level Security) 정책
ALTER TABLE revenue_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_rankings ENABLE ROW LEVEL SECURITY;

-- 읽기: 모든 사용자 (숨김 제외)
CREATE POLICY "Public read access on revenue_proofs" ON revenue_proofs
  FOR SELECT USING (is_hidden = false);

-- 생성: 로그인 사용자만, 일 1회
CREATE POLICY "Authenticated users can create revenue_proofs" ON revenue_proofs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM revenue_proofs
      WHERE user_id = auth.uid()
      AND DATE(created_at) = CURRENT_DATE
    )
  );

-- 수정: 작성자만, 24시간 내
CREATE POLICY "Users can update own revenue_proofs" ON revenue_proofs
  FOR UPDATE USING (
    auth.uid() = user_id AND
    created_at > NOW() - INTERVAL '24 hours'
  );

-- 삭제: 작성자만
CREATE POLICY "Users can delete own revenue_proofs" ON revenue_proofs
  FOR DELETE USING (auth.uid() = user_id);

-- 좋아요: 로그인 사용자만
CREATE POLICY "Authenticated users can like" ON proof_likes
  FOR ALL USING (auth.uid() = user_id);

-- 댓글: 읽기는 모두, 작성은 로그인 사용자
CREATE POLICY "Public read comments" ON proof_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON proof_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON proof_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON proof_comments
  FOR DELETE USING (auth.uid() = user_id);

-- 신고: 로그인 사용자만
CREATE POLICY "Authenticated users can report" ON proof_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- 배지: 읽기는 모두, 생성은 시스템만
CREATE POLICY "Public read badges" ON user_badges
  FOR SELECT USING (true);

-- 랭킹: 읽기만 가능
CREATE POLICY "Public read rankings" ON monthly_rankings
  FOR SELECT USING (true);

-- 트리거: 좋아요 수 자동 업데이트
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

CREATE TRIGGER update_likes_count_trigger
AFTER INSERT OR DELETE ON proof_likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- 트리거: 댓글 수 자동 업데이트
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

CREATE TRIGGER update_comments_count_trigger
AFTER INSERT OR DELETE ON proof_comments
FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- 트리거: 신고 수 자동 업데이트 및 자동 숨김
CREATE OR REPLACE FUNCTION handle_report()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE revenue_proofs 
  SET reports_count = reports_count + 1 
  WHERE id = NEW.proof_id;
  
  -- 3회 이상 신고 시 자동 숨김
  UPDATE revenue_proofs 
  SET is_hidden = true 
  WHERE id = NEW.proof_id AND reports_count >= 3;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_report_trigger
AFTER INSERT ON proof_reports
FOR EACH ROW EXECUTE FUNCTION handle_report();

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_revenue_proofs_updated_at
BEFORE UPDATE ON revenue_proofs
FOR EACH ROW EXECUTE FUNCTION update_updated_at();