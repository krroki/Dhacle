import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config/site';

export default function robots(): MetadataRoute.Robots {
  const { robots: robotsConfig } = siteConfig;

  // 기본 규칙
  const rules: MetadataRoute.Robots['rules'] = [
    {
      userAgent: '*',
      allow: '/',
      disallow: robotsConfig.disallow,
    },
  ];

  // 특정 봇 규칙 추가
  Object.entries(robotsConfig.customBots).forEach(([botName, config]) => {
    rules.push({
      userAgent: botName.charAt(0).toUpperCase() + botName.slice(1), // Capitalize first letter
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
