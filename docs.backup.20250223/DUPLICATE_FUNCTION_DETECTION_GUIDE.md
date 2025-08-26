# 🔍 중복 기능 탐지 지시서

*목적: 같은 기능을 하지만 이름이 다른 중복 구현을 체계적으로 찾아내는 작업 가이드*
*작성일: 2025-08-23*
*대상: Context가 없는 상태에서도 실행 가능하도록 상세히 작성*

---

## 📌 배경 및 문제 정의

### 현재 상황
- **개발자 없이 AI로만 개발된 프로젝트**로 인한 중복 구현 다수 존재
- 같은 기능이 여러 이름/위치에 중복 구현됨
- 일관성 없는 네이밍으로 발견이 어려움
- 유지보수 및 디버깅 어려움 가중

### 중복의 유형
1. **완전 중복**: 100% 동일한 로직, 다른 이름
2. **부분 중복**: 80% 유사한 로직, 약간의 차이
3. **개념 중복**: 같은 목적, 다른 구현 방식
4. **위치 중복**: 같은 기능이 여러 폴더에 산재

---

## 🎯 탐지 대상 및 우선순위

### 1순위: 핵심 비즈니스 로직
- 사용자 인증/인가 함수
- API 호출 함수
- 데이터 변환 함수 (snake_case ↔ camelCase)
- 에러 처리 함수
- 유효성 검증 함수

### 2순위: 유틸리티 함수
- 날짜/시간 포맷팅
- 문자열 처리 (trim, capitalize, slugify 등)
- 숫자 포맷팅 (천 단위 콤마, 통화 등)
- URL 처리
- 파일 처리

### 3순위: UI 관련 함수
- 모달 열기/닫기
- 토스트/알림 표시
- 로딩 상태 관리
- 페이지네이션
- 무한 스크롤

### 4순위: 컴포넌트
- 버튼 컴포넌트
- 카드 컴포넌트
- 리스트 컴포넌트
- 폼 컴포넌트
- 레이아웃 컴포넌트

---

## 🔨 실행 지침 (단계별)

### Phase 1: 패턴 기반 검색

#### Step 1: 인증 관련 중복 찾기
```bash
# 다양한 인증 함수명 패턴 검색
grep -r "auth\|Auth\|login\|Login\|signin\|SignIn\|authenticate" --include="*.ts" --include="*.tsx" src/

# 세션 체크 패턴
grep -r "getUser\|getSession\|checkAuth\|isAuthenticated\|validateUser" --include="*.ts" --include="*.tsx" src/

# 토큰 관련
grep -r "token\|Token\|jwt\|JWT" --include="*.ts" --include="*.tsx" src/
```

**예상 중복 패턴**:
- `checkAuth()`, `validateAuth()`, `isUserAuthenticated()` → 같은 기능
- `getUser()`, `getCurrentUser()`, `fetchUser()` → 같은 기능
- `handleLogin()`, `signIn()`, `authenticate()` → 같은 기능

#### Step 2: API 호출 관련 중복 찾기
```bash
# fetch 패턴
grep -r "fetch(\|axios\|apiCall\|apiRequest\|httpClient" --include="*.ts" --include="*.tsx" src/

# GET 요청 패턴
grep -r "apiGet\|getData\|fetchData\|get[A-Z]" --include="*.ts" --include="*.tsx" src/

# POST 요청 패턴
grep -r "apiPost\|postData\|sendData\|post[A-Z]\|create[A-Z]" --include="*.ts" --include="*.tsx" src/
```

**예상 중복 패턴**:
- `apiGet()`, `fetchData()`, `getData()` → 같은 기능
- `apiPost()`, `postData()`, `createResource()` → 같은 기능
- 직접 `fetch()` vs `api-client.ts` 함수 사용

