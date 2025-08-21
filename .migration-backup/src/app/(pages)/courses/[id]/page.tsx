import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import type React from 'react';
import { getCourseDetail } from '@/lib/api/courses';
import { siteConfig } from '@/lib/config/site';
import { mapCourse } from '@/lib/utils/type-mappers';
import { CourseDetailClient } from './components/CourseDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: courseId } = await params;
  const courseData = await getCourseDetail(courseId);

  if (!courseData) {
    return {
      title: '강의를 찾을 수 없습니다',
      description: '요청하신 강의를 찾을 수 없습니다.',
    };
  }

  const { course: rawCourse } = courseData;
  const course = mapCourse(rawCourse);

  return {
    title: `${course.title} - YouTube Shorts 제작 강의`,
    description:
      course.description || `${course.title} 강의로 YouTube Shorts 제작 전문가가 되어보세요.`,
    keywords: [
      course.title,
      'YouTube Shorts',
      '동영상 제작',
      course.instructorName || '전문가',
      course.difficulty || 'beginner',
    ],
    alternates: {
      canonical: `${siteConfig.url}/courses/${course.id}`,
    },
    openGraph: {
      title: course.title,
      description: course.description || `${course.title} 강의 - 디하클`,
      url: `${siteConfig.url}/courses/${course.id}`,
      type: 'website',
      images: [
        {
          url: course.thumbnail_url || `${siteConfig.url}${siteConfig.ogImage.default}`,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: course.title,
      description: course.description || `${course.title} 강의 - 디하클`,
      images: [course.thumbnail_url || `${siteConfig.url}${siteConfig.ogImage.default}`],
    },
  };
}

export default async function CourseDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id: courseId } = await params;
  const courseData = await getCourseDetail(courseId);

  if (!courseData) {
    notFound();
  }

  const { course: rawCourse, lessons } = courseData;
  const course = mapCourse(rawCourse);

  // 구조화된 데이터 - Course Schema
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}${siteConfig.icons.icon512}`,
    },
    instructor: {
      '@type': 'Person',
      name: course.instructorName || '디하클 전문강사',
      description: course.instructorName || 'YouTube Shorts 전문강사',
      image: course.thumbnail_url,
    },
    url: `https://dhacle.com/courses/${course.id}`,
    courseMode: 'online',
    educationalLevel: course.difficulty || 'beginner',
    inLanguage: 'ko-KR',
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: course.totalDuration ? `PT${course.totalDuration}H` : undefined,
    },
    offers: {
      '@type': 'Offer',
      price: course.price || 0,
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
      url: `${siteConfig.url}/courses/${course.id}`,
      validFrom: course.created_at,
    },
    aggregateRating: course.averageRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: course.averageRating,
          reviewCount: course.reviewCount || 0,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    syllabusSections: lessons?.map((lesson) => ({
      '@type': 'Syllabus',
      name: lesson.title,
      description: lesson.description,
    })),
  };

  // Breadcrumb 구조화된 데이터
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: siteConfig.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '강의',
        item: `${siteConfig.url}/courses`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: course.title,
        item: `${siteConfig.url}/courses/${course.id}`,
      },
    ],
  };

  return (
    <>
      {/* 구조화된 데이터 (JSON-LD) */}
      <Script
        id="course-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <CourseDetailClient courseData={courseData} />
    </>
  );
}
