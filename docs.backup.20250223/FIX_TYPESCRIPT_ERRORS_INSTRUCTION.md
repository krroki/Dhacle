# 🔴 TypeScript 타입 오류 완전 해결 지시서

*작성일: 2025-02-01*
*목적: 디하클 프로젝트의 모든 TypeScript 타입 오류를 체계적으로 해결*
*중요: TypeScript any 타입 절대 사용 금지. 타입을 제대로 정의하거나 unknown을 쓰고 타입 가드를 쓸 것*

---

## 🚨 필수 준수 사항

**절대 규칙:**
1. **any 타입 절대 금지** - 발견 즉시 제거
2. **실제 코드 먼저 확인** - 문서보다 코드가 진실
3. **타입 추론 활용** - 명시적 타입보다 추론 우선
4. **unknown + 타입가드** - any 대신 사용

---

## 📋 Phase 1: 타입 오류 진단 (먼저 실행!)

### Step 1: 전체 타입 오류 스캔
```bash
# TypeScript 컴파일러로 모든 오류 확인
npx tsc --noEmit > type-errors.txt 2>&1

# 오류 개수 확인
grep "error TS" type-errors.txt | wc -l

# any 타입 사용 위치 찾기
grep -r "any" src/ --include="*.ts" --include="*.tsx" | grep -v "// eslint-disable" | grep -v "@ts-ignore"
```

### Step 2: 오류 패턴 분류
타입 오류를 다음 카테고리로 분류:

1. **any 타입 사용** (TS7006, TS2364)
2. **타입 정의 누락** (TS2339, TS2345)
3. **import 오류** (TS2305, TS2307)
4. **API 응답 타입 불일치** (TS2322)
5. **함수 매개변수 타입 누락** (TS7006)
6. **옵셔널 체이닝 필요** (TS2532)

### Step 3: 자동 타입 시스템 활용
```bash
# Supabase DB에서 타입 자동 생성
npm run types:generate

# 타입 자동 수정 시도
npm run types:auto-fix

# 타입 동기화
npm run types:sync
```

---

## 📋 Phase 2: 오류 유형별 수정 방법

### 1. any 타입 제거
```typescript
// ❌ 잘못된 코드
const handleSubmit = (data: any) => {
  console.log(data.name);
}

// ✅ 수정 방법 1: 구체적 타입 정의
interface FormData {
  name: string;
  email: string;
}
const handleSubmit = (data: FormData) => {
  console.log(data.name);
}

// ✅ 수정 방법 2: unknown + 타입가드
const handleSubmit = (data: unknown) => {
  if (isFormData(data)) {
    console.log(data.name);
  }
}

function isFormData(data: unknown): data is FormData {
  return typeof data === 'object' && 
         data !== null && 
         'name' in data;
}
```

### 2. API 응답 타입 수정
```typescript
// ❌ 잘못된 코드
const response = await apiGet<any>('/api/user');

// ✅ 수정 방법: @/types에서 import
import { User } from '@/types';
const response = await apiGet<User>('/api/user');

// 또는 타입 추론 활용
const response = await apiGet('/api/user'); // 타입 자동 추론
```

### 3. Supabase 타입 활용
```typescript
// ❌ 잘못된 코드
const { data } = await supabase.from('users').select();
const user: any = data?.[0];

// ✅ 수정 방법: 자동 생성된 타입 사용
import { User, snakeToCamelCase } from '@/types';

const { data } = await supabase.from('users').select();
const users = snakeToCamelCase(data) as User[];
const user = users[0];
```

### 4. 이벤트 핸들러 타입
```typescript
// ❌ 잘못된 코드
const handleClick = (e: any) => {
  e.preventDefault();
}

// ✅ 수정 방법: React 타입 사용
import { MouseEvent } from 'react';

const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
}

// 또는 인라인 타입
const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
  e.preventDefault();
}
```

### 5. ZodError 타입 수정
```typescript
// ❌ 잘못된 코드 (.errors 사용)
if (error instanceof ZodError) {
  console.log(error.errors); // 존재하지 않음!
}

// ✅ 수정 방법: .issues 사용
if (error instanceof ZodError) {
  console.log(error.issues); // 올바른 속성
}
```

### 6. 옵셔널 체이닝 추가
```typescript
// ❌ 잘못된 코드
const name = user.profile.name; // user가 undefined일 수 있음

// ✅ 수정 방법
const name = user?.profile?.name;

// 또는 기본값 제공
const name = user?.profile?.name ?? 'Guest';
```

---

## 📋 Phase 3: 파일별 수정 작업

