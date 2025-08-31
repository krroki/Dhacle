# 🔄 기존 내용 이관 상세 가이드

*33개 기존 문서에서 핵심 의도를 보존하며 새 구조로 완전 이관*

**작성일**: 2025-08-31  
**목적**: 중요한 의도와 문구를 누락 없이 새 Diátaxis 구조로 이관  
**원칙**: 복사-붙여넣기 금지, 새 목적에 맞게 재작성

---

## 📋 **이관 원칙**

### **핵심 원칙**
1. **의도 보존**: 원래 문서의 핵심 의도와 가치는 100% 보존
2. **구조 재작성**: 내용은 새 섹션 목적에 맞게 완전 재작성
3. **중복 제거**: 여러 문서에 흩어진 같은 내용을 하나로 통합
4. **새 AI 관점**: Context 없는 새 AI가 이해할 수 있도록 명확하게

### **작업 순서**
1. **기존 문서 완전 읽기** → 핵심 의도 파악
2. **중요 문구 추출** → 보존할 문구들 식별  
3. **새 위치 결정** → Diátaxis 4분할 중 적절한 위치
4. **새 목적으로 재작성** → 단순 복사가 아닌 재구성
5. **상호 참조 연결** → 문서 간 연결고리 생성

---

## 🗂️ **기존 문서별 이관 계획**

### **1. 루트 CLAUDE.md → 새 구조 전체**

#### **현재 내용 분석**
```markdown
현재 CLAUDE.md 구조:
├── 📋 Claude AI 작업 네비게이터 (전체 개요)
├── 🛑 STOP & ACT 규칙 (핵심 원칙)  
├── 🏗️ 새 기능 구현 = 테이블 먼저 생성
├── 🚨 프로젝트 필수 패턴 (How-to 가이드들)
├── 🤖 Active Agents (서브에이전트 설명)
└── 📁 폴더별 상세 지침 맵 (참조 정보)
```

#### **새 위치 매핑**
```
기존 CLAUDE.md → 새 위치 분산
├── "STOP & ACT 규칙" → tutorial/01-quick-start.md (즉시 알아야 할 규칙)
├── "새 기능 구현 워크플로우" → how-to/database-operations/create-table.md
├── "프로젝트 필수 패턴" → how-to/ 각 영역별 가이드로 분산
├── "Active Agents 설명" → explanation/why-these-rules.md (서브에이전트 배경)
└── "폴더별 지침 맵" → reference/project-structure.md
```

#### **보존해야 할 핵심 문구들**
```markdown
🔴 절대 보존할 문구:
"임시방편 발견 = 즉시 중단" 
"하나 수정 시 주변 코드 확인 필수"
"실제 작동 확인 없이 작업 완료 금지"
"검증 실패 시 다음 작업 진행 금지"
"기능 구현하려면 테이블부터 만들고 시작해라"

💡 의도 보존할 개념:
- 3단계 필수 프로세스 (STOP-FIX-VERIFY)
- 테이블 우선 생성 철학
- 16개 서브에이전트 시스템
- any 타입 절대 금지 원칙
```

### **2. CONTEXT_BRIDGE.md → explanation/mistake-patterns.md**

#### **현재 내용 분석**
- **22가지 치명적 실수 패턴** (가장 중요한 자산)
- **능동적 해결 원칙** (Proactive Resolution)
- **실제 사례들** (webpack layout.js, profiles vs users 등)
- **예방책과 해결책** (각 실수별 대응 방안)

#### **이관 방식**
```markdown
새 문서 구조:
# 🚨 반복 실수 패턴과 예방책

## 왜 이 문서가 필요한가?
"왜 같은 에러가 계속 발생하지?" → 이 문서가 답입니다.
"2주간 에러 디버깅" = 임시방편 코드의 결과

## 가장 치명적인 5가지 패턴
1. 테이블 없이 기능 구현 시작 🔴🔴🔴
2. any 타입 남발 🔴🔴  
3. profiles vs users 테이블 혼란 🔴🔴
4. 임시방편 코드 작성 🔴
5. 서버/클라이언트 컨텍스트 혼용 🔴

## 22가지 전체 패턴 목록
[기존 목록을 explanation 목적에 맞게 재구성]
```

#### **보존해야 할 핵심 내용**
```
🔴 절대 보존:
- 22가지 실수 패턴의 모든 사례
- "2주간 에러 디버깅"의 교훈
- 각 실수의 ❌/✅ 해결책
- 실제 코드 예시들
- "임시방편 = 프로젝트 파괴" 철학

💡 설명 방식 개선:
- 왜 이런 실수들이 생겼는지 배경 설명
- 각 실수가 어떤 결과를 낳는지 연쇄 효과 설명
- 예방하는 시스템적 접근법 설명
```

### **3. PROJECT.md → reference/project-status.md**

