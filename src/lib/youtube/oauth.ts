import { CryptoUtil } from './crypto';
import type { OAuthToken } from '@/types/youtube';

/**
 * YouTube Channel API Response 타입
 */
interface YouTubeChannelResponse {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
    };
  }>;
}

/**
 * Google OAuth 2.0 헬퍼 클래스
 */
export class YouTubeOAuth {
  private static readonly GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
  private static readonly GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
  private static readonly GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
  
  // YouTube API 스코프
  private static readonly SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  /**
   * OAuth 인증 URL 생성
   */
  static generateAuthUrl(state?: string): string {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    // 환경 변수 검증 - 더 명확한 에러 메시지
    if (!clientId) {
      console.error('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable');
      throw new Error(
        'Google OAuth가 구성되지 않았습니다. ' +
        'NEXT_PUBLIC_GOOGLE_CLIENT_ID 환경 변수를 설정해주세요. ' +
        '자세한 내용은 .env.local.example 파일을 참조하세요.'
      );
    }
    
    if (!siteUrl) {
      console.error('Missing NEXT_PUBLIC_SITE_URL environment variable');
      throw new Error(
        'Site URL이 구성되지 않았습니다. ' +
        'NEXT_PUBLIC_SITE_URL 환경 변수를 설정해주세요. ' +
        '개발 환경: http://localhost:3000'
      );
    }

    const redirectUri = `${siteUrl}/api/youtube/auth/callback`;
    
    // CSRF 방지를 위한 state 파라미터
    const stateParam = state || CryptoUtil.generateCSRFToken();
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: this.SCOPES.join(' '),
      access_type: 'offline', // refresh token 받기 위함
      prompt: 'consent', // 항상 동의 화면 표시
      state: stateParam,
      include_granted_scopes: 'true'
    });

    return `${this.GOOGLE_AUTH_URL}?${params.toString()}`;
  }

  /**
   * Authorization code를 access token으로 교환
   */
  static async exchangeCodeForToken(code: string): Promise<OAuthToken> {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // 환경 변수 검증 - 상세한 에러 메시지
    const missingVars = [];
    if (!clientId) missingVars.push('NEXT_PUBLIC_GOOGLE_CLIENT_ID');
    if (!clientSecret) missingVars.push('GOOGLE_CLIENT_SECRET');
    if (!siteUrl) missingVars.push('NEXT_PUBLIC_SITE_URL');
    
    if (missingVars.length > 0) {
      console.error(`Missing environment variables: ${missingVars.join(', ')}`);
      throw new Error(
        `Google OAuth 설정이 완료되지 않았습니다. ` +
        `다음 환경 변수를 설정해주세요: ${missingVars.join(', ')}. ` +
        `.env.local.example 파일을 참조하여 설정하세요.`
      );
    }
    
    const redirectUri = `${siteUrl}/api/youtube/auth/callback`;

    try {
      const response = await fetch(this.GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: clientId || '',
          client_secret: clientSecret || '',
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        const error = await response.json() as { error?: string; error_description?: string; };
        throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
      }

      const data = await response.json() as { access_token: string; refresh_token?: string; expires_in: number; token_type: string; scope?: string; };
      
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        token_type: data.token_type,
        scope: data.scope || '',
        expires_at: Date.now() + (data.expires_in * 1000)
      };
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  /**
   * Refresh token을 사용해 새로운 access token 획득
   */
  static async refreshAccessToken(refreshToken: string): Promise<OAuthToken> {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials are not configured');
    }

    try {
      const response = await fetch(this.GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const error = await response.json() as { error?: string; error_description?: string; };
        throw new Error(`Token refresh failed: ${error.error_description || error.error}`);
      }

      const data = await response.json() as { access_token: string; expires_in: number; token_type: string; scope?: string; };
      
      return {
        access_token: data.access_token,
        refresh_token: refreshToken, // Refresh token은 재사용
        expires_in: data.expires_in,
        token_type: data.token_type,
        scope: data.scope || '',
        expires_at: Date.now() + (data.expires_in * 1000)
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * 토큰 만료 여부 확인
   */
  static isTokenExpired(token: OAuthToken): boolean {
    if (!token.expires_at) {
      return true;
    }
    // 5분 여유를 두고 체크
    return Date.now() > (token.expires_at - 5 * 60 * 1000);
  }

  /**
   * 토큰 취소 (로그아웃)
   */
  static async revokeToken(token: string): Promise<void> {
    try {
      const response = await fetch(this.GOOGLE_REVOKE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token,
        }),
      });

      if (!response.ok && response.status !== 400) {
        // 400은 이미 취소된 토큰
        throw new Error('Token revocation failed');
      }
    } catch (error) {
      console.error('Token revocation error:', error);
      throw error;
    }
  }

  /**
   * 사용자 정보 가져오기
   */
  static async getUserInfo(accessToken: string): Promise<{
    id: string;
    email: string;
    name: string;
    picture?: string;
  }> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      return await response.json() as {
        id: string;
        email: string;
        name: string;
        picture?: string;
      };
    } catch (error) {
      console.error('User info fetch error:', error);
      throw error;
    }
  }

  /**
   * YouTube 채널 정보 가져오기
   */
  static async getYouTubeChannel(accessToken: string): Promise<YouTubeChannelResponse> {
    try {
      const response = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch YouTube channel');
      }

      return await response.json() as YouTubeChannelResponse;
    } catch (error) {
      console.error('YouTube channel fetch error:', error);
      throw error;
    }
  }

  /**
   * 토큰 자동 갱신 래퍼
   */
  static async withAutoRefresh<T>(
    token: OAuthToken,
    onTokenRefresh: (newToken: OAuthToken) => Promise<void>,
    apiCall: (accessToken: string) => Promise<T>
  ): Promise<T> {
    let currentToken = token;

    // 토큰 만료 체크 및 갱신
    if (this.isTokenExpired(currentToken) && currentToken.refresh_token) {
      try {
        currentToken = await this.refreshAccessToken(currentToken.refresh_token);
        await onTokenRefresh(currentToken);
      } catch (error) {
        console.error('Token refresh failed:', error);
        throw new Error('Authentication expired. Please login again.');
      }
    }

    // API 호출
    try {
      return await apiCall(currentToken.access_token);
    } catch (error: unknown) {
      // 401 에러시 토큰 갱신 후 재시도
      if (error instanceof Error && 'status' in error && (error as { status: number }).status === 401 && currentToken.refresh_token) {
        try {
          currentToken = await this.refreshAccessToken(currentToken.refresh_token);
          await onTokenRefresh(currentToken);
          return await apiCall(currentToken.access_token);
        } catch (refreshError) {
          console.error('Token refresh on 401 failed:', refreshError);
          throw new Error('Authentication expired. Please login again.');
        }
      }
      throw error;
    }
  }
}