#### Step 3: 데이터 변환 중복 찾기
```bash
# Case 변환
grep -r "snakeToCamel\|toCamel\|camelCase\|convertCase" --include="*.ts" --include="*.tsx" src/
grep -r "camelToSnake\|toSnake\|snake_case\|snakeCase" --include="*.ts" --include="*.tsx" src/

# 날짜 포맷
grep -r "formatDate\|dateFormat\|toDate\|parseDate" --include="*.ts" --include="*.tsx" src/

# 숫자 포맷
grep -r "formatNumber\|numberFormat\|toNumber\|formatCurrency" --include="*.ts" --include="*.tsx" src/
```

#### Step 4: 에러 처리 중복 찾기
```bash
# 에러 핸들러
grep -r "handleError\|errorHandler\|onError\|catchError" --include="*.ts" --include="*.tsx" src/

# 에러 응답
grep -r "errorResponse\|createError\|ApiError\|HttpError" --include="*.ts" --include="*.tsx" src/

# try-catch 패턴
grep -A5 -B5 "try {" --include="*.ts" --include="*.tsx" src/
```

### Phase 2: 시그니처 기반 검색

#### Step 5: 함수 시그니처 분석
```bash
# async 함수들
grep -r "^export async function\|^async function\|^const.*async" --include="*.ts" --include="*.tsx" src/

# 동일한 매개변수 패턴
grep -r "function.*\(.*id.*\)" --include="*.ts" --include="*.tsx" src/
grep -r "function.*\(.*data.*\)" --include="*.ts" --include="*.tsx" src/
grep -r "function.*\(.*user.*\)" --include="*.ts" --include="*.tsx" src/
```

#### Step 6: 반환 타입 분석
```bash
# Promise 반환
grep -r ": Promise<" --include="*.ts" --include="*.tsx" src/

# NextResponse 반환
grep -r ": NextResponse\|Promise<NextResponse>" --include="*.ts" --include="*.tsx" src/

# 동일한 타입 반환
grep -r ": User\[\]\|: User\|<User>" --include="*.ts" --include="*.tsx" src/
```

### Phase 3: 컴포넌트 중복 검색

#### Step 7: 유사 컴포넌트 찾기
```bash
# 버튼 컴포넌트들
find src -name "*[Bb]utton*" -o -name "*[Bb]tn*"

# 카드 컴포넌트들
find src -name "*[Cc]ard*" -o -name "*[Pp]anel*" -o -name "*[Bb]ox*"

# 모달/다이얼로그
find src -name "*[Mm]odal*" -o -name "*[Dd]ialog*" -o -name "*[Pp]opup*"

# 리스트 컴포넌트
find src -name "*[Ll]ist*" -o -name "*[Tt]able*" -o -name "*[Gg]rid*"
```

#### Step 8: 컴포넌트 내용 비교
```bash
# 비슷한 JSX 구조 찾기
grep -r "<Button\|<button" --include="*.tsx" src/
grep -r "<Card\|<div.*card\|<div.*panel" --include="*.tsx" src/
```

### Phase 4: Import 분석

#### Step 9: Import 패턴 분석
```bash
# 같은 모듈을 다르게 import
grep -r "^import.*from '@/lib" --include="*.ts" --include="*.tsx" src/ | sort | uniq -c | sort -rn

# 중복 import
grep -r "^import.*from" --include="*.ts" --include="*.tsx" src/ | awk -F'from' '{print $2}' | sort | uniq -c | sort -rn | head -20
```

### Phase 5: 폴더 구조 분석

#### Step 10: 중복 가능 위치 확인
```bash
# utils 폴더들
find src -type d -name "*util*" -o -name "*helper*" -o -name "*lib*"

# 각 폴더의 파일 목록
ls -la src/lib/
ls -la src/utils/
ls -la src/helpers/ 2>/dev/null
ls -la src/lib/utils/
```

---

## 📊 분석 및 정리

### 중복 매트릭스 작성
각 단계에서 발견한 중복을 다음 형식으로 정리:

