// Comprehensive Health Check System for Dhacle
// Based on Spatie Laravel Health patterns, adapted for Next.js

import { env } from '@/env';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';

export type HealthStatus = 'healthy' | 'warning' | 'unhealthy';

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  message: string;
  meta?: Record<string, unknown>;
  duration?: number;
  timestamp: string;
  error?: string;
}

export interface HealthReport {
  overall_status: HealthStatus;
  checks: HealthCheckResult[];
  summary: {
    healthy: number;
    warning: number;
    unhealthy: number;
    total: number;
  };
  execution_time: number;
  timestamp: string;
}

export abstract class HealthCheck {
  abstract name: string;
  abstract run(): Promise<HealthCheckResult>;

  protected createResult(
    status: HealthStatus,
    message: string,
    meta?: Record<string, unknown>
  ): HealthCheckResult {
    return {
      name: this.name,
      status,
      message,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  protected async measureDuration<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  }
}

// Database Health Check
export class DatabaseHealthCheck extends HealthCheck {
  name = 'database';

  async run(): Promise<HealthCheckResult> {
    const start = performance.now();
    
    try {
      const supabase = await createSupabaseRouteHandlerClient();
      
      // Test basic connection
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (userError) throw userError;

      // Test auth functionality
      const { error: authError } = await supabase.auth.getUser();
      
      const duration = performance.now() - start;
      
      return this.createResult(
        'healthy',
        'Database connection successful',
        {
          tables_accessible: true,
          auth_working: !authError,
          sample_users: users?.length || 0,
          duration,
        }
      );
    } catch (error) {
      const duration = performance.now() - start;
      return this.createResult(
        'unhealthy',
        `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { error: error instanceof Error ? error.message : 'Unknown error', duration }
      );
    }
  }
}

// Environment Variables Check
export class EnvironmentHealthCheck extends HealthCheck {
  name = 'environment';

  async run(): Promise<HealthCheckResult> {
    const { result, duration } = await this.measureDuration(async () => {
      const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'YOUTUBE_API_KEY',
      ];

      const missing: string[] = [];
      const present: string[] = [];

      for (const varName of requiredVars) {
        if (process.env[varName]) {
          present.push(varName);
        } else {
          missing.push(varName);
        }
      }

      const status: HealthStatus = missing.length === 0 ? 'healthy' : 'unhealthy';
      const message = missing.length === 0 
        ? `All ${requiredVars.length} required environment variables are present`
        : `Missing ${missing.length} required environment variables`;

      return this.createResult(status, message, {
        required_count: requiredVars.length,
        present_count: present.length,
        missing_count: missing.length,
        missing_variables: missing,
        environment: env.NODE_ENV,
      });
    });
    
    return { ...result, duration: duration };
  }
}

// External Services Check (YouTube API)
export class ExternalServicesHealthCheck extends HealthCheck {
  name = 'external_services';

  async run(): Promise<HealthCheckResult> {
    const { result, duration } = await this.measureDuration(async () => {
      const services = [];

      // YouTube API Test
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&maxResults=1&key=${env.YOUTUBE_API_KEY}`,
          { 
            method: 'GET',
            headers: { 'Accept': 'application/json' },
          }
        );

        services.push({
          name: 'youtube_api',
          status: response.ok ? 'healthy' : 'unhealthy',
          response_code: response.status,
          response_time: 0, // Will be measured by outer duration
        });
      } catch (error) {
        services.push({
          name: 'youtube_api',
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      const healthyServices = services.filter(s => s.status === 'healthy').length;
      const totalServices = services.length;
      
      const status: HealthStatus = 
        healthyServices === totalServices ? 'healthy' :
        healthyServices > 0 ? 'warning' : 'unhealthy';

      return this.createResult(
        status,
        `${healthyServices}/${totalServices} external services are healthy`,
        { services, healthy_count: healthyServices, total_count: totalServices }
      );
    });
    
    return { ...result, duration: duration };
  }
}

// System Resources Check
export class SystemResourcesHealthCheck extends HealthCheck {
  name = 'system_resources';

