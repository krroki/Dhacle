/**
 * 중앙 타입 정의 파일
 *
 * Single Source of Truth: Supabase 자동 생성 타입 기반
 * 통일된 네이밍: snake_case (DB = Frontend)
 *
 * 사용법:
 * import { User, Course, CommunityPost } from '@/types'
 */
import type { Database, Tables, TablesInsert, TablesUpdate } from './database.generated';

// ============= 기본 Database 타입 =============
export type { Database, Json } from './database.generated';

// ============= Snake Case 원본 타입 (DB용) =============
export type DBTables = Database['public']['Tables'];
export type DBViews = Database['public']['Views'];

// DB 테이블 타입 (snake_case)
export type DBUser = Tables<'users'>;
export type DBCommunityPost = Tables<'community_posts'>;
export type DBCommunityComment = Tables<'community_comments'>;
export type DBCommunityLike = Tables<'community_likes'>;
export type DBRevenueProof = Tables<'revenue_proofs'>;
export type DBUserApiKey = Tables<'user_api_keys'>;
export type DBProfile = Tables<'profiles'>; // View

// DB Insert 타입 (snake_case)
export type DBUserInsert = TablesInsert<'users'>;
export type DBCommunityPostInsert = TablesInsert<'community_posts'>;
export type DBCommunityCommentInsert = TablesInsert<'community_comments'>;
export type DBCommunityLikeInsert = TablesInsert<'community_likes'>;
export type DBRevenueProofInsert = TablesInsert<'revenue_proofs'>;
export type DBUserApiKeyInsert = TablesInsert<'user_api_keys'>;

// DB Update 타입 (snake_case)
export type DBUserUpdate = TablesUpdate<'users'>;
export type DBCommunityPostUpdate = TablesUpdate<'community_posts'>;
export type DBCommunityCommentUpdate = TablesUpdate<'community_comments'>;
export type DBCommunityLikeUpdate = TablesUpdate<'community_likes'>;
export type DBRevenueProofUpdate = TablesUpdate<'revenue_proofs'>;
export type DBUserApiKeyUpdate = TablesUpdate<'user_api_keys'>;

// ============= Frontend 타입 (snake_case 직접 사용) =============

// 메인 엔티티 타입 (snake_case)
export type User = DBUser;
export type CommunityPost = DBCommunityPost;
export type CommunityComment = DBCommunityComment;
export type CommunityLike = DBCommunityLike;
export type RevenueProof = DBRevenueProof;
export type UserApiKey = DBUserApiKey;
export type Profile = DBProfile;

// Insert 타입 (snake_case)
export type UserInsert = DBUserInsert;
export type CommunityPostInsert = DBCommunityPostInsert;
export type CommunityCommentInsert = DBCommunityCommentInsert;
export type CommunityLikeInsert = DBCommunityLikeInsert;
export type RevenueProofInsert = DBRevenueProofInsert;
export type UserApiKeyInsert = DBUserApiKeyInsert;

// Update 타입 (snake_case)
export type UserUpdate = DBUserUpdate;
export type CommunityPostUpdate = DBCommunityPostUpdate;
export type CommunityCommentUpdate = DBCommunityCommentUpdate;
export type CommunityLikeUpdate = DBCommunityLikeUpdate;
export type RevenueProofUpdate = DBRevenueProofUpdate;
export type UserApiKeyUpdate = DBUserApiKeyUpdate;

// ============= 호환성 타입 (기존 코드용) =============

// ============= Extended Course Types (DB + Frontend) =============

// Course 타입 정의 (course.ts 통합)
export interface Course {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  instructor_id?: string | null;
  instructor_name: string;
  instructor?: InstructorProfile;
  thumbnail_url?: string | null;
  price: number;
  discount_price?: number | null;
  is_free: boolean;
  isPremium: boolean;
  contentBlocks?: ContentBlock[] | string;
  total_duration: number;
  student_count: number;
  average_rating: number;
  reviewCount: number;
  previewVideoUrl?: string;
  requirements?: string[];
  whatYouLearn?: string[];
  targetAudience?: string[];
  objectives?: string[];
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  tags?: string[];
  previewEnabled?: boolean;
  status: 'upcoming' | 'active' | 'completed';
  launchDate: string;
  created_at: string;
  updated_at: string;
}

// Lesson 타입 정의 (course.ts 통합)
export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration: number;
  order_index: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

// CourseProgress 타입 정의 (course.ts 통합)
export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id?: string | null;
  progress: number;
  completed: boolean;
  completed_at?: string | null;
  last_watched_at?: string | null;
  watchCount?: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

