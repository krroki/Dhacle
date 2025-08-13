-- YouTube Lens 관련 테이블 생성
-- 2025-01-14 생성

-- 사용자 즐겨찾기 테이블
CREATE TABLE IF NOT EXISTS youtube_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    video_id VARCHAR(20) NOT NULL,
    video_data JSONB NOT NULL,
    tags TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- 검색 히스토리 테이블
CREATE TABLE IF NOT EXISTS youtube_search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB,
    results_count INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API 사용량 추적 테이블
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    operation VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    api_type VARCHAR(20) DEFAULT 'youtube'
);

-- 사용자 API 키 저장 테이블 (암호화된 키 저장)
CREATE TABLE IF NOT EXISTS user_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'youtube'
    encrypted_key TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_favorites_user ON youtube_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created ON youtube_favorites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_user ON youtube_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created ON youtube_search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_user_date ON api_usage(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON user_api_keys(user_id);

-- RLS (Row Level Security) 정책
ALTER TABLE youtube_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- youtube_favorites 정책
CREATE POLICY "Users can view their own favorites"
    ON youtube_favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
    ON youtube_favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
    ON youtube_favorites FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
    ON youtube_favorites FOR DELETE
    USING (auth.uid() = user_id);

-- youtube_search_history 정책
CREATE POLICY "Users can view their own search history"
    ON youtube_search_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
    ON youtube_search_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history"
    ON youtube_search_history FOR DELETE
    USING (auth.uid() = user_id);

-- api_usage 정책
CREATE POLICY "Users can view their own API usage"
    ON api_usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API usage"
    ON api_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- user_api_keys 정책
CREATE POLICY "Users can view their own API keys"
    ON user_api_keys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own API keys"
    ON user_api_keys FOR ALL
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_youtube_favorites_updated_at 
    BEFORE UPDATE ON youtube_favorites 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_api_keys_updated_at 
    BEFORE UPDATE ON user_api_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();