/**
 * YouTube Lens - Metrics Calculation Engine
 * Calculates VPH, engagement rates, viral scores, and other key metrics
 * Created: 2025-01-21
 */

import type {
  Channel,
  ChannelMetrics,
  Video,
  VideoMetrics,
  YouTubeLensVideoStats as VideoStats,
  VideoWithStats,
  YouTubeVideo,
} from '@/types';

/**
 * Calculate Views Per Hour (VPH) for a video
 */
export function calculateVPH(
  view_count: number,
  published_at: Date | string,
  current_time: Date = new Date()
): number {
  const published = typeof published_at === 'string' ? new Date(published_at) : published_at;
  const hours_elapsed = (current_time.getTime() - published.getTime()) / (1000 * 60 * 60);

  if (hours_elapsed <= 0) {
    return 0;
  }

  return view_count / hours_elapsed;
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
  const engagement_rate = calculateEngagementRate(view_count, like_count, comment_count);

  // Calculate hours elapsed
  const published = typeof published_at === 'string' ? new Date(published_at) : published_at;
  const hours_elapsed = (now.getTime() - published.getTime()) / (1000 * 60 * 60);

  // Scoring components
  let score = 0;

  // 1. Velocity Score (40% weight) - How fast it's growing
  const velocity_score = calculate_velocity_score(vph, hours_elapsed);
  score += velocity_score * 0.4;

  // 2. Engagement Score (30% weight) - How engaged viewers are
  const engagement_score = calculate_engagement_score(engagement_rate);
  score += engagement_score * 0.3;

  // 3. Reach Score (20% weight) - Views relative to channel size
  const reach_score = calculate_reach_score(view_count, channelSubscriberCount);
  score += reach_score * 0.2;

  // 4. Momentum Score (10% weight) - Recent performance
  const momentum_score = calculate_momentum_score(view_count, hours_elapsed);
  score += momentum_score * 0.1;

  // Apply multipliers for exceptional performance
  if (vph > 100000) {
    score *= 1.5; // Extremely viral
  }
  if (engagement_rate > 15) {
    score *= 1.3; // Exceptional engagement
  }
  if (hours_elapsed < 6 && view_count > 100000) {
    score *= 1.4; // Instant viral
  }

  return Math.min(Math.round(score), 100);
}

/**
 * Calculate velocity score based on VPH and time
 */
function calculate_velocity_score(vph: number, hours_elapsed: number): number {
  // Normalize VPH (assume 10K VPH is excellent)
  let score = Math.min(vph / 10000, 1) * 100;

  // Boost for early velocity
  if (hours_elapsed < 24) {
    score *= 1.2;
  } else if (hours_elapsed < 72) {
    score *= 1.1;
  }

  return Math.min(score, 100);
}

/**
 * Calculate engagement score
 */
function calculate_engagement_score(engagement_rate: number): number {
  // Assume 10% engagement is excellent
  return Math.min((engagement_rate / 10) * 100, 100);
}

/**
 * Calculate reach score (views relative to channel size)
 */
