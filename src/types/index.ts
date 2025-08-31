/**
 * 중앙 타입 정의 파일 - YouTube 크리에이터 도구 사이트
 *
 * Single Source of Truth: Supabase 자동 생성 타입 기반
 * 통일된 네이밍: snake_case (DB = Frontend)
 *
 * 사용법:
 * import { User, UserApiKey, YouTubeVideo } from '@/types'
 */
import type { Database, Tables, TablesInsert, TablesUpdate } from './database.generated';

// ============= 기본 Database 타입 =============
export type { Database, Json } from './database.generated';

// Export helper types for use in components
export type { Tables, TablesInsert, TablesUpdate } from './database.generated';

// ============= Snake Case 원본 타입 (DB용) =============
export type DBTables = Database['public']['Tables'];
export type DBViews = Database['public']['Views'];

// DB 테이블 타입 (snake_case) - YouTube 크리에이터 도구 관련만
export type DBUser = Tables<'users'>;
export type DBUserApiKey = Tables<'user_api_keys'>;
export type DBProfile = Tables<'profiles'>; // View
export type DBAnalyticsLog = Tables<'analytics_logs'>;
export type DBApiUsage = Tables<'api_usage'>;
export type DBNotification = Tables<'notifications'>;

// YouTube 관련 테이블
export type DBYouTubeChannel = Tables<'yl_channels'>;
export type DBYouTubeVideo = Tables<'videos'>;
export type DBYouTubeStats = Tables<'video_stats'>;
export type DBChannelSubscription = Tables<'channel_subscriptions'>;
export type DBWebhookEvent = Tables<'webhook_events'>;
export type DBYouTubeFavorite = Tables<'youtube_favorites'>;
export type DBCollection = Tables<'collections'>;
export type DBCollectionItem = Tables<'collection_items'>;
export type DBSourceFolder = Tables<'source_folders'>;

// DB Insert 타입 (snake_case)
export type DBUserInsert = TablesInsert<'users'>;
export type DBUserApiKeyInsert = TablesInsert<'user_api_keys'>;
export type DBAnalyticsLogInsert = TablesInsert<'analytics_logs'>;
export type DBApiUsageInsert = TablesInsert<'api_usage'>;
export type DBNotificationInsert = TablesInsert<'notifications'>;

// YouTube 관련 Insert 타입
export type DBYouTubeChannelInsert = TablesInsert<'yl_channels'>;
export type DBYouTubeVideoInsert = TablesInsert<'videos'>;
export type DBYouTubeStatsInsert = TablesInsert<'video_stats'>;
export type DBChannelSubscriptionInsert = TablesInsert<'channel_subscriptions'>;
export type DBWebhookEventInsert = TablesInsert<'webhook_events'>;
export type DBYouTubeFavoriteInsert = TablesInsert<'youtube_favorites'>;
export type DBCollectionInsert = TablesInsert<'collections'>;
export type DBCollectionItemInsert = TablesInsert<'collection_items'>;

// DB Update 타입 (snake_case)
export type DBUserUpdate = TablesUpdate<'users'>;
export type DBUserApiKeyUpdate = TablesUpdate<'user_api_keys'>;
export type DBAnalyticsLogUpdate = TablesUpdate<'analytics_logs'>;
export type DBApiUsageUpdate = TablesUpdate<'api_usage'>;
export type DBNotificationUpdate = TablesUpdate<'notifications'>;

// YouTube 관련 Update 타입
export type DBYouTubeChannelUpdate = TablesUpdate<'yl_channels'>;
export type DBYouTubeVideoUpdate = TablesUpdate<'videos'>;
export type DBYouTubeStatsUpdate = TablesUpdate<'video_stats'>;
export type DBChannelSubscriptionUpdate = TablesUpdate<'channel_subscriptions'>;
export type DBWebhookEventUpdate = TablesUpdate<'webhook_events'>;
export type DBYouTubeFavoriteUpdate = TablesUpdate<'youtube_favorites'>;
export type DBCollectionUpdate = TablesUpdate<'collections'>;
export type DBCollectionItemUpdate = TablesUpdate<'collection_items'>;

// ============= Frontend 타입 (snake_case 직접 사용) =============

// 메인 엔티티 타입 (snake_case)
export type User = DBUser;
export type UserApiKey = DBUserApiKey;
export type Profile = DBProfile;
export type AnalyticsLog = DBAnalyticsLog;
export type ApiUsage = DBApiUsage;
export type Notification = DBNotification;

