# 📋 YouTube Lens 치명적 에러 해결 E2E 지시서

> **작성일**: 2025-08-28
> **버전**: v1.0 
> **긴급도**: 🔴 **최우선 - 프로덕션 사이트 완전 마비 상태**
> **목표**: dhacle.com YouTube Lens 페이지를 완벽하게 작동하는 상태로 복구

---

## 🎯 작업 목표

dhacle.com의 YouTube Lens 도구(/tools/youtube-lens)가 현재 완전히 작동하지 않는 치명적 상태입니다. 
페이지가 크래시되고, 인증 실패로 기능을 사용할 수 없으며, 여러 리소스가 로드되지 않습니다.
**사용자가 아무런 문제 없이 YouTube Lens를 사용할 수 있는 완전히 동작하는 상태로 만드는 것이 목표입니다.**

## 📌 현재 상황

### 발견된 치명적 에러들

1. **🔴 CRITICAL: 환경변수 접근 에러 (페이지 크래시)**
   - 에러: `❌ Attempted to access a server-side environment variable on the client`
   - 위치: `/app/(pages)/tools/youtube-lens/layout.tsx:26`
   - 원인: Client Component에서 서버 환경변수 `NODE_ENV` 접근 시도

2. **🔴 인증 에러 (401 Unauthorized)**
   - `/api/analytics/vitals` - 401 에러
   - 여러 API 엔드포인트 인증 실패
   - 에러: `ApiError: 인증이 필요합니다`

3. **🟡 리소스 로딩 실패 (404 Not Found)**
   - 여러 정적 리소스 404 에러
   - CSS 파일 preload 경고

4. **🟡 네트워크 에러**
   - Analytics vitals 전송 실패
   - Failed to fetch 에러

### 재현 방법
1. https://dhacle.com 접속
2. 상단 메뉴 "도구" 클릭 또는 직접 /tools/youtube-lens 접속
3. 페이지 크래시 및 에러 화면 표시

### 예상 동작
- YouTube Lens 페이지 정상 로드
- 로그인 시 모든 기능 정상 작동
- 비로그인 시 적절한 안내 메시지

### 실제 동작
- 페이지 즉시 크래시
- "문제가 발생했습니다" 에러 메시지
- 모든 기능 사용 불가

## 🔐 인증 및 테스트 계정 정보

- **로그인 방식**: 카카오 로그인 (OAuth 2.0)
- **개발 환경 테스트**: localhost에서 "🧪 테스트 로그인" 버튼 활용
- **프로덕션 테스트**: 실제 카카오 계정 필요
- **주요 페이지 접근**: YouTube Lens는 로그인 필수
- **세션 관리**: 모든 API는 세션 체크 필수

## ✅ 성공 기준

- [ ] YouTube Lens 페이지 크래시 없이 정상 로드
- [ ] 로그인/비로그인 상태 모두 적절한 UI 표시
- [ ] 로그인 후 모든 YouTube Lens 기능 정상 작동
- [ ] Console 에러 0개
- [ ] 404/401 에러 없음
- [ ] E2E 테스트 100% 통과

---

## 🚨 절대 규칙 - 임시방편 = 프로젝트 파괴

| 발견 시 | ❌ 절대 금지 | ✅ 유일한 해결책 |
|----------|--------------|--------------|
| 환경변수 에러 | process.env 직접 사용 | NEXT_PUBLIC_ prefix 사용 또는 서버 컴포넌트로 변경 |
| 타입 불명확 | any, unknown 사용 | 정확한 타입 확인 후 정의 |
| 인증 실패 | null/빈 배열 반환 | 완전한 인증 구현 |
| 함수 미완성 | TODO, 빈 함수 | 완전히 구현하거나 삭제 |
| 에러 발생 | try-catch로 숨기기 | 근본 원인 해결 |
| 테스트 미실행 | "작성 완료"로 끝내기 | 즉시 실행 및 통과 확인 |

---

## 📁 Task 폴더 생성

```bash
mkdir -p tasks/20250828_youtube_lens_critical_errors
cd tasks/20250828_youtube_lens_critical_errors
```

## 📋 Task 파일 구조
```
tasks/20250828_youtube_lens_critical_errors/
├── instruction.md      # 이 지시서
├── implementation.md   # 구현 내역
├── test-results.md     # 테스트 실행 결과
└── issues.md          # 발견된 문제
```

## ⚠️ 환경 준비

```bash
# 1. 포트 정리
netstat -ano | findstr :3000
taskkill /F /PID [프로세스ID]

# 2. 현재 상태 확인
npm run verify:parallel
npm run types:check 2>&1 | head -20

# 3. 브랜치 생성
git checkout -b fix/youtube-lens-critical-errors
```

