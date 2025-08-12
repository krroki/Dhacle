'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Course } from '@/types/course-system.types';
import { StripeCard } from '@/components/design-system';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  
  const formatPrice = (price: number) => {
    if (price === 0) return '무료';
    return `₩${price.toLocaleString()}`;
  };

  const getDurationText = (weeks: number) => {
    return `${weeks}주 과정`;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: { text: '오픈 예정', color: '#ec4899' },
      active: { text: '진행 중', color: '#7c3aed' },
      completed: { text: '종료', color: '#6b7280' }
    };
    
    const badge = badges[status as keyof typeof badges] || badges.upcoming;
    
    return (
      <span
        className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium text-white z-10"
        style={{ backgroundColor: badge.color }}
      >
        {badge.text}
      </span>
    );
  };

  return (
    <Link href={`/courses/${course.id}`}>
      <StripeCard variant="bordered" className="h-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer">
        <div className="relative">
          {getStatusBadge(course.status)}
          
          {/* Thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100">
            {course.thumbnail_url ? (
              <Image
                src={course.thumbnail_url}
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-500 to-pink-500">
                <span className="text-white text-4xl font-bold">
                  {course.title.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          {/* Badge Icon */}
          {course.badge_icon_url && (
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-white rounded-full p-1 shadow-lg">
              <Image
                src={course.badge_icon_url}
                alt="Badge"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2" style={{ color: '#1a1a1a' }}>
            {course.title}
          </h3>
          
          <p className="text-sm mb-4 line-clamp-2" style={{ color: '#6b7280' }}>
            {course.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm" style={{ color: '#6b7280' }}>
            <span>강사: {course.instructor_name}</span>
            <span>•</span>
            <span>{getDurationText(course.duration_weeks)}</span>
          </div>
          
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold" style={{ color: course.price === 0 ? '#7c3aed' : '#1a1a1a' }}>
                {formatPrice(course.price)}
              </span>
              
              {course.is_premium && (
                <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-semibold rounded-full">
                  PREMIUM
                </span>
              )}
            </div>
          </div>
        </div>
      </StripeCard>
    </Link>
  );
}