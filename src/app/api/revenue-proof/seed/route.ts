// 수익 인증 시드 데이터 추가 API

// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

// 시드 데이터
const sample_data = [
  {
    title: '2025년 5월 YouTube Shorts 수익 인증',
    content:
      '<p>안녕하세요! 5월 YouTube Shorts 수익을 인증합니다.</p><p>이번 달은 특히 바이럴된 영상이 많아서 수익이 크게 늘었습니다.</p>',
    amount: 2850000,
    platform: 'youtube',
    screenshot_url: '/images/revenue-proof/20250514_155618.png',
  },
  {
    title: '2025년 7월 인스타그램 릴스 광고 수익',
    content: '<p>인스타그램 릴스로 처음 100만원을 돌파했습니다! 🎉</p>',
    amount: 1250000,
    platform: 'instagram',
    screenshot_url: '/images/revenue-proof/20250713_195132.png',
  },
  {
    title: 'TikTok 크리에이터 펀드 첫 정산',
    content: '<p>드디어 TikTok에서도 수익이 발생했습니다!</p>',
    amount: 780000,
    platform: 'tiktok',
    screenshot_url: '/images/revenue-proof/IMG_2157.png',
  },
  {
    title: '6월 YouTube 최고 수익 달성!',
    content: '<p>믿기지 않지만 6월에 역대 최고 수익을 달성했습니다! 😱</p>',
    amount: 4200000,
    platform: 'youtube',
    screenshot_url: '/images/revenue-proof/KakaoTalk_20250618_054750921_01.png',
  },
  {
    title: '인스타그램 + YouTube 동시 운영 수익',
    content: '<p>멀티 플랫폼 전략이 성공했습니다!</p>',
    amount: 1850000,
    platform: 'youtube',
    screenshot_url: '/images/revenue-proof/image (2).png',
  },
  {
    title: '8월 TikTok 라이브 수익 공개',
    content: '<p>TikTok 라이브 방송으로만 150만원 달성!</p>',
    amount: 1500000,
    platform: 'tiktok',
    screenshot_url: '/images/revenue-proof/스크린샷_2025-08-03_141501.png',
  },
];

// POST: 시드 데이터 추가
export async function POST(_request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(_request);
    if (!user) {
      logger.warn('Unauthorized access attempt to revenue-proof/seed POST');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // 시드 데이터 추가
    const results = [];
    for (const [index, data] of sample_data.entries()) {
      const { data: result, error } = await supabase
        .from('revenue_proofs')
        .insert({
          user_id: user.id,
          ...data,
          signature_data:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          screenshot_blur: '',
          is_hidden: false,
          likes_count: Math.floor(Math.random() * 100) + 10,
          comments_count: Math.floor(Math.random() * 30) + 5,
          reports_count: 0,
          created_at: new Date(Date.now() - index * 2 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) {
        results.push({
          success: false,
          title: data.title,
          error: error.message,
        });
      } else {
        results.push({
          success: true,
          title: data.title,
          id: result.id,
        });
      }
    }

    const success_count = results.filter((r) => r.success).length;

    return NextResponse.json({
      message: `${success_count}개의 시드 데이터가 추가되었습니다`,
      results,
      total: sample_data.length,
      success: success_count,
    });
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// GET: 시드 데이터 상태 확인
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(_request);
    if (!user) {
      logger.warn('Unauthorized access attempt to revenue-proof/seed GET');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // 데이터 개수 확인
    const { count, error } = await supabase
      .from('revenue_proofs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ error: '데이터 확인 중 오류가 발생했습니다' }, { status: 500 });
    }

    return NextResponse.json({
      totalRecords: count || 0,
      sampleDataAvailable: sample_data.length,
      message:
        count === 0
          ? '데이터가 없습니다. POST 요청으로 시드 데이터를 추가하세요.'
          : `현재 ${count}개의 수익 인증 데이터가 있습니다.`,
    });
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
