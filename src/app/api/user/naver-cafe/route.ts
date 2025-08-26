// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import {
  DINOHIGHCLASS_CAFE,
  isDinoHighClassCafeUrl,
  isValidNaverCafeUrl,
} from '@/lib/utils/nickname-generator';
import type { Database } from '@/types';

// 네이버 카페 연동 상태 확인
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to Naver Cafe API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = (await createSupabaseRouteHandlerClient()) as SupabaseClient<Database>;

    // TODO: 네이버 카페 인증 기능 구현 예정
    // naverCafeVerifications 테이블 및 관련 필드 생성 후 주석 해제

    // 프로필 정보 가져오기 (임시로 기본 필드만)
    const { data: _profile, error: profile_error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', user.id)
      .single();

    if (profile_error) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // 인증 요청 내역 가져오기
    const { data: verifications, error: verificationError } = await supabase
      .from('naver_cafe_verifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (verificationError) {
      console.error('Failed to fetch verifications:', verificationError);
    }

    // Check if user is verified
    const isVerified = false; // profile doesn't have naver_cafe_verified field
    const latestVerification = verifications?.[0];

    return NextResponse.json({
      verified: isVerified,
      cafeId: null, // Table doesn't have cafe_id field
      cafeName: null, // Table doesn't have cafe_name field
      nickname: null, // profile doesn't have naver_cafe_nickname field
      memberUrl: null, // profile doesn't have naver_cafe_member_url field
      verifiedAt: latestVerification?.verified_at || null,
      verificationHistory: verifications || [],
    });
  } catch (error) {
    console.error('Naver cafe API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 네이버 카페 연동 요청
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to Naver Cafe API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = (await createSupabaseRouteHandlerClient()) as SupabaseClient<Database>;

    // 요청 데이터 파싱
    const body = await request.json();
    const { nickname, memberUrl } = body;

    // 유효성 검사
    if (!nickname || !memberUrl) {
      return NextResponse.json({ error: 'Nickname and member URL are required' }, { status: 400 });
    }

    if (!isValidNaverCafeUrl(memberUrl)) {
      return NextResponse.json(
        { error: `Invalid URL. Only ${DINOHIGHCLASS_CAFE.name} cafe URLs are allowed` },
        { status: 400 }
      );
    }

    // dinohighclass 카페인지 한번 더 확인
    if (!isDinoHighClassCafeUrl(memberUrl)) {
      return NextResponse.json(
        { error: `Only ${DINOHIGHCLASS_CAFE.name} cafe members can link their profile` },
        { status: 400 }
      );
    }

    // 닉네임 중복 체크
    const { data: existingNickname } = await supabase
      .from('profiles')
      .select('id')
      .eq('naver_cafe_nickname', nickname)
      .neq('id', user.id)
      .single();

    if (existingNickname) {
      return NextResponse.json({ error: 'This nickname is already in use' }, { status: 400 });
    }

    // 이미 인증된 상태인지 확인
    // Note: naver_cafe_verified column doesn't exist in profiles
    // Check from naver_cafe_verifications table instead
    const { data: existingVerification } = await supabase
      .from('naver_cafe_verifications')
      .select('id, verification_status')
      .eq('user_id', user.id)
      .single();

    if (existingVerification?.verification_status === 'verified') {
      return NextResponse.json({ error: 'Naver Cafe is already verified' }, { status: 400 });
    }

    // 인증 요청 생성
    const { data: verification, error: verificationError } = await supabase
      .from('naver_cafe_verifications')
      .insert({
        user_id: user.id,
        cafe_nickname: '',  // Will be updated during verification
        verification_status: 'pending',
      })
      .select()
      .single();

    if (verificationError) {
      console.error('Failed to create verification:', verificationError);
      return NextResponse.json({ error: 'Failed to create verification request' }, { status: 500 });
    }

    // 자동 승인 (실제 환경에서는 관리자 검증 필요)
    // TODO: 실제 네이버 카페 API 연동 또는 관리자 수동 검증 구현
    const auto_approve = true;

    if (auto_approve) {
      // 프로필 업데이트
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          naver_cafe_nickname: nickname,
          naver_cafe_member_url: memberUrl,
          naver_cafe_verified: true,
          naver_cafe_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to update profile:', updateError);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }

      // 인증 요청 상태 업데이트
      await supabase
        .from('naver_cafe_verifications')
        .update({
          verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq('id', verification.id);

      return NextResponse.json({
        verified: true,
        message: `${DINOHIGHCLASS_CAFE.name} cafe verification completed successfully`,
        verificationId: verification.id,
        cafeName: DINOHIGHCLASS_CAFE.name,
      });
    }

    return NextResponse.json({
      verified: false,
      message: 'Verification request submitted. Please wait for admin approval.',
      verificationId: verification.id,
    });
  } catch (error) {
    console.error('Naver cafe API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 네이버 카페 연동 해제
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to Naver Cafe API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = (await createSupabaseRouteHandlerClient()) as SupabaseClient<Database>;

    // 프로필 업데이트
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        naver_cafe_verified: false,
        naver_cafe_verified_at: null,
        naver_cafe_nickname: null,
        naver_cafe_member_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Naver Cafe verification removed successfully',
    });
  } catch (error) {
    console.error('Naver cafe API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
