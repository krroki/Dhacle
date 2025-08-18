import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { isValidNaverCafeUrl, isDinoHighClassCafeUrl, DINOHIGHCLASS_CAFE } from '@/lib/utils/nickname-generator';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// 네이버 카페 연동 상태 확인
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseRouteHandlerClient() as SupabaseClient<Database>;
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 프로필 정보 가져오기
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('naver_cafe_id, naver_cafe_nickname, naver_cafe_verified, naver_cafe_member_url, naver_cafe_verified_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // 인증 요청 내역 가져오기
    const { data: verifications, error: verificationError } = await supabase
      .from('naver_cafe_verifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      verified: profile?.naver_cafe_verified || false,
      cafeId: profile?.naver_cafe_id || null,
      cafeName: profile?.naver_cafe_id === DINOHIGHCLASS_CAFE.id ? DINOHIGHCLASS_CAFE.name : null,
      nickname: profile?.naver_cafe_nickname || null,
      memberUrl: profile?.naver_cafe_member_url || null,
      verifiedAt: profile?.naver_cafe_verified_at || null,
      verificationHistory: verifications || []
    });

  } catch (error) {
    console.error('Error fetching Naver Cafe status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 네이버 카페 연동 요청
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseRouteHandlerClient() as SupabaseClient<Database>;
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 요청 데이터 파싱
    const body = await request.json();
    const { nickname, memberUrl } = body;

    // 유효성 검사
    if (!nickname || !memberUrl) {
      return NextResponse.json(
        { error: 'Nickname and member URL are required' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'This nickname is already in use' },
        { status: 400 }
      );
    }

    // 이미 인증된 상태인지 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('naver_cafe_verified')
      .eq('id', user.id)
      .single();

    if (profile?.naver_cafe_verified) {
      return NextResponse.json(
        { error: 'Naver Cafe is already verified' },
        { status: 400 }
      );
    }

    // 인증 요청 생성 (dinohighclass 카페 전용)
    const { data: verification, error: verificationError } = await supabase
      .from('naver_cafe_verifications')
      .insert({
        user_id: user.id,
        cafe_id: DINOHIGHCLASS_CAFE.id,
        cafe_nickname: nickname,
        cafe_member_url: memberUrl,
        verification_status: 'pending'
      })
      .select()
      .single();

    if (verificationError) {
      return NextResponse.json(
        { error: 'Failed to create verification request' },
        { status: 500 }
      );
    }

    // 자동 승인 (실제 환경에서는 관리자 검증 필요)
    // TODO: 실제 네이버 카페 API 연동 또는 관리자 수동 검증 구현
    const autoApprove = true;

    if (autoApprove) {
      // 프로필 업데이트 (dinohighclass 카페 정보와 함께)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          naver_cafe_id: DINOHIGHCLASS_CAFE.id,
          naver_cafe_nickname: nickname,
          naver_cafe_member_url: memberUrl,
          naver_cafe_verified: true,
          naver_cafe_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }

      // 인증 요청 상태 업데이트
      await supabase
        .from('naver_cafe_verifications')
        .update({
          verification_status: 'verified',
          verified_at: new Date().toISOString(),
          verified_by: user.id // 자동 승인이므로 본인이 승인
        })
        .eq('id', verification.id);

      return NextResponse.json({
        verified: true,
        message: `${DINOHIGHCLASS_CAFE.name} cafe verification completed successfully`,
        verificationId: verification.id,
        cafeName: DINOHIGHCLASS_CAFE.name
      });
    }

    return NextResponse.json({
      verified: false,
      message: 'Verification request submitted. Please wait for admin approval.',
      verificationId: verification.id
    });

  } catch (error) {
    console.error('Error verifying Naver Cafe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 네이버 카페 연동 해제
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseRouteHandlerClient() as SupabaseClient<Database>;
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 프로필 업데이트 (인증 해제만, 닉네임은 보존)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        naver_cafe_verified: false,
        naver_cafe_verified_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Naver Cafe verification removed successfully'
    });

  } catch (error) {
    console.error('Error removing Naver Cafe verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}