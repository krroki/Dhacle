# 📋 E2E 테스트 실행 강제화 지시서 작성 템플릿 V7.2

> **이 문서의 목적**: 개발 지식이 부족한 1인 개발자가 Claude Code에게 명확한 작업 지시서를 전달하기 위한 템플릿입니다.
> 
> **사용 방법**: 
> 1. 사용자가 요구사항과 함께 이 템플릿을 AI에게 제공합니다
> 2. AI는 이 템플릿을 참고하여 구체적인 작업 지시서를 작성합니다
> 3. 작성된 지시서는 테스트 즉시 실행을 보장합니다

---

## 🎯 지시서 작성 시 핵심 원칙

AI가 지시서를 작성할 때 반드시 포함해야 할 원칙:

### V7.2 핵심 철학
- **"테스트 생성만 하면 실패"** - 반드시 즉시 실행하도록 명시
- **"사용자가 실제로 사용할 수 있는 안정적인 사이트가 아니면 완료가 아님"**
- **"타입 에러 0개 < 실제 작동 < 안정적 사용 가능"**

### 🧪 **중요: 개발 모드 테스트 로그인 시스템 활용** (2025-08-27 업데이트)
**✅ 실제 카카오 OAuth 없이도 E2E 테스트 완전 가능!**

프로젝트에는 실제 카카오 로그인 없이도 인증이 필요한 모든 기능을 테스트할 수 있는 시스템이 이미 구현되어 있습니다:

- **테스트 로그인**: `localhost`에서만 "🧪 테스트 로그인 (localhost 전용)" 버튼 활성화
- **완전한 인증**: 보호된 페이지, API 호출 모든 테스트 가능
- **보안**: 프로덕션에서 완전 비활성화
- **E2E 통합**: `e2e/auth.spec.ts`에서 실제 사용 중

**따라서 아래 카카오 로그인 관련 내용은 실제 운영 환경을 가정한 것이며, 개발/테스트 환경에서는 테스트 로그인 시스템을 사용하면 됩니다.**

### 지시서에 반드시 포함될 내용
1. **테스트 즉시 실행 강제화** - 생성 후 바로 실행 명령
2. **Phase 5 진입 차단** - 테스트 실행 없이 진행 불가
3. **실행 보고서 필수** - 실행 결과 증거 제공
4. **에러 감지 시스템** - Console/JS/Next.js 에러 모니터링

---

## 📝 지시서 작성 템플릿 구조

### 1️⃣ 문제/요구사항 정의 섹션

지시서 시작 부분에 포함할 내용:

```markdown
## 🎯 작업 목표
[사용자가 해결하려는 문제나 구현하려는 기능을 명확히 기술]

## 📌 현재 상황
- 에러 메시지: [정확한 에러 메시지]
- 발생 위치: [파일명:줄번호]
- 재현 방법: [단계별 재현 과정]

## 🔐 인증 및 테스트 계정 정보
- **로그인 방식**: 카카오 로그인 필수
- **테스트 계정**: [테스트용 카카오 계정 정보]
- **주요 페이지 접근**: 로그인 후에만 접근 가능
- **세션 관리**: 모든 API는 세션 체크 필수

## ✅ 성공 기준
- [ ] [구체적인 성공 조건 1]
- [ ] [구체적인 성공 조건 2]
- [ ] 테스트 작성 및 실행 통과
- [ ] Console 에러 0개
```

---

### 2️⃣ 절대 규칙 섹션

지시서에 반드시 포함할 금지사항:

```markdown
## 🚨 절대 규칙 - 임시방편 = 프로젝트 파괴

| 발견 시 | ❌ 절대 금지 | ✅ 유일한 해결책 |
|----------|--------------|--------------|
| 타입 불명확 | any, unknown 사용 | 정확한 타입 확인 후 정의 |
| DB 테이블 없음 | 주석 처리, TODO | CREATE TABLE 즉시 실행 |
| API 미구현 | null/빈 배열 반환 | 완전한 구현 후 진행 |
| 함수 미완성 | TODO, 빈 함수 | 완전히 구현하거나 삭제 |
| 에러 발생 | try-catch로 숨기기 | 근본 원인 해결 |
| 테스트 미실행 | "작성 완료"로 끝내기 | 즉시 실행 및 통과 확인 |
```

---

### 3️⃣ 작업 준비 섹션

지시서에 포함할 사전 준비 사항:

