# 🔄 모호한 지시 → 명확한 지시 변환기

## 📌 문서 관리 지침
**목적**: 사용자의 애매한 요청을 SuperClaude 최적화된 명확한 지시로 체계적 변환  
**대상**: Planning AI (지시서 작성 담당), 사용자 요청 분석하는 AI  
**범위**: 변환 템플릿, 컨텍스트 주입 규칙, 플래그 선택 가이드  
**업데이트 기준**: 새 SuperClaude 명령어 추가 시, 변환 패턴 개선 시 즉시 업데이트  
**최대 길이**: 8000 토큰  
**연관 문서**: [명령어 매핑](command-mapping.md), [서브에이전트 매핑](../reference/subagent-mapping.md)

## ⚠️ 금지사항
- SuperClaude 명령어 상세 설명 추가 금지 (→ 공식 문서 참조)
- 구체적 구현 방법 추가 금지 (→ how-to/ 가이드로 이관)
- 프로젝트별 상세 스펙 추가 금지 (→ reference/ 문서로 이관)

---

## 🎯 변환 기본 원칙

### 1️⃣ 모호함 → 구체성
```yaml
변환 전: "API 만들어줘"
변환 후: "/sc:implement 'users 프로필 조회 API 엔드포인트' --validate --c7"

변환 전: "컴포넌트 수정해"
변환 후: "/sc:improve 'VideoCard 컴포넌트 반응형 개선' --magic --validate"
```

### 2️⃣ 추측 → 명확한 컨텍스트
```yaml
변환 전: "버그 고쳐줘"
변환 후: "/sc:troubleshoot 'API 18개 오류 중 인증 관련 오류' --evidence --seq"

변환 전: "성능 개선해"
변환 후: "/sc:improve 'YouTube Lens 로딩 속도 개선' --focus performance --validate"
```

### 3️⃣ 일반적 → 프로젝트 특화
```yaml
일반적 요청: "로그인 기능"
Dhacle 특화: "카카오 OAuth + Supabase Auth 통합 로그인 시스템"

일반적 요청: "데이터베이스"
Dhacle 특화: "YouTube 크리에이터 데이터 + RLS 정책 적용"
```

---

## 🔄 변환 템플릿 시스템

### 📋 Template A: API 개발 요청
```yaml
입력 패턴:
  - "API 만들어줘"
  - "로그인 API"
  - "데이터 가져오는 API"
  - "백엔드 기능"

변환 템플릿:
  "/sc:implement --validate --c7 --delegate auto \
  '[구체적 기능명] API 엔드포인트' \
  --project-context 'Dhacle YouTube 크리에이터 도구' \
  --current-status 'API 18개 오류, Recovery Phase' \
  --reference 'how-to/01-authentication-patterns.md' \
  --subagent 'src/app/api/CLAUDE.md 활성화 필수' \
  --verify 'npm run verify:parallel'"

실제 변환 예시:
  입력: "사용자 프로필 API 만들어줘"
  출력: "/sc:implement --validate --c7 --delegate auto \
  'users 프로필 CRUD API 엔드포인트' \
  --project-context 'Dhacle YouTube 크리에이터 도구' \
  --current-status 'API 18개 오류, Recovery Phase' \
  --reference 'how-to/01-authentication-patterns.md' \
  --subagent 'src/app/api/CLAUDE.md 활성화 필수' \
  --verify 'npm run verify:parallel'"
```

### 📋 Template B: 컴포넌트 개발 요청
```yaml
입력 패턴:
  - "컴포넌트 만들어줘"
  - "UI 개발"
  - "화면 만들어"
  - "버튼/카드/폼 추가"

변환 템플릿:
  "/sc:build --magic --validate --c7 \
  '[구체적 컴포넌트명] React 컴포넌트' \
  --project-context 'Dhacle YouTube 크리에이터 도구' \
  --design-system 'shadcn/ui + Tailwind CSS' \
  --reference 'how-to/component-development/create-dhacle-component.md' \
  --subagent 'src/components/CLAUDE.md 활성화 필수' \
  --verify 'npm run verify:parallel'"

실제 변환 예시:
  입력: "대시보드 카드 만들어줘"
  출력: "/sc:build --magic --validate --c7 \
  'DashboardMetricCard 통계 표시 컴포넌트' \
  --project-context 'Dhacle YouTube 크리에이터 도구' \
  --design-system 'shadcn/ui Card + Badge + 디하클 보라색(#635BFF)' \
  --reference 'how-to/component-development/create-dhacle-component.md' \
  --subagent 'src/components/CLAUDE.md 활성화 필수' \
  --verify 'npm run verify:parallel'"
```

