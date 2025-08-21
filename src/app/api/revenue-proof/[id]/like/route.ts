// revenue-proof/[id]/like/route.ts
// 좋아요 토글 API

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

// POST: 좋아요 토글
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      .select('id, is_hidden, likes_count')
      .eq('id', proofId)
      .single();

    if (proofError || !proof) {
      return NextResponse.json({ error: '인증을 찾을 수 없습니다' }, { status: 404 });
    }

    // 숨김 처리된 인증은 좋아요 불가
    if (proof.is_hidden) {
      return NextResponse.json({ error: '이 인증에는 좋아요를 할 수 없습니다' }, { status: 403 });
    }

    // 기존 좋아요 확인
    const { data: existingLike } = await supabase
      .from('proof_likes')
      .select('*')
      .eq('proof_id', proofId)
      .eq('user_id', user.id)
      .single();

    let isLiked = false;
    let message = '';

    if (existingLike) {
      // 좋아요 취소
      const { error: deleteError } = await supabase
        .from('proof_likes')
        .delete()
        .eq('proof_id', proofId)
        .eq('user_id', user.id);

      if (deleteError) {
        return NextResponse.json({ error: '좋아요 취소 중 오류가 발생했습니다' }, { status: 500 });
      }

      isLiked = false;
      message = '좋아요를 취소했습니다';

      // 좋아요 수 감소 (트리거가 처리하지만 명시적으로도 처리)
      await supabase
        .from('revenue_proofs')
        .update({
          likes_count: proof.likes_count && proof.likes_count > 0 ? proof.likes_count - 1 : 0,
        })
        .eq('id', proofId);
    } else {
      // 좋아요 추가
      const { error: insertError } = await supabase.from('proof_likes').insert({
        proof_id: proofId,
        user_id: user.id,
      });

      if (insertError) {
        return NextResponse.json({ error: '좋아요 중 오류가 발생했습니다' }, { status: 500 });
      }

      isLiked = true;
      message = '좋아요를 눌렀습니다';

      // 좋아요 수 증가 (트리거가 처리하지만 명시적으로도 처리)
      await supabase
        .from('revenue_proofs')
        .update({
          likes_count: (proof.likes_count || 0) + 1,
        })
        .eq('id', proofId);
    }

    // 최신 좋아요 수 조회
    const { count: likesCount } = await supabase
      .from('proof_likes')
      .select('*', { count: 'exact', head: true })
      .eq('proof_id', proofId);

    return NextResponse.json({
      isLiked,
      likes_count: likesCount || 0,
      message,
    });
  } catch (_error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
