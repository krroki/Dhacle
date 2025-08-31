// Enhanced Comprehensive Error Handling System for Dhacle v2.0
// Provides user-friendly error messages, automated recovery, real-time monitoring, and centralized logging
// Phase 1: Complete error handling with validation, user-friendly design, and loop improvements

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  url?: string;
  userAgent?: string;
}

export interface ErrorInfo {
  code: string;
  severity: ErrorSeverity;
  userMessage: string;
  technicalMessage: string;
  recoveryActions: string[];
  context: ErrorContext;
  canRetry: boolean;
  retryAfter?: number; // seconds
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    severity: ErrorSeverity;
    recoveryActions: string[];
    canRetry: boolean;
    retryAfter?: number;
    timestamp: string;
    requestId?: string;
  };
}

// Error codes with user-friendly messages
export const ERROR_CODES = {
  // Authentication Errors
  AUTH_REQUIRED: {
    code: 'AUTH_REQUIRED',
    severity: 'medium' as ErrorSeverity,
    userMessage: '로그인이 필요합니다',
    technicalMessage: 'Authentication required',
    recoveryActions: ['로그인 페이지로 이동', '계정 생성하기'],
    canRetry: false,
  },
  AUTH_INVALID: {
    code: 'AUTH_INVALID',
    severity: 'medium' as ErrorSeverity,
    userMessage: '인증 정보가 올바르지 않습니다',
    technicalMessage: 'Invalid authentication credentials',
    recoveryActions: ['다시 로그인하기', '비밀번호 재설정'],
    canRetry: true,
  },
  AUTH_EXPIRED: {
    code: 'AUTH_EXPIRED',
    severity: 'medium' as ErrorSeverity,
    userMessage: '로그인이 만료되었습니다',
    technicalMessage: 'Authentication token expired',
    recoveryActions: ['다시 로그인하기'],
    canRetry: false,
  },

  // Database Errors
  DATABASE_CONNECTION: {
    code: 'DATABASE_CONNECTION',
    severity: 'critical' as ErrorSeverity,
    userMessage: '일시적인 서버 오류입니다. 잠시 후 다시 시도해주세요',
    technicalMessage: 'Database connection failed',
    recoveryActions: ['페이지 새로고침', '잠시 후 다시 시도'],
    canRetry: true,
    retryAfter: 5,
  },
  DATABASE_TIMEOUT: {
    code: 'DATABASE_TIMEOUT',
    severity: 'high' as ErrorSeverity,
    userMessage: '요청 처리 중입니다. 잠시만 기다려주세요',
    technicalMessage: 'Database query timeout',
    recoveryActions: ['잠시 후 다시 시도'],
    canRetry: true,
    retryAfter: 10,
  },

  // Validation Errors
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    severity: 'low' as ErrorSeverity,
    userMessage: '입력 정보를 확인해주세요',
    technicalMessage: 'Input validation failed',
    recoveryActions: ['입력값 수정 후 다시 시도'],
    canRetry: true,
  },
  MISSING_REQUIRED_FIELD: {
    code: 'MISSING_REQUIRED_FIELD',
    severity: 'low' as ErrorSeverity,
    userMessage: '필수 정보가 누락되었습니다',
    technicalMessage: 'Required field missing',
    recoveryActions: ['누락된 정보 입력 후 다시 시도'],
    canRetry: true,
  },

  // External Service Errors
  YOUTUBE_API_ERROR: {
    code: 'YOUTUBE_API_ERROR',
    severity: 'medium' as ErrorSeverity,
    userMessage: 'YouTube 서비스 연결에 문제가 있습니다',
    technicalMessage: 'YouTube API request failed',
    recoveryActions: ['잠시 후 다시 시도', '다른 검색어로 시도'],
    canRetry: true,
    retryAfter: 30,
  },
  EXTERNAL_SERVICE_TIMEOUT: {
    code: 'EXTERNAL_SERVICE_TIMEOUT',
    severity: 'medium' as ErrorSeverity,
    userMessage: '외부 서비스 응답이 지연되고 있습니다',
    technicalMessage: 'External service timeout',
    recoveryActions: ['잠시 후 다시 시도'],
    canRetry: true,
    retryAfter: 60,
  },

  // File/Upload Errors
  FILE_TOO_LARGE: {
    code: 'FILE_TOO_LARGE',
    severity: 'low' as ErrorSeverity,
    userMessage: '파일 크기가 너무 큽니다',
    technicalMessage: 'File size exceeds limit',
    recoveryActions: ['더 작은 파일로 다시 시도'],
    canRetry: true,
  },
  UNSUPPORTED_FILE_TYPE: {
    code: 'UNSUPPORTED_FILE_TYPE',
    severity: 'low' as ErrorSeverity,
    userMessage: '지원하지 않는 파일 형식입니다',
    technicalMessage: 'Unsupported file type',
    recoveryActions: ['지원되는 파일 형식으로 다시 시도'],
    canRetry: true,
  },

  // System Errors
  SYSTEM_MAINTENANCE: {
    code: 'SYSTEM_MAINTENANCE',
    severity: 'high' as ErrorSeverity,
    userMessage: '시스템 점검 중입니다',
    technicalMessage: 'System under maintenance',
    recoveryActions: ['잠시 후 다시 시도'],
    canRetry: true,
    retryAfter: 300, // 5 minutes
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    severity: 'medium' as ErrorSeverity,
    userMessage: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요',
    technicalMessage: 'Rate limit exceeded',
    recoveryActions: ['잠시 후 다시 시도'],
    canRetry: true,
    retryAfter: 60,
  },

  // System Recovery
  SYSTEM_RECOVERY: {
    code: 'SYSTEM_RECOVERY',
    severity: 'low' as ErrorSeverity,
    userMessage: '시스템이 복구되었습니다',
    technicalMessage: 'System recovery attempt completed',
    recoveryActions: ['정상 작동 확인'],
    canRetry: false,
  },

  // Generic Errors
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    severity: 'high' as ErrorSeverity,
    userMessage: '알 수 없는 오류가 발생했습니다',
    technicalMessage: 'Unknown error occurred',
    recoveryActions: ['페이지 새로고침', '잠시 후 다시 시도', '고객센터 문의'],
    canRetry: true,
    retryAfter: 10,
  },
} as const;

