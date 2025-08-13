import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { CryptoUtil } from '@/lib/youtube/crypto';
import { YouTubeOAuth } from '@/lib/youtube/oauth';

/**
 * YouTube OAuth 인증 상태 확인
 * GET /api/youtube/auth/status
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        youtube: null,
        quota: null
      });
    }

    // 저장된 토큰 확인
    const { data: apiKeys, error: fetchError } = await supabase
      .from('user_api_keys')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !apiKeys) {
      return NextResponse.json({
        authenticated: false,
        user: {
          id: user.id,
          email: user.email
        },
        youtube: null,
        quota: null
      });
    }

    // YouTube 인증 상태
    let youtubeAuth = null;
    let needsRefresh = false;

    if (apiKeys.google_access_token) {
      const expiresAt = apiKeys.google_token_expires_at 
        ? new Date(apiKeys.google_token_expires_at)
        : null;
      
      const isExpired = expiresAt ? expiresAt < new Date() : true;
      needsRefresh = isExpired;

      // 토큰이 만료되었고 refresh token이 있으면 갱신 시도
      if (isExpired && apiKeys.google_refresh_token) {
        try {
          const decryptedRefreshToken = CryptoUtil.decrypt(apiKeys.google_refresh_token);
          const newToken = await YouTubeOAuth.refreshAccessToken(decryptedRefreshToken);
          
          // 새 토큰 저장
          const encryptedAccessToken = CryptoUtil.encrypt(newToken.access_token);
          
          const { error: updateError } = await supabase
            .from('user_api_keys')
            .update({
              google_access_token: encryptedAccessToken,
              google_token_expires_at: new Date(newToken.expires_at!).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);

          if (!updateError) {
            needsRefresh = false;
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // refresh 실패시 재로그인 필요
          needsRefresh = true;
        }
      }

      youtubeAuth = {
        authenticated: !needsRefresh,
        email: apiKeys.google_email,
        channelId: apiKeys.youtube_channel_id,
        channelTitle: apiKeys.youtube_channel_title,
        expiresAt: apiKeys.google_token_expires_at,
        needsRefresh
      };
    }

    // 오늘의 API 사용량 확인
    const today = new Date().toISOString().split('T')[0];
    const { data: usage, error: usageError } = await supabase
      .from('api_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    let quotaStatus = null;
    if (!usageError && usage) {
      const used = usage.units_used || 0;
      const limit = 10000; // YouTube API 기본 할당량
      const percentage = (used / limit) * 100;
      
      quotaStatus = {
        used,
        limit,
        remaining: limit - used,
        percentage,
        warning: percentage > 80,
        critical: percentage > 95,
        searchCount: usage.search_count || 0,
        videoCount: usage.video_count || 0,
        resetTime: new Date(today + 'T00:00:00Z').getTime() + (24 * 60 * 60 * 1000) // 다음날 00:00
      };
    } else {
      // 사용량 레코드가 없으면 생성
      quotaStatus = {
        used: 0,
        limit: 10000,
        remaining: 10000,
        percentage: 0,
        warning: false,
        critical: false,
        searchCount: 0,
        videoCount: 0,
        resetTime: new Date(today + 'T00:00:00Z').getTime() + (24 * 60 * 60 * 1000)
      };
    }

    // API 키 상태 (개인 API 키 사용 여부)
    const hasApiKey = !!apiKeys.encrypted_api_key;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      },
      youtube: youtubeAuth,
      apiKey: {
        hasKey: hasApiKey,
        maskedKey: hasApiKey && apiKeys.encrypted_api_key 
          ? CryptoUtil.maskApiKey(CryptoUtil.decrypt(apiKeys.encrypted_api_key))
          : null
      },
      quota: quotaStatus
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check authentication status' },
      { status: 500 }
    );
  }
}