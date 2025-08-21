# 🚨 디하클 에러 처리 전략

*모든 에러 상황에 대한 표준 대응 방법*

---

## 🎯 에러 처리 원칙

1. **사용자 친화적**: 기술적 에러 메시지 노출 금지
2. **복구 가능**: 재시도/대안 제공
3. **로깅 필수**: 모든 에러는 콘솔/서버에 기록
4. **일관성**: 동일 에러는 동일하게 처리

---

## 📊 HTTP 에러 코드별 처리

### 🔐 401 Unauthorized (인증 필요)

#### 개선된 401 처리 전략 (2025-02-02 업데이트)
```typescript
// ✅ 개선된 구현 - API 키 문제와 인증 문제 구분
if (error.status === 401) {
  // 1. 에러 메시지로 문제 유형 판단
  const errorMessage = error.message?.toLowerCase() || '';
  const errorData = error.data;
  
  // 2. API 키 문제인지 확인
  const isApiKeyError = 
    errorData?.requiresApiKey ||
    errorData?.errorCode === 'api_key_required' ||
    errorMessage.includes('api key');
  
  if (isApiKeyError) {
    // API 키 문제 - 로그인 리다이렉트 X
    toast.error('YouTube API Key 설정이 필요합니다');
    // 선택적: API 키 설정 페이지로 안내
    // router.push('/settings/api-keys');
  } else {
    // 3. 실제 인증 문제 - 쿠키로 로그인 상태 확인
    const isLoggedIn = document.cookie.includes('sb-');
    
    if (!isLoggedIn) {
      // 로그인 필요
      toast.error('로그인이 필요합니다');
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${currentPath}`);
    } else {
      // 세션 만료
      toast.error('세션이 만료되었습니다. 새로고침 후 다시 시도해주세요.');
    }
  }
}
```

**적용 완료 컴포넌트** ✅:
- /tools/youtube-lens/PopularShortsList.tsx 
- /tools/youtube-lens/ChannelFolders.tsx
- /tools/youtube-lens/CollectionBoard.tsx

### 🔑 400 Bad Request (API 키 문제)
```typescript
// ✅ API 키 부재 처리
if (error.status === 400) {
  const data = error.data;
  if (data?.requiresApiKey || data?.errorCode === 'api_key_required') {
    toast.error('API Key 설정이 필요합니다. 설정 페이지에서 등록해주세요.');
    // API 키 설정 UI 표시 또는 설정 페이지 안내
    return;
  }
  // 일반 400 에러 처리
  toast.error('요청이 올바르지 않습니다');
}
```

---

### 🚫 403 Forbidden (권한 없음)
```typescript
// ✅ 올바른 구현
if (error.status === 403) {
  toast.error('접근 권한이 없습니다')
  router.back() // 이전 페이지로
}
```

**적용 상황**:
- 관리자 페이지 접근
- 다른 사용자 데이터 수정 시도

---

### 🔍 404 Not Found
```typescript
// ✅ 올바른 구현
if (error.status === 404) {
  // 리소스 타입별 처리
  if (resourceType === 'post') {
    toast.error('게시글을 찾을 수 없습니다')
    router.push('/community/board')
  } else if (resourceType === 'course') {
    toast.error('강의를 찾을 수 없습니다')
    router.push('/courses')
  } else {
    toast.error('페이지를 찾을 수 없습니다')
    router.push('/')
  }
}
```

---

### ⚠️ 422 Validation Error
```typescript
// ✅ 올바른 구현
if (error.status === 422) {
  const validationErrors = error.data.errors
  
  // 필드별 에러 표시
  Object.keys(validationErrors).forEach(field => {
    setFieldError(field, validationErrors[field])
  })
  
  toast.error('입력 정보를 확인해주세요')
}
```

---

### 💥 500 Internal Server Error
```typescript
// ✅ 올바른 구현
if (error.status === 500) {
  // 1. 사용자 메시지
  toast.error('일시적인 오류가 발생했습니다')
  
  // 2. 자동 재시도 (3회)
  if (retryCount < 3) {
    setTimeout(() => retry(), 1000 * retryCount)
  } else {
    // 3. 재시도 실패 시
    showErrorModal({
      title: '서비스 오류',
      message: '문제가 지속되면 고객센터에 문의해주세요',
      actions: [
        { label: '다시 시도', onClick: retry },
        { label: '홈으로', onClick: () => router.push('/') }
      ]
    })
  }
  
  // 4. 에러 로깅
  console.error('Server Error:', error)
  // Sentry 등 에러 추적 서비스로 전송
}
```

---

## 🌐 네트워크 에러 처리

### Connection Failed
```typescript
// ✅ 올바른 구현
window.addEventListener('offline', () => {
  toast.warning('인터넷 연결이 끊어졌습니다')
})

