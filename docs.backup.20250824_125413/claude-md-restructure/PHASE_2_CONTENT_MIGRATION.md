/sc:implement --seq --validate --think-hard --delegate folders
"Phase 2: 폴더별 CLAUDE.md 생성 및 내용 이동"

# Phase 2: 폴더별 CLAUDE.md 생성 및 최적화된 내용 이동

## 🚨 프로젝트 특화 규칙 확인 (필수)
⚠️ **경고**: 아래 문서 미확인 시 프로젝트 파괴 가능성 90%

### 최우선 확인 문서
- [ ] `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙 (전체 읽기 필수)
- [ ] `/CLAUDE.md` 전체 - 현재 구조 완벽 이해
- [ ] 백업 파일 존재 확인 - CLAUDE.md.backup.*

### 프로젝트 금지사항 체크 ✅
- [ ] 원본 내용 임의 삭제 금지
- [ ] 자동 스크립트로 일괄 변경 금지
- [ ] 컨텍스트 없는 복사-붙여넣기 금지
- [ ] 폴더별 최적화 없이 단순 분할 금지

## 📌 Phase 정보
- **Phase 번호**: 2/4
- **선행 조건**: Phase 1 완료 (백업 및 검증)
- **예상 시간**: 2시간
- **우선순위**: CRITICAL
- **작업 범위**: 14개 폴더, 1,111줄 내용 재구성 (PHASE 0 업데이트)

## 🎯 Phase 목표
1. 폴더별 최적화된 CLAUDE.md 생성
2. 베스트 프랙티스 기반 폴더별 지침 작성
3. 중복 제거 및 관련성 높은 내용만 배치
4. 네비게이션 및 상호 참조 시스템 구축

## 📚 온보딩 섹션

### 이 Phase에 필요한 지식
- [ ] Next.js App Router 구조
- [ ] TypeScript 프로젝트 구조 베스트 프랙티스
- [ ] Supabase 보안 패턴
- [ ] API Route 핸들러 패턴

### 작업 파일 경로
- 원본: `/CLAUDE.md.backup.*`
- 대상: 각 폴더별 CLAUDE.md (12개)

## 📝 작업 내용

### Step 1: 루트 CLAUDE.md 재구성 (약 150줄)
```markdown
# 📋 Claude AI 작업 네비게이터

## 🚨 절대 금지사항 (모든 작업에 적용)
[현재 CLAUDE.md 1-71행 내용 유지 - STOP & ACT 규칙]

## 📁 폴더별 상세 지침 맵
| 작업 영역 | 파일 위치 | 주요 내용 |
|----------|----------|----------|
| API Routes | [/src/app/api/CLAUDE.md](src/app/api/CLAUDE.md) | API 패턴, 인증, 에러 처리 |
| 페이지 | [/src/app/(pages)/CLAUDE.md](src/app/(pages)/CLAUDE.md) | Server Component, 라우팅 |
| 컴포넌트 | [/src/components/CLAUDE.md](src/components/CLAUDE.md) | shadcn/ui, Tailwind |
| 타입 시스템 | [/src/types/CLAUDE.md](src/types/CLAUDE.md) | TypeScript, 타입 관리 |
| Supabase | [/src/lib/supabase/CLAUDE.md](src/lib/supabase/CLAUDE.md) | 클라이언트 패턴 |
| 보안 | [/src/lib/security/CLAUDE.md](src/lib/security/CLAUDE.md) | RLS, 검증, XSS |
| 스크립트 | [/scripts/CLAUDE.md](scripts/CLAUDE.md) | 검증, SQL 실행 |
| 문서 | [/docs/CLAUDE.md](docs/CLAUDE.md) | 문서 체계, 템플릿 |

## 🔗 14개 핵심 문서
[현재 내용 유지]

## 🚀 빠른 시작
작업 위치에 따라 해당 폴더의 CLAUDE.md를 우선 확인하세요.
```

### Step 2: src/app/api/CLAUDE.md (300줄 - API 특화)
```markdown
# 🔌 API Route 개발 지침

