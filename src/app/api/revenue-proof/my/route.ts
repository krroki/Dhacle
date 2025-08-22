// revenue-proof/my/route.ts
// 내 수익인증 목록 조회 API

// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import type { RevenueProof } from '@/types';

// 타입 정의
interface RevenueProofWithDetails extends RevenueProof {
  isToday: boolean;
  canEdit: boolean;
  hoursRemaining: number;
}

// GET: 내 인증 목록 조회
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;
    const includeHidden = searchParams.get('includeHidden') === 'true';

    // 내 인증 목록 조회
    let query = supabase
      .from('revenue_proofs')
      .select(
        `
        *,
        likes_count,
        comments_count,
        reports_count
      `,
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 숨김 포함 여부
    if (!includeHidden) {
      query = query.eq('is_hidden', false);
    }

    const { data: proofs, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: '내 인증을 불러오는 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    // 각 인증에 대한 추가 정보 조회
    const proofsWithDetails = await Promise.all(
      (proofs || []).map(async (proof: RevenueProof) => {
        // 오늘 작성 여부 확인
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const created_at = proof.created_at ? new Date(proof.created_at) : new Date();
        const isToday = created_at >= today;

        // 24시간 내 수정 가능 여부
        const hoursSinceCreation = (Date.now() - created_at.getTime()) / (1000 * 60 * 60);
        const canEdit = hoursSinceCreation <= 24;

        return {
          ...proof,
          isToday: isToday,
          canEdit: canEdit,
          hoursRemaining: canEdit ? Math.floor(24 - hoursSinceCreation) : 0,
        };
      })
    );

    // 통계 정보 계산
    const stats = {
      totalProofs: count || 0,
      total_amount: proofsWithDetails.reduce(
        (sum: number, p: RevenueProofWithDetails) => sum + p.amount,
        0
      ),
      totalLikes: proofsWithDetails.reduce(
        (sum: number, p: RevenueProofWithDetails) => sum + (p.likes_count ?? 0),
        0
      ),
      totalComments: proofsWithDetails.reduce(
        (sum: number, p: RevenueProofWithDetails) => sum + (p.comments_count ?? 0),
        0
      ),
      hiddenCount: proofsWithDetails.filter((p: RevenueProofWithDetails) => p.is_hidden).length,
      platforms: {
        youtube: proofsWithDetails.filter((p: RevenueProofWithDetails) => p.platform === 'youtube')
          .length,
        instagram: proofsWithDetails.filter(
          (p: RevenueProofWithDetails) => p.platform === 'instagram'
        ).length,
        tiktok: proofsWithDetails.filter((p: RevenueProofWithDetails) => p.platform === 'tiktok')
          .length,
      },
    };

    // 오늘 인증 여부 확인
    const todayProof = proofsWithDetails.find((p: RevenueProofWithDetails) => p.isToday);
    const canCreateToday = !todayProof;

    // 다음 인증 가능 시간 계산
    let nextAvailable = null;
    if (!canCreateToday && todayProof && todayProof.created_at) {
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
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats,
      canCreateToday,
      nextAvailable,
    });
  } catch (_error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// DELETE: 내 모든 인증 삭제 (위험한 작업)
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 확인 토큰 검증 (안전장치)
    const { searchParams } = new URL(request.url);
    const confirmToken = searchParams.get('confirm');

    if (confirmToken !== 'DELETE_ALL_MY_PROOFS') {
      return NextResponse.json({ error: '확인 토큰이 올바르지 않습니다' }, { status: 400 });
    }

    // 모든 내 인증 삭제
    const { error } = await supabase.from('revenue_proofs').delete().eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: '인증 삭제 중 오류가 발생했습니다' }, { status: 500 });
    }

    return NextResponse.json({
      message: '모든 인증이 삭제되었습니다',
    });
  } catch (_error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
