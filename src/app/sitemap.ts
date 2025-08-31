import type { MetadataRoute } from 'next';
import { getCachedData, setCachedData, siteConfig } from '@/lib/config/site';

// 사이트맵 생성 함수 (캐싱 적용)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base_url = siteConfig.url;
  const { priorities, changeFrequencies } = siteConfig.sitemap;

  // 캐시 체크
  const cache_key = 'sitemap-data';
  const cached = getCachedData<MetadataRoute.Sitemap>(cache_key, siteConfig.sitemap.cacheTime);
  if (cached) {
    return cached;
  }

  // 정적 페이지들
  const static_pages: MetadataRoute.Sitemap = [
    {
      url: base_url,
      lastModified: new Date(),
      changeFrequency: changeFrequencies.home,
      priority: priorities.home,
    },
    {
      url: `${base_url}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${base_url}/tools/youtube-lens`,
      lastModified: new Date(),
      changeFrequency: changeFrequencies.tools,
      priority: priorities.tools,
    },
    {
      url: `${base_url}/tools/revenue-calculator`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${base_url}/tools/thumbnail-maker`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${base_url}/docs/get-api-key`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base_url}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${base_url}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // YouTube 크리에이터 도구 사이트에서는 동적 페이지들이 필요하지 않음
  // YouTube Lens는 클라이언트 사이드 기능으로 동작

  // 사용자 관련 페이지들 (YouTube 크리에이터 도구 사이트)
  const user_pages: MetadataRoute.Sitemap = [
    {
      url: `${base_url}/settings/api-keys`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 모든 페이지 통합
  const sitemap_data = [...static_pages, ...user_pages];

  // 캐시 저장
  setCachedData(cache_key, sitemap_data);

  return sitemap_data;
}
