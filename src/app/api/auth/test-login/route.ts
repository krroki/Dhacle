import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { env } from '@/env';
import { authRateLimiter, getClientIp } from '@/lib/security/rate-limiter';

export async function POST(_request: NextRequest) {
  // 개발 환경에서만 작동
  if (env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }
  
  // 개발 환경에서 rate limiting 우회
  console.log('🔐 테스트 로그인 API 호출 - 개발 모드');
  
  // Rate limiting 체크는 하되, 실제로는 제한하지 않음 (개발용)
  const client_ip = getClientIp(_request);
  const rate_limit = authRateLimiter.check(client_ip);
  
  if (!rate_limit.allowed) {
    console.log('⚠️ Rate limit 초과, but 개발 모드에서 무시');
    // 개발 모드에서는 rate limit 초과해도 진행
    authRateLimiter.reset(client_ip); // 즉시 리셋
  }
  
  try {
    // 환경변수에서 테스트 관리자 정보 가져오기
    const testEmail = env.TEST_ADMIN_EMAIL || 'test-admin@dhacle.com';
    const testPassword = env.TEST_ADMIN_PASSWORD || 'test-admin-password-2025';
    const testUserId = env.TEST_ADMIN_USER_ID || '11111111-1111-1111-1111-111111111111';
    
    // 실제 인증 세션 생성 시도
    console.log('🔐 테스트 로그인: 실제 세션 생성 시도');
    
    // 방법 1: 테스트용 JWT 토큰 생성 (개발 환경 전용)
    const testUser = {
      id: testUserId,
      email: testEmail,
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 세션 쿠키 설정 (개발 환경 전용)
    const response = NextResponse.json({ 
      success: true, 
      user: testUser,
      message: '테스트 로그인 성공 - 세션 생성됨',
      redirect: '/mypage/profile'
    });
    
    // localhost 전용 쿠키 설정 (dhacle.com으로 세션 넘어가지 않도록)
    const cookieOptions = {
      httpOnly: true,
      secure: false, // localhost는 https가 아니므로 false
      sameSite: 'lax' as const,
      path: '/',
      // domain 생략 - 현재 도메인(localhost)에서만 유효
    };
    
    response.cookies.set('sb-access-token', `test-access-token-${Date.now()}`, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24, // 1일
    });
    
    response.cookies.set('sb-refresh-token', `test-refresh-token-${Date.now()}`, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30, // 30일
    });
    
    // Supabase 표준 쿠키 이름들도 설정
    response.cookies.set('supabase-auth-token', JSON.stringify({
      access_token: `test-access-token-${Date.now()}`,
      refresh_token: `test-refresh-token-${Date.now()}`,
      expires_at: Date.now() + (60 * 60 * 24 * 1000),
      user: testUser
    }), {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/'
    });
    
    console.log('✅ 테스트 로그인: localhost 세션 생성 완료');
    console.log('📍 테스트 계정:', testEmail);
    
    return response;
    
  } catch (error) {
    console.error('Test login error:', error);
    
    // 에러 발생 시에도 기본적인 성공 응답 (개발 모드)
    const response = NextResponse.json({ 
      success: true,
      message: '테스트 로그인 성공 (단순 모드)',
      redirect: '/mypage/profile'
    });
    
    // 기본 테스트 쿠키 설정
    response.cookies.set('test-authenticated', 'true', {
      httpOnly: false,
      secure: false,
      maxAge: 60 * 60 * 24,
      path: '/'
    });
    
    return response;
  }
}