import type { MetadataRoute } from 'next';
import { getCachedData, setCachedData, siteConfig } from '@/lib/config/site';
import { createClient } from '@/lib/supabase/server-client';

// 사이트맵 생성 함수 (캐싱 적용)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const { priorities, changeFrequencies } = siteConfig.sitemap;

  // 캐시 체크
  const cacheKey = 'sitemap-data';
  const cached = getCachedData<MetadataRoute.Sitemap>(cacheKey, siteConfig.sitemap.cacheTime);
  if (cached) {
    return cached;
  }

  const supabase = await createClient();

  // 정적 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: changeFrequencies.home,
      priority: priorities.home,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: changeFrequencies.courses,
      priority: priorities.courses,
    },
    {
      url: `${baseUrl}/revenue-proof`,
      lastModified: new Date(),
      changeFrequency: changeFrequencies.revenueProof,
      priority: priorities.revenueProof,
    },
    {
      url: `${baseUrl}/revenue-proof/ranking`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools/youtube-lens`,
      lastModified: new Date(),
      changeFrequency: changeFrequencies.tools,
      priority: priorities.tools,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 동적 페이지들 - 강의
  const { data: courses } = await supabase
    .from('courses')
    .select('id, updated_at')
    .eq('isPublished', true)
    .order('created_at', { ascending: false });

  const coursePages: MetadataRoute.Sitemap =
    courses?.map((course) => ({
      url: `${baseUrl}/courses/${course.id}`,
      lastModified: new Date(course.updated_at || new Date()),
      changeFrequency: changeFrequencies.coursesDetail,
      priority: priorities.coursesDetail,
    })) || [];

  // 동적 페이지들 - 수익 인증
  const { data: revenueProofs } = await supabase
    .from('revenue_proofs')
    .select('id, updated_at')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(siteConfig.sitemap.maxDynamicPages); // 성능을 위한 제한

  const revenueProofPages: MetadataRoute.Sitemap =
    revenueProofs?.map((proof) => ({
      url: `${baseUrl}/revenue-proof/${proof.id}`,
      lastModified: new Date(proof.updated_at || new Date()),
      changeFrequency: 'weekly',
      priority: 0.5,
    })) || [];

  // 마이페이지 (로그인 필요하지만 SEO를 위해 포함)
  const myPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/mypage`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/mypage/profile`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/mypage/courses`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/mypage/badges`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
    },
  ];

  // 모든 페이지 통합
  const sitemapData = [...staticPages, ...coursePages, ...revenueProofPages, ...myPages];

  // 캐시 저장
  setCachedData(cacheKey, sitemapData);

  return sitemapData;
}
