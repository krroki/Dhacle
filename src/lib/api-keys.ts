import crypto from 'node:crypto';
import { createServerClient } from '@/lib/supabase/server-client';
import type { Json, UserApiKey } from '@/types';

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || 'fc28f35efe5b90d34e54dfd342e6c3807c2d71d9054adb8dbba1b90a67ca7660';

export async function getDecryptedApiKey(
  user_id: string,
  service_name: string
): Promise<string | null> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('user_api_keys')
      .select('encrypted_key')
      .eq('user_id', user_id)
      .eq('service_name', service_name)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    // AES-256 복호화
    // The encrypted_key field contains IV (first 32 chars) + encrypted data
    const combined_data = data?.encrypted_key;
    if (!combined_data || combined_data.length < 33) {
      return null;
    }

    const iv = combined_data.slice(0, 32);
    const encrypted_data = combined_data.slice(32);

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      Buffer.from(iv, 'hex')
    );

    let decrypted = decipher.update(encrypted_data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (_error) {
    return null;
  }
}

export async function encryptApiKey(api_key: string): Promise<{ encrypted: string; iv: string }> {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(api_key, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
  };
}

export async function saveApiKey(
  user_id: string,
  service_name: string,
  api_key: string
): Promise<boolean> {
  const supabase = await createServerClient();
  const { encrypted, iv } = await encryptApiKey(api_key);

  // 기존 키 비활성화
  await supabase
    .from('user_api_keys')
    .update({ is_active: false })
    .eq('user_id', user_id)
    .eq('service_name', service_name);

  // 새 키 저장 (IV와 encrypted data를 concatenate)
  const masked_key = `****${api_key.slice(-4)}`; // Show last 4 chars

  const { error } = await supabase.from('user_api_keys').insert({
    user_id: user_id,
    service_name: service_name,
    encrypted_key: iv + encrypted, // Store IV + encrypted data together
    api_key_masked: masked_key,
    is_active: true,
  });

  if (error) {
    throw error;
  }
  return true;
}

export async function validateYouTubeApiKey(
  api_key: string
): Promise<{ isValid: boolean; error?: string; quotaInfo?: Record<string, unknown> }> {
  try {
    console.log('[validateYouTubeApiKey] Starting validation...');

    // API Key 형식 검증
    if (!api_key.startsWith('AIza') || api_key.length !== 39) {
      console.log('[validateYouTubeApiKey] Invalid format');
      return {
        isValid: false,
        error: 'Invalid API key format',
      };
    }

    // YouTube API 호출
    const test_video_id = 'jNQXAC9IVRw'; // 유명한 테스트 비디오
    const api_url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${test_video_id}&key=${api_key}`;

    console.log('[validateYouTubeApiKey] Calling YouTube API...');
    const response = await fetch(api_url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      // Node.js 환경에서 실행되므로 CORS 문제 없음
      cache: 'no-store',
    });

    const response_text = await response.text();
    console.log('[validateYouTubeApiKey] Response status:', response.status);

    if (!response.ok) {
      // 에러 응답 파싱
      let error_data;
      try {
        error_data = JSON.parse(response_text);
      } catch {
        error_data = { error: { message: response_text } };
      }

      const error_message = error_data?.error?.message || 'Invalid API key';
      console.log('[validateYouTubeApiKey] API Error:', error_message);

      // 구체적인 에러 메시지 제공
      if (error_message.includes('API key not valid')) {
        return {
          isValid: false,
          error: 'API key가 유효하지 않습니다. Google Cloud Console에서 key를 확인해주세요.',
        };
      }
      if (error_message.includes('YouTube Data API')) {
        return {
          isValid: false,
          error:
            'YouTube Data API v3가 활성화되지 않았습니다. Google Cloud Console에서 활성화해주세요.',
        };
      }
      if (error_message.includes('exceeded')) {
        return {
          isValid: false,
          error: 'API 할당량이 초과되었습니다. 내일 다시 시도하거나 새 key를 사용해주세요.',
        };
      }

      return {
        isValid: false,
        error: error_message,
      };
    }

    // 성공적으로 검증됨
    console.log('[validateYouTubeApiKey] Validation successful');

    return {
      isValid: true,
      quotaInfo: {
        message: 'API key가 정상적으로 작동합니다.',
        testResult: 'success',
      },
    };
  } catch (error) {
    console.error('[validateYouTubeApiKey] Unexpected error:', error);
    return {
      isValid: false,
      error:
        error instanceof Error ? error.message : 'API key 검증 중 예기치 않은 오류가 발생했습니다.',
    };
  }
}

export async function saveUserApiKey(params: {
  user_id: string;
  api_key: string;
  service_name: string;
  metadata?: Record<string, unknown>;
}): Promise<UserApiKey> {
  const { user_id, api_key, service_name, metadata = {} } = params;
  const supabase = await createServerClient();
  const { encrypted, iv } = await encryptApiKey(api_key);

  // 기존 키 비활성화
  await supabase
    .from('user_api_keys')
    .update({ is_active: false })
    .eq('user_id', user_id)
    .eq('service_name', service_name);

  // API 키 마스킹 (처음 10자리만 보이고 나머지는 *)
  const api_key_masked = api_key.substring(0, 10) + '*'.repeat(Math.max(0, api_key.length - 10));

  // 새 키 저장 (IV와 encrypted data를 concatenate)
  const { data, error } = await supabase
    .from('user_api_keys')
    .insert({
      user_id: user_id,
      service_name: service_name as string,
      encrypted_key: iv + encrypted, // Store IV + encrypted data together
      api_key_masked: api_key_masked,
      is_active: true,
      is_valid: true,
      metadata: metadata as unknown as Json | null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function getUserApiKey(
  user_id: string,
  service_name: string
): Promise<UserApiKey | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('user_api_keys')
    .select('*')
    .eq('user_id', user_id)
    .eq('service_name', service_name)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }
  return data;
}

export async function deleteUserApiKey(user_id: string, service_name: string): Promise<boolean> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from('user_api_keys')
    .update({ is_active: false })
    .eq('user_id', user_id)
    .eq('service_name', service_name);

  return !error;
}
