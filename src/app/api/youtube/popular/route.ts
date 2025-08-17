/**
 * API Route: /api/youtube/popular
 * Purpose: Get popular YouTube Shorts without keyword
 * Phase 3: Core Features Implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPopularShortsWithoutKeyword } from '@/lib/youtube/popular-shorts';
import { calculateMetrics } from '@/lib/youtube/metrics';
import { createServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/**
 * GET /api/youtube/popular
 * Fetch popular YouTube Shorts
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const regionCode = searchParams.get('region') || 'KR';
    const period = searchParams.get('period') || '7d';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const strategy = searchParams.get('strategy') || 'all';

    // Validate parameters
    if (!['KR', 'US', 'JP', 'GB', 'FR', 'DE'].includes(regionCode)) {
      return NextResponse.json(
        { error: 'Invalid region code' },
        { status: 400 }
      );
    }

    if (!['1d', '7d', '30d'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Use 1d, 7d, or 30d' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Check if user has API key
    const { data: apiKeyData } = await supabase
      .from('user_api_keys')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('service_name', 'youtube')
      .eq('is_active', true)
      .single();

    if (!apiKeyData) {
      return NextResponse.json(
        { 
          error: 'YouTube API key not configured',
          message: 'Please configure your YouTube API key in settings to use this feature',
          requiresApiKey: true
        },
        { status: 400 }
      );
    }

    // Fetch popular shorts (already includes metrics)
    const videosWithMetrics = await getPopularShortsWithoutKeyword({
      regionCode,
      period: period as '1h' | '6h' | '24h' | '7d' | '30d' | '1d',
      maxResults: limit,
      userId: session.user.id
    });

    // Sort by viral score
    videosWithMetrics.sort((a, b) => {
      const scoreA = a.stats?.viral_score || 0;
      const scoreB = b.stats?.viral_score || 0;
      return scoreB - scoreA;
    });

    // Save search history (optional) - commented out for now
    // TODO: Implement saveSearchHistory function if needed
    // await saveSearchHistory(session.user.id, {
    //   search_type: 'popular_shorts',
    //   region_code: regionCode,
    //   period,
    //   result_count: videosWithMetrics.length
    // });

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        videos: videosWithMetrics.slice(0, limit),
        metadata: {
          region: regionCode,
          period,
          totalFound: videosWithMetrics.length,
          returned: Math.min(videosWithMetrics.length, limit),
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('[/api/youtube/popular] Error details:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Check if it's a quota error
    if (error instanceof Error && error.message.includes('quota')) {
      return NextResponse.json(
        { 
          error: 'YouTube API quota exceeded',
          message: 'Please try again later or use your own API key'
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch popular shorts',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/youtube/popular
 * Advanced search with custom parameters
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      regionCode = 'KR',
      period = '7d',
      maxResults = 50,
      strategies = ['all'],
      filters = {}
    } = body;

    // Apply custom filters
    const filterOptions = {
      minViews: filters.minViews || 0,
      maxViews: filters.maxViews || Infinity,
      minEngagement: filters.minEngagement || 0,
      minVph: filters.minVph || 0,
      excludeChannels: filters.excludeChannels || [],
      includeOnlyVerified: filters.includeOnlyVerified || false
    };

    // Fetch videos (already includes metrics)
    let videosWithMetrics = await getPopularShortsWithoutKeyword({
      regionCode,
      period: period as '1h' | '6h' | '24h' | '7d' | '30d' | '1d',
      maxResults: maxResults * 2, // Fetch more to apply filters
      userId: session.user.id
    });

    // Apply filters
    videosWithMetrics = videosWithMetrics.filter(video => {
      const views = video.stats?.view_count || 0;
      const engagement = video.stats?.engagement_rate || 0;
      const vph = video.stats?.views_per_hour || 0;

      if (views < filterOptions.minViews || views > filterOptions.maxViews) {
        return false;
      }

      if (engagement < filterOptions.minEngagement) {
        return false;
      }

      if (vph < filterOptions.minVph) {
        return false;
      }

      if (filterOptions.excludeChannels.includes(video.channel_id)) {
        return false;
      }

      return true;
    });

    // Sort by viral score
    videosWithMetrics.sort((a, b) => {
      const scoreA = a.stats?.viral_score || 0;
      const scoreB = b.stats?.viral_score || 0;
      return scoreB - scoreA;
    });

    // Limit results
    const finalVideos = videosWithMetrics.slice(0, maxResults);

    // Save to collections if requested
    if (body.saveToCollection) {
      await saveToCollection(session.user.id, body.collectionId, finalVideos);
    }

    return NextResponse.json({
      success: true,
      data: {
        videos: finalVideos,
        metadata: {
          region: regionCode,
          period,
          filters: filterOptions,
          totalBeforeFilter: maxResults * 2,
          totalAfterFilter: videosWithMetrics.length,
          returned: finalVideos.length,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error in advanced search:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to perform advanced search',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Save search history
 */
async function saveSearchHistory(userId: string, searchData: Record<string, unknown>) {
  try {
    const supabase = await createServerClient();
    
    await supabase.from('saved_searches').insert({
      user_id: userId,
      search_name: `Popular Shorts - ${searchData.region_code}`,
      search_params: searchData,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to save search history:', error);
    // Non-critical error, don't throw
  }
}

/**
 * Helper: Save videos to collection
 */
async function saveToCollection(userId: string, collectionId: string, videos: unknown[]) {
  try {
    const supabase = await createServerClient();
    
    const collectionItems = videos.map(video => {
      const videoData = video as { id: string };
      return {
        collection_id: collectionId,
        video_id: videoData.id,
        added_at: new Date().toISOString(),
        item_data: video
      };
    });

    await supabase.from('collection_items').insert(collectionItems);
  } catch (error) {
    console.error('Failed to save to collection:', error);
    throw error;
  }
}