# 📚 문서 체계 가이드

*14개 핵심 문서 관리, 작성 규칙, 역할 경계 준수*

---

## 🧭 5W1H Analysis

### What (무엇을)
디하클 프로젝트의 **14개 핵심 문서 체계 관리 시스템**으로, 각 문서의 고유 역할과 작성 규칙을 정의하여 중복 없는 효율적인 문서화 환경을 제공합니다.

### Why (왜)
- 문서 간 중복 방지와 역할 명확화를 통한 일관성 확보
- AI 작업 시 정확한 컨텍스트 제공으로 품질 향상
- 프로젝트 정보의 단일 진실 공급원(Single Source of Truth) 구현
- 개발 효율성과 유지보수성 극대화

### When (언제)
- 새로운 문서 작성 시 **역할 경계 확인**
- 문서 업데이트 시 **중복 내용 제거**
- AI 작업 지시 전 **필수 문서 확인**
- 프로젝트 상태 변경 시 **해당 문서 업데이트**

### Where (어디서)
```bash
docs/                           # 14개 핵심 문서 위치
├── CONTEXT_BRIDGE.md          # 반복 실수 방지 (최우선)
├── PROJECT.md                 # 프로젝트 현황
├── CODEMAP.md                 # 파일 구조
└── [11개 추가 핵심 문서]
```

### Who (누가)
- **개발자**: 문서 작성 시 역할 경계 준수
- **AI**: 작업 전 필수 문서 확인 후 정확한 컨텍스트 이해
- **팀원**: 프로젝트 정보 조회 시 해당 문서 참조

### How (어떻게)
1. **작업 전**: CONTEXT_BRIDGE.md → PROJECT.md → 관련 문서 순서로 확인
2. **작성 시**: 문서별 역할 경계 준수, 중복 내용 금지
3. **업데이트**: 실시간 변경사항 반영, 최신 7개 변경사항 유지

---

## ⚡ Enhanced Quick Reference

### 📋 문서 확인 패턴
```bash
# 작업 시작 전 필수 확인 순서
1. /docs/CONTEXT_BRIDGE.md     # 반복 실수 패턴 확인
2. /docs/PROJECT.md            # 현재 프로젝트 상태
3. /docs/[관련_문서].md        # 작업 영역별 상세 정보
```

### 📝 문서 작성 패턴
```markdown
# 새 문서 작성 시 헤더 패턴
# 📊 [문서 제목]

*[한 줄 목적 설명]*

---

## 🧭 5W1H Analysis
[What, Why, When, Where, Who, How 섹션]

## ⚡ Enhanced Quick Reference
[핵심 사용법과 코드 예시]

## 🔧 Tool Usage Matrix
[도구별 사용법 매트릭스]
```

### 📊 문서 상태 확인 패턴
```bash
# 문서 현황 체크
node scripts/check-documentation.js

# 특정 문서 최신 상태 확인
git log --oneline -5 -- docs/[문서명].md

# 문서 간 참조 링크 검증
grep -r "\[.*\](\./" docs/
```

### 🚫 중복 방지 패턴
```markdown
# ❌ 잘못된 중복 작성
## 타입 시스템
TypeScript 설정은...

# ✅ 올바른 참조 방식
## 타입 시스템
> 상세 내용은 [타입 시스템](../src/types/CLAUDE.md) 참조
```

### 📂 파일 참조 패턴
```markdown
# 절대 경로 참조 (권장)
[API Routes](/src/app/api/CLAUDE.md)

# 상대 경로 참조
[프로젝트 현황](./PROJECT.md)

# 섹션 참조
[타입 시스템](./CODEMAP.md#타입-시스템)

# 외부 링크
[Next.js 공식 문서](https://nextjs.org/)
```

---

## 🔧 Tool Usage Matrix

| 도구/명령어 | 사용 목적 | 사용법 | npm scripts |
|-----------|----------|--------|-------------|
| **문서 검증** | 문서 현황 체크 | `node scripts/check-documentation.js` | `npm run docs:check` |
| **링크 검증** | 참조 링크 확인 | `grep -r "\[.*\](\./" docs/` | `npm run docs:validate` |
| **문서 생성** | 템플릿 기반 문서 | `cp docs/template.md docs/new.md` | `npm run docs:create` |
| **Git 로그** | 문서 변경 이력 | `git log --oneline -- docs/[파일].md` | - |
| **Markdown 검증** | 문법 체크 | `markdownlint docs/` | `npm run lint:md` |
| **문서 통계** | 문서별 통계 | `wc -l docs/*.md` | `npm run docs:stats` |
| **중복 탐지** | 중복 내용 확인 | `grep -r "중복패턴" docs/` | `npm run docs:duplicates` |
| **템플릿 검증** | 구조 일치 확인 | `node scripts/validate-structure.js` | `npm run docs:structure` |

