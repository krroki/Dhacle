// Comprehensive Health Check API for Dhacle
// Provides detailed system status monitoring

// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { HealthChecker } from '@/lib/health/health-checker';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'detailed'; // detailed, simple, json
    const fresh = searchParams.get('fresh') === 'true';
    const checkName = searchParams.get('check');

    const healthChecker = new HealthChecker();

    // Run specific check if requested
    if (checkName) {
      const result = await healthChecker.runCheck(checkName);
      if (!result) {
        return NextResponse.json(
          { 
            error: 'Health check not found', 
            available_checks: healthChecker.getAvailableChecks() 
          },
          { status: 404 }
        );
      }
      return NextResponse.json(result);
    }

    // Run all health checks
    const healthReport = await healthChecker.runAll();

    // Return simple format for container orchestration
    if (format === 'simple') {
      const statusCode = healthReport.overall_status === 'healthy' ? 200 : 503;
      return NextResponse.json(
        { 
          status: healthReport.overall_status,
          message: `${healthReport.summary.healthy}/${healthReport.summary.total} checks passing`
        },
        { status: statusCode }
      );
    }

    // Return detailed format (default)
    const statusCode = healthReport.overall_status === 'unhealthy' ? 503 : 200;
    
    return NextResponse.json(healthReport, { 
      status: statusCode,
      headers: {
        'Cache-Control': fresh ? 'no-cache' : 'public, max-age=60',
        'X-Health-Status': healthReport.overall_status,
        'X-Health-Execution-Time': healthReport.execution_time.toString(),
      }
    });

  } catch (error: unknown) {
    console.error('Health check system error:', error);
    
    return NextResponse.json(
      {
        overall_status: 'unhealthy',
        error: 'Health check system failure',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
