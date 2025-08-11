import React from 'react';
import Link from 'next/link';
import CourseList from '@/components/courses/CourseList';
import { StripeTypography, StripeButton } from '@/components/design-system';

export default function PremiumCoursesPage() {
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
          프리미엄 강의
        </StripeTypography>
        
        <StripeTypography variant="body" color="muted" className="mb-6">
          전문가의 노하우를 담은 프리미엄 강의로 수익화의 지름길을 찾아보세요. 실전 경험과 체계적인 커리큘럼을 제공합니다.
        </StripeTypography>
        
        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-200">
          <Link href="/courses/free">
            <button className="pb-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 transition-colors">
              무료 강의
            </button>
          </Link>
          <Link href="/courses/premium">
            <button className="pb-4 px-2 border-b-2 border-purple-600 text-purple-600 font-medium">
              프리미엄 강의
            </button>
          </Link>
        </div>
      </div>
      
      {/* Premium Benefits */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold mb-1">실전 노하우</h3>
            <p className="text-sm opacity-90">현직 크리에이터의 검증된 방법론</p>
          </div>
          <div>
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-semibold mb-1">1:1 피드백</h3>
            <p className="text-sm opacity-90">강사의 개인 맞춤형 코칭</p>
          </div>
          <div>
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="font-semibold mb-1">수료 뱃지</h3>
            <p className="text-sm opacity-90">프로필에 표시되는 전문가 인증</p>
          </div>
          <div>
            <div className="text-3xl mb-2">📚</div>
            <h3 className="font-semibold mb-1">추가 자료</h3>
            <p className="text-sm opacity-90">템플릿, 체크리스트 등 독점 제공</p>
          </div>
        </div>
      </div>
      
      {/* Course List */}
      <CourseList isPremium={true} />
      
      {/* FAQ Section */}
      <div className="mt-16">
        <StripeTypography variant="h3" color="dark" className="mb-6 text-center">
          자주 묻는 질문
        </StripeTypography>
        
        <div className="space-y-4 max-w-3xl mx-auto">
          <details className="p-4 border border-gray-200 rounded-lg">
            <summary className="cursor-pointer font-medium">환불 정책은 어떻게 되나요?</summary>
            <p className="mt-2 text-gray-600">
              수강 시작 후 7일 이내, 전체 강의의 30% 미만 수강 시 100% 환불이 가능합니다.
            </p>
          </details>
          
          <details className="p-4 border border-gray-200 rounded-lg">
            <summary className="cursor-pointer font-medium">수료증은 어떻게 발급되나요?</summary>
            <p className="mt-2 text-gray-600">
              전체 강의의 80% 이상 수강 완료 시 자동으로 수료증과 뱃지가 발급됩니다.
            </p>
          </details>
          
          <details className="p-4 border border-gray-200 rounded-lg">
            <summary className="cursor-pointer font-medium">강의 유효기간이 있나요?</summary>
            <p className="mt-2 text-gray-600">
              구매일로부터 1년간 무제한 수강이 가능합니다. 이후에도 다운로드 받은 자료는 계속 이용 가능합니다.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}