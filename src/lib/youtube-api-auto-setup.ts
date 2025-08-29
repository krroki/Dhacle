/**
 * YouTube API 자동 설정 모듈
 * localhost 개발 환경에서 API Key를 자동으로 설정
 */

import { apiGet, apiPost } from '@/lib/api-client';
import { env } from '@/env';

export async function autoSetupYouTubeApiKey() {
  // 개발 환경 체크
  if (env.NODE_ENV !== 'development') {
    return { success: false, message: 'Production environment' };
  }

  // localhost 체크
  if (typeof window !== 'undefined' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1') {
    return { success: false, message: 'Not localhost' };
  }

  try {
    // 기존 API Key 확인
    const apiKeyStatus = await apiGet<{
      success: boolean;
      data?: {
        id: string;
        is_active: boolean;
      };
    }>('/api/user/api-keys?service=youtube');

    if (apiKeyStatus.data && apiKeyStatus.data.is_active) {
      console.log('✅ YouTube API Key already active');
      return { success: true, message: 'API Key already active', existing: true };
    }

    // 환경변수에서 YouTube API Key 가져오기
    const youtubeApiKey = env.YOUTUBE_API_KEY;
    if (!youtubeApiKey) {
      console.warn('⚠️ YOUTUBE_API_KEY not found in environment variables');
      return { success: false, message: 'API Key not configured in env' };
    }

    // API Route를 통해 API Key 저장
    const saveResult = await apiPost<{
      success: boolean;
      data?: {
        id: string;
        service_name: string;
        api_key_masked: string;
        created_at: string;
        is_valid: boolean;
      };
      message?: string;
      error?: string;
    }>('/api/user/api-keys', {
      api_key: youtubeApiKey,
      service_name: 'youtube',
      metadata: {
        auto_setup: true,
        setup_time: new Date().toISOString()
      }
    });

    if (!saveResult.success) {
      console.error('Failed to save API Key:', saveResult.error);
      return { success: false, message: saveResult.error || 'Failed to save API Key' };
    }

    console.log('✅ YouTube API Key saved automatically');
    return { success: true, message: 'API Key saved', created: true };
  } catch (error) {
    console.error('Auto-setup error:', error);
    return { success: false, message: 'Auto-setup failed', error };
  }
}

/**
 * 개발 환경에서 자동 로그인 상태 확인
 */
export function isDevAutoLoginEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    env.NODE_ENV === 'development' &&
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1')
  );
}