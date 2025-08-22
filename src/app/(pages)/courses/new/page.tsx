import { ArrowLeft, Calendar, Clock, Sparkles, Zap } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getNewCourses } from '@/lib/api/courses';
import { CourseGrid } from '../components/CourseGrid';

export const metadata: Metadata = {
  title: '신규 강의 | 디하클',
  description: '디하클에 새롭게 추가된 최신 YouTube Shorts 강의를 만나보세요.',
  openGraph: {
    title: '신규 강의 | 디하클',
    description: '디하클에 새롭게 추가된 최신 YouTube Shorts 강의를 만나보세요.',
    type: 'website',
  },
};

// 동적 렌더링 설정 (Supabase cookies 사용으로 인한 필수 설정)
export const dynamic = 'force-dynamic';

export default async function NewCoursesPage(): Promise<React.JSX.Element> {
  const courses = await getNewCourses();

  // Note: _isRecentlyAdded function removed as it was unused

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
          <div className="mx-auto mb-4 w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">신규 강의</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            최신 트렌드와 알고리즘을 반영한 새로운 강의! 누구보다 빠르게 최신 정보를 습득하세요.
          </p>
        </div>

        {/* 신규 강의 특징 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-4 text-center">
            <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm mb-1">최신 트렌드</h3>
            <p className="text-xs text-muted-foreground">2025년 최신 YouTube 동향 반영</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm mb-1">실시간 업데이트</h3>
            <p className="text-xs text-muted-foreground">알고리즘 변화 즉시 반영</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4 text-center">
            <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm mb-1">얼리버드 혜택</h3>
            <p className="text-xs text-muted-foreground">신규 강의 특별 할인 제공</p>
          </div>
        </div>

        {/* NEW 뱃지 설명 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/10 dark:to-pink-950/10 border border-purple-200 dark:border-purple-900 rounded-lg p-4 mb-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-500 text-white hover:bg-purple-600">✨ NEW</Badge>
            <p className="text-sm text-muted-foreground">
              최근 7일 이내 추가된 강의에는 NEW 뱃지가 표시됩니다
            </p>
          </div>
        </div>

        {/* 신규 강의 주제 미리보기 */}
        <div className="mb-8 max-w-4xl mx-auto">
          <h3 className="font-semibold mb-4 text-center">🎯 최신 강의 주제</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline">YouTube Shorts 알고리즘 2025</Badge>
            <Badge variant="outline">AI 도구 활용법</Badge>
            <Badge variant="outline">바이럴 콘텐츠 전략</Badge>
            <Badge variant="outline">수익화 최적화</Badge>
            <Badge variant="outline">글로벌 진출 가이드</Badge>
            <Badge variant="outline">브랜드 협업 노하우</Badge>
          </div>
        </div>
      </div>

      {/* 강의 목록 */}
      {courses.length > 0 ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              총 <span className="font-semibold text-foreground">{courses.length}개</span>의 신규
              강의
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              최신 등록순
            </div>
          </div>
          <CourseGrid initialCourses={courses} />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Sparkles className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">새로운 강의를 준비 중입니다</h2>
            <p className="text-muted-foreground mb-6">
              최신 트렌드를 반영한 새로운 강의가 곧 공개됩니다.
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
