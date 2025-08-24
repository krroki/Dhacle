# 📝 YouTube Lens 인증 세션 문제 해결 구현 지시서

*작성일: 2025-02-01*
*문제: YouTube Lens 모든 기능이 401 인증 오류로 작동하지 않음*
*근본 원인: 클라이언트-서버 간 Supabase 세션 쿠키 동기화 실패*

---

## 🔴 필수 준수 사항
- **TypeScript any 타입 절대 사용 금지**
- **타입을 제대로 정의하거나 unknown을 쓰고 타입 가드를 쓸 것**
- **모든 API Route는 createRouteHandlerClient + getUser() 패턴 준수**
- **직접 fetch() 호출 금지, api-client.ts 사용**

---

## 🎯 해결해야 할 4가지 이슈

1. **Popular Shorts 기능 작동 안 함** → 401 에러로 데이터 로드 실패
2. **Channel Folder 메뉴 클릭 시 로그인 페이지로 리다이렉트** → 401 에러
3. **Collection 메뉴 클릭 시 로그인 페이지로 리다이렉트** → 401 에러  
4. **YouTube Lens 검색 시 "Authentication required" 에러** → 401 에러

**공통 원인**: 클라이언트는 로그인 상태이나, 서버 API routes에서 `supabase.auth.getUser()`가 null 반환

---

## 🚀 SC 명령어 및 플래그

```bash
/sc:fix --seq --validate --think-hard --c7
```

---

## 📋 3단계 구현 지시서

### 🔴 Phase 1: Implementation Verification (실제 구현 검증)

```markdown
## 실제 구현 검증 (문서보다 코드가 진실!)

1. **현재 인증 흐름 파일 확인**
   ```bash
   # 미들웨어 확인
   test -f "src/middleware.ts" && echo "미들웨어 있음" || echo "미들웨어 없음"
   Read src/middleware.ts
   
   # Auth 콜백 라우트 확인
   test -f "src/app/auth/callback/route.ts" && echo "콜백 있음" || echo "콜백 없음"
   Read src/app/auth/callback/route.ts
   
   # AuthProvider 확인
   Read src/lib/auth/AuthProvider.tsx
   Read src/lib/auth/AuthContext.tsx
   ```

2. **문제가 되는 API Routes 확인**
   ```bash
   # Popular Shorts API
   Read src/app/api/youtube/popular/route.ts
   
   # Folders API
   Read src/app/api/youtube/folders/route.ts
   
   # Collections API
   Read src/app/api/youtube/collections/route.ts
   
   # Search API
   Read src/app/api/youtube/search/route.ts
   ```

3. **클라이언트 컴포넌트 확인**
   ```bash
   # YouTube Lens 페이지
   Read src/app/(pages)/tools/youtube-lens/page.tsx
   
   # 문제 컴포넌트들
   Read src/components/features/tools/youtube-lens/PopularShortsList.tsx
   Read src/components/features/tools/youtube-lens/ChannelFolders.tsx
   Read src/components/features/tools/youtube-lens/CollectionBoard.tsx
   Read src/components/features/tools/youtube-lens/components/SearchBar.tsx
   ```

4. **Supabase 클라이언트 설정 확인**
   ```bash
   Read src/lib/supabase/server-client.ts
   Read src/lib/supabase/browser-client.ts
   ```
```

### 🔵 Phase 2: Document Reference (문서 참조)

```markdown
## 문서 참조 (참고용, 맹신 금지!)

1. **CLAUDE.md 인증 프로토콜 v2.0 확인**
   - Wave 1 완료 상태 (38/38 routes 100% 적용)
   - 올바른 패턴 확인:
     ```typescript
     import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
     import { cookies } from 'next/headers';
     
     const supabase = createRouteHandlerClient({ cookies });
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) {
       return NextResponse.json(
         { error: 'User not authenticated' },
         { status: 401 }
       );
     }
     ```

2. **ERROR_BOUNDARY.md 401 처리 확인**
   - 401 수신 시 로그인 리다이렉트 패턴
   - API Key 부재와 인증 실패 구분

3. **WIREFRAME.md YouTube Lens 섹션**
   - API 연결 상태 확인
   - 구현 완료 표시 확인
```

### 🟢 Phase 3: Implementation & Testing (구현 및 테스트)

