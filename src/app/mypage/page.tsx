import type { SupabaseClient } from '@supabase/supabase-js';
import { Award, BookOpen, Clock, Target, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import type { Database } from '@/types';

export default async function MyPageDashboard() {
  const supabase = (await createSupabaseServerClient()) as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 프로필 정보
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  // 수강 중인 강의 수
  const { count: enrolledCoursesCount } = await supabase
    .from('course_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // 수익 인증 수
  const { count: revenueProofsCount } = await supabase
    .from('revenues')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // 획득한 뱃지 수
  const { count: badgesCount } = await supabase
    .from('badges')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // 최근 수강 중인 강의 (3개)
  const { data: recentCourses } = await supabase
    .from('course_enrollments')
    .select(`
      *,
      courses (
        id,
        title,
        thumbnail_url,
        instructorName,
        totalLessons
      )
    `)
    .eq('user_id', user.id)
    .order('lastAccessedAt', { ascending: false })
    .limit(3);

  // 대시보드 통계 카드
  const stats = [
    {
      title: '수강 중인 강의',
      value: enrolledCoursesCount || 0,
      icon: BookOpen,
      href: '/mypage/courses',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: '수익 인증',
      value: revenueProofsCount || 0,
      icon: TrendingUp,
      href: '/mypage/revenues',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: '획득 뱃지',
      value: badgesCount || 0,
      icon: Award,
      href: '/mypage/badges',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: '학습 시간',
      value: '0h',
      icon: Clock,
      href: '/mypage/courses',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 환영 메시지 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
        <p className="mt-1 text-gray-600">학습 진행 상황과 활동을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* 최근 학습 강의 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>최근 학습 강의</CardTitle>
          <Link href="/mypage/courses">
            <Button variant="ghost" size="sm">
              전체 보기
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentCourses && recentCourses.length > 0 ? (
            <div className="space-y-4">
              {recentCourses.map((enrollment) => {
                const course = enrollment.courses;
                if (!course) {
                  return null;
                }

                const progressPercent = course.totalLessons
                  ? (enrollment.completedLessons / course.totalLessons) * 100
                  : 0;

                return (
                  <div key={enrollment.id} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-20 h-14 bg-gray-200 rounded-lg overflow-hidden">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{course.title}</h4>
                      <p className="text-sm text-gray-600">{course.instructorName}</p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">진행률</span>
                          <span className="font-medium">
                            {enrollment.completedLessons}/{course.totalLessons}강
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    </div>
                    <Link href={`/courses/${course.id}`}>
                      <Button size="sm">이어 학습</Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">아직 수강 중인 강의가 없습니다</p>
              <Link href="/courses">
                <Button className="mt-4">강의 둘러보기</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 학습 목표 & 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 이번 주 학습 목표 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              이번 주 학습 목표
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">주간 학습 시간</span>
                <span className="font-medium">0 / 10시간</span>
              </div>
              <Progress value={0} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">완료한 강의</span>
                <span className="font-medium">0 / 5강</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* 커뮤니티 활동 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              커뮤니티 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">작성한 글</span>
                <span className="font-medium">0개</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">작성한 댓글</span>
                <span className="font-medium">0개</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">받은 좋아요</span>
                <span className="font-medium">0개</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
