# 🚨 카카오 로그인 문제 완전 해결 지시서

*INSTRUCTION_TEMPLATE_E2E_v3.md 기반으로 작성된 실행 강제화 지시서*

---

## 🎯 작업 목표

**dhacle.com 카카오 로그인 "요청한 리소스를 찾을 수 없습니다" 에러 완전 해결**
- 사용자가 실제로 카카오 로그인을 사용할 수 있어야 함
- 로그인 후 정상적으로 보호된 페이지 접근 가능해야 함
- Console 에러 0개 달성

## 📌 현재 상황

- **에러 메시지**: "요청한 리소스를 찾을 수 없습니다" 알림
- **발생 위치**: dhacle.com → 카카오 로그인 버튼 클릭 시
- **재현 방법**: 
  1. https://dhacle.com/auth/login 접속
  2. "카카오톡으로 3초 만에 시작하기" 버튼 클릭
  3. URL이 `?session=expired`로 변경되며 에러 발생

## 🔐 인증 및 테스트 계정 정보

- **로그인 방식**: 개발 환경에서는 **테스트 로그인** 시스템 활용 (localhost에서만 활성화)
- **테스트 계정**: 테스트 로그인 버튼 사용 (실제 카카오 계정 불필요)
- **주요 페이지 접근**: /mypage, /youtube-lens 등 로그인 후에만 접근 가능
- **세션 관리**: 모든 API는 세션 체크 필수

## ✅ 성공 기준

- [ ] 카카오 로그인 버튼 클릭 시 정상 OAuth 플로우 진행
- [ ] 로그인 완료 후 적절한 페이지로 리다이렉트
- [ ] 보호된 페이지(/mypage, /youtube-lens) 정상 접근
- [ ] **테스트 작성 및 실행 통과 (필수!)**
- [ ] Console 에러 0개

---

## 🚨 절대 규칙 - 임시방편 = 프로젝트 파괴

| 발견 시 | ❌ 절대 금지 | ✅ 유일한 해결책 |
|----------|-------------|---------------|
| OAuth 설정 문제 | 주석 처리, 우회 | 카카오 개발자 콘솔에서 정확한 URI 등록 |
| 환경변수 누락 | 하드코딩 | .env와 Vercel 환경변수 정확히 설정 |
| 리다이렉트 실패 | try-catch로 숨기기 | 콜백 라우트와 URI 매칭 확인 |
| 테스트 미실행 | "작성 완료"로 끝내기 | **즉시 실행 및 통과 확인** |

---

## 📋 Task 파일 구조
```
tasks/20250828_kakao_login_fix/
├── instruction.md      # 이 지시서
├── implementation.md   # 구현 내역
├── test-results.md     # 테스트 실행 결과 (필수!)
└── issues.md          # 발견된 문제
```

## ⚠️ 환경 준비

```bash
# 1. 포트 정리
netstat -ano | findstr :3000
# 만약 프로세스 있으면: taskkill /F /PID [프로세스ID]

# 2. 현재 상태 확인
npm run verify:parallel
npm run types:check 2>&1 | head -20
```

---

# 🔍 Phase 0: Context 파악

## 필수 확인 사항

```bash
# 1. 카카오 로그인 관련 파일 확인
ls -la src/components/features/auth/KakaoLoginButton.tsx
ls -la src/app/auth/callback/route.ts
ls -la src/app/auth/error/page.tsx
ls -la src/app/onboarding/page.tsx

# 2. 프로젝트 규약 확인  
cat src/app/api/CLAUDE.md
cat src/lib/supabase/CLAUDE.md

# 3. 환경변수 현재 상태 확인
node scripts/check-kakao-oauth.js

# 4. 실제 에러 재현
npm run dev
# 브라우저에서 localhost:3000/auth/login → 카카오 버튼 클릭
```

## Context 체크리스트
- [ ] 프로젝트 규약 이해
- [ ] 기존 OAuth 패턴 파악  
- [ ] 환경변수 설정 상태 확인
- [ ] Supabase 프로젝트 설정 확인

### 🚨 안정성 체크포인트 #1

```bash
# 임시방편 감지
grep -r "any" src/components/features/auth/ --include="*.ts" --include="*.tsx" | head -5
grep -r "TODO" src/app/auth/ | head -5

# ❌ 발견 시 → Phase 0으로 돌아가서 Context 재확인
# ✅ 없으면 → Phase 1 진행
```

---

# 📂 Phase 1: 현재 상태 파악

