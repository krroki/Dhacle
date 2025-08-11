'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SimpleCourse } from '@/types/simple-course.types';
import SimplePurchaseCard from './SimplePurchaseCard';
import SimpleCourseTabs from './SimpleCourseTabs';
import SimpleContentRenderer from './SimpleContentRenderer';

interface SimpleCourseDetailProps {
  course: SimpleCourse;
}

export default function SimpleCourseDetail({ course }: SimpleCourseDetailProps) {
  const [activeTab, setActiveTab] = useState<'intro' | 'curriculum' | 'faq'>('intro');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* 2-컬럼 레이아웃 */}
        <div className="lg:grid lg:grid-cols-[65%_35%] lg:gap-8">
          {/* 왼쪽: 메인 콘텐츠 */}
          <div className="mb-8 lg:mb-0">
            {/* 강의 제목 */}
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              {course.title}
            </h1>
            
            {/* 부제목 */}
            <p className="text-lg text-gray-600 mb-8">
              {course.subtitle}
            </p>
            
            {/* 미리보기 이미지 */}
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-8">
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* 강의 상세 설명 - 콘텐츠 블록 렌더링 */}
            <div className="mb-12">
              <div className="space-y-6">
                {course.content_blocks.map((block) => (
                  <SimpleContentRenderer key={block.id} block={block} />
                ))}
              </div>
            </div>
            
            {/* 탭 메뉴 */}
            <SimpleCourseTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              course={course}
            />
          </div>
          
          {/* 오른쪽: 구매 카드 (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <SimplePurchaseCard course={course} />
            </div>
          </div>
        </div>
      </div>
      
      {/* 모바일: 하단 고정 구매 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg lg:hidden z-50">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {course.price.toLocaleString()}원
            </div>
            {course.originalPrice && (
              <div className="text-sm text-gray-500 line-through">
                {course.originalPrice.toLocaleString()}원
              </div>
            )}
          </div>
          {course.discountRate && (
            <div className="text-red-500 font-semibold">
              {course.discountRate}% 할인
            </div>
          )}
        </div>
        <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          지금 구매하기
        </button>
      </div>
    </div>
  );
}