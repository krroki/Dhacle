// revenue-proof/my/route.ts
// 내 수익인증 목록 조회 API

import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: 내 인증 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // 인증 확인
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const includeHidden = searchParams.get('includeHidden') === 'true';

    // 내 인증 목록 조회
    let query = supabase
      .from('revenue_proofs')
      .select(`
        *,
        likes_count,
        comments_count,
        reports_count
      `, { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 숨김 포함 여부
    if (!includeHidden) {
      query = query.eq('is_hidden', false);
    }

    const { data: proofs, error, count } = await query;

    if (error) {
      console.error('My proofs query error:', error);
      return NextResponse.json(
        { error: '내 인증을 불러오는 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    // 각 인증에 대한 추가 정보 조회
    const proofsWithDetails = await Promise.all(
      (proofs || []).map(async (proof) => {
        // 오늘 작성 여부 확인
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const createdAt = new Date(proof.created_at);
        const isToday = createdAt >= today;

        // 24시간 내 수정 가능 여부
        const hoursSinceCreation = 
          (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        const canEdit = hoursSinceCreation <= 24;

        return {
          ...proof,
          is_today: isToday,
          can_edit: canEdit,
          hours_remaining: canEdit ? Math.floor(24 - hoursSinceCreation) : 0
        };
      })
    );

    // 통계 정보 계산
    const stats = {
      total_proofs: count || 0,
      total_amount: proofsWithDetails.reduce((sum, p) => sum + p.amount, 0),
      total_likes: proofsWithDetails.reduce((sum, p) => sum + p.likes_count, 0),
      total_comments: proofsWithDetails.reduce((sum, p) => sum + p.comments_count, 0),
      hidden_count: proofsWithDetails.filter(p => p.is_hidden).length,
      platforms: {
        youtube: proofsWithDetails.filter(p => p.platform === 'youtube').length,
        instagram: proofsWithDetails.filter(p => p.platform === 'instagram').length,
        tiktok: proofsWithDetails.filter(p => p.platform === 'tiktok').length
      }
    };

    // 오늘 인증 여부 확인
    const todayProof = proofsWithDetails.find(p => p.is_today);
    const canCreateToday = !todayProof;

    // 다음 인증 가능 시간 계산
    let nextAvailable = null;
    if (!canCreateToday && todayProof) {
      const tomorrow = new Date(todayProof.created_at);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      nextAvailable = tomorrow.toISOString();
    }

    return NextResponse.json({
      data: proofsWithDetails,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats,
      canCreateToday,
      nextAvailable
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// DELETE: 내 모든 인증 삭제 (위험한 작업)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // 인증 확인
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    // 확인 토큰 검증 (안전장치)
    const { searchParams } = new URL(request.url);
    const confirmToken = searchParams.get('confirm');
    
    if (confirmToken !== 'DELETE_ALL_MY_PROOFS') {
      return NextResponse.json(
        { error: '확인 토큰이 올바르지 않습니다' },
        { status: 400 }
      );
    }

    // 모든 내 인증 삭제
    const { error } = await supabase
      .from('revenue_proofs')
      .delete()
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Delete all proofs error:', error);
      return NextResponse.json(
        { error: '인증 삭제 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '모든 인증이 삭제되었습니다'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}