| 기능 | 위치 1 | 위치 2 | 위치 3 | 유사도 | 권장 조치 |
|------|--------|--------|--------|--------|-----------|
| 사용자 인증 체크 | `checkAuth()` src/lib/auth.ts | `validateUser()` src/utils/auth.ts | `isAuthenticated()` src/helpers/auth.ts | 95% | 통합 → `checkAuth()` |
| API GET 요청 | `apiGet()` src/lib/api-client.ts | `fetchData()` src/utils/fetch.ts | 직접 fetch() 여러 파일 | 80% | 통합 → `apiGet()` |
| 날짜 포맷 | `formatDate()` src/utils/date.ts | `dateFormat()` src/lib/format.ts | - | 100% | 통합 → `formatDate()` |

### 중복 제거 우선순위
1. **Critical**: 보안 관련 (인증, 권한)
2. **High**: API 호출, 데이터 처리
3. **Medium**: 유틸리티 함수
4. **Low**: UI 컴포넌트

---

## 🎬 실행 예시

### 예시 1: snakeToCamelCase 중복 발견
```bash
$ grep -r "snake.*camel\|Snake.*Camel\|toCamel" --include="*.ts" src/

결과:
src/lib/utils/case-converter.ts:export function snakeToCamelCase(obj: any)
src/utils/format.ts:const toCamelCase = (str) => 
src/lib/api-client.ts:function convertSnakeToCamel(data)
src/types/index.ts:export function snakeToCamelCase(input: any)
```
→ 4개의 중복 발견! `src/types/index.ts`의 것으로 통합 필요

### 예시 2: 버튼 컴포넌트 중복
```bash
$ find src -name "*[Bb]utton*" -type f

결과:
src/components/ui/button.tsx       # shadcn Button
src/components/Button.tsx          # 커스텀 Button
src/components/common/ActionButton.tsx  # 또 다른 Button
```
→ 3개의 버튼 컴포넌트! shadcn Button으로 통합 필요

---

## ✅ 검증 체크리스트

작업 완료 후 다음 사항 확인:

- [ ] 모든 인증 관련 함수가 단일 모듈로 통합되었는가?
- [ ] API 호출이 `api-client.ts`로 통일되었는가?
- [ ] 데이터 변환 함수가 중복 없이 정리되었는가?
- [ ] 유틸리티 함수가 적절한 위치에 통합되었는가?
- [ ] 컴포넌트 중복이 제거되었는가?
- [ ] Import 경로가 일관되게 정리되었는가?
- [ ] 제거된 중복 코드로 인한 버그가 없는가?
- [ ] 타입 체크가 통과하는가?
- [ ] 빌드가 성공하는가?

---

## 🚨 주의사항

1. **삭제 전 반드시 사용처 확인**
   - 중복으로 보이는 함수도 미묘한 차이가 있을 수 있음
   - 모든 import와 사용처를 확인 후 삭제

2. **Git 백업 필수**
   - 대규모 중복 제거 전 반드시 커밋
   - 각 단계별로 커밋하여 롤백 가능하도록

3. **테스트 실행**
   - 중복 제거 후 반드시 테스트 실행
   - `npm run build` 성공 확인
   - `npm run types:check` 타입 체크

4. **점진적 적용**
   - 한 번에 모든 중복을 제거하지 말고 단계적으로
   - Critical부터 시작하여 Low까지 순차적으로

---

## 📈 기대 효과

- **코드 라인 수 30-40% 감소** 예상
- **번들 크기 20-30% 감소** 예상
- **유지보수성 대폭 향상**
- **버그 발생 가능성 감소**
- **개발 속도 향상**

---

*이 지시서를 따라 체계적으로 중복을 제거하면 프로젝트 품질이 크게 향상됩니다.*
*Context 없이도 이 문서만으로 작업 수행이 가능하도록 작성되었습니다.*