#### **현재 내용 분석**
- **최신 7개 변경사항** (프로젝트 진화 추적)
- **14개 문서 체계** (필수 확인 목록)
- **현재 주요 이슈** (문제점과 해결 상태)
- **Phase 1-4 완료 현황** (달성 상태)

#### **이관 방식**
```markdown
Reference 목적에 맞게 재구성:
# 📊 프로젝트 현재 상태

## 즉시 확인할 정보
- 현재 Phase: Phase 1-4 완료, Production Ready
- 검증 상태: ❌ API 18개 오류, ❌ Types 2개 오류
- 품질 점수: 18% (개선 필요)
- 마지막 업데이트: 2025-08-31

## 기술 스택 및 버전
[정확한 현재 상태 기록]

## 해결해야 할 문제들
[현재 이슈들을 우선순위별로 정리]
```

### **4. 각 폴더 CLAUDE.md → 서브에이전트 지침 재구성**

#### **공통 구조 표준화**
```markdown
모든 CLAUDE.md 파일을 다음 구조로 통일:

# 🔧 [영역명] 개발 지침
*[영역별 특화 설명]*

## 🛑 [영역명] 3단계 필수 규칙
### 1️⃣ STOP - 즉시 중단 신호
- [영역별 구체적 중단 신호들]

### 2️⃣ MUST - 필수 행동
```typescript  
// [영역별 필수 코드 패턴]
```

### 3️⃣ CHECK - 검증 필수
```bash
# [영역별 검증 명령어들]
```

## 🚫 [영역명] any 타입 금지
### ❌ 발견된 문제: [실제 파일명]
### ✅ 즉시 수정 방법

## 🚨 [영역명] 필수 패턴
[영역별 핵심 패턴들]

## 📋 [영역명] 검증 명령어
[영역별 검증 방법들]
```

#### **영역별 특화 내용**
```
src/app/api/CLAUDE.md (API Route Agent):
├── STOP: 세션 체크 없는 API, any 타입, 임시 반환값
├── MUST: getUser() 인증 패턴, Response 타입 정의  
├── CHECK: npm run types:check, curl 테스트

src/components/CLAUDE.md (Component Agent):
├── STOP: Props any 타입, 이벤트 핸들러 any
├── MUST: 정확한 Props 타입, State 타입 명시
├── CHECK: 컴포넌트 렌더링 확인

src/types/CLAUDE.md (Type Agent):
├── STOP: any 타입 사용, database.generated 직접 import
├── MUST: @/types 중앙화, 구체적 타입 정의
├── CHECK: TypeScript 컴파일 확인
```

---

## 🗂️ **삭제할 문서들**

### **시스템으로 대체되는 문서들**
```
삭제 대상 → 대체 방법
├── COMPONENT_INVENTORY.md → node scripts/asset-scanner.js
├── ROUTE_SPEC.md → 자동 스캐닝 시스템
├── 일부 WIREFRAME.md → API 자동 문서화
└── DATA_MODEL.md 일부 → Supabase 스키마 자동 생성
```

### **중복 제거 대상**
```
중복 내용 통합:
├── ERROR_BOUNDARY.md → how-to/api-development/handle-errors.md
├── STATE_FLOW.md → how-to/component-development/ 내 통합
├── FLOWMAP.md → reference/project-structure.md 내 통합
└── 여러 CLAUDE.md의 공통 내용 → tutorial/quick-start.md
```

---

## 📝 **실제 이관 작업 단계**

### **Step 1: 백업 및 준비**
```bash
# 1. 기존 문서 백업
cp -r docs/ docs_backup_2025-08-31/
cp CLAUDE.md CLAUDE_backup.md

# 2. 새 구조 생성  
mkdir -p docs/{tutorial,how-to,reference,explanation}
mkdir -p docs/how-to/{api-development,component-development,database-operations,testing}
```

### **Step 2: 핵심 4개 문서 작성**
```markdown
우선순위 1: tutorial/01-quick-start.md
├── 현재 CLAUDE.md의 STOP & ACT 규칙
├── PROJECT.md의 필수 확인사항
├── 핵심 금지사항 (any 타입, TODO, 임시방편)
└── 첫 작업 시작 방법

우선순위 2: explanation/mistake-patterns.md  
├── CONTEXT_BRIDGE.md의 22가지 패턴 전체
├── 각 패턴의 배경과 예방책
├── "왜 이런 규칙들이 생겼는지" 설명
└── 시스템적 해결 접근법

우선순위 3: how-to/api-development/create-new-route.md
├── src/app/api/CLAUDE.md의 핵심 패턴
├── 실제 단계별 실행 방법
├── STOP-MUST-CHECK 구조 적용
└── 구체적 코드 예시

우선순위 4: reference/project-status.md
├── PROJECT.md의 현재 상태 정보
├── 최신 검증 결과 (npm run verify:parallel)
├── 기술 스택 현황
└── 해결해야 할 이슈들
```

