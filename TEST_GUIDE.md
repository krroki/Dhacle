# 🧪 디하클(Dhacle) 테스트 통합 가이드

*목적: E2E Workflow 관점의 완벽한 테스트 커버리지 달성*
*작성일: 2025-08-27*
*우선순위: 🔴 **최우선 - 안정적인 서비스 운영의 핵심**

---

## 🎯 E2E Workflow 테스트 철학

**"타입 에러 수정이 아닌, 실제 작동하는 서비스 구현"**

우리의 목표는 단순히 코드가 컴파일되는 것이 아니라, 사용자가 실제로 사용할 수 있는 안정적인 서비스를 만드는 것입니다.

### 테스트 우선순위
1. **사용자 시나리오** (Playwright) - 실제 사용자 경험
2. **API 안정성** (Vitest + MSW) - 데이터 흐름
3. **컴포넌트 동작** (Testing Library) - UI 상호작용
4. **유틸리티 함수** (Vitest) - 핵심 로직

---

## 🚀 빠른 시작 (AI가 즉시 사용)

```bash
# 1. 모든 테스트 실행 (E2E → 통합 → 단위)
npm run test:all

# 2. 개발 중 테스트 (Watch 모드)
npm run test:dev

# 3. E2E 시각적 테스트
npm run e2e:ui

# 4. 커버리지 리포트
npm run test:coverage:full
```

---

## 📊 4개 테스트 도구 역할 분담

### 1. **Playwright** - E2E 테스트 (사용자 시나리오)
```typescript
// e2e/user-journey.spec.ts
test('사용자 전체 여정', async ({ page }) => {
  // 1. 홈페이지 접속
  await page.goto('http://localhost:3000')
  
  // 2. 테스트 로그인
  await page.click('button:has-text("🧪 테스트 로그인")')
  
  // 3. YouTube Lens 사용
  await page.goto('/tools/youtube-lens')
  await page.fill('input[placeholder="검색"]', 'shorts')
  await page.press('input[placeholder="검색"]', 'Enter')
  
  // 4. 결과 확인
  await expect(page.locator('.search-results')).toBeVisible()
})
```

**언제 사용?**
- 로그인 → 기능 사용 → 로그아웃 플로우
- 결제 프로세스
- 페이지 간 네비게이션
- 실제 브라우저 렌더링 필요한 경우

### 2. **Vitest** - 단위 테스트 (함수/훅)
```typescript
// src/lib/api-client.test.ts
import { describe, it, expect, vi } from 'vitest'
import { apiGet } from './api-client'

describe('API Client', () => {
  it('401 에러 시 로그인 페이지로 리다이렉트', async () => {
    global.fetch = vi.fn(() => 
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'User not authenticated' })
      })
    )
    
    const result = await apiGet('/api/protected')
    expect(window.location.href).toContain('/auth/login')
  })
})
```

**언제 사용?**
- 유틸리티 함수
- React Query 훅
- API 클라이언트 로직
- 비즈니스 로직

