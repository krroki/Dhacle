/**
 * API Route Authentication Helper
 * 
 * Phase 1: Security Emergency - All API routes must have authentication
 * 
 * Usage:
 * ```typescript
 * const user = await requireAuth(request);
 * if (!user) {
 *   return NextResponse.json(
 *     { error: 'User not authenticated' },
 *     { status: 401 }
 *   );
 * }
 * // Use 'user' for authenticated logic
 * ```
 */

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

/**
 * Require authentication for API routes
 * Returns user if authenticated, or null if not
 * 
 * @param {NextRequest} request - The incoming request object
 * @returns {Promise<User | null>} User object if authenticated, null otherwise
 */
export async function requireAuth(request: NextRequest): Promise<User | null> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // Use getUser() for server-side token verification (never getSession)
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      const path = request.nextUrl.pathname;
      logger.warn(`Unauthorized access attempt to ${path}`);
      return null;
    }
    
    // Authentication successful
    return user;
  } catch (error) {
    logger.error('Authentication check failed:', error);
    return null;
  }
}

/**
 * Check if user has specific role
 * 
 * @param userId - User ID to check
 * @param requiredRole - Required role (e.g., 'admin', 'moderator')
 * @returns {Promise<boolean>} True if user has the required role
 */
export async function hasRole(userId: string, requiredRole: string): Promise<boolean> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    return data.role === requiredRole;
  } catch (error) {
    logger.error('Role check failed:', error);
    return false;
  }
}

/**
 * Require specific role for API routes
 * 
 * @param request - The incoming request object
 * @param requiredRole - Required role (e.g., 'admin')
 * @returns {Promise<User | null>} User object if authenticated with role, null otherwise
 */
export async function requireRole(request: NextRequest, requiredRole: string): Promise<User | null> {
  const user = await requireAuth(request);
  
  // If not authenticated, return null
  if (!user) {
    return null;
  }
  
  // Check role
  const hasRequiredRole = await hasRole(user.id, requiredRole);
  
  if (!hasRequiredRole) {
    const path = request.nextUrl.pathname;
    logger.warn(`Access denied to ${path} for user ${user.id} - missing role: ${requiredRole}`);
    return null;
  }
  
  return user;
}

/**
 * Optional authentication - returns user if authenticated, null otherwise
 * Does not return error response
 * 
 * @returns {Promise<User | null>} User object or null
 */
export async function optionalAuth(): Promise<User | null> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    logger.error('Optional auth failed:', error);
    return null;
  }
}