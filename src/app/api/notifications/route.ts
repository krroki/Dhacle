/**
 * API Route: /api/notifications
 * Purpose: User notification management
 * Created: 2025-08-28
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { logger } from '@/lib/logger';
import type { Notification } from '@/types';

export const runtime = 'nodejs';

/**
 * GET /api/notifications
 * Get user notifications
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // Authentication check (required)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn('Unauthorized access attempt to notifications API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unread') === 'true';

    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    // Apply pagination
    const { data: notifications, error, count } = await query
      .range(offset, offset + limit - 1)
      .returns<Notification[]>();

    if (error) {
      logger.error('Failed to fetch notifications:', error);
      throw error;
    }

    // Get unread count separately
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
        },
        unreadCount: unreadCount || 0,
      },
    });
  } catch (error) {
    logger.error('API error in notifications route:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification (admin only)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // Authentication check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, message, type = 'info', targetUserId } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Create notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId || user.id,
        title,
        message,
        type,
        is_read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create notification:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
    }, { status: 201 });
  } catch (error) {
    logger.error('API error in notifications POST:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create notification',
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications
 * Mark notifications as read
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // Authentication check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { notificationIds, markAll = false } = body;

    let query = supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id);

    if (markAll) {
      // Mark all as read
      query = query.eq('is_read', false);
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      query = query.in('id', notificationIds);
    } else {
      return NextResponse.json(
        { error: 'Either notificationIds or markAll must be provided' },
        { status: 400 }
      );
    }

    const { error } = await query;

    if (error) {
      logger.error('Failed to update notifications:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read',
    });
  } catch (error) {
    logger.error('API error in notifications PUT:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update notifications',
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Delete notifications
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // Authentication check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Delete notification
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      logger.error('Failed to delete notification:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    logger.error('API error in notifications DELETE:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete notification',
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}