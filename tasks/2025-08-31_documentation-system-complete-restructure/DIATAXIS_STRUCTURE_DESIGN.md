# 🏗️ Diátaxis 기반 문서 구조 상세 설계

*Context7 베스트 프랙티스 기반 현대적 문서 구조*

**작성일**: 2025-08-31  
**기반**: Diátaxis Documentation Framework (Trust Score 9.6)  
**목적**: 기존 33개 산재 문서를 체계적 4분할 구조로 완전 재구성

---

## 📋 **Diátaxis 프레임워크 핵심 개념**

### **4가지 문서 유형**
```
Tutorial (학습)     How-to (실무)
     |                  |
  학습용 단계별         문제해결용
  연습과 실습          실무 가이드
     |                  |
     +----- 사용자 -----+
     |                  |
  개념 이해용          사실 확인용
  배경과 맥락          정확한 정보
     |                  |
Explanation (설명)   Reference (참조)
```

### **각 유형의 특징**
- **Tutorial**: "따라하며 배우는" - 단계별 학습용
- **How-to guides**: "문제를 해결하는" - 실무 작업 가이드  
- **Reference**: "정확한 정보를 찾는" - 기술 사실 모음
- **Explanation**: "이해하는" - 배경과 맥락 설명

---

## 🎯 **Dhacle 프로젝트 적용 설계**

### **현재 문제점 분석**
```
기존 구조의 문제:
├── 정보가 33개 문서에 산재 (18개 docs + 15개 CLAUDE.md)
├── 학습용과 참조용이 섞여 있음 (PROJECT.md에 모든 것 포함)
├── 실무 가이드가 파편화됨 (각 폴더의 CLAUDE.md로 분산)
└── 배경 설명이 부족함 (왜 이런 규칙들이 생겼는지 불분명)
```

### **해결 방향**
```
새 구조의 목표:
├── 새 AI 온보딩: Tutorial로 30초 내 파악 가능
├── 실무 작업: How-to로 단계별 실행 가능  
├── 현재 상태 확인: Reference로 즉시 참조 가능
└── 규칙 이해: Explanation으로 맥락 파악 가능
```

---

## 📂 **새 디렉터리 구조**

### **메인 구조 (docs/ 폴더)**
```
docs/
├── README.md                    # 📋 문서 체계 홈페이지
│
├── tutorial/                    # 🎓 새 AI 온보딩
│   ├── README.md               # Tutorial 섹션 소개
│   ├── 01-quick-start.md       # 30초 프로젝트 파악
│   ├── 02-first-task.md        # 첫 작업 실행  
│   └── 03-common-patterns.md   # 자주 쓰는 패턴들
│
├── how-to/                      # 🔧 실무 작업 가이드  
│   ├── README.md               # How-to 섹션 소개
│   ├── api-development/        # API 작업
│   │   ├── create-new-route.md
│   │   ├── add-authentication.md
│   │   └── handle-errors.md
│   ├── component-development/   # 컴포넌트 작업
│   │   ├── create-component.md
│   │   ├── add-types.md
│   │   └── styling-guide.md
│   ├── database-operations/     # DB 작업
│   │   ├── create-table.md
│   │   ├── add-rls-policies.md
│   │   └── run-migrations.md
│   └── testing/                # 테스트 작업
│       ├── write-unit-tests.md
│       └── run-e2e-tests.md
│
├── reference/                   # 📖 기술 참조
│   ├── README.md               # Reference 섹션 소개
│   ├── project-status.md       # 현재 프로젝트 상태
│   ├── verification-commands.md # 검증 명령어 모음
│   ├── project-structure.md    # 파일/폴더 구조
│   ├── automation-systems.md   # 자동화 시스템 현황
│   └── api-endpoints.md        # API 엔드포인트 목록
│
└── explanation/                 # 💡 배경 지식
    ├── README.md               # Explanation 섹션 소개  
    ├── why-these-rules.md      # 규칙들의 탄생 배경
    ├── mistake-patterns.md     # 반복 실수 패턴 분석
    ├── architecture-decisions.md # 아키텍처 결정 이유
    └── project-evolution.md    # 프로젝트 진화 과정
```

### **서브에이전트 지침 (기존 위치 유지)**
```
루트 및 각 폴더의 CLAUDE.md는 그대로 유지하되, 내용을 새 구조에 맞춰 재작성:
├── CLAUDE.md                   # 전체 가이드라인
├── src/app/api/CLAUDE.md       # API Route Agent 지침
├── src/components/CLAUDE.md    # Component Agent 지침
├── src/types/CLAUDE.md         # Type Agent 지침
└── ... (13개 더)
```

