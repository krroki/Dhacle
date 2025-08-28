// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 즐겨찾기 업데이트
 * PATCH /api/youtube/favorites/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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
    const { id: videoId } = await params;
    const body = await request.json();

    // collections 테이블로 업데이트
    const { error } = await supabase
      .from('collection_items')
      .update({
        notes: body.notes || '',
        position: body.position || 0
      })
      .eq('added_by', user.id)
      .eq('video_id', videoId);

    if (error) {
      logger.error('Failed to update favorite:', error);
      return NextResponse.json(
        { error: '즐겨찾기 업데이트 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '즐겨찾기가 업데이트되었습니다.',
    });
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * 즐겨찾기 삭제
 * DELETE /api/youtube/favorites/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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
    const { id: videoId } = await params;

    // collections 테이블에서 삭제
    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('added_by', user.id)
      .eq('video_id', videoId);

    if (error) {
      logger.error('Failed to delete favorite:', error);
      return NextResponse.json(
        { error: '즐겨찾기 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '즐겨찾기에서 삭제되었습니다.',
    });
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}