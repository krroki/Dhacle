/sc:implement --seq --validate --c7 --think
"Phase 2: API Client 패턴 구현 및 전체 적용 - apiClient 구현, 30+ routes 적용, fetch 제거"

# Phase 2: API Client 패턴 구현 및 전체 적용

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📚 온보딩 섹션

### 작업 관련 경로
- API Client: `src/lib/api-client.ts` (구현 필요)
- API Routes: `src/app/api/*/route.ts` (43개)
- 훅: `src/hooks/` (사용처)
- 컴포넌트: `src/components/` (사용처)

### 프로젝트 컨텍스트 확인
```bash
# 현재 apiClient 사용 확인
grep -r "apiClient\." src/ --include="*.ts" --include="*.tsx" | wc -l  # 0개

# 직접 fetch 사용 확인
grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" | grep -v "api-client" | grep -v "//"  # 7개

# API routes 목록
find src/app/api -name "route.ts" -type f | wc -l  # 43개
```

## 📌 목적
통일된 API Client 패턴을 구현하고 모든 API 호출을 표준화하여 유지보수성과 타입 안정성 확보

## 🤖 실행 AI 역할
API 아키텍트로서 완전한 API Client를 구현하고 프로젝트 전체에 적용하는 역할

## 📝 작업 내용

### 1단계: API Client 구현

#### 1.1 `src/lib/api-client.ts` 생성
```typescript
import { ApiResponse } from '@/types';

class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_APP_URL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 인증 토큰 가져오기
   */
  private async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    
    // Supabase 세션에서 토큰 가져오기
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  /**
   * 요청 헤더 준비
   */
  private async prepareHeaders(customHeaders?: HeadersInit): Promise<Headers> {
    const headers = new Headers(this.defaultHeaders);
    
    // 인증 토큰 추가
    const token = await this.getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // 커스텀 헤더 병합
    if (customHeaders) {
      const customHeadersObj = new Headers(customHeaders);
      customHeadersObj.forEach((value, key) => {
        headers.set(key, value);
      });
    }

    return headers;
  }

  /**
   * 에러 처리
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    // 204 No Content 처리
    if (response.status === 204) {
      return { data: null as T };
    }

    const contentType = response.headers.get('content-type');
    
    // JSON 응답 처리
    if (contentType?.includes('application/json')) {
      const json = await response.json();
      
      if (!response.ok) {
        return {
          error: json.error || `HTTP ${response.status}`,
          message: json.message || response.statusText,
        };
      }
      
      return { data: json };
    }

    // 텍스트 응답 처리
    const text = await response.text();
    if (!response.ok) {
      return {
        error: `HTTP ${response.status}`,
        message: text || response.statusText,
      };
    }

    return { data: text as T };
  }

  /**
   * GET 요청
   */
  async get<T>(
    endpoint: string,
    options?: {
      params?: Record<string, string>;
      headers?: HeadersInit;
      signal?: AbortSignal;
    }
  ): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseURL}${endpoint}`);
      
      // 쿼리 파라미터 추가
      if (options?.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      const headers = await this.prepareHeaders(options?.headers);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        signal: options?.signal,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        return {
          error: 'Network Error',
          message: error.message,
        };
      }
      return {
        error: 'Unknown Error',
        message: 'An unknown error occurred',
      };
    }
  }

  /**
   * POST 요청
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: {
      headers?: HeadersInit;
      signal?: AbortSignal;
    }
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.prepareHeaders(options?.headers);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: options?.signal,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        return {
          error: 'Network Error',
          message: error.message,
        };
      }
      return {
        error: 'Unknown Error',
        message: 'An unknown error occurred',
      };
    }
  }

  /**
   * PUT 요청
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: {
      headers?: HeadersInit;
      signal?: AbortSignal;
    }
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.prepareHeaders(options?.headers);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: options?.signal,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        return {
          error: 'Network Error',
          message: error.message,
        };
      }
      return {
        error: 'Unknown Error',
        message: 'An unknown error occurred',
      };
    }
  }

  /**
   * PATCH 요청
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: {
      headers?: HeadersInit;
      signal?: AbortSignal;
    }
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.prepareHeaders(options?.headers);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: options?.signal,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        return {
          error: 'Network Error',
          message: error.message,
        };
      }
      return {
        error: 'Unknown Error',
        message: 'An unknown error occurred',
      };
    }
  }

  /**
   * DELETE 요청
   */
  async delete<T>(
    endpoint: string,
    options?: {
      headers?: HeadersInit;
      signal?: AbortSignal;
    }
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.prepareHeaders(options?.headers);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers,
        signal: options?.signal,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        return {
          error: 'Network Error',
          message: error.message,
        };
      }
      return {
        error: 'Unknown Error',
        message: 'An unknown error occurred',
      };
    }
  }

  /**
   * 파일 업로드
   */
  async upload<T>(
    endpoint: string,
    formData: FormData,
    options?: {
      headers?: HeadersInit;
      signal?: AbortSignal;
      onProgress?: (progress: number) => void;
    }
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.prepareHeaders(options?.headers);
      // Content-Type 제거 (FormData가 자동 설정)
      headers.delete('Content-Type');
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        signal: options?.signal,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        return {
          error: 'Network Error',
          message: error.message,
        };
      }
      return {
        error: 'Unknown Error',
        message: 'An unknown error occurred',
      };
    }
  }
}

