/sc:analyze --seq --validate --think
"Dhacle 프로젝트 전체의 중복 기능을 체계적으로 탐지하고 제거하여 코드베이스를 30-40% 감소시키고 유지보수성을 향상시킨다"

# 🔍 중복 기능 탐지 및 제거 지시서

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📚 온보딩 섹션

### 작업 관련 경로
- 유틸리티: `src/lib/`, `src/utils/`, `src/helpers/`
- API 클라이언트: `src/lib/api-client.ts`
- 타입 정의: `src/types/index.ts`
- 컴포넌트: `src/components/`
- 훅: `src/hooks/`

### 프로젝트 컨텍스트 확인
```bash
# 기술 스택 확인
cat package.json | grep -A 5 "dependencies"

# 프로젝트 구조 확인  
ls -la src/
find src -type d -name "*util*" -o -name "*helper*" -o -name "*lib*"

# 최신 변경사항 확인
cat /docs/PROJECT.md | grep -A 10 "최근 변경"
cat /docs/CONTEXT_BRIDGE.md | grep -A 10 "반복 실수"
```

### 🔥 실제 코드 패턴 확인 (v17.0 필수)
```bash
# API 클라이언트 패턴 확인
grep -r "apiClient\." src/ --include="*.ts" --include="*.tsx" | head -5
grep -r "apiGet\|apiPost" src/ --include="*.ts" --include="*.tsx" | head -5

# 현재 사용 중인 import 패턴 확인
grep -r "import.*from '@/lib/api-client'" src/ | head -5
grep -r "import.*from '@/types'" src/ | head -5

# 금지 패턴 사용 여부 확인
grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" | grep -v "//"
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | grep -v "//"

# 기존 유틸리티 확인
ls -la src/lib/utils/
ls -la src/utils/ 2>/dev/null
cat src/hooks/CLAUDE.md | grep -A 10 "API"
```

## 📌 목적
AI 단독 개발로 인한 중복 구현을 체계적으로 탐지하고 제거하여:
- 코드 라인 수 30-40% 감소
- 번들 크기 20-30% 감소
- 유지보수성 대폭 향상
- 버그 발생 가능성 감소

## 🤖 실행 AI 역할
1. **중복 탐지 전문가**: 패턴 매칭과 시그니처 분석으로 중복 발견
2. **코드 분석가**: 미묘한 차이점 파악 및 통합 가능성 평가
3. **리팩토링 전문가**: 안전한 중복 제거 및 통합 실행
4. **품질 검증자**: 중복 제거 후 기능 정상 작동 확인

## 📝 작업 내용

### Phase 1: 패턴 기반 검색 (Critical Priority)

#### Step 1: 인증 관련 중복 찾기
```bash
# 다양한 인증 함수명 패턴 검색
grep -r "auth\|Auth\|login\|Login\|signin\|SignIn\|authenticate" --include="*.ts" --include="*.tsx" src/

# 세션 체크 패턴
grep -r "getUser\|getSession\|checkAuth\|isAuthenticated\|validateUser" --include="*.ts" --include="*.tsx" src/

# 예상 중복 패턴
# checkAuth(), validateAuth(), isUserAuthenticated() → 통합 필요
# getUser(), getCurrentUser(), fetchUser() → 통합 필요
```

#### Step 2: API 호출 관련 중복 찾기
```bash
# fetch 패턴
grep -r "fetch(\|axios\|apiCall\|apiRequest\|httpClient" --include="*.ts" --include="*.tsx" src/

# GET/POST 요청 패턴
grep -r "apiGet\|getData\|fetchData\|get[A-Z]" --include="*.ts" --include="*.tsx" src/
grep -r "apiPost\|postData\|sendData\|post[A-Z]\|create[A-Z]" --include="*.ts" --include="*.tsx" src/

# 🔥 실제 패턴 확인 후 통합 방향 결정
```

