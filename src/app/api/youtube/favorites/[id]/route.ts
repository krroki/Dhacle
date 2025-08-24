// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 즐겨찾기 업데이트
 * PATCH /api/youtube/favorites/[id]
 */
export async function PATCH(
  _request: NextRequest,
  _params: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // TODO: youtube_favorites 테이블이 없음 - collections로 마이그레이션 필요
  return NextResponse.json(
    { error: '즐겨찾기 기능은 현재 재구성 중입니다.' },
    { status: 503 }
  );
}

/**
 * 즐겨찾기 삭제
 * DELETE /api/youtube/favorites/[id]
 */
export async function DELETE(
  _request: NextRequest,
  _params: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // TODO: youtube_favorites 테이블이 없음 - collections로 마이그레이션 필요
  return NextResponse.json(
    { error: '즐겨찾기 기능은 현재 재구성 중입니다.' },
    { status: 503 }
  );
}