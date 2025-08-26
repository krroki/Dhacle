/**
 * Error Handling Utility
 * Phase 3: Error Handling and Security Improvements
 * 
 * Purpose: Centralized error handling with proper logging and user feedback
 * Replaces silent failures with comprehensive error management
 */

import { logger } from '@/lib/logger';
import { toast } from '@/hooks/use-toast';
import { env } from '@/env';

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Error type guard
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * AppError type guard
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Central error handler for all application errors
 * 
 * @param error - The error to handle
 * @param context - Context information (e.g., component name, function name)
 * @param options - Additional options for error handling
 */
export function handleError(
  error: unknown,
  context?: string,
  options?: {
    showToast?: boolean;
    rethrow?: boolean;
    severity?: 'error' | 'warn' | 'info';
  }
): void {
  const { showToast = true, rethrow = false, severity = 'error' } = options || {};
  
  // Handle AppError
  if (isAppError(error)) {
    logger[severity](`[${context}] AppError: ${error.message}`, {
      operation: context,
      metadata: {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
        error
      }
    });
    
    // Show user-friendly message
    if (showToast && typeof window !== 'undefined') {
      toast({
        variant: severity === 'error' ? 'destructive' : 'default',
        title: severity === 'error' ? '오류' : '알림',
        description: error.message,
      });
    }
    
    if (rethrow) throw error;
    return;
  }

  // Handle regular Error
  if (isError(error)) {
    logger[severity](`[${context}] Error: ${error.message}`, {
      operation: context,
      metadata: {
        message: error.message,
        stack: error.stack,
      }
    });
    
    // Show generic message to user
    if (showToast && typeof window !== 'undefined') {
      toast({
        variant: severity === 'error' ? 'destructive' : 'default',
        title: severity === 'error' ? '오류' : '알림',
        description: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      });
    }
    
    if (rethrow) throw error;
    return;
  }

  // Handle unknown error
  logger[severity](`[${context}] Unknown error: ${String(error)}`, {
    operation: context,
    metadata: { error }
  });
  
  if (showToast && typeof window !== 'undefined') {
    toast({
      variant: 'destructive',
      title: '오류',
      description: '알 수 없는 오류가 발생했습니다.',
    });
  }
  
  if (rethrow) {
    throw new AppError('Unknown error occurred', 'UNKNOWN_ERROR', 500, error);
  }
}

/**
 * Handle API errors with proper status codes
 */
export function handleApiError(
  error: unknown,
  context: string
): { error: string; message: string; statusCode: number } {
  // Log the error
  logger.error(`[API] ${context}:`, error);
  
  // Determine status code and message
  if (isAppError(error)) {
    return {
      error: error.code || 'APP_ERROR',
      message: error.message,
      statusCode: error.statusCode || 500
    };
  }
  
  if (isError(error)) {
    // Check for common error patterns
    if (error.message.includes('Unauthorized') || error.message.includes('401')) {
      return {
        error: 'UNAUTHORIZED',
        message: '인증이 필요합니다.',
        statusCode: 401
      };
    }
    
    if (error.message.includes('Forbidden') || error.message.includes('403')) {
      return {
        error: 'FORBIDDEN',
        message: '권한이 없습니다.',
        statusCode: 403
      };
    }
    
    if (error.message.includes('Not Found') || error.message.includes('404')) {
      return {
        error: 'NOT_FOUND',
        message: '요청한 리소스를 찾을 수 없습니다.',
        statusCode: 404
      };
    }
    
    return {
      error: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'development' ? error.message : '서버 오류가 발생했습니다.',
      statusCode: 500
    };
  }
  
  return {
    error: 'UNKNOWN_ERROR',
    message: '알 수 없는 오류가 발생했습니다.',
    statusCode: 500
  };
}

/**
 * Safe error handler for async functions
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  context?: string,
  defaultValue?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, context);
    return defaultValue;
  }
}

/**
 * Create a wrapped version of a function with automatic error handling
 */
export function withErrorHandling<TFunc extends (...args: unknown[]) => unknown>(
  fn: TFunc,
  context?: string
): TFunc {
  return ((...args: Parameters<TFunc>) => {
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          handleError(error, context);
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }) as TFunc;
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    context?: string;
  }
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
    context = 'retryWithBackoff'
  } = options || {};
  
  let lastError: unknown;
  let delay = initialDelay;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        logger.warn(`${context}: Retry ${i + 1}/${maxRetries} after ${delay}ms`, {
          operation: context,
          metadata: { retry: i + 1, delay }
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * factor, maxDelay);
      }
    }
  }
  
  logger.error(`${context}: All ${maxRetries} retries failed`, lastError);
  throw lastError;
}