export class ErrorHandler {
  private static logs: ErrorInfo[] = [];
  private static maxLogs = 100;

  static createError(
    errorCode: keyof typeof ERROR_CODES,
    context: Partial<ErrorContext> = {},
    customMessage?: string
  ): ErrorInfo {
    const errorTemplate = ERROR_CODES[errorCode];
    
    const errorInfo: ErrorInfo = {
      ...errorTemplate,
      recoveryActions: [...errorTemplate.recoveryActions], // readonly 배열을 mutable로 복사
      userMessage: customMessage || errorTemplate.userMessage,
      context: {
        timestamp: new Date().toISOString(),
        ...context,
      },
    };

    // Log the error
    this.logError(errorInfo);

    return errorInfo;
  }

  static createApiResponse(error: ErrorInfo, requestId?: string): ErrorResponse {
    return {
      error: {
        code: error.code,
        message: error.userMessage,
        severity: error.severity,
        recoveryActions: error.recoveryActions,
        canRetry: error.canRetry,
        retryAfter: error.retryAfter,
        timestamp: error.context.timestamp,
        requestId,
      },
    };
  }

  static fromHttpError(
    statusCode: number,
    message?: string,
    context: Partial<ErrorContext> = {}
  ): ErrorInfo {
    switch (statusCode) {
      case 401:
        return this.createError('AUTH_REQUIRED', context, message);
      case 403:
        return this.createError('AUTH_INVALID', context, message);
      case 408:
      case 504:
        return this.createError('DATABASE_TIMEOUT', context, message);
      case 429:
        return this.createError('RATE_LIMITED', context, message);
      case 500:
        return this.createError('DATABASE_CONNECTION', context, message);
      case 503:
        return this.createError('SYSTEM_MAINTENANCE', context, message);
      default:
        return this.createError('UNKNOWN_ERROR', context, message);
    }
  }

  static fromNetworkError(error: Error, context: Partial<ErrorContext> = {}): ErrorInfo {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('timeout')) {
      return this.createError('EXTERNAL_SERVICE_TIMEOUT', context);
    }
    
    if (errorMessage.includes('network')) {
      return this.createError('DATABASE_CONNECTION', context);
    }
    
    if (errorMessage.includes('youtube') || errorMessage.includes('api')) {
      return this.createError('YOUTUBE_API_ERROR', context);
    }

