# 🎯 SC Command + Flag 완전 가이드

*Context 없는 AI를 위한 작업별 최적 명령어 치트시트*

---

## 📋 SC Command 개요

### 🎯 SuperClaude Framework Commands
**SC Commands**: Claude Code의 고급 명령어 체계로, 작업 유형별 최적화된 도구 조합과 워크플로우를 제공

### 🏗️ 기본 구조
```
/[command] [target] --[flags]

예시:
/cleanup docs --validate --evidence --systematic
/improve asset-scanner --focus performance --benchmark --loop
```

### 🎨 Flag 조합 원칙
- **항상 포함**: `--validate` (모든 작업에서 검증 필수)
- **증거 수집**: `--evidence` (성과 측정용)
- **안전 모드**: `--safe-mode` (중요한 시스템 변경 시)
- **성능 집중**: `--focus performance` + `--benchmark`
- **체계적 접근**: `--systematic` (복잡한 작업 시)

---

## 🚀 Phase 1: 즉시 정리 및 안정화 (1-2주)

### 1. 문서 체계 정리
```bash
/cleanup docs --validate --evidence --systematic
```
**목적**: 15개 문서 → 10개 통합, 중복 제거  
**예상 시간**: 2-3시간  
**성공 지표**: 문서 개수 33% 감소, 가독성 향상

**작업 세부사항**:
- 중복 내용이 있는 문서 식별
- 우선순위 기반 문서 통합 계획
- CONTEXT_BRIDGE.md는 최우선 유지
- Before/After 비교표 생성

### 2. 검증 스크립트 중복 제거
```bash
/analyze scripts --focus quality --systematic --evidence
```
**1차**: 현재 스크립트 분석 및 중복 식별
- `verify:parallel` vs `jscpd:check` vs `biome` 중복 분석
- 실행 시간 측정 및 병목 지점 파악
- 중복 로직 매핑

```bash
/improve scripts --validate --safe-mode --loop
```
**2차**: 스크립트 통합 및 최적화
- 중복 제거 후 통합 스크립트 생성
- 기존 기능 손상 방지 (safe-mode)
- 성능 개선 검증 (loop)

### 3. 시스템 헬스체크 자동화
```bash
/build health-check --validate --test-driven --c7
```
**목적**: `npm run health:check` 스크립트 생성  
**기능**:
- 모든 핵심 시스템 상태 확인 (jscpd, Asset Scanner, Git hooks)
- 의존성 설치 상태 검증
- 디스크 용량, 메모리 사용량 체크
- Context7 참조로 모니터링 도구 베스트 프랙티스 적용

### 4. 백업 및 복구 전략
```bash
/implement backup-system --validate --safe-mode --evidence
```
**구현 대상**:
- `project-dna.json` 자동 백업
- `asset-inventory.json` 버전 관리
- `.jscpd.json` 설정 백업
- Git 기반 자동 백업 스케줄링

### 5. 에러 메시지 개선
```bash
/improve error-handling --validate --user-friendly --loop
```
**개선 범위**:
- 모든 npm scripts의 에러 출력
- 사용자 친화적 해결 방안 제시
- 다국어 지원 고려 (한국어/영어)

---

## ⚡ Phase 2: 성능 최적화 및 개선 (3-5주)

### 6. Asset Scanner 성능 최적화
```bash
/improve asset-scanner --focus performance --validate --benchmark --evidence
```
**최적화 목표**:
- 현재 실행시간 50% 단축
- 메모리 사용량 30% 감소
- 199개 자산 스캔 2초 이내

**구현 전략**:
- 캐싱 메커니즘: 변경되지 않은 파일 스킵
- 증분 스캔: Git diff 기반 변경 파일만 분석
- 병렬 처리: Worker threads 활용
- 메모리 최적화: 스트림 기반 파일 처리

### 7. CLI 통합 도구 개발
```bash
/build cli-tool --validate --test-driven --c7 --systematic
```
**개발할 `dhacle-cli` 명령어**:
```bash
npx dhacle-cli scan        # Asset Scanner 실행
npx dhacle-cli check       # 품질 체크 (jscpd + 검증)
npx dhacle-cli context     # AI Context 생성
npx dhacle-cli health      # 시스템 상태 확인
npx dhacle-cli report      # 종합 리포트 생성
npx dhacle-cli backup      # 백업 실행
npx dhacle-cli restore     # 복구 실행
```

**기술 요구사항**:
- Node.js CLI 프레임워크 (Commander.js 추천)
- 모든 기존 npm scripts 통합
- 프로그레스 바 표시
- 컬러 출력 지원

### 8. 히스토리 추적 시스템
```bash
/implement tracking-system --validate --evidence --systematic
```
**추적할 지표**:
- 일일 품질 점수 변화
- 자산 개수 증감 추이
- jscpd 중복률 변화
- 빌드 실행 시간

**구현 방식**:
- CSV 기반 데이터 저장
- 주간/월간 트렌드 차트 생성
- 이상 징후 자동 알림

