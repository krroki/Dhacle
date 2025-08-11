'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SimpleCourse, getMockSimpleCourse } from '@/types/simple-course.types';
import { createBrowserClient } from '@/lib/supabase/browser-client';
// import { useAuth } from '@/lib/auth/AuthProvider';
import SimpleCourseDetail from '@/components/courses/SimpleCourseDetail';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params?.id as string;
  // const { user } = useAuth();
  
  const [course, setCourse] = useState<SimpleCourse | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createBrowserClient();

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course data
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (courseError || !courseData) {
        console.error('Course fetch error:', courseError);
        // Use mock data on error
        setCourse(getMockSimpleCourse(courseId));
      } else {
        // 데이터베이스에서 가져온 데이터를 SimpleCourse 타입으로 변환
        const simpleCourse: SimpleCourse = {
          id: courseData.id,
          title: courseData.title,
          subtitle: courseData.description?.substring(0, 50) || '체계적인 커리큘럼',
          description: courseData.description,
          price: courseData.price,
          originalPrice: courseData.original_price || undefined,
          discountRate: courseData.discount_rate || undefined,
          thumbnailUrl: courseData.thumbnail_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200',
          duration: courseData.duration_weeks ? `${courseData.duration_weeks}주 과정` : '평생 시청 가능',
          includedItems: [
            `${courseData.duration_weeks || 8}주 완성 커리큘럼`,
            '실습 프로젝트 자료',
            '1:1 피드백 제공',
            '평생 업데이트',
            '수료증 발급'
          ],
          content_blocks: courseData.content_blocks || getMockSimpleCourse(courseId).content_blocks,
          curriculum: getMockSimpleCourse(courseId).curriculum, // Mock 데이터 사용
          faqs: getMockSimpleCourse(courseId).faqs, // Mock 데이터 사용
          instructor_name: courseData.instructor_name,
          is_premium: courseData.is_premium,
          status: courseData.status,
          launch_date: courseData.launch_date,
          created_at: courseData.created_at,
          updated_at: courseData.updated_at
        };
        setCourse(simpleCourse);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setCourse(getMockSimpleCourse(courseId));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">강의를 찾을 수 없습니다</h2>
        <Link href="/courses" className="text-blue-600 hover:underline">
          강의 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return <SimpleCourseDetail course={course} />;
}