### 📋 Template C: 버그 수정 요청
```yaml
입력 패턴:
  - "버그 고쳐줘"
  - "에러 해결"
  - "작동 안함"
  - "문제 수정"

변환 템플릿:
  "/sc:troubleshoot --evidence --seq --validate \
  '[구체적 문제 상황] 오류 분석 및 해결' \
  --project-context 'Dhacle YouTube 크리에이터 도구, Recovery Phase' \
  --current-issues 'API 18개 오류, Types 2개 오류, 품질 18%' \
  --reference 'explanation/mistake-patterns.md' \
  --verify 'npm run verify:parallel 통과 확인' \
  --evidence '실제 오류 로그 및 재현 단계 포함'"

실제 변환 예시:
  입력: "로그인이 안 돼"
  출력: "/sc:troubleshoot --evidence --seq --validate \
  '카카오 로그인 인증 실패 오류 분석 및 해결' \
  --project-context 'Dhacle 카카오 OAuth + Supabase Auth 시스템' \
  --current-issues 'API 18개 오류 중 인증 관련 패턴 존재' \
  --reference 'how-to/01-authentication-patterns.md' \
  --subagent 'src/lib/security/CLAUDE.md 보안 검증 필수' \
  --verify 'npm run verify:parallel 인증 테스트 통과' \
  --evidence '브라우저 콘솔 오류, 네트워크 탭 실패 응답 포함'"
```

### 📋 Template D: 성능 개선 요청
```yaml
입력 패턴:
  - "느려요"
  - "성능 개선"
  - "최적화"
  - "속도 향상"

변환 템플릿:
  "/sc:improve --focus performance --validate --evidence \
  '[구체적 성능 문제] 성능 최적화' \
  --project-context 'Dhacle YouTube 크리에이터 도구, 136개 자산' \
  --current-performance '품질 18%, Modern React 30% (Client 과다사용)' \
  --reference 'reference/component-inventory.md' \
  --target 'Server Component 전환, 로딩 시간 <3초' \
  --verify 'Playwright 성능 테스트 통과'"

실제 변환 예시:
  입력: "YouTube Lens 느려요"
  출력: "/sc:improve --focus performance --validate --evidence \
  'YouTube Lens 17개 컴포넌트 로딩 성능 최적화' \
  --project-context 'Dhacle 핵심 기능, 복잡한 데이터 처리' \
  --current-performance 'Client Component 과다, 데이터 페칭 비효율' \
  --reference 'reference/component-inventory.md YouTube Lens 섹션' \
  --target 'Server Component 우선, 로딩 시간 50% 단축' \
  --verify 'Playwright E2E 성능 테스트 3초 내 완료'"
```

### 📋 Template E: 문서화 요청
```yaml
입력 패턴:
  - "문서 만들어"
  - "README 작성"
  - "가이드 필요"
  - "설명서"

변환 템플릿:
  "/sc:document --c7 --evidence --validate \
  '[구체적 문서 주제] 문서 작성' \
  --project-context 'Dhacle 문서 시스템 (Diátaxis 4-tier)' \
  --document-type 'tutorial|how-to|reference|explanation' \
  --reference 'how-to/documentation/document-placement-guide.md' \
  --subagent 'docs/CLAUDE.md 문서 규칙 준수 필수' \
  --verify '문서 헤더, 길이 제한, 중복 방지 확인'"

실제 변환 예시:
  입력: "새 기능 사용법 문서 만들어"
  출력: "/sc:document --c7 --evidence --validate \
  'YouTube Lens 사용법 튜토리얼 문서' \
  --project-context 'Dhacle 문서 시스템, 30초 온보딩 목표' \
  --document-type 'how-to (단계별 사용법 가이드)' \
  --reference 'how-to/documentation/document-placement-guide.md' \
  --content-source '실제 YouTube Lens 17개 컴포넌트 분석' \
  --subagent 'docs/CLAUDE.md 문서 규칙 준수 필수' \
  --verify 'tutorial 헤더, 3000 토큰 제한, 실제 동작 확인'"
```

---

## 🚩 SuperClaude 플래그 자동 선택 가이드

