// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import {
  createValidationErrorResponse,
  trendingSummaryQuerySchema,
  validateQueryParams,
} from '@/lib/security/validation-schemas';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { createSuccessResponse, createInternalServerErrorResponse } from '@/lib/api-error-utils';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Step 1: Authentication check (required!)
  const user = await requireAuth(request);
  if (!user) {
    logger.warn('Unauthorized access attempt to YouTube Lens Trending Summary API');
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }


  // 쿼리 파라미터 검증
  const url = new URL(request.url);
  const params = url.searchParams;
  const validation = validateQueryParams(params, trendingSummaryQuerySchema);

  if (!validation.success) {
    return createValidationErrorResponse(validation.error);
  }

  const { limit = 10 } = validation.data;
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // 1. 카테고리별 통계
    const { data: channels } = await supabase
      .from('yl_channels')
      .select('id, title');

    const categoryStats = channels?.map(() => ({
      category: '기타',
      channelCount: 1,
      totalDelta: 0,
      share: 0
    })) || [];

    // 점유율 계산
    const totalChannels = categoryStats.reduce((sum, s) => sum + s.channelCount, 0);
    categoryStats.forEach((stat) => {
      stat.share = totalChannels > 0 ? (stat.channelCount / totalChannels) * 100 : 0;
    });

    // 2. Top 델타 채널 (간소화된 구현)
    const { data: topDeltas } = await supabase
      .from('yl_channel_daily_delta')
      .select(`
        channel_id,
        date,
        subscriber_delta,
        view_delta,
        video_delta
      `)
      .order('view_delta', { ascending: false })
      .limit(limit);

    // 3. 신흥 채널 (최근 7일 내 생성)
    const { data: newcomers } = await supabase
      .from('yl_channels')
      .select(
        'id, title, subscriber_count, view_count'
      )
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(5);

    // 4. 트렌딩 키워드 (Phase 2 예정)
    const trendingKeywords: Array<{ keyword: string; count: number }> = [];

    // 5. Top 쇼츠 (Phase 2 예정)
    const topShorts: Array<{ videoId: string; title: string; views: number }> = [];

    // 6. 팔로우 채널 (Phase 2 예정)
    const followedChannels: Array<{ channelId: string; title: string }> = [];

    return createSuccessResponse({
      categoryStats: categoryStats.sort((a, b) => b.channelCount - a.channelCount),
      topDeltas: topDeltas || [],
      newcomers: newcomers || [],
      trendingKeywords: trendingKeywords,
      topShorts: topShorts,
      followedChannels: followedChannels,
    }, 'Trending summary retrieved successfully');
  } catch (error) {
    logger.error('Dashboard summary error:', error);
    return createInternalServerErrorResponse(
      'Failed to fetch trending summary',
      'TRENDING_SUMMARY_FETCH_FAILED'
    );
  }
}
