import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config/site';

export default function robots(): MetadataRoute.Robots {
  const { robots: robots_config } = siteConfig;

  // 기본 규칙
  const rules: MetadataRoute.Robots['rules'] = [
    {
      userAgent: '*',
      allow: '/',
      disallow: robots_config.disallow,
    },
  ];

  // 특정 봇 규칙 추가
  Object.entries(robots_config.customBots).forEach(([bot_name, config]) => {
    rules.push({
      userAgent: bot_name.charAt(0).toUpperCase() + bot_name.slice(1), // Capitalize first letter
      allow: '/',
      disallow: config.disallow,
    });
  });

  return {
    rules,
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
