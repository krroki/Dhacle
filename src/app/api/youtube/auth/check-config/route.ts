import { NextResponse } from 'next/server';
import { checkYouTubeServerEnvVars } from '@/lib/youtube/env-check';

/**
 * YouTube Lens 환경 변수 설정 상태 확인
 * GET /api/youtube/auth/check-config
 */
export async function GET() {
  try {
    const envCheck = checkYouTubeServerEnvVars();
    
    // 보안을 위해 실제 환경 변수 값은 노출하지 않음
    // 대신 설정 여부와 누락된 변수 이름만 반환
    return NextResponse.json({
      configured: envCheck.isConfigured,
      missingCount: envCheck.missingVars.length,
      // 개발 환경에서만 누락된 변수 이름 노출
      missingVars: process.env.NODE_ENV === 'development' ? envCheck.missingVars : [],
      warnings: process.env.NODE_ENV === 'development' ? envCheck.warnings : [],
      hasClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
    });
  } catch (error) {
    console.error('Config check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check configuration',
        configured: false 
      },
      { status: 500 }
    );
  }
}