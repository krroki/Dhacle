// Next.js App Router에서 환경 변수가 동적으로 로드되도록 설정
// 이렇게 하면 빌드 타임이 아닌 런타임에 환경 변수를 읽습니다
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Edge Runtime 대신 Node.js Runtime 사용

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import {
  deleteUserApiKey,
  getUserApiKey,
  saveUserApiKey,
  validateYouTubeApiKey,
} from '@/lib/api-keys';

/**
 * GET /api/user/api-keys
 * 사용자의 API Key 조회
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // 인증 확인
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();

    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 서비스 파라미터 (기본값: youtube)
    const search_params = request.nextUrl.searchParams;
    const service_name = search_params.get('service') || 'youtube';

    // API Key 조회
    const api_key = await getUserApiKey(user.id, service_name as string);

    if (!api_key) {
      return NextResponse.json(
        {
          success: true,
          data: null,
          message: 'No API key found',
        },
        { status: 200 }
      );
    }

    // 민감한 정보 제거
    const safe_api_key = {
      id: api_key.id,
      service_name: api_key.service_name,
      api_key_masked: api_key.api_key_masked,
      created_at: api_key.created_at,
      updated_at: api_key.updated_at,
      last_used_at: api_key.last_used_at,
      usage_count: api_key.usage_count,
      usage_today: api_key.usage_today,
      usage_date: api_key.usage_date,
      is_active: api_key.is_active,
      is_valid: api_key.is_valid,
      validation_error: api_key.validation_error,
    };

    return NextResponse.json({
      success: true,
      data: safe_api_key,
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch API key',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/api-keys
 * API Key 저장
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // 환경 변수 디버깅
  console.log('[API Route] Environment check:', {
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
    encryptionKeyLength: process.env.ENCRYPTION_KEY?.length,
    nodeEnv: process.env.NODE_ENV,
    runtime: process.env.NEXT_RUNTIME,
  });

  try {
    const supabase = createRouteHandlerClient({ cookies });

    // 인증 확인
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();

    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { api_key, service_name = 'youtube', metadata = {} } = body;

    if (!api_key) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key is required',
        },
        { status: 400 }
      );
    }

    // YouTube API Key인 경우 유효성 검증
    if (service_name === 'youtube') {
      const validation = await validateYouTubeApiKey(api_key);

      if (!validation.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error || 'Invalid API key',
            validation,
          },
          { status: 400 }
        );
      }

      // 할당량 정보를 메타데이터에 추가
      if (validation.quotaInfo) {
        metadata.quotaInfo = validation.quotaInfo;
      }
    }

    // API Key 저장
    console.log('[API Route] Before saveUserApiKey');
    const saved_key = await saveUserApiKey({
      user_id: user.id,
      api_key,
      service_name,
      metadata,
    });
    console.log('[API Route] After saveUserApiKey:', { savedKeyId: saved_key?.id });

    // 민감한 정보 제거
    const safe_api_key = {
      id: saved_key.id,
      service_name: saved_key.service_name,
      api_key_masked: saved_key.api_key_masked,
      created_at: saved_key.created_at,
      is_valid: saved_key.is_valid,
    };

    return NextResponse.json({
      success: true,
      data: safe_api_key,
      message: 'API key saved successfully',
    });
  } catch (error) {
    // 더 상세한 에러 메시지 반환
    const error_message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'Failed to save API key (unknown error)';

    return NextResponse.json(
      {
        success: false,
        error: error_message,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/api-keys
 * API Key 삭제
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // 인증 확인
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();

    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 서비스 파라미터 (기본값: youtube)
    const search_params = request.nextUrl.searchParams;
    const service_name = search_params.get('service') || 'youtube';

    // API Key 삭제
    const success = await deleteUserApiKey(user.id, service_name as string);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete API key',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete API key',
      },
      { status: 500 }
    );
  }
}
