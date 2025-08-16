/**
 * YouTube Lens Type Definitions
 * Generated from Phase 1 Database Schema
 * Created: 2025-01-21
 */

// ============================================
// Core Data Types
// ============================================

export interface Video {
  id: string;
  video_id: string;
  title: string;
  description: string | null;
  channel_id: string;
  published_at: string;
  duration_seconds: number | null;
  is_short: boolean;
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
    standard?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  } | null;
  tags: string[] | null;
  category_id: string | null;
  language_code: string | null;
  region_code: string | null;
  first_seen_at: string;
  last_updated_at: string;
  created_at: string;
  deleted_at: string | null;
}

export interface VideoStats {
  id: string;
  video_id: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  views_per_hour: number | null;
  engagement_rate: number | null;
  viral_score: number | null;
  view_delta: number;
  like_delta: number;
  comment_delta: number;
  snapshot_at: string;
  created_at: string;
}

export interface Channel {
  id: string;
  channel_id: string;
  title: string;
  description: string | null;
  custom_url: string | null;
  subscriber_count: number;
  video_count: number;
  view_count: number;
  country: string | null;
  published_at: string | null;
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
  } | null;
  is_monitored: boolean;
  monitor_frequency_hours: number;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SourceFolder {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  auto_monitor: boolean;
  monitor_frequency_hours: number;
  channel_count: number;
  is_monitoring_enabled: boolean;
  check_interval_hours: number;
  last_checked_at: string | null;
  folder_channels?: FolderChannel[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FolderChannel {
  id: string;
  folder_id: string;
  channel_id: string;
  custom_frequency_hours: number | null;
  notes: string | null;
  added_at: string;
}

export type AlertRuleType = 'threshold' | 'trend' | 'anomaly';
export type AlertMetric = 'views' | 'vph' | 'engagement' | 'viral_score';
export type AlertCondition = 'greater_than' | 'less_than' | 'change_percent';
export type AlertScope = 'video' | 'channel' | 'folder';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertRule {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  rule_type: AlertRuleType;
  metric: AlertMetric;
  metric_type?: 'view_count' | 'vph' | 'engagement_rate' | 'viral_score' | 'growth_rate';
  condition: AlertCondition;
  comparison_operator?: '>' | '>=' | '<' | '<=' | '=' | '!=';
  threshold_value: number;
  scope: AlertScope;
  scope_id: string | null;
  is_active: boolean;
  cooldown_hours: number;
  notify_email: boolean;
  notify_app: boolean;
  created_at: string;
  updated_at: string;
  last_triggered_at: string | null;
  trigger_count: number;
}

export interface Alert {
  id: string;
  rule_id: string;
  user_id: string;
  video_id?: string;
  channel_id?: string;
  alert_type: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  metric_value?: number;
  triggered_at?: string;
  context_data: Record<string, any> | null;
  is_read: boolean;
  read_at: string | null;
  is_archived: boolean;
  created_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  cover_image: string | null;
  tags: string[] | null;
  item_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  video_id: string;
  notes: string | null;
  tags: string[] | null;
  position: number;
  added_at: string;
  added_by: string | null;
}

export type SearchType = 'keyword' | 'popular' | 'channel' | 'trending';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  search_params: {
    query?: string;
    regionCode?: string;
    categoryId?: string;
    order?: string;
    publishedAfter?: string;
    publishedBefore?: string;
    videoDuration?: string;
    maxResults?: number;
    channelId?: string;
    [key: string]: any;
  };
  search_type: SearchType;
  auto_run: boolean;
  run_frequency_hours: number;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
  use_count: number;
}

export type PlanType = 'free' | 'pro' | 'team';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';
export type TeamRole = 'owner' | 'admin' | 'member';
export type BillingCycle = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: PlanType;
  status: SubscriptionStatus;
  api_quota_daily: number;
  max_monitors: number;
  max_alerts: number;
  max_collections: number;
  max_saved_searches: number;
  team_id: string | null;
  team_role: TeamRole | null;
  billing_cycle: BillingCycle | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
}

// ============================================
// YouTube API Types
// ============================================

export interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      default?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
      standard?: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    tags?: string[];
  };
  statistics: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
    favoriteCount?: number;
  };
  contentDetails: {
    duration: string;
    dimension?: string;
    definition?: string;
  };
  metrics?: VideoMetrics;
}

export interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
    };
    country?: string;
  };
  statistics: {
    viewCount: number;
    subscriberCount: number;
    videoCount: number;
    hiddenSubscriberCount: boolean;
  };
  brandingSettings?: {
    channel?: {
      title?: string;
      description?: string;
      keywords?: string;
    };
  };
}

// ============================================
// API Response Types
// ============================================

export interface VideoWithStats extends Video {
  stats?: VideoStats;
  channel?: Channel;
}

export interface ChannelWithVideos extends Channel {
  recent_videos?: Video[];
  latest_stats?: {
    total_views: number;
    total_videos: number;
    avg_views_per_video: number;
  };
}

export interface FolderWithChannels extends SourceFolder {
  channels?: Channel[];
}

export interface CollectionWithItems extends Collection {
  items?: (CollectionItem & { video?: Video })[];
}

export interface AlertWithRule extends Alert {
  rule?: AlertRule;
}

// ============================================
// Request/Query Types
// ============================================

export interface SearchVideosParams {
  query?: string;
  regionCode?: string;
  categoryId?: string;
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'viewCount';
  publishedAfter?: string;
  publishedBefore?: string;
  videoDuration?: 'short' | 'medium' | 'long';
  maxResults?: number;
  pageToken?: string;
  channelId?: string;
}

