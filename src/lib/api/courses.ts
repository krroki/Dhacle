// 강의 API 유틸리티 함수

import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import type {
  Course,
  CourseDetailResponse,
  CourseFilters,
  CourseListResponse,
  CourseProgress,
} from '@/types/course';

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

    return {
      courses: data || [],
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

      isPurchased = !!purchase;

      // 수강 상태 확인
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', course_id)
        .eq('is_active', true)
        .single();

      isEnrolled = !!enrollment;

      // 진도 정보
      if (is_enrolled || is_purchased) {
        const { data: progressData } = await supabase
          .from('course_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', course_id);

        progress = progressData || [];
      }
    }

    return {
      course,
      lessons: lessons || [],
      is_enrolled,
      is_purchased,
      progress,
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

  return data || [];
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

    return data || [];
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

    return data || [];
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

    return data || [];
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
        return typedItem.course;
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
        return typedItem.course;
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
    .from('course_progress')
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
