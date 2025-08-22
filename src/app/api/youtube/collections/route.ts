import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { ServerCollectionManager } from '@/lib/youtube/collections-server';

/**
 * GET /api/youtube/collections
 * 사용자의 컬렉션 목록 조회
 */
export async function GET() {
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
    const collection_manager = new ServerCollectionManager();
    const { data, error } = await collection_manager.getCollections();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ collections: data });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/youtube/collections
 * 새 컬렉션 생성
 */
export async function POST(request: NextRequest) {
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
    const { name, description, is_public, tags, coverImage } = body;

    if (!name) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const collection_manager = new ServerCollectionManager();
    const { data, error } = await collection_manager.createCollection({
      name,
      description,
      is_public,
      tags,
      coverImage,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ collection: data }, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/youtube/collections
 * 컬렉션 정보 업데이트
 */
export async function PUT(request: NextRequest) {
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    const collection_manager = new ServerCollectionManager();
    const { data, error } = await collection_manager.updateCollection(id, updates);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ collection: data });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/youtube/collections
 * 컬렉션 삭제
 */
export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    const collection_manager = new ServerCollectionManager();
    const { success, error } = await collection_manager.deleteCollection(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
