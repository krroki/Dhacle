import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { apiRateLimiter, authRateLimiter, getClientIp, createRateLimitResponse } from '@/lib/security/rate-limiter';

/**
 * 🔐 보안 미들웨어
 * Wave 2: 캐싱 정책 및 보안 헤더 설정
 * Wave 3: Rate Limiting 추가
 * 
 * 기능:
 * 1. 개인 데이터 API에 대한 캐싱 방지
 * 2. 보안 헤더 추가
 * 3. CORS 설정
 * 4. Rate Limiting (Wave 3)
 */

// 개인 데이터가 포함된 API 경로 목록
const PRIVATE_DATA_ROUTES = [
  '/api/user',
  '/api/youtube/favorites',
  '/api/youtube/search-history', 
  '/api/youtube/collections',
  '/api/revenue-proof/my',
  '/api/payment',
  '/api/admin',
  '/api/community/posts/my',
  '/api/course/my',
];

// 공개 API 경로 (캐싱 허용)
const PUBLIC_ROUTES = [
  '/api/health',
  '/api/debug/env-check',
  '/api/youtube/popular', // 인기 Shorts는 캐싱 가능
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // API 라우트만 처리
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Wave 3: Rate Limiting 적용
  const clientIp = getClientIp(request as unknown as Request);
  const identifier = `${clientIp}:${pathname}`;
  
  // 인증 관련 엔드포인트는 더 엄격한 제한
  const limiter = pathname.includes('/auth/') || pathname.includes('/login') 
    ? authRateLimiter 
    : apiRateLimiter;
  
  const rateLimitResult = limiter.check(identifier);
  
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult.resetTime);
  }

  // 응답 헤더 설정
  const response = NextResponse.next();

  // 1. 캐싱 정책 설정
  if (isPrivateDataRoute(pathname)) {
    // 개인 데이터는 캐싱 금지
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
  } else if (isPublicRoute(pathname)) {
    // 공개 데이터는 짧은 시간 캐싱 허용 (5분)
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  } else {
    // 기본값: 재검증 필요
    response.headers.set('Cache-Control', 'no-cache, must-revalidate');
  }

  // 2. 보안 헤더 추가
  // XSS 방지
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer 정책
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // 콘텐츠 보안 정책 (CSP) - API에는 기본적인 것만
  if (pathname.startsWith('/api/')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; frame-ancestors 'none';"
    );
  }

  // 3. CORS 설정 (필요한 경우)
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'https://dhacle.com',
    'https://www.dhacle.com',
  ];

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // 4. Rate Limiting 헤더 (Wave 3 구현 완료)
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

  return response;
}

// 개인 데이터 경로 확인
function isPrivateDataRoute(pathname: string): boolean {
  return PRIVATE_DATA_ROUTES.some(route => pathname.startsWith(route));
}

// 공개 경로 확인  
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route));
}

// 미들웨어 적용 경로 설정
export const config = {
  matcher: [
    // API 라우트
    '/api/:path*',
    // 정적 파일과 이미지 제외
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};