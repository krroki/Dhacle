import { NextRequest, NextResponse } from 'next/server';
import { YouTubeOAuth } from '@/lib/youtube/oauth';
import { CryptoUtil } from '@/lib/youtube/crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { cookies } from 'next/headers';

/**
 * Google OAuth 콜백 처리
 * GET /api/youtube/auth/callback
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  try {
    // 에러 체크 (사용자가 거부한 경우 등)
    if (error) {
      console.error('OAuth error:', error);
      const errorUrl = new URL('/tools/youtube-lens', request.url);
      errorUrl.searchParams.set('error', 'oauth_denied');
      return NextResponse.redirect(errorUrl);
    }

    // 필수 파라미터 체크
    if (!code || !state) {
      throw new Error('Missing required OAuth parameters');
    }

    // CSRF 토큰 검증
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    
    if (!storedState || !CryptoUtil.verifyCSRFToken(state, storedState)) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    // state 쿠키 삭제
    cookieStore.delete('oauth_state');

    // Authorization code를 token으로 교환
    const oauthToken = await YouTubeOAuth.exchangeCodeForToken(code);
    
    // Supabase 클라이언트 생성
    const supabase = await createServerSupabaseClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // 사용자 정보 가져오기
    const userInfo = await YouTubeOAuth.getUserInfo(oauthToken.access_token);
    
    // YouTube 채널 정보 가져오기 (선택사항)
    let channelInfo = null;
    try {
      channelInfo = await YouTubeOAuth.getYouTubeChannel(oauthToken.access_token);
    } catch (channelError) {
      console.warn('Failed to fetch YouTube channel:', channelError);
      // 채널이 없어도 계속 진행
    }

    // 토큰 암호화
    const encryptedAccessToken = CryptoUtil.encrypt(oauthToken.access_token);
    const encryptedRefreshToken = oauthToken.refresh_token 
      ? CryptoUtil.encrypt(oauthToken.refresh_token) 
      : null;

    // user_api_keys 테이블에 저장 또는 업데이트
    const { error: upsertError } = await supabase
      .from('user_api_keys')
      .upsert({
        user_id: user.id,
        google_access_token: encryptedAccessToken,
        google_refresh_token: encryptedRefreshToken,
        google_token_expires_at: new Date(oauthToken.expires_at!).toISOString(),
        google_email: userInfo.email,
        youtube_channel_id: channelInfo?.items?.[0]?.id || null,
        youtube_channel_title: channelInfo?.items?.[0]?.snippet?.title || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Failed to save OAuth token:', upsertError);
      throw new Error('Failed to save authentication');
    }

    // 초기 API 사용량 레코드 생성 (없는 경우)
    const today = new Date().toISOString().split('T')[0];
    const { error: quotaError } = await supabase
      .from('api_usage')
      .upsert({
        user_id: user.id,
        date: today,
        units_used: 0,
        search_count: 0,
        video_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,date',
        ignoreDuplicates: true
      });

    if (quotaError) {
      console.warn('Failed to create API usage record:', quotaError);
      // 계속 진행
    }

    // 성공 리다이렉트
    const successUrl = new URL('/tools/youtube-lens', request.url);
    successUrl.searchParams.set('auth', 'success');
    
    // 세션 쿠키 설정 (선택사항 - 클라이언트에서 API 호출시 사용)
    cookieStore.set('youtube_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/'
    });

    return NextResponse.redirect(successUrl);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    
    // 에러 발생시 에러 페이지로 리다이렉트
    const errorUrl = new URL('/tools/youtube-lens', request.url);
    
    if (error instanceof Error) {
      if (error.message.includes('CSRF')) {
        errorUrl.searchParams.set('error', 'security_error');
      } else if (error.message.includes('authenticated')) {
        errorUrl.searchParams.set('error', 'auth_required');
      } else {
        errorUrl.searchParams.set('error', 'oauth_failed');
      }
    } else {
      errorUrl.searchParams.set('error', 'unknown_error');
    }
    
    return NextResponse.redirect(errorUrl);
  }
}