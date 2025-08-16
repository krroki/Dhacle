/**
 * YouTube Lens - Trend Analysis System
 * Phase 4: Advanced Analytics
 * 
 * Analyzes trends, patterns, and viral trajectories in YouTube content
 */

import type { 
  Video,
  VideoStats,
  TrendAnalysis
} from '@/types/youtube-lens';

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
  trend_type: 'rising' | 'falling' | 'stable' | 'viral' | 'dying';
  slope: number;
  acceleration: number;
  confidence: number;
  prediction: {
    next_value: number;
    confidence_interval: [number, number];
  };
}

/**
 * Pattern types in video metrics
 */
interface PatternAnalysis {
  pattern_type: 'seasonal' | 'cyclical' | 'irregular' | 'trend';
  strength: number;
  period?: number; // in hours or days
  description: string;
}

/**
 * Calculate moving average
 */
function movingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(data[i]);
    } else {
      const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / window);
    }
  }
  
  return result;
}

/**
 * Calculate exponential moving average (EMA)
 */
function exponentialMovingAverage(data: number[], period: number): number[] {
  const multiplier = 2 / (period + 1);
  const ema: number[] = [data[0]];
  
  for (let i = 1; i < data.length; i++) {
    const value = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
    ema.push(value);
  }
  
  return ema;
}

/**
 * Calculate linear regression (slope and intercept)
 */
function linearRegression(data: TimeSeriesPoint[]): {
  slope: number;
  intercept: number;
  r2: number;
} {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0 };
  
  // Convert timestamps to numeric values (hours from first point)
  const firstTime = data[0].timestamp.getTime();
  const x = data.map(d => (d.timestamp.getTime() - firstTime) / (1000 * 60 * 60)); // hours
  const y = data.map(d => d.value);
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared
  const meanY = sumY / n;
  const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
  const ssResidual = y.reduce((sum, yi, i) => {
    const predicted = slope * x[i] + intercept;
    return sum + Math.pow(yi - predicted, 2);
  }, 0);
  
  const r2 = 1 - (ssResidual / ssTotal);
  
  return { slope, intercept, r2 };
}

/**
 * Detect trend in time series data
 */
export function detectTrend(data: TimeSeriesPoint[]): TrendDetectionResult {
  if (data.length < 3) {
    return {
      trend_type: 'stable',
      slope: 0,
      acceleration: 0,
      confidence: 0,
      prediction: { next_value: 0, confidence_interval: [0, 0] }
    };
  }
  
  // Calculate linear regression for overall trend
  const regression = linearRegression(data);
  
  // Calculate acceleration (second derivative)
  const midPoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midPoint);
  const secondHalf = data.slice(midPoint);
  
  const firstRegression = linearRegression(firstHalf);
  const secondRegression = linearRegression(secondHalf);
  const acceleration = secondRegression.slope - firstRegression.slope;
  
  // Determine trend type
  let trendType: TrendDetectionResult['trend_type'] = 'stable';
  
  if (Math.abs(regression.slope) < 0.01) {
    trendType = 'stable';
  } else if (regression.slope > 0) {
    if (acceleration > 0.1) {
      trendType = 'viral'; // Accelerating growth
    } else {
      trendType = 'rising';
    }
  } else {
    if (acceleration < -0.1) {
      trendType = 'dying'; // Accelerating decline
    } else {
      trendType = 'falling';
    }
  }
  
  // Predict next value
  const lastTime = data[data.length - 1].timestamp.getTime();
  const nextTime = (lastTime + 24 * 60 * 60 * 1000 - data[0].timestamp.getTime()) / (1000 * 60 * 60);
  const nextValue = regression.slope * nextTime + regression.intercept;
  
  // Calculate confidence interval based on standard error
  const predictions = data.map((d, i) => {
    const x = (d.timestamp.getTime() - data[0].timestamp.getTime()) / (1000 * 60 * 60);
    return regression.slope * x + regression.intercept;
  });
  
  const residuals = data.map((d, i) => d.value - predictions[i]);
  const standardError = Math.sqrt(
    residuals.reduce((sum, r) => sum + r * r, 0) / (data.length - 2)
  );
  
  const confidenceInterval: [number, number] = [
    nextValue - 1.96 * standardError,
    nextValue + 1.96 * standardError
  ];
  
  return {
    trend_type: trendType,
    slope: regression.slope,
    acceleration,
    confidence: Math.min(Math.abs(regression.r2), 0.99),
    prediction: {
      next_value: Math.max(0, nextValue),
      confidence_interval: [
        Math.max(0, confidenceInterval[0]),
        Math.max(0, confidenceInterval[1])
      ]
    }
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
  
  const values = stats.map(s => s[metric]);
  
  // Check for daily patterns (24-hour cycle)
  const hourlyData = stats.map(s => ({
    hour: new Date(s.snapshot_at).getHours(),
    value: s[metric]
  }));
  
  const hourlyAverages = new Map<number, number[]>();
  hourlyData.forEach(d => {
    if (!hourlyAverages.has(d.hour)) {
      hourlyAverages.set(d.hour, []);
    }
    hourlyAverages.get(d.hour)!.push(d.value);
  });
  
  // Calculate variance in hourly patterns
  const hourlyVariance = Array.from(hourlyAverages.values()).map(values => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  });
  
  const avgVariance = hourlyVariance.reduce((a, b) => a + b, 0) / hourlyVariance.length;
  
  // Detect seasonal pattern (daily cycle)
  if (avgVariance > 100) {
    patterns.push({
      pattern_type: 'seasonal',
      strength: Math.min(avgVariance / 1000, 1),
      period: 24, // hours
      description: 'Daily viewing pattern detected with peak hours'
    });
  }
  
  // Detect trend pattern
  const timeSeries: TimeSeriesPoint[] = stats.map(s => ({
    timestamp: new Date(s.snapshot_at),
    value: s[metric]
  }));
  
  const trend = detectTrend(timeSeries);
  if (Math.abs(trend.slope) > 0.01) {
    patterns.push({
      pattern_type: 'trend',
      strength: Math.abs(trend.confidence),
      description: `${trend.trend_type} trend with ${trend.slope > 0 ? 'increasing' : 'decreasing'} ${metric}`
    });
  }
  
  // Detect irregular patterns (spikes and drops)
  const ma = movingAverage(values, Math.min(5, Math.floor(values.length / 3)));
  const deviations = values.map((v, i) => Math.abs(v - ma[i]) / ma[i]);
  const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
  
  if (avgDeviation > 0.3) {
    patterns.push({
      pattern_type: 'irregular',
      strength: Math.min(avgDeviation, 1),
      description: 'High volatility with significant spikes or drops'
    });
  }
  
  return patterns;
}

