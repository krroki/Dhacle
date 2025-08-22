import { ArrowLeft, PlayCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { getCourses } from '@/lib/api/courses';
import { mapCourse } from '@/lib/utils/type-mappers';
import { CourseGrid } from '../../components/CourseGrid';

export const metadata: Metadata = {
  title: '무료 체험 강의 | 디하클',
  description: '유료 강의를 무료로 체험해보세요. 일부 레슨을 미리 들어볼 수 있습니다.',
};

// 동적 렌더링 설정 (Supabase cookies 사용으로 인한 필수 설정)
export const dynamic = 'force-dynamic';

export default async function TrialCoursesPage(): Promise<React.JSX.Element> {
  // 무료 체험이 가능한 강의 필터링 (유료 강의 중 미리보기 제공)
  const response = await getCourses();
  const raw_courses = response.courses;
  const courses = raw_courses
    .map(mapCourse)
    .filter(
      (course) =>
        !course.is_free &&
        (course.tags?.includes('trial') ||
          course.tags?.includes('체험') ||
          course.tags?.includes('미리보기') ||
          course.previewEnabled === true)
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
          <div className="mx-auto mb-4 w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <PlayCircle className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">무료 체험 강의</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            프리미엄 강의를 구매하기 전에 무료로 체험해보세요. 일부 레슨을 미리 들어볼 수 있습니다.
          </p>
        </div>

        {/* 무료 체험 혜택 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-6 mb-8 max-w-4xl mx-auto">
          <h3 className="font-semibold text-lg mb-4">🎬 무료 체험 혜택</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">1</span>
                </div>
                <h4 className="font-medium">첫 2-3개 레슨 무료</h4>
              </div>
              <p className="text-sm text-muted-foreground pl-10">
                각 강의의 초반부를 무료로 수강 가능
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">2</span>
                </div>
                <h4 className="font-medium">강의 퀄리티 확인</h4>
              </div>
              <p className="text-sm text-muted-foreground pl-10">강사의 강의 스타일과 내용 확인</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">3</span>
                </div>
                <h4 className="font-medium">구매 결정 도움</h4>
              </div>
              <p className="text-sm text-muted-foreground pl-10">
                본인에게 맞는 강의인지 판단 가능
              </p>
            </div>
          </div>
        </div>

        {/* 체험 가능 강의 특징 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-medium text-sm">실전 중심</h4>
          </div>
          <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-medium text-sm">데이터 기반</h4>
          </div>
          <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🚀</div>
            <h4 className="font-medium text-sm">성장 전략</h4>
          </div>
          <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">💰</div>
            <h4 className="font-medium text-sm">수익화 노하우</h4>
          </div>
        </div>
      </div>

      {/* 강의 목록 */}
      {courses.length > 0 ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              총 <span className="font-semibold text-foreground">{courses.length}개</span>의 체험
              가능 강의
            </p>
            <div className="text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <PlayCircle className="w-4 h-4" />
                체험 가능 표시가 있는 강의를 확인하세요
              </span>
            </div>
          </div>
          <CourseGrid initialCourses={courses} />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <PlayCircle className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">체험 가능한 강의 준비 중</h2>
            <p className="text-muted-foreground mb-6">
              프리미엄 강의의 무료 체험 버전을 준비하고 있습니다.
            </p>
            <div className="space-y-3">
              <Link href="/courses">
                <Button className="w-full">전체 강의 둘러보기</Button>
              </Link>
              <Link href="/courses/free">
                <Button variant="outline" className="w-full">
                  무료 강의 보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
