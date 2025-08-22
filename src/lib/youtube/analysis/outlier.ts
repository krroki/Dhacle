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
function calculateMAD(values: number[]): number {
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
function calculateZScores(values: number[]): number[] {
  if (values.length === 0) {
    return [];
  }

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return values.map(() => 0);
  }

  return values.map((v) => (v - mean) / stdDev);
}

/**
 * Calculate modified z-score using MAD
 * This is more robust to outliers than standard z-score
 */
function calculateModifiedZScores(values: number[], __madMultiplier = 2.5): number[] {
  if (values.length === 0) {
    return [];
  }

  const med = median(values);
  const mad = calculateMAD(values);

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
function calculatePercentile(value: number, values: number[]): number {
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
  const viewCounts = videos.map((v) => {
    const stats = Array.isArray(v.stats) ? v.stats[0] : v.stats;
    return stats?.view_count || 0;
  });
  const likeCounts = videos.map((v) => {
    const stats = Array.isArray(v.stats) ? v.stats[0] : v.stats;
    return stats?.like_count || 0;
  });
  const commentCounts = videos.map((v) => {
    const stats = Array.isArray(v.stats) ? v.stats[0] : v.stats;
    return stats?.comment_count || 0;
  });
  const vphValues = videos.map((v) => {
    const stats = Array.isArray(v.stats) ? v.stats[0] : v.stats;
    if (!stats) return 0;
    
    // Handle both DB and mapped stats types
    if ('viewsPerHour' in stats) {
      return stats.viewsPerHour || 0;
    }
    
    // For DB stats, calculate VPH if we have the data
    const viewCount = 'view_count' in stats ? stats.view_count : 0;
    if (!viewCount || typeof viewCount !== 'number') return 0;
    
    // Simple approximation: views per hour based on age
    const publishedAt = v.published_at;
    if (publishedAt) {
      const ageInHours = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60);
      return ageInHours > 0 ? viewCount / ageInHours : 0;
    }
    
    return 0;
  });

  // Calculate z-scores and MAD scores
  const viewZScores = calculateZScores(viewCounts);
  const madMultiplier = typeof cfg.madMultiplier === 'number' ? cfg.madMultiplier : 2.5;
  const viewMADScores = calculateModifiedZScores(viewCounts, madMultiplier);

  const likeZScores = calculateZScores(likeCounts);
  const likeMADScores = calculateModifiedZScores(likeCounts, madMultiplier);

  const commentZScores = calculateZScores(commentCounts);
  const commentMADScores = calculateModifiedZScores(commentCounts, madMultiplier);

  const vphZScores = calculateZScores(vphValues);
  const vphMADScores = calculateModifiedZScores(vphValues, madMultiplier);

  // Analyze each video for outliers
  const results: OutlierDetectionResult[] = videos.map((video, index) => {
    // Calculate combined scores (average of all metrics)
    const avgZScore =
      (Math.abs(viewZScores[index] || 0) +
        Math.abs(likeZScores[index] || 0) +
        Math.abs(commentZScores[index] || 0) +
        Math.abs(vphZScores[index] || 0)) /
      4;

    const avgMADScore =
      (Math.abs(viewMADScores[index] || 0) +
        Math.abs(likeMADScores[index] || 0) +
        Math.abs(commentMADScores[index] || 0) +
        Math.abs(vphMADScores[index] || 0)) /
      4;

    // Combined score: weighted average of z-score and MAD score
    const combinedScore = avgZScore * 0.4 + avgMADScore * 0.6;

    // Determine if it's an outlier
    const threshold = typeof cfg.outlierThreshold === 'number' ? cfg.outlierThreshold : 2.5;
    const isOutlier = combinedScore > threshold;

    // Determine outlier type (positive = viral, negative = underperforming)
    let outlierType: 'positive' | 'negative' | null = null;
    if (isOutlier) {
      const sumScore =
        (viewZScores[index] ?? 0) +
        (likeZScores[index] ?? 0) +
        (commentZScores[index] ?? 0) +
        (vphZScores[index] ?? 0);
      outlierType = sumScore > 0 ? 'positive' : 'negative';
    }

    // Calculate percentile rank
    const percentile = calculatePercentile(viewCounts[index] || 0, viewCounts);

    return {
      video_id: video.video_id,
      zScore: avgZScore,
      madScore: avgMADScore,
      combinedScore: combinedScore,
      isOutlier: isOutlier,
      outlierType: outlierType,
      metrics: {
        view_count: viewCounts[index] || 0,
        like_count: likeCounts[index] || 0,
        comment_count: commentCounts[index] || 0,
        vph: vphValues[index] || 0,
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
  return filtered.sort((a, b) => {
    const scoreA = typeof a.combinedScore === 'number' ? a.combinedScore : 0;
    const scoreB = typeof b.combinedScore === 'number' ? b.combinedScore : 0;
    return scoreB - scoreA;
  }).slice(0, limit);
}

/**
 * Analyze outlier trends over time
 */
export function analyzeOutlierTrends(
  historicalResults: OutlierDetectionResult[][],
  video_id: string
): {
  consistentlyOutlier: boolean;
  outlierFrequency: number;
  trend: 'improving' | 'declining' | 'stable';
  avgScore: number;
} {
  const videoResults = historicalResults
    .map((batch) => batch.find((r) => r.video_id === video_id))
    .filter(Boolean) as OutlierDetectionResult[];

  if (videoResults.length === 0) {
    return {
      consistentlyOutlier: false,
      outlierFrequency: 0,
      trend: 'stable',
      avgScore: 0,
    };
  }

  const outlierCount = videoResults.filter((r) => r.isOutlier).length;
  const outlierFrequency = outlierCount / videoResults.length;
  const avgScore = videoResults.reduce((sum, r) => {
    const score = typeof r.combinedScore === 'number' ? r.combinedScore : 0;
    return sum + score;
  }, 0) / videoResults.length;

  // Determine trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (videoResults.length >= 3) {
    const recentScores = videoResults.slice(-3).map((r) => 
      typeof r.combinedScore === 'number' ? r.combinedScore : 0
    );
    const earlyScores = videoResults.slice(0, 3).map((r) => 
      typeof r.combinedScore === 'number' ? r.combinedScore : 0
    );
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const earlyAvg = earlyScores.reduce((a, b) => a + b, 0) / earlyScores.length;

    if (recentAvg > earlyAvg * 1.2) {
      trend = 'improving';
    } else if (recentAvg < earlyAvg * 0.8) {
      trend = 'declining';
    }
  }

  return {
    consistentlyOutlier: outlierFrequency > 0.7,
    outlierFrequency: outlierFrequency,
    trend,
    avgScore: avgScore,
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
  const positiveOutliers = outliers.filter((r) => r.outlierType === 'positive');
  const negativeOutliers = outliers.filter((r) => r.outlierType === 'negative');

  const avgZScore = results.reduce((sum, r) => {
    const score = typeof r.zScore === 'number' ? r.zScore : 0;
    return sum + score;
  }, 0) / results.length;
  const avgMADScore = results.reduce((sum, r) => {
    const score = typeof r.madScore === 'number' ? r.madScore : 0;
    return sum + score;
  }, 0) / results.length;

  return {
    totalVideos: results.length,
    totalOutliers: outliers.length,
    positiveOutliers: positiveOutliers.length,
    negativeOutliers: negativeOutliers.length,
    outlierRate: outliers.length / results.length,
    topPerformers: findTopOutliers(results, 'positive', 5),
    underperformers: findTopOutliers(results, 'negative', 5),
    statistics: {
      avgZScore: avgZScore,
      avgMadScore: avgMADScore,
      percentileDistribution: {
        top_10: results.filter((r) => typeof r.percentile === 'number' && r.percentile >= 90).length,
        top_25: results.filter((r) => typeof r.percentile === 'number' && r.percentile >= 75).length,
        bottom_25: results.filter((r) => typeof r.percentile === 'number' && r.percentile <= 25).length,
        bottom_10: results.filter((r) => typeof r.percentile === 'number' && r.percentile <= 10).length,
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
