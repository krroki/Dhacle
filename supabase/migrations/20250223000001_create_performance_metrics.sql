-- ================================================================
-- Performance Metrics 테이블 생성
-- 생성일: 2025-02-23
-- 목적: Web Vitals 및 성능 메트릭 저장
-- ================================================================

-- performance_metrics 테이블 생성
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    page_url TEXT NOT NULL,
    metric_name VARCHAR(50) NOT NULL, -- FCP, LCP, FID, CLS, TTFB
    metric_value DECIMAL(10, 3) NOT NULL,
    rating VARCHAR(10), -- good, needs-improvement, poor
    user_agent TEXT,
    connection_type VARCHAR(20), -- 4g, 3g, 2g, slow-2g, wifi
    device_type VARCHAR(20), -- mobile, tablet, desktop
    browser VARCHAR(50),
    browser_version VARCHAR(20),
    os VARCHAR(50),
    os_version VARCHAR(20),
    screen_resolution VARCHAR(20),
    viewport_size VARCHAR(20),
    session_id VARCHAR(255),
    ip_address INET,
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인덱스를 위한 날짜 컬럼
    date DATE GENERATED ALWAYS AS (DATE(created_at)) STORED
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_page_url ON performance_metrics(page_url);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON performance_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_rating ON performance_metrics(rating);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_device_type ON performance_metrics(device_type);

-- 복합 인덱스 (자주 사용되는 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_performance_metrics_page_metric_date 
    ON performance_metrics(page_url, metric_name, date DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_page_date 
    ON performance_metrics(user_id, page_url, date DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 메트릭을 볼 수 있음 (익명 사용자 포함)
CREATE POLICY "Anyone can view performance metrics" ON performance_metrics
    FOR SELECT USING (true);

-- RLS 정책: 로그인한 사용자만 메트릭을 추가할 수 있음
CREATE POLICY "Authenticated users can insert metrics" ON performance_metrics
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' OR 
        auth.role() = 'anon' -- 익명 사용자도 메트릭 전송 가능
    );

-- RLS 정책: Service role만 메트릭을 수정할 수 있음
CREATE POLICY "Service role can update metrics" ON performance_metrics
    FOR UPDATE USING (auth.role() = 'service_role');

-- RLS 정책: Service role만 메트릭을 삭제할 수 있음
CREATE POLICY "Service role can delete metrics" ON performance_metrics
    FOR DELETE USING (auth.role() = 'service_role');

-- ================================================================
-- 집계 뷰 생성 (선택사항)
-- ================================================================

-- 페이지별 평균 메트릭 뷰
CREATE OR REPLACE VIEW performance_metrics_summary AS
SELECT 
    page_url,
    metric_name,
    date,
    COUNT(*) as sample_count,
    AVG(metric_value) as avg_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY metric_value) as median_value,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY metric_value) as p75_value,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) as p95_value,
    MIN(metric_value) as min_value,
    MAX(metric_value) as max_value,
    SUM(CASE WHEN rating = 'good' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as good_percentage,
    SUM(CASE WHEN rating = 'needs-improvement' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as needs_improvement_percentage,
    SUM(CASE WHEN rating = 'poor' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as poor_percentage
FROM performance_metrics
GROUP BY page_url, metric_name, date;

-- 디바이스별 메트릭 뷰
CREATE OR REPLACE VIEW performance_metrics_by_device AS
SELECT 
    device_type,
    metric_name,
    date,
    COUNT(*) as sample_count,
    AVG(metric_value) as avg_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY metric_value) as median_value,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY metric_value) as p75_value
FROM performance_metrics
WHERE device_type IS NOT NULL
GROUP BY device_type, metric_name, date;

-- ================================================================
-- 함수: 오래된 메트릭 정리 (30일 이상)
-- ================================================================

CREATE OR REPLACE FUNCTION cleanup_old_performance_metrics()
RETURNS void AS $$
BEGIN
    DELETE FROM performance_metrics
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 코멘트 추가
-- ================================================================

COMMENT ON TABLE performance_metrics IS 'Web Vitals 및 성능 메트릭 데이터 저장 테이블';
COMMENT ON COLUMN performance_metrics.metric_name IS 'Core Web Vitals 메트릭 이름 (FCP, LCP, FID, CLS, TTFB 등)';
COMMENT ON COLUMN performance_metrics.metric_value IS '메트릭 값 (밀리초 또는 점수)';
COMMENT ON COLUMN performance_metrics.rating IS '메트릭 평가 (good, needs-improvement, poor)';
COMMENT ON COLUMN performance_metrics.connection_type IS '네트워크 연결 타입';
COMMENT ON COLUMN performance_metrics.device_type IS '디바이스 종류 (mobile, tablet, desktop)';

-- ================================================================
-- 완료 메시지
-- ================================================================
-- performance_metrics 테이블이 성공적으로 생성되었습니다.
-- RLS 정책과 인덱스가 적용되었습니다.
-- 집계 뷰가 생성되었습니다.