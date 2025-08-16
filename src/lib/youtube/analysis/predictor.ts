/**
 * YouTube Lens - Prediction Model System
 * Phase 4: Advanced Analytics
 * 
 * Machine learning-inspired prediction models for YouTube video performance
 * Uses time series analysis and statistical methods for viral prediction
 */

import type { 
  Video,
  VideoStats,
  PredictionModel
} from '@/types/youtube-lens';

/**
 * Growth trajectory types
 */
type GrowthTrajectory = 'exponential' | 'linear' | 'logarithmic' | 'plateau' | 'declining';

/**
 * Feature vector for prediction
 */
interface FeatureVector {
  initial_velocity: number; // Views in first hour
  acceleration: number; // Rate of change in velocity
  engagement_rate: number; // (likes + comments) / views
  title_length: number;
  description_length: number;
  tag_count: number;
  thumbnail_quality: number; // Placeholder for image analysis
  published_hour: number; // Hour of day published
  is_weekend: boolean;
  channel_subscriber_count: number;
  channel_avg_views: number;
  category_competitiveness: number;
}

/**
 * Model coefficients (trained values - in production would be ML-derived)
 */
const MODEL_COEFFICIENTS = {
  exponential: {
    initial_velocity_weight: 0.35,
    acceleration_weight: 0.25,
    engagement_weight: 0.20,
    channel_weight: 0.15,
    metadata_weight: 0.05
  },
  viral_threshold: {
    min_initial_velocity: 100, // views/hour
    min_acceleration: 1.5, // growth factor
    min_engagement: 0.05 // 5% engagement rate
  },
  decay_factors: {
    hourly: 0.95, // 5% decay per hour after peak
    daily: 0.80, // 20% decay per day
    weekly: 0.50 // 50% decay per week
  }
};

/**
 * Calculate feature vector from video data
 */
function extractFeatures(
  video: Video,
  stats: VideoStats[],
  channelStats?: {
    subscriber_count: number;
    avg_views: number;
  }
): FeatureVector {
  // Sort stats by time
  const sortedStats = [...stats].sort((a, b) => 
    new Date(a.snapshot_at).getTime() - new Date(b.snapshot_at).getTime()
  );
  
  // Calculate initial velocity (views in first measurement period)
  const initialVelocity = sortedStats[0]?.views_per_hour || 0;
  
  // Calculate acceleration
  let acceleration = 0;
  if (sortedStats.length >= 2) {
    const velocities = sortedStats.map(s => s.views_per_hour || 0);
    const velocityChanges = velocities.slice(1).map((v, i) => v - velocities[i]);
    acceleration = velocityChanges.reduce((sum, change) => sum + change, 0) / velocityChanges.length;
  }
  
  // Calculate engagement rate
  const latestStats = sortedStats[sortedStats.length - 1];
  const engagementRate = latestStats 
    ? (latestStats.like_count + latestStats.comment_count) / Math.max(1, latestStats.view_count)
    : 0;
  
  // Extract metadata features
  const titleLength = video.title.length;
  const descriptionLength = (video.description || '').length;
  const tagCount = (video.tags || []).length;
  
  // Time features
  const publishedDate = new Date(video.published_at);
  const publishedHour = publishedDate.getHours();
  const isWeekend = publishedDate.getDay() === 0 || publishedDate.getDay() === 6;
  
  // Channel features (use defaults if not provided)
  const channelSubscriberCount = channelStats?.subscriber_count || 1000;
  const channelAvgViews = channelStats?.avg_views || 100;
  
  // Category competitiveness (placeholder - would be calculated from category data)
  const categoryCompetitiveness = 0.5;
  
  // Thumbnail quality (placeholder - would use image analysis)
  const thumbnailQuality = 0.7;
  
  return {
    initial_velocity: initialVelocity,
    acceleration,
    engagement_rate: engagementRate,
    title_length: titleLength,
    description_length: descriptionLength,
    tag_count: tagCount,
    thumbnail_quality: thumbnailQuality,
    published_hour: publishedHour,
    is_weekend: isWeekend,
    channel_subscriber_count: channelSubscriberCount,
    channel_avg_views: channelAvgViews,
    category_competitiveness: categoryCompetitiveness
  };
}

