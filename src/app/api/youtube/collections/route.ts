import { NextRequest, NextResponse } from 'next/server';
import { CollectionManager } from '@/lib/youtube/collections';

const collectionManager = new CollectionManager();

/**
 * GET /api/youtube/collections
 * 사용자의 컬렉션 목록 조회
 */
export async function GET() {
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