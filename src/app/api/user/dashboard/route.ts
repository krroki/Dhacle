import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { requireAuth } from '@/lib/api-auth';

interface DashboardData {
  user: {
    id: string;
    email: string | null;
    username: string | null;
    randomNickname: string | null;
    created_at: string;
  };
  stats: {
    total_favorites: number;
    total_collections: number;
    account_age_days: number;
  };
}

type ApiResponse = { data: DashboardData } | { error: string };

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // 인증 체크 (필수)
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // 사용자 프로필 정보 조회 (users 테이블에서 가져오기 - random_nickname은 users 테이블에 있음)
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('username, random_nickname, created_at')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Profile Error:', profileError);
    }

    // YouTube 크리에이터 도구 통계 데이터 조회
    const { count: favoritesCount } = await supabase
      .from('youtube_favorites')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    const { count: collectionsCount } = await supabase
      .from('collections')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // YouTube 관련 통계 계산
    const totalFavorites = favoritesCount || 0;
    const totalCollections = collectionsCount || 0;

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
        total_favorites: totalFavorites,
        total_collections: totalCollections,
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
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