```markdown
## 구현 및 테스트

### 🔧 Step 1: 미들웨어 수정/생성 (세션 쿠키 자동 관리)

**파일**: `src/middleware.ts`

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 세션 자동 새로고침 및 쿠키 업데이트
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (!error && session) {
    // 세션이 있으면 쿠키 자동 업데이트
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    });
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### 🔧 Step 2: Auth Callback Route 수정 (Kakao OAuth 후 쿠키 설정)

**파일**: `src/app/auth/callback/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // 코드를 세션으로 교환하고 쿠키 설정
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session) {
      // 세션 쿠키 명시적 설정
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });
      
      // 세션 확인
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }
    }
  }

  // 에러 시 로그인 페이지로
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin));
}
```

### 🔧 Step 3: AuthProvider 세션 동기화 개선

**파일**: `src/lib/auth/AuthProvider.tsx`

```typescript
'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    // 세션 변경 감지 및 자동 새로고침
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // 로그인 시 세션 쿠키 확인을 위해 라우터 새로고침
        router.refresh();
      } else if (event === 'SIGNED_OUT') {
        // 로그아웃 시 쿠키 정리
        router.refresh();
        router.push('/auth/login');
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // 토큰 새로고침 시 라우터 새로고침
        router.refresh();
      }
    });

    // 초기 세션 체크
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return <>{children}</>;
}
```

### 🔧 Step 4: API Routes 일관성 확인 (이미 Wave 1 완료되었다고 하지만 재확인)

모든 API Route가 다음 패턴을 따르는지 확인:

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET/POST/PUT/DELETE() {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }
  
  // 비즈니스 로직...
}
```

### 🧪 Step 5: 테스트 시나리오

#### ✅ Positive Cases (정상 동작):
1. **카카오 로그인 테스트**
   - /auth/login 접속
   - 카카오 로그인 진행
   - 콜백 후 세션 쿠키 확인 (DevTools > Application > Cookies)
   - sb-* 쿠키 존재 확인

2. **Popular Shorts 테스트**
   - 로그인 상태에서 /tools/youtube-lens 접속
   - Popular Shorts 탭 클릭
   - 데이터 로드 확인 (401 에러 없음)

3. **Channel Folder 테스트**
   - Channel Folder 메뉴 클릭
   - 폴더 목록 표시 확인 (리다이렉트 없음)

4. **Collection 테스트**
   - Collection 메뉴 클릭
   - 컬렉션 목록 표시 확인 (리다이렉트 없음)

5. **검색 테스트**
   - 검색바에 키워드 입력
   - 검색 결과 표시 확인 (Authentication required 에러 없음)

#### ❌ Negative Cases (에러 처리):
1. **로그아웃 상태 테스트**
   - 로그아웃 후 /tools/youtube-lens 접속
   - 로그인 페이지로 리다이렉트 확인

2. **API Key 없는 상태 테스트**
   - 로그인 상태에서 API Key 미설정
   - "API Key 설정이 필요합니다" 메시지 확인

3. **세션 만료 테스트**
   - 브라우저 쿠키 수동 삭제
   - 페이지 새로고침
   - 자동 로그인 페이지 리다이렉트 확인

### 📊 Step 6: 검증 명령어

```bash
# TypeScript 체크
npx tsc --noEmit

# 빌드 테스트
npm run build

# 개발 서버 실행
npm run dev

# 네트워크 탭에서 확인할 사항:
# 1. /api/youtube/popular 호출 시 Request Headers에 Cookie 포함
# 2. Response Status: 200 (401이 아님)
# 3. Response Body: 정상 데이터

# 콘솔에서 확인:
console.log(document.cookie); // sb-* 쿠키 확인
```

### 📝 Step 7: 문서 업데이트

구현 완료 후 다음 문서 업데이트:

1. **WIREFRAME.md**
   - YouTube Lens 섹션의 모든 ❌를 ✅로 변경
   - 구현 상태 100% 표시

2. **PROJECT.md**
   - YouTube Lens 인증 문제 해결 완료 기록
   - 변경사항 섹션에 추가

3. **ERROR_BOUNDARY.md**
   - 401 처리 개선사항 반영 (있는 경우)
```

---

## 🚨 주의사항

1. **절대 하지 말 것**:
   - ❌ getSession() 사용 (getUser() 사용)
   - ❌ createServerClient 사용 (createRouteHandlerClient 사용)
   - ❌ new Response() 사용 (NextResponse.json() 사용)
   - ❌ any 타입 사용

2. **반드시 확인할 것**:
   - ✅ 모든 API Route가 동일한 인증 패턴 사용
   - ✅ 미들웨어가 모든 경로에서 세션 업데이트
   - ✅ 클라이언트-서버 세션 동기화
   - ✅ 쿠키 설정 (credentials: 'same-origin')

3. **테스트 환경**:
   - 로컬: http://localhost:3000 (127.0.0.1 사용 금지)
   - 프로덕션: https://dhacle.com

---

## 🎯 예상 결과

구현 완료 시:
1. ✅ Popular Shorts 정상 작동
2. ✅ Channel Folder 메뉴 정상 작동  
3. ✅ Collection 메뉴 정상 작동
4. ✅ YouTube Lens 검색 정상 작동
5. ✅ 모든 401 에러 해결
6. ✅ 세션 자동 새로고침

---

*이 지시서를 따라 구현하면 YouTube Lens의 모든 인증 문제가 해결됩니다.*