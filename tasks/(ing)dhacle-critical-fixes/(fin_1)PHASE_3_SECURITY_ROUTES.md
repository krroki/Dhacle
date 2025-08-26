/sc:implement --seq --validate --persona-security
"Phase 3: 라우트 보호 및 인증 체크 적용"

# Phase 3: 라우트 보호 및 보안 강화

## 🚨 프로젝트 특화 규칙 확인 (필수)
⚠️ **경고**: 아래 문서 미확인 시 프로젝트 파괴 가능성 90%

### 최우선 확인 문서
- [ ] `/docs/CONTEXT_BRIDGE.md` 262-274행 - 인증 API 패턴
- [ ] `/src/lib/security/CLAUDE.md` - 보안 가이드
- [ ] `/src/app/api/CLAUDE.md` - API 보호 패턴
- [ ] `/docs/PROJECT.md` 149-172행 - 인증/오리진 불변식

### 프로젝트 금지사항 체크 ✅
- [ ] getSession() 사용 금지 (getUser() 사용)
- [ ] userId 클라이언트 전달 금지
- [ ] 401 표준 형식 준수: `{ error: 'User not authenticated' }`
- [ ] createServerComponentClient 사용 금지
- [ ] 쿠키 기반 세션만 사용

### 작업 전 검증 명령어
```bash
# 보호되지 않은 라우트 확인
npm run verify:routes

# getSession 사용 확인 (0개여야 함)
grep -r "getSession" src/ --include="*.ts" --include="*.tsx"

# 구식 패턴 확인 (0개여야 함)
grep -r "createServerComponentClient" src/
```

## 📌 Phase 정보
- **Phase 번호**: 3/4
- **선행 조건**: Phase 2 완료 (타입 안정성 필요)
- **예상 시간**: 1-2일
- **우선순위**: CRITICAL
- **작업 범위**: 모든 API 라우트, 보호 필요 페이지

## 🎯 Phase 목표
1. 모든 API 라우트 인증 체크 적용
2. 보호 필요 페이지 미들웨어 적용
3. 401 에러 응답 표준화
4. 세션 기반 인증 100% 적용

## 📚 온보딩 섹션
### 이 Phase에 필요한 지식
- [ ] `/docs/ERROR_BOUNDARY.md` - 401 에러 처리
- [ ] `/src/middleware.ts` - 미들웨어 패턴
- [ ] Supabase Auth 세션 관리
- [ ] Next.js 15 라우트 보호

### 작업 파일 경로
- API 라우트: `src/app/api/*/route.ts`
- 미들웨어: `src/middleware.ts`
- 보호 페이지: `src/app/(pages)/dashboard/`, `/settings/`, `/tools/`

## 📝 작업 내용

### 1단계: API 라우트 인증 체크 표준화
```typescript
// src/lib/api-auth.ts (새 파일 - 공통 인증 체크)
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const supabase = await createSupabaseRouteHandlerClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    };
  }
  
  return { user, response: null };
}

// 모든 API 라우트에 적용
// src/app/api/[any]/route.ts
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: Request) {
  const { user, response } = await requireAuth();
  if (response) return response; // 401 반환
  
  // 인증된 사용자만 여기 도달
  // 비즈니스 로직...
}
```

### 2단계: 미들웨어 강화
```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 보호 필요 라우트 정의
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/tools/youtube-lens',
  '/courses/create',
  '/profile',
  '/admin',
];

// 공개 라우트 (로그인 없이 접근 가능)
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/auth/callback',
  '/courses', // 목록은 공개
  '/about',
];

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  const { pathname } = request.nextUrl;
  
  // 정적 파일 및 API 제외
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return res;
  }
  
  // 세션 확인
  const { data: { user } } = await supabase.auth.getUser();
  
  // 보호된 라우트 체크
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute && !user) {
    // 로그인 페이지로 리다이렉트
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // 로그인한 사용자가 로그인/회원가입 페이지 접근 시
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 3단계: 각 API 라우트 보호 적용
```typescript
// src/app/api/user/profile/route.ts
import { requireAuth } from '@/lib/api-auth';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const { user, response } = await requireAuth();
  if (response) return response;
  
  const supabase = await createSupabaseRouteHandlerClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) {
    return NextResponse.json(
      { error: 'Profile not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const { user, response } = await requireAuth();
  if (response) return response;
  
  const body = await request.json();
  const supabase = await createSupabaseRouteHandlerClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .update(body)
    .eq('id', user.id)
    .select()
    .single();
    
  if (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ profile: data });
}

// 모든 API 라우트에 동일 패턴 적용
```

### 4단계: 페이지 컴포넌트 보호
```typescript
// src/app/(pages)/dashboard/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login?redirect=/dashboard');
  }
  
  // 인증된 사용자만 여기 도달
  return (
    <div>
      <h1>대시보드</h1>
      {/* 페이지 내용 */}
    </div>
  );
}

// 모든 보호 필요 페이지에 동일 패턴 적용
```

### 5단계: 클라이언트 컴포넌트 인증 체크
```typescript
// src/hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/browser-client';

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createBrowserClient();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (requireAuth && !user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      setLoading(false);
    };
    
    checkAuth();
    
    // 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' && requireAuth) {
          router.push('/login');
        } else if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [requireAuth, router, supabase]);
  
  return { user, loading };
}
```

### 6단계: 401 에러 처리 통일
```typescript
// src/lib/api-client.ts 수정
export async function apiGet<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'same-origin', // 쿠키 포함
  });
  
  if (response.status === 401) {
    // 401 표준 처리
    window.location.href = '/login?session=expired';
    throw new Error('User not authenticated');
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  
  return response.json();
}
```

## 📋 QA 테스트 시나리오
### 정상 플로우
1. 로그인 후 보호 페이지 접근 → 성공
2. API 호출 시 세션 유효 → 200 응답
3. 세션 유지 중 페이지 이동 → 정상 작동

### 실패 시나리오
1. 미로그인 상태 보호 페이지 → 로그인 리다이렉트
2. 세션 만료 후 API 호출 → 401 응답
3. 잘못된 토큰 → 401 응답

### 성능 측정
- 인증 체크: < 50ms
- 리다이렉트: < 100ms
- 세션 갱신: < 200ms

## ✅ Phase 완료 조건 (기능 작동 필수)
- [ ] **모든 API 라우트 인증 체크 적용**
  ```bash
  npm run verify:routes
  # 결과: 100% 보호
  ```
- [ ] **미들웨어 보호 라우트 정의 완료**
- [ ] **401 응답 표준화 완료**
- [ ] **세션 기반 인증 100%**
- [ ] **보안 테스트 통과**: `npm run security:test`
- [ ] **E2E 인증 테스트 통과**
- [ ] **빌드 성공**: `npm run build`

## 🔄 롤백 절차
```bash
# Phase 3 롤백
# 1. 인증 파일 삭제
rm src/lib/api-auth.ts
rm src/hooks/useAuth.ts

# 2. 변경사항 되돌리기
git checkout -- src/middleware.ts
git checkout -- src/app/api/
git checkout -- src/app/(pages)/

# 3. 이전 커밋으로 복원
git reset --hard HEAD~1
```

## → 다음 Phase
- **파일**: PHASE_4_API_PATTERNS.md
- **선행 조건**: 
  - 라우트 보호 완료
  - 401 표준화 완료
  - 모든 보안 테스트 통과