/**
 * Find viral moments (sudden growth spikes)
 */
export function findViralMoments(
  stats: VideoStats[],
  threshold: number = 2 // Multiple of average growth
): Array<{
  timestamp: string;
  growth_rate: number;
  metrics: {
    views: number;
    likes: number;
    comments: number;
  };
  duration_hours: number;
}> {
  if (stats.length < 2) return [];
  
  const viralMoments = [];
  
  // Calculate hourly growth rates
  for (let i = 1; i < stats.length; i++) {
    const prev = stats[i - 1];
    const curr = stats[i];
    
    const timeDiff = (new Date(curr.snapshot_at).getTime() - 
                     new Date(prev.snapshot_at).getTime()) / (1000 * 60 * 60); // hours
    
    if (timeDiff === 0) continue;
    
    const viewGrowth = (curr.view_count - prev.view_count) / timeDiff;
    const avgGrowth = stats.reduce((sum, s, idx) => {
      if (idx === 0) return sum;
      const p = stats[idx - 1];
      const td = (new Date(s.snapshot_at).getTime() - 
                 new Date(p.snapshot_at).getTime()) / (1000 * 60 * 60);
      return sum + (td > 0 ? (s.view_count - p.view_count) / td : 0);
    }, 0) / (stats.length - 1);
    
    // Check if this is a viral moment
    if (viewGrowth > avgGrowth * threshold) {
      // Find duration of viral period
      let duration = timeDiff;
      let j = i + 1;
      while (j < stats.length) {
        const nextGrowth = (stats[j].view_count - stats[j - 1].view_count) / 
                          ((new Date(stats[j].snapshot_at).getTime() - 
                           new Date(stats[j - 1].snapshot_at).getTime()) / (1000 * 60 * 60));
        
        if (nextGrowth < avgGrowth * threshold) break;
        
        duration += (new Date(stats[j].snapshot_at).getTime() - 
                    new Date(stats[j - 1].snapshot_at).getTime()) / (1000 * 60 * 60);
        j++;
      }
      
      viralMoments.push({
        timestamp: curr.snapshot_at,
        growth_rate: viewGrowth,
        metrics: {
          views: curr.view_count,
          likes: curr.like_count,
          comments: curr.comment_count
        },
        duration_hours: duration
      });
      
      i = j - 1; // Skip already processed viral period
    }
  }
  
  return viralMoments;
}

/**
 * Compare video performance against category benchmarks
 */