// 나머지 Course 관련 타입들 (course.ts 통합)
export interface Purchase {
  id: string;
  user_id: string;
  course_id: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  amount: number;
  currency: string;
  couponId?: string;
  discountAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  refundedAt?: string;
  refundReason?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  minPurchaseAmount?: number;
  course_id?: string;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validUntil?: string;
  is_active: boolean;
}

export interface CourseBadge {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  type: 'completion' | 'perfect' | 'early_bird' | 'special' | 'milestone';
  completionCriteria: {
    type: string;
    value: number;
  };
  points: number;
  is_active: boolean;
}

export interface UserCertificate {
  id: string;
  user_id: string;
  course_id: string;
  certificateNumber: string;
  issuedAt: string;
  certificateUrl?: string;
  completion_rate: number;
  totalWatchTime: number;
  metadata?: Record<string, unknown>;
}

export interface CourseReview {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  title?: string;
  content?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username?: string;
    avatar_url?: string;
  };
}

export interface InstructorProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  specialty?: string;
  youtubeChannelUrl?: string;
  instagramUrl?: string;
  totalStudents: number;
  average_rating: number;
  is_verified: boolean;
}

export interface ContentBlock {
  type: 'text' | 'image' | 'video' | 'code' | 'quote' | 'list';
  content: unknown;
  order: number;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  payment_id?: string;
  payment_status: string;
  paymentAmount?: number;
  enrolledAt: string;
  completed_at?: string;
  certificateIssued: boolean;
  certificateIssuedAt?: string;
  certificateUrl?: string;
  is_active: boolean;
}

// API Response Types
export interface CourseListResponse {
  courses: Course[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CourseDetailResponse {
  course: Course;
  lessons: Lesson[];
  is_enrolled: boolean;
  is_purchased: boolean;
  progress?: CourseProgress[];
}

// Form Types
export interface CreateCourseInput {
  title: string;
  subtitle?: string;
  description: string;
  instructor_name: string;
  price: number;
  is_free: boolean;
  requirements: string[];
  whatYouLearn: string[];
  targetAudience: string[];
}

export interface CreateLessonInput {
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  duration: number;
  order_index: number;
  is_free: boolean;
}

// Filter Types
export interface CourseFilters {
  instructor?: string;
  priceRange?: [number, number];
  is_free?: boolean;
  rating?: number;
  duration?: 'short' | 'medium' | 'long';
  status?: 'upcoming' | 'active' | 'completed';
  search?: string;
}

// Payment Types
export interface PaymentIntentInput {
  course_id: string;
  couponCode?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  amount: number;
  discountAmount: number;
}

// ============= YouTube Types (youtube.ts 통합) =============

// YouTube 비디오 정보 (원본 API 응답 형태)
export interface YouTubeVideo {
  id: string;
  snippet: {
    published_at: string;
    channel_id: string;
    title: string;
    description: string;
    thumbnails: {
      default?: YouTubeThumbnail;
      medium?: YouTubeThumbnail;
      high?: YouTubeThumbnail;
      standard?: YouTubeThumbnail;
      maxres?: YouTubeThumbnail;
    };
    channel_title: string;
    tags?: string[];
    category_id: string;
    liveBroadcastContent: 'none' | 'live' | 'upcoming';
    defaultLanguage?: string;
    localized?: {
      title: string;
      description: string;
    };
  };
  statistics?: {
    view_count: string;
    like_count?: string;
    dislikeCount?: string;
    favoriteCount?: string;
    comment_count?: string;
  };
  contentDetails?: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    projection: string;
  };
  status?: {
    uploadStatus: string;
    privacyStatus: string;
    license: string;
    embeddable: boolean;
    publicStatsViewable: boolean;
    madeForKids: boolean;
  };
  metrics?: {
    view_count?: number;
    like_count?: number;
    comment_count?: number;
    viewsPerHour?: number;
    engagementRate?: number;
    viralScore?: number;
  };
}

// 평면화된 비디오 정보 (UI 컴포넌트에서 사용)
export interface FlattenedYouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel_id: string;
  channel_title: string;
  published_at: string;
  duration: number; // 초 단위
  view_count: number;
  like_count: number;
  comment_count: number;
  tags: string[];
  category_id: string;
  defaultLanguage: string;
  defaultAudioLanguage: string;
  statistics: {
    view_count: string;
    like_count: string;
    dislikeCount: string;
    favoriteCount: string;
    comment_count: string;
  };
  contentDetails: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    projection: string;
  };
  status: {
    uploadStatus: string;
    privacyStatus: string;
    license: string;
    embeddable: boolean;
    publicStatsViewable: boolean;
    madeForKids: boolean;
  };
}

// YouTube 썸네일
export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

