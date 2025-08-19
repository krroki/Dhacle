// Next.js App Router에서 환경 변수가 동적으로 로드되도록 설정
export const dynamic = 'force-dynamic';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateYouTubeApiKey } from '@/lib/api-keys';

/**
 * POST /api/youtube/validate-key
 * YouTube API Key 유효성 검증
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 });
    }
    
    // 요청 본문 파싱
    const body = await request.json();
    const { apiKey } = body;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API key is required' 
        },
        { status: 400 }
      );
    }
    
    // API Key 형식 검증 (기본)
    if (!apiKey.startsWith('AIza') || apiKey.length !== 39) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid YouTube API key format',
          details: 'YouTube API keys should start with "AIza" and be 39 characters long' 
        },
        { status: 400 }
      );
    }
    
    // YouTube API를 통한 실제 검증
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
    
    // 성공 응답
    return NextResponse.json({
      success: true,
      message: 'API key is valid',
      validation: {
        isValid: true,
        quotaInfo: validation.quotaInfo || {
          used: 0,
          limit: 10000,
          remaining: 10000
        }
      }
    });
    
  } catch (error) {
    console.error('Error validating API key:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to validate API key',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}