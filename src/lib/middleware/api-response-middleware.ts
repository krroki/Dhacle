// API Response Middleware - 표준화된 응답 형식 및 에러 처리
// 모든 API Route에서 일관된 응답 구조와 에러 처리 제공

import { NextRequest, NextResponse } from 'next/server';
import { ErrorHandler, type ErrorInfo } from '@/lib/error/error-handler';
import { errorMonitoring } from '@/lib/error/error-monitoring';
import { snakeToCamelCase, camelToSnakeCase } from '@/types';
import { env } from '@/env';

// 표준 API 응답 인터페이스
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recoveryActions: string[];
    canRetry: boolean;
    retryAfter?: number;
    timestamp: string;
    requestId?: string;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// API Handler 타입
export type ApiHandler = (
  request: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>;

// 미들웨어 설정 옵션
export interface MiddlewareOptions {
  convertCase?: boolean;           // snake_case ↔ camelCase 변환 활성화
  enableErrorTracking?: boolean;   // 에러 추적 활성화
  requireAuth?: boolean;          // 인증 필수 여부
  rateLimited?: boolean;          // Rate Limiting 적용
  enableCors?: boolean;           // CORS 헤더 추가
}

// API Response Helper 함수들
export class ApiResponseHelper {
  // 성공 응답 생성
  static success<T>(data: T, message?: string, convertCase = true): NextResponse<ApiSuccessResponse<T>> {
    const responseData = convertCase ? snakeToCamelCase(data) : data;
    
    return NextResponse.json({
      success: true,
      data: responseData,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  // 에러 응답 생성
  static error(
    errorInfo: ErrorInfo, 
    requestId?: string,
    statusCode?: number
  ): NextResponse<ApiErrorResponse> {
    return NextResponse.json({
      success: false,
      error: {
        code: errorInfo.code,
        message: errorInfo.userMessage,
        severity: errorInfo.severity,
        recoveryActions: errorInfo.recoveryActions,
        canRetry: errorInfo.canRetry,
        retryAfter: errorInfo.retryAfter,
        timestamp: errorInfo.context.timestamp,
        requestId,
      },
    }, { 
      status: statusCode || this.getHttpStatusFromSeverity(errorInfo.severity)
    });
  }

  // 심각도에 따른 HTTP 상태 코드 매핑
  private static getHttpStatusFromSeverity(severity: string): number {
    switch (severity) {
      case 'critical':
        return 500; // Internal Server Error
      case 'high':
        return 500; // Internal Server Error
      case 'medium':
        return 400; // Bad Request
      case 'low':
        return 200; // OK (with error info)
      default:
        return 500;
    }
  }
}

// API 미들웨어 래퍼
export function withApiMiddleware(
  handler: ApiHandler,
  options: MiddlewareOptions = {}
) {
  const {
    convertCase = true,
    enableErrorTracking = true,
    enableCors = true,
  } = options;

  return async (
    request: NextRequest,
    context?: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();
    const startTime = performance.now();

    try {
      // 1. CORS 헤더 설정
      const corsHeaders = enableCors ? {
        'Access-Control-Allow-Origin': env.NODE_ENV === 'production' 
          ? env.NEXT_PUBLIC_SITE_URL 
          : '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      } : {};

      // OPTIONS 요청 처리
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, { 
          status: 200, 
          headers: corsHeaders 
        });
      }

      // 2. Request Body 변환 (POST/PUT/PATCH)
      let processedRequest = request;
      if (['POST', 'PUT', 'PATCH'].includes(request.method) && convertCase) {
        try {
          const body = await request.json();
          const convertedBody = camelToSnakeCase(body);
          
          // 새로운 Request 객체 생성 (변환된 body와 함께)
          processedRequest = new NextRequest(request.url, {
            method: request.method,
            headers: request.headers,
            body: JSON.stringify(convertedBody),
          });
        } catch (error) {
          // JSON 파싱 실패는 원본 request 사용
          processedRequest = request;
        }
      }

      // 3. 핸들러 실행
      const response = await handler(processedRequest, context);
      
      // 4. 성능 메트릭 기록
      const executionTime = performance.now() - startTime;
      
      if (env.NODE_ENV === 'development') {
        console.log(`[API] ${request.method} ${request.url} - ${executionTime.toFixed(2)}ms`);
      }

      // 5. CORS 헤더 추가
      if (enableCors) {
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }

      // 6. 응답 헤더에 메타데이터 추가
      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Execution-Time', `${executionTime.toFixed(2)}ms`);

      return response;

    } catch (error) {
      // 에러 처리 및 추적
      console.error(`[API Error] ${request.method} ${request.url}:`, error);

      let errorInfo: ErrorInfo;

      if (error instanceof Error) {
        errorInfo = ErrorHandler.fromNetworkError(error, {
          component: 'ApiMiddleware',
          action: `${request.method} ${request.url}`,
          url: request.url,
          userAgent: request.headers.get('user-agent') || undefined,
          metadata: {
            requestId,
            method: request.method,
            executionTime: performance.now() - startTime,
          },
        });
      } else {
        errorInfo = ErrorHandler.createError('UNKNOWN_ERROR', {
          component: 'ApiMiddleware',
          action: `${request.method} ${request.url}`,
          url: request.url,
          metadata: { requestId, error: String(error) },
        });
      }

      // 에러 추적
      if (enableErrorTracking) {
        errorMonitoring.trackError(errorInfo);
      }

      // 표준화된 에러 응답 반환
      const errorResponse = ApiResponseHelper.error(errorInfo, requestId);
      
      // CORS 헤더 추가
      if (enableCors) {
        Object.entries(corsHeaders).forEach(([key, value]) => {
          errorResponse.headers.set(key, value);
        });
      }

      return errorResponse;
    }
  };
}

// 자주 사용하는 미들웨어 preset들
export const withStandardApi = (handler: ApiHandler) =>
  withApiMiddleware(handler, {
    convertCase: true,
    enableErrorTracking: true,
    enableCors: true,
  });

export const withAuthApi = (handler: ApiHandler) =>
  withApiMiddleware(handler, {
    convertCase: true,
    enableErrorTracking: true,
    requireAuth: true,
    enableCors: true,
  });

export const withPublicApi = (handler: ApiHandler) =>
  withApiMiddleware(handler, {
    convertCase: true,
    enableErrorTracking: true,
    enableCors: true,
    rateLimited: true,
  });

// Express 스타일 헬퍼 함수들 (편의성)
export const createApiResponse = {
  success: ApiResponseHelper.success,
  error: ApiResponseHelper.error,
  
  // 추가 편의 함수들
  notFound: (message = '요청한 리소스를 찾을 수 없습니다') => 
    ApiResponseHelper.error(
      ErrorHandler.createError('UNKNOWN_ERROR', { 
        component: 'API',
        action: 'not_found' 
      }, message)
    ),
    
  unauthorized: (message = '인증이 필요합니다') =>
    ApiResponseHelper.error(
      ErrorHandler.createError('AUTH_REQUIRED', { 
        component: 'API',
        action: 'unauthorized' 
      }, message)
    ),
    
  forbidden: (message = '접근 권한이 없습니다') =>
    ApiResponseHelper.error(
      ErrorHandler.createError('AUTH_INVALID', { 
        component: 'API',
        action: 'forbidden' 
      }, message)
    ),
    
  badRequest: (message = '잘못된 요청입니다') =>
    ApiResponseHelper.error(
      ErrorHandler.createError('VALIDATION_ERROR', { 
        component: 'API',
        action: 'bad_request' 
      }, message)
    ),
};

export default withApiMiddleware;