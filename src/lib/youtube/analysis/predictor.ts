/**
 * YouTube Lens - Prediction Model System
 * Phase 4: Advanced Analytics
 *
 * Machine learning-inspired prediction models for YouTube video performance
 * Uses time series analysis and statistical methods for viral prediction
 */

import type { PredictionModel, YouTubeVideo as Video, YouTubeVideoStats as VideoStats } from '@/types';

/**
 * Growth trajectory types
 */
type GrowthTrajectory = 'exponential' | 'linear' | 'logarithmic' | 'plateau' | 'declining';

/**
 * Feature vector for prediction
 */
interface FeatureVector {
  initialVelocity: number; // Views in first hour
  acceleration: number; // Rate of change in velocity
  engagementRate: number; // (likes + comments) / views
  titleLength: number;
  descriptionLength: number;
  tagCount: number;
  thumbnailQuality: number; // Placeholder for image analysis
  publishedHour: number; // Hour of day published
  isWeekend: boolean;
  channelSubscriberCount: number;
  channelAvgViews: number;
  categoryCompetitiveness: number;
}

/**
 * Model coefficients (trained values - in production would be ML-derived)
 */
const MODEL_COEFFICIENTS = {
  exponential: {
    initialVelocityWeight: 0.35,
    accelerationWeight: 0.25,
    engagementWeight: 0.2,
    channelWeight: 0.15,
    metadataWeight: 0.05,
  },
  viralThreshold: {
    minInitialVelocity: 100, // views/hour
    minAcceleration: 1.5, // growth factor
    minEngagement: 0.05, // 5% engagement rate
  },
  decayFactors: {
    hourly: 0.95, // 5% decay per hour after peak
    daily: 0.8, // 20% decay per day
    weekly: 0.5, // 50% decay per week
  },
};

/**
 * Calculate feature vector from video data
 */
