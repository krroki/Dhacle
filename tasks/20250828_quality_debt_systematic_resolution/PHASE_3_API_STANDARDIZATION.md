/sc:implement --seq --validate --evidence --no-speculation
"Phase 3: API 패턴 표준화 - 에러 응답 형식 일관성 확보 - 30분 이내 완료"

# Phase 3/3: API 패턴 표준화

⚠️ **절대 준수사항**
- [ ] 추측 금지 - 모든 것을 확인 후 진행
- [ ] 임시방편 금지 - TODO, any, 주석처리 절대 금지
- [ ] 테스트 필수 - 작동 확인 없이 완료 보고 금지

## 📍 현재 상태 확인 (필수 실행)

### 파일 존재 확인

```bash
# 모든 API Route 파일 목록 (추측 금지)
find src/app/api -name "route.ts" -type f > all-api-routes.txt

# 에러 응답 패턴 불일치 확인
grep -r "error.*:" src/app/api/ --include="*.ts" | grep -v "User not authenticated" > inconsistent-errors.txt

# 성공 응답 패턴 확인  
grep -r "NextResponse.json" src/app/api/ --include="*.ts" > response-patterns.txt
```

### 현재 구현 확인

```bash
# 표준 에러 응답 패턴 확인 (올바른 예시)
grep -A 3 -B 3 "User not authenticated" src/app/api/user/profile/route.ts

# 비일관적 에러 응답 패턴 확인
grep -A 3 -B 3 "Internal.*Error" src/app/api/ --include="*.ts" | head -10

# 성공 응답 패턴 확인
grep -A 3 -B 3 "status.*200" src/app/api/ --include="*.ts" | head -5
```

### 의존성 확인

```bash
# NextResponse import 패턴 확인
grep -r "NextResponse" src/app/api/ --include="*.ts" | wc -l

# 표준 에러 타입 정의 확인
grep -r "ApiError\|ErrorResponse" src/types/ --include="*.ts"

# 로거 사용 패턴 확인
grep -r "logger\|console.error" src/app/api/ --include="*.ts" | wc -l
```

❌ **확인 실패 시** → 즉시 중단 및 보고

## 🔧 수정 작업 (정확한 위치)

### 🚨 강제 체크포인트 CP1: 시작 전
- [ ] all-api-routes.txt 파일 생성 확인 (약 50개 파일)
- [ ] 비일관적 에러 패턴 식별 완료
- [ ] 표준 응답 형식 정의 필요성 확인

### 표준 에러 응답 타입 정의

#### 파일 생성: src/types/api-responses.ts
```typescript
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
} as const;
```

### 우선순위 API Routes 표준화

#### 파일 1: src/app/api/youtube-lens/trending-summary/route.ts
**현재 상태 확인**
```bash
cat -n src/app/api/youtube-lens/trending-summary/route.ts | grep -A 5 -B 5 "error"
```

**에러 응답 표준화 (실제 라인 확인 후 수정)**
```typescript
// 현재 코드 (확인 후 정확히 이 코드여야 함)
return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });

// 수정 후 (표준 형식 적용)
return NextResponse.json(
  { 
    error: 'Internal Server Error',
    message: 'Failed to fetch trending summary',
    code: 'FETCH_FAILED'
  },
  { status: 500 }
);
```

#### 파일 2: src/app/api/user/generate-username/route.ts
**현재 상태 확인**  
```bash
cat -n src/app/api/user/generate-username/route.ts | grep -A 3 -B 3 "error"
```

**표준 에러 형식 적용 (실제 라인 확인 후 수정)**
```typescript
// 현재 코드
catch (error) {
  return NextResponse.json({ error: 'Server error' }, { status: 500 });
}

// 수정 후 (일관된 에러 처리)  
catch (error) {
  logger.error('Username generation failed:', error);
  return NextResponse.json(
    {
      error: 'Internal Server Error',
      message: 'Failed to generate username',
      code: 'USERNAME_GENERATION_FAILED'
    },
    { status: 500 }
  );
}
```

#### 파일 3: src/app/api/payment/confirm/route.ts  
**성공 응답 표준화**
```typescript
// 현재 코드 (확인 필요)
return NextResponse.json({ success: true, orderId });

// 수정 후 (표준 형식)
return NextResponse.json({
  data: { orderId, status: 'confirmed' },
  message: 'Payment confirmed successfully'
});
```

### 공통 에러 핸들러 유틸리티 생성

