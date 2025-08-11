'use client';

import React from 'react';
import { SimpleCourse } from '@/types/simple-course.types';

interface SimplePurchaseCardProps {
  course: SimpleCourse;
}

export default function SimplePurchaseCard({ course }: SimplePurchaseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* 가격 정보 */}
      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900">
          {course.price.toLocaleString()}원
        </div>
        {course.originalPrice && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-400 line-through text-lg">
              {course.originalPrice.toLocaleString()}원
            </span>
            {course.discountRate && (
              <span className="text-red-500 font-semibold">
                {course.discountRate}% 할인
              </span>
            )}
          </div>
        )}
      </div>

      {/* 구매 버튼 */}
      <button className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors mb-4">
        지금 구매하기
      </button>

      <button className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors">
        장바구니 담기
      </button>

      {/* 구분선 */}
      <hr className="my-6 border-gray-200" />

      {/* 포함 사항 */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">포함 사항</h3>
        <ul className="space-y-3">
          {course.includedItems.map((item, index) => (
            <li key={index} className="flex items-start">
              <svg 
                className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
              <span className="text-gray-700 text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 구분선 */}
      <hr className="my-6 border-gray-200" />

      {/* 수강 기한 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">수강 기한</span>
          <span className="font-semibold text-gray-900">{course.duration}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">난이도</span>
          <span className="font-semibold text-gray-900">입문자용</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">수료증</span>
          <span className="font-semibold text-gray-900">발급 가능</span>
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">💡 안심하고 수강하세요!</span><br />
          7일 이내 10% 미만 수강 시 전액 환불 가능합니다.
        </p>
      </div>
    </div>
  );
}