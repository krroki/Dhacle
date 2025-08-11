'use client';

import React, { useEffect, useState } from 'react';
import { StripeButton, StripeCard, StripeTypography } from '@/components/design-system';
import { EnhancedCourse } from '@/types/course-detail.types';
import { Check, Clock, Award, Shield, Users, Play, Flame, TrendingUp, AlertCircle } from 'lucide-react';

interface CoursePurchaseCardProps {
  course: EnhancedCourse;
  isEnrolled?: boolean;
  onEnroll?: () => void;
  onPreview?: () => void;
  className?: string;
}

export default function CoursePurchaseCard({
  course,
  isEnrolled = false,
  onEnroll,
  onPreview,
  className = ''
}: CoursePurchaseCardProps) {
  const hasDiscount = course.discount_rate > 0 && course.original_price;
  const displayPrice = course.price;
  const originalPrice = course.original_price || course.price;
  const [viewingCount, setViewingCount] = useState(48);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });
  
  // 실시간 보는 사람 수 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setViewingCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        const newCount = prev + change;
        return Math.max(30, Math.min(70, newCount)); // 30-70 사이로 제한
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 카운트다운 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const benefits = [
    { icon: Check, text: '평생 무제한 수강' },
    { icon: Award, text: '수료증 발급' },
    { icon: Shield, text: '100% 환불 보장' },
    { icon: TrendingUp, text: '업데이트 평생 제공' }
  ];

  return (
    <>
      {/* Desktop Sticky Card */}
      <div 
        className={`hidden lg:block sticky top-20 ${className}`}
      >
        <StripeCard 
          variant="elevated" 
          className="p-6 shadow-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%)',
            border: '2px solid transparent',
            backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box'
          }}
        >
          {/* 긴급성 메시지 - 할인 중일 때만 표시 */}
          {hasDiscount && (
            <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-red-600">
                <Flame size={18} className="animate-pulse" />
                <span className="text-sm font-bold">
                  {timeLeft.hours}시간 {timeLeft.minutes}분 {timeLeft.seconds}초 남음!
                </span>
              </div>
            </div>
          )}

          {/* 미리보기 버튼 */}
          {course.preview_video_url && (
            <button
              onClick={onPreview}
              className="w-full mb-4 py-3 border-2 border-purple-200 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-50 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <Play size={20} className="text-purple-600" />
              <span className="font-medium text-purple-600">무료 미리보기</span>
            </button>
          )}

          {/* 가격 정보 */}
          <div className="mb-6">
            {hasDiscount ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold rounded-full animate-pulse shadow-lg">
                    {course.discount_rate}% 할인
                  </span>
                </div>
                <div className="text-gray-400 line-through text-lg mb-1">
                  ₩{originalPrice.toLocaleString('ko-KR')}
                </div>
                <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ₩{displayPrice.toLocaleString('ko-KR')}
                </div>
              </>
            ) : (
              <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {course.price === 0 ? '무료' : `₩${displayPrice.toLocaleString('ko-KR')}`}
              </div>
            )}
          </div>

          {/* 수강 신청 버튼 */}
          {isEnrolled ? (
            <StripeButton variant="secondary" size="lg" fullWidth disabled>
              <Check size={20} />
              이미 수강 중
            </StripeButton>
          ) : (
            <StripeButton 
              variant="gradient" 
              size="lg" 
              fullWidth
              onClick={onEnroll}
              className="transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl"
            >
              <span className="text-lg font-bold">
                {course.price === 0 ? '무료로 수강 시작하기' : '지금 수강신청 →'}
              </span>
            </StripeButton>
          )}

          {/* 실시간 보는 사람 */}
          <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white animate-pulse" />
              <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-white animate-pulse delay-75" />
              <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full border-2 border-white animate-pulse delay-150" />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              현재 {viewingCount}명이 보는 중
            </span>
          </div>

          {/* 혜택 리스트 */}
          <div className="mt-6 pt-6 border-t-2 border-gray-100">
            <p className="text-sm font-bold text-gray-900 mb-4">이 강의만의 특별 혜택</p>
            <div className="space-y-3">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex items-center gap-3 group hover:translate-x-1 transition-transform">
                    <div className="w-7 h-7 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-all">
                      <Icon size={16} className="text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{benefit.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 추가 정보 - 간소화 */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">수강 기간</span>
              <span className="font-bold text-purple-600">{course.duration_weeks}주 완성 코스</span>
            </div>
            {course.max_students && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">남은 자리</span>
                <div className="flex items-center gap-1">
                  <AlertCircle size={14} className="text-red-500" />
                  <span className="font-bold text-red-600">
                    {Math.max(5, course.max_students - Math.floor(course.max_students * 0.85))}명만 남음!
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 신뢰 보증 */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-600">
              디하클이 보증하는 검증된 강의
            </p>
            <p className="text-xs font-bold text-gray-800 mt-1">
              불만족 시 100% 환불
            </p>
          </div>
        </StripeCard>
      </div>

      {/* Mobile Bottom Fixed Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 z-50 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                ₩{originalPrice.toLocaleString('ko-KR')}
              </span>
            )}
            <div className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ₩{displayPrice.toLocaleString('ko-KR')}
            </div>
          </div>
          {hasDiscount && (
            <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold rounded-full animate-pulse">
              {course.discount_rate}% 할인
            </span>
          )}
        </div>
        <StripeButton 
          variant="gradient" 
          size="lg" 
          fullWidth
          onClick={onEnroll}
          className="shadow-lg"
        >
          <span className="font-bold text-base">
            {course.price === 0 ? '무료로 수강하기' : '지금 바로 수강신청'}
          </span>
        </StripeButton>
      </div>
    </>
  );
}