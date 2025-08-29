import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient, createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { env } from '@/env';
import { authRateLimiter, getClientIp } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  // 개발 환경에서만 작동
  if (env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }
  
  console.log('🔐 테스트 로그인 API 호출 - 개발 모드');
  
  // Rate limiting 체크는 하되, 실제로는 제한하지 않음 (개발용)
  const client_ip = getClientIp(request);
  const rate_limit = authRateLimiter.check(client_ip);
  
  if (!rate_limit.allowed) {
    console.log('⚠️ Rate limit 초과, but 개발 모드에서 무시');
    authRateLimiter.reset(client_ip); // 즉시 리셋
  }
  
  try {
    // 환경변수에서 테스트 계정 정보 가져오기
    const testEmail = env.TEST_ADMIN_EMAIL || 'test-admin@dhacle.com';
    const testPassword = env.TEST_ADMIN_PASSWORD || 'test1234567890!';
    
    // Supabase Admin Client 생성 (서비스 역할 키 사용)
    const supabaseAdmin = await createSupabaseServiceRoleClient();
    
    console.log('🔐 테스트 로그인: Supabase 인증 시도');
    console.log('📧 이메일:', testEmail);
    
    // 1. 먼저 사용자가 존재하는지 확인
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = userList?.users?.find(u => u.email === testEmail);
    
    let userId: string;
    
    if (!existingUser) {
      // 2. 사용자가 없으면 생성
      console.log('👤 테스트 사용자 생성 중...');
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true, // 이메일 확인 자동 처리
        user_metadata: {
          full_name: 'Test Admin',
          is_test_account: true
        }
      });
      
      if (createError) {
        console.error('사용자 생성 실패:', createError);
        throw createError;
      }
      
      userId = newUser.user.id;
      console.log('✅ 테스트 사용자 생성 완료:', userId);
    } else {
      userId = existingUser.id;
      console.log('✅ 기존 테스트 사용자 확인:', userId);
    }
    
    // 3. 실제 로그인 수행 (일반 클라이언트로)
    const supabaseClient = await createSupabaseRouteHandlerClient();
    
    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('로그인 실패:', signInError);
      
      // 비밀번호 오류일 경우 비밀번호 업데이트 시도
      if (signInError.message.includes('Invalid login credentials')) {
        console.log('🔑 비밀번호 업데이트 시도...');
        
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: testPassword
        });
        
        if (updateError) {
          console.error('비밀번호 업데이트 실패:', updateError);
          throw updateError;
        }
        
        // 다시 로그인 시도
        const { data: retryData, error: retryError } = await supabaseClient.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        });
        
        if (retryError) {
          throw retryError;
        }
        
        if (!retryData.session) {
          throw new Error('세션 생성 실패');
        }
        
        // 성공 응답 (세션은 Supabase가 자동으로 쿠키 설정)
        const response = NextResponse.json({ 
          success: true, 
          user: retryData.user,
          session: retryData.session,
          message: '테스트 로그인 성공',
          redirect: '/tools/youtube-lens'
        });
        
        // Supabase 세션 쿠키 설정
        if (retryData.session) {
          const cookieOptions = {
            httpOnly: true,
            secure: false, // localhost는 https가 아니므로
            sameSite: 'lax' as const,
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7일
          };
          
          response.cookies.set('sb-access-token', retryData.session.access_token, cookieOptions);
          response.cookies.set('sb-refresh-token', retryData.session.refresh_token, cookieOptions);
        }
        
        return response;
      }
      
      throw signInError;
    }
    
    if (!signInData.session) {
      throw new Error('세션 생성 실패');
    }
    
    console.log('✅ 테스트 로그인 성공');
    console.log('📍 사용자 ID:', signInData.user.id);
    console.log('📍 세션 생성됨');
    
    // 성공 응답
    const response = NextResponse.json({ 
      success: true, 
      user: signInData.user,
      session: signInData.session,
      message: '테스트 로그인 성공',
      redirect: '/tools/youtube-lens'
    });
    
    // Supabase 세션 쿠키 설정
    if (signInData.session) {
      const cookieOptions = {
        httpOnly: true,
        secure: false, // localhost는 https가 아니므로
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7일
      };
      
      response.cookies.set('sb-access-token', signInData.session.access_token, cookieOptions);
      response.cookies.set('sb-refresh-token', signInData.session.refresh_token, cookieOptions);
    }
    
    return response;
    
  } catch (error) {
    console.error('Test login error:', error);
    
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : '테스트 로그인 실패',
      message: '테스트 로그인 중 오류 발생'
    }, { status: 500 });
  }
}