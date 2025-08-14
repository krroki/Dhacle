import type { NextConfig } from 'next'

// 번들 분석기 설정
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({
      enabled: true,
    })
  : (config: NextConfig) => config

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // 서버 외부 패키지 설정
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // 개발 서버 최적화
  onDemandEntries: {
    // 페이지를 메모리에 유지하는 시간 (ms)
    maxInactiveAge: 25 * 1000,
    // 동시에 메모리에 유지할 페이지 수
    pagesBufferLength: 5,
  },
  
  // Webpack 설정
  webpack: (config, { dev, isServer }) => {
    // 개발 환경 최적화
    if (dev) {
      // 파일 시스템 캐시 활성화
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      }
      
      // 파일 감시 설정 (Windows 최적화)
      config.watchOptions = {
        poll: 1000, // 1초마다 체크
        aggregateTimeout: 300, // 변경 후 300ms 대기
        ignored: ['**/node_modules', '**/.next'],
      }
    }
    
    return config
  },
  
  // 이미지 최적화 설정
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  
  // 실험적 기능 (성능 개선)
  experimental: {
    // 타입 체크 병렬 처리
    typedRoutes: false,
  },
}

export default withBundleAnalyzer(nextConfig)