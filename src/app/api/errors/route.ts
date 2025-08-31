// Error Monitoring API for Dhacle
// Provides error statistics and monitoring endpoints
// Admin authentication required

import { NextResponse } from 'next/server';
import { ErrorHandler } from '@/lib/error/error-handler';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  // Admin authentication required
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }
  
  // Check admin role
  const { data: userRole } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (userRole?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  try {
    const stats = ErrorHandler.getErrorStats();
    const recentErrors = ErrorHandler.getRecentErrors(10);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recent_errors: recentErrors.map(error => ({
          code: error.code,
          severity: error.severity,
          user_message: error.userMessage,
          timestamp: error.context.timestamp,
          component: error.context.component,
          action: error.context.action,
          can_retry: error.canRetry,
        })),
        system_health: {
          error_rate: stats.total > 0 ? stats.by_severity.critical + stats.by_severity.high : 0,
          total_errors: stats.total,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch error stats:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'MONITORING_ERROR',
          message: 'Failed to retrieve error statistics',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(): Promise<NextResponse> {
  // Admin authentication required
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }
  
  // Check admin role
  const { data: userRole } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (userRole?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  try {
    ErrorHandler.clearLogs();
    
    return NextResponse.json({
      success: true,
      message: 'Error logs cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to clear error logs:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CLEAR_LOGS_ERROR',
          message: 'Failed to clear error logs',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}