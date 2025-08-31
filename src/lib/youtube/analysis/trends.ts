/**
 * YouTube Lens - Trend Analysis System
 * Phase 4: Advanced Analytics
 *
 * Analyzes trends, patterns, and viral trajectories in YouTube content
 */

import type { YouTubeVideo as Video, YouTubeVideoStats as VideoStats } from '@/types';

/**
 * Time series data point
 */
interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  video_id?: string;
}

/**
 * Trend detection result
 */
interface TrendDetectionResult {
  trendType: 'rising' | 'falling' | 'stable' | 'viral' | 'dying';
  slope: number;
  acceleration: number;
  confidence: number;
  prediction: {
    nextValue: number;
    confidenceInterval: [number, number];
  };
}

/**
 * Pattern types in video metrics
 */
interface PatternAnalysis {
  patternType: 'seasonal' | 'cyclical' | 'irregular' | 'trend';
  strength: number;
  period?: number; // in hours or days
  description: string;
}

/**
 * Calculate moving average
 */
function moving_average(data: number[], window: number): number[] {
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(data[i] ?? 0);
    } else {
      const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / window);
    }
  }

  return result;
}

/**
 * Calculate linear regression (slope and intercept)
 */
function linear_regression(data: TimeSeriesPoint[]): {
  slope: number;
  intercept: number;
  r2: number;
} {
  const n = data.length;
  if (n === 0) {
    return { slope: 0, intercept: 0, r2: 0 };
  }

  // Convert timestamps to numeric values (hours from first point)
  const first_time = data[0]?.timestamp.getTime() ?? 0;
  const x = data.map((d) => (d.timestamp.getTime() - first_time) / (1000 * 60 * 60)); // hours
  const y = data.map((d) => d.value);

  const sum_x = x.reduce((a, b) => a + b, 0);
  const sum_y = y.reduce((a, b) => a + b, 0);
  const sum_xy = x.reduce((sum, xi, i) => sum + xi * (y[i] ?? 0), 0);
  const sum_x2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x);
  const intercept = (sum_y - slope * sum_x) / n;

  // Calculate R-squared
  const mean_y = sum_y / n;
  const ss_total = y.reduce((sum, yi) => sum + (yi - mean_y) ** 2, 0);
  const ss_residual = y.reduce((sum, yi, i) => {
    const predicted = slope * (x[i] ?? 0) + intercept;
    return sum + (yi - predicted) ** 2;
  }, 0);

  const r2 = 1 - ss_residual / ss_total;

  return { slope, intercept, r2 };
}

/**
 * Detect trend in time series data
 */
export function detectTrend(data: TimeSeriesPoint[]): TrendDetectionResult {
  if (data.length < 3) {
    return {
      trendType: 'stable',
      slope: 0,
      acceleration: 0,
      confidence: 0,
      prediction: { nextValue: 0, confidenceInterval: [0, 0] },
    };
  }

  // Calculate linear regression for overall trend
  const regression = linear_regression(data);

  // Calculate acceleration (second derivative)
  const mid_point = Math.floor(data.length / 2);
  const first_half = data.slice(0, mid_point);
  const second_half = data.slice(mid_point);

  const first_regression = linear_regression(first_half);
  const second_regression = linear_regression(second_half);
  const acceleration = second_regression.slope - first_regression.slope;

  // Determine trend type
  let trend_type: TrendDetectionResult['trendType'] = 'stable';

  if (Math.abs(regression.slope) < 0.01) {
    trend_type = 'stable';
  } else if (regression.slope > 0) {
    if (acceleration > 0.1) {
      trend_type = 'viral'; // Accelerating growth
    } else {
      trend_type = 'rising';
    }
  } else if (acceleration < -0.1) {
    trend_type = 'dying'; // Accelerating decline
  } else {
    trend_type = 'falling';
  }

  // Predict next value
  const last_time = data[data.length - 1]?.timestamp.getTime() ?? 0;
  const first_time = data[0]?.timestamp.getTime() ?? 0;
  const next_time = (last_time + 24 * 60 * 60 * 1000 - first_time) / (1000 * 60 * 60);
  const next_value = regression.slope * next_time + regression.intercept;

  // Calculate confidence interval based on standard error
  const predictions = data.map((d, _i) => {
    const x = (d.timestamp.getTime() - first_time) / (1000 * 60 * 60);
    return regression.slope * x + regression.intercept;
  });

  const residuals = data.map((d, i) => d.value - (predictions[i] ?? 0));
  const standard_error = Math.sqrt(
    residuals.reduce((sum, r) => sum + r * r, 0) / (data.length - 2)
  );

  const confidence_interval: [number, number] = [
    next_value - 1.96 * standard_error,
    next_value + 1.96 * standard_error,
  ];

  return {
    trendType: trend_type,
    slope: regression.slope,
    acceleration,
    confidence: Math.min(Math.abs(regression.r2), 0.99),
    prediction: {
      nextValue: Math.max(0, next_value),
      confidenceInterval: [
        Math.max(0, confidence_interval[0]),
        Math.max(0, confidence_interval[1]),
      ],
    },
  };
}

