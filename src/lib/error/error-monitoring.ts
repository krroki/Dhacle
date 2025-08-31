// Real-time Error Monitoring System for Dhacle
// Provides error tracking, alerting, and automated recovery

import { ErrorInfo, ErrorSeverity } from './error-handler';
import { env } from '@/env';

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorTrends: {
    lastHour: number;
    lastDay: number;
    lastWeek: number;
  };
  recoverySuccessRate: number;
  averageResolutionTime: number;
}

export interface ErrorAlert {
  id: string;
  type: 'spike' | 'critical' | 'recovery_failure' | 'threshold_exceeded';
  message: string;
  severity: ErrorSeverity;
  timestamp: string;
  affectedUsers: number;
  metadata: Record<string, unknown>;
}

export interface ErrorRecoveryAttempt {
  errorId: string;
  attempt: number;
  strategy: string;
  success: boolean;
  duration_ms: number;
  timestamp: string;
  error?: string;
}

class ErrorMonitoringSystem {
  private errors: Map<string, ErrorInfo> = new Map();
  private recoveryAttempts: ErrorRecoveryAttempt[] = [];
  private alerts: ErrorAlert[] = [];
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByType: {},
    errorsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
    errorTrends: { lastHour: 0, lastDay: 0, lastWeek: 0 },
    recoverySuccessRate: 0,
    averageResolutionTime: 0,
  };

  // Error tracking
  trackError(error: ErrorInfo): void {
    const errorId = this.generateErrorId(error);
    this.errors.set(errorId, error);
    
    // Update metrics
    this.updateMetrics(error);
    
    // Check for alerts
    this.checkAlertConditions(error);
    
    // Log to external monitoring (if configured)
    if (env.NODE_ENV === 'production') {
      this.logToExternalService(error);
    }

    console.log(`🔍 Error tracked: ${error.code} (${error.severity})`);
  }

  // Automated error recovery
  async attemptRecovery(error: ErrorInfo): Promise<boolean> {
    if (!error.canRetry) return false;

    const errorId = this.generateErrorId(error);
    const attempt = this.getRecoveryAttempts(errorId).length + 1;

    // Maximum 3 recovery attempts
    if (attempt > 3) {
      console.warn(`❌ Maximum recovery attempts reached for error: ${error.code}`);
      return false;
    }

    const startTime = Date.now();
    console.log(`🔄 Attempting recovery ${attempt}/3 for error: ${error.code}`);

    try {
      const success = await this.executeRecoveryStrategy(error, attempt);
      const duration = Date.now() - startTime;

      const recoveryAttempt: ErrorRecoveryAttempt = {
        errorId,
        attempt,
        strategy: this.getRecoveryStrategy(error, attempt),
        success,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      };

      this.recoveryAttempts.push(recoveryAttempt);
      
      if (success) {
        console.log(`✅ Recovery successful for error: ${error.code} (${duration}ms)`);
        this.updateRecoveryMetrics();
      } else {
        console.warn(`❌ Recovery failed for error: ${error.code} (attempt ${attempt}/3)`);
        
        // Schedule next attempt if retryAfter is specified
        if (error.retryAfter && attempt < 3) {
          setTimeout(() => {
            this.attemptRecovery(error);
          }, error.retryAfter * 1000);
        }
      }

      return success;
    } catch (recoveryError) {
      const duration = Date.now() - startTime;
      const recoveryAttempt: ErrorRecoveryAttempt = {
        errorId,
        attempt,
        strategy: this.getRecoveryStrategy(error, attempt),
        success: false,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
        error: recoveryError instanceof Error ? recoveryError.message : 'Unknown recovery error',
      };

      this.recoveryAttempts.push(recoveryAttempt);
      console.error(`💥 Recovery attempt failed: ${recoveryError instanceof Error ? recoveryError.message : 'Unknown error'}`);
      
      return false;
    }
  }

  // Real-time metrics
  getMetrics(): ErrorMetrics {
    this.recalculateMetrics();
    return { ...this.metrics };
  }

  // Alert management
  getActiveAlerts(): ErrorAlert[] {
    // Return alerts from last 24 hours
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    return this.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > yesterday
    );
  }

  // Error analysis
  getErrorTrends(timeframe: 'hour' | 'day' | 'week' = 'day'): {
    timestamps: string[];
    errorCounts: number[];
    severityCounts: Record<ErrorSeverity, number[]>;
  } {
    const now = Date.now();
    const intervals = timeframe === 'hour' ? 12 : timeframe === 'day' ? 24 : 168; // 5-min, 1-hour, or 1-hour intervals
    const intervalMs = timeframe === 'hour' ? 5 * 60 * 1000 : 60 * 60 * 1000;
    
    const timestamps: string[] = [];
    const errorCounts: number[] = [];
    const severityCounts: Record<ErrorSeverity, number[]> = {
      low: [], medium: [], high: [], critical: []
    };

    for (let i = intervals - 1; i >= 0; i--) {
      const timestamp = new Date(now - (i * intervalMs));
      timestamps.push(timestamp.toISOString());
      
      const intervalStart = timestamp.getTime();
      const intervalEnd = intervalStart + intervalMs;
      
      const errorsInInterval = Array.from(this.errors.values()).filter(error => {
        const errorTime = new Date(error.context.timestamp).getTime();
        return errorTime >= intervalStart && errorTime < intervalEnd;
      });

      errorCounts.push(errorsInInterval.length);
      
      // Count by severity  
      Object.keys(severityCounts).forEach(severityKey => {
        const severity = severityKey as ErrorSeverity;
        const count = errorsInInterval.filter(error => error.severity === severity).length;
        severityCounts[severity].push(count);
      });
    }

    return { timestamps, errorCounts, severityCounts };
  }

  // Health check integration
  getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    errorRate: number;
    criticalErrors: number;
    recoveryRate: number;
    lastError?: ErrorInfo;
  } {
    const recentErrors = this.getRecentErrors(60); // Last 60 minutes
    const criticalErrors = recentErrors.filter(e => e.severity === 'critical').length;
    const errorRate = recentErrors.length;
    
    const status = 
      criticalErrors > 0 ? 'unhealthy' :
      errorRate > 10 ? 'degraded' : 'healthy';

    const lastError = Array.from(this.errors.values())
      .sort((a, b) => new Date(b.context.timestamp).getTime() - new Date(a.context.timestamp).getTime())[0];

    return {
      status,
      errorRate,
      criticalErrors,
      recoveryRate: this.metrics.recoverySuccessRate,
      lastError,
    };
  }

  // User-friendly error reporting
  getUserFriendlyReport(): {
    summary: string;
    currentIssues: string[];
    estimatedResolution: string;
    whatYouCanDo: string[];
  } {
    const health = this.getSystemHealth();
    const activeAlerts = this.getActiveAlerts();
    
    let summary = '';
    switch (health.status) {
      case 'healthy':
        summary = '✅ 시스템이 정상적으로 작동하고 있습니다';
        break;
      case 'degraded':
        summary = '⚠️ 시스템에 일부 문제가 있지만 대부분의 기능은 정상 작동합니다';
        break;
      case 'unhealthy':
        summary = '🚨 시스템에 중요한 문제가 발생했습니다. 복구 작업을 진행하고 있습니다';
        break;
    }

    const currentIssues = activeAlerts
      .filter(alert => alert.severity === 'high' || alert.severity === 'critical')
      .map(alert => alert.message);

    const estimatedResolution = 
      health.criticalErrors > 0 ? '15-30분 내 복구 예상' :
      health.errorRate > 10 ? '5-10분 내 개선 예상' :
      '현재 문제 없음';

    const whatYouCanDo = health.status === 'healthy' ? 
      ['정상적으로 이용하실 수 있습니다'] :
      [
        '페이지 새로고침을 시도해보세요',
        '잠시 후 다시 시도해주세요',
        '문제가 지속되면 고객센터로 문의해주세요',
        '중요한 작업은 잠시 후에 진행해주세요'
      ];

    return {
      summary,
      currentIssues,
      estimatedResolution,
      whatYouCanDo,
    };
  }

  private generateErrorId(error: ErrorInfo): string {
    const hash = this.simpleHash(error.code + error.context.component + error.context.action);
    return `error-${hash}-${Date.now()}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private updateMetrics(error: ErrorInfo): void {
    this.metrics.totalErrors++;
    this.metrics.errorsByType[error.code] = (this.metrics.errorsByType[error.code] || 0) + 1;
    this.metrics.errorsBySeverity[error.severity]++;
    
    // Update trends
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const errors = Array.from(this.errors.values());
    this.metrics.errorTrends.lastHour = errors.filter(e => 
      new Date(e.context.timestamp).getTime() > hourAgo
    ).length;
    
    this.metrics.errorTrends.lastDay = errors.filter(e => 
      new Date(e.context.timestamp).getTime() > dayAgo
    ).length;
    
    this.metrics.errorTrends.lastWeek = errors.filter(e => 
      new Date(e.context.timestamp).getTime() > weekAgo
    ).length;
  }

  private checkAlertConditions(error: ErrorInfo): void {
    // Critical error alert
    if (error.severity === 'critical') {
      const alert: ErrorAlert = {
        id: `alert-${Date.now()}`,
        type: 'critical',
        message: `심각한 오류 발생: ${error.userMessage}`,
        severity: 'critical',
        timestamp: new Date().toISOString(),
        affectedUsers: this.estimateAffectedUsers(error),
        metadata: { errorCode: error.code, component: error.context.component },
      };
      this.alerts.push(alert);
    }

    // Error spike detection
    const recentErrors = this.getRecentErrors(15); // Last 15 minutes
    if (recentErrors.length > 20) {
      const alert: ErrorAlert = {
        id: `spike-${Date.now()}`,
        type: 'spike',
        message: `오류 급증 감지: 최근 15분간 ${recentErrors.length}개 오류`,
        severity: 'high',
        timestamp: new Date().toISOString(),
        affectedUsers: this.estimateAffectedUsers(),
        metadata: { errorCount: recentErrors.length, timeframe: '15min' },
      };
      this.alerts.push(alert);
    }

    // Keep only recent alerts (last 24 hours)
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > dayAgo
    );
  }

  private async executeRecoveryStrategy(error: ErrorInfo, attempt: number): Promise<boolean> {
    const strategy = this.getRecoveryStrategy(error, attempt);
    
    switch (strategy) {
      case 'retry_request':
        return this.retryRequest(error);
      case 'clear_cache':
        return this.clearCache(error);
      case 'refresh_auth':
        return this.refreshAuthentication(error);
      case 'fallback_service':
        return this.useFallbackService(error);
      default:
        return false;
    }
  }

  private getRecoveryStrategy(error: ErrorInfo, attempt: number): string {
    // Different strategies based on error type and attempt number
    if (error.code.includes('AUTH')) {
      return attempt === 1 ? 'refresh_auth' : 'retry_request';
    }
    if (error.code.includes('NETWORK') || error.code.includes('TIMEOUT')) {
      return attempt === 1 ? 'retry_request' : 
             attempt === 2 ? 'clear_cache' : 'fallback_service';
    }
    if (error.code.includes('CACHE')) {
      return 'clear_cache';
    }
    return 'retry_request';
  }

  private async retryRequest(_error: ErrorInfo): Promise<boolean> {
    // Simulate retry logic - in real implementation, this would retry the actual request
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.random() > 0.3; // 70% success rate
  }

  private async clearCache(_error: ErrorInfo): Promise<boolean> {
    try {
      // Clear browser/server cache
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      return true;
    } catch {
      return false;
    }
  }

  private async refreshAuthentication(_error: ErrorInfo): Promise<boolean> {
    // Simulate auth refresh - in real implementation, this would refresh tokens
    await new Promise(resolve => setTimeout(resolve, 500));
    return Math.random() > 0.2; // 80% success rate
  }

  private async useFallbackService(_error: ErrorInfo): Promise<boolean> {
    // Simulate fallback service usage
    await new Promise(resolve => setTimeout(resolve, 800));
    return Math.random() > 0.5; // 50% success rate
  }

  private recalculateMetrics(): void {
    const successfulRecoveries = this.recoveryAttempts.filter(r => r.success).length;
    const totalRecoveries = this.recoveryAttempts.length;
    
    this.metrics.recoverySuccessRate = totalRecoveries > 0 ? 
      Math.round((successfulRecoveries / totalRecoveries) * 100) : 0;

    const recoveryTimes = this.recoveryAttempts
      .filter(r => r.success)
      .map(r => r.duration_ms);
    
    this.metrics.averageResolutionTime = recoveryTimes.length > 0 ?
      Math.round(recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length) : 0;
  }

  private updateRecoveryMetrics(): void {
    this.recalculateMetrics();
  }

  private getRecoveryAttempts(errorId: string): ErrorRecoveryAttempt[] {
    return this.recoveryAttempts.filter(attempt => attempt.errorId === errorId);
  }

  private getRecentErrors(minutes: number): ErrorInfo[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return Array.from(this.errors.values()).filter(error =>
      new Date(error.context.timestamp).getTime() > cutoff
    );
  }

  private estimateAffectedUsers(error?: ErrorInfo): number {
    // Rough estimation based on error severity and component
    if (!error) return 0;
    
    const baseUsers = error.severity === 'critical' ? 100 :
                     error.severity === 'high' ? 50 :
                     error.severity === 'medium' ? 10 : 1;
    
    // Increase if it's a core component
    const coreComponents = ['auth', 'api', 'database', 'payment'];
    const multiplier = coreComponents.some(comp => 
      error.context.component?.toLowerCase().includes(comp)
    ) ? 5 : 1;
    
    return baseUsers * multiplier;
  }

  private async logToExternalService(error: ErrorInfo): Promise<void> {
    try {
      // In production, send to external monitoring service
      // This is a placeholder for integration with services like Sentry, DataDog, etc.
      console.log(`📊 External logging: ${error.code} (${error.severity})`);
    } catch (logError) {
      console.warn('Failed to log to external service:', logError);
    }
  }

  // Cleanup old data
  cleanup(): void {
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    
    // Clean old errors
    for (const [key, error] of this.errors.entries()) {
      if (new Date(error.context.timestamp).getTime() < cutoff) {
        this.errors.delete(key);
      }
    }
    
    // Clean old recovery attempts
    this.recoveryAttempts = this.recoveryAttempts.filter(attempt =>
      new Date(attempt.timestamp).getTime() > cutoff
    );
    
    // Clean old alerts
    this.alerts = this.alerts.filter(alert =>
      new Date(alert.timestamp).getTime() > cutoff
    );

    console.log('🧹 Error monitoring data cleanup completed');
  }
}

// Singleton instance
export const errorMonitoring = new ErrorMonitoringSystem();

// Auto-cleanup every hour
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    errorMonitoring.cleanup();
  }, 60 * 60 * 1000); // 1 hour
}