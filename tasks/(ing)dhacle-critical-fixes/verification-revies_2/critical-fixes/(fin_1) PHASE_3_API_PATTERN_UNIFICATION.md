/sc:improve --seq --validate --think
"Phase 3: API 패턴 통일 - fetch를 apiClient로 변경, Silent failure 제거"

# 🔄 Phase 3: API 패턴 통일 지시서

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📚 온보딩 섹션

### 작업 관련 경로
- API Client: `src/lib/api-client.ts`
- Logger: `src/lib/logger.ts`
- 컴포넌트: `src/components/**/*.tsx`
- 페이지: `src/app/(pages)/**/*.tsx`

### 프로젝트 컨텍스트 확인
```bash
# 직접 fetch 사용 확인
grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" | grep -v "api-client"

# Silent failure 패턴 확인
grep -r "catch.*{}" src/ --include="*.ts" --include="*.tsx"

# apiClient 사용 현황
grep -r "apiClient" src/ | wc -l
```

## 📌 목적
**모든 API 호출을 표준화하고 에러 처리 강화**
- 현재: 13개 직접 fetch, 18개 silent failure
- 목표: 100% apiClient 사용, 0 silent failure

## 🤖 실행 AI 역할
API 표준화 전문가로서 일관된 API 패턴 구현 및 에러 처리 강화

## 📝 작업 내용

### Step 1: apiClient 개선 (src/lib/api-client.ts)

```typescript
// src/lib/api-client.ts
import { ApiResponse, ApiError } from '@/types';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

class ApiClient {
  private baseURL: string;
  private retryCount: number = 3;
  private timeout: number = 30000;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_APP_URL || '';
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let error: ApiError;
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        error = {
          code: data.code || `HTTP_${response.status}`,
          message: data.message || this.getErrorMessage(response.status),
          details: data.details
        };
      } else {
        error = {
          code: `HTTP_${response.status}`,
          message: this.getErrorMessage(response.status),
          details: await response.text()
        };
      }
      
      logger.error('API Error:', error);
      return { error };
    }

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return { data };
    }
    
    return { data: await response.text() as T };
  }

  private getErrorMessage(status: number): string {
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

  private async retryRequest<T>(
    fn: () => Promise<ApiResponse<T>>,
    retriesLeft: number = this.retryCount
  ): Promise<ApiResponse<T>> {
    try {
      return await fn();
    } catch (error) {
      if (retriesLeft === 0) {
        throw error;
      }
      
      logger.warn(`Retrying request, ${retriesLeft} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (this.retryCount - retriesLeft + 1)));
      return this.retryRequest(fn, retriesLeft - 1);
    }
  }

  async get<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        signal: AbortSignal.timeout(this.timeout)
      });
      
      return this.handleResponse<T>(response);
    });
  }

  async post<T>(url: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(this.timeout)
      });
      
      return this.handleResponse<T>(response);
    });
  }

  async put<T>(url: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    // Similar to post
  }

  async patch<T>(url: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    // Similar to post
  }

  async delete<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    // Similar to get
  }
}

export const apiClient = new ApiClient();
```

### Step 2: 직접 fetch를 apiClient로 변경

#### 2.1 컴포넌트에서 fetch 변경
```typescript
// Before (직접 fetch)
try {
  const response = await fetch('/api/youtube/analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId })
  });
  const data = await response.json();
} catch {}  // Silent failure!

// After (apiClient + 에러 처리)
import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { YouTubeAnalysis } from '@/types';

