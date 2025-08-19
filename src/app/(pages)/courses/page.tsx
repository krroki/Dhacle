// Server Component - 강의 목록 페이지
import React from 'react';
import { Metadata } from 'next';
import Script from 'next/script';
import { getCourses, getUniqueInstructors } from '@/lib/api/courses';
import { CourseGrid } from './components/CourseGrid';
import { InstructorFilter } from './components/InstructorFilter';

// 메타데이터 설정
export const metadata: Metadata = {
  title: '전체 강의 - YouTube Shorts 제작 교육',
  description: 'YouTube Shorts 전문가들이 제작한 체계적인 커리큘럼. 기초부터 고급까지 단계별 학습 프로그램을 만나보세요.',
  keywords: ['YouTube Shorts 강의', '동영상 편집 강의', '콘텐츠 제작 교육', '크리에이터 강의', '온라인 강의'],
  alternates: {
    canonical: 'https://dhacle.com/courses',
  },
  openGraph: {
    title: '전체 강의 - 디하클',
    description: 'YouTube Shorts 전문가들의 체계적인 교육 프로그램',
    url: 'https://dhacle.com/courses',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '디하클 강의 목록',
      },
    ],
  },
};

// 동적 렌더링 설정 (Supabase cookies 사용으로 인한 필수 설정)
export const dynamic = 'force-dynamic';

export default async function CoursesPage(): Promise<React.JSX.Element> {
  // 서버에서 데이터 가져오기
  const coursesData = await getCourses();
  const instructors = await getUniqueInstructors();

  // 구조화된 데이터 - 강의 목록
  const courseListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'YouTube Shorts 제작 강의 목록',
    description: 'YouTube Shorts 크리에이터를 위한 전문 교육 과정',
    numberOfItems: coursesData.courses.length,
    itemListElement: coursesData.courses.map((course, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Course',
        name: course.title,
        description: course.description,
        provider: {
          '@type': 'Organization',
          name: '디하클',
          url: 'https://dhacle.com',
        },
        url: `https://dhacle.com/courses/${course.id}`,
        courseMode: 'online',
        educationalLevel: course.difficulty || 'beginner',
        inLanguage: 'ko-KR',
        offers: {
          '@type': 'Offer',
          price: course.price || 0,
          priceCurrency: 'KRW',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  return (
    <>
      {/* 구조화된 데이터 (JSON-LD) */}
      <Script
        id="course-list-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseListSchema) }}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">전체 강의</h1>
        <p className="text-muted-foreground">
          YouTube Shorts 전문가들이 제작한 체계적인 커리큘럼으로 학습하세요.
        </p>
      </div>

      {/* 필터 (Client Component) */}
      <InstructorFilter instructors={instructors} />

      {/* 강의 그리드 (Client Component) */}
      <CourseGrid initialCourses={coursesData.courses} />
    </div>
    </>
  );
}