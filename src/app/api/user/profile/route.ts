// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { snakeToCamelCase } from '@/types';

// GET: Get user profile
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to User Profile API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(snakeToCamelCase({ profile }));
  } catch (error) {
    logger.error('Failed to get user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create or update user profile (for onboarding)
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to User Profile API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // Parse request body
    const body = await request.json();
    // Convert from camelCase (frontend) to snake_case (DB)
    const {
      username,
      // workType, // TODO: Use when work_type field is properly implemented
      jobCategory,
      currentIncome,
      targetIncome,
      experienceLevel,
    } = body;

    // Validate username format
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Invalid username format' }, { status: 400 });
    }

    // Check if profile exists (users 테이블 사용)
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    let result;

    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('users')
        .update({
          username,
          // work_type: workType, // TODO: Use work_type when field is properly implemented
          job_category: jobCategory,
          current_income: currentIncome,
          target_income: targetIncome,
          experience_level: experienceLevel,
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
          // work_type: workType, // TODO: Use work_type when field is properly implemented
          job_category: jobCategory,
          current_income: currentIncome,
          target_income: targetIncome,
          experience_level: experienceLevel,
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

    return NextResponse.json(snakeToCamelCase({ profile: result.data }));
  } catch (error) {
    logger.error('Failed to create/update user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update user profile
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to User Profile API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // Parse request body
    const body = await request.json();
    // Convert from camelCase (frontend) to snake_case (DB)
    const {
      username,
      fullName,
      channelName,
      channelUrl,
      // workType, // TODO: Use when work_type field is properly implemented
      jobCategory,
      currentIncome,
      targetIncome,
      experienceLevel,
    } = body;

    // Validate username format
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Invalid username format' }, { status: 400 });
    }

    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({
        username,
        full_name: fullName,
        channel_name: channelName,
        channel_url: channelUrl,
        // work_type: workType, // TODO: Use work_type when field is properly implemented
        job_category: jobCategory,
        current_income: currentIncome,
        target_income: targetIncome,
        experience_level: experienceLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      // Check for unique constraint violation
      if (updateError.code === '23505' && updateError.message.includes('username')) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }

      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json(snakeToCamelCase({ profile: updatedProfile }));
  } catch (error) {
    logger.error('Failed to update user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
