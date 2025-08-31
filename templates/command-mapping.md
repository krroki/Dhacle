# 🎯 SuperClaude 명령어 매핑 가이드

## 📌 문서 관리 지침
**목적**: 작업 유형별 최적 SuperClaude 명령어와 플래그 조합 제공  
**대상**: Planning AI (명령어 선택 담당), 지시서 작성하는 AI  
**범위**: 명령어별 특징, 작업 매칭 규칙, 플래그 조합 패턴  
**업데이트 기준**: 새 SuperClaude 명령어 추가 시, 플래그 체계 변경 시 즉시 업데이트  
**최대 길이**: 6000 토큰  
**연관 문서**: [지시 변환기](instruction-converter.md), [서브에이전트 매핑](../reference/subagent-mapping.md)

## ⚠️ 금지사항
- SuperClaude 내부 구현 설명 추가 금지 (→ 공식 문서 참조)
- 구체적 기술 구현 방법 추가 금지 (→ how-to/ 가이드로 이관)
- 프로젝트별 세부 사항 추가 금지 (→ reference/ 문서로 이관)

---

## 🚀 SuperClaude 핵심 명령어

### 📊 `/sc:analyze` - 분석 및 조사
```yaml
용도: 복잡한 문제 분석, 현상 파악, 원인 조사
강점: 체계적 분석, 증거 기반 결론, 다각도 접근
적합한 작업:
  - 버그 원인 분석
  - 성능 병목 지점 파악
  - 코드베이스 현황 조사
  - 아키텍처 검토

기본 플래그: --evidence, --validate
추천 조합: --seq (복잡한 분석), --c7 (패턴 분석), --think (깊이 분석)
```

**Dhacle 프로젝트 활용 예시**:
```bash
# API 18개 오류 분석
/sc:analyze --evidence --validate --seq \
"API 18개 오류 패턴 분석 및 우선순위 도출" \
--current-state "Recovery Phase, 50% 검증 성공" \
--reference "reference/api-endpoints.md"

# 성능 병목 분석  
/sc:analyze --evidence --validate --playwright \
"YouTube Lens 17개 컴포넌트 성능 병목 지점 분석" \
--focus "로딩 시간, 렌더링 성능, 메모리 사용량"
```

### 🔨 `/sc:implement` - 기능 구현
```yaml
용도: 새로운 기능, API, 컴포넌트 구현
강점: 단계별 구현, 품질 검증, 표준 준수
적합한 작업:
  - 새 API 엔드포인트 생성
  - React 컴포넌트 개발
  - 데이터베이스 테이블 추가
  - 인증/권한 시스템 구축

기본 플래그: --validate, --c7
추천 조합: --delegate auto (다중 파일), --evidence (검증), --magic (UI)
```

**Dhacle 프로젝트 활용 예시**:
```bash
# 새 API 구현
/sc:implement --validate --c7 --delegate auto \
"사용자 프로필 관리 API (CRUD)" \
--auth-pattern "getUser() + RLS 정책" \
--subagent "src/app/api/CLAUDE.md"

# 컴포넌트 구현
/sc:implement --validate --magic --c7 \
"YouTube 채널 통계 대시보드 컴포넌트" \
--design-system "shadcn/ui + 디하클 보라색" \
--subagent "src/components/CLAUDE.md"
```

### 🔧 `/sc:improve` - 기존 코드 개선
```yaml
용도: 성능 최적화, 리팩토링, 품질 향상
강점: 점진적 개선, 안전한 변경, 측정 가능한 결과
적합한 작업:
  - 성능 최적화
  - 코드 리팩토링
  - 보안 강화
  - 사용성 개선

기본 플래그: --validate, --evidence
추천 조합: --focus (특화 개선), --wave-mode (대규모), --loop (반복)
```

**Dhacle 프로젝트 활용 예시**:
```bash
# 성능 최적화
/sc:improve --focus performance --validate --evidence \
"YouTube Lens 컴포넌트 Server Component 전환" \
--target "Modern React 점수 30% → 80% 향상" \
--wave-mode progressive

# 보안 강화
/sc:improve --focus security --validate --seq \
"RLS 정책 적용으로 보안 점수 개선" \
--current "RLS 커버리지 0%" \
--target "RLS 커버리지 90% 이상"
```

