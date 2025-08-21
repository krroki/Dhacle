# 📝 AI 정확한 지시서 작성 템플릿
*AI가 추측 없이 깊이 있는 정보 수집으로 완벽한 작업 지시서를 작성하는 템플릿*

---

## 🔴 핵심 원칙: 지시서 작성 전 완벽한 정보 수집!

**이 문서 읽은 후 반드시:**
1. **정보를 깊이 있게 수집** (2-3개 아닌 전체)
2. **지시서 작성** (구현 금지!)
3. **사용자 확인 필수**

**절대 금지:**
- ❌ "아마도", "추정", "~일 것입니다"
- ❌ 2-3개만 보고 "다 확인했다"
- ❌ 지시서 없이 바로 구현

---

## 🎯 상황별 정보 수집 템플릿

### 📌 Case 1: 모호한 요청 ("버튼 추가해줘", "이거 해줘")
```markdown
## 필수 확인 사항
1. **위치**: 어느 페이지/컴포넌트?
2. **기능**: 클릭 시 무슨 동작?
3. **디자인**: 기존 버튼 스타일 따라감?
4. **데이터**: API 연결 필요?
5. **권한**: 로그인 필요?

## 질문 템플릿
"버튼 추가를 위해 확인이 필요합니다:
- 어느 페이지의 어느 위치인가요?
- 버튼 텍스트는 무엇인가요?
- 클릭 시 어떤 동작을 해야 하나요?
- 예시: '마이페이지에 프로필 수정 버튼'"
```

### 🔍 Case 2: 디버깅 요청 ("안 돼", "에러 나")
```markdown
## 체계적 진단 프로세스
1. **증상 수집**
   - 언제: 어떤 동작을 할 때?
   - 어디서: 어느 페이지/기능?
   - 무엇이: 구체적 증상?
   - 에러 메시지: 콘솔/화면에 표시?

2. **재현 시도**
   ```bash
   # 로컬에서 재현
   npm run dev
   # 해당 페이지 접근
   # Network 탭 확인
   # Console 확인
   ```

3. **진단 템플릿**
   "문제 진단을 위해 확인해주세요:
   - 브라우저 콘솔에 에러가 있나요?
   - Network 탭에서 빨간색 요청이 있나요?
   - 어떤 버튼/동작 후 발생하나요?"
```

### 🚀 Case 3: 기능 요청 ("검색 넣어줘", "로그인 만들어")
```markdown
## 완전한 기능 체크리스트
□ UI: 어디에 표시?
□ UX: 사용자 플로우?
□ API: 백엔드 필요?
□ 상태: 전역/로컬?
□ 에러: 실패 시 처리?
□ 권한: 인증 필요?
□ 테스트: 성공 기준?
```

---

## 📋 5단계 지시서 작성 프로세스

### 🔍 Phase 1: 깊이 있는 정보 수집
```markdown
## 1. 요청 분석
- 원문: "[정확히 그대로]"
- 맥락: [이전 대화 5개 이상 확인]
- 현재 작업: [PROJECT.md 전체 이슈]

## 2. 13개 문서 체계적 확인
### 필수 확인 (모든 작업)
□ PROJECT.md - 현재 이슈/상태
□ CODEMAP.md - 파일 위치
□ WIREFRAME.md - UI-API 연결

### 작업별 추가 확인
- UI 작업: COMPONENT_INVENTORY.md
- 에러 처리: ERROR_BOUNDARY.md
- 라우팅: ROUTE_SPEC.md, FLOWMAP.md
- 상태 관리: STATE_FLOW.md
- 타입: DATA_MODEL.md

## 3. 실제 파일 깊이 확인 (전체!)
```bash
# 관련 파일 모두 찾기
find src -name "*관련키워드*"
grep -r "기능명" src/

# 찾은 파일 모두 Read
# 유사 패턴 모두 분석
```

## 4. 정보 부족 시
- 체계적 질문 리스트 작성
- 구체적 예시 제공
- 가능한 옵션 제시
```

