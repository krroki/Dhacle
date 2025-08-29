/**
 * Type Mapping Utilities
 * Maps between database snake_case and frontend camelCase conventions
 */

import type {
  AlertCondition,
  Collection,
  OutlierDetectionResult,
  PredictionModel,
  PredictionResult,
  SourceFolder,
  TrendAnalysis,
  Video,
  VideoMetrics,
  YouTubeVideoStats as VideoStats,
} from '@/types';

// Database row types - using flexible types since tables may not exist yet
type DBVideo = Partial<Video> & Record<string, unknown>;
type DBVideoStats = Partial<VideoStats> & Record<string, unknown>;
type DBSourceFolder = Partial<SourceFolder> & Record<string, unknown>;
type DBCollection = Partial<Collection> & Record<string, unknown>;
type DBTrendAnalysis = Partial<TrendAnalysis> & Record<string, unknown>;
type DBOutlierDetectionResult = Partial<OutlierDetectionResult> & Record<string, unknown>;
type DBVideoMetrics = Partial<VideoMetrics> & Record<string, unknown>;



/**
 * Maps database VideoStats data (snake_case) to frontend VideoStats type (camelCase)
 */
export function mapVideoStats(dbStats: DBVideoStats | VideoStats): VideoStats {
  if (!dbStats) {
    return dbStats;
  }

  const obj = dbStats as Record<string, unknown>;
  const stats = dbStats as VideoStats;

  return {
    ...dbStats,
    id: stats.id || obj.id || '',
    // Keep snake_case fields that are defined as snake_case in the VideoStats type
    viral_score: obj.viral_score ?? stats.viral_score ?? 0,
    engagement_rate: obj.engagement_rate ?? stats.engagement_rate ?? 0,
    views_per_hour: obj.views_per_hour ?? stats.views_per_hour ?? 0,
    view_count: obj.view_count ?? stats.view_count ?? 0,
    like_count: obj.like_count ?? stats.like_count ?? 0,
    comment_count: obj.comment_count ?? stats.comment_count ?? 0,
    video_id: (obj.video_id ?? stats.video_id) || '',
    view_delta: obj.view_delta ?? stats.view_delta ?? 0,
    like_delta: obj.like_delta ?? stats.like_delta ?? 0,
    comment_delta: obj.comment_delta ?? stats.comment_delta ?? 0,
    date: (obj.date ?? stats.date) || new Date().toISOString().split('T')[0],
    created_at: (obj.created_at ?? stats.created_at) || '',
  } as VideoStats;
}

/**
 * Maps database Video data (snake_case) to frontend Video type (snake_case)
 * Note: Video type is now directly using database schema (snake_case)
 */
export function mapVideo(dbVideo: DBVideo | Video): Video {
  if (!dbVideo) {
    return dbVideo;
  }

  const obj = dbVideo as Record<string, unknown>;
  const video = dbVideo as Video;

  return {
    ...dbVideo,
    id: (video.id || obj.id || '') as string,
    channel_id: (obj.channel_id ?? video.channel_id) as string,
    title: (obj.title ?? video.title) as string,
    description: (obj.description ?? video.description) as string | null,
    published_at: (obj.published_at ?? video.published_at) as string | null,
    duration: (obj.duration ?? video.duration) as string | null,
    view_count: (obj.view_count ?? video.view_count) as number | null,
    like_count: (obj.like_count ?? video.like_count) as number | null,
    comment_count: (obj.comment_count ?? video.comment_count) as number | null,
    thumbnail_url: (obj.thumbnail_url ?? video.thumbnail_url) as string | null,
    category_id: (obj.category_id ?? video.category_id) as string | null,
    tags: (obj.tags ?? video.tags) as string[] | null,
    created_at: (obj.created_at ?? video.created_at) as string | null,
    updated_at: (obj.updated_at ?? video.updated_at) as string | null,
    // Optional fields with defaults
    default_language: (obj.default_language ?? video.default_language) as string | null,
    default_audio_language: (obj.default_audio_language ?? video.default_audio_language) as string | null,
    privacy_status: (obj.privacy_status ?? video.privacy_status) as string | null,
    live_broadcast_content: (obj.live_broadcast_content ?? video.live_broadcast_content) as string | null,
    is_live: (obj.is_live ?? video.is_live) as boolean | null,
    made_for_kids: (obj.made_for_kids ?? video.made_for_kids) as boolean | null,
  } as Video;
}

