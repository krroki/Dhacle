-- Phase 4 보정: alert_rules의 threshold_value를 JSONB로 변환
-- 작성일: 2025-08-26

-- 1. 새로운 JSONB 컬럼 추가
ALTER TABLE alert_rules
ADD COLUMN IF NOT EXISTS threshold_value_json JSONB;

-- 2. 기존 데이터를 JSON 형태로 마이그레이션
UPDATE alert_rules
SET threshold_value_json = 
    CASE 
        WHEN threshold_value IS NOT NULL THEN 
            jsonb_build_object('value', threshold_value)
        ELSE 
            '{"value": 0}'::jsonb
    END
WHERE threshold_value_json IS NULL;

-- 3. 기존 컬럼 삭제
ALTER TABLE alert_rules DROP COLUMN IF EXISTS threshold_value;

-- 4. 새 컬럼 이름 변경
ALTER TABLE alert_rules RENAME COLUMN threshold_value_json TO threshold_value;

-- 5. NOT NULL 제약 추가
ALTER TABLE alert_rules ALTER COLUMN threshold_value SET DEFAULT '{"value": 0}'::jsonb;

-- 6. profiles 테이블에 role 컬럼 추가 (RLS 정책용)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- 7. 검증
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'alert_rules' 
AND column_name = 'threshold_value';