/**
 * Analyze patterns in video performance
 */
export function analyzePatterns(
  stats: VideoStats[],
  metric: 'view_count' | 'like_count' | 'comment_count' = 'view_count'
): PatternAnalysis[] {
  const patterns: PatternAnalysis[] = [];

  if (stats.length < 7) {
    return patterns;
  }

  const values = stats.map((s) => s[metric] || 0);

  // Check for daily patterns (24-hour cycle)
  const hourly_data = stats.map((s) => ({
    hour: new Date(s.created_at || 0).getHours(),
    value: s[metric] || 0,
  }));

  const hourly_averages = new Map<number, number[]>();
  hourly_data.forEach((d) => {
    if (!hourly_averages.has(d.hour)) {
      hourly_averages.set(d.hour, []);
    }
    hourly_averages.get(d.hour)?.push(d.value);
  });

  // Calculate variance in hourly patterns
  const hourly_variance = Array.from(hourly_averages.values()).map((values) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  });

  const avg_variance = hourly_variance.reduce((a, b) => a + b, 0) / hourly_variance.length;

  // Detect seasonal pattern (daily cycle)
  if (avg_variance > 100) {
    patterns.push({
      patternType: 'seasonal',
      strength: Math.min(avg_variance / 1000, 1),
      period: 24, // hours
      description: 'Daily viewing pattern detected with peak hours',
    });
  }

  // Detect trend pattern
  const time_series: TimeSeriesPoint[] = stats.map((s) => ({
    timestamp: new Date(s.created_at || 0),
    value: s[metric] || 0,
  }));

  const trend = detectTrend(time_series);
  if (Math.abs(trend.slope) > 0.01) {
    patterns.push({
      patternType: 'trend',
      strength: Math.abs(trend.confidence),
      description: `${trend.trendType} trend with ${trend.slope > 0 ? 'increasing' : 'decreasing'} ${metric}`,
    });
  }

  // Detect irregular patterns (spikes and drops)
  const ma = moving_average(values, Math.min(5, Math.floor(values.length / 3)));
  const deviations = values.map((v, i) => {
    const ma_value = ma[i] ?? 1; // Avoid division by zero
    return Math.abs((v || 0) - ma_value) / ma_value;
  });
  const avg_deviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;

  if (avg_deviation > 0.3) {
    patterns.push({
      patternType: 'irregular',
      strength: Math.min(avg_deviation, 1),
      description: 'High volatility with significant spikes or drops',
    });
  }

  return patterns;
}

/**
 * Find viral moments (sudden growth spikes)
 */
