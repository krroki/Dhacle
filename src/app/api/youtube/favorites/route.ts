// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 즐겨찾기 목록 조회
 * GET /api/youtube/favorites
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();

    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 쿼리 파라미터 파싱
    const search_params = request.nextUrl.searchParams;
    const page = Number.parseInt(search_params.get('page') || '1', 10);
    const limit = Math.min(Number.parseInt(search_params.get('limit') || '50', 10), 100);
    const tags = search_params.get('tags')?.split(',').filter(Boolean);
    const sort_by = search_params.get('sortBy') || 'created_at';
    const sort_order = search_params.get('sortOrder') || 'desc';

    // 쿼리 빌드
    let query = supabase
      .from('youtube_favorites')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // 태그 필터
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    // 정렬
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // 페이지네이션
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // 실행
    const { data: favorites, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: favorites || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (_error: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * 즐겨찾기 추가
 * POST /api/youtube/favorites
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();

    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 요청 바디 파싱
    const body = await request.json();

    if (!body.video_id || !body.videoData) {
      return NextResponse.json({ error: 'video_id and videoData are required' }, { status: 400 });
    }

    // 중복 체크
    const { data: existing } = await supabase
      .from('youtube_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('video_id', body.video_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Video already in favorites' }, { status: 409 });
    }

    // 즐겨찾기 추가
    const { data: favorite, error: insert_error } = await supabase
      .from('youtube_favorites')
      .insert({
        user_id: user.id,
        video_id: body.video_id,
        videoData: body.videoData,
        tags: body.tags || [],
        notes: body.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insert_error) {
      return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        data: favorite,
      },
      { status: 201 }
    );
  } catch (_error: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * 즐겨찾기 일괄 추가
 * PUT /api/youtube/favorites/batch
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();

    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 요청 바디 파싱
    const body = await request.json();

    if (!Array.isArray(body.videos) || body.videos.length === 0) {
      return NextResponse.json({ error: 'videos array is required' }, { status: 400 });
    }

    // 최대 50개 제한
    if (body.videos.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 videos can be added at once' },
        { status: 400 }
      );
    }

    // 기존 즐겨찾기 확인
    const video_ids = body.videos.map((v: unknown) => {
      if (!v || typeof v !== 'object') {
        throw new Error('Invalid video object');
      }
      const video = v as Record<string, unknown>;
      return String(video.video_id || '');
    });
    const { data: existing } = await supabase
      .from('youtube_favorites')
      .select('video_id')
      .eq('user_id', user.id)
      .in('video_id', video_ids);

    const existing_ids = new Set(existing?.map((e) => e.video_id) || []);

    // 새로운 항목만 필터링
    const new_favorites = body.videos
      .filter((v: unknown) => {
        if (!v || typeof v !== 'object') {
          return false;
        }
        const video = v as Record<string, unknown>;
        return !existing_ids.has(String(video.video_id || ''));
      })
      .map((v: unknown) => {
        if (!v || typeof v !== 'object') {
          throw new Error('Invalid video object');
        }
        const video = v as Record<string, unknown>;
        return {
          user_id: user.id,
          video_id: String(video.video_id || ''),
          videoData: video.videoData,
          tags: Array.isArray(video.tags) ? video.tags : [],
          notes: video.notes ? String(video.notes) : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

    if (new_favorites.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All videos are already in favorites',
        added: 0,
        skipped: body.videos.length,
      });
    }

    // 일괄 추가
    const { data: added, error: insert_error } = await supabase
      .from('youtube_favorites')
      .insert(new_favorites)
      .select();

    if (insert_error) {
      return NextResponse.json({ error: 'Failed to add favorites' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Added ${added?.length || 0} favorites`,
      added: added?.length || 0,
      skipped: existing_ids.size,
      data: added,
    });
  } catch (_error: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
