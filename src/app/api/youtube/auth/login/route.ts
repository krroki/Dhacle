import { NextRequest, NextResponse } from 'next/server';
import { YouTubeOAuth } from '@/lib/youtube/oauth';
import { CryptoUtil } from '@/lib/youtube/crypto';
import { cookies } from 'next/headers';

/**
 * Google OAuth 로그인 시작
 * GET /api/youtube/auth/login
 */
export async function GET(request: NextRequest) {
  try {
    // 환경 변수 검증
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    if (!clientId || !clientSecret || !siteUrl) {
      console.error('Missing OAuth configuration:', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasSiteUrl: !!siteUrl
      });
      
      // 설정 오류로 리다이렉트
      const errorUrl = new URL('/tools/youtube-lens', request.url);
      errorUrl.searchParams.set('error', 'config_missing');
      return NextResponse.redirect(errorUrl);
    }
    
    // CSRF 방지를 위한 state 토큰 생성
    const state = CryptoUtil.generateCSRFToken();
    
    // state를 쿠키에 저장 (HttpOnly, Secure, SameSite)
    const cookieStore = await cookies();
    cookieStore.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10분
      path: '/'
    });

    // Google OAuth URL 생성
    const authUrl = YouTubeOAuth.generateAuthUrl(state);
    
    // Google 인증 페이지로 리다이렉트
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('OAuth login error:', error);
    
    // 에러 메시지 매핑
    let errorCode = 'oauth_init_failed';
    if (error instanceof Error) {
      if (error.message.includes('환경 변수')) {
        errorCode = 'config_missing';
      } else if (error.message.includes('암호화')) {
        errorCode = 'security_error';
      }
    }
    
    // 에러 발생시 YouTube Lens 페이지로 리다이렉트
    const errorUrl = new URL('/tools/youtube-lens', request.url);
    errorUrl.searchParams.set('error', errorCode);
    
    return NextResponse.redirect(errorUrl);
  }
}