'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import { SimpleCourse, ContentBlock, CurriculumWeek, FAQ } from '@/types/simple-course.types';
import { StripeTypography } from '@/components/design-system';
import ContentBlockRenderer from './ContentBlockRenderer';

interface CourseMainContentProps {
  course: SimpleCourse;
}

type TabType = 'intro' | 'curriculum' | 'faq';

export default function CourseMainContent({ course }: CourseMainContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('intro');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'intro':
        return (
          <div className="space-y-6">
            {course.content_blocks.map((block) => (
              <ContentBlockRenderer key={block.id} block={block} />
            ))}
          </div>
        );
      
      case 'curriculum':
        return (
          <div className="space-y-8">
            {course.curriculum.map((week) => (
              <div key={week.week} className="border rounded-lg p-6 bg-white">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {week.week}주차: {week.title}
                  </h3>
                  {week.description && (
                    <p className="text-gray-600 mt-1">{week.description}</p>
                  )}
                </div>
                <div className="space-y-3">
                  {week.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <span className="text-gray-900 font-medium">{lesson.title}</span>
                      </div>
                      <span className="text-sm text-gray-500">{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'faq':
        return (
          <div className="space-y-4">
            {course.faqs.map((faq) => (
              <details key={faq.id} className="group border rounded-lg bg-white">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <svg 
                    className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* 상단 정보 */}
      <div className="mb-8">
        <StripeTypography variant="h1" className="mb-4 text-gray-900">
          {course.title}
        </StripeTypography>
        <StripeTypography variant="body" color="muted" className="text-lg mb-6">
          {course.subtitle}
        </StripeTypography>
        
        {/* 미리보기 이미지 */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* 강의 상세 설명 - 모바일에서만 표시 */}
      <div className="lg:hidden mb-8">
        <div className="space-y-6">
          {course.content_blocks.slice(0, 3).map((block) => (
            <ContentBlockRenderer key={block.id} block={block} />
          ))}
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="border-b mb-8">
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('intro')}
            className={`px-6 py-4 font-medium whitespace-nowrap transition-colors relative ${
              activeTab === 'intro'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            강의소개
            {activeTab === 'intro' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`px-6 py-4 font-medium whitespace-nowrap transition-colors relative ${
              activeTab === 'curriculum'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            커리큘럼
            {activeTab === 'curriculum' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-6 py-4 font-medium whitespace-nowrap transition-colors relative ${
              activeTab === 'faq'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            FAQ
            {activeTab === 'faq' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
}