import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';
import { getCourseDetail } from '@/lib/api/courses';
import { CourseDetailClient } from './components/CourseDetailClient';
import { siteConfig } from '@/lib/config/site';

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

  const { course } = courseData;

  return {
    title: `${course.title} - YouTube Shorts 제작 강의`,
    description: course.description || `${course.title} 강의로 YouTube Shorts 제작 전문가가 되어보세요.`,
    keywords: [
      course.title,
      'YouTube Shorts',
      '동영상 제작',
      course.instructor_name || '전문가',
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

export default async function CourseDetailPage({ params }: PageProps) {
  const { id: courseId } = await params;
  const courseData = await getCourseDetail(courseId);

  if (!courseData) {
    notFound();
  }

  const { course, lessons } = courseData;

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
      name: course.instructor_name || '디하클 전문강사',
      description: course.instructor_name || 'YouTube Shorts 전문강사',
      image: course.thumbnail_url
    },
    url: `https://dhacle.com/courses/${course.id}`,
    courseMode: 'online',
    educationalLevel: course.difficulty || 'beginner',
    inLanguage: 'ko-KR',
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: course.duration ? `PT${course.duration}H` : undefined,
    },
    offers: {
      '@type': 'Offer',
      price: course.price || 0,
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
      url: `${siteConfig.url}/courses/${course.id}`,
      validFrom: course.created_at,
    },
    aggregateRating: course.rating ? {
      '@type': 'AggregateRating',
      ratingValue: course.rating,
      reviewCount: course.review_count || 0,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    syllabusSections: modules?.map((module) => ({
      '@type': 'Syllabus',
      name: module.title,
      description: module.description,
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