/**
 * YouTube Lens - Outlier Detection System
 * Phase 4: Advanced Analytics
 * 
 * Implements z-MAD (z-score with Median Absolute Deviation) algorithm
 * for detecting statistical outliers in YouTube video metrics
 */

import type { 
  Video, 
  VideoStats, 
  OutlierDetectionResult,
  AnalyticsConfig 
} from '@/types/youtube-lens';

// Default configuration for outlier detection
const DEFAULT_CONFIG: AnalyticsConfig = {
  outlier_threshold: 3, // z-score threshold
  mad_multiplier: 2.5, // MAD multiplier for robustness
  trend_window_days: 7,
  prediction_horizon_days: 30,
  nlp_confidence_threshold: 0.7,
  batch_size: 100
};

/**
 * Calculate median of an array of numbers
 */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calculate Median Absolute Deviation (MAD)
 * MAD is more robust to outliers than standard deviation
 */
function calculateMAD(values: number[]): number {
  if (values.length === 0) return 0;
  
  const med = median(values);
  const deviations = values.map(v => Math.abs(v - med));
  return median(deviations);
}

/**
 * Calculate z-score for each value
 */
function calculateZScores(values: number[]): number[] {
  if (values.length === 0) return [];
  
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return values.map(() => 0);
  
  return values.map(v => (v - mean) / stdDev);
}

/**
 * Calculate modified z-score using MAD
 * This is more robust to outliers than standard z-score
 */
function calculateModifiedZScores(values: number[], madMultiplier: number = 2.5): number[] {
  if (values.length === 0) return [];
  
  const med = median(values);
  const mad = calculateMAD(values);
  
  if (mad === 0) return values.map(() => 0);
  
  // Modified z-score formula: 0.6745 * (x - median) / MAD
  // 0.6745 is the constant to make MAD consistent with standard deviation
  return values.map(v => 0.6745 * (v - med) / mad);
}

/**
 * Calculate percentile rank for a value in a dataset
 */
function calculatePercentile(value: number, values: number[]): number {
  if (values.length === 0) return 50;
  
  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.filter(v => v <= value).length;
  return (count / sorted.length) * 100;
}

/**
 * Detect outliers in video statistics using z-MAD algorithm
 */
export async function detectOutliers(
  videos: Array<Video & { stats?: VideoStats | VideoStats[] }>,
  config: Partial<AnalyticsConfig> = {}
): Promise<OutlierDetectionResult[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  // Extract metrics for analysis
  const viewCounts = videos.map(v => {
    const stats = Array.isArray(v.stats) ? v.stats[0] : v.stats;
    return stats?.view_count || 0;
  });
  const likeCounts = videos.map(v => {
    const stats = Array.isArray(v.stats) ? v.stats[0] : v.stats;
    return stats?.like_count || 0;
  });
  const commentCounts = videos.map(v => {
    const stats = Array.isArray(v.stats) ? v.stats[0] : v.stats;
    return stats?.comment_count || 0;
  });
  const vphValues = videos.map(v => {
    const stats = Array.isArray(v.stats) ? v.stats[0] : v.stats;
    return stats?.views_per_hour || 0;
  });
  
  // Calculate z-scores and MAD scores
  const viewZScores = calculateZScores(viewCounts);
  const viewMADScores = calculateModifiedZScores(viewCounts, cfg.mad_multiplier);
  
  const likeZScores = calculateZScores(likeCounts);
  const likeMADScores = calculateModifiedZScores(likeCounts, cfg.mad_multiplier);
  
  const commentZScores = calculateZScores(commentCounts);
  const commentMADScores = calculateModifiedZScores(commentCounts, cfg.mad_multiplier);
  
  const vphZScores = calculateZScores(vphValues);
  const vphMADScores = calculateModifiedZScores(vphValues, cfg.mad_multiplier);
  
  // Analyze each video for outliers
  const results: OutlierDetectionResult[] = videos.map((video, index) => {
    // Calculate combined scores (average of all metrics)
    const avgZScore = (
      Math.abs(viewZScores[index]) +
      Math.abs(likeZScores[index]) +
      Math.abs(commentZScores[index]) +
      Math.abs(vphZScores[index])
    ) / 4;
    
    const avgMADScore = (
      Math.abs(viewMADScores[index]) +
      Math.abs(likeMADScores[index]) +
      Math.abs(commentMADScores[index]) +
      Math.abs(vphMADScores[index])
    ) / 4;
    
    // Combined score: weighted average of z-score and MAD score
    const combinedScore = (avgZScore * 0.4 + avgMADScore * 0.6);
    
    // Determine if it's an outlier
    const isOutlier = combinedScore > cfg.outlier_threshold;
    
    // Determine outlier type (positive = viral, negative = underperforming)
    let outlierType: 'positive' | 'negative' | null = null;
    if (isOutlier) {
      const sumScore = viewZScores[index] + likeZScores[index] + 
                      commentZScores[index] + vphZScores[index];
      outlierType = sumScore > 0 ? 'positive' : 'negative';
    }
    
    // Calculate percentile rank
    const percentile = calculatePercentile(viewCounts[index], viewCounts);
    
    return {
      video_id: video.video_id,
      z_score: avgZScore,
      mad_score: avgMADScore,
      combined_score: combinedScore,
      is_outlier: isOutlier,
      outlier_type: outlierType,
      metrics: {
        view_count: viewCounts[index],
        like_count: likeCounts[index],
        comment_count: commentCounts[index],
        vph: vphValues[index]
      },
      percentile: Math.round(percentile),
      timestamp: new Date().toISOString()
    };
  });
  
  return results;
}

