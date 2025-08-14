import { Metadata } from 'next';
import { getPopularCourses } from '@/lib/api/courses';
import { CourseGrid } from '../components/CourseGrid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Users, Star, Award } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '인기 강의 | 디하클',
  description: '가장 많은 수강생이 선택한 디하클의 인기 강의를 만나보세요.',
  openGraph: {
    title: '인기 강의 | 디하클',
    description: '가장 많은 수강생이 선택한 디하클의 인기 강의를 만나보세요.',
    type: 'website',
  },
};

// 동적 렌더링 설정 (Supabase cookies 사용으로 인한 필수 설정)
export const dynamic = 'force-dynamic';

export default async function PopularCoursesPage() {
  const courses = await getPopularCourses();

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
          <div className="mx-auto mb-4 w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">인기 강의</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            수많은 크리에이터들이 선택한 베스트 강의!
            검증된 퀄리티와 만족도를 자랑합니다.
          </p>
        </div>

        {/* 인기 강의 기준 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4 text-center">
            <Users className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm mb-1">수강생 수</h3>
            <p className="text-xs text-muted-foreground">
              많은 학생이 선택
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm mb-1">높은 평점</h3>
            <p className="text-xs text-muted-foreground">
              4.5점 이상 우수
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4 text-center">
            <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm mb-1">완주율</h3>
            <p className="text-xs text-muted-foreground">
              높은 완주 비율
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm mb-1">실시간 인기</h3>
            <p className="text-xs text-muted-foreground">
              최근 관심 급증
            </p>
          </div>
        </div>

        {/* HOT 뱃지 설명 */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/10 dark:to-orange-950/10 border border-red-200 dark:border-red-900 rounded-lg p-4 mb-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Badge className="bg-red-500 text-white hover:bg-red-600">🔥 HOT</Badge>
            <p className="text-sm text-muted-foreground">
              현재 가장 많은 수강생이 듣고 있는 강의에는 HOT 뱃지가 표시됩니다
            </p>
          </div>
        </div>
      </div>

      {/* 강의 목록 */}
      {courses.length > 0 ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              총 <span className="font-semibold text-foreground">{courses.length}개</span>의 인기 강의
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              수강생 많은 순
            </div>
          </div>
          <CourseGrid initialCourses={courses} />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <TrendingUp className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">인기 강의를 준비 중입니다</h2>
            <p className="text-muted-foreground mb-6">
              곧 최고의 인기 강의를 만나보실 수 있습니다.
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