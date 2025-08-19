import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { generateMultipleNicknames, generateRandomNickname } from '@/lib/utils/nickname-generator';
import type { Database } from '@/types/database';

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

    // 이미 랜덤 닉네임이 있는지 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('randomNickname')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    if (profile?.randomNickname) {
      return NextResponse.json(
        {
          error: 'Random nickname already exists',
          nickname: profile.randomNickname,
        },
        { status: 400 }
      );
    }

    // 중복되지 않는 닉네임 생성 (최대 10회 시도)
    let nickname = '';
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      nickname = generateRandomNickname();

      // 중복 체크
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('randomNickname', nickname)
        .single();

      if (checkError || !existing) {
        // 중복이 없으면 사용
        break;
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json({ error: 'Failed to generate unique nickname' }, { status: 500 });
    }

    // 프로필 업데이트
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        randomNickname: nickname,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

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
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('randomNickname', suggestion)
        .single();

      if (!existing) {
        availableSuggestions.push(suggestion);
      }
    }

    // 부족하면 추가 생성
    while (availableSuggestions.length < 5) {
      const newNickname = generateRandomNickname();
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('randomNickname', newNickname)
        .single();

      if (!existing && !availableSuggestions.includes(newNickname)) {
        availableSuggestions.push(newNickname);
      }
    }

    return NextResponse.json({
      suggestions: availableSuggestions.slice(0, 5),
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
