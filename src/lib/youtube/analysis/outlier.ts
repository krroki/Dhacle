/**
 * YouTube Lens - Outlier Detection System
 * Phase 4: Advanced Analytics
 *
 * Implements z-MAD (z-score with Median Absolute Deviation) algorithm
 * for detecting statistical outliers in YouTube video metrics
 */

// import { mapVideoStats } from '@/lib/utils/type-mappers';
import type {
  AnalyticsConfig,
  OutlierDetectionResult,
  YouTubeLensVideo as Video,
  VideoStats,
} from '@/types';

// Default configuration for outlier detection
const DEFAULT_CONFIG: AnalyticsConfig = {
  outlierThreshold: 3, // z-score threshold
  madMultiplier: 2.5, // MAD multiplier for robustness
  trendWindowDays: 7,
  predictionHorizonDays: 30,
  nlpConfidenceThreshold: 0.7,
  batchSize: 100,
};

/**
 * Calculate median of an array of numbers
 */
function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    const first = sorted[mid - 1] ?? 0;
    const second = sorted[mid] ?? 0;
    return (first + second) / 2;
  }
  return sorted[mid] ?? 0;
}

/**
 * Calculate Median Absolute Deviation (MAD)
 * MAD is more robust to outliers than standard deviation
 */
function calculate_mad(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const med = median(values);
  const deviations = values.map((v) => Math.abs(v - med));
  return median(deviations);
}

/**
 * Calculate z-score for each value
 */
function calculate_z_scores(values: number[]): number[] {
  if (values.length === 0) {
    return [];
  }

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const std_dev = Math.sqrt(variance);

  if (std_dev === 0) {
    return values.map(() => 0);
  }

  return values.map((v) => (v - mean) / std_dev);
}

/**
 * Calculate modified z-score using MAD
 * This is more robust to outliers than standard z-score
 */
function calculate_modified_z_scores(values: number[], __madMultiplier = 2.5): number[] {
  if (values.length === 0) {
    return [];
  }

  const med = median(values);
  const mad = calculate_mad(values);

  if (mad === 0) {
    return values.map(() => 0);
  }

  // Modified z-score formula: 0.6745 * (x - median) / MAD
  // 0.6745 is the constant to make MAD consistent with standard deviation
  return values.map((v) => (0.6745 * (v - med)) / mad);
}

/**
 * Calculate percentile rank for a value in a dataset
 */
