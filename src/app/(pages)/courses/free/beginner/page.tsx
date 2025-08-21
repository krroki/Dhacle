import { ArrowLeft, GraduationCap } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { getCourses } from '@/lib/api/courses';
import { CourseGrid } from '../../components/CourseGrid';

export const metadata: Metadata = {
  title: '입문자 무료 강의 | 디하클',
  description: 'YouTube Shorts를 처음 시작하는 분들을 위한 무료 입문 강의',
};

// 동적 렌더링 설정 (Supabase cookies 사용으로 인한 필수 설정)
export const dynamic = 'force-dynamic';

export default async function BeginnerFreeCoursesPage(): Promise<React.JSX.Element> {
  // 입문자용 무료 강의 필터링
  const response = await getCourses({ is_free: true });
  const courses = response.courses.filter(
    (course) =>
      course.level === 'beginner' ||
      course.tags?.includes('입문') ||
      course.tags?.includes('초급') ||
      course.tags?.includes('기초')
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
          <div className="mx-auto mb-4 w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">입문자 무료 강의</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            YouTube Shorts가 처음이신가요? 걱정하지 마세요! 기초부터 차근차근 알려드립니다.
          </p>
        </div>

        {/* 입문자 학습 로드맵 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-6 mb-8 max-w-4xl mx-auto">
          <h3 className="font-semibold text-lg mb-4">🎯 입문자 학습 로드맵</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4">
              <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Step 1</div>
              <h4 className="font-medium mb-1">기초 이해하기</h4>
              <p className="text-sm text-muted-foreground">YouTube Shorts의 개념과 특징 이해</p>
            </div>
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4">
              <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Step 2</div>
              <h4 className="font-medium mb-1">첫 콘텐츠 제작</h4>
              <p className="text-sm text-muted-foreground">간단한 촬영과 편집 기법 학습</p>
            </div>
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4">
              <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Step 3</div>
              <h4 className="font-medium mb-1">채널 성장 시작</h4>
              <p className="text-sm text-muted-foreground">업로드와 기본 운영 전략 수립</p>
            </div>
          </div>
        </div>

        {/* 입문자를 위한 팁 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-4xl mx-auto">
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-green-500">✅</span> 걱정하지 마세요!
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 특별한 장비 없이도 시작 가능</li>
              <li>• 스마트폰 하나로 충분합니다</li>
              <li>• 단계별로 천천히 배워갑니다</li>
            </ul>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-purple-500">💡</span> 학습 꿀팁
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 하루 30분씩 꾸준히 학습</li>
              <li>• 배운 내용 바로 실습해보기</li>
              <li>• 커뮤니티에서 질문하기</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 강의 목록 */}
      {courses.length > 0 ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              총 <span className="font-semibold text-foreground">{courses.length}개</span>의 입문자
              무료 강의
            </p>
          </div>
          <CourseGrid initialCourses={courses} />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <GraduationCap className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">입문자 강의 준비 중</h2>
            <p className="text-muted-foreground mb-6">
              초보자를 위한 완벽한 커리큘럼을 준비하고 있습니다.
            </p>
            <Link href="/courses/free">
              <Button>전체 무료 강의 보기</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
