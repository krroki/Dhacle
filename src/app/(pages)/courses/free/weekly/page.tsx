import { Metadata } from 'next';
import { getCourses } from '@/lib/api/courses';
import { CourseGrid } from '../../components/CourseGrid';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '주간 무료 강의 | 디하클',
  description: '이번 주 한정 무료로 제공되는 특별 강의를 만나보세요.',
};

// 동적 렌더링 설정 (Supabase cookies 사용으로 인한 필수 설정)
export const dynamic = 'force-dynamic';

export default async function WeeklyFreeCoursesPage() {
  // 주간 무료 강의 필터링 (is_free이면서 특별 태그가 있는 강의)
  const response = await getCourses({ is_free: true });
  const courses = response.courses.filter(course => 
    course.tags?.includes('weekly-free') || course.tags?.includes('주간무료')
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/courses/free">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              무료 강의 목록
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <Calendar className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">주간 무료 강의</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            이번 주 한정! 특별히 무료로 제공되는 프리미엄 강의를 놓치지 마세요.
          </p>
        </div>

        {/* 주간 무료 특전 */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-6 mb-8 max-w-3xl mx-auto">
          <h3 className="font-semibold text-lg mb-3">🎁 주간 무료 혜택</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span>매주 월요일 새로운 무료 강의 업데이트</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span>일주일 동안 무제한 수강 가능</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span>정가 대비 100% 할인된 특별 기회</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 강의 목록 */}
      {courses.length > 0 ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              이번 주 <span className="font-semibold text-foreground">{courses.length}개</span>의 무료 강의
            </p>
          </div>
          <CourseGrid initialCourses={courses} />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Calendar className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">이번 주 무료 강의 준비 중</h2>
            <p className="text-muted-foreground mb-6">
              매주 월요일 새로운 무료 강의가 공개됩니다.
              조금만 기다려주세요!
            </p>
            <Link href="/courses/free">
              <Button>다른 무료 강의 보기</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}