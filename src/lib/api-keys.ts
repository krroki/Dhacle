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
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=jNQXAC9IVRw&key=${api_key}`
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        isValid: false,
        error: error.error?.message || 'Invalid API key',
      };
    }

    return { isValid: true };
  } catch (_error) {
    return {
      isValid: false,
      error: 'Failed to validate API key',
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