#### Step 3: 데이터 변환 중복 찾기
```bash
# Case 변환
grep -r "snakeToCamel\|toCamel\|camelCase\|convertCase" --include="*.ts" --include="*.tsx" src/
grep -r "camelToSnake\|toSnake\|snake_case\|snakeCase" --include="*.ts" --include="*.tsx" src/

# 날짜/숫자 포맷
grep -r "formatDate\|dateFormat\|toDate\|parseDate" --include="*.ts" --include="*.tsx" src/
grep -r "formatNumber\|numberFormat\|toNumber\|formatCurrency" --include="*.ts" --include="*.tsx" src/
```

### Phase 2: 시그니처 기반 분석 (High Priority)

#### Step 4: 함수 시그니처 분석
```bash
# async 함수들
grep -r "^export async function\|^async function\|^const.*async" --include="*.ts" --include="*.tsx" src/

# 동일한 매개변수 패턴
grep -r "function.*\(.*id.*\)" --include="*.ts" --include="*.tsx" src/
grep -r "function.*\(.*data.*\)" --include="*.ts" --include="*.tsx" src/
```

#### Step 5: 반환 타입 분석
```bash
# Promise 반환
grep -r ": Promise<" --include="*.ts" --include="*.tsx" src/

# NextResponse 반환
grep -r ": NextResponse\|Promise<NextResponse>" --include="*.ts" --include="*.tsx" src/
```

### Phase 3: 컴포넌트 중복 검색 (Medium Priority)

#### Step 6: 유사 컴포넌트 찾기
```bash
# 버튼/카드/모달 컴포넌트들
find src -name "*[Bb]utton*" -o -name "*[Bb]tn*"
find src -name "*[Cc]ard*" -o -name "*[Pp]anel*" -o -name "*[Bb]ox*"
find src -name "*[Mm]odal*" -o -name "*[Dd]ialog*" -o -name "*[Pp]opup*"

# shadcn/ui 우선 사용 원칙 준수
```

### Phase 4: Import 분석

#### Step 7: Import 패턴 분석
```bash
# 같은 모듈을 다르게 import
grep -r "^import.*from '@/lib" --include="*.ts" --include="*.tsx" src/ | sort | uniq -c | sort -rn

# 중복 import
grep -r "^import.*from" --include="*.ts" --include="*.tsx" src/ | awk -F'from' '{print $2}' | sort | uniq -c | sort -rn | head -20
```

### Phase 5: 통합 및 제거

#### Step 8: 중복 매트릭스 작성
| 기능 | 위치 1 | 위치 2 | 위치 3 | 유사도 | 권장 조치 |
|------|--------|--------|--------|--------|-----------|
| [발견된 중복 기록] | | | | | |

#### Step 9: 안전한 통합 실행
1. Git 백업 커밋
2. 사용처 확인
3. 단계적 통합
4. 테스트 실행
5. 빌드 확인

## ✅ 완료 조건

### 🔴 필수 완료 조건 (하나라도 미충족 시 미완료)
```bash
# 1. 중복 제거 완료
- [ ] Critical Priority (인증/API) 중복 100% 제거
- [ ] High Priority (유틸리티) 중복 90% 이상 제거
- [ ] Medium Priority (컴포넌트) 중복 80% 이상 제거

# 2. 빌드 성공
- [ ] npm run build → 성공
- [ ] npm run types:check → 에러 0개
- [ ] npx biome check → 통과

# 3. 실제 브라우저 테스트
- [ ] npm run dev → http://localhost:3000
- [ ] 모든 기능 정상 작동 확인
- [ ] 개발자 도구 Console → 에러 0개
- [ ] Network 탭 → API 호출 성공

# 4. 프로젝트 규칙 준수
- [ ] any 타입 사용 0개
- [ ] @/types에서만 import
- [ ] api-client.ts 통일 사용
- [ ] 임시방편 코드 0개
```

