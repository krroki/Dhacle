import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // 디버깅: 브라우저 콘솔 에러를 터미널에 표시 (Context7 권장)
  experimental: {
    browserDebugInfoInTerminal: true,
  },
  
  // Standalone 배포 (Context7 권장 - webpack 이슈 해결)
  output: 'standalone',
  
  // 서버 외부 패키지 설정
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Supabase Edge Runtime 호환성 설정 (experimental에서 제거됨)
  // serverComponentsExternalPackages: ['@supabase/supabase-js', '@supabase/ssr'],
  
  // Webpack 설정으로 Node.js API 경고 방지
  webpack: (config, { isServer, nextRuntime }) => {
    // Edge Runtime에서 Node.js API 사용 경고 억제
    if (nextRuntime === 'edge' && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: false,
      }
    }
    return config
  },
  
  // 이미지 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'k.kakaocdn.net',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
    // SVG 최적화 허용 (Dicebear 아바타용)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // 로컬 이미지 최적화 비활성화 (개발 환경 이슈 해결)
    unoptimized: process.env.NODE_ENV === 'development',
  },
}

export default nextConfig