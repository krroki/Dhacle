import { Activity, Award, BookOpen, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server-client';

async function getStats() {
  const supabase = await createClient();

  // 통계 데이터 조회
  const [
    { count: totalCourses },
    { count: totalUsers },
    { count: totalPurchases },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed'),
    supabase.from('purchases').select('finalAmount').eq('status', 'completed'),
  ]);

  interface RevenueItem {
    finalAmount?: number;
  }

  const totalRevenue =
    revenueData?.reduce((sum: number, p: RevenueItem) => sum + (p.finalAmount || 0), 0) || 0;

  return {
    totalCourses: totalCourses || 0,
    totalUsers: totalUsers || 0,
    totalPurchases: totalPurchases || 0,
    totalRevenue,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    {
      title: '전체 강의',
      value: stats.totalCourses,
      icon: BookOpen,
      description: '활성화된 강의 수',
      color: 'text-blue-600',
    },
    {
      title: '전체 수강생',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: '가입한 사용자 수',
      color: 'text-green-600',
    },
    {
      title: '총 매출',
      value: `₩${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: '누적 매출액',
      color: 'text-purple-600',
    },
    {
      title: '구매 건수',
      value: stats.totalPurchases,
      icon: TrendingUp,
      description: '완료된 구매',
      color: 'text-orange-600',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <p className="text-muted-foreground mt-2">Dhacle 플랫폼 운영 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
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
            <CardTitle>최근 구매</CardTitle>
            <CardDescription>최근 7일간 구매 내역</CardDescription>
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
            <CardTitle>인기 강의</CardTitle>
            <CardDescription>수강생이 많은 강의 TOP 5</CardDescription>
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
