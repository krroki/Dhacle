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
      // 메모리 캐시 사용 (ChunkLoadError 방지)
      config.cache = {
        type: 'memory',
      }
      
      // 파일 감시 설정 (Windows 최적화)
      config.watchOptions = {
        poll: 1000, // 1초마다 체크
        aggregateTimeout: 300, // 변경 후 300ms 대기
        ignored: ['**/node_modules', '**/.next'],
      }
    }
    
    // 청크 최적화 설정 (ChunkLoadError 방지)
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      }
    }
    
    return config
  },
  
  // 이미지 최적화 설정
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // 이미지 포맷 설정 (최신 포맷 지원)
    formats: ['image/avif', 'image/webp'],
    
    // 디바이스 크기 설정 (반응형 이미지)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // 이미지 최소화 설정
    minimumCacheTTL: 60,
    
    // YouTube 썸네일 추가 도메인
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
        hostname: 'yt3.ggpht.com', // YouTube 채널 이미지
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