// YouTube 관련 타입
export type YouTubeChannel = DBYouTubeChannel;
export type YouTubeVideo = DBYouTubeVideo;
export type Video = DBYouTubeVideo; // Alias for YouTubeVideo
export type YouTubeStats = DBYouTubeStats;
export type YouTubeVideoStats = DBYouTubeStats;  // 별칭 추가
export type ChannelSubscription = DBChannelSubscription;
export type WebhookEvent = DBWebhookEvent;
export type YouTubeFavorite = DBYouTubeFavorite;
// Frontend Collection type with mapped fields
export type Collection = Omit<DBCollection, 'item_count'> & {
  itemCount: number;
};
export type CollectionItem = DBCollectionItem;
export type YouTubeCollection = DBCollection; // Alias for Collection
export type SourceFolder = DBSourceFolder;

// Insert 타입 (snake_case)
export type UserInsert = DBUserInsert;
export type UserApiKeyInsert = DBUserApiKeyInsert;
export type AnalyticsLogInsert = DBAnalyticsLogInsert;
export type ApiUsageInsert = DBApiUsageInsert;
export type NotificationInsert = DBNotificationInsert;

// YouTube Insert 타입
export type YouTubeChannelInsert = DBYouTubeChannelInsert;
export type YouTubeVideoInsert = DBYouTubeVideoInsert;
export type YouTubeStatsInsert = DBYouTubeStatsInsert;
export type ChannelSubscriptionInsert = DBChannelSubscriptionInsert;
export type WebhookEventInsert = DBWebhookEventInsert;
export type YouTubeFavoriteInsert = DBYouTubeFavoriteInsert;
export type CollectionInsert = DBCollectionInsert;
export type CollectionItemInsert = DBCollectionItemInsert;
export type YouTubeCollectionInsert = DBCollectionInsert; // Alias

// Update 타입 (snake_case)
export type UserUpdate = DBUserUpdate;
export type UserApiKeyUpdate = DBUserApiKeyUpdate;
export type AnalyticsLogUpdate = DBAnalyticsLogUpdate;
export type ApiUsageUpdate = DBApiUsageUpdate;
export type NotificationUpdate = DBNotificationUpdate;

// YouTube Update 타입
export type YouTubeChannelUpdate = DBYouTubeChannelUpdate;
export type YouTubeVideoUpdate = DBYouTubeVideoUpdate;
export type YouTubeStatsUpdate = DBYouTubeStatsUpdate;
export type ChannelSubscriptionUpdate = DBChannelSubscriptionUpdate;
export type WebhookEventUpdate = DBWebhookEventUpdate;
export type YouTubeFavoriteUpdate = DBYouTubeFavoriteUpdate;
export type CollectionUpdate = DBCollectionUpdate;
export type CollectionItemUpdate = DBCollectionItemUpdate;
export type YouTubeCollectionUpdate = DBCollectionUpdate; // Alias

// ============= YouTube Creator Tools 전용 타입 =============

// YouTube API 응답 타입
export interface YouTubeSearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeVideoItem[];
}

export interface YouTubeVideoItem {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: YouTubeThumbnail;
      medium: YouTubeThumbnail;
      high: YouTubeThumbnail;
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
}

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeChannelInfo {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: YouTubeThumbnail;
      medium: YouTubeThumbnail;
      high: YouTubeThumbnail;
    };
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    hiddenSubscriberCount: boolean;
    videoCount: string;
  };
}

// YouTube Lens 분석 데이터 타입
export interface ChannelAnalytics {
  channelId: string;
  title: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  averageViews: number;
  engagementRate: number;
  uploadFrequency: number;
  topPerformingVideos: YouTubeVideoItem[];
  recentGrowth: GrowthMetric[];
}

export interface GrowthMetric {
  date: string;
  subscribers: number;
  views: number;
  videos: number;
}

export interface KeywordTrend {
  keyword: string;
  searchVolume: number;
  competition: 'LOW' | 'MEDIUM' | 'HIGH';
  trend: 'RISING' | 'STABLE' | 'DECLINING';
  relatedKeywords: string[];
}

// Tool Status 타입
export type ToolStatus = 'live' | 'beta' | 'coming-soon' | 'planning';

// YouTube Lens 전용 분석 타입들

// VideoWithStats 타입 (PopularShortsList에서 사용)
export interface VideoWithStats {
  id: string; // id 속성 추가 (컴포넌트 호환성)
  video_id: string;
  title: string;
  description: string;
  channel_id: string;
  channel_title: string;
  published_at: string;
  view_count: number;
  like_count?: number;
  comment_count?: number;
  duration: string;
  thumbnail_url: string;
  tags?: string[];
  // 추가 속성들 (lib에서 사용)
  durationSeconds?: number;
  thumbnails?: { url: string; width?: number; height?: number }[];
  category_id?: string;
  languageCode?: string;
  // 통계 정보
  stats: {
    viewCount: number;
    likeCount?: number;
    commentCount?: number;
    engagement?: number;
    trendScore?: number;
    viewsPerHour?: number;
    engagementRate?: number;
    viralScore?: number;
    viewDelta?: number;
    likeDelta?: number;
    commentDelta?: number;
    view_count?: number;
    like_count?: number;
    comment_count?: number;
  };
}

