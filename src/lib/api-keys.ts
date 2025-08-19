import crypto from 'node:crypto';
import { createServerClient } from '@/lib/supabase/server-client';

// Type definition for UserApiKey
interface UserApiKey {
  id: string;
  user_id: string;
  serviceName: string;
  encryptedKey: string;
  encryptionIv: string;
  apiKeyMasked?: string;
  is_active: boolean;
  isValid?: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  lastUsedAt?: string | null;
  usageCount?: number;
  usageToday?: number;
  usageDate?: string;
  validationError?: string | null;
}

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || 'fc28f35efe5b90d34e54dfd342e6c3807c2d71d9054adb8dbba1b90a67ca7660';

export async function getDecryptedApiKey(
  userId: string,
  serviceName: string
): Promise<string | null> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('userApiKeys')
      .select('encryptedKey, encryptionIv')
      .eq('user_id', userId)
      .eq('serviceName', serviceName)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    // AES-256 복호화
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      Buffer.from(data.encryptionIv, 'hex')
    );

    let decrypted = decipher.update(data.encryptedKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (_error) {
    return null;
  }
}

export async function encryptApiKey(apiKey: string): Promise<{ encrypted: string; iv: string }> {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
  };
}

export async function saveApiKey(
  userId: string,
  serviceName: string,
  apiKey: string
): Promise<boolean> {
  const supabase = await createServerClient();
  const { encrypted, iv } = await encryptApiKey(apiKey);

  // 기존 키 비활성화
  await supabase
    .from('userApiKeys')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('serviceName', serviceName);

  // 새 키 저장
  const { error } = await supabase.from('userApiKeys').insert({
    user_id: userId,
    serviceName: serviceName,
    encryptedKey: encrypted,
    encryptionIv: iv,
    is_active: true,
  });

  if (error) {
    throw error;
  }
  return true;
}

export async function validateYouTubeApiKey(
  apiKey: string
): Promise<{ isValid: boolean; error?: string; quotaInfo?: Record<string, unknown> }> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=jNQXAC9IVRw&key=${apiKey}`
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
  userId: string;
  apiKey: string;
  serviceName: string;
  metadata?: Record<string, unknown>;
}): Promise<UserApiKey> {
  const { userId, apiKey, serviceName, metadata = {} } = params;
  const supabase = await createServerClient();
  const { encrypted, iv } = await encryptApiKey(apiKey);

  // 기존 키 비활성화
  await supabase
    .from('userApiKeys')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('serviceName', serviceName);

  // API 키 마스킹 (처음 10자리만 보이고 나머지는 *)
  const apiKeyMasked = apiKey.substring(0, 10) + '*'.repeat(Math.max(0, apiKey.length - 10));

  // 새 키 저장
  const { data, error } = await supabase
    .from('userApiKeys')
    .insert({
      user_id: userId,
      serviceName: serviceName,
      encryptedKey: encrypted,
      encryptionIv: iv,
      apiKeyMasked: apiKeyMasked,
      is_active: true,
      isValid: true,
      metadata,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function getUserApiKey(
  userId: string,
  serviceName: string
): Promise<UserApiKey | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('userApiKeys')
    .select('*')
    .eq('user_id', userId)
    .eq('serviceName', serviceName)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }
  return data;
}

export async function deleteUserApiKey(userId: string, serviceName: string): Promise<boolean> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from('userApiKeys')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('serviceName', serviceName);

  return !error;
}