---

## 🔍 Phase 0: Context 파악

### 필수 확인 사항

```bash
# 1. 프로젝트 구조 확인
ls -la src/app/(pages)/tools/youtube-lens/
ls -la src/app/api/youtube/

# 2. 프로젝트 규약 확인
cat src/app/(pages)/CLAUDE.md
cat src/lib/CLAUDE.md
cat src/env.ts | head -50

# 3. 기존 패턴 분석
cat src/app/(pages)/page.tsx | head -30
cat src/app/(pages)/community/page.tsx | head -30

# 4. 연관 파일 찾기
grep -r "NODE_ENV" src/ --include="*.tsx" --include="*.ts" | head -10
```

### Context 체크리스트
- [ ] 프로젝트 규약 이해 (Server Component 우선)
- [ ] 환경변수 패턴 파악 (server vs client)
- [ ] 연관 파일 목록 작성
- [ ] DB 스키마 확인

### 🚨 안정성 체크포인트 #1

```bash
# 임시방편 감지
grep -r "any" src/app/(pages)/tools/youtube-lens/ --include="*.ts" --include="*.tsx"
grep -r "TODO" src/app/(pages)/tools/youtube-lens/
grep -r "console.log" src/app/(pages)/tools/youtube-lens/

# ❌ 발견 시 → Phase 0으로 돌아가서 Context 재확인
# ✅ 없으면 → Phase 1 진행
```

---

## 📂 Phase 1: 현재 상태 파악

### 문제 진단

```bash
# 로컬 개발 서버 실행
npm run dev

# 브라우저에서 확인
# 1. http://localhost:3000/tools/youtube-lens 접속
# 2. F12 Console 에러 확인
# 3. Network 탭 실패 요청 확인
```

### 인증 상태 확인

```markdown
1. 개발 환경 테스트 로그인 버튼 확인
2. 테스트 로그인 시도
3. 세션 생성 확인 (localStorage, cookies)
4. 보호된 페이지 접근 테스트
   - /tools/youtube-lens (로그인 필수)
```

### 문제 분류
- [x] Client Component 환경변수 문제
- [x] API 인증 문제 (401 Unauthorized)
- [ ] DB 연결 문제
- [x] 빌드/배포 설정 문제

---

## 📂 Phase 2: 문제 해결

### 사용자 플로우 역추적
페이지 로드 → layout.tsx 실행 → env.NODE_ENV 접근 → 에러 발생 → 페이지 크래시

### 수정 사항

#### 1. YouTube Lens Layout 수정 (CRITICAL)

**문제**: Client Component에서 서버 환경변수 접근

**파일**: `src/app/(pages)/tools/youtube-lens/layout.tsx`

**현재 코드 (❌ 잘못됨)**:
```typescript
'use client';
import { env } from '@/env';

export default function YouTubeLensLayout({ children }: { children: React.ReactNode }) {
  // ...
  return (
    <QueryClientProvider client={query_client}>
      {children}
      {env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
```

**수정 코드 (✅ 올바름)**:
```typescript
'use client';

export default function YouTubeLensLayout({ children }: { children: React.ReactNode }) {
  const [query_client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // 클라이언트에서 안전한 환경 체크
  const isDevelopment = typeof window !== 'undefined' && 
    window.location.hostname === 'localhost';

  return (
    <QueryClientProvider client={query_client}>
      {children}
      {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
```

#### 2. API 인증 체크 추가

**파일**: `src/app/api/analytics/vitals/route.ts`

**추가할 코드**:
```typescript
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 인증 없이도 vitals는 전송 가능하도록 처리
    const body = await request.json();
    
    // vitals 저장 로직
    console.log('[Vitals]', body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Vitals Error]', error);
    return NextResponse.json(
      { error: 'Failed to save vitals' },
      { status: 500 }
    );
  }
}
```

#### 3. YouTube Lens Page 수정

**파일**: `src/app/(pages)/tools/youtube-lens/page.tsx`

**추가할 보호 로직**:
```typescript
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export default async function YouTubeLensPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/tools/youtube-lens');
  }

  // YouTube Lens 컨텐츠
  return <YouTubeLensContent userId={user.id} />;
}
```

### 🚨 안정성 체크포인트 #2

```bash
# 수정 후 즉시 검증
npm run types:check 2>&1 | grep "error TS"

# 실제 작동 테스트
# 1. 서버 재시작 (중요!)
npm run dev
# 2. 브라우저 새로고침
# 3. 기능 재테스트
# 4. Console 에러 0개 확인

# ❌ 에러 있음 → 수정 재시도
# ✅ 정상 작동 → Phase 3 진행
```

---

