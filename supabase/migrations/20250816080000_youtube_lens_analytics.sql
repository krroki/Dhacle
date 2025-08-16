-- YouTube Lens Phase 4: Advanced Analytics Tables
-- Created: 2025-08-16

-- ============================================
-- Analytics Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50) NOT NULL, -- outlier, nlp, trend, prediction, batch
  video_count INTEGER NOT NULL DEFAULT 0,
  processing_time_ms INTEGER,
  config JSONB, -- Analysis configuration used
  results_summary JSONB, -- Summary of results
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_analytics_logs_user_id (user_id),
  INDEX idx_analytics_logs_type (analysis_type),
  INDEX idx_analytics_logs_created (created_at DESC)
);

-- ============================================
-- Outlier Results Table (for caching)
-- ============================================
CREATE TABLE IF NOT EXISTS outlier_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id VARCHAR(50) NOT NULL REFERENCES videos(video_id) ON DELETE CASCADE,
  z_score DECIMAL(10, 4),
  mad_score DECIMAL(10, 4),
  combined_score DECIMAL(10, 4),
  is_outlier BOOLEAN DEFAULT FALSE,
  outlier_type VARCHAR(20), -- positive, negative
  percentile INTEGER,
  snapshot_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_outlier_results_video (video_id),
  INDEX idx_outlier_results_outlier (is_outlier),
  INDEX idx_outlier_results_snapshot (snapshot_at DESC)
);

-- ============================================
-- Prediction Results Table (for tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS prediction_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id VARCHAR(50) NOT NULL REFERENCES videos(video_id) ON DELETE CASCADE,
  predicted_views BIGINT,
  predicted_likes BIGINT,
  confidence_lower BIGINT,
  confidence_upper BIGINT,
  viral_probability DECIMAL(5, 4),
  growth_trajectory VARCHAR(20), -- exponential, linear, logarithmic, plateau, declining
  prediction_date DATE NOT NULL,
  horizon_days INTEGER DEFAULT 30,
  model_version VARCHAR(20),
  actual_views BIGINT, -- For accuracy tracking
  actual_likes BIGINT, -- For accuracy tracking
  accuracy_score DECIMAL(5, 4), -- Calculated accuracy
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_prediction_results_video (video_id),
  INDEX idx_prediction_results_date (prediction_date DESC),
  INDEX idx_prediction_results_viral (viral_probability DESC)
);

-- ============================================
-- Trend Analysis Results Table
-- ============================================
CREATE TABLE IF NOT EXISTS trend_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword VARCHAR(255) NOT NULL,
  frequency INTEGER DEFAULT 0,
  growth_rate DECIMAL(10, 4),
  sentiment VARCHAR(20), -- positive, negative, neutral
  confidence DECIMAL(5, 4),
  related_videos JSONB, -- Array of video IDs
  time_window_start DATE,
  time_window_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_trend_results_keyword (keyword),
  INDEX idx_trend_results_growth (growth_rate DESC),
  INDEX idx_trend_results_window (time_window_end DESC)
);

-- ============================================
-- Entity Extraction Results Table
-- ============================================
CREATE TABLE IF NOT EXISTS entity_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id VARCHAR(50) NOT NULL REFERENCES videos(video_id) ON DELETE CASCADE,
  keywords JSONB, -- Array of keywords
  topics JSONB, -- Array of topics
  brands JSONB, -- Array of brands
  people JSONB, -- Array of people
  locations JSONB, -- Array of locations
  language VARCHAR(20),
  confidence DECIMAL(5, 4),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_entity_results_video (video_id),
  INDEX idx_entity_results_processed (processed_at DESC)
);

-- ============================================
-- RLS Policies
-- ============================================

-- Analytics Logs Policies
ALTER TABLE analytics_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics logs"
  ON analytics_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analytics logs"
  ON analytics_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Outlier Results Policies
ALTER TABLE outlier_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view outlier results"
  ON outlier_results FOR SELECT
  USING (true);

-- Prediction Results Policies
ALTER TABLE prediction_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prediction results"
  ON prediction_results FOR SELECT
  USING (true);

-- Trend Results Policies
ALTER TABLE trend_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trend results"
  ON trend_results FOR SELECT
  USING (true);

-- Entity Results Policies
ALTER TABLE entity_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view entity results"
  ON entity_results FOR SELECT
  USING (true);

-- ============================================
-- Functions for Analytics
-- ============================================

-- Function to calculate prediction accuracy
CREATE OR REPLACE FUNCTION calculate_prediction_accuracy()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.actual_views IS NOT NULL AND NEW.predicted_views IS NOT NULL THEN
    NEW.accuracy_score := 1 - ABS(NEW.actual_views - NEW.predicted_views)::DECIMAL / GREATEST(NEW.actual_views, NEW.predicted_views);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for accuracy calculation
CREATE TRIGGER update_prediction_accuracy
  BEFORE UPDATE ON prediction_results
  FOR EACH ROW
  WHEN (OLD.actual_views IS DISTINCT FROM NEW.actual_views)
  EXECUTE FUNCTION calculate_prediction_accuracy();

-- Function to clean old analytics logs (keep 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_logs
  WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
  
  DELETE FROM outlier_results
  WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '7 days';
  
  DELETE FROM entity_results
  WHERE processed_at < CURRENT_TIMESTAMP - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Indexes for Performance
-- ============================================

-- Composite indexes for common queries
CREATE INDEX idx_analytics_logs_user_type_date 
  ON analytics_logs(user_id, analysis_type, created_at DESC);

CREATE INDEX idx_outlier_results_outlier_score 
  ON outlier_results(is_outlier, combined_score DESC) 
  WHERE is_outlier = true;

CREATE INDEX idx_prediction_results_viral_date 
  ON prediction_results(viral_probability DESC, prediction_date DESC)
  WHERE viral_probability > 0.7;

CREATE INDEX idx_trend_results_top_trends 
  ON trend_results(growth_rate DESC, confidence DESC)
  WHERE growth_rate > 0;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE analytics_logs IS 'Logs of all analytics operations performed by users';
COMMENT ON TABLE outlier_results IS 'Cached results of outlier detection analysis';
COMMENT ON TABLE prediction_results IS 'Video performance predictions and accuracy tracking';
COMMENT ON TABLE trend_results IS 'Trending keywords and topics analysis results';
COMMENT ON TABLE entity_results IS 'NLP entity extraction results for videos';