## 🚨 API Route 필수 패턴 (Next.js 15 App Router)

### ✅ 올바른 패턴 (2025-08-22 표준)
\`\`\`typescript
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // 인증 체크 (필수)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // 비즈니스 로직
    const { data, error } = await supabase
      .from('table')
      .select()
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
\`\`\`

## 🔒 인증 골든룰
1. **모든 Route는 세션 검사 필수**
2. **getUser() 사용** (getSession() 금지)
3. **401 시 표준 에러 형식 준수**
4. **userId는 세션에서만 추출**

## 🎯 HTTP 메서드별 패턴
### GET - 데이터 조회
- 쿼리 파라미터 검증
- 페이지네이션 지원
- 캐싱 헤더 설정

### POST - 데이터 생성
- Zod 스키마 검증 필수
- 트랜잭션 처리
- 생성된 리소스 반환

### PUT/PATCH - 데이터 수정
- 부분 업데이트 지원
- 낙관적 잠금 고려
- 변경 이력 기록

### DELETE - 데이터 삭제
- Soft delete 우선
- 종속 데이터 처리
- 삭제 확인 응답

## 📊 에러 처리 표준
\`\`\`typescript
// 표준 에러 응답 형식
interface ErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

// 에러 코드별 처리
- 400: 잘못된 요청 (검증 실패)
- 401: 인증 필요
- 403: 권한 없음
- 404: 리소스 없음
- 409: 충돌 (중복 등)
- 500: 서버 오류
\`\`\`

## 🔍 검증 패턴
\`\`\`typescript
import { validateRequestBody } from '@/lib/security/validation-schemas';

const validation = await validateRequestBody(request, schema);
if (!validation.success) {
  return createValidationErrorResponse(validation.error);
}
\`\`\`

## ⚡ 성능 최적화
- Response streaming 활용
- 대용량 데이터는 페이지네이션
- DB 쿼리 최적화 (select 필드 명시)
- 적절한 인덱스 활용

## 🧪 테스트 체크리스트
- [ ] 인증 없이 호출 → 401
- [ ] 잘못된 데이터 → 400 + 상세 메시지
- [ ] 정상 요청 → 200 + 데이터
- [ ] DB 오류 → 500 + 로깅
- [ ] Rate limiting 동작 확인

## 📁 관련 파일
- 인증: `/src/lib/supabase/server-client.ts`
- 검증: `/src/lib/security/validation-schemas.ts`
- 타입: `/src/types/index.ts`
```

### Step 3: src/app/(pages)/CLAUDE.md (150줄 - 페이지 특화)
```markdown
# 📄 Next.js Pages 개발 지침

## 🚨 Server Component 우선 원칙

### ✅ 기본 패턴 (Server Component)
\`\`\`typescript
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export const dynamic = 'force-dynamic'; // 정적 생성 방지

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 서버에서 데이터 페칭
  const data = await fetchData(user?.id);
  
  return <PageContent data={data} />;
}
\`\`\`

### 🎨 Client Component 사용 시점
- 상태 관리 필요 (useState, useReducer)
- 브라우저 API 사용 (window, document)
- 이벤트 핸들러 (onClick, onChange)
- 외부 라이브러리 (차트, 에디터 등)

## 📁 페이지 구조 패턴
\`\`\`
(pages)/
├── [feature]/
│   ├── page.tsx          # Server Component
│   ├── layout.tsx        # 레이아웃 (선택적)
│   ├── loading.tsx       # 로딩 UI
│   ├── error.tsx         # 에러 바운더리
│   └── components/       # 페이지 전용 컴포넌트
│       ├── ClientSection.tsx  # 'use client'
│       └── ServerSection.tsx  # Server Component
\`\`\`

## 🔐 인증이 필요한 페이지
\`\`\`typescript
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  // 인증된 사용자만 접근 가능한 컨텐츠
}
\`\`\`

## 💾 데이터 페칭 전략
1. **Server Component**: 초기 데이터는 서버에서
2. **Client Hooks**: 동적 업데이트는 클라이언트에서
3. **Streaming**: Suspense로 점진적 렌더링
4. **캐싱**: 적절한 revalidate 설정

## 🎯 메타데이터 설정
\`\`\`typescript
export const metadata = {
  title: '페이지 제목 | Dhacle',
  description: 'SEO 설명',
  openGraph: {
    title: 'OG 제목',
    description: 'OG 설명',
    images: ['/og-image.png'],
  },
};
\`\`\`

## ⚠️ 주의사항
- layout.tsx는 사용자 협의 없이 생성 금지
- 페이지별 상태는 Zustand store 활용
- 스타일링은 Tailwind CSS만 사용
- shadcn/ui 컴포넌트 우선 활용
```

