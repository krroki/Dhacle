# 🎯 E2E 실행 지시서 템플릿 V6 - 실제 작동 강제 + 테스트 보호

**핵심**: "사용자가 클릭했을 때 작동하지 않으면 완료가 아니다"
**V6 확장**: "작동하는 코드는 테스트로 보호한다"

---

## ⚠️ 필수 준비사항

```markdown
## 시작 전 체크리스트
1. **포트 정리**: 3000-3010 포트 확인 및 정리
   - Windows: netstat -ano | findstr :300
   - 프로세스 종료: taskkill /F /PID [ID]

2. **로그인 준비**: 
   - 개발 모드: "🧪 테스트 로그인" 버튼 사용
   - 프로덕션: 실제 OAuth 로그인

3. **종료 규칙**: 
   - 테스트 끝나면 반드시 Ctrl+C
   - 포트 재확인 및 정리
```

---

## 📝 지시서 구조

```markdown
/sc:implement --e2e --validate --evidence
"[기능명] - 사용자 시나리오 구현"

# [작업 제목] 

## 🎬 사용자 시나리오 (필수)
1. 사용자가 localhost:3000 접속
2. [테스트 로그인 버튼] 클릭 (개발 모드)
3. [예상 동작] 확인
4. 실패 시: [에러 화면/메시지]
```

---

## 🔍 Phase 0: 현재 상태 파악

```bash
# 1. 포트 정리 (필수!)
netstat -ano | findstr :3000
taskkill /F /PID [프로세스ID]

# 2. 서버 실행
npm run dev

# 3. 브라우저 열기
localhost:3000

# 4. 테스트 로그인
- "🧪 테스트 로그인" 버튼 찾기
- 클릭 → 자동 로그인

# 5. 실제로 클릭해보기
- 어떤 버튼이 작동하는가?
- 어떤 기능이 안 되는가?
- Console 에러는 무엇인가?
```

---

## 📂 Phase 실행 (기능별)

### Phase 1: 기능 매핑
```markdown
## 작업할 기능
- [ ] 로그인 → 실제 작동?
- [ ] 회원가입 → 실제 작동?
- [ ] 프로필 수정 → 실제 작동?
- [ ] 결제 → 실제 작동?

## 우선순위
1. 핵심 기능부터 (로그인/회원가입)
2. 주요 비즈니스 로직
3. 부가 기능
```

### Phase 2: 기능별 E2E 구현
```markdown
## 기능: [로그인]

### 1. 현재 상태
- localhost:3000/login 접속
- 이메일/패스워드 입력
- 로그인 버튼 클릭
- 결과: [성공/실패/에러]

### 2. 문제 파악
```bash
# Console 확인
# Network 탭 확인
# 실제 에러 메시지
```

### 3. 수정
- API Route 수정
- UI 컴포넌트 수정
- DB 연결 확인

### 4. 검증
- 다시 로그인 시도
- 성공할 때까지 반복
```

---

## ⚡ 실제 작동 검증 체크리스트

```markdown
## 필수 확인 사항
### Frontend
- [ ] 페이지 로드 성공
- [ ] 버튼 클릭 가능
- [ ] 폼 제출 작동
- [ ] 에러 메시지 표시
- [ ] 로딩 상태 표시

### API
- [ ] 200/201 응답
- [ ] 에러 시 적절한 메시지
- [ ] 세션/쿠키 생성
- [ ] DB 데이터 저장

### Database
- [ ] 테이블 존재
- [ ] 데이터 저장됨
- [ ] 관계 정상 작동

### User Flow
- [ ] 전체 플로우 완주 가능
- [ ] 새로고침 후에도 유지
- [ ] 로그아웃/재로그인 가능
```

---

## 🚫 절대 규칙

