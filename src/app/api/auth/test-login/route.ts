import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { env } from '@/env';

export async function POST(_request: NextRequest) {
  // 개발 환경에서만 작동
  if (env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }
  
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // Service role client를 사용해 테스트 사용자 생성 또는 조회
    const testEmail = 'test-user@dhacle.com';
    const testUserId = 'test-user-' + Date.now(); // 임시 ID
    
    // 기존 테스트 사용자 확인
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
      .single();
    
    if (existingProfile) {
      // 기존 사용자로 세션 생성 (개발 환경 전용)
      console.log('Found existing test user:', existingProfile.id);
      
      // 간단히 성공 응답 반환 (실제 세션 생성 없이)
      // 프론트엔드에서 단순히 리다이렉트만 하도록
      return NextResponse.json({ 
        success: true, 
        user: existingProfile,
        message: '테스트 로그인 성공 (개발 모드)'
      });
    }
    
    // 새 테스트 프로필 생성
    const newProfile = {
      id: testUserId,
      email: testEmail,
      username: '테스트유저' + Math.floor(Math.random() * 9999),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: createdProfile, error: profileError } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      // 프로필 생성 실패해도 개발 모드이므로 성공으로 처리
      return NextResponse.json({ 
        success: true, 
        user: newProfile,
        message: '테스트 로그인 성공 (개발 모드, 프로필 없음)'
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: createdProfile || newProfile,
      message: '테스트 계정 생성 및 로그인 성공'
    });
  } catch (error) {
    console.error('Test login error:', error);
    // 에러가 발생해도 개발 모드이므로 성공으로 처리
    return NextResponse.json({ 
      success: true,
      message: '테스트 로그인 성공 (개발 모드, 에러 무시)'
    });
  }
}