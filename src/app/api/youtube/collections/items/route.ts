// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { ServerCollectionManager } from '@/lib/youtube/collections-server';

/**
 * GET /api/youtube/collections/items
 * 특정 컬렉션의 비디오 목록 조회
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // 세션 검사
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const collection_id = searchParams.get('collection_id');

    if (!collection_id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    const collection_manager = new ServerCollectionManager();
    const { data, error } = await collection_manager.getCollectionVideos(collection_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ items: data });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/youtube/collections/items
 * 컬렉션에 비디오 추가
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 세션 검사
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const body = await request.json();
    const { collection_id, video_id, notes, tags } = body;

    if (!collection_id || !video_id) {
      return NextResponse.json(
        { error: 'Collection ID and Video ID are required' },
        { status: 400 }
      );
    }

    const collection_manager = new ServerCollectionManager();
    const { data, error } = await collection_manager.addVideoToCollection(
      collection_id,
      video_id,
      notes,
      tags
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/youtube/collections/items
 * 컬렉션에서 비디오 제거
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // 세션 검사
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const collection_id = searchParams.get('collection_id');
    const video_id = searchParams.get('video_id');

    if (!collection_id || !video_id) {
      return NextResponse.json(
        { error: 'Collection ID and Video ID are required' },
        { status: 400 }
      );
    }

    const collection_manager = new ServerCollectionManager();
    const { success, error } = await collection_manager.removeVideoFromCollection(
      collection_id,
      video_id
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/youtube/collections/items/reorder
 * 컬렉션 아이템 순서 변경
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // 세션 검사
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const body = await request.json();
    const { collection_id, items } = body;

    if (!collection_id || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Collection ID and items array are required' },
        { status: 400 }
      );
    }

    const collection_manager = new ServerCollectionManager();
    const { success, error } = await collection_manager.reorderCollectionItems(
      collection_id,
      items
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