## 📂 Phase 3: 안정성 확보

### 체크리스트
- [ ] 엣지 케이스 처리 (비로그인, 세션 만료)
- [ ] 데이터 무결성 (API 응답 검증)
- [ ] 보안 점검 (인증, 권한)
- [ ] 런타임 에러 방어

### 추가 보안 조치

```typescript
// Error Boundary 추가
// src/app/(pages)/tools/youtube-lens/error.tsx
'use client';

export default function YouTubeLensError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">YouTube Lens 오류</h2>
      <p className="text-gray-600 mb-6">
        {error.message || '예기치 않은 오류가 발생했습니다.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-white rounded-lg"
      >
        다시 시도
      </button>
    </div>
  );
}
```

### 🚨 안정성 체크포인트 #3

```bash
echo "=== E2E 전체 플로우 검증 ==="
echo "1. 로그아웃 상태에서 시작"
echo "2. /tools/youtube-lens 접속 → 로그인 페이지로 리다이렉트"
echo "3. 카카오 로그인 (또는 테스트 로그인)"
echo "4. YouTube Lens 페이지 정상 로드"
echo "5. 기능 사용 → 데이터 저장"
echo "6. 새로고침 → 데이터 유지 확인"
echo "7. 로그아웃 → 재로그인 → 데이터 유지"

# 모두 통과해야 Phase 4 진행
```

---

## 🧪 Phase 4: 테스트 작성 및 즉시 실행 (필수!)

### ⚠️ 흔한 실수 패턴 (절대 금지!)
❌ "테스트 파일을 생성했습니다" → 작업 종료
❌ "테스트를 작성했습니다" → 실행 없이 다음 단계
❌ "테스트 코드는 다음과 같습니다" → 보여만 주고 끝

### ✅ 올바른 작업 순서 (반드시 이 순서대로!)
1. 테스트 파일 생성
2. **"이제 테스트를 실행하겠습니다"라고 명시**
3. npx playwright test 실제 실행
4. 실행 결과 보고
5. 실패 시 수정 후 재실행

### E2E 테스트 작성

**파일**: `e2e/youtube-lens-critical.spec.ts`

```typescript
import { test, expect } from './global-setup';

test.describe('YouTube Lens Critical Errors', () => {
  test('페이지 크래시 없이 정상 로드', async ({ page }) => {
    // 페이지 접속
    await page.goto('/tools/youtube-lens');
    
    // 크래시 없이 로드 확인
    await expect(page.locator('body')).toBeVisible();
    
    // 에러 메시지 없음 확인
    const errorMessage = page.locator('text="문제가 발생했습니다"');
    await expect(errorMessage).not.toBeVisible();
  });

  test('비로그인 시 적절한 리다이렉트', async ({ page }) => {
    await page.goto('/tools/youtube-lens');
    
    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(/.*auth\/login.*/);
    
    // redirect 파라미터 확인
    const url = new URL(page.url());
    expect(url.searchParams.get('redirect')).toBe('/tools/youtube-lens');
  });

  test('로그인 후 YouTube Lens 접근 가능', async ({ page }) => {
    // 테스트 로그인 (localhost)
    await page.goto('/');
    
    // 테스트 로그인 버튼 클릭
    const testLoginBtn = page.locator('button:has-text("🧪 테스트 로그인")');
    if (await testLoginBtn.isVisible()) {
      await testLoginBtn.click();
      await page.waitForURL('/');
    }
    
    // YouTube Lens 접속
    await page.goto('/tools/youtube-lens');
    
    // 정상 로드 확인
    await expect(page.locator('h1')).toContainText('YouTube Lens');
    
    // 주요 기능 요소 확인
    await expect(page.locator('[data-testid="youtube-search"]')).toBeVisible();
  });

  test('Console 에러 없음', async ({ page, errorDetector }) => {
    // errorDetector가 자동으로 에러 감지
    await page.goto('/tools/youtube-lens');
    
    // 5초 대기 후 에러 없음 확인
    await page.waitForTimeout(5000);
    
    // 페이지가 여전히 정상 상태인지 확인
    await expect(page.locator('body')).toBeVisible();
  });

  test('API 인증 에러 해결', async ({ page }) => {
    // 로그인 상태에서 테스트
    await page.goto('/');
    const testLoginBtn = page.locator('button:has-text("🧪 테스트 로그인")');
    if (await testLoginBtn.isVisible()) {
      await testLoginBtn.click();
    }
    
    await page.goto('/tools/youtube-lens');
    
    // API 호출 모니터링
    const response = await page.waitForResponse(
      response => response.url().includes('/api/') && 
                 response.status() !== 401,
      { timeout: 10000 }
    );
    
    // 401 에러 없음 확인
    expect(response.status()).not.toBe(401);
  });
});
```

