import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

interface DashboardData {
  user: {
    id: string;
    email: string | null;
    username: string | null;
    nickname: string | null;
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // 사용자 프로필 정보 조회
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('username, nickname, created_at')
      .eq('user_id', user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Profile Error:', profileError);
    }
    
    // 통계 데이터 조회 (병렬 처리)
    const [postsResult, likesResult, commentsResult] = await Promise.all([
      // 총 게시글 수
      supabase
        .from('revenue_proof_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      
      // 받은 좋아요 수
      supabase
        .from('revenue_proof_likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      
      // 작성한 댓글 수
      supabase
        .from('revenue_proof_comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
    ]);
    
    // 계정 생성일로부터 경과 일수 계산
    const createdAt = new Date(profile?.created_at || user.created_at);
    const now = new Date();
    const accountAgeDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    const dashboardData: DashboardData = {
      user: {
        id: user.id,
        email: user.email || null,
        username: profile?.username || null,
        nickname: profile?.nickname || null,
        created_at: user.created_at
      },
      stats: {
        total_posts: postsResult.count || 0,
        total_likes: likesResult.count || 0,
        total_comments: commentsResult.count || 0,
        account_age_days: accountAgeDays
      }
    };
    
    return NextResponse.json(
      { data: dashboardData },
      { 
        headers: {
          'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60'
        }
      }
    );
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}