### Step 4: src/components/CLAUDE.md (200줄 - 컴포넌트 특화)
```markdown
# 🧩 Component 개발 지침

## 🚨 컴포넌트 작성 원칙

### 📁 파일 구조
\`\`\`
components/
├── ui/                   # shadcn/ui 컴포넌트
├── features/            # 기능별 컴포넌트
│   ├── auth/
│   ├── revenue-proof/
│   └── youtube-lens/
├── layout/              # 레이아웃 컴포넌트
└── common/              # 공통 컴포넌트
\`\`\`

### ✅ Server Component (기본값)
\`\`\`typescript
// 별도 지시자 없으면 Server Component
interface Props {
  data: SomeType;
}

export function ServerComponent({ data }: Props) {
  return <div>{/* 렌더링 로직 */}</div>;
}
\`\`\`

### 🎨 Client Component
\`\`\`typescript
'use client';

import { useState } from 'react';

export function ClientComponent() {
  const [state, setState] = useState();
  
  return <div>{/* 인터랙티브 UI */}</div>;
}
\`\`\`

## 🎯 shadcn/ui 우선 사용
\`\`\`typescript
// ✅ 올바른 사용
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// ❌ 금지 - 직접 구현
<button className="...">Click</button>
\`\`\`

## 🎨 스타일링 규칙 (Tailwind CSS만)
\`\`\`typescript
// ✅ 올바른 스타일링
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">

// ❌ 금지된 방식들
<div style={{ display: 'flex' }}>  // 인라인 스타일 금지
<div className={styles.container}>  // CSS 모듈 금지
styled.div\`...\`                    // styled-components 금지
\`\`\`

## 📱 반응형 디자인
\`\`\`typescript
<div className="
  w-full 
  sm:w-1/2      // 640px 이상
  md:w-1/3      // 768px 이상
  lg:w-1/4      // 1024px 이상
  xl:w-1/5      // 1280px 이상
">
\`\`\`

## ♿ 접근성 체크리스트
- [ ] 시맨틱 HTML 사용 (header, nav, main, footer)
- [ ] ARIA 레이블 추가 (필요시)
- [ ] 키보드 네비게이션 지원
- [ ] 포커스 표시 유지
- [ ] 색상 대비 4.5:1 이상

## 🧪 컴포넌트 테스트
\`\`\`typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('expected')).toBeInTheDocument();
  });
});
\`\`\`

## 🔍 성능 최적화
- React.memo() - 불필요한 리렌더링 방지
- useMemo() - 비용이 큰 계산 메모이제이션
- useCallback() - 함수 재생성 방지
- 동적 import() - 코드 스플리팅
- Image 컴포넌트 - 이미지 최적화

## ⚠️ React Hook 명명 규칙
\`\`\`typescript
// ✅ 올바른 Hook 이름 (camelCase)
useCarousel, useAuth, useToast

// ❌ 잘못된 Hook 이름 (snake_case)
use_carousel, use_auth, use_toast
\`\`\`
```