/**
 * Predict growth trajectory based on features
 */
function predictTrajectory(features: FeatureVector): GrowthTrajectory {
  // Score for each trajectory type
  const scores = {
    exponential: 0,
    linear: 0,
    logarithmic: 0,
    plateau: 0,
    declining: 0
  };
  
  // Exponential growth indicators
  if (features.initial_velocity > MODEL_COEFFICIENTS.viral_threshold.min_initial_velocity &&
      features.acceleration > 0 &&
      features.engagement_rate > MODEL_COEFFICIENTS.viral_threshold.min_engagement) {
    scores.exponential = 
      features.initial_velocity / 1000 +
      features.acceleration / 10 +
      features.engagement_rate * 10;
  }
  
  // Linear growth indicators
  if (features.initial_velocity > 50 && Math.abs(features.acceleration) < 5) {
    scores.linear = 
      features.initial_velocity / 500 +
      (1 - Math.abs(features.acceleration) / 10) +
      features.channel_subscriber_count / 10000;
  }
  
  // Logarithmic growth indicators (fast start, then slowing)
  if (features.initial_velocity > 100 && features.acceleration < 0) {
    scores.logarithmic = 
      features.initial_velocity / 500 +
      Math.abs(features.acceleration) / 20 +
      features.engagement_rate * 5;
  }
  
  // Plateau indicators (reached peak)
  if (features.acceleration < -5) {
    scores.plateau = Math.abs(features.acceleration) / 10;
  }
  
  // Declining indicators
  if (features.initial_velocity < 10 && features.acceleration <= 0) {
    scores.declining = 1 + Math.abs(features.acceleration) / 5;
  }
  
  // Find trajectory with highest score
  const maxScore = Math.max(...Object.values(scores));
  const trajectory = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as GrowthTrajectory;
  
  return trajectory || 'linear';
}

/**
 * Calculate viral probability (0-1)
 */
function calculateViralProbability(features: FeatureVector): number {
  const weights = MODEL_COEFFICIENTS.exponential;
  
  // Normalize features to 0-1 scale
  const normalizedVelocity = Math.min(features.initial_velocity / 1000, 1);
  const normalizedAcceleration = Math.min(Math.max(features.acceleration / 100, -1), 1);
  const normalizedEngagement = Math.min(features.engagement_rate / 0.1, 1); // 10% is max
  const normalizedChannel = Math.min(features.channel_subscriber_count / 1000000, 1); // 1M is max
  
  // Metadata score
  const metadataScore = (
    Math.min(features.title_length / 100, 1) * 0.3 +
    Math.min(features.description_length / 5000, 1) * 0.2 +
    Math.min(features.tag_count / 30, 1) * 0.2 +
    features.thumbnail_quality * 0.3
  );
  
  // Calculate weighted probability
  const probability = 
    normalizedVelocity * weights.initial_velocity_weight +
    normalizedAcceleration * weights.acceleration_weight +
    normalizedEngagement * weights.engagement_weight +
    normalizedChannel * weights.channel_weight +
    metadataScore * weights.metadata_weight;
  
  // Apply sigmoid to keep in 0-1 range
  return 1 / (1 + Math.exp(-4 * (probability - 0.5)));
}

/**
 * Predict future view count using growth model
 */
