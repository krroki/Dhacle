import { Activity, Award, BookOpen, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server-client';

async function get_stats(): Promise<{
  totalChannels: number;
  totalUsers: number;
  totalApiUsage: number;
  totalVideos: number;
}> {
  const supabase = await createClient();

  // 통계 데이터 조회 - YouTube 크리에이터 도구 사이트
  const [
    { count: total_channels },
    { count: total_users },
    { count: total_api_usage },
    { count: total_videos },
  ] = await Promise.all([
    supabase.from('yl_channels').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('api_usage').select('*', { count: 'exact', head: true }),
    supabase.from('videos').select('*', { count: 'exact', head: true }),
  ]);

  return {
    totalChannels: total_channels || 0,
    totalUsers: total_users || 0,
    totalApiUsage: total_api_usage || 0,
    totalVideos: total_videos || 0,
  };
}

export default async function AdminDashboard(): Promise<React.JSX.Element> {
  const stats = await get_stats();

  const stat_cards = [
    {
      title: '등록된 채널',
      value: stats.totalChannels,
      icon: BookOpen,
      description: 'YouTube Lens 채널 수',
      color: 'text-blue-600',
    },
    {
      title: '전체 사용자',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: '가입한 크리에이터 수',
      color: 'text-green-600',
    },
    {
      title: '분석된 비디오',
      value: stats.totalVideos.toLocaleString(),
      icon: TrendingUp,
      description: '수집된 영상 데이터',
      color: 'text-purple-600',
    },
    {
      title: 'API 사용량',
      value: stats.totalApiUsage.toLocaleString(),
      icon: Activity,
      description: 'API 호출 횟수',
      color: 'text-orange-600',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <p className="text-muted-foreground mt-2">YouTube 크리에이터 도구 사이트 운영 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stat_cards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={cn('w-4 h-4', stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 API 사용</CardTitle>
            <CardDescription>최근 7일간 API 호출 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mr-2" />
                <span>데이터 로딩 중...</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>인기 채널</CardTitle>
            <CardDescription>분석 요청이 많은 채널 TOP 5</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Award className="w-8 h-8 mr-2" />
                <span>데이터 로딩 중...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function (should be imported from lib/utils)
function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
