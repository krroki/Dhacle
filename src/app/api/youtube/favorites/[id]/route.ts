import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';

/**
 * 즐겨찾기 업데이트
 * PATCH /api/youtube/favorites/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const favoriteId = id;
    
    // 소유권 확인
    const { data: existing } = await supabase
      .from('youtube_favorites')
      .select('id')
      .eq('id', favoriteId)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }

    // 요청 바디 파싱
    const body = await request.json();
    
    // 업데이트 가능한 필드만 추출
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.tags !== undefined) {
      updates.tags = body.tags;
    }
    if (body.notes !== undefined) {
      updates.notes = body.notes;
    }
    if (body.video_data !== undefined) {
      updates.video_data = body.video_data;
    }

    // 업데이트 실행
    const { data: updated, error: updateError } = await supabase
      .from('youtube_favorites')
      .update(updates)
      .eq('id', favoriteId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update favorite:', updateError);
      return NextResponse.json(
        { error: 'Failed to update favorite' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated
    });

  } catch (error: unknown) {
    console.error('Favorite PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 즐겨찾기 삭제
 * DELETE /api/youtube/favorites/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const favoriteId = id;
    
    // 소유권 확인 및 삭제
    const { data: deleted, error: deleteError } = await supabase
      .from('youtube_favorites')
      .delete()
      .eq('id', favoriteId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (deleteError || !deleted) {
      return NextResponse.json(
        { error: 'Favorite not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Favorite deleted successfully',
      data: deleted
    });

  } catch (error: unknown) {
    console.error('Favorite DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 즐겨찾기 단일 항목 조회
 * GET /api/youtube/favorites/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const favoriteId = id;
    
    // 즐겨찾기 조회
    const { data: favorite, error: fetchError } = await supabase
      .from('youtube_favorites')
      .select('*')
      .eq('id', favoriteId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !favorite) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: favorite
    });

  } catch (error: unknown) {
    console.error('Favorite GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}