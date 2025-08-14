import { Metadata } from 'next';
import { getFreeCourses } from '@/lib/api/courses';
import { CourseGrid } from '../components/CourseGrid';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Gift } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '무료 강의 | 디하클',
  description: 'YouTube Shorts 크리에이터를 위한 무료 교육 콘텐츠를 만나보세요.',
  openGraph: {
    title: '무료 강의 | 디하클',
    description: 'YouTube Shorts 크리에이터를 위한 무료 교육 콘텐츠를 만나보세요.',
    type: 'website',
  },
};

export default async function FreeCoursesPage() {
  const courses = await getFreeCourses();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 섹션 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              전체 강의 목록
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <Gift className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">무료 강의</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            YouTube Shorts 입문자를 위한 무료 강의를 제공합니다.
            기초부터 차근차근 시작해보세요!
          </p>
        </div>

        {/* 무료 강의 특징 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4 text-center">
            <h3 className="font-semibold mb-2">✨ 평생 무료</h3>
            <p className="text-sm text-muted-foreground">
              한 번 등록하면 영구적으로 무료로 수강 가능
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 text-center">
            <h3 className="font-semibold mb-2">📚 기초 완성</h3>
            <p className="text-sm text-muted-foreground">
              YouTube Shorts 시작에 필요한 모든 기초 지식
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-4 text-center">
            <h3 className="font-semibold mb-2">🎯 실습 중심</h3>
            <p className="text-sm text-muted-foreground">
              바로 적용 가능한 실전 노하우 제공
            </p>
          </div>
        </div>
      </div>

      {/* 강의 목록 */}
      {courses.length > 0 ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              총 <span className="font-semibold text-foreground">{courses.length}개</span>의 무료 강의
            </p>
          </div>
          <CourseGrid initialCourses={courses} />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Gift className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">아직 무료 강의가 없습니다</h2>
            <p className="text-muted-foreground mb-6">
              곧 유용한 무료 강의를 준비해서 제공할 예정입니다.
            </p>
            <Link href="/courses">
              <Button>전체 강의 둘러보기</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}