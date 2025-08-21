/**
 * Type Mapping Utilities
 * Maps between database snake_case and frontend camelCase conventions
 */

import type { Course, Lesson } from '@/types/course';
import type {
  AlertCondition,
  Collection,
  OutlierDetectionResult,
  SourceFolder,
  TrendAnalysis,
  Video,
  VideoMetrics,
  VideoStats,
  YouTubeVideo,
} from '@/types/youtube-lens';

// Database row types - using flexible types since tables may not exist yet
type DBVideo = Partial<Video> & Record<string, unknown>;
type DBVideoStats = Partial<VideoStats> & Record<string, unknown>;
type DBChannel = Record<string, unknown>;
type DBSourceFolder = Partial<SourceFolder> & Record<string, unknown>;
type DBCollection = Partial<Collection> & Record<string, unknown>;
type DBCourse = Partial<Course> & Record<string, unknown>;
type DBLesson = Partial<Lesson> & Record<string, unknown>;
type DBTrendAnalysis = Partial<TrendAnalysis> & Record<string, unknown>;
type DBOutlierDetectionResult = Partial<OutlierDetectionResult> & Record<string, unknown>;
type DBVideoMetrics = Partial<VideoMetrics> & Record<string, unknown>;

/**
 * Maps database Course data (snake_case) to frontend Course type (camelCase)
 */
export function mapCourse(dbCourse: DBCourse | Course): Course {
  if (!dbCourse) {
    return dbCourse;
  }

  const obj = dbCourse as Record<string, unknown>;
  const course = dbCourse as Course;

  return {
    id: obj.id || course.id || '',
    title: obj.title || course.title || '',
    description: obj.description || course.description || undefined,
    instructorName: obj.instructor_name ?? course.instructorName ?? 'Unknown',
    instructorId: obj.instructor_id || course.instructorId || '',
    thumbnailUrl: obj.thumbnail_url || course.thumbnailUrl || undefined,
    price: Number(obj.price ?? course.price) || 0,
    isFree: obj.price === 0 || course.isFree || false,
    isPremium: (obj.price && Number(obj.price) > 0) || course.isPremium || false,
    totalDuration: (Number(obj.duration_weeks ?? course.totalDuration) || 8) * 7 * 60,
    difficultyLevel: obj.difficulty_level || course.difficultyLevel || 'beginner',
    categoryId: obj.category || course.categoryId || '',
    averageRating: Number(obj.average_rating ?? course.averageRating) || 0,
    totalStudents: Number(obj.total_students ?? course.totalStudents) || 0,
    status: obj.status || course.status || 'active',
    curriculum: obj.curriculum || course.curriculum || {},
    whatYoullLearn: obj.what_youll_learn || course.whatYoullLearn || [],
    createdAt: obj.created_at || course.createdAt || '',
    updatedAt: obj.updated_at || course.updatedAt || obj.created_at || course.createdAt || ''
  } as Course;
}

/**
 * Maps database Lesson data (snake_case) to frontend Lesson type (camelCase)
 */
export function mapLesson(dbLesson: DBLesson | Lesson): Lesson {
  if (!dbLesson) {
    return dbLesson;
  }

  const obj = dbLesson as Record<string, unknown>;
  const lesson = dbLesson as Lesson;

  return {
    ...dbLesson,
    // Map snake_case to camelCase
    videoUrl: obj.video_url ?? lesson.videoUrl,
    isFree: obj.is_free ?? lesson.isFree ?? false,
    orderIndex: obj.order_index ?? lesson.orderIndex ?? 0,
    // Ensure proper field names
    course_id: obj.course_id || obj.courseId || lesson.course_id || '',
    duration: Number(lesson.duration) || 0,
  } as Lesson;
}

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
    // Map snake_case to camelCase
    viralScore: obj.viral_score ?? stats.viralScore,
    engagementRate: obj.engagement_rate ?? stats.engagementRate,
    viewsPerHour: obj.views_per_hour ?? stats.viewsPerHour,
    // Keep snake_case fields that are defined as snake_case in the type
    view_count: obj.view_count ?? stats.view_count ?? 0,
    like_count: obj.like_count ?? stats.like_count ?? 0,
    comment_count: obj.comment_count ?? stats.comment_count ?? 0,
    video_id: (obj.video_id ?? stats.video_id) || '',
    viewDelta: stats.viewDelta ?? 0,
    likeDelta: stats.likeDelta ?? 0,
    commentDelta: stats.commentDelta ?? 0,
    snapshotAt: stats.snapshotAt || (obj.snapshot_at as string) || '',
    created_at: (obj.created_at ?? stats.created_at) || '',
  } as VideoStats;
}

/**
 * Maps database Video data (snake_case) to frontend Video type (camelCase)
 */
export function mapVideo(dbVideo: DBVideo | Video): Video {
  if (!dbVideo) {
    return dbVideo;
  }

  const obj = dbVideo as Record<string, unknown>;
  const video = dbVideo as Video;

  return {
    ...dbVideo,
    id: video.id || obj.id || '',
    // Map snake_case to camelCase
    isShort: obj.is_short ?? video.isShort ?? false,
    durationSeconds: obj.duration_seconds ?? video.durationSeconds,
    // Keep fields that are already in the correct format
    video_id: (obj.video_id ?? video.video_id) || '',
    channel_id: (obj.channel_id ?? video.channel_id) || '',
    published_at: (obj.published_at ?? video.published_at) || '',
    firstSeenAt: video.firstSeenAt || (obj.first_seen_at as string) || '',
    lastUpdatedAt: video.lastUpdatedAt || (obj.last_updated_at as string) || '',
    created_at: (obj.created_at ?? video.created_at) || '',
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
    keyword: trend.keyword || obj.keyword || '',
    frequency: trend.frequency || obj.frequency || 0,
    growthRate: obj.growth_rate ?? trend.growthRate ?? 0,
    firstSeen: trend.firstSeen || obj.firstSeen || '',
    lastSeen: trend.lastSeen || obj.lastSeen || '',
    relatedVideos: trend.relatedVideos || obj.relatedVideos || [],
    sentiment: trend.sentiment || obj.sentiment || 'neutral',
    confidence: trend.confidence || obj.confidence || 0,
  } as TrendAnalysis;
}