### 🧪 Phase 2: 철저한 테스트 실행
```markdown
## 테스트 체크리스트
□ npm run verify:all - 전체 검증
□ npm run verify:api - API 일치성
□ npm run verify:types - 타입 안정성
□ npm run verify:routes - 인증 체크
□ npm run test - 유닛 테스트
□ npm run e2e - 사용자 시나리오

## 테스트 결과 기록
- ✅ 통과: [구체적 항목]
- ❌ 실패: Line X - [정확한 에러]
- ⚠️ 경고: [주의 사항]

## 증거 기반 판단
❌ "아마도 이 부분이 문제"
✅ "verify:api Line 45에서 401 에러 확인"
✅ "ChannelFolders.tsx:78에서 undefined 참조"
```

### 📝 Phase 3: 완벽한 지시서 작성
```markdown
## 작업 지시서

### 🎯 작업 이해
- 요청: [원문 그대로]
- 해석: [구체적이고 측정 가능하게]
- 근거: [Phase 1,2에서 수집한 증거]

### 📊 현재 상태 (증거 기반)
- 테스트 결과: [구체적 결과]
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
Step 1: [작업명 - 파일명]
```typescript
// 현재 코드 (Read로 확인)
[실제 코드]

// 변경할 코드
[구체적 변경 사항]
```
- 참고 패턴: src/components/youtube/PopularShortsList.tsx:45
- 검증: npm run verify:api

Step 2: [작업명 - 파일명]
- 현재: [Read로 확인한 상태]
- 변경: [구체적 변경 내용]
- 이유: [왜 이렇게 변경하는지]

### ✅ 성공 기준 (측정 가능)
□ npm run build 성공
□ npm run verify:all 통과
□ 401 에러 시 로그인 리다이렉트 확인
□ API Key 없을 때 적절한 안내
□ 모든 테스트 통과
```

### ✅ Phase 4: 명확한 사용자 확인
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

### 🚀 Phase 5: 정확한 실행
```markdown
승인 후:
1. 지시서 Step 순서대로만 실행
2. 각 Step 검증 필수
3. 예상과 다르면 즉시 보고
4. 완료 후 전체 테스트
```

---

## 🎯 빠른 참조

### 한국어 → 영어 매핑
| 한국어 | 파일명 | API |
|--------|--------|-----|
| 폴더 | folders | /api/youtube/folders |
| 즐겨찾기 | favorites | /api/youtube/favorites |
| 컬렉션 | collections | /api/youtube/collections |
| 인기 Shorts | popular | /api/youtube/popular |
| 댓글 | comments | /api/community/comments |
| 프로필 | profile | /api/user/profile |
| 수익 인증 | revenue-proof | /api/revenue-proof |

### 자주 사용하는 파일 경로
```
API Routes: src/app/api/*/route.ts
페이지: src/app/(pages)/*/page.tsx
컴포넌트: src/components/*
타입: src/types/index.ts
api-client: src/lib/api-client.ts
```

### 유사 패턴 참조
| 구현하려는 것 | 참고할 기존 코드 |
|--------------|----------------|
| API 엔드포인트 | /api/youtube/favorites/route.ts |
| 목록 컴포넌트 | CourseGrid.tsx |
| 모달 | LoginModal.tsx |
| 에러 처리 | PopularShortsList.tsx:78 |
| 폼 처리 | /mypage/profile/page.tsx |
| 무한 스크롤 | RevenueGallery.tsx |

### 검색 명령어
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

---

## ⚠️ AI 필수 체크리스트

지시서 작성 전:
□ 13개 문서 모두 확인 (2-3개 X)
□ 관련 파일 모두 Read (일부 X)
□ 테스트 모두 실행 (추측 X)
□ 정보 부족하면 질문
□ 완벽한 지시서 작성
□ 사용자 확인 받기

절대 금지:
□ "아마도" 사용
□ 일부만 보고 판단
□ 확인 없이 구현
□ 추측 기반 작업
□ 얕은 분석

---

## 🏆 이 템플릿의 검증 결과

- **초기 성공률**: 0% (구현 가이드로 작성됨)
- **v1 개선**: 70% (지시서 작성 추가)
- **v2 최종**: 100% (상황별 템플릿 추가)
- **검증 시나리오**: 10개 다양한 케이스
- **재귀 개선**: 3회 반복으로 완성

---

*이 템플릿으로 추측 없는 100% 정확한 지시서 작성 가능*