### 🟡 권장 완료 조건
- [ ] 코드 라인 수 30% 이상 감소
- [ ] 번들 크기 20% 이상 감소
- [ ] Import 경로 일관성
- [ ] 문서 업데이트

## 📋 QA 테스트 시나리오

### 🔴 필수: 실제 사용자 플로우 테스트
```markdown
# 1. 개발 서버 실행
npm run dev

# 2. 브라우저 테스트 (http://localhost:3000)
정상 플로우:
1. 로그인 기능 테스트
   - [ ] 카카오 로그인 → 정상 작동
   - [ ] 세션 유지 → 확인
   - [ ] 로그아웃 → 정상 작동

2. API 호출 테스트
   - [ ] YouTube Lens 검색 → 정상 작동
   - [ ] 수익 인증 CRUD → 정상 작동
   - [ ] 커뮤니티 게시글 → 정상 작동

3. 데이터 변환 테스트
   - [ ] snake_case ↔ camelCase 변환 정상
   - [ ] 날짜 포맷팅 정상
   - [ ] 숫자 포맷팅 정상
```

### 🔴 필수: 중복 제거 검증
```markdown
# 중복 제거 전후 비교
1. 코드 라인 수
   - 제거 전: [기록]
   - 제거 후: [기록]
   - 감소율: [%]

2. 번들 크기
   - 제거 전: [기록]
   - 제거 후: [기록]
   - 감소율: [%]

3. 기능 테스트
   - [ ] 모든 페이지 정상 로드
   - [ ] 모든 API 정상 응답
   - [ ] 모든 컴포넌트 정상 렌더링
```

### 🟡 권장: 성능 측정
```markdown
# Chrome DevTools → Lighthouse
- [ ] Performance: 개선됨
- [ ] Bundle Size: 감소됨
- [ ] Load Time: 단축됨
```

## 🔄 롤백 계획

### 백업 체크리스트
- [ ] Git 커밋 해시 기록: [커밋해시]
- [ ] 변경 파일 목록 기록
- [ ] 삭제 파일 백업

### 롤백 트리거 조건
- 빌드 실패 3회 이상
- 핵심 기능 작동 불가
- 타입 에러 급증

### 롤백 절차
```bash
# 1. 이전 커밋으로 복원
git reset --hard [백업_커밋해시]

# 2. 의존성 재설치
npm install

# 3. 빌드 확인
npm run build

# 4. 테스트 실행
npm run test
```

### 부분 롤백 전략
- 특정 Phase만 롤백
- Critical 우선순위만 유지
- 점진적 재적용

## 📊 성과 측정

### 정량적 지표
| 지표 | Before | After | 개선율 |
|------|--------|-------|--------|
| 코드 라인 수 | [측정] | [측정] | [%] |
| 번들 크기 | [KB] | [KB] | [%] |
| 중복 함수 수 | [개] | [개] | [%] |
| Import 수 | [개] | [개] | [%] |

### 정성적 지표
- [ ] 코드 가독성 향상
- [ ] 유지보수성 개선
- [ ] 디버깅 용이성 증가
- [ ] 일관성 향상

### ROI 계산
- 투입 시간: [시간]
- 향후 절감 시간: [시간/월]
- ROI: [%]

## 🚨 주의사항

1. **삭제 전 반드시 사용처 확인**
   - 미묘한 차이가 있을 수 있음
   - 모든 import와 사용처 확인

2. **단계적 적용**
   - Critical → High → Medium → Low 순서
   - 각 단계 완료 후 테스트

3. **프로젝트 규칙 준수**
   - any 타입 절대 금지
   - 임시방편 해결 금지
   - 실제 작동 확인 필수

4. **Git 백업 필수**
   - 각 Phase별 커밋
   - 의미 있는 커밋 메시지

---

*이 지시서는 Dhacle 프로젝트의 중복 코드를 체계적으로 제거하기 위한 완전한 가이드입니다.*
*Context 없는 AI도 이 문서만으로 작업 수행이 가능하도록 작성되었습니다.*