### Step 5: src/types/CLAUDE.md (200줄 - 타입 시스템 특화)
```markdown
# 🔷 TypeScript 타입 관리 시스템

## 🚨 Single Source of Truth 원칙

### 📊 타입 플로우
\`\`\`
Supabase DB (snake_case)
     ↓ [npm run types:generate]
database.generated.ts (자동 생성, 수정 금지)
     ↓
src/types/index.ts (변환 레이어, 중앙 관리)
     ↓
Frontend Components (camelCase 사용)
\`\`\`

## ✅ 올바른 타입 import
\`\`\`typescript
// ✅ 반드시 @/types에서만 import
import { User, Course, snakeToCamelCase } from '@/types';

// ❌ 절대 금지 패턴들
import { Database } from '@/types/database';           // 금지!
import { Database } from '@/types/database.generated'; // 금지!
import type { Tables } from '@/types/database.generated'; // 금지!
\`\`\`

## 🔄 케이스 변환 시스템
\`\`\`typescript
// API Route에서 (DB → Frontend)
const dbData = await supabase.from('users').select();
return NextResponse.json(snakeToCamelCase(dbData.data));

// Frontend에서 사용
const user: User = await apiGet('/api/user'); // 이미 camelCase

// DB 저장 시 (Frontend → DB)
import { camelToSnakeCase } from '@/types';
await supabase.from('users').insert(camelToSnakeCase(userData));
\`\`\`

## 📝 타입 정의 규칙
\`\`\`typescript
// 1. 기본 타입 정의
export interface User {
  id: string;
  email: string;
  createdAt: Date;  // camelCase
}

// 2. Union 타입 활용
export type Status = 'pending' | 'active' | 'completed';

// 3. 제네릭 활용
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// 4. any 타입 절대 금지
// ❌ const data: any = [];
// ✅ const data: unknown[] = [];
\`\`\`

## 🔧 타입 생성 명령어
\`\`\`bash
# DB에서 타입 생성
npm run types:generate

# 타입 체크
npm run types:check

# 타입 오류 자동 수정 (신중히 사용)
npm run types:auto-fix
\`\`\`

## 🚫 절대 금지사항
1. any 타입 사용 금지
2. database.generated.ts 직접 import 금지
3. 수동으로 DB 타입 작성 금지
4. @ts-ignore 사용 금지
5. unknown 타입 검증 없이 사용 금지

## 📋 타입 체크리스트
- [ ] 모든 함수에 반환 타입 명시
- [ ] API 응답에 타입 정의
- [ ] unknown 처리 시 타입 가드 사용
- [ ] Union 타입으로 유연성 확보
- [ ] 제네릭으로 재사용성 향상
```

