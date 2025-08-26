/sc:improve --seq --validate --think
"Phase 2: High Priority 기술부채 해소 - 97개 문제"

# Phase 2: High Priority 기술부채 해소

⚠️ → **필수 확인**: `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙 확인
⚠️ → **절대 금지**: 자동 변환 스크립트 생성
⚠️ → **필수 패턴**: createSupabaseServerClient 사용

## 📌 Phase 정보
- **Phase 번호**: 2/5
- **예상 시간**: 10일
- **우선순위**: HIGH
- **문제 수**: 97개 (직접 fetch 13개, console.log 20+개, 에러 바운더리, 캐싱 전략 등)

## 📚 온보딩 섹션

### 작업 관련 경로
```
- API 클라이언트: src/lib/api-client.ts
- 로거 시스템: src/lib/logger.ts
- 에러 바운더리: src/app/*/error.tsx
- React Query 설정: src/lib/react-query.ts
```

## 🎯 Phase 목표
1. 직접 fetch 사용 패턴 제거 (13개)
2. console.log 구조화된 로깅으로 교체 (20+개)
3. 에러 바운더리 적용 (15개 페이지)
4. 캐싱 전략 구현
5. 구조화된 에러 처리

## 📝 작업 내용

### Task 1: API 클라이언트 통합 (13개 직접 fetch 교체)

#### 1.1 통합 API 클라이언트 구현
```typescript
// src/lib/api-client.ts
import { env } from '@/lib/env';

interface ApiClientConfig {
  timeout?: number;
  retry?: number;
  onError?: (error: ApiError) => void;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetry: number;

  constructor() {
    this.baseURL = env.NEXT_PUBLIC_API_URL;
    this.defaultTimeout = env.NEXT_PUBLIC_TIMEOUT;
    this.defaultRetry = 3;
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    config: ApiClientConfig
  ): Promise<Response> {
    const timeout = config.timeout || this.defaultTimeout;
    const retry = config.retry || this.defaultRetry;

    for (let i = 0; i <= retry; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok && i < retry) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
          continue;
        }

        return response;
      } catch (error) {
        if (i === retry) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }

    throw new Error('Max retries exceeded');
  }

  async request<T>(
    method: string,
    path: string,
    body?: any,
    config: ApiClientConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${path}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await this.fetchWithRetry(url, options, config);

      if (!response.ok) {
        const error = new ApiError(
          response.status,
          response.statusText,
          await response.json().catch(() => null)
        );
        
        if (config.onError) {
          config.onError(error);
        }
        
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      const apiError = new ApiError(
        500,
        'Network Error',
        { message: error.message }
      );
      
      if (config.onError) {
        config.onError(apiError);
      }
      
      throw apiError;
    }
  }

  get<T>(path: string, config?: ApiClientConfig): Promise<T> {
    return this.request<T>('GET', path, undefined, config);
  }

  post<T>(path: string, body?: any, config?: ApiClientConfig): Promise<T> {
    return this.request<T>('POST', path, body, config);
  }

  put<T>(path: string, body?: any, config?: ApiClientConfig): Promise<T> {
    return this.request<T>('PUT', path, body, config);
  }

  delete<T>(path: string, config?: ApiClientConfig): Promise<T> {
    return this.request<T>('DELETE', path, undefined, config);
  }
}

export const apiClient = new ApiClient();
export { ApiError };
```

#### 1.2 직접 fetch 교체 (13개 위치)
```typescript
// Before: src/app/auth/callback/route.ts
const response = await fetch('/api/user', {
  method: 'POST',
  body: JSON.stringify(data)
});

// After: src/app/auth/callback/route.ts
import { apiClient } from '@/lib/api-client';

const response = await apiClient.post('/api/user', data, {
  timeout: 5000,
  retry: 2,
  onError: (error) => logger.error('User API failed', error)
});
```

### Task 2: 구조화된 로깅 시스템 (20+개 console.log 교체)

#### 2.1 로거 구현
```typescript
// src/lib/logger.ts
import { env } from '@/lib/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    // 프로덕션에서는 info 이상만 로깅
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf('info');
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`;
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'authorization'];
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      
      for (const key in sanitized) {
        if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitizeData(sanitized[key]);
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    
    const sanitized = this.sanitizeData(context);
    if (this.isDevelopment) {
      console.log(this.formatMessage('debug', message, sanitized));
    }
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    
    const sanitized = this.sanitizeData(context);
    console.log(this.formatMessage('info', message, sanitized));
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    
    const sanitized = this.sanitizeData(context);
    console.warn(this.formatMessage('warn', message, sanitized));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    
    const sanitized = this.sanitizeData(context);
    const errorInfo = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: this.isDevelopment ? error.stack : undefined
    } : error;
    
    console.error(this.formatMessage('error', message, {
      ...sanitized,
      error: errorInfo
    }));
    
    // Sentry 통합 (있는 경우)
    if (this.isProduction && typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        extra: sanitized
      });
    }
  }
}

export const logger = new Logger();
```

#### 2.2 console.log 교체
```typescript
// Before
console.log('user data:', userData);

// After
import { logger } from '@/lib/logger';
logger.debug('Processing user data', { userId: userData.id });
```

### Task 3: 에러 바운더리 구현 (15개 페이지)

#### 3.1 루트 에러 바운더리
```typescript
// src/app/error.tsx
'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Application error', error, {
      digest: error.digest
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">문제가 발생했습니다</h1>
        <p className="text-gray-600 mb-6">
          예기치 않은 오류가 발생했습니다. 문제가 지속되면 지원팀에 문의하세요.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
```

#### 3.2 페이지별 에러 바운더리
```typescript
// src/app/dashboard/error.tsx
'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="text-lg font-semibold text-red-800">
        대시보드 로딩 실패
      </h2>
      <p className="mt-2 text-red-600">
        {error.message || '대시보드를 불러올 수 없습니다.'}
      </p>
      <button
        onClick={reset}
        className="mt-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
      >
        새로고침
      </button>
    </div>
  );
}
```

### Task 4: 캐싱 전략 구현

#### 4.1 React Query 최적화
```typescript
// src/lib/react-query.ts
import { QueryClient } from '@tanstack/react-query';

// 데이터 특성별 캐싱 전략
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본 설정
      staleTime: 1000 * 60 * 5, // 5분
      gcTime: 1000 * 60 * 30, // 30분 (이전 cacheTime)
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      
      // 네트워크 상태 관리
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

// 캐싱 전략 프리셋
export const cachePresets = {
  // 정적 데이터 (코스 목록, 카테고리 등)
  static: {
    staleTime: 1000 * 60 * 60, // 1시간
    gcTime: 1000 * 60 * 60 * 24, // 24시간
  },
  
  // 자주 변경되는 데이터 (사용자 프로필, 대시보드)
  dynamic: {
    staleTime: 1000 * 60, // 1분
    gcTime: 1000 * 60 * 10, // 10분
  },
  
  // 실시간 데이터 (채팅, 알림)
  realtime: {
    staleTime: 0,
    gcTime: 1000 * 60 * 5, // 5분
  },
  
  // YouTube API (비용 고려)
  expensive: {
    staleTime: 1000 * 60 * 30, // 30분
    gcTime: 1000 * 60 * 60 * 2, // 2시간
  },
};
```

#### 4.2 쿼리 훅 최적화
```typescript
// src/hooks/queries/useYouTubeVideo.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { cachePresets } from '@/lib/react-query';

export function useYouTubeVideo(videoId: string) {
  return useQuery({
    queryKey: ['youtube', 'video', videoId],
    queryFn: () => apiClient.get(`/api/youtube/video/${videoId}`),
    ...cachePresets.expensive, // YouTube API는 비용이 높으므로 캐싱 적극 활용
    enabled: !!videoId,
  });
}
```

## ✅ 완료 조건
- [ ] 13개 직접 fetch 모두 apiClient로 교체
- [ ] 20+개 console.log 모두 logger로 교체
- [ ] 15개 주요 페이지에 에러 바운더리 적용
- [ ] React Query 캐싱 전략 구현
- [ ] 모든 변경사항 테스트 완료
- [ ] 빌드 성공 (npm run build)
- [ ] 타입 체크 통과 (npm run types:check)

## 📋 QA 테스트 시나리오

### API 클라이언트 테스트
1. 정상 API 호출 → 성공 확인
2. 네트워크 에러 → 재시도 동작 확인
3. 타임아웃 → 적절한 에러 처리 확인
4. 401 에러 → 인증 리다이렉션 확인

### 로깅 시스템 테스트
1. 개발 환경 → 모든 로그 출력 확인
2. 프로덕션 환경 → info 이상만 출력 확인
3. 민감정보 → [REDACTED]로 마스킹 확인

### 에러 바운더리 테스트
1. 컴포넌트 에러 → 에러 UI 표시 확인
2. Reset 버튼 → 복구 동작 확인
3. 에러 로깅 → logger에 기록 확인

### 캐싱 테스트
1. 정적 데이터 → 1시간 캐싱 확인
2. 동적 데이터 → 1분 후 refetch 확인
3. YouTube API → 30분 캐싱 확인

## 🔄 롤백 계획

### Task별 롤백
```bash
# API 클라이언트만 롤백
git checkout HEAD -- src/lib/api-client.ts

# 로거만 롤백
git checkout HEAD -- src/lib/logger.ts

# 에러 바운더리만 롤백
git checkout HEAD -- "src/app/**/error.tsx"
```

## 📊 성과 측정

### Before (Phase 1 완료)
- 직접 fetch: 13개
- console.log: 20+개
- 에러 바운더리: 0개
- 캐싱 전략: 기본값만
- API 에러율: 3.2%

### After (Phase 2 완료)
- 직접 fetch: 0개
- console.log: 0개 (모두 logger로 교체)
- 에러 바운더리: 15개 페이지
- 캐싱 전략: 데이터별 최적화
- API 에러율: <0.5% (재시도로 개선)
- API 비용: 50% 절감 (캐싱으로)

## → 다음 Phase
- **파일**: PHASE_3_MEDIUM_PRIORITY.md
- **목표**: 58개 Medium Priority 문제 해결
- **예상 시간**: 7일

---

*작성일: 2025-02-23*