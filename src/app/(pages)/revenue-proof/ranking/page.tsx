// 수익인증 랭킹 페이지

import { RankingDashboard } from '@/components/features/revenue-proof/RankingDashboard';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

// 동적 페이지로 설정 (빌드 시 정적 생성 방지)
export const dynamic = 'force-dynamic';

export const metadata = {
  title: '수익 랭킹',
  description: '디하클 크리에이터 수익 랭킹 - 월간 TOP 100',
};

export default async function RankingPage(): Promise<React.JSX.Element> {
  const supabase = await createSupabaseServerClient();

  // 현재 월 가져오기
  const current_month = new Date().toISOString().slice(0, 7); // YYYY-MM

  // 월간 랭킹 데이터 조회 (최근 30일)
  const month_ago = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: monthly_proofs } = await supabase
    .from('revenue_proofs')
    .select(`
      user_id,
      amount,
      user:profiles(
        id,
        username
      )
    `)
    .gte('created_at', month_ago)
    .eq('is_hidden', false);

  // 일간 랭킹 (오늘 인증 기준)
  const today = new Date().toISOString().split('T')[0];
  const { data: daily_proofs } = await supabase
    .from('revenue_proofs')
    .select(`
      user_id,
      amount,
      user:profiles(
        id,
        username
      )
    `)
    .gte('created_at', today)
    .eq('is_hidden', false);

  // 주간 랭킹 (최근 7일)
  const week_ago = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: weekly_proofs } = await supabase
    .from('revenue_proofs')
    .select(`
      user_id,
      amount,
      user:profiles(
        id,
        username
      )
    `)
    .gte('created_at', week_ago)
    .eq('is_hidden', false);

  // 사용자별 집계 함수
  const aggregate_by_user = (
    proofs:
      | {
          user_id: string;
          amount: number;
          user?:
            | {
                id: string | null;
                username: string | null;
              }
            | {
                id: string | null;
                username: string | null;
              }[];
        }[]
      | null
  ) => {
    if (!proofs) {
      return [];
    }

    const user_map = new Map();

    proofs.forEach((proof) => {
      const user_id = proof.user_id;
      // Handle both single object and array format from Supabase
      const user_obj = Array.isArray(proof.user) ? proof.user[0] : proof.user;

      if (user_map.has(user_id)) {
        const existing = user_map.get(user_id);
        existing.total_amount += proof.amount;
        existing.proof_count += 1;
      } else {
        user_map.set(user_id, {
          user_id: user_id,
          user: user_obj,
          total_amount: proof.amount,
          proof_count: 1,
        });
      }
    });

    return Array.from(user_map.values())
      .sort((a, b) => b.total_amount - a.total_amount)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  };

  const daily_rankings = aggregate_by_user(daily_proofs);
  const weekly_rankings = aggregate_by_user(weekly_proofs);
  const monthly_rankings = aggregate_by_user(monthly_proofs);

  // 보상 정보 (하드코딩 - 실제로는 DB나 설정에서 가져옴)
  const rewards = {
    monthly: [
      { rank: 1, prize: 'iPad Pro 12.9"', points: 50000, badge: 'gold' },
      { rank: 2, prize: 'AirPods Pro', points: 30000, badge: 'silver' },
      { rank: 3, prize: '스타벅스 기프티콘 10만원', points: 20000, badge: 'bronze' },
      { rank: '4-10', prize: '스타벅스 기프티콘 3만원', points: 10000, badge: 'top10' },
      { rank: '11-30', prize: '포인트 5000P', points: 5000, badge: 'top30' },
      { rank: '31-100', prize: '포인트 1000P', points: 1000, badge: 'top100' },
    ],
  };

  return (
    <div className="container-responsive py-8">
      <RankingDashboard
        dailyRankings={daily_rankings}
        weeklyRankings={weekly_rankings}
        monthlyRankings={monthly_rankings || []}
        rewards={rewards}
        currentMonth={current_month}
      />
    </div>
  );
}