### Step 6: src/hooks/CLAUDE.md (150줄 - React Query 특화) ✨PHASE 0 추가
```markdown
# 📊 React Query 사용 규칙

## 🚨 React Query 패턴 (2025-02-01 구현)

### ✅ 기본 사용 패턴
\`\`\`typescript
import { useYouTubeSearch } from '@/hooks/queries/useYouTubeSearch';

function Component() {
  const { data, isLoading, error } = useYouTubeSearch(query);
  
  if (isLoading) return <Loading />;
  if (error) return <Error />;
  
  return <Results data={data} />;
}
\`\`\`

## 📁 파일 구조
\`\`\`
hooks/queries/
├── useYouTubeSearch.ts
├── useYouTubePopular.ts
├── useYouTubeFavorites.ts
├── useCommunityPosts.ts
├── useRevenueProof.ts
├── useUserProfile.ts
├── useChannelFolders.ts
├── useNotifications.ts
└── useCacheInvalidation.ts
\`\`\`

## 🎯 명명 규칙
- 파일명: `use[Domain][Action].ts`
- 훅 이름: `use` + PascalCase (camelCase 필수!)
- 쿼리 키: `['domain', 'action', ...params]`

## ⚙️ 캐싱 전략
\`\`\`typescript
{
  staleTime: 5 * 60 * 1000,     // 5분
  gcTime: 5 * 60 * 1000,         // 5분
  retry: 3,                      // 3회 재시도
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
}
\`\`\`

## 🔄 데이터 업데이트
\`\`\`typescript
// Optimistic Update
const mutation = useMutation({
  mutationFn: updateData,
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['key']);
    const previous = queryClient.getQueryData(['key']);
    queryClient.setQueryData(['key'], newData);
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['key'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['key']);
  }
});
\`\`\`

## ✅ 15개 구현된 훅
1. `useYouTubeSearch` - YouTube 검색
2. `useYouTubePopular` - 인기 동영상
3. `useYouTubeFavorites` - 즐겨찾기
4. `useCommunityPosts` - 커뮤니티 게시글
5. `useRevenueProof` - 수익 인증
6. `useUserProfile` - 사용자 프로필
7. `useChannelFolders` - 채널 폴더
8. `useNotifications` - 알림
9. `useCacheInvalidation` - 캐시 무효화
10-15. 기타 도메인별 쿼리 훅

## ⚠️ 주의사항
- 서버 컴포넌트에서 사용 불가
- 캐시 무효화 시점 신중히 결정
- 에러 바운더리와 함께 사용
- 로딩/에러 상태 항상 처리
```

### Step 7: src/lib/supabase/CLAUDE.md (250줄 - Supabase 특화)
```markdown
# 🔐 Supabase 클라이언트 패턴 (2025-08-22 표준)

## 🚨 필수 패턴 (프로젝트 파괴 방지)

### ✅ Server Component 패턴
\`\`\`typescript
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export const dynamic = 'force-dynamic'; // 환경변수 오류 방지

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  // 사용...
}
\`\`\`

### ✅ API Route 패턴
\`\`\`typescript
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  const supabase = await createSupabaseRouteHandlerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }
  
  // 비즈니스 로직...
}
\`\`\`

### ✅ Client Component 패턴
\`\`\`typescript
'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';

export function ClientComponent() {
  const supabase = createSupabaseBrowserClient();
  // 사용...
}
\`\`\`

## ❌ 절대 금지 패턴 (빌드 실패 원인)
\`\`\`typescript
// ❌ 모두 금지 - PKCE 오류 발생!
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

// ❌ 기타 금지사항
getSession() // 금지 → getUser() 사용
new Response() // 금지 → NextResponse.json() 사용
\`\`\`

## 🔒 RLS (Row Level Security) 정책
\`\`\`sql
-- 테이블 생성 시 즉시 적용
ALTER TABLE 테이블명 ENABLE ROW LEVEL SECURITY;

-- 기본 정책 템플릿
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "users_delete_own" ON users
  FOR DELETE USING (auth.uid() = user_id);
\`\`\`

## 📊 쿼리 최적화
\`\`\`typescript
// ✅ 필요한 필드만 선택
const { data } = await supabase
  .from('users')
  .select('id, name, email')  // 필드 명시
  .eq('status', 'active')
  .limit(10);

// ❌ 전체 선택 지양
const { data } = await supabase
  .from('users')
  .select('*');  // 모든 필드 (비효율)
\`\`\`

## 🔄 트랜잭션 처리
\`\`\`typescript
// RPC 함수로 트랜잭션 구현
const { data, error } = await supabase.rpc('transfer_funds', {
  from_account: 'A',
  to_account: 'B',
  amount: 100
});
\`\`\`

## 📝 마이그레이션 관리
\`\`\`bash
# SQL 실행
node scripts/supabase-sql-executor.js --method pg --file migrations/xxx.sql

# 테이블 검증
node scripts/verify-with-service-role.js

# 타입 재생성
npm run types:generate
\`\`\`
```

