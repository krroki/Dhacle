'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getCourseDetail } from '@/lib/api/courses';
import { PurchaseCard } from './components/PurchaseCard';
import { ContentBlocks } from './components/ContentBlocks';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  Users, 
  Clock, 
  Calendar,
  CheckCircle,
  PlayCircle,
  Lock
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { CourseDetailResponse } from '@/types/course';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [courseData, setCourseData] = useState<CourseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('intro');
  const [stickyNav, setStickyNav] = useState(false);

  useEffect(() => {
    loadCourseDetail();
  }, [courseId]);

  useEffect(() => {
    const handleScroll = () => {
      setStickyNav(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadCourseDetail = async () => {
    setLoading(true);
    try {
      const data = await getCourseDetail(courseId);
      setCourseData(data);
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const top = element.offsetTop - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-2/3" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">강의를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const { course, lessons, isEnrolled, isPurchased } = courseData;

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}시간 ${minutes}분`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              {course.is_free && (
                <Badge className="bg-green-500">무료</Badge>
              )}
              {course.is_premium && (
                <Badge className="bg-purple-500">프리미엄</Badge>
              )}
              <Badge variant="secondary">{course.status === 'active' ? '진행중' : '예정'}</Badge>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            {course.subtitle && (
              <p className="text-xl text-gray-300 mb-6">{course.subtitle}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-600" />
                <span>{course.instructor_name}</span>
              </div>
              
              {course.average_rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.average_rating.toFixed(1)}</span>
                  <span className="text-gray-400">({course.review_count}개 평가)</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.student_count.toLocaleString()}명</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(course.total_duration)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(course.launch_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 좌측 메인 컨텐츠 (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* 메인 이미지/비디오 */}
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              {course.preview_video_url ? (
                <iframe
                  src={course.preview_video_url}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : course.thumbnail_url ? (
                <Image
                  src={course.thumbnail_url}
                  alt={course.title}
                  width={800}
                  height={450}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                  <PlayCircle className="w-24 h-24 text-white/50" />
                </div>
              )}
            </div>

            {/* 스티키 네비게이션 바 */}
            <nav className={cn(
              "border-b sticky top-16 bg-white dark:bg-gray-900 z-40 -mx-4 px-4",
              stickyNav && "shadow-md"
            )}>
              <div className="flex gap-8 overflow-x-auto">
                {[
                  { id: 'intro', label: '강의 소개' },
                  { id: 'curriculum', label: '커리큘럼' },
                  { id: 'instructor', label: '강사 소개' },
                  { id: 'reviews', label: '수강평' },
                  { id: 'faq', label: '자주 묻는 질문' }
                ].map(section => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "py-4 px-1 border-b-2 whitespace-nowrap transition-colors",
                      activeSection === section.id
                        ? "border-primary text-primary"
                        : "border-transparent hover:text-primary"
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
                <ContentBlocks blocks={course.content_blocks} />
                
                {/* 학습 내용 */}
                {course.what_you_learn && course.what_you_learn.length > 0 && (
                  <Card className="mt-8">
                    <CardHeader>
                      <CardTitle>이런 걸 배워요</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.what_you_learn.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 수강 대상 */}
                {course.target_audience && course.target_audience.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>이런 분들께 추천해요</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {course.target_audience.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* 선수 지식 */}
                {course.requirements && course.requirements.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>선수 지식</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {course.requirements.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </section>

              {/* 커리큘럼 */}
              <section id="curriculum">
                <h2 className="text-2xl font-bold mb-4">커리큘럼</h2>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <Card key={lesson.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {lesson.is_free || isEnrolled || isPurchased ? (
                              <PlayCircle className="w-5 h-5" />
                            ) : (
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {index + 1}. {lesson.title}
                            </h3>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {lesson.is_free && (
                            <Badge variant="secondary">무료</Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {Math.floor(lesson.duration / 60)}분
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
                      {course.instructor?.avatar_url ? (
                        <Image
                          src={course.instructor.avatar_url}
                          alt={course.instructor_name}
                          width={80}
                          height={80}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          {course.instructor?.display_name || course.instructor_name}
                        </h3>
                        {course.instructor?.specialty && (
                          <p className="text-muted-foreground mb-3">
                            {course.instructor.specialty}
                          </p>
                        )}
                        {course.instructor?.bio && (
                          <p className="text-sm">{course.instructor.bio}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 수강평 */}
              <section id="reviews">
                <h2 className="text-2xl font-bold mb-4">수강평</h2>
                <p className="text-muted-foreground">
                  아직 등록된 수강평이 없습니다.
                </p>
              </section>

              {/* FAQ */}
              <section id="faq">
                <h2 className="text-2xl font-bold mb-4">자주 묻는 질문</h2>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Q. 수강 기한이 있나요?</h3>
                      <p className="text-sm text-muted-foreground">
                        A. 아니요, 한 번 구매하시면 평생 무제한으로 수강하실 수 있습니다.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Q. 환불이 가능한가요?</h3>
                      <p className="text-sm text-muted-foreground">
                        A. 네, 구매 후 7일 이내에는 100% 환불이 가능합니다.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Q. 수료증이 발급되나요?</h3>
                      <p className="text-sm text-muted-foreground">
                        A. 네, 모든 강의를 완료하시면 수료증이 자동으로 발급됩니다.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>

          {/* 우측 구매 카드 (1/3) - 스티키 */}
          <div className="lg:col-span-1">
            <PurchaseCard 
              course={course}
              isEnrolled={isEnrolled}
              isPurchased={isPurchased}
            />
          </div>
        </div>
      </div>
    </div>
  );
}