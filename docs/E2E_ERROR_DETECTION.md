# 🛡️ E2E 테스트 런타임 에러 감지 시스템

*작성일: 2025-08-27*
*문제: E2E 테스트가 Next.js 런타임 에러를 감지하지 못하고 계속 진행되는 문제 해결*

---

## 🔴 문제 상황

### 기존 문제점
1. **에러 무시**: JavaScript 런타임 에러 발생 시 테스트가 계속 진행
2. **잘못된 검증**: 에러 화면에서 정상 요소를 찾으려고 시도
3. **컨텍스트 부재**: 에러 발생 위치와 원인 파악 어려움
4. **디버깅 어려움**: 테스트 실패 시 실제 원인 파악 곤란

### 발생 시나리오
```typescript
// ❌ 기존 문제 상황
test('프로필 페이지', async ({ page }) => {
  await page.goto('/profile');
  // 🔴 여기서 TypeError 발생해도...
  await page.click('button'); // 👈 계속 실행됨 (엄한짓)
  // 테스트는 "button not found"로 실패 (진짜 원인 숨김)
});
```

---

## ✅ 해결 방안

### 1. 에러 감지 시스템 구조

```
┌─────────────────────────────────────┐
│         Error Detector              │
├─────────────────────────────────────┤
│ 1. Console Error Listener           │
│    └─ console.error() 감지          │
│                                      │
│ 2. Page Error Listener              │
│    └─ JavaScript 런타임 에러        │
│                                      │
│ 3. Web Error Listener               │
│    └─ 브라우저 레벨 에러            │
│                                      │
│ 4. Next.js Error Overlay            │
│    └─ data-nextjs-dialog 감지       │
│                                      │
│ 5. Error Boundary Detection         │
│    └─ React Error Boundary 활성화   │
└─────────────────────────────────────┘
```

### 2. 구현 파일

#### `/e2e/helpers/error-detector.ts`
- 에러 감지 클래스
- 자동 스크린샷 캡처
- 컨텍스트 추적
- 즉시 테스트 실패 처리

---

## 📋 사용 방법

### 방법 1: 새 테스트 작성
```typescript
import { errorSafeTest, withErrorContext } from './helpers/error-detector';

errorSafeTest('안전한 테스트', async ({ page, errorDetector }) => {
  await withErrorContext(errorDetector, '홈페이지 접속', async () => {
    await page.goto('/');
    // 에러 발생 시 즉시 실패
  });
});
```

### 방법 2: 기존 테스트 마이그레이션
```typescript
// Before (기존)
import { test } from '@playwright/test';

test('기존 테스트', async ({ page }) => {
  await page.goto('/');
  // 에러 무시됨
});

// After (개선)
import { errorSafeTest } from './helpers/error-detector';

errorSafeTest('개선된 테스트', async ({ page, errorDetector }) => {
  await page.goto('/');
  // 에러 즉시 감지
});
```

### 방법 3: 전역 설정 (추천)
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // 전역 에러 처리 활성화
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  
  // 커스텀 리포터 추가
  reporter: [
    ['html'],
    ['./e2e/reporters/error-reporter.ts'] // 커스텀 에러 리포터
  ],
});
```

---

## 🎯 감지되는 에러 유형

### 1. Console 에러
```typescript
// 감지됨
console.error('Something went wrong');
console.error(new Error('Failed'));
```

### 2. JavaScript 런타임 에러
```typescript
// 감지됨
throw new Error('Runtime error');
undefined.property; // TypeError
JSON.parse('invalid'); // SyntaxError
```

### 3. React 에러
```typescript
// 감지됨
- React Hook 규칙 위반
- Hydration 불일치
- Component 렌더링 에러
```

### 4. Next.js 에러
```typescript
// 감지됨
- 404 페이지
- 500 에러
- API Route 실패
- SSR 에러
```

### 5. Error Boundary 활성화
```typescript
// 감지됨
<ErrorBoundary>에 의해 캐치된 에러
```

---

## 📊 에러 리포트

### 자동 생성되는 정보
```json
{
  "type": "console|pageerror|weberror|nextjs-overlay|error-boundary",
  "message": "에러 메시지",
  "context": {
    "url": "발생 페이지 URL",
    "timestamp": "2025-01-27T12:00:00Z",
    "testName": "테스트 이름",
    "action": "실행 중이던 액션"
  },
  "screenshot": "test-results/error-console-1234567890.png"
}
```

### 스크린샷 자동 저장
- 위치: `test-results/error-{type}-{timestamp}.png`
- 전체 페이지 캡처
- 에러 오버레이 포함

---

## 🚀 CI/CD 통합

### GitHub Actions 설정
```yaml
- name: Run E2E Tests with Error Detection
  run: |
    npm run test:e2e
  env:
    NODE_ENV: development # 에러 오버레이 활성화
    
- name: Upload Error Screenshots
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: error-screenshots
    path: test-results/error-*.png
```

---

## ⚠️ 주의사항

### 1. 개발 모드에서만 작동
- Next.js 에러 오버레이는 `NODE_ENV=development`에서만 표시
- Production 빌드에서는 다른 방식 필요

### 2. 예상되는 에러 처리
```typescript
// 404 같은 예상 에러는 제외
if (error.message.includes('404')) {
  return; // 무시
}
```

### 3. 성능 고려
- 모든 액션에 withErrorContext 사용 시 약간의 오버헤드
- 중요한 플로우에만 선택적 사용 권장

---

## 📈 효과

### Before (기존)
```
✓ 테스트 통과 (10s)
  └─ 실제로는 에러 발생했지만 모름
  └─ 엉뚱한 assertion 실패로 디버깅 어려움
```

### After (개선)
```
✗ 테스트 실패 (2s)
  └─ 🔴 JavaScript 런타임 에러: Cannot read property 'x' of undefined
  └─ 발생 위치: 프로필 데이터 로드
  └─ 스크린샷: error-pageerror-1234567890.png
```

---

## 🔗 관련 문서

- [Playwright 공식 문서 - Error Handling](https://playwright.dev/docs/api/class-page#page-event-pageerror)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- `/docs/PLAYWRIGHT_USAGE.md` - Playwright 사용법
- `/docs/ERROR_BOUNDARY.md` - 에러 처리 구조

---

## 📝 체크리스트

### 테스트 작성 시
- [ ] errorSafeTest 사용
- [ ] 중요 액션에 withErrorContext 적용
- [ ] 에러 시나리오 테스트 포함

### 디버깅 시
- [ ] test-results/ 폴더 확인
- [ ] 에러 타입별 스크린샷 확인
- [ ] 컨텍스트 정보로 재현 경로 파악

### CI/CD 설정 시
- [ ] NODE_ENV=development 설정
- [ ] 에러 스크린샷 아티팩트 업로드
- [ ] 에러 리포트 자동 생성

---

*이 문서는 E2E 테스트의 런타임 에러 감지 문제를 해결하기 위해 작성되었습니다.*