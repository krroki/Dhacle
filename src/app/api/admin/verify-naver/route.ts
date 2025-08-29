// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { z } from 'zod';
import { validateRequestBody } from '@/lib/security/validation-schemas';

// Request body schema
const verifyNaverSchema = z.object({
  cafeUrl: z.string().url().startsWith('https://cafe.naver.com/'),
  memberLevel: z.enum(['manager', 'staff', 'admin', 'member']),
  nickname: z.string().min(1).max(50).optional()
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to Admin Verify API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // Step 2: Parse and validate request body
    const validation = await validateRequestBody(request, verifyNaverSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error },
        { status: 400 }
      );
    }
    
    const { cafeUrl, memberLevel, nickname } = validation.data;
    
    // Step 3: Verify Naver Cafe membership
    const isValid = await verifyNaverCafeMembership({
      userId: user.id,
      cafeUrl,
      memberLevel,
      nickname
    });
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Verification failed', message: 'Could not verify Naver Cafe membership' },
        { status: 400 }
      );
    }
    
    // Step 4: Grant admin role using service role client
    const serviceSupabase = createServiceRoleClient();
    
    // Update users table (naver_cafe columns are in users table, not profiles VIEW)
    const { error: profileError } = await serviceSupabase
      .from('users')
      .update({
        cafe_member_url: cafeUrl,
        naver_cafe_verified: true,
        naver_cafe_verified_at: new Date().toISOString(),
        naver_cafe_nickname: nickname || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
      
    if (profileError) {
      logger.error('Failed to update user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to grant admin role' },
        { status: 500 }
      );
    }
    
    // Step 5: Log the approval (if yl_approval_logs table exists)
    const { error: logError } = await serviceSupabase
      .from('yl_approval_logs')
      .insert({
        user_id: user.id,
        channel_id: 'admin_verification',
        action: 'approve',
        reason: 'Naver Cafe verification successful',
        metadata: {
          cafe_url: cafeUrl,
          member_level: memberLevel,
          nickname
        }
      });
      
    if (logError) {
      logger.warn('Failed to create approval log: ' + logError.message);
      // Not a critical error, continue
    }
    
    logger.info(`Admin role granted to user ${user.id} after Naver verification`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin role granted successfully',
      data: {
        userId: user.id,
        isAdmin: true,
        verifiedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('Admin verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Verify Naver Cafe membership
 * In production, this would integrate with Naver API
 */
async function verifyNaverCafeMembership(params: {
  userId: string;
  cafeUrl: string;
  memberLevel: string;
  nickname?: string;
}): Promise<boolean> {
  const { cafeUrl, memberLevel } = params;
  
  // List of authorized cafes
  const authorizedCafes = [
    'https://cafe.naver.com/dhacle',
    'https://cafe.naver.com/aidhacle',
    'https://cafe.naver.com/influencermarket',
    'https://cafe.naver.com/youtubecreators'
  ];
  
  // Check if cafe is authorized
  if (!authorizedCafes.some(cafe => cafeUrl.startsWith(cafe))) {
    logger.warn(`Unauthorized cafe URL attempted: ${cafeUrl}`);
    return false;
  }
  
  // Verify member level requirements
  const requiredLevels = ['manager', 'staff', 'admin'];
  if (!requiredLevels.includes(memberLevel)) {
    logger.warn(`Insufficient member level: ${memberLevel}`);
    return false;
  }
  
  // In production, implement actual Naver API verification here:
  // 1. OAuth authentication with Naver
  // 2. Fetch user's cafe membership status
  // 3. Verify member level and activity
  
  // For now, return true for testing
  // TODO: Implement actual Naver API integration
  logger.info(`Naver verification passed for cafe: ${cafeUrl}, level: ${memberLevel}`);
  return true;
}

// GET method to check current admin status
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // Check current admin status in users table (naver_cafe columns are there)
    const supabase = await createSupabaseRouteHandlerClient();
    const { data, error } = await supabase
      .from('users')
      .select('cafe_member_url, naver_cafe_verified, naver_cafe_verified_at, naver_cafe_nickname')
      .eq('id', user.id)
      .single();
      
    if (error || !data) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    const verificationData = data.cafe_member_url ? {
      cafeUrl: data.cafe_member_url,
      verified: data.naver_cafe_verified,
      verifiedAt: data.naver_cafe_verified_at,
      nickname: data.naver_cafe_nickname
    } : null;
    
    // Admin status is determined by naver_cafe_verified
    const isAdmin = data.naver_cafe_verified === true;
    
    return NextResponse.json({
      isAdmin,
      verification: verificationData
    });
    
  } catch (error) {
    logger.error('Admin status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}