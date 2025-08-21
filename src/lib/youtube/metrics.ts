/**
 * YouTube Lens - Metrics Calculation Engine
 * Calculates VPH, engagement rates, viral scores, and other key metrics
 * Created: 2025-01-21
 */

import { supabase } from '@/lib/supabase/client';
import type {
  Channel,
  ChannelMetrics,
  Video,
  VideoMetrics,
  VideoStats,
  VideoWithStats,
  YouTubeVideo,
} from '@/types/youtube-lens';

/**
 * Calculate Views Per Hour (VPH) for a video
 */
export function calculateVPH(
  view_count: number,
  published_at: Date | string,
  currentTime: Date = new Date()
): number {
  const published = typeof published_at === 'string' ? new Date(published_at) : published_at;
  const hoursElapsed = (currentTime.getTime() - published.getTime()) / (1000 * 60 * 60);

  if (hoursElapsed <= 0) {
    return 0;
  }

  return view_count / hoursElapsed;
}

/**
 * Calculate engagement rate
 * Formula: (likes + comments) / views * 100
 */
export function calculateEngagementRate(
  view_count: number,
  like_count: number,
  comment_count: number
): number {
  if (view_count === 0) {
    return 0;
  }

  return ((like_count + comment_count) / view_count) * 100;
}

/**
 * Calculate viral score (0-100)
 * Custom algorithm based on multiple factors
 */
export function calculateViralScore(params: {
  view_count: number;
  like_count: number;
  comment_count: number;
  published_at: Date | string;
  channelSubscriberCount?: number;
}): number {
  const {
    view_count,
    like_count,
    comment_count,
    published_at,
    channelSubscriberCount = 10000, // Default assumption
  } = params;

  const now = new Date();
  const vph = calculateVPH(view_count, published_at, now);
  const engagementRate = calculateEngagementRate(view_count, like_count, comment_count);

  // Calculate hours elapsed
  const published = typeof published_at === 'string' ? new Date(published_at) : published_at;
  const hoursElapsed = (now.getTime() - published.getTime()) / (1000 * 60 * 60);

  // Scoring components
  let score = 0;

  // 1. Velocity Score (40% weight) - How fast it's growing
  const velocityScore = calculateVelocityScore(vph, hoursElapsed);
  score += velocityScore * 0.4;

  // 2. Engagement Score (30% weight) - How engaged viewers are
  const engagementScore = calculateEngagementScore(engagementRate);
  score += engagementScore * 0.3;

  // 3. Reach Score (20% weight) - Views relative to channel size
  const reachScore = calculateReachScore(view_count, channelSubscriberCount);
  score += reachScore * 0.2;

  // 4. Momentum Score (10% weight) - Recent performance
  const momentumScore = calculateMomentumScore(view_count, hoursElapsed);
  score += momentumScore * 0.1;

  // Apply multipliers for exceptional performance
  if (vph > 100000) {
    score *= 1.5; // Extremely viral
  }
  if (engagementRate > 15) {
    score *= 1.3; // Exceptional engagement
  }
  if (hoursElapsed < 6 && view_count > 100000) {
    score *= 1.4; // Instant viral
  }

  return Math.min(Math.round(score), 100);
}

/**
 * Calculate velocity score based on VPH and time
 */
function calculateVelocityScore(vph: number, hoursElapsed: number): number {
  // Normalize VPH (assume 10K VPH is excellent)
  let score = Math.min(vph / 10000, 1) * 100;

  // Boost for early velocity
  if (hoursElapsed < 24) {
    score *= 1.2;
  } else if (hoursElapsed < 72) {
    score *= 1.1;
  }

  return Math.min(score, 100);
}

/**
 * Calculate engagement score
 */
function calculateEngagementScore(engagementRate: number): number {
  // Assume 10% engagement is excellent
  return Math.min((engagementRate / 10) * 100, 100);
}

/**
 * Calculate reach score (views relative to channel size)
 */
function calculateReachScore(view_count: number, subscriber_count: number): number {
  if (subscriber_count === 0) {
    return 50; // Default for unknown
  }

  const ratio = view_count / subscriber_count;

  // If views exceed subscriber count, it's viral
  if (ratio > 1) {
    return Math.min(50 + ratio * 10, 100);
  }

  return ratio * 50;
}

/**
 * Calculate momentum score (recent performance)
 */
function calculateMomentumScore(view_count: number, hoursElapsed: number): number {
  if (hoursElapsed > 168) {
    return 0; // Older than a week
  }

  // Score based on recency and view count
  const recencyFactor = (168 - hoursElapsed) / 168;
  const viewFactor = Math.min(view_count / 100000, 1);

  return recencyFactor * viewFactor * 100;
}

/**
 * Calculate growth rate between two snapshots
 */
