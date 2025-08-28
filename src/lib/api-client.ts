/**
 * 공통 API 클라이언트
 * 모든 API 호출에 일관된 인증 및 에러 처리 제공
 * snake_case (API) ↔ camelCase (Frontend) 자동 변환
 * Phase 3: 재시도 로직 및 강화된 에러 처리 추가
 */

import { camelToSnakeCase, snakeToCamelCase } from '@/lib/utils/case-converter';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
// Remove conflicting import - ApiResponse is defined locally

export interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
  skipCaseConversion?: boolean; // 케이스 변환 건너뛰기 옵션
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  retryCount?: number; // 재시도 횟수 (기본값: 3)
  showErrorToast?: boolean; // 에러 토스트 표시 여부 (기본값: true)
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success?: boolean;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  data?: unknown;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * 재시도 로직을 수행하는 헬퍼 함수
 */
async function retryRequest<T>(
  fn: () => Promise<T>,
  retryCount: number = 3,
  operation?: string
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < retryCount; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // 401, 403, 404는 재시도하지 않음
      if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
        throw error;
      }
      
      if (i < retryCount - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        logger.warn(`Retrying request, ${retryCount - i - 1} attempts left`, {
          operation,
          metadata: { attempt: i + 1, delay }
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * 에러 메시지를 한국어로 반환
 */
function getErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: '잘못된 요청입니다.',
    401: '인증이 필요합니다.',
    403: '권한이 없습니다.',
    404: '요청한 리소스를 찾을 수 없습니다.',
    429: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
    500: '서버 오류가 발생했습니다.',
    502: '게이트웨이 오류가 발생했습니다.',
    503: '서비스를 일시적으로 사용할 수 없습니다.'
  };
  
  return messages[status] || '알 수 없는 오류가 발생했습니다.';
}

/**
 * 공통 API fetch 래퍼
 * - 자동으로 credentials 포함
 * - 일관된 에러 처리
 * - JSON 파싱
 * - 구조화된 로깅
 * - 타임아웃 처리
 * - 재시도 로직 (Phase 3 추가)
 */
export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  const { 
    skipAuth = false, 
    skipCaseConversion = false,
    params,
    timeout = 30000,
    retryCount = 3,
    showErrorToast = true,
    ...init 
  } = options;

  // URL 파라미터 처리
  const apiUrl = new URL(path, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      apiUrl.searchParams.set(key, String(value));
    });
  }

  const startTime = Date.now();

  // 재시도 로직을 포함한 fetch 실행
  const executeRequest = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      // 요청 로깅
      logger.logApiRequest(init.method || 'GET', apiUrl.pathname, params);

      const response = await fetch(apiUrl.toString(), {
        credentials: skipAuth ? 'omit' : 'same-origin',
        signal: controller.signal,
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init.headers || {}),
        },
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      // 응답 본문 파싱
      const text = await response.text();
      let data: unknown;

      try {
        data = text ? JSON.parse(text) : null;
      } catch (error) {
        logger.warn('Failed to parse JSON response:', {
          metadata: { error: error instanceof Error ? error.message : String(error) }
        });
        data = text;
      }

      // 응답 로깅
      logger.logApiResponse(init.method || 'GET', apiUrl.pathname, response.status, duration);

      // 에러 처리
      if (!response.ok) {
        // 401 Unauthorized 특별 처리
        if (response.status === 401) {
          logger.logAuth('unauthorized');
          
          const error = new ApiError(
            getErrorMessage(401),
            401,
            'UNAUTHORIZED',
            data
          );
          
          // Smart redirect logic: only redirect when appropriate
          if (typeof window !== 'undefined' && !skipAuth) {
            const currentPath = window.location.pathname;
            const isLoginPage = currentPath.startsWith('/auth/login');
            const isPublicPage = currentPath === '/' || 
                                 currentPath.startsWith('/courses/free') || 
                                 currentPath.startsWith('/community') ||
                                 currentPath.startsWith('/tools') ||
                                 currentPath.startsWith('/privacy') ||
                                 currentPath.startsWith('/terms');
            
            // Only redirect if:
            // 1. Not already on login page
            // 2. Not on a public page that should be accessible without auth
            // 3. The API call was expected to require authentication
            const shouldRedirect = !isLoginPage && !isPublicPage;
            
            if (shouldRedirect) {
              window.location.href = `/auth/login?session=expired&redirect=${encodeURIComponent(currentPath)}`;
            }
          }
          
          // Only show error toast when appropriate (not for expected failures on public pages)
          if (showErrorToast && typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const isPublicPage = currentPath === '/' || 
                                 currentPath.startsWith('/auth/') ||
                                 currentPath.startsWith('/courses/free') || 
                                 currentPath.startsWith('/community') ||
                                 currentPath.startsWith('/tools') ||
                                 currentPath.startsWith('/privacy') ||
                                 currentPath.startsWith('/terms');
            
            // Don't show error toast on public pages for expected auth failures
            if (!isPublicPage) {
              toast.error(error.message);
            }
          }
          
          throw error;
        }

        // 403 Forbidden
        if (response.status === 403) {
          logger.warn('Forbidden access attempt', {
            operation: apiUrl.pathname
          });
          
          const error = new ApiError(
            getErrorMessage(403),
            403,
            'FORBIDDEN',
            data
          );
          
          if (showErrorToast && typeof window !== 'undefined') {
            toast.error(error.message);
          }
          
          throw error;
        }

        // 일반 에러
        const error_message =
          (typeof data === 'object' && data && 'error' in data
            ? (data as { error: string }).error
            : null) ||
          (typeof data === 'object' && data && 'message' in data
            ? (data as { message: string }).message
            : null) ||
          getErrorMessage(response.status);

        logger.error('API Request failed', undefined, {
          operation: apiUrl.pathname,
          metadata: {
            status: response.status,
            error: data
          }
        });

        const error = new ApiError(
          error_message,
          response.status,
          `HTTP_${response.status}`,
          data
        );
        
        if (showErrorToast && typeof window !== 'undefined') {
          toast.error(error.message);
        }
        
        throw error;
      }

      // API 응답을 camelCase로 변환 (skipCaseConversion이 false인 경우)
      const result = skipCaseConversion ? data : snakeToCamelCase(data);
      return result as T;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      // 타임아웃 에러
      if (error instanceof Error && error.name === 'AbortError') {
        logger.error('API Request timeout', error, {
          operation: apiUrl.pathname,
          metadata: { timeout }
        });
        throw new ApiError('요청 시간이 초과되었습니다.', 408, 'TIMEOUT');
      }

      // ApiError는 그대로 전달
      if (error instanceof ApiError) {
        throw error;
      }

      // 네트워크 에러
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        logger.error('Network error', error, {
          operation: apiUrl.pathname
        });
        throw new ApiError('네트워크 오류가 발생했습니다.', 0, 'NETWORK_ERROR');
      }

      // 기타 에러
      logger.error('Unexpected API error', error, {
        operation: apiUrl.pathname
      });
      throw new ApiError(
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        0,
        'UNKNOWN_ERROR',
        error
      );
    }
  };

  // 재시도 로직을 적용하여 요청 실행
  try {
    const result = await retryRequest(
      executeRequest,
      retryCount,
      apiUrl.pathname
    );
    return { data: result, success: true };
  } catch (error: unknown) {
    // ApiError는 이미 error 객체를 포함하고 있음
    if (error instanceof ApiError) {
      return { error, success: false };
    }

    // 기타 예상치 못한 에러
    const apiError = new ApiError(
      '예상치 못한 오류가 발생했습니다.',
      0,
      'UNKNOWN_ERROR',
      error
    );
    
    if (showErrorToast && typeof window !== 'undefined') {
      toast.error(apiError.message);
    }
    
    return { error: apiError, success: false };
  }
}

