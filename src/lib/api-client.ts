/**
 * 공통 API 클라이언트
 * 모든 API 호출에 일관된 인증 및 에러 처리 제공
 */

export interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * 공통 API fetch 래퍼
 * - 자동으로 credentials 포함
 * - 일관된 에러 처리
 * - JSON 파싱
 */
export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth = false, ...init } = options;

  try {
    const response = await fetch(path, {
      credentials: skipAuth ? 'omit' : 'same-origin',
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });

    // 응답 본문 파싱
    const text = await response.text();
    let data: unknown;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    // 에러 처리
    if (!response.ok) {
      // 401 Unauthorized 특별 처리
      if (response.status === 401) {
        const errorMessage =
          typeof data === 'object' && data && 'error' in data
            ? (data as { error: string }).error
            : 'User not authenticated';
        throw new ApiError(
          '인증이 필요합니다. 로그인 후 다시 시도해주세요.',
          response.status,
          data
        );
      }

      // 일반 에러
      const errorMessage =
        (typeof data === 'object' && data && 'error' in data
          ? (data as { error: string }).error
          : null) ||
        (typeof data === 'object' && data && 'message' in data
          ? (data as { message: string }).message
          : null) ||
        response.statusText ||
        'Request failed';

      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error) {
    // fetch 자체 실패 (네트워크 에러 등)
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Network error', 0, error);
  }
}

/**
 * GET 요청 헬퍼
 */
export async function apiGet<T = unknown>(
  path: string,
  options?: Omit<ApiOptions, 'method'>
): Promise<T> {
  return api<T>(path, { ...options, method: 'GET' });
}

/**
 * POST 요청 헬퍼
 */
export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
  options?: Omit<ApiOptions, 'method' | 'body'>
): Promise<T> {
  return api<T>(path, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT 요청 헬퍼
 */
export async function apiPut<T = unknown>(
  path: string,
  body?: unknown,
  options?: Omit<ApiOptions, 'method' | 'body'>
): Promise<T> {
  return api<T>(path, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE 요청 헬퍼
 */
export async function apiDelete<T = unknown>(
  path: string,
  options?: Omit<ApiOptions, 'method'>
): Promise<T> {
  return api<T>(path, { ...options, method: 'DELETE' });
}

/**
 * PATCH 요청 헬퍼
 */
export async function apiPatch<T = unknown>(
  path: string,
  body?: unknown,
  options?: Omit<ApiOptions, 'method' | 'body'>
): Promise<T> {
  return api<T>(path, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * FormData 업로드 헬퍼
 * - Content-Type 헤더 자동 설정 안함 (브라우저가 자동 설정)
 * - FormData를 그대로 전송
 */
export async function apiUpload<T = unknown>(
  path: string,
  formData: FormData,
  options?: Omit<ApiOptions, 'method' | 'body'>
): Promise<T> {
  const { skipAuth = false, ...init } = options || {};

  try {
    const response = await fetch(path, {
      method: 'POST',
      credentials: skipAuth ? 'omit' : 'same-origin',
      body: formData,
      ...init,
      headers: {
        ...init.headers,
        // Content-Type을 설정하지 않음 - 브라우저가 multipart/form-data를 자동 설정
      },
    });

    // 응답 본문 파싱
    const text = await response.text();
    let data: unknown;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    // 에러 처리
    if (!response.ok) {
      // 401 Unauthorized 특별 처리
      if (response.status === 401) {
        throw new ApiError(
          '인증이 필요합니다. 로그인 후 다시 시도해주세요.',
          response.status,
          data
        );
      }

      // 일반 에러
      const errorMessage =
        (typeof data === 'object' && data && 'error' in data
          ? (data as { error: string }).error
          : null) ||
        response.statusText ||
        'Upload failed';

      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error) {
    // fetch 자체 실패 (네트워크 에러 등)
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Network error', 0, error);
  }
}
