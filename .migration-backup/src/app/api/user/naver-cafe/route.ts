import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import {
  DINOHIGHCLASS_CAFE,
  isDinoHighClassCafeUrl,
  isValidNaverCafeUrl,
} from '@/lib/utils/nickname-generator';
import type { Database } from '@/types';

// 네이버 카페 연동 상태 확인
export async function GET(_request: NextRequest) {
  try {
    const supabase = (await createRouteHandlerClient({ cookies })) as SupabaseClient<Database>;

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // TODO: 네이버 카페 인증 기능 구현 예정
    // naverCafeVerifications 테이블 및 관련 필드 생성 후 주석 해제

    // 프로필 정보 가져오기 (임시로 기본 필드만)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // 인증 요청 내역 가져오기 (임시로 빈 배열 반환)
    // const { data: verifications, error: verificationError } = await supabase
    //   .from('naverCafeVerifications')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .order('created_at', { ascending: false })
    //   .limit(5);
    interface VerificationData {
      id: string;
      user_id: string;
      cafe_url: string;
      is_verified: boolean;
      created_at: string;
    }
    const verifications: VerificationData[] = [];

    return NextResponse.json({
      verified: false, // 임시로 false 반환
      cafeId: null,
      cafeName: null,
      nickname: null,
      memberUrl: null,
      verifiedAt: null,
      verificationHistory: verifications,
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 네이버 카페 연동 요청
export async function POST(request: NextRequest) {
  try {
    const supabase = (await createRouteHandlerClient({ cookies })) as SupabaseClient<Database>;

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

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

    // TODO: 네이버 카페 닉네임 필드 추가 후 중복 체크 구현
    // 닉네임 중복 체크 (임시로 스킵)
    // const { data: existingNickname } = await supabase
    //   .from('profiles')
    //   .select('id')
    //   .eq('naverCafeNickname', nickname)
    //   .neq('id', user.id)
    //   .single();

    // if (existingNickname) {
    //   return NextResponse.json({ error: 'This nickname is already in use' }, { status: 400 });
    // }

    // 이미 인증된 상태인지 확인 (임시로 false 반환)
    // const { data: profile } = await supabase
    //   .from('profiles')
    //   .select('naverCafeVerified')
    //   .eq('id', user.id)
    //   .single();

    // if (profile?.naverCafeVerified) {
    //   return NextResponse.json({ error: 'Naver Cafe is already verified' }, { status: 400 });
    // }

    // TODO: naverCafeVerifications 테이블 생성 후 주석 해제
    // 인증 요청 생성 (임시로 스킵)
    // const { data: verification, error: verificationError } = await supabase
    //   .from('naverCafeVerifications')
    //   .insert({
    //     user_id: user.id,
    //     cafeId: DINOHIGHCLASS_CAFE.id,
    //     cafeNickname: nickname,
    //     cafeMemberUrl: memberUrl,
    //     verificationStatus: 'pending',
    //   })
    //   .select()
    //   .single();

    // if (verificationError) {
    //   return NextResponse.json({ error: 'Failed to create verification request' }, { status: 500 });
    // }

    // 임시 verification 객체
    const verification = { id: 'temp-id' };

    // 자동 승인 (실제 환경에서는 관리자 검증 필요)
    // TODO: 실제 네이버 카페 API 연동 또는 관리자 수동 검증 구현
    const autoApprove = true;

    if (autoApprove) {
      // TODO: 네이버 카페 관련 필드 추가 후 주석 해제
      // 프로필 업데이트 (임시로 스킵)
      // const { error: updateError } = await supabase
      //   .from('profiles')
      //   .update({
      //     naverCafeId: DINOHIGHCLASS_CAFE.id,
      //     naverCafeNickname: nickname,
      //     naverCafeMemberUrl: memberUrl,
      //     naverCafeVerified: true,
      //     naverCafeVerifiedAt: new Date().toISOString(),
      //     updated_at: new Date().toISOString(),
      //   })
      //   .eq('id', user.id);

      // if (updateError) {
      //   return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      // }

      // 인증 요청 상태 업데이트 (임시로 스킵)
      // await supabase
      //   .from('naverCafeVerifications')
      //   .update({
      //     verificationStatus: 'verified',
      //     verifiedAt: new Date().toISOString(),
      //     verifiedBy: user.id,
      //   })
      //   .eq('id', verification.id);

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
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 네이버 카페 연동 해제
export async function DELETE(_request: NextRequest) {
  try {
    const supabase = (await createRouteHandlerClient({ cookies })) as SupabaseClient<Database>;

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // TODO: 네이버 카페 관련 필드 추가 후 주석 해제
    // 프로필 업데이트 (임시로 스킵)
    // const { error: updateError } = await supabase
    //   .from('profiles')
    //   .update({
    //     naverCafeVerified: false,
    //     naverCafeVerifiedAt: null,
    //     updated_at: new Date().toISOString(),
    //   })
    //   .eq('id', user.id);
    const updateError = null;

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Naver Cafe verification removed successfully',
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
