import type { SupabaseClient } from '@supabase/supabase-js';
import { BookOpen, Calendar, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import type { Database } from '@/types/database';

interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolledAt: string;
  completedAt: string | null;
  lastAccessedAt: string | null;
  progressPercentage: number;
  completedLessons: number;
  status: 'active' | 'completed' | 'paused';
  courses: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    instructorName: string;
    price: number;
    totalLessons: number;
    durationHours: number;
    level: string;
    category: string;
  };
}

export default async function MyCoursesPage() {
  const supabase = (await createSupabaseServerClient()) as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 모든 수강 강의 가져오기
  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select(`
      *,
      courses (
        id,
        title,
        description,
        thumbnail_url,
        instructorName,
        price,
        totalLessons,
        durationHours,
        level,
        category
      )
    `)
    .eq('user_id', user.id)
    .order('lastAccessedAt', { ascending: false });

  const allCourses: CourseEnrollment[] = enrollments || [];
  const activeCourses = allCourses.filter((e: CourseEnrollment) => e.status === 'active');
  const completedCourses = allCourses.filter((e: CourseEnrollment) => e.status === 'completed');

  // 통계 계산
  const totalLearningHours = allCourses.reduce((sum: number, e: CourseEnrollment) => {
    const hours = e.courses?.durationHours || 0;
    const progress = e.progressPercentage / 100;
    return sum + hours * progress;
  }, 0);

  const _averageProgress =
    allCourses.length > 0
      ? allCourses.reduce((sum: number, e: CourseEnrollment) => sum + e.progressPercentage, 0) /
        allCourses.length
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">수강 강의</h2>
        <p className="mt-1 text-gray-600">현재 수강 중인 강의와 완료한 강의를 관리하세요</p>
      </div>

      {/* 학습 통계 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">전체 강의</p>
                <p className="text-2xl font-bold mt-1">{allCourses.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">수강 중</p>
                <p className="text-2xl font-bold mt-1">{activeCourses.length}</p>
              </div>
              <PlayCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">완료</p>
                <p className="text-2xl font-bold mt-1">{completedCourses.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">학습 시간</p>
                <p className="text-2xl font-bold mt-1">{Math.round(totalLearningHours)}h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 강의 목록 탭 */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">수강 중 ({activeCourses.length})</TabsTrigger>
          <TabsTrigger value="completed">완료 ({completedCourses.length})</TabsTrigger>
          <TabsTrigger value="all">전체 ({allCourses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {activeCourses.map((enrollment: CourseEnrollment) => (
                <CourseCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="수강 중인 강의가 없습니다"
              description="새로운 강의를 시작해보세요"
              actionLabel="강의 둘러보기"
              actionHref="/courses"
            />
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {completedCourses.map((enrollment: CourseEnrollment) => (
                <CourseCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="완료한 강의가 없습니다"
              description="현재 수강 중인 강의를 완료해보세요"
            />
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {allCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {allCourses.map((enrollment: CourseEnrollment) => (
                <CourseCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="수강한 강의가 없습니다"
              description="첫 강의를 시작해보세요"
              actionLabel="강의 둘러보기"
              actionHref="/courses"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CourseCard({ enrollment }: { enrollment: CourseEnrollment }) {
  const course = enrollment.courses;
  if (!course) {
    return null;
  }

  const progressPercent = enrollment.progressPercentage || 0;
  const isCompleted = enrollment.status === 'completed';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* 썸네일 */}
        <div className="md:w-48 h-32 md:h-auto bg-gray-200 flex-shrink-0">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* 강의 정보 */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{course.instructorName}</p>
            </div>
            <div className="flex items-center gap-2">
              {isCompleted && (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  완료
                </Badge>
              )}
              <Badge variant="outline">{course.level}</Badge>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

          {/* 진행률 */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">진행률</span>
              <span className="font-medium">
                {enrollment.completedLessons}/{course.totalLessons}강 ({progressPercent}%)
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* 정보 및 액션 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.durationHours}시간</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {enrollment.lastAccessedAt
                    ? `${new Date(enrollment.lastAccessedAt).toLocaleDateString('ko-KR')} 학습`
                    : '미학습'}
                </span>
              </div>
            </div>
            <Link href={`/courses/${course.id}`}>
              <Button size="sm">{isCompleted ? '다시 보기' : '이어 학습'}</Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="text-center py-12">
      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
