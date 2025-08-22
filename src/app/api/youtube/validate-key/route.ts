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
    const { api_key } = body;

    if (!api_key) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key is required',
        },
        { status: 400 }
      );
    }

    // API Key 형식 검증 (기본)
    if (!api_key.startsWith('AIza') || api_key.length !== 39) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid YouTube API key format',
          details: 'YouTube API keys should start with "AIza" and be 39 characters long',
        },
        { status: 400 }
      );
    }

    // YouTube API를 통한 실제 검증
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

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: 'API key is valid',
      validation: {
        isValid: true,
        quotaInfo: validation.quotaInfo || {
          used: 0,
          limit: 10000,
          remaining: 10000,
        },
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate API key',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
