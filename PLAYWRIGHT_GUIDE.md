# 🎭 Playwright E2E 테스트 가이드

## 🚀 빠른 시작 (이게 진짜 Playwright 사용법)

### 1️⃣ **UI 모드 실행 (추천!)**
```bash
# 이거 실행하면 시각적으로 테스트 확인 가능
npx playwright test --ui
```
![UI 모드](https://user-images.githubusercontent.com/13063165/212745000-test-ui.png)

**UI 모드 특징:**
- 테스트 실시간 실행/정지
- 스텝별 진행 확인
- 타임라인 탐색
- DOM 스냅샷
- 네트워크 로그
- 콘솔 출력

### 2️⃣ **디버그 모드 (코드 단계별 실행)**
```bash
# 브라우저 띄워서 직접 디버깅
npx playwright test --debug

# 특정 파일만 디버그
npx playwright test e2e/auth.spec.ts --debug
```

### 3️⃣ **헤드리스 테스트 (CI/CD용)**
```bash
# 모든 테스트 실행
npx playwright test

# 특정 테스트만
npx playwright test e2e/full-journey.spec.ts

# Chrome만 사용
npx playwright test --project=chromium
```

---

## 🎬 코드젠 모드 (자동 코드 생성)

```bash
# Playwright가 사용자 행동을 보고 자동으로 테스트 코드 생성!
npx playwright codegen localhost:3000

# 특정 디바이스로 녹화
npx playwright codegen --device="iPhone 13" localhost:3000

# 로그인 상태로 시작
npx playwright codegen --save-storage=auth.json localhost:3000
```

**사용 방법:**
1. 위 명령어 실행 → 브라우저 열림
2. 사이트에서 원하는 동작 수행
3. Playwright Inspector에서 생성된 코드 확인
4. 복사해서 테스트 파일에 붙여넣기

---

## 📊 테스트 리포트

### HTML 리포트 (시각적)
```bash
# 테스트 실행 후 자동 생성
npx playwright test

# 리포트 열기
npx playwright show-report
```

### 실시간 추적 (Trace Viewer)
```bash
# 실패한 테스트 추적
npx playwright show-trace test-results/trace.zip
```

**Trace Viewer 기능:**
- 스크린샷 타임라인
- 네트워크 활동
- 콘솔 로그
- DOM 스냅샷
- 소스 코드 매핑

---

## 🧪 현재 구현된 테스트

### 1. **기본 홈페이지 테스트** (`e2e/homepage.spec.ts`)
- 메인 헤딩 표시
- 네비게이션 메뉴
- 페이지 이동
- 반응형 디자인

### 2. **인증 플로우** (`e2e/auth.spec.ts`)
- ✅ 테스트 로그인 버튼
- ✅ 로그인/로그아웃
- ✅ 세션 유지
- ✅ 보호된 라우트

### 3. **전체 사용자 여정** (`e2e/full-journey.spec.ts`)
- ✅ 10분 완전 시나리오
- ✅ 프로필 설정
- ✅ YouTube Lens 사용
- ✅ 수익 인증
- ✅ 다크 모드

---

## 🛠️ 테스트 실행 명령어 모음

```bash
# 🎯 UI 모드 (추천!)
npx playwright test --ui

# 🔍 디버그 모드
npx playwright test --debug
npx playwright test --debug e2e/auth.spec.ts

# 📱 특정 브라우저/디바이스
npx playwright test --project=chromium
npx playwright test --project="Mobile Chrome"

# 🎬 비디오 녹화
npx playwright test --video=on

# 📸 스크린샷
npx playwright test --screenshot=on

# 📊 리포트
npx playwright test --reporter=html
npx playwright show-report

# 🔄 특정 테스트만
npx playwright test -g "로그인"
npx playwright test e2e/auth.spec.ts

# ⚡ 병렬 실행 (빠름)
npx playwright test --workers=4

# 🔁 재시도
npx playwright test --retries=2

# 📝 테스트 목록만 보기
npx playwright test --list

# 🎯 특정 라인만 실행
npx playwright test e2e/auth.spec.ts:15
```

---

## 📝 테스트 작성 팁

### 1. **셀렉터 우선순위**
```typescript
// 1순위: data-testid (가장 안정적)
await page.locator('[data-testid="submit-button"]')

// 2순위: role
await page.locator('button[role="button"]')

// 3순위: 텍스트
await page.locator('button:has-text("제출")')

// 4순위: CSS
await page.locator('.submit-btn')
```

### 2. **대기 전략**
```typescript
// ✅ 좋음 - 자동 대기
await page.locator('button').click()

// ❌ 나쁨 - 고정 시간
await page.waitForTimeout(3000)

// ✅ 좋음 - 조건 대기
await page.waitForResponse(resp => resp.url().includes('/api/'))
await page.waitForLoadState('networkidle')
```

### 3. **테스트 구조**
```typescript
test.describe('기능명', () => {
  test.beforeEach(async ({ page }) => {
    // 공통 설정
  })

  test('시나리오 설명', async ({ page }) => {
    await test.step('단계 1', async () => {
      // 논리적 단계로 구분
    })
  })
})
```

---

## 🚨 자주 발생하는 문제 해결

### 1. **포트 충돌 (3000-3010)**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID [프로세스ID]
```

### 2. **테스트 로그인 안됨**
```typescript
// 개발 모드 확인
console.log(process.env.NODE_ENV) // 'development' 여야 함

// API 확인
curl -X POST http://localhost:3000/api/auth/test-login
```

### 3. **느린 테스트**
```bash
# 특정 브라우저만 사용
npx playwright test --project=chromium

# 병렬 실행
npx playwright test --workers=4
```

### 4. **CI/CD 실패**
```yaml
# GitHub Actions 예시
- name: Install Playwright
  run: npx playwright install --with-deps
  
- name: Run tests
  run: npx playwright test
  env:
    CI: true
```

---

## 📂 프로젝트 구조

```
9.Dhacle/
├── playwright.config.ts      # Playwright 설정
├── e2e/                     # 테스트 파일
│   ├── homepage.spec.ts    # 홈페이지 테스트
│   ├── auth.spec.ts         # 인증 테스트 ⭐
│   └── full-journey.spec.ts # 전체 시나리오 ⭐
├── test-results/            # 테스트 결과 (자동 생성)
│   ├── screenshots/         # 스크린샷
│   ├── videos/             # 비디오
│   └── traces/             # 추적 파일
└── playwright-report/       # HTML 리포트 (자동 생성)
```

---

## 🎯 지금 바로 해보기

```bash
# 1. UI 모드로 시작 (시각적!)
npx playwright test --ui

# 2. 특정 테스트 실행
npx playwright test e2e/auth.spec.ts --ui

# 3. 코드 자동 생성
npx playwright codegen localhost:3000

# 4. 리포트 확인
npx playwright show-report
```

---

## 💡 VS Code 확장

**Playwright Test for VSCode** 설치하면:
- 테스트 파일에서 직접 실행 버튼
- 라인별 디버깅
- 테스트 결과 인라인 표시

```
Extensions → "Playwright Test for VSCode" 설치
```

---

*이제 진짜 Playwright 제대로 사용하는 방법 알았죠? UI 모드가 핵심입니다!*