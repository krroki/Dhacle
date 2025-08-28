import { NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';

interface DashboardData {
  user: {
    id: string;
    email: string | null;
    username: string | null;
    randomNickname: string | null;
    created_at: string;
  };
  stats: {
    total_posts: number;
    total_likes: number;
    total_comments: number;
    account_age_days: number;
  };
}

type ApiResponse = { data: DashboardData } | { error: string };

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();

    // 인증 체크 (필수)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 사용자 프로필 정보 조회
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, random_nickname, created_at')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Profile Error:', profileError);
    }

    // 통계 데이터 조회
    const { data: proofs, count: postsCount } = await supabase
      .from('revenue_proofs')
      .select('likes_count, comments_count', { count: 'exact' })
      .eq('user_id', user.id);

    // 총 좋아요와 댓글 수 계산
    const totalLikes = proofs?.reduce((sum, proof) => sum + (proof.likes_count || 0), 0) || 0;
    const totalComments = proofs?.reduce((sum, proof) => sum + (proof.comments_count || 0), 0) || 0;

    // 계정 생성일로부터 경과 일수 계산
    const createdAt = new Date(profile?.created_at || user.created_at);
    const now = new Date();
    const accountAgeDays = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const dashboardData: DashboardData = {
      user: {
        id: user.id,
        email: user.email || null,
        username: profile?.username || null,
        randomNickname: profile?.random_nickname || null,
        created_at: user.created_at,
      },
      stats: {
        total_posts: postsCount || 0,
        total_likes: totalLikes,
        total_comments: totalComments,
        account_age_days: accountAgeDays,
      },
    };

    return NextResponse.json(
      { data: dashboardData },
      {
        headers: {
          'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