function calculate_reach_score(view_count: number, subscriber_count: number): number {
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
function calculate_momentum_score(view_count: number, hours_elapsed: number): number {
  if (hours_elapsed > 168) {
    return 0; // Older than a week
  }

  // Score based on recency and view count
  const recency_factor = (168 - hours_elapsed) / 168;
  const view_factor = Math.min(view_count / 100000, 1);

  return recency_factor * view_factor * 100;
}

/**
 * Calculate growth rate between two snapshots
 */
export function calculateGrowthRate(
  current_value: number,
  previous_value: number,
  hours_elapsed: number
): number {
  if (previous_value === 0 || hours_elapsed === 0) {
    return 0;
  }

  const growth = ((current_value - previous_value) / previous_value) * 100;
  const hourly_growth = growth / hours_elapsed;

  return hourly_growth;
}

/**
 * Calculate channel performance metrics
 */
export function calculateChannelMetrics(
  channel: Channel,
  recent_videos: Video[] = []
): ChannelMetrics {
  // Calculate average views from recent videos
  const avg_views =
    recent_videos.length > 0
      ? recent_videos.reduce((sum, _v) => {
          // This would need actual view data
          return sum;
        }, 0) / recent_videos.length
      : 0;

  // Calculate upload frequency (videos per day)
  let upload_frequency = 0;
  if (recent_videos.length > 1) {
    const sorted_videos = [...recent_videos].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );

    const first_video = sorted_videos[sorted_videos.length - 1];
    const last_video = sorted_videos[0];

    if (!first_video || !last_video) {
      return {
        avgViews: avg_views,
        avgEngagement: 0,
        uploadFrequency: 0,
        subscriberGrowth: 0,
        performanceScore: 0,
      };
    }

    const first_date = new Date(first_video.published_at);
    const last_date = new Date(last_video.published_at);
    const days_diff = (last_date.getTime() - first_date.getTime()) / (1000 * 60 * 60 * 24);

    upload_frequency = days_diff > 0 ? recent_videos.length / days_diff : 0;
  }

  // Calculate performance score (0-100)
  let performance_score = 0;

  // Factor 1: Subscriber count (30%)
  const sub_score = Math.min(channel.subscriber_count / 1000000, 1) * 30;

  // Factor 2: View count (30%)
  const view_score = Math.min(channel.view_count / 100000000, 1) * 30;

  // Factor 3: Upload consistency (20%)
  const consistency_score = Math.min(upload_frequency * 10, 1) * 20;

  // Factor 4: Video count (20%)
  const video_score = Math.min(channel.video_count / 1000, 1) * 20;

  performance_score = sub_score + view_score + consistency_score + video_score;

  return {
    avgViews: avg_views,
    avgEngagement: 0, // Would need video stats to calculate
    uploadFrequency: upload_frequency,
    subscriberGrowth: 0, // Would need historical data
    performanceScore: Math.round(performance_score),
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
    // Stats not available - use default values
    // Note: Database fetching should be done at the API route level
    stats = {
      id: '',
      video_id: video.video_id || '',
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      viewsPerHour: 0,
      engagementRate: 0,
      viralScore: 0,
      viewDelta: 0,
      likeDelta: 0,
      commentDelta: 0,
      snapshotAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
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
  const engagement_rate = calculateEngagementRate(
    stats.view_count,
    stats.like_count,
    stats.comment_count
  );
  const viral_score = calculateViralScore({
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
    engagementRate: engagement_rate,
    viralScore: viral_score,
    growthRate: velocity,
    velocity,
  };
}

/**
 * Batch calculate metrics for multiple videos
 */
export async function batchCalculateMetrics(videos: Video[]): Promise<Map<string, VideoMetrics>> {
  const metrics_map = new Map<string, VideoMetrics>();

  // Process in batches to avoid overwhelming the database
  const batch_size = 50;
  for (let i = 0; i < videos.length; i += batch_size) {
    const batch = videos.slice(i, i + batch_size);
    const promises = batch.map((video) =>
      calculateVideoMetrics(video).then((metrics) => ({
        video_id: video.video_id,
        metrics,
      }))
    );

    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === 'fulfilled') {
        metrics_map.set(result.value.video_id, result.value.metrics);
      }
    }
  }

  return metrics_map;
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

  const time_delta =
    new Date(current.snapshotAt).getTime() - new Date(previous.snapshotAt).getTime();
  const time_delta_hours = time_delta / (1000 * 60 * 60);

  return {
    viewDelta: current.view_count - previous.view_count,
    likeDelta: current.like_count - previous.like_count,
    commentDelta: current.comment_count - previous.comment_count,
    timeDeltaHours: time_delta_hours,
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
  const normalized_vph = Math.min(metrics.vph / 100000, 1); // 100K VPH = max
  const normalized_engagement = Math.min(metrics.engagementRate / 20, 1); // 20% = max
  const normalized_viral = metrics.viralScore / 100; // Already 0-100

  return {
    normalizedVph: normalized_vph,
    normalizedEngagement: normalized_engagement,
    normalizedViral: normalized_viral,
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
      ? ((sorted[sorted.length / 2 - 1] ?? 0) + (sorted[sorted.length / 2] ?? 0)) / 2
      : (sorted[Math.floor(sorted.length / 2)] ?? 0);

  // Calculate standard deviation
  const squared_diffs = scores.map((score) => (score - mean) ** 2);
  const variance = squared_diffs.reduce((sum, diff) => sum + diff, 0) / scores.length;
  const std_dev = Math.sqrt(variance);

  // Identify outliers (scores more than threshold std devs from mean)
  const outliers: number[] = [];
  scores.forEach((score, index) => {
    if (Math.abs(score - mean) > threshold * std_dev) {
      outliers.push(index);
    }
  });

  return {
    outliers,
    stats: { mean, median, stdDev: std_dev },
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
    if (!video.statistics || !video.snippet) {
      return {
        ...video,
        metrics: {
          vph: 0,
          engagementRate: 0,
          viralScore: 0,
          growthRate: 0,
          velocity: 0,
        },
      };
    }

    const vph = calculateVPH(
      Number.parseInt(String(video.statistics.view_count || 0)),
      video.snippet.published_at || ''
    );

    const engagement_rate = calculateEngagementRate(
      Number.parseInt(String(video.statistics.view_count || 0)),
      Number.parseInt(String(video.statistics.like_count || 0)),
      Number.parseInt(String(video.statistics.comment_count || 0))
    );

    const viral_score = calculateViralScore({
      view_count: Number.parseInt(String(video.statistics.view_count || 0)),
      like_count: Number.parseInt(String(video.statistics.like_count || 0)),
      comment_count: Number.parseInt(String(video.statistics.comment_count || 0)),
      published_at: video.snippet.published_at ?? '',
      channelSubscriberCount: options.subscriber_count ?? 0,
    });

    return {
      ...video,
      metrics: {
        vph,
        engagementRate: engagement_rate,
        viralScore: viral_score,
        growthRate: 0, // Would need historical data
        velocity: 0, // Would need historical data
      },
    };
  });
}

/**
 * Calculate trend direction and strength
 */
export function calculateTrend(data_points: { value: number; timestamp: Date }[]): {
  direction: 'up' | 'down' | 'stable';
  strength: number; // 0-100
  slope: number;
} {
  if (data_points.length < 2) {
    return { direction: 'stable', strength: 0, slope: 0 };
  }

  // Sort by timestamp
  const sorted = [...data_points].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Calculate linear regression
  const n = sorted.length;
  let sum_x = 0;
  let sum_y = 0;
  let sum_xy = 0;
  let sum_x2 = 0;

  sorted.forEach((point, index) => {
    const x = index; // Use index as X for simplicity
    const y = point.value;

    sum_x += x;
    sum_y += y;
    sum_xy += x * y;
    sum_x2 += x * x;
  });

  // Calculate slope
  const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x);

  // Determine direction
  const direction = slope > 0.01 ? 'up' : slope < -0.01 ? 'down' : 'stable';

  // Calculate R-squared for strength
  const mean_y = sum_y / n;
  let ss_total = 0;
  let ss_residual = 0;

  sorted.forEach((point, index) => {
    const predicted = slope * index + (mean_y - slope * (sum_x / n));
    ss_total += (point.value - mean_y) ** 2;
    ss_residual += (point.value - predicted) ** 2;
  });

  const r_squared = 1 - ss_residual / ss_total;
  const strength = Math.max(0, Math.min(100, Math.abs(r_squared) * 100));

  return { direction, strength, slope };
}
