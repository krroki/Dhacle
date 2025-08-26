/sc:troubleshoot --seq --validate --think
"Pre-commit hook에서 310개 임시 처리 패턴이 발견되어 커밋이 차단됨. CRITICAL 13개, HIGH 74개, MEDIUM 32개, LOW 191개 순차적 해결"

# 🚨 Pre-commit 에러 완전 해결 지시서: 310개 임시 처리 패턴 제거

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📚 온보딩 섹션

### 작업 관련 경로
- API Routes: `src/app/api/*/route.ts`
- 컴포넌트: `src/components/layout/Header.tsx`
- 라이브러리: `src/lib/logger.ts`, `src/lib/youtube/monitoring.ts`
- 보안: `src/lib/security/sanitizer.ts`

### 프로젝트 컨텍스트 확인
```bash
# 임시 처리 패턴 재확인
node scripts/detect-temporary-fixes.js

# 테이블 상태 확인
node scripts/verify-with-service-role.js

# 타입 체크
npm run types:check
```

### 🔥 실제 코드 패턴 확인 (v17.0 신규)
```bash
# 주석 처리된 DB 호출 확인
grep -r "//.*supabase\.from\|/\*.*supabase\.from" src/ --include="*.ts" --include="*.tsx" | head -10

# TODO 주석 확인
grep -r "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts" --include="*.tsx" | head -10

# any 타입 확인
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | head -10

# 빈 catch 블록 확인
grep -r "catch.*{[[:space:]]*}" src/ --include="*.ts" --include="*.tsx" | head -5
```

## 📌 목적
Pre-commit hook에서 감지된 310개 임시 처리 패턴을 완전히 제거하여 코드 품질을 정상화하고 커밋 가능한 상태로 만들기

## 🤖 실행 AI 역할
디하클 프로젝트의 임시 처리 코드를 발견하고, 즉시 완전한 구현으로 교체하는 문제 해결 전문가

## 📝 작업 내용

### Phase 1: CRITICAL 문제 해결 (13개)
주석 처리된 DB 호출을 즉시 해결

#### 1-1. profiles 테이블 randomNickname 컬럼 추가
```sql
-- supabase/migrations/20250826_add_random_nickname.sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS randomNickname TEXT;

-- 고유 인덱스 추가 (중복 방지)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_random_nickname 
ON profiles(randomNickname) 
WHERE randomNickname IS NOT NULL;
```

#### 1-2. src/app/api/user/init-profile/route.ts 수정
```typescript
// Read로 파일 읽기 → 주석 제거 → Edit로 수정
// Line 33: TODO 주석 제거
// Line 51: .eq('randomNickname', randomNickname) 주석 해제
// Line 91-138: 전체 주석 블록 해제 및 활성화
```

#### 1-3. src/app/api/user/generate-nickname/route.ts 수정
```typescript
// 동일한 패턴으로 주석 해제
// Line 30, 60, 81, 86의 주석 처리된 DB 호출 활성화
```

#### 1-4. src/components/layout/Header.tsx 수정
```typescript
// Line 271의 주석 처리된 코드 확인 및 활성화
// 필요시 테이블 존재 여부 확인 후 SQL 작성
```

#### 1-5. src/app/api/youtube/analysis/route.ts 수정
```typescript
// Line 323의 주석 처리된 DB 호출 활성화
// youtube_analysis_results 테이블 필요시 생성
```

### Phase 2: HIGH 문제 해결 (74개)
TODO 주석을 즉시 구현으로 교체

#### 2-1. src/lib/logger.ts:69
```typescript
// "Sentry 통합 미구현" → 실제 Sentry 통합 구현
import * as Sentry from '@sentry/nextjs';

export function logError(error: unknown): void {
  console.error(error);
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error);
  }
}
```

#### 2-2. src/lib/youtube/monitoring.ts:426
```typescript
// "Alert 타입 매핑 미구현" → 실제 타입 정의
interface AlertMapping {
  level: 'info' | 'warning' | 'error' | 'critical';
  channel: 'email' | 'slack' | 'webhook';
  template: string;
}

const alertTypeMap: Record<string, AlertMapping> = {
  'rate_limit': { level: 'warning', channel: 'slack', template: 'rate_limit' },
  'api_error': { level: 'error', channel: 'email', template: 'api_error' },
  // ... 나머지 매핑
};
```

