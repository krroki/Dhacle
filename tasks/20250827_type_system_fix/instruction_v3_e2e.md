/sc:troubleshoot --seq --validate --think --c7 --e2e
"타입 시스템 전면 복구 - E2E 검증 필수 v3"

# 🚨 타입 시스템 전면 복구 지시서 v3 (E2E 검증 통합)

**핵심**: "타입 에러 0개 ≠ 완료 | 실제 작동 + 테스트 = 완료"
**V3 원칙**: "사용자가 클릭했을 때 작동하지 않으면 타입 수정도 의미 없다"

---

## ⚠️ 필수 준비사항

```markdown
## 시작 전 체크리스트
1. **포트 정리**: 3000-3010 포트 확인 및 정리
   - Windows: netstat -ano | findstr :300
   - 프로세스 종료: taskkill /F /PID [ID]

2. **개발 환경 준비**: 
   - npm run dev 실행 가능 상태 확인
   - localhost:3000 접속 확인
   
3. **테스트 로그인 준비**:
   - 개발 모드: "🧪 테스트 로그인" 버튼 확인
   - 테스트 계정 정보 확인

4. **종료 규칙**: 
   - 작업 끝나면 반드시 Ctrl+C
   - 포트 재확인 및 정리
```

---

## 🎬 사용자 시나리오 (필수 검증)

```markdown
## 타입 수정 후 반드시 확인할 기능들
1. localhost:3000 접속 → 페이지 정상 로드
2. 테스트 로그인 → 성공적으로 로그인
3. /mypage/profile → 프로필 정보 정상 표시
4. YouTube Lens → 알림 규칙 생성 가능
5. 관리자 카페 인증 → API 정상 응답

## 실패 기준
- Console 에러 1개 이상 = 실패
- 기능 작동 안함 = 실패
- API 500 에러 = 실패
```

---

## 📋 작업 관련 경로

```markdown
## 수정 대상 파일
- 타입 정의: src/types/index.ts
- 생성된 타입: src/types/database.generated.ts (수정 금지!)
- AlertRules: src/components/features/tools/youtube-lens/AlertRules.tsx
- 카페 인증 API: src/app/api/admin/verify-cafe/route.ts
- 네이버 카페 API: src/app/api/user/naver-cafe/route.ts
- 프로필 페이지: src/app/mypage/profile/page.tsx
```

---

## 🔍 Phase 0: 현재 작동 상태 파악 (필수!)

```bash
# 1. 포트 정리
netstat -ano | findstr :3000
taskkill /F /PID [프로세스ID]

# 2. 개발 서버 실행
npm run dev

# 3. TypeScript 에러 확인
npm run types:check
# 결과: 15개 에러 확인

# 4. 브라우저에서 실제 테스트
- localhost:3000 접속
- 각 페이지 Console 에러 확인
- 실제 기능 테스트 (로그인, 프로필, YouTube Lens)

# 5. 현재 작동 상태 기록
## 작동하는 기능
- [ ] 메인 페이지 로드
- [ ] 로그인 기능
- [ ] 프로필 조회
- [ ] YouTube Lens 조회
- [ ] 알림 규칙 생성

## 작동 안하는 기능 (타입 에러로 인한)
- [ ] 프로필 페이지 naver_cafe 필드
- [ ] 카페 인증 API
- [ ] AlertRules 컴포넌트
```

---

## 📂 Phase별 수정 및 검증

### Phase 1: Tables 제네릭 타입 대응 + 실제 테스트 (25분)

#### 1.1 타입 시스템 수정
```typescript
// src/types/index.ts
import type { Database, Tables, TablesInsert, TablesUpdate } from './database.generated';

// 기존 타입 정의 유지
export type DBUser = Tables<'users'>;
export type DBProfile = Tables<'profiles'>; // View
// ... 나머지 타입들
```

#### 1.2 즉시 브라우저 테스트
```bash
# 수정 후 즉시 확인
npm run dev

# 브라우저 테스트
1. localhost:3000 접속
2. Console 에러 확인
3. 메인 페이지 정상 로드 확인

## 체크포인트
- [ ] TypeScript 에러 감소 (15 → ?)
- [ ] Console 에러 0개
- [ ] 페이지 정상 로드
```

---

### Phase 2: profiles View vs users Table 해결 + 기능 테스트 (30분)

#### 2.1 API Route 수정
```typescript
// src/app/api/admin/verify-cafe/route.ts
// profiles가 아닌 users 테이블 직접 조회
const { data: user } = await supabase
  .from('users')
  .select('id, email, naver_cafe_verified, naver_cafe_nickname, naver_cafe_member_url')
  .eq('id', userId)
  .single();
```

#### 2.2 실제 API 테스트
```bash
# API 테스트 (브라우저 또는 Postman)
1. 관리자 로그인
2. 카페 인증 API 호출
3. Response 확인

## 체크포인트
- [ ] API 200 응답
- [ ] 데이터 정상 반환
- [ ] Console 에러 없음
```

#### 2.3 프로필 페이지 수정 및 테스트
```typescript
// src/app/mypage/profile/page.tsx
// View 필드명 사용 또는 users 테이블 추가 조회
profile.cafe_member_url // View 필드 사용
```

```bash
# 프로필 페이지 테스트
1. /mypage/profile 접속
2. 카페 회원 URL 표시 확인
3. 모든 정보 정상 표시

## 체크포인트  
- [ ] 프로필 정보 모두 표시
- [ ] 카페 URL 정상 표시
- [ ] Console 에러 0개
```

---

### Phase 3: AlertRules 타입 통일 + YouTube Lens 테스트 (25분)