## 문제 진단

```bash
# 1. 개발 서버 시작
npm run dev

# 2. 브라우저 Console 확인 단계
echo "브라우저에서 F12 → Console 탭 열기"
echo "1. localhost:3000/auth/login 접속"
echo "2. 카카오 로그인 버튼 클릭"
echo "3. Console 에러 메시지 복사"
echo "4. Network 탭에서 실패한 요청 확인"
```

## 인증 상태 체계적 확인

```markdown
1. **로컬 환경 테스트 로그인**
   - localhost:3000/auth/login 접속
   - "🧪 테스트 로그인 (localhost 전용)" 버튼 확인
   - 테스트 로그인으로 보호된 페이지 접근 테스트

2. **카카오 OAuth 플로우 단계별 추적**
   - 버튼 클릭 → Supabase OAuth 요청
   - Supabase → 카카오 인증 서버 리다이렉트  
   - 카카오 → /auth/callback 리턴 (여기서 실패 추정)

3. **보호된 페이지 접근 테스트**
   - /mypage (로그인 필수)
   - /youtube-lens (로그인 필수) 
   - 각 페이지에서 401 vs 200 응답 확인
```

## 문제 분류
- [ ] Frontend 버튼 핸들러 문제
- [ ] Supabase OAuth 설정 문제 (가장 유력)
- [ ] 카카오 개발자 콘솔 Redirect URI 문제 (가장 유력)
- [ ] 환경변수 불일치 문제

---

# 📂 Phase 2: 문제 해결

## 핵심 OAuth 플로우 역추적

**정상 플로우**: 
카카오 버튼 클릭 → Supabase signInWithOAuth → 카카오 인증 → https://dhacle.com/auth/callback → 세션 생성 → 리다이렉트

**현재 실패 지점**: 카카오 인증 후 콜백 단계

## 체계적 수정 사항

### 1단계: 카카오 개발자 콘솔 설정 확인 및 수정

```bash
echo "=== 카카오 개발자 콘솔 필수 설정 ==="
echo "URL: https://developers.kakao.com"
echo "설정 위치: 애플리케이션 → 제품 설정 → 카카오 로그인 → Redirect URI"
echo ""
echo "필수 등록 URI (둘 다 등록!):"
echo "1. https://dhacle.com/auth/callback"
echo "2. https://golbwnsytwbyoneucunx.supabase.co/auth/v1/callback"
echo ""
echo "⚠️ 설정 후 10분 대기 필요"
```

### 2단계: Supabase Dashboard 설정 확인

```bash
echo "=== Supabase Dashboard 확인 ==="
echo "URL: https://supabase.com/dashboard"
echo "프로젝트: 디하클 → Authentication → Providers → Kakao"
echo ""
echo "확인 사항:"
echo "- Site URL: https://dhacle.com"
echo "- Redirect URLs: https://dhacle.com/auth/callback"
echo "- 카카오 Client ID/Secret 정확히 입력되어 있는지"
```

### 3단계: Vercel 환경변수 정확한 설정

```bash
# 현재 설정 상태 확인
echo "현재 Vercel 환경변수:"
echo "NEXT_PUBLIC_APP_URL=https://dhacle.vercel.app (유지)"
echo "NEXT_PUBLIC_API_URL=https://dhacle.vercel.app/api (유지)"
echo ""
echo "수정 필요한 환경변수:"
echo "NEXT_PUBLIC_SITE_URL=https://dhacle.com (OAuth 콜백용)"

# Vercel Dashboard에서 수동 설정 또는 CLI 사용
```

### 🚨 안정성 체크포인트 #2

```bash
# 설정 후 즉시 검증
echo "=== 설정 검증 ==="
echo "1. 카카오 개발자 콘솔 Redirect URI 등록 완료?"
echo "2. Supabase Dashboard OAuth 설정 확인 완료?"
echo "3. Vercel 환경변수 NEXT_PUBLIC_SITE_URL 수정 완료?"
echo ""

# 재배포 필요
echo "Vercel 재배포:"
echo "vercel --prod"

# ❌ 하나라도 미완료 → 수정 재시도
# ✅ 모두 완료 → Phase 3 진행
```

---

# 📂 Phase 3: 안정성 확보

## 체크리스트
- [ ] 엣지 케이스: 네트워크 실패 시 적절한 에러 메시지
- [ ] 데이터 무결성: 세션 만료 시 자동 로그아웃
- [ ] 보안 점검: CSRF, XSS 방어 확인
- [ ] 런타임 에러 방어: OAuth 실패 시 /auth/error로 리다이렉트

