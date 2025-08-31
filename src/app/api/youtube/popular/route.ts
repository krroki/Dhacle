/**
 * API Route: /api/youtube/popular
 * Purpose: Get popular YouTube Shorts without keyword
 * Phase 3: Core Features Implementation
 */

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { mapVideoStats } from '@/lib/utils/type-mappers';
import { getPopularShortsWithoutKeyword } from '@/lib/youtube/popular-shorts';
import { env } from '@/env';

export const runtime = 'nodejs';

/**
 * GET /api/youtube/popular
 * Fetch popular YouTube Shorts
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('YouTube Popular API 무단 접근 시도');
      return NextResponse.json(
        { error: '사용자 인증이 필요합니다' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // Parse query parameters
    const search_params = request.nextUrl.searchParams;
    const region_code = search_params.get('region') || 'KR';
    const period = search_params.get('period') || '7d';
    const limit = Number.parseInt(search_params.get('limit') || '50', 10);

    // Validate parameters
    if (!['KR', 'US', 'JP', 'GB', 'FR', 'DE'].includes(region_code)) {
      return NextResponse.json({ error: '잘못된 지역 코드입니다' }, { status: 400 });
    }

    if (!['1d', '7d', '30d'].includes(period)) {
      return NextResponse.json({ error: '잘못된 기간입니다. 1d, 7d, 30d 중 선택하세요' }, { status: 400 });
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json({ error: '결과 수는 1에서 100 사이여야 합니다' }, { status: 400 });
    }

    // Check if user has API key
    const { data: api_key_data } = await supabase
      .from('user_api_keys')
      .select('id')
      .eq('user_id', user.id)
      .eq('service_name', 'youtube')
      .eq('is_active', true)
      .single();

    if (!api_key_data) {
      // Check if environment variable exists as fallback
      const has_env_key = Boolean(env.YOUTUBE_API_KEY);

      console.log('[Popular Shorts API] API key check:', {
        userId: user.id,
        hasUserKey: false,
        hasEnvKey: has_env_key,
      });

      if (!has_env_key) {
        // Return 400 for missing API key, not 401
        // 401 should only be for authentication issues
        return NextResponse.json(
          {
            error: 'YouTube API 키가 설정되지 않았습니다',
            message: '이 기능을 사용하려면 설정에서 YouTube API 키를 구성해주세요',
            requiresApiKey: true,
            error_code: 'api_key_required',
            debug: {
              hasUserKey: false,
              hasEnvKey: has_env_key,
            },
          },
          { status: 400 }
        );
      }
      // If env key exists, continue with the request
      console.log('[Popular Shorts API] 환경변수 API 키를 대체 수단으로 사용');
    }

    // Fetch popular shorts (already includes metrics)
    const videos_with_metrics = await getPopularShortsWithoutKeyword({
      regionCode: region_code,
      period: period as '1h' | '6h' | '24h' | '7d' | '30d' | '1d',
      maxResults: limit,
      user_id: user.id,
    });

    // Sort by viral score (using mapVideoStats to handle snake_case)
    videos_with_metrics.sort((a, b) => {
      const stats_a = a.stats ? mapVideoStats(a.stats) : null;
      const stats_b = b.stats ? mapVideoStats(b.stats) : null;
      const score_a = stats_a?.viral_score || 0;
      const score_b = stats_b?.viral_score || 0;
      return score_b - score_a;
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
        videos: videos_with_metrics.slice(0, limit),
        metadata: {
          region: region_code,
          period,
          totalFound: videos_with_metrics.length,
          returned: Math.min(videos_with_metrics.length, limit),
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error: unknown) {
    // Check if it's a quota error
    if (error instanceof Error && error.message.includes('quota')) {
      return NextResponse.json(
        {
          error: 'YouTube API 할당량 초과',
          message: '나중에 다시 시도하거나 자체 API 키를 사용해주세요',
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
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('YouTube Popular API 무단 접근 시도');
      return NextResponse.json(
        { error: '사용자 인증이 필요합니다' },
        { status: 401 }
      );
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
    const filter_options = {
      minViews: filters.minViews || 0,
      maxViews: filters.maxViews || Number.POSITIVE_INFINITY,
      minEngagement: filters.minEngagement || 0,
      minVph: filters.minVph || 0,
      excludeChannels: filters.excludeChannels || [],
      includeOnlyVerified: filters.includeOnlyVerified || false,
    };

    // Fetch videos (already includes metrics)
    let videos_with_metrics = await getPopularShortsWithoutKeyword({
      regionCode,
      period: period as '1h' | '6h' | '24h' | '7d' | '30d' | '1d',
      maxResults: maxResults * 2, // Fetch more to apply filters
      user_id: user.id,
    });

    // Apply filters (using mapVideoStats to handle snake_case)
    videos_with_metrics = videos_with_metrics.filter((video) => {
      const stats = video.stats ? mapVideoStats(video.stats) : null;
      const views = stats?.view_count || 0;
      const engagement = stats?.engagement_rate || 0;
      const vph = stats?.views_per_hour || 0;

      if (views < filter_options.minViews || views > filter_options.maxViews) {
        return false;
      }

      if (engagement < filter_options.minEngagement) {
        return false;
      }

      if (vph < filter_options.minVph) {
        return false;
      }

      if (filter_options.excludeChannels.includes(video.channel_id)) {
        return false;
      }

      return true;
    });

    // Sort by viral score (using mapVideoStats to handle snake_case)
    videos_with_metrics.sort((a, b) => {
      const stats_a = a.stats ? mapVideoStats(a.stats) : null;
      const stats_b = b.stats ? mapVideoStats(b.stats) : null;
      const score_a = stats_a?.viral_score || 0;
      const score_b = stats_b?.viral_score || 0;
      return score_b - score_a;
    });

    // Limit results
    const final_videos = videos_with_metrics.slice(0, maxResults);

    // Save to collections if requested
    if (body.saveToCollection) {
      await save_to_collection(user.id, body.collection_id, final_videos);
    }

    return NextResponse.json({
      success: true,
      data: {
        videos: final_videos,
        metadata: {
          region: regionCode,
          period,
          filters: filter_options,
          totalBeforeFilter: maxResults * 2,
          totalAfterFilter: videos_with_metrics.length,
          returned: final_videos.length,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: '고급 검색 실행 실패',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Save videos to collection
 */
async function save_to_collection(
  userId: string,
  collection_id: string,
  videos: Array<{ id: string }>
): Promise<void> {
  const supabase = await createSupabaseRouteHandlerClient();

  const collection_items = videos.map((video, index) => {
    if (!video || typeof video !== 'object' || !('id' in video)) {
      throw new Error('Invalid video data');
    }
    const video_data = video as { id: string };
    return {
      collection_id: collection_id,
      video_id: video_data.id,
      added_by: userId,
      position: index,
      notes: null,
    };
  });

  await supabase.from('collection_items').insert(collection_items);
}
