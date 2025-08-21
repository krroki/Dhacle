import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  createValidationErrorResponse,
  trendingSummaryQuerySchema,
  validateQueryParams,
} from '@/lib/security/validation-schemas';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  // 쿼리 파라미터 검증
  const url = new URL(request.url);
  const params = url.searchParams;
  const validation = validateQueryParams(params, trendingSummaryQuerySchema);

  if (!validation.success) {
    return createValidationErrorResponse(validation.error);
  }

  const { date, limit = 10 } = validation.data;
  const today = date || new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  try {
    // 1. 카테고리별 통계
    const { data: channels } = await supabase
      .from('yl_channels')
      .select('category, subcategory')
      .eq('approval_status', 'approved');

    const categoryStats =
      channels?.reduce(
        (
          acc: Array<{ category: string; channelCount: number; totalDelta: number; share: number }>,
          ch
        ) => {
          const cat = ch.category || '기타';
          const existing = acc.find((s) => s.category === cat);
          if (existing) {
            existing.channelCount += 1;
          } else {
            acc.push({ category: cat, channelCount: 1, totalDelta: 0, share: 0 });
          }
          return acc;
        },
        []
      ) || [];

    // 점유율 계산
    const totalChannels = categoryStats.reduce((sum, s) => sum + s.channelCount, 0);
    categoryStats.forEach((stat) => {
      stat.share = totalChannels > 0 ? (stat.channelCount / totalChannels) * 100 : 0;
    });

    // 2. Top 델타 채널 (7필드 포함)
    const { data: topDeltas } = await supabase
      .from('yl_channel_daily_delta')
      .select(`
        channel_id,
        date,
        delta_views,
        delta_subscribers,
        growth_rate,
        channel:yl_channels!inner(
          channel_id,
          title,
          subscriber_count,
          view_count_total,
          category,
          subcategory,
          dominant_format
        )
      `)
      .eq('date', today)
      .order('delta_views', { ascending: false })
      .limit(limit);

    // 3. 신흥 채널 (최근 7일 내 승인)
    const { data: newcomers } = await supabase
      .from('yl_channels')
      .select(
        'channel_id, title, subscriber_count, view_count_total, category, subcategory, dominant_format'
      )
      .eq('approval_status', 'approved')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(5);

    // 4. 트렌딩 키워드 (Phase 2 예정)
    const trendingKeywords: Array<{ keyword: string; count: number }> = [];

    // 5. Top 쇼츠 (Phase 2 예정)
    const topShorts: Array<{ videoId: string; title: string; views: number }> = [];

    // 6. 팔로우 채널 (Phase 2 예정)
    const followedChannels: Array<{ channelId: string; title: string }> = [];

    return NextResponse.json({
      success: true,
      data: {
        categoryStats: categoryStats.sort((a, b) => b.channelCount - a.channelCount),
        topDeltas: topDeltas || [],
        newcomers: newcomers || [],
        trendingKeywords,
        topShorts,
        followedChannels,
      },
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}
