// 강의 API 유틸리티 함수

import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import type {
  Course,
  CourseDetailResponse,
  CourseFilters,
  CourseListResponse,
  CourseProgress,
} from '@/types';

/**
 * 강의 목록 조회
 */
export async function getCourses(filters?: CourseFilters): Promise<CourseListResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    // instructorProfiles 관계 제거하고 courses 테이블만 조회
    let query = supabase.from('courses').select('*', { count: 'exact' });

    // 필터 적용
    if (filters) {
      if (filters.instructor) {
        query = query.eq('instructor_name', filters.instructor);
      }
      if (filters.is_free !== undefined) {
        query = query.eq('is_free', filters.is_free);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.rating) {
        query = query.gte('average_rating', filters.rating);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.priceRange) {
        query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);
      }
    }

    // 정렬
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return { courses: [], total: 0, page: 1, pageSize: 20 };
    }

    // DB 타입을 Frontend 타입으로 변환
    const courses: Course[] = (data || []).map(course => ({
      id: course.id,
      title: course.title,
      subtitle: '',
      description: course.description || '',
      instructor_id: course.instructor_id || undefined,
      instructor_name: course.instructor_name,
      thumbnail_url: course.thumbnail_url || undefined,
      price: course.price,
      is_free: course.is_free || false,
      isPremium: course.price > 0,
      total_duration: 0, // TODO: 실제 duration 계산 필요
      student_count: course.total_students || 0,
      average_rating: course.average_rating || 0,
      reviewCount: 0, // TODO: 실제 리뷰 수 계산 필요
      status: 'active' as const,
      launchDate: course.created_at || new Date().toISOString(),
      created_at: course.created_at || new Date().toISOString(),
      updated_at: course.updated_at || new Date().toISOString(),
      category: course.category || undefined,
      level: course.level as 'beginner' | 'intermediate' | 'advanced' | undefined,
      requirements: course.requirements || undefined,
      whatYouLearn: course.what_youll_learn || undefined,
    }))

    return {
      courses,
      total: count || 0,
      page: 1,
      pageSize: 20,
    };
  } catch (_error) {
    return { courses: [], total: 0, page: 1, pageSize: 20 };
  }
}

/**
 * 강의 상세 정보 조회
 */
export async function getCourseDetail(course_id: string): Promise<CourseDetailResponse | null> {
  try {
    const supabase = await createSupabaseServerClient();

    // 강의 정보 (instructorProfiles 관계 제거)
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', course_id)
      .single();

    if (courseError || !course) {
      return null;
    }

    // 레슨 목록
    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', course_id)
      .order('order_index');

    // 현재 사용자의 구매/수강 상태 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let is_enrolled = false;
    let is_purchased = false;
    let progress: CourseProgress[] = [];

    if (user) {
      // 구매 상태 확인
      const { data: purchase } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', course_id)
        .eq('status', 'completed')
        .single();

      is_purchased = !!purchase;

      // 수강 상태 확인
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', course_id)
        .eq('is_active', true)
        .single();

      is_enrolled = !!enrollment;

      // 진도 정보
      if (is_enrolled || is_purchased) {
        const { data: progressData } = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', course_id);

        progress = (progressData || []).map(p => ({
          id: p.id,
          user_id: p.user_id || '',
          course_id: p.course_id || '',
          lesson_id: p.lesson_id || null,  // Use null for optional field
          progress: 0,
          completed: p.completed || false,
          watchCount: 0,
          last_watched_at: p.updated_at || null,
          notes: p.notes || null,
          created_at: p.created_at || new Date().toISOString(),
          updated_at: p.updated_at || new Date().toISOString(),
        }));
      }
    }

    // DB 타입을 Frontend 타입으로 변환
    const mappedCourse: Course | null = course ? {
      id: course.id,
      title: course.title,
      subtitle: '',
      description: course.description || '',
      instructor_id: course.instructor_id || undefined,
      instructor_name: course.instructor_name,
      thumbnail_url: course.thumbnail_url || undefined,
      price: course.price,
      is_free: course.is_free || false,
      isPremium: course.price > 0,
      total_duration: 0,
      student_count: course.total_students || 0,
      average_rating: course.average_rating || 0,
      reviewCount: 0,
      status: 'active' as const,
      launchDate: course.created_at || new Date().toISOString(),
      created_at: course.created_at || new Date().toISOString(),
      updated_at: course.updated_at || new Date().toISOString(),
      category: course.category || undefined,
      level: course.level as 'beginner' | 'intermediate' | 'advanced' | undefined,
      requirements: course.requirements || undefined,
      whatYouLearn: course.what_youll_learn || undefined,
    } : null;
    
    // Lesson 타입 변환
    interface Lesson {
      id: string;
      course_id: string;
      title: string;
      description?: string;
      video_url?: string;
      thumbnail_url?: string;
      duration: number;
      order_index: number;
      is_free: boolean;
      created_at: string;
      updated_at: string;
    }
    
    const mappedLessons: Lesson[] = (lessons || []).map(lesson => ({
      id: lesson.id,
      course_id: lesson.course_id || '',
      title: lesson.title,
      description: lesson.description || undefined,
      video_url: lesson.video_url || undefined,
      thumbnail_url: undefined, // lessons 테이블에 thumbnail_url 필드가 없음
      duration: lesson.duration_minutes || 0,
      order_index: 0, // order_index 필드가 없음
      is_free: lesson.is_preview || false,
      created_at: lesson.created_at || new Date().toISOString(),
      updated_at: lesson.updated_at || new Date().toISOString(),
    }))

    // If course not found, return null instead of partial response
    if (!mappedCourse) {
      console.error('Course not found:', course_id);
      return null;
    }

    return {
      course: mappedCourse,
      lessons: mappedLessons as Lesson[],
      is_enrolled,
      is_purchased,
      progress: (progress || []) as CourseProgress[],
    };
  } catch (_error) {
    return null;
  }
}