export function findViralMoments(
  stats: VideoStats[],
  threshold = 2 // Multiple of average growth
): Array<{
  timestamp: string;
  growthRate: number;
  metrics: {
    views: number;
    likes: number;
    comments: number;
  };
  durationHours: number;
}> {
  if (stats.length < 2) {
    return [];
  }

  const viral_moments = [];

  // Calculate hourly growth rates
  for (let i = 1; i < stats.length; i++) {
    const prev = stats[i - 1];
    const curr = stats[i];

    if (!prev || !curr) {
      continue;
    }

    const time_diff =
      (new Date(curr.created_at || 0).getTime() - new Date(prev.created_at || 0).getTime()) /
      (1000 * 60 * 60); // hours

    if (time_diff === 0) {
      continue;
    }

    const view_growth = ((curr.view_count || 0) - (prev.view_count || 0)) / time_diff;
    const avg_growth =
      stats.reduce((sum, s, idx) => {
        if (idx === 0) {
          return sum;
        }
        const p = stats[idx - 1];
        if (!p) {
          return sum;
        }
        const td =
          (new Date(s.created_at || 0).getTime() - new Date(p.created_at || 0).getTime()) /
          (1000 * 60 * 60);
        return sum + (td > 0 ? ((s.view_count || 0) - (p.view_count || 0)) / td : 0);
      }, 0) /
      (stats.length - 1);

    // Check if this is a viral moment
    if (view_growth > avg_growth * threshold) {
      // Find duration of viral period
      let duration = time_diff;
      let j = i + 1;
      while (j < stats.length) {
        const current_stat = stats[j];
        const prev_stat = stats[j - 1];

        if (!current_stat || !prev_stat) {
          break;
        }

        const next_growth =
          ((current_stat.view_count || 0) - (prev_stat.view_count || 0)) /
          ((new Date(current_stat.created_at || 0).getTime() -
            new Date(prev_stat.created_at || 0).getTime()) /
            (1000 * 60 * 60));

        if (next_growth < avg_growth * threshold) {
          break;
        }

        duration +=
          (new Date(current_stat.created_at || 0).getTime() -
            new Date(prev_stat.created_at || 0).getTime()) /
          (1000 * 60 * 60);
        j++;
      }

      viral_moments.push({
        timestamp: curr.created_at || '',
        growthRate: view_growth,
        metrics: {
          views: curr.view_count || 0,
          likes: curr.like_count || 0,
          comments: curr.comment_count || 0,
        },
        durationHours: duration,
      });

      i = j - 1; // Skip already processed viral period
    }
  }

  return viral_moments;
}

/**
 * Compare video performance against category benchmarks
 */
export function compareToBenchmark(
  video_stats: VideoStats,
  category_benchmarks: {
    avgViews: number;
    avgLikes: number;
    avgComments: number;
    avgVph: number;
    percentiles: {
      p25: number;
      p50: number;
      p75: number;
      p90: number;
      p95: number;
    };
  }
): {
  performanceIndex: number; // 0-100 score
  metricsComparison: {
    views: { ratio: number; percentile: number };
    likes: { ratio: number; percentile: number };
    comments: { ratio: number; percentile: number };
    vph: { ratio: number; percentile: number };
  };
  categoryRank: 'top_5' | 'top_10' | 'top_25' | 'above_average' | 'below_average';
} {
  // Calculate ratios
  const view_ratio = (video_stats.view_count || 0) / category_benchmarks.avgViews;
  const like_ratio = (video_stats.like_count || 0) / category_benchmarks.avgLikes;
  const comment_ratio = (video_stats.comment_count || 0) / category_benchmarks.avgComments;
  const vph_ratio = (video_stats.views_per_hour || 0) / category_benchmarks.avgVph;

  // Calculate percentiles
  function get_percentile(
    value: number,
    benchmarks: typeof category_benchmarks.percentiles
  ): number {
    if (value >= benchmarks.p95) {
      return 95;
    }
    if (value >= benchmarks.p90) {
      return 90;
    }
    if (value >= benchmarks.p75) {
      return 75;
    }
    if (value >= benchmarks.p50) {
      return 50;
    }
    if (value >= benchmarks.p25) {
      return 25;
    }
    return 10;
  }

  const view_percentile = get_percentile(
    video_stats.view_count || 0,
    category_benchmarks.percentiles
  );

  // Calculate performance index (0-100)
  const performance_index = Math.min(
    100,
    view_ratio * 25 + like_ratio * 25 + comment_ratio * 25 + vph_ratio * 25
  );

  // Determine category rank
  let category_rank: 'top_5' | 'top_10' | 'top_25' | 'above_average' | 'below_average';
  if (view_percentile >= 95) {
    category_rank = 'top_5';
  } else if (view_percentile >= 90) {
    category_rank = 'top_10';
  } else if (view_percentile >= 75) {
    category_rank = 'top_25';
  } else if (view_percentile >= 50) {
    category_rank = 'above_average';
  } else {
    category_rank = 'below_average';
  }

  return {
    performanceIndex: Math.round(performance_index),
    metricsComparison: {
      views: { ratio: view_ratio, percentile: view_percentile },
      likes: { ratio: like_ratio, percentile: view_percentile }, // Using same percentile for simplicity
      comments: { ratio: comment_ratio, percentile: view_percentile },
      vph: { ratio: vph_ratio, percentile: view_percentile },
    },
    categoryRank: category_rank,
  };
}

