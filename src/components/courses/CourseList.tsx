'use client';

import React, { useEffect, useState } from 'react';
import { Course } from '@/types/course-system.types';
import CourseCard from './CourseCard';
import { StripeTypography } from '@/components/design-system';
import { createBrowserClient } from '@/lib/supabase/browser-client';

interface CourseListProps {
  isPremium: boolean;
}

export default function CourseList({ isPremium }: CourseListProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'price' | 'popular'>('latest');
  
  const supabase = createBrowserClient();

  useEffect(() => {
    fetchCourses();
  }, [isPremium, sortBy]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('courses')
        .select('*')
        .eq('is_premium', isPremium);
      
      // Apply sorting
      switch (sortBy) {
        case 'latest':
          query = query.order('launch_date', { ascending: false });
          break;
        case 'price':
          query = query.order('price', { ascending: !isPremium });
          break;
        case 'popular':
          // For now, we'll use launch_date as a proxy for popularity
          // In production, you might have a student_count or rating field
          query = query.order('launch_date', { ascending: false });
          break;
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // For development, use mock data if no courses found
      if (!data || data.length === 0) {
        setCourses(getMockCourses(isPremium));
      } else {
        setCourses(data as Course[]);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('강의를 불러오는 중 오류가 발생했습니다.');
      // Use mock data on error
      setCourses(getMockCourses(isPremium));
    } finally {
      setLoading(false);
    }
  };

  const getMockCourses = (isPremium: boolean): Course[] => {
    const baseCourses: Course[] = [
      {
        id: '1',
        title: isPremium ? '쇼츠 마스터 과정' : '유튜브 쇼츠 입문 과정',
        description: isPremium 
          ? '수익화까지 완벽 정복하는 8주 과정입니다. 전문가가 되어보세요.'
          : '초보자를 위한 4주 완성 과정입니다. 기초부터 차근차근 배워보세요.',
        instructor_name: isPremium ? '이영희' : '김철수',
        thumbnail_url: '/images/courses/course1-thumbnail.jpg',
        badge_icon_url: '/images/badges/badge-master.png',
        duration_weeks: isPremium ? 8 : 4,
        price: isPremium ? 200000 : 0,
        is_premium: isPremium,
        chat_room_url: null,
        launch_date: '2025-02-01',
        status: 'upcoming',
        max_students: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title: isPremium ? '콘텐츠 기획 특강' : '알고리즘 완전정복',
        description: isPremium
          ? '아이디어부터 실행까지, 4주간의 집중 트레이닝'
          : '유튜브 알고리즘의 모든 것을 파헤치는 4주 과정',
        instructor_name: isPremium ? '박지민' : '최준호',
        thumbnail_url: '/images/courses/course2-thumbnail.jpg',
        badge_icon_url: '/images/badges/badge-planning.png',
        duration_weeks: 4,
        price: isPremium ? 50000 : 0,
        is_premium: isPremium,
        chat_room_url: null,
        launch_date: '2025-02-15',
        status: 'active',
        max_students: isPremium ? 50 : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        title: isPremium ? '브랜딩 & 마케팅 전략' : '쇼츠 편집 기초',
        description: isPremium
          ? '개인 브랜드 구축과 마케팅 전략 수립'
          : '모바일로 시작하는 쇼츠 편집의 모든 것',
        instructor_name: isPremium ? '정수진' : '김민수',
        thumbnail_url: '/images/courses/course3-thumbnail.jpg',
        badge_icon_url: '/images/badges/badge-branding.png',
        duration_weeks: isPremium ? 8 : 4,
        price: isPremium ? 150000 : 0,
        is_premium: isPremium,
        chat_room_url: null,
        launch_date: '2025-03-01',
        status: 'upcoming',
        max_students: isPremium ? 30 : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    return baseCourses;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <StripeTypography variant="body" color="muted">
          {error}
        </StripeTypography>
      </div>
    );
  }

  return (
    <div>
      {/* Sort Options */}
      <div className="flex justify-between items-center mb-8">
        <StripeTypography variant="h3" color="dark">
          {isPremium ? '프리미엄 강의' : '무료 강의'} ({courses.length}개)
        </StripeTypography>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">정렬:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="latest">최신순</option>
            <option value="price">{isPremium ? '가격 높은순' : '인기순'}</option>
            <option value="popular">수강생 많은순</option>
          </select>
        </div>
      </div>
      
      {/* Course Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <StripeTypography variant="body" color="muted">
            현재 등록된 강의가 없습니다.
          </StripeTypography>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}