/**
 * GET 요청 헬퍼
 */
export async function apiGet<T = unknown>(
  path: string,
  options?: Omit<ApiOptions, 'method'>
): Promise<T> {
  const response = await api<T>(path, { ...options, method: 'GET' });
  
  if (response.error) {
    throw response.error;
  }
  
  if (!response.data) {
    throw new ApiError('No data received', 0, 'NO_DATA');
  }
  
  return response.data;
}

/**
 * POST 요청 헬퍼
 */
export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
  options?: Omit<ApiOptions, 'method' | 'body'>
): Promise<T> {
  // 요청 데이터를 snake_case로 변환 (skipCaseConversion이 false인 경우)
  const converted_body = body && !options?.skipCaseConversion ? camelToSnakeCase(body) : body;

  const response = await api<T>(path, {
    ...options,
    method: 'POST',
    body: converted_body ? JSON.stringify(converted_body) : undefined,
  });
  
  if (response.error) {
    throw response.error;
  }
  
  if (!response.data) {
    throw new ApiError('No data received', 0, 'NO_DATA');
  }
  
  return response.data;
}

/**
 * PUT 요청 헬퍼
 */
export async function apiPut<T = unknown>(
  path: string,
  body?: unknown,
  options?: Omit<ApiOptions, 'method' | 'body'>
): Promise<T> {
  // 요청 데이터를 snake_case로 변환 (skipCaseConversion이 false인 경우)
  const converted_body = body && !options?.skipCaseConversion ? camelToSnakeCase(body) : body;

  const response = await api<T>(path, {
    ...options,
    method: 'PUT',
    body: converted_body ? JSON.stringify(converted_body) : undefined,
  });
  
  if (response.error) {
    throw response.error;
  }
  
  if (!response.data) {
    throw new ApiError('No data received', 0, 'NO_DATA');
  }
  
  return response.data;
}