// YouTube 채널 정보
export interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    published_at: string;
    thumbnails: {
      default?: YouTubeThumbnail;
      medium?: YouTubeThumbnail;
      high?: YouTubeThumbnail;
    };
    defaultLanguage?: string;
    localized?: {
      title: string;
      description: string;
    };
    country?: string;
  };
  statistics?: {
    view_count: string;
    subscriber_count: string;
    hiddenSubscriberCount: boolean;
    videoCount: string;
  };
}

// YouTube 검색 결과
export interface YouTubeSearchResult {
  kind: string;
  etag: string;
  id: {
    kind: string;
    video_id?: string;
    channel_id?: string;
    playlist_id?: string;
  };
  snippet: YouTubeVideo['snippet'];
}

// YouTube API 응답 형식
export interface YouTubeApiResponse<T> {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  regionCode?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: T[];
}

// 검색 필터
export interface YouTubeSearchFilters {
  query: string;
  channel_id?: string;
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'videoCount' | 'view_count';
  publishedAfter?: string;
  publishedBefore?: string;
  videoDuration?: 'short' | 'medium' | 'long';
  videoDefinition?: 'any' | 'high' | 'standard';
  videoType?: 'any' | 'episode' | 'movie';
  videoEmbeddable?: 'any' | 'true';
  maxResults?: number;
  pageToken?: string;
  regionCode?: string;
  relevanceLanguage?: string;
  safeSearch?: 'moderate' | 'none' | 'strict';
}