#### 파일 생성: src/lib/api-error-utils.ts
```typescript
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import type { ApiErrorResponse } from '@/types/api-responses';

export function createErrorResponse(
  error: string,
  status: number,
  message?: string,
  code?: string
): NextResponse<ApiErrorResponse> {
  const errorResponse: ApiErrorResponse = {
    error,
    message,
    code
  };

  // 프로덕션에서는 상세 정보 숨기기
  if (process.env.NODE_ENV === 'production' && status === 500) {
    errorResponse.error = 'Internal Server Error';
    errorResponse.message = 'An unexpected error occurred';
  }

  return NextResponse.json(errorResponse, { status });
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json({
    data,
    message
  }, { status });
}
```

⚠️ **수정 금지 사항**
- 에러 정보 누락 → 디버깅을 위한 충분한 정보 포함  
- 하드코딩된 메시지 → 상수 또는 설정 파일 활용
- 로깅 누락 → 모든 에러는 로깅 필수

## 🔍 검증 단계 (필수)

### 🚨 강제 체크포인트 CP2: 수정 중
- [ ] 표준 에러 타입 정의 추가 확인
- [ ] 공통 유틸리티 함수 생성 확인  
- [ ] 최소 3개 API Route 표준화 완료

### 1. 컴파일 검증
```bash
# 타입 체크 (에러 0개 필수)
npm run types:check
# 실패 시 → 타입 정의 수정

# API Routes 개별 컴파일 체크
npx tsc --noEmit src/app/api/user/generate-username/route.ts
```

### 2. 실제 동작 검증
```bash
# 개발 서버 실행
npm run dev  
```

**API 테스트 체크리스트**
- [ ] POST /api/user/generate-username → 표준 응답 형식 확인
- [ ] GET /api/youtube-lens/trending-summary → 에러 시 표준 형식
- [ ] POST /api/payment/confirm → 성공 시 표준 형식
- [ ] 잘못된 요청 → 400 에러 표준 형식
- [ ] 인증 실패 → 401 에러 표준 형식

### 3. API 일관성 검증
```bash
# 표준 에러 형식 적용 확인
grep -r "error.*message.*code" src/app/api/ --include="*.ts" | wc -l

# 비표준 에러 응답 잔존 확인  
grep -r "error.*:" src/app/api/ --include="*.ts" | grep -v -E "(error.*message|User not authenticated)" | wc -l
```

### 🚨 강제 체크포인트 CP3: 수정 후
- [ ] npm run types:check 통과
- [ ] 모든 테스트 API 표준 형식 응답 확인  
- [ ] 에러 로깅 정상 작동 확인
- [ ] API 일관성 검증 통과

❌ **검증 실패** → Phase 실패 보고 및 중단  
✅ **검증 성공** → 최종 검증 단계 진행 가능

## ✅ Phase 3 완료 조건

### 필수 (하나라도 실패 시 미완료)
- [ ] 컴파일 에러 0개
- [ ] API 경고 258개 → 150개 이하 달성
- [ ] 표준 에러/성공 응답 형식 적용  
- [ ] 공통 유틸리티 함수 활용
- [ ] 모든 API 정상 동작 확인

### 증거 수집
- 스크린샷: API 응답 표준 형식 확인 (Postman/브라우저)
- 로그: 에러 로깅 동작 확인
- 검증: `npm run verify:api` 실행 결과

### 성과 측정
```bash
# Phase 3 완료 후 API 경고 수 측정  
npm run verify:api 2>&1 | grep -o '[0-9]\+ api warnings' | grep -o '[0-9]\+'

# 목표: 258개 → 150개 이하
```

### 최종 검증 단계 진행 조건
- ✅ 모든 필수 조건 충족 → VERIFICATION.md 단계 진행
- ❌ 조건 미충족 → 수정 후 재검증

## ⛔ 절대 금지 (하나라도 위반 시 STOP)

1. **일관성 파괴 금지**
   - ❌ 일부 API만 표준화  
   - ❌ 기존 패턴과 혼재
   - ✅ 전체 API 일관된 패턴 적용

2. **정보 손실 금지**
   - ❌ 에러 정보 축소
   - ❌ 로깅 생략  
   - ✅ 디버깅 가능한 충분한 정보 유지

3. **기능 파괴 금지**
   - ❌ 기존 API 호출 방식 변경
   - ❌ 클라이언트 호환성 파괴
   - ✅ 하위 호환성 유지하며 개선

4. **검증 생략 금지**
   - ❌ "형식만 맞추면 OK"  
   - ❌ "컴파일 되니까 완료"
   - ✅ 실제 API 호출로 동작 확인

**하나라도 실패 → 최종 검증 단계 진행 불가**