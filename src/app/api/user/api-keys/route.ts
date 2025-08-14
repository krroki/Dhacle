import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';
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
    const supabase = await createServerClient();
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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
  try {
    const supabase = await createServerClient();
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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
    const savedKey = await saveUserApiKey({
      userId: user.id,
      apiKey,
      serviceName,
      metadata
    });
    
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
    console.error('Error saving API key:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save API key' 
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
    const supabase = await createServerClient();
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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