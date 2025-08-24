# 🔧 라이브러리 및 환경변수 관리

*타입 안전 환경변수, API 클라이언트, 유틸리티 함수 가이드*

---

## 🔐 환경변수 타입 안전성 (2025-02-01 구현)

### ✅ 타입 안전 사용법

```typescript
// ✅ 올바른 import - 타입 안전 + 자동완성
import { env } from '@/env';

// 서버 컴포넌트/API Route에서
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;  // 타입 체크됨
const dbUrl = env.DATABASE_URL;                    // 자동완성 지원

// 클라이언트 컴포넌트에서
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;  // NEXT_PUBLIC_ 필수
const siteUrl = env.NEXT_PUBLIC_SITE_URL;
```

### ❌ 금지 패턴

```typescript
// ❌ 직접 process.env 접근 금지
process.env.SUPABASE_SERVICE_ROLE_KEY  // 타입 안전성 없음
process.env.NEXT_PUBLIC_SUPABASE_URL   // 런타임 오류 가능

// ❌ 하드코딩 절대 금지
const key = "fc28f35efe5b90d34e54dfd342e6c3807c2d71d9054adb8dbba1b90a67ca7660";
const apiKey = "sk-proj-...";  // 절대 금지!
```

---

## 📋 환경변수 추가 프로세스

### 1. `.env.local`에 추가
```bash
# 서버 전용 (브라우저에서 접근 불가)
DATABASE_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
REDIS_URL=redis://...

# 클라이언트 공개 (NEXT_PUBLIC_ 접두사 필수)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SITE_URL=https://dhacle.com
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-...
```

### 2. `src/env.ts` 수정
```typescript
import { z } from 'zod';

export const env = createEnv({
  server: {
    // 서버 전용 환경변수
    DATABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    NEW_SERVER_VAR: z.string().min(1), // 새로 추가
  },
  client: {
    // 클라이언트 공개 환경변수
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_NEW_VAR: z.string(),  // 새로 추가
  },
  runtimeEnv: {
    // 실제 환경변수 매핑
    DATABASE_URL: process.env.DATABASE_URL,
    NEW_SERVER_VAR: process.env.NEW_SERVER_VAR,
    // ...
  }
});
```

### 3. 빌드 시 자동 검증
```bash
npm run build
# 환경변수 누락 시: ❌ Missing environment variables
# 타입 불일치 시: ❌ Invalid environment variables
# 성공 시: ✅ Environment variables validated
```

---

## 📦 API 클라이언트 (api-client.ts)

### 기본 사용법
```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';

// GET 요청
const users = await apiGet<User[]>('/api/users');

// POST 요청
const newPost = await apiPost<Post>('/api/posts', {
  title: '제목',
  content: '내용'
});

// PUT 요청
const updated = await apiPut<User>('/api/users/123', {
  name: '새 이름'
});

// DELETE 요청
await apiDelete('/api/posts/456');
```

### 자동 처리 기능
- ✅ 인증 헤더 자동 추가
- ✅ 에러 응답 자동 처리
- ✅ JSON 자동 파싱
- ✅ 타입 안전성
- ✅ snake_case ↔ camelCase 자동 변환

### 에러 처리
```typescript
try {
  const data = await apiGet('/api/protected');
} catch (error) {
  if (error.status === 401) {
    // 인증 필요 - 로그인 페이지로
    router.push('/auth/login');
  } else if (error.status === 403) {
    // 권한 없음
    toast.error('권한이 없습니다');
  } else {
    // 기타 에러
    console.error(error);
  }
}
```

---

## 🔄 케이스 변환 유틸

### snake_case ↔ camelCase 변환
```typescript
import { snakeToCamelCase, camelToSnakeCase } from '@/lib/utils/case-converter';

// DB에서 가져온 snake_case 데이터
const dbData = {
  user_id: '123',
  first_name: 'John',
  created_at: '2024-01-01'
};

// Frontend용 camelCase로 변환
const frontendData = snakeToCamelCase(dbData);
// { userId: '123', firstName: 'John', createdAt: '2024-01-01' }

// DB 저장용 snake_case로 변환
const saveData = camelToSnakeCase(frontendData);
// { user_id: '123', first_name: 'John', created_at: '2024-01-01' }
```

