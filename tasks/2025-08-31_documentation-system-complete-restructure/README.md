# 📚 문서 체계 완전 재구성 마스터 플랜

*Context 없는 새로운 AI도 실수 없이 작업할 수 있는 완전한 문서 체계 구축*

**작성일**: 2025-08-31  
**목적**: 기존 혼재된 문서 체계를 Diátaxis 프레임워크 기반으로 완전 재구성  
**중요성**: 🔴 **CRITICAL** - 새 AI 세션이 잘못된 정보로 코드 작성하는 것을 방지

---

## 🚨 **현재 상황 (왜 지금 당장 해야 하는가)**

### **문제점**
1. **18개 docs 문서 + 15개 CLAUDE.md** = 총 33개 문서 산재
2. **최근 대규모 리팩토링 이후 정보 불일치** 
3. **새 AI가 과거 정보를 믿고 잘못된 코드 작성할 위험**
4. **Context 없는 새 세션에서 실수 반복 가능성**

### **근거 (실제 검증됨)**
- 이전 세션과 현재 세션에서 동일한 지시에 다른 결과 도출
- AI Context System이 실제로는 자동 작동하지 않음을 확인  
- 현재 문서들이 리팩토링 이전 상태 반영

### **목표**
- **새 AI가 30초 내에 프로젝트 파악 가능**
- **실수 없는 코드 작성을 위한 완전한 지침 체계**
- **시스템적 자동화와 수동 문서화의 명확한 구분**

---

## 📋 작업 범위 및 계획

### **Phase 1: 기존 문서 백업 및 분석** ⏰ 30분
1. 현재 docs/ 폴더 완전 백업
2. 각 CLAUDE.md의 핵심 의도 추출
3. 보존해야 할 중요 문구 식별

### **Phase 2: Diátaxis 구조 구축** ⏰ 1시간
1. 새로운 4분할 구조 생성
2. Tutorial, How-to, Reference, Explanation 폴더 구성
3. 기존 내용을 적절한 섹션에 재배치

### **Phase 3: 서브에이전트 지침 재구성** ⏰ 1시간  
1. 16개 서브에이전트별 작업 지침 통합
2. 3단계 필수 규칙 (STOP-MUST-CHECK) 체계 보존
3. 폴더별 CLAUDE.md 새 구조로 재작성

### **Phase 4: 검증 및 최종 확인** ⏰ 30분
1. 새 구조로 실제 작업 시뮬레이션
2. Context 없는 AI용 빠른 시작 가이드 검증
3. 문서 간 연결고리 및 참조 확인

### **총 소요 시간**: 3시간

---

## 🎯 **Diátaxis 기반 새 구조**

### **기존 → 새 구조 매핑**

```
기존 (33개 산재 문서)
├── docs/ (18개)
└── **/CLAUDE.md (15개)

        ↓ 완전 재구성 ↓

새 구조 (4분할 + 서브에이전트)
├── tutorial/           # 새 AI 온보딩
│   ├── quick-start.md     # 30초 프로젝트 파악
│   └── first-task.md      # 첫 작업 실행 가이드
├── how-to/             # 실무 작업 가이드
│   ├── api-development.md    # API Route 구현
│   ├── component-creation.md # 컴포넌트 작성
│   ├── database-changes.md   # DB 변경 작업
│   └── testing.md           # 테스트 작성
├── reference/          # 기술 참조
│   ├── project-status.md     # 현재 프로젝트 상태
│   ├── verification-commands.md # 검증 명령어
│   ├── project-structure.md  # 파일 구조
│   └── automation-systems.md # 실제 자동화 현황
└── explanation/        # 배경 지식
│   ├── why-these-rules.md    # 왜 이런 규칙들이 생겼나
│   ├── mistake-patterns.md   # 반복 실수 패턴 (CONTEXT_BRIDGE 기반)
│   └── architecture-decisions.md # 아키텍처 결정 배경

+ 서브에이전트 지침 (각 폴더의 CLAUDE.md)
```

---

## 🔧 **보존해야 할 핵심 의도들**

### **1. "3단계 필수 규칙" 구조** (모든 CLAUDE.md 공통)
```
STOP - 즉시 중단 신호 (any 타입 발견, 임시방편 코드 등)
MUST - 필수 행동 (정확한 타입, 실제 구현)
CHECK - 검증 필수 (npm run verify:parallel)
```

### **2. 핵심 금지사항들**
- **any 타입 절대 금지** - 프로젝트 전체 원칙
- **임시방편 코드 금지** - "2주간 에러 디버깅"의 교훈
- **TODO 주석 금지** - 미완성 코드로 넘어가지 않기
- **Silent 에러 처리 금지** - try-catch로 에러 숨기기

