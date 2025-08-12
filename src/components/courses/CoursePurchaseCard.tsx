'use client';

import React from 'react';
import { SimpleCourse } from '@/types/simple-course.types';
import { StripeButton, StripeCard, StripeTypography } from '@/components/design-system';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';

interface CoursePurchaseCardProps {
  course: SimpleCourse;
}

export default function CoursePurchaseCard({ course }: CoursePurchaseCardProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handlePurchase = async () => {
    if (!user) {
      // 로그인 필요
      router.push('/auth/login?redirect=/courses/' + course.id);
      return;
    }

    // TODO: Stripe 결제 연동
    console.log('Purchase course:', course.id);
    alert('결제 기능은 현재 준비 중입니다.');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <StripeCard variant="elevated" className="sticky top-24">
      <div className="p-6 space-y-6">
        {/* 가격 정보 */}
        <div>
          {course.discountRate && course.originalPrice ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium px-2 py-1 bg-red-100 text-red-600 rounded">
                  {course.discountRate}% 할인
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <StripeTypography variant="h2" className="text-gray-900">
                  ₩{formatPrice(course.price)}
                </StripeTypography>
                <StripeTypography variant="body" className="line-through text-gray-400">
                  ₩{formatPrice(course.originalPrice)}
                </StripeTypography>
              </div>
            </>
          ) : (
            <StripeTypography variant="h2" className="text-gray-900">
              ₩{formatPrice(course.price)}
            </StripeTypography>
          )}
        </div>

        {/* 구매 버튼 */}
        <StripeButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={handlePurchase}
          className="font-semibold"
        >
          {course.price === 0 ? '무료로 시작하기' : '지금 구매하기'}
        </StripeButton>

        {/* 포함 사항 */}
        <div>
          <StripeTypography variant="h4" className="mb-4 text-gray-900">
            포함 사항
          </StripeTypography>
          <ul className="space-y-3">
            {course.includedItems.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <StripeTypography variant="body" className="text-gray-600">
                  {item}
                </StripeTypography>
              </li>
            ))}
          </ul>
        </div>

        {/* 수강 기한 */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <StripeTypography variant="body" className="text-gray-600">
              수강 기한: {course.duration}
            </StripeTypography>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100-4h-.5a1 1 0 000-2H8a2 2 0 012-2zm-2 6a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5zm2-2v5h8v-5H6z"
                clipRule="evenodd"
              />
            </svg>
            <span>수료증 발급 가능</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>무제한 업데이트</span>
          </div>
        </div>

        {/* 문의하기 */}
        <div className="pt-4 border-t">
          <button className="w-full py-3 text-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
            궁금한 점이 있으신가요? 문의하기
          </button>
        </div>
      </div>
    </StripeCard>
  );
}