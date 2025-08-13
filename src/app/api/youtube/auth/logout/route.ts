import { NextRequest, NextResponse } from 'next/server';
import { YouTubeOAuth } from '@/lib/youtube/oauth';
import { CryptoUtil } from '@/lib/youtube/crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { cookies } from 'next/headers';

/**
 * Google OAuth 로그아웃
 * POST /api/youtube/auth/logout
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // 저장된 토큰 가져오기
    const { data: apiKeys, error: fetchError } = await supabase
      .from('user_api_keys')
      .select('google_access_token, google_refresh_token')
      .eq('user_id', user.id)
      .single();

    if (!fetchError && apiKeys) {
      // Google에서 토큰 취소
      try {
        if (apiKeys.google_access_token) {
          const decryptedToken = CryptoUtil.decrypt(apiKeys.google_access_token);
          await YouTubeOAuth.revokeToken(decryptedToken);
        }
      } catch (revokeError) {
        console.warn('Failed to revoke Google token:', revokeError);
        // 계속 진행
      }

      // DB에서 토큰 삭제
      const { error: deleteError } = await supabase
        .from('user_api_keys')
        .update({
          google_access_token: null,
          google_refresh_token: null,
          google_token_expires_at: null,
          google_email: null,
          youtube_channel_id: null,
          youtube_channel_title: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Failed to delete OAuth tokens:', deleteError);
      }
    }

    // 세션 쿠키 삭제
    const cookieStore = await cookies();
    cookieStore.delete('youtube_auth');

    return NextResponse.json(
      { message: 'Successfully logged out from YouTube' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}

/**
 * OAuth 상태 확인
 * GET /api/youtube/auth/logout (실제로는 /status 엔드포인트로 분리하는 것이 좋음)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    // 저장된 토큰 확인
    const { data: apiKeys, error: fetchError } = await supabase
      .from('user_api_keys')
      .select('google_email, youtube_channel_title, google_token_expires_at')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !apiKeys?.google_email) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    // 토큰 만료 확인
    const isExpired = apiKeys.google_token_expires_at 
      ? new Date(apiKeys.google_token_expires_at) < new Date()
      : true;

    return NextResponse.json({
      authenticated: !isExpired,
      email: apiKeys.google_email,
      channelTitle: apiKeys.youtube_channel_title,
      expiresAt: apiKeys.google_token_expires_at,
      needsRefresh: isExpired
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check authentication status' },
      { status: 500 }
    );
  }
}