### **3. 22가지 반복 실수 패턴** (CONTEXT_BRIDGE.md에서 가져옴)
- webpack layout.js 컴파일 에러 (해결됨)
- 테이블 없이 기능 구현 시작
- profiles vs users 테이블 혼란  
- 기타 19개 패턴들

### **4. 서브에이전트 전문 지침들**
각 영역별 (API, Component, Types, Security 등) 전문 작업 규칙

---

## 📂 **실제 파일 생성 목록**

### **메인 구조**
1. `tutorial/quick-start.md` - 새 AI 30초 온보딩
2. `tutorial/first-task.md` - 첫 작업 실행
3. `how-to/api-development.md` - API Route 구현 가이드
4. `how-to/component-creation.md` - Component 작성 가이드
5. `how-to/database-changes.md` - DB 작업 가이드
6. `reference/project-status.md` - 현재 상태 (PROJECT.md 기반)
7. `reference/verification-commands.md` - 검증 방법들
8. `explanation/mistake-patterns.md` - CONTEXT_BRIDGE.md 기반

### **서브에이전트 지침** (기존 위치 유지)
9. `CLAUDE.md` (루트) - 전체 가이드라인
10. `src/app/api/CLAUDE.md` - API Route Agent 지침
11. `src/components/CLAUDE.md` - Component Agent 지침  
12. 기타 13개 폴더별 CLAUDE.md 재작성

---

## ⚡ **즉시 실행 액션 플랜**

### **단계별 체크리스트**
- [ ] **Step 1**: 기존 docs/ 백업 → `docs_backup_2025-08-31/`
- [ ] **Step 2**: 새 Diátaxis 구조 생성 → `docs/tutorial/`, `docs/how-to/`, `docs/reference/`, `docs/explanation/`
- [ ] **Step 3**: 핵심 4개 문서 우선 작성 (tutorial/quick-start, explanation/mistake-patterns)
- [ ] **Step 4**: 각 CLAUDE.md 파일 3단계 규칙 기반 재작성
- [ ] **Step 5**: 새 AI 테스트 시뮬레이션 실행
- [ ] **Step 6**: 기존 문서들 단계적 이관 또는 삭제

### **검증 방법**
```bash
# 새 구조 검증
ls -la docs/tutorial/ docs/how-to/ docs/reference/ docs/explanation/

# CLAUDE.md 3단계 규칙 확인
grep -r "STOP\|MUST\|CHECK" src/**/CLAUDE.md

# 새 AI 시뮬레이션
# 1. 새 세션에서 tutorial/quick-start.md만으로 프로젝트 파악 가능한지
# 2. how-to 가이드만으로 실제 작업 실행 가능한지
```

---

## 📝 **이 폴더의 문서들**

1. **README.md** (이 파일) - 전체 마스터 플랜
2. **DIATAXIS_STRUCTURE_DESIGN.md** - 새 구조 상세 설계
3. **CONTENT_MIGRATION_GUIDE.md** - 기존 내용 이관 가이드
4. **SUBAGENT_GUIDELINES_RESTRUCTURE.md** - 서브에이전트 지침 재구성
5. **IMPLEMENTATION_CHECKLIST.md** - 실행 체크리스트 및 검증 방법

---

## 🚨 **중요 주의사항**

### **절대 금지사항**
- ❌ 점진적 개선 시도 - 오히려 더 꼬임
- ❌ 기존 문서 일부만 수정 - 일관성 깨짐
- ❌ 중요 의도 문구 누락 - 핵심 가치 손실
- ❌ 새 문서 테스트 없이 적용 - 새 AI 혼동 가능

### **성공을 위한 원칙**
- ✅ **한 번에 완전히 바꾸기** - 혼동 방지
- ✅ **핵심 의도 100% 보존** - 기존 지혜 유지  
- ✅ **새 AI 관점에서 검증** - 실제 사용성 확인
- ✅ **체계적 단계별 진행** - 실수 없는 완전한 이관

---

## 🎯 **최종 목표**

### **새 AI가 이것만으로도 완벽하게 작업할 수 있어야 함:**
1. `tutorial/quick-start.md` 읽고 30초 내 프로젝트 파악
2. `how-to/` 가이드로 실수 없는 코드 작성
3. `reference/` 문서로 현재 상태 정확히 이해
4. `explanation/mistake-patterns.md`로 반복 실수 방지

### **성공 지표**
- 새 AI 세션에서 컨텍스트 로딩 없이도 올바른 코드 작성
- 기존 22가지 실수 패턴 반복 없음
- 문서 체계 자체가 자명하고 직관적
- 유지보수 비용 50% 이상 감소

---

*이 마스터 플랜을 기반으로 체계적으로 진행하세요. 급하더라도 단계를 건너뛰지 말고, 각 단계마다 검증하며 진행하는 것이 중요합니다.*