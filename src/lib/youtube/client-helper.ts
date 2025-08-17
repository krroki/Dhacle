/**
 * YouTube API Client Helper
 * Provides Google API client initialization for YouTube Lens
 * Created: 2025-01-21
 */

import { google, youtube_v3 } from 'googleapis';
import { getDecryptedApiKey } from '@/lib/api-keys';
import { createServerClient } from '@/lib/supabase/server-client';

let cachedClient: youtube_v3.Youtube | null = null;

/**
 * Get or create YouTube API client
 * @param userId - Optional user ID for server-side calls
 */
export async function getYouTubeClient(userId?: string): Promise<youtube_v3.Youtube> {
  // For server-side calls, we need to get the API key differently
  let apiKey: string | null = null;
  
  if (userId) {
    // Server-side: Get decrypted API key from database
    apiKey = await getDecryptedApiKey(userId, 'youtube');
  } else {
    // Client-side fallback or environment variable
    apiKey = process.env.YOUTUBE_API_KEY || null;
  }
  
  if (!apiKey) {
    console.error('[getYouTubeClient] API key not found:', {
      userId,
      hasUserId: !!userId,
      hasEnvKey: !!process.env.YOUTUBE_API_KEY
    });
    throw new Error('YouTube API key not configured. Please add your API key in settings.');
  }

  // Create YouTube client with API key
  const youtube = google.youtube({
    version: 'v3',
    auth: apiKey,
  });

  return youtube;
}


/**
 * Clear cached client (useful when API key changes)
 */
export function clearYouTubeClient(): void {
  cachedClient = null;
}

/**
 * Track API quota usage
 */
export async function trackQuotaUsage(
  operation: string,
  units: number
): Promise<void> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if record exists for today
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
            units_used: existing.units_used + units,
            [`${operation}_count`]: (existing[`${operation}_count`] || 0) + 1
          })
          .eq('id', existing.id);
      } else {
        // Create new record
        await supabase
          .from('api_usage')
          .insert({
            user_id: user.id,
            operation,
            units,
            date: today,
            units_used: units,
            [`${operation}_count`]: 1
          });
      }
    }
  } catch (error) {
    console.error('[trackQuotaUsage] Error:', {
      error: error instanceof Error ? error.message : String(error),
      operation,
      units
    });
  }
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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { used: 0, limit: 10000, remaining: 10000 };
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Get user's subscription limits
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('api_quota_daily')
      .eq('user_id', user.id)
      .single();
    
    const limit = subscription?.api_quota_daily || 1000;
    
    // Get today's usage
    const { data: usage } = await supabase
      .from('api_usage')
      .select('units_used')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();
    
    const used = usage?.units_used || 0;
    
    return {
      used,
      limit,
      remaining: Math.max(0, limit - used)
    };
  } catch (error) {
    console.error('Error getting remaining quota:', error);
    return { used: 0, limit: 1000, remaining: 1000 };
  }
}

/**
 * Check if operation would exceed quota
 */
export async function checkQuotaBeforeOperation(
  estimatedUnits: number
): Promise<boolean> {
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