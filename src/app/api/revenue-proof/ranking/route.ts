// revenue-proof/ranking/route.ts
// 랭킹 조회 API

// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/server-client';

// GET: 랭킹 조회
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 세션 검사
    const auth_supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await auth_supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Service Role Client를 사용하여 RLS를 우회하고 공개 데이터를 가져옴
    const supabase = await createSupabaseServiceRoleClient();
    const { searchParams } = new URL(request.url);

    // 기간 파라미터 (daily, weekly, monthly)
    const period = searchParams.get('period') || 'monthly';
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);

    // 기간별 날짜 계산
    const now = new Date();
    let start_date: Date;

    switch (period) {
      case 'daily':
        start_date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        start_date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        start_date = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // 월간 랭킹 스냅샷 제거 (테이블이 없음)

    // 실시간 집계 쿼리 (단순화)
    const { data: proofs, error } = await supabase
      .from('revenue_proofs')
      .select('user_id, amount, platform')
      .eq('is_hidden', false)
      .gte('created_at', start_date.toISOString());

    if (error) {
      return NextResponse.json(
        { error: '랭킹을 불러오는 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    // 사용자별 수익 집계
    interface ProofData {
      user_id: string;
      amount: number;
      platform: string;
    }

    const user_revenues = (proofs || []).reduce(
      (
        acc: Record<
          string,
          {
            user_id: string;
            total_amount: number;
            proof_count: number;
            platforms: Set<string>;
          }
        >,
        proof: ProofData
      ) => {
        if (!proof.user_id) {
          return acc;
        }

        if (!acc[proof.user_id]) {
          acc[proof.user_id] = {
            user_id: proof.user_id,
            total_amount: 0,
            proof_count: 0,
            platforms: new Set(),
          };
        }

        const user_stats = acc[proof.user_id];
        if (user_stats) {
          user_stats.total_amount += proof.amount;
          user_stats.proof_count += 1;
          user_stats.platforms.add(proof.platform);
        }

        return acc;
      },
      {} as Record<
        string,
        {
          user_id: string;
          total_amount: number;
          proof_count: number;
          platforms: Set<string>;
        }
      >
    );

    // 사용자 정보 조회 및 정렬
    const user_ids = Object.keys(user_revenues);

    // TODO: avatar_url 필드 추가 후 주석 해제
    // const { data: profiles } = await supabase
    //   .from('profiles')
    //   .select('id, username, avatar_url')
    //   .in('id', userIds);

    // 임시로 avatar_url 없이 조회
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', user_ids);

    interface ProfileData {
      id: string;
      username?: string;
      avatar_url?: string;
    }

    const profile_map = (profiles || []).reduce(
      (
        acc: Record<string, ProfileData>,
        profile: { id: string | null; username: string | null }
      ) => {
        if (!profile.id) return acc;
        acc[profile.id] = {
          id: profile.id,
          username: profile.username || undefined, // null을 undefined로 변환
          avatar_url: undefined, // undefined로 변경 (타입 호환성)
        };
        return acc;
      },
      {} as Record<string, ProfileData>
    );

    // 배열로 변환하고 정렬
    const user_revenue_values = Object.values(user_revenues) as Array<{
      user_id: string;
      total_amount: number;
      proof_count: number;
      platforms: Set<string>;
    }>;

    const rankings = user_revenue_values
      .map((item) => ({
        user_id: item.user_id,
        total_amount: item.total_amount,
        proof_count: item.proof_count,
        username: profile_map[item.user_id]?.username || 'Anonymous',
        avatar_url: profile_map[item.user_id]?.avatar_url || null,
        platforms: Array.from(item.platforms),
        rank: 0, // 정렬 후 순위 부여
      }))
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, limit)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    // 스냅샷 저장 제거 (테이블 없음)

    // 현재 로그인 사용자의 순위 찾기
    const {
      data: { user: _authUser2 },
    } = await supabase.auth.getUser();
    let my_rank = null;

    if (user) {
      const my_data = user_revenue_values.find((item) => item.user_id === user.id);

      if (my_data) {
        const all_rankings = user_revenue_values.sort((a, b) => b.total_amount - a.total_amount);

        my_rank = {
          rank: all_rankings.findIndex((item) => item.user_id === user.id) + 1,
          total_amount: my_data.total_amount,
          proof_count: my_data.proof_count,
        };
      }
    }

    return NextResponse.json({
      rankings: rankings, // 프론트엔드에서 기대하는 형식
      period,
      myRank: my_rank,
      cached: false,
    });
  } catch (_error: unknown) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
