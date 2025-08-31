/**
 * 🔐 Zod Validation Schemas
 * Wave 3: 입력 검증 스키마 정의
 *
 * 모든 API 엔드포인트에 대한 입력 검증 스키마를 정의합니다.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================
// 공통 스키마
// ============================================

// UUID 검증
export const uuidSchema = z.string().uuid('유효하지 않은 ID 형식입니다.');

// 이메일 검증
export const emailSchema = z.string().email('유효한 이메일을 입력해주세요.');

// URL 검증
export const urlSchema = z.string().url('유효한 URL을 입력해주세요.');

// 날짜 검증
export const dateSchema = z.string().datetime('유효한 날짜 형식이 아닙니다.');

// 페이지네이션
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort: z.enum(['asc', 'desc']).optional(),
  sortBy: z.string().optional(),
});

// ============================================
// 사용자 관련 스키마
// ============================================

// 프로필 업데이트
export const profileUpdateSchema = z.object({
  username: z.string().min(2, '사용자명은 2자 이상이어야 합니다.').max(30).optional(),
  fullName: z.string().min(2, '이름은 2자 이상이어야 합니다.').max(50).optional(),
  channelName: z.string().max(100).optional(),
  channelUrl: urlSchema.optional(),
  workType: z.enum(['student', 'employee', 'freelancer', 'business', 'other']).optional(),
  jobCategory: z.string().max(50).optional(),
  currentIncome: z.string().max(20).optional(),
  targetIncome: z.string().max(20).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  avatarUrl: urlSchema.optional(),
  naverCafeNickname: z.string().max(50).optional(),
  naverCafeMemberUrl: urlSchema.optional()
});

// 프로필 업데이트 (legacy compatibility)
export const updateProfileSchema = profileUpdateSchema;

// 사용자명 체크
export const checkUsernameSchema = z.object({
  username: z
    .string()
    .min(3, '사용자명은 3자 이상이어야 합니다.')
    .max(30, '사용자명은 30자 이내여야 합니다.')
    .regex(/^[a-zA-Z0-9_-]+$/, '영문, 숫자, 언더스코어, 하이픈만 사용 가능합니다.'),
});

// API 키 생성
export const createApiKeySchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.').max(100),
  key: z.string().min(20, 'API 키가 너무 짧습니다.'),
});

// ============================================
// YouTube Lens 관련 스키마
// ============================================

// YouTube 검색
export const youtubeSearchSchema = z.object({
  q: z.string().min(1, '검색어를 입력해주세요.').max(200),
  maxResults: z.number().int().min(1).max(50).default(10),
  order: z.enum(['relevance', 'date', 'view_count', 'rating']).optional(),
  pageToken: z.string().optional(),
});

// 즐겨찾기 추가
export const addFavoriteSchema = z.object({
  video_id: z.string().min(1, '비디오 ID가 필요합니다.'),
  title: z.string().min(1).max(500),
  channel_title: z.string().max(200).optional(),
  thumbnail_url: urlSchema.optional(),
});

// 컬렉션 생성
export const createCollectionSchema = z.object({
  name: z.string().min(1, '컬렉션 이름을 입력해주세요.').max(100),
  description: z.string().max(500).optional(),
  is_public: z.boolean().default(false),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

// 컬렉션 아이템 추가
export const addCollectionItemSchema = z.object({
  collection_id: uuidSchema,
  video_id: z.string().min(1),
  title: z.string().min(1).max(500),
  notes: z.string().max(1000).optional(),
});

// YouTube Lens Delta System 관련 스키마
export const trendingSummaryQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD여야 합니다.')
    .optional(),
  limit: z.number().int().min(1).max(100).default(10).optional(),
});

// 채널 승인 관리
export const channelApprovalSchema = z.object({
  channel_id: z.string().min(1, '채널 ID가 필요합니다.').max(100),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']),
  notes: z.string().max(500).optional(),
});

// 채널 추가
export const addChannelSchema = z.object({
  channel_id: z.string().min(1, '채널 ID가 필요합니다.').max(100),
  title: z.string().min(1).max(200).optional(),
  category: z.string().max(100).optional(),
  subcategory: z.string().max(100).optional(),
});


// ============================================
// 헬퍼 함수
// ============================================

/**
 * 요청 본문 검증
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
      return {
        success: false,
        error: errors.join(', '),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Library error:', error);
    return {
      success: false,
      error: '유효하지 않은 JSON 형식입니다.',
    };
  }
}

/**
 * 쿼리 파라미터 검증
 */
export function validateQueryParams<T>(
  params: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  const data: Record<string, unknown> = {};

  params.forEach((value, key) => {
    // 숫자로 변환 가능한 경우 변환
    if (!Number.isNaN(Number(value))) {
      data[key] = Number(value);
    } else if (value === 'true' || value === 'false') {
      data[key] = value === 'true';
    } else {
      data[key] = value;
    }
  });

  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    return {
      success: false,
      error: errors.join(', '),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * 검증 에러 응답 생성
 */
export function createValidationErrorResponse(error: string | z.ZodError): NextResponse {
  if (typeof error === 'string') {
    return NextResponse.json(
      {
        error: `입력값 검증 실패: ${error}`,
        type: 'validationError',
      },
      { status: 400 }
    );
  }
  
  // Handle ZodError
  return NextResponse.json(
    {
      error: 'Validation failed',
      type: 'validationError',
      issues: error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    },
    { status: 400 }
  );
}
