'use client';

import React from 'react';
import { CourseTab } from '@/types/course-detail.types';

interface CourseTabMenuProps {
  activeTab: CourseTab;
  onTabChange: (tab: CourseTab) => void;
  reviewCount?: number;
  qnaCount?: number;
}

export default function CourseTabMenu({
  activeTab,
  onTabChange,
  reviewCount = 0,
  qnaCount = 0
}: CourseTabMenuProps) {
  const tabs: Array<{ id: CourseTab; label: string; count?: number }> = [
    { id: 'intro', label: '강의소개' },
    { id: 'curriculum', label: '커리큘럼' },
    { id: 'reviews', label: '수강평', count: reviewCount },
    { id: 'qna', label: 'Q&A', count: qnaCount }
  ];

  return (
    <div className="border-b border-gray-200 mb-8">
      {/* Desktop Tab Menu */}
      <div className="hidden md:flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              pb-4 px-2 font-medium text-base transition-colors relative
              ${activeTab === tab.id 
                ? 'text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile Tab Menu - Horizontal Scroll */}
      <div className="md:hidden overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                pb-4 px-2 font-medium text-sm transition-colors relative whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 text-xs text-gray-500">
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}