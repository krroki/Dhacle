// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { generateRandomNickname as _generateRandomNickname } from '@/lib/utils/nickname-generator';
import type { Database } from '@/types';
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

    const supabase = (await createSupabaseRouteHandlerClient()) as SupabaseClient<Database>;

    // 프로필이 이미 있는지 확인
    const { data: existing_profile, error: profile_error } = await supabase
      .from('profiles')
      .select('id, randomnickname')
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

        // 중복 체크
        const { data: duplicateCheck } = await supabase
          .from('profiles')
          .select('id')
          .eq('randomNickname', randomNickname)
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
      const { data: new_profile, error: create_error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          username: user.email?.split('@')[0] || 'user',
          randomNickname: randomNickname,
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

    if (existing_profile && !existing_profile.randomnickname) {
      // 프로필은 있지만 랜덤 닉네임이 없는 경우
      let randomNickname = '';
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        randomNickname = _generateRandomNickname();

        // 중복 체크
        const { data: duplicateCheck } = await supabase
          .from('profiles')
          .select('id')
          .eq('randomnickname', randomNickname)
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
          randomnickname: randomNickname,
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

    const supabase = (await createSupabaseRouteHandlerClient()) as SupabaseClient<Database>;

    // 프로필 가져오기
    const { data: profile, error: profile_error } = await supabase
      .from('profiles')
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
      needsInitialization: false, // TODO: Set to !profile.randomNickname when field is implemented
      profile: {
        id: profile.id,
        username: profile.username,
        // TODO: Uncomment when fields are implemented
        // randomNickname: profile.randomNickname,
        // naverCafeNickname: profile.naverCafeNickname,
        // naverCafeVerified: profile.naverCafeVerified,
        // displayNickname: profile.displayNickname,
      },
    });
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