### React 예약어 보호
```typescript
// React Hook은 변환하지 않음
useCarousel → useCarousel ✅ (유지)
use_carousel → use_carousel ❌ (변환 안됨)

// 일반 필드는 변환
user_name → userName ✅
created_at → createdAt ✅
```

---

## 🎨 유틸리티 함수

### cn (className 병합)
```typescript
import { cn } from '@/lib/utils';

// 조건부 클래스 적용
<div className={cn(
  "base-class",
  isActive && "active-class",
  isDisabled && "disabled-class",
  className // 외부 prop
)} />

// 객체 형태 조건
<button className={cn(
  "px-4 py-2 rounded",
  {
    "bg-blue-500": variant === 'primary',
    "bg-gray-500": variant === 'secondary',
  }
)} />
```

### formatDate (날짜 포맷팅)
```typescript
import { formatDate } from '@/lib/utils';

formatDate(new Date());           // "2024년 1월 1일"
formatDate('2024-01-01');         // "2024년 1월 1일"
formatDate(date, 'YYYY-MM-DD');   // "2024-01-01"
formatDate(date, 'relative');     // "3일 전"
```

### debounce (디바운스)
```typescript
import { debounce } from '@/lib/utils';

const debouncedSearch = debounce((query: string) => {
  // API 호출
  searchAPI(query);
}, 500); // 500ms 딜레이

// 사용
<input onChange={(e) => debouncedSearch(e.target.value)} />
```

### truncate (텍스트 자르기)
```typescript
import { truncate } from '@/lib/utils';

truncate('긴 텍스트...', 50);        // 50자로 자르기
truncate(text, 100, '...');          // 커스텀 말줄임표
```

---

## 🔒 보안 유틸리티

### 비밀번호 해싱
```typescript
import { hashPassword, verifyPassword } from '@/lib/crypto';

// 해싱
const hashed = await hashPassword('plainPassword');

// 검증
const isValid = await verifyPassword('plainPassword', hashed);
```

### 토큰 생성
```typescript
import { generateToken, verifyToken } from '@/lib/auth';

// 생성
const token = generateToken({ userId: '123' });

// 검증
const payload = verifyToken(token);
```

---

## 📊 성능 유틸리티

### 메모이제이션
```typescript
import { memoize } from '@/lib/utils';

const expensive = memoize((input: string) => {
  // 비용이 큰 연산
  return heavyComputation(input);
});
```

### 쓰로틀링
```typescript
import { throttle } from '@/lib/utils';

const throttledScroll = throttle(() => {
  // 스크롤 핸들러
}, 100); // 100ms마다 최대 1회

window.addEventListener('scroll', throttledScroll);
```

---

## 🚨 빌드 실패 방지

### 환경변수 체크리스트
- [ ] `.env.local`에 모든 변수 정의
- [ ] `src/env.ts`에 스키마 추가
- [ ] 클라이언트 변수는 `NEXT_PUBLIC_` 접두사
- [ ] 서버 변수는 접두사 없음
- [ ] Vercel 대시보드에도 추가

### 타입 안전성
- [ ] process.env 직접 접근 제거
- [ ] env.ts import 사용
- [ ] 빌드 전 검증 통과

---

## 📋 체크리스트

- [ ] 환경변수 타입 안전 사용
- [ ] API 클라이언트 활용
- [ ] 케이스 변환 적용
- [ ] 유틸리티 함수 재사용
- [ ] 하드코딩 제거
- [ ] 보안 함수 사용

---

## 📁 관련 파일

- 환경변수 정의: `/src/env.ts`
- API 클라이언트: `/src/lib/api-client.ts`
- 케이스 변환: `/src/lib/utils/case-converter.ts`
- 유틸리티: `/src/lib/utils.ts`
- 암호화: `/src/lib/crypto.ts`

---

*라이브러리 작업 시 이 문서를 우선 참조하세요.*