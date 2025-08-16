import { NextRequest, NextResponse } from 'next/server';
import { CollectionManager } from '@/lib/youtube/collections';

const collectionManager = new CollectionManager();

/**
 * GET /api/youtube/collections/items
 * 특정 컬렉션의 비디오 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await collectionManager.getCollectionVideos(collectionId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ items: data });
  } catch (error) {
    console.error('Error in GET /api/youtube/collections/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/youtube/collections/items
 * 컬렉션에 비디오 추가
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collectionId, videoId, notes, tags } = body;

    if (!collectionId || !videoId) {
      return NextResponse.json(
        { error: 'Collection ID and Video ID are required' },
        { status: 400 }
      );
    }

    const { data, error } = await collectionManager.addVideoToCollection(
      collectionId,
      videoId,
      notes,
      tags
    );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/youtube/collections/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/youtube/collections/items
 * 컬렉션에서 비디오 제거
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    const videoId = searchParams.get('videoId');

    if (!collectionId || !videoId) {
      return NextResponse.json(
        { error: 'Collection ID and Video ID are required' },
        { status: 400 }
      );
    }

    const { success, error } = await collectionManager.removeVideoFromCollection(
      collectionId,
      videoId
    );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error in DELETE /api/youtube/collections/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/youtube/collections/items/reorder
 * 컬렉션 아이템 순서 변경
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { collectionId, items } = body;

    if (!collectionId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Collection ID and items array are required' },
        { status: 400 }
      );
    }

    const { success, error } = await collectionManager.reorderCollectionItems(
      collectionId,
      items
    );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error in PUT /api/youtube/collections/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}