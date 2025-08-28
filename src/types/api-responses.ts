// 표준 API 응답 타입 정의
export interface ApiSuccessResponse<T = unknown> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
  code?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// 표준 에러 상태 코드
export const API_ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  INTERNAL_ERROR: 500,
  CONFLICT: 409,
} as const;

// 표준 에러 메시지
export const API_ERROR_MESSAGES = {
  USER_NOT_AUTHENTICATED: 'User not authenticated',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  BAD_REQUEST: 'Bad Request',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  CONFLICT: 'Conflict',
} as const;