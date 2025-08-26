/sc:analyze --seq --ultrathink --validate --all-mcp
"Phase 1-4 전체 실행 검증 및 미완료 작업 식별"

# 🔍 디하클 Critical Fixes 실행 검증 지시서

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 🚨 프로젝트 특화 규칙 확인 (필수)
### 최우선 확인 문서
- [ ] `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙 (전체 읽기 필수)
- [ ] `/CLAUDE.md` 17-43행 - 자동 스크립트 절대 금지
- [ ] `/CLAUDE.md` 352-410행 - Supabase 클라이언트 패턴
- [ ] `/CLAUDE.md` 54-71행 - 절대 금지사항 목록
- [ ] `/docs/ERROR_BOUNDARY.md` - 에러 처리 표준 패턴

### 프로젝트 금지사항 체크
- [ ] 자동 변환 스크립트 생성 금지 (38개 스크립트 재앙 경험)
- [ ] 구식 Supabase 패턴 사용 금지 (createServerComponentClient 등)
- [ ] database.generated.ts 직접 import 금지
- [ ] any 타입 사용 금지
- [ ] fetch() 직접 호출 금지
- [ ] getSession() 사용 금지 (getUser() 사용)
- [ ] 임시방편 해결책 사용 금지 (주석 처리, TODO, 빈 배열 반환 등)

## 📚 온보딩 섹션
### 작업 관련 경로
- 지시서 위치: `tasks/(ing)dhacle-critical-fixes/`
- 마이그레이션: `supabase/migrations/`
- 타입 정의: `src/types/`
- API 라우트: `src/app/api/`
- 보안 설정: `src/lib/security/`

### 프로젝트 컨텍스트 확인
```bash
# 기술 스택 확인
cat package.json | grep -A 5 "dependencies"

# 프로젝트 구조 확인  
ls -la src/

# 실행된 지시서 확인
ls -la "C:/My_Claude_Project/9.Dhacle/tasks/(ing)dhacle-critical-fixes/"

# 최근 변경사항 확인
git log --oneline -10
```

## 📌 목적
Phase 1-4 지시서가 올바르게 실행되었는지 체계적으로 검증하고, 미완료된 작업을 식별하여 완료 계획을 수립

## 🤖 실행 AI 역할
1. 각 Phase별 완료 조건 검증
2. 미완료 작업 구체적 식별
3. 실패 원인 분석
4. 완료를 위한 구체적 계획 수립
5. 리스크 및 우선순위 평가

## 📝 작업 내용

### Phase 1: 데이터베이스 테이블 검증 (15개 테이블)

#### 1단계: 테이블 존재 확인
```bash
# Service Role 키로 테이블 확인
node scripts/verify-with-service-role.js

# 또는 SQL 직접 실행으로 확인
node scripts/supabase-sql-executor.js --method pg --query "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```

#### 검증 체크리스트
| 테이블명 | 존재 여부 | RLS 활성화 | 정책 수 | 상태 |
|---------|-----------|-----------|---------|------|
| channelSubscriptions | ☐ | ☐ | ___ | ☐ |
| yl_channels | ☐ | ☐ | ___ | ☐ |
| api_usage | ☐ | ☐ | ___ | ☐ |
| proof_reports | ☐ | ☐ | ___ | ☐ |
| coupons | ☐ | ☐ | ___ | ☐ |
| yl_approval_logs | ☐ | ☐ | ___ | ☐ |
| webhookEvents | ☐ | ☐ | ___ | ☐ |
| subscriptionLogs | ☐ | ☐ | ___ | ☐ |
| naverCafeVerifications | ☐ | ☐ | ___ | ☐ |
| userLevels | ☐ | ☐ | ___ | ☐ |
| communityPosts | ☐ | ☐ | ___ | ☐ |
| communityComments | ☐ | ☐ | ___ | ☐ |
| pointTransactions | ☐ | ☐ | ___ | ☐ |
| referralCodes | ☐ | ☐ | ___ | ☐ |
| apiKeyRotations | ☐ | ☐ | ___ | ☐ |

