# 📝 AI 구현 성공률 100% 달성 템플릿 v4.0

*100% 성공하는 구현을 위한 완벽한 지시서 작성 템플릿*

---

## 🎯 핵심 원칙: 완벽한 구현을 위한 5단계 프로세스

**이 문서의 목적**: 개발 지식 없는 사용자의 요청도 **100% 성공하는 구현**으로 만들기

**절대 규칙**:
- ✅ 깊이 있는 분석 (2-3개 X, 전체 O)
- ✅ 증거 기반 작업 (추측 X, 테스트 O)
- ✅ 완전한 구현 (컴포넌트만 X, 전체 시스템 O)
- ❌ "아마도", "추정", "~일 것입니다" 절대 금지

---

## 📋 5단계 구현 프로세스

### 🔍 Phase 1: 깊이 있는 정보 수집 (강화)

```markdown
## 1. 요청 완전 분석
- 원문: "[사용자 요청 그대로 기록]"
- 맥락: [이전 대화 5개 이상 확인]
- 현재 이슈: [PROJECT.md 전체 확인]

## 2. 13개 문서 체계적 확인
### 필수 확인 (모든 작업)
□ PROJECT.md - 현재 이슈/상태
□ CODEMAP.md - 파일 위치
□ WIREFRAME.md - UI-API 연결
□ CLAUDE.md - AI 작업 규칙

### 작업별 추가 확인
- UI: COMPONENT_INVENTORY.md
- 에러: ERROR_BOUNDARY.md
- 라우팅: ROUTE_SPEC.md, FLOWMAP.md
- 상태: STATE_FLOW.md
- 타입: DATA_MODEL.md

## 3. VIBE_CODING 검증 실행
```bash
# 8종 검증 시스템 활용
npm run verify:all         # 전체 검증
npm run verify:api         # API 일치성
npm run verify:types       # 타입 안정성
npm run verify:routes      # 라우트 보호
npm run verify:ui          # UI 일관성
```

## 4. 실제 파일 깊이 확인 (10개 이상!)
```bash
# 관련 파일 모두 찾기
find src -name "*키워드*" | head -20
grep -r "기능명" src/ --include="*.tsx" --include="*.ts"

# 찾은 파일 모두 Read (일부 X, 전체 O)
# 유사 패턴 5개 이상 분석
```

## 5. 정보 부족 시 체계적 질문
```markdown
확인이 필요합니다:
1. [구체적 질문 1] - 예시: 마이페이지의 프로필 섹션
2. [구체적 질문 2] - 예시: 클릭 시 모달 열기
3. [가능한 옵션 제시] - A안: ..., B안: ...
```
```

### 🧪 Phase 2: 철저한 테스트 실행 (강화)

```markdown
## 테스트 체크리스트
□ npm run verify:all - 전체 검증
□ npm run verify:api - API 일치성  
□ npm run verify:types - 타입 안정성
□ npm run verify:routes - 인증 체크
□ npm run test - 유닛 테스트
□ npm run build - 빌드 성공

## 테스트 결과 기록 (증거 필수!)
### 통과한 테스트
✅ verify:api - 38/38 routes 표준화 확인
✅ verify:types - any 타입 0개 확인

### 실패한 테스트
❌ verify:routes Line 45 - 401 에러 발생
  원인: ChannelFolders.tsx:78에서 undefined 참조
  해결: 401 처리 로직 추가 필요

### 추측 방지 체크
❌ "아마도 이 부분이 문제" → 즉시 중단!
✅ "verify:api Line 45에서 401 에러 확인됨"
✅ "ChannelFolders.tsx:78에서 undefined 발생"
```

### 📝 Phase 3: 완벽한 지시서 작성 (유지)

