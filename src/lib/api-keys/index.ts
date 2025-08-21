import { createServerClient, createSupabaseServiceRoleClient } from '@/lib/supabase/server-client';
import { decryptApiKey, encryptApiKey, maskApiKey, validateApiKeyFormat } from './crypto';

export interface UserApiKey {
  id: string;
  user_id: string;
  service_name: string;
  api_key_masked: string;
  encrypted_key: string;
  created_at: string;
  updated_at: string;
  lastUsedAt: string | null;
  usageCount: number;
  usageToday: number;
  usageDate: string;
  is_active: boolean;
  is_valid: boolean;
  validationError: string | null;
  metadata: Record<string, string | number | boolean | null>;
}

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
  console.log('[saveUserApiKey] Starting...', { user_id, service_name });

  // API Key 형식 검증
  if (!validateApiKeyFormat(api_key, serviceName)) {
    throw new Error('Invalid API key format');
  }

  // 암호화
  const encryptedKey = encryptApiKey(api_key);
  const maskedKey = maskApiKey(api_key);
  console.log('[saveUserApiKey] Encryption successful');

  // Service Role Client 사용 (RLS 우회)
  const supabase = await createSupabaseServiceRoleClient();
  console.log('[saveUserApiKey] Service Role Client created');

  // 기존 키가 있는지 확인
  const { data: existingKey } = await supabase
    .from('user_api_keys')
    .select('id')
    .eq('user_id', user_id)
    .eq('serviceName', serviceName)
    .single();

  let result;

  if (existingKey) {
    // 업데이트
    const { data, error } = await supabase
      .from('user_api_keys')
      .update({
        api_key_masked: maskedKey,
        encrypted_key: encryptedKey,
        is_active: true,
        is_valid: true,
        validationError: null,
        metadata,
      })
      .eq('id', existingKey.id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    console.log('[saveUserApiKey] Updated existing key');
    result = data;
  } else {
    // 새로 생성
    const { data, error } = await supabase
      .from('user_api_keys')
      .insert({
        user_id: user_id,
        service_name: serviceName,
        api_key_masked: maskedKey,
        encrypted_key: encryptedKey,
        metadata,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    console.log('[saveUserApiKey] Inserted new key');
    result = data;
  }

  console.log('[saveUserApiKey] Success:', { id: result?.id });
  return result as UserApiKey;
}

/**
 * 사용자의 API Key 조회
 */
export async function getUserApiKey(
  user_id: string,
  serviceName = 'youtube'
): Promise<UserApiKey | null> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('user_api_keys')
      .select('*')
      .eq('user_id', user_id)
      .eq('serviceName', serviceName)
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
  } catch (_error) {
    return null;
  }
}

/**
 * 암호화된 API Key 복호화
 */
export async function getDecryptedApiKey(
  user_id: string,
  serviceName = 'youtube'
): Promise<string | null> {
  try {
    const apiKeyData = await getUserApiKey(user_id, serviceName);

    if (!apiKeyData || !apiKeyData.encrypted_key) {
      return null;
    }

    // 사용량 증가
    await incrementUsage(apiKeyData.id);

    return decryptApiKey(apiKeyData.encrypted_key);
  } catch (_error) {
    return null;
  }
}

/**
 * API Key 삭제
 */
export async function deleteUserApiKey(user_id: string, serviceName = 'youtube'): Promise<boolean> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('user_api_keys')
      .delete()
      .eq('user_id', user_id)
      .eq('serviceName', serviceName);

    if (error) {
      throw error;
    }

    return true;
  } catch (_error) {
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
      `https://www.googleapis.com/youtube/v3/search?part=id&type=video&maxResults=1&key=${api_key}`,
      { method: 'GET' }
    );

    if (response.ok) {
      // 할당량 정보 추출 (응답 헤더에서)
      const quotaUser = response.headers.get('X-RateLimit-Limit');
      const quotaUsed = response.headers.get('X-RateLimit-Used');

      return {
        is_valid: true,
        quotaInfo: {
          used: Number.parseInt(quotaUsed || '0', 10),
          limit: Number.parseInt(quotaUser || '10000', 10),
          remaining:
            Number.parseInt(quotaUser || '10000', 10) - Number.parseInt(quotaUsed || '0', 10),
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
  } catch (_error) {
    return {
      is_valid: false,
      error: 'Network error during validation',
    };
  }
}

/**
 * API Key 사용량 증가
 */
async function incrementUsage(apiKeyId: string): Promise<void> {
  try {
    const supabase = await createSupabaseServiceRoleClient();

    // userApiKeys에서 user_id와 serviceName 조회
    const { data: keyData, error: fetchError } = await supabase
      .from('user_api_keys')
      .select('user_id, serviceName')
      .eq('id', apiKeyId)
      .single();

    if (fetchError || !keyData) {
      return;
    }

    // PostgreSQL 함수 호출 (올바른 파라미터 사용)
    const { error: rpcError } = await supabase.rpc('increment_api_key_usage', {
      pUserId: keyData.user_id,
      pServiceName: keyData.service_name,
    });

    if (rpcError) {
    }
  } catch (_error) {}
}

/**
 * API Key 유효성 상태 업데이트
 */
export async function updateApiKeyValidity(
  user_id: string,
  service_name: string,
  is_valid: boolean,
  validationError?: string
): Promise<void> {
  try {
    const supabase = await createServerClient();

    await supabase
      .from('user_api_keys')
      .update({
        is_valid: isValid,
        validationError: validationError || null,
      })
      .eq('user_id', user_id)
      .eq('serviceName', serviceName);
  } catch (_error) {}
}

// Re-export crypto functions
export {
  generateEncryptionKey,
  hasEncryptionKey,
  maskApiKey,
  validateApiKeyFormat,
} from './crypto';
