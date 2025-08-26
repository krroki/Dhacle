// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { generateRandomUsername } from '@/lib/utils/username-generator';
import type { Database } from '@/types';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

// POST: Generate unique username
export async function POST(_request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(_request);
    if (!user) {
      logger.warn('Unauthorized access attempt to user/generate-username');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = (await createSupabaseRouteHandlerClient()) as SupabaseClient<Database>;

    // 이미 username이 있는지 확인
    const { data: profile, error: profile_error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (profile_error && profile_error.code !== 'PGRST116') {
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
    const max_attempts = 10;

    while (attempts < max_attempts) {
      username = generateRandomUsername();

      // 중복 체크
      const { data: existing, error: _checkError } = await supabase
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

    if (attempts >= max_attempts) {
      return NextResponse.json({ error: 'Failed to generate unique username' }, { status: 500 });
    }

    return NextResponse.json({
      username: username,
      message: 'Username generated successfully',
    });
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
