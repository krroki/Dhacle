/sc:improve --validate --seq --think-hard
  "문서 통합 프로젝트 미완료 작업 완료 및 문서 체계 일관성 확보"

  # 🔧 문서 통합 미완료 작업 완료 지시서

  ## 🚨 프로젝트 특화 규칙 확인 (필수)
  ⚠️ **경고**: 아래 문서 미확인 시 프로젝트 파괴 가능성 90%

  ### 최우선 확인 문서
  - [ ] `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙 (전체 읽기 필수)
  - [ ] `/docs/DOCUMENTATION_CONSOLIDATION_INSTRUCTION.md` - 원래 통합 지시서
  - [ ] `/docs/DOCUMENT_CONSOLIDATION_REPORT.md` - 현재까지 작업 현황
  - [ ] `/CLAUDE.md` - 루트 AI 작업 네비게이터

  ### 프로젝트 금지사항 체크 ✅
  - [ ] 자동 변환 스크립트 생성 금지
  - [ ] 임시방편 코드 작성 금지 (TODO, any 타입, 주석 처리)
  - [ ] 사용자 협의 없는 문서 생성/삭제 금지
  - [ ] 검증 없는 일괄 변경 금지

  ## 📚 온보딩 섹션 (필수)
  ### 필수 읽기 문서
  - [ ] `/docs/CONTEXT_BRIDGE.md` - 전체 내용 필수
  - [ ] `/docs/DOCUMENTATION_CONSOLIDATION_INSTRUCTION.md` - 통합 계획 이해
  - [ ] `/docs/DOCUMENT_CONSOLIDATION_REPORT.md` - 현재 상태 파악
  - [ ] `/docs/CLAUDE.md` - 현재 문서 체계 확인

  ### 프로젝트 컨텍스트
  ```bash
  # 현재 문서 상태 확인
  ls -la docs/*.md | wc -l

  # 백업 존재 확인
  ls -la docs.backup.20250223/

  # archive 폴더 확인
  ls -la docs/archive/

  # 깨진 참조 확인
  grep -r "COMPONENT_INVENTORY\|ROUTE_SPEC" docs/ src/ --include="*.md"

  작업 관련 핵심 정보

  - 현재 상태: 문서 통합 부분 완료
  - 목표 체계: 10개 핵심 문서 + 각 폴더별 CLAUDE.md
  - 제거된 문서: COMPONENT_INVENTORY.md, ROUTE_SPEC.md (archive에 보관)
  - 슬림화된 문서: CODEMAP.md (201줄), CHECKLIST.md (98줄)
  - 새로 생성된 문서: TECH_STACK.md, NPM_SCRIPTS_GUIDE.md, TOOL_DECISION_TREE.md

  📌 목적

  문서 통합 프로젝트의 미완료 작업을 완료하여 문서 체계의 일관성을 확보하고, 프로젝트 workflow를 정상화

  🤖 실행 AI 역할

  1. 깨진 참조 링크를 모두 수정
  2. 컴포넌트 목록을 올바른 위치로 이전
  3. 문서 체계를 일관되게 업데이트
  4. 검증을 통해 완료 확인

  1️⃣ 상황 분석

  현재 문제점

  1. 깨진 참조: 5개 이상 파일에서 COMPONENT_INVENTORY.md와 ROUTE_SPEC.md 참조
  2. 내용 미이전: 컴포넌트 목록이 src/components/CLAUDE.md로 이전 안됨
  3. 문서 불일치: docs/CLAUDE.md는 "14개 핵심 문서", 루트는 "10개 핵심 문서"
  4. 참조 혼란: 제거된 문서를 참조하는 링크 존재

  영향받는 파일 목록

  docs/INSTRUCTION_TEMPLATE.md:822
  docs/TOOL_DECISION_TREE.md:328
  docs/VIBE_CODING_SYSTEMS.md:100-101, 315
  src/app/(pages)/CLAUDE.md:128
  docs/DOCUMENT_GUIDE.md (확인 필요)

  2️⃣ 조사 단계

  조사 1: 깨진 참조 전체 파악

  # 모든 깨진 참조 찾기
  grep -rn "COMPONENT_INVENTORY\|ROUTE_SPEC" docs/ src/ --include="*.md" | grep -v "backup\|archive"

  조사 2: 컴포넌트 목록 내용 확인

  # archive에서 원본 내용 확인
  head -100 docs/archive/COMPONENT_INVENTORY.md.20250223

  조사 3: 현재 문서 체계 확인

  # docs/CLAUDE.md 현재 상태
  grep -n "14개\|10개" docs/CLAUDE.md

  3️⃣ 계획 단계

  Phase 1: 컴포넌트 목록 이전 (30분)

  1. docs/archive/COMPONENT_INVENTORY.md.20250223 내용 분석
  2. 구현된 컴포넌트 목록 섹션 추출
  3. src/components/CLAUDE.md에 "구현된 컴포넌트 목록" 섹션 추가
  4. 중복 제거 및 최신화

  Phase 2: 참조 링크 수정 (30분)

  1. 모든 COMPONENT_INVENTORY 참조를 /src/components/CLAUDE.md로 변경
  2. 모든 ROUTE_SPEC 참조를 적절한 CLAUDE.md로 변경:
    - API 라우트 → /src/app/api/CLAUDE.md
    - 페이지 라우트 → /src/app/(pages)/CLAUDE.md

  Phase 3: 문서 체계 업데이트 (20분)

  1. docs/CLAUDE.md 업데이트:
    - "14개 핵심 문서"를 "10개 핵심 문서 + 폴더별 CLAUDE.md"로 변경
    - 문서 목록 업데이트
    - COMPONENT_INVENTORY.md와 ROUTE_SPEC.md 제거
    - TECH_STACK.md, NPM_SCRIPTS_GUIDE.md, TOOL_DECISION_TREE.md 추가

  4️⃣ 실행 단계

  Step 1: 컴포넌트 목록 이전

  # 1. archive에서 컴포넌트 목록 추출
  cat docs/archive/COMPONENT_INVENTORY.md.20250223 | grep -A 500 "구현된"

  # 2. src/components/CLAUDE.md에 추가
  # Edit 도구로 "## 구현된 컴포넌트 목록" 섹션 추가

  Step 2: 참조 링크 일괄 수정

  # MultiEdit 도구로 한 번에 수정
  # docs/INSTRUCTION_TEMPLATE.md
  # docs/TOOL_DECISION_TREE.md  
  # docs/VIBE_CODING_SYSTEMS.md
  # src/app/(pages)/CLAUDE.md

  Step 3: docs/CLAUDE.md 업데이트

  # MultiEdit 도구로 전체 구조 수정
  # 14개 → 10개 + 폴더별 CLAUDE.md
  # 문서 목록 업데이트

  5️⃣ 검증 단계

  검증 1: 참조 링크 확인

  # 깨진 링크 없는지 확인
  grep -r "COMPONENT_INVENTORY\|ROUTE_SPEC" docs/ src/ --include="*.md" | grep -v "backup\|archive"
  # 결과: 0개여야 함

  검증 2: 문서 일관성 확인

  # 10개 핵심 문서 언급 확인
  grep -r "10개 핵심" docs/CLAUDE.md CLAUDE.md
  # 결과: 일치해야 함

  검증 3: 컴포넌트 목록 확인

  # 컴포넌트 목록이 올바른 위치에 있는지
  grep "구현된 컴포넌트" src/components/CLAUDE.md
  # 결과: 존재해야 함

  6️⃣ 문서화 단계

  최종 보고서 작성

  # 문서 통합 완료 보고서

  ## 수행된 작업
  1. ✅ 컴포넌트 목록을 src/components/CLAUDE.md로 이전
  2. ✅ 모든 깨진 참조 링크 수정
  3. ✅ docs/CLAUDE.md를 10개 핵심 문서 체계로 업데이트
  4. ✅ 전체 문서 체계 일관성 확보

  ## 최종 문서 체계
  - 10개 핵심 문서 (docs/)
  - 8개 폴더별 CLAUDE.md (src/)
  - 기타 지원 문서 (필요시 참조)

  ## 검증 결과
  - 깨진 링크: 0개
  - 문서 일관성: 100%
  - 작업 완료율: 100%

  ✅ 성공 기준

  - 모든 COMPONENT_INVENTORY, ROUTE_SPEC 참조 제거
  - 컴포넌트 목록이 src/components/CLAUDE.md에 존재
  - docs/CLAUDE.md가 10개 핵심 문서 체계 반영
  - 루트 CLAUDE.md와 docs/CLAUDE.md 일치
  - 검증 스크립트 통과

  ⚠️ 주의사항

  1. 백업 유지: docs.backup.20250223 절대 삭제 금지
  2. archive 보존: docs/archive/ 내용 유지
  3. 수동 수정: 자동 스크립트 사용 금지
  4. 검증 우선: 각 단계마다 검증 수행

  🔄 롤백 계획

  문제 발생 시:
  # 백업에서 복원
  cp -r docs.backup.20250223/* docs/
  git checkout -- docs/