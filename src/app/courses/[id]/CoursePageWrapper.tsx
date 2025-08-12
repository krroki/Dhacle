'use client';

import React from 'react';
import { SimpleCourse } from '@/types/simple-course.types';
import CourseMainContent from '@/components/courses/CourseMainContent';
import CoursePurchaseCard from '@/components/courses/CoursePurchaseCard';

interface CoursePageWrapperProps {
  course: SimpleCourse;
}

export default function CoursePageWrapper({ course }: CoursePageWrapperProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* 메인 콘텐츠 영역 */}
          <div className="lg:col-span-2">
            <CourseMainContent course={course} />
          </div>
          
          {/* 구매 카드 영역 - 데스크톱에서만 표시 */}
          <div className="hidden lg:block">
            <CoursePurchaseCard course={course} />
          </div>
        </div>
      </div>
      
      {/* 모바일 하단 구매 버튼 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            {course.discountRate && course.originalPrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  ₩{new Intl.NumberFormat('ko-KR').format(course.price)}
                </span>
                <span className="text-sm line-through text-gray-400">
                  ₩{new Intl.NumberFormat('ko-KR').format(course.originalPrice)}
                </span>
                <span className="text-sm font-medium text-red-600">
                  {course.discountRate}%
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                ₩{new Intl.NumberFormat('ko-KR').format(course.price)}
              </span>
            )}
          </div>
        </div>
        <button className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          {course.price === 0 ? '무료로 시작하기' : '지금 구매하기'}
        </button>
      </div>
    </div>
  );
}