import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import type { YouTubeVideo } from '@/types/youtube';

/**
 * 즐겨찾기 목록 조회
 * GET /api/youtube/favorites
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

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
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // 페이지네이션
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // 실행
    const { data: favorites, error, count } = await query;

    if (error) {
      console.error('Failed to fetch favorites:', error);
      return NextResponse.json(
        { error: 'Failed to fetch favorites' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: favorites || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error: unknown) {
    console.error('Favorites GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 즐겨찾기 추가
 * POST /api/youtube/favorites
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
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
    
    if (!body.video_id || !body.video_data) {
      return NextResponse.json(
        { error: 'video_id and video_data are required' },
        { status: 400 }
      );
    }

    // 중복 체크
    const { data: existing } = await supabase
      .from('youtube_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('video_id', body.video_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Video already in favorites' },
        { status: 409 }
      );
    }

    // 즐겨찾기 추가
    const { data: favorite, error: insertError } = await supabase
      .from('youtube_favorites')
      .insert({
        user_id: user.id,
        video_id: body.video_id,
        video_data: body.video_data,
        tags: body.tags || [],
        notes: body.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to add favorite:', insertError);
      return NextResponse.json(
        { error: 'Failed to add favorite' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: favorite
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Favorites POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 즐겨찾기 일괄 추가
 * PUT /api/youtube/favorites/batch
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
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
    
    if (!Array.isArray(body.videos) || body.videos.length === 0) {
      return NextResponse.json(
        { error: 'videos array is required' },
        { status: 400 }
      );
    }

    // 최대 50개 제한
    if (body.videos.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 videos can be added at once' },
        { status: 400 }
      );
    }

    // 기존 즐겨찾기 확인
    const videoIds = body.videos.map((v: unknown) => {
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
      .in('video_id', videoIds);

    const existingIds = new Set(existing?.map(e => e.video_id) || []);
    
    // 새로운 항목만 필터링
    const newFavorites = body.videos
      .filter((v: unknown) => {
        if (!v || typeof v !== 'object') return false;
        const video = v as Record<string, unknown>;
        return !existingIds.has(String(video.video_id || ''));
      })
      .map((v: unknown) => {
        if (!v || typeof v !== 'object') {
          throw new Error('Invalid video object');
        }
        const video = v as Record<string, unknown>;
        return {
          user_id: user.id,
          video_id: String(video.video_id || ''),
          video_data: video.video_data,
          tags: Array.isArray(video.tags) ? video.tags : [],
          notes: video.notes ? String(video.notes) : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

    if (newFavorites.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All videos are already in favorites',
        added: 0,
        skipped: body.videos.length
      });
    }

    // 일괄 추가
    const { data: added, error: insertError } = await supabase
      .from('youtube_favorites')
      .insert(newFavorites)
      .select();

    if (insertError) {
      console.error('Failed to add favorites:', insertError);
      return NextResponse.json(
        { error: 'Failed to add favorites' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Added ${added?.length || 0} favorites`,
      added: added?.length || 0,
      skipped: existingIds.size,
      data: added
    });

  } catch (error: unknown) {
    console.error('Favorites batch PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}