#### 2-3. 나머지 TODO 제거
```bash
# 각 파일을 Read → TODO 내용 파악 → 실제 구현 → Edit
# 임시방편 금지, 완전한 구현만 허용
```

### Phase 3: MEDIUM 문제 해결 (32개)
임시 처리 키워드 정리

#### 3-1. src/lib/security/sanitizer.ts
```typescript
// 'dirty' 변수명이 DOMPurify 표준인 경우
// pre-commit 규칙에 예외 추가 권장
// 또는 변수명을 'unsanitized' 등으로 변경
```

### Phase 4: LOW 문제 해결 (191개)
일반적인 코드 개선

#### 4-1. console.log 제거
```typescript
// 프로덕션 코드에서 디버깅용 console.log 제거
// logger 시스템으로 교체
```

## ✅ 완료 조건
- [ ] `node scripts/detect-temporary-fixes.js` 실행 → 0개 감지
- [ ] `npm run verify:parallel` → 모든 검증 통과
- [ ] `npm run types:check` → 에러 0개
- [ ] `npm run build` → 빌드 성공
- [ ] Pre-commit hook 통과 → 커밋 가능

## 📋 QA 테스트 시나리오

### 🔴 필수: 실제 기능 테스트
```bash
# 1. 개발 서버 실행
npm run dev

# 2. 프로필 초기화 테스트
curl -X POST http://localhost:3000/api/user/init-profile \
  -H "Cookie: [세션쿠키]"
# → randomNickname 포함된 프로필 반환 확인

# 3. 닉네임 생성 테스트
curl -X POST http://localhost:3000/api/user/generate-nickname \
  -H "Cookie: [세션쿠키]"
# → 유니크한 닉네임 생성 확인

# 4. YouTube 분석 테스트
curl -X POST http://localhost:3000/api/youtube/analysis \
  -H "Cookie: [세션쿠키]" \
  -d '{"videoId": "test"}'
# → 분석 결과 DB 저장 확인
```

### 실패 시나리오
```bash
# 테이블 누락 시
- 즉시 SQL 작성 및 실행
- node scripts/supabase-sql-executor.js --method pg --file [SQL파일]

# 타입 에러 시
- src/types/index.ts에 타입 추가
- npm run types:generate 실행
```

### 성능 측정
```bash
# Pre-commit 실행 시간
time npm run pre-commit
# 목표: < 3초
```

## 🔄 롤백 계획
```bash
# 실패 시 롤백
git reset --hard HEAD
git stash pop  # 필요시 변경사항 복구

# DB 변경 롤백
-- 컬럼 제거 (필요시)
ALTER TABLE profiles DROP COLUMN IF EXISTS randomNickname;
```

## ⚠️ 중요 주의사항

### 🔥 프로젝트 특화 규칙 (필수)
1. **자동 수정 스크립트 생성 절대 금지**
   - fix-*.js 파일 생성 금지
   - 모든 수정은 Read → Edit로 수동 진행

2. **임시방편 코드 절대 금지**
   - TODO 작성 금지, 즉시 구현
   - any 타입 금지, 구체적 타입 정의
   - 주석 처리 금지, 실제 코드 작성

3. **검증 우선 원칙**
   - 수정 전 `node scripts/detect-temporary-fixes.js` 실행
   - 수정 후 `npm run verify:parallel` 실행
   - 커밋 전 `npm run build` 성공 확인

4. **SQL 실행 방법**
   ```bash
   # PostgreSQL 직접 연결 (권장)
   node scripts/supabase-sql-executor.js --method pg --file [SQL파일]
   ```

## 📊 예상 소요 시간
- Phase 1 (CRITICAL): 30분
- Phase 2 (HIGH): 1시간
- Phase 3 (MEDIUM): 20분
- Phase 4 (LOW): 40분
- 검증 및 테스트: 30분
- **총 예상 시간**: 3시간

## 🎯 성공 지표
- Pre-commit hook 통과 ✅
- 커밋 가능 상태 ✅
- 임시 처리 패턴 0개 ✅
- 모든 기능 정상 작동 ✅

---

*이 지시서는 INSTRUCTION_TEMPLATE.md v17.0 기준으로 작성되었습니다.*
*실행 AI는 반드시 CONTEXT_BRIDGE.md의 프로젝트 특화 규칙을 준수해야 합니다.*