/**
 * 🔐 Zod Validation Schemas
 * Wave 3: 입력 검증 스키마 정의
 *
 * 모든 API 엔드포인트에 대한 입력 검증 스키마를 정의합니다.
 */

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
export const updateProfileSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.').max(50).optional(),
  bio: z.string().max(500, '자기소개는 500자 이내로 작성해주세요.').optional(),
  avatar_url: urlSchema.optional(),
  website: urlSchema.optional(),
});

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
  order: z.enum(['relevance', 'date', 'viewCount', 'rating']).optional(),
  pageToken: z.string().optional(),
});

// 즐겨찾기 추가
export const addFavoriteSchema = z.object({
  video_id: z.string().min(1, '비디오 ID가 필요합니다.'),
  title: z.string().min(1).max(500),
  channelTitle: z.string().max(200).optional(),
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
  channelId: z.string().min(1, '채널 ID가 필요합니다.').max(100),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']),
  notes: z.string().max(500).optional(),
});

// 채널 추가
export const addChannelSchema = z.object({
  channelId: z.string().min(1, '채널 ID가 필요합니다.').max(100),
  title: z.string().min(1).max(200).optional(),
  category: z.string().max(100).optional(),
  subcategory: z.string().max(100).optional(),
});

// ============================================
// 수익 인증 관련 스키마
// ============================================

// 수익 인증 생성
export const createRevenueProofSchema = z.object({
  title: z.string().min(5, '제목은 5자 이상이어야 합니다.').max(200),
  description: z.string().min(10, '설명은 10자 이상이어야 합니다.').max(2000),
  amount: z.number().positive('금액은 양수여야 합니다.').max(1000000000),
  currency: z.enum(['KRW', 'USD', 'EUR', 'JPY']).default('KRW'),
  proofDate: dateSchema,
  imageUrl: urlSchema.optional(),
  is_public: z.boolean().default(true),
});

// 댓글 작성
export const createCommentSchema = z.object({
  content: z.string().min(1, '댓글을 입력해주세요.').max(500),
  parentId: uuidSchema.optional(),
});

// ============================================
// 커뮤니티 관련 스키마
// ============================================

// 게시글 작성
export const createPostSchema = z.object({
  title: z.string().min(5, '제목은 5자 이상이어야 합니다.').max(200),
  content: z.string().min(10, '내용은 10자 이상이어야 합니다.').max(10000),
  category: z.enum(['general', 'question', 'tip', 'showcase', 'feedback']),
  tags: z.array(z.string().max(50)).max(5).optional(),
  is_public: z.boolean().default(true),
});

// ============================================
// 결제 관련 스키마
// ============================================

// 결제 요청
export const createPaymentSchema = z.object({
  course_id: uuidSchema,
  amount: z.number().positive().int(),
  couponCode: z.string().max(50).optional(),
  paymentMethod: z.enum(['card', 'transfer', 'virtualAccount', 'mobile']),
});

// 쿠폰 검증
export const validateCouponSchema = z.object({
  code: z.string().min(1, '쿠폰 코드를 입력해주세요.').max(50),
  course_id: uuidSchema.optional(),
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
  } catch (_error) {
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
export function createValidationErrorResponse(error: string): Response {
  return new Response(
    JSON.stringify({
      error: `입력값 검증 실패: ${error}`,
      type: 'validationError',
    }),
    {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