// 싱글톤 인스턴스 export
export const apiClient = new ApiClient();

// 타입 export
export type { ApiResponse };
```

### 2단계: 기존 직접 fetch 호출 제거 (7개)

#### 2.1 각 직접 fetch 찾아서 apiClient로 교체
```typescript
// 예시: 기존 코드
const response = await fetch('/api/youtube/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
const result = await response.json();

// 수정 후
import { apiClient } from '@/lib/api-client';

const response = await apiClient.post<SearchResult>('/api/youtube/search', data);
if (response.error) {
  // 에러 처리
  throw new Error(response.error);
}
const result = response.data;
```

### 3단계: React Query 훅에 apiClient 적용

#### 3.1 `src/hooks/queries/useYouTube.ts` 예시
```typescript
import { apiClient } from '@/lib/api-client';

export function useYouTubeSearch(query: string) {
  return useQuery({
    queryKey: ['youtube', 'search', query],
    queryFn: async () => {
      const response = await apiClient.post<YouTubeSearchResult>(
        '/api/youtube/search',
        { query }
      );
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data;
    },
    enabled: !!query,
  });
}
```

### 4단계: 컴포넌트에서 apiClient 사용

#### 4.1 폼 제출 예시
```typescript
// src/components/forms/ProfileForm.tsx
import { apiClient } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';

const handleSubmit = async (data: ProfileData) => {
  try {
    const response = await apiClient.put<Profile>('/api/user/profile', data);
    
    if (response.error) {
      toast.error(response.message || '프로필 업데이트 실패');
      return;
    }
    
    toast.success('프로필이 업데이트되었습니다');
    // 성공 처리
  } catch (error) {
    console.error('Profile update error:', error);
    toast.error('네트워크 오류가 발생했습니다');
  }
};
```

### 5단계: 에러 처리 표준화

#### 5.1 `src/lib/api-error-handler.ts` 생성
```typescript
import { ApiResponse } from '@/types';
import { toast } from '@/hooks/use-toast';

export function handleApiError(response: ApiResponse<unknown>) {
  if (!response.error) return;

  // 상태 코드별 처리
  const errorMessage = response.message || response.error;

  switch (response.error) {
    case 'User not authenticated':
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
      break;
    case 'Forbidden':
      toast.error('권한이 없습니다');
      break;
    case 'Not Found':
      toast.error('요청한 리소스를 찾을 수 없습니다');
      break;
    case 'Network Error':
      toast.error('네트워크 연결을 확인해주세요');
      break;
    default:
      toast.error(errorMessage);
  }
}
```

### 6단계: 로깅 및 모니터링

#### 6.1 `src/lib/api-logger.ts` 생성
```typescript
import { logger } from '@/lib/logger';

export function logApiCall(
  method: string,
  endpoint: string,
  response: ApiResponse<unknown>
) {
  if (response.error) {
    logger.error('API Error', {
      method,
      endpoint,
      error: response.error,
      message: response.message,
    });
  } else {
    logger.info('API Success', {
      method,
      endpoint,
    });
  }
}
```

## ✅ 완료 조건

### 필수 체크리스트
- [ ] API Client 구현 완료
  ```bash
  ls -la src/lib/api-client.ts  # 파일 존재 확인
  ```
- [ ] apiClient 사용 30개 이상
  ```bash
  grep -r "apiClient\." src/ --include="*.ts" --include="*.tsx" | wc -l  # 30+ expected
  ```
- [ ] 직접 fetch 사용 0개
  ```bash
  grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" | grep -v "api-client" | grep -v "//" | wc -l  # 0 expected
  ```
- [ ] API 일관성 검증 통과
  ```bash
  node scripts/verify-api-consistency.js  # All pass expected
  ```

### 품질 기준
- [ ] 모든 API 호출 타입 안전
- [ ] 에러 처리 통일
- [ ] 인증 자동 처리
- [ ] 로깅 구현

## 📋 QA 테스트 시나리오

### API Client 테스트
```typescript
// 테스트 파일: src/lib/api-client.test.ts
describe('ApiClient', () => {
  it('GET 요청 성공', async () => {
    const response = await apiClient.get('/api/health');
    expect(response.data).toBeDefined();
    expect(response.error).toBeUndefined();
  });

  it('POST 요청 성공', async () => {
    const response = await apiClient.post('/api/test', { data: 'test' });
    expect(response.data).toBeDefined();
  });

  it('에러 처리', async () => {
    const response = await apiClient.get('/api/nonexistent');
    expect(response.error).toBeDefined();
    expect(response.data).toBeUndefined();
  });

  it('인증 헤더 포함', async () => {
    // 로그인 후 테스트
    const response = await apiClient.get('/api/user/profile');
    // Authorization 헤더 확인
  });
});
```

### 통합 테스트
```bash
# 1. 개발 서버 실행
npm run dev

# 2. API 호출 테스트
# 브라우저 콘솔에서
const { apiClient } = await import('/lib/api-client');
const response = await apiClient.get('/api/health');
console.log(response);

# 3. 주요 기능 테스트
# - 로그인
# - 프로필 업데이트
# - YouTube 검색
# - 파일 업로드
```

## 🔄 롤백 계획

### 실패 시 롤백
```bash
# API Client 제거
rm src/lib/api-client.ts
rm src/lib/api-error-handler.ts
rm src/lib/api-logger.ts

# 변경사항 되돌리기
git checkout -- src/hooks/
git checkout -- src/components/

# 또는 전체 롤백
git reset --hard HEAD
```

## 🚨 주의사항

### 절대 금지
- ❌ 직접 fetch 사용
- ❌ 에러 무시
- ❌ 타입 없는 API 호출
- ❌ 인증 수동 처리

### 필수 수행
- ✅ apiClient 사용
- ✅ 에러 처리
- ✅ 타입 정의
- ✅ 로깅 구현

## 📊 예상 결과

### Before
```
apiClient 사용: 0개
직접 fetch: 7개
API 일관성: 실패
```

### After
```
apiClient 사용: 30+ 개
직접 fetch: 0개
API 일관성: 통과
```

## → 다음 Phase
- 파일: `PHASE_3_ERROR_HANDLING_SECURITY.md`
- 조건: apiClient 30개 이상 사용 달성 후 진행

---

**⚠️ 중요**: 모든 API 호출을 apiClient로 통일하세요. 예외 없습니다!