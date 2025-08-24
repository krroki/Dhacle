-- YouTube 검색 기록 테이블 생성
CREATE TABLE IF NOT EXISTS youtube_search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB,
  result_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 인덱스
  INDEX idx_youtube_search_history_user_id (user_id),
  INDEX idx_youtube_search_history_created_at (created_at)
);

-- RLS 활성화
ALTER TABLE youtube_search_history ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 검색 기록만 볼 수 있음
CREATE POLICY "Users can view own search history" ON youtube_search_history
  FOR SELECT USING (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 검색 기록만 추가할 수 있음
CREATE POLICY "Users can insert own search history" ON youtube_search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 검색 기록만 삭제할 수 있음
CREATE POLICY "Users can delete own search history" ON youtube_search_history
  FOR DELETE USING (auth.uid() = user_id);

-- 코멘트 추가
COMMENT ON TABLE youtube_search_history IS 'YouTube API 검색 기록 저장 테이블';
COMMENT ON COLUMN youtube_search_history.query IS '검색어';
COMMENT ON COLUMN youtube_search_history.filters IS '검색 필터 (JSON 형태)';
COMMENT ON COLUMN youtube_search_history.result_count IS '검색 결과 개수';