## 🔗 Dependency Relationships

### Dependencies (의존하는 것들)
- **Git**: 문서 버전 관리 및 변경 이력 추적
- **Node.js**: 문서 검증 스크립트 실행 환경
- **Markdown**: 문서 작성 포맷과 렌더링
- **14개 핵심 문서**: 각 문서의 역할별 상호 참조
- **프로젝트 구조**: 실제 코드 구조와 문서 내용 일치

### Dependents (의존받는 것들)
- **AI 작업 지침**: 모든 폴더 CLAUDE.md 파일
- **개발 워크플로**: 프로젝트 작업 시 참조 문서
- **품질 관리**: 문서 기반 코드 리뷰와 검증
- **팀 커뮤니케이션**: 프로젝트 상태 공유 기반
- **자동화 스크립트**: 문서 기반 검증 및 테스트

## 📋 Work Scenarios

### 시나리오 1: 새로운 기능 문서 작성
```bash
# 1. 기존 문서 역할 확인
grep -r "새기능관련키워드" docs/

# 2. 중복 방지를 위한 역할 경계 확인
cat docs/CLAUDE.md  # 이 문서로 역할 경계 확인

# 3. 템플릿 기반 문서 생성
cp docs/INSTRUCTION_TEMPLATE.md docs/new-feature.md

# 4. 5W1H 구조 적용하여 작성
# 5. 14개 핵심 문서에 추가 및 참조 업데이트
```

### 시나리오 2: 문서 간 중복 제거
```bash
# 1. 중복 내용 탐지
grep -r "공통패턴" docs/ | sort

# 2. 각 문서의 고유 역할 재정의
vim docs/CLAUDE.md  # 역할 경계 재확인

# 3. 중복 내용을 주 문서로 집중
# 4. 다른 문서에서는 참조 링크로 변경

# 예시:
echo "> 상세 내용은 [주 문서](./main-doc.md) 참조" > temp-section
```

### 시나리오 3: 프로젝트 상태 업데이트
```bash
# 1. 변경사항이 영향을 미치는 문서 식별
grep -r "변경된기능" docs/

# 2. 관련 문서 일괄 업데이트
# - PROJECT.md: 전체 상태 업데이트
# - 해당 도메인 문서: 상세 내용 업데이트
# - CONTEXT_BRIDGE.md: 새로운 패턴 추가 (필요시)

# 3. 문서 간 일관성 검증
npm run docs:validate
```

## ⚠️ Common Errors & Solutions

| 에러 상황 | 증상 | 해결 방법 | 예방책 |
|----------|------|----------|--------|
| **중복 내용 작성** | 여러 문서에 동일 정보 | 주 문서 선정 후 다른 곳은 참조로 변경 | 작성 전 역할 경계 확인 |
| **순환 참조** | A→B→A 형태 참조 | 참조 구조를 단방향으로 재설계 | 문서 계층 구조 사전 설계 |
| **깨진 링크** | 참조 링크 404 에러 | 파일 경로와 섹션명 정확히 수정 | 링크 작성 후 즉시 검증 |
| **역할 경계 침범** | 문서 목적과 다른 내용 | 해당 내용을 올바른 문서로 이동 | 문서별 역할 명확히 정의 |
| **오래된 정보** | 실제 구현과 문서 불일치 | 실제 코드 확인 후 문서 업데이트 | 코드 변경 시 문서 동시 업데이트 |
| **템플릿 미준수** | 일관성 없는 문서 구조 | 5W1H 구조로 재작성 | 새 문서 작성시 템플릿 사용 |
| **날짜 기록 누락** | 언제 변경되었는지 불명 | Git 히스토리와 함께 날짜 추가 | 변경시마다 날짜 명시 |
| **너무 많은 정보** | 문서 가독성 저하 | 최신 7개 변경사항만 유지 | 주기적으로 오래된 내용 정리 |

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