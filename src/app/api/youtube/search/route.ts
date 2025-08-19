import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { YouTubeAPIClient } from '@/lib/youtube/api-client';
import { getDecryptedApiKey } from '@/lib/api-keys';
import type { YouTubeSearchFilters } from '@/types/youtube';

/**
 * YouTube 영상 검색 API
 * POST /api/youtube/search
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

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
      channelId: body.channelId,
      relevanceLanguage: body.relevanceLanguage || 'ko',
      regionCode: body.regionCode || 'KR',
      safeSearch: body.safeSearch || 'moderate',
      pageToken: body.pageToken,
    };

    // 검색어 검증
    if (!filters.query || filters.query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // 사용자의 YouTube API Key 가져오기
    const apiKey = await getDecryptedApiKey(user.id, 'youtube');

    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'YouTube API Key가 필요합니다. 설정 페이지에서 API Key를 등록해주세요.',
          errorCode: 'api_key_required',
          actionRequired: 'setup_api_key'
        },
        { status: 401 }
      );
    }

    // 할당량 체크
    const today = new Date().toISOString().split('T')[0];
    const { data: usage, error: usageError } = await supabase
      .from('api_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    const currentUsage = usage?.units_used || 0;
    const quotaCost = YouTubeAPIClient.calculateQuotaCost('search', 1);
    
    // 할당량 초과 체크
    if (currentUsage + quotaCost > 10000) {
      return NextResponse.json(
        { 
          error: 'API quota exceeded. Please try again tomorrow.',
          quota: {
            used: currentUsage,
            limit: 10000,
            required: quotaCost
          }
        },
        { status: 429 }
      );
    }

    // YouTube API 클라이언트 생성 (API Key 사용)
    const apiClient = new YouTubeAPIClient({
      apiKey: apiKey,
      onQuotaUpdate: async (units) => {
        // 할당량 업데이트는 검색 완료 후 처리
      }
    });

    // YouTube 검색 실행
    const searchResult = await apiClient.search(filters);

    // 할당량 업데이트
    if (usage) {
      await supabase
        .from('api_usage')
        .update({
          units_used: currentUsage + quotaCost,
          search_count: (usage.search_count || 0) + 1,
          video_count: (usage.video_count || 0) + searchResult.items.length,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('date', today);
    } else {
      // 새 레코드 생성
      await supabase
        .from('api_usage')
        .insert({
          user_id: user.id,
          date: today,
          units_used: quotaCost,
          search_count: 1,
          video_count: searchResult.items.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }

    // 검색 기록 저장
    await supabase
      .from('youtube_search_history')
      .insert({
        user_id: user.id,
        query: filters.query,
        filters: filters,
        result_count: searchResult.items.length,
        created_at: new Date().toISOString(),
      });

    // 응답 반환
    return NextResponse.json({
      success: true,
      data: searchResult,
      quota: {
        used: currentUsage + quotaCost,
        limit: 10000,
        remaining: 10000 - (currentUsage + quotaCost),
        cost: quotaCost
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    
    // YouTube API 에러 처리
    if (error instanceof Error) {
      // API 할당량 초과
      if (error.message.includes('quotaExceeded')) {
        return NextResponse.json(
          { 
            error: 'YouTube API 일일 할당량을 초과했습니다. 내일 다시 시도해주세요.',
            errorCode: 'quota_exceeded',
            resetTime: new Date().setHours(24, 0, 0, 0) // 다음날 자정
          },
          { status: 429 }
        );
      }
      
      // 권한 오류
      if (error.message.includes('forbidden') || error.message.includes('403')) {
        return NextResponse.json(
          { 
            error: 'YouTube API 접근 권한이 없습니다. API Key를 확인해주세요.',
            errorCode: 'access_forbidden',
            actionRequired: 'check_api_key'
          },
          { status: 403 }
        );
      }
      
      // 잘못된 요청
      if (error.message.includes('invalid') || error.message.includes('400')) {
        return NextResponse.json(
          { 
            error: '잘못된 검색 요청입니다. 검색어를 확인해주세요.',
            errorCode: 'invalid_request'
          },
          { status: 400 }
        );
      }
      
      // API Key 인증 오류
      if (error.message.includes('401') || error.message.includes('API key not valid')) {
        return NextResponse.json(
          { 
            error: 'API Key가 유효하지 않습니다. 설정 페이지에서 다시 등록해주세요.',
            errorCode: 'invalid_api_key',
            actionRequired: 'update_api_key'
          },
          { status: 401 }
        );
      }
      
      // 암호화 오류
      if (error.message.includes('decrypt')) {
        return NextResponse.json(
          { 
            error: '저장된 API Key를 읽을 수 없습니다. 다시 등록해주세요.',
            errorCode: 'decryption_failed',
            actionRequired: 'update_api_key'
          },
          { status: 500 }
        );
      }
      
      // 네트워크 오류
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return NextResponse.json(
          { 
            error: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            errorCode: 'network_error'
          },
          { status: 503 }
        );
      }
    }
    
    // 기본 에러 메시지
    return NextResponse.json(
      { 
        error: 'YouTube 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        errorCode: 'search_failed'
      },
      { status: 500 }
    );
  }
}