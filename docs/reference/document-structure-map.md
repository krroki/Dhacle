# 🗺️ 전체 문서 구조 맵

## 📌 문서 관리 지침
**목적**: 전체 문서 구조를 한눈에 파악할 수 있는 완전한 맵과 문서간 참조 관계 제공  
**대상**: 모든 AI (문서 내비게이션, 정보 위치 파악 필요 시)  
**범위**: 전체 문서 구조, 문서간 참조 관계, 중복 방지 영역 구분  
**업데이트 기준**: 새 문서 추가 시, 문서 구조 변경 시 즉시 업데이트  
**최대 길이**: 5000 토큰  
**연관 문서**: [프로젝트 구조](project-structure.md), [문서 작성 가이드](../CLAUDE.md)

## ⚠️ 금지사항
- 개별 문서 내용 요약 추가 금지 (→ 개별 문서 직접 참조)
- 문서 작성 방법 추가 금지 (→ how-to/documentation/ 가이드로 이관)
- 프로젝트 현황 정보 추가 금지 (→ reference/project-status.md로 이관)

---

## 🏗️ Diátaxis 4-Tier 구조

### 📚 전체 구조 개요
```
docs/
├── tutorial/           # 학습 지향 (Learning-oriented)
├── how-to/            # 문제 해결 지향 (Problem-oriented)
├── reference/         # 정보 지향 (Information-oriented)
└── explanation/       # 이해 지향 (Understanding-oriented)
```

---

## 📖 Tutorial 섹션 (학습 지향)

### 목적: AI가 프로젝트를 단계적으로 학습

```
docs/tutorial/
├── README.md              # 학습 경로 안내
├── 01-quick-start.md      # 30초 프로젝트 파악
├── 02-first-task.md       # 첫 작업 실습 (메모 기능)
└── 03-common-patterns.md  # 핵심 코딩 패턴
```

#### 참조 관계
```yaml
01-quick-start.md → reference/project-status.md (현재 상태)
01-quick-start.md → explanation/mistake-patterns.md (실수 방지)
02-first-task.md → how-to/database-operations/ (테이블 생성)
02-first-task.md → how-to/api-development/ (API 생성)
03-common-patterns.md → how-to/ (구체적 구현)
```

---

## 🔧 How-to 섹션 (문제 해결 지향)

### 목적: AI가 특정 작업을 단계적으로 완료

```
docs/how-to/
├── README.md                    # 구현 가이드 모음
├── 01-authentication-patterns.md    # 인증 패턴
├── 02-snake-case-conversion.md      # snake_case 변환
├── 03-type-imports.md               # 타입 시스템
├── 04-supabase-integration.md       # DB 연동
├── api-development/
│   └── create-new-route.md          # API 라우트 생성
├── component-development/
│   ├── create-component.md          # 일반 컴포넌트
│   └── create-dhacle-component.md   # Dhacle 특화
├── database-operations/
│   └── create-table.md              # 테이블 생성
├── testing/
│   └── write-unit-tests.md          # 단위 테스트
└── documentation/
    ├── document-placement-guide.md  # 문서 배치
    └── document-maintenance.md      # 문서 유지보수
```

#### 참조 관계
```yaml
# 실제 코드베이스 기반 가이드들
01-04 → reference/ 섹션 (실제 데이터 참조)
create-new-route.md → src/app/api/CLAUDE.md
create-dhacle-component.md → src/components/CLAUDE.md
create-table.md → supabase/migrations/CLAUDE.md

# 문서 관리 가이드들
documentation/ → docs/CLAUDE.md
document-placement-guide.md → reference/ (배치 대상 문서들)
```

---

## 📊 Reference 섹션 (정보 지향)

### 목적: AI가 필요한 데이터를 즉시 조회

```
docs/reference/
├── README.md                    # 레퍼런스 가이드
├── project-status.md            # 프로젝트 현황
├── database-schema.md           # DB 스키마 전체
├── api-endpoints.md             # API 엔드포인트 목록
├── component-inventory.md       # 컴포넌트 목록
├── environment-variables.md     # 환경변수 목록
├── automation-systems.md        # 자동화 시스템
├── verification-commands.md     # 검증 명령어
├── project-structure.md         # 프로젝트 구조
└── document-structure-map.md    # 이 문서
```

