/**
 * 🔐 Wave 3 보안 기능 사용 예제
 *
 * Rate Limiting, Zod 검증, XSS 방지를 실제 API에 적용하는 방법
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { sanitizeBasicHTML, sanitizeObject, sanitizeRichHTML } from './sanitizer';
// Wave 3 보안 모듈 임포트
import {
  createPostSchema,
  createValidationErrorResponse,
  validateRequestBody,
} from './validation-schemas';

/**
 * 예제 1: 커뮤니티 게시글 작성 API
 * Zod 검증 + XSS 방지 적용
 */
export async function POST_CreatePost(request: NextRequest) {
  // 1. 세션 검사 (Wave 1)
  const supabase = await createSupabaseRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  // 2. Zod 입력 검증 (Wave 3)
  const validation = await validateRequestBody(request, createPostSchema);

  if (!validation.success) {
    return createValidationErrorResponse(validation.error);
  }

  // 3. XSS 방지 - HTML 정화 (Wave 3)
  const sanitized_data = {
    ...validation.data,
    title: sanitizeBasicHTML(validation.data.title),
    content: sanitizeRichHTML(validation.data.content),
    tags: validation.data.tags?.map((tag) => sanitizeBasicHTML(tag)),
  };

  // 4. 데이터베이스 저장
  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      ...sanitized_data,
      user_id: user.id,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: '게시글 작성에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * 예제 2: 사용자 프로필 업데이트 API
 * 모든 보안 기능 통합
 */
export async function PUT_UpdateProfile(request: NextRequest) {
  // 1. 세션 검사
  const supabase = await createSupabaseRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  // 2. Zod 검증
  const { updateProfileSchema } = await import('./validation-schemas');
  const validation = await validateRequestBody(request, updateProfileSchema);

  if (!validation.success) {
    return createValidationErrorResponse(validation.error);
  }

  // 3. 전체 객체 sanitization
  const sanitized_data = sanitizeObject(validation.data, sanitizeBasicHTML);

  // 4. 업데이트
  const { data, error } = await supabase
    .from('profiles')
    .update(sanitized_data)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: '프로필 업데이트에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * 예제 3: 검색 API
 * 쿼리 파라미터 검증 예제
 */
export async function GET_Search(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // 쿼리 파라미터 검증
  const { validateQueryParams, paginationSchema } = await import('./validation-schemas');
  const validation = validateQueryParams(searchParams, paginationSchema);

  if (!validation.success) {
    return createValidationErrorResponse(validation.error);
  }

  // 검색어 sanitization
  const query = searchParams.get('q');
  const sanitized_query = query ? sanitizeBasicHTML(query) : '';

  // 검색 실행...
  return NextResponse.json({
    query: sanitized_query,
    ...validation.data,
  });
}

/**
 * API Route Handler 래퍼
 * 모든 보안 기능을 자동으로 적용
 */
export function secureRouteHandler(
  handler: (
    request: NextRequest,
    context?: { params?: Record<string, string | string[]> }
  ) => Promise<Response>
) {
  return async (request: NextRequest, context?: { params?: Record<string, string | string[]> }) => {
    try {
      // Rate Limiting은 미들웨어에서 처리됨

      // 핸들러 실행
      const response = await handler(request, context);

      // 보안 헤더 추가 (미들웨어에서 처리되지 않은 경우)
      if (!response.headers.has('X-Content-Type-Options')) {
        response.headers.set('X-Content-Type-Options', 'nosniff');
      }

      return response;
    } catch (_error) {
      return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
  };
}

/**
 * 사용 예제:
 *
 * // app/api/posts/route.ts
 * import { secureRouteHandler } from '@/lib/security/example-usage';
 *
 * export const POST = secureRouteHandler(async (request) => {
 *   // 보안이 적용된 핸들러 로직
 *   return NextResponse.json({ success: true });
 * });
 */
