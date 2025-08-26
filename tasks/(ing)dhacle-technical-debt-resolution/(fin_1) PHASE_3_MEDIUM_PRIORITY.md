/sc:improve --seq --validate --think
"Phase 3: Medium Priority 코드 품질 개선 - 58개 문제"

# Phase 3: Medium Priority 코드 품질 개선

⚠️ → **필수 확인**: `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙 확인
⚠️ → **절대 금지**: 자동 변환 스크립트 생성
⚠️ → **필수 준수**: 수동 검토 후 변경

## 📌 Phase 정보
- **Phase 번호**: 3/5
- **예상 시간**: 7일
- **우선순위**: MEDIUM
- **문제 수**: 58개
- **주요 영역**: 코드 일관성, 테스트, 국제화

## 📚 온보딩 섹션

### 작업 관련 경로
```
- 케이스 변환: src/lib/case-converter.ts
- 컴포넌트 구조: src/components/
- React Query: src/hooks/queries/
- 테스트: tests/
- i18n: src/lib/i18n/
```

## 🎯 Phase 목표
1. snake_case/camelCase 통일 (15개)
2. 컴포넌트 파일 구조 표준화 (12개)
3. React Query v5 마이그레이션 완료 (8개)
4. 테스트 커버리지 80% 달성
5. i18n 기초 설정

## 📝 작업 내용

### Task 1: 케이스 변환 시스템 구축 (15개)

#### 1.1 케이스 변환 유틸리티
```typescript
// src/lib/case-converter.ts
type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Uppercase<T> ? '_' : ''}${Lowercase<T>}${SnakeCase<U>}`
  : S;

type CamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<CamelCase<U>>}`
  : S;

export function snakeToCamel<T extends Record<string, any>>(obj: T): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (typeof obj !== 'object') return obj;

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {} as any);
}

export function camelToSnake<T extends Record<string, any>>(obj: T): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  if (typeof obj !== 'object') return obj;

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {} as any);
}

// Supabase 응답 변환 미들웨어
export function supabaseTransform<T>(data: any): T {
  return snakeToCamel(data) as T;
}

// API 요청 변환 미들웨어
export function apiTransform<T>(data: T): any {
  return camelToSnake(data as any);
}
```

#### 1.2 Supabase 클라이언트 래퍼
```typescript
// src/lib/supabase/client-wrapper.ts
import { createSupabaseServerClient } from './client';
import { snakeToCamel, camelToSnake } from '@/lib/case-converter';

export async function supabaseQuery<T>(
  table: string,
  query: any = {}
): Promise<T[]> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from(table)
    .select(query.select || '*');
  
  if (error) throw error;
  
  return snakeToCamel(data) as T[];
}

export async function supabaseInsert<T>(
  table: string,
  data: T
): Promise<T> {
  const supabase = await createSupabaseServerClient();
  
  const { data: result, error } = await supabase
    .from(table)
    .insert(camelToSnake(data))
    .select()
    .single();
  
  if (error) throw error;
  
  return snakeToCamel(result) as T;
}
```

### Task 2: 컴포넌트 구조 표준화 (12개)

#### 2.1 표준 폴더 구조
```
src/components/
├── ui/              # shadcn/ui 컴포넌트
│   ├── button.tsx
│   ├── card.tsx
│   └── dialog.tsx
├── common/          # 공통 컴포넌트
│   ├── Header/
│   │   ├── index.tsx
│   │   ├── Header.styles.ts
│   │   └── Header.test.tsx
│   └── Footer/
│       ├── index.tsx
│       ├── Footer.styles.ts
│       └── Footer.test.tsx
└── features/        # 기능별 컴포넌트
    ├── YouTubeLens/
    │   ├── index.tsx
    │   ├── YouTubeLens.styles.ts
    │   ├── YouTubeLens.test.tsx
    │   └── components/
    │       ├── VideoPlayer.tsx
    │       └── Transcript.tsx
    └── PaymentForm/
        ├── index.tsx
        ├── PaymentForm.styles.ts
        └── PaymentForm.test.tsx
```

#### 2.2 컴포넌트 이동 스크립트 (수동 실행)
```javascript
// scripts/organize-components.js
const fs = require('fs');
const path = require('path');

// 이동 계획만 출력, 실제 이동은 수동으로
const componentMoves = [
  { from: 'components/Button.tsx', to: 'components/ui/button.tsx' },
  { from: 'components/Card', to: 'components/ui/card' },
  { from: 'components/Modal.tsx', to: 'components/common/Modal' },
  // ... 기타 컴포넌트
];

console.log('📦 컴포넌트 구조 재구성 계획:\n');
componentMoves.forEach(({ from, to }) => {
  console.log(`  ${from} → ${to}`);
});

console.log('\n⚠️  위 계획을 확인하고 수동으로 이동하세요.');
console.log('git mv 명령어를 사용하여 히스토리를 보존하세요.');
```

### Task 3: React Query v5 마이그레이션 (8개)

#### 3.1 v5 패턴 적용
```typescript
// Before (v4 패턴)
import { useQuery } from '@tanstack/react-query';

export function useUserProfile(userId: string) {
  return useQuery(
    ['user', userId],
    () => fetchUser(userId),
    {
      onSuccess: (data) => console.log(data),
      onError: (error) => console.error(error),
      cacheTime: 1000 * 60 * 5,
    }
  );
}

// After (v5 패턴)
import { useQuery } from '@tanstack/react-query';
import { logger } from '@/lib/logger';

