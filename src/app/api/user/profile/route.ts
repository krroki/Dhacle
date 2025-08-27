// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { snakeToCamelCase } from '@/types';
import { profileUpdateSchema, createValidationErrorResponse } from '@/lib/security/validation-schemas';

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

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      // If profile doesn't exist, create one
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
      
      return NextResponse.json(snakeToCamelCase({ profile: newProfile }));
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
      workType,
      jobCategory,
      currentIncome,
      targetIncome,
      experienceLevel,
    } = body;

    // Validate username format
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Invalid username format' }, { status: 400 });
    }

    // Check if profile exists (profiles 테이블 사용)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    let result;

    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('profiles')
        .update({
          username,
          work_type: workType,
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
          work_type: workType,
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

    // Parse and validate request body
    const body = await request.json();
    
    // Validate with Zod schema
    const validation = profileUpdateSchema.safeParse(body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }
    
    // Use validated data
    const {
      username,
      fullName,
      channelName,
      channelUrl,
      workType,
      jobCategory,
      currentIncome,
      targetIncome,
      experienceLevel,
      avatarUrl,
      naverCafeNickname,
      naverCafeMemberUrl
    } = validation.data;

    // Validate username format
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Invalid username format' }, { status: 400 });
    }

    // Build update object only with provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };
    
    if (username !== undefined) updateData.username = username;
    if (fullName !== undefined) updateData.full_name = fullName;
    if (channelName !== undefined) updateData.channel_name = channelName;
    if (channelUrl !== undefined) updateData.channel_url = channelUrl;
    if (workType !== undefined) updateData.work_type = workType;
    if (jobCategory !== undefined) updateData.job_category = jobCategory;
    if (currentIncome !== undefined) updateData.current_income = currentIncome;
    if (targetIncome !== undefined) updateData.target_income = targetIncome;
    if (experienceLevel !== undefined) updateData.experience_level = experienceLevel;
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;
    if (naverCafeNickname !== undefined) updateData.naver_cafe_nickname = naverCafeNickname;
    if (naverCafeMemberUrl !== undefined) updateData.cafe_member_url = naverCafeMemberUrl;

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    let result;
    if (!existingProfile) {
      // Create new profile
      result = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          ...updateData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
    } else {
      // Update existing profile in profiles table
      result = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();
    }

    if (result.error) {
      // Check for unique constraint violation
      if (result.error.code === '23505' && result.error.message.includes('username')) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }

      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json(snakeToCamelCase({ 
      profile: result.data,
      message: '프로필이 업데이트되었습니다'
    }));
  } catch (error) {
    logger.error('Failed to update user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