### Step 8: src/lib/CLAUDE.md (100줄 - 라이브러리 및 환경변수) ✨PHASE 0 추가
```markdown
# 🔧 라이브러리 및 환경변수 관리

## 🔐 환경변수 타입 안전성 (2025-02-01 구현)

### ✅ 타입 안전 사용법
\`\`\`typescript
// ✅ 올바른 import - 타입 안전
import { env } from '@/env';

// 서버 컴포넌트/API Route
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY; // 자동완성!

// 클라이언트 컴포넌트
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL; // 타입 체크!
\`\`\`

### ❌ 금지 패턴
\`\`\`typescript
// ❌ 직접 process.env 접근 금지
process.env.SUPABASE_SERVICE_ROLE_KEY  // 타입 안전성 없음

// ❌ 하드코딩 금지
const key = "fc28f35efe5b90..."  // 절대 금지!
\`\`\`

## 📋 환경변수 추가 프로세스
1. `.env.local`에 추가
2. `src/env.ts` 수정:
\`\`\`typescript
server: {
  NEW_SERVER_VAR: z.string().min(1),
},
client: {
  NEXT_PUBLIC_NEW_VAR: z.string(),
}
\`\`\`
3. 빌드 시 자동 검증
4. 코드에서 `env.NEW_VAR` 사용

## 🚨 빌드 실패 방지
- 환경변수 누락 → 빌드 시 명확한 오류
- 타입 불일치 → Zod 자동 검증
- 런타임 안전 → 빌드타임 검증 완료

## 📦 API 클라이언트
\`\`\`typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';

// 자동 인증, 에러 처리, 타입 변환
const data = await apiGet<User>('/api/user');
await apiPost('/api/posts', { title, content });
\`\`\`

## 🔄 케이스 변환 유틸
\`\`\`typescript
import { snakeToCamelCase, camelToSnakeCase } from '@/lib/utils/case-converter';

// DB → Frontend
const camelData = snakeToCamelCase(dbData);

// Frontend → DB
const snakeData = camelToSnakeCase(formData);
\`\`\`
```

### Step 9: src/lib/security/CLAUDE.md (200줄 - 보안 특화)
```markdown
# 🛡️ 보안 구현 가이드

## 🚨 보안 Wave 현황
- Wave 0: 완료 ✅ (기본 RLS)
- Wave 1: 완료 ✅ (인증 통합)
- Wave 2: 완료 ✅ (RLS 정책)
- Wave 3: 완료 ✅ (Rate Limiting, Zod, XSS)

## 🔐 인증 골든룰
1. **모든 API는 세션 검사 필수**
2. **getUser() 사용** (getSession() 금지)
3. **401 에러 표준 형식 준수**
4. **userId는 세션에서만 추출**

## ⚡ Rate Limiting (자동 활성화)
\`\`\`typescript
// src/lib/security/rate-limiter.ts
- IP 기반 일반 API: 분당 60회
- 인증 엔드포인트: 15분당 5회
- 파일 업로드: 시간당 10회
\`\`\`

## 🔍 입력 검증 (Zod)
\`\`\`typescript
import { validateRequestBody } from '@/lib/security/validation-schemas';

// API Route에서
const validation = await validateRequestBody(request, createPostSchema);
if (!validation.success) {
  return createValidationErrorResponse(validation.error);
}

// 스키마 정의
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  tags: z.array(z.string()).max(5).optional(),
});
\`\`\`

## 🧹 XSS 방지 (DOMPurify)
\`\`\`typescript
import { sanitizeRichHTML, sanitizeURL } from '@/lib/security/sanitizer';

// HTML 컨텐츠 정화
const safeContent = sanitizeRichHTML(userInput);

// URL 검증 및 정화
const safeUrl = sanitizeURL(urlInput);
\`\`\`

## 🔒 RLS 정책 적용
\`\`\`bash
# 모든 Wave RLS 적용
npm run security:apply-rls-all

# Dry-run 모드
npm run security:apply-rls-dry

# 특정 Wave만
npm run security:apply-rls-wave2
\`\`\`

## 🗑️ TTL 데이터 정책
\`\`\`bash
# 30일 이상 데이터 정리
npm run security:ttl

# Dry-run 모드
npm run security:ttl-dry

# 강제 삭제
npm run security:ttl-force
\`\`\`

## 🧪 보안 테스트
\`\`\`bash
# 전체 보안 테스트
npm run security:test

# 상세 모드
npm run security:test-verbose

# 통합 작업
npm run security:complete
\`\`\`

## 📋 보안 체크리스트
- [ ] API Route에 인증 체크
- [ ] 입력 데이터 Zod 검증
- [ ] 사용자 컨텐츠 XSS 정화
- [ ] RLS 정책 활성화
- [ ] Rate Limiting 설정
- [ ] 에러 메시지에 민감정보 제외
- [ ] 환경 변수 하드코딩 금지
```