export function compareToBenchmark(
  videoStats: VideoStats,
  categoryBenchmarks: {
    avg_views: number;
    avg_likes: number;
    avg_comments: number;
    avg_vph: number;
    percentiles: {
      p25: number;
      p50: number;
      p75: number;
      p90: number;
      p95: number;
    };
  }
): {
  performance_index: number; // 0-100 score
  metrics_comparison: {
    views: { ratio: number; percentile: number };
    likes: { ratio: number; percentile: number };
    comments: { ratio: number; percentile: number };
    vph: { ratio: number; percentile: number };
  };
  category_rank: 'top_5' | 'top_10' | 'top_25' | 'above_average' | 'below_average';
} {
  // Calculate ratios
  const viewRatio = videoStats.view_count / categoryBenchmarks.avg_views;
  const likeRatio = videoStats.like_count / categoryBenchmarks.avg_likes;
  const commentRatio = videoStats.comment_count / categoryBenchmarks.avg_comments;
  const vphRatio = (videoStats.views_per_hour || 0) / categoryBenchmarks.avg_vph;
  
  // Calculate percentiles
  function getPercentile(value: number, benchmarks: typeof categoryBenchmarks.percentiles): number {
    if (value >= benchmarks.p95) return 95;
    if (value >= benchmarks.p90) return 90;
    if (value >= benchmarks.p75) return 75;
    if (value >= benchmarks.p50) return 50;
    if (value >= benchmarks.p25) return 25;
    return 10;
  }
  
  const viewPercentile = getPercentile(videoStats.view_count, categoryBenchmarks.percentiles);
  
  // Calculate performance index (0-100)
  const performanceIndex = Math.min(
    100,
    (viewRatio * 25 + likeRatio * 25 + commentRatio * 25 + vphRatio * 25)
  );
  
  // Determine category rank
  let categoryRank: 'top_5' | 'top_10' | 'top_25' | 'above_average' | 'below_average';
  if (viewPercentile >= 95) categoryRank = 'top_5';
  else if (viewPercentile >= 90) categoryRank = 'top_10';
  else if (viewPercentile >= 75) categoryRank = 'top_25';
  else if (viewPercentile >= 50) categoryRank = 'above_average';
  else categoryRank = 'below_average';
  
  return {
    performance_index: Math.round(performanceIndex),
    metrics_comparison: {
      views: { ratio: viewRatio, percentile: viewPercentile },
      likes: { ratio: likeRatio, percentile: viewPercentile }, // Using same percentile for simplicity
      comments: { ratio: commentRatio, percentile: viewPercentile },
      vph: { ratio: vphRatio, percentile: viewPercentile }
    },
    category_rank: categoryRank
  };
}

/**
 * Generate trend analysis report
 */
export function generateTrendReport(
  videos: Array<Video & { stats?: VideoStats[] }>,
  timeWindowDays: number = 7
): {
  overall_trend: TrendDetectionResult;
  viral_videos: Array<{ video_id: string; viral_moments: ReturnType<typeof findViralMoments> }>;
  pattern_summary: Record<string, number>;
  growth_leaders: Array<{ video_id: string; growth_rate: number }>;
  declining_videos: Array<{ video_id: string; decline_rate: number }>;
} {
  const now = new Date();
  const windowStart = new Date(now.getTime() - timeWindowDays * 24 * 60 * 60 * 1000);
  
  // Aggregate all stats for overall trend
  const allStats: TimeSeriesPoint[] = [];
  videos.forEach(video => {
    if (video.stats) {
      video.stats.forEach(stat => {
        if (new Date(stat.snapshot_at) >= windowStart) {
          allStats.push({
            timestamp: new Date(stat.snapshot_at),
            value: stat.view_count,
            video_id: video.video_id
          });
        }
      });
    }
  });
  
  // Sort by timestamp
  allStats.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  // Detect overall trend
  const overallTrend = detectTrend(allStats);
  
  // Find viral videos
  const viralVideos = videos
    .filter(v => v.stats && v.stats.length > 0)
    .map(video => ({
      video_id: video.video_id,
      viral_moments: findViralMoments(video.stats!)
    }))
    .filter(v => v.viral_moments.length > 0);
  
  // Analyze patterns
  const patternCounts: Record<string, number> = {
    seasonal: 0,
    cyclical: 0,
    irregular: 0,
    trend: 0
  };
  
  videos.forEach(video => {
    if (video.stats && video.stats.length >= 7) {
      const patterns = analyzePatterns(video.stats);
      patterns.forEach(p => {
        patternCounts[p.pattern_type]++;
      });
    }
  });
  
  // Find growth leaders and declining videos
  const videoTrends = videos
    .filter(v => v.stats && v.stats.length >= 2)
    .map(video => {
      const stats = video.stats!;
      const timeSeries: TimeSeriesPoint[] = stats.map(s => ({
        timestamp: new Date(s.snapshot_at),
        value: s.view_count
      }));
      const trend = detectTrend(timeSeries);
      return {
        video_id: video.video_id,
        slope: trend.slope
      };
    });
  
  const growthLeaders = videoTrends
    .filter(v => v.slope > 0)
    .sort((a, b) => b.slope - a.slope)
    .slice(0, 5)
    .map(v => ({ video_id: v.video_id, growth_rate: v.slope }));
  
  const decliningVideos = videoTrends
    .filter(v => v.slope < 0)
    .sort((a, b) => a.slope - b.slope)
    .slice(0, 5)
    .map(v => ({ video_id: v.video_id, decline_rate: Math.abs(v.slope) }));
  
  return {
    overall_trend: overallTrend,
    viral_videos: viralVideos,
    pattern_summary: patternCounts,
    growth_leaders: growthLeaders,
    declining_videos: decliningVideos
  };
}

const trendsAnalysis = {
  detectTrend,
  analyzePatterns,
  findViralMoments,
  compareToBenchmark,
  generateTrendReport
};

export default trendsAnalysis;