window.addEventListener('online', () => {
  toast.success('인터넷에 다시 연결되었습니다')
  // 대기 중인 요청 재시도
  retryPendingRequests()
})
```

### Timeout
```typescript
// ✅ 올바른 구현
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 10000)

try {
  const response = await fetch(url, {
    signal: controller.signal
  })
} catch (error) {
  if (error.name === 'AbortError') {
    toast.error('요청 시간이 초과되었습니다')
    // 재시도 버튼 표시
  }
}
```

---

## 🎨 UI 에러 상태 표시

### 로딩 상태 (3단계)
```typescript
type State = 'idle' | 'loading' | 'success' | 'error'

// UI 렌더링
{state === 'idle' && <EmptyState />}
{state === 'loading' && <Skeleton />}
{state === 'success' && <DataList data={data} />}
{state === 'error' && <ErrorMessage onRetry={retry} />}
```

### Empty State 디자인
```tsx
// ✅ 올바른 구현
<div className="text-center py-12">
  <Icon name="inbox" className="w-16 h-16 mx-auto text-gray-400" />
  <h3 className="mt-4 text-lg font-medium">데이터가 없습니다</h3>
  <p className="mt-2 text-sm text-gray-500">
    첫 번째 {itemType}을(를) 추가해보세요
  </p>
  <Button onClick={onCreate} className="mt-4">
    {itemType} 추가하기
  </Button>
</div>
```

### Error Boundary 컴포넌트
```tsx
// ✅ 올바른 구현
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    // 에러 로깅
    console.error('React Error:', error, errorInfo)
    // Sentry 전송
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false })}
        />
      )
    }
    return this.props.children
  }
}
```

---

## 📝 에러 메시지 가이드라인

### 사용자 친화적 메시지
| 상황 | ❌ 나쁨 | ✅ 좋음 |
|------|--------|--------|
| 로그인 필요 | "401 Unauthorized" | "로그인이 필요합니다" |
| 네트워크 에러 | "Network Error" | "인터넷 연결을 확인해주세요" |
| 서버 에러 | "Internal Server Error" | "일시적인 오류가 발생했습니다" |
| 유효성 검사 | "Validation Failed" | "이메일 형식이 올바르지 않습니다" |
| 권한 없음 | "403 Forbidden" | "이 작업을 수행할 권한이 없습니다" |

### Toast 메시지 타입
```typescript
// 성공
toast.success('저장되었습니다')

// 정보
toast.info('새로운 업데이트가 있습니다')

// 경고
toast.warning('저장하지 않은 변경사항이 있습니다')

// 에러
toast.error('저장에 실패했습니다')
```

---

## 🔄 에러 복구 전략

### 1. 자동 재시도
```typescript
const retryWithExponentialBackoff = async (
  fn: () => Promise<any>,
  maxRetries = 3
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      
      // 지수 백오프: 1초, 2초, 4초...
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000))
    }
  }
}
```

### 2. 낙관적 업데이트 롤백
```typescript
const likePost = async (postId: string) => {
  // 1. 낙관적 업데이트
  setLikeCount(prev => prev + 1)
  setIsLiked(true)
  
  try {
    // 2. API 호출
    await api.likePost(postId)
  } catch (error) {
    // 3. 실패 시 롤백
    setLikeCount(prev => prev - 1)
    setIsLiked(false)
    toast.error('좋아요 실패')
  }
}
```

### 3. 오프라인 큐
```typescript
// 오프라인 시 요청 저장
const offlineQueue = []

const apiCall = async (request) => {
  if (!navigator.onLine) {
    offlineQueue.push(request)
    return { offline: true }
  }
  
  return await fetch(request)
}

// 온라인 복귀 시 처리
window.addEventListener('online', () => {
  offlineQueue.forEach(request => {
    fetch(request)
  })
  offlineQueue.length = 0
})
```

---

## 📊 에러 모니터링

### 콘솔 로깅 표준
```typescript
// 개발 환경
if (process.env.NODE_ENV === 'development') {
  console.error('[API Error]', {
    url: request.url,
    method: request.method,
    status: error.status,
    message: error.message,
    timestamp: new Date().toISOString()
  })
}