#### 참조 관계
```yaml
# 다른 모든 문서가 reference/ 문서들을 참조
project-status.md ← tutorial/01-quick-start.md
project-status.md ← ai-context-warmup.md

database-schema.md ← how-to/database-operations/
api-endpoints.md ← how-to/api-development/
component-inventory.md ← how-to/component-development/
```

---

## 💡 Explanation 섹션 (이해 지향)

### 목적: AI가 프로젝트 배경과 맥락을 이해

```
docs/explanation/
└── mistake-patterns.md          # 22가지 반복 실수 패턴
```

#### 참조 관계
```yaml
mistake-patterns.md ← tutorial/01-quick-start.md (실수 방지)
mistake-patterns.md ← docs/CLAUDE.md (문서 작성 시 참조)
```

---

## 🤖 서브에이전트 CLAUDE.md 파일들

### 목적: 특정 영역 작업 시 전문 지침 제공

```
프로젝트 루트/
├── CLAUDE.md                    # 프로젝트 총괄 가이드
├── docs/CLAUDE.md               # 문서 작업 가이드
├── scripts/CLAUDE.md            # 스크립트 실행 가이드
├── src/app/api/CLAUDE.md        # API Route Agent
├── src/components/CLAUDE.md     # Component Agent
├── src/types/CLAUDE.md          # Type Agent
├── src/lib/security/CLAUDE.md   # Security Agent
├── supabase/migrations/CLAUDE.md # Database Agent
└── [기타 영역별 CLAUDE.md]
```

#### 참조 관계
```yaml
# 각 영역 작업 시 해당 CLAUDE.md 우선 참조
API 작업 → src/app/api/CLAUDE.md → how-to/01-authentication-patterns.md
컴포넌트 작업 → src/components/CLAUDE.md → how-to/create-dhacle-component.md
DB 작업 → supabase/migrations/CLAUDE.md → how-to/create-table.md
```

---

## 🔗 문서간 참조 관계도

### 📋 핵심 참조 흐름

#### 1️⃣ 새 AI 온보딩 플로우
```
ai-context-warmup.md
    ↓
tutorial/01-quick-start.md
    ↓
reference/project-status.md
    ↓
explanation/mistake-patterns.md
```

#### 2️⃣ 실제 작업 플로우
```
해당 영역 CLAUDE.md
    ↓
how-to/ 구체적 가이드
    ↓
reference/ 필요 데이터 조회
    ↓
작업 완료 후 reference/ 업데이트
```

#### 3️⃣ 문제 해결 플로우
```
explanation/mistake-patterns.md
    ↓
how-to/ 해결 가이드
    ↓
reference/ 관련 데이터 확인
    ↓
실제 해결 후 문서 업데이트
```

---

## 🚫 중복 방지 영역 구분

### 📍 명확한 역할 경계

#### Tutorial vs How-to
```yaml
Tutorial (학습):
  - 프로젝트 이해, 첫 작업 실습, 패턴 학습
  - 단계적 지식 습득에 중점

How-to (실행):
  - 구체적 작업 완료, 단계별 구현
  - 즉시 사용 가능한 실행 가이드에 중점
```

#### How-to vs Reference
```yaml
How-to (구현 방법):
  - 단계별 구현 방법, 코드 예시
  - "어떻게 하는가"에 중점

Reference (데이터):
  - 완성된 목록, 현재 상태, 전체 구조
  - "무엇이 있는가"에 중점
```

#### Reference vs Explanation
```yaml
Reference (사실):
  - 현재 상태, 정확한 데이터, 완전한 목록
  - 객관적 사실 나열에 중점

Explanation (배경):
  - 역사적 맥락, 의사결정 이유, 패턴 분석
  - 이해와 맥락 제공에 중점
```

---

