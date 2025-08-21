// 사이트 설정 및 메타데이터
export const siteConfig = {
  // 기본 정보
  name: '디하클',
  nameEn: 'Dhacle',
  description: 'YouTube Shorts 크리에이터를 위한 교육 및 커뮤니티 플랫폼',
  descriptionEn: 'Education and Community Platform for YouTube Shorts Creators',

  // URL 설정 - 환경변수 우선, 없으면 dhacle.com 사용
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://dhacle.com',
  domain: 'dhacle.com',

  // SEO 키워드
  keywords: [
    'YouTube Shorts',
    '유튜브 쇼츠',
    '숏폼',
    '크리에이터 교육',
    '동영상 제작',
    '수익화',
    '디하클',
    'Dhacle',
    '온라인 강의',
    '크리에이터 커뮤니티',
  ],

  // 작성자 정보
  author: {
    name: '디하클',
    email: 'contact@dhacle.com',
    twitter: '@dhacle',
  },

  // 소셜 미디어
  social: {
    twitter: 'https://twitter.com/dhacle',
    instagram: 'https://instagram.com/dhacle',
    youtube: 'https://youtube.com/@dhacle',
    naverCafe: 'https://cafe.naver.com/dhacle',
  },

  // OG 이미지 설정
  ogImage: {
    default: '/images/og-default.png',
    width: 1200,
    height: 630,
  },

  // 파비콘 및 아이콘
  icons: {
    favicon: '/favicon.ico',
    icon16: '/icon-16.png',
    icon32: '/icon-32.png',
    icon192: '/icon-192.png',
    icon512: '/icon-512.png',
    apple: '/apple-touch-icon.png',
  },

  // 사이트맵 설정
  sitemap: {
    // 캐싱 시간 (초 단위) - 1시간
    cacheTime: 3600,
    // 최대 동적 페이지 수
    maxDynamicPages: 100,
    // 우선순위 설정
    priorities: {
      home: 1.0,
      courses: 0.9,
      revenueProof: 0.8,
      coursesDetail: 0.7,
      tools: 0.6,
      auth: 0.5,
      mypage: 0.4,
    },
    // 변경 빈도
    changeFrequencies: {
      home: 'daily' as const,
      courses: 'daily' as const,
      revenueProof: 'hourly' as const,
      coursesDetail: 'weekly' as const,
      tools: 'weekly' as const,
      auth: 'monthly' as const,
      mypage: 'weekly' as const,
    },
  },

  // robots.txt 설정
  robots: {
    // 크롤링 차단 경로
    disallow: [
      '/api/',
      '/admin/',
      '/mypage/settings',
      '/_next/',
      '/auth/callback',
      '/auth/error',
      '/payment/success',
      '/payment/cancel',
      '/onboarding',
      '*.json',
      '/_vercel',
    ],
    // 특정 봇 설정
    customBots: {
      googlebot: {
        disallow: ['/api/', '/admin/', '/_next/', '/auth/callback'],
      },
      yeti: {
        // 네이버 검색봇
        disallow: ['/api/', '/admin/', '/_next/'],
      },
      bingbot: {
        disallow: ['/api/', '/admin/', '/_next/'],
      },
    },
  },
};

// 메타데이터 헬퍼 함수
export function getMetadata(page = '') {
  const title = page ? `${page} | ${siteConfig.name}` : siteConfig.name;
  const url = page ? `${siteConfig.url}/${page}` : siteConfig.url;

  return {
    title,
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    url,
    siteName: siteConfig.name,
    author: siteConfig.author.name,
  };
}

// 캐싱 관련 유틸리티
const cache = new Map<string, { data: unknown; timestamp: number }>();

export function getCachedData<T>(key: string, ttl = 3600): T | null {
  const cached = cache.get(key);
  if (!cached) {
    return null;
  }

  const now = Date.now();
  if (now - cached.timestamp > ttl * 1000) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
}

export function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}