### **Step 3: 서브에이전트 지침 재작성**
```
각 CLAUDE.md 파일을 표준 구조로 재작성:
1. src/app/api/CLAUDE.md → API Route Agent 전용 지침
2. src/components/CLAUDE.md → Component Agent 전용 지침  
3. src/types/CLAUDE.md → Type Agent 전용 지침
4. ... (나머지 13개)
```

### **Step 4: 나머지 섹션 완성**
```
Tutorial 섹션:
├── 02-first-task.md (첫 작업 단계별 가이드)
├── 03-common-patterns.md (자주 쓰는 패턴들)

How-to 섹션:
├── component-development/ (컴포넌트 작업 가이드들)
├── database-operations/ (DB 작업 가이드들)  
├── testing/ (테스트 작업 가이드들)

Reference 섹션:
├── verification-commands.md (CHECKLIST.md 기반)
├── project-structure.md (CODEMAP.md 기반)
├── automation-systems.md (실제 자동화 현황)

Explanation 섹션:
├── why-these-rules.md (규칙들의 탄생 배경)
├── architecture-decisions.md (아키텍처 결정 이유)
```

---

## ✅ **품질 보증 체크리스트**

### **각 문서 작성 후 확인사항**
- [ ] **목적 명확성**: 해당 섹션의 목적에 완벽히 부합
- [ ] **핵심 의도 보존**: 원본 문서의 중요 의도 누락 없음
- [ ] **새 AI 관점**: Context 없는 새 AI가 이해 가능
- [ ] **실행 가능성**: 가이드대로 따라하면 실제 작업 완료  
- [ ] **상호 참조**: 다른 문서들과 적절히 연결
- [ ] **중복 제거**: 다른 곳에 있는 동일 내용과 중복 없음

### **전체 구조 완성 후 검증**
- [ ] **30초 테스트**: tutorial/quick-start.md로 프로젝트 파악 가능
- [ ] **실무 테스트**: how-to 가이드로 실제 작업 실행 가능
- [ ] **참조 테스트**: reference 문서로 필요 정보 즉시 확인 가능
- [ ] **이해 테스트**: explanation 문서로 규칙 배경 이해 가능
- [ ] **서브에이전트 테스트**: 각 CLAUDE.md로 영역별 작업 실행 가능

---

## 🚨 **주의사항 및 함정**

### **절대 하지 말 것**
- ❌ **복사-붙여넣기**: 기존 내용을 그대로 복사하지 마세요
- ❌ **일괄 변환**: 모든 내용을 한번에 옮기려 하지 마세요  
- ❌ **의도 무시**: 원본의 핵심 의도를 놓치지 마세요
- ❌ **구조 혼재**: 새 구조와 기존 구조를 섞지 마세요

### **반드시 해야 할 것**
- ✅ **의도 우선**: 각 문서의 원래 의도를 먼저 파악하세요
- ✅ **목적 맞춤**: 새 섹션의 목적에 맞게 재작성하세요
- ✅ **새 AI 관점**: Context 없는 AI가 읽는다고 생각하세요
- ✅ **단계별 검증**: 각 단계마다 실제 사용해보며 검증하세요

### **함정 포인트**
```
🔴 함정 1: "업데이트하면 되지 않을까?"
→ 새 구조의 목적이 다르므로 완전 재작성 필요

🔴 함정 2: "중요한 내용은 다 넣어야 할 것 같은데?"
→ 각 섹션의 목적에 맞는 내용만 선별적으로

🔴 함정 3: "기존 문서가 좋은데 왜 바꿔야 하지?"  
→ 새 AI가 혼동하지 않으려면 명확한 구조 필요

🔴 함정 4: "조금씩 바꾸면서 개선하면 되지 않을까?"
→ 점진적 변경은 오히려 더 혼란만 가중
```

---

## 📋 **최종 체크리스트**

### **이관 완료 기준**
- [ ] 기존 33개 문서의 핵심 의도 100% 파악
- [ ] 중요한 문구와 개념 누락 없이 보존
- [ ] 새 Diátaxis 구조에 적절히 재배치
- [ ] 각 섹션의 목적에 완벽히 부합하도록 재작성
- [ ] 새 AI 관점에서 실제 사용 가능한지 검증
- [ ] 문서 간 상호 참조와 연결고리 완성
- [ ] 중복 내용 완전 제거
- [ ] 전체 문서 체계의 일관성 확보

### **성공 지표**  
- 새 AI가 tutorial만으로 30초 내 프로젝트 파악
- how-to 가이드만으로 실수 없는 코드 작성
- reference 문서만으로 현재 상태 정확히 이해  
- explanation 문서로 규칙과 패턴의 배경 완전 이해
- 22가지 실수 패턴 반복 제로 달성

---

*이 가이드를 철저히 따르면서 기존의 소중한 지혜와 경험을 새 구조에서도 완전히 보존하세요. 급하더라도 단계를 건너뛰지 말고, 각 문서의 원래 의도를 깊이 이해한 후에 새로운 목적에 맞게 재작성하는 것이 성공의 핵심입니다.*