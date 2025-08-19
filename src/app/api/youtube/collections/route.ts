import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { ServerCollectionManager } from '@/lib/youtube/collections-server';

const collectionManager = new ServerCollectionManager();

/**
 * GET /api/youtube/collections
 * 사용자의 컬렉션 목록 조회
 */
export async function GET() {
  
  // 세션 검사
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  try {
    const { data, error } = await collectionManager.getCollections();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ collections: data });
  } catch (error) {
    console.error('Error in GET /api/youtube/collections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/youtube/collections
 * 새 컬렉션 생성
 */
export async function POST(request: NextRequest) {
  
  // 세션 검사
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user: authUser2 } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  try {
    const body = await request.json();
    const { name, description, is_public, tags, cover_image } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await collectionManager.createCollection({
      name,
      description,
      is_public,
      tags,
      cover_image
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ collection: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/youtube/collections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/youtube/collections
 * 컬렉션 정보 업데이트
 */
export async function PUT(request: NextRequest) {
  
  // 세션 검사
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user: authUser3 } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await collectionManager.updateCollection(id, updates);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ collection: data });
  } catch (error) {
    console.error('Error in PUT /api/youtube/collections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/youtube/collections
 * 컬렉션 삭제
 */
export async function DELETE(request: NextRequest) {
  
  // 세션 검사
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user: authUser4 } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    const { success, error } = await collectionManager.deleteCollection(id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error in DELETE /api/youtube/collections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}