# 📚 문서 체계 가이드

*14개 핵심 문서 관리, 작성 규칙, 역할 경계 준수*

---

## 🛑 문서 작업 3단계 필수 규칙

### 1️⃣ STOP - 즉시 중단 신호
- **CONTEXT_BRIDGE.md 미확인 → 중단**
- **중복 내용 작성 시도 → 중단**
- **오래된 정보 방치 → 중단**
- **실제 동작 확인 없는 문서화 → 중단**

### 2️⃣ MUST - 필수 행동
```markdown
# 문서 작성 시 필수
1. CONTEXT_BRIDGE.md 먼저 확인 (반복 실수 방지)
2. 각 문서 역할 경계 준수
3. 실제 작동 확인 후 문서화
4. 최신 7개 변경사항만 유지
```

### 3️⃣ CHECK - 검증 필수
```bash
# 문서 업데이트 후
- 중복 내용 확인
- 날짜 기록 확인
- 실제 기능 작동 확인
- 참조 링크 유효성 확인
```

## 🚫 문서 any 타입 금지
- 코드 예시에 any 타입 사용 금지
- 구체적 타입 예시만 제공

---

## 🚨 14개 핵심 문서 체계

### 필수 확인 순서
1. 🔥 `/docs/CONTEXT_BRIDGE.md` - **최우선!** 반복 실수 패턴 + 예방책
2. 📊 `/docs/PROJECT.md` - 프로젝트 현황 (Phase 1-4 완료)
3. 🗺️ `/docs/CODEMAP.md` - 프로젝트 구조
4. ✅ `/docs/CHECKLIST.md` - 작업 검증 (12개 검증 스크립트)
5. 📖 `/docs/DOCUMENT_GUIDE.md` - 문서 작성 가이드
6. 🎯 `/docs/INSTRUCTION_TEMPLATE.md` - 지시 템플릿
7. 🔄 `/docs/FLOWMAP.md` - 사용자 플로우
8. 🔌 `/docs/WIREFRAME.md` - UI-API 연결
9. 🧩 `/docs/COMPONENT_INVENTORY.md` - 컴포넌트 목록
10. 📍 `/docs/ROUTE_SPEC.md` - 라우트 구조
11. 💾 `/docs/STATE_FLOW.md` - 상태 관리 (React Query + Zustand)
12. 📦 `/docs/DATA_MODEL.md` - 데이터 모델
13. 🚨 `/docs/ERROR_BOUNDARY.md` - HTTP 에러 처리
14. 🎯 `/docs/INSTRUCTION_TEMPLATE_v16.md` - 최신 템플릿

---

## 📝 문서 작성 규칙

### 중복 방지 원칙
- 각 문서는 고유한 역할과 책임을 가짐
- 중복 내용 작성 금지
- 참조가 필요한 경우 링크 사용

### 문서별 역할 경계
| 문서 | 역할 | 금지사항 |
|------|------|----------|
| CLAUDE.md | AI 작업 지침 | 프로젝트 상태, 이슈 현황 |
| CONTEXT_BRIDGE.md | 반복 실수 방지 | 일반적인 지침 |
| PROJECT.md | 프로젝트 현황 | 상세 기술 스펙 |
| CODEMAP.md | 파일 구조 | 구현 상태, 이슈 |
| WIREFRAME.md | UI-API 연결 | 코드 구현 상세 |

### 최신 정보 유지
- 최신 7개 변경사항만 유지
- 오래된 정보는 삭제
- 날짜 기록 필수

---

## 🔄 문서 업데이트 시점

### 즉시 업데이트
| 상황 | 업데이트 문서 |
|------|-------------|
| 새 컴포넌트 생성 | COMPONENT_INVENTORY.md |
| 새 라우트 추가 | ROUTE_SPEC.md |
| API 연결 구현 | WIREFRAME.md |
| 에러 처리 추가 | ERROR_BOUNDARY.md |
| 상태 관리 변경 | STATE_FLOW.md |
| 반복 실수 발생 | CONTEXT_BRIDGE.md |

### 주기적 업데이트
- PROJECT.md: 매주 금요일
- CHECKLIST.md: 검증 스크립트 추가 시
- DOCUMENT_GUIDE.md: 문서 체계 변경 시

---

## 📋 템플릿 활용

### 지시서 템플릿
```markdown
# 작업 지시서

## 목표
[명확한 목표 기술]

## 현재 상태
[현재 구현 상태]

## 요구사항
- [ ] 요구사항 1
- [ ] 요구사항 2

## 제약사항
- 금지사항 1
- 주의사항 2

## 참고자료
- 관련 문서 링크
- 예시 코드
```

### 이슈 보고 템플릿
```markdown
## 이슈 요약
[한 줄 요약]

## 재현 방법
1. 단계 1
2. 단계 2

## 예상 동작
[정상 동작]

## 실제 동작
[오류 동작]

## 환경
- OS: 
- Node: 
- 브라우저:
```

---

## 🚫 문서 작성 금지사항

