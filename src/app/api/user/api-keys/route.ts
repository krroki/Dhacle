// Next.js App Router에서 환경 변수가 동적으로 로드되도록 설정
// 이렇게 하면 빌드 타임이 아닌 런타임에 환경 변수를 읽습니다
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Edge Runtime 대신 Node.js Runtime 사용

import { NextRequest, NextResponse } from 'next/server';
import { 
  saveUserApiKey, 
  getUserApiKey, 
  deleteUserApiKey,
  validateYouTubeApiKey 
} from '@/lib/api-keys';

/**
 * GET /api/user/api-keys
 * 사용자의 API Key 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // 서비스 파라미터 (기본값: youtube)
    const searchParams = request.nextUrl.searchParams;
    const serviceName = searchParams.get('service') || 'youtube';
    
    // API Key 조회
    const apiKey = await getUserApiKey(user.id, serviceName);
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: true, 
          data: null,
          message: 'No API key found' 
        },
        { status: 200 }
      );
    }
    
    // 민감한 정보 제거
    const safeApiKey = {
      id: apiKey.id,
      service_name: apiKey.service_name,
      api_key_masked: apiKey.api_key_masked,
      created_at: apiKey.created_at,
      updated_at: apiKey.updated_at,
      last_used_at: apiKey.last_used_at,
      usage_count: apiKey.usage_count,
      usage_today: apiKey.usage_today,
      usage_date: apiKey.usage_date,
      is_active: apiKey.is_active,
      is_valid: apiKey.is_valid,
      validation_error: apiKey.validation_error
    };
    
    return NextResponse.json({
      success: true,
      data: safeApiKey
    });
    
  } catch (error) {
    console.error('Error fetching API key:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch API key' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/api-keys
 * API Key 저장
 */
export async function POST(request: NextRequest) {
  // 환경 변수 디버깅
  console.log('[API Route] Environment check:', {
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
    encryptionKeyLength: process.env.ENCRYPTION_KEY?.length,
    nodeEnv: process.env.NODE_ENV,
    runtime: process.env.NEXT_RUNTIME
  });
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // 요청 본문 파싱
    const body = await request.json();
    const { apiKey, serviceName = 'youtube', metadata = {} } = body;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API key is required' 
        },
        { status: 400 }
      );
    }
    
    // YouTube API Key인 경우 유효성 검증
    if (serviceName === 'youtube') {
      const validation = await validateYouTubeApiKey(apiKey);
      
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            success: false, 
            error: validation.error || 'Invalid API key',
            validation 
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
    const savedKey = await saveUserApiKey({
      userId: user.id,
      apiKey,
      serviceName,
      metadata
    });
    console.log('[API Route] After saveUserApiKey:', { savedKeyId: savedKey?.id });
    
    // 민감한 정보 제거
    const safeApiKey = {
      id: savedKey.id,
      service_name: savedKey.service_name,
      api_key_masked: savedKey.api_key_masked,
      created_at: savedKey.created_at,
      is_valid: savedKey.is_valid
    };
    
    return NextResponse.json({
      success: true,
      data: safeApiKey,
      message: 'API key saved successfully'
    });
    
  } catch (error) {
    console.error('[API Route] Error saving API key:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error
    });
    
    // 더 상세한 에러 메시지 반환
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'Failed to save API key (unknown error)';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/api-keys
 * API Key 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // 서비스 파라미터 (기본값: youtube)
    const searchParams = request.nextUrl.searchParams;
    const serviceName = searchParams.get('service') || 'youtube';
    
    // API Key 삭제
    const success = await deleteUserApiKey(user.id, serviceName);
    
    if (!success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete API key' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete API key' 
      },
      { status: 500 }
    );
  }
}