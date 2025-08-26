// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 즐겨찾기 목록 조회
 * GET /api/youtube/favorites
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Step 1: Authentication check (required!)
  const user = await requireAuth(request);
  if (!user) {
    logger.warn('Unauthorized access attempt to YouTube Favorites API');
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 20;
    const offset = Number(searchParams.get('offset')) || 0;

    const { data: favorites, error } = await supabase
      .from('youtube_favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Failed to fetch favorites:', error);
      return NextResponse.json(
        { error: '즐겨찾기를 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: favorites || [],
      count: favorites?.length || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * 즐겨찾기 생성
 * POST /api/youtube/favorites
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Step 1: Authentication check (required!)
  const user = await requireAuth(request);
  if (!user) {
    logger.warn('Unauthorized access attempt to YouTube Favorites API');
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const body = await request.json();
    
    const { 
      video_id, 
      video_title, 
      video_description, 
      video_thumbnail, 
      channel_id, 
      channel_title 
    } = body;

    if (!video_id) {
      return NextResponse.json(
        { error: '비디오 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 이미 즐겨찾기에 있는지 확인
    const { data: existing } = await supabase
      .from('youtube_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('video_id', video_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: '이미 즐겨찾기에 추가된 비디오입니다.' },
        { status: 400 }
      );
    }

    // 즐겨찾기 추가
    const { data, error } = await supabase
      .from('youtube_favorites')
      .insert({
        user_id: user.id,
        video_id,
        video_title,
        video_description,
        video_thumbnail,
        channel_id,
        channel_title,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to add favorite:', error);
      return NextResponse.json(
        { error: '즐겨찾기 추가 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '즐겨찾기에 추가되었습니다.',
      data,
    });
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * 즐겨찾기 일괄 삭제
 * DELETE /api/youtube/favorites
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  // Step 1: Authentication check (required!)
  const user = await requireAuth(request);
  if (!user) {
    logger.warn('Unauthorized access attempt to YouTube Favorites API');
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const { searchParams } = new URL(request.url);
    const videoIds = searchParams.get('video_ids')?.split(',') || [];

    if (videoIds.length === 0) {
      return NextResponse.json(
        { error: '삭제할 비디오 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 선택된 즐겨찾기들 삭제
    const { error } = await supabase
      .from('youtube_favorites')
      .delete()
      .eq('user_id', user.id)
      .in('video_id', videoIds);

    if (error) {
      logger.error('Failed to delete favorites:', error);
      return NextResponse.json(
        { error: '즐겨찾기 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `${videoIds.length}개의 즐겨찾기가 삭제되었습니다.`,
      deletedCount: videoIds.length,
    });
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}