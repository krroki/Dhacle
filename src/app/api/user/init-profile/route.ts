import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { generateRandomNickname } from '@/lib/utils/nickname-generator';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * 신규 회원가입 시 프로필 초기화
 * Kakao OAuth 콜백 후 자동 호출됨
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient({ cookies }) as SupabaseClient<Database>;
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 });
    }

    // 프로필이 이미 있는지 확인
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, random_nickname')
      .eq('id', user.id)
      .single();

    // 프로필이 없으면 생성
    if (profileError?.code === 'PGRST116' || !existingProfile) {
      // 중복되지 않는 랜덤 닉네임 생성
      let randomNickname = '';
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        randomNickname = generateRandomNickname();
        
        // 중복 체크
        const { data: duplicateCheck } = await supabase
          .from('profiles')
          .select('id')
          .eq('random_nickname', randomNickname)
          .single();

        if (!duplicateCheck) {
          break;
        }
        
        attempts++;
      }

      if (!randomNickname) {
        // 랜덤 닉네임 생성 실패 시 기본값 사용
        randomNickname = `user_${user.id.substring(0, 8)}`;
      }

      // 프로필 생성
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          username: user.email?.split('@')[0] || 'user',
          random_nickname: randomNickname,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Profile initialized successfully',
        profile: newProfile,
        isNew: true
      });

    } else if (existingProfile && !existingProfile.random_nickname) {
      // 프로필은 있지만 랜덤 닉네임이 없는 경우
      let randomNickname = '';
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        randomNickname = generateRandomNickname();
        
        // 중복 체크
        const { data: duplicateCheck } = await supabase
          .from('profiles')
          .select('id')
          .eq('random_nickname', randomNickname)
          .single();

        if (!duplicateCheck) {
          break;
        }
        
        attempts++;
      }

      if (!randomNickname) {
        randomNickname = `user_${user.id.substring(0, 8)}`;
      }

      // 랜덤 닉네임 업데이트
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          random_nickname: randomNickname,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Random nickname added successfully',
        profile: updatedProfile,
        isNew: false
      });
    }

    // 이미 완전한 프로필이 있는 경우
    return NextResponse.json({
      message: 'Profile already initialized',
      profile: existingProfile,
      isNew: false
    });

  } catch (error) {
    console.error('Error initializing profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 프로필 상태 확인
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient({ cookies }) as SupabaseClient<Database>;
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 });
    }

    // 프로필 가져오기
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({
        exists: false,
        needsInitialization: true
      });
    }

    return NextResponse.json({
      exists: true,
      needsInitialization: !profile.random_nickname,
      profile: {
        id: profile.id,
        username: profile.username,
        randomNickname: profile.random_nickname,
        naverCafeNickname: profile.naver_cafe_nickname,
        naverCafeVerified: profile.naver_cafe_verified,
        displayNickname: profile.display_nickname
      }
    });

  } catch (error) {
    console.error('Error checking profile status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}