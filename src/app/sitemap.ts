import type { MetadataRoute } from 'next';
import { getCachedData, setCachedData, siteConfig } from '@/lib/config/site';
import { createClient } from '@/lib/supabase/server-client';

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

  const supabase = await createClient();

  // 정적 페이지들
  const static_pages: MetadataRoute.Sitemap = [
    {
      url: base_url,
      lastModified: new Date(),
      changeFrequency: changeFrequencies.home,
      priority: priorities.home,
    },
    {
      url: `${base_url}/courses`,
      lastModified: new Date(),
      changeFrequency: changeFrequencies.courses,
      priority: priorities.courses,
    },
    {
      url: `${base_url}/revenue-proof`,
      lastModified: new Date(),
      changeFrequency: changeFrequencies.revenueProof,
      priority: priorities.revenueProof,
    },
    {
      url: `${base_url}/revenue-proof/ranking`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.7,
    },
    {
      url: `${base_url}/tools/youtube-lens`,
      lastModified: new Date(),
      changeFrequency: changeFrequencies.tools,
      priority: priorities.tools,
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

  // 동적 페이지들 - 강의
  const { data: courses } = await supabase
    .from('courses')
    .select('id, updated_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  const course_pages: MetadataRoute.Sitemap =
    courses?.map((course) => ({
      url: `${base_url}/courses/${course.id}`,
      lastModified: new Date(course.updated_at || new Date()),
      changeFrequency: changeFrequencies.coursesDetail,
      priority: priorities.coursesDetail,
    })) || [];

  // 동적 페이지들 - 수익 인증
  const { data: revenue_proofs } = await supabase
    .from('revenue_proofs')
    .select('id, updated_at')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(siteConfig.sitemap.maxDynamicPages); // 성능을 위한 제한

  const revenue_proof_pages: MetadataRoute.Sitemap =
    revenue_proofs?.map((proof) => ({
      url: `${base_url}/revenue-proof/${proof.id}`,
      lastModified: new Date(proof.updated_at || new Date()),
      changeFrequency: 'weekly',
      priority: 0.5,
    })) || [];

  // 마이페이지 (로그인 필요하지만 SEO를 위해 포함)
  const my_pages: MetadataRoute.Sitemap = [
    {
      url: `${base_url}/mypage`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    {
      url: `${base_url}/mypage/profile`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
    },
    {
      url: `${base_url}/mypage/courses`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
    },
    {
      url: `${base_url}/mypage/badges`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
    },
  ];

  // 모든 페이지 통합
  const sitemap_data = [...static_pages, ...course_pages, ...revenue_proof_pages, ...my_pages];

  // 캐시 저장
  setCachedData(cache_key, sitemap_data);

  return sitemap_data;
}
