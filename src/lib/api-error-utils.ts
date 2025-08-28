import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/types/api-responses';
import { API_ERROR_CODES, API_ERROR_MESSAGES } from '@/types/api-responses';

export function createErrorResponse(
  error: string,
  status: number,
  message?: string,
  code?: string
): NextResponse<ApiErrorResponse> {
  const errorResponse: ApiErrorResponse = {
    error,
    message,
    code
  };

  // 프로덕션에서는 상세 정보 숨기기
  if (process.env.NODE_ENV === 'production' && status === 500) {
    errorResponse.error = API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
    errorResponse.message = 'An unexpected error occurred';
  }

  // 서버 에러는 로깅
  if (status >= 500) {
    logger.error('API Error Response:', { 
      error, 
      status, 
      message, 
      code,
      stack: new Error().stack 
    });
  }

  return NextResponse.json(errorResponse, { status });
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    data,
    message
  }, { status });
}

// 표준 에러 응답 헬퍼들
export function createUnauthorizedResponse(message?: string): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    API_ERROR_MESSAGES.USER_NOT_AUTHENTICATED,
    API_ERROR_CODES.UNAUTHORIZED,
    message,
    'UNAUTHORIZED'
  );
}

export function createForbiddenResponse(message?: string): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    API_ERROR_MESSAGES.FORBIDDEN,
    API_ERROR_CODES.FORBIDDEN,
    message,
    'FORBIDDEN'
  );
}

export function createNotFoundResponse(message?: string): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    API_ERROR_MESSAGES.NOT_FOUND,
    API_ERROR_CODES.NOT_FOUND,
    message,
    'NOT_FOUND'
  );
}

export function createValidationErrorResponse(
  message: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({
    error: API_ERROR_MESSAGES.BAD_REQUEST,
    message,
    details,
    code: 'VALIDATION_ERROR'
  }, { status: API_ERROR_CODES.VALIDATION_ERROR });
}

export function createInternalServerErrorResponse(
  message?: string,
  code?: string
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    API_ERROR_CODES.INTERNAL_ERROR,
    message || 'An unexpected error occurred',
    code || 'INTERNAL_ERROR'
  );
}