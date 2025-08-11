'use client';

import React from 'react';
import { StripeTypography, StripeGradient } from '@/components/design-system';
import { EnhancedCourse } from '@/types/course-detail.types';
import { Clock, Users, ChevronRight } from 'lucide-react';

interface CourseHeroSectionProps {
  course: EnhancedCourse;
}

export default function CourseHeroSection({ course }: CourseHeroSectionProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Gradient Background - 더 임팩트있게 */}
      <div className="absolute inset-0">
        <StripeGradient variant="hero" className="opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/30" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb - 심플하게 */}
          <div className="flex items-center gap-2 text-sm text-white/80 mb-6">
            <a href="/" className="hover:text-white transition-colors">홈</a>
            <ChevronRight size={16} />
            <a href="/courses" className="hover:text-white transition-colors">강의</a>
            <ChevronRight size={16} />
            {course.category && (
              <>
                <a href={`/courses?category=${course.category}`} className="hover:text-white transition-colors">
                  {course.category}
                </a>
                <ChevronRight size={16} />
              </>
            )}
            <span className="text-white font-medium">{course.title}</span>
          </div>

          {/* Title & Description */}
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              {course.title}
            </h1>
            
            {course.description && (
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                {course.description}
              </p>
            )}

            {/* Key Info - 심플하고 핵심만 */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              {/* Duration */}
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Clock size={18} className="text-white" />
                <span className="text-white font-medium">
                  {course.duration_weeks}주 완성
                </span>
              </div>

              {/* Students (if significant) */}
              {course.student_count > 100 && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Users size={18} className="text-white" />
                  <span className="text-white font-medium">
                    {course.student_count.toLocaleString('ko-KR')}명 수강중
                  </span>
                </div>
              )}

              {/* Premium Badge */}
              {course.is_premium && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  PREMIUM
                </div>
              )}
            </div>

            {/* Instructor Info - 더 프로페셔널하게 */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 inline-flex">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {course.instructor_name.charAt(0)}
              </div>
              <div>
                <p className="text-white/80 text-sm">강사</p>
                <p className="text-white font-bold text-lg">{course.instructor_name}</p>
                <p className="text-white/70 text-sm">YouTube 전문가</p>
              </div>
            </div>

            {/* Tags - 더 모던하게 */}
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {course.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-medium hover:bg-white/30 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
    </div>
  );
}