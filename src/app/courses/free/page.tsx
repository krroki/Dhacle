import React from 'react';
import Link from 'next/link';
import CourseList from '@/components/courses/CourseList';
import { StripeTypography, StripeButton } from '@/components/design-system';

export default function FreeCoursesPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/courses">
            <span className="text-gray-500 hover:text-gray-700 transition-colors">← 뒤로</span>
          </Link>
        </div>
        
        <StripeTypography variant="h1" color="dark" className="mb-4">
          무료 강의
        </StripeTypography>
        
        <StripeTypography variant="body" color="muted" className="mb-6">
          유튜브 쇼츠 제작의 기초를 무료로 배워보세요. 초보자도 쉽게 따라할 수 있는 체계적인 커리큘럼을 제공합니다.
        </StripeTypography>
        
        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-200">
          <Link href="/courses/free">
            <button className="pb-4 px-2 border-b-2 border-purple-600 text-purple-600 font-medium">
              무료 강의
            </button>
          </Link>
          <Link href="/courses/premium">
            <button className="pb-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 transition-colors">
              프리미엄 강의
            </button>
          </Link>
        </div>
      </div>
      
      {/* Course List */}
      <CourseList isPremium={false} />
      
      {/* CTA Section */}
      <div className="mt-16 p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl text-center">
        <StripeTypography variant="h3" color="dark" className="mb-4">
          더 깊이있는 학습을 원하시나요?
        </StripeTypography>
        <StripeTypography variant="body" color="muted" className="mb-6">
          프리미엄 강의에서는 실전 노하우와 수익화 전략을 배울 수 있습니다.
        </StripeTypography>
        <Link href="/courses/premium">
          <StripeButton variant="gradient" size="lg">
            프리미엄 강의 둘러보기
          </StripeButton>
        </Link>
      </div>
    </div>
  );
}