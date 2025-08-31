import type { Metadata } from 'next';
import Script from 'next/script';
import { Suspense } from 'react';
import { FAQSection } from '@/components/features/home/FAQSection';
import { HeroCarousel } from '@/components/features/home/HeroCarousel';
import { FeaturedToolsSection } from '@/components/features/home/FeaturedToolsSection';
import { AllToolsGrid } from '@/components/features/home/AllToolsGrid';
import {
  FAQSkeleton,
  HeroSkeleton,
  ToolCardSkeleton,
} from '@/components/features/home/shared/LoadingSkeletons';

// 메타데이터 설정 - YouTube 크리에이터 도구 사이트
export const metadata: Metadata = {
  title: '디하클 - YouTube 크리에이터 전용 도구 플랫폼',
  description:
    'YouTube 크리에이터를 위한 전문 도구들. YouTube Lens로 채널 분석, 수익 계산기, 썸네일 제작 도구까지 한 번에 해결하세요.',
  keywords: [
    'YouTube 크리에이터',
    'YouTube 도구',
    '유튜브 분석',
    'YouTube Lens',
    '수익 계산기',
    '썸네일 제작',
    '채널 관리',
    '크리에이터 툴',
  ],
  alternates: {
    canonical: 'https://dhacle.com',
  },
  openGraph: {
    title: '디하클 - YouTube 크리에이터 전용 도구 플랫폼',
    description: 'YouTube 크리에이터를 위한 전문 도구들. YouTube Lens, 수익 계산기, 썸네일 제작까지',
    url: 'https://dhacle.com',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '디하클 - YouTube 크리에이터 전용 도구 플랫폼',
      },
    ],
  },
};

// 구조화된 데이터 (JSON-LD) - YouTube 도구 사이트
const organization_schema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '디하클',
  alternateName: 'Dhacle',
  url: 'https://dhacle.com',
  logo: 'https://dhacle.com/icon-512.png',
  description: 'YouTube 크리에이터를 위한 전문 도구 플랫폼',
  sameAs: [
    // 소셜 미디어 링크 추가 시 여기에 입력
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: 'Korean',
  },
};

const website_schema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '디하클',
  url: 'https://dhacle.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://dhacle.com/tools?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const software_application_schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '디하클',
  applicationCategory: 'BusinessApplication',
  description: 'YouTube 크리에이터를 위한 종합 도구 플랫폼',
  url: 'https://dhacle.com',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
    availability: 'https://schema.org/InStock',
  },
};

export default function HomePage() {
  return (
    <>
      {/* 구조화된 데이터 (JSON-LD) */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization_schema) }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website_schema) }}
      />
      <Script
        id="software-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software_application_schema) }}
      />

      <div className="w-full">
        {/* Hero Carousel Section - 무료특강/공지용 */}
        <Suspense fallback={<HeroSkeleton />}>
          <HeroCarousel />
        </Suspense>

        {/* Featured Tools Section - 주요 도구들 큰 카드 */}
        <Suspense
          fallback={
            <div className="py-12 bg-muted/30">
              <div className="container-responsive">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ToolCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <FeaturedToolsSection />
        </Suspense>

        {/* All Tools Grid Section - 모든 도구 그리드 */}
        <Suspense
          fallback={
            <div className="py-12 container-responsive">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ToolCardSkeleton key={i} />
                ))}
              </div>
            </div>
          }
        >
          <AllToolsGrid />
        </Suspense>

        {/* FAQ Section - 도구 사용법 FAQ */}
        <Suspense fallback={<FAQSkeleton />}>
          <FAQSection />
        </Suspense>
      </div>
    </>
  );
}