### 🚨 안정성 체크포인트 #3

```bash
# 전체 플로우 테스트 (설정 완료 10분 후 실행)
echo "=== E2E 전체 플로우 검증 ==="
echo "1. 로그아웃 상태에서 시작"
echo "2. dhacle.com/auth/login 접속"
echo "3. 카카오 로그인 버튼 클릭"
echo "4. 카카오 인증 페이지로 정상 리다이렉트 되는지 확인"
echo "5. 로그인 후 dhacle.com으로 정상 리턴 되는지 확인"
echo "6. 보호된 페이지 (/mypage) 정상 접근 확인"
echo "7. 새로고침 후 세션 유지 확인"

# 모두 통과해야 Phase 4 진행
```

---

# 🧪 Phase 4: 테스트 작성 및 즉시 실행 (필수!)

## ⚠️ 흔한 실수 패턴 (절대 금지!)
❌ "테스트 파일을 생성했습니다" → 작업 종료  
❌ "테스트를 작성했습니다" → 실행 없이 다음 단계  
❌ "테스트 코드는 다음과 같습니다" → 보여만 주고 끝  

## ✅ 올바른 작업 순서 (반드시 이 순서대로!)

1. 테스트 파일 생성
2. **"이제 테스트를 실행하겠습니다"라고 명시**
3. npx playwright test 실제 실행  
4. 실행 결과 보고
5. 실패 시 수정 후 재실행

## 🔴 필수 실행 명령어

```bash
# 반드시 실행할 것!
echo "=== 테스트 실행 시작 ==="

# 1. E2E 테스트 생성 및 실행 (가장 중요!)
# ⚠️ 주의: 경로는 ./e2e/로 시작해야 함!
echo "테스트 파일 생성: ./e2e/kakao-login-fix.spec.ts"

# 2. 실행
npx playwright test e2e/kakao-login-fix.spec.ts --project=chromium

# 3. 로컬 개발 환경 테스트 (테스트 로그인 활용)
npx playwright test e2e/local-auth-test.spec.ts --project=chromium

echo "=== 모든 테스트 통과 확인 완료 ==="
```

## ⚠️ 경로 주의사항
```markdown
Playwright 설정: testDir: './e2e'
따라서 테스트 실행 시:
- 올바른 명령: npx playwright test e2e/kakao-login-fix.spec.ts ✅
- 테스트 파일은 반드시 ./e2e/ 폴더에 저장 ✅
- 잘못된 경로: tests/e2e/, src/e2e/ 등 ❌
```

## 📝 테스트 코드 (반드시 ./e2e/ 경로에 생성!)

### ./e2e/kakao-login-fix.spec.ts
```typescript
import { test, expect } from '@playwright/test'

test.describe('카카오 로그인 문제 해결 검증', () => {
  test('카카오 로그인 버튼 클릭 시 정상 OAuth 플로우 진행', async ({ page }) => {
    // 에러 감지 설정
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // 1. 로그인 페이지 접속
    await page.goto('https://dhacle.com/auth/login')
    
    // 2. 카카오 로그인 버튼 존재 확인
    const kakaoButton = page.locator('button:has-text("카카오톡으로 3초 만에 시작하기")')
    await expect(kakaoButton).toBeVisible()
    
    // 3. 버튼 클릭
    await kakaoButton.click()
    
    // 4. 3초 대기 후 URL 변화 확인
    await page.waitForTimeout(3000)
    const currentUrl = page.url()
    
    // 5. 검증: session=expired가 없어야 함
    expect(currentUrl).not.toContain('session=expired')
    
    // 6. 카카오 OAuth 페이지로 리다이렉트 되었는지 확인
    // 또는 정상적으로 로그인 처리되었는지 확인
    const isKakaoAuth = currentUrl.includes('kauth.kakao.com') || 
                      currentUrl.includes('/dashboard') || 
                      currentUrl.includes('/onboarding')
    
    expect(isKakaoAuth).toBeTruthy()
    
    // 7. Console 에러 없음 확인
    expect(consoleErrors).toHaveLength(0)
  })
})
```

