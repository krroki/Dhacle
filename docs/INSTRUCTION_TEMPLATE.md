# 📝 디하클 지시서 템플릿 (Instruction Template)

*Claude Code에게 정확한 지시를 생성하기 위한 메타-템플릿*

---

## 🎯 사용법
```
"[작업 내용] 구현하고 싶어. INSTRUCTION_TEMPLATE.md 읽고 지시서 작성해줘"
```

---

## 🚀 작업별 SC 명령어 & 플래그 매핑

| 작업 유형 | SC 명령어 | 필수 플래그 | 선택 플래그 |
|----------|----------|------------|------------|
| **UI 컴포넌트** | `/sc:implement` | `--seq --validate --c7` | `--magic` |
| **API 연결** | `/sc:implement` | `--seq --validate --think` | `--delegate` |
| **페이지 생성** | `/sc:build` | `--seq --validate --c7 --magic` | `--wave-mode` |
| **버그 수정** | `/sc:fix` | `--seq --validate --think` | `--introspect` |
| **리팩토링** | `/sc:improve` | `--seq --validate --think-hard` | `--loop` |
| **문서 분석** | `/sc:analyze` | `--seq --ultrathink --delegate` | `--uc` |

---

## 📋 3단계 지시서 템플릿

### 🔵 Phase 1: Pre-Flight Check (필수 확인)
```markdown
## 작업 전 필수 확인
다음 문서를 Read하고 관련 섹션 인용:
1. ROUTE_SPEC.md → [작업 페이지] 라우트 구조
2. COMPONENT_INVENTORY.md → 재사용 가능 컴포넌트
3. WIREFRAME.md → UI-API 연결 상태
4. FLOWMAP.md → 페이지 네비게이션
5. STATE_FLOW.md → 상태 관리 방식

각 문서에서 "[작업 내용]" 관련 섹션 복사해서 보여줘.
```

### 🟢 Phase 2: Implementation (구현)
```markdown
## 구현 지시
[작업 내용] 구현:
1. COMPONENT_INVENTORY 확인 → 재사용 vs 신규
2. WIREFRAME 참조 → API 연결 필수
3. ERROR_BOUNDARY 적용 → 401/403/500 처리
4. STATE_FLOW 준수 → 로딩/에러 상태

구현하며 각 문서 "구현 상태" 업데이트:
- ✅ 완료 / ⚠️ 부분 / ❌ 미구현 / 🔄 진행중
```

### 🔴 Phase 3: Validation (검증)
```markdown
## 구현 후 검증
CHECKLIST.md 실행:
1. 모든 버튼 → 실제 API 호출?
2. 401 에러 → 로그인 리다이렉트?
3. 로딩 상태 → 스피너 표시?
4. Header/Sidebar → 메뉴 동기화?

❌ 항목 발견 시 즉시 수정
```

---

## 🏗️ 프로젝트 컨텍스트

### 기술 스택
- **Frontend**: Next.js 15.4.6, TypeScript, shadcn/ui, Tailwind
- **Backend**: Supabase (PostgreSQL), Next.js API Routes
- **State**: Zustand (global), useState (local), Supabase (server)
- **Auth**: Kakao OAuth 2.0 + Supabase Auth

### 핵심 원칙
1. **UI만 만들지 말것** → 반드시 백엔드 연결
2. **에러만 표시 금지** → 401은 로그인 리다이렉트
3. **컴포넌트 재사용** → COMPONENT_INVENTORY 확인
4. **일관성 유지** → Header/Sidebar 동기화

### 보안 필수사항
- 모든 API Route: 세션 검사 (user 체크)
- 클라이언트: api-client.ts 래퍼 사용
- 에러 응답: `{ error: string }` 형식

---

## 📌 작업 유형별 템플릿

### 1️⃣ UI 컴포넌트 생성
```
/sc:implement --seq --validate --c7 --magic

Phase 1: COMPONENT_INVENTORY.md에서 [컴포넌트명] 검색
Phase 2: 없으면 생성, 있으면 재사용
Phase 3: WIREFRAME.md에 API 연결 추가
```

### 2️⃣ API 엔드포인트 연결
```
/sc:implement --seq --validate --think

Phase 1: WIREFRAME.md에서 [페이지] 섹션 확인
Phase 2: DATA_MODEL.md 참조하여 타입 매핑
Phase 3: ERROR_BOUNDARY.md 에러 처리 적용
```

### 3️⃣ 새 페이지 생성
```
/sc:build --seq --validate --c7 --magic

Phase 1: ROUTE_SPEC.md에 라우트 추가
Phase 2: FLOWMAP.md에 네비게이션 추가
Phase 3: 모든 문서에 페이지 정보 추가
```

### 4️⃣ 버그 수정
```
/sc:fix --seq --validate --think

Phase 1: 관련 문서에서 ❌ 항목 찾기
Phase 2: ERROR_BOUNDARY.md 참조하여 수정
Phase 3: 구현 상태 ✅로 업데이트
```

---

## 🔥 즉시 사용 가능한 지시 예시

### YouTube Lens 검색바 구현
```bash
/sc:implement --seq --validate --c7 --magic

Phase 1: 문서 확인
- COMPONENT_INVENTORY.md → SearchBar 컴포넌트 있는지
- WIREFRAME.md → /tools/youtube-lens 검색바 API
- STATE_FLOW.md → searchQuery 상태 관리

Phase 2: 구현
- SearchBar 컴포넌트 생성/재사용
- POST /api/youtube/search 연결
- 로딩/에러 상태 추가

Phase 3: 검증
- 실제 검색 동작 테스트
- 401 에러 시 로그인 리다이렉트
- 문서 구현 상태 업데이트
```

### 인증 체크 누락 수정
```bash
/sc:fix --seq --validate --think

Phase 1: ROUTE_SPEC.md에서 "인증: ✅" 페이지 찾기
Phase 2: 해당 페이지에 세션 체크 추가
Phase 3: ERROR_BOUNDARY.md 401 처리 적용
```

---

## 📊 문서 참조 우선순위

1. **작업 시작**: ROUTE_SPEC → FLOWMAP → WIREFRAME
2. **구현 중**: COMPONENT_INVENTORY → STATE_FLOW → DATA_MODEL
3. **에러 처리**: ERROR_BOUNDARY → CHECKLIST
4. **검증**: CHECKLIST → 모든 문서 ❌ 항목

---

## ⚠️ Claude Code 함정 회피

| 함정 | 회피 방법 |
|------|----------|
| UI만 구현 | WIREFRAME.md API 연결 강제 |
| 에러만 표시 | ERROR_BOUNDARY.md 리다이렉트 |
| 복사-붙여넣기 | COMPONENT_INVENTORY.md 재사용 |
| 일관성 없음 | Header/Sidebar 동기화 체크 |

---

*이 템플릿으로 Claude Code에게 정확한 지시 생성 가능*