/**
 * DELETE 요청 헬퍼
 */
export async function apiDelete<T = unknown>(
  path: string,
  options?: Omit<ApiOptions, 'method'>
): Promise<T> {
  const response = await api<T>(path, { ...options, method: 'DELETE' });
  
  if (response.error) {
    throw response.error;
  }
  
  return response.data as T;
}

/**
 * PATCH 요청 헬퍼
 */
export async function apiPatch<T = unknown>(
  path: string,
  body?: unknown,
  options?: Omit<ApiOptions, 'method' | 'body'>
): Promise<T> {
  // 요청 데이터를 snake_case로 변하환 (skipCaseConversion이 false인 경우)
  const converted_body = body && !options?.skipCaseConversion ? camelToSnakeCase(body) : body;

  const response = await api<T>(path, {
    ...options,
    method: 'PATCH',
    body: converted_body ? JSON.stringify(converted_body) : undefined,
  });
  
  if (response.error) {
    throw response.error;
  }
  
  if (!response.data) {
    throw new ApiError('No data received', 0, 'NO_DATA');
  }
  
  return response.data;
}

/**
 * 캠시 활용 복구 전략
 */
export function getCachedData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  const cached = localStorage.getItem(`cache_${key}`);
  if (!cached) return null;
  
  try {
    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > 3600000; // 1시간
    
    if (isExpired) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }
    
    return data;
  } catch (error) {
    logger.warn('Cache retrieval failed', {
      operation: 'getCachedData',
      metadata: { key, error }
    });
    return null;
  }
}

export function setCachedData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    logger.warn('Failed to cache data', {
      operation: 'setCachedData',
      metadata: { key, error }
    });
  }
}

/**
 * API 클라이언트 클래스 (Phase 3)
 */
class ApiClient {
  constructor() {
    // Constructor body - removed unused private properties
  }

  async get<T>(url: string, options?: Omit<ApiOptions, 'method'>): Promise<ApiResponse<T>> {
    return api<T>(`${url}`, { ...options, method: 'GET' });
  }

  async post<T>(url: string, data?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const converted_body = data && !options?.skipCaseConversion ? camelToSnakeCase(data) : data;
    return api<T>(`${url}`, {
      ...options,
      method: 'POST',
      body: converted_body ? JSON.stringify(converted_body) : undefined,
    });
  }