function predictViews(
  currentViews: number,
  trajectory: GrowthTrajectory,
  features: FeatureVector,
  daysAhead: number
): number {
  const hoursAhead = daysAhead * 24;
  
  switch (trajectory) {
    case 'exponential':
      // Exponential growth with decay
      const growthRate = 1 + (features.acceleration / 100);
      const decayFactor = Math.pow(MODEL_COEFFICIENTS.decay_factors.hourly, hoursAhead);
      return currentViews * Math.pow(growthRate, hoursAhead / 24) * decayFactor;
    
    case 'linear':
      // Linear growth
      const dailyGrowth = features.initial_velocity * 24;
      return currentViews + (dailyGrowth * daysAhead);
    
    case 'logarithmic':
      // Logarithmic growth (diminishing returns)
      const logBase = Math.E;
      const scaleFactor = features.initial_velocity * 100;
      return currentViews + scaleFactor * Math.log(1 + daysAhead) / Math.log(logBase);
    
    case 'plateau':
      // Minimal growth after reaching plateau
      const plateauGrowth = features.initial_velocity * 0.1; // 10% of initial velocity
      return currentViews + (plateauGrowth * hoursAhead);
    
    case 'declining':
      // Declining views (rare for YouTube but possible)
      const declineRate = Math.pow(MODEL_COEFFICIENTS.decay_factors.daily, daysAhead);
      return currentViews * declineRate;
    
    default:
      return currentViews;
  }
}

/**
 * Calculate confidence interval for prediction
 */
function calculateConfidenceInterval(
  predictedValue: number,
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
  if (features.initial_velocity < 10) {
    uncertainty += 0.1; // More uncertainty for low-velocity videos
  }
  if (features.engagement_rate < 0.01) {
    uncertainty += 0.05; // More uncertainty for low engagement
  }
  
  const lowerBound = predictedValue * (1 - uncertainty);
  const upperBound = predictedValue * (1 + uncertainty);
  
  return [Math.max(0, lowerBound), upperBound];
}

/**
 * Main prediction function
 */
export async function predictVideoPerformance(
  video: Video,
  stats: VideoStats[],
  horizonDays: number = 30,
  channelStats?: {
    subscriber_count: number;
    avg_views: number;
  }
): Promise<PredictionModel> {
  // Extract features
  const features = extractFeatures(video, stats, channelStats);
  
  // Predict trajectory
  const trajectory = predictTrajectory(features);
  
  // Calculate viral probability
  const viralProbability = calculateViralProbability(features);
  
  // Get current stats
  const latestStats = stats.sort((a, b) => 
    new Date(b.snapshot_at).getTime() - new Date(a.snapshot_at).getTime()
  )[0];
  
  const currentViews = latestStats?.view_count || 0;
  const currentLikes = latestStats?.like_count || 0;
  
  // Predict future metrics
  const predictedViews = predictViews(currentViews, trajectory, features, horizonDays);
  
  // Predict likes based on engagement rate
  const predictedLikes = predictedViews * features.engagement_rate * 0.8; // 80% of engagement is likes
  
  // Calculate confidence interval
  const confidenceInterval = calculateConfidenceInterval(predictedViews, features, trajectory);
  
  return {
    video_id: video.video_id,
    predicted_views: Math.round(predictedViews),
    predicted_likes: Math.round(predictedLikes),
    confidence_interval: {
      lower: Math.round(confidenceInterval[0]),
      upper: Math.round(confidenceInterval[1])
    },
    viral_probability: viralProbability,
    growth_trajectory: trajectory,
    prediction_date: new Date().toISOString(),
    model_version: '1.0.0'
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
      avg_views: number;
    };
  }>,
  horizonDays: number = 30
): Promise<PredictionModel[]> {
  const predictions = await Promise.all(
    videos.map(({ video, stats, channelStats }) => 
      predictVideoPerformance(video, stats, horizonDays, channelStats)
    )
  );
  
  return predictions;
}

/**
 * Find videos with highest viral potential
 */
export function findViralCandidates(
  predictions: PredictionModel[],
  limit: number = 10
): PredictionModel[] {
  return predictions
    .filter(p => p.viral_probability > 0.5)
    .sort((a, b) => b.viral_probability - a.viral_probability)
    .slice(0, limit);
}

/**
 * Analyze prediction accuracy (for model improvement)
 */
