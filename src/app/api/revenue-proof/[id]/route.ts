// revenue-proof/[id]/route.ts
// 수익인증 상세 조회, 수정, 삭제 API

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/server-client';
import { updateProofSchema } from '@/lib/validations/revenue-proof';

// GET: 수익인증 상세 조회
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 세션 검사
    const authSupabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Service Role Client를 사용하여 RLS를 우회하고 공개 데이터를 가져옴
    const supabase = await createSupabaseServiceRoleClient();
    const { id } = await params;

    // 인증 정보 조회
    const { data: proof, error: proofError } = await supabase
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

    if (proofError || !proof) {
      return NextResponse.json({ error: '인증을 찾을 수 없습니다' }, { status: 404 });
    }

    // 숨김 처리된 인증은 작성자만 볼 수 있음
    if (proof.is_hidden) {
      // 인증 확인용 클라이언트 생성
      const authClient = createRouteHandlerClient({ cookies });
      const {
        data: { user: authUser2 },
      } = await authClient.auth.getUser();
      if (!authUser2 || authUser2.id !== proof.user_id) {
        return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 });
      }
    }

    // 좋아요 수 조회
    const { count: likesCount } = await supabase
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
    const {
      data: { user: authUser3 },
    } = await supabase.auth.getUser();
    let isLiked = false;

    if (authUser3) {
      const { data: likeData } = await supabase
        .from('proof_likes')
        .select('*')
        .eq('proof_id', id)
        .eq('user_id', authUser3.id)
        .single();

      isLiked = !!likeData;
    }

    return NextResponse.json({
      data: {
        ...proof,
        likes_count: likesCount || 0,
        comments_count: comments?.length || 0,
        comments: comments || [],
        isLiked: isLiked,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// PUT: 수익인증 수정 (작성자만, 24시간 내)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createRouteHandlerClient({ cookies });
    const { id } = await params;

    // 인증 확인
    const {
      data: { user: authUser4 },
    } = await supabase.auth.getUser();
    if (!authUser4) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 기존 인증 조회
    const { data: existingProof, error: fetchError } = await supabase
      .from('revenue_proofs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingProof) {
      return NextResponse.json({ error: '인증을 찾을 수 없습니다' }, { status: 404 });
    }

    // 작성자 확인
    if (existingProof.user_id !== authUser4.id) {
      return NextResponse.json({ error: '수정 권한이 없습니다' }, { status: 403 });
    }

    // 24시간 제한 확인
    const createdAt = new Date(existingProof.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation > 24) {
      return NextResponse.json(
        { error: '작성 후 24시간이 지나 수정할 수 없습니다' },
        { status: 403 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();

    // 입력값 검증
    const validatedData = updateProofSchema.parse(body);

    // 업데이트
    const { data, error: updateError } = await supabase
      .from('revenue_proofs')
      .update({
        title: validatedData.title,
        content: validatedData.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: '수정 중 오류가 발생했습니다' }, { status: 500 });
    }

    return NextResponse.json({
      data,
      message: '수익 인증이 수정되었습니다',
    });
  } catch (error) {
    console.error('API error:', error);

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient({ cookies });
    const { id } = await params;

    // 인증 확인
    const {
      data: { user: authUser5 },
    } = await supabase.auth.getUser();
    if (!authUser5) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 기존 인증 조회
    const { data: existingProof, error: fetchError } = await supabase
      .from('revenue_proofs')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingProof) {
      return NextResponse.json({ error: '인증을 찾을 수 없습니다' }, { status: 404 });
    }

    // 작성자 확인
    if (existingProof.user_id !== authUser5.id) {
      return NextResponse.json({ error: '삭제 권한이 없습니다' }, { status: 403 });
    }

    // 삭제 실행
    const { error: deleteError } = await supabase.from('revenue_proofs').delete().eq('id', id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ error: '삭제 중 오류가 발생했습니다' }, { status: 500 });
    }

    return NextResponse.json({
      message: '수익 인증이 삭제되었습니다',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