```markdown
## ⛔ 금지 사항
1. 타입 에러만 고치고 "완료" → ❌
2. 컴파일 성공 = 완료 → ❌
3. TODO 주석 남기기 → ❌
4. 실제 테스트 없이 커밋 → ❌

## ✅ 필수 사항
1. 실제 브라우저에서 테스트
2. 사용자 시나리오 완주
3. Console 에러 0개
4. Network 정상 응답
```

---

## 📊 진짜 성공 기준

```markdown
## 완료의 정의

### ❌ 이것은 완료가 아님
- TypeScript 에러 0개
- 빌드 성공
- 테스트 통과

### ✅ 이것이 진짜 완료
- 사용자가 실제로 로그인 가능
- 결제가 실제로 처리됨
- 데이터가 실제로 저장됨
- 새로고침 후에도 작동
```

---

## 🔄 문제 해결 프로세스

```markdown
## 에러 발생 시

1. **증상 수집**
   - Console 에러 전체
   - Network 실패 내용
   - 화면 상태

2. **원인 분석**
   - DB 테이블 있나?
   - API Route 구현됐나?
   - 환경변수 설정됐나?

3. **수정 & 재시도**
   - 근본 원인 해결
   - 다시 테스트
   - 작동할 때까지 반복
```

---

## 📝 사용 예시

```markdown
/sc:implement --e2e --validate
"로그인 기능 테스트 및 수정"

# 로그인 E2E 구현

## 🎬 사용자 시나리오
1. localhost:3000/auth/login 접속
2. "🧪 테스트 로그인" 버튼 클릭 (개발 모드)
3. 자동 로그인 처리
4. /mypage/profile 리다이렉트
5. 프로필 정보 표시

## 현재 문제
- 테스트 로그인 버튼 없음
- 카카오 로그인만 있어서 localhost 테스트 불가

## 해결
1. 테스트 로그인 버튼 추가 (개발 모드)
2. /api/auth/test-login 라우트 생성
3. 실제 테스트 후 확인
```

---

## 🎯 범용 에러 패턴 (예시일 뿐)

```markdown
## 일반적인 문제들
- DB 테이블 없음 → CREATE TABLE
- API Route 미구현 → 완전 구현
- 환경변수 누락 → .env.local 확인
- 권한 에러 → RLS 정책 확인
- CORS 에러 → API 설정 확인
```

---

## 🚨 작업 종료 시 필수

```markdown
## 반드시 실행할 것
1. **서버 종료**: Ctrl + C
2. **포트 확인**: netstat -ano | findstr :300
3. **프로세스 정리**: taskkill /F /PID [ID]
4. **3000-3010 모든 포트 확인**

⚠️ 이거 안하면 다음에 포트 충돌로 개고생
```

---

# 🆕 V6 추가: 테스트 작성 가이드

*여기서부터는 V6에서 추가된 테스트 관련 내용입니다. 실제 작동 확인이 우선이고, 그 다음에 테스트를 추가합니다.*

---

## 🧪 테스트 도구 통합 (V6 신규)

### 4개 테스트 도구 역할 분담
| 도구 | 용도 | 언제 사용 | 명령어 |
|------|------|----------|---------|
| **Playwright** | E2E 사용자 시나리오 | 전체 플로우 검증 | `npm run e2e:ui` |
| **Vitest** | 단위/통합 테스트 | 함수/훅 로직 검증 | `npm run test:watch` |
| **Testing Library** | 컴포넌트 테스트 | UI 상호작용 검증 | `npm run test:component` |
| **MSW** | API 모킹 | 네트워크 격리 테스트 | 자동 활성화 |

---

## 📋 테스트 작성 워크플로우

### 🔴 중요: 실제 작동 확인 후 반드시 테스트 추가

```markdown
## 순서 (필수)
1. **먼저**: 기능이 실제로 작동하는지 확인 (위의 E2E 프로세스)
2. **반드시**: 모든 기능에 대한 테스트 작성 (작동 여부 무관)
3. **검증**: 테스트가 통과하는지 확인
4. **미완료 조건**: 테스트 없으면 작업 완료 아님
```