/**
 * 강사별 강의 목록 조회
 */
export async function getCoursesByInstructor(instructor_name: string): Promise<Course[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('instructor_name', instructor_name)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  // DB 타입을 Frontend 타입으로 변환
  return (data || []).map(course => ({
    id: course.id,
    title: course.title,
    subtitle: '',
    description: course.description || '',
    instructor_id: course.instructor_id,
    instructor_name: course.instructor_name,
    thumbnail_url: course.thumbnail_url,
    price: course.price,
    is_free: course.is_free || false,
    isPremium: course.price > 0,
    total_duration: 0,
    student_count: course.total_students || 0,
    average_rating: course.average_rating || 0,
    reviewCount: 0,
    status: 'active' as const,
    launchDate: course.created_at || new Date().toISOString(),
    created_at: course.created_at || new Date().toISOString(),
    updated_at: course.updated_at || new Date().toISOString(),
    category: course.category || undefined,
    level: course.level as 'beginner' | 'intermediate' | 'advanced' | undefined,
    requirements: course.requirements || undefined,
    whatYouLearn: course.what_youll_learn || undefined,
  }));
}

/**
 * 무료 강의 목록 조회
 */
export async function getFreeCourses(): Promise<Course[]> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_free', true)
      .eq('status', 'active')
      .order('student_count', { ascending: false })
      .limit(8);

    if (error) {
      return [];
    }

    // DB 타입을 Frontend 타입으로 변환
    return (data || []).map(course => ({
      id: course.id,
      title: course.title,
      subtitle: undefined,  // DB에 subtitle 필드 없음
      description: course.description || undefined,
      instructor_id: course.instructor_id || undefined,
      instructor_name: course.instructor_name,
      thumbnail_url: course.thumbnail_url || undefined,
      price: course.price,
      discount_price: undefined,  // DB에 discount_price 필드 없음
      is_free: course.is_free || false,
      isPremium: course.price > 0,
      total_duration: 0,
      student_count: course.total_students || 0,
      average_rating: course.average_rating || 0,
      reviewCount: 0,
      status: 'active' as const,
      launchDate: course.created_at || new Date().toISOString(),
      created_at: course.created_at || new Date().toISOString(),
      updated_at: course.updated_at || new Date().toISOString(),
    }));
  } catch (_error) {
    return [];
  }
}

/**
 * 인기 강의 목록 조회
 */
export async function getPopularCourses(): Promise<Course[]> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'active')
      .order('student_count', { ascending: false })
      .limit(8);

    if (error) {
      return [];
    }

    // DB 타입을 Frontend 타입으로 변환
    return (data || []).map(course => ({
      id: course.id,
      title: course.title,
      subtitle: undefined,  // DB에 subtitle 필드 없음
      description: course.description || undefined,
      instructor_id: course.instructor_id || undefined,
      instructor_name: course.instructor_name,
      thumbnail_url: course.thumbnail_url || undefined,
      price: course.price,
      discount_price: undefined,  // DB에 discount_price 필드 없음
      is_free: course.is_free || false,
      isPremium: course.price > 0,
      total_duration: 0,
      student_count: course.total_students || 0,
      average_rating: course.average_rating || 0,
      reviewCount: 0,
      status: 'active' as const,
      launchDate: course.created_at || new Date().toISOString(),
      created_at: course.created_at || new Date().toISOString(),
      updated_at: course.updated_at || new Date().toISOString(),
    }));
  } catch (_error) {
    return [];
  }
}

/**
 * 신규 강의 목록 조회
 */