### 절대 금지
- ❌ README 파일 임의 생성
- ❌ 사용자 협의 없이 문서 생성
- ❌ 추측성 내용 작성
- ❌ 중복 내용 복사-붙여넣기
- ❌ 역할 경계 침범

### 작성 시 주의
- ⚠️ 실제 구현 상태 반영
- ⚠️ 날짜 기록 필수
- ⚠️ 최신 정보 우선
- ⚠️ 명확한 한국어 사용

---

## 📊 문서 현황 체크

### 완성도 체크리스트
- [ ] 14개 핵심 문서 모두 존재
- [ ] 각 문서 역할 경계 준수
- [ ] 중복 내용 제거
- [ ] 최신 정보로 업데이트
- [ ] 상호 참조 링크 정상

### 문서별 상태
```bash
# 문서 체크 스크립트
node scripts/check-documentation.js

# 출력 예시:
📚 문서 상태 검사:
✅ CONTEXT_BRIDGE.md (최신)
✅ PROJECT.md (1일 전 업데이트)
⚠️  CODEMAP.md (7일 이상 미업데이트)
❌ MISSING_DOC.md (존재하지 않음)
```

---

## 🎯 문서 우선순위

### 작업 시작 시
1. CONTEXT_BRIDGE.md - 반복 실수 확인
2. PROJECT.md - 현재 이슈 확인
3. 작업 관련 문서 확인

### 작업 완료 후
1. 구현 문서 업데이트
2. 이슈 해결 시 PROJECT.md 업데이트
3. 새로운 패턴 발견 시 CONTEXT_BRIDGE.md 추가

---

## 📝 Markdown 작성 가이드

### 제목 계층
```markdown
# 대제목 (문서당 1개)
## 중제목 (섹션)
### 소제목 (하위 섹션)
#### 세부 항목
```

### 코드 블록
````markdown
```typescript
// TypeScript 코드
const example = "code";
```

```bash
# 셸 명령어
npm run test
```
````

### 테이블
```markdown
| 헤더1 | 헤더2 | 헤더3 |
|-------|-------|-------|
| 내용1 | 내용2 | 내용3 |
| 정렬 | 가능 | 합니다 |
```

### 체크리스트
```markdown
- [ ] 미완료 항목
- [x] 완료 항목
- [ ] 진행 중 항목
```

---

## 🔗 문서 간 참조

### 올바른 참조
```markdown
# 상세 내용은 다른 문서 참조
> 자세한 내용은 [PROJECT.md](./PROJECT.md) 참조

# 특정 섹션 참조
> [타입 시스템](./CODEMAP.md#타입-시스템) 참조
```

### 순환 참조 방지
- A → B → C → A 형태 금지
- 단방향 참조 권장
- 필요시 양방향 참조 허용

---

## 📂 문서 구조

```
docs/
├── CONTEXT_BRIDGE.md      # 반복 실수 방지
├── PROJECT.md             # 프로젝트 현황
├── CODEMAP.md             # 파일 구조
├── CHECKLIST.md           # 작업 검증
├── DOCUMENT_GUIDE.md      # 문서 가이드
├── INSTRUCTION_TEMPLATE.md # 지시 템플릿
├── FLOWMAP.md             # 사용자 플로우
├── WIREFRAME.md           # UI-API 연결
├── COMPONENT_INVENTORY.md # 컴포넌트 목록
├── ROUTE_SPEC.md          # 라우트 구조
├── STATE_FLOW.md          # 상태 관리
├── DATA_MODEL.md          # 데이터 모델
├── ERROR_BOUNDARY.md      # 에러 처리
├── INSTRUCTION_TEMPLATE_v16.md # 최신 템플릿
└── claude-md-restructure/ # CLAUDE.md 재구조화
    ├── PHASE_1_BACKUP.md
    ├── PHASE_2_CONTENT_MIGRATION.md
    ├── PHASE_3_DETECTION_SYSTEM.md
    └── PHASE_4_OPTIMIZATION.md
```

---

## ⚠️ 주의사항

1. **문서 임의 생성 금지** - 사용자 협의 필수
2. **역할 경계 준수** - 각 문서 고유 역할 유지
3. **실제 구현 반영** - 추측 금지, 확인 후 작성
4. **한국어 사용** - 명확한 한국어로 작성
5. **날짜 기록** - 변경사항에 날짜 포함

---

## 📋 체크리스트

- [ ] 작업 전 CONTEXT_BRIDGE.md 확인
- [ ] 문서 역할 경계 준수
- [ ] 중복 내용 제거
- [ ] 최신 정보 반영
- [ ] 상호 참조 정상
- [ ] 날짜 기록 포함

---

## 📁 관련 파일

- 문서 템플릿: `/docs/INSTRUCTION_TEMPLATE.md`
- 프로젝트 현황: `/docs/PROJECT.md`
- 반복 실수 방지: `/docs/CONTEXT_BRIDGE.md`
- 작업 검증: `/docs/CHECKLIST.md`

---

*문서 작업 시 이 문서를 우선 참조하세요.*