/**
 * Maps database SourceFolder data (snake_case) to frontend SourceFolder type (camelCase)
 */
export function mapSourceFolder(dbFolder: DBSourceFolder | SourceFolder): SourceFolder {
  if (!dbFolder) {
    return dbFolder;
  }

  const obj = dbFolder as Record<string, unknown>;
  const folder = dbFolder as SourceFolder;

  return {
    ...dbFolder,
    id: folder.id || (obj.id as string) || '',
    // Map snake_case to camelCase
    folderChannels: obj.folder_channels ?? folder.folderChannels ?? [],
    // Keep other fields in their correct format
    user_id: folder.user_id || (obj.user_id as string) || '',
    autoMonitor: folder.autoMonitor ?? false,
    monitorFrequencyHours: folder.monitorFrequencyHours ?? 24,
    channelCount: folder.channelCount ?? 0,
    isMonitoringEnabled: folder.isMonitoringEnabled ?? false,
    checkIntervalHours: folder.checkIntervalHours ?? 24,
    lastCheckedAt: folder.lastCheckedAt || (obj.last_checked_at as string) || null,
    created_at: folder.created_at || (obj.created_at as string) || '',
    updated_at: folder.updated_at || (obj.updated_at as string) || '',
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
 * Maps database OutlierDetectionResult data (snake_case) to frontend type (camelCase)
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
    video_id: result.video_id || (obj.video_id as string) || '',
    zScore: result.zScore || (obj.zScore as number) || 0,
    madScore: result.madScore || (obj.madScore as number) || 0,
    combinedScore: result.combinedScore || (obj.combinedScore as number) || 0,
    isOutlier: obj.is_outlier ?? result.isOutlier ?? false,
    outlierType: result.outlierType || (obj.outlierType as 'positive' | 'negative' | null) || null,
    metrics: result.metrics ||
      (obj.metrics as OutlierDetectionResult['metrics']) || {
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        vph: 0,
      },
    percentile: result.percentile || (obj.percentile as number) || 0,
    timestamp: result.timestamp || (obj.timestamp as string) || '',
  } as OutlierDetectionResult;
}

/**
 * Maps database VideoMetrics data (snake_case) to frontend VideoMetrics type (camelCase)
 */
export function mapVideoMetrics(dbMetrics: DBVideoMetrics | VideoMetrics): VideoMetrics {
  if (!dbMetrics) {
    return dbMetrics;
  }

  const obj = dbMetrics as Record<string, unknown>;
  const metrics = dbMetrics as VideoMetrics;

  return {
    vph: metrics.vph || (obj.vph as number) || 0,
    engagementRate: obj.engagement_rate ?? metrics.engagementRate ?? 0,
    viralScore: metrics.viralScore || (obj.viralScore as number) || 0,
    growthRate: metrics.growthRate || (obj.growthRate as number) || 0,
    velocity: metrics.velocity || (obj.velocity as number) || 0,
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
 * Maps Video type to YouTubeVideo type for API compatibility
 */
export function mapVideoToYouTubeVideo(
  video: (DBVideo & { stats?: DBVideoStats }) | (Video & { stats?: VideoStats })
): YouTubeVideo {
  if (!video) {
    return video;
  }

  const obj = video as Record<string, unknown>;
  const vid = video as Video;

  const thumbnails = vid.thumbnails || obj.thumbnails || {};
  let parsedThumbnails = thumbnails;

  // Handle string thumbnails (JSON)
  if (typeof thumbnails === 'string') {
    try {
      parsedThumbnails = JSON.parse(thumbnails);
    } catch {
      parsedThumbnails = {};
    }
  }

  return {
    id: vid.video_id || (obj.video_id as string) || vid.id || (obj.id as string) || '',
    snippet: {
      title: vid.title || (obj.title as string) || '',
      description: vid.description || (obj.description as string) || '',
      channelId: vid.channel_id || (obj.channel_id as string) || '',
      channelTitle: (obj.channel_title as string) || (obj.channelTitle as string) || '',
      publishedAt:
        vid.published_at || (obj.published_at as string) || (obj.publishedAt as string) || '',
      thumbnails: parsedThumbnails,
      tags: vid.tags || (obj.tags as string[]) || [],
    },
    statistics: {
      viewCount: video.stats?.view_count || 0,
      likeCount: video.stats?.like_count || 0,
      commentCount: video.stats?.comment_count || 0,
      favoriteCount: 0,
    },
    contentDetails: {
      duration: vid.durationSeconds ? `PT${vid.durationSeconds}S` : 'PT60S',
      dimension: '2d',
      definition: 'hd',
    },
    metrics: {
      vph: video.stats?.viewsPerHour || 0,
      engagementRate: video.stats?.engagementRate || 0,
      viralScore: video.stats?.viralScore || 0,
      growthRate: ((video.stats as Record<string, unknown>)?.growthRate as number) || 0,
      velocity: ((video.stats as Record<string, unknown>)?.velocity as number) || 0,
    },
  };
}
