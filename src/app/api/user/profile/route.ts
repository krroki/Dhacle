// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';
import type { Database } from '@/types';

// GET: Get user profile
export async function GET(): Promise<NextResponse> {
  const supabase = await createSupabaseRouteHandlerClient();

  try {
    // Get authenticated user
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();

    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profile_error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile_error) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create or update user profile (for onboarding)
export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createSupabaseRouteHandlerClient();

  try {
    // Get authenticated user
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();

    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      username,
      work_type: _work_type,
      job_category,
      current_income,
      target_income,
      experience_level,
    } = body;

    // Validate username format
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Invalid username format' }, { status: 400 });
    }

    // Check if profile exists (users 테이블 사용)
    const { data: existing_profile } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    let result;

    if (existing_profile) {
      // Update existing profile
      result = await supabase
        .from('users')
        .update({
          username,
          // work_type, // TODO: Use work_type (snake_case) when field is properly implemented
          job_category,
          current_income,
          target_income,
          experience_level,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();
    } else {
      // Create new profile
      result = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username,
          // work_type, // TODO: Use work_type (snake_case) when field is properly implemented
          job_category: job_category, // Fixed: use snake_case
          current_income: current_income, // Fixed: use snake_case
          target_income: target_income, // Fixed: use snake_case
          experience_level: experience_level, // Fixed: use snake_case
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    }

    if (result.error) {
      // Check for unique constraint violation
      if (result.error.code === '23505' && result.error.message.includes('username')) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }

      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
    }

    return NextResponse.json({ profile: result.data });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update user profile
export async function PUT(request: Request): Promise<NextResponse> {
  const supabase = await createSupabaseRouteHandlerClient();

  try {
    // Get authenticated user
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();

    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      username,
      full_name,
      channel_name,
      channel_url,
      work_type: _work_type,
      job_category,
      current_income,
      target_income,
      experience_level,
    } = body;

    // Validate username format
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Invalid username format' }, { status: 400 });
    }

    // Update user profile
    const { data: updated_profile, error: update_error } = await supabase
      .from('users')
      .update({
        username,
        full_name,
        channel_name,
        channel_url,
        // work_type, // TODO: Use work_type (snake_case) when field is properly implemented
        job_category,
        current_income,
        target_income,
        experience_level,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (update_error) {
      // Check for unique constraint violation
      if (update_error.code === '23505' && update_error.message.includes('username')) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }

      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ profile: updated_profile });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
