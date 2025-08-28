# 🧪 카카오 로그인 테스트 가이드

*Claude Code가 로그인 테스트를 수행할 때 반드시 확인해야 하는 문서*

---

## ⚠️ 중요: 테스트 전 반드시 읽기!

**이 문서는 카카오 로그인 테스트 시 필요한 모든 정보를 담고 있습니다.**

---

## 🔐 테스트 계정 정보

### 실제 카카오 계정 (관리자)
```
이메일: glemfkcl@naver.com
비밀번호: dhfl9909
용도: 실제 카카오 OAuth 테스트, YouTube Lens 관리자 기능
권한: 관리자 (모든 기능 접근 가능)
```

### 테스트 계정 (개발 환경 전용)
```
이메일: test@dhacle.com
비밀번호: test1234
용도: 로컬 개발 환경 테스트
사용법: localhost에서 "🧪 테스트 로그인 (localhost 전용)" 버튼 클릭
```

---

## 🎯 테스트 환경별 로그인 방법

### 1. localhost:3000 (개발 환경)
```markdown
✅ 권장 방법: 테스트 로그인 버튼 사용

1. http://localhost:3000/auth/login 접속
2. "🧪 테스트 로그인 (localhost 전용)" 버튼 클릭
3. 자동으로 세션 생성되고 /mypage/profile로 리다이렉트
4. 모든 보호된 페이지 접근 가능

⚠️ 주의: 이 버튼은 NODE_ENV=development에서만 표시됨
```

### 2. dhacle.com (프로덕션 환경) 
```markdown
⚡ 실제 카카오 OAuth 플로우:

1. https://dhacle.com/auth/login 접속
2. "카카오톡으로 3초 만에 시작하기" 버튼 클릭
3. ⏳ **중요: 버튼 클릭 후 1분 정도 대기 필요**
   - 카카오 인증 서버 응답 대기
   - 네트워크 상태에 따라 지연 가능
4. 카카오 로그인 페이지로 리다이렉트
5. 계정 정보 입력:
   - 이메일: glemfkcl@naver.com
   - 비밀번호: dhfl9909
6. 인증 완료 후 dhacle.com으로 리턴
```

---

## 🧪 E2E 테스트 작성 규칙

### 파일 위치 (중요!)
```bash
✅ 올바른 경로: ./e2e/*.spec.ts
❌ 잘못된 경로: ./tests/e2e/*.spec.ts, ./src/e2e/*.spec.ts

# playwright.config.ts에서 testDir: './e2e'로 설정됨
```

### 테스트 실행 명령
```bash
# 단일 테스트 실행
npx playwright test e2e/kakao-login.spec.ts --project=chromium

# 모든 인증 테스트 실행
npx playwright test e2e/ --grep="login|auth" --project=chromium

# 디버그 모드로 실행 (브라우저 표시)
npx playwright test e2e/kakao-login.spec.ts --project=chromium --debug

# HTML 리포트 생성
npx playwright test e2e/kakao-login.spec.ts --reporter=html
```

---

## 📝 테스트 코드 템플릿

### localhost 테스트 (권장)
```typescript
import { test, expect } from '@playwright/test'

test('로컬 환경 테스트 로그인', async ({ page }) => {
  // 1. 로그인 페이지 접속
  await page.goto('http://localhost:3000/auth/login')
  
  // 2. 테스트 로그인 버튼 클릭
  const testLoginBtn = page.locator('button:has-text("🧪 테스트 로그인")')
  await expect(testLoginBtn).toBeVisible()
  await testLoginBtn.click()
  
  // 3. 리다이렉트 대기
  await page.waitForURL('**/mypage/profile')
  
  // 4. 보호된 페이지 테스트
  await page.goto('http://localhost:3000/youtube-lens')
  expect(page.url()).toContain('/youtube-lens')
})
```

