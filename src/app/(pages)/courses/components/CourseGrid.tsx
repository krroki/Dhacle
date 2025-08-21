'use client';

import { useCallback, useEffect, useState } from 'react';
import { safeAccess } from '@/lib/utils/type-mappers';
import type { Course, CourseFilters } from '@/types/course';
import { CourseCard } from './CourseCard';

interface CourseGridProps {
  initialCourses: Course[];
  filters?: CourseFilters;
}

export function CourseGrid({ initialCourses, filters }: CourseGridProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [loading, setLoading] = useState(false);

  const filterCourses = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // 클라이언트 사이드 필터링
      let filtered = [...initialCourses];

      if (filters?.instructor) {
        filtered = filtered.filter(
          (c) => safeAccess(c, 'instructor_name', 'instructor_name', '') === filters.instructor
        );
      }
      if (filters?.is_free !== undefined) {
        filtered = filtered.filter(
          (c) => safeAccess(c, 'is_free', 'is_free', false) === filters.is_free
        );
      }
      if (filters?.rating !== undefined) {
        filtered = filtered.filter(
          (c) => safeAccess(c, 'average_rating', 'average_rating', 0) >= filters.rating!
        );
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.title.toLowerCase().includes(searchLower) ||
            c.description?.toLowerCase().includes(searchLower)
        );
      }

      setCourses(filtered);
    } finally {
      setLoading(false);
    }
  }, [initialCourses, filters]);

  // 필터 변경 시 강의 목록 갱신
  useEffect(() => {
    if (filters) {
      filterCourses();
    }
  }, [filters, filterCourses]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={`skeleton-${i}`} className="animate-pulse">
            <div className="bg-gray-200 aspect-video rounded-t-lg" />
            <div className="p-4 space-y-3 bg-white rounded-b-lg">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-6 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-6 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">조건에 맞는 강의가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