  async put<T>(url: string, data?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const converted_body = data && !options?.skipCaseConversion ? camelToSnakeCase(data) : data;
    return api<T>(`${url}`, {
      ...options,
      method: 'PUT',
      body: converted_body ? JSON.stringify(converted_body) : undefined,
    });
  }

  async patch<T>(url: string, data?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const converted_body = data && !options?.skipCaseConversion ? camelToSnakeCase(data) : data;
    return api<T>(`${url}`, {
      ...options,
      method: 'PATCH',
      body: converted_body ? JSON.stringify(converted_body) : undefined,
    });
  }

  async delete<T>(url: string, options?: Omit<ApiOptions, 'method'>): Promise<ApiResponse<T>> {
    return api<T>(`${url}`, { ...options, method: 'DELETE' });
  }
}

// 싱글톤 인스턴스 생성 및 export
export const apiClient = new ApiClient();

/**
 * FormData 업로드 헬퍼
 * - Content-Type 헤더 자동 설정 안함 (브라우저가 자동 설정)
 * - FormData를 그대로 전송
 */
export async function apiUpload<T = unknown>(
  path: string,
  form_data: FormData,
  options?: Omit<ApiOptions, 'method' | 'body'>
): Promise<T> {
  const { skipAuth = false, timeout = 60000, ...init } = options || {};

  const apiUrl = new URL(path, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const startTime = Date.now();

  try {
    logger.logApiRequest('POST', apiUrl.pathname, { type: 'upload' });

    const response = await fetch(apiUrl.toString(), {
      method: 'POST',
      credentials: skipAuth ? 'omit' : 'same-origin',
      signal: controller.signal,
      body: form_data,
      ...init,
      headers: {
        ...init.headers,
        // Content-Type을 설정하지 않음 - 브라우저가 multipart/form-data를 자동 설정
      },
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    // 응답 본문 파싱
    const text = await response.text();
    let data: unknown;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      logger.warn('Failed to parse response JSON:', {
          metadata: { error: error instanceof Error ? error.message : String(error) }
        });
      data = text;
    }

    logger.logApiResponse('POST', apiUrl.pathname, response.status, duration);

    // 에러 처리
    if (!response.ok) {
      // 401 Unauthorized 특별 처리
      if (response.status === 401) {
        logger.logAuth('unauthorized');
        
        if (typeof window !== 'undefined' && !skipAuth) {
          const currentPath = window.location.pathname;
          const isLoginPage = currentPath.startsWith('/auth/login');
          
          // 로그인 페이지에서는 리다이렉트하지 않음 (무한 루프 방지)
          if (!isLoginPage) {
            window.location.href = '/auth/login?session=expired';
          }
        }
        
        throw new ApiError(
          'User not authenticated',
          401,
          'UNAUTHORIZED',
          data
        );
      }

      // 일반 에러
      const error_message =
        (typeof data === 'object' && data && 'error' in data
          ? (data as { error: string }).error
          : null) ||
        response.statusText ||
        'Upload failed';

      logger.error('Upload failed', undefined, {
        operation: apiUrl.pathname,
        metadata: {
          status: response.status,
          error: data
        }
      });

      throw new ApiError(error_message, response.status, `HTTP_${response.status}`, data);
    }

    // API 응답을 camelCase로 변환
    return snakeToCamelCase(data) as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    // 타임아웃 에러
    if (error instanceof Error && error.name === 'AbortError') {
      logger.error('Upload timeout', error, {
        operation: apiUrl.pathname,
        metadata: { timeout }
      });
      throw new ApiError('Upload timeout', 408, 'TIMEOUT');
    }

    // 네트워크 에러
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      logger.error('Network error during upload', error, {
        operation: apiUrl.pathname
      });
      throw new ApiError('Network error', 0, 'NETWORK_ERROR');
    }

    // ApiError는 그대로 전달
    if (error instanceof ApiError) {
      throw error;
    }

    logger.error('Unexpected upload error', error, {
      operation: apiUrl.pathname
    });
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      0,
      'UNKNOWN_ERROR',
      error
    );
  }
}