### 🛠️ `/sc:build` - 프로젝트/시스템 구축
```yaml
용도: 복합적 시스템 구축, 다중 컴포넌트 개발
강점: 통합적 구축, 의존성 관리, 전체적 설계
적합한 작업:
  - 완전한 기능 시스템
  - 다중 컴포넌트 프로젝트
  - 통합 워크플로우
  - 자동화 시스템

기본 플래그: --validate, --c7
추천 조합: --magic (UI 시스템), --wave-mode (대규모), --delegate (병렬)
```

**Dhacle 프로젝트 활용 예시**:
```bash
# 완전한 기능 시스템
/sc:build --validate --magic --c7 --wave-mode systematic \
"YouTube 채널 분석 대시보드 완전 구축" \
--components "데이터 수집 + 분석 + 시각화 + 내보내기" \
--integration "YouTube API + DB + UI"

# 자동화 시스템
/sc:build --validate --delegate auto --seq \
"문서 자동 동기화 시스템" \
--scope "코드 변경 → 문서 업데이트 → 검증"
```

### 🐛 `/sc:troubleshoot` - 문제 해결
```yaml
용도: 버그 수정, 오류 해결, 장애 복구
강점: 체계적 디버깅, 근본 원인 파악, 안전한 수정
적합한 작업:
  - 운영 장애 해결
  - 복잡한 버그 수정
  - 성능 문제 해결
  - 통합 오류 수정

기본 플래그: --evidence, --seq, --validate
추천 조합: --think (복잡한 문제), --safe-mode (운영), --ultrathink (크리티컬)
```

**Dhacle 프로젝트 활용 예시**:
```bash
# 긴급 장애 해결
/sc:troubleshoot --evidence --ultrathink --safe-mode \
"프로덕션 API 18개 오류 긴급 복구" \
--priority "P0: 인증, P1: YouTube Lens, P2: 기타" \
--rollback-plan "단계별 복구 후 검증"

# 복잡한 버그 해결
/sc:troubleshoot --evidence --seq --validate \
"YouTube API 데이터 동기화 오류 해결" \
--symptoms "데이터 누락, 중복 처리, 캐시 불일치"
```

### 📚 `/sc:document` - 문서 작성
```yaml
용도: 기술 문서, 가이드, API 문서 작성
강점: 구조화된 문서, 실제 코드 기반, 유지보수 용이
적합한 작업:
  - 사용자 가이드
  - API 문서
  - 개발자 문서
  - 시스템 문서

기본 플래그: --c7, --evidence, --validate
추천 조합: --systematic (체계적), --document (전용 모드)
```

**Dhacle 프로젝트 활용 예시**:
```bash
# 사용자 가이드
/sc:document --c7 --evidence --validate \
"YouTube Lens 사용자 가이드 문서" \
--document-type "tutorial (단계별 사용법)" \
--structure "Diátaxis 프레임워크 준수"

# API 문서
/sc:document --c7 --evidence --validate \
"Dhacle API 엔드포인트 완전 문서화" \
--scope "40개 API 엔드포인트 + 18개 오류 상태" \
--format "OpenAPI 3.0 호환"
```

---

## 🎯 작업 유형별 최적 명령어

### 🔐 API 개발
```yaml
Primary: /sc:implement
Flags: --validate, --c7, --delegate auto
Secondary: /sc:troubleshoot (오류 수정)
Use Case: REST API, GraphQL, 인증, 권한

Template:
  "/sc:implement --validate --c7 --delegate auto \
  '[구체적 API 기능]' \
  --auth-pattern 'getUser() + RLS' \
  --subagent 'src/app/api/CLAUDE.md'"
```

### 🎨 UI/UX 개발
```yaml
Primary: /sc:build, /sc:implement
Flags: --magic, --validate, --c7
Secondary: /sc:improve (최적화)
Use Case: React 컴포넌트, 디자인 시스템, 사용자 경험

Template:
  "/sc:build --magic --validate --c7 \
  '[구체적 UI 컴포넌트]' \
  --design-system 'shadcn/ui + Tailwind' \
  --subagent 'src/components/CLAUDE.md'"
```

