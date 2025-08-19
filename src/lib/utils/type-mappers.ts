/**
 * Type Mapping Utilities
 * Maps between database snake_case and frontend camelCase conventions
 */

import type { Course, Lesson } from '@/types/course';
import type { VideoStats, Video, AlertCondition, TrendAnalysis, SourceFolder, Collection, OutlierDetectionResult, VideoMetrics, YouTubeVideo } from '@/types/youtube-lens';

/**
 * Maps database Course data (snake_case) to frontend Course type (camelCase)
 */
export function mapCourse(dbCourse: any): Course {
  if (!dbCourse) return dbCourse;
  
  return {
    ...dbCourse,
    // Map snake_case to camelCase
    studentCount: dbCourse.student_count ?? dbCourse.studentCount ?? 0,
    instructorName: dbCourse.instructor_name ?? dbCourse.instructorName ?? '',
    previewVideoUrl: dbCourse.preview_video_url ?? dbCourse.previewVideoUrl,
    totalDuration: dbCourse.total_duration ?? dbCourse.totalDuration ?? 0,
    averageRating: dbCourse.average_rating ?? dbCourse.averageRating ?? 0,
    reviewCount: dbCourse.review_count ?? dbCourse.reviewCount ?? 0,
    isFree: dbCourse.is_free ?? dbCourse.isFree ?? false,
    isPremium: dbCourse.is_premium ?? dbCourse.isPremium ?? false,
    previewEnabled: dbCourse.preview_enabled ?? dbCourse.previewEnabled ?? false,
    // Ensure other fields are properly typed
    price: Number(dbCourse.price) || 0,
    launchDate: dbCourse.launchDate || dbCourse.launch_date || '',
    status: dbCourse.status || 'upcoming',
  };
}

/**
 * Maps database Lesson data (snake_case) to frontend Lesson type (camelCase)
 */
export function mapLesson(dbLesson: any): Lesson {
  if (!dbLesson) return dbLesson;
  
  return {
    ...dbLesson,
    // Map snake_case to camelCase
    videoUrl: dbLesson.video_url ?? dbLesson.videoUrl,
    isFree: dbLesson.is_free ?? dbLesson.isFree ?? false,
    orderIndex: dbLesson.order_index ?? dbLesson.orderIndex ?? 0,
    // Ensure proper field names
    course_id: dbLesson.course_id || dbLesson.courseId || '',
    duration: Number(dbLesson.duration) || 0,
  };
}

/**
 * Maps database VideoStats data (snake_case) to frontend VideoStats type (camelCase)
 */
export function mapVideoStats(dbStats: any): VideoStats {
  if (!dbStats) return dbStats;
  
  return {
    ...dbStats,
    // Map snake_case to camelCase
    viralScore: dbStats.viral_score ?? dbStats.viralScore,
    engagementRate: dbStats.engagement_rate ?? dbStats.engagementRate,
    viewsPerHour: dbStats.views_per_hour ?? dbStats.viewsPerHour,
    // Keep snake_case fields that are defined as snake_case in the type
    view_count: dbStats.view_count ?? 0,
    like_count: dbStats.like_count ?? 0,
    comment_count: dbStats.comment_count ?? 0,
    video_id: dbStats.video_id || '',
    viewDelta: dbStats.viewDelta ?? 0,
    likeDelta: dbStats.likeDelta ?? 0,
    commentDelta: dbStats.commentDelta ?? 0,
    snapshotAt: dbStats.snapshotAt || dbStats.snapshot_at || '',
    created_at: dbStats.created_at || '',
  };
}

/**
 * Maps database Video data (snake_case) to frontend Video type (camelCase)
 */
export function mapVideo(dbVideo: any): Video {
  if (!dbVideo) return dbVideo;
  
  return {
    ...dbVideo,
    // Map snake_case to camelCase
    isShort: dbVideo.is_short ?? dbVideo.isShort ?? false,
    durationSeconds: dbVideo.duration_seconds ?? dbVideo.durationSeconds,
    // Keep fields that are already in the correct format
    video_id: dbVideo.video_id || '',
    channel_id: dbVideo.channel_id || '',
    published_at: dbVideo.published_at || '',
    firstSeenAt: dbVideo.firstSeenAt || dbVideo.first_seen_at || '',
    lastUpdatedAt: dbVideo.lastUpdatedAt || dbVideo.last_updated_at || '',
    created_at: dbVideo.created_at || '',
  };
}

/**
 * Maps frontend AlertCondition format to database format
 */
export function mapAlertCondition(condition: string): AlertCondition {
  const mapping: Record<string, AlertCondition> = {
    'greaterThan': 'greater_than',
    'lessThan': 'less_than',
    'changePercent': 'change_percent',
    // Also handle if already in correct format
    'greater_than': 'greater_than',
    'less_than': 'less_than',
    'change_percent': 'change_percent',
  };
  return mapping[condition] || condition as AlertCondition;
}

/**
 * Maps AlertCondition from database to frontend display format
 */
export function mapAlertConditionToDisplay(condition: AlertCondition | string): string {
  const mapping: Record<string, string> = {
    'greater_than': 'greaterThan',
    'less_than': 'lessThan',
    'change_percent': 'changePercent',
    // Handle if already in display format
    'greaterThan': 'greaterThan',
    'lessThan': 'lessThan',
    'changePercent': 'changePercent',
  };
  return mapping[condition] || condition;
}