```markdown
## 작업 지시서

### 🎯 작업 이해
- 요청: [원문 그대로]
- 해석: [구체적이고 측정 가능하게]
- 근거: [Phase 1,2에서 수집한 증거]

### 📊 현재 상태 (증거 기반)
- 테스트 결과: [verify:* 결과]
- 기존 코드: [Read로 확인한 내용]
- 문서 상태: [13개 문서 확인 결과]

### 🔧 작업 범위
✅ 포함 (파일명까지 구체적으로):
1. src/components/youtube/ChannelFolders.tsx - 401 처리 수정
2. src/app/api/youtube/folders/route.ts - 에러 응답 개선
3. docs/WIREFRAME.md - 구현 상태 업데이트

❌ 제외 (명확히):
1. 다른 컴포넌트의 401 처리 (범위 밖)
2. API Key 설정 UI (별도 작업)

🔗 자동으로 필요한 연관 작업:
1. 테스트 파일 업데이트
2. 타입 정의 수정
3. 문서 동기화

### 📋 구체적 작업 단계
Step 1: [작업명] - [파일명:라인]
```typescript
// 현재 코드 (Read로 확인)
const data = await apiGet('/api/youtube/folders');

// 변경할 코드
try {
  const data = await apiGet('/api/youtube/folders');
} catch (error) {
  if (error instanceof ApiError && error.status === 401) {
    router.push('/auth/login');
  }
}
```
- 참고 패턴: src/components/youtube/PopularShortsList.tsx:45
- 검증: npm run verify:api

Step 2: [다음 작업]
[구체적 내용]

### ✅ 성공 기준 (측정 가능)
□ npm run build 성공
□ npm run verify:all 모두 통과
□ 401 에러 시 로그인 리다이렉트 확인
□ API Key 없을 때 적절한 안내
□ 모든 테스트 통과
```

### ✅ Phase 4: 명확한 사용자 확인 (유지)

```markdown
## 📋 작업 지시서 검토

**수집한 정보:**
- 현재 문제: [테스트로 확인한 구체적 문제]
- 원인: [코드에서 확인한 정확한 원인]
- 영향 범위: [정확한 파일과 기능]

**작업 계획:**
1. ChannelFolders.tsx - 401 에러 처리 개선 (15줄 수정)
2. ERROR_BOUNDARY.md 패턴 적용 (5줄 추가)
3. 테스트 추가 (20줄)

**예상 결과:**
- 로그인 필요 시: 자동 리다이렉트
- API Key 없을 때: 설정 안내
- 정상 상태: 폴더 목록 표시

**위험 요소:**
- 다른 401 처리와 일관성 필요
- 세션 만료 케이스 고려

이대로 진행할까요?
✅ 승인 → 작업 시작
❌ 수정 필요 → 어느 부분을 수정할까요?
❓ 추가 확인 → 무엇을 더 확인할까요?
```

### 🚀 Phase 5: 정확한 실행 (유지)

```markdown
승인 후:
1. 지시서 Step 순서대로 실행
2. 각 Step 후 검증
   - npm run verify:quick
   - 관련 테스트 실행
3. 예상과 다르면 즉시 보고
4. 완료 후 전체 테스트
   - npm run verify:all
   - npm run build
   - npm run test
```

---

## 🎯 상황별 대응 템플릿

### 📌 Case 1: 모호한 요청 ("버튼 추가해줘")
```markdown
## 필수 확인 사항
1. **위치**: 어느 페이지/컴포넌트?
2. **기능**: 클릭 시 무슨 동작?
3. **디자인**: 기존 스타일 따라감?
4. **데이터**: API 연결 필요?
5. **권한**: 로그인 필요?

## 질문 템플릿
"버튼 추가를 위해 확인이 필요합니다:
- 어느 페이지의 어느 위치인가요?
- 버튼 텍스트는 무엇인가요?
- 클릭 시 어떤 동작을 해야 하나요?
예시: '마이페이지에 프로필 수정 버튼'"
```

### 🔍 Case 2: 디버깅 요청 ("안 돼", "에러 나")
```markdown
## 체계적 진단 프로세스
1. **증상 수집**
   - 언제: 어떤 동작 할 때?
   - 어디서: 어느 페이지/기능?
   - 무엇이: 구체적 증상?

2. **재현 시도**
   ```bash
   npm run dev
   # 해당 페이지 접근
   # Network 탭 확인
   # Console 확인
   ```

3. **자동 진단**
   ```bash
   npm run verify:all
   npm run test
   ```
```

