/sc:improve --seq --validate
"Phase 4: API 클라이언트 통일 및 에러 처리 표준화"

# Phase 4: API 패턴 통일 및 에러 처리

## 🚨 프로젝트 특화 규칙 확인 (필수)
⚠️ **경고**: 아래 문서 미확인 시 프로젝트 파괴 가능성 90%

### 최우선 확인 문서
- [ ] `/docs/CONTEXT_BRIDGE.md` 141-150행 - API 연동 패턴
- [ ] `/src/lib/CLAUDE.md` - api-client 사용법
- [ ] `/docs/ERROR_BOUNDARY.md` - 에러 처리 패턴
- [ ] `/CLAUDE.md` 500-510행 - API 호출 규칙

### 프로젝트 금지사항 체크 ✅
- [ ] 직접 fetch() 호출 금지 (외부 API 제외)
- [ ] Silent failure 패턴 금지
- [ ] console.log 남용 금지
- [ ] process.env 직접 사용 금지
- [ ] try-catch 빈 블록 금지

### 작업 전 검증 명령어
```bash
# 직접 fetch 사용 확인
grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" | grep -v "api-client"
# 현재: 13개

# Silent failure 패턴 확인
grep -r "catch.*{.*}" src/ --include="*.ts" --include="*.tsx"

# 환경변수 직접 사용
grep -r "process\.env\." src/ --include="*.ts" --include="*.tsx"
# 현재: 47개
```

## 📌 Phase 정보
- **Phase 번호**: 4/4
- **선행 조건**: Phase 1-3 완료
- **예상 시간**: 2일
- **우선순위**: HIGH
- **작업 범위**: 13개 직접 fetch, 2개 Silent failure, 47개 환경변수

## 🎯 Phase 목표
1. 13개 직접 fetch를 apiClient로 변경
2. Silent failure 패턴 완전 제거
3. 구조화된 로깅 시스템 구축
4. 환경변수 타입 안전 100%

## 📚 온보딩 섹션
### 이 Phase에 필요한 지식
- [ ] `/docs/CONTEXT_BRIDGE.md` 275-307행 - 환경변수 패턴
- [ ] `/src/lib/api-client.ts` - 기존 구현
- [ ] `/src/env.ts` - 환경변수 타입 시스템
- [ ] 구조화된 로깅 패턴

### 작업 파일 경로
- 직접 fetch 사용:
  - `src/app/auth/callback/route.ts:102,119`
  - `src/lib/youtube/api-client.ts:119`
  - `src/lib/api-client.ts:36,179`
- Silent failure:
  - `src/middleware.ts:93`
  - `src/lib/youtube/queue-manager.ts:204`

## 📝 작업 내용

### 1단계: 구조화된 로깅 시스템 구축
```typescript
// src/lib/logger.ts (새 파일)
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  sessionId?: string;
  operation?: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  
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
    
    // 프로덕션에서는 Sentry 등으로 전송
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // Sentry.captureException(error);
    }
  }
}

export const logger = new Logger();
```

### 2단계: API 클라이언트 강화
```typescript
// src/lib/api-client.ts (수정)
import { logger } from './logger';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

async function apiRequest<T>(
  url: string,
  options: ApiOptions = {}
): Promise<T> {
  const { params, timeout = 30000, ...fetchOptions } = options;
  
  // URL 파라미터 처리
  const apiUrl = new URL(url, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      apiUrl.searchParams.set(key, String(value));
    });
  }
  
  // 타임아웃 처리
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    logger.debug('API Request', {
      operation: `${fetchOptions.method || 'GET'} ${apiUrl.pathname}`,
      metadata: { params }
    });
    
    const response = await fetch(apiUrl.toString(), {
      ...fetchOptions,
      signal: controller.signal,
      credentials: 'same-origin', // 쿠키 포함
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    // 401 처리
    if (response.status === 401) {
      logger.warn('Unauthorized access attempt', {
        operation: apiUrl.pathname
      });
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login?session=expired';
      }
      throw new ApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }
    
    // 에러 응답 처리
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      logger.error('API Request failed', undefined, {
        operation: apiUrl.pathname,
        metadata: {
          status: response.status,
          error: errorData
        }
      });
      
      throw new ApiError(
        errorData.error || `Request failed with status ${response.status}`,
        response.status,
        errorData.code,
        errorData.details
      );
    }
    
    // 성공 응답
    const data = await response.json();
    
    logger.debug('API Request successful', {
      operation: apiUrl.pathname
    });
    
    return data as T;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    // 타임아웃 에러
    if (error instanceof Error && error.name === 'AbortError') {
      logger.error('API Request timeout', error, {
        operation: apiUrl.pathname,
        metadata: { timeout }
      });
      throw new ApiError('Request timeout', 408, 'TIMEOUT');
    }
    
    // 네트워크 에러
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      logger.error('Network error', error, {
        operation: apiUrl.pathname
      });
      throw new ApiError('Network error', 0, 'NETWORK_ERROR');
    }
    
    // 기타 에러
    throw error;
  }
}

// 편의 메서드
export async function apiGet<T>(url: string, params?: ApiOptions['params']): Promise<T> {
  return apiRequest<T>(url, { method: 'GET', params });
}

export async function apiPost<T>(url: string, body?: unknown, options?: ApiOptions): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiPut<T>(url: string, body?: unknown, options?: ApiOptions): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T>(url: string, options?: ApiOptions): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'DELETE',
  });
}
```

