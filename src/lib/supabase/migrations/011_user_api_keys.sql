-- 011_user_api_keys.sql
-- 사용자별 API Key 관리 테이블

-- 기존 테이블이 있다면 삭제
DROP TABLE IF EXISTS user_api_keys;

-- user_api_keys 테이블 생성
CREATE TABLE user_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    service_name TEXT DEFAULT 'youtube' NOT NULL,  -- 향후 다른 서비스 추가 가능
    api_key_masked TEXT NOT NULL,                  -- 마스킹된 키 (표시용)
    encrypted_key TEXT NOT NULL,                   -- 암호화된 실제 키
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0 NOT NULL,
    usage_today INTEGER DEFAULT 0 NOT NULL,
    usage_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_valid BOOLEAN DEFAULT true NOT NULL,
    validation_error TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- 각 사용자는 서비스당 하나의 API Key만 가질 수 있음
    UNIQUE(user_id, service_name)
);

-- 인덱스 생성
CREATE INDEX idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX idx_user_api_keys_service_name ON user_api_keys(service_name);
CREATE INDEX idx_user_api_keys_is_active ON user_api_keys(is_active);
CREATE INDEX idx_user_api_keys_usage_date ON user_api_keys(usage_date);

-- RLS (Row Level Security) 활성화
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 API Key만 관리 가능
CREATE POLICY "Users can view own API keys" ON user_api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys" ON user_api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON user_api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON user_api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_api_keys_updated_at
    BEFORE UPDATE ON user_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 일일 사용량 리셋 함수
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS void AS $$
BEGIN
    UPDATE user_api_keys
    SET 
        usage_today = 0,
        usage_date = CURRENT_DATE
    WHERE usage_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 사용량 업데이트 함수
CREATE OR REPLACE FUNCTION increment_api_key_usage(p_user_id UUID, p_service_name TEXT DEFAULT 'youtube')
RETURNS void AS $$
BEGIN
    -- 날짜가 변경되었으면 먼저 리셋
    UPDATE user_api_keys
    SET 
        usage_today = CASE 
            WHEN usage_date < CURRENT_DATE THEN 1
            ELSE usage_today + 1
        END,
        usage_count = usage_count + 1,
        usage_date = CURRENT_DATE,
        last_used_at = NOW()
    WHERE 
        user_id = p_user_id 
        AND service_name = p_service_name
        AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- 코멘트 추가
COMMENT ON TABLE user_api_keys IS '사용자별 API Key 관리 테이블';
COMMENT ON COLUMN user_api_keys.service_name IS 'API 서비스 이름 (youtube, openai 등)';
COMMENT ON COLUMN user_api_keys.api_key_masked IS '마스킹된 API Key (표시용, 예: AIza...XXX)';
COMMENT ON COLUMN user_api_keys.encrypted_key IS 'AES-256으로 암호화된 실제 API Key';
COMMENT ON COLUMN user_api_keys.usage_today IS '오늘 사용한 횟수 (YouTube API의 경우 units)';
COMMENT ON COLUMN user_api_keys.usage_date IS '사용량 카운트 날짜';
COMMENT ON COLUMN user_api_keys.is_active IS 'API Key 활성화 상태';
COMMENT ON COLUMN user_api_keys.is_valid IS 'API Key 유효성 (마지막 검증 결과)';
COMMENT ON COLUMN user_api_keys.validation_error IS 'API Key 검증 실패 시 에러 메시지';
COMMENT ON COLUMN user_api_keys.metadata IS '추가 메타데이터 (JSON 형식)';