/**
 * Generate trend analysis report
 */
export function generateTrendReport(
  videos: Array<Video & { stats?: VideoStats[] }>,
  time_window_days = 7
): {
  overallTrend: TrendDetectionResult;
  viralVideos: Array<{ video_id: string; viralMoments: ReturnType<typeof findViralMoments> }>;
  patternSummary: Record<string, number>;
  growthLeaders: Array<{ video_id: string; growthRate: number }>;
  decliningVideos: Array<{ video_id: string; declineRate: number }>;
} {
  const now = new Date();
  const window_start = new Date(now.getTime() - time_window_days * 24 * 60 * 60 * 1000);

  // Aggregate all stats for overall trend
  const all_stats: TimeSeriesPoint[] = [];
  videos.forEach((video) => {
    if (video.stats) {
      video.stats.forEach((stat) => {
        if (new Date(stat.created_at || 0) >= window_start) {
          all_stats.push({
            timestamp: new Date(stat.created_at || 0),
            value: stat.view_count || 0,
            video_id: video.id,
          });
        }
      });
    }
  });

  // Sort by timestamp
  all_stats.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Detect overall trend
  const overall_trend = detectTrend(all_stats);

  // Find viral videos
  const viral_videos = videos
    .filter((v) => v.stats && v.stats.length > 0)
    .map((video) => ({
      video_id: video.id,
      viralMoments: findViralMoments(video.stats!),
    }))
    .filter((v) => v.viralMoments.length > 0);

  // Analyze patterns
  const pattern_counts: Record<string, number> = {
    seasonal: 0,
    cyclical: 0,
    irregular: 0,
    trend: 0,
  };

  videos.forEach((video) => {
    if (video.stats && video.stats.length >= 7) {
      const patterns = analyzePatterns(video.stats);
      patterns.forEach((p) => {
        pattern_counts[p.patternType] = (pattern_counts[p.patternType] ?? 0) + 1;
      });
    }
  });

  // Find growth leaders and declining videos
  const video_trends = videos
    .filter((v) => v.stats && v.stats.length >= 2)
    .map((video) => {
      const stats = video.stats;
      if (!stats) {
        return {
          video_id: video.id,
          slope: 0,
        };
      }
      const time_series: TimeSeriesPoint[] = stats.map((s) => ({
        timestamp: new Date(s.created_at || 0),
        value: s.view_count || 0,
      }));
      const trend = detectTrend(time_series);
      return {
        video_id: video.id,
        slope: trend.slope,
      };
    });

  const growth_leaders = video_trends
    .filter((v) => v.slope > 0)
    .sort((a, b) => b.slope - a.slope)
    .slice(0, 5)
    .map((v) => ({ video_id: v.video_id, growthRate: v.slope }));

  const declining_videos = video_trends
    .filter((v) => v.slope < 0)
    .sort((a, b) => a.slope - b.slope)
    .slice(0, 5)
    .map((v) => ({ video_id: v.video_id, declineRate: Math.abs(v.slope) }));

  return {
    overallTrend: overall_trend,
    viralVideos: viral_videos,
    patternSummary: pattern_counts,
    growthLeaders: growth_leaders,
    decliningVideos: declining_videos,
  };
}

const trendsAnalysis = {
  detectTrend,
  analyzePatterns,
  findViralMoments,
  compareToBenchmark,
  generateTrendReport,
};

export default trendsAnalysis;