export interface PopularShortsParams {
  regionCode?: string;
  categoryId?: string;
  period?: '1h' | '6h' | '24h' | '7d' | '30d' | '1d';
  minViews?: number;
  minVPH?: number;
  limit?: number;
  maxResults?: number;
}

export interface MonitoringConfig {
  folderId?: string;
  channelIds?: string[];
  frequency?: number;
  metrics?: AlertMetric[];
  thresholds?: {
    metric: AlertMetric;
    value: number;
    condition: AlertCondition;
  }[];
}

// ============================================
// Metrics Types
// ============================================

export interface VideoMetrics {
  vph: number; // Views Per Hour
  engagement_rate: number; // (likes + comments) / views * 100
  viral_score: number; // Custom algorithm
  growth_rate: number; // View growth percentage
  velocity: number; // Rate of change in views
}

export interface ChannelMetrics {
  avg_views: number;
  avg_engagement: number;
  upload_frequency: number; // Videos per day
  subscriber_growth: number; // Percentage
  performance_score: number; // Overall channel health
}

// ============================================
// UI State Types
// ============================================

export interface YouTubeLensState {
  // Search state
  searchQuery: string;
  searchParams: SearchVideosParams;
  searchResults: Video[];
  isSearching: boolean;
  searchError: string | null;

  // Popular shorts state  
  popularShorts: VideoWithStats[];
  isLoadingPopular: boolean;
  popularError: string | null;

  // Monitoring state
  monitoredChannels: Channel[];
  folders: SourceFolder[];
  activeFolder: string | null;

  // Alerts state
  alerts: Alert[];
  unreadAlertCount: number;
  alertRules: AlertRule[];

  // Collections state
  collections: Collection[];
  activeCollection: string | null;

  // User state
  subscription: Subscription | null;
  apiUsage: {
    used: number;
    limit: number;
    resetAt: string;
  };
}

// ============================================
// Utility Types
// ============================================

export type SortOrder = 'asc' | 'desc';

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface FilterOptions {
  isShort?: boolean;
  minViews?: number;
  maxViews?: number;
  minDuration?: number;
  maxDuration?: number;
  categories?: string[];
  languages?: string[];
  regions?: string[];
}

// ============================================
// Error Types
// ============================================

export interface YouTubeLensError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export class APIKeyMissingError extends Error {
  constructor(message: string = 'YouTube API key is not configured') {
    super(message);
    this.name = 'APIKeyMissingError';
  }
}

// ============================================
// Constants
// ============================================

export const YOUTUBE_CATEGORIES = {
  '1': 'Film & Animation',
  '2': 'Autos & Vehicles',
  '10': 'Music',
  '15': 'Pets & Animals',
  '17': 'Sports',
  '19': 'Travel & Events',
  '20': 'Gaming',
  '22': 'People & Blogs',
  '23': 'Comedy',
  '24': 'Entertainment',
  '25': 'News & Politics',
  '26': 'Howto & Style',
  '27': 'Education',
  '28': 'Science & Technology',
} as const;

export const REGION_CODES = {
  'US': 'United States',
  'KR': 'South Korea',
  'JP': 'Japan',
  'GB': 'United Kingdom',
  'DE': 'Germany',
  'FR': 'France',
  'BR': 'Brazil',
  'IN': 'India',
  'ID': 'Indonesia',
} as const;

// ============================================
// Phase 4: Advanced Analytics Types
// ============================================

export interface OutlierDetectionResult {
  video_id: string;
  z_score: number;
  mad_score: number;
  combined_score: number;
  is_outlier: boolean;
  outlier_type: 'positive' | 'negative' | null;
  metrics: {
    view_count: number;
    like_count: number;
    comment_count: number;
    vph: number;
  };
  percentile: number;
  timestamp: string;
}

export interface TrendAnalysis {
  keyword: string;
  frequency: number;
  growth_rate: number;
  first_seen: string;
  last_seen: string;
  related_videos: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface EntityExtraction {
  entities: {
    keywords: string[];
    topics: string[];
    brands: string[];
    people: string[];
    locations: string[];
  };
  language: string;
  confidence: number;
  processed_at: string;
}

export interface PredictionModel {
  video_id: string;
  predicted_views: number;
  predicted_likes: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  viral_probability: number;
  growth_trajectory: 'exponential' | 'linear' | 'logarithmic' | 'plateau' | 'declining';
  prediction_date: string;
  model_version: string;
}

export interface AnalyticsConfig {
  outlier_threshold: number; // Default: 3 (z-score)
  mad_multiplier: number; // Default: 2.5
  trend_window_days: number; // Default: 7
  prediction_horizon_days: number; // Default: 30
  nlp_confidence_threshold: number; // Default: 0.7
  batch_size: number; // Default: 100
}

export interface BatchAnalysisResult {
  outliers: OutlierDetectionResult[];
  trends: TrendAnalysis[];
  predictions: PredictionModel[];
  processing_time_ms: number;
  total_videos_analyzed: number;
  timestamp: string;
}

export const DEFAULT_LIMITS = {
  FREE: {
    api_quota_daily: 1000,
    max_monitors: 10,
    max_alerts: 5,
    max_collections: 3,
    max_saved_searches: 10,
  },
  PRO: {
    api_quota_daily: 10000,
    max_monitors: 100,
    max_alerts: 50,
    max_collections: 20,
    max_saved_searches: 100,
  },
  TEAM: {
    api_quota_daily: 50000,
    max_monitors: 500,
    max_alerts: 200,
    max_collections: 100,
    max_saved_searches: 500,
  },
} as const;