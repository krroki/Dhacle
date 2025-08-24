// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

// POST: Check username availability
export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createSupabaseRouteHandlerClient();

  try {
    // 선택적 인증 체크 - 로그인 사용자와 비로그인 사용자 모두 사용 가능
    const {
      data: { user: _user },
    } = await supabase.auth.getUser();

    // Parse request body
    const body = await request.json();
    const { username } = body;

    // Validate username
    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Validate username format (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    // Check if username exists
    const { data: existing_user, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Failed to check username' }, { status: 500 });
    }

    // Return availability status
    return NextResponse.json({
      available: !existing_user,
      username,
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