### 📊 데이터베이스
```yaml
Primary: /sc:implement
Flags: --validate, --security-first
Secondary: /sc:improve (스키마 최적화)
Use Case: 테이블 생성, 마이그레이션, RLS 정책

Template:
  "/sc:implement --validate --security-first \
  '[테이블/스키마 구조]' \
  --rls-policy 'USER별 데이터 분리' \
  --subagent 'supabase/migrations/CLAUDE.md'"
```

### 🧪 테스트 개발
```yaml
Primary: /sc:build, /sc:implement
Flags: --validate, --playwright (E2E), --evidence
Secondary: /sc:analyze (커버리지 분석)
Use Case: 단위 테스트, 통합 테스트, E2E 테스트

Template:
  "/sc:build --validate --playwright --evidence \
  '[테스트 시나리오]' \
  --coverage-target '80% 이상' \
  --subagent 'tests/CLAUDE.md'"
```

### ⚡ 성능 최적화
```yaml
Primary: /sc:improve, /sc:analyze
Flags: --focus performance, --validate, --evidence
Secondary: /sc:troubleshoot (병목 해결)
Use Case: 로딩 속도, 렌더링, 메모리, 네트워크

Template:
  "/sc:improve --focus performance --validate --evidence \
  '[성능 개선 대상]' \
  --target 'Core Web Vitals 향상' \
  --tools 'Playwright + Lighthouse'"
```

### 🔒 보안 강화
```yaml
Primary: /sc:improve, /sc:implement
Flags: --security-first, --validate, --seq
Secondary: /sc:troubleshoot (취약점 수정)
Use Case: 인증, 권한, 데이터 보호, 취약점 수정

Template:
  "/sc:improve --security-first --validate --seq \
  '[보안 강화 영역]' \
  --standards 'OWASP Top 10 + RLS' \
  --subagent 'src/lib/security/CLAUDE.md'"
```

---

## 🚩 플래그 조합 패턴

### 🎯 필수 플래그 매트릭스
```yaml
모든 작업: --validate (품질 검증 필수)

분석/조사: --evidence (증거 기반)
구현/구축: --c7 (라이브러리 패턴)
개선/최적화: --focus [domain] (특화)
문제해결: --seq (체계적 접근)
문서화: --document (구조화)
```

### 🔀 고급 플래그 조합
```yaml
대규모 작업:
  --wave-mode [progressive|systematic|adaptive]
  - progressive: 점진적 개선
  - systematic: 체계적 구축
  - adaptive: 상황별 적응

복잡한 분석:
  --think (4K 토큰) / --think-hard (10K) / --ultrathink (32K)
  - think: 모듈 수준 분석
  - think-hard: 시스템 수준 분석  
  - ultrathink: 전체 아키텍처 분석

병렬 처리:
  --delegate [files|folders|auto]
  - files: 파일별 병렬 처리
  - folders: 폴더별 병렬 처리
  - auto: 자동 판단

반복 개선:
  --loop [iterations]
  - 자동: polish, improve, refine 키워드 시
  - 수동: --iterations N 지정
```

### 🎨 도메인별 특화 조합
```yaml
Frontend:
  --magic --validate --c7
  (UI 생성 + 검증 + 패턴)

Backend:
  --validate --c7 --delegate auto
  (검증 + 패턴 + 병렬 처리)

DevOps:
  --validate --safe-mode --evidence
  (검증 + 안전 모드 + 증거)

Performance:
  --focus performance --playwright --evidence
  (성능 특화 + 측정 + 증거)

Security:
  --security-first --validate --seq
  (보안 우선 + 검증 + 체계적)

Documentation:
  --c7 --evidence --document --validate
  (패턴 + 증거 + 문서화 + 검증)
```

---

## 🎪 복합 작업 시나리오