/**
 * Maps frontend AlertCondition format to database format
 */
export function mapAlertCondition(condition: string): AlertCondition {
  const mapping: Record<string, AlertCondition> = {
    greaterThan: 'greater_than',
    lessThan: 'less_than',
    changePercent: 'change_percent',
    // Also handle if already in correct format
    greater_than: 'greater_than',
    less_than: 'less_than',
    change_percent: 'change_percent',
  };
  return mapping[condition] || (condition as AlertCondition);
}

/**
 * Maps AlertCondition from database to frontend display format
 */
export function mapAlertConditionToDisplay(condition: AlertCondition | string): string {
  const mapping: Record<string, string> = {
    greater_than: 'greaterThan',
    less_than: 'lessThan',
    change_percent: 'changePercent',
    // Handle if already in display format
    greaterThan: 'greaterThan',
    lessThan: 'lessThan',
    changePercent: 'changePercent',
  };
  return mapping[condition] || condition;
}

/**
 * Maps database TrendAnalysis data (snake_case) to frontend TrendAnalysis type (camelCase)
 */
export function mapTrendAnalysis(dbTrend: DBTrendAnalysis | TrendAnalysis): TrendAnalysis {
  if (!dbTrend) {
    return dbTrend;
  }

  const obj = dbTrend as Record<string, unknown>;
  const trend = dbTrend as TrendAnalysis;

  return {
    // 필수 필드들
    keyword: (trend.keyword || obj.keyword || '') as string,
    trend: (trend.trend || obj.trend || 'STABLE') as 'RISING' | 'STABLE' | 'DECLINING',
    changePercent: Number(obj.change_percent ?? trend.changePercent) || 0,
    searchVolume: Number(obj.search_volume ?? trend.searchVolume) || 0,
    competition: (trend.competition || obj.competition || 'LOW') as 'LOW' | 'MEDIUM' | 'HIGH',
    relatedTerms: (trend.relatedTerms || obj.related_terms || obj.relatedTerms || []) as string[],
    timeframe: (trend.timeframe || obj.timeframe || 'recent') as string,
    
    // 선택적 필드들
    growthRate: Number(obj.growth_rate ?? trend.growthRate) || undefined,
    frequency: Number(trend.frequency || obj.frequency) || undefined,
    sentiment: (trend.sentiment || obj.sentiment || undefined) as 'positive' | 'negative' | 'neutral' | undefined,
  } as TrendAnalysis;
}

/**
 * Maps database SourceFolder data (snake_case) to frontend SourceFolder type (snake_case)
 * Note: SourceFolder now uses direct database schema (snake_case)
 */
export function mapSourceFolder(dbFolder: DBSourceFolder | SourceFolder): SourceFolder {
  if (!dbFolder) {
    return dbFolder;
  }

  const obj = dbFolder as Record<string, unknown>;
  const folder = dbFolder as SourceFolder;

  return {
    id: (folder.id || obj.id || '') as string,
    name: (folder.name || obj.name || '') as string,
    description: (folder.description || obj.description) as string | null,
    user_id: (folder.user_id || obj.user_id || '') as string,
    channel_count: (folder.channel_count ?? obj.channel_count) as number | null,
    is_active: (folder.is_active ?? obj.is_active) as boolean | null,
    color: (folder.color || obj.color) as string | null,
    icon: (folder.icon || obj.icon) as string | null,
    created_at: (folder.created_at || obj.created_at) as string | null,
    updated_at: (folder.updated_at || obj.updated_at) as string | null,
  } as SourceFolder;
}

/**
 * Maps database Collection data (snake_case) to frontend Collection type (camelCase)
 */
