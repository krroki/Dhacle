-- Phase 4: YouTube Lens 완전한 스키마 수정
-- 작성일: 2025-08-26
-- 목적: yl_channels와 alert_rules 테이블의 누락된 필드 추가 및 타입 수정

-- ===================================
-- 1. yl_channels 테이블 필수 컬럼 추가
-- ===================================

-- status 컬럼 추가 (승인 상태)
ALTER TABLE yl_channels
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- 승인자 정보 컬럼 추가
ALTER TABLE yl_channels
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

-- 승인 시간 컬럼 추가
ALTER TABLE yl_channels
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- 조회수 컬럼 추가
ALTER TABLE yl_channels
ADD COLUMN IF NOT EXISTS view_count BIGINT DEFAULT 0;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_yl_channels_status ON yl_channels(status);
CREATE INDEX IF NOT EXISTS idx_yl_channels_approved_at ON yl_channels(approved_at);
CREATE INDEX IF NOT EXISTS idx_yl_channels_channel_id ON yl_channels(channel_id);

-- ===================================
-- 2. alert_rules 테이블 수정
-- ===================================

-- 기존 데이터 백업 (안전장치)
CREATE TABLE IF NOT EXISTS alert_rules_backup_20250826 AS 
SELECT * FROM alert_rules;

-- channel_id 컬럼 추가 (target_id와 동기화)
ALTER TABLE alert_rules
ADD COLUMN IF NOT EXISTS channel_id VARCHAR(255);

-- 기존 target_id 데이터를 channel_id로 복사
UPDATE alert_rules 
SET channel_id = target_id 
WHERE channel_id IS NULL AND target_id IS NOT NULL;

-- 필수 필드 추가 (존재하지 않는 경우만)
ALTER TABLE alert_rules
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS metric VARCHAR(100);

-- condition 컬럼 체크 제약 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'alert_rules' 
        AND column_name = 'condition' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE alert_rules
        ALTER COLUMN condition SET NOT NULL;
    END IF;
    
    -- condition 체크 제약 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'alert_rules_condition_check'
    ) THEN
        ALTER TABLE alert_rules
        ADD CONSTRAINT alert_rules_condition_check 
        CHECK (condition IN ('>', '<', '>=', '<=', '=', '!='));
    END IF;
END $$;

-- threshold_value 타입을 JSONB로 변경
DO $$
BEGIN
    -- 현재 타입 확인
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'alert_rules'
        AND column_name = 'threshold_value'
        AND data_type != 'jsonb'
    ) THEN
        -- 기존 데이터 보존하며 JSONB로 변환
        ALTER TABLE alert_rules
        ADD COLUMN IF NOT EXISTS threshold_value_new JSONB;
        
        -- 기존 값을 JSON 형태로 변환
        UPDATE alert_rules
        SET threshold_value_new = 
            CASE 
                WHEN threshold_value IS NOT NULL THEN 
                    jsonb_build_object('value', threshold_value)
                ELSE 
                    NULL
            END
        WHERE threshold_value_new IS NULL;
        
        -- 기존 컬럼 삭제 및 새 컬럼 이름 변경
        ALTER TABLE alert_rules DROP COLUMN IF EXISTS threshold_value;
        ALTER TABLE alert_rules RENAME COLUMN threshold_value_new TO threshold_value;
    END IF;
END $$;

-- ===================================
-- 3. collections 테이블 컬럼 추가 (보조)
-- ===================================

ALTER TABLE collections
ADD COLUMN IF NOT EXISTS type VARCHAR(50),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- ===================================
-- 4. RLS (Row Level Security) 정책 추가
-- ===================================

-- yl_channels RLS 활성화
ALTER TABLE yl_channels ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Admin can manage channels" ON yl_channels;
DROP POLICY IF EXISTS "Public can view approved channels" ON yl_channels;

-- 관리자만 채널 관리 가능
CREATE POLICY "Admin can manage channels" ON yl_channels
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- 모든 사용자가 승인된 채널 조회 가능
CREATE POLICY "Public can view approved channels" ON yl_channels
FOR SELECT 
USING (status = 'approved');

-- alert_rules RLS 활성화
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Users can manage their own alert rules" ON alert_rules;

-- 사용자가 자신의 알림 규칙만 관리
CREATE POLICY "Users can manage their own alert rules" ON alert_rules
FOR ALL 
USING (user_id = auth.uid());

-- ===================================
-- 5. 자동 트리거 추가
-- ===================================

-- 승인 시 자동 타임스탬프 트리거 함수
CREATE OR REPLACE FUNCTION update_approved_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- status가 approved로 변경되고 이전에 approved가 아니었을 때
    IF NEW.status = 'approved' AND 
       (OLD.status IS NULL OR OLD.status != 'approved') THEN
        NEW.approved_at = NOW();
        NEW.approved_by = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기존 트리거 삭제 (충돌 방지)
DROP TRIGGER IF EXISTS update_approved_timestamp_trigger ON yl_channels;

-- 트리거 생성
CREATE TRIGGER update_approved_timestamp_trigger
BEFORE UPDATE ON yl_channels
FOR EACH ROW
EXECUTE FUNCTION update_approved_timestamp();

-- ===================================
-- 6. updated_at 자동 업데이트 트리거
-- ===================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- yl_channels updated_at 트리거
DROP TRIGGER IF EXISTS update_yl_channels_updated_at ON yl_channels;
CREATE TRIGGER update_yl_channels_updated_at
BEFORE UPDATE ON yl_channels
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- alert_rules updated_at 트리거
DROP TRIGGER IF EXISTS update_alert_rules_updated_at ON alert_rules;
CREATE TRIGGER update_alert_rules_updated_at
BEFORE UPDATE ON alert_rules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- 7. 데이터 마이그레이션 및 정리
-- ===================================

-- alert_rules의 기본값 설정
UPDATE alert_rules
SET name = COALESCE(name, 'Alert Rule ' || id),
    metric = COALESCE(metric, 'subscriber_count')
WHERE name IS NULL OR metric IS NULL;

-- ===================================
-- 8. 검증 쿼리
-- ===================================

-- 스키마 확인용 뷰 생성
CREATE OR REPLACE VIEW schema_validation AS
SELECT 
    'yl_channels' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'yl_channels'
AND column_name IN ('status', 'approved_by', 'approved_at', 'view_count')

UNION ALL

SELECT 
    'alert_rules' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'alert_rules'
AND column_name IN ('channel_id', 'threshold_value', 'name', 'metric');

-- ===================================
-- 9. 완료 메시지
-- ===================================

DO $$
BEGIN
    RAISE NOTICE 'YouTube Lens 스키마 수정 완료';
    RAISE NOTICE '- yl_channels: status, approved_by, approved_at, view_count 추가';
    RAISE NOTICE '- alert_rules: channel_id 추가, threshold_value JSONB 변환';
    RAISE NOTICE '- RLS 정책 및 트리거 설정 완료';
END $$;