// 즐겨찾기 데이터
export interface YouTubeFavorite {
  id: string;
  user_id: string;
  video_id: string;
  videoData: FlattenedYouTubeVideo;
  tags: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

// YouTube 폴더
export interface YouTubeFolder {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  video_count?: number;
  created_at: string;
  updated_at: string;
}

// 검색 히스토리
export interface YouTubeSearchHistory {
  id: string;
  user_id: string;
  query: string;
  filters?: YouTubeSearchFilters;
  resultsCount: number;
  created_at: string;
}

// API 사용량
export interface ApiUsage {
  id: string;
  user_id: string;
  operation: 'search' | 'videos' | 'channels' | 'playlists';
  units: number;
  timestamp: string;
  apiType: 'youtube';
}

// API 할당량 상태
export interface QuotaStatus {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  resetTime: Date;
  warning: boolean;
  critical: boolean;
  searchCount?: number;
  videoCount?: number;
}

// OAuth 토큰 정보
export interface OAuthToken {
  access_token: string;
  refresh_token?: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
  expires_at?: number;
}

// 비디오 카드 props
export interface VideoCardProps {
  video: FlattenedYouTubeVideo;
  isSelected?: boolean;
  onSelect?: (video_id: string) => void;
  onFavorite?: (video: FlattenedYouTubeVideo) => void;
  isFavorited?: boolean;
}

// 검색바 props
export interface SearchBarProps {
  onSearch: (query: string, filters?: YouTubeSearchFilters) => void;
  isLoading?: boolean;
  suggestions?: string[];
  defaultValue?: string;
}

// 비디오 그리드 props
export interface VideoGridProps {
  videos: FlattenedYouTubeVideo[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  selectedVideos?: Set<string>;
  onVideoSelect?: (video_id: string) => void;
  favoriteVideos?: Set<string>;
  onVideoFavorite?: (video: FlattenedYouTubeVideo) => void;
}

// API 에러 응답
export interface ApiError {
  error: {
    code: number;
    message: string;
    errors?: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

// VideoStats 타입 정의 - video_stats 테이블과 매칭
export interface VideoStats extends Tables<'video_stats'> {
  // 추가 필드
  subscriber_count?: number;
  published_at: string;
  channel_id: string;
  duration: number;
  tags?: string[];
  updated_at: string;
  snapshotAt?: string;
  viewsPerHour?: number;
}

// RevenueProof 타입 확장 - 옵셔널 필드 추가
export interface ExtendedRevenueProof extends Tables<'revenue_proofs'> {
  // 옵셔널 필드로 변경
  thumbnail_url?: string;
  blurDataUrl?: string;
}

// RevenueProof with User (API response)
export interface RevenueProofWithUser extends Tables<'revenue_proofs'> {
  user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  // 관계 데이터
  comments?: ProofComment[];
}

// Course 관련 타입은 위에서 직접 정의됨 (course.ts 통합 완료)

// Community 타입 별칭 (기존 코드 호환)
export type Community = CommunityPost;
export type Comment = CommunityComment;

// ============= Revenue Proof Types (revenue-proof.ts 통합) =============

// ProofComment 타입 (DB 기반 + Relations)
export interface ProofComment {
  id: string;
  proof_id: string;
  user_id: string;
  content: string;
  created_at: string;

  // Relations
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

// ProofLike 타입
export interface ProofLike {
  id?: string;
  user_id: string;
  proof_id: string;
  created_at: string;
}

// ProofReport 타입
export interface ProofReport {
  id: string;
  proof_id: string;
  reporterId: string;
  reason: 'fake' | 'spam' | 'inappropriate' | 'copyright' | 'other';
  details?: string;
  created_at: string;
}

// UserBadge 타입
export interface UserBadge {
  id: string;
  user_id: string;
  badgeType: string;
  badgeData?: Record<string, unknown>;
  earnedAt: string;
}

// MonthlyRanking 타입
export interface MonthlyRanking {
  id: string;
  month: string;
  user_id: string;
  total_amount: number;
  rank: number;
  created_at: string;

  // Relations
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}
// ============= YouTube Lens Types (youtube-lens.ts 통합) =============

// YouTube Lens 비디오 타입 (Video와 구분하기 위해 다른 이름 사용)
export interface YouTubeLensVideo {
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

// YouTube Lens 비디오 통계 (VideoStats와 구분)
export interface YouTubeLensVideoStats {
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

// Channel 타입
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

// 폴더 관련 타입
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

// Alert 관련 타입
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

// Collection 관련 타입
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

// 검색 관련 타입
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

// 구독 관련 타입
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

// 복합 타입들
export interface VideoWithStats extends YouTubeLensVideo {
  stats?: YouTubeLensVideoStats;
  channel?: Channel;
}

export interface ChannelWithVideos extends Channel {
  recentVideos?: YouTubeLensVideo[];
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
  items?: (CollectionItem & { video?: YouTubeLensVideo })[];
}

export interface AlertWithRule extends Alert {
  rule?: AlertRule;
}

// Request/Query Types
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

// Metrics Types
export interface VideoMetrics {
  vph: number;
  engagementRate: number;
  viralScore: number;
  growthRate: number;
  velocity: number;
}

export interface ChannelMetrics {
  avgViews: number;
  avgEngagement: number;
  uploadFrequency: number;
  subscriberGrowth: number;
  performanceScore: number;
}

// UI State Types
export interface YouTubeLensState {
  searchQuery: string;
  searchParams: SearchVideosParams;
  searchResults: YouTubeLensVideo[];
  isSearching: boolean;
  searchError: string | null;
  popularShorts: VideoWithStats[];
  isLoadingPopular: boolean;
  popularError: string | null;
  monitoredChannels: Channel[];
  folders: SourceFolder[];
  activeFolder: string | null;
  alerts: Alert[];
  unreadAlertCount: number;
  alertRules: AlertRule[];
  collections: Collection[];
  activeCollection: string | null;
  subscription: Subscription | null;
  apiUsage: {
    used: number;
    limit: number;
    resetAt: string;
  };
}

// Error Types
export interface YouTubeLensError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
}

// 아직 정의되지 않은 타입들 (나중에 추가 예정)
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
    languages?: string[];
  };
  language: string;
  confidence: number;
  processedAt: string;
}

export interface BatchAnalysisResult {
  [key: string]: unknown;
}

export interface OutlierDetectionResult {
  [key: string]: unknown;
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
  [key: string]: unknown;
}

// YouTube Lens 타입들과 기존 타입들 호환을 위한 별칭
export type Video = YouTubeLensVideo; // 기존 코드 호환성

// ============= Enum 타입 =============

export const UserRole = {
  USER: 'user',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
} as const;

export const CourseDifficulty = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

export const CourseCategory = {
  SHORTS: 'shorts',
  MARKETING: 'marketing',
  EDITING: 'editing',
  MONETIZATION: 'monetization',
  ANALYTICS: 'analytics',
} as const;

export const CommunityCategory = {
  NOTICE: 'notice',
  FREE: 'free',
  SUCCESS: 'success',
  QNA: 'qna',
  TIPS: 'tips',
  RESOURCES: 'resources',
} as const;

export const Platform = {
  YOUTUBE: 'youtube',
  BLOG: 'blog',
  TIKTOK: 'tiktok',
  INSTAGRAM: 'instagram',
  OTHER: 'other',
} as const;

// ============= 유틸리티 타입 =============

// API 응답 타입
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

// 페이지네이션 타입
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

// ============= Re-export 변환 유틸리티 =============
export {
  batchCamelToSnake,
  batchSnakeToCamel,
  camelToSnakeCase,
  partialCamelToSnake,
  partialSnakeToCamel,
  safeGet,
  snakeToCamelCase,
} from '@/lib/utils/db-types';
