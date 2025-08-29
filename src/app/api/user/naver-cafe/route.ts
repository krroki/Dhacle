// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import {
  DINOHIGHCLASS_CAFE,
  isDinoHighClassCafeUrl,
  isValidNaverCafeUrl,
} from '@/lib/utils/nickname-generator';

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

    const supabase = await createSupabaseRouteHandlerClient();

    // 프로필 정보 가져오기 (naver_cafe 필드들은 users 테이블에 있음)
    const { data: profile, error: profile_error } = await supabase
      .from('users')
      .select('id, naver_cafe_nickname, naver_cafe_verified, cafe_member_url, naver_cafe_verified_at')
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
    const isVerified = profile?.naver_cafe_verified || false;
    const latestVerification = verifications?.[0];

    return NextResponse.json({
      verified: isVerified,
      cafeId: DINOHIGHCLASS_CAFE.id,
      cafeName: DINOHIGHCLASS_CAFE.name,
      nickname: profile?.naver_cafe_nickname || null,
      memberUrl: profile?.cafe_member_url || null,
      verifiedAt: profile?.naver_cafe_verified_at || latestVerification?.verified_at || null,
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

    const supabase = await createSupabaseRouteHandlerClient();

    // 요청 데이터 파싱
    const body = await request.json();
    const { cafeNickname, cafeMemberUrl } = body;
    
    // Support both naming conventions for compatibility
    const nickname = cafeNickname || body.nickname;
    const memberUrl = cafeMemberUrl || body.memberUrl;

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

    // 닉네임 중복 체크 (users 테이블에서 읽기)
    const { data: existingNickname } = await supabase
      .from('users')
      .select('id')
      .eq('naver_cafe_nickname', nickname)
      .neq('id', user.id)
      .single();

    if (existingNickname) {
      return NextResponse.json({ error: 'This nickname is already in use' }, { status: 400 });
    }

    // 이미 인증된 상태인지 확인 (users 테이블에서 읽기)
    const { data: profileCheck } = await supabase
      .from('users')
      .select('naver_cafe_verified')
      .eq('id', user.id)
      .single();

    if (profileCheck?.naver_cafe_verified) {
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

    // 관리자 수동 검증 대기 상태로 저장 (users 테이블에 UPDATE!)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        cafe_member_url: memberUrl,
        naver_cafe_nickname: nickname,
        naver_cafe_verified: false, // 관리자 검증 대기
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
        cafe_nickname: nickname,
        verification_status: 'pending',
      })
      .eq('id', verification.id);

    // 관리자 알림은 Phase 6에서 구현 예정
    // 현재는 로그로 기록하여 관리자가 확인 가능하도록 함
    console.log('[ADMIN_NOTIFICATION] 네이버 카페 인증 요청:', {
      userId: user.id,
      nickname,
      memberUrl,
      requestedAt: new Date().toISOString()
    });
    // 추후 알림 시스템 구현 시 이 로그를 실제 알림으로 대체

      return NextResponse.json({
      success: true,
      message: '인증 요청이 접수되었습니다. 관리자 검증을 기다려주세요.',
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

    const supabase = await createSupabaseRouteHandlerClient();

    // 프로필 업데이트 (users 테이블에 UPDATE!)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        naver_cafe_verified: false,
        naver_cafe_verified_at: null,
        naver_cafe_nickname: null,
        cafe_member_url: null,
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
