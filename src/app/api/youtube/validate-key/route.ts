// Next.js App Router에서 환경 변수가 동적으로 로드되도록 설정
export const dynamic = 'force-dynamic';
// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { validateYouTubeApiKey } from '@/lib/api-keys';

/**
 * POST /api/youtube/validate-key
 * YouTube API Key 유효성 검증
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('[validate-key] Request received');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // 인증 확인
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();

    if (auth_error || !user) {
      console.log('[validate-key] Authentication failed');
      return NextResponse.json({ 
        success: false,
        error: 'User not authenticated' 
      }, { status: 401 });
    }

    // 요청 본문 파싱
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[validate-key] Failed to parse request body:', parseError);
      return NextResponse.json(
        {
          success: false,
          error: '잘못된 요청 형식입니다.',
        },
        { status: 400 }
      );
    }
    
    const { api_key } = body;

    if (!api_key) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key를 입력해주세요.',
        },
        { status: 400 }
      );
    }

    console.log('[validate-key] Validating API key...');
    
    // YouTube API를 통한 실제 검증
    const validation = await validateYouTubeApiKey(api_key);
    
    console.log('[validate-key] Validation result:', validation);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || 'API key가 유효하지 않습니다.',
          validation,
        },
        { status: 400 }
      );
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: 'API key가 유효합니다.',
      validation: {
        isValid: true,
        quotaInfo: validation.quotaInfo || {
          message: 'API key가 정상적으로 작동합니다.',
        },
      },
    });
  } catch (error: unknown) {
    console.error('[validate-key] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'API key 검증 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined,
      },
      { status: 500 }
    );
  }
}
