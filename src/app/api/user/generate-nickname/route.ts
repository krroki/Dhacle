// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { generateMultipleNicknames, generateRandomNickname } from '@/lib/utils/nickname-generator';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

export async function POST(_request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(_request);
    if (!user) {
      logger.warn('Unauthorized access attempt to user/generate-nickname POST');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // 이미 랜덤 닉네임이 있는지 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('random_nickname')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    if (profile?.random_nickname) {
      return NextResponse.json(
        {
          error: 'Random nickname already exists',
          nickname: profile.random_nickname,
        },
        { status: 400 }
      );
    }

    // 중복되지 않는 닉네임 생성 (최대 10회 시도)
    let nickname = '';
    let attempts = 0;
    const max_attempts = 10;

    while (attempts < max_attempts) {
      nickname = generateRandomNickname();

      // 중복 체크
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('random_nickname', nickname)
        .single();

      if (checkError || !existing) {
        // 중복이 없으면 사용
        break;
      }

      attempts++;
    }

    if (attempts >= max_attempts) {
      return NextResponse.json({ error: 'Failed to generate unique nickname' }, { status: 500 });
    }

    // 프로필 업데이트
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        random_nickname: nickname,
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
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 닉네임 제안 목록 가져오기
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(_request);
    if (!user) {
      logger.warn('Unauthorized access attempt to user/generate-nickname GET');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // 5개의 닉네임 제안 생성
    const suggestions = generateMultipleNicknames(5);

    // 중복 체크
    const available_suggestions = [];
    for (const suggestion of suggestions) {
      // 중복 체크
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('random_nickname', suggestion)
        .single();

      if (!existing) {
        available_suggestions.push(suggestion);
      }
    }

    // 부족하면 추가 생성
    while (available_suggestions.length < 5) {
      const new_nickname = generateRandomNickname();
      // 중복 체크
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('random_nickname', new_nickname)
        .single();

      if (!existing && !available_suggestions.includes(new_nickname)) {
        available_suggestions.push(new_nickname);
      }
      if (!available_suggestions.includes(new_nickname)) {
        available_suggestions.push(new_nickname); // 임시로 중복만 체크
      }
    }

    return NextResponse.json({
      suggestions: available_suggestions.slice(0, 5),
    });
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
