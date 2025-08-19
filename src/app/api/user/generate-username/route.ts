import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { generateRandomUsername } from '@/lib/utils/username-generator';
import type { Database } from '@/types/database';

// POST: Generate unique username
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

    // 이미 username이 있는지 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    if (profile?.username) {
      return NextResponse.json(
        {
          error: 'Username already exists',
          username: profile.username,
        },
        { status: 400 }
      );
    }

    // 중복되지 않는 username 생성 (최대 10회 시도)
    let username = '';
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      username = generateRandomUsername();

      // 중복 체크
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (!existing) {
        // 중복이 없으면 사용
        break;
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json({ error: 'Failed to generate unique username' }, { status: 500 });
    }

    return NextResponse.json({
      username: username,
      message: 'Username generated successfully',
    });
  } catch (error) {
    console.error('Error generating username:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
