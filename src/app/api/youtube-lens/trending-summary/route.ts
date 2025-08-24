// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';
import {
  createValidationErrorResponse,
  trendingSummaryQuerySchema,
  validateQueryParams,
} from '@/lib/security/validation-schemas';

export async function GET(request: Request): Promise<NextResponse> {
  const supabase = await createSupabaseRouteHandlerClient();

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

  // 미사용 변수 - yl_channels와 yl_channel_daily_delta 테이블 생성 후 사용 예정
  // const { date, limit = 10 } = validation.data;
  // const today = date || new Date().toISOString().split('T')[0];
  // const seven_days_ago = new Date(Date.now() - 7 * 86400000).toISOString();

  try {
    // TODO: yl_channels와 yl_channel_daily_delta 테이블이 존재하지 않음
    // 임시로 빈 데이터 반환
    return NextResponse.json({
      categoryStats: [],
      topDeltas: [],
      summary: {
        totalChannels: 0,
        totalDelta: 0,
        avgDelta: 0,
        topCategories: [],
      },
    });
    
    /* 원본 코드 - yl_channels와 yl_channel_daily_delta 테이블 생성 후 활성화
    // 1. 카테고리별 통계
    const { data: channels } = await supabase
      .from('yl_channels')
      .select('category, subcategory')
      .eq('approval_status', 'approved');

    const category_stats =
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
    const total_channels = category_stats.reduce((sum, s) => sum + s.channelCount, 0);
    category_stats.forEach((stat) => {
      stat.share = total_channels > 0 ? (stat.channelCount / total_channels) * 100 : 0;
    });

    // 2. Top 델타 채널 (7필드 포함)
    const { data: top_deltas } = await supabase
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
      .gte('created_at', seven_days_ago)
      .order('created_at', { ascending: false })
      .limit(5);

    // 4. 트렌딩 키워드 (Phase 2 예정)
    const trending_keywords: Array<{ keyword: string; count: number }> = [];

    // 5. Top 쇼츠 (Phase 2 예정)
    const top_shorts: Array<{ video_id: string; title: string; views: number }> = [];

    // 6. 팔로우 채널 (Phase 2 예정)
    const followed_channels: Array<{ channel_id: string; title: string }> = [];

    return NextResponse.json({
      success: true,
      data: {
        categoryStats: category_stats.sort((a, b) => b.channelCount - a.channelCount),
        topDeltas: top_deltas || [],
        newcomers: newcomers || [],
        trendingKeywords: trending_keywords,
        topShorts: top_shorts,
        followedChannels: followed_channels,
      },
    });
    */
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}