// 프로덕션 환경
if (process.env.NODE_ENV === 'production') {
  // Sentry, LogRocket 등으로 전송
  Sentry.captureException(error, {
    extra: { url, method, status }
  })
}
```

---

## 🎯 구현 체크리스트

### Phase 1 (긴급) - 401 처리
- [ ] /tools/youtube-lens 401 → 로그인
- [ ] /mypage/* 401 → 로그인
- [ ] /settings/api-keys 401 → 로그인
- [ ] from 파라미터로 복귀 처리

### Phase 2 (중요) - 에러 UI
- [ ] ErrorBoundary 컴포넌트 추가
- [ ] Empty State 컴포넌트 통일
- [ ] 로딩/에러 상태 표준화
- [ ] Toast 메시지 가이드 적용

### Phase 3 (개선) - 복구 전략
- [ ] 자동 재시도 로직
- [ ] 오프라인 큐 구현
- [ ] 에러 로깅 시스템
- [ ] 에러 모니터링 대시보드

---

## 🔧 TypeScript 타입 시스템 & 에러 처리 (2025-02-02 업데이트)

### 🎯 Single Source of Truth 타입 시스템
```
Supabase DB (snake_case)
     ↓
database.generated.ts (자동 생성)
     ↓
src/types/index.ts (변환 레이어)
     ↓
Frontend Components (camelCase)
```

### 타입 import 규칙
```typescript
// ✅ 올바른 import - @/types에서만
import { User, CommunityPost, snakeToCamelCase } from '@/types';

// ❌ 잘못된 import - generated 파일 직접 참조 금지
import { Database } from '@/types/database.generated';
```

### API 에러 응답 타입 정의
```typescript
// 표준 에러 응답 타입
import { ApiResponse } from '@/types';

interface ErrorResponse {
  error: string;
  errorCode?: string;
  requiresApiKey?: boolean;
  details?: unknown;
}

// API 호출 시 타입 지정
try {
  const data = await apiGet<User>('/api/user/profile');
} catch (error) {
  // 타입 안전한 에러 처리
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

### @typescript-eslint/no-explicit-any 에러
**해결 전략:**
1. **@/types에서 타입 import**
   ```typescript
   // ❌ 금지
   apiPost<any>('/api/endpoint')
   
   // ✅ 권장 - @/types에서 타입 가져오기
   import { CommunityPost } from '@/types';
   apiPost<CommunityPost>('/api/community/posts', data)
   ```

2. **타입 추론 활용 (타입 제거)**
   ```typescript
   // 타입을 제거하고 TypeScript가 추론하도록
   const result = await apiPost('/api/endpoint') // any 제거
   ```

3. **unknown + 타입 가드**
   ```typescript
   // ❌ 금지
   const data: Record<string, any> = {}
   
   // ✅ 권장
   const data: Record<string, unknown> = {}
   if (typeof data.field === 'string') {
     // 타입 가드 후 안전한 접근
   }
   ```

4. **snake_case ↔ camelCase 변환**
   ```typescript
   import { snakeToCamelCase, camelToSnakeCase } from '@/types';
   
   // DB에서 데이터 읽기
   const dbData = await supabase.from('users').select();
   const userData = snakeToCamelCase<User>(dbData.data);
   
   // DB에 데이터 저장
   const saveData = camelToSnakeCase(userData);
   await supabase.from('users').insert(saveData);
   ```

### ZodError 처리
```typescript
// ❌ 잘못된 접근
result.error.errors // ZodError.errors는 존재하지 않음

// ✅ 올바른 접근  
result.error.issues // ZodError.issues 사용
```

### 함수 반환 타입 누락
```typescript
// ❌ 반환 타입 없음
export async function getData() {
  // ...
}

// ✅ 명시적 반환 타입
export async function getData(): Promise<DataType[]> {
  // ...
}
```

### unknown 타입 안전 처리
```typescript
// Extract 유틸리티 타입 활용
cleaned[key] = value as T[Extract<keyof T, string>];

// 타입 체크 후 접근
if (obj && typeof obj === 'object' && 'property' in obj) {
  // obj.property 안전하게 접근
}
```

---

## 🚨 긴급 수정 필요 (Top 5)

1. **YouTube Lens 401 에러** → 로그인 리다이렉트 ❌
2. **마이페이지 인증 체크** → 세션 검사 누락 ❌  
3. **API 에러 메시지** → "Failed to fetch" 노출 ❌
4. **500 에러 처리** → 재시도 없음 ❌
5. **네트워크 에러** → 처리 없음 ❌

---

*에러 처리 작업 시 이 문서 필수 참조*