  async run(): Promise<HealthCheckResult> {
    const { result, duration } = await this.measureDuration(async () => {
      try {
        const memoryUsage = process.memoryUsage();
        const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
        const memoryLimitMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
        const memoryPercentage = Math.round((memoryUsedMB / memoryLimitMB) * 100);

        // Check CPU usage (approximate via Node.js)
        const cpuUsage = process.cpuUsage();
        
        // Determine status based on memory usage
        const status: HealthStatus = 
          memoryPercentage > 90 ? 'unhealthy' :
          memoryPercentage > 70 ? 'warning' : 'healthy';

        return this.createResult(
          status,
          `Memory usage: ${memoryUsedMB}MB (${memoryPercentage}%)`,
          {
            memory: {
              used_mb: memoryUsedMB,
              total_mb: memoryLimitMB,
              percentage: memoryPercentage,
            },
            cpu_usage: cpuUsage,
            uptime_seconds: process.uptime(),
            node_version: process.version,
          }
        );
      } catch (error) {
        return this.createResult(
          'warning',
          'Could not retrieve system resource information',
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    });
    
    return { ...result, duration: duration };
  }
}

// File System Check
export class FileSystemHealthCheck extends HealthCheck {
  name = 'file_system';

  async run(): Promise<HealthCheckResult> {
    const { result, duration } = await this.measureDuration(async () => {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        
        // Test write permissions in temp directory
        const testFile = path.join(process.cwd(), '.health-check-test');
        const testContent = `Health check test - ${Date.now()}`;
        
        await fs.writeFile(testFile, testContent);
        const readContent = await fs.readFile(testFile, 'utf-8');
        await fs.unlink(testFile);

        const canWrite = readContent === testContent;

        return this.createResult(
          canWrite ? 'healthy' : 'unhealthy',
          canWrite ? 'File system read/write operations successful' : 'File system write test failed',
          {
            write_test: canWrite,
            test_file_path: testFile,
            working_directory: process.cwd(),
          }
        );
      } catch (error) {
        return this.createResult(
          'unhealthy',
          'File system access failed',
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    });
    
    return { ...result, duration: duration };
  }
}

// Main Health Checker
export class HealthChecker {
  private checks: HealthCheck[] = [
    new DatabaseHealthCheck(),
    new EnvironmentHealthCheck(),
    new ExternalServicesHealthCheck(),
    new SystemResourcesHealthCheck(),
    new FileSystemHealthCheck(),
  ];

  async runAll(): Promise<HealthReport> {
    const startTime = performance.now();
    
    // Run all checks in parallel for better performance
    const checkResults = await Promise.all(
      this.checks.map(check => 
        check.run().catch(error => ({
          name: check.name,
          status: 'unhealthy' as HealthStatus,
          message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        }))
      )
    );

    const executionTime = performance.now() - startTime;

    // Calculate summary
    const summary = {
      healthy: checkResults.filter(r => r.status === 'healthy').length,
      warning: checkResults.filter(r => r.status === 'warning').length,
      unhealthy: checkResults.filter(r => r.status === 'unhealthy').length,
      total: checkResults.length,
    };

    // Determine overall status
    const overallStatus: HealthStatus = 
      summary.unhealthy > 0 ? 'unhealthy' :
      summary.warning > 0 ? 'warning' : 'healthy';

    return {
      overall_status: overallStatus,
      checks: checkResults,
      summary,
      execution_time: Math.round(executionTime),
      timestamp: new Date().toISOString(),
    };
  }

  async runCheck(checkName: string): Promise<HealthCheckResult | null> {
    const check = this.checks.find(c => c.name === checkName);
    if (!check) return null;
    
    try {
      return await check.run();
    } catch (error) {
      return {
        name: checkName,
        status: 'unhealthy',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getAvailableChecks(): string[] {
    return this.checks.map(c => c.name);
  }
}