### 9. 데이터 검증 시스템
```bash
/implement validation-system --validate --systematic --safe-mode
```
**검증 대상**:
- `project-dna.json` 스키마 검증
- `asset-inventory.json` 무결성 확인
- `.jscpd.json` 설정 유효성
- JSON Schema 기반 자동 검증

### 10. Context Loader 캐싱 최적화
```bash
/improve context-loader --focus performance --validate --benchmark
```
**최적화 목표**: 30초 → 5초 단축
**구현**:
- 메모리 기반 캐싱
- 파일 변경 감지 (mtime 기반)
- 증분 업데이트

---

## 🔧 Phase 3: 고도화 및 지속성 (6-9주)

### 11. 프로젝트 문제 구간 개선
```bash
/improve project-quality --systematic --loop --validate --evidence --focus quality
```
**개선 순서**:
1. **테이블 개선** (RLS 정책 누락 2개)
2. **API 보안 강화** (인증 없는 API 9개)
3. **컴포넌트 최적화** (Client Component 79% → 50%)

**체계적 접근법**:
```bash
# 1단계: 테이블 보안
/improve database --focus security --validate --evidence
# RLS 정책 추가, 테이블 권한 검토

# 2단계: API 인증
/improve api-routes --focus security --validate --systematic  
# 모든 API에 getUser() 패턴 적용

# 3단계: 컴포넌트 아키텍처
/improve components --focus architecture --validate --loop
# Server Component 우선 전환, Client는 필요시만
```

### 12. 지시서 템플릿 개선
```bash
/improve instruction-template --c7 --validate --systematic
```
**개선 영역**:
- SuperClaude Framework SC command 통합
- 16개 서브에이전트 활용 최적화
- 대규모 작업 분할 템플릿
- 작업 단위별 세분화

**Context7 참조**:
- 최신 AI 프롬프트 엔지니어링 패턴
- 작업 분할 최적화 기법
- 결과 검증 방법론

### 13. 운영 매뉴얼 작성
```bash
/document operations --comprehensive --validate --systematic
```
**작성할 매뉴얼**:
- **일일 운영**: 품질 체크, 시스템 상태 확인
- **주간 운영**: 트렌드 분석, 백업 검증
- **월간 운영**: 전체 시스템 리뷰, 개선 계획
- **긴급 상황**: 장애 복구, 롤백 절차

### 14. 온보딩 가이드 작성
```bash
/document onboarding --comprehensive --validate --user-friendly
```
**타겟 사용자**:
- 신규 협력자
- 임시 팀원
- 코드 리뷰어
- QA 담당자

---

## 🎨 Flag 완전 가이드

### 🔍 분석 및 탐색 Flags
```bash
--systematic        # 체계적, 단계적 접근
--evidence         # 증거 수집, 측정 가능한 결과
--comprehensive    # 포괄적, 전체적 분석
--deep            # 심층 분석 (시간 많이 소요)
```

### 🛡️ 안전 및 검증 Flags
```bash
--validate        # 모든 작업에 필수, 결과 검증
--safe-mode       # 중요한 변경 시, 백업/복구 포함
--test-driven     # TDD 방식, 테스트 코드 우선
--dry-run         # 실제 변경 없이 시뮬레이션만
```

### ⚡ 성능 및 최적화 Flags
```bash
--focus performance    # 성능 최적화에 집중
--benchmark           # 성능 측정 및 비교
--loop               # 반복적 개선, 점진적 향상
--cache              # 캐싱 활용 최적화
```

### 🤝 사용자 경험 Flags
```bash
--user-friendly      # 사용자 친화적 결과물
--interactive       # 대화형 진행
--progress          # 진행 상황 표시
--verbose           # 상세한 로그 출력
```

### 🔗 외부 도구 연동 Flags
```bash
--c7               # Context7 MCP 서버 활용
--seq              # Sequential MCP 서버 활용  
--magic            # Magic UI MCP 서버 활용
--playwright       # Playwright 테스팅 도구
```

---

## 🎯 상황별 명령어 패턴

### 🆘 긴급 상황 대응
```bash
# 시스템 전체 장애 시
/analyze system --focus stability --evidence --systematic
/implement recovery --safe-mode --validate --priority-high

# 성능 급격한 저하 시
/analyze performance --benchmark --evidence --deep
/improve bottlenecks --focus performance --validate --loop

# 보안 이슈 발생 시
/analyze security --comprehensive --evidence --priority-critical  
/implement security-patch --safe-mode --validate --test-driven
```

### 🔄 정기 운영 작업
```bash
# 일일 체크 (5분)
/analyze health --quick --evidence
/validate systems --automated

# 주간 리뷰 (30분)
/analyze trends --evidence --comprehensive
/improve quality --focus weak-points --validate

# 월간 점검 (2시간)
/analyze architecture --deep --systematic --evidence
/plan improvements --comprehensive --priority-matrix
```

### 🚀 새 기능 개발 시
```bash
# 개발 전 준비
/analyze existing --focus similar --evidence
/design architecture --systematic --validate

# 개발 중 검증
/validate implementation --test-driven --safe-mode
/improve quality --loop --benchmark

# 완료 후 정리
/document changes --comprehensive --user-friendly
/integrate system --validate --systematic
```