```markdown
## 📁 Task 폴더 생성
\`\`\`bash
mkdir -p tasks/$(date +%Y%m%d)_[작업명]
cd tasks/$(date +%Y%m%d)_[작업명]
\`\`\`

## 📋 Task 파일 구조
tasks/[날짜]_[작업명]/
├── instruction.md      # 이 지시서
├── implementation.md   # 구현 내역
├── test-results.md     # 테스트 실행 결과
└── issues.md          # 발견된 문제

## ⚠️ 환경 준비
\`\`\`bash
# 1. 포트 정리
netstat -ano | findstr :300
taskkill /F /PID [프로세스ID]

# 2. 현재 상태 확인
npm run verify:parallel
npm run types:check 2>&1 | head -20
\`\`\`
```

---

### 4️⃣ Phase별 작업 흐름 섹션

지시서에 포함할 단계별 작업 가이드:

#### Phase 0: Context 파악
```markdown
## 🔍 Phase 0: Context 파악

### 필수 확인 사항
\`\`\`bash
# 1. 프로젝트 구조 확인
ls -la src/app/api/
ls -la src/components/features/

# 2. 프로젝트 규약 확인
cat src/types/CLAUDE.md
cat src/lib/supabase/CLAUDE.md
cat src/app/api/CLAUDE.md

# 3. 기존 패턴 분석
cat src/app/api/user/profile/route.ts | head -30

# 4. 연관 파일 찾기
find src -name "*[관련키워드]*" -type f
\`\`\`

### Context 체크리스트
- [ ] 프로젝트 규약 이해
- [ ] 기존 패턴 파악
- [ ] 연관 파일 목록 작성
- [ ] DB 스키마 확인
```

### 🚨 안정성 체크포인트 #1
```markdown
\`\`\`bash
# 임시방편 감지
grep -r "any" src/ --include="*.ts" --include="*.tsx" | grep -v "// @ts-" | head -10
grep -r "TODO" src/ | head -10
grep -r "console.log" src/ | grep -v "test" | head -10

# ❌ 발견 시 → Phase 0으로 돌아가서 Context 재확인
# ✅ 없으면 → Phase 1 진행
\`\`\`
```

#### Phase 1-3: 구현
```markdown
## 📂 Phase 1: 현재 상태 파악

### 문제 진단
\`\`\`bash
npm run dev
# 브라우저 F12 Console 확인
# Network 탭 실패 요청 확인
\`\`\`

### 인증 상태 확인
\`\`\`markdown
1. 카카오 로그인 버튼 정상 작동 확인
2. 테스트 계정으로 로그인 시도
3. 세션 생성 확인 (localStorage, cookies)
4. 보호된 페이지 접근 테스트
   - /mypage (로그인 필수)
   - /admin (관리자 권한 필수)
   - /youtube-lens (로그인 필수)
\`\`\`

### 문제 분류
- [ ] Frontend 렌더링 문제
- [ ] API 응답 문제 (401 Unauthorized 확인)
- [ ] DB 연결 문제
- [ ] 인증/세션 문제 (카카오 OAuth 포함)

## 📂 Phase 2: 문제 해결

### 사용자 플로우 역추적
버튼 클릭 → onClick → API 호출 → DB 쿼리 → 응답 → UI 업데이트

### 수정 사항
- Frontend: src/components/xxx.tsx
- API Route: src/app/api/xxx/route.ts
- Database: CREATE TABLE, RLS 정책
```

### 🚨 안정성 체크포인트 #2
```markdown
\`\`\`bash
# 수정 후 즉시 검증
npm run types:check 2>&1 | grep "error TS"

# 실제 작동 테스트
# 1. 서버 재시작 (중요!)
# 2. 브라우저 새로고침
# 3. 기능 재테스트
# 4. Console 에러 0개 확인

# ❌ 에러 있음 → 수정 재시도
# ✅ 정상 작동 → Phase 3 진행
\`\`\`
```

#### Phase 3: 안정성 확보
```markdown
## 📂 Phase 3: 안정성 확보

### 체크리스트
- [ ] 엣지 케이스 처리
- [ ] 데이터 무결성
- [ ] 보안 점검
- [ ] 런타임 에러 방어
```

### 🚨 안정성 체크포인트 #3
```markdown
\`\`\`bash
# 전체 플로우 테스트
echo "=== E2E 전체 플로우 검증 ==="
echo "1. 로그아웃 상태에서 시작"
echo "2. 카카오 로그인 (테스트 계정) → 세션 생성 확인"
echo "3. 보호된 페이지 접근 (/mypage, /youtube-lens)"
echo "4. 기능 사용 → 데이터 저장"
echo "5. 새로고침 → 데이터 유지 확인"
echo "6. 다른 브라우저 → 동일 계정 → 데이터 동일"
echo "7. 로그아웃 → 재로그인 → 데이터 유지"

# 모두 통과해야 Phase 4 진행
\`\`\`
```

