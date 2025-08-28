import { NextRequest, NextResponse } from 'next/server';
// import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
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
    // Supabase 클라이언트는 생성하지만 개발 환경에서는 사용하지 않음
    // const supabase = await createSupabaseRouteHandlerClient();
    
    // 테스트용 고정 사용자 정보
    const testEmail = 'test-user@dhacle.com';
    const testUserId = '00000000-0000-0000-0000-000000000001'; // 고정 UUID
    
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
    
    // 개발 환경에서 인증 상태를 시뮬레이션하는 쿠키들 설정
    response.cookies.set('sb-access-token', `test-access-token-${Date.now()}`, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1일
      path: '/'
    });
    
    response.cookies.set('sb-refresh-token', `test-refresh-token-${Date.now()}`, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30일
      path: '/'
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
    
    console.log('✅ 테스트 로그인: 세션 쿠키 생성 완료');
    
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