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
  durationSeconds: number | null;
  isShort: boolean;
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
    standard?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  } | null;
  tags: string[] | null;
  category_id: string | null;
  languageCode: string | null;
  regionCode: string | null;
  firstSeenAt: string;
  lastUpdatedAt: string;
  created_at: string;
  deleted_at: string | null;
}

export interface VideoStats {
  id: string;
  video_id: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  viewsPerHour: number | null;
  engagementRate: number | null;
  viralScore: number | null;
  viewDelta: number;
  likeDelta: number;
  commentDelta: number;
  snapshotAt: string;
  created_at: string;
}

export interface Channel {
  id: string;
  channel_id: string;
  title: string;
  description: string | null;
  customUrl: string | null;
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
  isMonitored: boolean;
  monitorFrequencyHours: number;
  lastCheckedAt: string | null;
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
  autoMonitor: boolean;
  monitorFrequencyHours: number;
  channelCount: number;
  isMonitoringEnabled: boolean;
  checkIntervalHours: number;
  lastCheckedAt: string | null;
  folderChannels?: FolderChannel[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FolderChannel {
  id: string;
  folder_id: string;
  channel_id: string;
  customFrequencyHours: number | null;
  notes: string | null;
  addedAt: string;
}

export type AlertRuleType = 'threshold' | 'trend' | 'anomaly';
export type AlertMetric = 'views' | 'vph' | 'engagement' | 'viralScore';
export type AlertCondition = 'greater_than' | 'less_than' | 'change_percent';
export type AlertScope = 'video' | 'channel' | 'folder';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertRule {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  ruleType: AlertRuleType;
  metric: AlertMetric;
  metricType?: 'view_count' | 'vph' | 'engagementRate' | 'viralScore' | 'growthRate';
  condition: AlertCondition;
  comparisonOperator?: '>' | '>=' | '<' | '<=' | '=' | '!=';
  thresholdValue: number;
  scope: AlertScope;
  scopeId: string | null;
  is_active: boolean;
  cooldownHours: number;
  notifyEmail: boolean;
  notifyApp: boolean;
  created_at: string;
  updated_at: string;
  lastTriggeredAt: string | null;
  triggerCount: number;
}

export interface Alert {
  id: string;
  rule_id: string;
  user_id: string;
  video_id?: string;
  channel_id?: string;
  alertType: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  metricValue?: number;
  triggeredAt?: string;
  contextData: Record<string, unknown> | null;
  is_read: boolean;
  readAt: string | null;
  isArchived: boolean;
  created_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  coverImage: string | null;
  tags: string[] | null;
  itemCount: number;
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
  addedAt: string;
  addedBy: string | null;
}

export type SearchType = 'keyword' | 'popular' | 'channel' | 'trending';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  searchParams: {
    query?: string;
    regionCode?: string;
    category_id?: string;
    order?: string;
    publishedAfter?: string;
    publishedBefore?: string;
    videoDuration?: string;
    maxResults?: number;
    channel_id?: string;
    [key: string]: string | number | boolean | undefined;
  };
  searchType: SearchType;
  autoRun: boolean;
  runFrequencyHours: number;
  lastRunAt: string | null;
  created_at: string;
  updated_at: string;
  useCount: number;
}

export type PlanType = 'free' | 'pro' | 'team';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';
export type TeamRole = 'owner' | 'admin' | 'member';
export type BillingCycle = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  user_id: string;
  planType: PlanType;
  status: SubscriptionStatus;
  apiQuotaDaily: number;
  maxMonitors: number;
  maxAlerts: number;
  maxCollections: number;
  maxSavedSearches: number;
  teamId: string | null;
  teamRole: TeamRole | null;
  billingCycle: BillingCycle | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  created_at: string;
  updated_at: string;
  cancelledAt: string | null;
}

// ============================================
// YouTube API Types
// ============================================

export interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    channel_id: string;
    channel_title: string;
    published_at: string;
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
    view_count: number;
    like_count: number;
    comment_count: number;
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
    published_at: string;
    thumbnails: {
      default?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
    };
    country?: string;
  };
  statistics: {
    view_count: number;
    subscriber_count: number;
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
  recentVideos?: Video[];
  latestStats?: {
    totalViews: number;
    totalVideos: number;
    avgViewsPerVideo: number;
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
  category_id?: string;
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'view_count';
  publishedAfter?: string;
  publishedBefore?: string;
  videoDuration?: 'short' | 'medium' | 'long';
  maxResults?: number;
  pageToken?: string;
  channel_id?: string;
}

export interface PopularShortsParams {
  regionCode?: string;
  category_id?: string;
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
  engagementRate: number; // (likes + comments) / views * 100
  viralScore: number; // Custom algorithm
  growthRate: number; // View growth percentage
  velocity: number; // Rate of change in views
}

export interface ChannelMetrics {
  avgViews: number;
  avgEngagement: number;
  uploadFrequency: number; // Videos per day
  subscriberGrowth: number; // Percentage
  performanceScore: number; // Overall channel health
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
  details?: unknown;
  timestamp: string;
}

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export class APIKeyMissingError extends Error {
  constructor(message = 'YouTube API key is not configured') {
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
  US: 'United States',
  KR: 'South Korea',
  JP: 'Japan',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  BR: 'Brazil',
  IN: 'India',
  ID: 'Indonesia',
} as const;

// ============================================
// Phase 4: Advanced Analytics Types
// ============================================

export interface OutlierDetectionResult {
  video_id: string;
  zScore: number;
  madScore: number;
  combinedScore: number;
  isOutlier: boolean;
  outlierType: 'positive' | 'negative' | null;
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
  growthRate: number;
  firstSeen: string;
  lastSeen: string;
  relatedVideos: string[];
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
  processedAt: string;
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
}

export interface AnalyticsConfig {
  outlierThreshold: number; // Default: 3 (z-score)
  madMultiplier: number; // Default: 2.5
  trendWindowDays: number; // Default: 7
  predictionHorizonDays: number; // Default: 30
  nlpConfidenceThreshold: number; // Default: 0.7
  batchSize: number; // Default: 100
}

export interface BatchAnalysisResult {
  outliers: OutlierDetectionResult[];
  trends: TrendAnalysis[];
  predictions: PredictionModel[];
  processingTimeMs: number;
  totalVideosAnalyzed: number;
  timestamp: string;
}

export const DEFAULT_LIMITS = {
  FREE: {
    apiQuotaDaily: 1000,
    maxMonitors: 10,
    maxAlerts: 5,
    maxCollections: 3,
    maxSavedSearches: 10,
  },
  PRO: {
    apiQuotaDaily: 10000,
    maxMonitors: 100,
    maxAlerts: 50,
    maxCollections: 20,
    maxSavedSearches: 100,
  },
  TEAM: {
    apiQuotaDaily: 50000,
    maxMonitors: 500,
    maxAlerts: 200,
    maxCollections: 100,
    maxSavedSearches: 500,
  },
} as const;