#### 2단계: 주석 처리된 DB 호출 복원 확인 (44개)
```bash
# 주석 처리된 DB 호출 검색
grep -r "// .*supabase\\.from" src/ --include="*.ts" --include="*.tsx"
grep -r "// .*from\('.*'\)" src/ --include="*.ts" --include="*.tsx"

# 복원이 필요한 파일 리스트
# src/lib/youtube/pubsub.ts
# src/app/api/youtube/subscriptions/route.ts
# ... (나머지 42개 파일)
```

#### 3단계: 타입 생성 확인
```bash
# database.types.ts 파일 존재 및 최신화 확인
ls -la src/types/database.types.ts

# 타입 export 확인
grep "export.*from.*database.types" src/types/index.ts
```

### Phase 2: TypeScript 타입 시스템 검증 (51개 any 타입)

#### 1단계: any 타입 사용 현황
```bash
# any 타입 카운트
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l
# 목표: 0개 (현재: 51개)

# any 타입 위치 상세
grep -r ": any" src/ --include="*.ts" --include="*.tsx" -n
```

#### 2단계: 타입 컴파일 에러 확인
```bash
# TypeScript 컴파일 체크
npm run type-check

# 에러 수 확인
npm run type-check 2>&1 | grep "error TS" | wc -l
# 목표: 0개
```

#### 3단계: React Query v5 타입 검증
```bash
# useQuery 타입 파라미터 확인
grep -r "useQuery<" src/hooks/ --include="*.ts"

# useMutation 타입 파라미터 확인  
grep -r "useMutation<" src/hooks/ --include="*.ts"
```

### Phase 3: 보안 라우트 검증

#### 1단계: 보호되지 않은 라우트 식별
```bash
# getUser() 호출 없는 API 라우트 찾기
for file in $(find src/app/api -name "route.ts"); do
  if ! grep -q "getUser()" "$file"; then
    echo "Unprotected: $file"
  fi
done

# auth 체크 없는 페이지 찾기
for file in $(find "src/app/(pages)" -name "page.tsx"); do
  if ! grep -q "redirect\|getUser" "$file"; then
    echo "Check needed: $file"
  fi
done
```

#### 2단계: Middleware 설정 확인
```bash
# middleware.ts 존재 확인
ls -la src/middleware.ts

# matcher 설정 확인
grep "matcher:" src/middleware.ts
```

#### 3단계: RLS 정책 검증
```sql
-- RLS 정책 수 확인
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

### Phase 4: API 클라이언트 통일 검증

#### 1단계: 직접 fetch 사용 확인
```bash
# fetch() 직접 호출 찾기
grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" | grep -v "apiClient\|fetcher"
# 목표: 0개 (현재: 13개)
```

#### 2단계: API 클라이언트 사용 확인
```bash
# apiClient import 확인
grep -r "import.*apiClient" src/ --include="*.ts" --include="*.tsx" | wc -l

# apiClient 사용 패턴 확인
grep -r "apiClient\.(get\|post\|put\|delete)" src/ --include="*.ts" --include="*.tsx"
```

#### 3단계: 환경변수 직접 사용 확인
```bash
# process.env 직접 사용
grep -r "process\.env\." src/ --include="*.ts" --include="*.tsx" | grep -v "env.ts"
# 목표: 0개 (현재: 47개)
```

## ✅ 완료 조건

### Phase 1 완료 기준
- [ ] 15개 테이블 모두 생성됨
- [ ] 모든 테이블에 RLS 활성화
- [ ] 각 테이블당 최소 1개 이상의 RLS 정책
- [ ] 44개 주석 처리된 DB 호출 모두 복원
- [ ] database.types.ts 생성 및 최신화
- [ ] 빌드 성공 (DB 관련 에러 없음)

### Phase 2 완료 기준
- [ ] any 타입 0개
- [ ] TypeScript 컴파일 에러 0개
- [ ] React Query v5 타입 완전 적용
- [ ] 모든 함수 반환 타입 명시
- [ ] unknown + 타입가드 패턴 적용

### Phase 3 완료 기준
- [ ] 모든 API 라우트 세션 검사 적용
- [ ] 인증 필요 페이지 보호
- [ ] middleware.ts 설정 완료
- [ ] RLS 정책 완전 적용
- [ ] 권한 테스트 통과

### Phase 4 완료 기준
- [ ] fetch() 직접 호출 0개
- [ ] 모든 API 호출 apiClient 사용
- [ ] 환경변수 env.ts 통해서만 사용
- [ ] 에러 처리 표준화
- [ ] 타입 안전 API 호출

## 📋 QA 테스트 시나리오

### 정상 플로우
1. **DB 테스트**
   ```bash
   # 각 테이블 CRUD 테스트
   npm run test:db
   ```

2. **타입 테스트**
   ```bash
   # 타입 체크
   npm run type-check
   
   # 빌드 테스트
   npm run build
   ```

3. **보안 테스트**
   ```bash
   # 인증 테스트
   npm run test:auth
   
   # RLS 테스트
   npm run test:rls
   ```

### 실패 시나리오
1. **테이블 누락**: 마이그레이션 재실행
2. **타입 에러**: 구체적 타입 정의 추가
3. **인증 실패**: getUser() 추가
4. **fetch 에러**: apiClient로 교체

### 성능 측정
```bash
# 병렬 검증 실행
npm run verify:parallel

