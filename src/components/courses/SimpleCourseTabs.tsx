'use client';

import React from 'react';
import { SimpleCourse } from '@/types/simple-course.types';

interface SimpleCourseTabsProps {
  activeTab: 'intro' | 'curriculum' | 'faq';
  setActiveTab: (tab: 'intro' | 'curriculum' | 'faq') => void;
  course: SimpleCourse;
}

export default function SimpleCourseTabs({ activeTab, setActiveTab, course }: SimpleCourseTabsProps) {
  const tabs = [
    { id: 'intro' as const, label: '강의소개' },
    { id: 'curriculum' as const, label: '커리큘럼' },
    { id: 'faq' as const, label: 'FAQ' }
  ];

  return (
    <div>
      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="py-8">
        {activeTab === 'intro' && (
          <div className="prose prose-lg max-w-none">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">강의 소개</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              {course.description}
            </p>
            
            <h4 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              이 강의를 통해 얻을 수 있는 것
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-gray-700">유튜브 쇼츠 알고리즘의 완벽한 이해</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-gray-700">바이럴 콘텐츠 제작 노하우</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-gray-700">수익화를 위한 체계적인 전략</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-gray-700">실전에서 바로 활용 가능한 기술</span>
              </li>
            </ul>

            <h4 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              수강 전 준비사항
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">스마트폰 (아이폰 또는 안드로이드)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">기본적인 영상 편집 앱 (무료 앱 사용 가능)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">주 3시간 이상의 학습 시간</span>
              </li>
            </ul>
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">커리큘럼</h3>
            <div className="space-y-6">
              {course.curriculum.map((week) => (
                <div key={week.week} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4">
                    <h4 className="font-semibold text-gray-900">
                      {week.week}주차: {week.title}
                    </h4>
                    {week.description && (
                      <p className="text-sm text-gray-600 mt-1">{week.description}</p>
                    )}
                  </div>
                  <div className="divide-y divide-gray-200">
                    {week.lessons.map((lesson) => (
                      <div key={lesson.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-700">{lesson.title}</span>
                        </div>
                        <span className="text-sm text-gray-500">{lesson.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">자주 묻는 질문</h3>
            <div className="space-y-4">
              {course.faqs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-start">
                    <span className="text-blue-500 mr-2">Q.</span>
                    {faq.question}
                  </h4>
                  <p className="text-gray-700 pl-6">
                    <span className="text-blue-500 mr-2">A.</span>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}