### Step 10: scripts/CLAUDE.md (150줄 - 스크립트 특화)
```markdown
# 🔧 스크립트 실행 가이드

## 🚨 자동 스크립트 절대 금지
\`\`\`bash
# ❌ 절대 금지 - 코드 자동 변환
fix-all-errors.js
migrate-to-snake-case.js
auto-fix-types.js

# ✅ 허용 - 검증만 수행
verify-*.js
check-*.js
\`\`\`

## 📊 검증 스크립트
\`\`\`bash
# API 일치성 검증
npm run verify:api

# 타입 시스템 검증
npm run verify:types

# UI 일관성 검증  
npm run verify:ui

# 라우트 보호 검증
npm run verify:routes

# 병렬 실행 (60% 빠름)
npm run verify:parallel
\`\`\`

## 🗄️ SQL 실행 시스템
\`\`\`bash
# PostgreSQL 직접 연결 (권장)
node scripts/supabase-sql-executor.js --method pg --file <SQL파일>

# 옵션
--dry-run      # 실행 없이 검증만
--verbose      # 상세 로그
--health       # 연결 상태 확인
\`\`\`

## 📋 테이블 검증
\`\`\`bash
# 테이블 상태 확인
node scripts/verify-with-service-role.js

# 누락 테이블 검사
node scripts/check-missing-tables.js
\`\`\`

## 🔐 보안 스크립트
\`\`\`bash
# 비밀키 스캔
node scripts/security/scan-secrets.js

# RLS 정책 적용
node scripts/security/apply-rls-improved.js

# 세션 체크 검증
node scripts/security/verify-session-checks.js
\`\`\`

## 🎯 타입 관리
\`\`\`bash
# DB에서 타입 생성
npm run types:generate

# 타입 체크
npm run types:check

# 타입 제안 (수동 수정용)
node scripts/type-suggester.js <파일경로>
\`\`\`

## ⚠️ 스크립트 작성 규칙
1. 파일 시스템 직접 수정 금지
2. 검증 결과만 출력
3. 수정 제안은 상세히 기록
4. 롤백 가능하게 설계
5. 진행상황 표시 필수
```

### Step 11: docs/CLAUDE.md (100줄 - 문서 특화)
```markdown
# 📚 문서 체계 가이드

## 🚨 14개 핵심 문서 체계

### 필수 확인 순서
1. `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙 (최우선!)
2. `/docs/PROJECT.md` - 프로젝트 현황
3. `/docs/CODEMAP.md` - 프로젝트 구조
4. `/docs/CHECKLIST.md` - 작업 검증
5. [기타 문서들...]

## 📝 문서 작성 규칙
- 중복 내용 작성 금지
- 각 문서 역할 경계 준수
- 최신 7개 변경사항만 유지
- 실제 구현 상태 반영

## 🔄 문서 업데이트 시점
- 새 컴포넌트 → COMPONENT_INVENTORY.md
- 새 라우트 → ROUTE_SPEC.md
- API 연결 → WIREFRAME.md
- 에러 처리 → ERROR_BOUNDARY.md
- 상태 관리 → STATE_FLOW.md