export async function getNewCourses(): Promise<Course[]> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) {
      return [];
    }

    // DB 타입을 Frontend 타입으로 변환
    return (data || []).map(course => ({
      id: course.id,
      title: course.title,
      subtitle: undefined,  // DB에 subtitle 필드 없음
      description: course.description || undefined,
      instructor_id: course.instructor_id || undefined,
      instructor_name: course.instructor_name,
      thumbnail_url: course.thumbnail_url || undefined,
      price: course.price,
      discount_price: undefined,  // DB에 discount_price 필드 없음
      is_free: course.is_free || false,
      isPremium: course.price > 0,
      total_duration: 0,
      student_count: course.total_students || 0,
      average_rating: course.average_rating || 0,
      reviewCount: 0,
      status: 'active' as const,
      launchDate: course.created_at || new Date().toISOString(),
      created_at: course.created_at || new Date().toISOString(),
      updated_at: course.updated_at || new Date().toISOString(),
    }));
  } catch (_error) {
    return [];
  }
}

/**
 * 사용자의 구매한 강의 목록
 */
export async function getMyPurchasedCourses(user_id: string): Promise<Course[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('purchases')
    .select(`
      course:courses(*)
    `)
    .eq('user_id', user_id)
    .eq('status', 'completed');

  if (error) {
    return [];
  }

  return (
    (data
      ?.map((item: unknown) => {
        const typedItem = item as { course: Course };
        const course = typedItem.course;
        if (!course) return null;
        
        return {
          id: course.id,
          title: course.title,
          subtitle: '',
          description: course.description || '',
          instructor_id: course.instructor_id,
          instructor_name: course.instructor_name,
          thumbnail_url: course.thumbnail_url,
          price: course.price,
          is_free: course.is_free || false,
          isPremium: course.price > 0,
          total_duration: 0,
          student_count: course.student_count || 0,
          average_rating: course.average_rating || 0,
          reviewCount: 0,
          status: 'active' as const,
          launchDate: course.created_at || new Date().toISOString(),
          created_at: course.created_at || new Date().toISOString(),
          updated_at: course.updated_at || new Date().toISOString(),
          category: course.category,
          level: course.level as 'beginner' | 'intermediate' | 'advanced' | undefined,
          requirements: course.requirements,
          whatYouLearn: course.whatYouLearn,
        } as Course;
      })
      .filter(Boolean) as Course[]) || []
  );
}

/**
 * 사용자의 진행 중인 강의 목록
 */
export async function getMyActiveCourses(user_id: string): Promise<Course[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      course:courses(*)
    `)
    .eq('user_id', user_id)
    .eq('is_active', true)
    .is('completed_at', null);

  if (error) {
    return [];
  }

  return (
    (data
      ?.map((item: unknown) => {
        const typedItem = item as { course: Course };
        const course = typedItem.course;
        if (!course) return null;
        
        return {
          id: course.id,
          title: course.title,
          subtitle: '',
          description: course.description || '',
          instructor_id: course.instructor_id,
          instructor_name: course.instructor_name,
          thumbnail_url: course.thumbnail_url,
          price: course.price,
          is_free: course.is_free || false,
          isPremium: course.price > 0,
          total_duration: 0,
          student_count: course.student_count || 0,
          average_rating: course.average_rating || 0,
          reviewCount: 0,
          status: 'active' as const,
          launchDate: course.created_at || new Date().toISOString(),
          created_at: course.created_at || new Date().toISOString(),
          updated_at: course.updated_at || new Date().toISOString(),
          category: course.category,
          level: course.level as 'beginner' | 'intermediate' | 'advanced' | undefined,
          requirements: course.requirements,
          whatYouLearn: course.whatYouLearn,
        } as Course;
      })
      .filter(Boolean) as Course[]) || []
  );
}

/**
 * 강의 진도율 계산
 */
export async function getCourseProgress(user_id: string, course_id: string): Promise<number> {
  const supabase = await createSupabaseServerClient();

  // 전체 레슨 수
  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', course_id);

  // 완료한 레슨 수
  const { count: completedLessons } = await supabase
    .from('progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user_id)
    .eq('course_id', course_id)
    .eq('completed', true);

  if (!totalLessons || totalLessons === 0) {
    return 0;
  }

  return Math.round(((completedLessons || 0) / totalLessons) * 100);
}

/**
 * 유니크한 강사 목록 조회
 */
export async function getUniqueInstructors(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('courses')
    .select('instructor_name')
    .eq('status', 'active');

  if (error) {
    return [];
  }

  const uniqueInstructors = [
    ...new Set(
      data
        ?.map((item: unknown) => {
          const typedItem = item as { instructor_name: string };
          return typedItem.instructor_name;
        })
        .filter(Boolean)
    ),
  ];
  return uniqueInstructors as string[];
}
