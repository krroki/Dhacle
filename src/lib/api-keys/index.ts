import { createServerClient } from '@/lib/supabase/server-client';
import { encryptApiKey, decryptApiKey, maskApiKey, validateApiKeyFormat } from './crypto';

export interface UserApiKey {
  id: string;
  user_id: string;
  service_name: string;
  api_key_masked: string;
  encrypted_key: string;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
  usage_count: number;
  usage_today: number;
  usage_date: string;
  is_active: boolean;
  is_valid: boolean;
  validation_error: string | null;
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
  metadata = {}
}: SaveApiKeyParams): Promise<UserApiKey> {
  try {
    // API Key 형식 검증
    if (!validateApiKeyFormat(apiKey, serviceName)) {
      throw new Error('Invalid API key format');
    }
    
    // 암호화
    const encryptedKey = encryptApiKey(apiKey);
    const maskedKey = maskApiKey(apiKey);
    
    const supabase = await createServerClient();
    
    // 기존 키가 있는지 확인
    const { data: existingKey } = await supabase
      .from('user_api_keys')
      .select('id')
      .eq('user_id', userId)
      .eq('service_name', serviceName)
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
          validation_error: null,
          metadata
        })
        .eq('id', existingKey.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // 새로 생성
      const { data, error } = await supabase
        .from('user_api_keys')
        .insert({
          user_id: userId,
          service_name: serviceName,
          api_key_masked: maskedKey,
          encrypted_key: encryptedKey,
          metadata
        })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    return result as UserApiKey;
  } catch (error) {
    console.error('Error saving API key:', error);
    throw error;
  }
}

/**
 * 사용자의 API Key 조회
 */
export async function getUserApiKey(
  userId: string,
  serviceName: string = 'youtube'
): Promise<UserApiKey | null> {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('user_api_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('service_name', serviceName)
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
    console.error('Error fetching API key:', error);
    return null;
  }
}

/**
 * 암호화된 API Key 복호화
 */
export async function getDecryptedApiKey(
  userId: string,
  serviceName: string = 'youtube'
): Promise<string | null> {
  try {
    const apiKeyData = await getUserApiKey(userId, serviceName);
    
    if (!apiKeyData || !apiKeyData.encrypted_key) {
      return null;
    }
    
    // 사용량 증가
    await incrementUsage(apiKeyData.id);
    
    return decryptApiKey(apiKeyData.encrypted_key);
  } catch (error) {
    console.error('Error decrypting API key:', error);
    return null;
  }
}

/**
 * API Key 삭제
 */
export async function deleteUserApiKey(
  userId: string,
  serviceName: string = 'youtube'
): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    
    const { error } = await supabase
      .from('user_api_keys')
      .delete()
      .eq('user_id', userId)
      .eq('service_name', serviceName);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting API key:', error);
    return false;
  }
}

/**
 * YouTube API Key 유효성 검증
 */
export async function validateYouTubeApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
  try {
    // YouTube Data API v3를 사용하여 검증
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=id&maxResults=1&key=${apiKey}`,
      { method: 'GET' }
    );
    
    if (response.ok) {
      // 할당량 정보 추출 (응답 헤더에서)
      const quotaUser = response.headers.get('X-RateLimit-Limit');
      const quotaUsed = response.headers.get('X-RateLimit-Used');
      
      return {
        isValid: true,
        quotaInfo: {
          used: parseInt(quotaUsed || '0'),
          limit: parseInt(quotaUser || '10000'),
          remaining: parseInt(quotaUser || '10000') - parseInt(quotaUsed || '0')
        }
      };
    }
    
    const error = await response.json();
    
    if (response.status === 403 && error.error?.message?.includes('API key not valid')) {
      return {
        isValid: false,
        error: 'Invalid API key'
      };
    }
    
    if (response.status === 403 && error.error?.message?.includes('quota')) {
      return {
        isValid: true,
        error: 'Quota exceeded',
        quotaInfo: {
          used: 10000,
          limit: 10000,
          remaining: 0
        }
      };
    }
    
    return {
      isValid: false,
      error: error.error?.message || 'Validation failed'
    };
  } catch (error) {
    console.error('Error validating YouTube API key:', error);
    return {
      isValid: false,
      error: 'Network error during validation'
    };
  }
}

/**
 * API Key 사용량 증가
 */
async function incrementUsage(apiKeyId: string): Promise<void> {
  try {
    const supabase = await createServerClient();
    
    // PostgreSQL 함수 호출
    await supabase.rpc('increment_api_key_usage', {
      p_api_key_id: apiKeyId
    });
  } catch (error) {
    console.error('Error incrementing usage:', error);
  }
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
      .from('user_api_keys')
      .update({
        is_valid: isValid,
        validation_error: validationError || null
      })
      .eq('user_id', userId)
      .eq('service_name', serviceName);
  } catch (error) {
    console.error('Error updating API key validity:', error);
  }
}

// Re-export crypto functions
export { maskApiKey, validateApiKeyFormat, hasEncryptionKey, generateEncryptionKey } from './crypto';