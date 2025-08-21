// revenue-proof/[id]/comment/route.ts
// 댓글 작성 및 조회 API

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { commentSchema } from '@/lib/validations/revenue-proof';

// GET: 댓글 목록 조회
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const supabase = createRouteHandlerClient({ cookies });
    const { id: proofId } = await params;

    // 댓글 조회
    const { data: comments, error } = await supabase
      .from('proof_comments')
      .select(`
        *,
        user:profiles!proofCommentsUserIdFkey(
          id,
          username,
          avatar_url
        )
      `)
      .eq('proof_id', proofId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: '댓글을 불러오는 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: comments || [],
      count: comments?.length || 0,
    });
  } catch (_error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// POST: 댓글 작성
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id: proofId } = await params;

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 인증이 존재하는지 확인
    const { data: proof, error: proofError } = await supabase
      .from('revenue_proofs')
      .select('id, is_hidden, comments_count')
      .eq('id', proofId)
      .single();

    if (proofError || !proof) {
      return NextResponse.json({ error: '인증을 찾을 수 없습니다' }, { status: 404 });
    }

    // 숨김 처리된 인증은 댓글 불가
    if (proof.is_hidden) {
      return NextResponse.json({ error: '이 인증에는 댓글을 작성할 수 없습니다' }, { status: 403 });
    }

    // 요청 본문 파싱
    const body = await request.json();

    // 입력값 검증
    const validatedData = commentSchema.parse(body);

    // 댓글 작성
    const { data: newComment, error: insertError } = await supabase
      .from('proof_comments')
      .insert({
        proof_id: proofId,
        user_id: user.id,
        content: validatedData.content,
      })
      .select(`
        *,
        user:profiles!proofCommentsUserIdFkey(
          id,
          username,
          avatar_url
        )
      `)
      .single();

    if (insertError) {
      return NextResponse.json({ error: '댓글 작성 중 오류가 발생했습니다' }, { status: 500 });
    }

    // 댓글 수 증가 (트리거가 처리하지만 명시적으로도 처리)
    await supabase
      .from('revenue_proofs')
      .update({
        comments_count: (proof.comments_count || 0) + 1,
      })
      .eq('id', proofId);

    return NextResponse.json(
      {
        data: newComment,
        message: '댓글이 작성되었습니다',
      },
      { status: 201 }
    );
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

// DELETE: 댓글 삭제 (작성자만)
export async function DELETE(request: NextRequest) {
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
    const comment_id = searchParams.get('comment_id');

    if (!comment_id) {
      return NextResponse.json({ error: '댓글 ID가 필요합니다' }, { status: 400 });
    }

    // 댓글 조회
    const { data: comment, error: fetchError } = await supabase
      .from('proof_comments')
      .select('user_id, proof_id')
      .eq('id', comment_id)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다' }, { status: 404 });
    }

    // 작성자 확인
    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: '삭제 권한이 없습니다' }, { status: 403 });
    }

    // 댓글 삭제
    const { error: deleteError } = await supabase
      .from('proof_comments')
      .delete()
      .eq('id', comment_id);

    if (deleteError) {
      return NextResponse.json({ error: '댓글 삭제 중 오류가 발생했습니다' }, { status: 500 });
    }

    // 댓글 수 감소
    const { data: proof } = await supabase
      .from('revenue_proofs')
      .select('comments_count')
      .eq('id', comment.proof_id)
      .single();

    if (proof) {
      await supabase
        .from('revenue_proofs')
        .update({
          comments_count: proof.comments_count > 0 ? proof.comments_count - 1 : 0,
        })
        .eq('id', comment.proof_id);
    }

    return NextResponse.json({
      message: '댓글이 삭제되었습니다',
    });
  } catch (_error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