// PopularShortsParams 타입
export interface PopularShortsParams {
  timeframe?: '1h' | '6h' | '24h' | '7d' | '30d';
  category?: string;
  category_id?: string;
  region?: string;
  maxResults?: number;
  order?: 'trending' | 'views' | 'recent' | 'engagement';
  // 추가 속성들 (lib에서 사용)
  regionCode?: string;
  period?: string;
  minViews?: number;
  minVPH?: number;
  limit?: number;
}

// YouTubeLensVideoStats 타입 별칭
export type YouTubeLensVideoStats = YouTubeVideoStats;
export interface EntityExtraction {
  videoId: string;
  entities: {
    keywords?: string[];
    topics?: string[];
    brands?: string[];
    people?: string[];
    locations?: string[];
    languages?: string[];
  };
  confidence: number;
  extractedAt: string;
  // 추가 속성 (컴포넌트에서 사용)
  language?: string;
}

export interface FlattenedYouTubeVideo {
  id: string; // id 속성 추가 (컴포넌트 호환성)
  video_id: string; // 기존 DB 필드 유지
  title: string;
  description: string;
  channel_id: string;
  channel_title: string;
  published_at: string;
  view_count: number;
  like_count?: number;
  comment_count?: number;
  duration: string;
  thumbnail_url: string;
  tags?: string[];
}


export interface TrendAnalysis {
  keyword: string;
  trend: 'RISING' | 'STABLE' | 'DECLINING';
  changePercent: number;
  searchVolume: number;
  competition: 'LOW' | 'MEDIUM' | 'HIGH';
  relatedTerms: string[];
  timeframe: string;
  // 추가 속성들 (컴포넌트에서 사용)
  growthRate?: number;
  frequency?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface OutlierResult {
  videoId: string;
  isOutlier: boolean;
  confidence: number;
  reason: string;
}

export interface PredictionResult {
  videoId: string;
  predictedViews: number;
  confidence: number;
  factors: string[];
}

export interface PredictionModel {
  video_id: string;
  predictedViews: number;
  predictedLikes: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  viralProbability: number;
  growthTrajectory: 'exponential' | 'linear' | 'logarithmic' | 'plateau' | 'declining';
  predictionDate: string;
  modelVersion: string;
  confidence?: number;
  accuracy?: number;
  factors?: string[];
}

export interface BatchAnalysisResult {
  outliers: OutlierResult[];
  trends: TrendAnalysis[];
  predictions: PredictionResult[];
  processingTimeMs: number;
  totalVideosAnalyzed: number;
}

export interface QuotaStatus {
  used: number;
  limit: number;
  remaining: number;
  resetTime: string;
  percentage: number;
  warning: boolean;
  critical: boolean;
  searchCount: number;
  videoCount: number;
}

// OAuth 토큰 타입
export interface OAuthToken {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope: string;
  created_at: number;
}

// YouTube 검색 필터 타입
export interface YouTubeSearchFilters {
  query?: string;
  order: 'relevance' | 'date' | 'rating' | 'viewCount' | 'title';
  publishedAfter?: string;
  publishedBefore?: string;
  duration?: 'all' | 'short' | 'medium' | 'long';
  definition?: 'all' | 'standard' | 'high';
  dimension?: 'all' | '2d' | '3d';
  license?: 'all' | 'creativeCommon' | 'youtube';
  maxResults: number;
  videoDuration?: 'all' | 'short' | 'medium' | 'long';
  videoDefinition?: 'all' | 'standard' | 'high';
  videoEmbeddable?: 'all' | 'true';
  channel_id?: string;
  relevanceLanguage?: string;
  regionCode?: string;
  safeSearch?: 'none' | 'moderate' | 'strict';
  pageToken?: string;
}


// Revenue Calculator 타입
export interface RevenueEstimate {
  dailyViews: number;
  cpm: number;
  dailyEarnings: number;
  monthlyEarnings: number;
  yearlyEarnings: number;
  currency: string;
}

export interface RevenueCalculatorInput {
  dailyViews: number;
  cpm?: number;
  niche: string;
  geography: string;
  audienceType: 'general' | 'targeted';
}

// ============= 공통 유틸리티 타입 =============

// API 응답 타입
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 에러 타입
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

// 폼 상태 타입
export interface FormState {
  isSubmitting: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// 정렬 옵션
export type SortOrder = 'asc' | 'desc';
export type SortField = string;

export interface SortOption {
  field: SortField;
  order: SortOrder;
}

// 필터 타입
export interface FilterOption {
  key: string;
  value: string | number | boolean;
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
}

// 날짜 범위 타입
export interface DateRange {
  startDate: string;
  endDate: string;
}

// ============= React Hook Form 타입 =============

// 로그인 폼
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 회원가입 폼
export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  terms: boolean;
}

// 프로필 업데이트 폼
export interface ProfileUpdateFormData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  website?: string;
}