## 📊 문서 사용 빈도 분석

### 🔥 높은 사용 빈도 (일일 참조)
```yaml
필수 참조 문서:
  - tutorial/01-quick-start.md (새 세션 시작)
  - reference/project-status.md (현재 상태 확인)
  - explanation/mistake-patterns.md (실수 방지)
  - ai-context-warmup.md (컨텍스트 로딩)
```

### 📈 중간 사용 빈도 (작업별 참조)
```yaml
작업 특화 문서:
  - how-to/ 섹션 전체 (구체적 작업 시)
  - 해당 영역 CLAUDE.md (영역별 작업 시)
  - reference/ 특정 문서 (필요 데이터 조회 시)
```

### 📉 낮은 사용 빈도 (상황별 참조)
```yaml
특수 상황 문서:
  - how-to/documentation/ (문서 작업 시)
  - tutorial/02-first-task.md (학습 필요 시)
  - reference/document-structure-map.md (이 문서)
```

---

## 🔄 문서 업데이트 체인

### ⚡ 즉시 업데이트 체인
```yaml
코드 변경 발생:
  1. 해당 영역 reference/ 문서 업데이트
  2. reference/project-status.md 상태 갱신
  3. ai-context-warmup.md 자동 재생성
  4. 관련 how-to/ 가이드 실제 예시 확인
```

### 📅 정기 업데이트 체인
```yaml
주간 점검:
  1. 전체 reference/ 섹션 정확성 확인
  2. how-to/ 가이드 실제 동작 확인
  3. tutorial/ 섹션 현재 상태 반영
  4. mistake-patterns.md 새 패턴 추가

월간 점검:
  1. 문서간 참조 링크 유효성 확인
  2. 중복 내용 정리 및 통합
  3. 토큰 제한 준수 상태 점검
  4. 문서 구조 최적화 검토
```

---

## 🎯 내비게이션 가이드

### 🧭 상황별 문서 찾기

#### 새 AI 세션 시작 시
```
1. ai-context-warmup.md (30초 컨텍스트 로딩)
2. tutorial/01-quick-start.md (프로젝트 파악)
3. reference/project-status.md (현재 상태 확인)
```

#### 특정 작업 수행 시
```
1. 해당 영역 CLAUDE.md (전문 지침)
2. how-to/ 관련 가이드 (구현 방법)
3. reference/ 관련 문서 (필요 데이터)
```

#### 문제 해결 필요 시
```
1. explanation/mistake-patterns.md (유사 패턴 확인)
2. how-to/ 해결 가이드 (구체적 해결 방법)
3. reference/ 관련 상태 (현재 상태 파악)
```

#### 문서 관리 작업 시
```
1. how-to/documentation/ (문서 작업 가이드)
2. docs/CLAUDE.md (문서 작성 규칙)
3. reference/document-structure-map.md (이 문서)
```

---

## 📋 빠른 참조 인덱스

### 🔍 주요 주제별 문서 위치

| 주제 | 위치 | 문서 유형 |
|------|------|----------|
| 프로젝트 현황 | `reference/project-status.md` | Reference |
| 실수 패턴 | `explanation/mistake-patterns.md` | Explanation |
| API 개발 | `how-to/api-development/` | How-to |
| 컴포넌트 개발 | `how-to/component-development/` | How-to |
| DB 작업 | `how-to/database-operations/` | How-to |
| 인증 패턴 | `how-to/01-authentication-patterns.md` | How-to |
| 타입 시스템 | `how-to/03-type-imports.md` | How-to |
| 컴포넌트 목록 | `reference/component-inventory.md` | Reference |
| API 엔드포인트 | `reference/api-endpoints.md` | Reference |
| 환경 설정 | `reference/environment-variables.md` | Reference |
| 문서 작성 | `docs/CLAUDE.md` | Agent Guide |
| 스크립트 실행 | `scripts/CLAUDE.md` | Agent Guide |

---

*이 구조 맵을 통해 필요한 문서를 빠르게 찾고 올바른 위치에 정보를 배치하세요.*