---

## 📊 성공 지표별 명령어

### 📈 품질 개선 목표별 접근
```bash
# 전체 품질: 25% → 40%
/improve project-quality --systematic --evidence --loop --target-40-percent

# 보안 점수: 53% → 80%  
/improve security --focus authentication --validate --systematic --target-80-percent

# Modern React: 21% → 50%
/improve react-architecture --focus server-components --validate --systematic --target-50-percent

# 중복률: 현재 → 3% 이하
/improve code-quality --focus duplication --benchmark --loop --target-3-percent
```

### ⏱️ 성능 개선 목표별 접근
```bash
# Asset Scanner: 50% 성능 향상
/improve asset-scanner --focus performance --benchmark --target-50-percent-faster

# Context Loader: 30초 → 5초
/improve context-loader --focus caching --benchmark --target-5-seconds

# Pre-commit: 실행시간 50% 단축
/improve git-hooks --focus performance --benchmark --target-50-percent-faster
```

---

## 🔍 디버깅 및 문제해결 패턴

### 🐛 일반적 문제 해결
```bash
# jscpd 실행 실패 시
/troubleshoot jscpd --systematic --safe-mode
/implement jscpd-fix --validate --test-driven

# Asset Scanner 메모리 부족 시  
/troubleshoot memory-usage --focus optimization --evidence
/improve memory-management --validate --benchmark

# Git hooks 실행 안될 시
/troubleshoot git-hooks --systematic --validate
/implement hooks-repair --safe-mode --test-driven
```

### 🔧 환경 문제 해결
```bash
# Node.js 버전 문제
/analyze environment --focus compatibility --evidence
/implement version-fix --safe-mode --validate

# 의존성 충돌 문제
/troubleshoot dependencies --systematic --evidence  
/resolve conflicts --safe-mode --validate --test-driven

# 권한 문제
/troubleshoot permissions --focus access --systematic
/implement permission-fix --safe-mode --validate
```

---

## ⚙️ 고급 활용 패턴

### 🎛️ Multi-Command 체인
```bash
# 복합 작업 예시 (Phase 1 완전 자동화)
/cleanup docs --validate --evidence --systematic && \
/improve scripts --safe-mode --loop --validate && \
/implement health-check --test-driven --validate && \
/setup backup-system --safe-mode --evidence
```

### 🔄 조건부 실행 패턴
```bash
# 품질 점수가 목표에 도달할 때까지 반복
/improve quality --loop --target-40-percent --max-iterations-10

# 성능이 기준 이하일 때만 최적화 실행
/improve performance --conditional --threshold-30-seconds --benchmark
```

### 🎯 맞춤형 워크플로우
```bash
# 1인 개발자 맞춤 일일 워크플로우
/quick-check --automated --evidence &&          # 5분: 시스템 상태
/focus-work --priority-high --validate &&       # 작업 집중
/wrap-up --backup --validate --evidence         # 마무리 및 백업

# 팀 협업 맞춤 주간 워크플로우
/team-sync --comprehensive --evidence &&        # 팀 상태 동기화  
/quality-review --systematic --benchmark &&     # 품질 리뷰
/plan-next --priority-matrix --validate         # 다음 주 계획
```

---

## 🎊 치트시트 요약

### 📋 자주 쓰는 Top 10 명령어
1. `/cleanup docs --validate --systematic` - 문서 정리
2. `/improve performance --benchmark --loop` - 성능 최적화
3. `/analyze system --evidence --systematic` - 시스템 분석
4. `/implement feature --test-driven --validate` - 기능 구현
5. `/troubleshoot issue --systematic --safe-mode` - 문제 해결
6. `/document changes --comprehensive --user-friendly` - 문서화
7. `/validate systems --automated --evidence` - 시스템 검증
8. `/improve quality --focus weak-points --loop` - 품질 개선
9. `/build tool --test-driven --c7` - 도구 개발
10. `/plan project --systematic --priority-matrix` - 프로젝트 계획

### 🚨 응급상황 Top 5 명령어
1. `/troubleshoot critical --priority-urgent --safe-mode`
2. `/implement hotfix --validate --test-driven --safe-mode`
3. `/rollback changes --safe-mode --validate --evidence`
4. `/analyze failure --deep --systematic --evidence`
5. `/restore backup --safe-mode --validate --test-driven`

### ⚡ 성능 최적화 Top 5 명령어
1. `/improve performance --benchmark --focus bottlenecks`
2. `/optimize memory --cache --validate --evidence`
3. `/reduce duplicates --systematic --target-3-percent`
4. `/streamline workflow --user-friendly --validate`
5. `/automate tasks --comprehensive --test-driven`

---

**이 치트시트를 숙지하면 Context 없는 AI도 Dhacle 프로젝트의 모든 후속 작업을 최적의 명령어로 수행할 수 있습니다! 🎯**

---

*본 치트시트는 2025-08-30 기준으로 작성되었으며, SuperClaude Framework의 최신 패턴을 반영합니다.*