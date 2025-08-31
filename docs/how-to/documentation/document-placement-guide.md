# 📍 작업 완료 후 문서 배치 가이드

## 📌 문서 관리 지침
**목적**: AI가 작업 완료 후 적절한 문서에 정보를 정확히 배치하는 가이드 제공  
**대상**: 모든 작업 완료하는 AI (개발, 수정, 추가 작업 후)  
**범위**: 작업 유형별 문서 배치 규칙, 업데이트 위치, 정보 분류 기준  
**업데이트 기준**: 새 문서 추가 시, 문서 구조 변경 시 즉시 업데이트  
**최대 길이**: 4000 토큰  
**연관 문서**: [문서 구조](../reference/project-structure.md), [문서 작성 가이드](../../CLAUDE.md)

## ⚠️ 금지사항
- 작업 방법론 추가 금지 (→ how-to/ 구현 가이드로 이관)
- 프로젝트 현황 정보 추가 금지 (→ reference/project-status.md로 이관)
- 상세 기술 스펙 추가 금지 (→ reference/ 문서로 이관)

---

## 🎯 핵심 원칙

### 1️⃣ 작업 완료 후 즉시 문서 업데이트
```
작업 완료 → 해당 reference 문서 업데이트 → 날짜 기록 → 완료
```

### 2️⃣ 정보의 단일 출처 원칙
- 같은 정보는 한 곳에만 저장
- 다른 문서에서는 링크로 참조

### 3️⃣ 실시간 동기화
- 코드 변경 시 즉시 문서 반영
- 추측 정보 절대 금지

---

## 📋 작업 유형별 문서 배치 규칙

### 🔐 API 작업 완료 시
```yaml
새 API Route 생성:
  - reference/api-endpoints.md에 엔드포인트 추가
  - 인증 방식, 파라미터, 응답 형식 기록
  - 현재 오류 상태 업데이트

API 오류 수정:
  - reference/api-endpoints.md 상태 업데이트
  - reference/project-status.md 오류 개수 감소
  - 수정 날짜 기록

새 인증 패턴 발견:
  - how-to/01-authentication-patterns.md에 실제 패턴 추가
  - 기존 패턴과의 차이점 명시
```

### 🧩 컴포넌트 작업 완료 시
```yaml
새 컴포넌트 생성:
  - reference/component-inventory.md에 컴포넌트 추가
  - 위치, 용도, 의존성 기록
  - shadcn/ui 사용 여부 표시

컴포넌트 수정:
  - reference/component-inventory.md 설명 업데이트
  - 주요 변경사항 기록

새 패턴 발견:
  - how-to/component-development/create-dhacle-component.md에 실제 패턴 추가
  - 코드 예시는 실제 컴포넌트에서 추출
```

### 🗄️ 데이터베이스 작업 완료 시
```yaml
새 테이블 생성:
  - reference/database-schema.md에 테이블 구조 추가
  - RLS 정책, 인덱스 정보 기록
  - reference/project-status.md 테이블 개수 업데이트

마이그레이션 실행:
  - supabase/migrations/ 폴더에 SQL 파일 생성
  - reference/database-schema.md 변경사항 반영
  - npm run types:generate 실행 기록

RLS 정책 적용:
  - reference/project-status.md RLS 커버리지 업데이트
  - 보안 점수 개선 기록
```

### 🔧 환경 설정 작업 완료 시
```yaml
새 환경변수 추가:
  - reference/environment-variables.md에 변수 추가
  - 타입, 용도, 필수 여부 기록
  - env.ts 파일 동기화 확인

설정 파일 수정:
  - reference/project-structure.md 관련 파일 정보 업데이트
  - 변경 이유, 영향 범위 기록
```

### 🧪 테스트 작업 완료 시
```yaml
새 테스트 추가:
  - reference/automation-systems.md 테스트 현황 업데이트
  - 커버리지 정보 갱신
  - 테스트 유형별 개수 업데이트

E2E 테스트 수정:
  - reference/verification-commands.md 명령어 업데이트
  - 실행 결과, 소요 시간 기록
```