function extract_features(
  video: Video,
  stats: VideoStats[],
  channel_stats?: {
    subscriber_count: number;
    avgViews: number;
  }
): FeatureVector {
  // Sort stats by time
  const sorted_stats = [...stats].sort(
    (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
  );

  // Calculate initial velocity (views in first measurement period)
  const first_stats_raw = sorted_stats[0];
  const initial_velocity = first_stats_raw ? first_stats_raw.views_per_hour || 0 : 0;

  // Calculate acceleration
  let acceleration = 0;
  if (sorted_stats.length >= 2) {
    const velocities = sorted_stats.map((s) => {
      return s.views_per_hour || 0;
    });
    const velocity_changes = velocities.slice(1).map((v, i) => v - (velocities[i] ?? 0));
    acceleration =
      velocity_changes.reduce((sum, change) => sum + change, 0) / velocity_changes.length;
  }

  // Calculate engagement rate
  const latest_stats = sorted_stats[sorted_stats.length - 1];
  const engagement_rate = latest_stats
    ? ((latest_stats.like_count ?? 0) + (latest_stats.comment_count ?? 0)) /
      Math.max(1, latest_stats.view_count ?? 0)
    : 0;

  // Extract metadata features
  const title_length = video.title.length;
  const description_length = (video.description || '').length;
  const tag_count = (video.tags || []).length;

  // Time features
  const published_date = new Date(video.published_at || new Date());
  const published_hour = published_date.getHours();
  const is_weekend = published_date.getDay() === 0 || published_date.getDay() === 6;

  // Channel features (use defaults if not provided)
  const channel_subscriber_count = channel_stats?.subscriber_count || 1000;
  const channel_avg_views = channel_stats?.avgViews || 100;

  // Category competitiveness (placeholder - would be calculated from category data)
  const category_competitiveness = 0.5;

  // Thumbnail quality (placeholder - would use image analysis)
  const thumbnail_quality = 0.7;

  return {
    initialVelocity: initial_velocity,
    acceleration,
    engagementRate: engagement_rate,
    titleLength: title_length,
    descriptionLength: description_length,
    tagCount: tag_count,
    thumbnailQuality: thumbnail_quality,
    publishedHour: published_hour,
    isWeekend: is_weekend,
    channelSubscriberCount: channel_subscriber_count,
    channelAvgViews: channel_avg_views,
    categoryCompetitiveness: category_competitiveness,
  };
}

/**
 * Predict growth trajectory based on features
 */
function predict_trajectory(features: FeatureVector): GrowthTrajectory {
  // Score for each trajectory type
  const scores = {
    exponential: 0,
    linear: 0,
    logarithmic: 0,
    plateau: 0,
    declining: 0,
  };

  // Exponential growth indicators
  if (
    features.initialVelocity > MODEL_COEFFICIENTS.viralThreshold.minInitialVelocity &&
    features.acceleration > 0 &&
    features.engagementRate > MODEL_COEFFICIENTS.viralThreshold.minEngagement
  ) {
    scores.exponential =
      features.initialVelocity / 1000 + features.acceleration / 10 + features.engagementRate * 10;
  }

  // Linear growth indicators
  if (features.initialVelocity > 50 && Math.abs(features.acceleration) < 5) {
    scores.linear =
      features.initialVelocity / 500 +
      (1 - Math.abs(features.acceleration) / 10) +
      features.channelSubscriberCount / 10000;
  }

  // Logarithmic growth indicators (fast start, then slowing)
  if (features.initialVelocity > 100 && features.acceleration < 0) {
    scores.logarithmic =
      features.initialVelocity / 500 +
      Math.abs(features.acceleration) / 20 +
      features.engagementRate * 5;
  }

  // Plateau indicators (reached peak)
  if (features.acceleration < -5) {
    scores.plateau = Math.abs(features.acceleration) / 10;
  }

  // Declining indicators
  if (features.initialVelocity < 10 && features.acceleration <= 0) {
    scores.declining = 1 + Math.abs(features.acceleration) / 5;
  }

  // Find trajectory with highest score
  const max_score = Math.max(...Object.values(scores));
  const trajectory = Object.entries(scores).find(
    ([_, score]) => score === max_score
  )?.[0] as GrowthTrajectory;

  return trajectory || 'linear';
}

/**
 * Calculate viral probability (0-1)
 */
function calculate_viral_probability(features: FeatureVector): number {
  const weights = MODEL_COEFFICIENTS.exponential;

  // Normalize features to 0-1 scale
  const normalized_velocity = Math.min(features.initialVelocity / 1000, 1);
  const normalized_acceleration = Math.min(Math.max(features.acceleration / 100, -1), 1);
  const normalized_engagement = Math.min(features.engagementRate / 0.1, 1); // 10% is max
  const normalized_channel = Math.min(features.channelSubscriberCount / 1000000, 1); // 1M is max

  // Metadata score
  const metadata_score =
    Math.min(features.titleLength / 100, 1) * 0.3 +
    Math.min(features.descriptionLength / 5000, 1) * 0.2 +
    Math.min(features.tagCount / 30, 1) * 0.2 +
    features.thumbnailQuality * 0.3;

  // Calculate weighted probability
  const probability =
    normalized_velocity * weights.initialVelocityWeight +
    normalized_acceleration * weights.accelerationWeight +
    normalized_engagement * weights.engagementWeight +
    normalized_channel * weights.channelWeight +
    metadata_score * weights.metadataWeight;

  // Apply sigmoid to keep in 0-1 range
  return 1 / (1 + Math.exp(-4 * (probability - 0.5)));
}

/**
 * Predict future view count using growth model
 */
function predict_views(
  current_views: number,
  trajectory: GrowthTrajectory,
  features: FeatureVector,
  days_ahead: number
): number {
  const hours_ahead = days_ahead * 24;

  switch (trajectory) {
    case 'exponential': {
      // Exponential growth with decay
      const growth_rate = 1 + features.acceleration / 100;
      const decay_factor = MODEL_COEFFICIENTS.decayFactors.hourly ** hours_ahead;
      return current_views * growth_rate ** (hours_ahead / 24) * decay_factor;
    }

    case 'linear': {
      // Linear growth
      const daily_growth = features.initialVelocity * 24;
      return current_views + daily_growth * days_ahead;
    }

    case 'logarithmic': {
      // Logarithmic growth (diminishing returns)
      const log_base = Math.E;
      const scale_factor = features.initialVelocity * 100;
      return current_views + (scale_factor * Math.log(1 + days_ahead)) / Math.log(log_base);
    }

    case 'plateau': {
      // Minimal growth after reaching plateau
      const plateau_growth = features.initialVelocity * 0.1; // 10% of initial velocity
      return current_views + plateau_growth * hours_ahead;
    }

    case 'declining': {
      // Declining views (rare for YouTube but possible)
      const decline_rate = MODEL_COEFFICIENTS.decayFactors.daily ** days_ahead;
      return current_views * decline_rate;
    }

    default:
      return current_views;
  }
}

/**
 * Calculate confidence interval for prediction
 */
function calculate_confidence_interval(
  predicted_value: number,
  features: FeatureVector,
  trajectory: GrowthTrajectory
): [number, number] {
  // Base uncertainty
  let uncertainty = 0.2; // 20% base uncertainty

  // Adjust based on trajectory confidence
  if (trajectory === 'exponential') {
    uncertainty = 0.4; // Higher uncertainty for viral predictions
  } else if (trajectory === 'declining') {
    uncertainty = 0.15; // Lower uncertainty for declining videos
  }

  // Adjust based on feature quality
  if (features.initialVelocity < 10) {
    uncertainty += 0.1; // More uncertainty for low-velocity videos
  }
  if (features.engagementRate < 0.01) {
    uncertainty += 0.05; // More uncertainty for low engagement
  }

  const lower_bound = predicted_value * (1 - uncertainty);
  const upper_bound = predicted_value * (1 + uncertainty);

  return [Math.max(0, lower_bound), upper_bound];
}

/**
 * Main prediction function
 */
export async function predictVideoPerformance(
  video: Video,
  stats: VideoStats[],
  horizon_days = 30,
  channel_stats?: {
    subscriber_count: number;
    avgViews: number;
  }
): Promise<PredictionModel> {
  // Extract features
  const features = extract_features(video, stats, channel_stats);

  // Predict trajectory
  const trajectory = predict_trajectory(features);

  // Calculate viral probability
  const viral_probability = calculate_viral_probability(features);

  // Get current stats
  const latest_stats = stats.sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  )[0];

  const current_views = latest_stats?.view_count || 0;

  // Predict future metrics
  const predicted_views = predict_views(current_views, trajectory, features, horizon_days);

  // Predict likes based on engagement rate
  const predicted_likes = predicted_views * features.engagementRate * 0.8; // 80% of engagement is likes

  // Calculate confidence interval
  const confidence_interval = calculate_confidence_interval(predicted_views, features, trajectory);

  return {
    video_id: video.id,
    predictedViews: Math.round(predicted_views),
    predictedLikes: Math.round(predicted_likes),
    confidenceInterval: {
      lower: Math.round(confidence_interval[0]),
      upper: Math.round(confidence_interval[1]),
    },
    viralProbability: viral_probability,
    growthTrajectory: trajectory,
    predictionDate: new Date().toISOString(),
    modelVersion: '1.0.0',
  };
}