#### 3.1 컴포넌트 타입 수정
```typescript
// src/components/features/tools/youtube-lens/AlertRules.tsx
import type { Tables } from '@/types';

// 실제 테이블명 사용 (yl_ 없음!)
type DBAlertRule = Tables<'alert_rules'>;
```

#### 3.2 YouTube Lens 실제 테스트
```bash
# YouTube Lens 기능 테스트
1. YouTube Lens 페이지 접속
2. 알림 규칙 생성 버튼 클릭
3. 규칙 생성 폼 입력
4. 저장 및 목록 확인

## 체크포인트
- [ ] 규칙 생성 성공
- [ ] 규칙 목록 표시
- [ ] 규칙 수정/삭제 작동
- [ ] Console 에러 0개
```

---

### Phase 4: any 타입 제거 및 최종 검증 (20분)

#### 4.1 any 타입 검색 및 제거
```bash
# any 타입 검색
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | grep -v "//"

# as any 캐스팅 검색
grep -r "as any" src/ --include="*.ts" --include="*.tsx" | grep -v "//"
```

#### 4.2 전체 기능 E2E 테스트
```markdown
## 최종 E2E 체크리스트
### 로그인 플로우
- [ ] 테스트 로그인 성공
- [ ] 세션 유지 확인
- [ ] 로그아웃 작동

### 프로필 기능
- [ ] 프로필 조회 성공
- [ ] 프로필 수정 작동
- [ ] 카페 정보 표시

### YouTube Lens
- [ ] 채널 목록 로드
- [ ] 알림 규칙 CRUD
- [ ] 실시간 업데이트

### API 응답
- [ ] 모든 API 200/201
- [ ] 에러 처리 정상
- [ ] 데이터 정합성
```

---

## 🧪 Phase 5: 테스트 작성 (필수!) (30분)

### 5.1 타입 수정된 컴포넌트 테스트
```typescript
// src/components/features/tools/youtube-lens/AlertRules.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { AlertRules } from './AlertRules'

test('알림 규칙 생성 및 표시', async () => {
  render(<AlertRules channelId="test-channel" />)
  
  const createButton = screen.getByText('규칙 생성')
  fireEvent.click(createButton)
  
  // 규칙 생성 폼 테스트
  // API 호출 확인
  // 목록 업데이트 확인
})
```

### 5.2 API Route 테스트
```typescript
// src/app/api/admin/verify-cafe/route.test.ts
import { GET, POST } from './route'

test('카페 인증 API 정상 작동', async () => {
  // 세션 모킹
  // API 호출
  // 응답 검증
})
```

### 5.3 E2E 시나리오 테스트
```typescript
// e2e/type-fix-validation.spec.ts
import { test, expect } from '@playwright/test'

test('타입 수정 후 전체 플로우', async ({ page }) => {
  await page.goto('/auth/login')
  await page.click('button:has-text("🧪 테스트 로그인")')
  
  // 프로필 확인
  await page.goto('/mypage/profile')
  await expect(page.locator('[data-cafe-url]')).toBeVisible()
  
  // YouTube Lens 확인
  await page.goto('/youtube-lens')
  await page.click('button:has-text("규칙 생성")')
  // ...
})
```

---

## ✅ 진짜 완료 조건

### ❌ 이것은 완료가 아님
- TypeScript 에러 0개
- 빌드 성공
- npm run types:check 통과

### ✅ 이것이 진짜 완료
- [ ] TypeScript 에러 0개 **AND** 실제 기능 작동
- [ ] 모든 페이지 Console 에러 0개
- [ ] 사용자 시나리오 100% 성공
- [ ] 테스트 코드 작성 완료
- [ ] E2E 테스트 통과

---

## 🔄 문제 발생 시 대응

```markdown
## TypeScript는 통과했는데 브라우저에서 에러
1. Console 에러 전체 복사
2. Network 탭에서 실패한 API 확인
3. 실제 데이터 구조 vs 타입 정의 비교
4. DB 테이블과 타입 일치 확인

## API는 작동하는데 UI 에러
1. 컴포넌트 props 타입 확인
2. React DevTools로 실제 데이터 확인
3. Optional/Nullable 처리 확인

## 테스트는 통과하는데 실제 안됨
1. 테스트 환경과 실제 환경 차이 확인
2. Mock 데이터와 실제 데이터 차이
3. 환경변수 설정 확인
```

---

## 🚨 작업 종료 시 필수

```markdown
## 반드시 실행
1. **서버 종료**: Ctrl + C
2. **포트 확인**: netstat -ano | findstr :300
3. **프로세스 정리**: taskkill /F /PID [ID]
4. **테스트 실행**: npm run test:all
5. **커밋 전 검증**: npm run verify:all

⚠️ 포트 정리 안하면 다음 작업 시 충돌 발생
```

---

## 📊 예상 결과

### Before (현재)
- TypeScript 에러: 15개
- 작동 안하는 기능: 3개 (프로필, 카페 인증, AlertRules)
- Console 에러: 다수
- 테스트 커버리지: 0%

### After (목표)
- TypeScript 에러: 0개
- 모든 기능 정상 작동
- Console 에러: 0개
- 테스트 커버리지: 주요 기능 80%+
- E2E 시나리오: 통과

---

## 📝 변경 로그

### v3 (2025-08-27) - E2E 통합 버전
- ✅ V6 템플릿 원칙 적용
- ✅ 실제 작동 검증 필수화
- ✅ 테스트 작성 의무화
- ✅ 포트 관리 추가
- ✅ 브라우저 테스트 각 Phase마다 추가

### v2 (2025-08-27) - 기술적 수정 버전
- 타입 에러 해결 중심
- 실제 작동 검증 부족

---

*V3: 타입 수정 = 실제 작동 + 테스트 보호 | 컴파일 성공 ≠ 작업 완료*
*핵심: 사용자가 실제로 사용할 수 있어야 완료!*