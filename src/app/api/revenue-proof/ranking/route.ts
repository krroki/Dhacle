// revenue-proof/ranking/route.ts
// 랭킹 조회 API

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';

// GET: 랭킹 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const { searchParams } = new URL(request.url);
    
    // 기간 파라미터 (daily, weekly, monthly)
    const period = searchParams.get('period') || 'monthly';
    const limit = parseInt(searchParams.get('limit') || '10');

    // 기간별 날짜 계산
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // 월간 랭킹 스냅샷 제거 (테이블이 없음)

    // 실시간 집계 쿼리 (단순화)
    const { data: proofs, error } = await supabase
      .from('revenue_proofs')
      .select('user_id, amount, platform')
      .eq('is_hidden', false)
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('Rankings query error:', error);
      return NextResponse.json(
        { error: '랭킹을 불러오는 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    // 사용자별 수익 집계
    const userRevenues = (proofs || []).reduce((acc, proof) => {
      if (!proof.user_id) return acc;
      
      if (!acc[proof.user_id]) {
        acc[proof.user_id] = {
          user_id: proof.user_id,
          total_amount: 0,
          proof_count: 0,
          platforms: new Set()
        };
      }
      
      acc[proof.user_id].total_amount += proof.amount;
      acc[proof.user_id].proof_count += 1;
      acc[proof.user_id].platforms.add(proof.platform);
      
      return acc;
    }, {} as Record<string, {
      user_id: string;
      total_amount: number;
      proof_count: number;
      platforms: Set<string>;
    }>);

    // 사용자 정보 조회 및 정렬
    const userIds = Object.keys(userRevenues);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds);

    const profileMap = (profiles || []).reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);

    // 배열로 변환하고 정렬
    const rankings = Object.values(userRevenues)
      .map((item) => ({
        ...item,
        username: profileMap[item.user_id]?.username || 'Anonymous',
        avatar_url: profileMap[item.user_id]?.avatar_url || null,
        platforms: Array.from(item.platforms),
        rank: 0 // 정렬 후 순위 부여
      }))
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, limit)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));

    // 스냅샷 저장 제거 (테이블 없음)

    // 현재 로그인 사용자의 순위 찾기
    const { data: { session } } = await supabase.auth.getSession();
    let myRank = null;
    
    if (session) {
      const myData = Object.values(userRevenues).find(
        (item) => item.user_id === session.user.id
      );
      
      if (myData) {
        const allRankings = Object.values(userRevenues)
          .sort((a, b) => b.total_amount - a.total_amount);
        
        myRank = {
          rank: allRankings.findIndex((item) => 
            item.user_id === session.user.id
          ) + 1,
          total_amount: myData.total_amount,
          proof_count: myData.proof_count
        };
      }
    }

    return NextResponse.json({
      rankings: rankings, // 프론트엔드에서 기대하는 형식
      period,
      myRank,
      cached: false
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}