export function useUserProfile(userId: string) {
  const query = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    gcTime: 1000 * 60 * 5, // v5: cacheTime → gcTime
    staleTime: 1000 * 60,
  });

  // 에러/성공 처리는 컴포넌트에서
  if (query.error) {
    logger.error('User profile fetch failed', query.error);
  }

  return query;
}
```

#### 3.2 마이그레이션 체크리스트
```markdown
## React Query v5 마이그레이션 체크리스트

### 필수 변경사항
- [ ] cacheTime → gcTime
- [ ] onSuccess, onError 콜백 제거
- [ ] useQuery 객체 문법 사용
- [ ] useMutation 객체 문법 사용

### 파일별 변경
- [ ] hooks/queries/useUserProfile.ts
- [ ] hooks/queries/useCourses.ts
- [ ] hooks/queries/useYouTubeVideo.ts
- [ ] hooks/queries/useCommunityPosts.ts
- [ ] hooks/mutations/useCreatePost.ts
- [ ] hooks/mutations/useUpdateProfile.ts
- [ ] hooks/mutations/usePayment.ts
- [ ] hooks/mutations/useEnrollCourse.ts
```

### Task 4: 테스트 커버리지 개선 (32% → 80%)

#### 4.1 테스트 설정
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.ts',
        '*.config.js',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### 4.2 필수 테스트 작성
```typescript
// tests/unit/lib/case-converter.test.ts
import { describe, it, expect } from 'vitest';
import { snakeToCamel, camelToSnake } from '@/lib/case-converter';

describe('Case Converter', () => {
  describe('snakeToCamel', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamel({ user_name: 'John' }))
        .toEqual({ userName: 'John' });
    });

    it('should handle nested objects', () => {
      expect(snakeToCamel({
        user_profile: {
          first_name: 'John',
          last_name: 'Doe'
        }
      })).toEqual({
        userProfile: {
          firstName: 'John',
          lastName: 'Doe'
        }
      });
    });
  });

  describe('camelToSnake', () => {
    it('should convert camelCase to snake_case', () => {
      expect(camelToSnake({ userName: 'John' }))
        .toEqual({ user_name: 'John' });
    });
  });
});
```

### Task 5: i18n 기초 설정

#### 5.1 next-intl 설치 및 설정
```bash
npm install next-intl
```

#### 5.2 i18n 설정
```typescript
// src/lib/i18n/index.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}));

// src/lib/i18n/messages/ko.json
{
  "common": {
    "title": "디하클",
    "welcome": "환영합니다",
    "loading": "로딩 중...",
    "error": "오류가 발생했습니다",
    "retry": "다시 시도"
  },
  "auth": {
    "login": "로그인",
    "logout": "로그아웃",
    "signup": "회원가입",
    "forgotPassword": "비밀번호 찾기"
  },
  "dashboard": {
    "title": "대시보드",
    "overview": "개요",
    "courses": "강좌",
    "progress": "진행률"
  }
}

// src/lib/i18n/messages/en.json
{
  "common": {
    "title": "Dhacle",
    "welcome": "Welcome",
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Try again"
  },
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "signup": "Sign up",
    "forgotPassword": "Forgot password"
  },
  "dashboard": {
    "title": "Dashboard",
    "overview": "Overview",
    "courses": "Courses",
    "progress": "Progress"
  }
}
```

#### 5.3 컴포넌트에서 사용
```typescript
// src/app/[locale]/page.tsx
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('common');
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('title')}</p>
    </div>
  );
}
```

## ✅ 완료 조건
- [ ] 15개 snake_case/camelCase 통일 완료
- [ ] 12개 컴포넌트 구조 표준화 완료
- [ ] 8개 React Query v5 마이그레이션 완료
- [ ] 테스트 커버리지 80% 달성
- [ ] i18n 기초 설정 완료
- [ ] 빌드 성공 (npm run build)
- [ ] 타입 체크 통과 (npm run types:check)
- [ ] 테스트 통과 (npm test)

## 📋 QA 테스트 시나리오

### 케이스 변환 테스트
1. Supabase 데이터 조회 → camelCase 변환 확인
2. API 요청 → snake_case 변환 확인
3. 중첩 객체 → 재귀 변환 확인

### 컴포넌트 구조 테스트
1. Import 경로 → 모두 정상 작동
2. 스타일 적용 → 정상 렌더링
3. 테스트 실행 → 모두 통과

### React Query v5 테스트
1. 데이터 페칭 → 정상 작동
2. 캐싱 → gcTime 적용 확인
3. 에러 처리 → 컴포넌트에서 처리

### 테스트 커버리지
```bash
npm run test:coverage
# 80% 이상 확인
```

### i18n 테스트
1. 한국어 → 정상 표시
2. 영어 → 정상 표시
3. 언어 전환 → 즉시 반영

## 🔄 롤백 계획

### Task별 롤백
```bash
# 케이스 변환만 롤백
git checkout HEAD -- src/lib/case-converter.ts

# 컴포넌트 구조만 롤백
git checkout HEAD~1 -- src/components/

# React Query만 롤백
git checkout HEAD -- "src/hooks/**/*.ts"
```

## 📊 성과 측정

### Before (Phase 2 완료)
- snake_case/camelCase 혼용: 15개
- 컴포넌트 구조: 불일치
- React Query: v4/v5 혼재
- 테스트 커버리지: 32%
- i18n: 미설정

### After (Phase 3 완료)
- 케이스 통일: 100%
- 컴포넌트 구조: 표준화 완료
- React Query: v5 100%
- 테스트 커버리지: 80%+
- i18n: 기초 설정 완료
- 코드 일관성: 대폭 개선

## → 다음 Phase
- **파일**: PHASE_4_LOW_PRIORITY.md
- **목표**: 128개 Low Priority 최적화
- **예상 시간**: 15일

---

*작성일: 2025-02-23*