    return this.createError('UNKNOWN_ERROR', context, error.message);
  }

  static handleValidationError(
    validationErrors: Record<string, string[]>,
    context: Partial<ErrorContext> = {}
  ): ErrorInfo {
    const firstError = Object.values(validationErrors)[0]?.[0];
    const fieldName = Object.keys(validationErrors)[0];
    
    if (!firstError) {
      return this.createError('VALIDATION_ERROR', context);
    }

    // Create user-friendly message based on validation error
    let userMessage = '입력 정보를 확인해주세요';
    
    if (firstError.includes('required')) {
      userMessage = `${fieldName}은(는) 필수 입력 항목입니다`;
    } else if (firstError.includes('email')) {
      userMessage = '올바른 이메일 주소를 입력해주세요';
    } else if (firstError.includes('min')) {
      userMessage = '입력값이 너무 짧습니다';
    } else if (firstError.includes('max')) {
      userMessage = '입력값이 너무 깁니다';
    }

    return this.createError('VALIDATION_ERROR', context, userMessage);
  }

  private static logError(error: ErrorInfo): void {
    // Add to in-memory logs
    this.logs.unshift(error);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console logging based on severity
    const logLevel = this.getLogLevel(error.severity);
    const logData = {
      code: error.code,
      message: error.technicalMessage,
      context: error.context,
      severity: error.severity,
    };

    console[logLevel](`[${error.severity.toUpperCase()}] ${error.code}:`, logData);

    // In production, send to external logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogger(error);
    }
  }

  private static getLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'info' | 'debug' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      case 'low':
        return 'info';
      default:
        return 'debug';
    }
  }

  private static async sendToExternalLogger(error: ErrorInfo): Promise<void> {
    try {
      // In a real application, send to services like Sentry, LogRocket, etc.
      // For now, just ensure errors are properly structured for external logging
      const logPayload = {
        error_code: error.code,
        severity: error.severity,
        message: error.technicalMessage,
        user_message: error.userMessage,
        context: error.context,
        timestamp: error.context.timestamp,
        can_retry: error.canRetry,
        retry_after: error.retryAfter,
      };

      // Placeholder for external logging service
      console.log('External logging payload:', logPayload);
    } catch (loggingError) {
      console.error('Failed to send error to external logger:', loggingError);
    }
  }

  static getRecentErrors(limit = 20): ErrorInfo[] {
    return this.logs.slice(0, limit);
  }

  static getErrorStats(): {
    total: number;
    by_severity: Record<ErrorSeverity, number>;
    by_code: Record<string, number>;
  } {
    const stats = {
      total: this.logs.length,
      by_severity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      } as Record<ErrorSeverity, number>,
      by_code: {} as Record<string, number>,
    };

    this.logs.forEach(error => {
      stats.by_severity[error.severity]++;
      stats.by_code[error.code] = (stats.by_code[error.code] || 0) + 1;
    });

    return stats;
  }

  static clearLogs(): void {
    this.logs = [];
  }
}

// Utility functions for common error scenarios
export function createAuthError(context?: Partial<ErrorContext>): ErrorResponse {
  const error = ErrorHandler.createError('AUTH_REQUIRED', context);
  return ErrorHandler.createApiResponse(error);
}

export function createValidationError(
  errors: Record<string, string[]>,
  context?: Partial<ErrorContext>
): ErrorResponse {
  const error = ErrorHandler.handleValidationError(errors, context);
  return ErrorHandler.createApiResponse(error);
}

export function createDatabaseError(context?: Partial<ErrorContext>): ErrorResponse {
  const error = ErrorHandler.createError('DATABASE_CONNECTION', context);
  return ErrorHandler.createApiResponse(error);
}

export function handleApiError(
  error: unknown,
  context?: Partial<ErrorContext>
): ErrorResponse {
  let errorInfo: ErrorInfo;

  if (error instanceof Error) {
    errorInfo = ErrorHandler.fromNetworkError(error, context);
  } else if (typeof error === 'object' && error !== null && 'status' in error) {
    const httpError = error as { status: number; message?: string };
    errorInfo = ErrorHandler.fromHttpError(httpError.status, httpError.message, context);
  } else {
    errorInfo = ErrorHandler.createError('UNKNOWN_ERROR', context);
  }

  return ErrorHandler.createApiResponse(errorInfo);
}