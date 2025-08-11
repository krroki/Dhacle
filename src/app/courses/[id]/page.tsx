'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Course, CourseWeek, Enrollment } from '@/types/course-system.types';
import { StripeTypography, StripeButton, StripeCard } from '@/components/design-system';
import { createBrowserClient } from '@/lib/supabase/browser-client';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const courseId = params?.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [weeks, setWeeks] = useState<CourseWeek[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  
  const supabase = createBrowserClient();

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId, user]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (courseError) {
        console.error('Course fetch error:', courseError);
        // Use mock data for development
        setCourse(getMockCourse());
      } else {
        setCourse(courseData as Course);
      }
      
      // Fetch course weeks
      const { data: weeksData, error: weeksError } = await supabase
        .from('course_weeks')
        .select('*')
        .eq('course_id', courseId)
        .order('week_number', { ascending: true });
      
      if (weeksError) {
        console.error('Weeks fetch error:', weeksError);
        setWeeks(getMockWeeks());
      } else {
        setWeeks(weeksData as CourseWeek[] || getMockWeeks());
      }
      
      // Check enrollment status if user is logged in
      if (user) {
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();
        
        setEnrollment(enrollmentData as Enrollment);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      // Use mock data on error
      setCourse(getMockCourse());
      setWeeks(getMockWeeks());
    } finally {
      setLoading(false);
    }
  };

  const getMockCourse = (): Course => ({
    id: courseId,
    title: '유튜브 쇼츠 마스터 과정',
    description: '초보자부터 전문가까지, 체계적인 커리큘럼으로 유튜브 쇼츠 크리에이터가 되는 완벽한 과정입니다. 실전 경험과 노하우를 바탕으로 수익화까지 달성할 수 있도록 도와드립니다.',
    instructor_name: '김철수',
    thumbnail_url: '/images/courses/course-hero.jpg',
    badge_icon_url: '/images/badges/badge-master.png',
    duration_weeks: 4,
    price: 50000,
    is_premium: true,
    chat_room_url: 'https://open.kakao.com/example',
    launch_date: '2025-02-01',
    status: 'upcoming',
    max_students: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const getMockWeeks = (): CourseWeek[] => [
    {
      id: '1',
      course_id: courseId,
      week_number: 1,
      title: '쇼츠 기초 이론과 플랫폼 이해',
      description: '유튜브 쇼츠의 기본 개념과 알고리즘을 이해합니다.',
      video_url: 'https://example.com/week1.m3u8',
      video_duration: 2700,
      download_materials: [
        { name: '강의 슬라이드.pdf', url: '/downloads/week1-slides.pdf', size: 2048000 },
        { name: '체크리스트.xlsx', url: '/downloads/week1-checklist.xlsx', size: 512000 }
      ],
      is_published: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      course_id: courseId,
      week_number: 2,
      title: '콘텐츠 기획과 스토리텔링',
      description: '시청자를 사로잡는 콘텐츠 기획 방법을 배웁니다.',
      video_url: 'https://example.com/week2.m3u8',
      video_duration: 3600,
      download_materials: [
        { name: '기획 템플릿.pdf', url: '/downloads/week2-template.pdf', size: 1024000 }
      ],
      is_published: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      course_id: courseId,
      week_number: 3,
      title: '촬영과 편집 실전',
      description: '모바일로 전문가 수준의 영상을 만드는 방법을 익힙니다.',
      video_url: 'https://example.com/week3.m3u8',
      video_duration: 4200,
      download_materials: [],
      is_published: false,
      published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      course_id: courseId,
      week_number: 4,
      title: '알고리즘 최적화와 수익화',
      description: '채널 성장과 수익화 전략을 마스터합니다.',
      video_url: 'https://example.com/week4.m3u8',
      video_duration: 3300,
      download_materials: [],
      is_published: false,
      published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const handleEnrollment = async () => {
    if (!user) {
      router.push('/login?redirect=/courses/' + courseId);
      return;
    }
    
    if (course?.price === 0) {
      // Free course - direct enrollment
      await enrollFreeCourse();
    } else {
      // Premium course - redirect to payment
      router.push(`/payment?course=${courseId}`);
    }
  };

  const enrollFreeCourse = async () => {
    try {
      setEnrolling(true);
      
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user?.id,
          course_id: courseId,
          payment_status: 'completed',
          payment_amount: 0,
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setEnrollment(data as Enrollment);
      alert('수강 신청이 완료되었습니다!');
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('수강 신청 중 오류가 발생했습니다.');
    } finally {
      setEnrolling(false);
    }
  };

  const getWeekStatusIcon = (week: CourseWeek, isEnrolled: boolean) => {
    if (!isEnrolled) {
      return week.is_published ? '🔒' : '🔒';
    }
    // In real app, check progress table
    return week.is_published ? '✅' : '🔄';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <StripeTypography variant="body" color="muted">
          강의를 찾을 수 없습니다.
        </StripeTypography>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/courses" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        ← 목록으로
      </Link>
      
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Thumbnail */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-500 to-pink-500">
              <span className="text-white text-6xl font-bold">
                {course.title.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        {/* Course Info */}
        <div>
          {/* Badge */}
          {course.badge_icon_url && (
            <div className="inline-flex items-center gap-2 mb-4">
              <Image
                src={course.badge_icon_url}
                alt="Badge"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-sm text-gray-600">수료 시 획득</span>
            </div>
          )}
          
          <StripeTypography variant="h1" color="dark" className="mb-4">
            {course.title}
          </StripeTypography>
          
          <StripeTypography variant="body" color="muted" className="mb-6">
            {course.description}
          </StripeTypography>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-gray-500">강사:</span>
              <span className="font-medium">{course.instructor_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">기간:</span>
              <span className="font-medium">{course.duration_weeks}주 과정</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">가격:</span>
              <span className="text-2xl font-bold" style={{ color: course.price === 0 ? '#7c3aed' : '#1a1a1a' }}>
                {course.price === 0 ? '무료' : `₩${course.price.toLocaleString()}`}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4">
            {enrollment ? (
              <Link href={`/courses/${courseId}/week/1`} className="flex-1">
                <StripeButton variant="gradient" size="lg" fullWidth>
                  수강 계속하기
                </StripeButton>
              </Link>
            ) : (
              <StripeButton 
                variant="gradient" 
                size="lg" 
                fullWidth
                onClick={handleEnrollment}
                loading={enrolling}
              >
                {course.price === 0 ? '무료 수강 신청' : '수강 신청하기'}
              </StripeButton>
            )}
            
            {course.chat_room_url && (
              <a href={course.chat_room_url} target="_blank" rel="noopener noreferrer">
                <StripeButton variant="secondary" size="lg">
                  오픈채팅 참여
                </StripeButton>
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* Curriculum Section */}
      <StripeCard variant="default" className="mb-8">
        <div className="p-6">
          <StripeTypography variant="h2" color="dark" className="mb-6">
            📚 커리큘럼
          </StripeTypography>
          
          <div className="space-y-4">
            {weeks.map((week) => (
              <div
                key={week.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">
                    {getWeekStatusIcon(week, !!enrollment)}
                  </span>
                  <div>
                    <div className="font-medium">
                      Week {week.week_number}: {week.title}
                    </div>
                    {week.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {week.description}
                      </div>
                    )}
                  </div>
                </div>
                
                {week.video_duration && (
                  <div className="text-sm text-gray-500">
                    {Math.floor(week.video_duration / 60)}분
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </StripeCard>
      
      {/* Q&A Preview */}
      <StripeCard variant="default">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <StripeTypography variant="h2" color="dark">
              💬 Q&A
            </StripeTypography>
            {enrollment && (
              <Link href={`/courses/${courseId}/qna`}>
                <StripeButton variant="ghost" size="sm">
                  더보기 →
                </StripeButton>
              </Link>
            )}
          </div>
          
          {enrollment ? (
            <div className="text-center py-8 text-gray-500">
              아직 등록된 질문이 없습니다. 첫 번째 질문을 남겨보세요!
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              수강 신청 후 Q&A에 참여할 수 있습니다.
            </div>
          )}
        </div>
      </StripeCard>
    </div>
  );
}