/**
 * Batch prediction for multiple videos
 */
export async function batchPredict(
  videos: Array<{
    video: Video;
    stats: VideoStats[];
    channelStats?: {
      subscriber_count: number;
      avgViews: number;
    };
  }>,
  horizon_days = 30
): Promise<PredictionModel[]> {
  const predictions = await Promise.all(
    videos.map(({ video, stats, channelStats }) =>
      predictVideoPerformance(video, stats, horizon_days, channelStats)
    )
  );

  return predictions;
}

/**
 * Find videos with highest viral potential
 */
export function findViralCandidates(predictions: PredictionModel[], limit = 10): PredictionModel[] {
  return predictions
    .filter((p) => typeof p.viralProbability === 'number' && p.viralProbability > 0.5)
    .sort((a, b) => {
      const prob_a = typeof a.viralProbability === 'number' ? a.viralProbability : 0;
      const prob_b = typeof b.viralProbability === 'number' ? b.viralProbability : 0;
      return prob_b - prob_a;
    })
    .slice(0, limit);
}

/**
 * Analyze prediction accuracy (for model improvement)
 */
export function analyzePredictionAccuracy(
  predictions: Array<{
    prediction: PredictionModel;
    actualViews: number;
    actualLikes: number;
  }>
): {
  meanAbsoluteError: number;
  meanPercentageError: number;
  trajectoryAccuracy: number;
  viralPredictionAccuracy: number;
  withinConfidenceInterval: number;
} {
  let total_absolute_error = 0;
  let total_percentage_error = 0;
  let correct_trajectories = 0;
  let correct_viral_predictions = 0;
  let within_interval = 0;

  predictions.forEach(({ prediction, actualViews, actualLikes: _actualLikes }) => {
    // Calculate errors
    const view_error = Math.abs(prediction.predictedViews - actualViews);
    total_absolute_error += view_error;

    const percentage_error = actualViews > 0 ? view_error / actualViews : 0;
    total_percentage_error += percentage_error;

    // Check if within confidence interval
    if (
      actualViews >= prediction.confidenceInterval.lower &&
      actualViews <= prediction.confidenceInterval.upper
    ) {
      within_interval++;
    }

    // Check trajectory accuracy (simplified)
    const actual_growth = actualViews > prediction.predictedViews ? 'growing' : 'declining';
    const predicted_growth = ['exponential', 'linear', 'logarithmic'].includes(
      prediction.growthTrajectory
    )
      ? 'growing'
      : 'declining';

    if (actual_growth === predicted_growth) {
      correct_trajectories++;
    }

    // Check viral prediction accuracy
    const was_viral = actualViews > prediction.predictedViews * 2; // 2x growth is "viral"
    const predicted_viral = prediction.viralProbability > 0.7;

    if (was_viral === predicted_viral) {
      correct_viral_predictions++;
    }
  });

  const count = predictions.length;

  return {
    meanAbsoluteError: total_absolute_error / count,
    meanPercentageError: total_percentage_error / count,
    trajectoryAccuracy: correct_trajectories / count,
    viralPredictionAccuracy: correct_viral_predictions / count,
    withinConfidenceInterval: within_interval / count,
  };
}