## 📋 템플릿 활용
- 지시서: INSTRUCTION_TEMPLATE_v16.md
- 프로젝트별: docs/[project-name]/

## ⚠️ 주의사항
- README 파일 임의 생성 금지
- 사용자 협의 없이 문서 생성 금지
- 추측성 내용 작성 금지
```

### Step 12: tests/CLAUDE.md (100줄 - 테스트 가이드) ✨PHASE 0 추가
```markdown
# 🧪 테스트 작성 가이드

## 🚨 테스트 3종 시스템

### 1️⃣ Vitest 단위 테스트
\`\`\`typescript
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('expected')).toBeInTheDocument();
  });
});
\`\`\`

### 2️⃣ MSW API 모킹
\`\`\`typescript
// src/mocks/handlers.ts
http.get('/api/endpoint', () => {
  return HttpResponse.json({ data: 'mocked' })
})
\`\`\`

### 3️⃣ Playwright E2E
\`\`\`typescript
test('user flow', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("시작하기")');
  await expect(page).toHaveURL('/expected');
});
\`\`\`

## 🎯 dhacle.com 테스트
- URL: https://dhacle.com
- 테스트 계정: glemfkcl@naver.com / dhfl9909
- 로그인: 카카오 버튼 클릭 후 1분 대기

## ✅ 테스트 커버리지 목표
- 단위 테스트: 80% 이상
- 통합 테스트: 70% 이상
- E2E 핵심 플로우: 100%

## 📋 테스트 실행 명령
\`\`\`bash
npm run test          # Watch 모드
npm run test:coverage # 커버리지 확인
npm run e2e           # E2E 테스트
\`\`\`
```

### Step 13: 내용 검증 및 커밋
```bash
# 검증 스크립트 실행
node scripts/verify-claude-migration.js

# 내용 비교
diff -r CLAUDE.md.backup.* ./**/CLAUDE.md | wc -l

# 성공 시 커밋
git add -A
git commit -m "feat: CLAUDE.md 분산 시스템 Phase 2 - 폴더별 최적화 완료

- 14개 폴더별 CLAUDE.md 생성 (React Query, env.ts 추가)
- 폴더별 베스트 프랙티스 적용
- 중복 제거 및 관련성 최적화
- 상호 참조 시스템 구축"
```

## 📋 QA 테스트 시나리오

### 정상 플로우
1. 각 폴더별 CLAUDE.md가 생성되었는가?
2. 원본 내용이 100% 보존되었는가?
3. 폴더별 특화 내용이 추가되었는가?
4. 중복이 제거되었는가?

### 성능 측정
- 컨텍스트 로드: 1,111줄 → 100-200줄 (82% 감소)
- 토큰 사용량: ~10K → ~2K (80% 감소)
- 규칙 검색 시간: 2-3분 → 즉시 (95% 단축)

## ✅ Phase 완료 조건 (기능 작동 필수)
- [ ] **14개 폴더별 CLAUDE.md 생성** - 모든 파일 존재
- [ ] **원본 내용 100% 보존** - 검증 스크립트 통과
- [ ] **폴더별 최적화 완료** - 베스트 프랙티스 적용
- [ ] **중복 제거 완료** - 중복 내용 0개
- [ ] **상호 참조 구축** - 네비게이션 동작
- [ ] **커밋 완료** - Git 히스토리 기록

## 🔄 롤백 절차
```bash
# Phase 2 롤백
rm -f src/**/CLAUDE.md scripts/CLAUDE.md docs/CLAUDE.md
git checkout HEAD~1 CLAUDE.md
git checkout HEAD~1 -- .
```

## → 다음 Phase
- **파일**: PHASE_3_DETECTION_SYSTEM.md
- **선행 조건**: Phase 2의 모든 완료 조건 충족
- **주요 작업**: 실시간 규칙 위반 감지 시스템 구현