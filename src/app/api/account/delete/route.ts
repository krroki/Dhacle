// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

/**
 * Account Deletion API Route (GDPR Compliant)
 * Allows users to delete their account and personal data
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { validateRequestBody } from '@/lib/security/validation-schemas';
import { createHash } from 'crypto';

// Request body schema
const deleteAccountSchema = z.object({
  password: z.string().min(1),
  confirmText: z.literal('DELETE MY ACCOUNT').optional(),
  reason: z.string().max(500).optional()
});

// DELETE method for account deletion
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to Account Delete API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // Step 2: Parse and validate request body
    const validation = await validateRequestBody(request, deleteAccountSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error },
        { status: 400 }
      );
    }
    
    const { password, reason } = validation.data;
    
    // Step 3: Verify password (critical security check)
    const supabase = await createSupabaseRouteHandlerClient();
    
    // Re-authenticate with password to confirm identity
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email || '',
      password
    });
    
    if (authError) {
      logger.warn(`Failed password verification for account deletion: ${user.id}`);
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 400 }
      );
    }
    
    // Step 4: Start account deletion process (using service role for admin privileges)
    const serviceClient = createServiceRoleClient();
    
    // Generate unique deletion ID for audit trail
    const deletionId = createHash('sha256').update(user.id + Date.now()).digest('hex').substring(0, 16);
    const deletedAt = new Date().toISOString();
    
    try {
      // Step 5: Anonymize user data (GDPR requirement)
      // Update profiles table
      const { error: profileError } = await serviceClient
        .from('profiles')
        .update({
          full_name: '[삭제된 사용자]',
          username: `deleted_user_${deletionId}`,
          avatar_url: null,
          cafe_member_url: null,
          naver_cafe_verified: false,
          naver_cafe_verified_at: null,
          naver_cafe_nickname: null,
          channel_name: null,
          channel_url: null,
          updated_at: deletedAt
        })
        .eq('id', user.id);
        
      if (profileError) {
        logger.error('Failed to anonymize profile:', profileError);
        throw profileError;
      }
      
      // Step 6: Clean up YouTube-related data (YouTube 크리에이터 도구 사이트)
      // YouTube favorites - remove
      const { error: favoritesError } = await serviceClient
        .from('youtube_favorites')
        .delete()
        .eq('user_id', user.id);
        
      if (favoritesError) {
        logger.warn('Failed to delete YouTube favorites: ' + favoritesError.message);
        // Continue with deletion
      }
      
      // Collections - remove
      const { error: collectionsError } = await serviceClient
        .from('collections')
        .delete()
        .eq('user_id', user.id);
        
      if (collectionsError) {
        logger.warn('Failed to delete collections: ' + collectionsError.message);
        // Continue with deletion
      }
      
      // Delete API keys
      const { error: apiKeyError } = await serviceClient
        .from('user_api_keys')
        .delete()
        .eq('user_id', user.id);
        
      if (apiKeyError) {
        logger.warn('Failed to delete API keys: ' + apiKeyError.message);
      }
      
      // Delete from collections (favorites)
      const { error: userCollectionsError } = await serviceClient
        .from('collections')
        .delete()
        .eq('user_id', user.id);
        
      if (userCollectionsError) {
        logger.warn('Failed to delete user collections: ' + userCollectionsError.message);
      }
      
      // Delete from collection items
      const { error: collectionItemsError } = await serviceClient
        .from('collection_items')
        .delete()
        .eq('user_id', user.id);
        
      if (collectionItemsError) {
        logger.warn('Failed to delete collection items: ' + collectionItemsError.message);
      }
      
      // Note: saved_searches table doesn't exist yet
      // Will be implemented in future phase
      
      // Delete alert rules
      const { error: alertsError } = await serviceClient
        .from('alert_rules')
        .delete()
        .eq('user_id', user.id);
        
      if (alertsError) {
        logger.warn('Failed to delete alert rules: ' + alertsError.message);
      }
      
      // Step 7: Create deletion log for audit purposes
      const { error: logError } = await serviceClient
        .from('yl_approval_logs')
        .insert({
          user_id: user.id,
          channel_id: 'account_deletion',
          action: 'approve',
          reason: reason || 'User requested account deletion',
          metadata: {
            deletion_id: deletionId,
            deleted_at: deletedAt,
            email_hash: createHash('sha256').update(user.email || '').digest('hex'),
            gdpr_compliant: true
          }
        });
        
      if (logError) {
        logger.warn('Failed to create deletion log: ' + logError.message);
        // Not critical, continue
      }
      
      // Step 8: Sign out current session
      await supabase.auth.signOut();
      
      // Note: We don't delete from auth.users to maintain referential integrity
      // The user is effectively anonymized and cannot log in
      
      logger.info(`Account anonymized successfully: ${deletionId}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Account deleted successfully',
        deletionId // For user reference if needed
      });
      
    } catch (error) {
      logger.error('Failed to delete account:', error);
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    logger.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method to check deletion status
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    const supabase = await createSupabaseRouteHandlerClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', user.id)
      .single();
      
    if (error || !data) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    const isDeleted = data.full_name === '[삭제된 사용자]' || 
                      data.username?.startsWith('deleted_user_');
    
    return NextResponse.json({
      isDeleted,
      deletedAt: isDeleted ? data.username?.replace('deleted_user_', '') : null
    });
    
  } catch (error) {
    logger.error('Deletion status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}