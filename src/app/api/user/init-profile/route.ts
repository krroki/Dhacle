// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { generateRandomNickname as _generateRandomNickname } from '@/lib/utils/nickname-generator';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

/**
 * 신규 회원가입 시 프로필 초기화
 * Kakao OAuth 콜백 후 자동 호출됨
 */
export async function POST(_request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(_request);
    if (!user) {
      logger.warn('Unauthorized access attempt to user/init-profile POST');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // 프로필이 이미 있는지 확인 (users 테이블에서 읽기)
    const { data: existing_profile, error: profile_error } = await supabase
      .from('users')
      .select('id, random_nickname')
      .eq('id', user.id)
      .single();

    // 프로필이 없으면 생성
    if (profile_error?.code === 'PGRST116' || !existing_profile) {
      // 중복되지 않는 랜덤 닉네임 생성
      let randomNickname = '';
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        randomNickname = _generateRandomNickname();

        // 중복 체크 (users 테이블에서 읽기)
        const { data: duplicateCheck } = await supabase
          .from('users')
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

      // 프로필 생성 (users 테이블에 INSERT/UPDATE!)
      const { data: new_profile, error: create_error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email || '',
          username: user.email?.split('@')[0] || 'user',
          random_nickname: randomNickname,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (create_error) {
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Profile initialized successfully',
        profile: new_profile,
        isNew: true,
      });
    }

    if (existing_profile && !existing_profile.random_nickname) {
      // 프로필은 있지만 랜덤 닉네임이 없는 경우
      let randomNickname = '';
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        randomNickname = _generateRandomNickname();

        // 중복 체크 (users 테이블에서 읽기)
        const { data: duplicateCheck } = await supabase
          .from('users')
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

      // 랜덤 닉네임 업데이트 (users 테이블에 UPDATE!)
      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update({
          random_nickname: randomNickname,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Random nickname added successfully',
        profile: updatedProfile,
        isNew: false,
      });
    }

    // 이미 완전한 프로필이 있는 경우
    return NextResponse.json({
      message: 'Profile already initialized',
      profile: existing_profile,
      isNew: false,
    });
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 프로필 상태 확인
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(_request);
    if (!user) {
      logger.warn('Unauthorized access attempt to user/init-profile GET');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // 프로필 가져오기 (users 테이블에서 읽기)
    const { data: profile, error: profile_error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile_error) {
      return NextResponse.json({
        exists: false,
        needsInitialization: true,
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
        displayNickname: profile.naver_cafe_verified && profile.naver_cafe_nickname 
          ? profile.naver_cafe_nickname 
          : profile.random_nickname || profile.username,
      },
    });
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