### 프로덕션 테스트 (실제 카카오 OAuth)
```typescript
import { test, expect } from '@playwright/test'

test('카카오 OAuth 플로우 - 실제 계정', async ({ page }) => {
  // 1. 로그인 페이지 접속
  await page.goto('https://dhacle.com/auth/login')
  
  // 2. 카카오 로그인 버튼 클릭
  const kakaoBtn = page.locator('button:has-text("카카오톡으로 3초 만에 시작하기")')
  await kakaoBtn.click()
  
  // 3. ⏳ 중요: 충분한 대기 시간 확보
  await page.waitForTimeout(60000) // 1분 대기
  
  // 4. 카카오 로그인 페이지에서 인증
  // 이메일: glemfkcl@naver.com
  // 비밀번호: dhfl9909
  
  // 5. 인증 플로우 확인
  const url = page.url()
  const isAuthFlow = url.includes('kauth.kakao.com') || 
                    url.includes('dhacle.com/dashboard') ||
                    url.includes('dhacle.com/onboarding')
  
  expect(isAuthFlow).toBeTruthy()
})
```

---

## ⚠️ 자주 발생하는 문제

### 1. "요청한 리소스를 찾을 수 없습니다" 에러
```markdown
원인: 카카오 Redirect URI 설정 불일치
해결:
1. 카카오 개발자 콘솔에서 Redirect URI 확인
2. https://dhacle.com/auth/callback 등록 확인
3. 설정 변경 후 10분 대기
```

### 2. 테스트 로그인 버튼이 안 보임
```markdown
원인: 프로덕션 환경이거나 환경변수 미설정
해결:
1. NODE_ENV=development 확인
2. NEXT_PUBLIC_DEV_MODE=true 설정
3. npm run dev로 개발 서버 재시작
```

### 3. E2E 테스트 타임아웃
```markdown
원인: 대기 시간 부족 또는 경로 오류
해결:
1. waitForTimeout 값을 60000(1분)으로 증가
2. 테스트 파일이 ./e2e/ 경로에 있는지 확인
3. --timeout 옵션으로 전체 타임아웃 증가
```

---

## 🔧 디버깅 팁

### Console 로그 확인
```typescript
// 테스트 코드에 Console 로그 캡처 추가
page.on('console', msg => {
  console.log(`${msg.type()}: ${msg.text()}`)
})

// 에러만 캡처
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.error('Console error:', msg.text())
  }
})
```

### Network 요청 추적
```typescript
// API 요청 모니터링
page.on('request', request => {
  if (request.url().includes('/api/')) {
    console.log('API Request:', request.url())
  }
})

// 응답 확인
page.on('response', response => {
  if (response.url().includes('/api/') && response.status() !== 200) {
    console.error('API Error:', response.url(), response.status())
  }
})
```

---

## 📋 체크리스트

테스트 전 확인:
- [ ] 개발 서버 실행 중 (npm run dev)
- [ ] 환경변수 설정 완료 (.env.local)
- [ ] 테스트 파일 위치 확인 (./e2e/)
- [ ] 포트 3000 사용 가능

테스트 중 확인:
- [ ] Console 에러 없음
- [ ] Network 실패 없음
- [ ] 정상적인 리다이렉트
- [ ] 세션 유지 확인

테스트 후 확인:
- [ ] 모든 테스트 통과
- [ ] 실행 로그 저장
- [ ] 문제 발견 시 문서 업데이트

---

## 🚀 빠른 시작 명령

```bash
# 1. 개발 환경 준비
npm run dev

# 2. 테스트 로그인으로 빠른 테스트
open http://localhost:3000/auth/login
# "🧪 테스트 로그인" 버튼 클릭

# 3. E2E 테스트 실행
npx playwright test e2e/auth.spec.ts --project=chromium

# 4. 결과 확인
npx playwright show-report
```

---

## 📞 추가 정보

- Supabase Dashboard: https://supabase.com/dashboard
- 카카오 개발자 콘솔: https://developers.kakao.com
- Playwright 문서: https://playwright.dev

---

## 🔥 중요 정보 요약 (빠른 참조용)

### 실제 카카오 계정
```
ID: glemfkcl@naver.com
PW: dhfl9909
```

### 로그인 버튼 찾기
```typescript
// Playwright selector
page.locator('button:has-text("카카오")')
```

### 대기 시간
```typescript
// 카카오 OAuth는 1분 정도 대기 필요
await page.waitForTimeout(60000)
```

---

*이 문서는 카카오 로그인 테스트 시 반드시 참조되어야 합니다.*
*업데이트: 2025-08-28*