export function mapCollection(dbCollection: DBCollection | Collection): Collection {
  if (!dbCollection) {
    return dbCollection;
  }

  const obj = dbCollection as Record<string, unknown>;
  const collection = dbCollection as Collection;

  return {
    ...dbCollection,
    id: collection.id || (obj.id as string) || '',
    // Map snake_case to camelCase
    itemCount: obj.item_count ?? collection.itemCount ?? 0,
    // Keep other fields
    user_id: collection.user_id || (obj.user_id as string) || '',
    is_public: obj.is_public ?? collection.is_public ?? false,
    created_at: collection.created_at || (obj.created_at as string) || '',
    updated_at: collection.updated_at || (obj.updated_at as string) || '',
  } as Collection;
}

/**
 * Maps database OutlierDetectionResult data to frontend OutlierResult type
 */
export function mapOutlierDetectionResult(
  dbResult: DBOutlierDetectionResult | OutlierDetectionResult
): OutlierDetectionResult {
  if (!dbResult) {
    return dbResult;
  }

  const obj = dbResult as Record<string, unknown>;
  const result = dbResult as OutlierDetectionResult;

  return {
    videoId: (result.videoId || obj.video_id || obj.videoId || '') as string,
    isOutlier: Boolean(obj.is_outlier ?? result.isOutlier ?? false),
    confidence: Number(result.confidence || obj.confidence || 0),
    reason: (result.reason || obj.reason || 'No reason provided') as string,
  } as OutlierDetectionResult;
}

/**
 * Maps database VideoMetrics data (snake_case) to frontend VideoMetrics type (snake_case)
 * Note: VideoMetrics uses database schema (snake_case)
 */
export function mapVideoMetrics(dbMetrics: DBVideoMetrics | VideoMetrics): VideoMetrics {
  if (!dbMetrics) {
    return dbMetrics;
  }

  const obj = dbMetrics as Record<string, unknown>;
  const metrics = dbMetrics as VideoMetrics;

  return {
    id: (metrics.id || obj.id || '') as string,
    video_id: (metrics.video_id || obj.video_id || '') as string,
    view_count: (metrics.view_count ?? obj.view_count) as number | null,
    like_count: (metrics.like_count ?? obj.like_count) as number | null,
    comment_count: (metrics.comment_count ?? obj.comment_count) as number | null,
    engagement_rate: (obj.engagement_rate ?? metrics.engagement_rate) as number | null,
    views_per_hour: (obj.views_per_hour ?? metrics.views_per_hour) as number | null,
    viral_score: (obj.viral_score ?? metrics.viral_score) as number | null,
    view_delta: (obj.view_delta ?? metrics.view_delta) as number | null,
    like_delta: (obj.like_delta ?? metrics.like_delta) as number | null,
    comment_delta: (obj.comment_delta ?? metrics.comment_delta) as number | null,
    date: (metrics.date || obj.date || new Date().toISOString().split('T')[0]) as string,
    created_at: (metrics.created_at || obj.created_at) as string | null,
  } as VideoMetrics;
}

/**
 * Generic mapper for arrays
 */
export function mapArray<T, U>(items: U[], mapper: (item: U) => T): T[] {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.map(mapper);
}

/**
 * Safe property access with fallback
 */
export function safeAccess<T>(
  obj: unknown,
  snakeCase: string,
  camelCase: string,
  defaultValue: T
): T {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }
  const record = obj as Record<string, unknown>;
  return (record[snakeCase] ?? record[camelCase] ?? defaultValue) as T;
}

/**
 * Maps PredictionModel to PredictionResult for BatchAnalysisResult
 */
export function mapPredictionModel(prediction: PredictionModel): PredictionResult {
  if (!prediction) {
    return prediction as PredictionResult;
  }

  return {
    videoId: prediction.video_id || '',
    predictedViews: prediction.predictedViews || 0,
    confidence: prediction.confidence || prediction.viralProbability || 0,
    factors: prediction.factors || [
      `Growth: ${prediction.growthTrajectory}`,
      `Viral probability: ${(prediction.viralProbability * 100).toFixed(1)}%`,
    ],
  } as PredictionResult;
}