### 🎯 작업 유형별 필수 플래그
```yaml
API 개발:
  필수: --validate, --c7
  권장: --delegate auto, --evidence
  조건부: --seq (복잡한 비즈니스 로직 시)

컴포넌트 개발:
  필수: --magic, --validate, --c7  
  권장: --evidence
  조건부: --delegate files (다수 컴포넌트 시)

버그 수정:
  필수: --evidence, --seq, --validate
  권장: --think, --troubleshoot
  조건부: --ultrathink (복합 오류 시)

성능 개선:
  필수: --focus performance, --validate
  권장: --evidence, --playwright
  조건부: --wave-mode (대규모 최적화 시)

문서화:
  필수: --c7, --evidence, --validate
  권장: --document
  조건부: --systematic (체계적 문서 정리 시)
```

### 🔍 복잡도별 플래그 조합
```yaml
Simple (단일 파일, 직접적):
  기본: --validate
  추가: --c7 (라이브러리 사용 시)

Moderate (다중 파일, 연관성):
  기본: --validate, --evidence
  추가: --seq (논리적 복잡도 시), --delegate (파일 다수 시)

Complex (시스템 전반, 영향 광범위):
  기본: --validate, --evidence, --seq
  추가: --wave-mode, --ultrathink, --all-mcp
  조건: --think-hard (아키텍처 영향 시)
```

---

## 🏗️ 컨텍스트 주입 규칙

### 📋 프로젝트 컨텍스트 (항상 포함)
```yaml
프로젝트 정보:
  - "Dhacle (YouTube 크리에이터 도구 플랫폼)"
  - "Next.js 15 + Supabase + TypeScript"
  - "Recovery Phase - 품질 개선 중"

현재 상태:
  - "API 18개 오류, Types 2개 오류"
  - "품질 점수 18% (검증 50% 성공)"
  - "136개 자산 (컴포넌트 96, API 40, 테이블 45+)"

기술 스택:
  - "shadcn/ui + Tailwind CSS (디하클 보라색 #635BFF)"
  - "Supabase Auth + 카카오 OAuth"
  - "YouTube Data API v3 통합"
```

### 📋 작업별 특화 컨텍스트
```yaml
API 작업:
  - "getUser() 인증 패턴 (getSession() 금지)"
  - "snake_case DB ↔ camelCase API 변환"
  - "RLS 정책 필수 적용 (현재 0% 커버리지)"

컴포넌트 작업:
  - "Server Component 우선 (Modern React 30% 개선 필요)"
  - "shadcn/ui 17개 컴포넌트 + 디하클 색상 시스템"
  - "YouTube Lens 17개 전용 컴포넌트 존재"

DB 작업:
  - "45+ 테이블, 복잡한 마이그레이션 이력"
  - "YouTube Lens 시스템 + 수익 인증 시스템"
  - "RLS 정책 + 성능 인덱스 필수"
```

### 📋 참조 문서 (작업별 필수)
```yaml
API 작업:
  - "how-to/01-authentication-patterns.md"
  - "reference/api-endpoints.md"
  - "src/app/api/CLAUDE.md"

컴포넌트 작업:
  - "how-to/component-development/create-dhacle-component.md"
  - "reference/component-inventory.md"
  - "src/components/CLAUDE.md"

DB 작업:
  - "how-to/database-operations/create-table.md"
  - "reference/database-schema.md"
  - "supabase/migrations/CLAUDE.md"

버그 수정:
  - "explanation/mistake-patterns.md"
  - "reference/project-status.md"
  - 해당 영역 CLAUDE.md

성능 개선:
  - "reference/component-inventory.md"
  - "how-to/ 관련 최적화 가이드"
  - Playwright 성능 테스트 가이드
```

---

## 🎬 실제 변환 시나리오

### 시나리오 1: 초보자 요청
```yaml
입력: "로그인 만들고 싶어요"

분석:
  - 작업 유형: API + 컴포넌트 (복합)
  - 복잡도: Moderate
  - 도메인: 인증 시스템

변환 결과:
  "/sc:implement --validate --c7 --security-first \
  '카카오 OAuth + Supabase Auth 통합 로그인 시스템' \
  --project-context 'Dhacle YouTube 크리에이터 도구' \
  --current-status 'API 18개 오류, 인증 관련 패턴 포함' \
  --reference 'how-to/01-authentication-patterns.md' \
  --subagent 'src/app/api/CLAUDE.md, src/lib/security/CLAUDE.md 활성화' \
  --components 'KakaoLoginButton 컴포넌트 + 인증 상태 관리' \
  --verify 'npm run verify:parallel, E2E 로그인 테스트 통과'"
```

