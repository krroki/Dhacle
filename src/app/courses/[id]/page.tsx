import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { SimpleCourse, getMockSimpleCourse } from '@/types/simple-course.types';
import CoursePageWrapper from './CoursePageWrapper';

interface CourseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getCourseData(courseId: string): Promise<SimpleCourse | null> {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Fetch course data from Supabase
    const { data: courseData, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (error || !courseData) {
      // Fallback to mock data for development
      console.log('Using mock data for course:', courseId);
      return getMockSimpleCourse(courseId);
    }
    
    // Transform database data to SimpleCourse type
    const simpleCourse: SimpleCourse = {
      id: courseData.id,
      title: courseData.title,
      subtitle: courseData.description?.substring(0, 100) || '체계적인 커리큘럼으로 성장하세요',
      description: courseData.description,
      price: courseData.price || 0,
      originalPrice: courseData.original_price || undefined,
      discountRate: courseData.discount_rate || undefined,
      thumbnailUrl: courseData.thumbnail_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200',
      duration: courseData.duration_weeks ? `${courseData.duration_weeks}주 과정` : '평생 시청 가능',
      includedItems: courseData.included_items || [
        `${courseData.duration_weeks || 8}주 완성 커리큘럼`,
        '실습 프로젝트 자료',
        '1:1 피드백 제공',
        '평생 업데이트',
        '수료증 발급',
        '커뮤니티 접근 권한'
      ],
      content_blocks: courseData.content_blocks || getMockSimpleCourse(courseId).content_blocks,
      curriculum: courseData.curriculum || getMockSimpleCourse(courseId).curriculum,
      faqs: courseData.faqs || getMockSimpleCourse(courseId).faqs,
      instructor_name: courseData.instructor_name,
      is_premium: courseData.is_premium || false,
      status: courseData.status || 'active',
      launch_date: courseData.launch_date,
      created_at: courseData.created_at,
      updated_at: courseData.updated_at
    };
    
    return simpleCourse;
  } catch (error) {
    console.error('Error fetching course:', error);
    // Return mock data as fallback
    return getMockSimpleCourse(courseId);
  }
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params;
  const course = await getCourseData(id);
  
  if (!course) {
    notFound();
  }
  
  // 데이터를 Client Component로 전달
  return <CoursePageWrapper course={course} />;
}