/**
 * Find top outliers (most viral or underperforming videos)
 */
export function findTopOutliers(
  results: OutlierDetectionResult[],
  type: 'positive' | 'negative' | 'all' = 'all',
  limit: number = 10
): OutlierDetectionResult[] {
  let filtered = results.filter(r => r.is_outlier);
  
  if (type !== 'all') {
    filtered = filtered.filter(r => r.outlier_type === type);
  }
  
  // Sort by combined score (descending)
  return filtered
    .sort((a, b) => b.combined_score - a.combined_score)
    .slice(0, limit);
}

/**
 * Analyze outlier trends over time
 */
export function analyzeOutlierTrends(
  historicalResults: OutlierDetectionResult[][],
  videoId: string
): {
  consistently_outlier: boolean;
  outlier_frequency: number;
  trend: 'improving' | 'declining' | 'stable';
  avg_score: number;
} {
  const videoResults = historicalResults
    .map(batch => batch.find(r => r.video_id === videoId))
    .filter(Boolean) as OutlierDetectionResult[];
  
  if (videoResults.length === 0) {
    return {
      consistently_outlier: false,
      outlier_frequency: 0,
      trend: 'stable',
      avg_score: 0
    };
  }
  
  const outlierCount = videoResults.filter(r => r.is_outlier).length;
  const outlierFrequency = outlierCount / videoResults.length;
  const avgScore = videoResults.reduce((sum, r) => sum + r.combined_score, 0) / videoResults.length;
  
  // Determine trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (videoResults.length >= 3) {
    const recentScores = videoResults.slice(-3).map(r => r.combined_score);
    const earlyScores = videoResults.slice(0, 3).map(r => r.combined_score);
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const earlyAvg = earlyScores.reduce((a, b) => a + b, 0) / earlyScores.length;
    
    if (recentAvg > earlyAvg * 1.2) trend = 'improving';
    else if (recentAvg < earlyAvg * 0.8) trend = 'declining';
  }
  
  return {
    consistently_outlier: outlierFrequency > 0.7,
    outlier_frequency: outlierFrequency,
    trend,
    avg_score: avgScore
  };
}

/**
 * Generate outlier report
 */
export function generateOutlierReport(results: OutlierDetectionResult[]): {
  total_videos: number;
  total_outliers: number;
  positive_outliers: number;
  negative_outliers: number;
  outlier_rate: number;
  top_performers: OutlierDetectionResult[];
  underperformers: OutlierDetectionResult[];
  statistics: {
    avg_z_score: number;
    avg_mad_score: number;
    percentile_distribution: {
      top_10: number;
      top_25: number;
      bottom_25: number;
      bottom_10: number;
    };
  };
} {
  const outliers = results.filter(r => r.is_outlier);
  const positiveOutliers = outliers.filter(r => r.outlier_type === 'positive');
  const negativeOutliers = outliers.filter(r => r.outlier_type === 'negative');
  
  const avgZScore = results.reduce((sum, r) => sum + r.z_score, 0) / results.length;
  const avgMADScore = results.reduce((sum, r) => sum + r.mad_score, 0) / results.length;
  
  return {
    total_videos: results.length,
    total_outliers: outliers.length,
    positive_outliers: positiveOutliers.length,
    negative_outliers: negativeOutliers.length,
    outlier_rate: outliers.length / results.length,
    top_performers: findTopOutliers(results, 'positive', 5),
    underperformers: findTopOutliers(results, 'negative', 5),
    statistics: {
      avg_z_score: avgZScore,
      avg_mad_score: avgMADScore,
      percentile_distribution: {
        top_10: results.filter(r => r.percentile >= 90).length,
        top_25: results.filter(r => r.percentile >= 75).length,
        bottom_25: results.filter(r => r.percentile <= 25).length,
        bottom_10: results.filter(r => r.percentile <= 10).length
      }
    }
  };
}

export default {
  detectOutliers,
  findTopOutliers,
  analyzeOutlierTrends,
  generateOutlierReport
};