export function calculateGrowthRate(
  currentValue: number,
  previousValue: number,
  hoursElapsed: number
): number {
  if (previousValue === 0 || hoursElapsed === 0) {
    return 0;
  }

  const growth = ((currentValue - previousValue) / previousValue) * 100;
  const hourlyGrowth = growth / hoursElapsed;

  return hourlyGrowth;
}

/**
 * Calculate channel performance metrics
 */
export function calculateChannelMetrics(
  channel: Channel,
  recentVideos: Video[] = []
): ChannelMetrics {
  // Calculate average views from recent videos
  const avgViews =
    recentVideos.length > 0
      ? recentVideos.reduce((sum, _v) => {
          // This would need actual view data
          return sum;
        }, 0) / recentVideos.length
      : 0;

  // Calculate upload frequency (videos per day)
  let uploadFrequency = 0;
  if (recentVideos.length > 1) {
    const sortedVideos = [...recentVideos].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );

    const firstDate = new Date(sortedVideos[sortedVideos.length - 1].published_at);
    const lastDate = new Date(sortedVideos[0].published_at);
    const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);

    uploadFrequency = daysDiff > 0 ? recentVideos.length / daysDiff : 0;
  }

  // Calculate performance score (0-100)
  let performanceScore = 0;

  // Factor 1: Subscriber count (30%)
  const subScore = Math.min(channel.subscriber_count / 1000000, 1) * 30;

  // Factor 2: View count (30%)
  const viewScore = Math.min(channel.view_count / 100000000, 1) * 30;

  // Factor 3: Upload consistency (20%)
  const consistencyScore = Math.min(uploadFrequency * 10, 1) * 20;

  // Factor 4: Video count (20%)
  const videoScore = Math.min(channel.video_count / 1000, 1) * 20;

  performanceScore = subScore + viewScore + consistencyScore + videoScore;

  return {
    avgViews: avgViews,
    avgEngagement: 0, // Would need video stats to calculate
    uploadFrequency: uploadFrequency,
    subscriberGrowth: 0, // Would need historical data
    performanceScore: Math.round(performanceScore),
  };
}

/**
 * Calculate comprehensive video metrics
 */
export async function calculateVideoMetrics(video: Video | VideoWithStats): Promise<VideoMetrics> {
  // Get latest stats from database or use provided stats
  let stats: VideoStats | undefined;

  if ('stats' in video && video.stats) {
    stats = video.stats;
  } else {
    // Fetch from database
    const { data } = await supabase
      .from('video_stats')
      .select('*')
      .eq('video_id', video.video_id)
      .order('snapshotAt', { ascending: false })
      .limit(1)
      .single();

    // Convert DB response to VideoStats type
    stats = data ? {
      ...data,
      viewsPerHour: 0,
      engagementRate: 0,
      viralScore: 0,
      viewDelta: data.view_delta || 0,
      likeDelta: data.like_delta || 0,
      commentDelta: data.comment_delta || 0,
      subscriber_count: 0,
      published_at: data.created_at || new Date().toISOString(),
      channel_id: '',
      duration: 0,
    } : undefined;
  }

  if (!stats) {
    return {
      vph: 0,
      engagementRate: 0,
      viralScore: 0,
      growthRate: 0,
      velocity: 0,
    };
  }

  const vph = calculateVPH(stats.view_count, video.published_at);
  const engagementRate = calculateEngagementRate(
    stats.view_count,
    stats.like_count,
    stats.comment_count
  );
  const viralScore = calculateViralScore({
    view_count: stats.view_count,
    like_count: stats.like_count,
    comment_count: stats.comment_count,
    published_at: video.published_at,
  });

  // Calculate velocity (rate of change)
  const velocity =
    stats.viewDelta > 0
      ? (stats.viewDelta / Math.max(1, stats.view_count - stats.viewDelta)) * 100
      : 0;

  return {
    vph,
    engagementRate: engagementRate,
    viralScore: viralScore,
    growthRate: velocity,
    velocity,
  };
}

/**
 * Batch calculate metrics for multiple videos
 */
export async function batchCalculateMetrics(videos: Video[]): Promise<Map<string, VideoMetrics>> {
  const metricsMap = new Map<string, VideoMetrics>();

  // Process in batches to avoid overwhelming the database
  const batchSize = 50;
  for (let i = 0; i < videos.length; i += batchSize) {
    const batch = videos.slice(i, i + batchSize);
    const promises = batch.map((video) =>
      calculateVideoMetrics(video).then((metrics) => ({
        video_id: video.video_id,
        metrics,
      }))
    );

    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === 'fulfilled') {
        metricsMap.set(result.value.video_id, result.value.metrics);
      }
    }
  }

  return metricsMap;
}

/**
 * Calculate delta (change) between two stat snapshots
 */
