// revenue-proof/[id]/route.ts
// 수익인증 상세 조회, 수정, 삭제 API

// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/server-client';
import { updateProofSchema } from '@/lib/validations/revenue-proof';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

// GET: 수익인증 상세 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(_request);
    if (!user) {
      logger.warn('Unauthorized access attempt to revenue-proof/[id] GET');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Service Role Client를 사용하여 RLS를 우회하고 공개 데이터를 가져옴
    const supabase = await createSupabaseServiceRoleClient();
    const { id } = await params;

    // 인증 정보 조회
    const { data: proof, error: proof_error } = await supabase
      .from('revenue_proofs')
      .select(`
        *,
        user:profiles!revenueProofsUserIdFkey(
          id,
          username,
          avatar_url,
          bio
        )
      `)
      .eq('id', id)
      .single();

    if (proof_error || !proof) {
      return NextResponse.json({ error: '인증을 찾을 수 없습니다' }, { status: 404 });
    }

    // 숨김 처리된 인증은 작성자만 볼 수 있음
    if (proof.is_hidden) {
      // 인증 확인용 클라이언트 생성
      const auth_client = await createSupabaseRouteHandlerClient();
      const {
        data: { user: auth_user2 },
      } = await auth_client.auth.getUser();
      if (!auth_user2 || auth_user2.id !== proof.user_id) {
        return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 });
      }
    }

    // 좋아요 수 조회
    const { count: likes_count } = await supabase
      .from('proof_likes')
      .select('*', { count: 'exact', head: true })
      .eq('proof_id', id);

    // 댓글 조회
    const { data: comments } = await supabase
      .from('proof_comments')
      .select(`
        *,
        user:profiles!proofCommentsUserIdFkey(
          id,
          username,
          avatar_url
        )
      `)
      .eq('proof_id', id)
      .order('created_at', { ascending: false });

    // 현재 사용자의 좋아요 여부 확인
    let is_liked = false;
    if (user) {
      const { data: likeData } = await supabase
        .from('proof_likes')
        .select('*')
        .eq('proof_id', id)
        .eq('user_id', user.id)
        .single();

      is_liked = !!likeData;
    }

    return NextResponse.json({
      data: {
        ...proof,
        likes_count: likes_count || 0,
        comments_count: comments?.length || 0,
        comments: comments || [],
        isLiked: is_liked,
      },
    });
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// PUT: 수익인증 수정 (작성자만, 24시간 내)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const auth_user4 = await requireAuth(request);
    if (!auth_user4) {
      logger.warn('Unauthorized access attempt to revenue-proof/[id] PUT');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();
    const { id } = await params;

    // 기존 인증 조회
    const { data: existing_proof, error: fetch_error } = await supabase
      .from('revenue_proofs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetch_error || !existing_proof) {
      return NextResponse.json({ error: '인증을 찾을 수 없습니다' }, { status: 404 });
    }

    // 작성자 확인
    if (existing_proof.user_id !== auth_user4.id) {
      return NextResponse.json({ error: '수정 권한이 없습니다' }, { status: 403 });
    }

    // 24시간 제한 확인
    if (!existing_proof.created_at) {
      return NextResponse.json({ error: '생성 시간 정보가 없습니다' }, { status: 400 });
    }
    const created_at = new Date(existing_proof.created_at);
    const now = new Date();
    const hours_since_creation = (now.getTime() - created_at.getTime()) / (1000 * 60 * 60);

    if (hours_since_creation > 24) {
      return NextResponse.json(
        { error: '작성 후 24시간이 지나 수정할 수 없습니다' },
        { status: 403 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();

    // 입력값 검증
    const validated_data = updateProofSchema.parse(body);

    // 업데이트
    const { data, error: update_error } = await supabase
      .from('revenue_proofs')
      .update({
        title: validated_data.title,
        content: validated_data.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (update_error) {
      return NextResponse.json({ error: '수정 중 오류가 발생했습니다' }, { status: 500 });
    }

    return NextResponse.json({
      data,
      message: '수익 인증이 수정되었습니다',
    });
  } catch (error) {
    // Zod 검증 에러
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: '입력값이 올바르지 않습니다',
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// DELETE: 수익인증 삭제 (작성자만)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const auth_user5 = await requireAuth(_request);
    if (!auth_user5) {
      logger.warn('Unauthorized access attempt to revenue-proof/[id] DELETE');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();
    const { id } = await params;

    // 기존 인증 조회
    const { data: existing_proof, error: fetch_error } = await supabase
      .from('revenue_proofs')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetch_error || !existing_proof) {
      return NextResponse.json({ error: '인증을 찾을 수 없습니다' }, { status: 404 });
    }

    // 작성자 확인
    if (existing_proof.user_id !== auth_user5.id) {
      return NextResponse.json({ error: '삭제 권한이 없습니다' }, { status: 403 });
    }

    // 삭제 실행
    const { error: delete_error } = await supabase.from('revenue_proofs').delete().eq('id', id);

    if (delete_error) {
      return NextResponse.json({ error: '삭제 중 오류가 발생했습니다' }, { status: 500 });
    }

    return NextResponse.json({
      message: '수익 인증이 삭제되었습니다',
    });
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