---

## 📝 **각 섹션별 상세 내용 설계**

### **1. Tutorial (새 AI 온보딩) 📋 목표: 30초 내 프로젝트 파악**

#### **01-quick-start.md**
```markdown
# 🚀 30초 프로젝트 파악 가이드

## 핵심 사실 (외우세요)
- 프로젝트명: Dhacle - YouTube 크리에이터 도구
- 현재 상태: Phase 1-4 완료, Production Ready
- 기술 스택: Next.js 15, Supabase, TypeScript
- 검증 명령어: `npm run verify:parallel`

## 절대 규칙 (위반 시 즉시 중단)
- ❌ any 타입 사용 절대 금지
- ❌ TODO 주석 금지 (미완성 코드로 넘어가지 않기)
- ❌ 테이블 없이 기능 구현 시작 금지
- ✅ 모든 작업 후 npm run verify:parallel 실행

## 첫 번째 할 일
1. explanation/mistake-patterns.md 읽기 (반복 실수 방지)
2. reference/project-status.md 읽기 (현재 상태 파악)
3. how-to/에서 해당 작업 가이드 찾기
```

#### **02-first-task.md**
```markdown
# 🎯 첫 작업 실행 가이드

## 단계별 실행
1. 작업 유형 확인 → how-to/에서 해당 가이드 찾기
2. 현재 상태 확인 → reference/project-status.md
3. 실수 패턴 확인 → explanation/mistake-patterns.md
4. 해당 폴더 CLAUDE.md 확인 → 서브에이전트 지침
5. 작업 실행
6. 검증 → npm run verify:parallel

## 작업 유형별 가이드
- API 추가: how-to/api-development/create-new-route.md
- 컴포넌트 생성: how-to/component-development/create-component.md  
- DB 변경: how-to/database-operations/create-table.md
- 테스트 작성: how-to/testing/write-unit-tests.md
```

### **2. How-to (실무 가이드) 📋 목표: 실수 없는 단계별 실행**

#### **how-to/api-development/create-new-route.md**
```markdown
# 🔌 새 API Route 생성하기

## STOP - 즉시 중단 신호
- 세션 체크 없는 API 발견 → 중단
- any 타입 사용 → 중단
- 빈 배열/null 임시 반환 → 중단

## MUST - 필수 행동  
1. 인증 패턴 적용:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
}
```

2. Response 타입 정의:
```typescript
type ApiResponse = { data: UserData[] } | { error: string };
```

## CHECK - 검증 필수
```bash
npm run types:check
curl -X GET http://localhost:3000/api/[endpoint]
```

## 상세 단계
1. src/app/api/[folder]/route.ts 생성
2. 인증 패턴 적용
3. 타입 정의
4. 비즈니스 로직 구현
5. 에러 처리 추가
6. 검증 실행
```

### **3. Reference (기술 참조) 📋 목표: 즉시 참조 가능한 정확한 정보**

#### **reference/project-status.md**
```markdown
# 📊 프로젝트 현재 상태

## 최신 업데이트 (2025-08-31)
- 검증 결과: ❌ API 18개 오류, ❌ Types 2개 오류
- 자산 현황: 136개 (컴포넌트 96, API 40, 테이블 0)
- 품질 점수: 18% (개선 필요)

## 기술 스택
- Next.js 15.4.6
- TypeScript (strict mode)
- Supabase
- Tailwind CSS
- React Query

## 핵심 명령어
npm run verify:parallel  # 전체 검증
npm run types:check      # TypeScript 검사
npm run build           # 빌드 테스트
node scripts/context-loader.js  # AI 컨텍스트 생성
```

### **4. Explanation (배경 지식) 📋 목표: 규칙과 패턴의 이해**

#### **explanation/mistake-patterns.md** (CONTEXT_BRIDGE.md 기반)
```markdown
# 🚨 반복 실수 패턴과 예방책

## 가장 치명적인 5가지

### 1. 테이블 없이 기능 구현 시작 🔴🔴🔴
**실수**: 코드부터 작성 → 테이블 없어서 에러 → TODO 주석
**해결**: 기능 기획 → 테이블 설계 → SQL 작성 및 실행 → 코드 구현

### 2. any 타입 남발 🔴🔴
**실수**: 복잡한 타입을 any로 회피
**해결**: @/types에서 정확한 타입 정의, unknown + 타입가드 사용

### 3. profiles vs users 테이블 혼란 🔴🔴
**실수**: profiles VIEW에서 naver_cafe 컬럼 접근 시도
**해결**: 
- 일반 프로필 → profiles VIEW
- naver_cafe 정보 → users TABLE

