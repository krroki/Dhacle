import { Suspense } from 'react';
import { Metadata } from 'next';
import Script from 'next/script';
import { HeroCarousel } from '@/components/features/home/HeroCarousel';
import { InstructorCategories } from '@/components/features/home/InstructorCategories';
import { RevenueGalleryNew } from '@/components/features/home/RevenueGallery/RevenueGalleryNew';
import { FreeCoursesCarousel } from '@/components/features/home/FreeCoursesCarousel';
import { FreeCoursesSchedule } from '@/components/features/home/FreeCoursesSchedule';
import { NewCoursesCarousel } from '@/components/features/home/NewCoursesCarousel';
import { EbookSection } from '@/components/features/home/EbookSection';
import { FAQSection } from '@/components/features/home/FAQSection';
import {
  HeroSkeleton,
  InstructorCardSkeleton,
  RevenueCardSkeleton,
  CourseCardSkeleton,
  CalendarSkeleton,
  EbookCardSkeleton,
  FAQSkeleton,
} from '@/components/features/home/shared/LoadingSkeletons';

// 메타데이터 설정
export const metadata: Metadata = {
  title: '디하클 - YouTube Shorts 크리에이터 교육 플랫폼',
  description: 'YouTube Shorts 크리에이터를 위한 체계적인 교육과 커뮤니티 플랫폼. 전문가의 노하우로 성공적인 크리에이터가 되세요.',
  keywords: ['YouTube Shorts', '유튜브 쇼츠', '크리에이터 교육', '동영상 편집', '콘텐츠 제작', '수익화'],
  alternates: {
    canonical: 'https://dhacle.com',
  },
  openGraph: {
    title: '디하클 - YouTube Shorts 크리에이터 교육 플랫폼',
    description: 'YouTube Shorts 크리에이터를 위한 체계적인 교육과 커뮤니티 플랫폼',
    url: 'https://dhacle.com',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '디하클 - YouTube Shorts 크리에이터 교육 플랫폼',
      },
    ],
  },
};

// 구조화된 데이터 (JSON-LD)
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '디하클',
  alternateName: 'Dhacle',
  url: 'https://dhacle.com',
  logo: 'https://dhacle.com/icon-512.png',
  description: 'YouTube Shorts 크리에이터를 위한 교육 플랫폼',
  sameAs: [
    // 소셜 미디어 링크 추가 시 여기에 입력
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: 'Korean',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '디하클',
  url: 'https://dhacle.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://dhacle.com/courses?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const educationalOrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: '디하클',
  description: 'YouTube Shorts 크리에이터 전문 교육 기관',
  url: 'https://dhacle.com',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'KR',
  },
};

export default function HomePage() {
  return (
    <>
      {/* 구조화된 데이터 (JSON-LD) */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="educational-organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalOrganizationSchema) }}
      />
      
      <div className="w-full">
        {/* Hero Carousel Section */}
        <Suspense fallback={<HeroSkeleton />}>
          <HeroCarousel />
        </Suspense>

      {/* Revenue Gallery Section - 실제 데이터 사용 */}
      <Suspense 
        fallback={
          <div className="py-12 bg-muted/30">
            <div className="container-responsive">
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                  <RevenueCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <RevenueGalleryNew />
      </Suspense>

      {/* Free Courses Carousel Section */}
      <Suspense 
        fallback={
          <div className="py-12 container-responsive">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <FreeCoursesCarousel />
      </Suspense>

      {/* Free Courses Schedule Section */}
      <Suspense fallback={<CalendarSkeleton />}>
        <FreeCoursesSchedule />
      </Suspense>

      {/* New Courses Carousel Section */}
      <Suspense 
        fallback={
          <div className="py-12 container-responsive">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <NewCoursesCarousel />
      </Suspense>

      {/* Ebook Section */}
      <Suspense 
        fallback={
          <div className="py-12 bg-muted/30">
            <div className="container-responsive">
              <div className="grid grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <EbookCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <EbookSection />
      </Suspense>

      {/* Instructor Categories Section */}
      <Suspense 
        fallback={
          <div className="py-12 container-responsive">
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <InstructorCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <InstructorCategories />
      </Suspense>

      {/* FAQ Section */}
      <Suspense fallback={<FAQSkeleton />}>
        <FAQSection />
      </Suspense>
    </div>
    </>
  );
}