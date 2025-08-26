import { useQuery, useMutation, useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { Course, CourseProgress } from '@/types';

interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
}

/**
 * 강의 목록 쿼리 훅 (무한 스크롤)
 */
type CourseFilters = {
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  sortBy?: 'latest' | 'popular' | 'price';
  search?: string;
};

export function useCourses(filters?: CourseFilters) {
  return useInfiniteQuery<
    PaginatedResponse<Course>,
    Error,
    InfiniteData<PaginatedResponse<Course>>,
    readonly ['courses', 'list', CourseFilters?],
    number
  >({
    queryKey: queryKeys.courses.list(filters),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: '20',
        ...(filters?.category && { category: filters.category }),
        ...(filters?.level && { level: filters.level }),
        ...(filters?.sortBy && { sortBy: filters.sortBy }),
        ...(filters?.search && { search: filters.search }),
      });
      return apiGet(`/api/courses?${params}`);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage?.data?.length < 20) return undefined;
      return pages.length;
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * 강의 상세 정보 쿼리 훅
 */
export function useCourse(courseId: string) {
  return useQuery<Course>({
    queryKey: queryKeys.courses.detail(courseId),
    queryFn: () => apiGet(`/api/courses/${courseId}`),
    enabled: !!courseId,
    staleTime: 10 * 60 * 1000, // 10분
  });
}

/**
 * 수강 중인 강의 목록 쿼리 훅
 */
export function useEnrolledCourses() {
  return useQuery<Course[]>({
    queryKey: queryKeys.courses.enrolled(),
    queryFn: () => apiGet('/api/courses/enrolled'),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * 강의 진행률 쿼리 훅
 */
export function useCourseProgress(courseId: string) {
  return useQuery<CourseProgress>({
    queryKey: queryKeys.courses.progress(courseId),
    queryFn: () => apiGet(`/api/courses/${courseId}/progress`),
    enabled: !!courseId,
    staleTime: 1 * 60 * 1000, // 1분
  });
}

/**
 * 강의 수강 신청 뮤테이션 훅
 */
export function useEnrollCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (courseId: string) => 
      apiPost(`/api/courses/${courseId}/enroll`, {}),
    onSuccess: (_, courseId) => {
      // 수강 중인 강의 목록 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.enrolled() 
      });
      // 강의 상세 정보 무효화 (수강생 수 업데이트)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.detail(courseId) 
      });
    },
  });
}

/**
 * 강의 진행률 업데이트 뮤테이션 훅
 */
export function useUpdateCourseProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, lessonId, progress }: {
      courseId: string;
      lessonId: string;
      progress: number;
    }) => apiPut(`/api/courses/${courseId}/progress`, { lessonId, progress }),
    onSuccess: (_, variables) => {
      // 진행률 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.progress(variables.courseId) 
      });
      // 수강 중인 강의 목록도 무효화 (진행률 표시)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.enrolled() 
      });
    },
  });
}

/**
 * 강의 완료 처리 뮤테이션 훅
 */
export function useCompleteCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (courseId: string) => 
      apiPost(`/api/courses/${courseId}/complete`, {}),
    onSuccess: (_, courseId) => {
      // 진행률 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.progress(courseId) 
      });
      // 수강 중인 강의 목록 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.enrolled() 
      });
      // 사용자 업적 무효화 (강의 완료 업적)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.achievements() 
      });
    },
  });
}

/**
 * 강의 리뷰 작성 뮤테이션 훅
 */
export function useCreateCourseReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, rating, review }: {
      courseId: string;
      rating: number;
      review: string;
    }) => apiPost(`/api/courses/${courseId}/reviews`, { rating, review }),
    onSuccess: (_, variables) => {
      // 강의 상세 정보 무효화 (리뷰 추가)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.detail(variables.courseId) 
      });
    },
  });
}

/**
 * 강의 북마크 토글 뮤테이션 훅
 */
export function useToggleCourseBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (courseId: string) => 
      apiPost(`/api/courses/${courseId}/bookmark`, {}),
    onSuccess: (_, courseId) => {
      // 강의 상세 정보 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.detail(courseId) 
      });
    },
    // 낙관적 업데이트
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.courses.detail(courseId) 
      });
      
      const previousCourse = queryClient.getQueryData<Course>(
        queryKeys.courses.detail(courseId)
      );
      
      if (previousCourse) {
        const courseWithBookmark = previousCourse as Course & { isBookmarked?: boolean };
        queryClient.setQueryData(
          queryKeys.courses.detail(courseId),
          {
            ...courseWithBookmark,
            isBookmarked: !courseWithBookmark.isBookmarked,
          }
        );
      }
      
      return { previousCourse };
    },
    onError: (_err, courseId, context) => {
      if (context?.previousCourse) {
        queryClient.setQueryData(
          queryKeys.courses.detail(courseId),
          context.previousCourse
        );
      }
    },
  });
}

/**
 * 강의 추천 목록 쿼리 훅
 */
export function useRecommendedCourses() {
  return useQuery({
    queryKey: ['courses', 'recommended'],
    queryFn: () => apiGet('/api/courses/recommended'),
    staleTime: 30 * 60 * 1000, // 30분
    gcTime: 60 * 60 * 1000, // 1시간
  });
}