export function analyzePredictionAccuracy(
  predictions: Array<{
    prediction: PredictionModel;
    actual_views: number;
    actual_likes: number;
  }>
): {
  mean_absolute_error: number;
  mean_percentage_error: number;
  trajectory_accuracy: number;
  viral_prediction_accuracy: number;
  within_confidence_interval: number;
} {
  let totalAbsoluteError = 0;
  let totalPercentageError = 0;
  let correctTrajectories = 0;
  let correctViralPredictions = 0;
  let withinInterval = 0;
  
  predictions.forEach(({ prediction, actual_views, actual_likes }) => {
    // Calculate errors
    const viewError = Math.abs(prediction.predicted_views - actual_views);
    totalAbsoluteError += viewError;
    
    const percentageError = actual_views > 0 
      ? viewError / actual_views 
      : 0;
    totalPercentageError += percentageError;
    
    // Check if within confidence interval
    if (actual_views >= prediction.confidence_interval.lower &&
        actual_views <= prediction.confidence_interval.upper) {
      withinInterval++;
    }
    
    // Check trajectory accuracy (simplified)
    const actualGrowth = actual_views > prediction.predicted_views ? 'growing' : 'declining';
    const predictedGrowth = ['exponential', 'linear', 'logarithmic'].includes(prediction.growth_trajectory) 
      ? 'growing' 
      : 'declining';
    
    if (actualGrowth === predictedGrowth) {
      correctTrajectories++;
    }
    
    // Check viral prediction accuracy
    const wasViral = actual_views > prediction.predicted_views * 2; // 2x growth is "viral"
    const predictedViral = prediction.viral_probability > 0.7;
    
    if (wasViral === predictedViral) {
      correctViralPredictions++;
    }
  });
  
  const count = predictions.length;
  
  return {
    mean_absolute_error: totalAbsoluteError / count,
    mean_percentage_error: totalPercentageError / count,
    trajectory_accuracy: correctTrajectories / count,
    viral_prediction_accuracy: correctViralPredictions / count,
    within_confidence_interval: withinInterval / count
  };
}

/**
 * Generate prediction report
 */
export function generatePredictionReport(
  predictions: PredictionModel[]
): {
  total_predictions: number;
  viral_candidates: number;
  trajectory_distribution: Record<GrowthTrajectory, number>;
  avg_viral_probability: number;
  top_viral_videos: PredictionModel[];
  growth_summary: {
    high_growth: number; // >100% predicted growth
    moderate_growth: number; // 20-100% growth
    low_growth: number; // 0-20% growth
    declining: number; // negative growth
  };
} {
  const trajectoryDist: Record<GrowthTrajectory, number> = {
    exponential: 0,
    linear: 0,
    logarithmic: 0,
    plateau: 0,
    declining: 0
  };
  
  let totalViralProb = 0;
  const growthRates = predictions.map(p => {
    trajectoryDist[p.growth_trajectory]++;
    totalViralProb += p.viral_probability;
    
    // Calculate growth rate
    const currentViews = p.predicted_views / 2; // Rough estimate of current
    const growthRate = (p.predicted_views - currentViews) / currentViews;
    
    return { prediction: p, growthRate };
  });
  
  const growthSummary = {
    high_growth: growthRates.filter(g => g.growthRate > 1).length,
    moderate_growth: growthRates.filter(g => g.growthRate >= 0.2 && g.growthRate <= 1).length,
    low_growth: growthRates.filter(g => g.growthRate >= 0 && g.growthRate < 0.2).length,
    declining: growthRates.filter(g => g.growthRate < 0).length
  };
  
  return {
    total_predictions: predictions.length,
    viral_candidates: predictions.filter(p => p.viral_probability > 0.7).length,
    trajectory_distribution: trajectoryDist,
    avg_viral_probability: totalViralProb / predictions.length,
    top_viral_videos: findViralCandidates(predictions, 5),
    growth_summary: growthSummary
  };
}

export default {
  predictVideoPerformance,
  batchPredict,
  findViralCandidates,
  analyzePredictionAccuracy,
  generatePredictionReport
};