### 시나리오 1: 새 기능 완전 개발
```yaml
단계별 명령어 체인:
  1. 분석: /sc:analyze --evidence --seq "요구사항 분석"
  2. 설계: /sc:build --validate --c7 "시스템 아키텍처"
  3. 구현: /sc:implement --validate --magic "핵심 기능"
  4. 최적화: /sc:improve --focus performance "성능 튜닝"
  5. 문서화: /sc:document --c7 --evidence "사용자 가이드"

SuperClaude 통합:
  "/sc:build --wave-mode systematic --validate --all-mcp \
  '[전체 기능명] 완전 개발' \
  --phases 'analysis→design→implement→optimize→document'"
```

### 시나리오 2: 레거시 시스템 현대화
```yaml
단계별 명령어 체인:
  1. 현황: /sc:analyze --ultrathink --evidence "레거시 분석"
  2. 계획: /sc:build --wave-mode adaptive "마이그레이션 계획"
  3. 단계적 개선: /sc:improve --loop --validate "점진적 개선"
  4. 검증: /sc:troubleshoot --evidence --seq "문제 해결"
  5. 완료: /sc:document --systematic "변경 사항 문서화"

SuperClaude 통합:
  "/sc:improve --wave-mode progressive --loop --all-mcp \
  '[레거시 시스템] 현대화' \
  --strategy '점진적 교체 + 안전한 마이그레이션'"
```

### 시나리오 3: 성능 위기 대응
```yaml
긴급 대응 체인:
  1. 긴급 분석: /sc:analyze --evidence --ultrathink --safe-mode
  2. 즉시 수정: /sc:troubleshoot --evidence --seq --safe-mode
  3. 근본 해결: /sc:improve --focus performance --wave-mode
  4. 예방 조치: /sc:build --validate --systematic
  5. 모니터링: /sc:document --evidence --validate

SuperClaude 통합:
  "/sc:troubleshoot --evidence --ultrathink --safe-mode \
  '[성능 위기] 긴급 대응 및 근본 해결' \
  --priority 'P0: 즉시 수정 → P1: 근본 해결 → P2: 예방'"
```

---

## 📊 명령어 선택 결정 트리

### 🤔 첫 번째 질문: "무엇을 하려는가?"
```yaml
분석하려면 → /sc:analyze
  - 원인 파악, 현황 조사, 문제 분석
  
만들려면 → /sc:implement (단일) | /sc:build (복합)
  - 새 기능, 컴포넌트, API, 시스템
  
고치려면 → /sc:troubleshoot (버그) | /sc:improve (개선)
  - 버그 수정, 성능 개선, 리팩토링
  
문서화하려면 → /sc:document
  - 가이드, API 문서, 시스템 문서
```

### 🎯 두 번째 질문: "얼마나 복잡한가?"
```yaml
Simple: 기본 플래그만
  - --validate, --c7

Moderate: 특화 플래그 추가
  - --evidence, --seq, --delegate

Complex: 고급 플래그 활용
  - --wave-mode, --think-hard, --all-mcp
```

### 🚀 세 번째 질문: "어떤 도메인인가?"
```yaml
Frontend → --magic
Backend → --delegate auto
Performance → --focus performance --playwright
Security → --security-first --seq
Database → --validate --security-first
Testing → --playwright --evidence
Documentation → --document --systematic
```

---

## 📋 명령어 품질 체크리스트

### ✅ 기본 품질
- [ ] 적절한 명령어 선택 (analyze/implement/build/improve/troubleshoot/document)
- [ ] 필수 플래그 포함 (--validate는 거의 모든 경우)
- [ ] 작업 범위 명확히 정의
- [ ] Dhacle 프로젝트 컨텍스트 포함

### ✅ 고급 품질  
- [ ] 도메인별 특화 플래그 적용
- [ ] 복잡도에 맞는 플래그 조합
- [ ] 참조 문서 정확히 명시
- [ ] 서브에이전트 활성화 경로 제시

### ✅ 실행 품질
- [ ] 검증 방법 구체적 제시
- [ ] 성공 기준 측정 가능
- [ ] 실패 시 대응 방안 포함
- [ ] 예상 소요 시간 합리적

---

*이 매핑 가이드를 통해 각 상황에 최적화된 SuperClaude 명령어를 선택하세요.*