export function calculateStatsDelta(
  current: VideoStats,
  previous: VideoStats | null
): {
  viewDelta: number;
  likeDelta: number;
  commentDelta: number;
  timeDeltaHours: number;
} {
  if (!previous) {
    return {
      viewDelta: current.view_count,
      likeDelta: current.like_count,
      commentDelta: current.comment_count,
      timeDeltaHours: 0,
    };
  }

  const timeDelta =
    new Date(current.snapshotAt).getTime() - new Date(previous.snapshotAt).getTime();
  const timeDeltaHours = timeDelta / (1000 * 60 * 60);

  return {
    viewDelta: current.view_count - previous.view_count,
    likeDelta: current.like_count - previous.like_count,
    commentDelta: current.comment_count - previous.comment_count,
    timeDeltaHours: timeDeltaHours,
  };
}

/**
 * Normalize metrics for comparison across different scales
 */
export function normalizeMetrics(metrics: VideoMetrics): {
  normalizedVph: number;
  normalizedEngagement: number;
  normalizedViral: number;
} {
  // Normalize to 0-1 scale
  const normalizedVph = Math.min(metrics.vph / 100000, 1); // 100K VPH = max
  const normalizedEngagement = Math.min(metrics.engagementRate / 20, 1); // 20% = max
  const normalizedViral = metrics.viralScore / 100; // Already 0-100

  return {
    normalizedVph: normalizedVph,
    normalizedEngagement: normalizedEngagement,
    normalizedViral: normalizedViral,
  };
}

/**
 * Identify outliers using statistical methods
 */
export function identifyOutliers(
  metrics: VideoMetrics[],
  threshold = 2.5 // Standard deviations
): {
  outliers: number[];
  stats: {
    mean: number;
    median: number;
    stdDev: number;
  };
} {
  if (metrics.length === 0) {
    return {
      outliers: [],
      stats: { mean: 0, median: 0, stdDev: 0 },
    };
  }

  // Calculate viral scores
  const scores = metrics.map((m) => m.viralScore);

  // Calculate mean
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  // Calculate median
  const sorted = [...scores].sort((a, b) => a - b);
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  // Calculate standard deviation
  const squaredDiffs = scores.map((score) => (score - mean) ** 2);
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // Identify outliers (scores more than threshold std devs from mean)
  const outliers: number[] = [];
  scores.forEach((score, index) => {
    if (Math.abs(score - mean) > threshold * stdDev) {
      outliers.push(index);
    }
  });

  return {
    outliers,
    stats: { mean, median, stdDev },
  };
}

/**
 * Calculate metrics for multiple YouTube videos
 */
export function calculateMetrics(
  videos: YouTubeVideo[],
  options: { subscriber_count?: number } = {}
): YouTubeVideo[] {
  return videos.map((video) => {
    const vph = calculateVPH(video.statistics.view_count, video.snippet.published_at);

    const engagementRate = calculateEngagementRate(
      video.statistics.view_count,
      video.statistics.like_count,
      video.statistics.comment_count
    );

    const viralScore = calculateViralScore({
      view_count: video.statistics.view_count,
      like_count: video.statistics.like_count,
      comment_count: video.statistics.comment_count,
      published_at: video.snippet.published_at,
      channelSubscriberCount: options.subscriber_count,
    });

    return {
      ...video,
      metrics: {
        vph,
        engagementRate: engagementRate,
        viralScore: viralScore,
        growthRate: 0, // Would need historical data
        velocity: 0, // Would need historical data
      },
    };
  });
}

/**
 * Calculate trend direction and strength
 */
export function calculateTrend(dataPoints: { value: number; timestamp: Date }[]): {
  direction: 'up' | 'down' | 'stable';
  strength: number; // 0-100
  slope: number;
} {
  if (dataPoints.length < 2) {
    return { direction: 'stable', strength: 0, slope: 0 };
  }

  // Sort by timestamp
  const sorted = [...dataPoints].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Calculate linear regression
  const n = sorted.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  sorted.forEach((point, index) => {
    const x = index; // Use index as X for simplicity
    const y = point.value;

    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  // Calculate slope
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Determine direction
  const direction = slope > 0.01 ? 'up' : slope < -0.01 ? 'down' : 'stable';

  // Calculate R-squared for strength
  const meanY = sumY / n;
  let ssTotal = 0;
  let ssResidual = 0;

  sorted.forEach((point, index) => {
    const predicted = slope * index + (meanY - slope * (sumX / n));
    ssTotal += (point.value - meanY) ** 2;
    ssResidual += (point.value - predicted) ** 2;
  });

  const rSquared = 1 - ssResidual / ssTotal;
  const strength = Math.max(0, Math.min(100, Math.abs(rSquared) * 100));

  return { direction, strength, slope };
}
