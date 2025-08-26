// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { getDecryptedApiKey } from '@/lib/api-keys';
import { YouTubeAPIClient } from '@/lib/youtube/api-client';
import type { YouTubeSearchFilters, Database, Json } from '@/types';

/**
 * YouTube 영상 검색 API
 * POST /api/youtube/search
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to YouTube search API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // 요청 바디 파싱
    const body = await request.json();
    const filters: YouTubeSearchFilters = {
      query: body.query || '',
      order: body.order || 'relevance',
      maxResults: Math.min(body.maxResults || 50, 50), // 최대 50개
      videoDuration: body.videoDuration || 'short',
      videoDefinition: body.videoDefinition,
      videoEmbeddable: body.videoEmbeddable,
      publishedAfter: body.publishedAfter,
      publishedBefore: body.publishedBefore,
      channel_id: body.channel_id,
      relevanceLanguage: body.relevanceLanguage || 'ko',
      regionCode: body.regionCode || 'KR',
      safeSearch: body.safeSearch || 'moderate',
      pageToken: body.pageToken,
    };

    // 검색어 검증
    if (!filters.query || filters.query.trim().length === 0) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // 사용자의 YouTube API Key 가져오기
    const api_key = await getDecryptedApiKey(user.id, 'youtube');

    if (!api_key) {
      return NextResponse.json(
        {
          error: 'YouTube API Key가 필요합니다. 설정 페이지에서 API Key를 등록해주세요.',
          error_code: 'apiKeyRequired',
          actionRequired: 'setupApiKey',
        },
        { status: 401 }
      );
    }

    // 할당량 체크
    const { data: api_key_data, error: _usageError } = await supabase
      .from('user_api_keys')
      .select('usage_today, usage_count')
      .eq('user_id', user.id)
      .eq('service_name', 'youtube')
      .single();

    const current_usage = api_key_data?.usage_today || 0;
    const quota_cost = YouTubeAPIClient.calculateQuotaCost('search', 1);

    // 할당량 초과 체크
    if (current_usage + quota_cost > 10000) {
      return NextResponse.json(
        {
          error: 'API quota exceeded. Please try again tomorrow.',
          quota: {
            used: current_usage,
            limit: 10000,
            required: quota_cost,
          },
        },
        { status: 429 }
      );
    }

    // YouTube API 클라이언트 생성 (API Key 사용)
    const api_client = new YouTubeAPIClient({
      api_key: api_key,
      onQuotaUpdate: async (_units) => {
        // 할당량 업데이트는 검색 완료 후 처리
      },
    });

    // YouTube 검색 실행
    const search_result = await api_client.search(filters);

    // 할당량 업데이트
    await supabase
      .from('user_api_keys')
      .update({
        usage_today: current_usage + quota_cost,
        usage_count: api_key_data?.usage_count ? api_key_data.usage_count + 1 : 1,
        usage_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('service_name', 'youtube');

    // 검색 기록 저장
    type SearchHistoryInsert = Database['public']['Tables']['youtube_search_history']['Insert'];
    const searchHistory: SearchHistoryInsert = {
      user_id: user.id,
      query: filters.query,
      filters: filters as unknown as Json,
      result_count: search_result.items.length,
      created_at: new Date().toISOString(),
    };
    await supabase.from('youtube_search_history').insert(searchHistory);

    // 응답 반환
    return NextResponse.json({
      success: true,
      data: search_result,
      quota: {
        used: current_usage + quota_cost,
        limit: 10000,
        remaining: 10000 - (current_usage + quota_cost),
        cost: quota_cost,
      },
    });
  } catch (error: unknown) {
    // YouTube API 에러 처리
    if (error instanceof Error) {
      // API 할당량 초과
      if (error.message.includes('quotaExceeded')) {
        return NextResponse.json(
          {
            error: 'YouTube API 일일 할당량을 초과했습니다. 내일 다시 시도해주세요.',
            error_code: 'quotaExceeded',
            resetTime: new Date().setHours(24, 0, 0, 0), // 다음날 자정
          },
          { status: 429 }
        );
      }

      // 권한 오류
      if (error.message.includes('forbidden') || error.message.includes('403')) {
        return NextResponse.json(
          {
            error: 'YouTube API 접근 권한이 없습니다. API Key를 확인해주세요.',
            error_code: 'accessForbidden',
            actionRequired: 'checkApiKey',
          },
          { status: 403 }
        );
      }

      // 잘못된 요청
      if (error.message.includes('invalid') || error.message.includes('400')) {
        return NextResponse.json(
          {
            error: '잘못된 검색 요청입니다. 검색어를 확인해주세요.',
            error_code: 'invalidRequest',
          },
          { status: 400 }
        );
      }

      // API Key 인증 오류
      if (error.message.includes('401') || error.message.includes('API key not valid')) {
        return NextResponse.json(
          {
            error: 'API Key가 유효하지 않습니다. 설정 페이지에서 다시 등록해주세요.',
            error_code: 'invalidApiKey',
            actionRequired: 'updateApiKey',
          },
          { status: 401 }
        );
      }

      // 암호화 오류
      if (error.message.includes('decrypt')) {
        return NextResponse.json(
          {
            error: '저장된 API Key를 읽을 수 없습니다. 다시 등록해주세요.',
            error_code: 'decryptionFailed',
            actionRequired: 'updateApiKey',
          },
          { status: 500 }
        );
      }

      // 네트워크 오류
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return NextResponse.json(
          {
            error: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            error_code: 'networkError',
          },
          { status: 503 }
        );
      }
    }

    // 기본 에러 메시지
    return NextResponse.json(
      {
        error: 'YouTube 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        error_code: 'searchFailed',
      },
      { status: 500 }
    );
  }
}
