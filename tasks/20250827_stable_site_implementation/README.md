/sc:implement --seq --validate --wave-mode --think-hard --delegate files --c7
"Dhacle 프로젝트를 실제로 안정적이게 사용 가능한 사이트로 완성 - 모든 기능이 브라우저에서 E2E 워크플로우로 작동하도록 구현"

# 🎯 Dhacle 안정적 사이트 구현 마스터 지시서

⚠️ → `/docs/CONTEXT_BRIDGE.md` 및 `/CLAUDE.md` 17-71행 필수 확인
⚠️ → **목표: 코드 작성이 아닌 실제 작동하는 사이트 구현**

## 🔥 핵심 원칙

> **"빌드 성공이 목표가 아니다. 사용자가 브라우저에서 실제로 사용할 수 있는 사이트가 목표다!"**

## 📊 현재 상황 분석

### 🚨 주요 문제점
1. **타입 에러 15개+**: 필드명 불일치, 타입 정의 오류
2. **TODO 주석 41개**: 핵심 기능 미구현
3. **E2E 테스트 0%**: 실제 작동 검증 없음
4. **안정성 부족**: 에러 처리 미비, 임시방편 코드

### ✅ 완료된 작업
- Phase 1 DB 구조: 100% 완료
- 기본 프로젝트 구조 설정
- index.ts 타입 문제 해결 (사용자 확인)

## 📂 Phase 구조

| Phase | 작업 내용 | 우선순위 | 예상 시간 | 목표 |
|-------|----------|---------|----------|------|
| **Phase 0** | 긴급 수정 | 🔴 CRITICAL | 1일 | 타입 에러 0개, 빌드 성공 |
| **Phase 1** | 핵심 기능 구현 | 🔴 CRITICAL | 2-3일 | TODO 제거, 기본 기능 작동 |
| **Phase 2** | 안정성 확보 | 🟠 HIGH | 2일 | 에러 처리, 데이터 검증 |
| **Phase 3** | E2E 품질 보증 | 🟡 MEDIUM | 2일 | 전체 워크플로우 검증 |

## 🎯 최종 목표

### 🔴 필수 달성 조건
```bash
# 1. 코드 품질
- [ ] TypeScript 컴파일 에러: 0개
- [ ] TODO 주석: 0개
- [ ] any 타입 사용: 0개
- [ ] npm run build: 성공

# 2. 실제 작동 (가장 중요!)
- [ ] npm run dev → http://localhost:3000 정상 로드
- [ ] 모든 페이지 에러 없이 접근 가능
- [ ] 브라우저 콘솔: 에러 0개
- [ ] Network 탭: 모든 API 200/201 응답

# 3. E2E 워크플로우
- [ ] 회원가입 → 로그인 → 프로필 설정: 완전 작동
- [ ] YouTube Lens: 검색 → 결과 → 상세보기 작동
- [ ] 수익 인증: 작성 → 업로드 → 저장 → 공유 작동
- [ ] 결제: 상품 선택 → 쿠폰 → 결제 완료 작동
```

## 🔄 실행 전략

### Wave Mode 활용
- **Wave 1**: Discovery & Analysis (현황 파악)
- **Wave 2**: Critical Fixes (긴급 수정)
- **Wave 3**: Implementation (기능 구현)
- **Wave 4**: Validation (검증)
- **Wave 5**: Optimization (최적화)

### 병렬 처리 전략
```yaml
parallel_tasks:
  - 타입 에러 수정 (Phase 0)
  - API 구현 (Phase 1)
  - UI 컴포넌트 수정 (Phase 1)
  
sequential_tasks:
  - 에러 처리 시스템 (Phase 2)
  - E2E 테스트 (Phase 3)
```

## 📋 Phase별 상세 파일

```
tasks/20250827_stable_site_implementation/
├── README.md                    # 이 파일 (마스터 지시서)
├── PHASE_0_CRITICAL_FIXES.md   # 긴급 타입 에러 수정
├── PHASE_1_CORE_FEATURES.md    # 핵심 기능 구현
├── PHASE_2_STABILITY.md        # 안정성 및 에러 처리
└── PHASE_3_E2E_QUALITY.md      # E2E 테스트 및 품질 보증
```

## ✅ 일일 체크리스트

### 매일 시작 시
```bash
# 1. 최신 상태 확인
git pull
npm install

# 2. 현재 상태 체크
npm run types:check  # 타입 에러 확인
grep -r "TODO" src/ | wc -l  # TODO 개수 확인

# 3. 실제 작동 테스트
npm run dev
# 브라우저: http://localhost:3000
# 개발자 도구 → Console 탭 확인
```

### 매일 종료 시
```bash
# 1. 검증
npm run build  # 빌드 성공 확인
npm run verify:parallel  # 전체 검증

# 2. 진행상황 기록
git add -A && git commit -m "Phase X: [작업 내용]"

# 3. 보고
- 해결된 타입 에러: X개
- 구현된 기능: [목록]
- 남은 TODO: X개
```

## 📊 진행 상황 추적

### Phase별 진행률
| Phase | 시작 | 25% | 50% | 75% | 완료 | 검증 |
|-------|------|-----|-----|-----|------|------|
| Phase 0 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Phase 1 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Phase 2 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Phase 3 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

### 핵심 지표
```yaml
현재 상태 (2025-08-27):
  타입_에러: 15개
  TODO_주석: 41개
  구현_완료_기능: 30%
  E2E_테스트_커버리지: 0%

목표 상태:
  타입_에러: 0개
  TODO_주석: 0개
  구현_완료_기능: 100%
  E2E_테스트_커버리지: 80%+
```

## 🚨 위험 관리

### 주요 리스크
1. **타입 시스템 충돌**: 점진적 수정, any 타입 절대 금지
2. **기능 파괴**: 기능별 테스트, 즉시 롤백 준비
3. **성능 저하**: 메트릭 모니터링, 최적화 적용

### 롤백 계획
```bash
# 백업
git checkout -b backup-$(date +%Y%m%d-%H%M%S)
git add -A && git commit -m "Backup before Phase X"

# 롤백 (필요시)
git reset --hard backup-20250827-XXXXXX
npm install
npm run dev  # 작동 확인
```

## → 시작하기

**Phase 0부터 순차적으로 진행**
```bash
# Phase 0 시작
cat PHASE_0_CRITICAL_FIXES.md
```

---

## 📝 작업 기록

### 2025-08-27
- 마스터 지시서 작성
- Phase 0-3 계획 수립
- 검증 보고서 분석 완료

---

*버전: 1.0.0*
*작성일: 2025-08-27*
*작성자: Claude Code Assistant*
*검증: INSTRUCTION_TEMPLATE.md v17.0 준수*