---

### 5️⃣ 테스트 실행 강제화 섹션 (가장 중요!)

지시서에 반드시 강조해서 포함할 내용:

```markdown
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

### 🔴 필수 실행 명령어
\`\`\`bash
# 반드시 실행할 것!
echo "=== 테스트 실행 시작 ==="

# 1. 컴포넌트 테스트
npm run test:component [Component]

# 2. API 테스트
npm run test:api [endpoint]

# 3. E2E 테스트 (가장 중요!)
# ⚠️ 주의: 경로는 ./e2e/로 시작해야 함!
npx playwright test e2e/[feature].spec.ts --project=chromium

# 4. 에러 감지 테스트
npx playwright test e2e/error-safe-[feature].spec.ts

echo "=== 모든 테스트 통과 확인 완료 ==="
\`\`\`

### ⚠️ 경로 주의사항
\`\`\`markdown
Playwright 설정: testDir: './e2e'
따라서 테스트 실행 시:
- 올바른 명령: npx playwright test e2e/test.spec.ts ✅
- 테스트 파일은 반드시 ./e2e/ 폴더에 저장 ✅
- 잘못된 경로: tests/e2e/, src/e2e/ 등 ❌
\`\`\`

### 🚫 Phase 5 진입 차단 게이트
다음 중 하나라도 해당하면 진행 불가:
- [ ] 테스트 파일만 생성하고 실행 안 함
- [ ] 테스트 실행했지만 실패 무시
- [ ] 실행 로그 없이 "통과했다"고 보고
```

---

### 6️⃣ 테스트 코드 예시 섹션

지시서에 포함할 테스트 코드 템플릿:

```markdown
## 📝 테스트 코드 템플릿

### 컴포넌트 테스트
\`\`\`typescript
// src/components/features/[feature]/[Component].test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { [Component] } from './[Component]'

describe('[Component] E2E 동작', () => {
  it('사용자가 실제로 사용할 수 있다', async () => {
    render(<[Component] />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    await waitFor(() => {
      expect(screen.getByText('성공')).toBeInTheDocument()
    })
    expect(console.error).not.toHaveBeenCalled()
  })
})
\`\`\`

### ⚠️ 중요: E2E 테스트 파일 경로
\`\`\`markdown
✅ 올바른 경로: ./e2e/[feature].spec.ts
Playwright 설정: testDir: './e2e'
따라서 테스트 파일은 반드시 ./e2e/ 폴더에 저장해야 함!

❌ 잘못된 경로: tests/e2e/, src/e2e/, 기타 다른 경로
\`\`\`

### E2E 테스트 (카카오 로그인 포함)
\`\`\`typescript
// ./e2e/[feature].spec.ts  ← 반드시 이 경로!
import { test, expect } from '@playwright/test'

// 테스트 계정 정보 (환경변수로 관리 권장)
const TEST_ACCOUNT = {
  email: process.env.TEST_KAKAO_EMAIL || '[테스트 카카오 이메일]',
  password: process.env.TEST_KAKAO_PASSWORD || '[테스트 카카오 비밀번호]'
}

test.describe('인증이 필요한 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 매 테스트 전 로그인
    await page.goto('/')
    
    // 카카오 로그인 버튼 클릭
    await page.click('button[aria-label="카카오 로그인"]')
    
    // 카카오 OAuth 팝업 처리
    const kakaoPopup = await page.waitForEvent('popup')
    await kakaoPopup.fill('input[name="email"]', TEST_ACCOUNT.email)
    await kakaoPopup.fill('input[name="password"]', TEST_ACCOUNT.password)
    await kakaoPopup.click('button[type="submit"]')
    
    // 로그인 완료 및 리다이렉트 대기
    await page.waitForURL('/dashboard')
    
    // 세션 확인
    const cookies = await page.context().cookies()
    expect(cookies.some(c => c.name === 'session')).toBeTruthy()
  })

  test('[기능명] - 로그인 필수 기능', async ({ page }) => {
    // 1. 보호된 페이지 접근 테스트
    await page.goto('/mypage')
    await expect(page.locator('h1')).toContainText('마이페이지')
    
    // 2. YouTube Lens 페이지 (로그인 필수)
    await page.goto('/youtube-lens')
    expect(page.url()).toContain('/youtube-lens') // 리다이렉트 안 됨
    
    // 3. API 호출 (세션 체크)
    const response = await page.request.get('/api/protected-endpoint')
    expect(response.status()).toBe(200) // 401이 아님
    
    // 4. 기능 테스트
    await page.click('[data-testid="feature-button"]')
    await expect(page.locator('.success-message')).toBeVisible()
    
    // 5. 데이터 영속성 확인
    await page.reload()
    await expect(page.locator('.saved-data')).toBeVisible()
  })

  test.afterEach(async ({ page }) => {
    // 테스트 후 로그아웃
    await page.click('button[aria-label="로그아웃"]')
  })
})
\`\`\`

### 에러 감지 헬퍼
\`\`\`typescript
// ./e2e/helpers/error-detector.ts  ← 이 경로도 중요!
export class ErrorDetector {
  async attachToPage(page: Page, testName: string) {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        throw new Error(\`🔴 Console 에러: \${msg.text()}\`)
      }
    })
    
    page.on('pageerror', exception => {
      throw new Error(\`🔴 JS 런타임 에러: \${exception.message}\`)
    })
    
    page.on('load', async () => {
      const errorOverlay = await page.locator('[data-nextjs-dialog]').count()
      if (errorOverlay > 0) {
        const errorText = await page.locator('[data-nextjs-dialog]').textContent()
        throw new Error(\`🔴 Next.js 에러: \${errorText}\`)
      }
    })
  }
}
\`\`\`
```