function calculate_percentile(value: number, values: number[]): number {
  if (values.length === 0) {
    return 50;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.filter((v) => v <= value).length;
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
  const view_counts = videos.map((v) => {
    const stats = Array.isArray(v.stats) ? v.stats[0] : v.stats;
    return stats?.view_count || 0;
  });
  const like_counts = videos.map((v) => {
    const stats = Array.isArray(v.stats) ? v.stats[0] : v.stats;
    return stats?.like_count || 0;
  });
  const comment_counts = videos.map((v) => {
    const stats = Array.isArray(v.stats) ? v.stats[0] : v.stats;
    return stats?.comment_count || 0;
  });
  const vph_values = videos.map((v) => {
    const stats = Array.isArray(v.stats) ? v.stats[0] : v.stats;
    if (!stats) return 0;

    // Handle both DB and mapped stats types
    if ('viewsPerHour' in stats) {
      return stats.viewsPerHour || 0;
    }

    // For DB stats, calculate VPH if we have the data
    const view_count = 'view_count' in stats ? stats.view_count : 0;
    if (!view_count || typeof view_count !== 'number') return 0;

    // Simple approximation: views per hour based on age
    const published_at = v.published_at;
    if (published_at) {
      const age_in_hours = (Date.now() - new Date(published_at).getTime()) / (1000 * 60 * 60);
      return age_in_hours > 0 ? view_count / age_in_hours : 0;
    }

    return 0;
  });

  // Calculate z-scores and MAD scores
  const view_z_scores = calculate_z_scores(view_counts);
  const mad_multiplier = typeof cfg.madMultiplier === 'number' ? cfg.madMultiplier : 2.5;
  const view_mad_scores = calculate_modified_z_scores(view_counts, mad_multiplier);

  const like_z_scores = calculate_z_scores(like_counts);
  const like_mad_scores = calculate_modified_z_scores(like_counts, mad_multiplier);

  const comment_z_scores = calculate_z_scores(comment_counts);
  const comment_mad_scores = calculate_modified_z_scores(comment_counts, mad_multiplier);

  const vph_z_scores = calculate_z_scores(vph_values);
  const vph_mad_scores = calculate_modified_z_scores(vph_values, mad_multiplier);

  // Analyze each video for outliers
  const results: OutlierDetectionResult[] = videos.map((video, index) => {
    // Calculate combined scores (average of all metrics)
    const avg_z_score =
      (Math.abs(view_z_scores[index] || 0) +
        Math.abs(like_z_scores[index] || 0) +
        Math.abs(comment_z_scores[index] || 0) +
        Math.abs(vph_z_scores[index] || 0)) /
      4;

    const avg_mad_score =
      (Math.abs(view_mad_scores[index] || 0) +
        Math.abs(like_mad_scores[index] || 0) +
        Math.abs(comment_mad_scores[index] || 0) +
        Math.abs(vph_mad_scores[index] || 0)) /
      4;

    // Combined score: weighted average of z-score and MAD score
    const combined_score = avg_z_score * 0.4 + avg_mad_score * 0.6;

    // Determine if it's an outlier
    const threshold = typeof cfg.outlierThreshold === 'number' ? cfg.outlierThreshold : 2.5;
    const is_outlier = combined_score > threshold;

    // Determine outlier type (positive = viral, negative = underperforming)
    let outlier_type: 'positive' | 'negative' | null = null;
    if (is_outlier) {
      const sum_score =
        (view_z_scores[index] ?? 0) +
        (like_z_scores[index] ?? 0) +
        (comment_z_scores[index] ?? 0) +
        (vph_z_scores[index] ?? 0);
      outlier_type = sum_score > 0 ? 'positive' : 'negative';
    }

    // Calculate percentile rank
    const percentile = calculate_percentile(view_counts[index] || 0, view_counts);

    return {
      video_id: video.video_id,
      zScore: avg_z_score,
      madScore: avg_mad_score,
      combinedScore: combined_score,
      isOutlier: is_outlier,
      outlierType: outlier_type,
      metrics: {
        view_count: view_counts[index] || 0,
        like_count: like_counts[index] || 0,
        comment_count: comment_counts[index] || 0,
        vph: vph_values[index] || 0,
      },
      percentile: Math.round(percentile),
      timestamp: new Date().toISOString(),
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
  limit = 10
): OutlierDetectionResult[] {
  let filtered = results.filter((r) => r.isOutlier);

  if (type !== 'all') {
    filtered = filtered.filter((r) => r.outlierType === type);
  }

  // Sort by combined score (descending)
  return filtered
    .sort((a, b) => {
      const score_a = typeof a.combinedScore === 'number' ? a.combinedScore : 0;
      const score_b = typeof b.combinedScore === 'number' ? b.combinedScore : 0;
      return score_b - score_a;
    })
    .slice(0, limit);
}

/**
 * Analyze outlier trends over time
 */
export function analyzeOutlierTrends(
  historical_results: OutlierDetectionResult[][],
  video_id: string
): {
  consistentlyOutlier: boolean;
  outlierFrequency: number;
  trend: 'improving' | 'declining' | 'stable';
  avgScore: number;
} {
  const video_results = historical_results
    .map((batch) => batch.find((r) => r.video_id === video_id))
    .filter(Boolean) as OutlierDetectionResult[];

  if (video_results.length === 0) {
    return {
      consistentlyOutlier: false,
      outlierFrequency: 0,
      trend: 'stable',
      avgScore: 0,
    };
  }

  const outlier_count = video_results.filter((r) => r.isOutlier).length;
  const outlier_frequency = outlier_count / video_results.length;
  const avg_score =
    video_results.reduce((sum, r) => {
      const score = typeof r.combinedScore === 'number' ? r.combinedScore : 0;
      return sum + score;
    }, 0) / video_results.length;

  // Determine trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (video_results.length >= 3) {
    const recent_scores = video_results
      .slice(-3)
      .map((r) => (typeof r.combinedScore === 'number' ? r.combinedScore : 0));
    const early_scores = video_results
      .slice(0, 3)
      .map((r) => (typeof r.combinedScore === 'number' ? r.combinedScore : 0));
    const recent_avg = recent_scores.reduce((a, b) => a + b, 0) / recent_scores.length;
    const early_avg = early_scores.reduce((a, b) => a + b, 0) / early_scores.length;

    if (recent_avg > early_avg * 1.2) {
      trend = 'improving';
    } else if (recent_avg < early_avg * 0.8) {
      trend = 'declining';
    }
  }

  return {
    consistentlyOutlier: outlier_frequency > 0.7,
    outlierFrequency: outlier_frequency,
    trend,
    avgScore: avg_score,
  };
}

/**
 * Generate outlier report
 */
export function generateOutlierReport(results: OutlierDetectionResult[]): {
  totalVideos: number;
  totalOutliers: number;
  positiveOutliers: number;
  negativeOutliers: number;
  outlierRate: number;
  topPerformers: OutlierDetectionResult[];
  underperformers: OutlierDetectionResult[];
  statistics: {
    avgZScore: number;
    avgMadScore: number;
    percentileDistribution: {
      top_10: number;
      top_25: number;
      bottom_25: number;
      bottom_10: number;
    };
  };
} {
  const outliers = results.filter((r) => r.isOutlier);
  const positive_outliers = outliers.filter((r) => r.outlierType === 'positive');
  const negative_outliers = outliers.filter((r) => r.outlierType === 'negative');

  const avg_z_score =
    results.reduce((sum, r) => {
      const score = typeof r.zScore === 'number' ? r.zScore : 0;
      return sum + score;
    }, 0) / results.length;
  const avg_mad_score =
    results.reduce((sum, r) => {
      const score = typeof r.madScore === 'number' ? r.madScore : 0;
      return sum + score;
    }, 0) / results.length;

  return {
    totalVideos: results.length,
    totalOutliers: outliers.length,
    positiveOutliers: positive_outliers.length,
    negativeOutliers: negative_outliers.length,
    outlierRate: outliers.length / results.length,
    topPerformers: findTopOutliers(results, 'positive', 5),
    underperformers: findTopOutliers(results, 'negative', 5),
    statistics: {
      avgZScore: avg_z_score,
      avgMadScore: avg_mad_score,
      percentileDistribution: {
        top_10: results.filter((r) => typeof r.percentile === 'number' && r.percentile >= 90)
          .length,
        top_25: results.filter((r) => typeof r.percentile === 'number' && r.percentile >= 75)
          .length,
        bottom_25: results.filter((r) => typeof r.percentile === 'number' && r.percentile <= 25)
          .length,
        bottom_10: results.filter((r) => typeof r.percentile === 'number' && r.percentile <= 10)
          .length,
      },
    },
  };
}

const outlierAnalysis = {
  detectOutliers,
  findTopOutliers,
  analyzeOutlierTrends,
  generateOutlierReport,
};

export default outlierAnalysis;
