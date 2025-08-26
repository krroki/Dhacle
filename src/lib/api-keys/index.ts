import { createServerClient, createSupabaseServiceRoleClient } from '@/lib/supabase/server-client';
import type { UserApiKey } from '@/types';
import { decryptApiKey, encryptApiKey, maskApiKey, validateApiKeyFormat } from './crypto';
import { logger } from '@/lib/logger';

export interface SaveApiKeyParams {
  user_id: string;
  api_key: string;
  serviceName?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface ApiKeyValidationResult {
  is_valid: boolean;
  error?: string;
  quotaInfo?: {
    used: number;
    limit: number;
    remaining: number;
  };
}

/**
 * 사용자의 API Key 저장
 */
export async function saveUserApiKey({
  user_id,
  api_key,
  serviceName = 'youtube',
  metadata = {},
}: SaveApiKeyParams): Promise<UserApiKey> {
  logger.debug('[saveUserApiKey] Starting...', { userId: user_id, metadata: { serviceName } });

  // API Key 형식 검증
  if (!validateApiKeyFormat(api_key, serviceName)) {
    throw new Error('Invalid API key format');
  }

  // 암호화
  const encrypted_key = encryptApiKey(api_key);
  const masked_key = maskApiKey(api_key);
  logger.debug('[saveUserApiKey] Encryption successful');

  // Service Role Client 사용 (RLS 우회)
  const supabase = await createSupabaseServiceRoleClient();
  logger.debug('[saveUserApiKey] Service Role Client created');

  // 기존 키가 있는지 확인
  const { data: existing_key } = await supabase
    .from('user_api_keys')
    .select('id')
    .eq('user_id', user_id)
    .eq('service_name', serviceName)
    .single();

  let result;

  if (existing_key) {
    // 업데이트
    const { data, error } = await supabase
      .from('user_api_keys')
      .update({
        api_key_masked: masked_key,
        encrypted_key: encrypted_key,
        is_active: true,
        is_valid: true,
        validationError: null,
        metadata,
      })
      .eq('id', existing_key.id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    logger.info('[saveUserApiKey] Updated existing key', { userId: user_id });
    result = data;
  } else {
    // 새로 생성
    const { data, error } = await supabase
      .from('user_api_keys')
      .insert({
        user_id: user_id,
        service_name: serviceName,
        api_key_masked: masked_key,
        encrypted_key: encrypted_key,
        metadata,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    logger.info('[saveUserApiKey] Inserted new key', { userId: user_id });
    result = data;
  }

  logger.info('[saveUserApiKey] Success', { userId: user_id, metadata: { id: result?.id } });
  return result as UserApiKey;
}

/**
 * 사용자의 API Key 조회
 */
export async function getUserApiKey(
  user_id: string,
  service_name = 'youtube'
): Promise<UserApiKey | null> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('user_api_keys')
      .select('*')
      .eq('user_id', user_id)
      .eq('service_name', service_name)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data as UserApiKey;
  } catch (error) {
    console.error('Library error:', error);
    return null;
  }
}

/**
 * 암호화된 API Key 복호화
 */
export async function getDecryptedApiKey(
  user_id: string,
  service_name = 'youtube'
): Promise<string | null> {
  try {
    const api_key_data = await getUserApiKey(user_id, service_name);

    if (!api_key_data || !api_key_data.encrypted_key) {
      return null;
    }

    // 사용량 증가
    await increment_usage(api_key_data.id);

    return decryptApiKey(api_key_data.encrypted_key);
  } catch (error) {
    console.error('Library error:', error);
    return null;
  }
}

/**
 * API Key 삭제
 */
export async function deleteUserApiKey(
  user_id: string,
  service_name = 'youtube'
): Promise<boolean> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('user_api_keys')
      .delete()
      .eq('user_id', user_id)
      .eq('service_name', service_name);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Library error:', error);
    return false;
  }
}

/**
 * YouTube API Key 유효성 검증
 */
export async function validateYouTubeApiKey(api_key: string): Promise<ApiKeyValidationResult> {
  try {
    // YouTube Data API v3의 search 엔드포인트를 사용하여 검증
    // search.list는 필터 없이도 작동하므로 API Key 검증에 적합
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=id&type=video&maxResults=1&key=${api_key}`, // External API: YouTube
      { method: 'GET' }
    );

    if (response.ok) {
      // 할당량 정보 추출 (응답 헤더에서)
      const quota_user = response.headers.get('X-RateLimit-Limit');
      const quota_used = response.headers.get('X-RateLimit-Used');

      return {
        is_valid: true,
        quotaInfo: {
          used: Number.parseInt(quota_used || '0', 10),
          limit: Number.parseInt(quota_user || '10000', 10),
          remaining:
            Number.parseInt(quota_user || '10000', 10) - Number.parseInt(quota_used || '0', 10),
        },
      };
    }

    const error = await response.json();

    if (response.status === 403 && error.error?.message?.includes('API key not valid')) {
      return {
        is_valid: false,
        error: 'Invalid API key',
      };
    }

    if (response.status === 403 && error.error?.message?.includes('quota')) {
      return {
        is_valid: true,
        error: 'Quota exceeded',
        quotaInfo: {
          used: 10000,
          limit: 10000,
          remaining: 0,
        },
      };
    }

    return {
      is_valid: false,
      error: error.error?.message || 'Validation failed',
    };
  } catch (error) {
    console.error('Library error:', error);
    return {
      is_valid: false,
      error: 'Network error during validation',
    };
  }
}

/**
 * API Key 사용량 증가
 */
async function increment_usage(api_key_id: string): Promise<void> {
  let key_data: { user_id: string; service_name: string } | null = null;
  
  try {
    const supabase = await createSupabaseServiceRoleClient();

    // userApiKeys에서 user_id와 serviceName 조회
    const { data, error: fetch_error } = await supabase
      .from('user_api_keys')
      .select('user_id, service_name')
      .eq('id', api_key_id)
      .single();

    key_data = data;

    if (fetch_error || !key_data) {
      if (fetch_error) {
        logger.error('Failed to fetch API key data', fetch_error, {
          metadata: { api_key_id }
        });
      }
      return;
    }

    // PostgreSQL 함수 호출 (올바른 파라미터 사용)
    const { error: rpc_error } = await supabase.rpc('increment_api_key_usage', {
      p_user_id: key_data.user_id,
      p_service_name: key_data.service_name,
    });

    if (rpc_error) {
      logger.error('Failed to increment API key usage', rpc_error, {
        userId: key_data.user_id,
        metadata: { service_name: key_data.service_name }
      });
    }
  } catch (error) {
    logger.error('Error tracking API key usage', error, {
      userId: key_data?.user_id,
      metadata: { service_name: key_data?.service_name, api_key_id }
    });
  }
}

/**
 * API Key 유효성 상태 업데이트
 */
export async function updateApiKeyValidity(
  user_id: string,
  service_name: string,
  is_valid: boolean,
  validation_error?: string
): Promise<void> {
  try {
    const supabase = await createServerClient();

    await supabase
      .from('user_api_keys')
      .update({
        is_valid: is_valid,
        validationError: validation_error || null,
      })
      .eq('user_id', user_id)
      .eq('service_name', service_name);
  } catch (error) {
    logger.error('Failed to update API key validity', error, {
      userId: user_id,
      metadata: { service_name, is_valid, validation_error }
    });
  }
}

// Re-export crypto functions
export {
  generateEncryptionKey,
  hasEncryptionKey,
  maskApiKey,
  validateApiKeyFormat,
} from './crypto';
