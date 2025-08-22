/**
 * API Route: /api/youtube/popular
 * Purpose: Get popular YouTube Shorts without keyword
 * Phase 3: Core Features Implementation
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { mapVideoStats } from '@/lib/utils/type-mappers';
import { getPopularShortsWithoutKeyword } from '@/lib/youtube/popular-shorts';

export const runtime = 'nodejs';

/**
 * GET /api/youtube/popular
 * Fetch popular YouTube Shorts
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication - using getUser() for consistency
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const regionCode = searchParams.get('region') || 'KR';
    const period = searchParams.get('period') || '7d';
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);

    // Validate parameters
    if (!['KR', 'US', 'JP', 'GB', 'FR', 'DE'].includes(regionCode)) {
      return NextResponse.json({ error: 'Invalid region code' }, { status: 400 });
    }

    if (!['1d', '7d', '30d'].includes(period)) {
      return NextResponse.json({ error: 'Invalid period. Use 1d, 7d, or 30d' }, { status: 400 });
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Limit must be between 1 and 100' }, { status: 400 });
    }

    // Check if user has API key
    const { data: apiKeyData } = await supabase
      .from('user_api_keys')
      .select('id')
      .eq('user_id', user.id)
      .eq('service_name', 'youtube')
      .eq('is_active', true)
      .single();

    if (!apiKeyData) {
      // Return 400 for missing API key, not 401
      // 401 should only be for authentication issues
      return NextResponse.json(
        {
          error: 'YouTube API key not configured',
          message: 'Please configure your YouTube API key in settings to use this feature',
          requiresApiKey: true,
          error_code: 'api_key_required',
        },
        { status: 400 }
      );
    }

    // Fetch popular shorts (already includes metrics)
    const videosWithMetrics = await getPopularShortsWithoutKeyword({
      regionCode,
      period: period as '1h' | '6h' | '24h' | '7d' | '30d' | '1d',
      maxResults: limit,
      user_id: user.id,
    });

    // Sort by viral score (using mapVideoStats to handle snake_case)
    videosWithMetrics.sort((a, b) => {
      const statsA = a.stats ? mapVideoStats(a.stats) : null;
      const statsB = b.stats ? mapVideoStats(b.stats) : null;
      const scoreA = statsA?.viralScore || 0;
      const scoreB = statsB?.viralScore || 0;
      return scoreB - scoreA;
    });

    // Save search history (optional) - commented out for now
    // TODO: Implement saveSearchHistory function if needed
    // await saveSearchHistory(user.id, {
    //   searchType: 'popularShorts',
    //   regionCode: regionCode,
    //   period,
    //   resultCount: videosWithMetrics.length
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
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    // Check if it's a quota error
    if (error instanceof Error && error.message.includes('quota')) {
      return NextResponse.json(
        {
          error: 'YouTube API quota exceeded',
          message: 'Please try again later or use your own API key',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch popular shorts',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
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
    // Check authentication - using getUser() for consistency
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      regionCode = 'KR',
      period = '7d',
      maxResults = 50,
      strategies: _strategies = ['all'],
      filters = {},
    } = body;

    // Apply custom filters
    const filterOptions = {
      minViews: filters.minViews || 0,
      maxViews: filters.maxViews || Number.POSITIVE_INFINITY,
      minEngagement: filters.minEngagement || 0,
      minVph: filters.minVph || 0,
      excludeChannels: filters.excludeChannels || [],
      includeOnlyVerified: filters.includeOnlyVerified || false,
    };

    // Fetch videos (already includes metrics)
    let videosWithMetrics = await getPopularShortsWithoutKeyword({
      regionCode,
      period: period as '1h' | '6h' | '24h' | '7d' | '30d' | '1d',
      maxResults: maxResults * 2, // Fetch more to apply filters
      user_id: user.id,
    });

    // Apply filters (using mapVideoStats to handle snake_case)
    videosWithMetrics = videosWithMetrics.filter((video) => {
      const stats = video.stats ? mapVideoStats(video.stats) : null;
      const views = stats?.view_count || 0;
      const engagement = stats?.engagementRate || 0;
      const vph = stats?.viewsPerHour || 0;

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

    // Sort by viral score (using mapVideoStats to handle snake_case)
    videosWithMetrics.sort((a, b) => {
      const statsA = a.stats ? mapVideoStats(a.stats) : null;
      const statsB = b.stats ? mapVideoStats(b.stats) : null;
      const scoreA = statsA?.viralScore || 0;
      const scoreB = statsB?.viralScore || 0;
      return scoreB - scoreA;
    });

    // Limit results
    const finalVideos = videosWithMetrics.slice(0, maxResults);

    // Save to collections if requested
    if (body.saveToCollection) {
      await saveToCollection(user.id, body.collection_id, finalVideos);
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
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to perform advanced search',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


/**
 * Helper: Save videos to collection
 */
async function saveToCollection(_userId: string, collection_id: string, videos: unknown[]) {
  const supabase = createRouteHandlerClient({ cookies });

  const collectionItems = videos.map((video) => {
    const videoData = video as { id: string };
    return {
      collection_id: collection_id,
      video_id: videoData.id,
      addedAt: new Date().toISOString(),
      itemData: video,
    };
  });

  await supabase.from('collectionItems').insert(collectionItems);
}