### Step 1: 주요 파일 타입 수정 순서
1. **lib/types/*.ts** - 기본 타입 정의 확인
2. **lib/api-client.ts** - API 래퍼 타입 정의
3. **app/api/**/route.ts** - API Route 타입 일치
4. **components/**/*.tsx** - 컴포넌트 Props 타입
5. **hooks/*.ts** - 커스텀 훅 타입

### Step 2: 각 파일 수정 프로세스
```bash
# 1. 파일 읽기
Read [파일경로]

# 2. any 타입 검색
grep "any" [파일경로]

# 3. 타입 import 확인
# 파일 상단에 필요한 타입 import 추가
import { User, Course, Video } from '@/types';
import type { MouseEvent, ChangeEvent } from 'react';

# 4. 수정 후 컴파일 체크
npx tsc --noEmit [파일경로]
```

### Step 3: 컴포넌트 Props 타입 정의
```typescript
// ❌ 잘못된 코드
export function VideoCard({ video, onClick }: any) {
  return <div>{video.title}</div>;
}

// ✅ 수정 방법
import { Video } from '@/types';

interface VideoCardProps {
  video: Video;
  onClick?: (video: Video) => void;
  className?: string;
}

export function VideoCard({ video, onClick, className }: VideoCardProps) {
  return <div className={className}>{video.title}</div>;
}
```

---

## 📋 Phase 4: 검증 및 확인

### Step 1: 타입 오류 완전 제거 확인
```bash
# 타입 체크 (오류 0개 목표)
npx tsc --noEmit

# any 타입 완전 제거 확인
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l
# 결과가 0이어야 함

# 빌드 테스트
npm run build
```

### Step 2: 런타임 테스트
```bash
# 개발 서버 실행
npm run dev

# 주요 페이지 접속 테스트
- /tools/youtube-lens
- /mypage
- /courses
- /community

# 콘솔 에러 확인 (브라우저 DevTools)
```

### Step 3: 자동 검증 도구 실행
```bash
# 타입 일치성 검증
npm run verify:types

# API 일치성 검증  
npm run verify:api

# 전체 검증
npm run verify:all
```

---

## 🔧 특수 케이스 해결법

### Supabase 타입 에러
```typescript
// DB 스키마 변경 시
npm run types:generate

// snake_case ↔ camelCase 변환
import { snakeToCamelCase, camelToSnakeCase } from '@/types';
```

### shadcn/ui 컴포넌트 타입
```typescript
// Button 등 컴포넌트 Props 확장
import { Button, ButtonProps } from '@/components/ui/button';

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
}
```

### API Route 타입 통일
```typescript
// 모든 API Route에 동일한 에러 응답 타입
interface ErrorResponse {
  error: string;
}

// 성공 응답은 도메인별 타입
interface SuccessResponse<T> {
  data: T;
  message?: string;
}
```

---

## ⚠️ 주의사항

1. **절대 @ts-ignore 사용 금지** - 타입 오류를 숨기지 말고 해결
2. **as any 캐스팅 금지** - as 구체적타입 또는 타입가드 사용
3. **Function 타입 금지** - 구체적 함수 시그니처 정의
4. **object 타입 지양** - Record<string, unknown> 또는 구체적 인터페이스

---

## 📊 진행 상황 추적

### 체크리스트
- [ ] npx tsc --noEmit 오류 0개 달성
- [ ] any 타입 완전 제거
- [ ] 모든 함수 반환 타입 명시
- [ ] API 응답 타입 통일
- [ ] 컴포넌트 Props 타입 정의
- [ ] 이벤트 핸들러 타입 정의
- [ ] npm run build 성공
- [ ] npm run verify:types 통과

### 성공 기준
```bash
# 다음 명령어 모두 성공해야 완료
npx tsc --noEmit  # 오류 없음
npm run build      # 빌드 성공
npm run verify:types  # 타입 검증 통과
npm run verify:all    # 전체 검증 통과
```

---

## 🚀 작업 명령어 (SC 플래그 포함)

```bash
/sc:fix --seq --validate --think-hard --c7

Phase 1: 타입 오류 진단
- npx tsc --noEmit으로 전체 스캔
- any 타입 위치 파악
- npm run types:generate 실행

Phase 2: 파일별 수정
- any → 구체적 타입 또는 unknown
- .errors → .issues (ZodError)
- 옵셔널 체이닝 추가
- import 타입 정리

Phase 3: 검증
- npx tsc --noEmit (오류 0개)
- npm run build (성공)
- npm run verify:all (통과)
```

---

*이 지시서를 따라 작업하면 100% TypeScript 타입 오류 해결 가능*
*핵심: any 금지, 실제 코드 확인, 타입 자동 생성 활용*