### 🐛 버그 수정 완료 시
```yaml
반복 실수 패턴 발견:
  - explanation/mistake-patterns.md에 새 패턴 추가
  - 실제 발생 사례, 해결책 기록
  - 예방 방법 명시

기존 패턴 해결:
  - explanation/mistake-patterns.md 해결 표시
  - 해결 날짜, 방법 기록
  - 재발 방지 조치 명시
```

---

## 📂 문서별 업데이트 매트릭스

| 작업 유형 | 업데이트 할 문서 | 기록할 정보 |
|----------|----------------|------------|
| API 추가 | `reference/api-endpoints.md` | 엔드포인트, 인증, 파라미터 |
| 컴포넌트 추가 | `reference/component-inventory.md` | 위치, 용도, 의존성 |
| 테이블 추가 | `reference/database-schema.md` | 스키마, RLS, 인덱스 |
| 환경변수 추가 | `reference/environment-variables.md` | 변수명, 타입, 용도 |
| 테스트 추가 | `reference/automation-systems.md` | 테스트 유형, 커버리지 |
| 버그 수정 | `explanation/mistake-patterns.md` | 패턴, 원인, 해결책 |
| 스크립트 추가 | `reference/verification-commands.md` | 명령어, 용도, 결과 |
| 설정 변경 | `reference/project-structure.md` | 파일 위치, 용도 |

---

## 🔄 업데이트 순서

### 1️⃣ 즉시 업데이트 (작업 완료와 동시)
```bash
1. 해당 reference 문서 업데이트
2. reference/project-status.md 현황 갱신
3. 날짜, 변경 내용 기록
```

### 2️⃣ 패턴 발견 시 (새로운 방법 도출)
```bash
1. how-to/ 가이드에 실제 패턴 추가
2. 기존 패턴과의 차이점 명시
3. 실제 코드 예시 포함
```

### 3️⃣ 문제 해결 시 (버그, 에러 수정)
```bash
1. explanation/mistake-patterns.md 업데이트
2. 해결된 패턴 표시
3. 재발 방지 조치 기록
```

---

## 📊 업데이트 체크리스트

### 작업 완료 후 확인사항
- [ ] 해당 reference 문서 업데이트 완료
- [ ] project-status.md 현황 반영 완료
- [ ] 날짜, 변경 내용 기록 완료
- [ ] 실제 코드와 문서 일치성 확인
- [ ] 관련 문서 링크 유효성 확인

### 새 패턴 발견 시 확인사항
- [ ] how-to/ 가이드에 실제 패턴 추가
- [ ] 실제 코드에서 예시 추출
- [ ] 기존 패턴과 차이점 명시
- [ ] 사용 조건, 주의사항 기록

### 문제 해결 시 확인사항
- [ ] mistake-patterns.md 패턴 업데이트
- [ ] 해결 방법 상세 기록
- [ ] 재발 방지 조치 명시
- [ ] 관련 실수 패턴 연계 정리

---

## 🚨 절대 금지사항

### ❌ 잘못된 배치 패턴
```yaml
Tutorial 섹션에 구현 방법 추가: 금지
→ how-to/ 섹션으로 이관

Reference 섹션에 구현 단계 추가: 금지
→ how-to/ 섹션으로 이관

How-to 섹션에 상세 데이터 나열: 금지
→ reference/ 섹션으로 이관

Explanation 섹션에 단계별 해결책: 금지
→ how-to/ 섹션으로 이관
```

### ❌ 중복 정보 생성
- 같은 정보를 여러 문서에 복사 금지
- 참조 링크 사용 필수

### ❌ 추측성 정보 기록
- 확인되지 않은 정보 기록 금지
- 반드시 실제 코드/결과 확인 후 기록

---

## 📋 완료 후 액션

**작업 완료 시 다음 순서로 진행**:
1. 해당 문서 업데이트
2. reference/project-status.md 갱신
3. 관련 링크 확인
4. 날짜 기록 완료

**매주 금요일 정기 점검**:
- 모든 문서 동기화 상태 확인
- 누락된 업데이트 보완
- 중복 정보 정리

---

*작업 완료 후 이 가이드를 참조하여 적절한 문서에 정보를 배치하세요.*