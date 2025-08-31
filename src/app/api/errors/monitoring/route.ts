// Error Monitoring API - Real-time error metrics and alerts
// Provides comprehensive error monitoring dashboard data

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { errorMonitoring } from '@/lib/error/error-monitoring';
import { ErrorHandler } from '@/lib/error/error-handler';

// Next.js 15 Route Handler with standardized signature
export async function GET(
  request: NextRequest,
  _context: { params: Record<string, string> }
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'metrics';
  const timeframe = searchParams.get('timeframe') as 'hour' | 'day' | 'week' || 'day';

  const supabase = await createSupabaseRouteHandlerClient();
  
  // Authentication check - getUser pattern
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  // Admin-only access for detailed error monitoring
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  switch (type) {
    case 'metrics':
      const metrics = errorMonitoring.getMetrics();
      return NextResponse.json({
        data: {
          metrics,
          timestamp: new Date().toISOString(),
        }
      });

    case 'health':
      const health = errorMonitoring.getSystemHealth();
      return NextResponse.json({
        data: {
          health,
          user_friendly: errorMonitoring.getUserFriendlyReport(),
          timestamp: new Date().toISOString(),
        }
      });

    case 'alerts':
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Admin access required for alerts' },
          { status: 403 }
        );
      }
      
      const alerts = errorMonitoring.getActiveAlerts();
      return NextResponse.json({
        data: {
          alerts,
          count: alerts.length,
          timestamp: new Date().toISOString(),
        }
      });

    case 'trends':
      const trends = errorMonitoring.getErrorTrends(timeframe);
      return NextResponse.json({
        data: {
          trends,
          timeframe,
          timestamp: new Date().toISOString(),
        }
      });

    case 'status':
      // Public status page data (no sensitive information)
      const publicHealth = errorMonitoring.getSystemHealth();
      const publicReport = errorMonitoring.getUserFriendlyReport();
      
      return NextResponse.json({
        data: {
          status: publicHealth.status,
          summary: publicReport.summary,
          estimated_resolution: publicReport.estimatedResolution,
          what_you_can_do: publicReport.whatYouCanDo,
          last_updated: new Date().toISOString(),
        }
      });

    default:
      return NextResponse.json(
        { error: `Invalid type parameter. Available types: metrics, health, alerts, trends, status` },
        { status: 400 }
      );
  }
}


// Test endpoint for triggering sample errors (development only)
// Next.js 15 Route Handler with standardized signature
export async function POST(
  request: NextRequest,
  _context: { params: Record<string, string> }
): Promise<NextResponse> {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Test endpoint only available in development' },
      { status: 403 }
    );
  }

  const supabase = await createSupabaseRouteHandlerClient();
  
  // Authentication check - getUser pattern
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { errorType = 'UNKNOWN_ERROR' } = body;

  // Valid error types for test endpoint
  const VALID_ERROR_TYPES = [
    'UNKNOWN_ERROR',
    'AUTH_REQUIRED', 
    'AUTH_INVALID',
    'VALIDATION_ERROR',
    'NETWORK_ERROR',
    'DATABASE_ERROR'
  ] as const;
  
  type ValidErrorType = typeof VALID_ERROR_TYPES[number];
  
  function isValidErrorType(type: unknown): type is ValidErrorType {
    return typeof type === 'string' && 
           VALID_ERROR_TYPES.includes(type as ValidErrorType);
  }

  // Validate error type
  if (!isValidErrorType(errorType)) {
    return NextResponse.json(
      { error: `Invalid error type. Valid types: ${VALID_ERROR_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  // Create test error with validated type
  const testError = ErrorHandler.createError(errorType, {
    component: 'test-api',
    action: 'generate_test_error',
    metadata: {
      test: true,
      timestamp: new Date().toISOString(),
    },
  });

  // Track in monitoring system
  errorMonitoring.trackError(testError);

  // Attempt recovery if applicable
  if (testError.canRetry) {
    const recoverySuccess = await errorMonitoring.attemptRecovery(testError);
    return NextResponse.json({
      data: {
        message: 'Test error generated and recovery attempted',
        error: testError,
        recovery_success: recoverySuccess,
        timestamp: new Date().toISOString(),
      }
    });
  }

  return NextResponse.json({
    data: {
      message: 'Test error generated',
      error: testError,
      timestamp: new Date().toISOString(),
    }
  });
}