### 🚀 Case 3: 기능 요청 ("검색 넣어줘")
```markdown
## 완전한 기능 체크리스트
□ UI: 어디에 표시?
□ UX: 사용자 플로우?
□ API: 백엔드 필요?
□ 상태: 전역/로컬?
□ 에러: 실패 시 처리?
□ 권한: 인증 필요?
□ 테스트: 성공 기준?

## VIBE_CODING 활용
- shadcn/ui 컴포넌트 확인
- 기존 검색 패턴 참조
- MSW 모킹 준비
```

---

## 🛠 VIBE_CODING 시스템 통합

### 자동 활용 도구
```bash
# 검증 도구 (8종)
npm run verify:*

# 자동 수정
npm run fix:missing-apis
npm run fix:typescript-errors
npm run lint:biome:fix

# 테스트
npm run test
npm run e2e
```

### 필수 체크 문서
```
13개 핵심 문서:
CLAUDE.md, PROJECT.md, CODEMAP.md,
CHECKLIST.md, DOCUMENT_GUIDE.md,
INSTRUCTION_TEMPLATE.md, FLOWMAP.md,
WIREFRAME.md, COMPONENT_INVENTORY.md,
ROUTE_SPEC.md, STATE_FLOW.md,
DATA_MODEL.md, ERROR_BOUNDARY.md
```

---

## ⚠️ AI 추측 방지 체크리스트

### 금지어 자동 감지
```
❌ "아마도" → 즉시 중단, 재조사
❌ "추정" → 테스트로 검증
❌ "~일 것입니다" → 코드로 확인
❌ "대충", "적당히" → 전체 확인
```

### 깊이 검증
```
❌ 파일 2-3개만 → 10개 이상 확인
❌ "다 확인했습니다" → 파일명 나열
❌ 테스트 없이 판단 → verify:* 필수
```

### 증거 기록 의무
```
✅ 파일명:라인번호
✅ 테스트 명령어와 결과
✅ 에러 메시지 전문
✅ 검증 도구 실행 결과
```

---

## 🎯 빠른 참조

### 파일 경로 매핑
| 한국어 | 영어 | 경로 |
|--------|------|------|
| 폴더 | folders | /api/youtube/folders |
| 즐겨찾기 | favorites | /api/youtube/favorites |
| 컬렉션 | collections | /api/youtube/collections |
| 인기 Shorts | popular | /api/youtube/popular |

### 자주 사용하는 검색 명령어
```bash
# API 찾기
grep -r "폴더\|folder" src/app/api

# 컴포넌트 찾기  
find src/components -name "*.tsx" | xargs grep "export"

# 타입 찾기
grep -r "interface.*Video\|type.*Video" src/types

# 에러 위치 찾기
grep -r "User not authenticated" src/

# 비슷한 패턴 찾기
grep -r "POST.*request" src/app/api
```

### 유사 패턴 참조
| 구현하려는 것 | 참고할 기존 코드 |
|--------------|----------------|
| API 엔드포인트 | /api/youtube/favorites/route.ts |
| 목록 컴포넌트 | CourseGrid.tsx |
| 모달 | LoginModal.tsx |
| 에러 처리 | PopularShortsList.tsx:78 |
| 폼 처리 | /mypage/profile/page.tsx |

---

## ✅ Phase별 체크포인트

### Phase 1 완료 체크
□ 13개 문서 모두 확인
□ 파일 10개 이상 Read
□ verify:* 실행 완료
□ 유사 패턴 5개 이상 분석

### Phase 2 완료 체크
□ 모든 테스트 실행
□ 실패 원인 정확히 기록
□ 증거 캡처 완료

### Phase 3 완료 체크
□ 작업 범위 명확
□ 구체적 단계 작성
□ 성공 기준 측정 가능

### Phase 4 완료 체크
□ 사용자 확인 대기
□ 위험 요소 명시
□ 예상 결과 구체적

### Phase 5 완료 체크
□ 지시서대로 실행
□ 각 단계 검증
□ 전체 테스트 통과

---

## 🏆 성공 기준

- **정보 수집**: 파일 10개 이상, 문서 5개 이상
- **테스트 실행**: verify:all 100% 실행
- **지시서 작성**: 모든 템플릿 활용
- **사용자 확인**: 100% 승인 대기
- **구현 완료**: 모든 테스트 통과

---

*이 템플릿으로 100% 성공하는 구현 달성 가능*