/**
 * Generate prediction report
 */
export function generatePredictionReport(predictions: PredictionModel[]): {
  totalPredictions: number;
  viralCandidates: number;
  trajectoryDistribution: Record<GrowthTrajectory, number>;
  avgViralProbability: number;
  topViralVideos: PredictionModel[];
  growthSummary: {
    highGrowth: number; // >100% predicted growth
    moderateGrowth: number; // 20-100% growth
    lowGrowth: number; // 0-20% growth
    declining: number; // negative growth
  };
} {
  const trajectory_dist: Record<GrowthTrajectory, number> = {
    exponential: 0,
    linear: 0,
    logarithmic: 0,
    plateau: 0,
    declining: 0,
  };

  let total_viral_prob = 0;
  const growth_rates = predictions.map((p) => {
    trajectory_dist[p.growthTrajectory]++;
    total_viral_prob += p.viralProbability;

    // Calculate growth rate
    const current_views = p.predictedViews / 2; // Rough estimate of current
    const growth_rate = (p.predictedViews - current_views) / current_views;

    return { prediction: p, growthRate: growth_rate };
  });

  const growth_summary = {
    highGrowth: growth_rates.filter((g) => g.growthRate > 1).length,
    moderateGrowth: growth_rates.filter((g) => g.growthRate >= 0.2 && g.growthRate <= 1).length,
    lowGrowth: growth_rates.filter((g) => g.growthRate >= 0 && g.growthRate < 0.2).length,
    declining: growth_rates.filter((g) => g.growthRate < 0).length,
  };

  return {
    totalPredictions: predictions.length,
    viralCandidates: predictions.filter((p) => p.viralProbability > 0.7).length,
    trajectoryDistribution: trajectory_dist,
    avgViralProbability: total_viral_prob / predictions.length,
    topViralVideos: findViralCandidates(predictions, 5),
    growthSummary: growth_summary,
  };
}

const predictorAnalysis = {
  predictVideoPerformance,
  batchPredict,
  findViralCandidates,
  analyzePredictionAccuracy,
  generatePredictionReport,
};

export default predictorAnalysis;
