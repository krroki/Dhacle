-- YouTube Lens user_api_keys 테이블 수정
-- 2025-01-14 - Google OAuth 2.0 지원을 위한 스키마 업데이트

-- 기존 user_api_keys 테이블 삭제 (데이터가 없다고 가정)
DROP TABLE IF EXISTS user_api_keys CASCADE;

-- 새로운 구조로 user_api_keys 테이블 재생성
CREATE TABLE user_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Google OAuth 토큰 (암호화됨)
    google_access_token TEXT,
    google_refresh_token TEXT,
    google_token_expires_at TIMESTAMP WITH TIME ZONE,
    google_email TEXT,
    
    -- YouTube 채널 정보
    youtube_channel_id TEXT,
    youtube_channel_title TEXT,
    
    -- 사용자 자체 API 키 (선택사항)
    user_youtube_api_key TEXT,
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- 인덱스 생성
CREATE INDEX idx_api_keys_user ON user_api_keys(user_id);
CREATE INDEX idx_api_keys_expires ON user_api_keys(google_token_expires_at);

-- RLS (Row Level Security) 정책
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 API 키만 볼 수 있음
CREATE POLICY "Users can view their own API keys"
    ON user_api_keys FOR SELECT
    USING (auth.uid() = user_id);

-- 사용자는 자신의 API 키만 삽입할 수 있음
CREATE POLICY "Users can insert their own API keys"
    ON user_api_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 API 키만 업데이트할 수 있음
CREATE POLICY "Users can update their own API keys"
    ON user_api_keys FOR UPDATE
    USING (auth.uid() = user_id);

-- 사용자는 자신의 API 키만 삭제할 수 있음
CREATE POLICY "Users can delete their own API keys"
    ON user_api_keys FOR DELETE
    USING (auth.uid() = user_id);

-- api_usage 테이블도 수정 (더 상세한 추적을 위해)
ALTER TABLE api_usage 
ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS search_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS video_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS units_used INT DEFAULT 0;

-- api_usage에 복합 유니크 제약 추가 (일별 사용량 추적)
ALTER TABLE api_usage 
ADD CONSTRAINT unique_user_date UNIQUE (user_id, date);

-- 기존 operation, units, timestamp 컬럼은 유지하되, 새로운 집계 방식도 지원

-- 업데이트 타임스탬프 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_api_keys_updated_at 
    BEFORE UPDATE ON user_api_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 마이그레이션 성공 메시지
DO $$
BEGIN
    RAISE NOTICE 'YouTube Lens schema update completed successfully';
END $$;