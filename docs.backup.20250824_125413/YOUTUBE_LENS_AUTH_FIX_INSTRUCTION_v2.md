# 📝 YouTube Lens 인증 세션 문제 해결 구현 지시서 v2

*작성일: 2025-02-01*
*버전: 2.0 (검토 후 수정)*
*문제: YouTube Lens 모든 기능이 401 인증 오류로 작동하지 않음*
*근본 원인: middleware.ts에 Supabase 세션 관리 코드 누락*

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

**공통 원인**: 미들웨어에서 Supabase 세션을 새로고침하지 않아 서버 API routes에서 `supabase.auth.getUser()`가 null 반환

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
   # 미들웨어 확인 - Supabase 세션 관리 코드 있는지 확인!
   Read src/middleware.ts
   # 현재 상태: Rate limiting과 캐싱 정책만 있고 Supabase 세션 관리 없음
   
   # Auth 콜백 라우트 확인
   Read src/app/auth/callback/route.ts
   # 현재 상태: 올바르게 구현됨 (exchangeCodeForSession 사용)
   
   # AuthProvider 확인
   Read src/lib/auth/AuthProvider.tsx
   Read src/lib/auth/AuthContext.tsx
   ```

2. **문제가 되는 API Routes 확인**
   ```bash
   # 모든 API Route가 올바른 패턴 사용하는지 확인
   grep -r "createRouteHandlerClient" src/app/api
   grep -r "getUser" src/app/api
   ```

3. **Supabase 패키지 버전 확인**
   ```bash
   # package.json에서 @supabase/auth-helpers-nextjs 버전 확인
   grep "@supabase/auth-helpers-nextjs" package.json
   # 필요 버전: ^0.8.0 이상
   ```
```

### 🔵 Phase 2: Document Reference (문서 참조)

```markdown
## 문서 참조 (참고용, 맹신 금지!)

1. **CLAUDE.md 인증 프로토콜 v2.0 확인**
   - Wave 1 완료 상태 (38/38 routes 100% 적용) - 이미 확인됨
   - API Routes는 이미 올바른 패턴 사용 중

2. **실제 문제 진단**
   - middleware.ts: Supabase 세션 관리 누락 ❌
   - auth/callback/route.ts: 올바르게 구현됨 ✅
   - API routes: 올바른 패턴 사용 중 ✅
   - 결론: 미들웨어만 수정하면 해결!
```

### 🟢 Phase 3: Implementation & Testing (구현 및 테스트)

```markdown
## 구현 및 테스트

### 🔧 핵심 수정: 미들웨어에 Supabase 세션 관리 추가

**파일**: `src/middleware.ts`

```typescript
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';
import {
  apiRateLimiter,
  authRateLimiter,
  createRateLimitResponse,
  getClientIp,
} from '@/lib/security/rate-limiter';

// ... (기존 상수들 유지)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 개발 환경에서 미들웨어 작동 확인
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Processing:', pathname);
  }

  // ⭐ Supabase 세션 자동 새로고침 추가 (핵심 수정!)
  const res = NextResponse.next();
  
  // 모든 경로에 대해 세션 새로고침 적용
  try {
    const supabase = createMiddlewareClient<Database>({ req: request, res });
    
    // 세션 자동 새로고침 - 이것만으로 충분!
    // createMiddlewareClient가 자동으로 쿠키 업데이트 처리
    await supabase.auth.getSession();
    
    if (process.env.NODE_ENV === 'development') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('[Middleware] Session refreshed for user:', user.id);
      }
    }
  } catch (error) {
    console.error('[Middleware] Error refreshing session:', error);
  }

  // API 라우트가 아니면 세션 새로고침만 하고 반환
  if (!pathname.startsWith('/api/')) {
    return res;
  }

  // ===== 기존 API 라우트 처리 로직 시작 =====
  
  // Wave 3: Rate Limiting 적용
  const clientIp = getClientIp(request as unknown as Request);
  const identifier = `${clientIp}:${pathname}`;

  // ... (기존 Rate Limiting 및 보안 헤더 로직 유지)

  return res; // 수정된 response 반환
}

// 미들웨어 적용 경로 설정 (기존 설정 유지)
export const config = {
  matcher: [
    // API 라우트
    '/api/:path*',
    // 정적 파일과 이미지 제외
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 🔍 중요 포인트

1. **수정 사항은 단 하나**: 미들웨어에 Supabase 세션 관리 추가
2. **Auth Callback Route**: 수정 불필요 (이미 올바름)
3. **API Routes**: 수정 불필요 (Wave 1에서 이미 완료)
4. **AuthProvider**: 수정 불필요 (클라이언트 세션은 정상)

### 🧪 테스트 시나리오

#### ✅ Positive Cases (정상 동작):
1. **세션 쿠키 확인**
   ```javascript
   // 브라우저 콘솔에서 실행
   console.log(document.cookie); 
   // sb-* 쿠키 확인 (sb-access-token, sb-refresh-token)
   ```

2. **Popular Shorts 테스트**
   - /tools/youtube-lens 접속
   - Popular Shorts 탭 클릭
   - Network 탭에서 /api/youtube/popular 응답 200 확인

3. **Channel Folder/Collection 테스트**
   - 각 메뉴 클릭
   - 리다이렉트 없이 데이터 로드 확인

4. **검색 테스트**
   - 검색어 입력
   - /api/youtube/search 응답 200 확인

#### ❌ Negative Cases (에러 처리):
1. **로그아웃 상태**
   - 로그아웃 → API 호출 → 401 응답 확인

2. **세션 만료 시뮬레이션**
   - 쿠키 삭제 → 페이지 새로고침 → 로그인 페이지 리다이렉트

### 📊 검증 명령어

```bash
# TypeScript 체크
npx tsc --noEmit

# 빌드 테스트
npm run build

# 개발 서버 실행 및 로그 확인
npm run dev
# 콘솔에서 "[Middleware] Session refreshed" 로그 확인

# 프로덕션 테스트
npm run build && npm run start
```

### 📝 문서 업데이트

구현 완료 후:

1. **PROJECT.md**
   - 변경사항에 "미들웨어 Supabase 세션 관리 추가" 기록
   - YouTube Lens 인증 문제 해결 완료 표시

2. **WIREFRAME.md**
   - YouTube Lens 섹션 모든 ❌를 ✅로 변경
```

---

## 🚨 주의사항

### ⚠️ 흔한 실수 방지

1. **불필요한 setSession() 호출 금지**
   - `createMiddlewareClient`가 자동으로 처리
   - 추가 setSession()은 오히려 문제 야기

2. **Auth Callback Route 수정 금지**
   - 현재 구현이 이미 올바름
   - exchangeCodeForSession이 쿠키 자동 설정

3. **API Routes 수정 금지**
   - Wave 1에서 이미 100% 적용 완료
   - 패턴 변경 불필요

---

## 🎯 예상 결과

구현 완료 시:
1. ✅ 모든 요청에서 세션 자동 새로고침
2. ✅ Popular Shorts 정상 작동
3. ✅ Channel Folder/Collection 메뉴 정상 작동  
4. ✅ YouTube Lens 검색 정상 작동
5. ✅ 401 에러 완전 해결
6. ✅ 세션 만료 시 자동 갱신

---

## 🔑 핵심 요약

**문제**: middleware.ts에 Supabase 세션 관리 누락
**해결**: createMiddlewareClient 추가하여 세션 자동 새로고침
**수정 파일**: `src/middleware.ts` 단 하나!

---

*이 지시서 v2는 실제 코드 검토 후 작성된 정확한 해결책입니다.*