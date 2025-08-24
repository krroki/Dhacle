/**
 * YouTube API Client Helper
 * Provides Google API client initialization for YouTube Lens
 * Created: 2025-01-21
 */

import { google, type youtube_v3 } from 'googleapis';
import { getDecryptedApiKey } from '@/lib/api-keys';
import { createServerClient } from '@/lib/supabase/server-client';
import { env } from '@/env';

/**
 * Get or create YouTube API client
 * @param userId - Optional user ID for server-side calls
 */
export async function getYouTubeClient(user_id?: string): Promise<youtube_v3.Youtube> {
  // For server-side calls, we need to get the API key differently
  let api_key: string | null = null;
  let key_source: 'user' | 'env' | 'none' = 'none';

  if (user_id) {
    // Server-side: Get decrypted API key from database
    api_key = await getDecryptedApiKey(user_id, 'youtube');
    if (api_key) {
      key_source = 'user';
      console.log('[YouTube Client] Using user-specific API key');
    }
  }

  // Fallback to environment variable if no user key
  if (!api_key) {
    const env_key = env.YOUTUBE_API_KEY;
    if (env_key) {
      api_key = env_key;
      key_source = 'env';
      console.log('[YouTube Client] Using environment variable API key');
    } else {
      console.error('[YouTube Client] No API key found:', {
        hasUserId: Boolean(user_id),
        hasEnvKey: Boolean(env.YOUTUBE_API_KEY),
      });
    }
  }

  if (!api_key) {
    const error_message = user_id
      ? 'YouTube API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 추가해주세요.'
      : 'YouTube API 키가 환경변수에 설정되지 않았습니다. YOUTUBE_API_KEY를 설정해주세요.';

    throw new Error(error_message);
  }

  // Create YouTube client with API key
  const youtube = google.youtube({
    version: 'v3',
    auth: api_key,
  });

  console.log('[YouTube Client] Client created successfully', {
    keySource: key_source,
    keyLength: api_key.length,
  });

  return youtube;
}

/**
 * Clear cached client (useful when API key changes)
 */
export function clearYouTubeClient(): void {
  // No cached client to clear
}

/**
 * Track API quota usage
 */
export async function trackQuotaUsage(_operation: string, _units: number): Promise<void> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // TODO: api_usage 테이블이 없으므로 임시로 주석 처리
      // API 사용량 추적 기능은 추후 구현 필요
      /*
      const { data: existing } = await supabase
        .from('api_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (existing) {
        // Update existing record
        await supabase
          .from('api_usage')
          .update({
            unitsUsed: existing.unitsUsed + units,
            [`${operation}_count`]: (existing[`${operation}_count`] || 0) + 1,
          })
          .eq('id', existing.id);
      } else {
      */
      if (false) {
        // 임시 비활성화
        // Create new record
        /*
        await supabase.from('api_usage').insert({
          user_id: user.id,
          operation,
          units,
          date: today,
          unitsUsed: units,
          [`${operation}_count`]: 1,
        });
        */
      }
    }
  } catch (_error) {}
}

/**
 * Get remaining quota for today
 */
export async function getRemainingQuota(): Promise<{
  used: number;
  limit: number;
  remaining: number;
}> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { used: 0, limit: 10000, remaining: 10000 };
    }

    // Get user's subscription limits
    // TODO: subscriptions 테이블이 없으므로 임시로 주석 처리
    /*
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('apiQuotaDaily')
      .eq('user_id', user.id)
      .single();
    */

    const limit = 1000; // subscription?.apiQuotaDaily || 1000;

    // Get today's usage
    // TODO: api_usage 테이블이 없으므로 임시로 주석 처리
    /*
    const { data: usage } = await supabase
      .from('api_usage')
      .select('unitsUsed')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();
    */

    const used = 0; // usage?.unitsUsed || 0;

    return {
      used,
      limit,
      remaining: Math.max(0, limit - used),
    };
  } catch (_error) {
    return { used: 0, limit: 1000, remaining: 1000 };
  }
}

/**
 * Check if operation would exceed quota
 */
export async function checkQuotaBeforeOperation(estimated_units: number): Promise<boolean> {
  const { remaining } = await getRemainingQuota();
  return remaining >= estimated_units;
}

/**
 * Quota costs for different operations
 */
export const QUOTA_COSTS = {
  search: 100,
  videoDetails: 1, // per video ID
  channelDetails: 1,
  playlistItems: 1,
  comments: 1,
} as const;

/**
 * Estimate quota cost for a search operation
 */
export function estimateSearchQuota(params: {
  maxResults: number;
  includeDetails?: boolean;
}): number {
  let cost = QUOTA_COSTS.search;

  if (params.includeDetails) {
    // Additional cost for fetching video details
    cost += params.maxResults * QUOTA_COSTS.videoDetails;
  }

  return cost;
}