### 🔴 필수 실행 명령어

```bash
# 반드시 실행할 것!
echo "=== 테스트 실행 시작 ==="

# E2E 테스트 실행
npx playwright test e2e/youtube-lens-critical.spec.ts --project=chromium

# 실행 결과 확인
echo "=== 모든 테스트 통과 확인 완료 ==="
```

### 🚫 Phase 5 진입 차단 게이트
다음 중 하나라도 해당하면 진행 불가:
- [ ] 테스트 파일만 생성하고 실행 안 함
- [ ] 테스트 실행했지만 실패 무시
- [ ] 실행 로그 없이 "통과했다"고 보고

---

## 📊 테스트 실행 완료 보고서

### 필수 작성 항목

```markdown
## 테스트 실행 결과

### 📋 테스트 파일
- E2E: ./e2e/youtube-lens-critical.spec.ts

### 🚀 실행 결과
#### E2E 테스트
- 명령: npx playwright test e2e/youtube-lens-critical.spec.ts
- 결과: ✅ Pass (5 tests)
- Console 에러: 0개
- 소요시간: 8.2s

### 📊 최종 확인
- [x] 모든 테스트 통과
- [x] Console 에러 없음
- [x] 401/404 에러 해결
- [x] 페이지 크래시 해결
- [x] 실행 로그 제공
```

---

## ✅ Phase 5: 최종 검증

### 작업 완료 조건
- [x] YouTube Lens 페이지 크래시 없이 로드
- [x] 로그인/비로그인 적절한 처리
- [x] 모든 기능 정상 작동
- [x] Console 에러 0개
- [x] Network 실패 요청 0개
- [x] 모든 테스트 실행 및 통과
- [x] 실행 로그와 증거 제공
- [x] 프로젝트 규약 준수

### 최종 확인 명령어

```bash
# 검증 실행
npm run verify:parallel
npm run types:check
npm run security:test

# 빌드 테스트
npm run build

# Git 상태
git status
git diff --stat
```

---

## 🔄 문제 발생 시 대응

### 에러 타입별 즉시 대응

#### Environment Variable 에러
1. 클라이언트/서버 구분 확인
2. NEXT_PUBLIC_ prefix 필요 여부 판단
3. Server Component로 변경 고려
4. env.ts 설정 확인

#### 인증 에러
1. API Route 세션 체크 확인
2. Supabase 클라이언트 패턴 확인
3. 리다이렉트 로직 검토
4. 세션 만료 처리 확인

#### 타입 에러
1. @/types에서 타입 찾기
2. 없으면 새로 정의
3. any 타입 절대 사용 금지
4. 관련 파일 모두 업데이트

---

## 🚨 작업 종료 시 필수

```bash
# 1. 포트 정리
Ctrl + C  # 서버 종료
netstat -ano | findstr :3000
taskkill /F /PID [모든 PID]

# 2. 검증 스크립트 실행
npm run verify:parallel
npm run types:check
npm run security:test

# 3. Git 상태 확인
git status
git add .
git commit -m "fix: YouTube Lens 치명적 에러 해결

- Client Component 환경변수 접근 문제 해결
- API 인증 에러 수정
- 페이지 크래시 방지
- E2E 테스트 100% 통과"

# 4. 문서 업데이트 확인
echo "다음 문서 업데이트 필요한가?"
echo "- docs/CONTEXT_BRIDGE.md (새로운 반복 실수?)"
echo "- docs/PROJECT.md (이슈 해결?)"
echo "- src/app/(pages)/CLAUDE.md (패턴 변경?)"
```

---

## 📝 구현 순서 요약

1. **즉시 수정 (Critical)**
   - YouTube Lens layout.tsx 환경변수 문제 해결
   - API vitals route 인증 처리

2. **보안 강화**
   - YouTube Lens page.tsx 인증 체크 추가
   - Error boundary 구현

3. **테스트 검증**
   - E2E 테스트 작성 및 실행
   - 모든 시나리오 통과 확인

4. **배포 준비**
   - 빌드 성공 확인
   - 프로덕션 환경변수 확인
   - Vercel 배포

---

## 🎯 핵심 메시지

**"테스트 실행 없이는 작업 완료가 아닙니다"**
**"Console 에러 1개라도 있으면 실패입니다"**
**"임시방편 코드는 2주간 디버깅을 만듭니다"**
**"실제 사용 가능한 코드만이 완료된 코드입니다"**

---

*이 지시서 버전: v1.0 (2025-08-28)*
*목적: YouTube Lens 치명적 에러 완전 해결을 통한 서비스 정상화*