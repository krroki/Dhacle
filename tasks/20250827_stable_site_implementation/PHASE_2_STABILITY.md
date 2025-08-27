/sc:improve --seq --validate --think --persona-qa
"Phase 2: 안정성 확보 - 에러 처리, 데이터 검증, 로딩 상태 구현"

# Phase 2: 안정성 및 에러 처리

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인
- 에러 숨기기 금지 (try-catch로 숨기기 X)
- 실제 사용자 피드백 제공
- 데이터 검증 철저히

## 📌 Phase 정보
- Phase 번호: 2/3
- 예상 시간: 2일
- 우선순위: 🟠 HIGH
- 선행 조건: Phase 1 완료 (기능 구현)
- 목표: **안정적이고 신뢰할 수 있는 사이트**

## 📚 온보딩 섹션

### 작업 관련 경로
- 에러 처리: `src/lib/api-error.ts`
- 검증 스키마: `src/lib/security/validation-schemas.ts`
- 에러 바운더리: `src/components/ErrorBoundary.tsx`
- 토스트: `src/components/ui/use-toast.tsx`

### 🔥 실제 코드 패턴 확인
```bash
# 현재 에러 처리 패턴
grep -r "try.*catch" src/app/api --include="*.ts" | head -10

# Zod 검증 사용 현황
grep -r "z\." src/ --include="*.ts" | head -10

# 로딩 상태 패턴
grep -r "isLoading\|isPending" src/ --include="*.tsx" | head -10
```

## 🎯 Phase 목표
1. 모든 API에 에러 처리 구현
2. 입력 데이터 검증 (Zod)
3. 로딩/에러 상태 UI
4. 사용자 친화적 피드백

## 📝 작업 내용

### 1️⃣ API 에러 처리 표준화

#### 에러 응답 포맷 통일
```typescript
// src/lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown): NextResponse {
  logger.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return NextResponse.json(
      { 
        error: error.message,
        details: error.details 
      },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: error.errors 
      },
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

#### API Route 에러 처리 적용
```typescript
// src/app/api/user/profile/route.ts
import { handleApiError } from '@/lib/api-error';
import { profileUpdateSchema } from '@/lib/security/validation-schemas';

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    if (!user) {
      throw new ApiError(401, 'User not authenticated');
    }

    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('profiles')
      .update(validatedData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to update profile', error);
    }

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 2️⃣ Zod 검증 스키마 구현

```typescript
// src/lib/security/validation-schemas.ts
import { z } from 'zod';

// 프로필 업데이트 스키마
export const profileUpdateSchema = z.object({
  username: z.string().min(2).max(50).optional(),
  display_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  work_type: z.enum(['student', 'employee', 'freelancer', 'business', 'other']).optional(),
});

// 네이버 카페 인증 스키마
export const naverCafeVerificationSchema = z.object({
  cafeMemberUrl: z.string().url().refine(
    (url) => url.includes('cafe.naver.com'),
    { message: '유효한 네이버 카페 URL이 아닙니다' }
  ),
  cafeNickname: z.string().min(1).max(50),
});

// YouTube 검색 스키마
export const youtubeSearchSchema = z.object({
  query: z.string().min(1).max(100),
  maxResults: z.number().min(1).max(50).default(10),
  pageToken: z.string().optional(),
});

// 수익 인증 생성 스키마
export const revenueProofCreateSchema = z.object({
  title: z.string().min(1).max(200),
  amount: z.number().positive(),
  currency: z.enum(['KRW', 'USD', 'JPY']).default('KRW'),
  description: z.string().max(1000).optional(),
  proof_date: z.string().datetime(),
  image_url: z.string().url().optional(),
});
```

### 3️⃣ 로딩 및 에러 상태 UI

#### 로딩 컴포넌트
```typescript
// src/components/common/LoadingSpinner.tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }[size];

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`${sizeClass} animate-spin rounded-full border-b-2 border-primary`} />
    </div>
  );
}

// src/components/common/LoadingSkeleton.tsx
export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );
}
```

