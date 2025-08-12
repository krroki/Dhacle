'use client';

import React, { useState } from 'react';
import { EnhancedCourse, CourseTab } from '@/types/course-detail.types';
import CourseHeroSection from './CourseHeroSection';
import CourseTabMenu from './CourseTabMenu';
import CourseContentRenderer from './CourseContentRenderer';
import CoursePurchaseCard from './CoursePurchaseCard';
import { StripeButton, StripeTypography } from '@/components/design-system';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';

interface CourseDetailLayoutProps {
  course: EnhancedCourse;
  isEnrolled?: boolean;
}

export default function CourseDetailLayout({ 
  course, 
  isEnrolled = false 
}: CourseDetailLayoutProps) {
  const [activeTab, setActiveTab] = useState<CourseTab>('intro');
  const { user } = useAuth();
  const router = useRouter();

  const handleEnroll = () => {
    if (!user) {
      router.push('/login?redirect=/courses/' + course.id);
      return;
    }
    
    // TODO: 실제 수강 신청 로직
    console.log('Enrolling in course:', course.id);
  };

  const handlePreview = () => {
    // TODO: 미리보기 모달 열기
    console.log('Preview video:', course.preview_video_url);
  };

  // 탭별 콘텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'intro':
        return (
          <div>
            {/* 강의 소개 */}
            <CourseContentRenderer blocks={course.content_blocks} />
            
            {/* 학습 목표 */}
            {course.learning_goals && course.learning_goals.length > 0 && (
              <div className="mt-12">
                <StripeTypography variant="h2" color="dark" className="mb-6">
                  🎯 학습 목표
                </StripeTypography>
                <ul className="space-y-3">
                  {course.learning_goals.map((goal, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-purple-600 mt-0.5">✓</span>
                      <span className="text-gray-700">{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* 사전 요구사항 */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="mt-12">
                <StripeTypography variant="h2" color="dark" className="mb-6">
                  📋 사전 요구사항
                </StripeTypography>
                <ul className="space-y-3">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      
      case 'curriculum':
        return (
          <div>
            <StripeTypography variant="h2" color="dark" className="mb-6">
              커리큘럼
            </StripeTypography>
            <p className="text-gray-600">커리큘럼 콘텐츠가 여기에 표시됩니다.</p>
          </div>
        );
      
      case 'reviews':
        return (
          <div>
            <StripeTypography variant="h2" color="dark" className="mb-6">
              수강평
            </StripeTypography>
            <p className="text-gray-600">아직 수강평이 없습니다.</p>
          </div>
        );
      
      case 'qna':
        return (
          <div>
            <StripeTypography variant="h2" color="dark" className="mb-6">
              Q&A
            </StripeTypography>
            <p className="text-gray-600">질문을 등록해주세요.</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <CourseHeroSection course={course} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Content - 65% on desktop */}
          <div className="flex-1 lg:w-[65%]">
            {/* Video/Thumbnail */}
            {course.preview_video_url ? (
              <div className="relative w-full mb-8 rounded-lg overflow-hidden bg-black" 
                   style={{ aspectRatio: '16/9' }}>
                <video
                  src={course.preview_video_url}
                  controls
                  className="absolute inset-0 w-full h-full"
                  poster={course.thumbnail_url || undefined}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : course.thumbnail_url ? (
              <div className="relative w-full mb-8 rounded-lg overflow-hidden"
                   style={{ aspectRatio: '16/9' }}>
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
            
            {/* Tab Menu */}
            <CourseTabMenu
              activeTab={activeTab}
              onTabChange={setActiveTab}
              reviewCount={0}
              qnaCount={0}
            />
            
            {/* Tab Content */}
            <div className="bg-white rounded-lg p-6 md:p-8">
              {renderTabContent()}
            </div>
          </div>
          
          {/* Right Sidebar - 35% on desktop, hidden on mobile */}
          <div className="hidden lg:block lg:w-[35%]">
            <div className="sticky top-24">
              {/* CoursePurchaseCard는 SimpleCourse 타입을 사용하므로 주석 처리 */}
              {/* <CoursePurchaseCard
                course={course}
                isEnrolled={isEnrolled}
                onEnroll={handleEnroll}
                onPreview={handlePreview}
              /> */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">강의 정보</h3>
                <p className="text-gray-600">가격: ₩{course.price.toLocaleString()}</p>
                <button 
                  onClick={handleEnroll}
                  className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  수강 신청하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Fixed Bottom Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50 shadow-lg">
        <div className="flex justify-between items-center mb-2">
          {course.discount_rate > 0 && course.original_price ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  ₩{course.price.toLocaleString()}
                </span>
                <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                  {course.discount_rate}%
                </span>
              </div>
              <span className="text-sm line-through text-gray-500">
                ₩{course.original_price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold">
              {course.price === 0 ? '무료' : `₩${course.price.toLocaleString()}`}
            </span>
          )}
        </div>
        <StripeButton 
          variant="gradient" 
          size="lg" 
          fullWidth
          onClick={handleEnroll}
        >
          {isEnrolled ? '이미 수강 중' : course.price === 0 ? '무료로 수강하기' : '수강 신청하기'}
        </StripeButton>
      </div>
    </div>
  );
}