try {
  const response = await apiClient.post<YouTubeAnalysis>(
    '/api/youtube/analysis',
    { videoId }
  );
  
  if (response.error) {
    // 에러 처리
    logger.error('YouTube analysis failed:', response.error);
    toast.error(response.error.message);
    
    // 복구 시도 또는 대체 동작
    return getCachedAnalysis(videoId) || null;
  }
  
  if (response.data) {
    // 성공 처리
    logger.info('YouTube analysis completed', { videoId });
    return response.data;
  }
} catch (error) {
  // 네트워크 에러 등 예외 처리
  logger.error('Unexpected error in YouTube analysis:', error);
  toast.error('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  
  // 대체 동작
  return getCachedAnalysis(videoId) || null;
}
```

#### 2.2 React Query 훅에서 fetch 변경
```typescript
// Before (직접 fetch)
const fetchUser = async (id: string) => {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

// After (apiClient)
import { apiClient } from '@/lib/api-client';
import { User } from '@/types';

const fetchUser = async (id: string): Promise<User> => {
  const response = await apiClient.get<User>(`/api/users/${id}`);
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  if (!response.data) {
    throw new Error('No data received');
  }
  
  return response.data;
};
```

### Step 3: Silent Failure 패턴 제거

#### 3.1 빈 catch 블록 제거
```typescript
// Before (Silent failure)
try {
  await riskyOperation();
} catch {}  // ❌ 에러 무시!

// After (적절한 에러 처리)
try {
  await riskyOperation();
} catch (error) {
  // 1. 로깅
  logger.error('Risk operation failed:', {
    error,
    context: { /* relevant context */ }
  });
  
  // 2. 사용자 피드백
  toast.error('작업을 완료할 수 없습니다.');
  
  // 3. 복구 시도
  try {
    await fallbackOperation();
  } catch (fallbackError) {
    logger.error('Fallback also failed:', fallbackError);
    // 4. 상위로 전파
    throw new Error('Operation and fallback both failed');
  }
}
```

#### 3.2 의미 없는 기본값 반환 제거
```typescript
// Before (의미 없는 기본값)
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    return await response.json();
  } catch {
    return [];  // ❌ 에러를 숨김!
  }
};

// After (명시적 에러 상태)
const fetchData = async (): Promise<{ data?: Item[]; error?: string }> => {
  try {
    const response = await apiClient.get<Item[]>('/api/data');
    
    if (response.error) {
      return { 
        error: response.error.message,
        data: getCachedData() // 캐시된 데이터 제공
      };
    }
    
    return { data: response.data };
  } catch (error) {
    logger.error('Failed to fetch data:', error);
    return { 
      error: '데이터를 불러올 수 없습니다.',
      data: getCachedData() // 캐시된 데이터 제공
    };
  }
};
```

### Step 4: 로깅 표준화

```typescript
// src/lib/logger.ts 개선
export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, meta);
    }
    // Production: 외부 로깅 서비스로 전송
  },
  
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, meta);
    // Sentry 등으로 전송
  },
  
  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, error, meta);
    
    // Sentry로 에러 전송
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        extra: { message, ...meta }
      });
    }
  },
  
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, meta);
    }
  }
};
```

### Step 5: 에러 복구 전략 구현

```typescript
// 캐시 활용 복구
const getCachedData = <T>(key: string): T | null => {
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
  } catch {
    return null;
  }
};

// 재시도 로직
const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  }
  
  throw lastError!;
};
```

## ✅ 완료 조건
- [ ] 13개 직접 fetch → apiClient 변경
- [ ] 18개 silent failure 제거
- [ ] 모든 에러 로깅 추가
- [ ] 복구 전략 구현
- [ ] 사용자 피드백 추가

## 📋 QA 테스트 시나리오

### API 호출 테스트
1. 정상 요청 → 데이터 수신 확인
2. 401 에러 → 로그인 페이지 리다이렉트
3. 500 에러 → 에러 토스트 표시
4. 네트워크 오류 → 재시도 후 캐시 데이터

### 에러 처리 테스트
1. Silent failure 없음 확인
2. 모든 에러 로깅 확인
3. 사용자 피드백 표시 확인

## 🔄 롤백 계획
```bash
# API 호출 실패 시
git stash
git checkout -- src/lib/api-client.ts

# 부분 롤백
git diff > api-changes.patch
git checkout -- src/
git apply --reject api-changes.patch
```

## 🔍 검증 명령
```bash
# Phase 3 완료 검증
npm run verify:api

# fetch 사용 확인
grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" | grep -v "api-client" | wc -l
# Expected: 0

# Silent failure 확인
grep -r "catch.*{}" src/ --include="*.ts" --include="*.tsx" | wc -l
# Expected: 0

# apiClient 사용 확인
grep -r "apiClient" src/ | wc -l
# Expected: 30+
```

---

**⚠️ 주의사항**
1. 모든 에러는 로깅 필수
2. 사용자에게 명확한 피드백 제공
3. 가능한 경우 복구 전략 구현

**예상 작업 시간**: 6-8시간
**다음 Phase**: [Phase 4 - 데이터베이스 복원](./PHASE_4_DATABASE_RESTORATION.md)