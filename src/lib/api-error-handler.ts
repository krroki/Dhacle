/**
 * API 에러 핸들러
 * API 응답에 대한 표준화된 에러 처리 제공
 * Phase 2: API Client 패턴 구현
 */

import { ApiResponse, ApiError } from '@/lib/api-client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  fallbackMessage?: string;
  redirectOn401?: boolean;
  logError?: boolean;
}

/**
 * API 에러를 처리하고 사용자에게 적절한 피드백 제공
 */
export function handleApiError(
  response: ApiResponse<unknown>,
  options: ErrorHandlerOptions = {}
): void {
  const {
    showToast = true,
    fallbackMessage = '알 수 없는 오류가 발생했습니다',
    redirectOn401 = true,
    logError = true,
  } = options;

  if (!response.error) return;

  const error = response.error;
  const errorMessage = error.message || error.code || fallbackMessage;

  // 에러 로깅
  if (logError) {
    logger.error('API Error Handler', error, {
      operation: 'handleApiError',
      metadata: {
        status: error.status,
        code: error.code,
        message: errorMessage,
        details: error.details
      }
    });
  }

  // 상태 코드별 처리
  switch (error.status) {
    case 401:
      // 인증 필요
      if (showToast) {
        toast.error('로그인이 필요합니다');
      }
      if (redirectOn401 && typeof window !== 'undefined') {
        window.location.href = '/auth/login?session=expired';
      }
      break;

    case 403:
      // 권한 없음
      if (showToast) {
        toast.error('접근 권한이 없습니다');
      }
      break;

    case 404:
      // 리소스 없음
      if (showToast) {
        toast.error('요청한 리소스를 찾을 수 없습니다');
      }
      break;

    case 429:
      // Rate Limiting
      if (showToast) {
        toast.error('너무 많은 요청입니다. 잠시 후 다시 시도해주세요');
      }
      break;

    case 500:
    case 502:
    case 503:
      // 서버 에러
      if (showToast) {
        toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요');
      }
      break;

    case 0:
      // 네트워크 에러
      if (error.code === 'NETWORK_ERROR') {
        if (showToast) {
          toast.error('네트워크 연결을 확인해주세요');
        }
      } else if (error.code === 'TIMEOUT') {
        if (showToast) {
          toast.error('요청 시간이 초과되었습니다');
        }
      } else {
        if (showToast) {
          toast.error(errorMessage);
        }
      }
      break;

    default:
      // 기타 에러
      if (showToast) {
        toast.error(errorMessage);
      }
  }
}

/**
 * API 에러를 Promise reject로 변환
 */
export function rejectOnError<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw response.error;
  }
  
  if (!response.data) {
    throw new ApiError('No data received', 0, 'NO_DATA');
  }
  
  return response.data;
}

/**
 * 특정 에러 코드에 대한 커스텀 메시지 반환
 */
export function getErrorMessage(error: ApiError | undefined, fallback = '오류가 발생했습니다'): string {
  if (!error) return fallback;

  // 특정 에러 코드에 대한 커스텀 메시지
  const customMessages: Record<string, string> = {
    'UNAUTHORIZED': '로그인이 필요합니다',
    'FORBIDDEN': '접근 권한이 없습니다',
    'NOT_FOUND': '요청한 리소스를 찾을 수 없습니다',
    'RATE_LIMIT': '너무 많은 요청입니다',
    'NETWORK_ERROR': '네트워크 연결을 확인해주세요',
    'TIMEOUT': '요청 시간이 초과되었습니다',
    'VALIDATION_ERROR': '입력값을 확인해주세요',
    'PAYMENT_REQUIRED': '결제가 필요한 서비스입니다',
    'CONFLICT': '충돌이 발생했습니다',
    'GONE': '더 이상 사용할 수 없는 리소스입니다',
    'UNPROCESSABLE_ENTITY': '처리할 수 없는 요청입니다',
    'TOO_MANY_REQUESTS': '너무 많은 요청입니다. 잠시 후 다시 시도해주세요',
    'SERVICE_UNAVAILABLE': '서비스를 일시적으로 사용할 수 없습니다',
    'GATEWAY_TIMEOUT': '게이트웨이 시간 초과',
  };

  if (error.code && customMessages[error.code]) {
    return customMessages[error.code] ?? fallback;
  }

  return error.message || fallback;
}

/**
 * 에러가 특정 타입인지 확인
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * 에러가 인증 관련 에러인지 확인
 */
export function isAuthError(error: unknown): boolean {
  if (!isApiError(error)) return false;
  return error.status === 401 || error.code === 'UNAUTHORIZED';
}

/**
 * 에러가 권한 관련 에러인지 확인
 */
export function isPermissionError(error: unknown): boolean {
  if (!isApiError(error)) return false;
  return error.status === 403 || error.code === 'FORBIDDEN';
}

/**
 * 에러가 네트워크 관련 에러인지 확인
 */
export function isNetworkError(error: unknown): boolean {
  if (!isApiError(error)) return false;
  return error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT';
}

/**
 * 에러가 검증 관련 에러인지 확인
 */
export function isValidationError(error: unknown): boolean {
  if (!isApiError(error)) return false;
  return error.status === 400 || error.code === 'VALIDATION_ERROR';
}

/**
 * React Query의 onError 콜백에서 사용할 수 있는 헬퍼
 */
export function createQueryErrorHandler(options?: ErrorHandlerOptions) {
  return (error: unknown) => {
    if (isApiError(error)) {
      handleApiError({ error }, options);
    } else if (error instanceof Error) {
      logger.error('Query Error', error);
      if (options?.showToast !== false) {
        toast.error(error.message || '오류가 발생했습니다');
      }
    }
  };
}