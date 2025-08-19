import { createServerClient, createSupabaseServiceRoleClient } from '@/lib/supabase/server-client';
import { decryptApiKey, encryptApiKey, maskApiKey, validateApiKeyFormat } from './crypto';

export interface UserApiKey {
  id: string;
  user_id: string;
  serviceName: string;
  apiKeyMasked: string;
  encryptedKey: string;
  created_at: string;
  updated_at: string;
  lastUsedAt: string | null;
  usageCount: number;
  usageToday: number;
  usageDate: string;
  is_active: boolean;
  isValid: boolean;
  validationError: string | null;
  metadata: Record<string, string | number | boolean | null>;
}

export interface SaveApiKeyParams {
  userId: string;
  apiKey: string;
  serviceName?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface ApiKeyValidationResult {
  isValid: boolean;
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
  userId,
  apiKey,
  serviceName = 'youtube',
  metadata = {},
}: SaveApiKeyParams): Promise<UserApiKey> {
  console.log('[saveUserApiKey] Starting...', { userId, serviceName });

  // API Key 형식 검증
  if (!validateApiKeyFormat(apiKey, serviceName)) {
    throw new Error('Invalid API key format');
  }

  // 암호화
  const encryptedKey = encryptApiKey(apiKey);
  const maskedKey = maskApiKey(apiKey);
  console.log('[saveUserApiKey] Encryption successful');

  // Service Role Client 사용 (RLS 우회)
  const supabase = await createSupabaseServiceRoleClient();
  console.log('[saveUserApiKey] Service Role Client created');

  // 기존 키가 있는지 확인
  const { data: existingKey } = await supabase
    .from('userApiKeys')
    .select('id')
    .eq('user_id', userId)
    .eq('serviceName', serviceName)
    .single();

  let result;

  if (existingKey) {
    // 업데이트
    const { data, error } = await supabase
      .from('userApiKeys')
      .update({
        apiKeyMasked: maskedKey,
        encryptedKey: encryptedKey,
        is_active: true,
        isValid: true,
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
      .from('userApiKeys')
      .insert({
        user_id: userId,
        serviceName: serviceName,
        apiKeyMasked: maskedKey,
        encryptedKey: encryptedKey,
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
  userId: string,
  serviceName = 'youtube'
): Promise<UserApiKey | null> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('userApiKeys')
      .select('*')
      .eq('user_id', userId)
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
  userId: string,
  serviceName = 'youtube'
): Promise<string | null> {
  try {
    const apiKeyData = await getUserApiKey(userId, serviceName);

    if (!apiKeyData || !apiKeyData.encryptedKey) {
      return null;
    }

    // 사용량 증가
    await incrementUsage(apiKeyData.id);

    return decryptApiKey(apiKeyData.encryptedKey);
  } catch (_error) {
    return null;
  }
}

/**
 * API Key 삭제
 */
export async function deleteUserApiKey(userId: string, serviceName = 'youtube'): Promise<boolean> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('userApiKeys')
      .delete()
      .eq('user_id', userId)
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
export async function validateYouTubeApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
  try {
    // YouTube Data API v3의 search 엔드포인트를 사용하여 검증
    // search.list는 필터 없이도 작동하므로 API Key 검증에 적합
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=id&type=video&maxResults=1&key=${apiKey}`,
      { method: 'GET' }
    );

    if (response.ok) {
      // 할당량 정보 추출 (응답 헤더에서)
      const quotaUser = response.headers.get('X-RateLimit-Limit');
      const quotaUsed = response.headers.get('X-RateLimit-Used');

      return {
        isValid: true,
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
        isValid: false,
        error: 'Invalid API key',
      };
    }

    if (response.status === 403 && error.error?.message?.includes('quota')) {
      return {
        isValid: true,
        error: 'Quota exceeded',
        quotaInfo: {
          used: 10000,
          limit: 10000,
          remaining: 0,
        },
      };
    }

    return {
      isValid: false,
      error: error.error?.message || 'Validation failed',
    };
  } catch (_error) {
    return {
      isValid: false,
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
      .from('userApiKeys')
      .select('user_id, serviceName')
      .eq('id', apiKeyId)
      .single();

    if (fetchError || !keyData) {
      return;
    }

    // PostgreSQL 함수 호출 (올바른 파라미터 사용)
    const { error: rpcError } = await supabase.rpc('incrementApiKeyUsage', {
      pUserId: keyData.user_id,
      pServiceName: keyData.serviceName,
    });

    if (rpcError) {
    }
  } catch (_error) {}
}

/**
 * API Key 유효성 상태 업데이트
 */
export async function updateApiKeyValidity(
  userId: string,
  serviceName: string,
  isValid: boolean,
  validationError?: string
): Promise<void> {
  try {
    const supabase = await createServerClient();

    await supabase
      .from('userApiKeys')
      .update({
        isValid: isValid,
        validationError: validationError || null,
      })
      .eq('user_id', userId)
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
