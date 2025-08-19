'use client';

import { Calendar, CheckCircle, Clock, Lock, PlayCircle, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CourseDetailResponse } from '@/types/course';
import { ContentBlocks } from './ContentBlocks';
import { PurchaseCard } from './PurchaseCard';

interface CourseDetailClientProps {
  courseData: CourseDetailResponse;
}

export function CourseDetailClient({ courseData }: CourseDetailClientProps) {
  const [activeSection, setActiveSection] = useState('intro');
  const [stickyNav, setStickyNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setStickyNav(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const top = element.offsetTop - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const { course, lessons, isEnrolled, isPurchased } = courseData;

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  const getLessonIcon = (lesson: (typeof lessons)[0], index: number) => {
    if (lesson.isFree) return <PlayCircle className="w-4 h-4 text-green-600" />;
    if (isPurchased || isEnrolled) return <CheckCircle className="w-4 h-4 text-primary" />;
    return <Lock className="w-4 h-4 text-gray-400" />;
  };

  const navigationSections = [
    { id: 'intro', label: '클래스 소개' },
    { id: 'curriculum', label: '커리큘럼' },
    { id: 'instructor', label: '강사소개' },
    { id: 'reviews', label: '수강평' },
    { id: 'requirements', label: '수료 조건' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 히어로 섹션 */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 좌측 정보 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 메타 정보 */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">{course.category || '기타'}</Badge>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-4 h-4',
                        i < Math.floor(course.averageRating)
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                  <span className="text-sm ml-1">
                    {course.averageRating.toFixed(1)} ({course.reviewCount}개)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{course.studentCount?.toLocaleString() || 0}명 수강중</span>
                </div>
              </div>

              {/* 타이틀 */}
              <div>
                <h1 className="text-4xl font-bold mb-3">{course.title}</h1>
                {course.subtitle && (
                  <p className="text-xl text-muted-foreground">{course.subtitle}</p>
                )}
              </div>

              {/* 강사 정보 */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div>
                  <p className="font-medium">{course.instructorName || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">YouTube 크리에이터</p>
                </div>
              </div>

              {/* 추가 정보 */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>총 {formatDuration(course.totalDuration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>평생 무제한 시청</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span>수료증 발급</span>
                </div>
              </div>

              {/* 미리보기 비디오 */}
              {course.previewVideoUrl && (
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <video src={course.previewVideoUrl} controls={true} className="w-full h-full" />
                </div>
              )}
            </div>

            {/* 우측 구매 카드 (모바일에서는 하단에) */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <PurchaseCard
                  course={course}
                  isEnrolled={isEnrolled}
                  isPurchased={isPurchased}
                  firstLessonId={lessons[0]?.id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 컨텐츠 섹션 */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 좌측 메인 컨텐츠 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 스티키 네비게이션 */}
            <nav
              className={cn(
                'border-b bg-white dark:bg-gray-800 -mx-4 px-4 sticky z-40 transition-all',
                stickyNav ? 'top-0 shadow-md py-4' : 'top-0 py-0'
              )}
            >
              <div className="flex gap-8 overflow-x-auto">
                {navigationSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      'py-4 border-b-2 whitespace-nowrap transition-colors',
                      activeSection === section.id
                        ? 'border-primary text-primary font-medium'
                        : 'border-transparent hover:text-primary'
                    )}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </nav>

            {/* 컨텐츠 섹션들 */}
            <div className="space-y-12">
              {/* 강의 소개 */}
              <section id="intro">
                <h2 className="text-2xl font-bold mb-4">강의 소개</h2>
                {course.description && (
                  <p className="text-muted-foreground mb-6">{course.description}</p>
                )}
                <ContentBlocks
                  blocks={
                    typeof course.contentBlocks === 'string'
                      ? JSON.parse(course.contentBlocks)
                      : course.contentBlocks
                  }
                />

                {/* 학습 내용 */}
                {course.whatYouLearn && course.whatYouLearn.length > 0 && (
                  <Card className="mt-8">
                    <CardHeader>
                      <CardTitle>이런 걸 배워요</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.whatYouLearn.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </section>

              {/* 커리큘럼 */}
              <section id="curriculum">
                <h2 className="text-2xl font-bold mb-4">커리큘럼</h2>
                <p className="text-muted-foreground mb-6">
                  총 {lessons.length}개 레슨 · {formatDuration(course.totalDuration)}
                </p>

                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <Card key={lesson.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getLessonIcon(lesson, index)}
                            <div>
                              <p className="font-medium">
                                {index + 1}. {lesson.title}
                              </p>
                              {lesson.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {lesson.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(lesson.duration)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* 강사 소개 */}
              <section id="instructor">
                <h2 className="text-2xl font-bold mb-4">강사 소개</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-full bg-gray-200" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{course.instructorName || 'Anonymous'}</h3>
                        <p className="text-muted-foreground mt-2">
                          YouTube Shorts 전문 크리에이터로 100만 구독자를 보유하고 있습니다. 5년간의
                          콘텐츠 제작 경험을 바탕으로 실전 노하우를 전달합니다.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 수강평 */}
              <section id="reviews">
                <h2 className="text-2xl font-bold mb-4">수강평</h2>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">아직 수강평이 없습니다.</p>
                  </CardContent>
                </Card>
              </section>

              {/* 수료 조건 */}
              <section id="requirements">
                <h2 className="text-2xl font-bold mb-4">수료 조건</h2>
                <Card>
                  <CardContent className="p-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>전체 강의의 80% 이상 수강</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>최종 과제 제출 및 통과</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>수료증 자동 발급</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>

          {/* 우측 사이드바 (데스크톱) */}
          <div className="hidden lg:block lg:col-span-1">{/* 이미 상단에서 sticky로 표시됨 */}</div>
        </div>
      </div>
    </div>
  );
}
