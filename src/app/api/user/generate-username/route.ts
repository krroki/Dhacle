// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { generateRandomUsername } from '@/lib/utils/username-generator';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { 
  createSuccessResponse, 
  createInternalServerErrorResponse, 
  createValidationErrorResponse 
} from '@/lib/api-error-utils';

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

    const supabase = await createSupabaseRouteHandlerClient();

    // 이미 username이 있는지 확인
    const { data: profile, error: profile_error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (profile_error && profile_error.code !== 'PGRST116') {
      logger.error('Failed to fetch user profile:', profile_error);
      return createInternalServerErrorResponse(
        'Failed to fetch user profile',
        'PROFILE_FETCH_FAILED'
      );
    }

    if (profile?.username) {
      return createValidationErrorResponse(
        'Username already exists for this user',
        { username: profile.username }
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
      return createInternalServerErrorResponse(
        'Failed to generate unique username after multiple attempts',
        'USERNAME_GENERATION_EXHAUSTED'
      );
    }

    return createSuccessResponse({
      username: username,
    }, 'Username generated successfully');
  } catch (error) {
    logger.error('API error in generate-username route:', error);
    return createInternalServerErrorResponse(
      'Username generation failed due to server error',
      'USERNAME_GENERATION_FAILED'
    );
  }
}
