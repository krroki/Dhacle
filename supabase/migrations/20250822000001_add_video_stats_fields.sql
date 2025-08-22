-- video_stats 테이블에 누락된 필드 추가
-- 2025-08-22: as any 제거를 위한 마이그레이션

-- 1. views_per_hour 필드 추가 (시간당 조회수)
ALTER TABLE video_stats 
ADD COLUMN IF NOT EXISTS views_per_hour NUMERIC DEFAULT 0;

-- 2. engagement_rate 필드 추가 (참여율)
ALTER TABLE video_stats 
ADD COLUMN IF NOT EXISTS engagement_rate NUMERIC DEFAULT 0;

-- 3. viral_score 필드 추가 (바이럴 점수)
ALTER TABLE video_stats 
ADD COLUMN IF NOT EXISTS viral_score NUMERIC DEFAULT 0;

-- 4. 기존 데이터에 대한 값 계산 (옵션)
UPDATE video_stats 
SET 
  views_per_hour = CASE 
    WHEN created_at IS NOT NULL AND view_count IS NOT NULL THEN
      view_count / GREATEST(1, EXTRACT(EPOCH FROM (NOW() - created_at::timestamp)) / 3600)
    ELSE 0
  END,
  engagement_rate = CASE 
    WHEN view_count > 0 AND like_count IS NOT NULL AND comment_count IS NOT NULL THEN
      ((like_count + comment_count) * 100.0 / view_count)
    ELSE 0
  END,
  viral_score = CASE
    WHEN view_count > 10000 THEN 75
    WHEN view_count > 5000 THEN 50
    WHEN view_count > 1000 THEN 25
    ELSE 10
  END
WHERE views_per_hour IS NULL OR engagement_rate IS NULL OR viral_score IS NULL;

-- 5. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_video_stats_viral_score ON video_stats(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_video_stats_views_per_hour ON video_stats(views_per_hour DESC);
CREATE INDEX IF NOT EXISTS idx_video_stats_engagement_rate ON video_stats(engagement_rate DESC);

-- 6. 코멘트 추가
COMMENT ON COLUMN video_stats.views_per_hour IS '시간당 조회수 (계산값)';
COMMENT ON COLUMN video_stats.engagement_rate IS '참여율 - (좋아요+댓글)/조회수*100';
COMMENT ON COLUMN video_stats.viral_score IS '바이럴 점수 (0-100)';