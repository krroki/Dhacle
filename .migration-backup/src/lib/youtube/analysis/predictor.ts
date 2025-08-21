/**
 * YouTube Lens - Prediction Model System
 * Phase 4: Advanced Analytics
 *
 * Machine learning-inspired prediction models for YouTube video performance
 * Uses time series analysis and statistical methods for viral prediction
 */

import { mapVideoStats } from '@/lib/utils/type-mappers';
import type { PredictionModel, Video, VideoStats } from '@/types/youtube-lens';

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
function extractFeatures(
  video: Video,
  stats: VideoStats[],
  channelStats?: {
    subscriber_count: number;
    avgViews: number;
  }
): FeatureVector {
  // Sort stats by time
  const sortedStats = [...stats].sort(
    (a, b) => new Date(a.snapshotAt).getTime() - new Date(b.snapshotAt).getTime()
  );

  // Calculate initial velocity (views in first measurement period)
  const firstStats = sortedStats[0] ? mapVideoStats(sortedStats[0]) : null;
  const initialVelocity = firstStats?.viewsPerHour || 0;

  // Calculate acceleration
  let acceleration = 0;
  if (sortedStats.length >= 2) {
    const velocities = sortedStats.map((s) => {
      const mappedStats = mapVideoStats(s);
      return mappedStats.viewsPerHour || 0;
    });
    const velocityChanges = velocities.slice(1).map((v, i) => v - velocities[i]);
    acceleration =
      velocityChanges.reduce((sum, change) => sum + change, 0) / velocityChanges.length;
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
  const channelAvgViews = channelStats?.avgViews || 100;

  // Category competitiveness (placeholder - would be calculated from category data)
  const categoryCompetitiveness = 0.5;

  // Thumbnail quality (placeholder - would use image analysis)
  const thumbnailQuality = 0.7;

  return {
    initialVelocity: initialVelocity,
    acceleration,
    engagementRate: engagementRate,
    titleLength: titleLength,
    descriptionLength: descriptionLength,
    tagCount: tagCount,
    thumbnailQuality: thumbnailQuality,
    publishedHour: publishedHour,
    isWeekend: isWeekend,
    channelSubscriberCount: channelSubscriberCount,
    channelAvgViews: channelAvgViews,
    categoryCompetitiveness: categoryCompetitiveness,
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
  const maxScore = Math.max(...Object.values(scores));
  const trajectory = Object.entries(scores).find(
    ([_, score]) => score === maxScore
  )?.[0] as GrowthTrajectory;

  return trajectory || 'linear';
}

/**
 * Calculate viral probability (0-1)
 */
function calculateViralProbability(features: FeatureVector): number {
  const weights = MODEL_COEFFICIENTS.exponential;

  // Normalize features to 0-1 scale
  const normalizedVelocity = Math.min(features.initialVelocity / 1000, 1);
  const normalizedAcceleration = Math.min(Math.max(features.acceleration / 100, -1), 1);
  const normalizedEngagement = Math.min(features.engagementRate / 0.1, 1); // 10% is max
  const normalizedChannel = Math.min(features.channelSubscriberCount / 1000000, 1); // 1M is max

  // Metadata score
  const metadataScore =
    Math.min(features.titleLength / 100, 1) * 0.3 +
    Math.min(features.descriptionLength / 5000, 1) * 0.2 +
    Math.min(features.tagCount / 30, 1) * 0.2 +
    features.thumbnailQuality * 0.3;

  // Calculate weighted probability
  const probability =
    normalizedVelocity * weights.initialVelocityWeight +
    normalizedAcceleration * weights.accelerationWeight +
    normalizedEngagement * weights.engagementWeight +
    normalizedChannel * weights.channelWeight +
    metadataScore * weights.metadataWeight;

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
    case 'exponential': {
      // Exponential growth with decay
      const growthRate = 1 + features.acceleration / 100;
      const decayFactor = MODEL_COEFFICIENTS.decayFactors.hourly ** hoursAhead;
      return currentViews * growthRate ** (hoursAhead / 24) * decayFactor;
    }

    case 'linear': {
      // Linear growth
      const dailyGrowth = features.initialVelocity * 24;
      return currentViews + dailyGrowth * daysAhead;
    }

    case 'logarithmic': {
      // Logarithmic growth (diminishing returns)
      const logBase = Math.E;
      const scaleFactor = features.initialVelocity * 100;
      return currentViews + (scaleFactor * Math.log(1 + daysAhead)) / Math.log(logBase);
    }

    case 'plateau': {
      // Minimal growth after reaching plateau
      const plateauGrowth = features.initialVelocity * 0.1; // 10% of initial velocity
      return currentViews + plateauGrowth * hoursAhead;
    }

    case 'declining': {
      // Declining views (rare for YouTube but possible)
      const declineRate = MODEL_COEFFICIENTS.decayFactors.daily ** daysAhead;
      return currentViews * declineRate;
    }

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
  if (features.initialVelocity < 10) {
    uncertainty += 0.1; // More uncertainty for low-velocity videos
  }
  if (features.engagementRate < 0.01) {
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
  horizonDays = 30,
  channelStats?: {
    subscriber_count: number;
    avgViews: number;
  }
): Promise<PredictionModel> {
  // Extract features
  const features = extractFeatures(video, stats, channelStats);

  // Predict trajectory
  const trajectory = predictTrajectory(features);

  // Calculate viral probability
  const viralProbability = calculateViralProbability(features);

  // Get current stats
  const latestStats = stats.sort(
    (a, b) => new Date(b.snapshotAt).getTime() - new Date(a.snapshotAt).getTime()
  )[0];

  const currentViews = latestStats?.view_count || 0;
  const _currentLikes = latestStats?.like_count || 0;

  // Predict future metrics
  const predictedViews = predictViews(currentViews, trajectory, features, horizonDays);

  // Predict likes based on engagement rate
  const predictedLikes = predictedViews * features.engagementRate * 0.8; // 80% of engagement is likes

  // Calculate confidence interval
  const confidenceInterval = calculateConfidenceInterval(predictedViews, features, trajectory);

  return {
    video_id: video.video_id,
    predictedViews: Math.round(predictedViews),
    predictedLikes: Math.round(predictedLikes),
    confidenceInterval: {
      lower: Math.round(confidenceInterval[0]),
      upper: Math.round(confidenceInterval[1]),
    },
    viralProbability: viralProbability,
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
  horizonDays = 30
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
export function findViralCandidates(predictions: PredictionModel[], limit = 10): PredictionModel[] {
  return predictions
    .filter((p) => p.viralProbability > 0.5)
    .sort((a, b) => b.viralProbability - a.viralProbability)
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
  let totalAbsoluteError = 0;
  let totalPercentageError = 0;
  let correctTrajectories = 0;
  let correctViralPredictions = 0;
  let withinInterval = 0;

  predictions.forEach(({ prediction, actualViews, actualLikes }) => {
    // Calculate errors
    const viewError = Math.abs(prediction.predictedViews - actualViews);
    totalAbsoluteError += viewError;

    const percentageError = actualViews > 0 ? viewError / actualViews : 0;
    totalPercentageError += percentageError;

    // Check if within confidence interval
    if (
      actualViews >= prediction.confidenceInterval.lower &&
      actualViews <= prediction.confidenceInterval.upper
    ) {
      withinInterval++;
    }

    // Check trajectory accuracy (simplified)
    const actualGrowth = actualViews > prediction.predictedViews ? 'growing' : 'declining';
    const predictedGrowth = ['exponential', 'linear', 'logarithmic'].includes(
      prediction.growthTrajectory
    )
      ? 'growing'
      : 'declining';

    if (actualGrowth === predictedGrowth) {
      correctTrajectories++;
    }

    // Check viral prediction accuracy
    const wasViral = actualViews > prediction.predictedViews * 2; // 2x growth is "viral"
    const predictedViral = prediction.viralProbability > 0.7;

    if (wasViral === predictedViral) {
      correctViralPredictions++;
    }
  });

  const count = predictions.length;

  return {
    meanAbsoluteError: totalAbsoluteError / count,
    meanPercentageError: totalPercentageError / count,
    trajectoryAccuracy: correctTrajectories / count,
    viralPredictionAccuracy: correctViralPredictions / count,
    withinConfidenceInterval: withinInterval / count,
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
  const trajectoryDist: Record<GrowthTrajectory, number> = {
    exponential: 0,
    linear: 0,
    logarithmic: 0,
    plateau: 0,
    declining: 0,
  };

  let totalViralProb = 0;
  const growthRates = predictions.map((p) => {
    trajectoryDist[p.growthTrajectory]++;
    totalViralProb += p.viralProbability;

    // Calculate growth rate
    const currentViews = p.predictedViews / 2; // Rough estimate of current
    const growthRate = (p.predictedViews - currentViews) / currentViews;

    return { prediction: p, growthRate };
  });

  const growthSummary = {
    highGrowth: growthRates.filter((g) => g.growthRate > 1).length,
    moderateGrowth: growthRates.filter((g) => g.growthRate >= 0.2 && g.growthRate <= 1).length,
    lowGrowth: growthRates.filter((g) => g.growthRate >= 0 && g.growthRate < 0.2).length,
    declining: growthRates.filter((g) => g.growthRate < 0).length,
  };

  return {
    totalPredictions: predictions.length,
    viralCandidates: predictions.filter((p) => p.viralProbability > 0.7).length,
    trajectoryDistribution: trajectoryDist,
    avgViralProbability: totalViralProb / predictions.length,
    topViralVideos: findViralCandidates(predictions, 5),
    growthSummary: growthSummary,
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