---

### 7️⃣ 실행 보고서 템플릿

지시서에 포함할 보고서 양식:

```markdown
## 📊 테스트 실행 완료 보고서

### 필수 작성 항목
\`\`\`markdown
## 테스트 실행 결과

### 📋 테스트 파일
- 컴포넌트: [파일경로]
- API: [파일경로]
- E2E: ./e2e/[feature].spec.ts (⚠️ 반드시 ./e2e/ 경로!)

### 🚀 실행 결과
#### 컴포넌트 테스트
- 명령: npm run test:component [name]
- 결과: ✅ Pass (3 tests)
- 소요시간: 2.1s

#### API 테스트
- 명령: npm run test:api [name]
- 결과: ✅ Pass (5 tests)
- 소요시간: 1.8s

#### E2E 테스트
- 명령: npx playwright test [file]
- 결과: ✅ Pass (2 tests)
- Console 에러: 0개

### 📊 최종 확인
- [x] 모든 테스트 통과
- [x] Console 에러 없음
- [x] 실행 로그 제공
\`\`\`
```

---

### 8️⃣ 최종 검증 체크리스트

지시서 마지막에 포함할 완료 기준:

```markdown
## ✅ Phase 5: 최종 검증

### 작업 완료 조건
- [ ] 사용자가 실제로 기능을 사용할 수 있음
- [ ] 새로고침 후에도 데이터 유지
- [ ] 다른 브라우저에서도 동일하게 작동
- [ ] Console 에러 0개
- [ ] Network 실패 요청 0개
- [ ] 모든 테스트 실행 및 통과
- [ ] 실행 로그와 증거 제공
- [ ] 프로젝트 규약 준수

### 최종 확인 명령어
\`\`\`bash
# 검증 실행
npm run verify:parallel
npm run types:check
npm run security:test

# Git 상태
git status
git diff --stat
\`\`\`
```

---

### 9️⃣ 문제 발생 시 대응 섹션

지시서에 포함할 문제 해결 가이드:

```markdown
## 🔄 문제 발생 시 대응

### 에러 타입별 즉시 대응

#### Console 에러
1. 정확한 에러 메시지 복사
2. 관련 파일 즉시 확인
3. 스택 트레이스 따라가기
4. 근본 원인 수정 (임시방편 금지)

#### API 에러
1. Network 탭에서 실패 요청 확인
2. Request/Response 상세 확인
3. 서버 로그 확인
4. DB 쿼리 직접 테스트

#### 타입 에러
1. 정확한 타입 확인 (any 금지)
2. @/types에서 기존 타입 찾기
3. 없으면 새로 정의
4. 관련 파일 모두 업데이트
```

---

### 🔟 작업 종료 시 필수 섹션

지시서 마지막에 포함할 종료 체크리스트:

```markdown
## 🚨 작업 종료 시 필수

\`\`\`bash
# 1. 포트 정리
Ctrl + C  # 서버 종료
netstat -ano | findstr :300
taskkill /F /PID [모든 PID]

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
echo "- 해당 폴더의 CLAUDE.md (패턴 변경?)"
\`\`\`
```

