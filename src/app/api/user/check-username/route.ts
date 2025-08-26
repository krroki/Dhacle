// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

// POST: Check username availability
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const _user = await requireAuth(request);
    if (!_user) {
      logger.warn('Unauthorized access attempt to user/check-username');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

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
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