# 개별 검증
npm run verify:db
npm run verify:types
npm run verify:security
npm run verify:api
```

## 🔄 롤백 계획

### 실패 시 롤백 절차
```bash
# 1. 현재 상태 백업
git add -A
git commit -m "backup: before verification fixes"

# 2. 문제 발생 시 롤백
git reset --hard HEAD~1

# 3. DB 롤백 (필요시)
npx supabase db reset
```

### 부분 실패 대응
- Phase 1 실패: SQL 파일 재실행
- Phase 2 실패: 개별 파일 수동 수정
- Phase 3 실패: middleware 재설정
- Phase 4 실패: apiClient 점진적 적용

## 📊 검증 결과 보고서 템플릿

```markdown
# Phase별 검증 결과

## Phase 1: DB 테이블
- 생성된 테이블: ___/15
- RLS 적용 테이블: ___/15
- 복원된 DB 호출: ___/44
- 상태: ☐ 완료 / ☐ 부분완료 / ☐ 미완료

## Phase 2: TypeScript
- any 타입 제거: ___/51
- 컴파일 에러: ___개
- 상태: ☐ 완료 / ☐ 부분완료 / ☐ 미완료

## Phase 3: 보안
- 보호된 라우트: ___개
- RLS 정책: ___개
- 상태: ☐ 완료 / ☐ 부분완료 / ☐ 미완료

## Phase 4: API 통일
- fetch 제거: ___/13
- 환경변수 통일: ___/47
- 상태: ☐ 완료 / ☐ 부분완료 / ☐ 미완료

## 미완료 작업 목록
1. [구체적 작업 1]
2. [구체적 작업 2]
...

## 우선순위 재조정
1. [최우선 작업]
2. [차순위 작업]
...

## 예상 완료 시간
- 총 예상 시간: ___시간
- 권장 작업 순서: Phase ___ → ___ → ___ → ___
```

## 🎯 핵심 검증 명령어 모음

```bash
# 전체 검증 (권장)
npm run verify:parallel

# DB 검증
node scripts/verify-with-service-role.js

# TypeScript 검증
npm run type-check
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l

# 보안 검증
grep -r "getUser()" src/app/api -name "route.ts" | wc -l

# API 검증
grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" | grep -v "apiClient" | wc -l

# 환경변수 검증
grep -r "process\.env\." src/ --include="*.ts" --include="*.tsx" | grep -v "env.ts" | wc -l
```

## ⚠️ 주의사항
1. 자동 수정 스크립트 생성 절대 금지
2. 각 문제는 수동으로 개별 파일 수정
3. 검증 → 수정 → 재검증 사이클 준수
4. 부분 성공도 기록하여 진행 상황 추적
5. 롤백 가능한 단위로 작업 분할

---

*이 지시서에 따라 Phase 1-4 실행 상태를 완전히 검증하고, 미완료 작업을 명확히 식별하여 완료 계획을 수립하세요.*