### 4. 임시방편 코드 작성 🔴
**실수**: "나중에 고치자"는 TODO, @ts-ignore
**해결**: 즉시 완전한 구현, any 타입 금지

### 5. 서버/클라이언트 컨텍스트 혼용 🔴
**실수**: 서버사이드 파일에 React Hooks import
**해결**: 완전한 파일 분리
```

---

## 🔄 **기존 문서 매핑 가이드**

### **기존 → 새 위치**
```
기존 문서                     새 위치                        이유
──────────────────────────────────────────────────────────────────
PROJECT.md              → reference/project-status.md     현재 상태 참조용
CONTEXT_BRIDGE.md        → explanation/mistake-patterns.md 실수 패턴 배경 설명
CODEMAP.md              → reference/project-structure.md  파일 구조 참조용
CHECKLIST.md            → reference/verification-commands.md 검증 명령어 참조
INSTRUCTION_TEMPLATE.md  → tutorial/03-common-patterns.md  학습용 패턴
ERROR_BOUNDARY.md       → how-to/api-development/handle-errors.md 실무 에러 처리
COMPONENT_INVENTORY.md  → 삭제 (시스템으로 자동 추적)        중복 제거
ROUTE_SPEC.md          → 삭제 (시스템으로 자동 추적)        중복 제거
```

### **CLAUDE.md 파일들 재구성**
```
각 폴더의 CLAUDE.md는 위치 그대로 유지하되, 내용을 다음 구조로 통일:

## 🛑 [영역명] 3단계 필수 규칙
### 1️⃣ STOP - 즉시 중단 신호
### 2️⃣ MUST - 필수 행동  
### 3️⃣ CHECK - 검증 필수

## 🚫 [영역명] any 타입 금지 (구체적 사례)
## 🚨 [영역명] 필수 패턴 (코드 예시)
## 📋 [영역명] 검증 명령어
```

---

## 🎯 **구현 우선순위**

### **Phase 1: 핵심 4개 문서 (즉시 작성)**
1. `tutorial/01-quick-start.md` - 새 AI 30초 온보딩
2. `how-to/api-development/create-new-route.md` - 가장 자주 쓰임
3. `reference/project-status.md` - PROJECT.md 기반
4. `explanation/mistake-patterns.md` - CONTEXT_BRIDGE.md 기반

### **Phase 2: 서브에이전트 지침 재작성**
5. 루트 `CLAUDE.md` - 전체 가이드라인
6. `src/app/api/CLAUDE.md` - API Agent 지침
7. `src/components/CLAUDE.md` - Component Agent 지침
8. 나머지 13개 CLAUDE.md 순차 작성

### **Phase 3: 나머지 섹션 완성**
9. tutorial/ 나머지 문서들
10. how-to/ 나머지 가이드들  
11. reference/ 나머지 참조 문서들
12. explanation/ 나머지 배경 설명들

---

## ✅ **성공 기준**

### **새 AI 테스트 시나리오**
1. **30초 테스트**: tutorial/quick-start.md만으로 프로젝트 파악 가능
2. **실무 테스트**: how-to 가이드만으로 실제 API 생성 가능  
3. **참조 테스트**: reference 문서만으로 현재 상태 정확히 파악
4. **이해 테스트**: explanation 문서로 왜 이런 규칙들이 있는지 이해

### **품질 지표**
- [ ] 새 AI가 실수 없이 코드 작성
- [ ] 22가지 실수 패턴 반복 제로
- [ ] 문서 찾는 시간 90% 단축  
- [ ] 프로젝트 온보딩 시간 95% 단축

---

## 🚨 **주의사항**

### **절대 하지 말 것**
- ❌ 기존 문서들을 "업데이트" - 새로 작성하세요
- ❌ 내용 복사-붙여넣기 - 새 구조에 맞게 재작성하세요
- ❌ 일부만 변경 - 완전한 체계로 바꾸세요
- ❌ 중요 의도 문구 누락 - 핵심 가치는 반드시 보존하세요

### **꼭 해야 할 것**
- ✅ 각 문서의 고유 목적 명확히
- ✅ 새 AI 관점에서 작성
- ✅ 실제 사용해보며 검증
- ✅ 핵심 의도와 가치 100% 보존

---

*이 설계를 바탕으로 실제 문서들을 작성하세요. 각 문서는 해당 섹션의 목적에 완벽히 맞아야 하며, 새 AI가 혼동하지 않도록 명확하고 구체적으로 작성하는 것이 중요합니다.*