// API 키 생성 폼
export interface ApiKeyCreateFormData {
  service_name: 'youtube';
  api_key: string;
  name?: string;
}

// YouTube 검색 폼
export interface YouTubeSearchFormData {
  query: string;
  maxResults?: number;
  order?: 'relevance' | 'date' | 'rating' | 'viewCount' | 'title';
}

// ============= 타입 가드 함수들 =============

export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj
  );
}

export function isYouTubeVideo(obj: unknown): obj is YouTubeVideo {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'video_id' in obj &&
    'title' in obj
  );
}

export function isAppError(obj: unknown): obj is AppError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'code' in obj &&
    'message' in obj
  );
}

// ============= 케이스 변환 유틸리티 함수 =============

/**
 * snake_case를 camelCase로 변환
 */
export function snakeToCamelCase<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamelCase) as T;
  }
  
  if (typeof obj === 'object') {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      converted[camelKey] = snakeToCamelCase(value);
    }
    return converted as T;
  }
  
  return obj;
}

/**
 * camelCase를 snake_case로 변환
 */
export function camelToSnakeCase<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(camelToSnakeCase) as T;
  }
  
  if (typeof obj === 'object') {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      converted[snakeKey] = camelToSnakeCase(value);
    }
    return converted as T;
  }
  
  return obj;
}

// ============= 추가 타입 정의 (누락된 exports) =============

// 필터 파라미터 타입
export interface FilterParams {
  [key: string]: string | number | boolean | undefined | null;
}

// YouTube Folder 타입  
export interface YouTubeFolder {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  channel_count?: number;
  is_active?: boolean;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  // 모니터링 관련 추가 속성
  isMonitoringEnabled?: boolean;
  folderChannels?: Array<{ channel_id: string; channels?: unknown; }>;
}

// Alert 조건 타입 (문자열 리터럴) - moved to monitoring section above


// Outlier Detection 결과 타입 (별칭 추가)
export type OutlierDetectionResult = OutlierResult;

// Video Metrics 타입
export interface VideoMetrics {
  video_id: string;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  engagement_rate: number | null;
  views_per_hour: number | null;
  viral_score: number | null;
  view_delta: number | null;
  like_delta: number | null;
  comment_delta: number | null;
  date: string;
  created_at: string | null;
  id: string;
}

// ============= Alert System Types (Monitoring) =============

// Alert types for YouTube monitoring system
export type AlertRuleType = 'threshold' | 'trending' | 'viral' | 'engagement' | 'growth';
export type AlertMetric = 'view_count' | 'vph' | 'engagementRate' | 'viralScore' | 'growthRate' | 'like_count' | 'comment_count' | 'subscriber_count';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertScope = 'video' | 'channel' | 'folder' | 'global';
export type AlertCondition = 'greater_than' | 'less_than' | 'change_percent';

// Complete Alert interface
export interface Alert {
  id: string;
  rule_id: string;
  user_id: string;
  video_id?: string;
  channel_id?: string;
  alertType: AlertRuleType;
  title: string;
  message: string;
  severity: AlertSeverity;
  metricValue?: number;
  triggeredAt: string;
  contextData?: {
    video_title?: string;
    channel_title?: string;
    [key: string]: unknown;
  };
  is_read: boolean;
  readAt?: string | null;
  isArchived: boolean;
  created_at: string;
}

// Alert Rule interface  
export interface AlertRule {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  ruleType: AlertRuleType;
  metric: AlertMetric;
  metricType: AlertMetric; // alias for metric
  condition: AlertCondition;
  comparisonOperator: '>' | '>=' | '<' | '<=' | '=' | '!=';
  thresholdValue: number;
  scope: AlertScope;
  scopeId?: string;
  is_active: boolean;
  cooldownHours: number;
  lastTriggeredAt?: string;
  created_at: string;
  updated_at: string;
}

// Source Folder Update type for monitoring
export interface SourceFolderUpdate {
  name?: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  isMonitoringEnabled?: boolean;
  channelCount?: number;
  [key: string]: unknown;
}