### ./e2e/local-auth-test.spec.ts (테스트 로그인 활용)
```typescript
import { test, expect } from '@playwright/test'

test.describe('로컬 환경 테스트 로그인 검증', () => {
  test('테스트 로그인으로 보호된 페이지 접근 가능', async ({ page }) => {
    // localhost에서만 실행
    test.skip(!process.env.CI, 'Local test only')
    
    // 1. 로그인 페이지 접속
    await page.goto('http://localhost:3000/auth/login')
    
    // 2. 테스트 로그인 버튼 클릭
    const testLoginButton = page.locator('button:has-text("🧪 테스트 로그인")')
    await expect(testLoginButton).toBeVisible()
    await testLoginButton.click()
    
    // 3. 로그인 완료 대기
    await page.waitForURL('**/mypage/profile')
    
    // 4. 보호된 페이지 접근 테스트
    await page.goto('http://localhost:3000/mypage')
    await expect(page.locator('h1')).toContainText('마이페이지')
    
    // 5. YouTube Lens 페이지 접근
    await page.goto('http://localhost:3000/youtube-lens')
    expect(page.url()).toContain('/youtube-lens') // 리다이렉트 안 됨
    
    // 6. API 호출 테스트
    const response = await page.request.get('/api/user/profile')
    expect(response.status()).toBe(200) // 401이 아님
  })
})
```

### 🚫 Phase 5 진입 차단 게이트
다음 중 하나라도 해당하면 진행 불가:
- [ ] 테스트 파일만 생성하고 실행 안 함
- [ ] 테스트 실행했지만 실패 무시  
- [ ] 실행 로그 없이 "통과했다"고 보고

**테스트 실행 후 반드시 다음 명령으로 결과 확인:**
```bash
npx playwright test e2e/kakao-login-fix.spec.ts --project=chromium --reporter=line
```

---

# ✅ Phase 5: 최종 검증

## 작업 완료 조건
- [ ] 사용자가 실제로 카카오 로그인 사용 가능
- [ ] dhacle.com에서 OAuth 플로우 정상 진행  
- [ ] 보호된 페이지 정상 접근
- [ ] Console 에러 0개
- [ ] Network 실패 요청 0개
- [ ] **모든 테스트 실행 및 통과 (필수!)**
- [ ] **실행 로그와 증거 제공 (필수!)**
- [ ] 프로젝트 규약 준수

## 최종 확인 명령어

```bash
# 검증 실행
npm run verify:parallel
npm run types:check
npm run security:test

# Git 상태
git status
git diff --stat

# 최종 E2E 테스트 한 번 더
npx playwright test e2e/kakao-login-fix.spec.ts --project=chromium --reporter=html
```

---

# 🔄 문제 발생 시 대응

## 에러 타입별 즉시 대응

### OAuth 리다이렉트 에러
1. 카카오 개발자 콘솔 Redirect URI 정확성 재확인
2. Supabase Dashboard OAuth 설정 재확인  
3. 환경변수 NEXT_PUBLIC_SITE_URL 확인
4. 10분 대기 후 재테스트

### 테스트 실행 실패
1. ./e2e/ 경로 정확성 확인
2. playwright.config.ts testDir 설정 확인
3. 테스트 코드 syntax 에러 확인  
4. 수정 후 즉시 재실행

### 환경변수 문제
1. .env.local vs Vercel Dashboard 불일치 확인
2. 대소문자 정확성 확인
3. 따옴표, 공백 제거 확인
4. 재배포 후 10분 대기

---

# 🚨 작업 종료 시 필수

```bash
# 1. 포트 정리
# Ctrl + C로 서버 종료 
netstat -ano | findstr :3000
# taskkill /F /PID [모든 PID] (필요시)

# 2. 검증 스크립트 실행
npm run verify:parallel  
npm run types:check
npm run security:test

# 3. Git 상태 확인
git status
git diff --stat

# 4. 문서 업데이트 확인
echo "다음 문서 업데이트 필요한가?"
echo "- docs/CONTEXT_BRIDGE.md (새로운 반복 실수?)"
echo "- docs/PROJECT.md (이슈 해결?)"  
echo "- src/app/auth/CLAUDE.md (OAuth 패턴 변경?)"
```

---

## 🎯 핵심 메시지

이 지시서는:

1. **테스트 즉시 실행을 강제합니다**
2. **실행 없이는 작업 완료가 아닙니다**  
3. **Console 에러 0개를 보장합니다**
4. **실제 사용 가능한 카카오 로그인을 만듭니다**

**반드시 ./e2e/ 경로에 테스트 파일 생성 후 즉시 실행하고 결과를 보고하세요!**