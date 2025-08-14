import { Metadata } from 'next';
import { getCourses } from '@/lib/api/courses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Grid3x3, 
  BookOpen, 
  Lightbulb, 
  Camera, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  Sparkles,
  Users
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '카테고리별 강의 | 디하클',
  description: '주제별로 분류된 YouTube Shorts 강의를 쉽게 찾아보세요.',
  openGraph: {
    title: '카테고리별 강의 | 디하클',
    description: '주제별로 분류된 YouTube Shorts 강의를 쉽게 찾아보세요.',
    type: 'website',
  },
};

// 카테고리 정의
const categories = [
  {
    id: 'beginner',
    name: '기초',
    description: 'YouTube Shorts 시작하기',
    icon: BookOpen,
    color: 'blue',
    tags: ['입문', '기초', '시작', 'beginner'],
  },
  {
    id: 'planning',
    name: '콘텐츠 기획',
    description: '아이디어 발굴과 기획 전략',
    icon: Lightbulb,
    color: 'yellow',
    tags: ['기획', '아이디어', '컨셉', 'planning'],
  },
  {
    id: 'production',
    name: '촬영 및 편집',
    description: '영상 제작 기술과 편집 노하우',
    icon: Camera,
    color: 'purple',
    tags: ['촬영', '편집', '제작', 'production'],
  },
  {
    id: 'growth',
    name: '성장 전략',
    description: '알고리즘 공략과 채널 성장',
    icon: TrendingUp,
    color: 'red',
    tags: ['알고리즘', '성장', '전략', 'growth'],
  },
  {
    id: 'monetization',
    name: '수익화',
    description: '수익 창출과 비즈니스 모델',
    icon: DollarSign,
    color: 'green',
    tags: ['수익화', '비즈니스', '광고', 'monetization'],
  },
  {
    id: 'analytics',
    name: '분석 및 최적화',
    description: '데이터 분석과 채널 최적화',
    icon: BarChart3,
    color: 'indigo',
    tags: ['분석', '최적화', '데이터', 'analytics'],
  },
];

export default async function CategoriesPage() {
  const response = await getCourses();
  const allCourses = response.courses;

  // 카테고리별 강의 수 계산
  const getCourseCountByCategory = (categoryTags: string[]) => {
    return allCourses.filter(course => {
      const courseTags = course.tags || [];
      const courseTitle = course.title.toLowerCase();
      const courseDesc = course.description?.toLowerCase() || '';
      
      return categoryTags.some(tag => 
        courseTags.includes(tag) ||
        courseTitle.includes(tag) ||
        courseDesc.includes(tag)
      );
    }).length;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        border: 'border-blue-200 dark:border-blue-900',
        text: 'text-blue-600 dark:text-blue-400',
      },
      yellow: {
        bg: 'bg-yellow-50 dark:bg-yellow-950/20',
        border: 'border-yellow-200 dark:border-yellow-900',
        text: 'text-yellow-600 dark:text-yellow-400',
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-950/20',
        border: 'border-purple-200 dark:border-purple-900',
        text: 'text-purple-600 dark:text-purple-400',
      },
      red: {
        bg: 'bg-red-50 dark:bg-red-950/20',
        border: 'border-red-200 dark:border-red-900',
        text: 'text-red-600 dark:text-red-400',
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-950/20',
        border: 'border-green-200 dark:border-green-900',
        text: 'text-green-600 dark:text-green-400',
      },
      indigo: {
        bg: 'bg-indigo-50 dark:bg-indigo-950/20',
        border: 'border-indigo-200 dark:border-indigo-900',
        text: 'text-indigo-600 dark:text-indigo-400',
      },
    };
    return colors[color] || colors.blue;
  };

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
          <div className="mx-auto mb-4 w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            <Grid3x3 className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">카테고리별 강의</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            관심 있는 주제를 선택하고 체계적으로 학습하세요.
            입문부터 전문가까지 단계별 커리큘럼을 제공합니다.
          </p>
        </div>

        {/* 전체 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{allCourses.length}</div>
            <p className="text-sm text-muted-foreground">전체 강의</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{categories.length}</div>
            <p className="text-sm text-muted-foreground">카테고리</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {allCourses.filter(c => c.is_free).length}
            </div>
            <p className="text-sm text-muted-foreground">무료 강의</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              <Users className="w-6 h-6 inline-block" />
            </div>
            <p className="text-sm text-muted-foreground">활발한 커뮤니티</p>
          </div>
        </div>
      </div>

      {/* 카테고리 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {categories.map((category) => {
          const Icon = category.icon;
          const courseCount = getCourseCountByCategory(category.tags);
          const colors = getColorClasses(category.color);
          
          return (
            <Link 
              key={category.id} 
              href={`/courses?category=${category.id}`}
              className="group"
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105 overflow-hidden">
                <CardHeader className={`${colors.bg} ${colors.border} border-b`}>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg bg-white dark:bg-gray-900 ${colors.text}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {courseCount > 0 && (
                      <Badge variant="secondary">
                        {courseCount}개 강의
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <CardTitle className="text-xl mb-2">{category.name}</CardTitle>
                  <p className="text-muted-foreground text-sm mb-4">
                    {category.description}
                  </p>
                  
                  {courseCount > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">
                        바로 학습하기 →
                      </span>
                      {courseCount >= 5 && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <Sparkles className="w-3 h-3 mr-1" />
                          인기
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      곧 공개 예정
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* 학습 로드맵 섹션 */}
      <div className="max-w-4xl mx-auto">
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">🗺️ 추천 학습 로드맵</CardTitle>
            <p className="text-muted-foreground mt-2">
              단계별로 체계적인 학습을 원한다면 이 순서를 따라보세요
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">기초 다지기</h4>
                  <p className="text-sm text-muted-foreground">
                    YouTube Shorts의 기본 개념과 시작 방법 학습
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center font-bold text-purple-600 dark:text-purple-400">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">콘텐츠 제작</h4>
                  <p className="text-sm text-muted-foreground">
                    기획부터 촬영, 편집까지 실전 제작 기술 습득
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center font-bold text-red-600 dark:text-red-400">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">채널 성장</h4>
                  <p className="text-sm text-muted-foreground">
                    알고리즘 이해와 성장 전략으로 구독자 확보
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center font-bold text-green-600 dark:text-green-400">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">수익화 달성</h4>
                  <p className="text-sm text-muted-foreground">
                    다양한 수익 모델 구축과 비즈니스 확장
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}