#### 에러 바운더리 구현
```typescript
// src/components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // 에러 로깅 서비스로 전송
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">문제가 발생했습니다</h2>
          <p className="text-gray-600 mb-4 text-center">
            일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          <Button onClick={() => window.location.reload()}>
            페이지 새로고침
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 4️⃣ React Query 에러 처리

```typescript
// src/hooks/queries/useYouTubeSearch.ts
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { toast } from '@/components/ui/use-toast';

export function useYouTubeSearch(query: string) {
  return useQuery({
    queryKey: ['youtube-search', query],
    queryFn: async () => {
      const response = await apiGet(`/api/youtube/search?q=${query}`);
      if (!response.ok) {
        throw new Error(response.error || 'Search failed');
      }
      return response.data;
    },
    enabled: !!query,
    retry: 2,
    retryDelay: 1000,
    onError: (error: Error) => {
      toast({
        title: '검색 실패',
        description: error.message || '잠시 후 다시 시도해주세요',
        variant: 'destructive',
      });
    },
  });
}
```

### 5️⃣ 사용자 피드백 시스템

```typescript
// src/components/common/UserFeedback.tsx
'use client';

import { toast } from '@/components/ui/use-toast';

export const showSuccess = (message: string) => {
  toast({
    title: '성공',
    description: message,
    className: 'bg-green-50 border-green-200',
  });
};

export const showError = (message: string) => {
  toast({
    title: '오류',
    description: message,
    variant: 'destructive',
  });
};

export const showInfo = (message: string) => {
  toast({
    title: '안내',
    description: message,
  });
};

// 사용 예시
// showSuccess('프로필이 업데이트되었습니다');
// showError('네트워크 오류가 발생했습니다');
// showInfo('인증 요청이 접수되었습니다');
```

## ✅ 완료 조건

### 🔴 필수 완료 조건

```bash
# 1. 에러 처리 구현
- [ ] 모든 API Route에 try-catch 구현
- [ ] 표준 에러 응답 포맷 적용
- [ ] Zod 검증 스키마 적용

# 2. UI 안정성
- [ ] 모든 페이지에 ErrorBoundary 적용
- [ ] 로딩 상태 표시 (스켈레톤/스피너)
- [ ] 에러 상태 UI 표시

# 3. 사용자 피드백
- [ ] 성공/실패 토스트 메시지
- [ ] 입력 검증 실시간 피드백
- [ ] 네트워크 오류 시 재시도 버튼

# 4. 실제 테스트
- [ ] 네트워크 끊김 시나리오
- [ ] 잘못된 입력 시나리오
- [ ] 권한 없는 접근 시나리오
```

## 📋 QA 테스트 시나리오

### 🔴 필수: 에러 시나리오 테스트

```bash
# 1. 네트워크 오류 시뮬레이션
1. DevTools → Network → Offline
2. 각 기능 클릭
3. 에러 메시지 표시 확인
4. "재시도" 버튼 작동 확인

# 2. 입력 검증 테스트
1. 빈 폼 제출 → "필수 입력" 메시지
2. 잘못된 URL 입력 → "유효한 URL이 아닙니다"
3. 긴 텍스트 입력 → 글자 수 제한 메시지
4. XSS 시도 → 텍스트로만 표시

# 3. 권한 테스트
1. 로그아웃 상태 → 로그인 필요 페이지 접근
2. 일반 유저 → 관리자 페이지 접근
3. 401/403 에러 처리 확인
```

### 🟡 권장: 성능 모니터링

```bash
# Chrome DevTools → Performance
- [ ] 로딩 시간 측정
- [ ] 에러 복구 시간
- [ ] 메모리 누수 확인
```

## 🔄 롤백 계획

```bash
# 안정성 문제 발생 시
1. 에러 로그 수집
2. 문제 지점 격리
3. 이전 버전으로 부분 롤백
4. 핫픽스 적용
```

## → 다음 Phase

Phase 2 완료 후 Phase 3로 진행:
```bash
cat PHASE_3_E2E_QUALITY.md
```

---
*Phase 2: 안정성 및 에러 처리*
*목표: 신뢰할 수 있는 안정적인 사이트*