/**
 * Maps database TrendAnalysis data (snake_case) to frontend TrendAnalysis type (camelCase)
 */
export function mapTrendAnalysis(dbTrend: any): TrendAnalysis {
  if (!dbTrend) return dbTrend;
  
  return {
    ...dbTrend,
    // Map snake_case to camelCase
    growthRate: dbTrend.growth_rate ?? dbTrend.growthRate ?? 0,
    // Keep other fields
    trend: dbTrend.trend || 'stable',
    prediction: dbTrend.prediction || null,
    confidence: dbTrend.confidence || 0,
  };
}

/**
 * Maps database SourceFolder data (snake_case) to frontend SourceFolder type (camelCase)
 */
export function mapSourceFolder(dbFolder: any): SourceFolder {
  if (!dbFolder) return dbFolder;
  
  return {
    ...dbFolder,
    // Map snake_case to camelCase
    folderChannels: dbFolder.folder_channels ?? dbFolder.folderChannels ?? [],
    // Keep other fields in their correct format
    user_id: dbFolder.user_id || '',
    autoMonitor: dbFolder.autoMonitor ?? false,
    monitorFrequencyHours: dbFolder.monitorFrequencyHours ?? 24,
    channelCount: dbFolder.channelCount ?? 0,
    isMonitoringEnabled: dbFolder.isMonitoringEnabled ?? false,
    checkIntervalHours: dbFolder.checkIntervalHours ?? 24,
    lastCheckedAt: dbFolder.lastCheckedAt || dbFolder.last_checked_at || null,
    created_at: dbFolder.created_at || '',
    updated_at: dbFolder.updated_at || '',
  };
}

/**
 * Maps database Collection data (snake_case) to frontend Collection type (camelCase)
 */
export function mapCollection(dbCollection: any): Collection {
  if (!dbCollection) return dbCollection;
  
  return {
    ...dbCollection,
    // Map snake_case to camelCase
    itemCount: dbCollection.item_count ?? dbCollection.itemCount ?? 0,
    // Keep other fields
    user_id: dbCollection.user_id || '',
    isPublic: dbCollection.is_public ?? dbCollection.isPublic ?? false,
    created_at: dbCollection.created_at || '',
    updated_at: dbCollection.updated_at || '',
  };
}

/**
 * Maps database OutlierDetectionResult data (snake_case) to frontend type (camelCase)
 */
export function mapOutlierDetectionResult(dbResult: any): OutlierDetectionResult {
  if (!dbResult) return dbResult;
  
  return {
    ...dbResult,
    // Map snake_case to camelCase
    isOutlier: dbResult.is_outlier ?? dbResult.isOutlier ?? false,
    outlierScore: dbResult.outlier_score ?? dbResult.outlierScore ?? 0,
    // Keep other fields
    threshold: dbResult.threshold || 0,
    reason: dbResult.reason || '',
  };
}

/**
 * Maps database VideoMetrics data (snake_case) to frontend VideoMetrics type (camelCase)
 */
export function mapVideoMetrics(dbMetrics: any): VideoMetrics {
  if (!dbMetrics) return dbMetrics;
  
  return {
    ...dbMetrics,
    // Map snake_case to camelCase
    engagementRate: dbMetrics.engagement_rate ?? dbMetrics.engagementRate ?? 0,
    viewsPerHour: dbMetrics.views_per_hour ?? dbMetrics.viewsPerHour ?? 0,
    // Keep other fields
    views: dbMetrics.views ?? 0,
    likes: dbMetrics.likes ?? 0,
    comments: dbMetrics.comments ?? 0,
  };
}

/**
 * Generic mapper for arrays
 */
export function mapArray<T>(items: any[], mapper: (item: any) => T): T[] {
  if (!Array.isArray(items)) return [];
  return items.map(mapper);
}

/**
 * Safe property access with fallback
 */
export function safeAccess<T>(obj: any, snakeCase: string, camelCase: string, defaultValue: T): T {
  return obj?.[snakeCase] ?? obj?.[camelCase] ?? defaultValue;
}

/**
 * Maps Video type to YouTubeVideo type for API compatibility
 */
export function mapVideoToYouTubeVideo(video: any): YouTubeVideo {
  if (!video) return video;
  
  const thumbnails = video.thumbnails || {};
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
    id: video.video_id || video.id,
    snippet: {
      title: video.title || '',
      description: video.description || '',
      channelId: video.channel_id || '',
      channelTitle: video.channel_title || video.channelTitle || '',
      publishedAt: video.published_at || video.publishedAt || '',
      thumbnails: parsedThumbnails,
      tags: video.tags || [],
    },
    statistics: {
      viewCount: video.stats?.view_count || 0,
      likeCount: video.stats?.like_count || 0,
      commentCount: video.stats?.comment_count || 0,
      favoriteCount: 0,
    },
    contentDetails: {
      duration: video.durationSeconds ? `PT${video.durationSeconds}S` : 'PT60S',
      dimension: '2d',
      definition: 'hd',
    },
    metrics: {
      vph: video.stats?.viewsPerHour || 0,
      engagementRate: video.stats?.engagementRate || 0,
      viralScore: video.stats?.viralScore || 0,
      growthRate: video.stats?.growthRate || 0,
      velocity: video.stats?.velocity || 0,
    },
  };
}