-- 012_community_system.sql
-- 커뮤니티 시스템 테이블 생성

-- 게시판 테이블
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('board', 'qna', 'study')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 댓글 테이블
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 좋아요 테이블
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 인덱스 생성
CREATE INDEX idx_community_posts_category ON community_posts(category);
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX idx_community_comments_user_id ON community_comments(user_id);
CREATE INDEX idx_community_likes_post_id ON community_likes(post_id);
CREATE INDEX idx_community_likes_user_id ON community_likes(user_id);

-- RLS 정책 활성화
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- 게시글 정책
-- 읽기: 모든 로그인 사용자
CREATE POLICY "community_posts_read" ON community_posts
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 작성: 로그인 사용자
CREATE POLICY "community_posts_create" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 수정: 작성자만
CREATE POLICY "community_posts_update" ON community_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- 삭제: 작성자만
CREATE POLICY "community_posts_delete" ON community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- 댓글 정책
-- 읽기: 모든 로그인 사용자
CREATE POLICY "community_comments_read" ON community_comments
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 작성: 로그인 사용자
CREATE POLICY "community_comments_create" ON community_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 수정: 작성자만
CREATE POLICY "community_comments_update" ON community_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- 삭제: 작성자만
CREATE POLICY "community_comments_delete" ON community_comments
  FOR DELETE USING (auth.uid() = user_id);

-- 좋아요 정책
-- 읽기: 모든 로그인 사용자
CREATE POLICY "community_likes_read" ON community_likes
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 작성: 로그인 사용자 (자신의 좋아요만)
CREATE POLICY "community_likes_create" ON community_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 삭제: 자신의 좋아요만
CREATE POLICY "community_likes_delete" ON community_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE community_posts 
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$;

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_community_comments_updated_at
  BEFORE UPDATE ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();