### 시나리오 2: 전문가 요청
```yaml
입력: "YouTube Lens 성능 최적화하고 테스트 커버리지 80% 달성"

분석:
  - 작업 유형: 성능 개선 + 테스트
  - 복잡도: Complex
  - 도메인: 핵심 기능

변환 결과:
  "/sc:improve --focus performance --wave-mode progressive --validate --evidence \
  'YouTube Lens 17개 컴포넌트 성능 최적화 + 테스트 커버리지 80%' \
  --project-context 'Dhacle 핵심 기능, 복잡한 YouTube API 연동' \
  --current-performance 'Modern React 30%, Client Component 과다' \
  --target 'Server Component 전환, 로딩 <3초, 테스트 80%' \
  --reference 'reference/component-inventory.md YouTube Lens 섹션' \
  --subagent 'src/components/CLAUDE.md, tests/CLAUDE.md 활성화' \
  --tools 'Playwright 성능 테스트, Jest 단위 테스트' \
  --verify 'npm run verify:parallel, npm run e2e:fast, 커버리지 확인'"
```

### 시나리오 3: 긴급 상황
```yaml
입력: "프로덕션 배포했는데 API 다 터져요!"

분석:
  - 작업 유형: 긴급 버그 수정
  - 복잡도: Critical
  - 상황: 운영 장애

변환 결과:
  "/sc:troubleshoot --evidence --ultrathink --safe-mode \
  '프로덕션 API 18개 오류 긴급 분석 및 해결' \
  --project-context 'Dhacle 운영 환경, 사용자 영향 발생' \
  --current-crisis 'API 전체 장애, Recovery Phase에서 배포' \
  --priority 'P0: 인증 API, P1: YouTube Lens API, P2: 기타' \
  --reference 'explanation/mistake-patterns.md, reference/api-endpoints.md' \
  --subagent 'src/app/api/CLAUDE.md 긴급 모드 활성화' \
  --rollback-plan '즉시 롤백 가능 여부 확인' \
  --verify '단계별 검증 후 점진적 복구, 실시간 모니터링'"
```

---

## 🔧 변환 프로세스 자동화

### 1️⃣ 요청 분석 단계
```yaml
키워드 추출:
  - 동작: 만들어, 수정, 고쳐, 개선, 분석
  - 대상: API, 컴포넌트, 테이블, 문서, 테스트
  - 범위: 전체, 특정 기능, 일부분
  - 우선순위: 긴급, 중요, 보통

컨텍스트 파악:
  - 사용자 경험 수준 (초보/중급/전문가)
  - 작업 범위 (단일/다중/시스템 전반)
  - 시급성 (즉시/계획된/장기)
```

### 2️⃣ 템플릿 매칭 단계
```yaml
작업 유형 매칭:
  - Template A-E 중 최적 선택
  - 복합 작업 시 템플릿 조합
  - 예외 상황 처리 방법

플래그 자동 선택:
  - 필수 플래그 자동 추가
  - 조건부 플래그 상황별 판단
  - 성능 최적화 플래그 조합
```

### 3️⃣ 검증 및 완성 단계
```yaml
완성도 체크:
  - 모든 필수 요소 포함 확인
  - 프로젝트 컨텍스트 정확성
  - 참조 문서 적절성

최종 검토:
  - SuperClaude 명령어 문법 정확성
  - 플래그 조합 호환성
  - 실행 가능성 확인
```

---

## 📋 변환 품질 체크리스트

### ✅ 필수 요소 확인
- [ ] SuperClaude 명령어 정확한 문법
- [ ] 구체적인 작업 명세 (모호함 제거)
- [ ] Dhacle 프로젝트 컨텍스트 포함
- [ ] 적절한 참조 문서 링크
- [ ] 해당 서브에이전트 CLAUDE.md 명시
- [ ] 검증 방법 구체적 제시

### ✅ 품질 요소 확인
- [ ] 작업 범위 명확히 정의
- [ ] 성공 기준 측정 가능
- [ ] 실패 시 대응 방안 포함
- [ ] 관련 기술 스택 정확 반영
- [ ] 현재 프로젝트 상태 정확 반영

### ✅ 실행 가능성 확인
- [ ] 참조된 문서들 실제 존재
- [ ] 제시된 도구/명령어 사용 가능
- [ ] 서브에이전트 활성화 경로 정확
- [ ] 검증 명령어 실제 동작
- [ ] 예상 소요 시간 합리적

---

*이 변환기를 통해 모호한 사용자 요청을 명확하고 실행 가능한 SuperClaude 지시로 변환하세요.*