import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  apiRateLimiter,
  authRateLimiter,
  createRateLimitResponse,
  getClientIp,
} from '@/lib/security/rate-limiter';
// Type will be inferred from createServerClient
import { env } from '@/env';

/**
 * 🔐 보안 미들웨어
 * Wave 1: Supabase 세션 관리 추가 (2025-02-01)
 * Wave 2: 캐싱 정책 및 보안 헤더 설정
 * Wave 3: Rate Limiting 추가
 *
 * 기능:
 * 1. Supabase 세션 자동 새로고침 (Wave 1)
 * 2. 개인 데이터 API에 대한 캐싱 방지
 * 3. 보안 헤더 추가
 * 4. CORS 설정
 * 5. Rate Limiting (Wave 3)
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

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Create response early to be modified
  const res = NextResponse.next();

  // Wave 1: Supabase 세션 자동 새로고침 - 모든 경로에 적용
  try {
    const supabase_url = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabase_anon_key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabase_url && supabase_anon_key) {
      const supabase = createServerClient(supabase_url, supabase_anon_key, {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options) {
            res.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options) {
            res.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      });

      // 세션 자동 새로고침
      await supabase.auth.getSession();

      if (env.NODE_ENV === 'development') {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          console.log('[Middleware] Session refreshed for user:', user.id);
        }
      }
    }
  } catch (error) {
    // 세션 새로고침 실패 - 요청은 계속 진행
    if (env.NODE_ENV === 'development') {
      console.warn('[Middleware] Session refresh failed:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // 개발 환경에서 미들웨어 작동 확인
  if (env.NODE_ENV === 'development') {
    console.log('[Middleware] Processing:', pathname);
  }

  // API 라우트가 아니면 세션 새로고침만 하고 반환
  if (!pathname.startsWith('/api/')) {
    return res;
  }

  // Wave 3: Rate Limiting 적용
  const client_ip = getClientIp(request);
  const identifier = `${client_ip}:${pathname}`;

  // 인증 관련 엔드포인트는 더 엄격한 제한
  const limiter =
    pathname.includes('/auth/') || pathname.includes('/login') ? authRateLimiter : apiRateLimiter;

  const rate_limit_result = limiter.check(identifier);

  if (!rate_limit_result.allowed) {
    return createRateLimitResponse(rate_limit_result.resetTime);
  }

  // 응답 헤더 설정 - 이미 위에서 생성한 response 사용
  const response = res;

  // 1. 캐싱 정책 설정
  if (is_private_data_route(pathname)) {
    // 개인 데이터는 캐싱 금지
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
  } else if (is_public_route(pathname)) {
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
    response.headers.set('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none';");
  }

  // 3. CORS 설정 (필요한 경우)
  const origin = request.headers.get('origin');
  const allowed_origins = [
    env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'https://dhacle.com',
    'https://www.dhacle.com',
  ];

  if (origin && allowed_origins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // 4. Rate Limiting 헤더 (Wave 3 구현 완료)
  response.headers.set('X-RateLimit-Limit', rate_limit_result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rate_limit_result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(rate_limit_result.resetTime).toISOString());

  return response;
}

// 개인 데이터 경로 확인
function is_private_data_route(pathname: string): boolean {
  return PRIVATE_DATA_ROUTES.some((route) => pathname.startsWith(route));
}

// 공개 경로 확인
function is_public_route(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route));
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
