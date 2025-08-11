import React from 'react';
import Link from 'next/link';
import { StripeTypography, StripeButton, StripeCard } from '@/components/design-system';

export default function CoursesPage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <StripeTypography variant="h1" color="dark" className="mb-4">
          디하클 강의 센터
        </StripeTypography>
        <StripeTypography variant="body" color="muted" className="mb-8 max-w-2xl mx-auto">
          유튜브 쇼츠 크리에이터가 되기 위한 체계적인 교육 프로그램
        </StripeTypography>
      </div>
      
      {/* Course Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
        {/* Free Courses */}
        <Link href="/courses/free">
          <StripeCard variant="elevated" className="h-full hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">🎬</span>
              </div>
              
              <StripeTypography variant="h2" color="dark" className="mb-4">
                무료 강의
              </StripeTypography>
              
              <StripeTypography variant="body" color="muted" className="mb-6">
                쇼츠 제작의 기초부터 시작하세요. 초보자를 위한 무료 강의로 기본기를 탄탄히 다질 수 있습니다.
              </StripeTypography>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-700">기초 이론과 개념</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-700">편집 도구 사용법</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-700">알고리즘 이해</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-700">콘텐츠 기획</span>
                </li>
              </ul>
              
              <StripeButton variant="secondary" fullWidth>
                무료 강의 둘러보기 →
              </StripeButton>
            </div>
          </StripeCard>
        </Link>
        
        {/* Premium Courses */}
        <Link href="/courses/premium">
          <StripeCard variant="gradient" className="h-full hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">👑</span>
              </div>
              
              <StripeTypography variant="h2" color="dark" className="mb-4">
                프리미엄 강의
              </StripeTypography>
              
              <StripeTypography variant="body" color="muted" className="mb-6">
                전문가의 노하우를 배우고 수익화를 실현하세요. 실전 경험과 1:1 코칭을 제공합니다.
              </StripeTypography>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">✓</span>
                  <span className="text-gray-700">수익화 전략</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">✓</span>
                  <span className="text-gray-700">브랜딩 & 마케팅</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">✓</span>
                  <span className="text-gray-700">1:1 피드백</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">✓</span>
                  <span className="text-gray-700">수료 뱃지 발급</span>
                </li>
              </ul>
              
              <StripeButton variant="primary" fullWidth>
                프리미엄 강의 둘러보기 →
              </StripeButton>
            </div>
          </StripeCard>
        </Link>
      </div>
      
      {/* Stats Section */}
      <div className="bg-gray-50 rounded-2xl p-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">1,234+</div>
            <div className="text-gray-600">수강생</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
            <div className="text-gray-600">만족도</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">24개</div>
            <div className="text-gray-600">강의 수</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">12명</div>
            <div className="text-gray-600">전문 강사</div>
          </div>
        </div>
      </div>
      
      {/* Instructor Section */}
      <div className="text-center mb-16">
        <StripeTypography variant="h2" color="dark" className="mb-4">
          검증된 전문가와 함께하세요
        </StripeTypography>
        <StripeTypography variant="body" color="muted" className="mb-8 max-w-2xl mx-auto">
          실제 수익을 창출하고 있는 현직 크리에이터들이 직접 강의합니다.
        </StripeTypography>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {['김철수', '이영희', '박지민', '최준호'].map((name) => (
            <div key={name} className="text-center">
              <div className="w-24 h-24 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {name[0]}
              </div>
              <div className="font-medium">{name}</div>
              <div className="text-sm text-gray-500">전문 강사</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="text-center py-12 px-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
        <StripeTypography variant="h2" color="dark" className="mb-4">
          지금 시작하세요
        </StripeTypography>
        <StripeTypography variant="body" color="muted" className="mb-8 max-w-2xl mx-auto">
          당신의 유튜브 쇼츠 여정을 디하클과 함께 시작해보세요.
        </StripeTypography>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/courses/free">
            <StripeButton variant="secondary" size="lg">
              무료로 시작하기
            </StripeButton>
          </Link>
          <Link href="/courses/premium">
            <StripeButton variant="gradient" size="lg">
              프리미엄 강의 보기
            </StripeButton>
          </Link>
        </div>
      </div>
    </div>
  );
}