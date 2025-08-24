// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 즐겨찾기 목록 조회
 * GET /api/youtube/favorites
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  // TODO: youtube_favorites 테이블이 없음 - collections로 마이그레이션 필요
  return NextResponse.json(
    { error: '즐겨찾기 기능은 현재 재구성 중입니다.' },
    { status: 503 }
  );
}

/**
 * 즐겨찾기 생성
 * POST /api/youtube/favorites
 */
export async function POST(_request: NextRequest): Promise<NextResponse> {
  // TODO: youtube_favorites 테이블이 없음 - collections로 마이그레이션 필요
  return NextResponse.json(
    { error: '즐겨찾기 기능은 현재 재구성 중입니다.' },
    { status: 503 }
  );
}

/**
 * 즐겨찾기 일괄 삭제
 * DELETE /api/youtube/favorites
 */
export async function DELETE(_request: NextRequest): Promise<NextResponse> {
  // TODO: youtube_favorites 테이블이 없음 - collections로 마이그레이션 필요
  return NextResponse.json(
    { error: '즐겨찾기 기능은 현재 재구성 중입니다.' },
    { status: 503 }
  );
}