### 3단계: 직접 fetch 제거
```typescript
// BEFORE: src/app/auth/callback/route.ts
const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/user/init`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId })
});

// AFTER: src/app/auth/callback/route.ts
import { apiPost } from '@/lib/api-client';
import { env } from '@/env';

const response = await apiPost('/api/user/init', { userId });

// 13개 모든 직접 fetch 패턴 변경
```

### 4단계: Silent Failure 제거
```typescript
// BEFORE: src/middleware.ts:93
} catch (_error) {
  // 무시
}

// AFTER: src/middleware.ts:93
} catch (error) {
  logger.error('Middleware error', error, {
    operation: 'session-refresh',
    metadata: { pathname: request.nextUrl.pathname }
  });
  
  // 에러여도 요청은 계속 처리 (UX 고려)
  return NextResponse.next();
}

// BEFORE: src/lib/youtube/queue-manager.ts:204
} catch (error) {
  // Silent fail
}

// AFTER: src/lib/youtube/queue-manager.ts:204
} catch (error) {
  logger.error('Queue processing failed', error, {
    operation: 'youtube-queue',
    metadata: { 
      queueSize: this.queue.length,
      retryCount: this.retryCount 
    }
  });
  
  // 재시도 로직
  if (this.retryCount < 3) {
    this.retryCount++;
    setTimeout(() => this.processQueue(), 5000 * this.retryCount);
  } else {
    // 최종 실패 처리
    this.handleFinalFailure(error);
  }
}
```

### 5단계: 환경변수 타입 안전
```typescript
// src/env.ts (수정/생성)
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    ENCRYPTION_KEY: z.string().length(64),
    TOSS_SECRET_KEY: z.string().optional(),
    NODE_ENV: z.enum(['development', 'production', 'test']),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_TOSS_CLIENT_KEY: z.string().optional(),
  },
  runtimeEnv: {
    // Server
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    TOSS_SECRET_KEY: process.env.TOSS_SECRET_KEY,
    NODE_ENV: process.env.NODE_ENV,
    // Client
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
  },
});

// 사용 예시 (모든 process.env 대체)
// BEFORE:
const apiKey = process.env.ENCRYPTION_KEY;

// AFTER:
import { env } from '@/env';
const apiKey = env.ENCRYPTION_KEY; // 타입 안전, 빌드 타임 검증
```

### 6단계: console.log 제거
```typescript
// 모든 console.log를 logger로 대체
// BEFORE:
console.log('User logged in', userId);

// AFTER:
logger.info('User logged in', { userId });

// BEFORE:
console.error('Error:', error);

// AFTER:
logger.error('Operation failed', error);
```

## 📋 QA 테스트 시나리오
### 정상 플로우
1. API 호출 성공 → 로그 기록
2. 환경변수 접근 → 타입 안전
3. 에러 발생 → 구조화된 로깅

### 실패 시나리오
1. API 타임아웃 → 재시도 및 로깅
2. 네트워크 에러 → 사용자 친화적 메시지
3. 환경변수 누락 → 빌드 실패 (조기 발견)

### 성능 측정
- API 호출 오버헤드: < 10ms
- 로깅 오버헤드: < 5ms
- 환경변수 검증: 빌드 타임

## ✅ Phase 완료 조건 (기능 작동 필수)
- [ ] **직접 fetch 0개 달성**
  ```bash
  grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" | grep -v "api-client" | wc -l
  # 결과: 0
  ```
- [ ] **Silent failure 0개**
- [ ] **구조화된 로깅 구현**
- [ ] **환경변수 타입 안전 100%**
- [ ] **모든 검증 통과**: `npm run verify:parallel`
- [ ] **빌드 성공**: `npm run build`
- [ ] **타입 체크 통과**: `npm run type-check`
- [ ] **보안 테스트 통과**: `npm run security:test`

## 🔄 롤백 절차
```bash
# Phase 4 롤백
# 1. 새 파일 삭제
rm src/lib/logger.ts

# 2. 변경사항 되돌리기
git checkout -- src/lib/api-client.ts
git checkout -- src/env.ts
git checkout -- src/

# 3. 이전 커밋으로 복원
git reset --hard HEAD~1
```

## 🎉 프로젝트 완료
**축하합니다! 모든 Critical 이슈가 해결되었습니다.**

### 최종 성과
- ✅ DB 테이블 15개 생성 및 RLS 적용
- ✅ TypeScript any 타입 0개 달성
- ✅ 모든 라우트 보호 적용
- ✅ API 클라이언트 통일
- ✅ 구조화된 로깅 시스템
- ✅ 환경변수 타입 안전성

### 다음 단계
1. High 우선순위 이슈 해결 (144개)
2. Medium 이슈 개선 (58개)
3. 성능 최적화
4. 테스트 커버리지 향상

### 유지보수 권장사항
- 매일: `npm run verify:parallel` 실행
- 주간: 보안 감사 실행
- 월간: 의존성 업데이트