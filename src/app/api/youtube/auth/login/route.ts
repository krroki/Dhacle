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
    
    // 에러 발생시 에러 페이지로 리다이렉트
    const errorUrl = new URL('/auth/error', request.url);
    errorUrl.searchParams.set('error', 'oauth_init_failed');
    
    return NextResponse.redirect(errorUrl);
  }
}