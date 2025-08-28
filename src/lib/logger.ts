/**
 * Structured Logging System
 * Phase 4: API Pattern Unification and Error Handling
 * 
 * Purpose: Provide structured logging with context awareness
 * and environment-specific behavior
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  sessionId?: string;
  operation?: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = typeof window === 'undefined' && process.env.NODE_ENV === 'development';
  
  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`;
  }
  
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }
  
  info(message: string, context?: LogContext) {
    console.info(this.formatMessage('info', message, context));
  }
  
  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context));
  }
  
  error(message: string, error?: unknown, context?: LogContext) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : String(error);
    
    const errorStack = error instanceof Error 
      ? error.stack 
      : undefined;
    
    console.error(
      this.formatMessage('error', message, {
        ...context,
        metadata: {
          ...context?.metadata,
          errorMessage,
          errorStack,
        }
      })
    );
    
    // Production에서는 Sentry로 전송
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // Sentry is initialized in next.config.ts
      // Dynamic import to avoid SSR issues
      import('@sentry/nextjs').then(({ captureException }) => {
        captureException(error, {
          tags: {
            section: 'error_logging'
          },
          extra: {
            message,
            ...context
          }
        });
      }).catch(err => {
        console.error('Failed to load Sentry:', err);
      });
    }
  }
  
  /**
   * Log API request details
   */
  logApiRequest(method: string, url: string, params?: unknown) {
    this.debug('API Request', {
      operation: `${method} ${url}`,
      metadata: { params }
    });
  }
  
  /**
   * Log API response details
   */
  logApiResponse(method: string, url: string, status: number, duration?: number) {
    const level = status >= 400 ? 'error' : 'debug';
    const message = status >= 400 ? 'API Request failed' : 'API Request successful';
    
    this[level](message, {
      operation: `${method} ${url}`,
      metadata: { status, duration }
    });
  }
  
  /**
   * Log authentication events
   */
  logAuth(event: 'login' | 'logout' | 'session-refresh' | 'unauthorized', userId?: string) {
    const level = event === 'unauthorized' ? 'warn' : 'info';
    this[level](`Auth event: ${event}`, { userId });
  }
  
  /**
   * Log database operations
   */
  logDatabase(operation: string, table: string, details?: unknown) {
    this.debug('Database operation', {
      operation: `${operation} ${table}`,
      metadata: typeof details === 'object' && details !== null && !Array.isArray(details) 
        ? details as Record<string, unknown> 
        : { details }
    });
  }
  
  /**
   * Log performance metrics
   */
  logPerformance(metric: string, value: number, unit: string = 'ms') {
    this.info('Performance metric', {
      operation: metric,
      metadata: { value, unit }
    });
  }
}

export const logger = new Logger();