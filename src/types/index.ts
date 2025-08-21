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

// Course 타입은 course.ts에서 가져옴 (충돌 방지)

// Lesson 타입도 course.ts에서 가져옴

// CourseProgress는 course.ts에서 import (중복 제거)

// VideoStats 타입 정의 - video_stats 테이블과 매칭
export interface VideoStats extends Tables<'video_stats'> {
  // 추가 필드
  subscriber_count?: number;
  published_at: string;
  channel_id: string;
  duration: number;
  tags?: string[];
  updated_at: string;
}

// RevenueProof 타입 확장 - 옵셔널 필드 추가
export interface ExtendedRevenueProof extends Tables<'revenue_proofs'> {
  // 옵셔널 필드로 변경
  thumbnail_url?: string;
  blurDataUrl?: string;
}

// Course 관련 타입은 course.ts에서 import (기존 타입들)
export type {
  ContentBlock,
  Coupon,
  Course, // course.ts의 Course 사용
  CourseBadge,
  CourseDetailResponse,
  CourseFilters,
  CourseListResponse,
  CourseProgress, // course.ts의 CourseProgress 사용
  CourseReview,
  CreateCourseInput,
  CreateLessonInput,
  Enrollment,
  InstructorProfile,
  Lesson, // course.ts의 Lesson 사용
  PaymentIntentInput,
  PaymentIntentResponse,
  Purchase,
  UserCertificate,
} from './course';

// Community 타입 별칭 (기존 코드 호환)
export type Community = CommunityPost;
export type Comment = CommunityComment;

// Revenue Proof 타입 re-export
export type {
  MonthlyRanking,
  ProofComment,
  ProofLike,
  ProofReport,
} from './revenue-proof';
// YouTube API 타입 re-export
export type {
  ApiError,
  ApiUsage,
  FlattenedYouTubeVideo,
  OAuthToken,
  QuotaStatus,
  SearchBarProps,
  VideoCardProps,
  VideoGridProps,
  YouTubeApiResponse,
  YouTubeChannel,
  YouTubeFavorite,
  YouTubeSearchFilters,
  YouTubeSearchHistory,
  YouTubeSearchResult,
  YouTubeThumbnail,
  YouTubeVideo,
} from './youtube';
// YouTube Lens 타입 re-export
export type {
  Alert,
  AlertRule,
  AlertWithRule,
  AnalyticsConfig,
  BatchAnalysisResult,
  Channel,
  ChannelMetrics,
  ChannelWithVideos,
  Collection,
  CollectionItem,
  CollectionWithItems,
  EntityExtraction,
  FolderChannel,
  FolderWithChannels,
  MonitoringConfig,
  OutlierDetectionResult,
  PopularShortsParams,
  PredictionModel,
  SavedSearch,
  SearchVideosParams,
  SourceFolder,
  Subscription,
  TrendAnalysis,
  Video,
  VideoMetrics,
  // VideoStats, // 위에서 새로 정의했으므로 제외
  VideoWithStats,
  YouTubeLensError,
  YouTubeLensState,
} from './youtube-lens';

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
