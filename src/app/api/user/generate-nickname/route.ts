import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { generateMultipleNicknames, generateRandomNickname } from '@/lib/utils/nickname-generator';
import type { Database } from '@/types';

export async function POST(_request: NextRequest) {
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

    // TODO: randomNickname 필드 추가 후 주석 해제
    // 이미 랜덤 닉네임이 있는지 확인 (임시로 스킵)
    // const { data: profile, error: profileError } = await supabase
    //   .from('profiles')
    //   .select('randomNickname')
    //   .eq('id', user.id)
    //   .single();

    // if (profileError) {
    //   return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    // }

    // if (profile?.randomNickname) {
    //   return NextResponse.json(
    //     {
    //       error: 'Random nickname already exists',
    //       nickname: profile.randomNickname,
    //     },
    //     { status: 400 }
    //   );
    // }

    // 중복되지 않는 닉네임 생성 (최대 10회 시도)
    let nickname = '';
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      nickname = generateRandomNickname();

      // TODO: randomNickname 필드 추가 후 중복 체크 구현
      // 중복 체크 (임시로 항상 사용 가능하다고 가정)
      // const { data: existing, error: checkError } = await supabase
      //   .from('profiles')
      //   .select('id')
      //   .eq('randomNickname', nickname)
      //   .single();

      // if (checkError || !existing) {
      //   // 중복이 없으면 사용
      //   break;
      // }
      break; // 임시로 바로 사용

      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json({ error: 'Failed to generate unique nickname' }, { status: 500 });
    }

    // TODO: randomNickname 필드 추가 후 주석 해제
    // 프로필 업데이트 (임시로 스킵)
    // const { data: updatedProfile, error: updateError } = await supabase
    //   .from('profiles')
    //   .update({
    //     randomNickname: nickname,
    //     updated_at: new Date().toISOString(),
    //   })
    //   .eq('id', user.id)
    //   .select()
    //   .single();

    // if (updateError) {
    //   return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    // }

    return NextResponse.json({
      nickname: nickname,
      message: 'Random nickname generated successfully',
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 닉네임 제안 목록 가져오기
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

    // 5개의 닉네임 제안 생성
    const suggestions = generateMultipleNicknames(5);

    // 중복 체크
    const availableSuggestions = [];
    for (const suggestion of suggestions) {
      // TODO: randomNickname 필드 추가 후 중복 체크 구현
      // const { data: existing } = await supabase
      //   .from('profiles')
      //   .select('id')
      //   .eq('randomNickname', suggestion)
      //   .single();

      // if (!existing) {
      //   availableSuggestions.push(suggestion);
      // }
      availableSuggestions.push(suggestion); // 임시로 바로 추가
    }

    // 부족하면 추가 생성
    while (availableSuggestions.length < 5) {
      const newNickname = generateRandomNickname();
      // TODO: randomNickname 필드 추가 후 중복 체크 구현
      // const { data: existing } = await supabase
      //   .from('profiles')
      //   .select('id')
      //   .eq('randomNickname', newNickname)
      //   .single();

      // if (!existing && !availableSuggestions.includes(newNickname)) {
      //   availableSuggestions.push(newNickname);
      // }
      if (!availableSuggestions.includes(newNickname)) {
        availableSuggestions.push(newNickname); // 임시로 중복만 체크
      }
    }

    return NextResponse.json({
      suggestions: availableSuggestions.slice(0, 5),
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
