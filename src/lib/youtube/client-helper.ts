/**
 * YouTube API Client Helper
 * Provides Google API client initialization for YouTube Lens
 * Created: 2025-01-21
 */

import { google, type youtube_v3 } from 'googleapis';
import { getDecryptedApiKey } from '@/lib/api-keys';
import { createServerClient } from '@/lib/supabase/server-client';

let _cachedClient: youtube_v3.Youtube | null = null;

/**
 * Get or create YouTube API client
 * @param userId - Optional user ID for server-side calls
 */
export async function getYouTubeClient(user_id?: string): Promise<youtube_v3.Youtube> {
  // For server-side calls, we need to get the API key differently
  let api_key: string | null = null;

  if (user_id) {
    // Server-side: Get decrypted API key from database
    api_key = await getDecryptedApiKey(user_id, 'youtube');
  } else {
    // Client-side fallback or environment variable
    api_key = process.env.YOUTUBE_API_KEY || null;
  }

  if (!api_key) {
    throw new Error('YouTube API key not configured. Please add your API key in settings.');
  }

  // Create YouTube client with API key
  const youtube = google.youtube({
    version: 'v3',
    auth: api_key,
  });

  return youtube;
}

/**
 * Clear cached client (useful when API key changes)
 */
export function clearYouTubeClient(): void {
  _cachedClient = null;
}

/**
 * Track API quota usage
 */
export async function trackQuotaUsage(operation: string, units: number): Promise<void> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const today = new Date().toISOString().split('T')[0];

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
      if (false) { // 임시 비활성화
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

    const today = new Date().toISOString().split('T')[0];

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
export async function checkQuotaBeforeOperation(estimatedUnits: number): Promise<boolean> {
  const { remaining } = await getRemainingQuota();
  return remaining >= estimatedUnits;
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