---

## 🎨 지시서 작성 예시

### 예시 1: 버그 수정 지시서

사용자 요청: "로그인 버튼이 작동하지 않아요"

AI가 작성할 지시서:
```markdown
# 로그인 버튼 버그 수정 지시서

## 🎯 작업 목표
로그인 버튼 클릭 시 아무 반응이 없는 문제 해결

## 📌 현재 상황
- 문제: 로그인 버튼 클릭해도 반응 없음
- 위치: /login 페이지
- Console 에러: "Cannot read property 'submit' of undefined"

## Phase 1: 문제 진단
[템플릿의 Phase 1 내용 적용]

## Phase 2: 수정
- src/components/auth/LoginButton.tsx 수정
- onClick 핸들러 확인 및 수정

## Phase 4: 테스트 작성 및 즉시 실행
[템플릿의 Phase 4 내용 필수 포함]
- 테스트 파일: ./e2e/login-button.spec.ts (⚠️ ./e2e/ 경로 필수!)
- 반드시 npx playwright test e2e/login-button.spec.ts 실행
- 실행 로그 첨부 필수

[이하 템플릿 구조 따름]
```

### 예시 2: 기능 구현 지시서

사용자 요청: "YouTube 영상 검색 기능을 추가해주세요"

AI가 작성할 지시서:
```markdown
# YouTube 검색 기능 구현 지시서

## 🎯 작업 목표
YouTube API를 활용한 영상 검색 기능 구현

## ✅ 성공 기준
- [ ] 검색어 입력 시 YouTube 영상 목록 표시
- [ ] 각 영상 썸네일, 제목, 채널명 표시
- [ ] 영상 클릭 시 상세 페이지 이동
- [ ] 모든 테스트 작성 및 실행 통과

## Phase 0: Context 파악
[템플릿의 Phase 0 내용 적용]
- YouTube API 키 확인
- 기존 API 라우트 패턴 분석

## Phase 1-3: 구현
[템플릿의 Phase 1-3 적용]

## Phase 4: 테스트 작성 및 즉시 실행 (필수!)
### ⚠️ 중요: 테스트 생성 후 반드시 실행
- ./e2e/youtube-search.spec.ts 생성 (⚠️ ./e2e/ 경로!)
- npx playwright test e2e/youtube-search.spec.ts 즉시 실행
- 실패 시 수정 → 재실행 → 통과까지 반복
- 실행 로그 스크린샷 첨부

[이하 템플릿 구조 따름]
```

---

## 📚 템플릿 사용 가이드

### 사용자가 이 템플릿을 사용하는 방법:

1. **요구사항과 함께 제공**
   ```
   "로그인 에러 수정해줘 @INSTRUCTION_TEMPLATE_E2E_v3.md"
   ```

2. **AI의 응답**
   - 이 템플릿을 기반으로 구체적인 지시서 작성
   - 테스트 즉시 실행 강제화 포함
   - 실행 결과 보고서 포함

3. **작업 완료 확인**
   - 테스트 실행 로그 확인
   - Console 에러 0개 확인
   - 실제 기능 작동 확인

### 중요 포인트:
- **테스트 실행은 선택이 아닌 필수**
- **실행 로그 없이는 작업 미완료**
- **Console 에러 1개라도 있으면 실패**

---

## 🔧 부록: 자동 실행 도구 (선택사항)

테스트 자동 실행을 위한 보조 스크립트:

```bash
# run-test-immediately.sh
#!/bin/bash
TEST_FILE=$1
echo "🔴 테스트 파일 생성 감지: $TEST_FILE"
echo "⚡ 3초 후 자동 실행됩니다..."
sleep 3
echo "🚀 테스트 실행 시작"
npx playwright test $TEST_FILE --project=chromium
RESULT=$?
if [ $RESULT -ne 0 ]; then
  echo "❌ 테스트 실패! 수정 필요"
  exit 1
else
  echo "✅ 테스트 통과!"
fi
```

---

## 📊 V7.2 핵심 메시지

이 템플릿으로 작성된 모든 지시서는:

1. **테스트 즉시 실행을 강제합니다**
2. **실행 없이는 작업 완료가 아닙니다**
3. **Console 에러 0개를 보장합니다**
4. **실제 사용 가능한 코드를 만듭니다**

---

*이 템플릿 버전: V7.2 (2025-08-27)*
*목적: E2E 테스트 실행 강제화를 통한 안정적 코드 보장*