### 3. **Testing Library** - 컴포넌트 테스트
```typescript
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

test('버튼 클릭 시 이벤트 발생', () => {
  const handleClick = vi.fn()
  render(<Button onClick={handleClick}>클릭</Button>)
  
  const button = screen.getByRole('button', { name: '클릭' })
  fireEvent.click(button)
  
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

**언제 사용?**
- React 컴포넌트 동작
- 폼 입력 검증
- 조건부 렌더링
- 접근성 테스트

### 4. **MSW** - API 모킹
```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  // YouTube API 모킹
  http.get('/api/youtube/search', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('query')
    
    if (!query) {
      return HttpResponse.json({ error: 'Query required' }, { status: 400 })
    }
    
    return HttpResponse.json({
      videos: [
        { id: '1', title: `${query} 결과 1` },
        { id: '2', title: `${query} 결과 2` }
      ]
    })
  })
]
```

**언제 사용?**
- 개발 중 백엔드 없이 작업
- 테스트 중 네트워크 격리
- 에러 상황 시뮬레이션
- 느린 네트워크 테스트

---

## 🎭 E2E Workflow 테스트 시나리오

### 시나리오 1: 신규 사용자 온보딩
```typescript
// e2e/onboarding.spec.ts
test.describe('신규 사용자 온보딩', () => {
  test('회원가입 → 프로필 설정 → 첫 기능 사용', async ({ page }) => {
    // Step 1: 회원가입
    await page.goto('/auth/signup')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'Test1234!')
    await page.click('button:has-text("가입하기")')
    
    // Step 2: 프로필 설정
    await expect(page).toHaveURL('/onboarding/profile')
    await page.fill('input[name="nickname"]', 'TestUser')
    await page.click('button:has-text("다음")')
    
    // Step 3: YouTube Lens 첫 사용
    await page.goto('/tools/youtube-lens')
    await expect(page.locator('.welcome-message')).toBeVisible()
  })
})
```

### 시나리오 2: 결제 프로세스
```typescript
// e2e/payment.spec.ts
test('강의 구매 전체 플로우', async ({ page }) => {
  // 로그인 상태 설정
  await page.goto('/auth/login')
  await page.click('button:has-text("🧪 테스트 로그인")')
  
  // 강의 선택
  await page.goto('/courses')
  await page.click('.course-card:first-child')
  
  // 결제 진행
  await page.click('button:has-text("구매하기")')
  await expect(page).toHaveURL(/\/payment/)
  
  // TossPayments 모킹 처리
  await page.evaluate(() => {
    window.TossPayments = {
      requestPayment: () => Promise.resolve({ success: true })
    }
  })
  
  await page.click('button:has-text("결제하기")')
  await expect(page).toHaveURL('/payment/success')
})
```

---

## 📁 테스트 파일 구조

```
9.Dhacle/
├── e2e/                          # Playwright E2E 테스트
│   ├── auth.spec.ts              # 인증 플로우
│   ├── full-journey.spec.ts      # 전체 사용자 시나리오
│   ├── payment.spec.ts           # 결제 프로세스
│   ├── youtube-lens.spec.ts      # YouTube Lens 기능
│   └── fixtures/
│       ├── test-users.ts         # 테스트 사용자 데이터
│       └── mock-data.ts          # 모킹 데이터
│
├── src/
│   ├── __tests__/                # 통합 테스트
│   │   ├── api/                  # API Route 테스트
│   │   └── pages/                # 페이지 컴포넌트 테스트
│   │
│   ├── components/
│   │   └── **/*.test.tsx         # 컴포넌트 단위 테스트
│   │
│   ├── hooks/
│   │   └── **/*.test.ts          # React Query 훅 테스트
│   │
│   ├── lib/
│   │   └── **/*.test.ts          # 유틸리티 함수 테스트
│   │
│   └── mocks/
│       ├── handlers.ts           # MSW 핸들러
│       ├── browser.ts            # 브라우저 모킹
│       └── server.ts             # 서버 모킹
│
├── tests/                        # Vitest 설정
│   └── setup.ts                  # 테스트 환경 설정
│
├── vitest.config.ts              # Vitest 설정
├── playwright.config.ts          # Playwright 설정
└── TEST_GUIDE.md                 # 이 문서
```

---

## 🔧 테스트 환경 설정

### 1. 개발 모드에서 MSW 활성화
```typescript
// src/app/layout.tsx
import { useEffect } from 'react'

export default function RootLayout({ children }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('@/mocks/browser').then(({ worker }) => {
        worker.start({
          onUnhandledRequest: 'bypass'
        })
      })
    }
  }, [])
  
  return children
}
```

### 2. 테스트 환경 변수
```bash
# .env.test
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=test
```

### 3. CI/CD 파이프라인 (.github/workflows/test.yml)
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run component tests
        run: npm run test:component
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npm run e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 📋 테스트 작성 체크리스트

### ✅ E2E 테스트 (Playwright)
- [ ] 사용자 시나리오 정의
- [ ] 테스트 로그인 활용
- [ ] 페이지 이동 검증
- [ ] UI 요소 상호작용
- [ ] 에러 상황 처리

### ✅ 단위 테스트 (Vitest)
- [ ] 함수 입출력 검증
- [ ] 엣지 케이스 처리
- [ ] 에러 처리 로직
- [ ] 비동기 동작 검증

### ✅ 컴포넌트 테스트 (Testing Library)
- [ ] 렌더링 검증
- [ ] 이벤트 처리
- [ ] Props 전달
- [ ] 접근성 검증

### ✅ API 모킹 (MSW)
- [ ] 성공 응답
- [ ] 에러 응답
- [ ] 로딩 상태
- [ ] 네트워크 지연

---

## 🚨 자주 발생하는 문제 해결

### 1. Playwright 포트 충돌
```bash
# Windows - 포트 정리
netstat -ano | findstr :3000
taskkill /F /PID [프로세스ID]
```

### 2. Vitest 타입 에러
```typescript
// vitest.d.ts 추가
/// <reference types="vitest" />
```

### 3. MSW 초기화 실패
```typescript
// 개발 모드만 활성화
if (process.env.NODE_ENV === 'development') {
  // MSW 시작
}
```

### 4. Testing Library 쿼리 실패
```typescript
// waitFor 사용
import { waitFor } from '@testing-library/react'
await waitFor(() => {
  expect(screen.getByText('로딩 완료')).toBeInTheDocument()
})
```

---

## 📊 테스트 커버리지 목표

| 영역 | 현재 | 목표 | 우선순위 |
|-----|------|------|---------|
| **E2E 시나리오** | 2개 | 10개 | 🔴 높음 |
| **API Routes** | 0% | 80% | 🔴 높음 |
| **React Query Hooks** | 0% | 70% | 🟠 중간 |
| **컴포넌트** | 5% | 60% | 🟠 중간 |
| **유틸리티** | 10% | 90% | 🟢 낮음 |

---

## 🎯 즉시 실행 가능한 명령어

```bash
# 1. 전체 테스트 실행
npm run test:all

# 2. 특정 도구만 실행
npm run test:unit      # Vitest만
npm run test:component # Testing Library만
npm run e2e           # Playwright만

# 3. Watch 모드
npm run test:watch    # 파일 변경 시 자동 실행

# 4. 커버리지
npm run test:coverage # 전체 커버리지 리포트

# 5. UI 모드
npm run test:ui       # Vitest UI
npm run e2e:ui       # Playwright UI

# 6. 디버깅
npm run test:debug    # Node 디버거 연결
npm run e2e:debug    # Playwright 디버그 모드
```

---

## 📚 참고 문서

- [Playwright 가이드](./PLAYWRIGHT_GUIDE.md)
- [Vitest 공식 문서](https://vitest.dev)
- [Testing Library 문서](https://testing-library.com)
- [MSW 문서](https://mswjs.io)

---

*이 가이드는 실제 작동하는 테스트 코드 작성을 위한 실무 지침입니다.*
*단순 타입 에러 수정이 아닌, E2E 관점의 완벽한 테스트를 지향합니다.*