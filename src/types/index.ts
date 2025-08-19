/**
 * 중앙 타입 정의 파일
 *
 * Single Source of Truth: Supabase 자동 생성 타입 기반
 * 자동 변환: snake_case (DB) → camelCase (Frontend)
 *
 * 사용법:
 * import { User, Course, CommunityPost } from '@/types'
 */

import type { SnakeToCamelCase } from '@/lib/utils/db-types';
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

// ============= CamelCase 변환 타입 (Frontend용) =============

// 메인 엔티티 타입 (camelCase)
export type User = SnakeToCamelCase<DBUser>;
export type CommunityPost = SnakeToCamelCase<DBCommunityPost>;
export type CommunityComment = SnakeToCamelCase<DBCommunityComment>;
export type CommunityLike = SnakeToCamelCase<DBCommunityLike>;
export type RevenueProof = SnakeToCamelCase<DBRevenueProof>;
export type UserApiKey = SnakeToCamelCase<DBUserApiKey>;
export type Profile = SnakeToCamelCase<DBProfile>;

// Insert 타입 (camelCase)
export type UserInsert = SnakeToCamelCase<DBUserInsert>;
export type CommunityPostInsert = SnakeToCamelCase<DBCommunityPostInsert>;
export type CommunityCommentInsert = SnakeToCamelCase<DBCommunityCommentInsert>;
export type CommunityLikeInsert = SnakeToCamelCase<DBCommunityLikeInsert>;
export type RevenueProofInsert = SnakeToCamelCase<DBRevenueProofInsert>;
export type UserApiKeyInsert = SnakeToCamelCase<DBUserApiKeyInsert>;

// Update 타입 (camelCase)
export type UserUpdate = SnakeToCamelCase<DBUserUpdate>;
export type CommunityPostUpdate = SnakeToCamelCase<DBCommunityPostUpdate>;
export type CommunityCommentUpdate = SnakeToCamelCase<DBCommunityCommentUpdate>;
export type CommunityLikeUpdate = SnakeToCamelCase<DBCommunityLikeUpdate>;
export type RevenueProofUpdate = SnakeToCamelCase<DBRevenueProofUpdate>;
export type UserApiKeyUpdate = SnakeToCamelCase<DBUserApiKeyUpdate>;

// ============= 호환성 타입 (기존 코드용) =============

// 기존 코드와의 호환성을 위한 별칭
export type Course = {
  id: string;
  title: string;
  description: string | null;
  instructorId: string | null;
  price: number;
  discountRate: number;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  durationMinutes: number | null;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | null;
  category: 'shorts' | 'marketing' | 'editing' | 'monetization' | 'analytics' | null;
  rating: number;
  studentCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt: string | null;
  progressPercentage: number;
  isCompleted: boolean;
  rating: number | null;
  reviewText: string | null;
  reviewDate: string | null;
};

// Community 타입 별칭 (기존 코드 호환)
export type Community = CommunityPost;
export type Comment = CommunityComment;

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
