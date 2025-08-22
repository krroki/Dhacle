// 수익인증 랭킹 페이지

import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { RankingDashboard } from '@/components/features/revenue-proof/RankingDashboard';

// 동적 페이지로 설정 (빌드 시 정적 생성 방지)
export const dynamic = 'force-dynamic';

export const metadata = {
  title: '수익 랭킹',
  description: '디하클 크리에이터 수익 랭킹 - 월간 TOP 100',
};

export default async function RankingPage(): Promise<React.JSX.Element> {
  const supabase = await createSupabaseServerClient();

  // 현재 월 가져오기
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  // 월간 랭킹 데이터 조회
  const { data: monthlyRankings } = await supabase
    .from('monthlyRankings')
    .select(`
      *,
      user:profiles(
        id,
        username,
        avatar_url
      )
    `)
    .eq('month', `${currentMonth}-01`)
    .order('rank', { ascending: true })
    .limit(100);

  // 일간 랭킹 (오늘 인증 기준)
  const today = new Date().toISOString().split('T')[0];
  const { data: dailyProofs } = await supabase
    .from('revenue_proofs')
    .select(`
      user_id,
      amount,
      user:profiles(
        id,
        username,
        avatar_url
      )
    `)
    .gte('created_at', today)
    .eq('is_hidden', false);

  // 주간 랭킹 (최근 7일)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: weeklyProofs } = await supabase
    .from('revenue_proofs')
    .select(`
      user_id,
      amount,
      user:profiles(
        id,
        username,
        avatar_url
      )
    `)
    .gte('created_at', weekAgo)
    .eq('is_hidden', false);

  // 사용자별 집계 함수
  const aggregateByUser = (
    proofs:
      | {
          user_id: string;
          amount: number;
          user?:
            | {
                id: string;
                username: string;
                avatar_url?: string;
              }
            | {
                id: string;
                username: string;
                avatar_url?: string;
              }[];
        }[]
      | null
  ) => {
    if (!proofs) {
      return [];
    }

    const userMap = new Map();

    proofs.forEach((proof) => {
      const user_id = proof.user_id;
      // Handle both single object and array format from Supabase
      const userObj = Array.isArray(proof.user) ? proof.user[0] : proof.user;

      if (userMap.has(user_id)) {
        const existing = userMap.get(user_id);
        existing.total_amount += proof.amount;
        existing.proof_count += 1;
      } else {
        userMap.set(user_id, {
          user_id: user_id,
          user: userObj,
          total_amount: proof.amount,
          proof_count: 1,
        });
      }
    });

    return Array.from(userMap.values())
      .sort((a, b) => b.total_amount - a.total_amount)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  };

  const dailyRankings = aggregateByUser(dailyProofs);
  const weeklyRankings = aggregateByUser(weeklyProofs);

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
        dailyRankings={dailyRankings}
        weeklyRankings={weeklyRankings}
        monthlyRankings={monthlyRankings || []}
        rewards={rewards}
        currentMonth={currentMonth}
      />
    </div>
  );
}