### 기능별 테스트 작성 의무

```markdown
## 새 기능 개발 시
✅ 실제 작동 확인 완료
✅ 사용자 시나리오 성공
❌ 테스트 없으면 작업 미완료
→ 반드시 테스트 작성 후 완료 선언

## 버그 수정 시  
✅ 버그 재현 및 수정 확인
✅ 실제로 해결됨 확인
❌ 테스트 없으면 수정 미완료
→ 회귀 방지 테스트 필수

## 리팩토링 시
✅ 현재 기능 정상 작동 확인
❌ 테스트 없으면 리팩토링 금지
→ 테스트 작성 → 리팩토링 → 테스트 통과
```

---

## 🎯 테스트 코드 템플릿

### React Query 훅 테스트
```typescript
// src/hooks/queries/useYouTubeSearch.test.ts
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useYouTubeSearch } from './useYouTubeSearch'

describe('useYouTubeSearch', () => {
  it('검색 결과를 반환한다', async () => {
    const { result } = renderHook(() => 
      useYouTubeSearch({ query: 'shorts' })
    )
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })
  })
})
```

### 컴포넌트 테스트
```typescript
// src/components/features/youtube-lens/SearchBar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from './SearchBar'

test('검색어 입력 및 제출', () => {
  render(<SearchBar />)
  
  const input = screen.getByPlaceholderText('YouTube 쇼츠 검색...')
  fireEvent.change(input, { target: { value: 'shorts' } })
  fireEvent.submit(input)
  
  expect(screen.getByText('검색 중...')).toBeInTheDocument()
})
```

### E2E 시나리오 테스트
```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test('로그인 플로우', async ({ page }) => {
  await page.goto('/auth/login')
  await page.click('button:has-text("🧪 테스트 로그인")')
  await expect(page).toHaveURL('/mypage/profile')
})
```

---

## 📊 테스트 커버리지 목표

### 단계별 목표 (실제 작동 후)
```markdown
## Phase 1 - 핵심 기능 테스트
- 로그인/로그아웃 E2E
- React Query 주요 훅 5개
- 핵심 컴포넌트 3개

## Phase 2 - 비즈니스 로직 테스트
- YouTube Lens 전체 플로우
- 결제 프로세스
- 사용자 프로필 관리

## Phase 3 - 전체 커버리지
- 단위 테스트 70%
- 통합 테스트 60%
- E2E 시나리오 15개
```

---

## 🎯 테스트 실행 명령어

### 개발 중 사용
```bash
# 실시간 테스트 (Watch 모드)
npm run test:watch      # Vitest
npm run test:dev       # Vitest UI

# E2E 시각적 테스트
npm run e2e:ui        # Playwright UI 모드
```

### 전체 테스트
```bash
# 모든 테스트 실행
npm run test:all

# 커버리지 포함
npm run test:coverage:full
```

---

## 🚨 테스트 관련 문제 해결

```markdown
## Playwright 포트 충돌
→ 위의 포트 정리 프로세스 실행

## Vitest 타입 에러
→ vitest.d.ts 파일 추가

## MSW 초기화 실패
→ 개발 모드에서만 활성화 확인

## Testing Library 쿼리 실패
→ waitFor 사용으로 비동기 처리
```

---

## 📌 V6 핵심 원칙

1. **실제 작동이 최우선** - 작동 확인 후 반드시 테스트 추가
2. **모든 코드는 테스트 필수** - 작동하든 안 하든 테스트 작성 의무
3. **테스트 없으면 작업 미완료** - 기능 구현 = 코드 + 테스트
4. **테스트도 실제로 실행** - 작성한 테스트는 반드시 통과시킬 것

---

*V6: E2E 실제 작동 + 테스트 필수 | 작동 확인 → 테스트 작성 → 완료*
*중요: 포트 정리 필수! 테스트 로그인 사용! 테스트 없으면 작업 미완료!*